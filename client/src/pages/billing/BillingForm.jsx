// client/src/pages/billing/BillingForm.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  FiFileText,
  FiCalendar,
  FiUser,
  FiTool,
  FiDollarSign,
  FiSave,
  FiX,
  FiArrowLeft,
  FiHash,
  FiPercent,
  FiTag,
  FiAlertCircle,
  FiCreditCard,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Auth helpers
const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
  return response;
};

// Generate a temporary invoice number
const generateTempInvoiceNumber = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${dateStr}-${random}`;
};

// Get initial form state
const getInitialFormState = (
  isEditMode,
  preSelectedClientId,
  serviceData,
  invoiceData
) => {
  const today = new Date().toISOString().split("T")[0];

  if (isEditMode && invoiceData) {
    return {
      invoiceNumber: invoiceData.invoiceNumber || generateTempInvoiceNumber(),
      date: invoiceData.date || today,
      customerId: invoiceData.clientId || preSelectedClientId || "",
      vehicle: invoiceData.vehicle || "",
      mechanic: invoiceData.mechanic || "",
      description: invoiceData.description || "",
      partsCost: invoiceData.partsCost || 0,
      partsGst: invoiceData.partsGst || 0,
      laborCost: invoiceData.laborCost || 0,
      laborGst: invoiceData.laborGst || 0,
      taxes: invoiceData.taxes || 0,
      discounts: invoiceData.discounts || 0,
      total: invoiceData.total || 0,
      paymentMode: invoiceData.paymentMode || "",
      status: invoiceData.status || "Pending",
      dueDate: invoiceData.dueDate || "",
      notes: invoiceData.notes || "",
      // Service details
      serviceType: invoiceData.serviceType || "",
      serviceCategory: invoiceData.serviceCategory || "",
      serviceSubCategory: invoiceData.serviceSubCategory || "",
      serviceNotes: invoiceData.serviceNotes || "",
      // Cost breakdown items from invoice data
      costItems: invoiceData.invoiceCostItems || [],
    };
  } else if (serviceData) {
    return {
      invoiceNumber: generateTempInvoiceNumber(),
      date: today,
      customerId: preSelectedClientId || "",
      vehicle: `${serviceData.client?.vehicleMake || ""} ${
        serviceData.client?.vehicleModel || ""
      }`,
      mechanic: serviceData.mechanic || "",
      description: serviceData.description || "",
      partsCost: serviceData.partsCost || 0,
      partsGst: serviceData.partsGst || 0,
      laborCost: serviceData.laborCost || 0,
      laborGst: serviceData.laborGst || 0,
      taxes: 0,
      discounts: 0,
      total: serviceData.cost || 0,
      paymentMode: "",
      status: "Pending",
      dueDate: "",
      notes: serviceData.notes || "",
      // Service details
      serviceType: serviceData.category?.name || "",
      serviceCategory: serviceData.category?.name || "",
      serviceSubCategory: serviceData.subService?.name || "",
      serviceNotes: serviceData.notes || "",
      costItems: serviceData.costItems || [],
    };
  } else {
    return {
      invoiceNumber: generateTempInvoiceNumber(),
      date: today,
      customerId: preSelectedClientId || "",
      vehicle: "",
      mechanic: "",
      description: "",
      partsCost: 0,
      partsGst: 0,
      laborCost: 0,
      laborGst: 0,
      taxes: 0,
      discounts: 0,
      total: 0,
      paymentMode: "",
      status: "Pending",
      dueDate: "",
      notes: "",
      // Service details
      serviceType: "",
      serviceCategory: "",
      serviceSubCategory: "",
      serviceNotes: "",
      costItems: [],
    };
  }
};

export default function BillingForm() {
  const { id } = useParams(); // ✅ EDIT MODE if id exists
  const isEditMode = Boolean(id);
  const location = useLocation();
  const preSelectedClientId = location.state?.clientId || "";
  const serviceData = location.state?.serviceData || null;
  const [invoiceData, setInvoiceData] = useState(null);
  const restoreDraft = location.state?.restoreForm;
  const restoredInvoiceDraft = location.state?.invoiceDraft;
  const autoSubmit = location.state?.autoSubmit;


  const [form, setForm] = useState(() => {
    if (restoreDraft && restoredInvoiceDraft) {
      return restoredInvoiceDraft;
    }

    return getInitialFormState(
      isEditMode,
      preSelectedClientId,
      serviceData,
      invoiceData
    );
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // 1️⃣ Fetch clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_URL}/api/clients?page=1&limit=200`
        );
        const data = await res.json();
        setClients(data.data || data || []);
      } catch (err) {
        console.error("Failed to load clients:", err);
        setError("Failed to load clients");
      }
    };
    loadClients();
  }, []);

  // 2️⃣ Fetch invoice data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchInvoiceData = async () => {
        try {
          const res = await fetchWithAuth(`${API_URL}/api/invoices/${id}`);
          const data = await res.json();
          if (data) {
            setInvoiceData(data);
            setForm(
              getInitialFormState(
                isEditMode,
                preSelectedClientId,
                serviceData,
                data
              )
            );
          }
        } catch (err) {
          console.error("Failed to fetch invoice data:", err);
          setError("Failed to load invoice data");
        }
      };

      fetchInvoiceData();
    }
  }, [isEditMode, id, preSelectedClientId, serviceData]);

  // 3️⃣ Fetch service data if serviceId is provided
  useEffect(() => {
    if (serviceData && serviceData.id) {
      const fetchServiceData = async () => {
        try {
          const res = await fetchWithAuth(
            `${API_URL}/api/services/${serviceData.id}/billing`
          );
          const data = await res.json();

          if (data) {
            setForm((prev) => ({
              ...prev,
              customerId: data.clientId,
              vehicle: `${data.client?.vehicleMake || ""} ${
                data.client?.vehicleModel || ""
              }`,
              serviceType: data.category?.name || "",
              serviceCategory: data.category?.name || "",
              serviceSubCategory: data.subService?.name || "",
              serviceNotes: data.notes || "",
              partsCost: data.partsCost || 0,
              partsGst: data.partsGst || 0,
              laborCost: data.laborCost || 0,
              laborGst: data.laborGst || 0,
              costItems: data.costItems || [],
            }));
          }
        } catch (err) {
          console.error("Failed to fetch service data:", err);
        }
      };

      fetchServiceData();
    }
  }, [serviceData]);

  // 4️⃣ Auto total calculation
  useEffect(() => {
    const itemsTotal = calculateTotalFromItems();
    const grandTotal = itemsTotal - Number(form.discounts || 0);

    if (grandTotal !== Number(form.total)) {
      setForm((prev) => ({ ...prev, total: grandTotal }));
    }
  }, [form.costItems, form.discounts]);


  // 5️⃣ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!form.customerId) throw new Error("Please select a customer");
      const grandTotal = Number(form.total);

      if (Number.isNaN(grandTotal) || grandTotal <= 0) {
        throw new Error("Grand total must be greater than 0");
      }

      const payload = {
        invoiceNumber: form.invoiceNumber,
        date: form.date,
        clientId: Number(form.customerId),
        vehicle: form.vehicle,
        mechanic: form.mechanic,
        description: form.description,
        partsCost: Number(form.partsCost),
        partsGst: Number(form.partsGst),
        laborCost: Number(form.laborCost),
        laborGst: Number(form.laborGst),
        tax: Number(form.taxes),
        discount: Number(form.discounts),
        grandTotal: Number(form.total),
        totalAmount: Number(form.total),
        paymentMode: form.paymentMode,
        status: form.status,
        dueDate: form.dueDate ? new Date(form.dueDate) : null,
        notes: form.notes,
        serviceType: form.serviceType,
        serviceCategory: form.serviceCategory,
        serviceSubCategory: form.serviceSubCategory,
        serviceNotes: form.serviceNotes,
        costItems: form.costItems,
      };

      let res;
      if (isEditMode) {
        // ✅ EDIT MODE
        res = await fetchWithAuth(`${API_URL}/api/invoices/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // ✅ CREATE MODE
        res = await fetchWithAuth(`${API_URL}/api/invoices`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save invoice");
      }

      const data = await res.json();
      navigate(`/billing/${data.invoice.id}`);
    } catch (err) {
      console.error("Error saving invoice:", err);
      setError(err.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to handle cost item changes
  const handleCostItemChange = (index, field, value) => {
    const updatedCostItems = [...form.costItems];
    updatedCostItems[index] = {
      ...updatedCostItems[index],
      [field]: value,
    };
    setForm((prev) => ({ ...prev, costItems: updatedCostItems }));
  };

  // Add new cost item
  const addCostItem = () => {
    const newItem = {
      partName: "",
      partCost: 0,
      partGst: 0,
      laborCost: 0,
      laborGst: 0,
    };
    setForm((prev) => ({ ...prev, costItems: [...prev.costItems, newItem] }));
  };

  // Remove cost item
  const removeCostItem = (index) => {
    const updatedCostItems = form.costItems.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, costItems: updatedCostItems }));
  };

  // Calculate total from cost items
  const calculateTotalFromItems = () => {
    return form.costItems.reduce((total, item) => {
      const partTotal =
        Number(item.partCost) +
        (Number(item.partCost) * Number(item.partGst)) / 100;
      const laborTotal =
        Number(item.laborCost) +
        (Number(item.laborCost) * Number(item.laborGst)) / 100;
      return total + partTotal + laborTotal;
    }, 0);
  };

  return (
    <div
      className={`min-h-screen p-1 lg:ml-16 ${
        isDark ? " text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <Link
            to="/billing"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <FiArrowLeft /> Back to Billing
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Invoice Number"
                icon={<FiHash />}
                value={form.invoiceNumber}
                readOnly
              />
              <Input
                label="Invoice Date"
                type="date"
                icon={<FiCalendar />}
                value={form.date}
                onChange={handleChange}
              />
            </div>

            {/* Customer Selection */}
            <div className="md:col-span-2">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiUser /> Customer
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <option value="">Select Customer</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.regNumber})
                    </option>
                  ))}
                </select>
              </div>

              {preSelectedClientId && (
                <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                  <FiUser className="mr-1" />
                  Pre-selected customer from previous page
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Service Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Service Type"
                icon={<FiTool />}
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
              />
              <Input
                label="Service Category"
                icon={<FiTag />}
                name="serviceCategory"
                value={form.serviceCategory}
                onChange={handleChange}
              />
              <Input
                label="Service Sub-Category"
                icon={<FiTag />}
                name="serviceSubCategory"
                value={form.serviceSubCategory}
                onChange={handleChange}
              />
              <Input
                label="Vehicle"
                icon={<FiTag />}
                name="vehicle"
                value={form.vehicle}
                onChange={handleChange}
              />
              <Input
                label="Mechanic"
                icon={<FiUser />}
                name="mechanic"
                value={form.mechanic}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiFileText /> Service Notes
                </label>
                <textarea
                  name="serviceNotes"
                  value={form.serviceNotes}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-3 rounded-lg border resize-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cost Breakdown</h2>
              <span className="text-sm text-gray-500">
                Total: ₹{calculateTotalFromItems().toFixed(2)}
              </span>
            </div>

            {/* Cost Items - Only show if they exist from service data */}
            {form.costItems.length > 0 ? (
              <div className="space-y-4">
                {form.costItems.map((item, index) => {
                  const partTotal =
                    Number(item.partCost) +
                    (Number(item.partCost) * Number(item.partGst)) / 100;
                  const laborTotal =
                    Number(item.laborCost) +
                    (Number(item.laborCost) * Number(item.laborGst)) / 100;
                  const itemTotal = partTotal + laborTotal;

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Item #{index + 1}</h3>
                        <span className="text-sm text-gray-500">
                          {item.partName || "Unnamed Item"}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Parts</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span>₹{Number(item.partCost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST:</span>
                              <span>{Number(item.partGst)}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Parts Total:</span>
                              <span>₹{partTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Labor</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span>₹{Number(item.laborCost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST:</span>
                              <span>{Number(item.laborGst)}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Labor Total:</span>
                              <span>₹{laborTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 flex justify-between">
                        <span className="font-medium">Item Total:</span>
                        <span className="font-bold">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No cost breakdown available. Add cost items in the service form
                to include them here.
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiDollarSign /> Discount
                </label>
                <input
                  type="number"
                  name="discounts"
                  value={form.discounts}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiCreditCard /> Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiCheckCircle /> Payment Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiCalendar /> Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Grand Total Calculation Display */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark
                ? "bg-gradient-to-r from-gray-700 to-gray-600"
                : "bg-gradient-to-r from-gray-50 to-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Grand Total Calculation
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Items Total:</span>
                    <span className="ml-2">
                      ₹{calculateTotalFromItems().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>- ₹{Number(form.discounts).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span className="text-green-500">
                      ₹{form.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className={`w-full p-3 rounded-lg border resize-none ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            {/* 🔍 PREVIEW BUTTON */}
            <button
              type="button"
              onClick={() => {
                const selectedClient = clients.find(
                  (c) => String(c.id) === String(form.customerId)
                );

                const user = JSON.parse(localStorage.getItem("user"));

                navigate("/billing/preview", {
                  state: {
                    invoiceDraft: {
                      ...form,

                      // totals
                      grandTotal: Number(form.total),
                      discount: Number(form.discounts),

                      // client
                      client: selectedClient,

                      // ✅ GARAGE OWNER (USER)
                      userProfile: {
                        companyName: user?.companyName,
                        username: user?.username,
                        email: user?.email,
                        phone: user?.phone,
                      },

                      costItems: form.costItems || [],
                    },
                  },
                });
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Preview Invoice
            </button>

            {/* ✅ FINAL SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading
                ? "Processing..."
                : isEditMode
                ? "Update Invoice"
                : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input component
function Input({
  label,
  icon,
  type = "text",
  value,
  onChange,
  readOnly = false,
  name,
}) {
  const { isDark } = useTheme();

  return (
    <div>
      <label className="block font-semibold mb-2 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full p-3 rounded-lg border ${
          isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
        }`}
      />
    </div>
  );
}
