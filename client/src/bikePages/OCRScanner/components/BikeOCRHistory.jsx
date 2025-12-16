import React, { useState } from "react";
import { FiFileText, FiTrash2, FiClock, FiDownload } from "react-icons/fi";

const OCRHistory = ({ isDark, historyData, onDelete, onClear }) => {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div>
            <div className="flex justify-end">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ${showHistory
                        ? isDark
                            ? "bg-gray-700 text-white border-2 border-gray-600"
                            : "bg-white text-gray-700 border-2 border-gray-300"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                        }`}
                >
                    <FiClock size={18} />
                    {showHistory
                        ? "Hide History"
                        : `Show History (${historyData.length})`}
                </button>
            </div>

            {showHistory && (
                <div
                    className={`mt-6 rounded-3xl border shadow-xl ${isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                        }`}
                >
                    {/* Header */}
                    <div
                        className={`p-6 border-b ${isDark
                            ? "border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
                            : "border-gray-200 bg-gradient-to-r from-orange-600 to-red-600"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FiFileText className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Saved RC Records
                                    </h2>
                                    <p className="text-sm text-white/80">
                                        Your saved OCR history
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClear}
                                className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 border border-white/30"
                            >
                                <FiTrash2 size={18} /> Clear All
                            </button>
                        </div>
                    </div>

                    {/* Records */}
                    <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                        {historyData.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <FiFileText className="mx-auto mb-2" size={48} />
                                <p>No records found</p>
                            </div>
                        ) : (
                            historyData.map((item) => {
                                const parsed = item.parsedData || {};
                                const owner = parsed.ownerName || parsed.name || "Unknown Owner";
                                const regNo = parsed.regNo || parsed.registrationNo || "N/A";
                                const confidence =
                                    typeof item.confidence === "number"
                                        ? `${item.confidence.toFixed(1)}%`
                                        : "—";
                                const date =
                                    item.createdAt || item.savedDate || new Date().toISOString();

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border transition-all ${isDark
                                            ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4
                                                    className={`font-bold ${isDark ? "text-white" : "text-gray-900"
                                                        }`}
                                                >
                                                    {owner}
                                                </h4>
                                                <p
                                                    className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                                                        }`}
                                                >
                                                    RC: {regNo}
                                                </p>
                                                <p
                                                    className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"
                                                        }`}
                                                >
                                                    Confidence: {confidence}
                                                </p>
                                                <p
                                                    className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"
                                                        }`}
                                                >
                                                    Saved: {new Date(date).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* Download JSON */}
                                                <button
                                                    onClick={() => {
                                                        const blob = new Blob(
                                                            [JSON.stringify(item, null, 2)],
                                                            { type: "application/json" }
                                                        );
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = `rc_${regNo || item.id}.json`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className={`p-3 rounded-xl transition-all ${isDark
                                                        ? "bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700"
                                                        : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200"
                                                        }`}
                                                    title="Download JSON"
                                                >
                                                    <FiDownload size={18} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => onDelete(item.id)}
                                                    className={`p-3 rounded-xl transition-all ${isDark
                                                        ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700"
                                                        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                                        }`}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRHistory;
