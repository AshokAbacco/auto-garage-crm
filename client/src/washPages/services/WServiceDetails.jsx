import {
  ArrowLeft,
  Printer,
  Edit,
  FileText,
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Hash,
} from "lucide-react";
// 🟢 STEP 1 — Add Icons Import
import { FaWhatsapp } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function WServiceDetails() {
  const { isDark } = useTheme(); // Get theme state
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regNumber, setRegNumber] = useState("");

  // 🟢 STEP 2 — Add WhatsApp States
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [waError, setWaError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/washing-services/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) {
          console.error("API ERROR:", result);
          setError(result.message || "Failed to load service");
          setLoading(false);
          return;
        }

        setService(result);
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // 🟢 STEP 3 — Add Refresh Function
  const reloadService = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/washing-services/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setService(data);
  };

  // 🟢 STEP 4 — Add WhatsApp Approval Sender
  const sendWashWhatsAppApproval = async () => {
    try {
      setSendingWhatsApp(true);
      setWaError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/washing-services/${id}/whatsapp-approval`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send WhatsApp");

      await reloadService(); // refresh status
    } catch (err) {
      setWaError(err.message);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // 🟢 STEP 5 — Add READY Alert Function
  const sendWashReadyAlert = async () => {
    if (!window.confirm("Notify client that vehicle is ready?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE}/api/washing-services/${id}/whatsapp-ready`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (res.ok) {
      await reloadService();
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <p className={`p-6 text-center ${isDark ? "text-gray-300" : ""}`}>
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 text-center ${isDark ? "text-red-400" : "text-red-500"}`}
      >
        {error}
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 text-white rounded transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  function Card({ title, children }) {
    return (
      <div
        className={`p-6 rounded-xl transition-all duration-300 ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
        }`}
      >
        {title && (
          <h2
            className={`mb-4 text-xl font-semibold ${isDark ? "text-white" : ""}`}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    );
  }

  function Detail({ label, value, highlight }) {
    return (
      <div className="mb-2">
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </p>
        <p
          className={`font-medium ${highlight ? (isDark ? "text-green-400" : "text-green-600") + " text-lg" : isDark ? "text-gray-200" : ""}`}
        >
          {value || "—"}
        </p>
      </div>
    );
  }

  if (!service) {
    return (
      <p
        className={`p-6 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        No service data available
      </p>
    );
  }

  /* ---------------- MAIN VIEW ---------------- */
  return (
    <div
      className={`max-w-6xl p-6 mx-auto space-y-6 transition-all duration-300 ${isDark ? "bg-gray-900" : ""}`}
    >
      {/* Back */}
      <div
        className={`flex items-center cursor-pointer transition-colors ${
          isDark
            ? "text-blue-400 hover:text-blue-300"
            : "text-green-600 hover:text-green-700"
        }`}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className={`flex items-center gap-2 text-3xl font-semibold ${isDark ? "text-white" : ""}`}
          >
            <Wrench className="w-7 h-7" />
            {service.subService?.name || "Washing Service"}
          </h1>
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            Service ID #{service.id} •{" "}
            {new Date(service.date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>

          {/* 🟢 STEP 7 — Add READY Button */}
          <button
            onClick={sendWashReadyAlert}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 mr-2" />
            Mark Ready & Notify
          </button>

          <button
            onClick={() => navigate(`/add-service/${service.id}`)}
            className={`flex items-center px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Status */}
      <div
        className={`py-2 text-center text-white rounded-lg font-medium transition-all duration-300 ${
          service.status === "COMPLETED"
            ? isDark
              ? "bg-green-700"
              : "bg-green-600"
            : isDark
              ? "bg-red-700"
              : "bg-red-500"
        }`}
      >
        {service.status}
      </div>

      {/* Service + Cost */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Service Details">
          <Detail label="Service Category" value={service.category?.name} />
          <Detail
            label="Service Sub-Category"
            value={service.subService?.name}
          />
          <Detail label="Client Name" value={service.client?.fullName} />
          <Detail
            label="Service Date"
            value={new Date(service.date).toLocaleDateString()}
          />
          <Detail label="Notes" value={service.notes || "—"} />
        </Card>

        <Card title="₹ Cost Breakdown">
          <Detail label="Service Cost" value={`₹${service.partsCost}`} />
          <Detail label="Service GST %" value={`${service.partsGst}%`} />

          <hr className={`my-2 ${isDark ? "border-gray-700" : ""}`} />
          <Detail
            label="Estimated Total"
            value={`₹${service.estimatedTotal}`}
            highlight
          />
        </Card>
      </div>

      {/* 🟢 STEP 6 — Add Approval Status UI */}
      <Card title="WhatsApp Approval">
        {waError && <div className="text-xs text-red-500 mb-2">{waError}</div>}

        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              service.approvalStatus === "APPROVED"
                ? "bg-green-200 text-green-800"
                : service.approvalStatus === "PENDING"
                  ? "bg-yellow-200 text-yellow-800"
                  : service.approvalStatus === "REJECTED"
                    ? "bg-red-200 text-red-800"
                    : "bg-gray-200 text-gray-700"
            }`}
          >
            {service.approvalStatus || "Not Sent"}
          </span>
        </div>

        <button
          disabled={
            sendingWhatsApp ||
            ["PENDING", "APPROVED"].includes(service.approvalStatus)
          }
          onClick={sendWashWhatsAppApproval}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300
                    ${
                      service.approvalStatus === "APPROVED"
                        ? "bg-green-200 text-green-800 cursor-not-allowed"
                        : service.approvalStatus === "PENDING"
                          ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
        >
          <FaWhatsapp />
          {service.approvalStatus === "APPROVED"
            ? "Approved via WhatsApp"
            : service.approvalStatus === "PENDING"
              ? "Waiting for Customer"
              : sendingWhatsApp
                ? "Sending..."
                : "Send WhatsApp Approval"}
        </button>
      </Card>

      {/* Client Info */}
      <Card title="Client Information">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left */}
          <div className="space-y-2">
            <p
              className={`flex items-center gap-2 font-semibold ${isDark ? "text-white" : ""}`}
            >
              <User
                className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              />
              {service.client?.fullName || "—"}
            </p>

            <p
              className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              <Phone className="w-4 h-4" />
              {service.client?.phone || "—"}
            </p>

            <p
              className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              <MapPin className="w-4 h-4" />
              {service.client?.address || "—"}
            </p>
          </div>

          {/* Right */}
          {service && (
            <div className="mt-4 space-y-2">
              <p
                className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                <Mail className="w-4 h-4" />
                {service.client?.email || "—"}
              </p>
              <p
                className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                <Car className="w-4 h-4" />
                {service.client?.regNumber || "—"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Invoice */}
      <Card>
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h3
              className={`text-lg font-semibold ${isDark ? "text-white" : ""}`}
            >
              Ready to bill this service?
            </h3>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              Create or view invoice for this service.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/billing/create-invoice/${service.id}`, {
                state: {
                  serviceId: service.id,
                  client: service.client,
                  category: service.category,
                  subService: service.subService,
                  notes: service.notes,
                  partsCost: service.partsCost,
                  partsGst: service.partsGst,
                  estimatedTotal: service.estimatedTotal,
                  date: service.date,
                },
              })
            }
            className={`px-6 py-3 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
              isDark
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Create Invoice
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */
function Section({ title, children }) {
  return (
    <div
      className={`p-6 rounded-xl transition-all duration-300 ${
        isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
      }`}
    >
      <h2
        className={`mb-4 text-xl font-semibold ${isDark ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="mb-3">
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`font-medium ${isDark ? "text-gray-200" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
