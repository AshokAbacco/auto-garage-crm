import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit2,
  FileText,
  Printer,
  User,
  Phone,
  Mail,
  Car,
  Hash,
  Wrench,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const token = localStorage.getItem("token");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/bike-services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setService(data);
    } catch (err) {
      toast.error("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-green-500" size={48} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Service not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/bike-services")}
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <ArrowLeft size={20} />
            Back to Services
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
                Service Details
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Complete information about this service
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
                }`}
              >
                <Printer size={18} className="group-hover:scale-110 transition-transform" />
                Print
              </button>

              <button
                onClick={() => navigate(`/bike-services/${id}/edit`)}
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
              >
                <Edit2 size={18} className="group-hover:rotate-12 transition-transform" />
                Edit Service
              </button>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`mb-8 p-6 rounded-2xl border-2 text-center animate-slide-down ${
          service.status === "Paid"
            ? isDark
              ? "bg-green-500/20 border-green-500/50"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            : isDark
            ? "bg-orange-500/20 border-orange-500/50"
            : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
        }`}>
          <div className="flex items-center justify-center gap-3">
            {service.status === "Paid" ? (
              <CheckCircle size={32} className="text-green-500" />
            ) : (
              <Clock size={32} className="text-orange-500" />
            )}
            <h2 className={`text-3xl font-bold ${
              service.status === "Paid" ? "text-green-600" : "text-orange-600"
            }`}>
              {service.status}
            </h2>
          </div>
          <p className={`mt-2 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            {service.status === "Paid" ? "Payment completed" : "Awaiting payment"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Service Details */}
          <div className={`lg:col-span-2 rounded-2xl shadow-xl border-2 p-6 transition-all duration-300 animate-slide-up ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}>
            <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <Wrench size={24} className="text-green-500" />
              Service Information
            </h3>

            <div className="space-y-4">
              <InfoRow
                icon={<Tag size={18} className="text-purple-500" />}
                label="Category"
                value={service.category?.name}
                isDark={isDark}
              />

              <InfoRow
                icon={<Wrench size={18} className="text-orange-500" />}
                label="Sub Service"
                value={service.subService?.name}
                isDark={isDark}
              />

              <InfoRow
                icon={<Calendar size={18} className="text-blue-500" />}
                label="Service Date"
                value={new Date(service.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
                isDark={isDark}
              />

              {service.notes && (
                <div className={`p-4 rounded-xl border-2 ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-start gap-2 mb-2">
                    <FileText size={18} className="text-indigo-500 mt-1 flex-shrink-0" />
                    <span className={`font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Notes
                    </span>
                  </div>
                  <p className={`ml-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {service.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 transition-all duration-300 animate-slide-up ${
            isDark
              ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50"
              : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
          }`} style={{ animationDelay: "100ms" }}>
            <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${
              isDark ? "text-green-400" : "text-green-700"
            }`}>
              <DollarSign size={24} />
              Cost Breakdown
            </h3>

            <div className="space-y-4">
              <CostRow
                label="Parts Cost"
                amount={service.partsCost}
                isDark={isDark}
              />

              {service.partsGst > 0 && (
                <CostRow
                  label={`Parts GST (${service.partsGst}%)`}
                  amount={(service.partsCost * service.partsGst / 100).toFixed(2)}
                  isDark={isDark}
                  isSubItem
                />
              )}

              <CostRow
                label="Labor Cost"
                amount={service.laborCost}
                isDark={isDark}
              />

              {service.laborGst > 0 && (
                <CostRow
                  label={`Labor GST (${service.laborGst}%)`}
                  amount={(service.laborCost * service.laborGst / 100).toFixed(2)}
                  isDark={isDark}
                  isSubItem
                />
              )}

              <div className={`pt-4 mt-4 border-t-2 ${
                isDark ? "border-gray-700" : "border-green-200"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Total Amount
                  </span>
                  <span className="text-3xl font-bold text-green-600">
                    ₹{service.cost}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className={`rounded-2xl shadow-xl border-2 p-6 mb-6 transition-all duration-300 animate-slide-up ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`} style={{ animationDelay: "200ms" }}>
          <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <User size={24} className="text-blue-500" />
            Client Information
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              icon={<User size={20} className="text-green-500" />}
              label="Owner Name"
              value={service.client?.ownerName}
              isDark={isDark}
            />

            <InfoCard
              icon={<Phone size={20} className="text-blue-500" />}
              label="Phone"
              value={service.client?.phone}
              isDark={isDark}
            />

            <InfoCard
              icon={<Mail size={20} className="text-purple-500" />}
              label="Email"
              value={service.client?.email}
              isDark={isDark}
            />

            <InfoCard
              icon={<Car size={20} className="text-orange-500" />}
              label="Vehicle Model"
              value={service.client?.vehicleModel}
              isDark={isDark}
            />

            <InfoCard
              icon={<Hash size={20} className="text-indigo-500" />}
              label="Registration"
              value={service.client?.regNumber}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Media Files */}
        {service.mediaFiles && service.mediaFiles.length > 0 && (
          <div className={`rounded-2xl shadow-xl border-2 p-6 mb-6 transition-all duration-300 animate-slide-up ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`} style={{ animationDelay: "300ms" }}>
            <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <ImageIcon size={24} className="text-pink-500" />
              Service Images
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.mediaFiles.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-300 hover:border-green-500 transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={img.data}
                    alt={`Service ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-sm font-medium">
                      Image {idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end animate-slide-up" style={{ animationDelay: "400ms" }}>
          <button
              onClick={() => navigate(`/bill/new`, {
                state: {
                  clientId: service.client?.id,
                  clientName: service.client?.ownerName,
                  vehicle: service.client?.vehicleModel,
                  serviceCategory: service.category?.name,
                  partsCost: service.partsCost,
                  laborCost: service.laborCost,
                  partsGst: service.partsGst,
                  laborGst: service.laborGst,
                }
              })}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg"
            >
              <Receipt size={20} />
              Create Invoice
            </button>

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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
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

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Helper Components
function InfoRow({ icon, label, value, isDark }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      isDark ? "bg-gray-700/50" : "bg-gray-50"
    }`}>
      {icon}
      <div className="flex-1">
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </p>
        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function CostRow({ label, amount, isDark, isSubItem = false }) {
  return (
    <div className={`flex items-center justify-between ${isSubItem ? "pl-4" : ""}`}>
      <span className={`${isSubItem ? "text-sm" : ""} ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}>
        {label}
      </span>
      <span className={`font-semibold ${isSubItem ? "text-sm" : ""} ${
        isDark ? "text-white" : "text-gray-900"
      }`}>
        ₹{amount}
      </span>
    </div>
  );
}

function InfoCard({ icon, label, value, isDark }) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
      isDark
        ? "bg-gray-700/50 border-gray-600 hover:border-green-500/50"
        : "bg-gray-50 border-gray-200 hover:border-green-500/30"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className={`text-xs font-medium ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}>
          {label}
        </span>
      </div>
      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

export default ServiceDetails;