// src/NewInvoice.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
    ArrowLeft,
    Hash,
    Calendar,
    User2,
    Tag,
    Car,
    Wrench,
    FileText,
    IndianRupee,
    Percent,
    CreditCard,
    Save,
    X,
    BadgeCheck,
} from "lucide-react";

export default function CreateInvoice() {
    const navigate = useNavigate();
    const location = useLocation();
    const serviceData = location.state;

    // Services and client data
    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [clientDetails, setClientDetails] = useState(null);

    // Categories data
    const [categories, setCategories] = useState([]);
    const [subServices, setSubServices] = useState([]);

    // Cost state
    const [partsCost, setPartsCost] = useState(0);
    const [partsGst, setPartsGst] = useState(0);
    const [laborCost, setLaborCost] = useState(0);
    const [laborGst, setLaborGst] = useState(0);
    const [additionalTaxes, setAdditionalTaxes] = useState(0);
    const [discounts, setDiscounts] = useState(0);

    // Form fields
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
    const [serviceCategory, setServiceCategory] = useState("");
    const [serviceSubCategory, setServiceSubCategory] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [washer, setWasher] = useState("");
    const [serviceNotes, setServiceNotes] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("Pending");

    // Fetch services and extract unique clients and categories
    useEffect(() => {
        const fetchServicesAndClients = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found");
                    return;
                }

                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/washing-services`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("Fetched services:", data); // Debug log

                if (!Array.isArray(data)) {
                    console.error("Expected array but got:", typeof data);
                    return;
                }

                setServices(data);

                // Extract unique clients
                const uniqueClients = [];
                const clientMap = new Map();

                data.forEach(service => {
                    if (service.client && !clientMap.has(service.client.id)) {
                        clientMap.set(service.client.id, service.client);
                        uniqueClients.push(service.client);
                    }
                });

                console.log("Unique clients:", uniqueClients); // Debug log
                setClients(uniqueClients);

                // Extract unique categories
                const uniqueCategories = [];
                const categoryMap = new Map();

                data.forEach(service => {
                    if (service.category && !categoryMap.has(service.category.id)) {
                        categoryMap.set(service.category.id, service.category);
                        uniqueCategories.push(service.category);
                    }
                });

                console.log("Unique categories:", uniqueCategories); // Debug log
                setCategories(uniqueCategories);

                // Extract all sub-services
                const allSubServices = [];
                const subServiceMap = new Map();

                data.forEach(service => {
                    if (service.subService && !subServiceMap.has(service.subService.id)) {
                        subServiceMap.set(service.subService.id, {
                            ...service.subService,
                            categoryId: service.category?.id
                        });
                        allSubServices.push({
                            ...service.subService,
                            categoryId: service.category?.id
                        });
                    }
                });

                console.log("Sub-services:", allSubServices); // Debug log
                setSubServices(allSubServices);

            } catch (err) {
                console.error("Failed to load services:", err);
                alert("Failed to load services. Please check console for details.");
            }
        };

        fetchServicesAndClients();
    }, []);

    // Pre-fill if coming from service data
    useEffect(() => {
        if (serviceData) {
            console.log("Service Data received FULL:", serviceData); // Debug log

            setServiceCategory(serviceData.category?.id || "");
            setServiceSubCategory(serviceData.subService?.id || "");
            setServiceNotes(serviceData.notes || `${serviceData.category?.name} - ${serviceData.subService?.name}`);

            // Try different possible field names for service cost and GST
            const serviceCost = serviceData.estimatedTotal || serviceData.totalCost || serviceData.amount || serviceData.cost || 0;
            const serviceGst = serviceData.gst || serviceData.gstRate || serviceData.gstPercentage || serviceData.tax || serviceData.taxRate || 0;
            const partsAmount = serviceData.partsCost || serviceData.partsAmount || 0;
            const partsGstRate = serviceData.partsGst || serviceData.partsGstRate || serviceData.partsTax || 0;

            console.log("Extracted from serviceData:", {
                serviceCost,
                serviceGst,
                partsAmount,
                partsGstRate
            });

            setLaborCost(serviceCost);
            setLaborGst(serviceGst);
            setPartsCost(partsAmount);
            setPartsGst(partsGstRate);

            setInvoiceDate(
                serviceData.date
                    ? new Date(serviceData.date).toISOString().slice(0, 10)
                    : invoiceDate
            );

            if (serviceData.client) {
                setSelectedClient(serviceData.client.id.toString());
                setClientDetails(serviceData.client);
            }
        }
    }, [serviceData]);

    // Handle service selection (dropdown to select from existing services)
    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        setSelectedService(serviceId);

        if (serviceId) {
            const service = services.find(s => s.id === parseInt(serviceId));
            if (service) {
                console.log("Selected service FULL DATA:", service); // Debug log to see all fields

                // Auto-fill all fields from selected service
                setSelectedClient(service.client?.id.toString() || "");
                setClientDetails(service.client);
                setServiceCategory(service.category?.id || "");
                setServiceSubCategory(service.subService?.id || "");
                setServiceNotes(`${service.category?.name} - ${service.subService?.name}`);

                // Try different possible field names for service cost and GST
                const serviceCost = service.estimatedTotal || service.totalCost || service.amount || service.cost || 0;
                const serviceGst = service.gst || service.gstRate || service.gstPercentage || service.tax || service.taxRate || 0;
                const partsAmount = service.partsCost || service.partsAmount || 0;
                const partsGstRate = service.partsGst || service.partsGstRate || service.partsTax || 0;

                console.log("Extracted values:", {
                    serviceCost,
                    serviceGst,
                    partsAmount,
                    partsGstRate
                });

                setLaborCost(serviceCost);
                setLaborGst(serviceGst);
                setPartsCost(partsAmount);
                setPartsGst(partsGstRate);

                setInvoiceDate(
                    service.date
                        ? new Date(service.date).toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10)
                );
            }
        } else {
            // Reset if no service selected
            setSelectedClient("");
            setClientDetails(null);
            setServiceCategory("");
            setServiceSubCategory("");
            setServiceNotes("");
            setLaborCost(0);
            setLaborGst(0);
            setPartsCost(0);
            setPartsGst(0);
        }
    };

    // Handle client selection
    const handleClientChange = (e) => {
        const clientId = e.target.value;
        setSelectedClient(clientId);

        if (clientId) {
            const client = clients.find(c => c.id === parseInt(clientId));
            setClientDetails(client);

            // Find services for this client
            const clientServices = services.filter(s => s.client?.id === parseInt(clientId));
            if (clientServices.length > 0) {
                // You can optionally pre-select the first service
                const firstService = clientServices[0];
                setServiceCategory(firstService.category?.id || "");
                setServiceSubCategory(firstService.subService?.id || "");
            }
        } else {
            setClientDetails(null);
        }
    };

    // Filter sub-services based on selected category
    const filteredSubServices = useMemo(() => {
        if (!serviceCategory) return subServices;
        return subServices.filter(sub => sub.categoryId === parseInt(serviceCategory));
    }, [serviceCategory, subServices]);

    const grandTotal = useMemo(() => {
        const pCost = Number(partsCost) || 0;
        const pGst = Number(partsGst) || 0;
        const lCost = Number(laborCost) || 0;
        const lGst = Number(laborGst) || 0;
        const taxAdd = Number(additionalTaxes) || 0;
        const disc = Number(discounts) || 0;

        const partsTotal = pCost + (pCost * pGst) / 100;
        const laborTotal = lCost + (lCost * lGst) / 100;

        return partsTotal + laborTotal + taxAdd - disc;
    }, [partsCost, partsGst, laborCost, laborGst, additionalTaxes, discounts]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedClient) {
            alert("Please select a customer");
            return;
        }

        const selectedCategoryObj = categories.find(c => c.id === parseInt(serviceCategory));
        const selectedSubServiceObj = subServices.find(s => s.id === parseInt(serviceSubCategory));

        const invoice = {
            id: Date.now(),
            invoiceNumber,
            invoiceDate,
            clientName: clientDetails?.fullName || "",
            phone: clientDetails?.phone || "",
            email: clientDetails?.email || "",
            serviceCategory: selectedCategoryObj?.name || serviceCategory,
            serviceSubCategory: selectedSubServiceObj?.name || serviceSubCategory,
            vehicle,
            washer,
            serviceNotes,
            partsCost: Number(partsCost) || 0,
            partsGst: Number(partsGst) || 0,
            laborCost: Number(laborCost) || 0,
            laborGst: Number(laborGst) || 0,
            additionalTaxes: Number(additionalTaxes) || 0,
            discounts: Number(discounts) || 0,
            paymentMode,
            paymentStatus,
            amount: grandTotal,
            status: paymentStatus,
            createdAt: new Date().toLocaleDateString(),
        };

        const existing = JSON.parse(localStorage.getItem("invoices")) || [];
        localStorage.setItem("invoices", JSON.stringify([invoice, ...existing]));

        alert("Invoice created successfully!");
        navigate("/billing");
    };

    return (
        <div className="min-h-screen px-6 py-6 bg-slate-50 lg:px-12">
            {/* Top back link */}
            <button
                type="button"
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Billing</span>
            </button>

            {/* Page Title */}
            <h1 className="mb-6 text-3xl font-semibold text-slate-900">Create Invoice</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Invoice header card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Invoice Number */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Hash className="w-4 h-4" />
                                <span>Invoice Number</span>
                            </label>
                            <input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                required
                            />
                        </div>

                        {/* Invoice Date */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Calendar className="w-4 h-4" />
                                <span>Invoice Date</span>
                            </label>
                            <input
                                type="date"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                required
                            />
                        </div>

                        {/* Select from Existing Services (Optional Quick Fill) */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <FileText className="w-4 h-4" />
                                <span>Select from Existing Service (Optional)</span>
                            </label>
                            <select
                                value={selectedService}
                                onChange={handleServiceChange}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            >
                                <option value="">-- Select a service to auto-fill --</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.client?.fullName} - {service.subService?.name} - ₹{service.estimatedTotal}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Customer */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <User2 className="w-4 h-4" />
                                <span>Customer</span>
                            </label>
                            <select
                                value={selectedClient}
                                onChange={handleClientChange}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                required
                            >
                                <option value="">Select Customer</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.fullName} - {client.phone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Display selected client details */}
                        {clientDetails && (
                            <div className="p-4 rounded-lg md:col-span-2 bg-emerald-50">
                                <h3 className="mb-2 text-sm font-semibold text-slate-800">Customer Details</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                                    <div>
                                        <span className="font-medium text-slate-600">Name:</span>{" "}
                                        <span className="text-slate-900">{clientDetails.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-600">Phone:</span>{" "}
                                        <span className="text-slate-900">{clientDetails.phone}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-600">Email:</span>{" "}
                                        <span className="text-slate-900">{clientDetails.email || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Service Details card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Service Details</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Service Category */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Service Category</span>
                            </label>
                            <select
                                value={serviceCategory}
                                onChange={(e) => setServiceCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service Sub-category */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Service Sub-Category</span>
                            </label>
                            <select
                                value={serviceSubCategory}
                                onChange={(e) => setServiceSubCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                disabled={!serviceCategory}
                            >
                                <option value="">Select Sub-Category</option>
                                {filteredSubServices.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Car className="w-4 h-4" />
                                <span>Vehicle</span>
                            </label>
                            <input
                                value={vehicle}
                                onChange={(e) => setVehicle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Select or enter vehicle"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Wrench className="w-4 h-4" />
                                <span>Washer</span>
                            </label>
                            <input
                                value={washer}
                                onChange={(e) => setWasher(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Assign Washer"
                            />
                        </div>

                        {/* Service Notes */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <FileText className="w-4 h-4" />
                                <span>Service Notes</span>
                            </label>
                            <textarea
                                value={serviceNotes}
                                onChange={(e) => setServiceNotes(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg resize-none bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Enter any additional notes or details..."
                            />
                        </div>
                    </div>
                </section>

                {/* Cost Breakdown card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Cost Breakdown</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Labor Cost */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <IndianRupee className="w-4 h-4" />
                                <span>Service Cost</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={laborCost}
                                onChange={(e) => setLaborCost(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Labor GST */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Percent className="w-4 h-4" />
                                <span>Service GST (%)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={laborGst}
                                onChange={(e) => setLaborGst(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Additional Taxes */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Additional Taxes</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={additionalTaxes}
                                onChange={(e) => setAdditionalTaxes(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Discounts */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Discounts</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={discounts}
                                onChange={(e) => setDiscounts(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <CreditCard className="w-4 h-4" />
                                <span>Payment Mode</span>
                            </label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            >
                                <option value="">Select Payment Mode</option>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Bank Transfer</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <BadgeCheck className="w-4 h-4" />
                                <span>Payment Status</span>
                            </label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            >
                                <option>Pending</option>
                                <option>Paid</option>
                                <option>Partially Paid</option>
                            </select>
                        </div>
                    </div>

                    {/* Grand total + buttons */}
                    <div className="flex flex-col items-start justify-between mt-8 gap-y-4 md:flex-row md:items-center">
                        <div className="text-base font-semibold text-slate-900">
                            Grand Total:
                        </div>
                        <div className="flex items-center gap-8 md:ml-auto">
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹ {grandTotal.toFixed(2)}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white shadow rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Save className="w-4 h-4" />
                                    Create Invoice
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/billing")}
                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-white border rounded-xl text-slate-700 hover:bg-slate-50"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}