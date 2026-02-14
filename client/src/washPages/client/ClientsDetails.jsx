import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Edit,
    Save,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Car,
    Hash,
    User,
    Image as ImageIcon,
    RotateCw,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function WashingClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        vehicleMake: "",
        vehicleModel: "",
        regNumber: "",
        mainImage: "",
        additionalImages: [],
    });

    // Load client data
    useEffect(() => {
        loadClient();
    }, []);

    async function loadClient() {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/api/washing-clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to load client");

            const data = await res.json();

            const extra =
                typeof data.additionalImages === "string"
                    ? JSON.parse(data.additionalImages)
                    : data.additionalImages || [];

            const cleaned = { ...data, additionalImages: extra };

            setClient(cleaned);
            setForm(cleaned);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const change = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    async function saveChanges() {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/api/washing-clients/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Update failed");

            toast.success("Client updated successfully");

            setClient(form);
            setIsEditMode(false);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function deleteClient() {
        if (!confirm("Delete this client?")) return;

        try {
            const token = localStorage.getItem("token");

            await fetch(`${API_BASE}/api/washing-clients/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Client deleted");
            navigate("/washing-clients");
        } catch {
            toast.error("Delete failed");
        }
    }

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-100"
                    }`}
            >
                <RotateCw className="w-16 h-16 text-blue-500 animate-spin" />
                <p className={`ml-3 text-lg ${isDark ? "text-gray-300" : ""}`}>Loading client details...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className={`p-10 text-center transition-all duration-300 ${isDark ? "bg-gray-900" : ""}`}>
                <h2 className={`text-xl ${isDark ? "text-white" : ""}`}>Client not found</h2>
            </div>
        );
    }

    // UI START
    return (
        <div
            className={`min-h-screen p-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
                }`}
        >
            <Toaster />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/washing-clients")}
                            className={`p-3 rounded-xl shadow hover:scale-105 transition-all duration-300 ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700"
                                }`}
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-sky-600 bg-clip-text">
                                {client.fullName}
                            </h1>
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                                Washing Client Details
                            </p>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3">
                        {!isEditMode ? (
                            <>
                                <ButtonGradient label="Edit" icon={<Edit size={18} />} color="blue" onClick={() => setIsEditMode(true)} />
                                <ButtonGradient label="Delete" icon={<Trash2 size={18} />} color="red" onClick={deleteClient} />
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setForm(client);
                                    }}
                                    className={`px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    Cancel
                                </button>

                                <ButtonGradient label="Save Changes" icon={<Save size={18} />} color="green" onClick={saveChanges} />
                            </>
                        )}
                    </div>
                </div>

                {/* CONTACT INFORMATION */}
                <Section title="Contact Information" icon={<User />} isDark={isDark}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {isEditMode ? (
                            <>
                                <EditInput label="Full Name" name="fullName" value={form.fullName} onChange={change} icon={<User />} isDark={isDark} />
                                <EditInput label="Phone" name="phone" value={form.phone} onChange={change} icon={<Phone />} isDark={isDark} />
                                <EditInput label="Email" name="email" value={form.email} onChange={change} icon={<Mail />} isDark={isDark} />
                                <EditInput label="Address" name="address" value={form.address} onChange={change} icon={<MapPin />} isDark={isDark} />
                            </>
                        ) : (
                            <>
                                <InfoCard icon={<User />} label="Full Name" value={client.fullName} isDark={isDark} />
                                <InfoCard icon={<Phone />} label="Phone" value={client.phone} isDark={isDark} />
                                <InfoCard icon={<Mail />} label="Email" value={client.email} isDark={isDark} />
                                <InfoCard icon={<MapPin />} label="Address" value={client.address} isDark={isDark} />
                            </>
                        )}
                    </div>
                </Section>

                {/* VEHICLE INFORMATION */}
                <Section title="Vehicle Information" icon={<Car />} isDark={isDark}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {isEditMode ? (
                            <>
                                <EditInput label="Make" name="vehicleMake" value={form.vehicleMake} onChange={change} icon={<Car />} isDark={isDark} />
                                <EditInput label="Model" name="vehicleModel" value={form.vehicleModel} onChange={change} icon={<Car />} isDark={isDark} />
                                <EditInput label="Registration" name="regNumber" value={form.regNumber} onChange={change} icon={<Hash />} isDark={isDark} />
                            </>
                        ) : (
                            <>
                                <InfoCard icon={<Car />} label="Make" value={client.vehicleMake} isDark={isDark} />
                                <InfoCard icon={<Car />} label="Model" value={client.vehicleModel} isDark={isDark} />
                                <InfoCard icon={<Hash />} label="Registration" value={client.regNumber} isDark={isDark} />
                            </>
                        )}
                    </div>
                </Section>

                {/* IMAGES */}
                <Section title="Vehicle Images" icon={<ImageIcon />} isDark={isDark}>
                    {/* MAIN IMAGE */}
                    <div className="mb-6">
                        <h3 className={`mb-3 font-semibold ${isDark ? "text-white" : ""}`}>Main Image</h3>

                        {client.mainImage ? (
                            <img
                                src={client.mainImage}
                                className="mx-auto shadow rounded-xl max-h-80"
                            />
                        ) : (
                            <p className={isDark ? "text-gray-400" : ""}>No main image uploaded</p>
                        )}
                    </div>

                    {client.additionalImages.length > 0 && (
                        <>
                            <h3 className={`mb-3 font-semibold ${isDark ? "text-white" : ""}`}>Additional Images</h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {client.additionalImages.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        className="object-cover w-full h-32 shadow rounded-xl"
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </Section>
            </div>
        </div>
    );
}

// REUSABLE COMPONENTS --------------------------------------------------------

function Section({ title, icon, isDark, children }) {
    return (
        <div
            className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
        >
            <h2 className={`flex items-center gap-2 mb-6 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                <span className="text-blue-500">{icon}</span>
                {title}
            </h2>

            {children}
        </div>
    );
}

function InfoCard({ icon, label, value, isDark }) {
    return (
        <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-700/50" : "bg-gray-50"
                }`}
        >
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-gradient-to-br from-blue-500 to-sky-600">
                {icon}
            </div>

            <div>
                <p className={`text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {label}
                </p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function EditInput({ icon, label, name, value, onChange, isDark }) {
    return (
        <div>
            <label className={`flex items-center block gap-2 mb-2 font-semibold ${isDark ? "text-gray-300" : ""}`}>
                <span className="text-blue-500">{icon}</span>
                {label}
            </label>

            <input
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${isDark
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                    : "bg-gray-50 border-gray-300"
                    }`}
            />
        </div>
    );
}

function ButtonGradient({ label, icon, onClick, color }) {
    const colors = {
        blue: "from-blue-500 to-sky-600",
        red: "from-red-500 to-pink-600",
        green: "from-green-500 to-emerald-600",
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-white shadow-lg bg-gradient-to-r ${colors[color]} hover:scale-105 transition-all duration-300`}
        >
            {icon}
            {label}
        </button>
    );
}