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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/marketplace/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
      .filter((b) => b.status === "ACCEPTED")
      .reduce((acc, curr) => acc + curr.price, 0),
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "REJECTED":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 md:ml-20 pb-12 ${
        isDark ? "bg-[#0f1115] text-slate-200" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-6 py-4 ${
          isDark
            ? "bg-[#0f1115]/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            <p
              className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Manage your incoming service requests
            </p>
          </div>

          <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/50 dark:border-slate-800">
            {["ALL", "PENDING", "ACCEPTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === s
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-500 hover:text-blue-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Total Bookings",
              val: stats.total,
              icon: <FiLayers />,
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              label: "Pending Requests",
              val: stats.pending,
              icon: <FiClock />,
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Total Revenue",
              val: `₹${stats.revenue}`,
              icon: <FiDollarSign />,
              color: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border transition-all ${
                isDark
                  ? "bg-[#16191f] border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-100"} ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p
                    className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? "text-slate-500" : "text-slate-500"}`}
                  >
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-0.5">{stat.val}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FEED */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <FiRefreshCw className="animate-spin text-2xl mb-4" />
              <p className="text-sm font-medium">Synchronizing data...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              className={`text-center py-24 border-2 border-dashed rounded-3xl ${isDark ? "border-slate-800" : "border-slate-200"}`}
            >
              <p className="text-slate-400 font-medium">
                No bookings found in this category.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isDark
                    ? "bg-[#16191f] border-slate-800 hover:border-blue-500/50"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5"
                }`}
              >
                <div className="p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-5 items-start">
                    <div
                      className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center font-bold text-lg ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {b.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusStyles(b.status)}`}
                        >
                          {b.status}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                          #{String(b.id).slice(-5)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight mb-2">
                        {b.serviceName}
                      </h3>
                      <div
                        className={`flex flex-wrap gap-y-1 gap-x-4 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FiUser className="text-blue-500" /> {b.clientName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiCalendar className="text-blue-500" />{" "}
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

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="md:text-right">
                      <p
                        className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}
                      >
                        Fee
                      </p>
                      <p
                        className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        ₹{b.price}
                      </p>
                    </div>

                    {b.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(b.id, "reject")}
                          className={`p-3 rounded-xl border transition-colors ${
                            isDark
                              ? "border-slate-700 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                              : "border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          }`}
                        >
                          <FiX size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(b.id, "accept")}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                          <FiCheck /> Accept
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`h-10 flex items-center px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
                          isDark
                            ? "bg-slate-800/50 border-slate-700 text-slate-500"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        Archive Logged
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <button
        onClick={fetchBookings}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:rotate-180 md:hidden ${
          isDark
            ? "bg-slate-800 text-blue-400 border border-slate-700"
            : "bg-white text-blue-600 border border-slate-200"
        }`}
      >
        <FiRefreshCw />
      </button>
    </div>
  );
}
