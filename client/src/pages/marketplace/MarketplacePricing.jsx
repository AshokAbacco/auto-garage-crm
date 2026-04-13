import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const CAR_TYPES = ["SEDAN", "SUV", "HATCHBACK", "SUV_COUPE", "MPV", "LUXURY"];

/* ── Global Styles ── */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
.mp { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
.mp-shell { margin-left: 5rem; padding: 28px 32px 60px; min-height: 100vh; }
@media (max-width: 768px) { .mp-shell { margin-left: 0; padding: 20px 16px 48px; } }
.mp-title { font-size: 1.45rem; font-weight: 700; letter-spacing: -0.02em; }
.mp-section-header { margin: 30px 0 15px; padding-bottom: 8px; border-bottom: 2px solid; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
.mp-group-title { margin: 20px 0 10px; font-size: 0.85rem; font-weight: 700; opacity: 0.8; }
.mp-list { display: flex; flex-direction: column; gap: 8px; }
.mp-card { border-radius: 12px; border: 1.5px solid; overflow: hidden; transition: all 0.2s; }
.mp-card-row { display: grid; grid-template-columns: 34px minmax(0,1fr) 110px 30px; align-items: center; gap: 12px; padding: 12px 16px; }
.mp-toggle { width: 32px; height: 18px; border-radius: 9px; cursor: pointer; position: relative; transition: 0.2s; border:none; outline: none; }
.mp-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.mp-toggle.on { background: #2563EB; }
.mp-toggle.on::after { transform: translateX(14px); }
.mp-svc-name { font-size: 0.9rem; font-weight: 600; }
.mp-panel { border-top: 1.5px solid; padding: 16px; animation: panelIn 0.2s ease; }
@keyframes panelIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.mp-pricing-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.mp-pricing-label { width: 85px; font-size: 0.7rem; font-weight: 700; opacity: 0.6; }
.mp-input { border: 1.5px solid; border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; outline: none; transition: 0.2s; width: 100%; }
.mp-textarea { border: 1.5px solid; border-radius: 8px; padding: 10px; font-size: 0.85rem; width: 100%; min-height: 80px; outline: none; }
.mp-btn { border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.mp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.mp-img-upload { display: flex; align-items: center; gap: 12px; margin-top: 15px; }
.mp-img-preview { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1.5px solid; }
.mp-img-placeholder { width: 50px; height: 50px; border-radius: 8px; border: 2px dashed; display: flex; align-items: center; justify-content: center; }
`;

const T = {
  light: {
    page: "#F1F5F9",
    card: "#FFFFFF",
    border: "#E2E8F0",
    accent: "#2563EB",
    text: "#0F172A",
    muted: "#64748B",
    input: "#F8FAFC",
    success: "#16A34A",
  },
  dark: {
    page: "#0F172A",
    card: "#1E293B",
    border: "#334155",
    accent: "#3B82F6",
    text: "#F8FAFC",
    muted: "#94A3B8",
    input: "#0F172A",
    success: "#4ADE80",
  },
};

export default function MarketplacePricing() {
  const { isDark } = useTheme();
  const t = isDark ? T.dark : T.light;
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
    const identifier = data.service?.id || externalId;
    setActionLoading((prev) => ({ ...prev, [externalId]: true }));

    try {
      await axios.post(
        `${API_URL}/api/marketplace/garage-services`,
        {
          serviceId: identifier,
          isActive: data.isActive,
          pricing: data.pricing.map((p) => ({
            carType: p.carType,
            price: parseFloat(p.price) || 0,
            discount: parseFloat(p.discount) || 0,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Pricing and Status saved!");
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Save failed. Check console.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [externalId]: false }));
    }
  };

  const saveDetails = async (externalId, fallbackDesc) => {
    const data = getGarageData(externalId);
    const crmId = data.service?.id;
    const detail = localDetails[externalId];
    const identifier = crmId || externalId;

    setActionLoading((prev) => ({ ...prev, [externalId]: true }));

    const fd = new FormData();
    fd.append("description", detail?.description || fallbackDesc || "");
    if (detail?.imageFile) fd.append("image", detail.imageFile);
    fd.append("isActive", data.isActive);
    fd.append("pricing", JSON.stringify(data.pricing));

    try {
      await axios.patch(
        `${API_URL}/api/marketplace/services/${identifier}/details`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      alert("Metadata and Pricing synced successfully!");
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error saving data.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [externalId]: false }));
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="mp" style={{ background: t.page, color: t.text }}>
        <div className="mp-shell">
          <h1 className="mp-title">Service Catalog</h1>
          <p style={{ color: t.muted, fontSize: "0.8rem" }}>
            Platform definitions & Garage pricing
          </p>

          {hierarchy.map((main) => (
            <div key={main.id}>
              <div
                className="mp-section-header"
                style={{ color: t.accent, borderColor: t.border }}
              >
                {main.name}
              </div>
              {main.sections.map((section) => (
                <div key={section.id} style={{ marginBottom: "20px" }}>
                  <h3 className="mp-group-title">{section.name}</h3>
                  <div className="mp-list">
                    {section.services.map((svc) => {
                      const gData = getGarageData(svc.id);
                      const isExpanded = expanded[svc.id];
                      const detail = localDetails[svc.id] || {};
                      const previewImg = detail.imagePreview || svc.image;
                      const isProcessing = actionLoading[svc.id];

                      return (
                        <div
                          key={svc.id}
                          className="mp-card"
                          style={{ background: t.card, borderColor: t.border }}
                        >
                          <div className="mp-card-row">
                            <button
                              className={`mp-toggle ${gData.isActive ? "on" : ""}`}
                              style={{
                                background: gData.isActive
                                  ? t.accent
                                  : t.border,
                              }}
                              onClick={() =>
                                handleToggle(svc.id, !gData.isActive)
                              }
                            />
                            <div className="mp-svc-name">{svc.name}</div>
                            <div
                              style={{
                                textAlign: "right",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: t.accent,
                              }}
                            >
                              {gData.pricing?.length > 0
                                ? `₹${gData.pricing[0].price}`
                                : "No Price"}
                            </div>
                            <button
                              onClick={() =>
                                setExpanded((p) => ({
                                  ...p,
                                  [svc.id]: !p[svc.id],
                                }))
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: t.muted,
                              }}
                            >
                              {isExpanded ? "▲" : "▼"}
                            </button>
                          </div>

                          {isExpanded && (
                            <div
                              className="mp-panel"
                              style={{ borderColor: t.border }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1.2fr 0.8fr",
                                  gap: "24px",
                                }}
                              >
                                <div>
                                  <label
                                    className="mp-pricing-label"
                                    style={{ color: t.muted }}
                                  >
                                    SEGMENT PRICING
                                  </label>
                                  {CAR_TYPES.map((ct) => {
                                    const pRow = gData.pricing?.find(
                                      (p) => p.carType === ct,
                                    ) || { price: "", discount: "" };
                                    return (
                                      <div key={ct} className="mp-pricing-row">
                                        <span className="mp-pricing-label">
                                          {ct}
                                        </span>
                                        <input
                                          className="mp-input"
                                          style={{
                                            background: t.input,
                                            borderColor: t.border,
                                            color: t.text,
                                          }}
                                          type="number"
                                          value={pRow.price}
                                          onChange={(e) =>
                                            handlePriceChange(
                                              svc.id,
                                              ct,
                                              "price",
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <input
                                          className="mp-input"
                                          style={{
                                            background: t.input,
                                            borderColor: t.border,
                                            color: t.text,
                                            width: "80px",
                                          }}
                                          type="number"
                                          value={pRow.discount}
                                          onChange={(e) =>
                                            handlePriceChange(
                                              svc.id,
                                              ct,
                                              "discount",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                  <button
                                    disabled={isProcessing}
                                    className="mp-btn"
                                    style={{
                                      background: t.accent,
                                      color: "#fff",
                                      marginTop: "10px",
                                    }}
                                    onClick={() => savePricing(svc.id)}
                                  >
                                    {isProcessing
                                      ? "Saving..."
                                      : "Update Pricing"}
                                  </button>
                                </div>

                                <div>
                                  <label
                                    className="mp-pricing-label"
                                    style={{ color: t.muted }}
                                  >
                                    METADATA OVERRIDE
                                  </label>
                                  <textarea
                                    className="mp-textarea"
                                    style={{
                                      background: t.input,
                                      borderColor: t.border,
                                      color: t.text,
                                    }}
                                    value={
                                      detail.description ??
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
                                  <div className="mp-img-upload">
                                    {previewImg ? (
                                      <img
                                        src={previewImg}
                                        className="mp-img-preview"
                                      />
                                    ) : (
                                      <div
                                        className="mp-img-placeholder"
                                        style={{ borderColor: t.border }}
                                      >
                                        IMG
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      id={`img-${svc.id}`}
                                      style={{ display: "none" }}
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
                                    <label
                                      htmlFor={`img-${svc.id}`}
                                      style={{
                                        fontSize: "0.7rem",
                                        color: t.accent,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Change Image
                                    </label>
                                  </div>
                                  <button
                                    disabled={isProcessing}
                                    className="mp-btn"
                                    style={{
                                      background: t.success,
                                      color: "#fff",
                                      marginTop: "15px",
                                      width: "100%",
                                    }}
                                    onClick={() =>
                                      saveDetails(
                                        svc.id,
                                        svc.description || svc.name,
                                      )
                                    }
                                  >
                                    {isProcessing
                                      ? "Processing..."
                                      : "Save Metadata"}
                                  </button>
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
        </div>
      </div>
    </>
  );
}
