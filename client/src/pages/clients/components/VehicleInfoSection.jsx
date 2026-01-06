// VehicleInfoSection.jsx
import React, { useState, useEffect } from "react";
import { FiCalendar, FiHash } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

// Assume InputField and SelectField components are defined elsewhere or included below
// For simplicity, I will include the updated SelectField and InputField for modern styling

// --- Reusable Input Component (Updated Styling) ---
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
                className={`block text-sm font-medium mb-1.5 flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-700"
                    }`}
            >
                <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
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
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border focus:ring-2 focus:ring-emerald-500 transition duration-150 ${isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 placeholder-gray-400 focus:border-emerald-500"
                    }`}
            />
        </div>
    );
}

// --- Reusable Select Component (Updated Styling) ---
function SelectField({ label, value, onChange, options, isDark }) {
    return (
        <div>
            <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-black" : "text-gray-700"
                    }`}
            >
                {label}
            </label>

            <select
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition duration-150 ${isDark
                    ? "bg-gray-800 border-gray-700 text-black"
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
                    }`}
            >
                <option value="">Select {label}</option>

                {(options || []).map((opt) => (
                    <option key={opt} value={opt} className="text-black" >
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

// --- Main Component ---
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

    // useEffect(() => {
    //   console.log("PLAN:", userPlan);
    //   console.log("INPUT:", brandInput);
    //   console.log("MATCHES:", filteredMakes.length);
    // }, [brandInput, filteredMakes, userPlan]);


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
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
                } rounded-xl shadow-2xl border`} // Modernized shadow and border
        >
            {/* Header */}
            <div
                className={`px-6 py-4 border-b ${isDark
                    ? "border-gray-700/70 bg-gray-800/50"
                    : "border-gray-100 bg-emerald-50/70"
                    } rounded-t-xl`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isDark ? "text-emerald-400" : "text-emerald-600"
                            } bg-emerald-500/10`}
                    >
                        <FaCar />
                    </div>
                    <div>
                        <h2 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Vehicle Information
                        </h2>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Vehicle details and registration
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* MODEL FIELD - Moved to right side of BRAND */}
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
                        <div>
                            <SelectField
                                label="Vehicle Model"
                                value={form.vehicleModel}
                                onChange={(e) => handleModelSelect(e.target.value)}
                                options={carModels.map(m => m.name)} // Pass names for basic dropdown
                                isDark={isDark}
                            />
                        </div>
                    )}
                </div>

                {/* BRAND LOGO CARDS (Standard & Premium) - Below the input fields */}
                {userPlan !== "BASIC" &&
                    brandInput.length >= 2 &&
                    filteredMakes.length > 0 && (
                        <div className="mt-5">
                            <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Select Make
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {filteredMakes.map((m, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleBrandSelect(m)}
                                        className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center hover:ring-2 ring-emerald-500 transition duration-200 ${isDark
                                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        <img
                                            src={m.logoUrl}
                                            alt={m.make}
                                            className="w-full h-12 object-contain mb-2"
                                        />
                                        <p className="text-center text-xs font-semibold">{m.make}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                {/* MODEL THUMBNAILS GRID (Standard & Premium) - Below inputs/brand cards */}
                {userPlan !== "BASIC" && carModels.length > 0 && (
                    <div className="mt-6">
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Choose Model
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {carModels.map((m, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleModelSelect(m.name)}
                                    // Disable right-click on the model card
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`cursor-pointer border rounded-xl p-2.5 flex flex-col items-center transition duration-200 ${form.vehicleModel === m.name
                                        ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md"
                                        : isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="w-full aspect-video flex items-center justify-center overflow-hidden">
                                        <img
                                            src={m.thumbnailUrl}
                                            alt={m.name}
                                            // Enforce uniform image size/fit
                                            className="w-full h-24 object-contain rounded-md"
                                        />
                                    </div>
                                    <p className="mt-2 text-center text-base font-semibold">
                                        {m.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                <div className="mt-6">
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

// NOTE: InputField and SelectField definitions were included above for completeness.