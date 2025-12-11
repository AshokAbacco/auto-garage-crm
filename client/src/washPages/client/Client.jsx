// src/washPages/client/Client.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    FileText,
    Layers,
    XCircle,
    X,
    Upload,
    Trash2,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Client() {
    const { isDark } = useTheme();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        vehicleMake: "",
        vehicleModel: "",
        mainImage: "",
        additionalImages: []
    });
    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        loadClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadClients() {
        try {
            setLoading(true);

            const res = await fetch(`${API_BASE}/api/washing-clients`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Unauthorized");

            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Failed to load clients:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this client?")) return;

        await fetch(`${API_BASE}/api/washing-clients/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setClients((prev) => prev.filter((c) => c.id !== id));
    }

    function openEditModal(client) {
        setEditingClient(client);
        setFormData({
            fullName: client.fullName || "",
            phone: client.phone || "",
            address: client.address || "",
            vehicleMake: client.vehicleMake || "",
            vehicleModel: client.vehicleModel || "",
            mainImage: client.mainImage || "",
            additionalImages: typeof client.additionalImages === "string"
                ? JSON.parse(client.additionalImages || "[]")
                : (Array.isArray(client.additionalImages) ? client.additionalImages : [])
        });
        setShowEditModal(true);
    }

    function closeEditModal() {
        setShowEditModal(false);
        setEditingClient(null);
        setFormData({
            fullName: "",
            phone: "",
            address: "",
            vehicleMake: "",
            vehicleModel: "",
            mainImage: "",
            additionalImages: []
        });
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleMainImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, mainImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }

    function handleAdditionalImagesUpload(e) {
        const files = Array.from(e.target.files);
        const readers = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(results => {
            setFormData(prev => ({
                ...prev,
                additionalImages: [...prev.additionalImages, ...results]
            }));
        });
    }

    function removeAdditionalImage(index) {
        setFormData(prev => ({
            ...prev,
            additionalImages: prev.additionalImages.filter((_, i) => i !== index)
        }));
    }

    async function handleSubmitEdit(e) {
        e.preventDefault();

        const payload = {
            ...formData,
            additionalImages: formData.additionalImages,
        };

        const res = await fetch(
            `${API_BASE}/api/washing-clients/${editingClient.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) throw new Error("Update failed");

        const updated = await res.json();

        setClients((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
        );

        closeEditModal();
    }

    return (
        <div
            className={`min-h-screen p-6 transition-all duration-300 ${isDark
                ? "bg-black text-white"
                : "bg-[#f0fbff] text-slate-800"
                }`}
            style={{
                backgroundColor: isDark ? "#000000" : "#f0fbff",
                color: isDark ? "#ffffff" : "#1e293b"
            }}
        >
            {/* HEADER */}
            <div className="mb-6 overflow-hidden rounded-none shadow">
                <div className="px-8 py-10 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]">
                    <h1 className="text-4xl font-extrabold text-white">
                        Client Management
                    </h1>
                    <p className="mt-2 text-white/90">
                        Manage your clients and their vehicles
                    </p>
                </div>
            </div>

            {/* SEARCH + BUTTON */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, phone..."
                    className={`flex-1 px-4 py-3 border shadow outline-none rounded-xl transition-all duration-300 ${isDark
                        ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                        : "bg-white border-gray-200 placeholder:text-slate-400"
                        }`}
                    style={{
                        backgroundColor: isDark ? "#111827" : "#ffffff",
                        borderColor: isDark ? "#374151" : "#e5e7eb",
                        color: isDark ? "#ffffff" : "#1e293b"
                    }}
                />
                <button
                    onClick={() => navigate("/washing-newclient")}
                    className="px-5 py-3 text-white font-medium rounded-lg shadow bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:opacity-90"
                >
                    Add New Client
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-3">
                <Stat title="Total Clients" value={clients.length} icon={Users} isDark={isDark} />
                <Stat title="Current Page" value="1" icon={FileText} isDark={isDark} />
                <Stat title="Page" value="1 / 1" icon={Layers} isDark={isDark} />
            </div>

            {/* CONTENT */}
            <div
                className={`p-6 border shadow rounded-xl transition-all duration-300 ${isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                style={{
                    backgroundColor: isDark ? "#111827" : "#ffffff",
                    borderColor: isDark ? "#374151" : "#e5e7eb"
                }}
            >
                {loading ? (
                    <div
                        className="py-10 text-center transition-all duration-300"
                        style={{ color: isDark ? "#ffffff" : "#1e293b" }}
                    >
                        Loading clients...
                    </div>
                ) : error ? (
                    <div
                        className="py-10 text-center transition-all duration-300"
                        style={{ color: "#ef4444" }}
                    >
                        {error}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                        <div
                            className="relative flex items-center justify-center w-16 h-16 mb-4 transition-all duration-300 rounded-full"
                            style={{ backgroundColor: isDark ? "#1f2937" : "#eaf7ff" }}
                        >
                            <Users className="w-7 h-7 text-[#0ea5e9] z-10" />
                            <XCircle
                                className="absolute transition-all duration-300 w-9 h-9"
                                style={{ color: isDark ? "#4b5563" : "#94a3b8" }}
                            />
                        </div>

                        <h3
                            className="mb-1 text-lg font-semibold transition-all duration-300"
                            style={{ color: isDark ? "#ffffff" : "#1e293b" }}
                        >
                            No clients found
                        </h3>
                        <p
                            className="mb-4 text-sm transition-all duration-300"
                            style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                        >
                            Try adding a new client
                        </p>

                        <button
                            onClick={() => navigate("/washing-newclient")}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] text-white shadow-md hover:opacity-90"
                        >
                            Add Client
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clients.map((c) => (
                            <div
                                key={c.id}
                                className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-300 ${isDark
                                    ? "border-gray-700 hover:bg-gray-800"
                                    : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                style={{
                                    borderColor: isDark ? "#374151" : "#e5e7eb",
                                    backgroundColor: isDark ? "" : "",
                                    color: isDark ? "#ffffff" : "#1e293b"
                                }}
                            >
                                <div>
                                    <div
                                        className="font-semibold transition-all duration-300"
                                        style={{ color: isDark ? "#ffffff" : "#1e293b" }}
                                    >
                                        {c.fullName}
                                    </div>
                                    <div
                                        className="text-sm transition-all duration-300"
                                        style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                                    >
                                        {c.phone}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(c)}
                                        className={`px-3 py-1 text-sm border rounded transition-all duration-300 ${isDark
                                            ? "border-sky-500 text-sky-400 hover:bg-sky-500/10"
                                            : "border-sky-500 text-sky-700 hover:bg-sky-50"
                                            }`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className={`px-3 py-1 text-sm border rounded transition-all duration-300 ${isDark
                                            ? "border-red-500 text-red-400 hover:bg-red-500/10"
                                            : "border-red-500 text-red-600 hover:bg-red-50"
                                            }`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl transition-all duration-300 ${isDark
                            ? "bg-gray-900"
                            : "bg-white"
                            }`}
                        style={{
                            backgroundColor: isDark ? "#111827" : "#ffffff"
                        }}
                    >
                        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]">
                            <h2 className="text-xl font-bold text-white">Edit Client</h2>
                            <button onClick={closeEditModal} className="p-1 text-white rounded-full hover:bg-white/20">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                    style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                >
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 ${isDark
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300"
                                        }`}
                                    style={{
                                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        color: isDark ? "#ffffff" : "#1e293b"
                                    }}
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                    style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                >
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 ${isDark
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300"
                                        }`}
                                    style={{
                                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        color: isDark ? "#ffffff" : "#1e293b"
                                    }}
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                    style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                >
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 ${isDark
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-300"
                                        }`}
                                    style={{
                                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        color: isDark ? "#ffffff" : "#1e293b"
                                    }}
                                />
                            </div>

                            {/* Vehicle Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                    >
                                        Vehicle Make
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicleMake"
                                        value={formData.vehicleMake}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Honda"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 ${isDark
                                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                                            : "bg-white border-gray-300"
                                            }`}
                                        style={{
                                            backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                            borderColor: isDark ? "#374151" : "#d1d5db",
                                            color: isDark ? "#ffffff" : "#1e293b"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                        style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                    >
                                        Vehicle Model
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicleModel"
                                        value={formData.vehicleModel}
                                        onChange={handleInputChange}
                                        placeholder="e.g., City"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 ${isDark
                                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                                            : "bg-white border-gray-300"
                                            }`}
                                        style={{
                                            backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                            borderColor: isDark ? "#374151" : "#d1d5db",
                                            color: isDark ? "#ffffff" : "#1e293b"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Main Image */}
                            <div>
                                <label
                                    className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                    style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                >
                                    Main Vehicle Image
                                </label>
                                <div className="flex items-center gap-4">
                                    {formData.mainImage && (
                                        <img src={formData.mainImage} alt="Main" className="object-cover w-24 h-24 border rounded-lg" />
                                    )}
                                    <label
                                        className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg cursor-pointer transition-all duration-300 ${isDark
                                            ? "border-gray-700 hover:bg-gray-800 text-gray-200"
                                            : "border-gray-300 hover:bg-slate-50"
                                            }`}
                                        style={{
                                            backgroundColor: isDark ? "" : "",
                                            borderColor: isDark ? "#374151" : "#d1d5db",
                                            color: isDark ? "#e5e7eb" : "#1e293b"
                                        }}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {formData.mainImage ? "Change Image" : "Upload Image"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMainImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Additional Images */}
                            <div>
                                <label
                                    className={`block mb-1 text-sm font-medium transition-all duration-300`}
                                    style={{ color: isDark ? "#e5e7eb" : "#334155" }}
                                >
                                    Additional Images
                                </label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {formData.additionalImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} alt={`Additional ${idx + 1}`} className="object-cover w-full h-20 border rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => removeAdditionalImage(idx)}
                                                className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label
                                    className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg cursor-pointer w-fit transition-all duration-300 ${isDark
                                        ? "border-gray-700 hover:bg-gray-800 text-gray-200"
                                        : "border-gray-300 hover:bg-slate-50"
                                        }`}
                                    style={{
                                        backgroundColor: isDark ? "" : "",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        color: isDark ? "#e5e7eb" : "#1e293b"
                                    }}
                                >
                                    <Upload className="w-4 h-4" />
                                    Add More Images
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAdditionalImagesUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className={`px-4 py-2 border rounded-lg transition-all duration-300 ${isDark
                                        ? "border-gray-700 hover:bg-gray-800 text-gray-200"
                                        : "border-gray-300 hover:bg-slate-50"
                                        }`}
                                    style={{
                                        backgroundColor: isDark ? "" : "",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        color: isDark ? "#e5e7eb" : "#1e293b"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:opacity-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

}

/* Reusable stat card */
function Stat({ title, value, icon: Icon, isDark }) {
    return (
        <div
            className={`flex items-center justify-between p-5 border shadow rounded-xl transition-all duration-300 ${isDark
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
                }`}
            style={{
                backgroundColor: isDark ? "#111827" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb"
            }}
        >
            <div>
                <div
                    className="text-sm transition-all duration-300"
                    style={{ color: isDark ? "#9ca3af" : "#64748b" }}
                >
                    {title}
                </div>
                <div
                    className="mt-2 text-2xl font-bold transition-all duration-300"
                    style={{ color: isDark ? "#ffffff" : "#1e293b" }}
                >
                    {value}
                </div>
            </div>
            <div
                className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f1f5f9" }}
            >
                <Icon className="w-6 h-6 text-sky-600" />
            </div>
        </div>
    );
}