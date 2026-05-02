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
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function MarketplaceDashboard() {
  const { isDark } = useTheme();
  const { onBookingAction } = useBookingPopup();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = onBookingAction(() => {
      fetchBookings();
    });
    return unsubscribe;
  }, [onBookingAction]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/marketplace/bookings`,
        config,
      );
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, type) => {
    try {
      await axios.post(
        `${API_URL}/api/marketplace/booking/${id}/${type}`,
        {},
        config,
      );
      fetchBookings();
    } catch (e) {
      console.error(e);
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
          ? "bg-slate-800 text-slate-400 border-slate-700"
          : "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#080a0f] text-slate-200" : "bg-[#f8fafc] text-slate-900"
      } md:ml-20 pb-20`}
    >
      {/* STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
          isDark
            ? "bg-[#080a0f]/80 border-white/5"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
              Marketplace
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">
              Live Engine
            </span>
          </div>

          {/* CUSTOM SEGMENTED CONTROL */}
          <div
            className={`flex p-1 rounded-2xl border ${isDark ? "bg-black/40 border-white/5" : "bg-slate-200/50 border-slate-200"}`}
          >
            {["ALL", "PENDING", "ACCEPTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all duration-300 ${
                  filter === s
                    ? isDark
                      ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      : "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* STATS GRID - Horizontal scroll on mobile */}
        <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-3 gap-4 mb-10 no-scrollbar">
          {[
            {
              label: "Total Load",
              val: stats.total,
              icon: <FiLayers />,
              color: "text-blue-500",
            },
            {
              label: "In Queue",
              val: stats.pending,
              icon: <FiClock />,
              color: "text-amber-500",
            },
            {
              label: "Earnings",
              val: `₹${stats.revenue.toLocaleString()}`,
              icon: <FiDollarSign />,
              color: "text-emerald-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`min-w-[240px] sm:min-w-0 p-5 rounded-[2rem] border flex items-center gap-4 transition-transform active:scale-95 ${
                isDark
                  ? "bg-[#11141b] border-white/5"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div
                className={`p-4 rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-50"} ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50">
                  {stat.label}
                </p>
                <p className="text-2xl font-black italic tracking-tighter">
                  {stat.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKING LIST */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-32 text-center">
              <FiRefreshCw
                className="animate-spin mx-auto mb-4 text-blue-500"
                size={32}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                Synchronizing Data...
              </span>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`group relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${
                  isDark
                    ? "bg-[#11141b] border-white/5 hover:border-blue-500/30"
                    : "bg-white border-slate-200 hover:shadow-2xl hover:shadow-blue-500/10"
                }`}
              >
                <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Left Section: Info */}
                  <div className="flex-1 flex gap-5 sm:gap-8">
                    {/* Visual ID Badge */}
                    <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-3xl border shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
                      <span className="text-[10px] font-black opacity-60 uppercase">
                        Unit
                      </span>
                      <span className="text-xl font-black">
                        #{String(b.id).slice(-3)}
                      </span>
                    </div>

                    <div className="space-y-4 w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <span
                          className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider border ${getStatusStyles(b.status)}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-[10px] font-bold opacity-30 tracking-[0.2em]">
                          REF: {b.id}
                        </span>
                      </div>

                      {/* Service Pills */}
                      <div className="flex flex-wrap gap-2">
                        {b.serviceName?.split(",").map((svc, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase italic border transition-colors ${
                              isDark
                                ? "bg-white/5 border-white/5 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            {svc.trim()}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                          >
                            <FiUser size={14} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-tight">
                            {b.clientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                          <FiCalendar size={14} className="text-blue-500" />
                          <span className="text-[11px] font-bold uppercase">
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

                  {/* Right Section: Price & Actions */}
                  <div
                    className={`flex flex-col sm:flex-row lg:flex-col items-center justify-between lg:justify-center gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l ${isDark ? "border-white/5" : "border-slate-100"} lg:pl-12`}
                  >
                    <div className="text-center sm:text-left lg:text-center shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">
                        Total Value
                      </p>
                      <div className="relative inline-block">
                        <p
                          className={`text-4xl font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          ₹{b.price}
                        </p>
                        <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {b.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleAction(b.id, "reject")}
                            className={`flex-1 sm:flex-none p-4 rounded-2xl border transition-all active:scale-90 ${
                              isDark
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                                : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            <FiX size={20} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleAction(b.id, "accept")}
                            className="flex-[2] sm:flex-none px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                          >
                            Accept <FiChevronRight />
                          </button>
                        </>
                      ) : (
                        <div
                          className={`w-full text-center px-8 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] ${
                            isDark
                              ? "bg-white/5 border-white/5 text-slate-500"
                              : "bg-slate-100 border-slate-200 text-slate-400"
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

      {/* Floating Bottom Spacer for Mobile */}
      <div className="h-10 md:hidden" />
    </div>
  );
}
