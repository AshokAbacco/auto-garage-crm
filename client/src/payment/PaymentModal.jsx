//client/src/payment/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaAward,
    FaChevronRight,
    FaCheckCircle,
    FaLock,
    FaUser,
    FaBuilding,
    FaEnvelope,
    FaPhone,
    FaShieldAlt,
    FaTimes,
    FaTag,
    FaBolt,
    FaStar,
    FaCreditCard,
    FaIdCard
} from 'react-icons/fa';

const PaymentModal = ({
    show,
    plan,
    billingPeriod,
    isDark,
    planType,    
    onClose,
    onComplete,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        referenceCode: '',
        gstNumber: '' // Added GST number field
    });
    const [errors, setErrors] = useState({});
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    // Load Razorpay script when component mounts
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


    // Handle navigation when payment is successful
    useEffect(() => {
        if (showSuccess && paymentResponse) {
            const timer = setTimeout(() => {

                onComplete(plan, formData);

                const cleanPlan = {
                    name: plan.name,
                    numericPrice: plan.numericPrice,
                };

                const finalPriceCalc =
                    billingPeriod === "yearly"
                        ? Math.round(plan.numericPrice * 12 * 0.9)
                        : plan.numericPrice;

                const stateData = {
                    paymentData: {
                        plan: cleanPlan,
                        billingPeriod,
                        finalPrice: finalPriceCalc,
                        formData,
                        paymentId: paymentResponse.paymentId,   // FIXED
                        subscriptionId: paymentResponse.subscriptionId, // added
                    },
                };

                // 🔥 Dynamic redirect by plan type
                if (planType === "car") {
                    navigate("/car-register", { state: stateData });
                } else if (planType === "bike") {
                    navigate("/bike-register", { state: stateData });
                } else if (planType === "washing") {
                    navigate("/washing-register", { state: stateData });
                } else {
                    navigate("/car-register", { state: stateData });
                }

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
        planType
    ]);



    if (!show || !plan) return null;

    const finalPrice = billingPeriod === 'yearly'
        ? Math.round(plan.numericPrice * 12 * 0.9)
        : plan.numericPrice;

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Required';
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email';
        if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Invalid phone';
        // GST validation (optional but if provided should be valid)
        if (formData.gstNumber && !formData.gstNumber.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) {
            newErrors.gstNumber = 'Invalid GST number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;
        if (!razorpayLoaded) return alert("Razorpay is still loading…");

        setIsProcessing(true);

        const API =
            window.location.hostname === "localhost"
                ? "http://localhost:5000"
                : "https://auto-garage-crm-zrxc.onrender.com";

        // 1️⃣ Create subscription on backend
        const subRes = await fetch(`${API}/api/payments/create-subscription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plan: {
                    name: plan.name,
                    numericPrice: plan.numericPrice,
                },
                billingPeriod,
                customer: { ...formData },
            }),
        });

        const data = await subRes.json();
        if (!data.success) {
            alert(data.error || "Failed to create subscription");
            setIsProcessing(false);
            return;
        }

        const subscription = data.subscription;
        const razorpayKey = data.razorpayKey;

        // 2️⃣ Razorpay Checkout
        const options = {
            key: razorpayKey,
            subscription_id: subscription.id,
            name: "Abacco Technology",
            description: `${plan.name} Plan - 7 Day Trial`,
            theme: { color: isDark ? "#8B5CF6" : "#7C3AED" },

            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone,
            },

            handler: async function (response) {
                // For production Razorpay webhook will activate plan.

                // 🔥 For localhost, verify manually
                if (window.location.hostname === "localhost") {
                    await fetch(`${API}/api/payments/verify-payment-localhost`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subscriptionId: response.razorpay_subscription_id,
                            paymentId: response.razorpay_payment_id,
                        }),
                    });
                }

                setPaymentResponse({
                    paymentId: response.razorpay_payment_id,
                    subscriptionId: response.razorpay_subscription_id,
                    signature: response.razorpay_signature,
                });

                setShowSuccess(true);
            },
        };

        const rzp = new window.Razorpay(options);

        // 3️⃣ Handle failures & dismiss
        rzp.on("payment.failed", function () {
            alert("Payment failed. Please try again.");
            setIsProcessing(false);
        });

        rzp.on("checkout.closed", function () {
            setIsProcessing(false);
        });

        rzp.open();
    };



    const formFields = [
        {
            key: 'name',
            label: 'Full Name',
            type: 'text',
            icon: FaUser,
            placeholder: 'John Doe'
        },
        {
            key: 'companyName',
            label: 'Company Name',
            type: 'text',
            icon: FaBuilding,
            placeholder: 'Acme Inc.'
        },
        {
            key: 'email',
            label: 'Email Address',
            type: 'email',
            icon: FaEnvelope,
            placeholder: 'john@example.com'
        },
        {
            key: 'phone',
            label: 'Phone Number',
            type: 'tel',
            icon: FaPhone,
            placeholder: '9876543210'
        },
        {
            key: 'gstNumber',
            label: 'GST Number',
            type: 'text',
            icon: FaIdCard,
            placeholder: '22AAAAA0000A1Z5',
            optional: true
        }
    ];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 transition-all duration-300 bg-gradient-to-br from-black/80 via-purple-900/20 to-black/80 backdrop-blur-xl"
                onClick={onClose}
                style={{ backdropFilter: 'blur(12px)' }}
            ></div>

            {/* Modal Container */}
            <div className={`relative rounded-3xl shadow-2xl w-full max-w-2xl transition-all duration-500 transform ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50' : 'bg-white'} max-h-[95vh] flex flex-col overflow-hidden`}>
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-transparent blur-3xl"></div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-300' : 'bg-white/90 hover:bg-gray-100 text-gray-700'} backdrop-blur-sm transition-all duration-200 z-10 shadow-lg hover:scale-110 group`}
                >
                    <FaTimes className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                </button>

                {showSuccess ? (
                    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 space-y-6 text-center">
                        {/* Success animation */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full opacity-50 bg-gradient-to-r from-green-400 to-emerald-500 blur-2xl animate-pulse"></div>
                            <div className="relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl bg-gradient-to-br from-green-400 to-emerald-500">
                                <FaCheckCircle className="w-12 h-12 text-white animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
                                Payment Successful!
                            </h2>
                            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Your subscription is being activated
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <FaBolt className="w-4 h-4 text-yellow-500 animate-pulse" />
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                    Redirecting to registration...
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full max-w-xs pt-6">
                            <div className={`w-full h-2 overflow-hidden rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div className="h-full rounded-full shadow-lg bg-gradient-to-r from-green-400 to-emerald-500 animate-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Scrollable content area */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto sm:p-8">
                            {/* Header with icon */}
                            <div className="relative space-y-4 text-center">
                                <div className="inline-flex p-4 shadow-lg rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm">
                                    <div className="relative">
                                        <FaAward className="w-10 h-10 text-violet-500 animate-pulse" />
                                        <FaStar className="absolute w-3 h-3 text-yellow-400 -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-transparent sm:text-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text">
                                        Complete Your Order
                                    </h2>
                                    <p className={`text-sm sm:text-base mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Subscribe to <span className="font-bold text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">{plan.name}</span> plan
                                    </p>
                                </div>

                                {/* Billing period badge */}
                                {billingPeriod === 'yearly' && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-green-600 border rounded-full bg-green-500/10 border-green-500/20">
                                        <FaBolt className="w-3 h-3" />
                                        Save 10% with yearly billing
                                    </div>
                                )}
                            </div>

                            {/* Form Fields - Responsive Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {formFields.map((field) => {
                                    const Icon = field.icon;
                                    return (
                                        <div key={field.key} className="space-y-2">
                                            <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {field.label} {field.optional && <span className="text-xs font-normal text-gray-500">(Optional)</span>}
                                            </label>
                                            <div className="relative group">
                                                <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-all duration-200 z-10 ${focusedField === field.key
                                                    ? 'text-violet-400 scale-110'
                                                    : errors[field.key]
                                                        ? 'text-red-400'
                                                        : isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type={field.type}
                                                    value={formData[field.key]}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, [field.key]: e.target.value });
                                                        setErrors({ ...errors, [field.key]: '' });
                                                    }}
                                                    onFocus={() => setFocusedField(field.key)}
                                                    onBlur={() => setFocusedField(null)}
                                                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 text-sm font-medium relative ${errors[field.key]
                                                        ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                                                        : focusedField === field.key
                                                            ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]'
                                                            : isDark
                                                                ? 'bg-gray-800/80 border-gray-600 hover:border-gray-500 focus:border-violet-500'
                                                                : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus:border-violet-500'
                                                        } focus:outline-none backdrop-blur-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                                    placeholder={field.placeholder}
                                                />
                                                {errors[field.key] && (
                                                    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500 animate-fadeIn font-medium">
                                                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                                        {errors[field.key]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reference Code Field - Full Width */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Reference Code <span className="text-xs font-normal text-gray-500">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-all duration-200 z-10 ${focusedField === 'referenceCode' ? 'text-violet-400 scale-110' : isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                        <FaTag className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.referenceCode}
                                        onChange={(e) => {
                                            setFormData({ ...formData, referenceCode: e.target.value });
                                        }}
                                        onFocus={() => setFocusedField('referenceCode')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 text-sm font-medium relative ${focusedField === 'referenceCode'
                                            ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.01]'
                                            : isDark
                                                ? 'bg-gray-800/80 border-gray-600 hover:border-gray-500 focus:border-violet-500'
                                                : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus:border-violet-500'
                                            } focus:outline-none backdrop-blur-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                        placeholder="Enter code if you have one"
                                    />
                                </div>
                            </div>

                            {/* Payment Summary Card */}
                            <div className={`relative p-5 rounded-2xl overflow-hidden ${isDark
                                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50'
                                : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
                                } backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-3xl"></div>

                                <div className="relative space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-600/20">
                                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Order Summary</span>
                                        <FaCreditCard className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Plan</span>
                                        <span className="font-bold text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">{plan.name}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Billing Period</span>
                                        <div className="flex items-center gap-2">
                                            {billingPeriod === 'yearly' && (
                                                <span className="px-2 py-0.5 text-xs font-bold text-green-600 bg-green-500/10 rounded-full border border-green-500/20">
                                                    -10%
                                                </span>
                                            )}
                                            <span className="font-semibold">
                                                {billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}
                                            </span>
                                        </div>
                                    </div>

                                    {billingPeriod === 'yearly' && (
                                        <div className="flex items-center justify-between px-3 py-2 border rounded-lg bg-green-500/5 border-green-500/20">
                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Per month equivalent</span>
                                            <span className="text-sm font-bold text-green-500">₹{Math.round(finalPrice / 12)}/mo</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-600/20">
                                        <span className="text-base font-bold">Total Amount</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text">
                                                ₹{finalPrice}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {billingPeriod === 'yearly' ? 'billed annually' : 'billed monthly'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${isDark
                                ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-500/20'
                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50'
                                }`}>
                                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                                    <FaShieldAlt className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Secure Payment Gateway</p>
                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Powered by Razorpay • 256-bit SSL encryption
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fixed bottom section with buttons */}
                        <div className={`p-6 pt-4 ${isDark ? 'bg-gray-900/50 border-t border-gray-700/50' : 'bg-white border-t border-gray-100'} backdrop-blur-sm`}>
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={onClose}
                                    className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex-1 text-sm ${isDark
                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                                        } hover:scale-[1.02] active:scale-95`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="relative px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold transition-all duration-500 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 flex-1 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 overflow-hidden group"
                                >
                                    <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full"></div>
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-white rounded-full border-3 border-t-transparent animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaLock className="w-4 h-4" />
                                            <span>Pay ₹{finalPrice}</span>
                                            <FaChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Security Footer */}
                            <div className="flex items-center justify-center gap-2 pt-4 text-xs">
                                <FaLock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                                    Your payment information is secure and encrypted
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .animate-progress {
                    animation: progress 2s ease-in-out;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .bg-size-200 {
                    background-size: 200% 100%;
                }

                .bg-pos-0 {
                    background-position: 0% 0%;
                }

                .bg-pos-100 {
                    background-position: 100% 0%;
                }

                /* Custom scrollbar */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 3px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.5);
                }
            `}</style>
        </div>
    );
};

export default PaymentModal;