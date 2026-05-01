import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiPower,
  FiSearch,
  FiCheckCircle,
  FiZap,
  FiShoppingBag,
} from "react-icons/fi";

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
  const [description, setDescription] = useState("");

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
              externalServiceId: svc.id,
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
      const servicePayload = selectedServices.map((id) => {
        const svc = flatServices.find((s) => s.externalServiceId === id);
        return { id, name: svc?.name };
      });

      await axios.post(
        `${API_URL}/api/marketplace/packages`,
        {
          name,
          price: Number(price),
          description,
          serviceIds: servicePayload,
        },
        config,
      );

      setName("");
      setPrice("");
      setDescription("");
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
      className={`min-h-screen pb-24 transition-all duration-300 ${
        isDark ? "bg-[#080a0f] text-slate-300" : "bg-[#f1f5f9] text-slate-900"
      } md:ml-20`}
    >
      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 py-4 transition-all ${
          isDark
            ? "bg-[#080a0f]/80 border-white/5"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg text-white">
              <FiPackage size={18} />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-black uppercase tracking-tighter italic">
                Studio
              </h1>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500">
                Inventory Engine
              </span>
            </div>
          </div>

          <div
            className={`flex w-full md:w-auto p-1 rounded-xl border ${isDark ? "bg-black/40 border-white/10" : "bg-slate-200/50 border-slate-200"}`}
          >
            {[
              { id: "list", label: "Collection", icon: <FiShoppingBag /> },
              { id: "create", label: "Architect", icon: <FiPlus /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 text-[9px] font-black uppercase rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {activeTab === "create" ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto">
            <div
              className={`rounded-[2rem] md:rounded-[3rem] border overflow-hidden transition-all shadow-xl ${
                isDark
                  ? "bg-[#11141b] border-white/5"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-6 md:p-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <label className="text-[9px] font-black uppercase text-blue-500 tracking-widest block mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        placeholder="Package Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full text-lg font-bold bg-transparent border-b py-2 outline-none transition-all ${
                          isDark
                            ? "border-white/10 focus:border-blue-500"
                            : "border-slate-200 focus:border-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-1">
                        Description
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Bundle details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full bg-transparent border-b py-2 text-sm font-medium outline-none transition-all resize-none ${
                          isDark
                            ? "border-white/10 focus:border-blue-500"
                            : "border-slate-200 focus:border-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-center items-center ${
                      isDark
                        ? "bg-black/20 border-white/5"
                        : "bg-blue-50 border-blue-100"
                    }`}
                  >
                    <label className="text-[9px] font-black uppercase text-blue-500 mb-1">
                      Price
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black italic opacity-50">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-transparent w-full text-3xl font-black italic outline-none tracking-tighter"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <FiZap className="text-amber-500" /> Inventory (
                      {selectedServices.length})
                    </h3>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        isDark
                          ? "bg-black/20 border-white/10"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <FiSearch size={12} className="text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-[10px] font-bold outline-none w-full sm:w-32"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                    {flatServices
                      .filter((s) =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((s) => (
                        <button
                          key={s.externalServiceId}
                          onClick={() => toggleService(s.externalServiceId)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedServices.includes(s.externalServiceId)
                              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                              : isDark
                                ? "bg-[#161b22] border-white/5 text-slate-500"
                                : "bg-white border-slate-200 text-slate-600 shadow-sm"
                          }`}
                        >
                          <p className="text-[9px] font-black uppercase leading-tight truncate">
                            {s.name}
                          </p>
                          <p
                            className={`text-[7px] mt-0.5 font-bold opacity-60 uppercase`}
                          >
                            {s.section}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>

                <button
                  onClick={createPackage}
                  className="w-full bg-blue-600 py-4 md:py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:bg-blue-500 active:scale-[0.97] transition-all flex items-center justify-center gap-3 text-[11px]"
                >
                  <FiPackage /> Publish Bundle
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {packages.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center opacity-20">
                <FiPackage size={48} className="mx-auto mb-2" />
                <p className="text-sm font-black uppercase italic tracking-widest">
                  No Active Bundles
                </p>
              </div>
            )}

            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                  isDark
                    ? "bg-[#11141b] border-white/5"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  {/* Top Bar: Status and Price - REFACTORED FOR RESPONSIVENESS */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pkg.isActive ? "bg-emerald-500" : "bg-slate-500"}`}
                        />
                        <span className="text-[8px] font-black tracking-widest uppercase opacity-50">
                          {pkg.isActive ? "Operational" : "Offline"}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight break-words max-w-[250px] md:max-w-full">
                        {pkg.name}
                      </h2>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-xl border flex items-baseline gap-1 shrink-0 ${
                        isDark
                          ? "bg-white/5 border-white/10 text-blue-400"
                          : "bg-blue-50 border-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="text-[10px] font-black italic opacity-60">
                        ₹
                      </span>
                      <span className="text-2xl font-black italic tracking-tighter">
                        {pkg.price}
                      </span>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-[11px] font-medium opacity-50 -mt-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}

                  {/* Service Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.items?.map((item) => (
                      <span
                        key={item.id}
                        className={`text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg border ${
                          isDark
                            ? "bg-black/20 border-white/5 text-slate-500"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        {item.serviceName}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center justify-between border-t pt-5 ${isDark ? "border-white/5" : "border-slate-100"}`}
                  >
                    <button
                      onClick={() => togglePackageStatus(pkg.id)}
                      className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        pkg.isActive
                          ? "text-slate-500 hover:text-orange-500"
                          : "text-blue-500"
                      }`}
                    >
                      <FiPower /> {pkg.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
