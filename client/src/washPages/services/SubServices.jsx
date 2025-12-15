// src/SubServices.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Filter, RefreshCw, ClipboardX, Plus } from "lucide-react";

function SubServices() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f0fbff] px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0b63ce]">Subservice Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Track and manage all subservice records</p>
                </div>

                <button
                    onClick={() => navigate("/add-subservice")}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90"
                >
                    <Plus className="w-4 h-4" />
                    Add New Subservice
                </button>
            </div>

            {/* Filters */}
            <div className="px-5 py-4 mb-6 bg-white shadow-md rounded-2xl">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px] rounded-xl border border-slate-200 bg-[#f8fdff] px-3 py-2.5 text-sm">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, reg number, etc..."
                            className="w-full text-sm bg-transparent outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input type="date" className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                    </div>

                    <select className="w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                        <option>All Categories</option>
                    </select>

                    <select className="w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                        <option>All Status</option>
                    </select>

                    <button
                        className="flex items-center gap-2 px-4 py-2 ml-auto text-sm border rounded-xl border-slate-200 hover:bg-slate-50"
                        onClick={() => {
                            /* reset handlers if wired */
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Empty State */}
            <div className="py-20 text-center bg-white shadow-md rounded-2xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
                        <ClipboardX className="w-8 h-8 text-slate-500" />
                    </div>

                    <p className="text-lg font-medium text-slate-700">No subservices found.</p>

                    <p className="max-w-xl mt-1 text-sm text-slate-500">
                        Use the search or filters above to look for subservices. You can also create a new subservice to get
                        started.
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => navigate("/add-subservice")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:opacity-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Subservice
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubServices;
