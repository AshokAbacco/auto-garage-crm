import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IndianRupee } from "lucide-react";


import {
    User,
    Calendar,
    Wrench,
    Upload,
    FileText,
    DollarSign,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AddNewServiceForm() {
    const [clientName, setClientName] = useState("");
    const [serviceData, setServiceData] = useState(null);

    const [partsCost, setPartsCost] = useState(0);
    const [partsGst, setPartsGst] = useState(0);

    const [status, setStatus] = useState("PENDING");
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState("");

    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientsError, setClientsError] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState("");

    const [categories, setCategories] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubServiceId, setSelectedSubServiceId] = useState("");

    // Calculate subtotals
    const partsSubtotal = parseFloat(partsCost) || 0;
    const partsWithGst = partsSubtotal + (partsSubtotal * (parseFloat(partsGst) || 0) / 100);


    const estimatedTotal =
        partsSubtotal + (partsSubtotal * (parseFloat(partsGst) || 0)) / 100;


    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { id } = useParams();
    const editMode = Boolean(id);
    const payload = {
        clientId: selectedClientId,
        date,
        categoryId: selectedCategoryId,
        subServiceId: selectedSubServiceId,
        partsCost: Number(partsCost),
        partsGst: Number(partsGst),
        notes,
        status
    };



    useEffect(() => {
        if (!serviceData || categories.length === 0 || clients.length === 0) return;

        setSelectedClientId(String(serviceData.clientId));

        const client = clients.find(c => c.id === Number(serviceData.clientId));
        setClientName(client?.fullName || "");

        setDate(serviceData.date?.split("T")[0]);

        setSelectedCategoryId(String(serviceData.categoryId));

        const category = categories.find(
            c => String(c.id) === String(serviceData.categoryId)
        );

        const subs = category?.subServices || [];
        setSubServices(subs);
        setSelectedSubServiceId(String(serviceData.subServiceId));

        setPartsCost(serviceData.partsCost);
        setPartsGst(serviceData.partsGst);

        setStatus(serviceData.status);
        setNotes(serviceData.notes || "");

    }, [serviceData, categories, clients]);

    // Load washing clients

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setClientsLoading(true);
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_BASE}/api/washing-clients`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to load clients");

                const data = await res.json();
                setClients(data);
                setClientsError(null);
            } catch (err) {
                setClientsError(err.message);
            } finally {
                setClientsLoading(false);
            }
        };

        fetchClients();
    }, []);

    // Load service data for editing
    useEffect(() => {
        if (!editMode || !categories.length || !clients.length) return;

        const loadService = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/washing-services/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            setSelectedClientId(String(data.clientId));
            setClientName(clients.find(c => c.id === data.clientId)?.fullName || "");
            setDate(data.date?.split("T")[0]);

            setSelectedCategoryId(String(data.categoryId));
            const category = categories.find(c => c.id === data.categoryId);
            setSubServices(category?.subServices || []);
            setSelectedSubServiceId(String(data.subServiceId));

            setPartsCost(data.partsCost);
            setPartsGst(data.partsGst);
            setLaborCost(data.laborCost);
            setLaborGst(data.laborGst);
            setStatus(data.status);
            setNotes(data.notes || "");
        };

        loadService();
    }, [editMode, id, categories, clients]);


    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found while loading categories");
                    return;
                }

                const res = await fetch(`${API_BASE}/api/washing-services/types/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const raw = await res.text();

                if (!res.ok) {
                    throw new Error("Failed to load categories");
                }

                const data = JSON.parse(raw);

                if (!Array.isArray(data)) {
                    return;
                }

                setCategories(data);
            } catch (err) {
                console.error("Category load failed:", err);
            }
        };

        loadCategories();
    }, []);

    const handleCategoryChange = (id) => {
        setSelectedCategoryId(id);
        setSelectedSubServiceId("");
        const category = categories.find(c => c.id === Number(id));
        setSubServices(category?.subServices || []);
    };

    // Handle client selection change
    const handleClientChange = (clientId) => {
        setSelectedClientId(clientId);
        const client = clients.find(c => c.id === Number(clientId));
        if (client) {
            setClientName(client.fullName || "");
        }
    };

    const handleCreateOrUpdate = async () => {
        const token = localStorage.getItem("token");

        const payload = {
            clientId: selectedClientId,
            date,
            categoryId: selectedCategoryId,
            subServiceId: selectedSubServiceId,
            partsCost: Number(partsCost),
            partsGst: Number(partsGst),
            notes,
            status
        };

        const url = editMode
            ? `${API_BASE}/api/washing-services/${id}`
            : `${API_BASE}/api/washing-services/create`;

        const method = editMode ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert("Something went wrong");
            return;
        }

        alert(editMode ? "Service Updated Successfully!" : "Service Created Successfully!");
        navigate("/washing-services");
    };


    return (
        <div className="min-h-screen p-6 bg-gray-50 md:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 mb-6 bg-white shadow-sm rounded-2xl">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {editMode ? "Edit Service" : "Add New Service"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your service record easily
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/washing-services")}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors text-emerald-600 hover:text-emerald-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                {/* Main Card */}
                <div className="p-6 space-y-6 bg-white shadow-sm rounded-2xl">

                    {/* Client Selection and Name */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <User className="w-4 h-4" />
                                Select Client
                            </label>

                            <select
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                                value={selectedClientId}
                                onChange={(e) => handleClientChange(e.target.value)}
                                disabled={clientsLoading || !!clientsError}
                            >
                                {clientsLoading && (
                                    <option>Loading clients...</option>
                                )}
                                {!clientsLoading && !clientsError && (
                                    <>
                                        <option value="">Select Client</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.fullName}
                                            </option>
                                        ))}
                                    </>
                                )}
                                {clientsError && (
                                    <option>{clientsError}</option>
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <User className="w-4 h-4" />
                                Edit Client Name
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Client name will appear here"
                                disabled={!selectedClientId}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Date + Category */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Calendar className="w-4 h-4" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Wrench className="w-4 h-4" />
                                Service Category
                            </label>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sub-service */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <Wrench className="w-4 h-4" />
                            Sub-Service
                        </label>
                        <select
                            value={selectedSubServiceId}
                            onChange={(e) => setSelectedSubServiceId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                            disabled={!selectedCategoryId}
                        >
                            <option value="">Select Sub-Service</option>
                            {subServices.map(ss => (
                                <option key={ss.id} value={ss.id}>{ss.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <FileText className="w-4 h-4" />
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter additional notes or details..."
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none resize-none"
                        />
                    </div>

                    {/* Upload Media */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <Upload className="w-4 h-4" />
                            Upload Media (Images/Files)
                        </label>

                        <div className="flex items-center overflow-hidden border rounded-lg border-slate-300">
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-r bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                Choose Files
                            </button>

                            <span className="px-3 py-2.5 text-sm text-slate-400">
                                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "No file chosen"}
                            </span>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-3">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center p-2 bg-white border rounded-lg shadow-sm"
                                    >
                                        {file.type.startsWith("image/") ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="object-cover w-24 h-24 rounded"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded">
                                                📄
                                            </div>
                                        )}

                                        <span className="mt-2 text-xs text-center text-slate-700">
                                            {file.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Parts Section */}
                    <div className="p-4 border rounded-lg border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2 mb-4">
                            <IndianRupee className="w-5 h-5 text-slate-700" />

                            <h3 className="font-semibold text-slate-800">Service</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Service Cost (₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(e.target.value)}
                                    placeholder="₹ 0.00"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Service GST (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partsGst}
                                    onChange={(e) => setPartsGst(e.target.value)}
                                    placeholder="e.g., 18"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="px-3 py-2.5 text-sm bg-white border rounded-lg border-slate-300">
                                    <div className="text-xs text-slate-500">
                                        Subtotal: ₹{partsSubtotal.toFixed(2)}
                                    </div>
                                    <div className="font-medium text-slate-700">
                                        With GST: ₹{partsWithGst.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Status */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <CheckCircle className="w-4 h-4" />
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full md:w-48 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                        <div className="text-base font-semibold text-slate-800">
                            Estimated Total:
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹{estimatedTotal.toFixed(2)}
                            </div>

                            <button
                                onClick={handleCreateOrUpdate}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {editMode ? "Update Service" : "Create Service"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}