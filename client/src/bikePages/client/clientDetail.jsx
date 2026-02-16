// client/src/bikePages/client/clientDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Edit,
  Phone,
  Mail,
  MapPin,
  Hash,
  Calendar,
  ArrowLeft,
  X,
  Trash2,
  FileText,
  Eye,
  User,
  Users,
  Bike,
  Palette,
  Droplet,
  RotateCw,
  Move,
  AlertCircle,
  Save,
  CreditCard,
  IndianRupee,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa"; // ✅ Added Import
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";
import {
  FiCalendar,
  FiTool,
  FiPlus,
  FiFileText,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import api from "../../utils/axiosInstance";

const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [isEditMode, setIsEditMode] = useState(location?.state?.edit || false);

  const [formData, setFormData] = useState({});

  // 3D Viewer State
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState("Front");
  const [activeImage, setActiveImage] = useState("");
  const [clientServices, setClientServices] = useState([]);

  const startPos = useRef({ x: 0, y: 0 });
  const startRot = useRef({ x: 0, y: 0 });

  const [clientInvoices, setClientInvoices] = useState([]);

  const lastService =
    clientServices.length > 0 && clientServices[0]?.date
      ? new Date(clientServices[0].date).toLocaleDateString()
      : "N/A";

  const totalServices = clientServices.length;

  const totalBilled = clientInvoices.reduce(
    (sum, inv) => sum + Number(inv.grandTotal || inv.totalAmount || 0),
    0,
  );

  // ✅ WHATSAPP HANDLER
  const handleManualWhatsApp = async () => {
    if (
      !window.confirm(
        `Send 'Vehicle Received' message to ${client?.phone || "this client"}?`,
      )
    )
      return;

    try {
      // Using the api instance (Axios) consistent with the rest of the file
      const res = await api.put(`/api/bikes/${id}`, { sendWhatsApp: true });

      if (res.status === 200) {
        toast.success("WhatsApp Receipt Sent!");
      } else {
        toast.error(res.data?.message || "Failed to send WhatsApp");
      }
    } catch (err) {
      console.error("WhatsApp error:", err);
      toast.error(err.response?.data?.message || "Error connecting to server");
    }
  };

  // Fetch client invoices
  useEffect(() => {
    const fetchClientInvoices = async () => {
      try {
        const res = await api.get("/api/bike-invoices");
        const invoicesArray = Array.isArray(res.data) ? res.data : [];
        const filtered = invoicesArray.filter(
          (inv) => inv.bikeId === Number(id),
        );
        setClientInvoices(filtered);
      } catch (err) {
        console.error("Fetch invoices error:", err);
      }
    };

    if (id) {
      fetchClientInvoices();
    }
  }, [id]);

  // FORM CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch client by id
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/bikes/${id}`);
        const data = res.data || {};

        setClient(data);
        setFormData(data);
        setActiveImage(
          data.adImage ||
            data.bikeImage ||
            data.carImage ||
            (Array.isArray(data.damageImages) ? data.damageImages[0] : "") ||
            "",
        );
      } catch (err) {
        console.error("Fetch client error:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load client",
        );
        toast.error(
          err.response?.data?.message || err.message || "Failed to load client",
        );

        // If 403 or 404, redirect back
        if (err.response?.status === 403 || err.response?.status === 404) {
          setTimeout(() => navigate("/bike-clients"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id, navigate]);

  // Fetch client services
  const fetchClientServices = async () => {
    try {
      const res = await api.get("/api/bike-services");
      const servicesArray = Array.isArray(res.data) ? res.data : [];
      const filtered = servicesArray.filter((s) => s.clientId === Number(id));
      setClientServices(filtered);
    } catch (err) {
      console.error("Fetch services error:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClientServices();
    }
  }, [id]);

  // Delete client
  const handleDeleteClient = async () => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await api.delete(`/api/bikes/${id}`);
      toast.success("Client deleted successfully");
      navigate("/bike-clients");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client");
    }
  };

  // Update client
  const handleUpdateClient = async () => {
    try {
      await api.put(`/api/bikes/${id}`, formData);
      toast.success("Client updated successfully");
      setIsEditMode(false);

      // Refresh client data
      const res = await api.get(`/api/bikes/${id}`);
      setClient(res.data);
      setFormData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update client");
    }
  };

  // Mouse down for rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startRot.current = { ...rotation };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setRotation({
      x: startRot.current.x + dy * 0.3,
      y: startRot.current.y + dx * 0.3,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) => Math.max(0.5, Math.min(3, prev + e.deltaY * -0.001)));
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <RotateCw className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div
        className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <Toaster />
        <div
          className={`flex flex-col items-center justify-center py-20 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}
        >
          <AlertCircle size={48} className="mb-4" />
          <p className="text-lg font-semibold">{error || "Client not found"}</p>
          <button
            onClick={() => navigate("/bike-clients")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const fullName = client.ownerName || client.fullName || "Unknown";
  const vehicleMake = client.bikeBrand || client.vehicleMake || "N/A";
  const vehicleModel = client.bikeModel || client.vehicleModel || "N/A";
  const vehicleColor = client.color || "N/A";

  // ✅ Damage images (safe fallback)
  const damageImages = Array.isArray(client?.damageImages)
    ? client.damageImages
    : [];

  const defaultImage =
    client.adImage || client.bikeImage || client.carImage || fallbackImage;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Toaster />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/bike-clients")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              isDark
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-900 hover:bg-gray-50 shadow-sm"
            }`}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData(client);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all duration-300 hover:scale-105"
                >
                  <X size={20} />
                  <span className="font-medium">Cancel</span>
                </button>
                <button
                  onClick={handleUpdateClient}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Save size={20} />
                  <span className="font-medium">Save Changes</span>
                </button>
              </>
            ) : (
              <>
                {/* ✅ WhatsApp Button Added Here */}
                <button
                  onClick={handleManualWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  title="Send WhatsApp Receipt"
                >
                  <FaWhatsapp size={20} />
                  <span className="font-medium hidden sm:inline">
                    Send Receipt
                  </span>
                </button>

                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Edit size={20} />
                  <span className="font-medium">Edit</span>
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Trash2 size={20} />
                  <span className="font-medium">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div
          className={`rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-xl">
                    <Bike size={48} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{fullName}</h1>
                    <p className="text-white/90 text-lg font-medium">
                      {vehicleMake} {vehicleModel}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-col gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-white/80" size={20} />
                    <div>
                      <p className="text-xs text-white/70 uppercase font-medium">
                        Last Service
                      </p>
                      <p className="text-white font-semibold">{lastService}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiTool className="text-white/80" size={20} />
                    <div>
                      <p className="text-xs text-white/70 uppercase font-medium">
                        Total Services
                      </p>
                      <p className="text-white font-semibold">
                        {totalServices}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= VEHICLE IMAGE VIEWER ================= */}
          <div className="flex h-[420px] md:h-[480px] overflow-hidden rounded-b-2xl">
            {/* ================= MAIN IMAGE ================= */}
            <div className="relative flex-1 min-w-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-move select-none">
              {/* ❌ Cancel selected damage image */}
              {activeImage && client?.damageImages?.includes(activeImage) && (
                <button
                  onClick={() => {
                    setActiveImage(defaultImage);
                    setScale(1);
                    setRotation({ x: -20, y: 0 });
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
                  title="Cancel damage image"
                >
                  <X size={18} />
                </button>
              )}

              {/* Main Image */}
              <img
                src={activeImage || defaultImage}
                alt={`${vehicleMake} ${vehicleModel}`}
                className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-200"
                style={{
                  transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
                }}
                draggable={false}
              />
            </div>

            {/* ================= DAMAGE IMAGES (RIGHT SIDE) ================= */}
            {damageImages.length > 0 && (
              <div
                className={`w-28 min-w-[112px] p-2 space-y-2 overflow-y-auto border-l ${
                  isDark
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                {damageImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(img);
                      setScale(1);
                      setRotation({ x: -20, y: 0 });
                    }}
                    className={`w-full h-20 rounded-lg overflow-hidden border transition ${
                      activeImage === img
                        ? "border-blue-500 ring-2 ring-blue-400"
                        : isDark
                          ? "border-gray-600 hover:border-blue-400"
                          : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Damage ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Services"
            value={totalServices}
            icon={<FiTool size={24} />}
            isDark={isDark}
          />
          <StatCard
            title="Last Service"
            value={lastService}
            icon={<FiCalendar size={24} />}
            isDark={isDark}
          />
          <StatCard
            title="Total Billed"
            value={`₹${totalBilled.toFixed(2)}`}
            icon={<IndianRupee size={24} />}
            isDark={isDark}
          />
        </div>

        {/* Tabs & Content */}
        <div
          className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          {/* Tab Headers */}
          <div
            className={`flex border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            } overflow-x-auto scrollbar-hide`}
          >
            {["overview", "services", "invoices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Contact Information Section */}
                <Section title="📞 Contact Information" isDark={isDark}>
                  {isEditMode ? (
                    <>
                      <InputField
                        icon={<User size={18} />}
                        label="Owner Name"
                        name="ownerName"
                        value={formData.ownerName || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-blue-500"
                      />
                      <InputField
                        icon={<Phone size={18} />}
                        label="Phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        type="tel"
                        iconColor="text-green-500"
                      />
                      <InputField
                        icon={<Mail size={18} />}
                        label="Email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        type="email"
                        iconColor="text-purple-500"
                      />
                      <div className="col-span-full">
                        <label
                          className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <MapPin size={18} className="text-red-500" />
                          <span>Address</span>
                        </label>
                        <textarea
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            isDark
                              ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                              : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <ContactCard
                        icon={<User size={18} />}
                        label="Owner Name"
                        value={fullName}
                        isDark={isDark}
                      />
                      <ContactCard
                        icon={<Phone size={18} />}
                        label="Phone"
                        value={client.phone}
                        isDark={isDark}
                      />
                      <ContactCard
                        icon={<Mail size={18} />}
                        label="Email"
                        value={client.email}
                        isDark={isDark}
                      />
                      <div className="col-span-full">
                        <div
                          className={`p-4 rounded-xl flex items-start gap-3 transition-all duration-300 hover:shadow-md ${
                            isDark ? "bg-gray-700/50" : "bg-gray-50"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                            <MapPin size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-medium uppercase mb-1 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Address
                            </p>
                            <p
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {client.address || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Section>

                {/* Vehicle Information Section */}
                <Section title="🏍️ Vehicle Information" isDark={isDark}>
                  {isEditMode ? (
                    <>
                      <InputField
                        icon={<Bike size={18} />}
                        label="Bike Brand"
                        name="bikeBrand"
                        value={formData.bikeBrand || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-blue-500"
                      />
                      <InputField
                        icon={<Bike size={18} />}
                        label="Bike Model"
                        name="bikeModel"
                        value={formData.bikeModel || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-blue-500"
                      />
                      <InputField
                        icon={<Hash size={18} />}
                        label="Registration Number"
                        name="regNumber"
                        value={formData.regNumber || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-yellow-500"
                      />
                      <InputField
                        icon={<Palette size={18} />}
                        label="Color"
                        name="color"
                        value={formData.color || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-purple-500"
                      />
                      <InputField
                        icon={<Calendar size={18} />}
                        label="Model Year"
                        name="bikeYear"
                        value={formData.bikeYear || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        type="number"
                        iconColor="text-green-500"
                      />
                      <InputField
                        icon={<Droplet size={18} />}
                        label="Fuel Type"
                        name="fuel"
                        value={formData.fuel || ""}
                        onChange={handleChange}
                        isDark={isDark}
                        iconColor="text-orange-500"
                      />
                    </>
                  ) : (
                    <>
                      <InfoCard
                        icon={<Bike size={18} />}
                        label="Brand"
                        value={vehicleMake}
                        isDark={isDark}
                      />
                      <InfoCard
                        icon={<Bike size={18} />}
                        label="Model"
                        value={vehicleModel}
                        isDark={isDark}
                      />
                      <InfoCard
                        icon={<Hash size={18} />}
                        label="Registration"
                        value={client.regNumber}
                        isDark={isDark}
                      />
                      <InfoCard
                        icon={<Palette size={18} />}
                        label="Color"
                        value={vehicleColor}
                        isDark={isDark}
                      />
                      <InfoCard
                        icon={<Calendar size={18} />}
                        label="Year"
                        value={client.bikeYear}
                        isDark={isDark}
                      />
                      <InfoCard
                        icon={<Droplet size={18} />}
                        label="Fuel Type"
                        value={client.fuel}
                        isDark={isDark}
                      />
                    </>
                  )}
                </Section>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Service History
                  </h3>
                  <Link to={`/bike-services/new?bikeId=${id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
                      <FiPlus />
                      Add Service
                    </button>
                  </Link>
                </div>

                {clientServices.length > 0 ? (
                  clientServices.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isDark
                          ? "border-gray-700 bg-gray-700/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onClick={() => navigate(`/bike-services/${service.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-lg ${
                              isDark ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {service.serviceName ||
                              service.description ||
                              "Service"}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {new Date(service.date).toLocaleDateString()} • ₹
                            {(service.cost || 0).toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            service.status === "Completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {service.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiTool
                      className={`w-12 h-12 mx-auto mb-3 ${
                        isDark ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      No services found.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Invoices
                  </h3>
                  <Link to={`/bike-billing/new?bikeId=${id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
                      <FiPlus />
                      Create Invoice
                    </button>
                  </Link>
                </div>

                {clientInvoices.length > 0 ? (
                  clientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isDark
                          ? "border-gray-700 bg-gray-700/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onClick={() => navigate(`/bike-billing/${inv.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-lg ${
                              isDark ? "text-white" : "text-gray-800"
                            }`}
                          >
                            Invoice #{inv.invoiceNumber || inv.id}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {new Date(inv.createdAt).toLocaleDateString()} • ₹
                            {(inv.grandTotal || inv.totalAmount || 0).toFixed(
                              2,
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            inv.status === "Paid"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <IndianRupee
                      className={`w-12 h-12 mx-auto mb-3 ${
                        isDark ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      No invoices found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {(client.notes || isEditMode) && (
          <div
            className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <FileText size={24} className="text-yellow-500" />
              Notes
            </h2>
            {isEditMode ? (
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Add notes..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            ) : (
              <p
                className={`${
                  isDark ? "text-gray-300" : "text-gray-700"
                } whitespace-pre-wrap`}
              >
                {client.notes || "No notes available"}
              </p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function ContactCard({ icon, label, value, isDark }) {
  return (
    <div
      className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-md ${
        isDark ? "bg-gray-700/50" : "bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-medium uppercase mb-1 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <p
          className={`font-semibold truncate ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, isDark, color = "blue" }) {
  return (
    <div
      className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-md ${
        isDark ? "bg-gray-700/50" : "bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-medium uppercase mb-1 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <p
          className={`font-semibold truncate ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  name,
  value,
  onChange,
  isDark,
  type = "text",
  iconColor,
}) {
  return (
    <div className="w-full">
      <label
        className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <span className={iconColor}>{icon}</span>
        <span>{label}</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}

function StatCard({ title, value, icon, isDark }) {
  return (
    <div
      className={`p-5 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-md ${
        isDark ? "bg-gray-700/50" : "bg-gray-50"
      }`}
    >
      <div>
        <p
          className={`text-sm font-medium mb-1 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {value}
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
    </div>
  );
}

/* Section wrapper for organized content */
function Section({ title, children, isDark }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <h4
          className={`font-semibold text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
        >
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
