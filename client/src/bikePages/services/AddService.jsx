import React, { useEffect, useState, useRef } from "react";
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
  X,
  ChevronDown
} from "lucide-react";
import { Toaster, toast  } from "react-hot-toast";
import api from "../../utils/axiosInstance";

export default function AddService() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

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
    categoryText: "",
    subService: "",
    subServiceText: "",
    notes: "",
    parts: "",
    partsGst: "",
    labor: "",
    laborGst: "",
    status: "Pending",
  });

  // Autocomplete states
  const [categoryQuery, setCategoryQuery] = useState("");
  const [subServiceQuery, setSubServiceQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubServiceDropdown, setShowSubServiceDropdown] = useState(false);

  const categoryInputRef = useRef(null);
  const subServiceInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const subServiceDropdownRef = useRef(null);
  const dateRef = useRef(null);
 

  /* FETCH BIKES */
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/api/bikes");
        setClients(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error("Fetch clients error:", err);
        toast.error("Failed to load clients");
      }
    };

    fetchClients();
  }, []);

  /* EDIT MODE LOAD */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchService = async () => {
      try {
        const res = await api.get(`/api/bike-services/${id}`);
        const data = res.data;

        setForm({
          client: data.clientId,
          date: data.date.split("T")[0],
          category: data.categoryId || "",
          categoryText: data.category?.name || "",
          subService: data.subServiceId || "",
          subServiceText: data.subService?.name || "",
          notes: data.notes || "",
          parts: data.partsCost || "",
          partsGst: data.partsGst || "",
          labor: data.laborCost || "",
          laborGst: data.laborGst || "",
          status: data.status,
        });

        setCategoryQuery(data.category?.name || "");
        setSubServiceQuery(data.subService?.name || "");
        setExistingImages(data.mediaFiles || []);
      } catch (err) {
        console.error("Fetch service error:", err);
        toast.error(err.response?.data?.message || "Failed to load service");
        if (err.response?.status === 403 || err.response?.status === 404) {
          setTimeout(() => navigate("/bike-services"), 2000);
        }
      }
    };

    fetchService();
  }, [id, isEditMode, navigate]);

  /* FETCH CATEGORIES */
  useEffect(() => {
    if (!form.client) return;

    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const res = await api.get(`/api/bike-services/types/by-bike/${form.client}`);
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch categories error:", err);
        toast.error("Failed to load categories");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [form.client]);

  /* FETCH SUB SERVICES */
  useEffect(() => {
    const selected = categories.find((c) => c.id === Number(form.category));
    setSubServices(selected?.subServices || []);
  }, [form.category, categories]);

  /* FILTER CATEGORIES BASED ON QUERY */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  /* FILTER SUB SERVICES BASED ON QUERY */
  const filteredSubServices = subServices.filter((sub) =>
    sub.name.toLowerCase().includes(subServiceQuery.toLowerCase())
  );

  /* HANDLE CATEGORY SELECTION */
  const handleCategorySelect = (category) => {
    setForm({
      ...form,
      category: category.id,
      categoryText: category.name,
      subService: "",
      subServiceText: "",
    });
    setCategoryQuery(category.name);
    setShowCategoryDropdown(false);
    setSubServiceQuery("");
  };

  /* HANDLE SUB SERVICE SELECTION */
  const handleSubServiceSelect = (subService) => {
    setForm({
      ...form,
      subService: subService.id,
      subServiceText: subService.name,
    });
    setSubServiceQuery(subService.name);
    setShowSubServiceDropdown(false);
  };

  /* HANDLE CATEGORY INPUT CHANGE */
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryQuery(value);
    setForm({
      ...form,
      category: "",
      categoryText: value,
      subService: "",
      subServiceText: "",
    });
    setShowCategoryDropdown(true);
    setSubServiceQuery("");
  };

  /* HANDLE SUB SERVICE INPUT CHANGE */
  const handleSubServiceChange = (e) => {
    const value = e.target.value;
    setSubServiceQuery(value);
    setForm({
      ...form,
      subService: "",
      subServiceText: value,
    });
    setShowSubServiceDropdown(true);
  };

  /* CLICK OUTSIDE TO CLOSE DROPDOWNS */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target) &&
        !categoryInputRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        subServiceDropdownRef.current &&
        !subServiceDropdownRef.current.contains(event.target) &&
        !subServiceInputRef.current.contains(event.target)
      ) {
        setShowSubServiceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* TOTAL */
  const total =
    Number(form.parts || 0) +
    (Number(form.parts || 0) * Number(form.partsGst || 0)) / 100 +
    Number(form.labor || 0) +
    (Number(form.labor || 0) * Number(form.laborGst || 0)) / 100;

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!form.client || !form.date || !form.categoryText || !form.subServiceText) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        clientId: Number(form.client),
        // Send ID if selected from list, otherwise send text for new entry
        categoryId: form.category ? Number(form.category) : null,
        categoryName: form.categoryText,
        subServiceId: form.subService ? Number(form.subService) : null,
        subServiceName: form.subServiceText,
        date: form.date,
        notes: form.notes,
        partsCost: Number(form.parts || 0),
        partsGst: Number(form.partsGst || 0),
        laborCost: Number(form.labor || 0),
        laborGst: Number(form.laborGst || 0),
        status: form.status,
      };

      if (isEditMode) {
        await api.put(`/api/bike-services/${id}`, payload);
        toast.success("Service updated successfully");
      } else {
        await api.post("/api/bike-services", payload);
        toast.success("Service created successfully");
      }

      navigate("/bike-services");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
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

          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
              {isEditMode ? "Edit Service" : "Add New Service"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {isEditMode ? "Update service information" : "Create a new service record"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Client Selection */}
            <div className="space-y-2 animate-slide-down w-full" style={{ animationDelay: "0ms" }}>
              <label className={`flex items-center gap-2 text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                <User size={16} className="text-blue-500" />
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={form.client}
                onChange={(e) => {
                  setForm({ ...form, client: e.target.value, category: "", categoryText: "", subService: "", subServiceText: "" });
                  setCategories([]);
                  setSubServices([]);
                  setCategoryQuery("");
                  setSubServiceQuery("");
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
                required
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ownerName} - {c.bikeBrand} {c.bikeModel} ({c.regNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Date */}
              <div
                className="space-y-2 animate-slide-down w-full cursor-pointer"
                style={{ animationDelay: "50ms" }}
                onClick={() => dateRef.current?.showPicker()}
              >
                <label
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Calendar size={16} className="text-blue-600" />
                  Service Date <span className="text-red-500">*</span>
                </label>

                <input
                  ref={dateRef}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  onClick={(e) => e.stopPropagation()} 
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  required
                />
              </div>

            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Category - Autocomplete */}
                <div className="w-full md:w-1/2 space-y-2 animate-slide-down relative" style={{ animationDelay: "100ms" }}>
                  <label className={`flex items-center gap-2 text-sm font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <Tag size={16} className="text-purple-500" />
                    Service Category <span className="text-red-500">*</span>
                  </label>

                  {categoryLoading ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        Loading categories...
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        ref={categoryInputRef}
                        type="text"
                        value={categoryQuery}
                        onChange={handleCategoryChange}
                        onFocus={() => setShowCategoryDropdown(true)}
                        placeholder="Type to search or add new category"
                        disabled={!form.client}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                        }`}
                        required
                      />
                      <ChevronDown
                        size={20}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />

                      {showCategoryDropdown && categoryQuery && (
                        <div
                          ref={categoryDropdownRef}
                          className={`absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl border-2 shadow-lg ${
                            isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                          }`}
                        >
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`px-4 py-3 cursor-pointer transition-colors ${
                                  isDark
                                    ? "hover:bg-gray-600 text-white"
                                    : "hover:bg-gray-100 text-gray-900"
                                }`}
                              >
                                {cat.name}
                              </div>
                            ))
                          ) : (
                            <div className={`px-4 py-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              <div className="flex items-center gap-2">
                                <Tag size={16} className="text-green-500" />
                                <span>
                                  Will create new: "<strong>{categoryQuery}</strong>"
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub Service - Autocomplete */}
                <div className="w-full md:w-1/2 space-y-2 animate-slide-down relative" style={{ animationDelay: "150ms" }}>
                  <label className={`flex items-center gap-2 text-sm font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    <Wrench size={16} className="text-green-500" />
                    Sub Service <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      ref={subServiceInputRef}
                      type="text"
                      value={subServiceQuery}
                      onChange={handleSubServiceChange}
                      onFocus={() => setShowSubServiceDropdown(true)}
                      placeholder="Type to search or add new sub service"
                      disabled={!form.categoryText}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                      required
                    />
                    <ChevronDown
                      size={20}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />

                    {showSubServiceDropdown && subServiceQuery && (
                      <div
                        ref={subServiceDropdownRef}
                        className={`absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl border-2 shadow-lg ${
                          isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                        }`}
                      >
                        {filteredSubServices.length > 0 ? (
                          filteredSubServices.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => handleSubServiceSelect(sub)}
                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                isDark
                                  ? "hover:bg-gray-600 text-white"
                                  : "hover:bg-gray-100 text-gray-900"
                              }`}
                            >
                              {sub.name}
                            </div>
                          ))
                        ) : (
                          <div className={`px-4 py-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <div className="flex items-center gap-2">
                              <Wrench size={16} className="text-green-500" />
                              <span>
                                Will create new: "<strong>{subServiceQuery}</strong>"
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
            </div>


            {/* Cost Breakdown */}
            <div className={`p-6 rounded-xl space-y-4 animate-slide-down ${
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            }`} style={{ animationDelay: "200ms" }}>
              <h3 className={`flex items-center gap-2 text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                <IndianRupee size={20} className="text-green-500" />
                Cost Breakdown
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Parts Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
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
                    Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
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