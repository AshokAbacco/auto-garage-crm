import React from "react";
import {
    Car,
    Bike,
    ShowerHead,
    CheckCircle2,
    ShieldCheck,
    Zap,
    RefreshCw,
    Headset,
} from "lucide-react";

function Upgrade() {
    return (
        <div className="w-full px-6 py-12 bg-[#f0fbff]">
            {/* Animation */}
            <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hover-blink:hover {
          animation: blink 0.8s ease-in-out infinite;
        }
      `}</style>

            {/* Badge */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 text-xs text-[#0ea5e9] rounded-full bg-[#e0f2fe]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Upgrade your plan to unlock more features</span>
                </div>
            </div>

            {/* Heading */}
            <div className="max-w-3xl mx-auto mb-6 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900">
                    Choose Your Perfect Plan
                </h1>
                <p className="mt-2 text-xl font-semibold text-[#0ea5e9]">
                    Scale as you grow
                </p>
                <p className="mt-3 text-sm text-slate-500">
                    Flexible pricing that adapts to your business needs
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-3 mb-10">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0ea5e9] rounded-full">
                    <Car className="w-4 h-4" />
                    <span>Car Plans</span>
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white rounded-full shadow text-slate-700">
                    <Bike className="w-4 h-4" />
                    <span>Bike Plans</span>
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white rounded-full shadow text-slate-700">
                    <ShowerHead className="w-4 h-4" />
                    <span>Washing Plans</span>
                </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
                {/* BASIC */}
                <div className="flex flex-col p-6 bg-white border shadow-lg rounded-2xl border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Basic</h2>
                    <p className="mb-4 text-xs text-slate-500">For small garages</p>

                    <div className="mb-6 text-3xl font-extrabold text-slate-900">
                        ₹1000 <span className="text-sm text-slate-500">/mo</span>
                    </div>

                    <div className="flex-1 space-y-2 text-sm text-slate-600">
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Upload RC images (up to 10/day)</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Basic OCR extraction</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Save history locally</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>CSV/EXCEL, PDF export</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Email support</span>
                        </div>
                    </div>

                    <button className="w-full py-3 mt-6 font-semibold text-white bg-[#0ea5e9] rounded-lg hover-blink">
                        Upgrade Now →
                    </button>
                </div>

                {/* STANDARD */}
                <div className="flex flex-col p-6 text-white scale-105 shadow-xl rounded-2xl bg-gradient-to-br from-[#22c1f1] to-[#0ea5e9]">
                    <div className="flex justify-center mb-4 -mt-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-white/30">
                            <Zap className="w-3 h-3" />
                            <span>POPULAR</span>
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold">Standard</h2>
                    <p className="mb-4 text-xs opacity-80">Most popular choice</p>

                    <div className="mb-6 text-4xl font-extrabold">
                        ₹2000 <span className="text-sm opacity-80">/mo</span>
                    </div>

                    <div className="flex-1 space-y-3 text-sm">
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>Unlimited uploads</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>High-accuracy OCR</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>Priority support</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>Export CSV, PDF</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>SMS/WhatsApp Alerts</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                            <span>Team accounts (up to 3)</span>
                        </div>
                    </div>

                    <button className="w-full py-3 mt-6 font-semibold text-[#0ea5e9] bg-white rounded-lg hover-blink">
                        Upgrade Now →
                    </button>
                </div>

                {/* PREMIUM */}
                <div className="flex flex-col p-6 bg-white border shadow-lg rounded-2xl border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Premium</h2>
                    <p className="mb-4 text-xs text-slate-500">For growing businesses</p>

                    <div className="mb-6 text-3xl font-extrabold text-slate-900">
                        ₹3000 <span className="text-sm text-slate-500">/mo</span>
                    </div>

                    <div className="flex-1 space-y-2 text-sm text-slate-600">
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Everything in Standard</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Team accounts (up to 10)</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Maintenance Alert SMS</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Bulk processing</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Dedicated manager</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Auto Invoice</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Staff Salary Management</span>
                        </div>
                        <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <span>Online Payment Options</span>
                        </div>
                    </div>

                    <button className="w-full py-3 mt-6 font-semibold text-white bg-[#0ea5e9] rounded-lg hover-blink">
                        Upgrade Now →
                    </button>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="grid max-w-4xl grid-cols-2 gap-8 mx-auto mt-12 text-center md:grid-cols-4">
                {/* Secure Payment */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#e0f2fe]">
                        <ShieldCheck className="w-6 h-6 text-[#0ea5e9]" />
                    </div>
                    <div className="text-sm font-semibold">Secure Payment</div>
                    <div className="text-xs text-slate-500">Bank level encryption</div>
                </div>

                {/* Instant Access */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#e0f2fe]">
                        <Zap className="w-6 h-6 text-[#0ea5e9]" />
                    </div>
                    <div className="text-sm font-semibold">Instant Access</div>
                    <div className="text-xs text-slate-500">Start immediately</div>
                </div>

                {/* Cancel Anytime */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#e0f2fe]">
                        <RefreshCw className="w-6 h-6 text-[#0ea5e9]" />
                    </div>
                    <div className="text-sm font-semibold">Cancel Anytime</div>
                    <div className="text-xs text-slate-500">No commitments</div>
                </div>

                {/* 24/7 Support */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#e0f2fe]">
                        <Headset className="w-6 h-6 text-[#0ea5e9]" />
                    </div>
                    <div className="text-sm font-semibold">24/7 Support</div>
                    <div className="text-xs text-slate-500">Always here to help</div>
                </div>
            </div>
        </div>
    );
}

export default Upgrade;
