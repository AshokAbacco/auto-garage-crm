import React from 'react'

function Reports() {
    return (
        <div><div className="min-h-screen p-8 bg-[#f0fbff] text-slate-800">


            {/* Top tabs */}
            <div className="flex items-center gap-3 mb-6">
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6b46ff] to-[#7c4dff] text-white font-medium shadow-md">Analytics</button>
                <button className="px-4 py-2 bg-white border rounded-full shadow-sm border-slate-200 text-slate-700">Reports</button>

                <div className="flex items-center gap-3 ml-auto">
                    <button className="flex items-center justify-center w-10 h-10 bg-white border rounded-lg shadow-sm border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 14h12v7H6v-7z" />
                        </svg>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-white border rounded-lg shadow-sm border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4M21 21H3" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">

                {/* Total Revenue */}
                <div className="rounded-xl p-6 border border-slate-100 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Total Revenue</div>
                            <div className="mt-2 text-2xl font-bold">₹ 0.00</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M10 18h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Paid Revenue */}
                <div className="rounded-xl p-6 border border-slate-100 bg-gradient-to-r from-[#4f46e5] to-[#60a5fa] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Paid Revenue</div>
                            <div className="mt-2 text-2xl font-bold">₹ 0.00</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Revenue */}
                <div className="rounded-xl p-6 border border-slate-100 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Pending Revenue</div>
                            <div className="mt-2 text-2xl font-bold">₹ 0.00</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 3" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl p-5 border border-slate-100 bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Total Services</div>
                            <div className="mt-2 text-2xl font-bold">0</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l-6 6 4 4 6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-5 border border-slate-100 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Completed</div>
                            <div className="mt-2 text-2xl font-bold">0</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-5 border border-slate-100 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Pending</div>
                            <div className="mt-2 text-2xl font-bold">0</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 3" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-5 border border-slate-100 bg-gradient-to-r from-[#ef476f] to-[#d62c7a] text-white shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm opacity-90">Avg Service Cost</div>
                            <div className="mt-2 text-2xl font-bold">₹ 0.00</div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l2 6 4-12 3 6h4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Over Time panel */}
            <div className="overflow-hidden border shadow-sm rounded-2xl border-slate-100">
                <div className="px-6 py-5 bg-gradient-to-r from-[#6b46ff] to-[#7c4dff] text-white">
                    <h3 className="text-xl font-semibold">Revenue Over Time</h3>
                    <p className="text-sm opacity-90">Monthly revenue from invoices</p>
                </div>

                <div className="p-8 bg-white min-h-[220px] flex items-center justify-center text-slate-400">
                    No revenue data available
                </div>
            </div>
            {/* --- continuation: 3 large gradient panels --- */}
            <div className="mt-8 space-y-8">

                {/* Invoice Status Distribution */}
                <div className="overflow-hidden border shadow-sm rounded-2xl border-slate-100">
                    <div className="px-6 py-5 bg-gradient-to-r from-[#059669] to-[#0ea5a3] text-white">
                        <h3 className="text-xl font-semibold">Invoice Status Distribution</h3>
                        <p className="text-sm opacity-90">Breakdown of invoices by payment status</p>
                    </div>

                    <div className="p-8 bg-white min-h-[180px] flex items-center justify-center text-slate-400">
                        No invoice data available
                    </div>
                </div>

                {/* Service Status Overview */}
                <div className="overflow-hidden border shadow-sm rounded-2xl border-slate-100">
                    <div className="px-6 py-5 bg-gradient-to-r from-[#0ea5a3] to-[#06b6d4] text-white">
                        <h3 className="text-xl font-semibold">Service Status Overview</h3>
                        <p className="text-sm opacity-90">Completion and progress of all services</p>
                    </div>

                    <div className="p-8 bg-white min-h-[180px] flex items-center justify-center text-slate-400">
                        No service data available
                    </div>
                </div>

                {/* Top Services by Revenue */}
                <div className="overflow-hidden border shadow-sm rounded-2xl border-slate-100">
                    <div className="px-6 py-5 bg-gradient-to-r from-[#ef476f] to-[#fb8c00] text-white">
                        <h3 className="text-xl font-semibold">Top Services by Revenue</h3>
                        <p className="text-sm opacity-90">Highest-earning service types</p>
                    </div>

                    <div className="p-8 bg-white min-h-[180px] flex items-center justify-center text-slate-400">
                        No service revenue data available
                    </div>
                    {/* Top Clients */}
                    <div className="mt-8 overflow-hidden border shadow-sm rounded-2xl border-slate-100">
                        {/* Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-[#6b46ff] to-[#7c4dff] text-white">
                            <h3 className="text-xl font-semibold">Top Clients</h3>
                            <p className="text-sm opacity-90">Clients with highest total spending</p>
                        </div>

                        {/* Empty content */}
                        <div className="p-10 bg-white min-h-[180px] flex items-center justify-center text-slate-400">
                            No client data available
                        </div>
                    </div>

                </div>

            </div>


        </div>
        </div>

    )
}

export default Reports