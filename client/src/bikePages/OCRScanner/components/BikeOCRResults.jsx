import React, { useEffect, useState } from "react";
import {
    FiEdit,
    FiSave,
    FiX,
    FiFileText,
    FiLoader,
    FiZap,
} from "react-icons/fi";

const OCRResults = ({
    isDark,
    parsedData,
    rawOcrText,
    isEditing,
    setIsEditing,
    editedData,
    setEditedData,
    onSave,
}) => {
    const [autoFilled, setAutoFilled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fieldLabels = {
        regNo: "Registration Number",
        regDate: "Registration Date",
        chassisNo: "Chassis Number",
        engineNo: "Engine Number",
        maker: "Maker (Manufacturer)",
        model: "Model",
        variant: "Variant",
        vehicleClass: "Vehicle Class",
        bodyType: "Body Type",
        color: "Colour",
        fuelType: "Fuel Type",
        wheelBase: "Wheel Base",
        mfgDate: "MFG Date",
        seatingCapacity: "Seating Capacity",
        noOfCyl: "No. of Cylinders",
        unladenWt: "Unladen Weight",
        cc: "CC (Cubic Capacity)",
        regFcUpto: "Reg/FC Valid Upto",
        fitUpto: "Fitness Valid Upto",
        insuranceUpto: "Insurance Valid Upto",
        taxUpto: "Tax Valid Upto",
        ownerName: "Owner Name",
        swdOf: "S/W/D Of",
        address: "Address",
    };

    const groupedFields = {
        "🚗 Vehicle Identification": [
            "regNo",
            "regDate",
            "chassisNo",
            "engineNo",
            "maker",
            "model",
            "variant",
        ],
        "⚙️ Vehicle Specifications": [
            "vehicleClass",
            "bodyType",
            "color",
            "fuelType",
            "wheelBase",
            "mfgDate",
            "seatingCapacity",
            "noOfCyl",
            "unladenWt",
            "cc",
        ],
        "🧾 Registration / Validity": [
            "regFcUpto",
            "fitUpto",
            "insuranceUpto",
            "taxUpto",
        ],
        "👤 Ownership": ["ownerName", "swdOf", "address"],
    };

    // Fallback extraction from raw text
    const autoFillFallback = (label) => {
        if (!rawOcrText) return "";
        const raw = rawOcrText.toUpperCase();
        const pattern = new RegExp(
            `${label.replace(/[^A-Z0-9]/gi, ".{0,2}")}[:\\s.-]*([A-Z0-9/.,() &-]+)`,
            "i"
        );
        const match = raw.match(pattern);
        return match ? match[1].trim() : "";
    };

    // Fill data
    useEffect(() => {
        if (parsedData && Object.values(parsedData).some((v) => v)) {
            setEditedData({ ...parsedData });
            setAutoFilled(false);
        } else if (rawOcrText && !autoFilled) {
            const raw = rawOcrText.toUpperCase();
            const extracted = {};
            for (const [key, label] of Object.entries(fieldLabels)) {
                const pattern = new RegExp(
                    `${label.replace(/[^A-Z0-9]/gi, ".{0,2}")}[:\\s.-]*([A-Z0-9/.,() &-]+)`,
                    "i"
                );
                const match = raw.match(pattern);
                extracted[key] = match ? match[1].trim() : "";
            }
            setEditedData(extracted);
            setAutoFilled(true);
        }
    }, [parsedData, rawOcrText, autoFilled, setEditedData]);

    const handleAutoFill = () => {
        const newData = { ...editedData };
        Object.entries(fieldLabels).forEach(([key, label]) => {
            if (!newData[key] || newData[key].trim() === "") {
                newData[key] = autoFillFallback(label);
            }
        });
        setEditedData(newData);
    };

    const handleInputChange = (key, value) => {
        setEditedData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveClick = async () => {
        try {
            setIsSaving(true);
            await onSave(isEditing ? editedData : parsedData);
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const displayData = isEditing ? editedData : parsedData || {};

    return (
        <div
            className={`rounded-3xl border shadow-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
        >
            {/* Header */}
            <div
                className={`p-6 border-b flex items-center justify-between ${isDark
                        ? "border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
                        : "border-gray-200 bg-gradient-to-r from-green-600 to-teal-600"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FiFileText className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Extracted Information
                        </h2>
                        <p className="text-sm text-white/80">
                            Review, edit or auto-fill missing RC details
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleAutoFill}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                    >
                        <FiZap /> Auto-Fill Missing Fields
                    </button>

                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
                            >
                                <FiEdit /> Edit
                            </button>
                            <button
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 ${isSaving
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-white text-green-600 hover:shadow-lg"
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <FiLoader className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave /> Save
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
                            >
                                <FiX /> Cancel
                            </button>
                            <button
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 ${isSaving
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-white text-green-600 hover:shadow-lg"
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <FiLoader className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave /> Save
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-10">
                {Object.entries(groupedFields).map(([section, keys]) => (
                    <div key={section}>
                        <h3
                            className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                        >
                            {section}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {keys.map((key) => (
                                <div
                                    key={key}
                                    className={`p-4 rounded-xl border ${isDark
                                            ? "bg-gray-700/50 border-gray-600"
                                            : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <label
                                        className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-gray-400" : "text-gray-600"
                                            }`}
                                    >
                                        {fieldLabels[key]}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={
                                                editedData?.[key] ||
                                                autoFillFallback(fieldLabels[key]) ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(key, e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border font-medium ${isDark
                                                    ? "bg-gray-600 border-gray-500 text-white"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                }`}
                                            placeholder="Enter value"
                                        />
                                    ) : (
                                        <p
                                            className={`font-semibold ${displayData?.[key]
                                                    ? isDark
                                                        ? "text-white"
                                                        : "text-gray-900"
                                                    : isDark
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
                                        >
                                            {displayData?.[key] || "Not found"}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Raw OCR Text */}
                {rawOcrText && (
                    <div
                        className={`mt-6 rounded-xl p-6 ${isDark
                                ? "bg-gray-700 border border-gray-600"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                    >
                        <h4
                            className={`font-bold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"
                                }`}
                        >
                            Raw OCR Text
                        </h4>
                        <pre
                            className={`whitespace-pre-wrap text-sm ${isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            {rawOcrText}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OCRResults;
