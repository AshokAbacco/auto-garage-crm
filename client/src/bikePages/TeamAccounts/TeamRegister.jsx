import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Lock, UserPlus, Search, CheckCircle, Bike, Sparkles, Crown, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "./utils/axiosInstance";
import { useTheme } from "../../contexts/ThemeContext";

export default function TeamRegister() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  /* ---------------- STATES ---------------- */
  const [staffList, setStaffList] = useState([]);
  const [teamList, setTeamList] = useState([]);

  const [search, setSearch] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchStaff();
    fetchTeamInfo();
    fetchTeamMembers(); // optional, safe
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/api/staff");
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Staff fetch error", err);
      setStaffList([]);
    }
  };

  const fetchTeamInfo = async () => {
    try {
      const res = await api.get("/api/bikes-team/info");
      setAdminEmail(res.data.adminEmail);
      setUsed(res.data.used);
      setLimit(res.data.limit);
    } catch (err) {
      console.error("Team info error", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/api/bikes-team");
      setTeamList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Team members fetch skipped");
      setTeamList([]); // SAFE fallback
    }
  };

  /* ---------------- HELPERS ---------------- */
  const registeredEmails = useMemo(
    () => new Set(teamList.map((t) => t.email)),
    [teamList]
  );

  const filteredStaff = staffList.filter((s) =>
    `${s.name} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const remainingSlots = limit - used;

  /* ---------------- ACTIONS ---------------- */
  const handleStaffSelect = (staff) => {
    if (registeredEmails.has(staff.email)) return;
    setUsername(staff.name);
    setEmail(staff.email || "");
  };

  const handleCreate = async () => {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/bikes-team/create", {
        name: username,
        username,
        email,
        password,
        role: "Mechanic",
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-b from-white via-gray-50 to-white"
      }`}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Team Management
            </span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Create Team Account
          </h1>
          
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Select staff members and create team accounts for your garage
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <StatCard
              icon={Shield}
              label="Admin"
              value={adminEmail}
              isDark={isDark}
            />
            <StatCard
              icon={Users}
              label="Used Slots"
              value={`${used} / ${limit}`}
              isDark={isDark}
            />
            <StatCard
              icon={TrendingUp}
              label="Available"
              value={remainingSlots}
              isDark={isDark}
              highlight={remainingSlots > 0}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------- LEFT : STAFF LIST ---------------- */}
        <div
          className={`rounded-3xl p-6 border-2 h-[750px] flex flex-col transition-all duration-300 ${
            isDark 
              ? "bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50" 
              : "bg-white border-gray-200 hover:border-blue-500/50 shadow-xl"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
              <Users className="text-blue-500" size={24} />
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Staff Members
            </h3>
          </div>

          <div className="relative mb-4">
            <Search 
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"}`} 
              size={18} 
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name or email..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${
                isDark 
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              }`}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredStaff.map((staff) => {
              const registered = registeredEmails.has(staff.email);

              return (
                <div
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-300 transform ${
                    registered
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:scale-[1.02] hover:shadow-lg"
                  } ${
                    isDark 
                      ? `bg-gray-700/50 border-gray-600 ${!registered && "hover:border-blue-500 hover:bg-gray-700"}` 
                      : `bg-gray-50 border-gray-200 ${!registered && "hover:border-blue-500 hover:bg-blue-50/50"}`
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {staff.name}
                        </p>
                        {!registered && (
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {staff.email || "No email"}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                            staff.role === "Manager"
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : staff.role === "Mechanic"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                          }`}
                        >
                          <Crown size={12} />
                          {staff.role || "No Role"}
                        </span>
                      </div>
                    </div>

                    {registered && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle size={12} />
                        Registered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  No staff found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT : REGISTER FORM ---------------- */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-3xl p-8 border-2 transition-all duration-300 ${
              isDark 
                ? "bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50" 
                : "bg-white border-gray-200 hover:border-blue-500/50 shadow-xl"
            }`}
          >
            <div className="text-center mb-8">
              <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-transform duration-300">
                <UserPlus size={40} />
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Create Team Account
              </h2>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Fill in the details below to create a new team member account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-shake">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span className="font-medium">Account created successfully! Redirecting...</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <Input 
                icon={Users} 
                value={username} 
                onChange={setUsername} 
                placeholder="Enter username" 
                isDark={isDark}
                label="Username"
              />
              <Input 
                icon={Mail} 
                value={email} 
                onChange={setEmail} 
                placeholder="Enter email address" 
                isDark={isDark}
                label="Email Address"
              />
              <Input 
                icon={Lock} 
                type="password" 
                value={password} 
                onChange={setPassword} 
                placeholder="Enter secure password" 
                isDark={isDark}
                label="Password"
              />

              <button
                onClick={handleCreate}
                disabled={loading || remainingSlots <= 0}
                className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  remainingSlots <= 0
                    ? "bg-gray-500"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-500/25"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : remainingSlots <= 0 ? (
                  <span>No Slots Available</span>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Team Account</span>
                  </>
                )}
              </button>

              {remainingSlots <= 0 && (
                <p className="text-center text-sm text-red-500 animate-pulse">
                  You've reached your team member limit. Please upgrade your plan.
                </p>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: Shield, label: "Secure", desc: "Encrypted data" },
              { icon: Sparkles, label: "Instant", desc: "Quick setup" },
              { icon: CheckCircle, label: "Reliable", desc: "24/7 support" },
            ].map((item, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? "bg-gray-800/30" : "bg-gray-50"
                }`}
              >
                <div className={`inline-flex p-2 rounded-xl mb-2 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <item.icon className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`text-xs font-semibold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.label}
                </p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? "#374151" : "#f3f4f6"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? "#4b5563" : "#d1d5db"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#6b7280" : "#9ca3af"};
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

/* ---------------- STAT CARD COMPONENT ---------------- */
function StatCard({ icon: Icon, label, value, isDark, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
        highlight
          ? isDark
            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50"
            : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
          : isDark
          ? "bg-gray-800/50 border-gray-700/50"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {label}
          </p>
          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- INPUT COMPONENT ---------------- */
function Input({ icon: Icon, value, onChange, placeholder, type = "text", isDark, label }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <Icon 
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isFocused ? "text-blue-500" : isDark ? "text-gray-400" : "text-gray-500"
          }`} 
          size={18} 
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${
            isFocused
              ? "ring-2 ring-blue-500/20 border-blue-500"
              : isDark
              ? "border-gray-600 bg-gray-700/50 text-white placeholder-gray-400"
              : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500"
          } ${isDark ? "hover:border-gray-500" : "hover:border-gray-300"}`}
        />
      </div>
    </div>
  );
}