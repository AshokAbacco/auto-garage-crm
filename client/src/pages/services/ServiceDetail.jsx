// client/src/pages/services/ServiceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDollarSign,
  FiClock,
  FiTool,
  FiUser,
  FiPrinter,
  FiFileText,
  FiClipboard,
  FiTag,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiInfo,
} from "react-icons/fi";
import { FaCar, FaRupeeSign } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  return res;
};

export default function ServiceDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        const res = await apiRequest(`/api/services/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load service");
        setService(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadService();
  }, [id]);

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-3 font-semibold">{error}</p>
        <Link to="/services" className="text-green-600 hover:underline">
          Back to Services
        </Link>
      </div>
    );

  if (!service)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading service details...
      </div>
    );

  // Calculation with GST (default 0 if missing)
  const partsCost = Number(service.partsCost || 0);
  const laborCost = Number(service.laborCost || 0);
  const partsGst = Number(service.partsGst || 0);
  const laborGst = Number(service.laborGst || 0);

  const totalParts = partsCost + (partsCost * partsGst) / 100;
  const totalLabor = laborCost + (laborCost * laborGst) / 100;
  const estimatedTotal = (totalParts + totalLabor).toFixed(2);

  const statusColor =
    service.status === "Pending"
      ? "bg-red-500"
      : service.status === "Paid"
      ? "bg-green-600"
      : "bg-gray-400";


  // Prepare service data for invoice creation
  const serviceDataForInvoice = {
    id: service.id,
    vehicle: `${service.client?.vehicleMake || ''} ${service.client?.vehicleModel || ''} (${service.client?.regNumber || ''})`,
    mechanic: service.mechanic || "",
    description: service.notes || "",
    partsCost: partsCost,
    partsGst: partsGst,
    laborCost: laborCost,
    laborGst: laborGst,
    taxes: 0,
    discounts: 0,
    total: parseFloat(estimatedTotal),
    paymentMode: "",
    status: service.status || "Pending",
    dueDate: "",
    notes: service.notes || "",
    // Add service type and category
    serviceCategory: service.category?.name || "",
    serviceSubCategory: service.subService?.name || "",
    serviceNotes: service.notes || "",
    // Include client ID
    clientId: service.client?.id,
  };

  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      {/* Header */}
      <div
        className={`rounded-3xl shadow-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"
          }`}
      >
        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/services"
              className="flex items-center gap-2 text-green-600 font-medium mb-2"
            >
              <FiArrowLeft /> Back
            </Link>
            <h1 className="text-3xl font-bold capitalize flex items-center gap-2">
              <FiTool />{" "}
              {service.subService?.name || service.category?.name || "Unnamed Service"}
            </h1>
            <p
              className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                } text-sm`}
            >
              Service ID #{service.id} •{" "}
              {new Date(service.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium flex items-center gap-2"
            >
              <FiPrinter /> Print
            </button>
            <Link
              to={`/services/${id}/edit`}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
            >
              <FiFileText /> Edit
            </Link>
          </div>
        </div>

        {/* Status banner */}
        <div
          className={`p-4 text-center text-white font-semibold ${statusColor}`}
        >
          <FiClock className="inline mr-1" />
          {service.status}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 p-8">
          {/* Service Info */}
          <div className={`p-6 rounded-2xl shadow ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FiTool /> Service Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Service Category</p>
                <p className="font-semibold">{service.category?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Service Sub-Category</p>
                <p className="font-semibold">{service.subService?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Service Date</p>
                <p className="font-semibold">{new Date(service.date).toLocaleDateString()}</p>
              </div>
              {service.notes && (
                <div>
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className={`whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {service.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={`p-6 rounded-2xl shadow ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FaRupeeSign /> Cost Breakdown
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Parts Cost</span>
                <span>₹{partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Parts GST</span>
                <span>{partsGst}%</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Cost</span>
                <span>₹{laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor GST</span>
                <span>{laborGst}%</span>
              </div>
              <div className="flex justify-between">
                <span>Parts with GST</span>
                <span>₹{totalParts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor with GST</span>
                <span>₹{totalLabor.toFixed(2)}</span>
              </div>
              <hr className="my-3 border-gray-500/30" />
              <div className="flex justify-between text-lg font-bold text-green-500">
                <span>Estimated Total</span>
                <span>₹{estimatedTotal}</span>
              </div>
            </div>
          </div>

          {/* Uploaded Images */}
          <div
            className={`p-6 rounded-2xl shadow ${isDark ? "bg-gray-700" : "bg-gray-100"} md:col-span-2`}
          >
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FiFileText /> Uploaded Images
            </h2>

            {service.mediaFiles?.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <div className="flex flex-wrap align-center justify-center gap-4">
                  {service.mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-lg w-[20rem] overflow-hidden bg-gray-50 dark:bg-gray-800"
                    >
                      <img
                        src={file.data}
                        alt={file.fileName}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2 text-xs text-gray-500 truncate">
                        {file.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                No attachments or images for this service.
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className={`p-6 rounded-2xl shadow ${isDark ? "bg-gray-700" : "bg-gray-100"} md:col-span-2`}>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FiUser /> Client Information
            </h2>
            {service.client ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <FiUser className="text-green-500" /> <span>{service.client.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCar className="text-blue-500" /> <span>{service.client.regNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-purple-500" /> <span>{service.client.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="text-blue-500" /> <span>{service.client.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 text-sm text-gray-400">
                  <FiTag />{" "}
                  <span>
                    Vehicle:{" "}
                    {service.client.vehicleMake
                      ? `${service.client.vehicleMake} ${service.client.vehicleModel} (${service.client.vehicleYear || "N/A"})`
                      : "N/A"}
                  </span>
                </div>
                {service.client.address && (
                  <div className="flex items-center gap-2 col-span-2 text-sm text-gray-400">
                    <FiMapPin /> <span>{service.client.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No client linked.</p>
            )}
          </div>
        </div>

        {/* Billing CTA */}
        <div className="border-t p-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-lg">Ready to bill this service?</h3>
            <p className="text-gray-500 text-sm">
              Create or view invoice for this service.
            </p>
          </div>
          <Link
            to="/billing/new"
            state={{
              serviceId: service.id,
              clientId: service.client?.id,
              serviceData: serviceDataForInvoice
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2"
          >
            <FiClipboard /> Create Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}