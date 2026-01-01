import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./utils/axiosInstance";
import { Users, Mail, Lock, UserPlus, Sun, Moon, Bike, CheckCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function TeamRegister() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [adminEmail, setAdminEmail] = useState("");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get("/api/user/team/info");
        setAdminEmail(res.data.adminEmail);
        setUsed(res.data.used);
        setLimit(res.data.limit);
      } catch (err) {
        setError(err.response?.data?.message || "Team access not allowed");
      }
    };
    fetchInfo();
  }, []);

  const handleCreate = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/user/team/create", { username, email, password });
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team account");
    } finally {
      setLoading(false);
    }
  };

  const remainingSlots = limit - used;
  const usagePercentage = (used / limit) * 100;
  
  const getProgressColor = () => {
    if (usagePercentage >= 90) return "bg-red-500";
    if (usagePercentage >= 70) return "bg-yellow-500";
    return "bg-[#023067]";
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Registration Successful!
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Redirecting to login page...
              </p>
              <div className="mt-4">
                <div className="w-8 h-8 border-4 border-[#023067] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
        
      

        <div className={`w-full max-w-md rounded-3xl shadow-2xl p-8 transition-all duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
          
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${isDark ? "bg-gradient-to-br from-[#023067] to-[#034a9f]" : "bg-gradient-to-br from-[#023067] to-[#045aa8]"}`}>
              <UserPlus className="text-white" size={40} />
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Create Team Account</h2>
            <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>Add a new team member to your plan</p>
            <div
              className={`flex items-center justify-center gap-2 mt-2 ${
                isDark ? "text-gray-300" : "text-[#023067]"
              }`}
            >
              <Bike size={20} />
              <span className="font-semibold">Bike CRM</span>
            </div>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${isDark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Team Info Card with Progress Bar */}
          <div className={`mb-6 p-5 rounded-xl transition-all duration-300 ${isDark ? "bg-gray-750 border border-gray-600" : "bg-gray-50 border border-gray-200"}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Admin Account</span>
                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{adminEmail}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Team Usage</span>
                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{used} / {limit}</span>
                </div>
                
                {/* Progress Bar */}
               {/* Progress Bar */}
                <div
                  className={`w-full h-2.5 rounded-full overflow-hidden transition-colors duration-300 ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDark
                        ? usagePercentage >= 90
                          ? "bg-red-400"
                          : usagePercentage >= 70
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                        : usagePercentage >= 90
                        ? "bg-red-500"
                        : usagePercentage >= 70
                        ? "bg-yellow-500"
                        : "bg-[#023067]"
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>

                
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  {remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Users className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-[#023067]`} size={20} />
              <input type="text" placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-[#023067]" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#023067] focus:bg-blue-50/30"} hover:border-[#023067] focus:shadow-lg focus:shadow-[#023067]/20`} />
            </div>

            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-[#023067]`} size={20} />
              <input type="email" placeholder="Team Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-[#023067]" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#023067] focus:bg-blue-50/30"} hover:border-[#023067] focus:shadow-lg focus:shadow-[#023067]/20`} />
            </div>

            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-[#023067]`} size={20} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-[#023067]" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#023067] focus:bg-blue-50/30"} hover:border-[#023067] focus:shadow-lg focus:shadow-[#023067]/20`} />
            </div>

            <button onClick={handleCreate} disabled={loading || remainingSlots <= 0}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${loading || remainingSlots <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#023067] to-[#045aa8] hover:from-[#034a9f] hover:to-[#0670c9] hover:shadow-xl hover:shadow-[#023067]/30 hover:scale-[1.02] active:scale-[0.98]"}`}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : remainingSlots <= 0 ? "No Slots Available" : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus size={20} />
                  <span>Create Team Account</span>
                </div>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Already created?{" "}
              <button onClick={() => navigate("/team-login")} className="text-[#023067] hover:text-[#045aa8] font-semibold hover:underline transition-colors duration-200">
                Go to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}