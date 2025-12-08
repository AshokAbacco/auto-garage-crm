import React, { useState, useEffect } from "react";
import { FiCalendar, FiHash } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

// Words that should be removed when matching brands
const EXTRA_WORDS = [
    "india", "ltd", "limited", "motors", "pvt", "private", "automobile",
    "automobiles", "motor", "company"
];

// Normalize brand text
const normalizeBrand = (str = "") => {
    let t = str.toLowerCase();
    EXTRA_WORDS.forEach(w => {
        t = t.replace(w, "");
    });
    return t.replace(/[^a-z]/g, "").trim(); // keep alphabetical only
};

// Normalize model for fuzzy match (currently unused but kept)
const normalizeModel = (str = "") =>
    String(str).toLowerCase().replace(/[^a-z0-9]/g, "").trim();

export default function VehicleInfoSection({
    form,
    setForm,
    isDark,
    userPlan = "BASIC",
    carMakes = [],
    carModels = [],
    fetchCarModels,
    fuelTypes = [],
    seatOptions = [],
}) {
    const [brandInput, setBrandInput] = useState(form.vehicleMake || "");
    const [filteredMakes, setFilteredMakes] = useState([]);

    // ✅ Keep local input in sync with form (important for RC scan + edit mode)
    useEffect(() => {
        setBrandInput(form.vehicleMake || "");
    }, [form.vehicleMake]);

    // ----------------------------------------------------
    // FILTER BRAND SUGGESTIONS (SMART MATCHING)
    // ----------------------------------------------------
    useEffect(() => {
        if (!brandInput || userPlan === "BASIC") {
            setFilteredMakes([]);
            return;
        }

        const normalizedInput = normalizeBrand(brandInput);

        if (!normalizedInput) {
            setFilteredMakes([]);
            return;
        }

        const matches = (carMakes || []).filter((brand) => {
            return normalizeBrand(brand).includes(normalizedInput);
        });

        setFilteredMakes(matches);
    }, [brandInput, carMakes, userPlan]);

    // ----------------------------------------------------
    // BRAND SELECTED
    // ----------------------------------------------------
    const handleBrandSelect = (brand) => {
        setBrandInput(brand);
        setForm((prev) => ({ ...prev, vehicleMake: brand, vehicleModel: "" }));
        fetchCarModels(brand);
        setFilteredMakes([]);
    };

    // ----------------------------------------------------
    // BRAND INPUT CHANGE
    // ----------------------------------------------------
    const handleBrandChange = (value) => {
        setBrandInput(value);
        setForm((prev) => ({ ...prev, vehicleMake: value }));
    };

    // ----------------------------------------------------
    // MODEL SELECT
    // ----------------------------------------------------
    const handleModelSelect = (model) => {
        setForm((prev) => ({ ...prev, vehicleModel: model }));
    };

    return (
        <div
            className={`${isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
                } rounded-2xl shadow-lg border`}
        >
            {/* Header */}
            <div
                className={`px-6 py-5 border-b ${isDark
                    ? "border-gray-700/50 bg-emerald-900/10"
                    : "border-gray-100 bg-emerald-50"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "text-emerald-400" : "text-emerald-600"
                            } bg-emerald-500/10`}
                    >
                        <FaCar size={20} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : ""}`}>
                            Vehicle Information
                        </h2>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            Vehicle details and registration
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* BRAND FIELD */}
                    <InputField
                        icon={<FaCar />}
                        label="Vehicle Make"
                        required
                        value={brandInput}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        placeholder="Start typing brand (e.g., Tata)"
                        isDark={isDark}
                    />

                    {/* BRAND SUGGESTIONS */}
                    {userPlan !== "BASIC" &&
                        brandInput.length >= 2 &&
                        (filteredMakes || []).length > 0 && (
                            <div className="col-span-2 border rounded-lg bg-white dark:bg-gray-800 shadow max-h-60 overflow-auto">
                                {(filteredMakes || []).map((brand, index) => (
                                    <div
                                        key={`${brand}-${index}`}
                                        onClick={() => handleBrandSelect(brand)}
                                        className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        {brand}
                                    </div>
                                ))}
                            </div>
                        )}

                    {/* MODEL FIELD */}
                    {userPlan === "BASIC" ? (
                        <InputField
                            icon={<FaCar />}
                            label="Vehicle Model"
                            required
                            value={form.vehicleModel}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    vehicleModel: e.target.value,
                                }))
                            }
                            placeholder="Enter model"
                            isDark={isDark}
                        />
                    ) : (
                        <div className="w-full">
                            <label
                                className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Vehicle Model
                            </label>

                            <select
                                value={form.vehicleModel}
                                onChange={(e) => handleModelSelect(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border ${isDark
                                    ? "bg-gray-700/50 border-gray-600 text-white"
                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                            >
                                <option value="">Select Model</option>

                                {(carModels || []).map((m) => (
                                    <option key={m.id} value={m.name}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* YEAR */}
                    <InputField
                        icon={<FiCalendar />}
                        label="Vehicle Year"
                        type="number"
                        value={form.vehicleYear}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, vehicleYear: e.target.value }))
                        }
                        placeholder="2024"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        isDark={isDark}
                    />

                    {/* REG NUMBER */}
                    <InputField
                        icon={<FiHash />}
                        label="Registration Number"
                        required
                        value={form.regNumber}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                regNumber: e.target.value.toUpperCase(),
                            }))
                        }
                        placeholder="KA01AB1234"
                        isDark={isDark}
                    />

                    {/* FUEL */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            Fuel Type
                        </label>

                        <select
                            value={form.fuel}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, fuel: e.target.value }))
                            }
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark
                                ? "bg-gray-700/50 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300"
                                }`}
                        >
                            <option value="">Select Fuel</option>

                            {(fuelTypes || []).map((fuel) => (
                                <option key={fuel} value={fuel}>
                                    {fuel}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SEATS */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            Seats
                        </label>

                        <select
                            value={form.seats}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, seats: e.target.value }))
                            }
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark
                                ? "bg-gray-700/50 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300"
                                }`}
                        >
                            <option value="">Select Seats</option>

                            {(seatOptions || []).map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* VIN */}
                <div className="mt-5">
                    <InputField
                        icon={<FiHash />}
                        label="VIN / Chassis Number"
                        value={form.vin}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                vin: e.target.value.toUpperCase(),
                            }))
                        }
                        placeholder="MA1TA1234XYZ56789"
                        isDark={isDark}
                    />
                </div>
            </div>
        </div>
    );
}

/* Reusable Input Component */
function InputField({
    icon,
    label,
    value,
    onChange,
    placeholder,
    isDark,
    type = "text",
    required,
    min,
    max,
}) {
    return (
        <div className="w-full">
            <label
                className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"
                    }`}
            >
                <span className={isDark ? "text-emerald-400" : "text-emerald-600"}>
                    {icon}
                </span>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                autoComplete="off"
                required={required}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border ${isDark
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 placeholder-gray-400"
                    }`}
            />
        </div>
    );
}
