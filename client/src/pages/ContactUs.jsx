import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiActivity,
  FiShield,
  FiX,
} from "react-icons/fi";

export default function ContactUs() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 pb-24 ${
        isDark ? "bg-[#000814] text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* --- System Deployment Header --- */}
        <div className="text-center mb-24">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-8 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Operational Protocols
            </span>
          </div>
          {/* Primary Heading with Navy Blue in Light Mode */}
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${
              isDark ? "text-white" : "text-[#001F3F]"
            }`}
          >
            Initialize <br />
            <span className="font-light italic lowercase">Contact.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Have a technical query or a partnership inquiry? Our support nodes
            are active 24/7 to assist with your infrastructure.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* --- Registry Node (Browser Style) --- */}
          <div
            className={`relative group rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
              isDark
                ? "bg-[#001F3F] border-white/5 shadow-2xl"
                : "bg-white border-[#CBD5E1]"
            }`}
          >
            {/* Browser Control Bar */}
            <div
              className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>

            <div className="p-10">
              <div className="flex items-center gap-4 mb-10">
                <FiShield className="text-[#001F3F]" size={20} />
                <h2
                  className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  Node Registry
                </h2>
              </div>

              <div className="space-y-10">
                <ContactNode
                  icon={<FiPhone />}
                  label="Operational Phone"
                  value="+91 7795692753"
                  isDark={isDark}
                />
                <ContactNode
                  icon={<FiMail />}
                  label="System Support"
                  value="support@themotordesk.com"
                  isDark={isDark}
                />
                <ContactNode
                  icon={<FiMapPin />}
                  label="Physical Infrastructure"
                  isDark={isDark}
                  value={
                    <>
                      No 12,13 & 12/A, Kirthan Arcade, 3rd Floor, Aditya Nagar,
                      Bangalore - 560097
                    </>
                  }
                />
              </div>

              <div
                className={`mt-12 h-64 rounded-3xl border-2 overflow-hidden relative group ${
                  isDark ? "border-white/10" : "border-[#CBD5E1]"
                }`}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15544.932465958704!2d77.5527066637976!3d13.08440708030314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae2387c5242ab3%3A0xb5933098d4ce3ad9!2sAbacco%20technology!5e0!3m2!1sen!2sin!4v1762863117438!5m2!1sen!2sin"
                  className="w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* --- Transmission Console (Browser Style) --- */}
          <div
            className={`relative group rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
              isDark
                ? "bg-[#001F3F] border-white/5 shadow-2xl"
                : "bg-white border-[#CBD5E1]"
            }`}
          >
            {/* Browser Control Bar */}
            <div
              className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>

            <div className="p-10">
              <div className="flex items-center gap-4 mb-10">
                <FiSend className="text-[#001F3F]" size={20} />
                <h2
                  className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  Transmit Message
                </h2>
              </div>

              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                    <FiActivity size={32} />
                  </div>
                  <h3
                    className={`text-2xl font-black uppercase italic mb-2 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    Transmission Successful.
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Our engineers will respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <InputField
                    label="Identity Name"
                    icon={<FiUser />}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    isDark={isDark}
                  />
                  <InputField
                    label="Return Email Address"
                    icon={<FiMail />}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    isDark={isDark}
                  />

                  <div className="space-y-3">
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                    >
                      <FiMessageSquare className="text-blue-500" /> Transmission
                      Details
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none resize-none transition-all text-[12px] font-bold ${
                        isDark
                          ? "bg-white/5 border-white/5 focus:border-[#001F3F] text-white"
                          : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
                      }`}
                      placeholder="Write your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-[#001F3F] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-black border border-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <FiActivity className="animate-spin" />
                    ) : (
                      "Execute Transmission"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Atomic UI Protocol Components ---
const ContactNode = ({ icon, label, value, isDark }) => (
  <div className="flex items-start gap-5 group">
    <div
      className={`p-4 rounded-2xl bg-[#001F3F] text-white shadow-lg group-hover:scale-110 transition-transform`}
    >
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </h4>
      <p
        className={`text-[13px] font-bold tracking-tight leading-relaxed ${isDark ? "text-white" : "text-[#001F3F]"}`}
      >
        {value}
      </p>
    </div>
  </div>
);

const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  isDark,
}) => (
  <div className="space-y-3">
    <label
      className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
    >
      {React.cloneElement(icon, { className: "text-blue-500" })} {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required
      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all text-[12px] font-bold ${
        isDark
          ? "bg-white/5 border-white/10 focus:border-[#001F3F] text-white"
          : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
      }`}
      placeholder={placeholder}
    />
  </div>
);
