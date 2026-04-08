import { useEffect, useState } from "react";
import axios from "axios";

// mock hook – replace with your real one
const useTheme = () => ({ isDark: false });

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const CAR_TYPES = ["SEDAN", "SUV", "HATCHBACK", "SUV_COUPE", "MPV", "LUXURY"];

/* ── Global styles ─────────────────────────────────────────────────────── */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.mp { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }

.mp-shell {
  margin-left: 5rem;
  padding: 28px 32px 60px;
  min-height: 100vh;
}
@media (max-width: 768px) {
  .mp-shell { margin-left: 0; padding: 20px 16px 48px; }
}

.mp-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.mp-title { font-size: 1.45rem; font-weight: 700; letter-spacing: -0.02em; }
.mp-subtitle { font-size: 0.8rem; margin-top: 2px; font-weight: 400; }

.mp-search-wrap { position: relative; }
.mp-search-wrap svg {
  position: absolute; left: 11px; top: 50%;
  transform: translateY(-50%); pointer-events: none;
}
.mp-search {
  border: 1.5px solid; border-radius: 9px;
  padding: 8px 12px 8px 34px; font-size: 0.83rem;
  font-family: inherit; outline: none; width: 240px;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.mp-search:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
@media (max-width: 480px) { .mp-search { width: 100%; } }

.mp-stats { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.mp-stat {
  border-radius: 10px; padding: 10px 16px; border: 1.5px solid;
  display: flex; align-items: center; gap: 10px; flex: 1; min-width: 120px;
}
.mp-stat-val { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
.mp-stat-lbl { font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px; }

.mp-list { display: flex; flex-direction: column; gap: 6px; }

.mp-card { border-radius: 10px; border: 1.5px solid; overflow: hidden; transition: box-shadow 0.2s, border-color 0.2s; }
.mp-card:hover { box-shadow: 0 3px 14px rgba(59,130,246,0.09); }

.mp-card-row {
  display: grid;
  grid-template-columns: 34px minmax(0,1fr) 90px 30px;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
}
@media (max-width: 500px) {
  .mp-card-row { grid-template-columns: 32px minmax(0,1fr) auto 26px; padding: 10px 12px; }
}

.mp-toggle {
  width: 32px; height: 18px; border-radius: 9px; border: none;
  cursor: pointer; position: relative; transition: background 0.22s; flex-shrink: 0;
}
.mp-toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%; background: #fff;
  transition: transform 0.22s; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.mp-toggle.on::after { transform: translateX(14px); }

.mp-svc-name { font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-svc-meta { font-size: 0.68rem; font-weight: 500; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.mp-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

.mp-price-wrap { text-align: right; }
.mp-price-final { font-size: 0.92rem; font-weight: 700; letter-spacing: -0.01em; }
.mp-disc-row { display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 1px; }
.mp-price-orig { font-size: 0.68rem; text-decoration: line-through; }
.mp-disc-badge { font-size: 0.62rem; font-weight: 700; border-radius: 4px; padding: 1px 4px; }

.mp-chevron {
  background: none; border: none; cursor: pointer; padding: 4px;
  border-radius: 5px; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.mp-chevron:hover { background: rgba(59,130,246,0.08); }
.mp-chevron svg { transition: transform 0.22s; }
.mp-chevron.open svg { transform: rotate(180deg); }

.mp-panel {
  border-top: 1.5px solid;
  padding: 14px 16px 16px;
  animation: panelIn 0.18s ease;
}
@keyframes panelIn {
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mp-panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 560px) { .mp-panel-grid { grid-template-columns: 1fr; } }

.mp-ig { display: flex; flex-direction: column; gap: 4px; }
.mp-ig-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }

.mp-input {
  border: 1.5px solid; border-radius: 7px; padding: 7px 10px;
  font-size: 0.83rem; font-family: inherit; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s; width: 100%;
}
.mp-input:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.13); }
.mp-input:disabled { opacity: 0.38; cursor: not-allowed; }

.mp-textarea {
  border: 1.5px solid; border-radius: 7px; padding: 8px 10px;
  font-size: 0.83rem; font-family: inherit; outline: none;
  resize: vertical; min-height: 74px; width: 100%; line-height: 1.55;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.mp-textarea:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.13); }

.mp-img-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.mp-img-thumb { width: 48px; height: 48px; border-radius: 7px; object-fit: cover; border: 1.5px solid; flex-shrink: 0; cursor: pointer; }
.mp-img-placeholder {
  width: 48px; height: 48px; border-radius: 7px; border: 2px dashed;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  flex-shrink: 0; transition: background 0.15s;
}
.mp-img-placeholder:hover { background: rgba(59,130,246,0.06); }
.mp-file-input { display: none; }

.mp-panel-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

.mp-btn {
  border: none; border-radius: 7px; padding: 7px 16px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.01em;
}
.mp-btn:active { transform: scale(0.97); }
.mp-btn-ghost {
  border: 1.5px solid; background: transparent; border-radius: 7px; padding: 6px 14px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s; letter-spacing: 0.01em;
}

.mp-success {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.76rem; font-weight: 600;
  animation: fadeUp 0.22s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}

.mp-pricing-section {
  margin-bottom: 12px;
}
.mp-pricing-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.mp-pricing-label {
  width: 80px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748B;
}
.mp-pricing-inputs {
  display: flex;
  gap: 8px;
  flex: 1;
}
.mp-pricing-inputs .mp-input {
  flex: 1;
}

@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.mp-skel { border-radius: 10px; height: 46px; animation: shimmer 1.3s infinite; }

.mp-empty { text-align: center; padding: 60px 16px; font-size: 0.88rem; font-weight: 500; opacity: 0.4; }
`;

/* ── Themes ─────────────────────────────────────────────────────────────── */
const T = {
  light: {
    page: "#EEF2F9",
    card: "#FFFFFF",
    cardBorder: "#DDE3F0",
    cardBorderActive: "#93C5FD",
    panelBorder: "#EEF2F9",
    panelBg: "#FAFBFE",
    text: "#0F172A",
    muted: "#64748B",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    accentLight: "#EFF6FF",
    success: "#16A34A",
    inputBg: "#F8FAFC",
    inputBorder: "#CBD5E1",
    inputFocus: "#3B82F6",
    toggleOff: "#CBD5E1",
    statBg: "#FFFFFF",
    statBorder: "#DDE3F0",
    discBg: "#DBEAFE",
    discText: "#1D4ED8",
    skel: "linear-gradient(90deg,#DDE3F0 25%,#EEF2F9 50%,#DDE3F0 75%)",
  },
  dark: {
    page: "#07090F",
    card: "#0D1117",
    cardBorder: "#161D2C",
    cardBorderActive: "#1E40AF",
    panelBorder: "#161D2C",
    panelBg: "#0A0E18",
    text: "#E8F0FE",
    muted: "#5A6A85",
    accent: "#3B82F6",
    accentHover: "#2563EB",
    accentLight: "#0D1B36",
    success: "#4ADE80",
    inputBg: "#060810",
    inputBorder: "#161D2C",
    inputFocus: "#3B82F6",
    toggleOff: "#161D2C",
    statBg: "#0D1117",
    statBorder: "#161D2C",
    discBg: "#0D1B36",
    discText: "#60A5FA",
    skel: "linear-gradient(90deg,#0D1117 25%,#161D2C 50%,#0D1117 75%)",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function MarketplacePricing() {
  const { isDark } = useTheme();
  const t = isDark ? T.dark : T.light;

  const [services, setServices] = useState([]);
  const [garageServices, setGarageServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [savedMsg, setSavedMsg] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const [sRes, gRes] = await Promise.all([
        axios.get(`${API_URL}/api/marketplace/services?type=CAR`, cfg),
        axios.get(`${API_URL}/api/marketplace/garage-services`, cfg),
      ]);
      setServices(sRes.data?.data || []);
      setGarageServices(gRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Updated helper to handle pricing array
  const gd = (s) => {
    const f = garageServices.find((g) => g.serviceId === s.id);
    return {
      ...s,
      isActive: f?.isActive || false,
      pricing: f?.pricing || [], // Expecting [{ carType: "SEDAN", price: 100, discount: 0 }, ...]
    };
  };

  // Handler for isActive toggle
  const handleToggle = (id, value) => {
    setGarageServices((prev) => {
      const ex = prev.find((g) => g.serviceId === id);
      if (ex) {
        return prev.map((g) =>
          g.serviceId === id ? { ...g, isActive: value } : g,
        );
      }
      return [...prev, { serviceId: id, isActive: value, pricing: [] }];
    });
  };

  // Updated handler for pricing changes: hc(id, carType, field, value)
  const hc = (id, carType, field, value) => {
    setGarageServices((prev) => {
      const ex = prev.find((g) => g.serviceId === id);

      if (ex) {
        return prev.map((g) => {
          if (g.serviceId !== id) return g;

          const currentPricing = g.pricing || [];
          const priceIndex = currentPricing.findIndex(
            (p) => p.carType === carType,
          );

          let newPricing;
          if (priceIndex > -1) {
            // Update existing
            newPricing = currentPricing.map((p, i) =>
              i === priceIndex ? { ...p, [field]: value } : p,
            );
          } else {
            // Add new entry
            const newItem = { carType };
            if (field === "price") {
              newItem.price = value;
              newItem.discount = 0;
            } else {
              newItem.price = 0;
              newItem.discount = value;
            }
            newPricing = [...currentPricing, newItem];
          }

          return { ...g, pricing: newPricing };
        });
      }

      // Create new entry
      const newItem = { carType };
      if (field === "price") {
        newItem.price = value;
        newItem.discount = 0;
      } else {
        newItem.price = 0;
        newItem.discount = value;
      }

      return [
        ...prev,
        {
          serviceId: id,
          isActive: false,
          pricing: [newItem],
        },
      ];
    });
  };

  const hdc = (id, field, value) =>
    setServiceDetails((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

  // Updated save payload
  const handleSave = async (id) => {
    const item = garageServices.find((g) => g.serviceId === id);
    if (!item) return;

    // Ensure pricing has valid numbers
    const cleanPricing = (item.pricing || []).map((p) => ({
      carType: p.carType,
      price: Number(p.price) || 0,
      discount: Number(p.discount) || 0,
    }));

    await axios.post(
      `${API_URL}/api/marketplace/garage-services`,
      {
        serviceId: id,
        isActive: Boolean(item.isActive),
        pricing: cleanPricing,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchData();
  };

  const handleSaveDetails = async (id) => {
    const d = serviceDetails[id];
    if (!d) return;
    const fd = new FormData();
    if (d.description) fd.append("description", d.description);
    if (d.image) fd.append("image", d.image);
    await axios.patch(`${API_URL}/api/marketplace/services/${id}/details`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSavedMsg((p) => ({ ...p, [id]: true }));
    setTimeout(() => setSavedMsg((p) => ({ ...p, [id]: false })), 2500);
    fetchData();
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const activeCount = garageServices.filter((g) => g.isActive).length;

  // Helper to get price for specific car type
  const getPriceData = (pricing, carType) => {
    return (
      pricing.find((p) => p.carType === carType) || { price: "", discount: 0 }
    );
  };

  // Calculate minimum price for display
  const getMinPrice = (pricing) => {
    const validPrices = pricing
      .map((p) => {
        const base = Number(p.price) || 0;
        const disc = Number(p.discount) || 0;
        return base > 0 ? base - (base * disc) / 100 : null;
      })
      .filter((p) => p !== null);

    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="mp" style={{ background: t.page, color: t.text }}>
        <div className="mp-shell">
          {/* ── Top bar ── */}
          <div className="mp-topbar">
            <div>
              <h1 className="mp-title" style={{ color: t.text }}>
                Marketplace Pricing
              </h1>
              <p className="mp-subtitle" style={{ color: t.muted }}>
                Manage service listings and pricing
              </p>
            </div>
            <div className="mp-search-wrap">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={t.muted}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="mp-search"
                style={{
                  background: t.card,
                  borderColor: t.cardBorder,
                  color: t.text,
                }}
                placeholder="Search services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.cardBorder)}
              />
            </div>
          </div>

          {/* ── Stats ── */}
          {!loading && services.length > 0 && (
            <div className="mp-stats">
              {[
                {
                  val: services.length,
                  lbl: "Total",
                  path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                },
                { val: activeCount, lbl: "Active", path: "M5 13l4 4L19 7" },
                {
                  val: services.length - activeCount,
                  lbl: "Inactive",
                  path: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="mp-stat"
                  style={{ background: t.statBg, borderColor: t.statBorder }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={t.accent}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={s.path} />
                  </svg>
                  <div>
                    <div className="mp-stat-val" style={{ color: t.text }}>
                      {s.val}
                    </div>
                    <div className="mp-stat-lbl" style={{ color: t.muted }}>
                      {s.lbl}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Skeletons ── */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="mp-skel"
                  style={{ background: t.skel, backgroundSize: "600px 100%" }}
                />
              ))}
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && filtered.length === 0 && (
            <div className="mp-empty" style={{ color: t.muted }}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No services available"}
            </div>
          )}

          {/* ── Cards ── */}
          {!loading && (
            <div className="mp-list">
              {filtered.map((s) => {
                const data = gd(s);
                const detail = serviceDetails[s.id] || {};
                const isOpen = expanded[s.id];
                const minPrice = getMinPrice(data.pricing);
                const imgSrc = detail.image
                  ? URL.createObjectURL(detail.image)
                  : s.image || null;

                return (
                  <div
                    key={s.id}
                    className="mp-card"
                    style={{
                      background: t.card,
                      borderColor:
                        data.isActive && !isOpen
                          ? t.cardBorderActive
                          : t.cardBorder,
                    }}
                  >
                    {/* Compact row */}
                    <div className="mp-card-row">
                      <button
                        className={`mp-toggle${data.isActive ? " on" : ""}`}
                        style={{
                          background: data.isActive ? t.accent : t.toggleOff,
                        }}
                        onClick={() => handleToggle(s.id, !data.isActive)}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div className="mp-svc-name" style={{ color: t.text }}>
                          {s.name}
                        </div>
                        <div className="mp-svc-meta" style={{ color: t.muted }}>
                          <span
                            className="mp-dot"
                            style={{
                              background: data.isActive ? t.success : t.muted,
                            }}
                          />
                          {data.isActive ? "Active" : "Inactive"}
                          {s.category && (
                            <>
                              <span style={{ opacity: 0.4 }}>·</span>
                              {s.category}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mp-price-wrap">
                        <div
                          className="mp-price-final"
                          style={{ color: minPrice ? t.accent : t.muted }}
                        >
                          {minPrice ? `From ₹${minPrice.toFixed(0)}` : "—"}
                        </div>
                      </div>

                      <button
                        className={`mp-chevron${isOpen ? " open" : ""}`}
                        style={{ color: t.muted }}
                        onClick={() =>
                          setExpanded((p) => ({ ...p, [s.id]: !p[s.id] }))
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>

                    {/* Expanded panel */}
                    {isOpen && (
                      <div
                        className="mp-panel"
                        style={{
                          borderTopColor: t.panelBorder,
                          background: t.panelBg,
                        }}
                      >
                        {!data.isActive && (
                          <p
                            style={{
                              fontSize: "0.76rem",
                              color: t.muted,
                              marginBottom: 12,
                              fontStyle: "italic",
                            }}
                          >
                            Enable this service to configure pricing and
                            details.
                          </p>
                        )}

                        {/* Pricing Section */}
                        <div className="mp-pricing-section">
                          <label
                            className="mp-ig-label"
                            style={{
                              color: t.muted,
                              marginBottom: 8,
                              display: "block",
                            }}
                          >
                            Pricing by Car Type
                          </label>

                          {CAR_TYPES.map((carType) => {
                            const priceData = getPriceData(
                              data.pricing,
                              carType,
                            );
                            return (
                              <div key={carType} className="mp-pricing-row">
                                <div
                                  className="mp-pricing-label"
                                  style={{ color: t.text }}
                                >
                                  {carType}
                                </div>
                                <div className="mp-pricing-inputs">
                                  <input
                                    className="mp-input"
                                    style={{
                                      background: t.inputBg,
                                      borderColor: t.inputBorder,
                                      color: t.text,
                                    }}
                                    type="number"
                                    min="0"
                                    placeholder="Price"
                                    disabled={!data.isActive}
                                    value={priceData.price}
                                    onChange={(e) =>
                                      hc(s.id, carType, "price", e.target.value)
                                    }
                                    onFocus={(e) =>
                                      (e.target.style.borderColor =
                                        t.inputFocus)
                                    }
                                    onBlur={(e) =>
                                      (e.target.style.borderColor =
                                        t.inputBorder)
                                    }
                                  />
                                  <input
                                    className="mp-input"
                                    style={{
                                      background: t.inputBg,
                                      borderColor: t.inputBorder,
                                      color: t.text,
                                      width: "80px",
                                    }}
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Disc %"
                                    disabled={!data.isActive}
                                    value={priceData.discount}
                                    onChange={(e) =>
                                      hc(
                                        s.id,
                                        carType,
                                        "discount",
                                        e.target.value,
                                      )
                                    }
                                    onFocus={(e) =>
                                      (e.target.style.borderColor =
                                        t.inputFocus)
                                    }
                                    onBlur={(e) =>
                                      (e.target.style.borderColor =
                                        t.inputBorder)
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {data.isActive && (
                          <>
                            <div className="mp-ig" style={{ marginTop: 10 }}>
                              <label
                                className="mp-ig-label"
                                style={{ color: t.muted }}
                              >
                                Description
                              </label>
                              <textarea
                                className="mp-textarea"
                                style={{
                                  background: t.inputBg,
                                  borderColor: t.inputBorder,
                                  color: t.text,
                                }}
                                placeholder="What's included, duration, requirements…"
                                value={
                                  detail.description ?? s.description ?? ""
                                }
                                onChange={(e) =>
                                  hdc(s.id, "description", e.target.value)
                                }
                                onFocus={(e) =>
                                  (e.target.style.borderColor = t.inputFocus)
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor = t.inputBorder)
                                }
                              />
                            </div>

                            <div className="mp-img-row">
                              <label
                                htmlFor={`fi-${s.id}`}
                                title="Upload image"
                              >
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="mp-img-thumb"
                                    style={{ borderColor: t.inputBorder }}
                                  />
                                ) : (
                                  <div
                                    className="mp-img-placeholder"
                                    style={{ borderColor: t.inputBorder }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke={t.muted}
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                      />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                  </div>
                                )}
                              </label>
                              <input
                                id={`fi-${s.id}`}
                                className="mp-file-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  hdc(s.id, "image", e.target.files[0])
                                }
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: t.text,
                                  }}
                                >
                                  {imgSrc ? "Service image" : "No image"}
                                </div>
                                <label
                                  htmlFor={`fi-${s.id}`}
                                  style={{
                                    fontSize: "0.71rem",
                                    color: t.accent,
                                    cursor: "pointer",
                                    fontWeight: 500,
                                  }}
                                >
                                  {imgSrc ? "Change" : "Upload image"}
                                </label>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mp-panel-footer">
                          {savedMsg[s.id] && (
                            <span
                              className="mp-success"
                              style={{ color: t.success }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Saved
                            </span>
                          )}
                          <button
                            className="mp-btn-ghost"
                            style={{
                              borderColor: t.inputBorder,
                              color: t.muted,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = `${t.accent}10`)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            onClick={() => handleSave(s.id)}
                          >
                            Update Pricing
                          </button>
                          {data.isActive && (
                            <button
                              className="mp-btn"
                              style={{ background: t.accent, color: "#fff" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  t.accentHover)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = t.accent)
                              }
                              onClick={() => handleSaveDetails(s.id)}
                            >
                              Save Details
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
