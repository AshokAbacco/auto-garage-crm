import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiCheck,
  FiX,
  FiClock,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiLayers,
  FiDollarSign,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function MarketplaceDashboard() {
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  // High contrast styles for status
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
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div
      className={`min-h-screen md:ml-20 pb-12 transition-all duration-300 ${isDark ? "bg-[#0b0e14] text-slate-200" : "bg-[#f1f5f9] text-slate-900"}`}
    >
      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-8 py-5 ${isDark ? "bg-[#0b0e14]/80 border-slate-800" : "bg-white/90 border-slate-200"}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">
              Marketplace
            </h1>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-blue-400" : "text-blue-600"}`}
            >
              Live Service Requests
            </p>
          </div>
          <div
            className={`flex p-1 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}
          >
            {["ALL", "PENDING", "ACCEPTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${filter === s ? (isDark ? "bg-slate-800 text-blue-400 shadow-lg" : "bg-white text-blue-600 shadow-sm") : "text-slate-500"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Requests",
              val: stats.total,
              icon: <FiLayers />,
              color: "text-blue-500",
            },
            {
              label: "Pending",
              val: stats.pending,
              icon: <FiClock />,
              color: "text-amber-500",
            },
            {
              label: "Revenue",
              val: `₹${stats.revenue.toLocaleString()}`,
              icon: <FiDollarSign />,
              color: "text-emerald-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-[2rem] border ${isDark ? "bg-[#161920] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-50"} ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black italic tracking-tighter">
                    {stat.val}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKING CARDS */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center opacity-50">
              <FiRefreshCw className="animate-spin mx-auto mb-2" />{" "}
              <span className="text-[10px] font-bold uppercase">
                Syncing...
              </span>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`rounded-[2.5rem] border transition-all ${isDark ? "bg-[#161920] border-slate-800" : "bg-white border-slate-200 hover:shadow-lg shadow-blue-500/5"}`}
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div
                      className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center font-bold text-lg border ${isDark ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-slate-50 border-slate-100 text-blue-600"}`}
                    >
                      {b.clientName?.charAt(0) || "U"}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[8px] px-2.5 py-1 rounded-md font-black uppercase border ${getStatusStyles(b.status)}`}
                        >
                          {b.status}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? "text-slate-600" : "text-slate-400"}`}
                        >
                          ID: {String(b.id).padStart(5, "0")}
                        </span>
                      </div>

                      {/* SERVICES LIST - One per line */}
                      <div className="space-y-2">
                        {b.serviceName?.split(",").map((svc, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div
                              className={`w-1 h-1 rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                            ></div>
                            <h3
                              className={`text-[12px] font-medium uppercase italic tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}
                            >
                              {svc.trim()}
                            </h3>
                          </div>
                        ))}
                      </div>

                      {/* USER & DATE */}
                      <div
                        className={`flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-500"}`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FiUser
                            className={
                              isDark ? "text-blue-400" : "text-blue-600"
                            }
                          />{" "}
                          {b.clientName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiCalendar
                            className={
                              isDark ? "text-blue-400" : "text-blue-600"
                            }
                          />{" "}
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

                  {/* PRICE & ACTION */}
                  <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 pt-6 md:pt-0 border-slate-500/10">
                    <div className="md:text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Final Total
                      </p>
                      <p
                        className={`text-4xl font-black italic tracking-tighter ${isDark ? "text-blue-400" : "text-slate-900"}`}
                      >
                        ₹{b.price}
                      </p>
                    </div>

                    {b.status === "PENDING" ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(b.id, "reject")}
                          className={`p-4 rounded-2xl border transition-all ${isDark ? "border-slate-800 text-slate-500 hover:bg-rose-500/10" : "border-slate-200 text-slate-400 hover:bg-rose-50"}`}
                        >
                          <FiX size={20} />
                        </button>
                        <button
                          onClick={() => handleAction(b.id, "accept")}
                          className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`px-8 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? "bg-slate-800/30 border-slate-800 text-slate-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}
                      >
                        Processed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
