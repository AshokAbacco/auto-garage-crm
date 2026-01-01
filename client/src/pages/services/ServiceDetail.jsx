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
  FiPackage,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/api/services/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load service");
        }

        // Debug log to see what we're getting
        console.log("Service data:", data);

        setService(data);
      } catch (err) {
        console.error("Error loading service:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading service details...
      </div>
    );

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
      <div className="p-6 text-center text-gray-500">No service found.</div>
    );

  // Parse cost items if they exist, otherwise create a single item from legacy fields
  let costItems = [];

  // Try to get costItems from various possible locations
  if (service.costItems) {
    try {
      // Handle if it's already an array
      if (Array.isArray(service.costItems)) {
        costItems = service.costItems;
      }
      // Handle if it's a string (JSON)
      else if (typeof service.costItems === "string") {
        costItems = JSON.parse(service.costItems);
      }
    } catch (e) {
      console.error("Error parsing costItems:", e);
      costItems = [];
    }
  }

  // If no costItems, create from legacy fields
  if (
    costItems.length === 0 &&
    (service.partsCost !== undefined || service.laborCost !== undefined)
  ) {
    costItems = [
      {
        partName: "Service Parts",
        partCost: service.partsCost || 0,
        partGst: service.partsGst || 0,
        laborCost: service.laborCost || 0,
        laborGst: service.laborGst || 0,
      },
    ];
  }

  // Calculate totals from cost items
  const num = (v) => (Number.isFinite(+v) ? +v : 0);
  const totalAmount = costItems.reduce((sum, i) => {
    const part = num(i.partCost) + (num(i.partCost) * num(i.partGst)) / 100;
    const labor = num(i.laborCost) + (num(i.laborCost) * num(i.laborGst)) / 100;
    return sum + part + labor;
  }, 0);

  const statusColor =
    service.status === "Pending"
      ? "bg-red-600"
      : service.status === "Paid"
      ? "bg-green-600"
      : "bg-gray-400";

  // Prepare service data for invoice creation
  const serviceDataForInvoice = {
    id: service.id,
    vehicle: `${service.client?.vehicleMake || ""} ${
      service.client?.vehicleModel || ""
    } (${service.client?.regNumber || ""})`,
    mechanic: service.mechanic || "",
    description: service.notes || "",
    partsCost: costItems.reduce((sum, item) => sum + num(item.partCost), 0),
    partsGst:
      costItems.length > 0
        ? (costItems.reduce(
            (sum, item) => sum + (num(item.partCost) * num(item.partGst)) / 100,
            0
          ) /
            costItems.reduce((sum, item) => sum + num(item.partCost), 0)) *
          100
        : 0,
    laborCost: costItems.reduce((sum, item) => sum + num(item.laborCost), 0),
    laborGst:
      costItems.length > 0
        ? (costItems.reduce(
            (sum, item) =>
              sum + (num(item.laborCost) * num(item.laborGst)) / 100,
            0
          ) /
            costItems.reduce((sum, item) => sum + num(item.laborCost), 0)) *
          100
        : 0,
    taxes: 0,
    discounts: 0,
    total: parseFloat(totalAmount.toFixed(2)),
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
      className={`min-h-screen p-1 lg:ml-16 ${
        isDark ? " text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`rounded-3xl shadow-xl overflow-hidden ${
          isDark ? "bg-gray-800" : "bg-white"
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
              {service.subService?.name ||
                service.category?.name ||
                "Unnamed Service"}
            </h1>
            <p
              className={`mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
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
          <div
            className={`p-6 rounded-2xl shadow ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FiTool /> Service Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Service Category</p>
                <p className="font-semibold">
                  {service.category?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Service Sub-Category</p>
                <p className="font-semibold">
                  {service.subService?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Service Date</p>
                <p className="font-semibold">
                  {new Date(service.date).toLocaleDateString()}
                </p>
              </div>
              {service.notes && (
                <div>
                  <p className="text-sm text-gray-400">Notes</p>
                  <p
                    className={`whitespace-pre-wrap ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {service.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown - Modern Design */}
          <div
            className={`p-6 rounded-2xl shadow ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FaRupeeSign /> Cost Breakdown
            </h2>

            {costItems.length > 0 ? (
              <div className="space-y-3">
                {costItems.map((item, index) => {
                  const partTotal =
                    num(item.partCost) +
                    (num(item.partCost) * num(item.partGst)) / 100;
                  const laborTotal =
                    num(item.laborCost) +
                    (num(item.laborCost) * num(item.laborGst)) / 100;
                  const itemTotal = partTotal + laborTotal;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? "bg-gray-600" : "bg-gray-100"
                            }`}
                          >
                            <FiPackage
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            />
                          </div>
                          <span className="font-medium text-sm">
                            {item.partName || `Item #${index + 1}`}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span>Parts Cost</span>
                            <span>₹{num(item.partCost).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Parts GST</span>
                            <span>{num(item.partGst)}%</span>
                          </div>
                          <div className="flex justify-between font-medium text-green-500">
                            <span>Parts Total</span>
                            <span>₹{partTotal.toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span>Labor Cost</span>
                            <span>₹{num(item.laborCost).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor GST</span>
                            <span>{num(item.laborGst)}%</span>
                          </div>
                          <div className="flex justify-between font-medium text-blue-500">
                            <span>Labor Total</span>
                            <span>₹{laborTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-2 pt-2 border-t ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        } flex justify-between`}
                      >
                        <span className="font-medium">Item Total</span>
                        <span className="font-bold">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div
                  className={`mt-3 pt-3 border-t ${
                    isDark ? "border-gray-600" : "border-gray-300"
                  } flex justify-between text-lg font-bold text-green-500`}
                >
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No cost breakdown available
              </div>
            )}
          </div>

          {/* Uploaded Images */}
          <div
            className={`p-6 rounded-2xl shadow ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            } md:col-span-2`}
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
          <div
            className={`p-6 rounded-2xl shadow ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            } md:col-span-2`}
          >
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4">
              <FiUser /> Client Information
            </h2>
            {service.client ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <FiUser className="text-green-500" />{" "}
                  <span>{service.client.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCar className="text-blue-500" />{" "}
                  <span>{service.client.regNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-purple-500" />{" "}
                  <span>{service.client.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="text-blue-500" />{" "}
                  <span>{service.client.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 text-sm text-gray-800">
                  <FiTag />{" "}
                  <span>
                    Vehicle:{" "}
                    {service.client.vehicleMake
                      ? `${service.client.vehicleMake} ${
                          service.client.vehicleModel
                        } (${service.client.vehicleYear || "N/A"})`
                      : "N/A"}
                  </span>
                </div>
                {service.client.address && (
                  <div className="flex items-center gap-2 col-span-2 text-sm text-gray-800">
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
              serviceData: serviceDataForInvoice,
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
