// src/AddClient.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Car,
    Images,
    Upload,
    Save,
    ScanLine,
    X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function NewClientForm() {
    const navigate = useNavigate();

    const [personal, setPersonal] = useState({
        fullName: "",
        phone: "",
        address: "",
    });

    const [vehicle, setVehicle] = useState({
        make: "",
        model: "",
    });

    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setPersonal((prev) => ({ ...prev, [name]: value }));
    };

    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        setVehicle((prev) => ({ ...prev, [name]: value }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDropMain = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImages = (e) => {
        const files = Array.from(e.target.files || []);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImages((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAdditional = (index) => {
        setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!personal.fullName.trim() || !personal.phone.trim()) {
            setError("Full name and phone are required");
            return;
        }

        if (!vehicle.make.trim() || !vehicle.model.trim()) {
            setError("Vehicle make and model are required");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("You are not logged in");
            return;
        }

        const payload = {
            fullName: personal.fullName.trim(),
            phone: personal.phone.trim(),
            address: personal.address?.trim() || null,
            vehicleMake: vehicle.make.trim(),
            vehicleModel: vehicle.model.trim(),
            mainImage: mainImage || null,
            // ✅ send as array; backend will JSON.stringify
            additionalImages,
        };

        try {
            setSaving(true);

            const res = await fetch(`${API_BASE}/api/washing-clients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ needed because of router.use(protect)
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to create client");
            }

            navigate("/washing-clients");
        } catch (err) {
            console.error("AddClient submit error:", err);
            setError(err.message || "Failed to create client");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between p-6 mb-8 bg-white shadow rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-semibold">New Client</h1>
                        <p className="text-slate-500">Manage customer & vehicle details</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow bg-violet-600"
                    >
                        <ScanLine className="w-4 h-4" />
                        Scan RC
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    {!!error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                            {error}
                        </div>
                    )}

                    {/* Personal Info */}
                    <section className="p-6 space-y-4 bg-white shadow rounded-2xl">
                        <h2 className="text-xl font-medium">Personal Information</h2>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={personal.fullName}
                                onChange={handlePersonalChange}
                                placeholder="Enter full name"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={personal.phone}
                                onChange={handlePersonalChange}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-800"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={personal.address}
                                onChange={handlePersonalChange}
                                placeholder="Enter address"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </section>

                    {/* Vehicle Info */}
                    <section className="p-6 space-y-4 bg-white shadow rounded-2xl">
                        <h2 className="flex items-center gap-2 text-xl font-medium">
                            <Car className="w-5 h-5" /> Vehicle Information
                        </h2>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Vehicle Make <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="make"
                                value={vehicle.make}
                                onChange={handleVehicleChange}
                                placeholder="e.g. Toyota"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Vehicle Model <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={vehicle.model}
                                onChange={handleVehicleChange}
                                placeholder="e.g. Corolla"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>
                    </section>

                    {/* Images */}
                    <section className="p-6 space-y-6 bg-white shadow rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-xl font-medium">
                                    <Images className="w-5 h-5" /> Vehicle Images
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Upload main photo
                                </p>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div
                            className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl border-slate-200 bg-slate-50/60"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDropMain}
                        >
                            {mainImage ? (
                                <div className="relative">
                                    <img
                                        src={mainImage}
                                        alt="Main vehicle"
                                        className="mx-auto mb-4 rounded-lg max-h-64"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMainImage(null)}
                                        className="absolute p-1 bg-white rounded-full shadow top-2 right-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-violet-50">
                                        <Upload className="w-6 h-6 text-violet-500" />
                                    </div>
                                    <p className="mb-1 text-sm font-medium text-slate-700">
                                        Drop main image here or click to upload
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        This will be used as the primary vehicle photo.
                                    </p>
                                </>
                            )}

                            <label className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium bg-white border rounded-lg cursor-pointer hover:bg-slate-50">
                                <Upload className="w-4 h-4" />
                                {mainImage ? "Change Image" : "Choose File"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleMainImage}
                                />
                            </label>

                            <p className="mt-2 text-xs text-slate-400">JPG, PNG • Max 5MB</p>
                        </div>

                        {/* Additional Images */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Additional Images
                            </label>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleAdditionalImages}
                                className="mb-4"
                            />

                            {additionalImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4">
                                    {additionalImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Vehicle ${idx + 1}`}
                                                className="object-cover w-full rounded-lg h-28"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAdditional(idx)}
                                                className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full shadow opacity-0 top-1 right-1 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/washing-clients")}
                            className="px-5 py-3 border rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : "Save Client"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
