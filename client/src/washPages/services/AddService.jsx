import React, { useEffect, useState, useRef } from "react";
import { IndianRupee, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Package, Trash2, Plus } from "lucide-react";


import {
    User,
    Calendar,
    Wrench,
    Upload,
    FileText,
    DollarSign,
    CheckCircle,
    ArrowLeft,
    Tag,
} from "lucide-react";




const API_BASE = "http://localhost:5001";

export default function AddNewServiceForm() {
    // Theme state


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

    // New states for autocomplete
    const [categoryQuery, setCategoryQuery] = useState("");
    const [subServiceQuery, setSubServiceQuery] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSubServiceDropdown, setShowSubServiceDropdown] = useState(false);

    // Calculate subtotals
    const partsSubtotal = parseFloat(partsCost) || 0;
    const partsWithGst = partsSubtotal + (partsSubtotal * (parseFloat(partsGst) || 0) / 100);

    const estimatedTotal =
        partsSubtotal + (partsSubtotal * (parseFloat(partsGst) || 0)) / 100;

    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const navigate = useNavigate();
    const [allSubServices, setAllSubServices] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newSubServiceName, setNewSubServiceName] = useState("");
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddSubService, setShowAddSubService] = useState(false);

    const [discountType, setDiscountType] = useState("FIXED"); // FIXED | PERCENT
    const [discountValue, setDiscountValue] = useState(0);
    const [advancePaidInput, setAdvancePaidInput] = useState(0);

    const [items, setItems] = useState([
        {
            type: "Part",
            name: "",
            qty: 1,
            price: 0,
            cgst: 0,
            sgst: 0,
        },
    ]);
    const updateItem = (index, key, value) => {
        const updated = [...items];
        updated[index][key] = value;
        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            { type: "Part", name: "", qty: 1, price: 0, cgst: 0, sgst: 0 },
        ]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const itemTotal = (item) => {
        const base = item.qty * item.price;
        const tax = base * ((item.cgst + item.sgst) / 100);
        return base + tax;
    };


    // ===== Billing Summary Calculations =====
    const partsSubtotalCalc = items
        .filter(i => i.type === "Part")
        .reduce((sum, i) => sum + i.qty * i.price, 0);

    const laborSubtotalCalc = items
        .filter(i => i.type === "Labor")
        .reduce((sum, i) => sum + i.qty * i.price, 0);

    const cgstTotalCalc = items.reduce(
        (sum, i) => sum + (i.qty * i.price * i.cgst) / 100,
        0
    );

    const sgstTotalCalc = items.reduce(
        (sum, i) => sum + (i.qty * i.price * i.sgst) / 100,
        0
    );

    // ✅ discount FIRST
    const discount =
        discountType === "PERCENT"
            ? (partsSubtotalCalc + laborSubtotalCalc) * (discountValue / 100)
            : discountValue;

    // ✅ advance paid NEXT
    const advancePaid = advancePaidInput;

    // ✅ grand total AFTER discount
    const grandTotalCalc =
        partsSubtotalCalc +
        laborSubtotalCalc +
        cgstTotalCalc +
        sgstTotalCalc -
        discount;

    // ✅ balance due LAST
    const balanceDueCalc = grandTotalCalc - advancePaid;

    // Apply theme to document
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains("dark")
    );


    // Toggle theme function

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

        // Set the category query for display
        if (category) {
            setCategoryQuery(category.name);
        }

        const subs = category?.subServices || [];
        setSubServices(subs);
        setSelectedSubServiceId(String(serviceData.subServiceId));

        // Set the sub-service query for display
        const subService = subs.find(s => String(s.id) === String(serviceData.subServiceId));
        if (subService) {
            setSubServiceQuery(subService.name);
        }

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

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/api/washing-services/types/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                setCategories(data);

                // 🔥 FLATTEN ALL SUB-SERVICES
                const allSubs = data.flatMap(cat =>
                    (cat.subServices || []).map(sub => ({
                        ...sub,
                        categoryId: cat.id,
                        categoryName: cat.name,
                    }))
                );

                setAllSubServices(allSubs);
            } catch (err) {
                console.error(err);
            }
        };

        loadCategories();
    }, []);


    const handleCategoryChange = (id, name) => {
        setSelectedCategoryId(id);
        setCategoryQuery(name);
        setSelectedSubServiceId("");
        setSubServiceQuery("");
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

        const url = `${API_BASE}/api/washing-services/create`;
        const method = "POST";
        console.log("TOKEN:", localStorage.getItem("token"));

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

        alert("Service Created Successfully!");
    };
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return alert("Enter category name");

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/washing-services/types/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newCategoryName }),
        });

        if (!res.ok) return alert("Failed to create category");

        const created = await res.json();
        setCategories(prev => [...prev, created]);
        setCategoryQuery(created.name);
        setSelectedCategoryId(created.id);
        setShowAddCategory(false);
        setNewCategoryName("");
    };
    const handleAddSubService = async () => {
        if (!selectedCategoryId) return alert("Select category first");
        if (!newSubServiceName.trim()) return alert("Enter sub-service name");

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/washing-services/sub/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: newSubServiceName,
                categoryId: selectedCategoryId,
            }),
        });

        if (!res.ok) return alert("Failed to create sub-service");

        const created = await res.json();

        setAllSubServices(prev => [...prev, created]);
        setSubServiceQuery(created.name);
        setSelectedSubServiceId(created.id);
        setShowAddSubService(false);
        setNewSubServiceName("");
    };


    return (
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 md:p-10">

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-5 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm rounded-2xl`}>
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Add New Service
                        </h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            Manage your service record easily
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/washing-services")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                </div>


                {/* Main Card */}
                <div className={`p-6 space-y-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm rounded-2xl`}>

                    {/* Client Selection and Name */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                                <User className="w-4 h-4" />
                                Select Client
                            </label>

                            <select
                                className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none`}
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


                    </div>

                    {/* Date + Category */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                                <Calendar className="w-4 h-4" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none`}
                            />
                        </div>


                        {/* Category with Autocomplete */}
                        <div className="relative space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Tag className="w-4 h-4" />
                                    Service Category
                                </label>


                            </div>
                            {showAddCategory && (
                                <div className="flex gap-2">
                                    <input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="New category name"
                                        className="flex-1 px-3 py-2 text-sm border rounded-lg"
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="px-4 py-2 text-sm text-white rounded-lg bg-emerald-600"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}



                            <input
                                type="text"
                                value={categoryQuery}
                                placeholder="Type category name..."
                                onFocus={() => setShowCategoryDropdown(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setShowCategoryDropdown(true);
                                    }
                                    if (e.key === "Escape") {
                                        setShowCategoryDropdown(false);
                                    }
                                }}
                                onChange={(e) => {
                                    setCategoryQuery(e.target.value);
                                    setSelectedCategoryId("");
                                    setSelectedSubServiceId("");
                                    setSubServiceQuery("");
                                    setShowCategoryDropdown(true);
                                }}
                                className="w-full rounded-lg border px-3 py-2.5"
                            />
                            {/* Category Dropdown */}
                            {showCategoryDropdown && (
                                <div
                                    className={`absolute z-20 w-full mt-1 overflow-auto ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-300'
                                        } border rounded-lg shadow-lg max-h-48`}
                                >
                                    {categories
                                        .filter(c =>
                                            categoryQuery
                                                ? c.name.toLowerCase().includes(categoryQuery.toLowerCase())
                                                : true
                                        )
                                        .map(c => (
                                            <div
                                                key={c.id}
                                                onMouseDown={() => {
                                                    handleCategoryChange(c.id, c.name);
                                                    setShowCategoryDropdown(false);
                                                }}

                                                className={`px-4 py-2 cursor-pointer ${isDarkMode
                                                    ? 'hover:bg-emerald-600'
                                                    : 'hover:bg-emerald-500'
                                                    } hover:text-white`}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Sub-service with Autocomplete */}
                    <div className="relative space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Wrench className="w-4 h-4" />
                                Sub-Service
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowAddSubService(true)}
                                className="text-sm text-emerald-600 hover:underline"
                            >
                                + Add Sub-Service
                            </button>
                        </div>
                        {showAddSubService && (
                            <div className="flex gap-2">
                                <input
                                    value={newSubServiceName}
                                    onChange={(e) => setNewSubServiceName(e.target.value)}
                                    placeholder="New sub-service name"
                                    className="flex-1 px-3 py-2 text-sm border rounded-lg"
                                />
                                <button
                                    onClick={handleAddSubService}
                                    className="px-4 py-2 text-sm text-white rounded-lg bg-emerald-600"
                                >
                                    Save
                                </button>
                            </div>
                        )}


                        <input
                            type="text"
                            value={subServiceQuery}
                            placeholder="Type sub-service name..."
                            onFocus={() => setShowSubServiceDropdown(true)}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setShowSubServiceDropdown(true);
                                }
                                if (e.key === "Escape") {
                                    setShowSubServiceDropdown(false);
                                }
                            }}
                            onChange={(e) => {
                                setSubServiceQuery(e.target.value);
                                setSelectedSubServiceId("");
                                setShowSubServiceDropdown(true);
                            }}
                            className="w-full rounded-lg border px-3 py-2.5"
                        />

                        {/* Sub Service Dropdown */}
                        {showSubServiceDropdown && selectedCategoryId && (
                            <div className="absolute z-20 w-full mt-1 overflow-auto bg-white border rounded-lg shadow-lg max-h-48">
                                {subServices
                                    .filter(s =>
                                        subServiceQuery
                                            ? s.name.toLowerCase().includes(subServiceQuery.toLowerCase())
                                            : true
                                    )
                                    .map(s => (
                                        <div
                                            key={s.id}
                                            onMouseDown={() => {
                                                setSubServiceQuery(s.name);
                                                setSelectedSubServiceId(String(s.id));
                                                setShowSubServiceDropdown(false);
                                            }}
                                            className="px-4 py-2 cursor-pointer hover:bg-emerald-500 hover:text-white"
                                        >
                                            {s.name}
                                        </div>
                                    ))}
                            </div>
                        )}


                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                            <FileText className="w-4 h-4" />
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter additional notes or details..."
                            rows={4}
                            className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none resize-none`}
                        />
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                            ₹ Cost Breakdown
                        </h3>

                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white border shadow-sm rounded-2xl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                                            <Package className="w-4 h-4 text-gray-600" />
                                        </div>

                                        Item #{index + 1}
                                    </div>

                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                </div>

                                {/* Inputs */}
                                <div className="grid gap-4 md:grid-cols-6">

                                    <div>
                                        <label className="block mb-1 text-sm">Type</label>
                                        <select
                                            value={item.type}
                                            onChange={(e) =>
                                                updateItem(index, "type", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option>Part</option>
                                            <option>Labor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Item name"
                                            value={item.name}
                                            onChange={(e) =>
                                                updateItem(index, "name", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm">Qty</label>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) =>
                                                updateItem(index, "qty", Number(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>


                                    <div>
                                        <label className="block mb-1 text-sm">Unit Price</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                updateItem(index, "price", Number(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm">CGST %</label>
                                        <input
                                            type="number"
                                            value={item.cgst}
                                            onChange={(e) =>
                                                updateItem(index, "cgst", Number(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm">SGST %</label>
                                        <input
                                            type="number"
                                            value={item.sgst}
                                            onChange={(e) =>
                                                updateItem(index, "sgst", Number(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between px-4 py-3 mt-4 rounded-lg bg-gray-50">
                                    <span className="font-medium">Total</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ₹{itemTotal(item).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Add Item */}
                        <div className="flex justify-end">
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>

                        </div>
                    </div>
                    {/* Discount & Advance */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Discount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount Type</label>
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="FIXED">Fixed Amount</option>
                                <option value="PERCENT">Percentage (%)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount Value</label>
                            <input
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Advance Paid */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Advance Paid</label>
                            <input
                                type="number"
                                value={advancePaidInput}
                                onChange={(e) => setAdvancePaidInput(Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>


                    {/* Billing Summary */}
                    <div className="p-6 border-2 border-green-500 rounded-2xl bg-green-50">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                            <IndianRupee className="w-5 h-4 text-emerald-600" />
                            Billing Summary
                        </h3>


                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Side */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Parts Subtotal</span>
                                    <span>₹{partsSubtotalCalc.toFixed(2)}</span>
                                </div>



                                <div className="flex justify-between">
                                    <span>CGST Total</span>
                                    <span>₹{cgstTotalCalc.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>SGST Total</span>
                                    <span>₹{sgstTotalCalc.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Advance Paid</span>
                                    <span>₹{advancePaid.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="text-right">
                                <div className="text-lg font-semibold">Grand Total</div>
                                <div className="text-3xl font-bold text-green-600">
                                    ₹{grandTotalCalc.toFixed(2)}
                                </div>

                                <div className="mt-4">
                                    <div className="font-medium">Balance Due</div>
                                    <div className="text-2xl font-bold text-red-600">
                                        ₹{balanceDueCalc.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Upload Media */}
                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                            <Upload className="w-4 h-4" />
                            Upload Media (Images/Files)
                        </label>

                        <div className={`flex items-center overflow-hidden border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-slate-300'}`}>
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
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-r ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-50 hover:bg-slate-100'}`}
                            >
                                Choose Files
                            </button>

                            <span className={`px-3 py-2.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "No file chosen"}
                            </span>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-3">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col items-center p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border rounded-lg shadow-sm ${isDarkMode ? 'border-gray-600' : 'border-slate-300'}`}
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

                                        <span className={`mt-2 text-xs text-center ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                            {file.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Parts Section
                    <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <IndianRupee className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`} />
                            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>Service</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Service Cost (₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(e.target.value)}
                                    placeholder="₹ 0.00"
                                    className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                    Service GST (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partsGst}
                                    onChange={(e) => setPartsGst(e.target.value)}
                                    placeholder="e.g., 18"
                                    className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none`}
                                />
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className={`px-3 py-2.5 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-slate-300'} border rounded-lg`}>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                        Subtotal: ₹{partsSubtotal.toFixed(2)}
                                    </div>
                                    <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                                        With GST: ₹{partsWithGst.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Status */}
                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                            <CheckCircle className="w-4 h-4" />
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`w-full md:w-48 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none`}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                        <div className={`text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                            Estimated Total:
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹{estimatedTotal.toFixed(2)}
                            </div>

                            <button
                                onClick={handleCreateOrUpdate}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Create Service
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}