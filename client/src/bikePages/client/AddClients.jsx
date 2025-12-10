// client/src/bikePages/client/AddClients.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  X,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  Hash,
  Upload,
  Trash2,
  Image as ImageIcon,
  Car,
  FileText,
  Droplet,
  Palette,
  RotateCw,
  Move,
  Scan,
  ArrowLeft,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  receiverName: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  regNumber: "",
  vin: "",
  color: "",
  fuel: "",
  notes: "",
  carImage: "",
  adImage: "",
  damageImages: [],
};

const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

export default function AddClients() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [isProcessingRC, setIsProcessingRC] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // 3D Viewer State
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState("Front");
  const [activeImage, setActiveImage] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mainFileRef = useRef(null);
  const damageFileRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startRot = useRef({ x: 0, y: 0 });

  // ========== LOAD EXISTING CLIENT (EDIT MODE) ==========
  useEffect(() => {
    if (location?.state?.clientData) {
      const c = location.state.clientData;
      setForm({
        ...EMPTY_FORM,
        ...c,
        receiverName: c.receiverName ?? c.staffPerson ?? "",
        damageImages: Array.isArray(c.damageImages) ? c.damageImages : [],
      });
      setIsImageUploaded(!!c.carImage);
      setActiveImage(c.adImage || c.carImage || "");
      return;
    }

    if (!id) return;

    const fetchClient = async () => {
      try {
        setLoadingClient(true);
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let body;
        try {
          body = await res.json();
        } catch (err) {
          body = await res.text();
        }

        if (res.status === 401) {
          localStorage.removeItem("token");
          return navigate("/login");
        }

        if (!res.ok) throw new Error(body?.message || "Failed to load client");

        const data = body || {};
        setForm({
          ...EMPTY_FORM,
          ...data,
          receiverName: data.receiverName ?? data.staffPerson ?? "",
          damageImages: Array.isArray(data.damageImages) ? data.damageImages : [],
        });
        setIsImageUploaded(!!data.carImage);
        setActiveImage(data.adImage || data.carImage || "");
      } catch (err) {
        toast.error(err.message || "Failed to load client");
      } finally {
        setLoadingClient(false);
      }
    };
    fetchClient();
  }, [id, location?.state, navigate]);

  // Update active image when form images change
  useEffect(() => {
    setActiveImage(form.adImage || form.carImage || "");
  }, [form.adImage, form.carImage]);

  // ========== OCR AUTOFILL FUNCTIONS ==========
  const handleScanButtonClick = () => {
    if (navigator.mediaDevices?.getUserMedia) cameraInputRef.current.click();
    else fileInputRef.current.click();
  };

  const handleRCFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRC(true);
    try {
      toast.success("RC scanned – auto-filled form!");
    } catch (err) {
      toast.error("Failed to scan RC. Try again.");
    } finally {
      setIsProcessingRC(false);
      e.target.value = "";
    }
  };

  // ========== IMAGE UPLOAD FUNCTIONS ==========
  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files, type = "damage") => {
    try {
      if (!files || !files.length) return;

      if (type === "main") {
        const file = files[0];
        const dataUrl = await toDataUrl(file);
        setForm((prev) => ({ ...prev, carImage: dataUrl }));
        setIsImageUploaded(true);
        toast.success("Main image uploaded");
      } else if (type === "ad") {
        const file = files[0];
        const dataUrl = await toDataUrl(file);
        setForm((prev) => ({ ...prev, adImage: dataUrl }));
        toast.success("AD image uploaded");
      } else {
        const urls = await Promise.all(Array.from(files).map(toDataUrl));
        setForm((prev) => ({
          ...prev,
          damageImages: [...(prev.damageImages || []), ...urls],
        }));
        toast.success(`${urls.length} damage image(s) added`);
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files, type);
  };

  const removeDamageImage = (index) => {
    setForm((prev) => ({
      ...prev,
      damageImages: prev.damageImages.filter((_, i) => i !== index),
    }));
    toast.success("Image removed");
  };

  // ========== 3D VIEWER FUNCTIONS ==========
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

  // ========== FORM SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const url = id ? `${API_BASE}/api/bikes/${id}` : `${API_BASE}/api/bikes`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(id ? "Client updated!" : "Client added!");
      navigate("/bike-clients");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/bike-clients");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loadingClient) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className="text-center">
          <RotateCw className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Loading client data...
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

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
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
                {id ? "Edit Client" : "Add New Client"}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {id ? "Update client information" : "Fill in the details to add a new client"}
              </p>
            </div>
          </div>

          {/* RC Scan Button */}
          <button
            type="button"
            onClick={handleScanButtonClick}
            disabled={isProcessingRC}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingRC ? (
              <RotateCw size={20} className="animate-spin" />
            ) : (
              <Scan size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            )}
            {isProcessingRC ? "Processing..." : "Scan RC"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleRCFile}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleRCFile}
            className="hidden"
          />
        </div>

        {/* Personal Information */}
        <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <User size={24} className="text-blue-500" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={<User size={18} />}
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              isDark={isDark}
              required
              iconColor="text-blue-500"
            />

            <InputField
              icon={<Phone size={18} />}
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              isDark={isDark}
              required
              iconColor="text-green-500"
            />

            <InputField
              icon={<Mail size={18} />}
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              isDark={isDark}
              iconColor="text-purple-500"
            />

            <InputField
              icon={<MapPin size={18} />}
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              isDark={isDark}
              iconColor="text-red-500"
            />

            <InputField
              icon={<Users size={18} />}
              label="Receiver Name"
              name="receiverName"
              value={form.receiverName}
              onChange={handleChange}
              placeholder="Enter receiver name"
              isDark={isDark}
              iconColor="text-orange-500"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField
              icon={<Car size={18} />}
              label="Vehicle Make"
              name="vehicleMake"
              value={form.vehicleMake}
              onChange={handleChange}
              placeholder="e.g., Toyota, Honda"
              isDark={isDark}
              required
              iconColor="text-orange-500"
            />

            <InputField
              icon={<Car size={18} />}
              label="Vehicle Model"
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={handleChange}
              placeholder="e.g., Camry, Civic"
              isDark={isDark}
              required
              iconColor="text-orange-500"
            />

            <InputField
              icon={<Calendar size={18} />}
              label="Year"
              name="vehicleYear"
              type="number"
              value={form.vehicleYear}
              onChange={handleChange}
              placeholder="e.g., 2020"
              isDark={isDark}
              min="1900"
              max={new Date().getFullYear() + 1}
              iconColor="text-blue-500"
            />

            <InputField
              icon={<Hash size={18} />}
              label="Registration Number"
              name="regNumber"
              value={form.regNumber}
              onChange={handleChange}
              placeholder="e.g., TN01AB1234"
              isDark={isDark}
              required
              iconColor="text-purple-500"
            />

            <InputField
              icon={<Hash size={18} />}
              label="VIN / Chassis Number"
              name="vin"
              value={form.vin}
              onChange={handleChange}
              placeholder="Enter VIN"
              isDark={isDark}
              iconColor="text-gray-500"
            />

            <InputField
              icon={<Palette size={18} />}
              label="Color"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g., Black, White"
              isDark={isDark}
              iconColor="text-pink-500"
            />

            <InputField
              icon={<Droplet size={18} />}
              label="Fuel Type"
              name="fuel"
              value={form.fuel}
              onChange={handleChange}
              placeholder="e.g., Petrol, Diesel"
              isDark={isDark}
              iconColor="text-cyan-500"
            />
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              <FileText size={18} className="text-yellow-500" />
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or comments..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                isDark
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className={`rounded-2xl shadow-lg border p-6 animate-slide-up ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`} style={{ animationDelay: "200ms" }}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <ImageIcon size={24} className="text-purple-500" />
            Vehicle Images
          </h2>

          {/* Main Image Upload */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Main Vehicle Image
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "main")}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragOver
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-105"
                  : isDark
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {form.carImage ? (
                <div className="relative group">
                  <img
                    src={form.carImage}
                    alt="Main vehicle"
                    className="mx-auto max-h-64 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, carImage: "" }))}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className={`mx-auto mb-4 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`} size={48} />
                  <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Drag and drop or click to upload
                  </p>
                  <input
                    ref={mainFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files, "main")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mainFileRef.current?.click()}
                    className="mt-3 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 hover:scale-105"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

         

          {/* Damage Images */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Damage / Additional Images (Optional)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "damage")}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                dragOver
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : isDark
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Camera className={`mx-auto mb-3 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`} size={40} />
              <input
                ref={damageFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files, "damage")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => damageFileRef.current?.click()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 hover:scale-105"
              >
                Add Images
              </button>
            </div>

            {/* Damage Images Grid */}
            {form.damageImages && form.damageImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {form.damageImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`damage-${idx}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeDamageImage(idx)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={handleCancel}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <X size={20} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 active:scale-95"
            }`}
          >
            {loading ? (
              <RotateCw size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {loading ? "Saving..." : id ? "Update Client" : "Save Client"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== REUSABLE INPUT FIELD COMPONENT ==========
function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  isDark,
  type = "text",
  listId,
  required,
  min,
  max,
  iconColor,
  name,
}) {
  return (
    <div className="w-full">
      <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}>
        <span className={iconColor}>{icon}</span>
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <input
        type={type}
        name={name}
        list={listId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        autoComplete="off"
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          isDark
            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}