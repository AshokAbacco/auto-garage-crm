import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    User,
    Car,
    Images,
    Upload,
    Save,
    ScanLine,
    X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function NewClientForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isDark } = useTheme();

    // ------------------------------
    // FORM STATES
    // ------------------------------
    const [personal, setPersonal] = useState({
        fullName: "",
        phone: "",
        address: "",
        email: "",
    });

    const [vehicle, setVehicle] = useState({
        make: "",
        model: "",
        regNumber: "",
    });

    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // ------------------------------
    // LOAD CLIENT IN EDIT MODE
    // ------------------------------
    useEffect(() => {
        if (!id) return; // Add mode

        const loadClient = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_BASE}/api/washing-clients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Failed to load client");

                const data = await res.json();

                let extras =
                    typeof data.additionalImages === "string"
                        ? JSON.parse(data.additionalImages || "[]")
                        : data.additionalImages || [];

                // Set fields into separate states
                setPersonal({
                    fullName: data.fullName || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    email: data.email || "",
                });

                setVehicle({
                    make: data.vehicleMake || "",
                    model: data.vehicleModel || "",
                    regNumber: data.regNumber || "",
                });

                setMainImage(data.mainImage || null);
                setAdditionalImages(extras);

            } catch (err) {
                toast.error(err.message);
            }
        };

        loadClient();
    }, [id]);

    // ------------------------------
    // HANDLERS
    // ------------------------------
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
            reader.onloadend = () => setMainImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDropMain = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setMainImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImages = (e) => {
        const files = Array.from(e.target.files || []);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () =>
                setAdditionalImages((prev) => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
    };

    const removeAdditional = (index) => {
        setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    };

    // ------------------------------
    // SUBMIT
    // ------------------------------
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Required validations
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
            email: personal.email?.trim() || null,
            address: personal.address?.trim() || null,

            vehicleMake: vehicle.make.trim(),
            vehicleModel: vehicle.model.trim(),
            regNumber: vehicle.regNumber?.trim() || null,

            mainImage: mainImage || null,
            additionalImages,
        };

        try {
            setSaving(true);

            const url = id
                ? `${API_BASE}/api/washing-clients/${id}`
                : `${API_BASE}/api/washing-clients`;

            const method = id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to save client");
            }

            toast.success(id ? "Client updated!" : "Client added!");
            navigate("/washing-clients");

        } catch (err) {
            console.error("Client submit error:", err);
            setError(err.message || "Failed to save client");
        } finally {
            setSaving(false);
        }
    };

    // ------------------------------
    // UI
    // ------------------------------
    return (
        <div className={`min-h-screen p-8 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className={`flex items-center justify-between p-6 mb-8 rounded-2xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-md"}`}>
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {id ? "Edit Client" : "Add Client"}
                        </h1>
                        <p className={isDark ? "text-gray-400" : "text-slate-500"}>
                            Manage customer & vehicle details
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">

                    {/* ERROR BOX */}
                    {!!error && (
                        <div className={`p-3 text-sm rounded-lg ${isDark ? "text-red-400 bg-red-900/20" : "text-red-700 bg-red-100"}`}>
                            {error}
                        </div>
                    )}

                    {/* PERSONAL INFO */}
                    <section className={`p-6 space-y-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-md"}`}>
                        <h2 className={`text-xl font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Personal Information</h2>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={personal.fullName}
                                onChange={handlePersonalChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={personal.phone}
                                onChange={handlePersonalChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={personal.email}
                                onChange={handlePersonalChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                            />
                        </div>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={personal.address}
                                onChange={handlePersonalChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                            />
                        </div>
                    </section>

                    {/* VEHICLE INFO */}
                    <section className={`p-6 space-y-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-md"}`}>
                        <h2 className={`flex items-center gap-2 text-xl font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Car className="w-5 h-5" /> Vehicle Information
                        </h2>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Vehicle Make *</label>
                            <input
                                type="text"
                                name="make"
                                value={vehicle.make}
                                onChange={handleVehicleChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Vehicle Model *</label>
                            <input
                                type="text"
                                name="model"
                                value={vehicle.model}
                                onChange={handleVehicleChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block mb-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-700"}`}>Registration Number</label>
                            <input
                                type="text"
                                name="regNumber"
                                value={vehicle.regNumber}
                                onChange={handleVehicleChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none
                                    ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                            />
                        </div>
                    </section>

                    {/* MAIN IMAGE */}
                    <section className={`p-6 space-y-6 rounded-2xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-md"}`}>
                        <div className="flex items-center justify-between">
                            <h2 className={`flex items-center gap-2 text-xl font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Images className="w-5 h-5" /> Vehicle Images
                            </h2>
                        </div>

                        <div
                            className={`flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl transition-all duration-300 ${isDark ? "border-gray-600 bg-gray-700/50" : "border-gray-300 bg-slate-50/60"}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDropMain}
                        >
                            {mainImage ? (
                                <div className="relative">
                                    <img
                                        src={mainImage}
                                        className="mx-auto mb-4 rounded-lg max-h-64"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMainImage(null)}
                                        className={`absolute p-1 rounded-full shadow top-2 right-2 ${isDark ? "bg-gray-700 text-gray-300" : "bg-white"}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className={`flex items-center justify-center mb-4 rounded-full w-14 h-14 ${isDark ? "bg-blue-500/20" : "bg-violet-50"}`}>
                                        <Upload className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-violet-500"}`} />
                                    </div>
                                    <p className={`mb-1 text-sm font-medium ${isDark ? "text-gray-300" : ""}`}>
                                        Drop main image here or click to upload
                                    </p>
                                </>
                            )}

                            <label className={`inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white border hover:bg-slate-50"}`}>
                                <Upload className="w-4 h-4" />
                                {mainImage ? "Change Image" : "Choose File"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleMainImage}
                                />
                            </label>
                        </div>
                    </section>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/washing-clients")}
                            className={`px-5 py-3 rounded-lg transition-all duration-300 ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "border hover:bg-slate-50"}`}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all duration-300 ${saving ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : id ? "Update Client" : "Save Client"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}