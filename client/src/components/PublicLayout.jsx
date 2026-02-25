import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "./Footer.jsx";
import { FiArrowUp, FiActivity } from "react-icons/fi";

export default function PublicLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 selection:bg-blue-500/30${
        isDark ? "bg-[#000814] text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* --- Navigation Infrastructure --- */}
      <PublicNavbar />

      {/* --- Main Node Content --- */}
      <main className="relative animate-in fade-in duration-700 pt-[5%]">
        {/* Outlet for dynamic routing */}
        <Outlet />
        {/* Support for direct children injection if used */}
        {children}
      </main>

      {/* --- System Footer --- */}
      <Footer />

      {/* --- Scroll to Top: Precision Node --- */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-300 group hover:-translate-y-2 active:scale-90 border ${
          isDark
            ? "bg-[#001F3F] text-white border-white/10 shadow-blue-900/40 hover:bg-blue-600"
            : "bg-white text-[#001F3F] border-slate-200 shadow-slate-200 hover:border-[#001F3F]"
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <FiArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span
            className={`text-[9px] font-black uppercase tracking-widest hidden md:block ${
              isDark ? "text-blue-300/50" : "text-slate-400"
            }`}
          >
            Top
          </span>
        </div>
      </button>

      {/* --- Global System Status Indicator (Subtle) --- */}
      <div className="fixed bottom-8 left-8 hidden lg:flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
        <div className="p-1.5 bg-[#001F3F] rounded-lg">
          <FiActivity size={12} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-[9px] font-black uppercase tracking-[0.3em] ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            MotorDesk.System
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
              Node Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
