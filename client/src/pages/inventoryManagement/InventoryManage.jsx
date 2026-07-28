import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    FiBox,
    FiPlus,
    FiSearch,
    FiEdit3,
    FiTrash2,
    FiAlertTriangle,
    FiCheckCircle,
    FiTrendingUp,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import { currency } from "../../utils";
import {
    createInventory,
    deleteInventory,
    getInventory,
    updateInventory,
    createSupplier,
    getSuppliers, deductInventory
} from "./api/inventoryApi";

const emptyForm = {
    itemCode: "",
    itemName: "",
    category: "",
    brand: "",
    model: "",
    partNumber: "",
    supplier: "",
    supplierPhone: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    minimumStock: "5",
    unit: "pcs",
    location: "",
    description: "",
    image: "",
    status: "Available",
};

const InventoryManage = () => {
    const { isDark } = useTheme();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [brandFilter, setBrandFilter] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [deductModalOpen, setDeductModalOpen] = useState(false);
    const [supplierData, setSupplierData] = useState({
        supplierName: "",
        supplierContact: "",
    });
    const [suppliers, setSuppliers] = useState([]);
    const [deductData, setDeductData] = useState({
        itemCode: "",
        quantity: "",
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deductList, setDeductList] = useState([]);

    // Initialize state as an array of item rows
    const [deductData2, setDeductData2] = useState([{ itemCode: "", quantity: "" }]);

    // Update dynamic inputs
    const handleRowChange = (index, field, value) => {
        const updated = [...deductData2];
        updated[index][field] = value;
        setDeductData2(updated);
    };

    // Add a fresh blank item selector
    const addDeductRow = () => {
        setDeductData2([...deductData2, { itemCode: "", quantity: "" }]);
    };

    // Remove specific item row
    const removeDeductRow = (index) => {
        setDeductData2(deductData2.filter((_, i) => i !== index));
    };

    const loadSuppliers = async () => {
        try {
            const response = await getSuppliers();
            console.log("Suppliers loaded:", response.data); // Log the response data for debugging

            // response.data = [{id, supplierName, supplierContact}, ...]
            setSuppliers(response.data || []);

        } catch (err) {
            console.error("Failed to load suppliers", err);
        }
    };

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            if (!localStorage.getItem("token")) {
                setItems([]);
                setLoading(false);
                return;
            }

            const response = await getInventory();
            const inventoryItems = response?.data || [];

            const mappedItems = inventoryItems.map((item) => ({
                id: item.id,
                rowId: item.id,
                itemCode: item.itemCode || "",
                itemName: item.itemName || "",
                category: item.category || "",
                brand: item.brand || "",
                model: item.model || "",
                partNumber: item.partNumber || "",
                supplier: item.supplier || "",
                supplierPhone: item.supplierPhone || "",
                purchasePrice: Number(item.purchasePrice || 0),
                sellingPrice: Number(item.sellingPrice || 0),
                quantity: Number(item.quantity || 0),
                minimumStock: Number(item.minimumStock || 0),
                unit: item.unit || "pcs",
                location: item.location || "",
                description: item.description || "",
                image: item.image || "",
                status: item.status || "Available",
            }));

            setItems(mappedItems);
        } catch (err) {
            console.error("Failed to load inventory", err);
            setError("Unable to load inventory from the database right now.");
        } finally {
            setLoading(false);
        }
    };
    const brands = ["All", ...new Set(items.map((item) => item.brand).filter(Boolean)),];

    useEffect(() => {
        loadInventory();
        loadSuppliers();
    }, []);

    const categories = useMemo(() => {
        const values = items
            .map((item) => item.category)
            .filter(Boolean);
        return ["All", ...Array.from(new Set(values))];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = `${item.itemName} ${item.category} ${item.supplier} ${item.itemCode}`
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCategory =
                categoryFilter === "All" || item.category === categoryFilter;

            const matchesBrand = brandFilter === "All" || item.brand === brandFilter;
            return matchesSearch && matchesCategory && matchesBrand;
        });
    }, [items, search, categoryFilter, brandFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredItems.length]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = filteredItems.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const stats = useMemo(() => {
        const totalItems = items.length;
        const totalStock = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const lowStock = items.filter((item) => Number(item.quantity || 0) > 0 && Number(item.quantity || 0) <= 5).length;
        const outOfStock = items.filter((item) => Number(item.quantity || 0) === 0).length;
        const totalValue = items.reduce(
            (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
            0
        );

        return { totalItems, totalStock, lowStock, outOfStock, totalValue };
    }, [items]);

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };
    const resetAddForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyForm);
    };
    // reset the deduct form to a single empty row
    const resetDeductForm = () => {
        setDeductData2([{ itemCode: "", quantity: "" }]);
        setDeductList([]);
        setDeductModalOpen(false);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.itemCode.trim() || !formData.itemName.trim() || !formData.category.trim()) {
            return;
        }

        try {
            setSaving(true);
            const payload = {
                itemCode: formData.itemCode?.trim() || "",
                itemName: formData.itemName?.trim() || "",
                category: formData.category?.trim() || "",
                brand: formData.brand?.trim() || "",
                model: formData.model?.trim() || "",
                partNumber: formData.partNumber?.trim() || "",
                supplier: formData.supplier?.trim() || "",
                // supplierPhone: formData.supplierPhone?.trim() || "",
                purchasePrice: Number(formData.purchasePrice || 0),
                sellingPrice: Number(formData.sellingPrice || 0),
                quantity: Number(formData.quantity || 0),
                minimumStock: Number(formData.minimumStock || 5),
                unit: formData.unit?.trim() || "pcs",
                location: formData.location?.trim() || "",
                description: formData.description?.trim() || "",
                status: formData.status?.trim() || "Available",
            };

            if (editingId) {
                await updateInventory(editingId, payload);
            } else {
                await createInventory(payload);
            }
            toast.success(`Inventory item ${editingId ? "updated" : "added"} successfully!`);

            await loadInventory();
            resetForm();
        } catch (err) {
            console.error("Failed to save inventory item", err);
            setError("Unable to save this item to the database.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.rowId);
        setFormData({
            itemCode: item.itemCode || "",
            itemName: item.itemName || "",
            category: item.category || "",
            brand: item.brand || "",
            model: item.model || "",
            partNumber: item.partNumber || "",
            supplier: item.supplier || "",
            supplierPhone: item.supplierPhone || "",
            purchasePrice: item.purchasePrice || "",
            sellingPrice: item.sellingPrice || "",
            quantity: item.quantity || "",
            minimumStock: item.minimumStock || "5",
            unit: item.unit || "pcs",
            location: item.location || "",
            description: item.description || "",
            image: item.image || "",
            status: item.status || "Available",
        });
        setShowForm(true);
    };

    const handleDelete = (rowId) => {
        setDeleteId(rowId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteInventory(deleteId);

            toast.success("Inventory item deleted successfully!");

            setDeleteModalOpen(false);
            setDeleteId(null);

            await loadInventory();

        } catch (err) {
            console.error("Failed to delete inventory item", err);
            setError("Unable to delete this item from the database.");
        }
    };

    const handleSupplierSubmit = async () => {
        if (!supplierData.supplierName?.trim()) {
            alert("Enter supplier name");
            return;
        }

        if (!supplierData.supplierContact || supplierData.supplierContact.length !== 10) {
            alert("Enter valid contact number");
            return;
        }

        try {
            await createSupplier({
                supplierName: supplierData.supplierName.trim(),
                supplierContact: supplierData.supplierContact,
            });
            await loadSuppliers();
            toast.success("Supplier added successfully!");
            setModalOpen(false);
            setSupplierData({ supplierName: "", supplierContact: "" });
        } catch (err) {
            console.error("Failed to save supplier", err);
            alert("Unable to save supplier. Please try again.");
        }
    };

    const handleDeductSubmit = async () => {
        // 1. Validate every row in the array
        for (let i = 0; i < deductData.length; i++) {
            if (!deductData[i].itemCode) {
                alert(`Please select an item for Row #${i + 1}.`);
                return;
            }

            if (!deductData[i].quantity || Number(deductData[i].quantity) <= 0) {
                alert(`Enter a valid quantity for Row #${i + 1}.`);
                return;
            }
        }

        try {
            // 2. Process all item deductions concurrently
            await Promise.all(
                deductData2.map((row) =>
                    deductInventory({
                        itemCode: row.itemCode,
                        quantity: Number(row.quantity),
                    })
                )
            );

            setDeductModalOpen(false);
            toast.success("Stock deducted successfully!");
            loadInventory();

            // 3. Optional: Reset form back to a single fresh row for next time
            setDeductData2([{ itemCode: "", quantity: "" }]);

        } catch (err) {
            console.error(err);
            alert("Failed to deduct stock. Please try again.");
        }
    };

    const handleAddItem = () => {
        if (!deductData.itemCode || !deductData.quantity) return;

        const selected = items.find(
            x => x.itemCode === deductData.itemCode
        );

        setDeductList(prev => [
            ...prev,
            {
                ...selected,
                deductQty: Number(deductData.quantity),
                reason: deductData.reason,
            },
        ]);

        setDeductData({
            itemCode: "",
            quantity: "",
            reason: "Sale",
        });
    };

    return (
        <div className={`min-h-screen px-3 py-2 sm:px-4 md:px-6 lg:px-8 lg:ml-10 ${isDark ? "bg-[#000814] text-white" : "bg-slate-50 text-slate-900"}`}>
            <div className="mx-auto space-y-6 max-w-7xl">
                <div className={`rounded-3xl border p-4 sm:p-6 shadow-sm ${isDark ? "border-white/10 bg-[#00112b]" : "border-slate-200 bg-white"}`}>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Inventory Management
                            </p>

                            <h3 className={`mt-2 text-2xl sm:text-3xl font-serif font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                Track Stock, Restock Quickly.
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">

                            <button
                                onClick={() => {
                                    setModalOpen(true);
                                    setSupplierData({
                                        supplierName: "",
                                        supplierContact: "",
                                    });
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                            >
                                <FiPlus size={18} />
                                Add Supplier
                            </button>

                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingId(null);
                                    setFormData(emptyForm);
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
                            >
                                <FiPlus size={18} />
                                Add Item
                            </button>

                            <button
                                onClick={() => {
                                    setDeductModalOpen(true);
                                    setDeductData({
                                        itemCode: "",
                                        quantity: "",
                                    });
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                            >
                                Deduct Item
                            </button>

                        </div>

                    </div>
                </div>

                {/* Open Modal of Add Supplier */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

                        <div
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto transition-all ${isDark
                                ? "bg-[#00112b] text-white border border-white/10"
                                : "bg-white text-slate-900 border border-slate-200"
                                }`}
                        >

                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-300 dark:border-white/10">
                                <h2 className="text-2xl font-bold">
                                    Add Supplier
                                </h2>

                                <button
                                    onClick={() => setModalOpen(false)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isDark
                                        ? "bg-[#071421] hover:bg-[#0b1d2c] text-white"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                        }`}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Supplier Name */}
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold">
                                    Supplier Name
                                </label>

                                <input
                                    type="text"
                                    value={supplierData.supplierName}
                                    onChange={(e) =>
                                        setSupplierData({
                                            ...supplierData,
                                            supplierName: e.target.value,
                                        })
                                    }
                                    placeholder="Enter supplier name"
                                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${isDark
                                        ? "bg-[#071421] border-white/10 text-white placeholder:text-slate-400"
                                        : "bg-slate-50 border-slate-300 text-slate-900"
                                        }`}
                                />
                            </div>

                            {/* Supplier Contact */}
                            <div className="mb-6">
                                <label className="block mb-2 text-sm font-semibold">
                                    Supplier Contact
                                </label>

                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={supplierData.supplierContact}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");

                                        if (value.length <= 10) {
                                            setSupplierData({
                                                ...supplierData,
                                                supplierContact: value,
                                            });
                                        }
                                    }}
                                    placeholder="9876543210"
                                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${isDark
                                        ? "bg-[#071421] border-white/10 text-white placeholder:text-slate-400"
                                        : "bg-slate-50 border-slate-300 text-slate-900"
                                        }`}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className={`w-full rounded-xl px-5 py-3 font-semibold transition sm:w-auto ${isDark
                                        ? "border border-white/10 bg-[#071421] text-white hover:bg-[#0b1d2c]"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSupplierSubmit}
                                    className="w-full px-5 py-3 font-semibold text-white transition bg-green-600 rounded-xl hover:bg-green-700 sm:w-auto"
                                >
                                    Submit
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {/* Open Deduct Modal */}
                {deductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div
                            className={`w-full max-w-4xl rounded-xl p-5 shadow-xl sm:p-6 max-h-[90vh] flex flex-col ${isDark ? "bg-[#00112b] text-white" : "bg-white text-black"
                                }`}
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-xl font-bold sm:text-2xl">Deduct Inventory</h2>
                                <button
                                    onClick={addDeductRow}
                                    className="px-3 py-1.5 text-sm font-medium text-teal-600 border border-teal-500 rounded-lg hover:bg-teal-500/10 transition-colors"
                                >
                                    + Add Another Item
                                </button>
                            </div>

                            {/* Scrollable Form Body */}
                            <div className="flex-1 pr-1 space-y-4 overflow-y-auto">
                                {deductData2.map((row, index) => (
                                    <div
                                        key={index}
                                        className="grid items-end grid-cols-1 gap-4 p-3 border rounded-lg md:grid-cols-12 bg-base-200 dark: border-slate-200 dark:border-white/10"
                                    >
                                        {/* Left Side: Item Selector */}
                                        <div className="md:col-span-6 ">
                                            <label className="block mb-2 text-sm font-medium">
                                                Item #{index + 1}
                                            </label>

                                            <Select
                                                options={items.map(item => ({
                                                    value: item.itemCode,
                                                    label: `${item.itemCode}`,
                                                }))}

                                                value={
                                                    row.itemCode
                                                        ? {
                                                            value: row.itemCode,
                                                            label: `${row.itemCode}`,
                                                        }
                                                        : null
                                                }

                                                onChange={(option) =>
                                                    handleRowChange(index, "itemCode", option?.value || "")
                                                }

                                                placeholder="Search Item Code"
                                                isSearchable
                                                isClearable

                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuPlacement="auto"
                                                maxMenuHeight={260}

                                                styles={{
                                                    menuPortal: (base) => ({
                                                        ...base,
                                                        zIndex: 99999,
                                                    }),

                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: 48,
                                                        borderRadius: 10,
                                                        borderColor: state.isFocused
                                                            ? "#14b8a6"
                                                            : isDark
                                                                ? "#374151"
                                                                : "#CBD5E1",
                                                        backgroundColor: isDark ? "#071421" : "#fff",
                                                        boxShadow: state.isFocused
                                                            ? "0 0 0 3px rgba(20,184,166,.25)"
                                                            : "none",
                                                    }),

                                                    menu: (base) => ({
                                                        ...base,
                                                        borderRadius: 10,
                                                        overflow: "hidden",
                                                    }),

                                                    option: (base, state) => ({
                                                        ...base,
                                                        padding: "12px 15px",
                                                        backgroundColor: state.isFocused
                                                            ? "#14b8a6"
                                                            : "#fff",
                                                        color: state.isFocused ? "#fff" : "#111827",
                                                    }),
                                                }}
                                            />
                                        </div>

                                        {/* Right Side: Quantity Input */}
                                        <div className="md:col-span-5">
                                            <label className="block mb-2 text-sm font-medium">
                                                Deduct Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={row.quantity}
                                                onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                                                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark
                                                    ? "border-white/10 bg-[#071421] text-white"
                                                    : "border-slate-300 bg-white text-black"
                                                    }`}
                                                placeholder="Enter Quantity"
                                            />
                                        </div>

                                        {/* Remove Row Button */}
                                        <div className="flex justify-end md:col-span-1">
                                            {deductData2.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDeductRow(index)}
                                                    className="p-2 text-red-500 transition-colors rounded-lg hover:text-red-700 hover:bg-red-500/10"
                                                    title="Remove row"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex flex-col-reverse justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-white/10 sm:flex-row">
                                <button
                                    onClick={() => setDeductModalOpen(false)}
                                    className="w-full px-5 py-2 transition-colors border rounded-lg sm:w-auto hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeductSubmit}
                                    className="w-full px-5 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 sm:w-auto"
                                >
                                    Deduct All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error ? (
                    <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                    {[
                        { label: "Total Items", value: stats.totalItems, icon: FiBox },
                        { label: "In Stock", value: stats.totalStock, icon: FiCheckCircle },
                        { label: "Low Stock", value: stats.lowStock, icon: FiAlertTriangle },
                        { label: "Out of Stock", value: stats.outOfStock, icon: FiAlertTriangle },
                        { label: "Value", value: currency(stats.totalValue), icon: FiTrendingUp },
                    ].map((card) => (
                        <div key={card.label} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-[#00112b]" : "border-slate-200 bg-white"}`}>
                            <div className="flex items-center justify-between">
                                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{card.label}</p>
                                <card.icon className={`h-5 w-5 shrink-0 ${isDark ? "text-cyan-400" : "text-teal-600"}`} />
                            </div>
                            <p className={`mt-3 text-xl sm:text-2xl font-bold break-words ${isDark ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className={`rounded-3xl border p-4 shadow-sm ${isDark ? "border-white/10 bg-[#00112b]" : "border-slate-200 bg-white"}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <label className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                Search inventory
                            </label>
                            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${isDark ? "border-white/10 bg-[#071421]" : "border-slate-200 bg-slate-50"}`}>
                                <FiSearch className={isDark ? "text-slate-400 shrink-0" : "text-slate-500 shrink-0"} />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name, supplier or category"
                                    className={`w-full min-w-0 bg-transparent outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"}`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:gap-4">
                            <div className="w-full lg:min-w-[180px]">
                                <label
                                    className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"
                                        }`}
                                >
                                    Brand
                                </label>

                                <select
                                    value={brandFilter}
                                    onChange={(event) => setBrandFilter(event.target.value)}
                                    className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark
                                        ? "border-white/10 bg-[#071421] text-white"
                                        : "border-slate-200 bg-white text-slate-900"
                                        }`}
                                >
                                    {brands.map((brand) => (
                                        <option
                                            key={brand}
                                            value={brand}
                                            className={
                                                isDark
                                                    ? "bg-[#071421] text-white"
                                                    : "bg-white text-slate-900"
                                            }
                                        >
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full lg:min-w-[180px]">
                                <label
                                    className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"
                                        }`}
                                >
                                    Category
                                </label>

                                <select
                                    value={categoryFilter}
                                    onChange={(event) => setCategoryFilter(event.target.value)}
                                    className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark
                                        ? "border-white/10 bg-[#071421] text-white"
                                        : "border-slate-200 bg-white text-slate-900"
                                        }`}
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                            className={
                                                isDark
                                                    ? "bg-[#071421] text-white"
                                                    : "bg-white text-slate-900"
                                            }
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 sm:p-4">

                        <div
                            className={`relative w-full max-w-6xl rounded-2xl shadow-2xl ${isDark
                                ? "bg-[#00112b] text-white"
                                : "bg-white text-slate-900"
                                } max-h-[92vh] overflow-y-auto`}
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-4 border-b bg-inherit sm:px-6">

                                <h2 className="text-lg font-bold sm:text-2xl">
                                    {editingId ? "Edit Item" : "Add New Item"}
                                </h2>

                                <button
                                    onClick={resetAddForm}
                                    className="px-3 py-2 text-sm text-white bg-red-500 rounded-lg shrink-0 hover:bg-red-600 sm:px-4 sm:text-base"
                                >
                                    ✕ Close
                                </button>

                            </div>

                            <div className="p-4 sm:p-6">

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Item Code</label>
                                        <input
                                            value={formData.itemCode}
                                            onChange={(event) => setFormData({ ...formData, itemCode: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: ITM-001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Item Name</label>
                                        <input
                                            value={formData.itemName}
                                            onChange={(event) => setFormData({ ...formData, itemName: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: Chain Set"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Category</label>
                                        <input
                                            value={formData.category}
                                            onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: Engine"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Brand Name</label>
                                        <input
                                            value={formData.brand}
                                            onChange={(event) => setFormData({ ...formData, brand: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: Bosch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Model Name</label>
                                        <input
                                            value={formData.model}
                                            onChange={(event) => setFormData({ ...formData, model: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: Model"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">
                                            Supplier
                                        </label>

                                        <select
                                            value={formData.supplier}
                                            onChange={(event) =>
                                                setFormData({
                                                    ...formData,
                                                    supplier: event.target.value,
                                                })
                                            }
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark
                                                ? "border-white/10 bg-[#071421] text-white"
                                                : "border-slate-200 bg-slate-50 text-slate-900"
                                                }`}
                                        >
                                            <option value="">Select Supplier</option>

                                            {suppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.supplierName}>
                                                    {supplier.supplierName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Part Number</label>
                                        <input
                                            value={formData.partNumber}
                                            onChange={(event) => setFormData({ ...formData, partNumber: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Example: PN-101"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Purchase Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.purchasePrice}
                                            onChange={(event) => setFormData({ ...formData, purchasePrice: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Selling Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.sellingPrice}
                                            onChange={(event) => setFormData({ ...formData, sellingPrice: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Quantity</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.quantity}
                                            onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Minimum Stock</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.minimumStock}
                                            onChange={(event) => setFormData({ ...formData, minimumStock: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Unit</label>
                                        <input
                                            value={formData.unit}
                                            onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="pcs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Location</label>
                                        <input
                                            value={formData.location}
                                            onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            placeholder="Rack A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block mb-2 text-sm font-medium">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                                            className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? "border-white/10 bg-[#071421] text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
                                            rows="3"
                                            placeholder="Add notes about this item"
                                        />
                                    </div>
                                    {/* <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium">Attached Images</label>
                                
                            </div> */}
                                    <div className="flex flex-col-reverse justify-end gap-3 sm:col-span-2 sm:flex-row">
                                        <button type="button" onClick={resetAddForm} className={`w-full rounded-xl border px-4 py-2 font-medium sm:w-auto ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-700"}`}>
                                            Cancel
                                        </button>
                                        <button type="submit" onClick={handleSubmit} className="w-full rounded-xl bg-[#0f766e] px-4 py-2 font-semibold text-white hover:bg-[#115e59] sm:w-auto">
                                            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Item"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>

                    </div>
                )}

                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

                        <div className="w-full max-w-sm p-6 bg-white shadow-xl rounded-xl">

                            <h2 className="mb-3 text-xl font-bold text-gray-800">
                                Delete Inventory
                            </h2>

                            <p className="mb-6 text-gray-600">
                                Are you sure you want to delete this inventory item?
                                <br />
                                <span className="font-semibold text-red-600">
                                    This action cannot be undone.
                                </span>
                            </p>

                            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setDeleteId(null);
                                    }}
                                    className="w-full px-5 py-2 border rounded-lg hover:bg-gray-100 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    className="w-full px-5 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 sm:w-auto"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {/* Desktop / tablet table view */}
                <div className={`hidden overflow-hidden rounded-3xl border md:block ${isDark ? "border-white/10 bg-[#00112b]" : "border-slate-200 bg-white"}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className={isDark ? "bg-[#071421]" : "bg-slate-50"}>
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Item Code</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Item Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Category</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Qty</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Price</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Brand Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Model Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-10 text-sm text-center text-slate-500">
                                            Loading inventory from the database...
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-10 text-sm text-center text-slate-500">
                                            No inventory items match your current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item) => {
                                        const stockState = Number(item.quantity || 0) === 0 ? "Out of stock" : Number(item.quantity || 0) <= 5 ? "Low stock" : "In stock";
                                        return (
                                            <tr key={item.rowId} className={`border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{item.itemCode}</div>
                                                    <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stockState}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{item.itemName}</div>
                                                    <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stockState}</div>
                                                </td>
                                                <td className="px-4 py-3">{item.category}</td>
                                                <td className="px-4 py-3">{item.quantity}</td>
                                                <td className="px-4 py-3">{currency(item.sellingPrice)}</td>
                                                <td className="px-4 py-3">{item.brand}</td>
                                                <td className="px-4 py-3">{item.model}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => handleEdit(item)} className={`rounded-lg border px-2.5 py-1.5 text-sm ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-700"}`}>
                                                            <span className="inline-flex items-center gap-1">
                                                                <FiEdit3 /> Edit
                                                            </span>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.rowId)} className={`rounded-lg border px-2.5 py-1.5 text-sm ${isDark ? "border-rose-500/30 text-rose-300" : "border-rose-500/30 text-rose-700"}`}>
                                                            <span className="inline-flex items-center gap-1">
                                                                <FiTrash2 /> Delete
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile card view */}
                <div className="space-y-3 md:hidden">
                    {loading ? (
                        <div className={`rounded-2xl border p-6 text-center text-sm ${isDark ? "border-white/10 bg-[#00112b] text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
                            Loading inventory from the database...
                        </div>
                    ) : currentItems.length === 0 ? (
                        <div className={`rounded-2xl border p-6 text-center text-sm ${isDark ? "border-white/10 bg-[#00112b] text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
                            No inventory items match your current filters.
                        </div>
                    ) : (
                        currentItems.map((item) => {
                            const stockState = Number(item.quantity || 0) === 0 ? "Out of stock" : Number(item.quantity || 0) <= 5 ? "Low stock" : "In stock";
                            return (
                                <div key={item.rowId} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-[#00112b]" : "border-slate-200 bg-white"}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{item.itemName}</p>
                                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.itemCode}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                            {stockState}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 mt-3 text-sm gap-y-2">
                                        <div>
                                            <p className={isDark ? "text-slate-400" : "text-slate-500"}>Category</p>
                                            <p>{item.category || "—"}</p>
                                        </div>
                                        <div>
                                            <p className={isDark ? "text-slate-400" : "text-slate-500"}>Qty</p>
                                            <p>{item.quantity}</p>
                                        </div>
                                        <div>
                                            <p className={isDark ? "text-slate-400" : "text-slate-500"}>Price</p>
                                            <p>{currency(item.sellingPrice)}</p>
                                        </div>
                                        <div>
                                            <p className={isDark ? "text-slate-400" : "text-slate-500"}>Brand</p>
                                            <p>{item.brand || "—"}</p>
                                        </div>
                                        <div>
                                            <p className={isDark ? "text-slate-400" : "text-slate-500"}>Model</p>
                                            <p>{item.model || "—"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => handleEdit(item)} className={`flex-1 rounded-lg border px-2.5 py-2 text-sm ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-700"}`}>
                                            <span className="inline-flex items-center justify-center w-full gap-1">
                                                <FiEdit3 /> Edit
                                            </span>
                                        </button>
                                        <button onClick={() => handleDelete(item.rowId)} className={`flex-1 rounded-lg border px-2.5 py-2 text-sm ${isDark ? "border-rose-500/30 text-rose-300" : "border-rose-500/30 text-rose-700"}`}>
                                            <span className="inline-flex items-center justify-center w-full gap-1">
                                                <FiTrash2 /> Delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Showing {indexOfFirstItem + 1} -
                        {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
                        {filteredItems.length}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 text-sm rounded-lg border sm:px-4 ${currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                } ${isDark
                                    ? "border-white/10 bg-[#071421] text-white"
                                    : "border-slate-200 bg-white"
                                }`}
                        >
                            Previous
                        </button>

                        <span
                            className={`px-3 py-2 text-sm sm:px-4 sm:text-base rounded-lg ${isDark ? "text-white" : "text-slate-700"
                                }`}
                        >
                            {currentPage} / {totalPages || 1}
                        </span>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 text-sm rounded-lg border sm:px-4 ${currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                } ${isDark
                                    ? "border-white/10 bg-[#071421] text-white"
                                    : "border-slate-200 bg-white"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryManage;