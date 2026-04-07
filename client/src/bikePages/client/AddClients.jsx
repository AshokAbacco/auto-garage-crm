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
  Bike,
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
import { processImage as BikeprocessImage } from "/src/bikePages/OCRScanner/utils/BikeOCRProcessor.js";
import api from "../../utils/axiosInstance";

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
  const [bikeImageLoading, setBikeImageLoading] = useState(false);

  const [bikeMakes, setBikeMakes] = useState([]);
  const [bikeModels, setBikeModels] = useState([]);
  const [selectedBikeMake, setSelectedBikeMake] = useState(null);
  const [showBrandList, setShowBrandList] = useState(false);
  const [brandSelected, setBrandSelected] = useState(false);

  // ========== LOAD EXISTING CLIENT (EDIT MODE) ==========
  useEffect(() => {
    if (location?.state?.clientData) {
      const c = location.state.clientData;
      setForm({
        ...EMPTY_FORM,
        fullName: c.ownerName || c.fullName || "",
        phone: c.phone || "",
        email: c.email || "",
        address: c.address || "",
        receiverName: c.receiverName || "",
        vehicleMake: c.bikeBrand || c.vehicleMake || "",
        vehicleModel: c.bikeModel || c.vehicleModel || "",
        vehicleYear: c.bikeYear || c.vehicleYear || "",
        regNumber: c.regNumber || "",
        vin: c.vin || "",
        color: c.color || "",
        fuel: c.fuel || "",
        notes: c.notes || "",
        carImage: c.bikeImage || c.carImage || "",
        adImage: c.adImage || "",
        damageImages: Array.isArray(c.damageImages) ? c.damageImages : [],
      });
      setIsImageUploaded(!!(c.bikeImage || c.carImage));
      setActiveImage(c.adImage || c.bikeImage || c.carImage || "");
      return;
    }

    if (!id) return;

    const fetchClient = async () => {
      try {
        setLoadingClient(true);
        const res = await api.get(`/api/bikes/${id}`);
        const data = res.data || {};

        setForm({
          ...EMPTY_FORM,
          fullName: data.ownerName || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          receiverName: data.receiverName || "",
          vehicleMake: data.bikeBrand || "",
          vehicleModel: data.bikeModel || "",
          vehicleYear: data.bikeYear || "",
          regNumber: data.regNumber || "",
          vin: data.vin || "",
          color: data.color || "",
          fuel: data.fuel || "",
          notes: data.notes || "",
          carImage: data.bikeImage || "",
          adImage: data.adImage || "",
          damageImages: Array.isArray(data.damageImages) ? data.damageImages : [],
        });

        setIsImageUploaded(!!data.bikeImage);
        setActiveImage(data.adImage || data.bikeImage || "");
      } catch (err) {
        console.error("Fetch client error:", err);
        toast.error(
          err.response?.data?.message || err.message || "Failed to load client"
        );
        // If 403 or 404, redirect back
        if (err.response?.status === 403 || err.response?.status === 404) {
          setTimeout(() => navigate("/bike-clients"), 2000);
        }
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

  useEffect(() => {
  if (form.vehicleMake && form.vehicleModel) {
    const timer = setTimeout(() => {
      fetchBikeImage(
        form.vehicleMake,
        form.vehicleModel,
        form.vehicleYear
      );
    }, 500); // debounce

    return () => clearTimeout(timer);
  }
}, [form.vehicleMake, form.vehicleModel, form.vehicleYear]);

useEffect(() => {
  const loadBikeMakes = async () => {
    try {
      const res = await api.get("/api/bikes-meta/local-makes");
      setBikeMakes(res.data.makes || []);
    } catch (err) {
      console.error("Bike makes load error", err);
    }
  };

  loadBikeMakes();
}, []);

// useEffect(() => {
//   if (!form.vehicleMake) return;

//   api.get("/api/bikes-meta/local-models", {
//     params: { make: form.vehicleMake }
//   }).then(res => {
//     setBikeModels(res.data.models || []);
//     setForm(prev => ({
//       ...prev,
//       vehicleModel: "",
//       carImage: ""
//     }));
//   });
// }, [form.vehicleMake]);

useEffect(() => {
  if (!form.vehicleMake) {
    setSelectedBikeMake(null);
    setBikeModels([]);
    return;
  }

  // find selected brand (for logo)
  const found = bikeMakes.find(
    (b) => b.make.toLowerCase() === form.vehicleMake.toLowerCase()
  );

  setSelectedBikeMake(found || null);

  // fetch related models
  const fetchModels = async () => {
    try {
      const res = await api.get("/api/bikes-meta/local-models", {
        params: { make: form.vehicleMake },
      });

      setBikeModels(res.data.models || []);
    } catch (err) {
      console.error("Failed to load models", err);
      setBikeModels([]);
    }
  };

  fetchModels();
}, [form.vehicleMake, bikeMakes]);

useEffect(() => {
  if (!brandSelected || !form.vehicleMake) return;

  const fetchModels = async () => {
    try {
      const res = await api.get("/api/bikes-meta/local-models", {
        params: { make: form.vehicleMake },
      });
      setBikeModels(res.data.models || []);
    } catch {
      setBikeModels([]);
    }
  };

  fetchModels();
}, [brandSelected, form.vehicleMake]);

  // ========== OCR AUTOFILL FUNCTIONS ==========
  const handleScanButtonClick = () => {
    if (navigator.mediaDevices?.getUserMedia) cameraInputRef.current.click();
    else fileInputRef.current.click();
  };

  // ---------- Normalization Helpers ----------
  const cleanReg = (s = "") => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const extractYear = (s = "") => {
    const m = String(s).match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : "";
  };

  const extractFuel = (s = "") => {
    const fuels = ["petrol", "diesel", "electric"];
    const t = s.toLowerCase();
    return fuels.find((f) => t.includes(f)) || "";
  };

const normalize = (v = "") => v.trim();

const fetchBikeImage = async (make, model, year) => {
  const nMake = normalize(make);
  const nModel = normalize(model);

  if (!nMake || !nModel) return;

  try {
    setBikeImageLoading(true);

    console.log("🚲 Fetch bike image:", nMake, nModel, year);

    const res = await api.get(
      `/api/bikes-meta/local-image`,
      {
        params: {
          make: nMake.toUpperCase(),
          model: nModel,
          year: year || undefined,
        },
      }
    );

    console.log("🖼 API response:", res.data);

    const img = res.data?.heroUrl || res.data?.thumbnailUrl;

    if (img) {
      setForm((prev) => ({
        ...prev,
        carImage: img,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        carImage: "",
      }));
    }
  } catch (err) {
    console.warn("❌ Bike image not found", err?.response?.data);
  } finally {
    setBikeImageLoading(false);
  }
};


  // ---------- Map OCR → AddClients form ----------
  const mapBikeOcrToForm = (p = {}) => {
    return {
      fullName: p.ownerName || "",
      regNumber: p.regNo || "",
      vehicleMake: p.maker || "",
      vehicleModel: p.vehicleModel || "",
      vehicleYear: p.regDate ? (p.regDate.match(/\b(19|20)\d{2}\b/)?.[0] || "") : "",
      vin: p.chassisNo || "",
      color: p.color || "",
      fuel: p.fuel || "",
      address: p.address || "",
    };
  };

  const handleRCFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRC(true);

    try {
      const reader = new FileReader();

      reader.onload = async (ev) => {
        const base64 = ev.target.result;

        // Run OCR (Bike OCR Processor)
        const result = await BikeprocessImage(base64);

        const parsed = result?.parsed || {};
        console.log("🔍 OCR RAW PARSED OUTPUT:", parsed);

        const mapped = mapBikeOcrToForm(parsed);

        // Apply to form
        setForm((prev) => ({ ...prev, ...mapped }));

        toast.success("RC scanned — details auto-filled!");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to scan RC");
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

  // Mouse handlers for 3D rotation
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

  // ========== FORM SUBMISSION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.vehicleMake || !form.vehicleModel || !form.regNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await api.put(`/api/bikes/${id}`, form);
        toast.success("Client updated successfully");
      } else {
        await api.post("/api/bikes", form);
        toast.success("Client added successfully");
      }
      navigate("/bike-clients");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/bike-clients");

  if (loadingClient) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
        <RotateCw className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  
  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/bike-clients")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-4 transition-all duration-200 ${
            isDark
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-700 hover:bg-white hover:text-blue-600"
          }`}
        >
          <ArrowLeft size={20} />
          Back to Clients
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          {id ? "Edit Client" : "Add New Client"}
        </h1>
        <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {id ? "Update client information" : "Fill in the details to register a new client"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OCR Scanner Section */}
        <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <Scan size={24} className="text-blue-500" />
            Quick RC Scan
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessingRC}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow transition-all duration-300 hover:scale-105 active:scale-95 ${
                isProcessingRC
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl"
              }`}
            >
              {isProcessingRC ? (
                <>
                  <RotateCw size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload RC
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current.click()}
              disabled={isProcessingRC}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow transition-all duration-300 hover:scale-105 active:scale-95 ${
                isProcessingRC
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDark
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Camera size={20} />
              Capture RC
            </button>
          </div>

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
        <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <User size={24} className="text-blue-500" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={<User size={18} />}
              iconColor="text-blue-500"
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter full name"
              isDark={isDark}
              required
            />

            <InputField
              icon={<Phone size={18} />}
              iconColor="text-green-500"
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
              isDark={isDark}
              type="tel"
              required
            />

            <InputField
              icon={<Mail size={18} />}
              iconColor="text-purple-500"
              label="Email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email address"
              isDark={isDark}
              type="email"
            />

            <InputField
              icon={<MapPin size={18} />}
              iconColor="text-red-500"
              label="Address"
              name="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Enter address"
              isDark={isDark}
            />

            <InputField
              icon={<Users size={18} />}
              iconColor="text-yellow-500"
              label="Receiver Name"
              name="receiverName"
              value={form.receiverName}
              onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
              placeholder="Staff/Receiver name"
              isDark={isDark}
            />
          </div>
        </div>

        {/* Vehicle Information */}
<div
  className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
  }`}
>
  <h2
    className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
      isDark ? "text-white" : "text-gray-900"
    }`}
  >
    <Bike size={24} className="text-blue-500" />
    Vehicle Details
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* ================= VEHICLE MAKE + BRAND ================= */}
    <div className="space-y-3">
      {/* Vehicle Make Input */}
      <InputField
        label="Vehicle Make"
        value={form.vehicleMake}
        onChange={(e) => {
          setForm({ ...form, vehicleMake: e.target.value });
          setShowBrandList(true);
          setBrandSelected(false);
          setBikeModels([]);
          setSelectedBikeMake(null);
        }}
        placeholder="Enter brand name"
        isDark={isDark}
        required
      />

      {/* ✅ Selected Brand Logo (ALWAYS visible after selection) */}
      {selectedBikeMake && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={selectedBikeMake.logoUrl}
            alt={selectedBikeMake.make}
            className="h-12 object-contain"
          />
          <span
            className={`text-sm font-semibold ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {selectedBikeMake.make}
          </span>
        </div>
      )}

      {/* ================= SELECT BRAND LIST ================= */}
      {showBrandList && !brandSelected && bikeMakes.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-semibold mb-2">Select Make</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bikeMakes
              .filter((b) =>
                b.make
                  .toLowerCase()
                  .includes(form.vehicleMake.toLowerCase())
              )
              .map((brand) => (
                <button
                  key={brand.slug}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      vehicleMake: brand.make,
                    }));
                    setSelectedBikeMake(brand);
                    setBrandSelected(true);
                    setShowBrandList(false);
                  }}
                  className={`border rounded-xl p-4 transition text-center ${
                    isDark
                      ? "border-gray-600 hover:border-green-400"
                      : "hover:border-green-500"
                  }`}
                >
                  <img
                    src={brand.logoUrl}
                    alt={brand.make}
                    className="h-12 mx-auto object-contain mb-2"
                  />
                  <p className="text-sm font-medium">{brand.make}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ================= MODEL SELECTION ================= */}
      {brandSelected && bikeModels.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold mb-3">Choose Model</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {bikeModels.map((model) => (
              <button
                key={model.slug}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    vehicleModel: model.name,
                  }));
                }}
                className={`border rounded-xl p-4 text-center transition ${
                  form.vehicleModel === model.name
                    ? "border-green-500 ring-2 ring-green-400"
                    : isDark
                    ? "border-gray-600 hover:border-green-400"
                    : "hover:border-green-400"
                }`}
              >
                <img
                  src={model.thumbnailUrl}
                  alt={model.name}
                  className="h-16 mx-auto object-contain mb-2"
                />
                <p className="text-sm font-medium">{model.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* ================= VEHICLE MODEL INPUT ================= */}
    <InputField
      label="Vehicle Model"
      value={form.vehicleModel}
      placeholder="Select model above"
      isDark={isDark}
    />

    {/* ================= YEAR ================= */}
    <InputField
      icon={<Calendar size={18} />}
      iconColor="text-orange-500"
      label="Year"
      name="vehicleYear"
      value={form.vehicleYear}
      onChange={(e) =>
        setForm({ ...form, vehicleYear: e.target.value })
      }
      placeholder="e.g., 2020"
      isDark={isDark}
      type="number"
      min="1900"
      max={new Date().getFullYear() + 1}
    />

    {/* ================= REG NUMBER ================= */}
    <InputField
      icon={<Hash size={18} />}
      iconColor="text-purple-500"
      label="Registration Number"
      name="regNumber"
      value={form.regNumber}
      onChange={(e) =>
        setForm({ ...form, regNumber: e.target.value })
      }
      placeholder="e.g., MH12AB1234"
      isDark={isDark}
      required
    />

    {/* ================= VIN ================= */}
    <InputField
      icon={<Hash size={18} />}
      iconColor="text-pink-500"
      label="VIN / Chassis Number"
      name="vin"
      value={form.vin}
      onChange={(e) =>
        setForm({ ...form, vin: e.target.value })
      }
      placeholder="Enter VIN"
      isDark={isDark}
    />

    {/* ================= COLOR ================= */}
    <InputField
      icon={<Palette size={18} />}
      iconColor="text-cyan-500"
      label="Color"
      name="color"
      value={form.color}
      onChange={(e) =>
        setForm({ ...form, color: e.target.value })
      }
      placeholder="e.g., Black"
      isDark={isDark}
    />

    {/* ================= FUEL TYPE ================= */}
    <div className="space-y-2">
      <label
        className={`flex items-center gap-2 text-sm font-semibold ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <Droplet size={18} className="text-green-500" />
        Fuel Type
      </label>

      <select
        name="fuel"
        value={form.fuel}
        onChange={(e) =>
          setForm({ ...form, fuel: e.target.value })
        }
        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 ${
          isDark
            ? "bg-gray-700 border-gray-600 text-white focus:ring-green-500"
            : "bg-white border-gray-300 text-gray-900 focus:ring-green-400"
        }`}
      >
        <option value="">Select Fuel Type</option>
        <option value="Petrol">Petrol</option>
        <option value="Electric">Electric</option>
        <option value="Hybrid">Hybrid</option>
        <option value="CNG">CNG</option>
      </select>
    </div>
  </div>
</div>


        {/* Notes */}
        <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <FileText size={24} className="text-blue-500" />
            Additional Notes
          </h2>

          <textarea
            name="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Enter any additional notes..."
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              isDark
                ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Image Upload Section */}
        <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <ImageIcon size={24} className="text-blue-500" />
            Vehicle Images
          </h2>
          {/* Main Image */}
          <div className="mb-6">
            <label
              className={`block text-sm font-semibold mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Main Vehicle Image
            </label>

            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
                isDark
                  ? "border-gray-600 bg-gray-700/50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {/* 🔄 Loading */}
              {bikeImageLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <RotateCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Fetching vehicle image…</p>
                </div>
              )}

              {/* 🖼 Image found (auto OR manual) */}
              {!bikeImageLoading && form.carImage && (
                <div className="relative flex flex-col items-center">
                  <img
                    src={form.carImage}
                    alt="Vehicle"
                    className="w-80 h-64 object-cover rounded-lg shadow"
                  />

                  {/* Remove / Replace */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, carImage: "" }))
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Remove
                    </button>

                    <button
                      type="button"
                      onClick={() => mainFileRef.current.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Upload size={16} className="inline mr-1" />
                      Replace
                    </button>
                  </div>
                </div>
              )}

              {/* 🚫 No image found → allow manual upload */}
              {!bikeImageLoading && !form.carImage && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <img
                    src={fallbackImage}
                    alt="No vehicle"
                    className="w-48 h-32 object-contain opacity-70 mb-3"
                  />

                  <p className="text-sm text-gray-500 mb-3">
                    No image found for this model
                  </p>

                  <button
                    type="button"
                    onClick={() => mainFileRef.current.click()}
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Upload size={18} className="inline mr-2" />
                    Upload Image Manually
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={mainFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, "main")}
              />
            </div>
          </div>
 
          
          {/* Damage Images */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Damage/Inspection Images
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "damage")}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : isDark
                  ? "border-gray-600 bg-gray-700/50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <p className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Upload multiple damage/inspection images
              </p>
              <button
                type="button"
                onClick={() => damageFileRef.current.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Choose Files
              </button>
              <input
                ref={damageFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files, "damage")}
                className="hidden"
              />
            </div>

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
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}