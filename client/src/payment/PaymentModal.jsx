import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHash,
  FiShield,
  FiX,
  FiCheckCircle,
  FiActivity,
  FiCpu,
  FiLock,
  FiChevronRight,
} from "react-icons/fi";

const PaymentModal = ({
  show,
  plan,
  billingPeriod,
  isDark,
  planType,
  onClose,
  onComplete,
  userData,
  isUpgradePage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    referenceCode: "",
    gstNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.getElementById("razorpay-js")) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (showSuccess && paymentResponse) {
      const timer = setTimeout(() => {
        onComplete(plan, formData);
        const finalPriceCalc =
          billingPeriod === "yearly"
            ? Math.round(plan.numericPrice * 12 * 0.9)
            : plan.numericPrice;

        const stateData = {
          paymentData: {
            plan: { name: plan.name, numericPrice: plan.numericPrice },
            billingPeriod,
            finalPrice: finalPriceCalc,
            formData,
            paymentId: paymentResponse.paymentId,
            subscriptionId: paymentResponse.subscriptionId,
          },
        };

        const routes = {
          car: "/car-register",
          bike: "/bike-register",
          washing: "/washing-register",
        };
        navigate(routes[planType] || "/car-register", { state: stateData });
        setIsProcessing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    showSuccess,
    paymentResponse,
    plan,
    formData,
    billingPeriod,
    navigate,
    onComplete,
    planType,
  ]);

  useEffect(() => {
    if (isUpgradePage && userData) {
      const autoName =
        userData.name ||
        userData.fullName ||
        userData.username ||
        userData.ownerName ||
        userData.firstName + " " + (userData.lastName || "") ||
        "";
      setFormData({
        name: autoName.trim(),
        companyName: userData.companyName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        referenceCode: "",
        gstNumber: "",
      });
    }
  }, [isUpgradePage, userData]);

  if (!show || !plan) return null;

  const finalPrice =
    billingPeriod === "yearly"
      ? Math.round(plan.numericPrice * 12 * 0.9)
      : plan.numericPrice;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "ID Required";
    if (!formData.companyName.trim()) newErrors.companyName = "Entity Required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid Syntax";
    if (!formData.phone.match(/^[0-9]{10}$/))
      newErrors.phone = "Invalid Protocol";
    if (
      formData.gstNumber &&
      !formData.gstNumber.match(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      )
    ) {
      newErrors.gstNumber = "Invalid Format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!razorpayLoaded) return alert("System Syncing: Razorpay not ready.");
    const API =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "https://auto-garage-crm-zrxc.onrender.com";

    setIsProcessing(true);
    try {
      const subRes = await fetch(`${API}/api/payments/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: {
            name: plan.name.replace(" NODE", "").toLowerCase(),
            numericPrice: Number(plan.numericPrice),
          },
          billingPeriod: billingPeriod.toLowerCase(),
          customer: { ...formData },
        }),
      });
      const data = await subRes.json();
      const rzp = new window.Razorpay({
        key: data.razorpayKey,
        subscription_id: data.subscription.id,
        name: "Abacco Technology",
        description: `${plan.name} Node Activation`,
        theme: { color: "#001F3F" },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        handler: async (response) => {
          setPaymentResponse({
            paymentId: response.razorpay_payment_id,
            subscriptionId: response.razorpay_subscription_id,
          });
          setShowSuccess(true);
        },
      });
      rzp.open();
    } catch (e) {
      alert("Initialization Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className="absolute inset-0 bg-[#000814]/90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem] border transition-all duration-500 transform ${show ? "scale-100" : "scale-95"} ${
          isDark
            ? "bg-[#000814] border-white/10 shadow-2xl"
            : "bg-white border-[#CBD5E1] shadow-xl"
        }`}
      >
        {/* Header Protocol */}
        <div
          className={`px-8 py-6 border-b flex items-center justify-between ${isDark ? "border-white/5 bg-[#001F3F]/30" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#001F3F] rounded-xl text-white shadow-lg">
              <FiCpu size={20} />
            </div>
            <div>
              <h2
                className={`text-[11px] font-black uppercase tracking-[0.3em] leading-none mb-1 ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                Order Protocol
              </h2>
              <p
                className={`text-lg font-black uppercase tracking-tight italic leading-none ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                {plan.name} Activation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500 hover:text-white rounded-xl transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
            <FiCheckCircle size={80} className="text-green-500 mb-6" />
            <h3
              className={`text-3xl font-black uppercase italic mb-2 ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Transmission Successful
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Activating Operational Node...
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 grid lg:grid-cols-5 gap-10">
            {/* Identity Form (Left) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <FiUser className="text-[#001F3F]" />
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                >
                  Identity Registry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProtocolInput
                  label="Full Identity Name"
                  icon={<FiUser />}
                  value={formData.name}
                  error={errors.name}
                  readOnly={isUpgradePage}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  isDark={isDark}
                />
                <ProtocolInput
                  label="Operational Entity"
                  icon={<FiBriefcase />}
                  value={formData.companyName}
                  error={errors.companyName}
                  readOnly={isUpgradePage}
                  onChange={(v) => setFormData({ ...formData, companyName: v })}
                  isDark={isDark}
                />
                <ProtocolInput
                  label="Transmission Email"
                  icon={<FiMail />}
                  value={formData.email}
                  error={errors.email}
                  readOnly={isUpgradePage}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                  isDark={isDark}
                />
                <ProtocolInput
                  label="Contact Protocol"
                  icon={<FiPhone />}
                  value={formData.phone}
                  error={errors.phone}
                  readOnly={isUpgradePage}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  isDark={isDark}
                />
                <div className="md:col-span-2">
                  <ProtocolInput
                    label="Physical Infrastructure Address"
                    icon={<FiMapPin />}
                    value={formData.address}
                    readOnly={isUpgradePage}
                    onChange={(v) => setFormData({ ...formData, address: v })}
                    isDark={isDark}
                  />
                </div>
                <ProtocolInput
                  label="GST Identification"
                  icon={<FiHash />}
                  value={formData.gstNumber}
                  error={errors.gstNumber}
                  readOnly={isUpgradePage}
                  optional
                  onChange={(v) => setFormData({ ...formData, gstNumber: v })}
                  isDark={isDark}
                />
                <ProtocolInput
                  label="Reference Code"
                  icon={<FiActivity />}
                  value={formData.referenceCode}
                  optional
                  onChange={(v) =>
                    setFormData({ ...formData, referenceCode: v })
                  }
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Summary Node (Right) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <FiShield className="text-[#001F3F]" />
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                >
                  Financial Summary
                </span>
              </div>

              <div
                className={`p-6 rounded-3xl border-2 ${isDark ? "bg-white/5 border-white/5" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
              >
                <div className="space-y-4 mb-6">
                  <SummaryLine
                    label="Selected Node"
                    value={plan.name}
                    isDark={isDark}
                  />
                  <SummaryLine
                    label="Cycle"
                    value={billingPeriod}
                    highlight
                    isDark={isDark}
                  />
                  {billingPeriod === "yearly" && (
                    <SummaryLine
                      label="Efficiency Discount"
                      value="-10%"
                      success
                      isDark={isDark}
                    />
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Total Transmission Value
                  </p>
                  <div
                    className={`text-5xl font-black tracking-tighter mb-1 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    ₹{finalPrice}
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                    {billingPeriod === "yearly"
                      ? "Billed Annually"
                      : "Billed Monthly"}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl flex items-center gap-4 border-2 ${isDark ? "bg-[#001F3F]/20 border-white/5" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
              >
                <FiLock className="text-[#001F3F]" />
                <p
                  className={`text-[9px] font-black uppercase leading-relaxed tracking-tight ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                >
                  Encrypted Transmission via{" "}
                  <span className="text-blue-600">Razorpay Hub</span>. <br />
                  256-bit SSL Secure Protocol active.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-[#001F3F] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-black border border-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <FiActivity className="animate-spin" />
                ) : (
                  <>
                    <FiLock /> Execute Payment <FiChevronRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProtocolInput = ({
  label,
  icon,
  value,
  error,
  readOnly,
  optional,
  onChange,
  isDark,
}) => (
  <div className="space-y-2">
    <label
      className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
    >
      {label}{" "}
      {optional && <span className="opacity-30 italic">(Optional)</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001F3F]">
        {icon}
      </div>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all text-[12px] font-bold ${
          readOnly ? "opacity-60 cursor-not-allowed" : ""
        } ${
          isDark
            ? "bg-white/5 border-white/10 focus:border-white text-white"
            : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
        } ${error ? "border-red-500/50" : ""}`}
      />
      {error && (
        <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  </div>
);

const SummaryLine = ({ label, value, highlight, success, isDark }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-[12px] font-black uppercase ${
        success
          ? "text-green-500"
          : highlight
            ? "text-blue-600"
            : isDark
              ? "text-white"
              : "text-[#001F3F]"
      }`}
    >
      {value}
    </span>
  </div>
);

export default PaymentModal;
