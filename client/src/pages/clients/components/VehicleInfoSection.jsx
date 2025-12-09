// VehicleInfoSection.jsx
import React, { useState, useEffect } from "react";
import { FiCalendar, FiHash } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

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

    // Keep local input in sync with form (for RC + edit mode)
    useEffect(() => {
        setBrandInput(form.vehicleMake || "");
    }, [form.vehicleMake]);

    // Filter BRAND suggestions (only Standard/Premium)
    useEffect(() => {
        if (!brandInput || userPlan === "BASIC") {
            setFilteredMakes([]);
            return;
        }

        const inputLower = brandInput.toLowerCase();
        const matches = (carMakes || []).filter((m) =>
            m.make.toLowerCase().includes(inputLower)
        );

        setFilteredMakes(matches);
    }, [brandInput, carMakes, userPlan]);

    const handleBrandSelect = (brandObj) => {
        setBrandInput(brandObj.make);
        setForm((prev) => ({
            ...prev,
            vehicleMake: brandObj.make,
            vehicleModel: "",
        }));
        fetchCarModels(brandObj.make);
        setFilteredMakes([]);
    };

    const handleBrandChange = (value) => {
        setBrandInput(value);
        setForm((prev) => ({ ...prev, vehicleMake: value }));
    };

    const handleModelSelect = (modelName) => {
        setForm((prev) => ({ ...prev, vehicleModel: modelName }));
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

                    {/* BRAND LOGO CARDS (Standard & Premium) */}
                    {userPlan !== "BASIC" &&
                        brandInput.length >= 2 &&
                        filteredMakes.length > 0 && (
                            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {filteredMakes.map((m, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleBrandSelect(m)}
                                        className={`cursor-pointer border rounded-2xl p-4 shadow hover:shadow-lg transition ${isDark
                                                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                                                : "bg-white border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        <img
                                            src={m.logoUrl}
                                            alt={m.make}
                                            className="w-full h-24 object-contain mb-3"
                                        />
                                        <p className="text-center font-semibold">{m.make}</p>
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

                                {carModels.map((m) => (
                                    <option key={m.id} value={m.name}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>

                            {/* MODEL THUMBNAILS GRID */}
                            {carModels.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3">
                                    {carModels.map((m, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleModelSelect(m.name)}
                                            className={`cursor-pointer border rounded-xl p-2 shadow hover:shadow-lg ${form.vehicleModel === m.name
                                                    ? "ring-2 ring-emerald-500"
                                                    : ""
                                                }`}
                                        >
                                            <img
                                                src={m.thumbnailUrl}
                                                alt={m.name}
                                                className="w-full object-cover rounded-md"
                                            />
                                            <p className="mt-1 text-center text-sm">{m.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                    <SelectField
                        label="Fuel Type"
                        value={form.fuel}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, fuel: e.target.value }))
                        }
                        options={fuelTypes}
                        isDark={isDark}
                    />

                    {/* SEATS */}
                    <SelectField
                        label="Seats"
                        value={form.seats}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, seats: e.target.value }))
                        }
                        options={seatOptions}
                        isDark={isDark}
                    />
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

/* Reusable Select Component */
function SelectField({ label, value, onChange, options, isDark }) {
    return (
        <div>
            <label
                className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                    }`}
            >
                {label}
            </label>

            <select
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 rounded-xl border ${isDark
                        ? "bg-gray-700/50 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
            >
                <option value="">Select {label}</option>

                {(options || []).map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
