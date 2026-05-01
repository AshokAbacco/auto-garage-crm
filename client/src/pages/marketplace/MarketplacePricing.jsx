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
const CAR_TYPES = ["SEDAN", "SUV", "HATCHBACK", "SUV_COUPE", "MPV", "LUXURY"];

export default function MarketplacePricing() {
  const { isDark } = useTheme();
  const [hierarchy, setHierarchy] = useState([]);
  const [garageServices, setGarageServices] = useState([]);
  const [localDetails, setLocalDetails] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const [hRes, gRes] = await Promise.all([
        axios.get(`${API_URL}/api/marketplace/services`, cfg),
        axios.get(`${API_URL}/api/marketplace/garage-services`, cfg),
      ]);
      setHierarchy(hRes.data?.data || []);
      setGarageServices(gRes.data?.data || []);
    } catch (e) {
      console.error(e);
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

  const handlePriceChange = (externalId, carType, field, value) => {
    setGarageServices((prev) => {
      const gsIndex = prev.findIndex(
        (gs) => gs.service?.externalServiceId === externalId,
      );
      if (gsIndex > -1) {
        const newGS = [...prev];
        const target = { ...newGS[gsIndex] };
        const pricing = [...(target.pricing || [])];
        const pIndex = pricing.findIndex((p) => p.carType === carType);

        if (pIndex > -1) {
          pricing[pIndex] = { ...pricing[pIndex], [field]: value };
        } else {
          pricing.push({
            carType,
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
                carType,
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
          serviceId: data.service?.id || externalId,
          isActive: data.isActive,
          pricing: data.pricing.map((p) => ({
            carType: p.carType,
            price: parseFloat(p.price) || 0,
            discount: parseFloat(p.discount) || 0,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Pricing saved!");
      fetchData();
    } catch (e) {
      alert("Save failed.");
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
        `${API_URL}/api/marketplace/services/${data.service?.id || externalId}/details`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      alert("Metadata updated!");
      fetchData();
    } catch (e) {
      alert("Error saving metadata.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [externalId]: false }));
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 md:ml-20 pb-20 ${
        isDark ? "bg-[#080a0f] text-slate-200" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-5 transition-all ${
          isDark
            ? "bg-[#080a0f]/80 border-white/5"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg text-white">
              <FiZap size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                Catalog
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                Inventory Management
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {hierarchy.map((main) => (
          <div key={main.id} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 whitespace-nowrap">
                {main.name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            </div>

            {main.sections.map((section) => (
              <div key={section.id} className="mb-10">
                <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest mb-4 px-2">
                  {section.name}
                </h3>

                <div className="grid gap-3">
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
                        className={`group rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 ${
                          isDark
                            ? "bg-[#11141b] border-white/5"
                            : "bg-white border-slate-200 shadow-sm"
                        }`}
                      >
                        {/* CARD HEADER */}
                        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                              onClick={() =>
                                handleToggle(svc.id, !gData.isActive)
                              }
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                                gData.isActive
                                  ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                  : "bg-slate-700/50"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                                  gData.isActive ? "left-7" : "left-1"
                                }`}
                              />
                            </button>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${gData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                  {gData.isActive ? "Operational" : "Offline"}
                                </span>
                              </div>
                              <h4 className="text-sm md:text-base font-black uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors">
                                {svc.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-white/5 sm:pl-6">
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                                Base Price
                              </span>
                              <p className="text-xl font-black italic tracking-tighter text-blue-500">
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
                              className={`p-3 rounded-xl transition-all ${
                                isDark
                                  ? "bg-white/5 hover:bg-white/10"
                                  : "bg-slate-100 hover:bg-slate-200"
                              }`}
                            >
                              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                          </div>
                        </div>

                        {/* EXPANDED PANEL */}
                        {isExpanded && (
                          <div
                            className={`p-6 md:p-8 border-t animate-in fade-in slide-in-from-top-2 duration-300 ${
                              isDark ? "border-white/5" : "border-slate-100"
                            }`}
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                              {/* PRICING MATRIX */}
                              <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiPackage className="text-blue-500" />
                                  <h5 className="text-[10px] font-black uppercase tracking-widest">
                                    Pricing Matrix
                                  </h5>
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-3 px-2 mb-1">
                                    <span className="text-[8px] font-black uppercase opacity-40">
                                      Segment
                                    </span>
                                    <span className="text-[8px] font-black uppercase opacity-40">
                                      Rate (₹)
                                    </span>
                                    <span className="text-[8px] font-black uppercase opacity-40">
                                      Discount
                                    </span>
                                  </div>
                                  {CAR_TYPES.map((ct) => {
                                    const pRow = gData.pricing?.find(
                                      (p) => p.carType === ct,
                                    ) || { price: "", discount: "" };
                                    return (
                                      <div
                                        key={ct}
                                        className="grid grid-cols-3 gap-3 items-center"
                                      >
                                        <span className="text-[10px] font-bold uppercase tracking-tight truncate">
                                          {ct.replace("_", " ")}
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
                                          className={`w-full p-2.5 rounded-xl text-[11px] font-black italic outline-none transition-all ${
                                            isDark
                                              ? "bg-black/20 border border-white/5 focus:border-blue-500/50"
                                              : "bg-slate-50 border border-slate-200 focus:border-blue-500"
                                          }`}
                                        />
                                        <input
                                          type="number"
                                          value={pRow.discount}
                                          placeholder="0%"
                                          onChange={(e) =>
                                            handlePriceChange(
                                              svc.id,
                                              ct,
                                              "discount",
                                              e.target.value,
                                            )
                                          }
                                          className={`w-full p-2.5 rounded-xl text-[11px] font-black italic outline-none transition-all ${
                                            isDark
                                              ? "bg-black/20 border border-white/5 focus:border-emerald-500/50"
                                              : "bg-slate-50 border border-slate-200 focus:border-emerald-500"
                                          }`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                <button
                                  disabled={isProcessing}
                                  onClick={() => savePricing(svc.id)}
                                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                >
                                  <FiSave />{" "}
                                  {isProcessing
                                    ? "Syncing..."
                                    : "Update Fleet Pricing"}
                                </button>
                              </div>

                              {/* METADATA OVERRIDE */}
                              <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-10">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiInfo className="text-blue-500" />
                                  <h5 className="text-[10px] font-black uppercase tracking-widest">
                                    Metadata Override
                                  </h5>
                                </div>
                                <div className="space-y-5">
                                  <div>
                                    <label className="text-[8px] font-black uppercase opacity-40 block mb-2">
                                      Display Description
                                    </label>
                                    <textarea
                                      className={`w-full p-4 rounded-2xl text-[11px] font-medium min-h-[100px] outline-none transition-all resize-none ${
                                        isDark
                                          ? "bg-black/20 border border-white/5 focus:border-blue-500/50"
                                          : "bg-slate-50 border border-slate-200 focus:border-blue-600"
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
                                    className={`p-5 rounded-2xl border flex items-center gap-4 ${
                                      isDark
                                        ? "bg-black/10 border-white/5"
                                        : "bg-slate-50 border-slate-100"
                                    }`}
                                  >
                                    <div className="relative group/img shrink-0">
                                      {previewImg ? (
                                        <img
                                          src={previewImg}
                                          className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500/20"
                                          alt="Preview"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-[8px] font-black opacity-30">
                                          IMG
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
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] font-black uppercase tracking-wider">
                                        Service Visual
                                      </span>
                                      <label
                                        htmlFor={`img-${svc.id}`}
                                        className="text-[10px] font-black text-blue-500 uppercase cursor-pointer hover:underline"
                                      >
                                        Change Asset
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
                                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                      isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white"
                                        : "bg-slate-900 hover:bg-black text-white"
                                    }`}
                                  >
                                    <FiImage />{" "}
                                    {isProcessing
                                      ? "Processing..."
                                      : "Save Metadata"}
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
        ))}
      </main>
    </div>
  );
}
