import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { FiActivity, FiShield, FiCpu, FiGlobe } from "react-icons/fi";

const Footer = () => {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative overflow-hidden border-t transition-colors duration-500 ${
        isDark
          ? "bg-[#000814] text-white border-white/5"
          : "bg-white text-slate-900 border-slate-100 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* --- Primary Brand Node --- */}
        <div className="flex flex-col items-center mb-12">
          <div
            className={`p-2 rounded-2xl mb-4 transition-all ${isDark ? "bg-[#001F3F]" : "bg-slate-50"}`}
          >
            <img
              src={isDark ? "/Logos/darkL.png" : "/Logos/logo3.png"}
              alt="Motor Desk Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="text-center">
            <span
              className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Motor Desk
              <span className="text-blue-500 italic font-light"></span>
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <FiActivity size={10} className="text-blue-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500">
                Abacco Technology Ecosystem
              </span>
            </div>
          </div>
        </div>

        {/* --- Governance & Compliance Hub --- */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}
        >
          {/* Legal Node */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Governance
            </h4>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <Link
                to="/term&conditions"
                className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/referencet&c"
                className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
              >
                Reference Bounce T&C
              </Link>
            </div>
          </div>

          {/* System Status Node */}
          <div className="flex flex-col items-center space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              System Status
            </h4>
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Global Nodes Online
              </span>
            </div>
          </div>

          {/* Corporate Node */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Infrastructure
            </h4>
            <div className="text-center md:text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Precision Engineered by
              </p>
              <p
                className={`text-[11px] font-black uppercase tracking-widest mt-1 ${isDark ? "text-white" : "text-black"}`}
              >
                Abacco Technology
              </p>
            </div>
          </div>
        </div>

        {/* --- Bottom Ledger --- */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
            © {currentYear} MotorDesk Infrastructure. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FiCpu size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                v1.0-LTS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiGlobe size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Global Node
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Gradient Glow for Dark Mode */}
      {isDark && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-900/10 blur-[120px] pointer-events-none" />
      )}
    </footer>
  );
};

export default Footer;
