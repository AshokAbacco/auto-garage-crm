import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
const API_URL = import.meta.env.VITE_API_BASE_URL;
export default function MarketplacePackages() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("list");
  const [services, setServices] = useState([]);
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
        axios.get(
          `${API_URL}/api/marketplace/services?type=CAR`,
          config,
        ),
        axios.get(`${API_URL}/api/marketplace/packages`, config),
      ]);
      setServices(serviceRes.data?.data || []);
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
      return alert("Fill all fields");
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
    if (confirm("Delete this package?")) {
      await axios.delete(
        `${API_URL}/api/marketplace/packages/${id}`,
        config,
      );
      fetchAll();
    }
  };

  const togglePackage = async (id) => {
    await axios.patch(
      `${API_URL}/api/marketplace/packages/${id}/toggle`,
      {},
      config,
    );
    fetchAll();
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 md:ml-16 pb-20 ${isDark ? "bg-[#0b0e11] text-slate-300" : "bg-[#f8fafc] text-slate-900"}`}
    >
      {/* HEADER & TABS */}
      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${isDark ? "bg-[#0b0e11]/80 border-slate-800" : "bg-white/80 border-slate-100"}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">
              Bundle Studio
            </h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              Marketplace Inventory
            </p>
          </div>

          <div
            className={`flex p-1 rounded-2xl ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
          >
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === "list" ? (isDark ? "bg-blue-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm") : "text-slate-500"}`}
            >
              All Packages
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === "create" ? (isDark ? "bg-blue-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm") : "text-slate-500"}`}
            >
              + New Package
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === "create" ? (
          <section
            className={`border rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? "bg-[#161b22] border-slate-800" : "bg-white border-slate-100"}`}
          >
            <div className="p-8 md:p-12">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 text-blue-600 border-b pb-4 border-blue-500/10">
                Package Configuration
              </h2>

              <div className="space-y-12">
                {/* NAME AND PRICE - SIDE BY SIDE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="group relative">
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest italic tracking-tighter">
                      Package Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Diamond Detailing"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-slate-700/30 py-3 text-lg font-bold outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="group relative">
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest italic tracking-tighter">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="2999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-slate-700/30 py-3 text-2xl font-black outline-none focus:border-blue-500 transition-all text-blue-500"
                    />
                  </div>
                </div>

                {/* ADD INVENTORY - FULL WIDTH BELOW */}
                <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">
                        Inventory Selection
                      </label>
                      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-blue-600 text-white">
                        {selectedServices.length} ITEMS SELECTED
                      </span>
                    </div>
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full p-2.5 pl-8 text-[11px] font-bold rounded-xl border outline-none ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-[10px]">
                        🔍
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {filteredServices.map((s) => {
                      const active = selectedServices.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleService(s.id)}
                          className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all duration-200 shadow-sm ${
                            active
                              ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                              : isDark
                                ? "bg-[#0d1117] border-slate-800 text-slate-500 hover:border-slate-600"
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-200"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={createPackage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all"
                >
                  Publish Package Bundle
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* LIST CONTENT */
          <div className="space-y-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group border rounded-[2rem] p-8 transition-all ${isDark ? "bg-[#161b22] border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                      {pkg.name}
                    </h3>
                    <p
                      className={`text-[9px] font-black mt-2 tracking-widest ${pkg.isActive ? "text-emerald-500" : "text-slate-500"}`}
                    >
                      {pkg.isActive ? "● LIVE" : "○ PAUSED"}
                    </p>
                  </div>
                  <div
                    className={`px-6 py-4 rounded-2xl text-2xl font-black ${isDark ? "bg-[#0d1117] text-blue-500" : "bg-blue-50 text-blue-600"}`}
                  >
                    ₹{pkg.price}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-8 border-t border-slate-500/10 pt-6">
                  {pkg.items?.map((item) => (
                    <span
                      key={item.id}
                      className={`text-[10px] font-bold px-3 py-1.5 border rounded-lg ${isDark ? "bg-[#0d1117] border-slate-800 text-slate-500" : "bg-gray-50 border-slate-200 text-slate-400"}`}
                    >
                      {item.service?.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-500/10 pt-6">
                  <button
                    onClick={() => togglePackage(pkg.id)}
                    className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    {pkg.isActive ? "Pause Listing" : "Resume Listing"}
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    🗑️ Remove
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
