import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiFileText,
  FiClock,
  FiCreditCard,
  FiAlertTriangle,
  FiMinusCircle,
  FiUser,
  FiLock,
  FiInfo,
  FiAlertCircle,
  FiRefreshCw,
  FiMail,
  FiGlobe,
  FiPhone,
  FiCheckCircle,
  FiCpu,
  FiArrowRight,
  FiX,
} from "react-icons/fi"; // Switched to Feather icons for OS consistency
import { useTheme } from "../contexts/ThemeContext";
import Footer from "../components/Footer";

const TermsAndConditions = () => {
  const { isDark } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const progress = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "acceptance", title: "Acceptance", icon: FiCheckCircle },
    { id: "service", title: "Service Hub", icon: FiFileText },
    { id: "trial", title: "Trial Logic", icon: FiClock },
    { id: "subscription", title: "Billing Node", icon: FiCreditCard },
    {
      id: "refund",
      title: "Refund Policy",
      icon: FiAlertTriangle,
      important: true,
    },
    { id: "cancellation", title: "Termination", icon: FiMinusCircle },
    { id: "contact", title: "Support Hub", icon: FiPhone },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 pb-24 ${isDark ? "bg-[#000814] text-white" : "bg-white text-black"}`}
    >
      {/* --- System Progress Protocol --- */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200/20 z-[60]">
        <div
          className="h-full bg-[#001F3F] dark:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(0,31,63,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- System Deployment Header --- */}
        <div className="text-center mb-24">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-8 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}
          >
            {/* VISIBILITY FIX: Theme-aware badge text */}
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Operational Registry
            </span>
          </div>
          <h1
            className={`text-5xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Terms & <br />
            <span className="font-light italic lowercase">Conditions.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Operational guidelines for the MotorDesk ecosystem. Last updated:
            November 21, 2025.
          </p>
        </div>

        {/* --- Welcome Registry Window --- */}
        <div
          className={`relative mb-20 rounded-[2rem] border-2 overflow-hidden transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-[#F8FAFC] border-[#CBD5E1] shadow-xl"}`}
        >
          <div
            className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-white"}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <div className="p-10 flex items-start gap-8">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
            >
              <FiInfo size={32} />
            </div>
            <div>
              <h2
                className={`text-2xl font-black uppercase italic mb-4 ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                Infrastructure Welcome Protocol
              </h2>
              <p
                className={`text-lg leading-relaxed font-medium ${isDark ? "text-blue-100/70" : "text-slate-600"}`}
              >
                By initializing a session on TheMotorDesk platform, you
                authorize compliance with these operational protocols.
              </p>
            </div>
          </div>
        </div>

        {/* --- Protocol Sections Hub --- */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* Section 1: Acceptance */}
          <ProtocolWindow section={sections[0]} index={1} isDark={isDark}>
            <p className="mb-6 text-[13px] font-bold uppercase tracking-tight">
              Initialization requires confirmation of the following nodes:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Read/Understood Terms",
                "Binding Authorization",
                "Service Authority",
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex items-center gap-4 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}
                >
                  <FiCheckCircle className="text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </ProtocolWindow>

          {/* Section 3: Trial Node */}
          <ProtocolWindow section={sections[2]} index={3} isDark={isDark}>
            <div
              className={`p-8 rounded-2xl border-2 mb-6 ${isDark ? "bg-[#001F3F]/50 border-white/10" : "bg-amber-50 border-amber-200"}`}
            >
              <h3 className="text-2xl font-black uppercase italic text-amber-500 mb-2">
                7-Day Free Trial Hub
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Zero-commitment infrastructure evaluation.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Full Access Enabled",
                "Zero Liability Cancellation",
                "Auto-Transition to Paid Tier",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-400"
                >
                  <FiCpu className="text-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </ProtocolWindow>

          {/* Section 5: Refund Protocol (IMPORTANT) */}
          <ProtocolWindow section={sections[4]} index={5} isDark={isDark}>
            <div
              className={`p-10 rounded-2xl border-2 mb-6 ${isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <FiAlertTriangle className="text-red-500" size={24} />
                <h3 className="text-2xl font-black uppercase text-red-500">
                  No Refunds Post-Trial
                </h3>
              </div>
              <p className="text-[11px] font-bold text-red-500/70 uppercase tracking-widest leading-relaxed">
                Terminal Cancellation must be processed prior to the conclusion
                of the 7-day trial cycle to avoid automated billing.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Non-Refundable Payments",
                "No Partial Credit",
                "48-Hour Error Dispute Window",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                >
                  <FiX className="text-red-500" /> {item}
                </div>
              ))}
            </div>
          </ProtocolWindow>

          {/* Section 12: Support Node */}
          <ProtocolWindow section={sections[6]} index={12} isDark={isDark}>
            <div className="grid md:grid-cols-2 gap-8">
              <ContactNode
                icon={<FiMail />}
                label="Transmission Email"
                val="support@themotordesk.com"
                isDark={isDark}
              />
              <ContactNode
                icon={<FiGlobe />}
                label="Global Node"
                val="themotordesk.com"
                isDark={isDark}
              />
            </div>
          </ProtocolWindow>
        </div>

        {/* --- Final Acknowledgement Node --- */}
        <div
          className={`mt-24 p-12 rounded-[3rem] text-center border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-[#001F3F] text-white shadow-2xl"}`}
        >
          <FiShield className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 italic text-white">
            Registry Acknowledgement
          </h2>
          <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-10 max-w-xl mx-auto">
            Initialization of MotorDesk services constitutes binding agreement
            to these infrastructure terms.
          </p>
          <button className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10">
            Acknowledge Registry
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Atomic OS Components ---

const ProtocolWindow = ({ section, children, index, isDark }) => (
  <div
    className={`relative group p-1 rounded-[2.5rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1] shadow-sm"}`}
  >
    <div
      className={`px-6 py-3 border-b flex justify-between items-center ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
    >
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
      </div>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
        PROTOCOL_NODE.0{index}
      </span>
    </div>
    <div className="p-10">
      <div className="flex items-center gap-5 mb-10">
        <div
          className={`p-4 rounded-xl shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
        >
          <section.icon size={24} />
        </div>
        <h3
          className={`text-2xl font-black uppercase tracking-tighter italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
        >
          {section.title}
        </h3>
      </div>
      {children}
    </div>
  </div>
);

const ContactNode = ({ icon, label, val, isDark }) => (
  <div
    className={`p-6 rounded-2xl border-2 transition-all ${isDark ? "bg-white/5 border-white/10" : "bg-[#F8FAFC] border-slate-200"}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-3 rounded-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p
          className={`text-sm font-black uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
        >
          {val}
        </p>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
