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
import api from "../../utils/axiosInstance";

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
    const fetchClients = async () => {
      // CASE 1: Coming from Service → Single Bike Only
      if (serviceData?.bikeId) {
        setClients([{
          id: serviceData.bikeId,
          ownerName: serviceData.clientName,
          regNumber: serviceData.vehicle
        }]);

        setForm(prev => ({
          ...prev,
          bikeId: serviceData.bikeId,
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
      try {
        const res = await api.get("/api/bike-services");
        const data = Array.isArray(res.data) ? res.data : [];
        setAllServices(data);

        const uniqueClients = [];
        const map = new Map();

        data.forEach(service => {
          if (service.client && !map.has(service.client.id)) {
            map.set(service.client.id, true);
            uniqueClients.push({
              id: service.client.id,
              ownerName: service.client.ownerName,
              regNumber: service.client.regNumber,
              vehicleModel: service.client.bikeModel
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
          serviceCategory: "",  // Not stored in backend
          serviceSubCategory: "",  // Not stored in backend
          serviceNotes: "",  // Not stored in backend
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

    // DUPLICATE CHECK → ONLY SAME BIKE (can't check service since not stored)
    if (!isEditMode && allInvoices.length > 0 && form.serviceCategory) {
      const duplicateInvoice = allInvoices.find(
        inv => inv.bikeId === Number(form.bikeId)
      );

      if (duplicateInvoice) {
        const allow = window.confirm(
          "An invoice already exists for this Bike.\n\nDo you want to create another invoice?"
        );
        if (!allow) return;
      }
    }

    setLoading(true);

    // Schema only supports basic fields - no serviceCategory, serviceSubCategory, or notes
    const payload = {
      bikeId: Number(form.bikeId),
      vehicle: form.vehicle,
      partsCost: Number(form.partsCost),
      partsGst: Number(form.partsGst),
      laborCost: Number(form.laborCost),
      laborGst: Number(form.laborGst),
      tax: Number(form.tax),
      discount: Number(form.discount),
      grandTotal: Number(form.total),
      paymentMode: form.paymentMode,
      status: form.status,
    };

    try {
      const res = isEditMode
        ? await api.put(`/api/bike-invoices/${id}`, payload)
        : await api.post("/api/bike-invoices", payload);

      const data = res.data;
      toast.success(isEditMode ? "Invoice updated successfully" : "Invoice created successfully");
      navigate(`/bill/${isEditMode ? id : data.invoice.id}`);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to save invoice");
      toast.error(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
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
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
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

            {/* Info Note */}
            <div className={`mb-4 p-3 rounded-lg border ${
              isDark 
                ? "bg-blue-500/10 border-blue-500/30 text-blue-300" 
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <p className="text-xs flex items-center gap-2">
                <FiAlertCircle size={14} />
                Note: Service category and notes are for reference only and won't be saved to invoice.
              </p>
            </div>

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

            <div className="mt-4">
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <FiFileText className="text-blue-500" />
                Service Notes
              </label>
              <textarea
                placeholder="Add any additional service notes..."
                value={form.serviceNotes}
                onChange={(e) => setForm({ ...form, serviceNotes: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
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
              <FiCreditCard size={20} className="text-blue-600" />
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