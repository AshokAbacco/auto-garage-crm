// client/src/pages/details/components/OCRDebugPanel.jsx
import React, { useState } from "react";
import { FiZap } from "react-icons/fi";

const OCRDebugPanel = ({ isDark, debugInfo }) => {
    const [show, setShow] = useState(false);

    if (!debugInfo || Object.keys(debugInfo).length === 0) return null;

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return isDark ? "text-green-400" : "text-green-600";
        if (confidence >= 60) return isDark ? "text-yellow-400" : "text-yellow-600";
        return isDark ? "text-red-400" : "text-red-600";
    };

    return (
        <div
            className={`rounded-2xl p-6 border mt-4 ${isDark
                ? "bg-yellow-900/20 border-yellow-800"
                : "bg-yellow-50 border-yellow-200"
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <h3
                    className={`font-bold flex items-center gap-2 ${isDark ? "text-yellow-400" : "text-yellow-800"
                        }`}
                >
                    <FiZap /> OCR Quality Report
                </h3>
                <button
                    onClick={() => setShow(!show)}
                    className={`text-sm font-semibold ${isDark
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-yellow-700 hover:text-yellow-800"
                        }`}
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>

            {show && (
                <div
                    className={`text-sm space-y-2 ${isDark ? "text-yellow-300" : "text-yellow-800"
                        }`}
                >
                    <p>
                        <strong>Confidence:</strong>{" "}
                        <span
                            className={`font-bold ${getConfidenceColor(debugInfo.confidence)}`}
                        >
                            {debugInfo.confidence}%
                        </span>{" "}
                        ({debugInfo.quality})
                    </p>
                    <p>
                        <strong>Extracted Fields:</strong> {debugInfo.extractedFields}
                    </p>
                    {debugInfo.textLength && (
                        <p>
                            <strong>Text Length:</strong> {debugInfo.textLength}
                        </p>
                    )}
                    {debugInfo.suggestions && debugInfo.suggestions.length > 0 && (
                        <div>
                            <p className="font-bold">Suggestions:</p>
                            <ul className="ml-4 list-disc">
                                {debugInfo.suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OCRDebugPanel;
