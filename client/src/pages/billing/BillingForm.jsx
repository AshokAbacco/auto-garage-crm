import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
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
  FiPlus,
} from "react-icons/fi";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* =========================
   Helpers
========================= */

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

const generateTempInvoiceNumber = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${dateStr}-${random}`;
};

const num = (v) => (Number.isFinite(+v) ? +v : 0);

const calculateRowTotal = (row) => {
  const base = num(row.quantity) * num(row.unitPrice);
  const cgst = (base * num(row.cgstRate)) / 100;
  const sgst = (base * num(row.sgstRate)) / 100;
  return base + cgst + sgst;
};

const calculateGrandTotal = (items = []) =>
  items.reduce((sum, row) => sum + calculateRowTotal(row), 0);

const calculateTaxBreakdown = (items = []) => {
  let partsAmount = 0;
  let laborAmount = 0;
  let partsCgst = 0;
  let partsSgst = 0;
  let laborCgst = 0;
  let laborSgst = 0;

  items.forEach((row) => {
    const base = num(row.quantity) * num(row.unitPrice);
    const cgst = (base * num(row.cgstRate)) / 100;
    const sgst = (base * num(row.sgstRate)) / 100;

    if (row.type === "part") {
      partsAmount += base;
      partsCgst += cgst;
      partsSgst += sgst;
    } else {
      laborAmount += base;
      laborCgst += cgst;
      laborSgst += sgst;
    }
  });

  return {
    partsAmount,
    laborAmount,
    partsCgst,
    partsSgst,
    laborCgst,
    laborSgst,
  };
};

const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const thousands = ["", "Thousand", "Million", "Billion"];

  const convertHundreds = (n) => {
    let result = "";

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      result += ones[n] + " ";
    }

    return result.trim();
  };

  let words = "";
  let i = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      const hundreds = convertHundreds(num % 1000);
      words = hundreds + " " + thousands[i] + " " + words;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return words.trim() + " Only";
};

/* =========================
   Initial Form State
========================= */

const getInitialFormState = (isEditMode, preSelectedClientId, invoiceData) => {
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
      netAmount: invoiceData.netAmount || 0,
      discountAmount: invoiceData.discountAmount || 0,
      amountAfterDiscount: invoiceData.amountAfterDiscount || 0,
      roundedAmount: invoiceData.roundedAmount || invoiceData.total || 0,
      roundOffAmount: invoiceData.roundOffAmount || 0,
      total: invoiceData.total || 0,
      paymentMode: invoiceData.paymentMode || "",
      status: invoiceData.status || "Pending",
      dueDate: invoiceData.dueDate || "",
      notes: invoiceData.notes || "",
      serviceType: invoiceData.serviceType || "",
      serviceCategory: invoiceData.serviceCategory || "",
      serviceSubCategory: invoiceData.serviceSubCategory || "",
      serviceNotes: invoiceData.serviceNotes || "",
      costItems: invoiceData.invoiceCostItems || [],
    };
  }

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
    netAmount: 0,
    discountAmount: 0,
    amountAfterDiscount: 0,
    roundedAmount: 0,
    roundOffAmount: 0,
    total: 0,
    paymentMode: "",
    status: "Pending",
    dueDate: "",
    notes: "",
    serviceType: "",
    serviceCategory: "",
    serviceSubCategory: "",
    serviceNotes: "",
    costItems: [],
  };
};

/* =========================
   Component
========================= */

export default function BillingForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const preSelectedClientId = location.state?.clientId || "";
  const serviceId = location.state?.serviceId;

  const [invoiceData, setInvoiceData] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const restoreForm = location.state?.restoreForm;
  const invoiceDraft = location.state?.invoiceDraft;
  const autoSubmit = location.state?.autoSubmit;

  const [form, setForm] = useState(() =>
    getInitialFormState(isEditMode, preSelectedClientId, null),
  );

  useEffect(() => {
    fetchWithAuth(`${API_URL}/api/clients?page=1&limit=200`)
      .then((r) => r.json())
      .then((d) => setClients(d.data || d || []))
      .catch(() => setError("Failed to load clients"));
  }, []);

  const selectedClient = clients.find(
    (c) => String(c.id) === String(form.customerId),
  );

  useEffect(() => {
    fetchWithAuth(`${API_URL}/api/user/profile`)
      .then((r) => r.json())
      .then(setUserProfile)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditMode || !id) return;

    fetchWithAuth(`${API_URL}/api/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoiceData(data);
        setForm(getInitialFormState(true, preSelectedClientId, data));
      })
      .catch(() => setError("Failed to load invoice data"));
  }, [isEditMode, id, preSelectedClientId]);

  useEffect(() => {
    if (restoreForm && invoiceDraft) {
      setForm(invoiceDraft);
    }
  }, [restoreForm, invoiceDraft]);

  useEffect(() => {
    if (autoSubmit && restoreForm && invoiceDraft) {
      setTimeout(() => {
        document.querySelector("form")?.requestSubmit();
      }, 0);
    }
  }, [autoSubmit, restoreForm, invoiceDraft]);

  /* =========================
     Service → Invoice Context Refactor
  ========================= */
  useEffect(() => {
    if (!serviceId || isEditMode) return;

    fetchWithAuth(`${API_URL}/api/services/${serviceId}/billing`)
      .then((r) => r.json())
      .then((data) =>
        setForm((prev) => ({
          ...prev,
          customerId: data.client.id,
          vehicle: `${data.client.vehicleMake} ${data.client.vehicleModel}`,
          serviceType: data.category?.name || "",
          serviceCategory: data.category?.name || "",
          mechanic: data.assignedMechanic || "",
          // 🔄 UPDATED: Maps multiple sub-services and joins them cleanly using commas
          serviceSubCategory:
            data.subServices && data.subServices.length > 0
              ? data.subServices.map((sub) => sub.name).join(", ")
              : "",
          serviceNotes: data.notes || "",
          partsCost: 0,
          laborCost: 0,
          costItems: data.costItems || [],
        })),
      )
      .catch(() => setError("Failed to load service billing data"));
  }, [serviceId, isEditMode]);

  /* =========================
     Totals Calculation Block
  ========================= */
  useEffect(() => {
    const netAmount = calculateGrandTotal(form.costItems);
    const discountAmount = Number(form.discounts || 0);
    const amountAfterDiscount = netAmount - discountAmount;
    const roundedAmount = Math.floor(amountAfterDiscount);
    const roundOffAmount = amountAfterDiscount - roundedAmount;

    setForm((p) => ({
      ...p,
      netAmount,
      discountAmount,
      amountAfterDiscount,
      roundedAmount,
      roundOffAmount,
    }));
  }, [form.costItems, form.discounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        clientId: Number(form.customerId),
        grandTotal: Number(form.roundedAmount),
        totalAmount: Number(form.roundedAmount),
        costItems: form.costItems,
      };

      const res = await fetchWithAuth(
        isEditMode
          ? `${API_URL}/api/invoices/${id}`
          : `${API_URL}/api/invoices`,
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      navigate(`/billing/${data.invoice.id}`);
    } catch {
      setError("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const updateCostItem = (index, field, value) => {
    const updated = [...form.costItems];
    updated[index][field] = value;
    setForm((p) => ({ ...p, costItems: updated }));
  };

  const addCostItem = () => {
    setForm((p) => ({
      ...p,
      costItems: [
        ...p.costItems,
        {
          type: "part",
          name: "",
          quantity: 1,
          unitPrice: "",
          cgstRate: "",
          sgstRate: "",
        },
      ],
    }));
  };

  const removeCostItem = (index) => {
    setForm((p) => ({
      ...p,
      costItems: p.costItems.filter((_, i) => i !== index),
    }));
  };

  const taxBreakdown = calculateTaxBreakdown(form.costItems);

  return (
    <div
      className={`min-h-screen p-1 lg:ml-16 ${
        isDark ? "text-gray-100" : "bg-gray-50 text-gray-900"
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
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Customer Selection */}
            <div className="md:col-span-2">
              <div className="mt-4">
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiUser /> Customer
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value })
                  }
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
                onChange={(e) =>
                  setForm({ ...form, serviceType: e.target.value })
                }
              />
              <Input
                label="Service Category"
                icon={<FiTag />}
                name="serviceCategory"
                value={form.serviceCategory}
                onChange={(e) =>
                  setForm({ ...form, serviceCategory: e.target.value })
                }
              />
              <Input
                label="Service Sub-Category"
                icon={<FiTag />}
                name="serviceSubCategory"
                value={form.serviceSubCategory}
                onChange={(e) =>
                  setForm({ ...form, serviceSubCategory: e.target.value })
                }
              />
              <Input
                label="Vehicle"
                icon={<FiTag />}
                name="vehicle"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              />
              <Input
                label="Mechanic"
                icon={<FiUser />}
                name="mechanic"
                value={form.mechanic}
                onChange={(e) => setForm({ ...form, mechanic: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiFileText /> Service Notes
                </label>
                <textarea
                  name="serviceNotes"
                  value={form.serviceNotes}
                  onChange={(e) =>
                    setForm({ ...form, serviceNotes: e.target.value })
                  }
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
                Total: ₹{calculateGrandTotal(form.costItems).toFixed(2)}
              </span>
            </div>

            <div className="space-y-4">
              {form.costItems.map((row, i) => {
                const itemTotal = calculateRowTotal(row);

                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Type
                        </label>
                        <select
                          value={row.type}
                          onChange={(e) =>
                            updateCostItem(i, "type", e.target.value)
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <option value="part">Part</option>
                          <option value="labor">Labor</option>
                        </select>
                      </div>

                      {/* Name or Mechanic */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {row.type === "part" ? "Part Name" : "Mechanic"}
                        </label>
                        <input
                          value={row.name}
                          onChange={(e) =>
                            updateCostItem(i, "name", e.target.value)
                          }
                          placeholder={
                            row.type === "part" ? "Head Light" : "Mechanic name"
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {row.type === "part" ? "Quantity" : "Total Labors"}
                        </label>
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) =>
                            updateCostItem(i, "quantity", e.target.value)
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {row.type === "part" ? "Unit Price" : "Labor Cost"}{" "}
                          (₹)
                        </label>
                        <input
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) =>
                            updateCostItem(i, "unitPrice", e.target.value)
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        />
                      </div>

                      {/* CGST */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          CGST (%)
                        </label>
                        <input
                          type="number"
                          value={row.cgstRate}
                          onChange={(e) =>
                            updateCostItem(i, "cgstRate", e.target.value)
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        />
                      </div>

                      {/* SGST */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          SGST (%)
                        </label>
                        <input
                          type="number"
                          value={row.sgstRate}
                          onChange={(e) =>
                            updateCostItem(i, "sgstRate", e.target.value)
                          }
                          className={`w-full p-2 border rounded-lg ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-green-600">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addCostItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                <FiPlus /> Add Cost Item
              </button>
            </div>
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
                  <MdOutlineCurrencyRupee /> Discount
                </label>
                <input
                  type="number"
                  name="discounts"
                  value={form.discounts}
                  onChange={(e) =>
                    setForm({ ...form, discounts: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2">
                  <FiCreditCard /> Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={(e) =>
                    setForm({ ...form, paymentMode: e.target.value })
                  }
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
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
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
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Grand Total Calculation
                </h3>

                <div className="space-y-2 text-sm">
                  {taxBreakdown.partsAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>
                          CGST(Parts) @{" "}
                          {taxBreakdown.partsCgst > 0
                            ? (
                                (taxBreakdown.partsCgst /
                                  taxBreakdown.partsAmount) *
                                100
                              ).toFixed(2)
                            : 0}
                          % on Amount {taxBreakdown.partsAmount.toFixed(2)}
                        </span>
                        <span>₹{taxBreakdown.partsCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          SGST(Parts) @{" "}
                          {taxBreakdown.partsSgst > 0
                            ? (
                                (taxBreakdown.partsSgst /
                                  taxBreakdown.partsAmount) *
                                100
                              ).toFixed(2)
                            : 0}
                          % on Amount {taxBreakdown.partsAmount.toFixed(2)}
                        </span>
                        <span>₹{taxBreakdown.partsSgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {taxBreakdown.laborAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>
                          CGST(Labor) @{" "}
                          {taxBreakdown.laborCgst > 0
                            ? (
                                (taxBreakdown.laborCgst /
                                  taxBreakdown.laborAmount) *
                                100
                              ).toFixed(2)
                            : 0}
                          % on Amount {taxBreakdown.laborAmount.toFixed(2)}
                        </span>
                        <span>₹{taxBreakdown.laborCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          SGST(Labor) @{" "}
                          {taxBreakdown.laborSgst > 0
                            ? (
                                (taxBreakdown.laborSgst /
                                  taxBreakdown.laborAmount) *
                                100
                              ).toFixed(2)
                            : 0}
                          % on Amount {taxBreakdown.laborAmount.toFixed(2)}
                        </span>
                        <span>₹{taxBreakdown.laborSgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-2 flex justify-between font-medium dark:border-gray-600">
                    <span>Net Amount</span>
                    <span>₹{form.netAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>- ₹{form.discountAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-medium dark:border-gray-600">
                    <span>Amount After Discount</span>
                    <span>₹{form.amountAfterDiscount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Round off</span>
                    <span>- ₹{form.roundOffAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-bold text-lg dark:border-gray-600">
                    <span>Amount Payable</span>
                    <span className="text-green-500">
                      ₹{form.roundedAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-bold dark:border-gray-600">
                    <span>Total Amount (In figure)</span>
                    <span>₹{form.roundedAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-bold dark:border-gray-600">
                    <span>Total Amount (In Words)</span>
                    <span>{numberToWords(Math.round(form.roundedAmount))}</span>
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
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/billing/preview", {
                  state: {
                    invoiceDraft: {
                      ...form,
                      client: selectedClient || null,
                      userProfile,
                    },
                  },
                })
              }
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Preview Invoice
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md"
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

/* =========================
   Input Component
========================= */

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
      <label className="block font-semibold mb-2 flex items-center gap-2 text-sm">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full p-3 rounded-lg border text-sm ${
          isDark
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-50 border-gray-300 text-gray-900"
        } outline-none`}
      />
    </div>
  );
}
