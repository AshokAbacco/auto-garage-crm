// client/src/bikePages/client/clientDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Car,
  Palette,
  Droplet,
  RotateCw,
  Move,
  AlertCircle,
  Save,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";

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

  // 3D Viewer State
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState("Front");
  const [activeImage, setActiveImage] = useState("");

  const startPos = useRef({ x: 0, y: 0 });
  const startRot = useRef({ x: 0, y: 0 });

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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setClient(updated);
      setIsEditMode(false);

      toast.success("Updated successfully");
      navigate("/bike-clients");

    } catch (err) {
      toast.error(err.message);
    }
  };

  // 3D Viewer Functions
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
      x: Math.max(-90, Math.min(90, startRot.current.x - dy * 0.4)),
      y: startRot.current.y + dx * 0.4,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startRot.current = { ...rotation };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startPos.current.x;
    const dy = e.touches[0].clientY - startPos.current.y;
    setRotation({
      x: Math.max(-90, Math.min(90, startRot.current.x - dy * 0.4)),
      y: startRot.current.y + dx * 0.4,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const setPreset = (view) => {
    if (view === "Front") setRotation({ x: -20, y: 0 });
    if (view === "Side") setRotation({ x: -10, y: 90 });
    if (view === "Rear") setRotation({ x: -20, y: 180 });
    if (view === "Top") setRotation({ x: -80, y: 0 });
    setCurrentView(view);
  };

  const resetView = () => {
    setRotation({ x: -20, y: 0 });
    setScale(1);
    setCurrentView("Front");
  };

  useEffect(() => {
    const viewer = document.getElementById("viewer-3d");
    if (!viewer) return;

    viewer.addEventListener("mousedown", handleMouseDown);
    viewer.addEventListener("mousemove", handleMouseMove);
    viewer.addEventListener("mouseup", handleMouseUp);
    viewer.addEventListener("mouseleave", handleMouseUp);
    viewer.addEventListener("touchstart", handleTouchStart);
    viewer.addEventListener("touchmove", handleTouchMove);
    viewer.addEventListener("touchend", handleTouchEnd);

    return () => {
      viewer.removeEventListener("mousedown", handleMouseDown);
      viewer.removeEventListener("mousemove", handleMouseMove);
      viewer.removeEventListener("mouseup", handleMouseUp);
      viewer.removeEventListener("mouseleave", handleMouseUp);
      viewer.removeEventListener("touchstart", handleTouchStart);
      viewer.removeEventListener("touchmove", handleTouchMove);
      viewer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, rotation]);

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className="text-center">
          <RotateCw className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !client) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className={`max-w-md w-full rounded-2xl p-8 text-center shadow-2xl ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? "text-red-400" : "text-red-500"
          }`} />
          <h2 className={`text-2xl font-bold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Error Loading Client
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {error || "Client not found"}
          </p>
          <button
            onClick={() => navigate("/bike-clients")}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/bike-clients")}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                {client.fullName}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Client Details & Information
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData(client);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <User size={24} className="text-blue-500" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditMode ? (
              <>
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
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  isDark={isDark}
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
              </>
            ) : (
              <>
                <ContactCard icon={<User size={20} />} label="Full Name" value={client.fullName} isDark={isDark} />
                <ContactCard icon={<Phone size={20} />} label="Phone" value={client.phone} isDark={isDark} />
                <ContactCard icon={<Mail size={20} />} label="Email" value={client.email} isDark={isDark} />
                <ContactCard icon={<MapPin size={20} />} label="Address" value={client.address} isDark={isDark} />
                <ContactCard icon={<Users size={20} />} label="Receiver" value={client.receiverName} isDark={isDark} />
              </>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`} style={{ animationDelay: "100ms" }}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <Car size={24} className="text-orange-500" />
            Vehicle Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isEditMode ? (
              <>
                <InputField
                  icon={<Car size={18} />}
                  label="Make"
                  name="vehicleMake"
                  value={formData.vehicleMake || ""}
                  onChange={handleChange}
                  isDark={isDark}
                  iconColor="text-orange-500"
                />
                <InputField
                  icon={<Car size={18} />}
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
                <InfoCard icon={<Car size={20} />} label="Make" value={client.vehicleMake} isDark={isDark} color="orange" />
                <InfoCard icon={<Car size={20} />} label="Model" value={client.vehicleModel} isDark={isDark} color="orange" />
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
          <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`} style={{ animationDelay: "200ms" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                <Move className={isDark ? "text-purple-400" : "text-purple-600"} size={18} />
                3D Interactive View
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  isDark ? "bg-gray-700 text-purple-400" : "bg-purple-100 text-purple-700"
                }`}>
                  {currentView}
                </span>

                <div className="hidden sm:flex items-center gap-1">
                  {["Front", "Side", "Rear", "Top"].map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setPreset(view)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        currentView === view
                          ? "bg-purple-600 text-white"
                          : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={resetView}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Reset view"
                >
                  <RotateCw size={16} />
                </button>
              </div>
            </div>

            {/* Mobile view buttons */}
            <div className="sm:hidden flex items-center gap-1 mb-3 overflow-x-auto pb-2">
              {["Front", "Side", "Rear", "Top"].map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setPreset(view)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentView === view
                      ? "bg-purple-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
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