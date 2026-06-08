import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiPower,
  FiSearch,
  FiZap,
  FiShoppingBag,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

  // 1. Extract and decode operational workspace from active token payload
  const token = localStorage.getItem("token");
  let currentCrmType = "CAR"; // Initial default structural fallback

  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      if (payload?.crmType) {
        currentCrmType = payload.crmType.toUpperCase();
      }
    } catch (e) {
      console.error("Token decoding failed:", e);
    }
  }

  // 🔍 2. BULLETPROOF WORKSPACE AUTO-DETECT
  const browserURLPath = window.location.pathname.toLowerCase();
  const storageCrmType = localStorage.getItem("crmType")?.toUpperCase();

  if (
    storageCrmType === "CAR" ||
    storageCrmType === "BIKE" ||
    storageCrmType === "WASHING"
  ) {
    currentCrmType = storageCrmType;
  } else if (
    browserURLPath.includes("/bike") ||
    window.location.hostname.includes("bike")
  ) {
    currentCrmType = "BIKE";
  } else if (
    browserURLPath.includes("/wash") ||
    window.location.hostname.includes("wash")
  ) {
    currentCrmType = "WASHING";
  } else if (
    browserURLPath.includes("/car") ||
    window.location.hostname.includes("car")
  ) {
    currentCrmType = "CAR";
  }

  useEffect(() => {
    fetchAll();
  }, [currentCrmType]); // Re-fetch bundle elements cleanly when workspace channel switches

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Explicitly append target vehicleType query string parameters to completely dump stale route cache mappings
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { vehicleType: currentCrmType.toLowerCase() },
      };

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
      console.error("Packages sync loop failure:", err);
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
      const config = { headers: { Authorization: `Bearer ${token}` } };

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
      console.error("Bundle compilation rejected:", err);
    }
  };

  const deletePackage = async (id) => {
    if (
      window.confirm("Are you sure you want to remove this package bundle?")
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/api/marketplace/packages/${id}`, config);
        fetchAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const togglePackageStatus = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
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
      className={`min-h-screen pb-24 transition-colors duration-500 font-sans tracking-tight ${
        isDark ? "bg-[#090b11] text-slate-200" : "bg-[#f6f8fa] text-slate-900"
      } md:ml-20`}
    >
      {/* GLASSMORPHIC HEADER */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b px-8 py-5 transition-all ${
          isDark
            ? "bg-[#090b11]/70 border-white/[0.04]"
            : "bg-white/70 border-slate-200/60"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl text-white shadow-blue-500/10">
              <FiPackage size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight leading-none">
                  Package Studio
                </h1>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentCrmType === "BIKE"
                      ? "bg-amber-500/10 text-amber-400"
                      : currentCrmType === "WASHING"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {currentCrmType} Mode
                </span>
              </div>
              <p className="text-xs opacity-40 mt-1">
                Bundle services into curated cost-saving consumer marketplace
                packages.
              </p>
            </div>
          </div>

          <div
            className={`flex w-full md:w-auto p-1 rounded-xl border ${
              isDark
                ? "bg-white/[0.02] border-white/[0.05]"
                : "bg-slate-200/60 border-slate-200/50"
            }`}
          >
            {[
              {
                id: "list",
                label: "Collection",
                icon: <FiShoppingBag size={13} />,
              },
              { id: "create", label: "Architect", icon: <FiPlus size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-[10px] font-semibold uppercase rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/10"
                    : "text-slate-400 hover:text-slate-500"
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl mx-auto">
            <div
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                isDark
                  ? "bg-[#11141d]/40 border-white/[0.04]"
                  : "bg-white border-slate-200/50 shadow-sm shadow-slate-200/20"
              }`}
            >
              <div className="p-6 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-blue-500 tracking-wider block mb-1">
                        Package Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Premium Monsoon Treatment Bundle"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full text-base font-medium bg-transparent border-b py-2 outline-none transition-all ${
                          isDark
                            ? "border-white/[0.08] focus:border-blue-500 text-slate-200"
                            : "border-slate-200 focus:border-blue-600 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block mb-1">
                        Marketing Summary Description
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Describe consumer bundle benefits clearly..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full bg-transparent border-b py-2 text-xs font-normal outline-none transition-all resize-none ${
                          isDark
                            ? "border-white/[0.08] focus:border-blue-500 text-slate-300"
                            : "border-slate-200 focus:border-blue-600 text-slate-800"
                        }`}
                      />
                    </div>
                  </div>
                  <div
                    className={`p-5 rounded-xl border flex flex-col justify-center items-center ${
                      isDark
                        ? "bg-white/[0.01] border-white/[0.04]"
                        : "bg-slate-50 border-slate-200/40"
                    }`}
                  >
                    <label className="text-[10px] font-semibold uppercase text-blue-500 mb-1">
                      Bundled Flat Price
                    </label>
                    <div className="flex items-center gap-1 text-blue-500">
                      <span className="text-lg font-semibold opacity-60">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-transparent w-full text-2xl font-bold outline-none tracking-tight"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/[0.04]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 opacity-70">
                      <FiZap className="text-amber-500" /> Select Channels
                      Components ({selectedServices.length})
                    </h3>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        isDark
                          ? "bg-white/[0.02] border-white/[0.05]"
                          : "bg-slate-50 border-slate-200/60"
                      }`}
                    >
                      <FiSearch size={13} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search workspace..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-xs font-normal outline-none w-full sm:w-36"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto p-1 custom-scrollbar">
                    {flatServices
                      .filter((s) =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((s) => (
                        <button
                          key={s.externalServiceId}
                          onClick={() => toggleService(s.externalServiceId)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-200 outline-none ${
                            selectedServices.includes(s.externalServiceId)
                              ? "bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/10"
                              : isDark
                                ? "bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.04]"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <p className="text-xs font-medium truncate leading-tight">
                            {s.name}
                          </p>
                          <p
                            className={`text-[9px] mt-1 font-semibold uppercase tracking-wider opacity-40`}
                          >
                            {s.section}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>

                <button
                  onClick={createPackage}
                  className="w-full bg-blue-500 py-3.5 rounded-xl font-semibold text-white uppercase tracking-wide shadow-lg shadow-blue-500/10 hover:bg-blue-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <FiPackage size={14} /> Commit & Launch Bundle
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-400">
            {packages.length === 0 && !loading && (
              <div className="col-span-full py-28 text-center opacity-30 flex flex-col items-center justify-center gap-2">
                <FiPackage size={36} className="text-slate-400" />
                <p className="text-xs font-semibold uppercase tracking-wider">
                  No Active Studio Bundles Configured
                </p>
              </div>
            )}

            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isDark
                    ? "bg-[#11141d]/40 border-white/[0.04]"
                    : "bg-white border-slate-200/50 shadow-sm"
                }`}
              >
                <div className="p-6 md:p-8 flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pkg.isActive ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-slate-400"}`}
                        />
                        <span className="text-[9px] font-semibold tracking-wider uppercase opacity-40">
                          {pkg.isActive ? "Live in App" : "Inactive"}
                        </span>
                      </div>
                      <h2 className="text-base font-bold tracking-tight break-words max-w-[250px] md:max-w-full">
                        {pkg.name}
                      </h2>
                    </div>

                    <div
                      className={`px-3.5 py-1.5 rounded-xl border flex items-baseline gap-0.5 shrink-0 font-semibold ${
                        isDark
                          ? "bg-white/[0.02] border-white/[0.08] text-blue-400"
                          : "bg-blue-50 border-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="text-xs opacity-60">₹</span>
                      <span className="text-xl font-bold tracking-tight">
                        {pkg.price}
                      </span>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-xs opacity-50 -mt-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}

                  {/* Service Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.items?.map((item) => (
                      <span
                        key={item.id}
                        className={`text-[9px] font-semibold uppercase px-2.5 py-1 rounded-lg border ${
                          isDark
                            ? "bg-black/20 border-white/[0.04] text-slate-400"
                            : "bg-slate-50 border-slate-100 text-slate-500"
                        }`}
                      >
                        {item.serviceName}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center justify-between border-t pt-4 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}
                  >
                    <button
                      onClick={() => togglePackageStatus(pkg.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors outline-none ${
                        pkg.isActive
                          ? "text-slate-400 hover:text-orange-400"
                          : "text-blue-500 hover:text-blue-600"
                      }`}
                    >
                      <FiPower size={13} />{" "}
                      {pkg.isActive ? "Pause Bundle" : "Activate"}
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="p-2 rounded-xl bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all outline-none"
                    >
                      <FiTrash2 size={14} />
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
