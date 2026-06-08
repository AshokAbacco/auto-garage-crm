import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiSave,
  FiInfo,
  FiZap,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Dynamic operational matrix configurations based on decoded workspace tokens
const SEGMENT_SCHEMAS = {
  CAR: ["SEDAN", "SUV", "HATCHBACK", "SUV_COUPE", "MPV", "LUXURY"],
  BIKE: ["COMMUTER", "SPORTS", "CRUISER", "SUPERBIKE"],
  WASHING: ["STANDARD_VEHICLE", "PREMIUM_VEHICLE"],
};

// Clean UI Translation Map for Professional Label Layouts
const VARIANT_LABELS = {
  // Car Categories
  SEDAN: "Sedan",
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  SUV_COUPE: "SUV Coupe",
  MPV: "MPV",
  LUXURY: "Luxury Sedan / Sports Car",

  // Bike Categories
  COMMUTER: "Commuter (Under 150cc)",
  SPORTS: "Sports Bike (150cc - 400cc)",
  CRUISER: "Cruiser / Tourer",
  SUPERBIKE: "Superbike (600cc+)",

  // Washing Categories
  STANDARD_VEHICLE: "Standard Vehicle (Hatch/Sedan)",
  PREMIUM_VEHICLE: "Premium / Large Vehicle (SUV/Luxury)",
};

export default function MarketplacePricing() {
  const { isDark } = useTheme();
  const [hierarchy, setHierarchy] = useState([]);
  const [garageServices, setGarageServices] = useState([]);
  const [localDetails, setLocalDetails] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

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

  // Choose corresponding structural array segments
  const activeSegments = SEGMENT_SCHEMAS[currentCrmType] || SEGMENT_SCHEMAS.CAR;

  useEffect(() => {
    fetchData();
  }, [currentCrmType]); // Re-run fetching if context auto-detection pivots

  const fetchData = async () => {
    try {
      setLoading(true);
      const cfg = {
        headers: { Authorization: `Bearer ${token}` },
        params: { vehicleType: currentCrmType.toLowerCase() },
      };

      const [hRes, gRes] = await Promise.all([
        axios.get(`${API_URL}/api/marketplace/services`, cfg),
        axios.get(`${API_URL}/api/marketplace/garage-services`, cfg),
      ]);
      setHierarchy(hRes.data?.data || []);
      setGarageServices(gRes.data?.data || []);
    } catch (e) {
      console.error("Fetch layout error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getGarageData = (externalId) => {
    const found = garageServices.find(
      (gs) => gs.service?.externalServiceId === externalId,
    );
    return (
      found || {
        isActive: false,
        pricing: [],
        description: null,
        image: null,
        service: { externalServiceId: externalId },
      }
    );
  };

  const handleToggle = (externalId, isActive) => {
    setGarageServices((prev) => {
      const exists = prev.some(
        (gs) => gs.service?.externalServiceId === externalId,
      );
      if (exists) {
        return prev.map((gs) =>
          gs.service?.externalServiceId === externalId
            ? { ...gs, isActive }
            : gs,
        );
      }
      return [
        ...prev,
        { isActive, pricing: [], service: { externalServiceId: externalId } },
      ];
    });
  };

  const handlePriceChange = (externalId, vehicleVariant, field, value) => {
    setGarageServices((prev) => {
      const gsIndex = prev.findIndex(
        (gs) => gs.service?.externalServiceId === externalId,
      );
      if (gsIndex > -1) {
        const newGS = [...prev];
        const target = { ...newGS[gsIndex] };
        const pricing = [...(target.pricing || [])];
        const pIndex = pricing.findIndex((p) => p.carType === vehicleVariant);

        if (pIndex > -1) {
          pricing[pIndex] = { ...pricing[pIndex], [field]: value };
        } else {
          pricing.push({
            carType: vehicleVariant, // Maps smoothly into database 'car_type' column string space
            [field]: value,
            price: field === "price" ? value : 0,
            discount: field === "discount" ? value : 0,
          });
        }
        target.pricing = pricing;
        newGS[gsIndex] = target;
        return newGS;
      } else {
        return [
          ...prev,
          {
            isActive: false,
            service: { externalServiceId: externalId },
            pricing: [
              {
                carType: vehicleVariant,
                [field]: value,
                price: field === "price" ? value : 0,
                discount: field === "discount" ? value : 0,
              },
            ],
          },
        ];
      }
    });
  };

  const savePricing = async (externalId) => {
    const data = getGarageData(externalId);
    setActionLoading((prev) => ({ ...prev, [externalId]: true }));
    try {
      await axios.post(
        `${API_URL}/api/marketplace/garage-services`,
        {
          serviceId: data.service?.externalServiceId || externalId,
          isActive: data.isActive,
          pricing: data.pricing.map((p) => ({
            carType: p.carType,
            price: parseFloat(p.price) || 0,
            discount: parseFloat(p.discount) || 0,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Pricing configurations synced cleanly!");
      fetchData();
    } catch (e) {
      alert("Sync execution rejected.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [externalId]: false }));
    }
  };

  const saveDetails = async (externalId, fallbackDesc) => {
    const data = getGarageData(externalId);
    const detail = localDetails[externalId];
    setActionLoading((prev) => ({ ...prev, [externalId]: true }));
    const fd = new FormData();
    fd.append("description", detail?.description || fallbackDesc || "");
    if (detail?.imageFile) fd.append("image", detail.imageFile);
    fd.append("isActive", data.isActive);
    fd.append("pricing", JSON.stringify(data.pricing));

    try {
      await axios.patch(
        `${API_URL}/api/marketplace/services/${data.service?.externalServiceId || externalId}/details`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      alert("Metadata records synchronized!");
      fetchData();
    } catch (e) {
      alert("Failed updating metadata snapshots.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [externalId]: false }));
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 md:ml-20 pb-20 font-sans tracking-tight ${
        isDark ? "bg-[#090b11] text-slate-200" : "bg-[#f6f8fa] text-slate-900"
      }`}
    >
      {/* GLASSMORPHIC HEADER */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-8 py-5 transition-all ${
          isDark
            ? "bg-[#090b11]/70 border-white/[0.04]"
            : "bg-white/70 border-slate-200/60"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl text-white shadow-blue-500/10">
              <FiZap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight leading-none">
                  Service Catalog
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
                Configure live operational rates and workspace metadata.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-50">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Resolving Workspace...
            </span>
          </div>
        ) : hierarchy.length === 0 ? (
          <div className="text-center py-32 opacity-40 text-sm">
            No items configured in this category channel.
          </div>
        ) : (
          hierarchy.map((main) => (
            <div key={main.id} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500/90 whitespace-nowrap">
                  {main.name}
                </h2>
                <div
                  className={`h-[1px] flex-1 ${isDark ? "bg-white/[0.05]" : "bg-slate-200"}`}
                />
              </div>

              {main.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-xs font-semibold opacity-30 uppercase tracking-wider mb-4 px-1">
                    {section.name}
                  </h3>

                  <div className="grid gap-4">
                    {section.services.map((svc) => {
                      const gData = getGarageData(svc.id);
                      const isExpanded = expanded[svc.id];
                      const detail = localDetails[svc.id] || {};
                      const previewImg =
                        detail.imagePreview || gData.image || svc.image;
                      const isProcessing = actionLoading[svc.id];

                      return (
                        <div
                          key={svc.id}
                          className={`rounded-2xl border transition-all duration-300 ${
                            isDark
                              ? "bg-[#11141d]/40 border-white/[0.04] hover:bg-[#11141b]/80"
                              : "bg-white border-slate-200/50 hover:shadow-md hover:shadow-slate-200/30"
                          }`}
                        >
                          {/* CONTROL ROW */}
                          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <button
                                onClick={() =>
                                  handleToggle(svc.id, !gData.isActive)
                                }
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0 outline-none ${
                                  gData.isActive
                                    ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                                    : isDark
                                      ? "bg-slate-800"
                                      : "bg-slate-200"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-out ${
                                    gData.isActive ? "left-5" : "left-0.5"
                                  }`}
                                />
                              </button>
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${gData.isActive ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-slate-400"}`}
                                  />
                                  <span className="text-[9px] font-semibold uppercase tracking-wider opacity-40">
                                    {gData.isActive ? "Active" : "Disabled"}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold tracking-tight">
                                  {svc.name}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-white/[0.05] sm:pl-6">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-semibold uppercase tracking-wider opacity-30">
                                  Configured Rate
                                </span>
                                <p className="text-base font-bold text-blue-500">
                                  {gData.pricing?.length > 0
                                    ? `₹${gData.pricing[0].price}`
                                    : "—"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setExpanded((p) => ({
                                    ...p,
                                    [svc.id]: !p[svc.id],
                                  }))
                                }
                                className={`p-2 rounded-xl transition-colors ${
                                  isDark
                                    ? "bg-white/[0.04] hover:bg-white/[0.08]"
                                    : "bg-slate-100 hover:bg-slate-200"
                                }`}
                              >
                                {isExpanded ? (
                                  <FiChevronUp size={16} />
                                ) : (
                                  <FiChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* INNER CONFIGURATION PANEL */}
                          {isExpanded && (
                            <div
                              className={`p-6 md:p-8 border-t ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* INTERACTIVE PRICING ROW SEGMENTS */}
                                <div className="space-y-6">
                                  <div className="flex items-center gap-2 opacity-60">
                                    <FiPackage
                                      size={14}
                                      className="text-blue-500"
                                    />
                                    <h5 className="text-xs font-semibold uppercase tracking-wider">
                                      Pricing Intervals
                                    </h5>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4 px-1 opacity-40 text-[10px] font-medium uppercase tracking-wider">
                                      <span>Variant Group</span>
                                      <span>Base Price (₹)</span>
                                      <span>Active Discount</span>
                                    </div>

                                    {activeSegments.map((ct) => {
                                      const pRow = gData.pricing?.find(
                                        (p) => p.carType === ct,
                                      ) || { price: "", discount: "" };
                                      return (
                                        <div
                                          key={ct}
                                          className="grid grid-cols-3 gap-4 items-center"
                                        >
                                          {/* Transformed polymorphically via clean translation label dictionary */}
                                          <span className="text-xs font-medium opacity-70 truncate">
                                            {VARIANT_LABELS[ct] ||
                                              ct.replace(/_/g, " ")}
                                          </span>
                                          <input
                                            type="number"
                                            value={pRow.price}
                                            placeholder="0.00"
                                            onChange={(e) =>
                                              handlePriceChange(
                                                svc.id,
                                                ct,
                                                "price",
                                                e.target.value,
                                              )
                                            }
                                            className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-all font-medium ${
                                              isDark
                                                ? "bg-white/[0.02] border border-white/[0.05] focus:border-blue-500/50"
                                                : "bg-slate-50 border border-slate-200/60 focus:border-blue-500"
                                            }`}
                                          />
                                          <input
                                            type="number"
                                            value={pRow.discount}
                                            placeholder="0"
                                            onChange={(e) =>
                                              handlePriceChange(
                                                svc.id,
                                                ct,
                                                "discount",
                                                e.target.value,
                                              )
                                            }
                                            className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-all font-medium ${
                                              isDark
                                                ? "bg-white/[0.02] border border-white/[0.05] focus:border-emerald-500/50"
                                                : "bg-slate-50 border border-slate-200/60 focus:border-emerald-500"
                                            }`}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <button
                                    disabled={isProcessing}
                                    onClick={() => savePricing(svc.id)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/10"
                                  >
                                    <FiSave size={14} />
                                    {isProcessing
                                      ? "Syncing Workspace..."
                                      : "Save Pricing Layout"}
                                  </button>
                                </div>

                                {/* MARKETING METADATA OVERRIDES */}
                                <div className="space-y-6 lg:border-l lg:border-white/[0.04] lg:pl-12">
                                  <div className="flex items-center gap-2 opacity-60">
                                    <FiInfo
                                      size={14}
                                      className="text-blue-500"
                                    />
                                    <h5 className="text-xs font-semibold uppercase tracking-wider">
                                      Consumer App Metadata
                                    </h5>
                                  </div>

                                  <div className="space-y-5">
                                    <div>
                                      <label className="text-[10px] font-semibold uppercase tracking-wider opacity-40 block mb-2">
                                        Catalog Description Override
                                      </label>
                                      <textarea
                                        rows={4}
                                        className={`w-full p-4 rounded-xl text-xs font-normal outline-none transition-all resize-none leading-relaxed ${
                                          isDark
                                            ? "bg-white/[0.02] border border-white/[0.05] focus:border-blue-500/50 text-slate-300"
                                            : "bg-slate-50 border border-slate-200/60 focus:border-blue-500"
                                        }`}
                                        value={
                                          detail.description ??
                                          gData.description ??
                                          svc.description ??
                                          ""
                                        }
                                        onChange={(e) =>
                                          setLocalDetails((p) => ({
                                            ...p,
                                            [svc.id]: {
                                              ...p[svc.id],
                                              description: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>

                                    <div
                                      className={`p-4 rounded-xl border flex items-center gap-4 ${
                                        isDark
                                          ? "bg-white/[0.01] border-white/[0.04]"
                                          : "bg-slate-50 border-slate-100"
                                      }`}
                                    >
                                      <div className="relative shrink-0">
                                        {previewImg ? (
                                          <img
                                            src={previewImg}
                                            className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]"
                                            alt="Preview"
                                          />
                                        ) : (
                                          <div className="w-14 h-14 rounded-lg bg-slate-500/10 border border-dashed border-slate-500/30 flex items-center justify-center text-[10px] font-medium opacity-30">
                                            Empty
                                          </div>
                                        )}
                                        <input
                                          type="file"
                                          id={`img-${svc.id}`}
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file)
                                              setLocalDetails((p) => ({
                                                ...p,
                                                [svc.id]: {
                                                  ...p[svc.id],
                                                  imageFile: file,
                                                  imagePreview:
                                                    URL.createObjectURL(file),
                                                },
                                              }));
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium">
                                          Catalog Visual Asset
                                        </h6>
                                        <label
                                          htmlFor={`img-${svc.id}`}
                                          className="text-xs font-medium text-blue-500 cursor-pointer hover:text-blue-600 transition-colors inline-block mt-0.5"
                                        >
                                          Upload Custom Image
                                        </label>
                                      </div>
                                    </div>

                                    <button
                                      disabled={isProcessing}
                                      onClick={() =>
                                        saveDetails(
                                          svc.id,
                                          gData.description ||
                                            svc.description ||
                                            svc.name,
                                        )
                                      }
                                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                                        isDark
                                          ? "bg-white/[0.04] hover:bg-white/[0.08] text-white"
                                          : "bg-slate-900 hover:bg-black text-white"
                                      }`}
                                    >
                                      <FiImage size={14} />
                                      {isProcessing
                                        ? "Processing Changes..."
                                        : "Commit Media Overrides"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
