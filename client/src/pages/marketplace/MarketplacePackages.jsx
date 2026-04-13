import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function MarketplacePackages() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("list");
  const [flatServices, setFlatServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [serviceRes, packageRes] = await Promise.all([
        axios.get(`${API_URL}/api/marketplace/services`, config),
        axios.get(`${API_URL}/api/marketplace/packages`, config),
      ]);

      const flattened = [];
      serviceRes.data?.data?.forEach((main) => {
        main.sections.forEach((section) => {
          section.services.forEach((svc) => {
            flattened.push({
              ...svc,
              category: main.name,
              section: section.name,
            });
          });
        });
      });

      setFlatServices(flattened);
      setPackages(packageRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const createPackage = async () => {
    if (!name || !price || selectedServices.length === 0)
      return alert("Please complete all fields");
    try {
      await axios.post(
        `${API_URL}/api/marketplace/packages`,
        {
          name,
          price: Number(price),
          serviceIds: selectedServices,
        },
        config,
      );
      setName("");
      setPrice("");
      setSelectedServices([]);
      setActiveTab("list");
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePackage = async (id) => {
    if (
      window.confirm("Are you sure you want to remove this package bundle?")
    ) {
      try {
        await axios.delete(`${API_URL}/api/marketplace/packages/${id}`, config);
        fetchAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const togglePackageStatus = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/marketplace/packages/${id}/toggle`,
        {},
        config,
      );
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`min-h-screen pb-20 md:ml-16 transition-all ${
        isDark ? "bg-[#0b0e11] text-slate-300" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* HEADER SECTION */}
      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-md p-6 flex justify-between items-center ${
          isDark
            ? "bg-[#0b0e11]/80 border-slate-800"
            : "bg-white/80 border-slate-100"
        }`}
      >
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">
            Bundle Studio
          </h1>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            Cross-Platform Bundles
          </p>
        </div>
        <div
          className={`flex p-1 rounded-2xl ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
        >
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-500"
            }`}
          >
            All Packages
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-500"
            }`}
          >
            + New Package
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === "create" ? (
          <div
            className={`p-8 rounded-[2.5rem] border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              isDark
                ? "bg-[#161b22] border-slate-800"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Package Identity
                </label>
                <input
                  type="text"
                  placeholder="Package Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-700/30 py-2 font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Total Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-700/30 py-2 font-black outline-none focus:border-blue-500 text-blue-500 text-xl"
                />
              </div>
            </div>

            <div className="mb-6 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500">
                Inventory Items ({flatServices.length})
              </span>
              <input
                type="text"
                placeholder="Filter inventory..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`p-2 rounded-lg text-[10px] border outline-none ${
                  isDark
                    ? "bg-slate-900 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {flatServices
                .filter((s) =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`p-4 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                      selectedServices.includes(s.id)
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : isDark
                          ? "border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-600"
                          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                    }`}
                  >
                    {s.name} <br />
                    <span className="text-[8px] opacity-50">{s.section}</span>
                  </button>
                ))}
            </div>

            <button
              onClick={createPackage}
              className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              Publish Bundle
            </button>
          </div>
        ) : (
          /* LIST CONTENT */
          <div className="grid gap-6">
            {packages.length === 0 && !loading && (
              <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest">
                No active bundles
              </div>
            )}
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group p-8 rounded-[2.5rem] border transition-all ${
                  isDark
                    ? "bg-[#161b22] border-slate-800"
                    : "bg-white border-slate-100 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                      {pkg.name}
                    </h2>
                    <p
                      className={`text-[9px] font-black mt-2 tracking-widest ${
                        pkg.isActive ? "text-emerald-500" : "text-slate-500"
                      }`}
                    >
                      {pkg.isActive
                        ? "● LIVE IN MARKETPLACE"
                        : "○ PAUSED / HIDDEN"}
                    </p>
                  </div>
                  <div
                    className={`px-6 py-3 rounded-2xl text-2xl font-black ${
                      isDark
                        ? "bg-[#0d1117] text-blue-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    ₹{pkg.price}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 border-t border-slate-500/10 pt-6">
                  {pkg.items?.map((item) => (
                    <span
                      key={item.id}
                      className={`text-[9px] font-bold px-3 py-1.5 border rounded-lg ${
                        isDark
                          ? "bg-[#0d1117] border-slate-800 text-slate-500"
                          : "bg-gray-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      {item.serviceName}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-500/10 pt-6">
                  <button
                    onClick={() => togglePackageStatus(pkg.id)}
                    className={`text-[10px] font-black uppercase transition-colors ${
                      pkg.isActive
                        ? "text-slate-500 hover:text-orange-500"
                        : "text-blue-500 hover:text-blue-600"
                    }`}
                  >
                    {pkg.isActive ? "Pause Listing" : "Resume Listing"}
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2"
                  >
                    <span>Remove Bundle</span>
                    <span className="text-sm">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
