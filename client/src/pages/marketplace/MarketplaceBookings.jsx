import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useBookingPopup } from "../../providers/BookingPopupProvider";
import {
  FiCheck,
  FiX,
  FiClock,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiLayers,
  FiDollarSign,
  FiChevronRight,
  FiZap,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Contextual metrics wording configuration mapping per business model
const STATS_VOCABULARY = {
  CAR: { primary: "Total Fleet Load", queue: "In Queue Tiers" },
  BIKE: { primary: "Total Rider Bookings", queue: "In Garage Bay" },
  WASHING: { primary: "Total Wash Queue", queue: "Pending Detail" },
};

export default function MarketplaceDashboard() {
  const { isDark } = useTheme();
  const { onBookingAction } = useBookingPopup();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [actionError, setActionError] = useState(null); // 🆕 surfaces real server errors
  const [actioningId, setActioningId] = useState(null); // 🆕 disables buttons mid-request

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

  // Choose dynamic text titles dictionary
  const currentLabels =
    STATS_VOCABULARY[currentCrmType] || STATS_VOCABULARY.CAR;

  useEffect(() => {
    fetchBookings();
  }, [currentCrmType]); // Re-fetch data matrix whenever workspace shifts

  useEffect(() => {
    const unsubscribe = onBookingAction(() => {
      fetchBookings();
    });
    return unsubscribe;
  }, [onBookingAction, currentCrmType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Added active vehicleType parameter synchronization to cleanly clear pipeline cache
      const res = await axios.get(`${API_URL}/api/marketplace/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { vehicleType: currentCrmType.toLowerCase() },
      });
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error("Dashboard data sync fault:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, type) => {
    setActionError(null);
    setActioningId(id);
    try {
      await axios.post(
        `${API_URL}/api/marketplace/booking/${id}/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchBookings();
    } catch (e) {
      // 🆕 Log + surface the REAL server message instead of just the Axios wrapper
      const serverMessage = e?.response?.data?.message;
      console.error(
        "Action execution rejected:",
        serverMessage || e.message,
        "| Full error:",
        e,
      );
      setActionError(
        `Booking #${id}: ${serverMessage || e.message || "Action failed"}`,
      );
      // Refresh anyway — status may have actually changed server-side
      // even though this particular request errored (e.g. "already processed").
      fetchBookings();
    } finally {
      setActioningId(null);
    }
  };

  const filteredBookings = bookings.filter(
    (b) => filter === "ALL" || b.status === filter,
  );

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    revenue: bookings
      .filter((b) => b.status === "ACCEPTED" || b.status === "CONFIRMED")
      .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0),
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return isDark
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "ACCEPTED":
      case "CONFIRMED":
        return isDark
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return isDark
          ? "bg-slate-800 text-slate-400 border-white/[0.04]"
          : "bg-slate-100 text-slate-600 border-slate-200";
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl text-white shadow-blue-500/10">
              <FiZap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight leading-none">
                  Marketplace Board
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
                  {currentCrmType} Operational Channel
                </span>
              </div>
              <p className="text-xs opacity-40 mt-1">
                Monitor incoming marketplace pipeline streams and processing
                workflows.
              </p>
            </div>
          </div>

          {/* CUSTOM SEGMENTED CONTROL */}
          <div
            className={`flex p-1 rounded-xl border ${
              isDark
                ? "bg-white/[0.02] border-white/[0.05]"
                : "bg-slate-200/60 border-slate-200/50"
            }`}
          >
            {["ALL", "PENDING", "ACCEPTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2 text-[10px] font-semibold uppercase rounded-lg transition-all duration-300 ${
                  filter === s
                    ? isDark
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/10"
                      : "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: currentLabels.primary,
              val: stats.total,
              icon: <FiLayers size={16} />,
              color: "text-blue-500 bg-blue-500/5",
            },
            {
              label: currentLabels.queue,
              val: stats.pending,
              icon: <FiClock size={16} />,
              color: "text-amber-500 bg-amber-500/5",
            },
            {
              label: "Channel Earnings",
              val: `₹${stats.revenue.toLocaleString()}`,
              icon: <FiDollarSign size={16} />,
              color: "text-emerald-500 bg-emerald-500/5",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                isDark
                  ? "bg-[#11141d]/40 border-white/[0.04]"
                  : "bg-white border-slate-200/50 shadow-sm shadow-slate-200/20"
              }`}
            >
              <div className={`p-3.5 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-xl font-bold tracking-tight">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🆕 REAL ERROR BANNER — shows the actual server message on accept/reject failure */}
        {actionError && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDark
                ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <span className="text-sm font-medium">{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* BOOKING LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-32 text-center flex flex-col items-center justify-center gap-3 opacity-50">
              <FiRefreshCw className="animate-spin text-blue-500" size={24} />
              <span className="text-[11px] font-medium uppercase tracking-widest">
                Synchronizing Pipeline Rows...
              </span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-24 opacity-30 text-xs font-medium uppercase tracking-wider">
              No live bookings matching this queue stage.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`group rounded-2xl border transition-all duration-300 ${
                  isDark
                    ? "bg-[#11141d]/40 border-white/[0.04] hover:bg-[#11141b]/80"
                    : "bg-white border-slate-200/50 hover:shadow-md hover:shadow-slate-200/30"
                }`}
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left Info Stream */}
                  <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Compact Identity Block */}
                    <div className="flex sm:flex-col items-center justify-center w-14 h-14 rounded-xl border shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 border-none text-white shadow-md shadow-blue-500/5">
                      <span className="text-[14px] font-bold">
                        #{String(b.id).slice(-3)}
                      </span>
                    </div>

                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getStatusStyles(b.status)}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-[10px] font-medium opacity-30 tracking-wider">
                          ID: {b.id}
                        </span>
                      </div>

                      {/* Unified Tokenized Service Pills Layout */}
                      <div className="flex flex-wrap gap-1.5">
                        {b.serviceName?.split(",").map((svc, idx) => (
                          <div
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              isDark
                                ? "bg-white/[0.02] border-white/[0.04] text-slate-300"
                                : "bg-slate-50 border-slate-200/60 text-slate-700"
                            }`}
                          >
                            {svc.trim()}
                          </div>
                        ))}
                      </div>

                      {/* Consumer Meta Properties */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 opacity-60">
                        <div className="flex items-center gap-1.5">
                          <FiUser size={13} className="text-blue-500" />
                          <span className="text-xs font-medium">
                            {b.clientName || "App Client"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={13} className="text-blue-500" />
                          <span className="text-xs font-medium">
                            {new Date(b.scheduledAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Matrix Controls */}
                  <div
                    className={`flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l ${
                      isDark ? "border-white/[0.04]" : "border-slate-100"
                    } lg:pl-8`}
                  >
                    <div className="text-left lg:text-center shrink-0 min-w-[100px]">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-0.5">
                        Booking Value
                      </p>
                      <p
                        className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        ₹{b.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {b.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleAction(b.id, "reject")}
                            disabled={actioningId === b.id}
                            className={`p-2.5 rounded-xl border transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${
                              isDark
                                ? "bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                                : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            <FiX size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(b.id, "accept")}
                            disabled={actioningId === b.id}
                            className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs tracking-wide transition-all active:scale-[0.97] flex items-center gap-1.5 shadow-md shadow-blue-500/5 disabled:opacity-40 disabled:pointer-events-none"
                          >
                            {actioningId === b.id ? "Working..." : "Accept"}{" "}
                            <FiChevronRight size={14} />
                          </button>
                        </>
                      ) : (
                        <div
                          className={`px-6 py-2 rounded-xl border text-[10px] font-semibold uppercase tracking-wider ${
                            isDark
                              ? "bg-white/[0.02] border-white/[0.04] text-slate-500"
                              : "bg-slate-50 border-slate-200/60 text-slate-400"
                          }`}
                        >
                          Processed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="h-10 md:hidden" />
    </div>
  );
}
