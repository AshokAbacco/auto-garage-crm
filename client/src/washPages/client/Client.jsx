// src/Client.jsx
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Client() {
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
        loadClients();
    }, []);
    if (!token) {
        navigate("/login");
        return;
    }

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
            additionalImages: typeof client.additionalImages === 'string'
                ? JSON.parse(client.additionalImages || '[]')
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
            additionalImages: formData.additionalImages, // ✅ array
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

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_BASE}/api/washing-clients`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            setClients(data);
        };

        fetchClients();
    }, []);

    return (
        <div className="min-h-screen p-6 bg-[#f0fbff] text-slate-800">
            {/* HEADER */}
            <div className="mb-6 overflow-hidden shadow rounded-xl">
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
                    className="flex-1 px-4 py-3 bg-white border shadow outline-none rounded-xl placeholder:text-slate-400"
                />
                <button
                    onClick={() => navigate("/addclient")}
                    className="px-5 py-3 text-white font-medium rounded-lg shadow bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]"
                >
                    Add New Client
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-3">
                <Stat title="Total Clients" value={clients.length} icon={Users} />
                <Stat title="Current Page" value="1" icon={FileText} />
                <Stat title="Page" value="1 / 1" icon={Layers} />
            </div>

            {/* CONTENT */}
            <div className="p-6 bg-white border shadow rounded-xl">
                {loading ? (
                    <div className="py-10 text-center">Loading clients...</div>
                ) : error ? (
                    <div className="py-10 text-center text-red-600">{error}</div>
                ) : clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                        <div className="relative w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-[#eaf7ff]">
                            <Users className="w-7 h-7 text-[#0ea5e9] z-10" />
                            <XCircle className="absolute w-9 h-9 text-slate-400" />
                        </div>

                        <h3 className="mb-1 text-lg font-semibold text-slate-800">
                            No clients found
                        </h3>
                        <p className="mb-4 text-sm text-slate-500">
                            Try adding a new client
                        </p>

                        <button
                            onClick={() => navigate("/addclient")}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] text-white shadow-md"
                        >
                            Add Client
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clients.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div>
                                    <div className="font-semibold">{c.fullName}</div>
                                    <div className="text-sm text-slate-500">{c.phone}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(c)}
                                        className="px-3 py-1 text-sm border rounded text-sky-700 hover:bg-sky-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="px-3 py-1 text-sm text-red-600 border rounded hover:bg-red-50"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]">
                            <h2 className="text-xl font-bold text-white">Edit Client</h2>
                            <button onClick={closeEditModal} className="p-1 text-white rounded-full hover:bg-white/20">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            {/* Vehicle Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-slate-700">Vehicle Make</label>
                                    <input
                                        type="text"
                                        name="vehicleMake"
                                        value={formData.vehicleMake}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Honda"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-slate-700">Vehicle Model</label>
                                    <input
                                        type="text"
                                        name="vehicleModel"
                                        value={formData.vehicleModel}
                                        onChange={handleInputChange}
                                        placeholder="e.g., City"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>

                            {/* Main Image */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">Main Vehicle Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.mainImage && (
                                        <img src={formData.mainImage} alt="Main" className="object-cover w-24 h-24 border rounded-lg" />
                                    )}
                                    <label className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50">
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
                                <label className="block mb-1 text-sm font-medium text-slate-700">Additional Images</label>
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
                                <label className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50 w-fit">
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
                                    className="px-4 py-2 border rounded-lg hover:bg-slate-50"
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
function Stat({ title, value, icon: Icon }) {
    return (
        <div className="flex items-center justify-between p-5 bg-white border shadow rounded-xl">
            <div>
                <div className="text-sm text-slate-500">{title}</div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100">
                <Icon className="w-6 h-6 text-sky-600" />
            </div>
        </div>
    );
}