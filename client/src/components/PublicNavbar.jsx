// src/components/PublicNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Sun, Moon, Sparkles, Home, LogIn, Car, Phone,
    Building2, Wrench, Store, ChevronDown, IndianRupee, Menu, X,Bike
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function PublicNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1185);
    const dropdownTimeout = useRef(null);
    const dropdownRef = useRef(null);

    // Detect screen width < 1185px for mobile/tablet mode
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1185);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dropdown hover for desktop
    const handleMouseEnter = () => {
        clearTimeout(dropdownTimeout.current);
        setDropdownOpen(true);
    };
    const handleMouseLeave = () => {
        dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 2000);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearTimeout(dropdownTimeout.current);
        };
    }, []);

    const navItems = [
        { path: "/", label: "Home", icon: Home },
        { path: "/car-garage", label: "Car Garage", icon: Car },
        { path: "/bike-garage", label: "Bike Garage", icon: Bike },
        { path: "/washing-center", label: "Washing Center CRM", icon: Building2 },
        { path: "/pricing", label: "Pricing", icon: IndianRupee },
    ];

    return (
        <header className="w-full fixed top-0 left-0 z-50">
            {/* ---------- Top Section ---------- */}
            <div
                className={`w-full py-3 transition-all duration-300 ${isDark ? "bg-gray-950" : "bg-white shadow-md"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                   <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl  flex items-center justify-center   group-hover:shadow-indigo-500/60 transition-all overflow-hidden">
                            <img
                                src="Logos/logo3.png"
                                alt="Motor Desk Logo"
                                className="w-full h-full object-cover"
                            />
                            </div>

                         </div>

                        <div className="flex flex-col">
                            <span
                            className={`text-xl sm:text-2xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                            }`}
                            >
                            Motor <span className="text-indigo-500">Desk</span>
                            </span>

                            <span
                            className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                            >
                            Garage Management
                            </span>
                        </div>
                    </Link>


                    {/* Right Side Section */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle (always visible, before hamburger / sign in) */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-lg transition-all ${isDark
                                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Desktop buttons */}
                        {!isMobile && (
                            <>
                                <Link
                                    to="/contactus"
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isDark
                                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Phone size={18} />
                                    <span>Contact Us</span>
                                </Link>

                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <LogIn size={18} />
                                    <span>Get Started</span>
                                </button>
                            </>
                        )}

                        {/* Hamburger for mobile/tablet */}
                        {isMobile && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`p-2 rounded-lg ${isDark ? "text-white" : "text-gray-800"}`}
                            >
                                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Bottom Nav (Desktop Only) ---------- */}
            {!isMobile && (
                <div
                    className={`sticky top-0 w-full transition-all duration-300 ${isDark ? "bg-gray-900/95 backdrop-blur-lg" : "bg-white/90 backdrop-blur-lg shadow-md"
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between space-x-5 py-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive
                                            ? isDark
                                                ? "bg-gray-800 text-white"
                                                : "bg-gray-900 text-white"
                                            : isDark
                                                ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Spare Parts Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            ref={dropdownRef}
                        >
                            <button
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isDark
                                        ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                            >
                                <Store size={18} />
                                <span>Spare Parts Shops</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {dropdownOpen && (
                                <div
                                    className={`absolute left-0 mt-2 w-56 rounded-xl border shadow-lg z-50 ${isDark
                                            ? "bg-gray-900 border-gray-700"
                                            : "bg-white border-gray-200"
                                        }`}
                                >
                                    <Link
                                        to="/spare-parts/bike"
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${isDark
                                                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Bike size={18} />
                                        <span>Bike Spare Parts</span>
                                    </Link>
                                    <Link
                                        to="/spare-parts/car"
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${isDark
                                                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Car size={18} />
                                        <span>Car Spare Parts</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Mobile Menu ---------- */}
            {isMobile && mobileMenuOpen && (
                <div
                    className={`w-full transition-all ${isDark ? "bg-gray-900" : "bg-white shadow-md"}`}
                >
                    <div className="flex flex-col space-y-2 px-6 py-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                            ? isDark
                                                ? "bg-gray-800 text-white"
                                                : "bg-gray-900 text-white"
                                            : isDark
                                                ? "text-gray-300 hover:bg-gray-800"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {/* Spare Parts Dropdown */}
                        <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isDark
                                    ? "text-gray-300 hover:bg-gray-800"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Store size={18} />
                                <span>Spare Parts Shops</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {mobileDropdownOpen && (
                            <div className="pl-8 flex flex-col space-y-2">
                                <Link
                                    to="/spare-parts/bike"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDark
                                            ? "text-gray-300 hover:bg-gray-800"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Wrench size={16} />
                                    Bike Spare Parts
                                </Link>
                                <Link
                                    to="/spare-parts/car"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDark
                                            ? "text-gray-300 hover:bg-gray-800"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Car size={16} />
                                    Car Spare Parts
                                </Link>
                            </div>
                        )}

                        <hr className={`${isDark ? "border-gray-700" : "border-gray-200"} my-2`} />

                        <Link
                            to="/contactus"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${isDark
                                    ? "text-gray-300 hover:bg-gray-800"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <Phone size={18} />
                            Contact Us
                        </Link>

                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                navigate("/login");
                            }}
                            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <LogIn size={18} />
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
