import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
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
  FiLoader
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { IndianRupee } from "lucide-react";
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Auth Helpers
const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
  return res;
};

// Invoice Number Generator
const generateInvoiceNumber = () => `BIKE-INV-${Date.now()}`;

export default function AddBilling() {
  const { isDark } = useTheme();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();
  const serviceData = location.state || null;
  
  const [allInvoices, setAllInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split("T")[0],
    bikeId: "",
    vehicle: "",
    serviceCategory: "",
    serviceSubCategory: "",
    serviceNotes: "",
    partsCost: 0,
    partsGst: 0,
    laborCost: 0,
    laborGst: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMode: "",
    status: "Pending",
  });

  /* LOAD BIKE OWNERS */
  useEffect(() => {
    // CASE 1: Coming from Service → Single Bike Only
    if (serviceData?.clientId) {
      setClients([{
        id: serviceData.clientId,
        ownerName: serviceData.clientName,
        regNumber: serviceData.vehicle
      }]);

      setForm(prev => ({
        ...prev,
        bikeId: serviceData.clientId,
        vehicle: serviceData.vehicle,
        serviceCategory: serviceData.serviceCategory,
        partsCost: serviceData.partsCost || 0,
        laborCost: serviceData.laborCost || 0,
        partsGst: serviceData.partsGst || 0,
        laborGst: serviceData.laborGst || 0,
      }));

      return;
    }

    // CASE 2: Opened directly → Load ALL SERVICE BIKES
    fetchWithAuth(`${API_URL}/api/bike-services`)
      .then(res => res.json())
      .then(data => {
        setAllServices(data);

        const uniqueClients = [];
        const map = new Map();

        data.forEach(service => {
          if (!map.has(service.client?.id)) {
            map.set(service.client?.id, true);
            uniqueClients.push({
              id: service.client.id,
              ownerName: service.client.ownerName,
              regNumber: service.client.regNumber,
              vehicleModel: service.client.bikeModel
            });
          }
        });

        setClients(uniqueClients);
      })
      .catch(() => setClients([]));
  }, [serviceData]);

  /* AUTO-FILL SERVICE DATA ON BIKE SELECT */
  useEffect(() => {
    if (!form.bikeId || !allServices.length) return;

    const clientServices = allServices.filter(
      s => s.client?.id === Number(form.bikeId)
    );

    if (!clientServices.length) return;

    const latestService = clientServices[0];

    setForm(prev => ({
      ...prev,
      vehicle: latestService.client?.bikeModel || "",
      serviceCategory: latestService.category?.name || "",
      serviceSubCategory: latestService.subService?.name || "",
      partsCost: latestService.partsCost || 0,
      partsGst: latestService.partsGst || 0,
      laborCost: latestService.laborCost || 0,
      laborGst: latestService.laborGst || 0,
    }));
  }, [form.bikeId, allServices]);

  /* LOAD INVOICE IN EDIT MODE */
  useEffect(() => {
    if (!isEditMode) return;

    setLoading(true);
    fetchWithAuth(`${API_URL}/api/bike-invoices/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          invoiceNumber: data.invoiceNumber,
          date: data.createdAt?.split("T")[0],
          bikeId: data.bikeId,
          vehicle: data.vehicle,
          serviceCategory: data.serviceCategory,
          serviceSubCategory: data.serviceSubCategory,
          serviceNotes: data.notes,
          partsCost: data.partsCost,
          partsGst: data.partsGst,
          laborCost: data.laborCost,
          laborGst: data.laborGst,
          tax: data.tax,
          discount: data.discount,
          total: data.grandTotal,
          paymentMode: data.paymentMode,
          status: data.status,
        });
      })
      .catch(() => {
        setError("Failed to load invoice");
        toast.error("Failed to load invoice");
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  /* LOAD EXISTING BIKE INVOICES (FOR DUPLICATE CHECK) */
  useEffect(() => {
    fetchWithAuth(`${API_URL}/api/bike-invoices`)
      .then(res => res.json())
      .then(setAllInvoices)
      .catch(() => setAllInvoices([]));
  }, []);

  /* AUTO GRAND TOTAL CALCULATION */
  useEffect(() => {
    const parts = Number(form.partsCost) * (1 + form.partsGst / 100);
    const labor = Number(form.laborCost) * (1 + form.laborGst / 100);
    const total = parts + labor + Number(form.tax) - Number(form.discount);
    setForm(f => ({ ...f, total }));
  }, [
    form.partsCost,
    form.partsGst,
    form.laborCost,
    form.laborGst,
    form.tax,
    form.discount
  ]);

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bikeId) {
      toast.error("Please select Bike Owner");
      return;
    }
    // PAYMENT VALIDATION
    if (form.status === "Paid" && !form.paymentMode) {
    toast.error("Please select a Payment Mode for Paid invoices");
    return;
    }

    if (!form.paymentMode) {
    const allow = window.confirm(
        "You have NOT selected a Payment Mode.\n\nDo you still want to create invoice?"
    );
    if (!allow) return;
    }


    // DUPLICATE CHECK → ONLY SAME BIKE + SAME SERVICE CATEGORY
    if (!isEditMode && allInvoices.length > 0) {
      const duplicateInvoice = allInvoices.find(
        inv =>
          inv.bikeId === Number(form.bikeId) &&
          inv.serviceCategory?.toLowerCase() === form.serviceCategory?.toLowerCase()
      );

      if (duplicateInvoice) {
        const allow = window.confirm(
          "Invoice already exists for this Bike with the SAME Service.\n\nDo you want to create another invoice?"
        );
        if (!allow) return;
      }
    }

    setLoading(true);

    const payload = {
      bikeId: Number(form.bikeId),
      vehicle: form.vehicle,
      serviceCategory: form.serviceCategory,
      serviceSubCategory: form.serviceSubCategory,
      partsCost: Number(form.partsCost),
      partsGst: Number(form.partsGst),
      laborCost: Number(form.laborCost),
      laborGst: Number(form.laborGst),
      tax: Number(form.tax),
      discount: Number(form.discount),
      grandTotal: Number(form.total),
      paymentMode: form.paymentMode,
      status: form.status,
      notes: form.serviceNotes,
    };

    try {
      const res = await fetchWithAuth(
        isEditMode
          ? `${API_URL}/api/bike-invoices/${id}`
          : `${API_URL}/api/bike-invoices`,
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      toast.success(isEditMode ? "Invoice updated successfully" : "Invoice created successfully");
      navigate(`/bill/${isEditMode ? id : data.invoice.id}`);
    } catch {
      setError("Failed to save invoice");
      toast.error("Failed to save invoice");
    }

    setLoading(false);
  };

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/bike-billing"
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all duration-300 w-fit ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <FiArrowLeft size={20} />
            Back to Billing
          </Link>

          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
              {isEditMode ? "Edit Invoice" : "Create New Invoice"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {isEditMode ? "Update invoice details" : "Fill in the details to create a new billing invoice"}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`p-4 rounded-xl border-2 mb-6 flex items-center gap-3 ${
            isDark
              ? "bg-red-500/20 border-red-500/50 text-red-400"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            <FiAlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}>
            <h2 className={`flex items-center gap-2 text-lg font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <FiFileText size={20} className="text-blue-500" />
              Invoice Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
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

          {/* Customer & Service */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`} style={{ animationDelay: "100ms" }}>
            <h2 className={`flex items-center gap-2 text-lg font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <FiUser size={20} className="text-green-500" />
              Customer & Service Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Select
                label="Bike Owner"
                icon={<FiUser />}
                value={form.bikeId}
                onChange={(e) => setForm({ ...form, bikeId: e.target.value })}
                isDark={isDark}
              >
                <option value="">Select Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.ownerName} ({c.regNumber})
                  </option>
                ))}
              </Select>

              <Input
                label="Bike Model"
                icon={<FiTool />}
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                isDark={isDark}
              />

              <Input
                label="Service Category"
                icon={<FiTag />}
                value={form.serviceCategory}
                onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })}
                isDark={isDark}
              />

              <Input
                label="Sub Service"
                icon={<FiTag />}
                value={form.serviceSubCategory}
                onChange={(e) => setForm({ ...form, serviceSubCategory: e.target.value })}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Cost Section */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
            isDark
              ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/50"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
          }`} style={{ animationDelay: "200ms" }}>
            <h2 className={`flex items-center gap-2 text-lg font-bold mb-6 ${
              isDark ? "text-blue-400" : "text-blue-700"
            }`}>
              <IndianRupee size={20} />
              Cost Breakdown
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Parts Cost"
                type="number"
                value={form.partsCost}
                onChange={(e) => setForm({ ...form, partsCost: e.target.value })}
                isDark={isDark}
                placeholder="0.00"
              />
              <Input
                label="Parts GST %"
                type="number"
                icon={<FiPercent />}
                value={form.partsGst}
                onChange={(e) => setForm({ ...form, partsGst: e.target.value })}
                isDark={isDark}
                placeholder="0"
              />
              <Input
                label="Labor Cost"
                type="number"
                value={form.laborCost}
                onChange={(e) => setForm({ ...form, laborCost: e.target.value })}
                isDark={isDark}
                placeholder="0.00"
              />
              <Input
                label="Labor GST %"
                type="number"
                icon={<FiPercent />}
                value={form.laborGst}
                onChange={(e) => setForm({ ...form, laborGst: e.target.value })}
                isDark={isDark}
                placeholder="0"
              />
              
              <Input
                label="Discount"
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                isDark={isDark}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`} style={{ animationDelay: "300ms" }}>
            <h2 className={`flex items-center gap-2 text-lg font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <FiCreditCard size={20} className="text-purple-500" />
              Payment Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Select
                label="Payment Mode"
                icon={<FiCreditCard />}
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                isDark={isDark}
              >
                <option value="">Select Payment</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
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

          {/* Grand Total */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 animate-slide-down ${
            isDark
              ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          }`} style={{ animationDelay: "350ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiTrendingUp size={24} className="text-green-500" />
                <span className={`text-xl font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Grand Total:
                </span>
              </div>
              <span className="text-3xl font-bold text-green-600">
                ₹{form.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 animate-slide-down" style={{ animationDelay: "400ms" }}>
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
                  <FiSave size={20} className="group-hover:scale-110 transition-transform" />
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
function Input({ label, icon, type = "text", value, onChange, readOnly, isDark, placeholder }) {
  return (
    <div className="space-y-2">
      <label className={`flex items-center gap-2 text-sm font-semibold ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}>
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
      <label className={`flex items-center gap-2 text-sm font-semibold ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}>
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