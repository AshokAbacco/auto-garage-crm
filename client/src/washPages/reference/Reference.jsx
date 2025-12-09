import React from "react";

function Reference() {
    return (
        <div>
            <div className="min-h-screen p-8 bg-[#f0fbff] text-slate-800">
                {/* Referral Code Box */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] text-white shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 7h.01M4 4h6l8 8-6 6-8-8V4z"
                            />
                        </svg>

                        <h2 className="text-2xl font-bold">Your Referral Code</h2>
                    </div>

                    {/* Code Box */}
                    <div className="flex items-center justify-between px-6 py-4 rounded-xl bg-white/20 backdrop-blur-md">
                        <span className="text-3xl font-extrabold tracking-wider">
                            ATREF-646AKI
                        </span>

                        <button className="flex items-center justify-center w-10 h-10 transition rounded-lg bg-white/30 hover:bg-white/40">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 3H6a2 2 0 00-2 2v12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Section Heading */}
                <div className="flex items-center gap-3 mt-10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-[#0ea5e9]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20h6M4 20h5v-2a3 3 0 00-5.356-1.857M12 12a5 5 0 100-10 5 5 0 000 10z"
                        />
                    </svg>
                    <h2 className="text-2xl font-bold">Users Referred by You</h2>
                </div>

                {/* Table-like layout */}
                <div className="mt-4 overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 px-4 py-3 text-sm font-medium bg-[#e0f2fe] text-slate-700">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Plan</div>
                        <div>Billing</div>
                        <div>Amount</div>
                        <div>Joining Date</div>
                        <div>Payment Date</div>
                    </div>

                    {/* Empty State */}
                    <div className="py-10 text-center text-slate-500">
                        No one has used your referral yet.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reference;
