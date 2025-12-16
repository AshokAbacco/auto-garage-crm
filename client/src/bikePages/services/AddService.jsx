import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Wrench,
  User,
  Tag,
  AlertCircle,
  X
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AddService() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [form, setForm] = useState({
    client: "",
    date: "",
    category: "",
    subService: "",
    notes: "",
    parts: "",
    partsGst: "",
    labor: "",
    laborGst: "",
    status: "Pending",
  });

  /* FETCH BIKES */
  useEffect(() => {
    fetch(`${API}/api/bikes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setClients(data.data || []))
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  /* EDIT MODE LOAD */
  useEffect(() => {
    if (!isEditMode) return;

    fetch(`${API}/api/bike-services/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          client: data.clientId,
          date: data.date.split("T")[0],
          category: data.categoryId,
          subService: data.subServiceId,
          notes: data.notes || "",
          parts: data.partsCost || "",
          partsGst: data.partsGst || "",
          labor: data.laborCost || "",
          laborGst: data.laborGst || "",
          status: data.status,
        });

        setExistingImages(data.mediaFiles || []);
      })
      .catch(() => toast.error("Failed to load service"));
  }, [id]);

  /* FETCH CATEGORIES */
  useEffect(() => {
    if (!form.client) return;

    setCategoryLoading(true);

    fetch(`${API}/api/bike-services/types/by-bike/${form.client}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setCategoryLoading(false));
  }, [form.client]);

  /* FETCH SUB SERVICES */
  useEffect(() => {
    const selected = categories.find(
      (c) => c.id === Number(form.category)
    );
    setSubServices(selected?.subServices || []);
  }, [form.category, categories]);

  /* TOTAL */
  const total =
    Number(form.parts || 0) +
    (Number(form.parts || 0) * Number(form.partsGst || 0)) / 100 +
    Number(form.labor || 0) +
    (Number(form.labor || 0) * Number(form.laborGst || 0)) / 100;

  /* ADD + EDIT SUBMIT WITH IMAGE UPLOAD */
  const handleSubmit = async () => {
    if (!form.client || !form.date || !form.category || !form.subService) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries({
        clientId: form.client,
        categoryId: form.category,
        subServiceId: form.subService,
        date: form.date,
        notes: form.notes,
        partsCost: form.parts,
        partsGst: form.partsGst,
        laborCost: form.labor,
        laborGst: form.laborGst,
        status: form.status,
        cost: total.toFixed(2),
      }).forEach(([key, val]) => formData.append(key, val));

      mediaFiles.forEach((file) => formData.append("media", file));

      const res = await fetch(
        isEditMode
          ? `${API}/api/bike-services/${id}`
          : `${API}/api/bike-services`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId: Number(form.client),
            categoryId: Number(form.category),
            subServiceId: Number(form.subService),
            date: form.date,
            notes: form.notes,
            partsCost: Number(form.parts || 0),
            partsGst: Number(form.partsGst || 0),
            laborCost: Number(form.labor || 0),
            laborGst: Number(form.laborGst || 0),
            status: form.status,
          }),
        }
      );


      if (!res.ok) throw new Error("Save failed");

      toast.success(isEditMode ? "Service updated successfully" : "Service created successfully");
      navigate("/bike-services");
    } catch (err) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto animate-fade-in">
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

          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
              {isEditMode ? "Edit Service" : "Add New Service"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {isEditMode ? "Update service details" : "Fill in the details to create a new service record"}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}>
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2 animate-slide-down" style={{ animationDelay: "50ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <User size={16} className="text-green-500" />
                Select Client *
              </label>
              <select
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                <option value="">Choose a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ownerName} - {c.bikeModel} - {c.regNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2 animate-slide-down" style={{ animationDelay: "100ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <Calendar size={16} className="text-blue-500" />
                Service Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Category & Sub Service */}
            <div className="grid md:grid-cols-2 gap-6 animate-slide-down" style={{ animationDelay: "150ms" }}>
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  <Tag size={16} className="text-purple-500" />
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value, subService: "" })
                  }
                  disabled={!form.client || categoryLoading}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  <option value="">
                    {categoryLoading ? "Loading..." : "Select category..."}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  <Wrench size={16} className="text-orange-500" />
                  Sub Service *
                </label>
                <select
                  value={form.subService}
                  onChange={(e) => setForm({ ...form, subService: e.target.value })}
                  disabled={!form.category}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  <option value="">Select sub service...</option>
                  {subServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className={`p-6 rounded-xl border-2 space-y-4 animate-slide-down ${
              isDark
                ? "bg-gray-900/50 border-gray-700"
                : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"
            }`} style={{ animationDelay: "200ms" }}>
              <h3 className={`flex items-center gap-2 font-semibold ${
                isDark ? "text-green-400" : "text-green-700"
              }`}>
                <IndianRupee size={18} />
                Cost Breakdown
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Parts Cost
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.parts}
                    onChange={(e) => setForm({ ...form, parts: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Parts GST %
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.partsGst}
                    onChange={(e) => setForm({ ...form, partsGst: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Labor Cost
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.labor}
                    onChange={(e) => setForm({ ...form, labor: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Labor GST %
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.laborGst}
                    onChange={(e) => setForm({ ...form, laborGst: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}>
                <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Estimated Total
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 animate-slide-down" style={{ animationDelay: "250ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <FileText size={16} className="text-indigo-500" />
                Notes
              </label>
              <textarea
                placeholder="Add any additional notes or details..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 animate-slide-down" style={{ animationDelay: "300ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <ImageIcon size={16} className="text-pink-500" />
                Upload Images
              </label>
              
              <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 hover:border-green-500 ${
                isDark
                  ? "border-gray-600 bg-gray-700/50"
                  : "border-gray-300 bg-gray-50"
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setMediaFiles([...e.target.files])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <ImageIcon size={32} className={isDark ? "text-gray-500" : "text-gray-400"} />
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>

              {/* Preview New Images */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {Array.from(mediaFiles).map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="h-24 w-full object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        onClick={() => removeMediaFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing Images (Edit Mode) */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Existing Images
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <img
                        key={img.id}
                        src={img.data}
                        alt="Service"
                        className="h-24 w-full object-cover rounded-lg border-2 border-green-500"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2 animate-slide-down" style={{ animationDelay: "350ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <AlertCircle size={16} className="text-red-500" />
                Payment Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Completed</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-slide-down"
              style={{ animationDelay: "400ms" }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                  {isEditMode ? "Update Service" : "Create Service"}
                </>
              )}
            </button>
          </div>
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