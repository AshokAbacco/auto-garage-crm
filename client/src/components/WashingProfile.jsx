import React, { useState, useEffect } from "react";
import { Camera, Save, Mail, User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
    const [user, setUser] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [focusedInput, setFocusedInput] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { isDark } = useTheme();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        newPassword: "",
        phone: "",
        companyName: "",
    });

    const navigate = useNavigate();

    // Update theme when isDark changes


    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(storedUser);

        setFormData({
            username: storedUser?.username || "",
            email: storedUser?.email || "",
            password: "",
            newPassword: "",
            phone: storedUser?.phone || "",
            companyName: storedUser?.companyName || "",
        });
    }, []);

    useEffect(() => {
        if (user?.profileImage) {
            if (user.profileImage.startsWith("data:image")) {
                setImagePreview(user.profileImage);
            } else {
                setImagePreview(`data:image/png;base64,${user.profileImage}`);
            }
        }
    }, [user]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            setImagePreview(base64Image);
            uploadImage(base64Image);
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = async (base64Image) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/api/user/upload-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ image: base64Image }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                setUser(data.user);
                window.dispatchEvent(new Event("user-updated"));
            }
        } catch (err) {
            console.error("Error uploading image:", err);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");

        // 1️⃣ Update username & email
        const updateProfile = await fetch(`${API_URL}/api/user/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.companyName,
            }),
        });

        const profileResponse = await updateProfile.json();

        if (!updateProfile.ok) {
            alert(profileResponse.message || "Failed to update profile");
            return;
        }

        // 2️⃣ Change password (optional)
        if (formData.password && formData.newPassword) {
            const changePass = await fetch(`${API_URL}/api/user/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: formData.password,
                    newPassword: formData.newPassword,
                }),
            });

            const passResponse = await changePass.json();

            if (!changePass.ok) {
                alert(passResponse.message || "Password update failed");
                return;
            }
        }

        // 3️⃣ Update local storage
        localStorage.setItem("user", JSON.stringify(profileResponse.user));
        setUser(profileResponse.user);

        // 4️⃣ Success message
        alert("Profile Updated Successfully!");

        // 5️⃣ Navigate to dashboard
        navigate("/wash-dashboard");
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? Your account will be permanently deleted!")) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/api/auth/delete`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                alert("Your account has been deleted.");

                // Clear local storage
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Redirect to login
                navigate("/");
            } else {
                alert(data.message || "Failed to delete your account");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting account.");
        }
    };

    return (
        <div className={`min-h-screen pt-20 pb-10 relative overflow-hidden transition-all duration-700 ${isDark ? 'dark' : ''}`}>

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${isDark ? 'bg-indigo-600' : 'bg-indigo-400'
                    }`} style={{ animationDuration: '8s' }}></div>
                <div className={`absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${isDark ? 'bg-purple-600' : 'bg-purple-400'
                    }`} style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-pink-600' : 'bg-pink-400'
                    }`} style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

                {/* Floating Particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-indigo-500'}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5,
                            animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}

                {/* Grid Pattern */}
                <div className={`absolute inset-0 ${isDark ? 'opacity-10' : 'opacity-5'}`}
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.15)'} 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>
            </div>

            {/* Mouse Follow Gradient */}
            <div
                className="fixed inset-0 z-0 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            ${isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'}, 
            transparent 50%)`
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl px-4 mx-auto sm:px-6">
                <div className={`rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all duration-500 ${isDark
                    ? 'bg-gray-900/80 border-gray-700'
                    : 'bg-white/90 border-gray-200'
                    }`}>

                    {/* Decorative Top Element */}
                    <div className="absolute -translate-x-1/2 -top-8 left-1/2">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-60 animate-pulse"></div>
                            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border-4 shadow-2xl ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                                }`}>
                                <User className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 mt-12 space-y-8 sm:p-10">

                        {/* Header */}
                        <div className="space-y-2 text-center">
                            <h1 className={`text-[30px] font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                Profile Settings
                            </h1>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Manage your account information and preferences
                            </p>
                        </div>

                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <label className="relative cursor-pointer group">
                                <div className="absolute transition-all rounded-full opacity-50 -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl group-hover:opacity-75"></div>

                                <img
                                    src={imagePreview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    alt="Profile"
                                    className="relative object-cover w-32 h-32 transition-transform border-4 rounded-full shadow-2xl border-white/20 group-hover:scale-105"
                                />

                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />

                                <div className="absolute p-3 transition-all rounded-full shadow-xl bottom-2 right-2 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:scale-110">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </label>

                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Click to upload profile picture
                            </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">

                            {/* USERNAME */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Username
                                </label>

                                <div className="relative group">
                                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                    ${focusedInput === "username" ? "text-indigo-500" : isDark ? "text-gray-400" : "text-gray-600"}
                  `} />

                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedInput("username")}
                                        onBlur={() => setFocusedInput("")}
                                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300
                      ${focusedInput === "username"
                                                ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                                : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                            }
                      ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                    `}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Email Address
                                </label>

                                <div className="relative group">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                    ${focusedInput === "email" ? "text-indigo-500" : isDark ? "text-gray-400" : "text-gray-600"}
                  `} />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedInput("email")}
                                        onBlur={() => setFocusedInput("")}
                                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300
                      ${focusedInput === "email"
                                                ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                                : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                            }
                      ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                    `}
                                    />
                                </div>
                            </div>

                            {/* CURRENT PASSWORD */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Current Password
                                </label>

                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                    ${focusedInput === "password" ? "text-indigo-500" : isDark ? "text-gray-400" : "text-gray-600"}
                  `} />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter current password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedInput("password")}
                                        onBlur={() => setFocusedInput("")}
                                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300
                      ${focusedInput === "password"
                                                ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                                : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                            }
                      ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                    `}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                      ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}
                    `}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* NEW PASSWORD */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    New Password
                                </label>

                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                    ${focusedInput === "newPassword" ? "text-indigo-500" : isDark ? "text-gray-400" : "text-gray-600"}
                  `} />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedInput("newPassword")}
                                        onBlur={() => setFocusedInput("")}
                                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300
                      ${focusedInput === "newPassword"
                                                ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                                : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                            }
                      ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                    `}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                      ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}
                    `}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* PHONE */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedInput("phone")}
                                    onBlur={() => setFocusedInput("")}
                                    className={`w-full pl-4 pr-4 py-4 rounded-xl border-2 transition-all duration-300
                    ${focusedInput === "phone"
                                            ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                            : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                        }
                    ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                  `}
                                />
                            </div>

                            {/* COMPANY NAME */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedInput("companyName")}
                                    onBlur={() => setFocusedInput("")}
                                    className={`w-full pl-4 pr-4 py-4 rounded-xl border-2 transition-all duration-300
                    ${focusedInput === "companyName"
                                            ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.01]"
                                            : isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-300"
                                        }
                    ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}
                  `}
                                />
                            </div>

                            {/* SAVE BUTTON */}
                            <button
                                type="submit"
                                className="group relative w-full py-4 rounded-xl font-bold text-white shadow-2xl hover:scale-[1.02] mt-8 overflow-hidden"
                            >
                                <div className="absolute inset-0 transition-transform bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:scale-110"></div>
                                <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 blur-xl group-hover:opacity-100"></div>

                                <div className="relative flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className={`p-4 rounded-xl border-2 ${isDark
                            ? 'bg-indigo-900/20 border-indigo-700/50'
                            : 'bg-indigo-50 border-indigo-200'
                            }`}>
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Security Tip
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                        Use a strong password with at least 8 characters, including numbers and special characters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Section */}
                <div className={`mt-10 p-4 rounded-xl border ${isDark
                    ? 'bg-red-900/20 border-red-700/50'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <h2 className={`font-bold text-lg mb-2 ${isDark ? "text-red-400" : "text-red-600"}`}>Delete Account</h2>
                    <p className={`text-sm mb-4 ${isDark ? "text-red-300" : "text-red-600"}`}>
                        Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                    </p>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full py-3 font-semibold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
        </div>
    );
}