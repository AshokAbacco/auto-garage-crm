import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiSun,
  FiMoon,
  FiHome,
  FiLogIn,
  FiTruck,
  FiBox,
  FiTool,
  FiChevronDown,
  FiMenu,
  FiX,
  FiActivity,
} from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1185);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1185);
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: <FiHome /> },
    { path: "/car-garage", label: "Car Node", icon: <FiTruck /> },
    { path: "/bike-garage", label: "Bike Node", icon: <FiActivity /> },
    { path: "/washing-center", label: "Wash Node", icon: <FiBox /> },
    { path: "/pricing", label: "Pricing", icon: <FiTool /> },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50">
      {/* ---------- Primary Identity Tier ---------- 
          Android Optimization: Added 'pt-10' for safe-area status bar spacing 
      */}
      <div
        className={`w-full pt-10 pb-4 transition-all duration-500 border-b ${
          isDark
            ? "bg-[#000814] border-white/5"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-4 group">
            <div
              className={`p-1.5 rounded-xl transition-all ${isDark ? "bg-[#001F3F]" : "bg-slate-50"}`}
            >
              <img
                src={isDark ? "/Logos/darkL.png" : "/Logos/logo3.png"}
                alt="Motor Desk Logo"
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              {/* BRAND COLOR FIX: #001F3F applied in Light Mode */}
              <span
                className={`text-xl font-black tracking-tighter uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                Motor<span className="font-light italic">Desk.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                Operating System
              </span>
            </div>
          </Link>

          {/* System Utilities */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? "bg-white/5 text-white hover:bg-white/10"
                  : "bg-slate-50 text-[#001F3F] hover:bg-slate-100 border border-[#CBD5E1]"
              }`}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {!isMobile && (
              <div className="flex items-center gap-3">
                <Link
                  to="/contactus"
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-[#001F3F] hover:opacity-70"
                  }`}
                >
                  Support Hub
                </Link>
                <button
                  onClick={() => navigate("/login")}
                  className={`bg-[#001F3F] text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg hover:bg-black border border-white/10 transition-all flex items-center gap-2`}
                >
                  Sign In <FiLogIn />
                </button>
              </div>
            )}

            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={isDark ? "text-white" : "text-[#001F3F]"}
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Command Tier (Desktop Only) ---------- */}
      {!isMobile && (
        <nav
          className={`w-full transition-all duration-500 border-b ${
            isDark
              ? "bg-[#001F3F]/60 backdrop-blur-md border-white/5"
              : "bg-white/90 backdrop-blur-md border-[#CBD5E1] shadow-sm"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-10 py-2.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-1 px-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${
                    isActive
                      ? isDark
                        ? "text-white"
                        : "text-[#001F3F]"
                      : "text-slate-400 hover:text-[#001F3F]"
                  }`}
                >
                  <span className="opacity-40 group-hover:opacity-100">
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <div className="absolute -bottom-[11px] left-0 w-full h-[3px] bg-[#001F3F] dark:bg-white" />
                  )}
                </Link>
              );
            })}

            {/* Clickable Spare Hub Node */}
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${
                  dropdownOpen
                    ? "text-[#001F3F] dark:text-white"
                    : isDark
                      ? "text-slate-400"
                      : "text-[#001F3F]"
                }`}
              >
                Spare Hub{" "}
                <FiChevronDown
                  className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute right-0 mt-4 w-52 rounded-xl border p-2 shadow-2xl animate-in fade-in zoom-in duration-200 ${
                    isDark
                      ? "bg-[#000814] border-white/10"
                      : "bg-white border-[#CBD5E1]"
                  }`}
                >
                  <Link
                    to="/spare-parts/car"
                    onClick={() => setDropdownOpen(false)}
                    className={`block px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      isDark
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-[#001F3F] hover:bg-slate-50"
                    }`}
                  >
                    Car Components
                  </Link>
                  <Link
                    to="/spare-parts/bike"
                    onClick={() => setDropdownOpen(false)}
                    className={`block px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      isDark
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-[#001F3F] hover:bg-slate-50"
                    }`}
                  >
                    Bike Components
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* ---------- Mobile Deployment ---------- */}
      {isMobile && mobileMenuOpen && (
        <div
          className={`w-full h-screen fixed inset-0 z-40 p-6 pt-32 overflow-y-auto animate-in slide-in-from-right duration-300 ${
            isDark ? "bg-[#000814]" : "bg-white"
          }`}
        >
          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-5 p-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] ${
                  isDark
                    ? "bg-white/5 text-white border border-white/5"
                    : "bg-slate-50 text-[#001F3F] border border-[#CBD5E1]"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {/* --- ADDED SPARE HUB LINKS FOR MOBILE --- */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="px-5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                Spare Hub
              </span>
              <Link
                to="/spare-parts/car"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-5 p-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] ${
                  isDark
                    ? "bg-white/5 text-white"
                    : "bg-slate-50 text-[#001F3F]"
                }`}
              >
                <FiTruck /> Car Components
              </Link>
              <Link
                to="/spare-parts/bike"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-5 p-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] ${
                  isDark
                    ? "bg-white/5 text-white"
                    : "bg-slate-50 text-[#001F3F]"
                }`}
              >
                <FiActivity /> Bike Components
              </Link>
            </div>
            {/* --------------------------------------- */}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="w-full bg-[#001F3F] text-white p-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] mt-6 border border-white/10 shadow-xl"
            >
              Initialize System
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
