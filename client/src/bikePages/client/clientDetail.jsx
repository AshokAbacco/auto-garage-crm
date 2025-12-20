// client/src/bikePages/client/clientDetail.jsx
import React, { useState, useEffect, useRef, } from "react";
import { useParams, useNavigate, useLocation,Link  } from "react-router-dom";
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
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";
import { FiCalendar, FiTool,FiPlus, FiFileText,FiEye,FiTrash2 } from "react-icons/fi";
import { deleteRecord as BikedeleteRecord } from
  "/src/bikePages/OCRScanner/utils/BikestorageUtils.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

  const [isEditMode, setIsEditMode] = useState(
    location?.state?.edit || false
  );

  const [formData, setFormData] = useState({});
  // OCR State
  const [ocrParsed, setOcrParsed] = useState(null);
  const [ocrRaw, setOcrRaw] = useState("");
  const [ocrRecords, setOcrRecords] = useState([]);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [selectedOCR, setSelectedOCR] = useState(null);

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
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);


const lastService = clientServices.length > 0 && clientServices[0]?.date
  ? new Date(clientServices[0].date).toLocaleDateString()
  : "N/A";

const totalServices = clientServices.length;

const totalBilled = clientInvoices.reduce(
  (sum, inv) => sum + Number(inv.grandTotal || inv.totalAmount || 0),
  0
);


  

    useEffect(() => {
      const loadInvoices = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/bike-invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const filtered = data.filter(inv => inv.bike?.id === Number(id));
        setClientInvoices(filtered);
      };

      loadInvoices();
    }, [id]);

    useEffect(() => {
      const loadOCR = async () => {
        const records = await BikeloadHistory(id);
        setOcrRecords(records);
      };
      loadOCR();
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch client data");
        }

        const data = await res.json();
        setClient(data);
        setFormData(data);

        setActiveImage(data.adImage || data.carImage || "");
      } catch (err) {
        setError(err.message || "Unknown error");
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const fetchClientServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bike-services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load services");

      const allServices = await res.json();
      const servicesArray = allServices.services || allServices || [];

      // Filter by this client ID
      const filtered = servicesArray.filter(
        (s) => s.client?.id === Number(id)
      );

      setClientServices(filtered);
    } catch (err) {
      console.error("service fetch failed:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClientServices();
    }
  }, [id]);

  // loadServices
  useEffect(() => {
    const loadServices = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/bike-services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const filtered = (data.services || data).filter(
        (s) => s.client?.id === Number(id)
      );

      setClientServices(filtered);
    };

    if (id) loadServices();
  }, [id]);

  // Delete client
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete client");

      toast.success("Client deleted successfully");
      navigate("/bike-clients");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update client
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update client");

      const updated = await res.json();
      setClient(updated);
      setIsEditMode(false);
      toast.success("Client updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete OCR
  const handleDeleteOCR = async (ocrId) => {
    if (!window.confirm("Delete this OCR record?")) return;
    try {
      await BikedeleteRecord(id, ocrId);
      const updated = await BikeloadHistory(id);
      setOcrRecords(updated);
      toast.success("OCR record deleted");
    } catch (err) {
      toast.error("Failed to delete OCR");
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
      x: startRot.current.x + dy * 0.5,
      y: startRot.current.y + dx * 0.5,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale((prev) => Math.max(0.5, Math.min(prev + delta, 2)));
  };

  useEffect(() => {
    const container = document.getElementById("viewer-3d");
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handleViewSelect = (viewName) => {
    setCurrentView(viewName);
    const rotations = {
      Front: { x: -20, y: 0 },
      Back: { x: -20, y: 180 },
      Left: { x: -20, y: -90 },
      Right: { x: -20, y: 90 },
      Top: { x: -90, y: 0 },
      Bottom: { x: 90, y: 0 },
    };
    setRotation(rotations[viewName] || { x: -20, y: 0 });
  };

  const handleSaveOCR = async () => {
    if (!ocrParsed) {
      toast.error("No OCR data to save");
      return;
    }
    try {
      setIsLoadingOCR(true);

      const ocrPayload = {
        bikeId: Number(id),
        parsedData: ocrParsed,
        rawOcrText: ocrRaw || "",
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bike-ocr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ocrPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save OCR");
      }

      await res.json();
      toast.success("OCR data saved successfully!");

      const updated = await BikeloadHistory(id);
      setOcrRecords(updated);

      setOcrParsed(null);
      setOcrRaw("");
    } catch (error) {
      console.error("Error saving OCR data:", error);
      toast.error(error.message || "Failed to save OCR data");
    } finally {
      setIsLoadingOCR(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            {error || "Client not found"}
          </p>
          <button
            onClick={() => navigate("/bike-clients")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const recentServices = clientServices.slice(0, 5);
  const recentInvoices = clientInvoices.slice(0, 5);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className={`rounded-2xl shadow-lg border p-6 animate-fade-in ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate("/bike-clients")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDark ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex flex-wrap gap-2">
              {!isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Edit size={18} />
                    <span className="font-medium">Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Save size={18} />
                    <span className="font-medium">Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setFormData(client);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                  >
                    <X size={18} />
                    <span className="font-medium">Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-2xl shadow-xl border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
              <User size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl font-bold truncate ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {client.fullName || "Unknown Client"}
              </h1>
              <p className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Client ID: #{client.id}
              </p>
            </div>
          </div>

          {/* Contact & Basic Info Grid */}
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={<User size={18} />}
                label="Full Name"
                name="fullName"
                value={formData.fullName || ""}
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
              <InputField
                icon={<MapPin size={18} />}
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                isDark={isDark}
                iconColor="text-red-500"
              />
              <InputField
                icon={<Users size={18} />}
                label="Receiver Name"
                name="receiverName"
                value={formData.receiverName || ""}
                onChange={handleChange}
                isDark={isDark}
                iconColor="text-orange-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContactCard icon={<User size={20} />} label="Full Name" value={client.fullName} isDark={isDark} />
              <ContactCard icon={<Phone size={20} />} label="Phone" value={client.phone} isDark={isDark} />
              <ContactCard icon={<Mail size={20} />} label="Email" value={client.email} isDark={isDark} />
              <ContactCard icon={<MapPin size={20} />} label="Address" value={client.address} isDark={isDark} />
              <ContactCard icon={<Users size={20} />} label="Receiver" value={client.receiverName} isDark={isDark} />
              <ContactCard icon={<Hash size={20} />} label="Client ID" value={`#${client.id}`} isDark={isDark} />
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className={`rounded-2xl shadow-xl border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`} style={{ animationDelay: "150ms" }}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <Bike size={28} className="text-orange-500" />
            Vehicle Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isEditMode ? (
              <>
                <InputField
                  icon={<Bike size={18} />}
                  label="Make"
                  name="vehicleMake"
                  value={formData.vehicleMake || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-orange-500"
                />
                <InputField
                  icon={<Bike size={18} />}
                  label="Model"
                  name="vehicleModel"
                  value={formData.vehicleModel || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-orange-500"
                />
                <InputField
                  icon={<Calendar size={18} />}
                  label="Year"
                  name="vehicleYear"
                  type="number"
                  value={formData.vehicleYear || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-blue-500"
                />
                <InputField
                  icon={<Hash size={18} />}
                  label="Registration"
                  name="regNumber"
                  value={formData.regNumber || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-purple-500"
                />
                <InputField
                  icon={<CreditCard size={18} />}
                  label="VIN"
                  name="vin"
                  value={formData.vin || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-gray-500"
                />
                <InputField
                  icon={<Palette size={18} />}
                  label="Color"
                  name="color"
                  value={formData.color || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-pink-500"
                />
                <InputField
                  icon={<Droplet size={18} />}
                  label="Fuel Type"
                  name="fuel"
                  value={formData.fuel || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-cyan-500"
                />
              </>
            ) : (
              <>
                <InfoCard icon={<Bike size={20} />} label="Make" value={client.vehicleMake} isDark={isDark} color="orange" />
                <InfoCard icon={<Bike size={20} />} label="Model" value={client.vehicleModel} isDark={isDark} color="orange" />
                <InfoCard icon={<Calendar size={20} />} label="Year" value={client.vehicleYear} isDark={isDark} color="blue" />
                <InfoCard icon={<Hash size={20} />} label="Registration" value={client.regNumber} isDark={isDark} color="purple" />
                <InfoCard icon={<CreditCard size={20} />} label="VIN" value={client.vin} isDark={isDark} color="gray" />
                <InfoCard icon={<Palette size={20} />} label="Color" value={client.color} isDark={isDark} color="pink" />
                <InfoCard icon={<Droplet size={20} />} label="Fuel" value={client.fuel} isDark={isDark} color="cyan" />
              </>
            )}
          </div>
        </div>

        {/* 3D Viewer */}
        {(client.carImage || client.adImage) && (
          <div className={`rounded-2xl shadow-xl border p-6 animate-slide-up ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`} style={{ animationDelay: "200ms" }}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <Move className="text-purple-500" size={28} />
              Vehicle Image View
            </h2>

            {/* View Preset Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["Front", "Back", "Left", "Right", "Top", "Bottom"].map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewSelect(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentView === view
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105"
                      : isDark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* 3D View Window */}
            <div
              id="viewer-3d"
              className={`relative h-64 sm:h-80 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center ${
                isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-gray-100"
              } border ${isDark ? "border-gray-700" : "border-gray-200"} shadow-inner`}
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
              }}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt="3D Vehicle"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  draggable="false"
                />
              ) : (
                <div className="text-center p-4">
                  <div className={`text-sm mb-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    No image available
                  </div>
                  <img
                    src={fallbackImage}
                    alt="placeholder"
                    className="rounded-lg opacity-40 mx-auto max-w-full"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>

            {/* Damage Image Thumbnails */}
            {Array.isArray(client.damageImages) && client.damageImages.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Additional Views:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Main Image */}
                  <button
                    onClick={() => setActiveImage(client.adImage || client.carImage)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                      activeImage === (client.adImage || client.carImage)
                        ? "scale-105 border-purple-500 shadow-lg"
                        : isDark ? "border-gray-600 hover:border-purple-400" : "border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    <img
                      src={client.adImage || client.carImage}
                      alt="main"
                      className="object-cover w-full h-full"
                    />
                  </button>
                  
                  {/* Damage Images */}
                  {client.damageImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                        activeImage === img
                          ? "scale-105 border-purple-500 shadow-lg"
                          : isDark ? "border-gray-600 hover:border-purple-400" : "border-gray-300 hover:border-purple-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`damage-${idx}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Text */}
            <div className={`mt-3 text-xs text-center ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}>
              Drag to rotate • Use preset buttons for quick views
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 hover:shadow-2xl`}>
          {/* Tab Header */}
          <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-2">
                {["overview", "services", "invoices", "ocr"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105"
                      : isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {tab === "ocr" ? "OCR Records" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Action Buttons (contextual) */}
              {activeTab === "services" && (
                <Link
                  to="/bike-services/add"
                  state={{ customerId: client.id }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="font-medium">Add Service</span>
                </Link>
              )}
              {activeTab === "invoices" && (
                <Link
                  to="/bill/new"
                  state={{ customerId: client.id }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-500 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="font-medium">Create Invoice</span>
                </Link>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard title="Last Service" value={lastService} icon={<FiCalendar />} isDark={isDark} />
                  <StatCard title="Total Services" value={totalServices} icon={<FiTool />} isDark={isDark} />
                  <StatCard title="Total Billed" value={`₹${totalBilled.toFixed(2)}`} icon={<IndianRupee />} isDark={isDark} />
                </div>

                {/* Recent Activity Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Services Table */}
                  <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FiTool className="text-blue-500" />
                        Recent Services
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      {recentServices.length > 0 ? (
                        <table className="w-full">
                          <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-100'}>
                            <tr>
                              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Service Type
                              </th>
                              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Date
                              </th>
                              <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Cost
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {recentServices.map((service, index) => (
                              <tr 
                                key={service.id}
                                className={`transition-colors duration-200 ${
                                  isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      service.status === 'Paid' ? 'bg-green-500' : 
                                      service.status === 'In Progress' ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`}></div>
                                    <span className="font-medium">{service.type || "Service"}</span>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {new Date(service.date).toLocaleDateString()}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                  ₹{(service.cost || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12">
                          <FiTool className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No services yet</p>
                        </div>
                      )}
                    </div>
                    {recentServices.length > 0 && (
                      <div className={`px-6 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                        <button
                          onClick={() => setActiveTab('services')}
                          className={`text-sm font-medium transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          View all services →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recent Invoices Table */}
                  <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <CreditCard className="text-green-500" />
                        Recent Invoices
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      {recentInvoices.length > 0 ? (
                        <table className="w-full">
                          <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-100'}>
                            <tr>
                              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Invoice ID
                              </th>
                              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Date
                              </th>
                              <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {recentInvoices.map((invoice, index) => (
                              <tr 
                                key={invoice.id}
                                className={`transition-colors duration-200 ${
                                  isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                    <span className="font-medium">#{invoice.id}</span>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {new Date(invoice.createdAt).toLocaleDateString()}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  ₹{((invoice.grandTotal || invoice.totalAmount) || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No invoices yet</p>
                        </div>
                      )}
                    </div>
                    {recentInvoices.length > 0 && (
                      <div className={`px-6 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                        <button
                          onClick={() => setActiveTab('invoices')}
                          className={`text-sm font-medium transition-colors ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
                        >
                          View all invoices →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-4">
                {clientServices.length ? (
                  clientServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setServiceForm(s);
                      }}
                      className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${isDark ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                            {s.type || "Service"}
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {new Date(s.date).toLocaleDateString()} • ₹{(s.cost || 0).toFixed(2)}
                          </p>
                          {s.notes && (
                            <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {s.notes}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${s.status === "Paid"
                            ? "bg-green-500/20 text-green-400"
                            : s.status === "In Progress"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                            }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiTool className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No service records yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                {clientInvoices.length ? (
                  clientInvoices.map(inv => (

                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${isDark ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                            Invoice #{inv.id}
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {new Date(inv.createdAt).toLocaleDateString()} • ₹{((inv.grandTotal || inv.totalAmount) || 0).toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${inv.status === "Paid"
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
                    <IndianRupee className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No invoices found.</p>
                  </div>
                )}
              </div>
            )}

            {/* OCR Tab */}
            {activeTab === "ocr" && (
              <div className="space-y-4">
                {/* If there's a parsed buffer (from local camera/upload), show results + save */}
                {ocrParsed && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all duration-300 hover:shadow-md`}>
                    <OCRResults
                      isDark={isDark}
                      parsedData={ocrParsed}
                      rawOcrText={ocrRaw}
                      onSave={handleSaveOCR}
                    />
                  </div>
                )}

                {/* OCR history list */}
                {isLoadingOCR ? (
                  <p className="text-center text-gray-500">Loading OCR records...</p>
                ) : ocrRecords.length ? (
                  ocrRecords.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl flex justify-between items-center border transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${isDark ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div>
                        <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                          {r.parsedData?.ownerName || "Unknown Owner"}
                        </h4>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Reg: {r.parsedData?.regNo || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOCR(r)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDeleteOCR(r.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-300"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <FiFileText className="mx-auto mb-2" size={32} />
                    <p>No OCR records found for this client.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Notes Section */}
        {(client.notes || isEditMode) && (
          <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`} style={{ animationDelay: "300ms" }}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
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
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            ) : (
              <p className={`${isDark ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap`}>
                {client.notes || "No notes available"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function ContactCard({ icon, label, value, isDark }) {
  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-105 ${
      isDark ? "bg-gray-700/50" : "bg-gray-50"
    }`}>
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium uppercase mb-1 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {label}
        </p>
        <p className={`font-semibold truncate ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, isDark, color = "blue" }) {
  const colorMap = {
    orange: "from-orange-500 to-red-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    gray: "from-gray-500 to-gray-600",
    pink: "from-pink-500 to-rose-500",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-105 ${
      isDark ? "bg-gray-700/50" : "bg-gray-50"
    }`}>
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium uppercase mb-1 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {label}
        </p>
        <p className={`font-semibold truncate ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
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
      <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}>
        <span className={iconColor}>{icon}</span>
        <span>{label}</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
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
    <div className={`p-5 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-md ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
      <div>
        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
    </div>
  );
}