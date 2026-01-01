import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Mail,
    Lock,
    UserPlus,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import api from "./utils/axiosInstance.js";

export default function TeamRegister() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [adminEmail, setAdminEmail] = useState("");
    const [used, setUsed] = useState(0);
    const [limit, setLimit] = useState(0);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    /* ==============================
       FETCH TEAM INFO
    ============================== */
    useEffect(() => {
        const fetchTeamInfo = async () => {
            try {
                const res = await api.get("/api/teams/info");
                setAdminEmail(res.data.admin.email);
                setUsed(res.data.team.used);
                setLimit(res.data.team.limit);
            } catch (err) {
                setError(err.response?.data?.message || "Access denied");
            }
        };

        fetchTeamInfo();
    }, []);

    /* ==============================
       CREATE TEAM MEMBER
    ============================== */
    const handleCreate = async () => {
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await api.post("/api/teams/create", {
                username,
                email,
                password,
            });

            setSuccess(true);

            setTimeout(() => {
                navigate("/admin/teams");
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create team member");
        } finally {
            setLoading(false);
        }
    };

    const remaining = limit - used;
    const usagePercent = limit ? Math.min((used / limit) * 100, 100) : 0;
    const isBasicPlan = limit === 1;

    /* ==============================
       UI
    ============================== */
    return (
        <>
            {/* SUCCESS MODAL */}
            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div
                        className={`p-8 rounded-2xl text-center ${isDark ? "bg-gray-800 text-white" : "bg-white"
                            }`}
                    >
                        <CheckCircle className="mx-auto text-green-500" size={48} />
                        <h3 className="mt-4 text-xl font-bold">
                            Team Member Created
                        </h3>
                        <p className="mt-2 text-sm opacity-70">Redirecting…</p>
                    </div>
                </div>
            )}

            <div
                className={`min-h-screen flex items-center justify-center px-4 ${isDark
                    ? "bg-gradient-to-br from-gray-900 to-gray-800"
                    : "bg-gradient-to-br from-blue-50 to-white"
                    }`}
            >
                <div
                    className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? "bg-gray-800" : "bg-white"
                        }`}
                >
                    {/* HEADER */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-[#023067] to-[#045aa8]">
                            <UserPlus className="text-white" size={36} />
                        </div>
                        <h2 className="mt-4 text-3xl font-bold">
                            Create Team Account
                        </h2>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* BASIC PLAN WARNING */}
                    {isBasicPlan && (
                        <div className="flex gap-3 p-4 mb-6 text-sm text-yellow-800 bg-yellow-100 rounded-xl">
                            <AlertTriangle size={18} />
                            <span>
                                Your current plan does not support team members.
                                Upgrade your plan to add users.
                            </span>
                        </div>
                    )}

                    {/* TEAM INFO */}
                    <div
                        className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"
                            }`}
                    >
                        <div className="flex justify-between mb-2 text-sm">
                            <span>Admin</span>
                            <span className="font-semibold">{adminEmail}</span>
                        </div>

                        <div className="flex justify-between mb-1 text-sm">
                            <span>Usage</span>
                            <span className="font-semibold">
                                {used} / {limit}
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden bg-gray-300 rounded-full">
                            <div
                                className="h-full bg-[#023067]"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>

                        <p className="mt-1 text-xs opacity-70">
                            {remaining > 0
                                ? `${remaining} slots remaining`
                                : "No slots remaining"}
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="space-y-4">
                        <Input
                            icon={<Users size={18} />}
                            placeholder="Username (optional)"
                            value={username}
                            onChange={setUsername}
                            isDark={isDark}
                        />
                        <Input
                            icon={<Mail size={18} />}
                            placeholder="Email"
                            value={email}
                            onChange={setEmail}
                            isDark={isDark}
                        />
                        <Input
                            icon={<Lock size={18} />}
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            isDark={isDark}
                        />

                        <button
                            disabled={loading || remaining <= 0 || isBasicPlan}
                            onClick={handleCreate}
                            className={`w-full py-4 rounded-xl text-white font-semibold transition ${loading || remaining <= 0 || isBasicPlan
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#023067] to-[#045aa8] hover:scale-[1.02]"
                                }`}
                        >
                            {loading ? "Creating..." : "Create Team Account"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ==============================
   INPUT COMPONENT
============================== */
function Input({ icon, placeholder, value, onChange, type = "text", isDark }) {
    return (
        <div className="relative">
            <div className="absolute -translate-y-1/2 opacity-50 left-4 top-1/2">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none ${isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-200"
                    } focus:border-[#023067]`}
            />
        </div>
    );
}
