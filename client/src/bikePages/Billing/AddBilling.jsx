import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiFileText,
  FiCalendar,
  FiUser,
  FiTool,
  FiSave,
  FiX,
  FiArrowLeft,
  FiHash,
  FiPercent,
  FiTag,
  FiAlertCircle,
  FiCreditCard,
  FiCheckCircle,
  FiTrendingUp,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiDollarSign,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { IndianRupee } from "lucide-react";
import api from "../../utils/axiosInstance";

// Invoice Number Generator
const generateInvoiceNumber = () => `BIKE-INV-${Date.now()}`;

export default function AddBilling() {
  const { isDark } = useTheme();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();
  const previewData = location.state;
  const navigate = useNavigate();
  const serviceData = location.state || null;

  const [allInvoices, setAllInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBike, setSelectedBike] = useState(null);
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const [form, setForm] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split("T")[0],
    bikeId: "",
    vehicle: "",
    serviceCategory: "",
    serviceSubCategory: "",
    notes: "",
    discountType: "Fixed Amount",
    discountValue: 0,
    advancePaid: 0,
    paymentMode: "",
    status: "Pending",
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { type: "Part", name: "", quantity: 1, unitPrice: 0, cgst: 9, sgst: 9 },
  ]);

  useEffect(() => {
    if (!previewData) return;

    setForm(previewData.form);
    setInvoiceItems(previewData.invoiceItems);
    setSelectedBike(previewData.bike);
  }, [previewData]);

  /* LOAD BIKE OWNERS */
  useEffect(() => {
    const fetchClients = async () => {
      // CASE 1: Coming from Service → Single Bike Only
      if (serviceData?.bikeId) {
        setClients([
          {
            id: serviceData.bikeId,
            ownerName: serviceData.clientName,
            regNumber: serviceData.vehicle,
          },
        ]);

        setForm((prev) => ({
          ...prev,
          bikeId: serviceData.bikeId,
          vehicle: serviceData.vehicle,
          serviceCategory: serviceData.serviceCategory,
          serviceSubCategory: serviceData.serviceSubCategory || "",
          discountType: serviceData.discountType || "Fixed Amount", // ✅
          discountValue: serviceData.discount || 0, // ✅
          advancePaid: serviceData.advancePaid || 0, // ✅
        }));

        // Load service items
        if (Array.isArray(serviceData.serviceItems)) {
          setInvoiceItems(
            serviceData.serviceItems.map((item) => ({
              type: item.type,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              cgst: item.cgst,
              sgst: item.sgst,
            })),
          );
        }

        return;
      }

      // CASE 2: Opened directly → Load ALL SERVICE BIKES
      try {
        const res = await api.get("/api/bike-services");
        const data = Array.isArray(res.data) ? res.data : [];
        setAllServices(data);

        const uniqueClients = [];
        const map = new Map();

        data.forEach((service) => {
          if (service.client && !map.has(service.client.id)) {
            map.set(service.client.id, true);
            uniqueClients.push({
              id: service.client.id,
              ownerName: service.client.ownerName,
              phone: service.client.phone, // ✅ ADD
              regNumber: service.client.regNumber,
              bikeBrand: service.client.bikeBrand, // ✅ ADD
              bikeModel: service.client.bikeModel, // ✅ FIX KEY
            });
          }
        });

        setClients(uniqueClients);
      } catch (err) {
        console.error("Fetch clients error:", err);
        setClients([]);
      }
    };

    fetchClients();
  }, [serviceData]);

  /* AUTO-FILL SERVICE DATA ON BIKE SELECT */
  useEffect(() => {
    if (!form.bikeId || !allServices.length) return;

    const clientServices = allServices.filter(
      (s) => s.client?.id === Number(form.bikeId),
    );

    if (!clientServices.length) return;

    const latestService = clientServices[0];

    setForm((prev) => ({
      ...prev,
      vehicle: latestService.client?.bikeModel || "",
      serviceCategory: latestService.category?.name || "",
      serviceSubCategory: latestService.subService?.name || "",

      // ✅ ADD THESE TWO LINES
      discountType: latestService.discountType || "Fixed Amount",
      discountValue: latestService.discount || 0,
      advancePaid: latestService.advancePaid || 0,
    }));

    // Load service items
    if (
      latestService.serviceItems &&
      Array.isArray(latestService.serviceItems)
    ) {
      setInvoiceItems(
        latestService.serviceItems.map((item) => ({
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgst: item.cgst,
          sgst: item.sgst,
        })),
      );
    }
  }, [form.bikeId, allServices]);

  /* LOAD INVOICE IN EDIT MODE */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/bike-invoices/${id}`);
        const data = res.data;

        setForm({
          invoiceNumber: data.invoiceNumber,
          date: data.createdAt?.split("T")[0],
          bikeId: data.bikeId,
          vehicle: data.vehicle,
          serviceCategory: data.serviceCategory || "",
          serviceSubCategory: data.serviceSubCategory || "",
          notes: data.notes || "",
          discountType: data.discountType || "Fixed Amount",
          discountValue: data.discount || 0,
          advancePaid: data.advancePaid || 0,
          paymentMode: data.paymentMode,
          status: data.status,
        });

        // Load invoice items
        if (data.invoiceItems && Array.isArray(data.invoiceItems)) {
          setInvoiceItems(
            data.invoiceItems.map((item) => ({
              type: item.type,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              cgst: item.cgst,
              sgst: item.sgst,
            })),
          );
        }
      } catch (err) {
        console.error("Fetch invoice error:", err);
        setError("Failed to load invoice");
        toast.error(err.response?.data?.message || "Failed to load invoice");

        if (err.response?.status === 403 || err.response?.status === 404) {
          setTimeout(() => navigate("/bike-billing"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, isEditMode, navigate]);

  /* LOAD EXISTING BIKE INVOICES (FOR DUPLICATE CHECK) */
  useEffect(() => {
    const fetchAllInvoices = async () => {
      try {
        const res = await api.get("/api/bike-invoices");
        setAllInvoices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch all invoices error:", err);
        setAllInvoices([]);
      }
    };

    fetchAllInvoices();
  }, []);

  useEffect(() => {
    if (!serviceId) return;

    const fetchService = async () => {
      try {
        const res = await api.get(`/api/bike-services/${serviceId}`);
        const service = res.data;

        setForm((prev) => ({
          ...prev,
          bikeId: service.client?.id,
          vehicle:
            `${service.client?.bikeBrand || ""} ${service.client?.bikeModel || ""}`.trim(),
          serviceCategory: service.category?.name,
          serviceSubCategory: service.subService?.name,
          discountType: service.discountType,
          discountValue: service.discount,
          advancePaid: service.advancePaid,
        }));

        if (Array.isArray(service.serviceItems)) {
          setInvoiceItems(service.serviceItems);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchService();
  }, [serviceId]);

  // Calculate totals
  const calculations = React.useMemo(() => {
    const partsSubtotal = invoiceItems
      .filter((item) => item.type === "Part")
      .reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      );

    const laborSubtotal = invoiceItems
      .filter((item) => item.type === "Labor")
      .reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      );

    const cgstTotal = invoiceItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) * Number(item.unitPrice) * Number(item.cgst)) /
          100,
      0,
    );

    const sgstTotal = invoiceItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) * Number(item.unitPrice) * Number(item.sgst)) /
          100,
      0,
    );

    const subtotal = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal;

    const discount =
      form.discountType === "Fixed Amount"
        ? Number(form.discountValue || 0)
        : (subtotal * Number(form.discountValue || 0)) / 100;

    const grandTotal = subtotal - discount;
    const balanceDue = grandTotal - Number(form.advancePaid || 0);

    return {
      partsSubtotal,
      laborSubtotal,
      cgstTotal,
      sgstTotal,
      subtotal,
      discount,
      grandTotal,
      balanceDue,
    };
  }, [invoiceItems, form.discountType, form.discountValue, form.advancePaid]);

  // Invoice item handlers
  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { type: "Part", name: "", quantity: 1, unitPrice: 0, cgst: 9, sgst: 9 },
    ]);
  };

  const removeInvoiceItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateInvoiceItem = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;
    setInvoiceItems(updated);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bikeId) {
      toast.error("Please select Bike Owner");
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error("Please add at least one invoice item");
      return;
    }

    // PAYMENT VALIDATION
    if (form.status === "Paid" && !form.paymentMode) {
      toast.error("Please select a Payment Mode for Paid invoices");
      return;
    }

    if (!form.paymentMode) {
      const allow = window.confirm(
        "You have NOT selected a Payment Mode.\n\nDo you still want to create invoice?",
      );
      if (!allow) return;
    }

    // Validate invoice items
    const invalidItems = invoiceItems.filter(
      (item) => !item.name || item.quantity <= 0 || item.unitPrice < 0,
    );

    if (invalidItems.length > 0) {
      toast.error("Please fill in all invoice item fields correctly");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        bikeId: Number(form.bikeId),
        serviceId: serviceData?.id || null,
        parsedInvoiceItems: JSON.stringify(invoiceItems),
      };

      let createdInvoice = null;

      /* ============================
       EDIT MODE
    ============================ */
      if (isEditMode) {
        const res = await api.put(`/api/bike-invoices/${id}`, payload);

        // Adjust depending on your backend response structure
        createdInvoice = res.data.invoice || res.data;

        toast.success("Invoice updated successfully");
      } else {
        /* ============================
       CREATE MODE
    ============================ */
        const res = await api.post("/api/bike-invoices", payload);

        // IMPORTANT: Make sure backend returns invoice object or id
        createdInvoice = res.data.invoice || res.data;

        toast.success("Invoice created successfully");

        /* =========================================
         🔥 AUTO SEND FINAL INVOICE WHATSAPP
      ========================================= */
        if (createdInvoice?.id) {
          try {
            await api.post(
              `/api/bike-invoices/${createdInvoice.id}/send-whatsapp`,
            );

            toast.success("Invoice sent to client on WhatsApp");
          } catch (whatsAppError) {
            console.error("WhatsApp send failed:", whatsAppError);
            toast.error("Invoice created but WhatsApp failed");
          }
        }
      }

      setTimeout(() => navigate("/bike-billing"), 1200);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-blue-500" size={48} />
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => navigate("/bike-billing")}
            className={`flex items-center gap-2 mb-3 px-2 py-1 rounded-md transition-all duration-300 ${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FiArrowLeft size={18} />
            Back to Billing
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Invoice" : "Create New Invoice"}
          </h1>

          <p
            className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {isEditMode
              ? "Update invoice details"
              : "Fill in the details to generate a new invoice"}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <h2
                className={`flex items-center gap-2 text-lg font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <FiFileText size={20} className="text-blue-600" />
                Invoice Information
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Select
                  label="Bike Owner"
                  value={form.bikeId}
                  onChange={(e) => {
                    const bike = clients.find(
                      (c) => c.id === Number(e.target.value),
                    );
                    setForm({ ...form, bikeId: e.target.value });
                    setSelectedBike(bike); // ✅ ADD THIS
                  }}
                >
                  <option value="">Select Bike Owner</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.ownerName} - {client.regNumber}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Invoice Number"
                  icon={<FiHash />}
                  value={form.invoiceNumber}
                  readOnly
                  isDark={isDark}
                />
                <Input
                  label="Invoice Date"
                  type="date"
                  icon={<FiCalendar />}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Service Details */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              <h2
                className={`flex items-center gap-2 text-lg font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <FiTool size={20} className="text-blue-600" />
                Service Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Vehicle Model"
                  icon={<FiTag />}
                  value={form.vehicle}
                  onChange={(e) =>
                    setForm({ ...form, vehicle: e.target.value })
                  }
                  isDark={isDark}
                  placeholder="e.g., Honda Activa"
                />
                <Input
                  label="Service Category"
                  icon={<FiTool />}
                  value={form.serviceCategory}
                  onChange={(e) =>
                    setForm({ ...form, serviceCategory: e.target.value })
                  }
                  isDark={isDark}
                  placeholder="e.g., General Service"
                />
                <Input
                  label="Service Sub-Category"
                  icon={<FiTool />}
                  value={form.serviceSubCategory}
                  onChange={(e) =>
                    setForm({ ...form, serviceSubCategory: e.target.value })
                  }
                  isDark={isDark}
                  placeholder="e.g., Oil Change"
                />
              </div>

              <div className="mt-6">
                <label
                  className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Service Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional service notes..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              style={{ animationDelay: "150ms" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`flex items-center gap-2 text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IndianRupee size={20} className="text-blue-600" />
                  Invoice Items
                </h2>
                <button
                  type="button"
                  onClick={addInvoiceItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FiPlus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div
                    key={index}
                    className={`grid md:grid-cols-12 gap-4 p-4 rounded-lg border-2 ${
                      isDark
                        ? "border-gray-700 bg-gray-700/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="md:col-span-2">
                      <Select
                        label="Type"
                        value={item.type}
                        onChange={(e) =>
                          updateInvoiceItem(index, "type", e.target.value)
                        }
                        isDark={isDark}
                      >
                        <option value="Part">Part</option>
                        <option value="Labor">Labor</option>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Item Name"
                        value={item.name}
                        onChange={(e) =>
                          updateInvoiceItem(index, "name", e.target.value)
                        }
                        isDark={isDark}
                        placeholder={
                          item.type === "Labor" ? "Labor" : "Part name"
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(index, "quantity", e.target.value)
                        }
                        isDark={isDark}
                        placeholder="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Unit Price (₹)"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateInvoiceItem(index, "unitPrice", e.target.value)
                        }
                        isDark={isDark}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="CGST %"
                        type="number"
                        value={item.cgst}
                        onChange={(e) =>
                          updateInvoiceItem(index, "cgst", e.target.value)
                        }
                        isDark={isDark}
                        placeholder="9"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="SGST %"
                        type="number"
                        value={item.sgst}
                        onChange={(e) =>
                          updateInvoiceItem(index, "sgst", e.target.value)
                        }
                        isDark={isDark}
                        placeholder="9"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(index)}
                        className={`w-full p-3 rounded-lg transition-colors ${
                          isDark
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount & Payment */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50"
                  : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100"
              }`}
              style={{ animationDelay: "200ms" }}
            >
              <h2
                className={`flex items-center gap-2 text-lg font-bold mb-6 ${
                  isDark ? "text-purple-400" : "text-purple-700"
                }`}
              >
                <FiPercent size={20} />
                Discount & Advance Payment
              </h2>

              <div className="grid md:grid-cols-4 gap-6">
                <Select
                  label="Discount Type"
                  icon={<FiPercent />}
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value })
                  }
                  isDark={isDark}
                >
                  <option>Fixed Amount</option>
                  <option>Percentage</option>
                </Select>
                <Input
                  label={`Discount ${form.discountType === "Percentage" ? "(%)" : "(₹)"}`}
                  type="number"
                  icon={
                    form.discountType === "Percentage" ? (
                      <FiPercent />
                    ) : (
                      <IndianRupee size={16} />
                    )
                  }
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: e.target.value })
                  }
                  isDark={isDark}
                  placeholder="0"
                />
                <Input
                  label="Advance Paid (₹)"
                  type="number"
                  icon={<IndianRupee size={16} />}
                  value={form.advancePaid}
                  onChange={(e) =>
                    setForm({ ...form, advancePaid: e.target.value })
                  }
                  isDark={isDark}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Details */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              style={{ animationDelay: "250ms" }}
            >
              <h2
                className={`flex items-center gap-2 text-lg font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <FiCreditCard size={20} className="text-blue-600" />
                Payment Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="Payment Mode"
                  icon={<FiCreditCard />}
                  value={form.paymentMode}
                  onChange={(e) =>
                    setForm({ ...form, paymentMode: e.target.value })
                  }
                  isDark={isDark}
                >
                  <option value="">Select Payment</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </Select>

                <Select
                  label="Payment Status"
                  icon={<FiCheckCircle />}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  isDark={isDark}
                >
                  <option>Pending</option>
                  <option>Paid</option>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
                isDark
                  ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              }`}
              style={{ animationDelay: "300ms" }}
            >
              <h2
                className={`flex items-center gap-2 text-lg font-bold mb-4 ${
                  isDark ? "text-green-400" : "text-green-700"
                }`}
              >
                <FiTrendingUp size={20} />
                Invoice Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Parts Subtotal:
                  </span>
                  <span className="font-semibold">
                    ₹{calculations.partsSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Labor Subtotal:
                  </span>
                  <span className="font-semibold">
                    ₹{calculations.laborSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    CGST Total:
                  </span>
                  <span className="font-semibold">
                    ₹{calculations.cgstTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    SGST Total:
                  </span>
                  <span className="font-semibold">
                    ₹{calculations.sgstTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-600">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Subtotal:
                  </span>
                  <span className="font-semibold">
                    ₹{calculations.subtotal.toFixed(2)}
                  </span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      - ₹{calculations.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-green-500">
                  <span className="text-green-600">Grand Total:</span>
                  <span className="text-green-600">
                    ₹{calculations.grandTotal.toFixed(2)}
                  </span>
                </div>
                {form.advancePaid > 0 && (
                  <>
                    <div className="flex justify-between text-blue-500">
                      <span>Advance Paid:</span>
                      <span className="font-semibold">
                        - ₹{Number(form.advancePaid).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-orange-500">
                      <span>Balance Due:</span>
                      <span>₹{calculations.balanceDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex gap-4 animate-slide-down"
              style={{ animationDelay: "350ms" }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/bike-billing/preview", {
                    state: {
                      form,
                      invoiceItems,
                      calculations,
                      bike: selectedBike, // ✅ REQUIRED
                    },
                  })
                }
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 
                        bg-white border-2 border-blue-500 text-blue-600 
                        rounded-xl font-semibold text-lg
                        hover:bg-blue-50 transition-all"
              >
                <FiFileText size={20} />
                Preview Invoice
              </button>

              <button
                type="submit"
                disabled={loading}
                className="group flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    {isEditMode ? "Update Invoice" : "Create Invoice"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
              >
                <FiX size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

/* Helper Components */
function Input({
  label,
  icon,
  type = "text",
  value,
  onChange,
  readOnly,
  isDark,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label
        className={`flex items-center gap-2 text-sm font-semibold ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {icon && <span className="text-blue-500">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          readOnly ? "cursor-not-allowed" : ""
        } ${
          isDark
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}

function Select({ label, icon, children, value, onChange, isDark }) {
  return (
    <div className="space-y-2">
      <label
        className={`flex items-center gap-2 text-sm font-semibold ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {icon && <span className="text-blue-500">{icon}</span>}
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-50 border-gray-200 text-gray-900"
        }`}
      >
        {children}
      </select>
    </div>
  );
}
