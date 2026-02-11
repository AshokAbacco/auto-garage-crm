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
  ChevronDown,
  Plus,
  Trash2,
  Upload,
  File,
  Send,
  Eye,
  FileDown,
  Edit
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
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
    inDate: "",
    outDate: "",
    expectedDelivery: "",
    priority: "Normal",
    assignedMechanic: "",
    category: "",
    categoryText: "",
    subService: "",
    subServiceText: "",
    notes: "",
    discountType: "Fixed Amount",
    discountValue: "",
    advancePaid: "",
    invoiceStatus: "draft",
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      type: "Part",
      name: "",
      quantity: 1,
      unitPrice: 0,
      cgst: 0,
      sgst: 0,
    },
  ]);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [subServiceQuery, setSubServiceQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubServiceDropdown, setShowSubServiceDropdown] = useState(false);

  const categoryInputRef = useRef(null);
  const subServiceInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const subServiceDropdownRef = useRef(null);
  const fileInputRef = useRef(null);


  /* =====================================================
     CALCULATIONS
  ===================================================== */
  const calculateItemTotal = (item) => {
    const subtotal = Number(item.quantity) * Number(item.unitPrice);
    const cgstAmount = (subtotal * Number(item.cgst)) / 100;
    const sgstAmount = (subtotal * Number(item.sgst)) / 100;
    return subtotal + cgstAmount + sgstAmount;
  };

  const partsSubtotal = items
    .filter((item) => item.type === "Part")
    .reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

  const laborSubtotal = items
    .filter((item) => item.type === "Labor")
    .reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

  const cgstTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * Number(item.cgst)) / 100,
    0
  );

  const sgstTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * Number(item.sgst)) / 100,
    0
  );

  const subtotalBeforeDiscount = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal;

  const discountAmount =
    form.discountType === "Fixed Amount"
      ? Number(form.discountValue || 0)
      : (subtotalBeforeDiscount * Number(form.discountValue || 0)) / 100;

  const grandTotal = subtotalBeforeDiscount - discountAmount;
  const balanceDue = grandTotal - Number(form.advancePaid || 0);

  /* =====================================================
     ITEM MANAGEMENT - ✅ FIXED
  ===================================================== */
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        type: "Part",
        name: "",
        quantity: 1,
        unitPrice: 0,
        cgst: 0,
        sgst: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // ✅ FIXED: Automatically handle name field based on type
  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        // If changing type, automatically handle name field
        if (field === "type") {
          return {
            ...item,
            type: value,
            name: value === "Labor" ? "Labor" : "", // Auto-set "Labor" or clear for Part
          };
        }

        // For other fields
        return {
          ...item,
          [field]: field === "name" ? value : Number(value) || 0,
        };
      })
    );
  };

  /* =====================================================
     FILE HANDLING
  ===================================================== */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  /* =====================================================
     FETCH CLIENTS
  ===================================================== */
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

  /* =====================================================
     EDIT MODE LOAD
  ===================================================== */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchService = async () => {
      try {
        const res = await api.get(`/api/bike-services/${id}`);
        const data = res.data;

        setForm({
          client: data.clientId,
          inDate: data.inDate?.split("T")[0] || "",
          outDate: data.outDate?.split("T")[0] || "",
          expectedDelivery: data.expectedDelivery?.split("T")[0] || "",
          status: data.status || "Pending",
          priority: data.priority || "Normal",
          assignedMechanic: data.assignedMechanic || "",
          category: data.categoryId || "",
          categoryText: data.category?.name || data.categoryText || "",

          subService: data.subServiceId || "",
          subServiceText: data.subService?.name || data.subServiceText || "",
          notes: data.notes || "",
          discountType: data.discountType || "Fixed Amount",
          discountValue: data.discount || "",
          advancePaid: data.advancePaid || "",
          invoiceStatus: data.invoiceStatus || "draft",
        });

        setCategoryQuery(data.category?.name || data.categoryText || "");
        setSubServiceQuery(data.subService?.name || data.subServiceText || "");


        if (data.serviceItems && data.serviceItems.length > 0) {
          setItems(
            data.serviceItems.map((item) => ({
              id: item.id,
              type: item.type,
              name: item.name,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              cgst: Number(item.cgst),
              sgst: Number(item.sgst),
            }))
          );
        }

        setExistingImages(data.serviceMedia || []);
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

  /* =====================================================
     FETCH CATEGORIES BY BIKE
  ===================================================== */
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

  /* =====================================================
     FETCH SUB SERVICES
  ===================================================== */
  useEffect(() => {
    const selected = categories.find((c) => c.id === Number(form.category));
    setSubServices(selected?.subServices || []);
  }, [form.category, categories]);

  /* =====================================================
     FILTER CATEGORIES & SUBSERVICES
  ===================================================== */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  const filteredSubServices = subServices.filter((sub) =>
    sub.name.toLowerCase().includes(subServiceQuery.toLowerCase())
  );

  /* =====================================================
     CATEGORY SELECTION
  ===================================================== */
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

  /* =====================================================
     SUB SERVICE SELECTION
  ===================================================== */
  const handleSubServiceSelect = (subService) => {
    setForm({
      ...form,
      subService: subService.id,
      subServiceText: subService.name,
    });
    setSubServiceQuery(subService.name);
    setShowSubServiceDropdown(false);
  };

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

  /* =====================================================
     CLICK OUTSIDE TO CLOSE DROPDOWNS
  ===================================================== */
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

  /* =====================================================
     HANDLE FORM SUBMISSION
  ===================================================== */
const handleSubmit = async (action = "create") => {
  // ✅ Basic validation
  if (!form.client || !form.inDate) {
    toast.error("Please fill in all required fields");
    return;
  }

  if (!form.category && !form.categoryText) {
    toast.error("Please select or enter a service category");
    return;
  }

  if (!form.subService && !form.subServiceText) {
    toast.error("Please select or enter a sub-service");
    return;
  }

  setLoading(true);

  try {
    // ✅ USE FormData (IMPORTANT)
    const formData = new FormData();

    // ─────────────────────────────────
    // BASIC FIELDS
    // ─────────────────────────────────
    formData.append("clientId", Number(form.client));
    formData.append("categoryId", Number(form.category));
    formData.append("subServiceId", Number(form.subService));
    formData.append("inDate", form.inDate);
    formData.append("outDate", form.outDate || "");
    formData.append("expectedDelivery", form.expectedDelivery || "");
    formData.append("status", form.status);
    formData.append("priority", form.priority);
    formData.append("assignedMechanic", form.assignedMechanic || "");
    formData.append("notes", form.notes || "");
    formData.append("discountType", form.discountType);
    formData.append("discountValue", form.discountValue || 0);
    formData.append("advancePaid", form.advancePaid || 0);
    formData.append(
      "invoiceStatus",
      action === "draft" ? "draft" : form.invoiceStatus
    );
    formData.append("categoryText", form.categoryText || "");
    formData.append("subServiceText", form.subServiceText || "");


    // ─────────────────────────────────
    // SERVICE ITEMS (ARRAY → STRING)
    // ─────────────────────────────────
    formData.append("parsedServiceItems", JSON.stringify(items));


    // ─────────────────────────────────
    // MEDIA FILES (DIRECT UPLOAD)
    // ─────────────────────────────────
    if (mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append("files", file); // multer -> file.buffer
      });
    }

    // ─────────────────────────────────
    // CREATE / UPDATE
    // ─────────────────────────────────
    if (isEditMode) {
      await api.put(`/api/bike-services/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Service updated successfully!");
    } else {
      const res = await api.post("/api/bike-services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Service created successfully!");
    }

    // ─────────────────────────────────
    // OPTIONAL ACTIONS
    // ─────────────────────────────────
    if (isEditMode && action === "generate") {
      await api.post(`/api/bike-services/${id}/generate-invoice`);
      toast.success("Invoice generated!");
    }

    if (isEditMode && action === "send") {
      await api.post(`/api/bike-services/${id}/send-invoice`);
      toast.success("Invoice sent!");
    }

    setTimeout(() => navigate("/bike-services"), 1500);
  } catch (err) {
    console.error("Submit error:", err);
    toast.error(err.response?.data?.message || "Failed to save service");
  } finally {
    setLoading(false);
  }
};


const handleSend = () => {
  alert("✅ Client confirmation sent successfully!");
};

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl shadow-xl animate-fade-in ${isDark ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-white"}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/bike-services")}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <ArrowLeft size={20} className={isDark ? "text-white" : "text-gray-700"} />
            </button>
            <div>
              <h1 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                {isEditMode ? "Edit Service" : "Add New Service"}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Manage your service record easily
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden animate-fade-in ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="p-8 space-y-6">
            
            {/* Client & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <User size={16} className="text-blue-500" />
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value, category: "", subService: "" })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.ownerName} - {client.bikeBrand} {client.bikeModel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <AlertCircle size={16} className="text-yellow-500" />
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Tag size={16} className="text-red-500" />
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Timeline - Multiple Dates */}
            <div className={`p-6 rounded-xl space-y-4 ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <h3 className={`flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                <Calendar size={20} className="text-blue-500" />
                Timeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    In Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.inDate}
                    onChange={(e) => setForm({ ...form, inDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Out Date
                  </label>
                  <input
                    type="date"
                    value={form.outDate}
                    onChange={(e) => setForm({ ...form, outDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={form.expectedDelivery}
                    onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                  />
                </div>
              </div>
            </div>

            {/* Service Category & Sub-Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Wrench size={16} className="text-green-500" />
                  Service Category <span className="text-red-500">*</span>
                </label>
                <input
                  ref={categoryInputRef}
                  type="text"
                  value={categoryQuery}
                  onChange={handleCategoryChange}
                  onFocus={() => setShowCategoryDropdown(true)}
                  disabled={!form.client || categoryLoading}
                  placeholder={categoryLoading ? "Loading..." : "Select or type category"}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-600 disabled:text-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"}`}
                />

                {showCategoryDropdown && !categoryLoading && form.client && (
                  <div
                    ref={categoryDropdownRef}
                    className={`absolute z-50 w-full mt-1 rounded-xl shadow-2xl border-2 max-h-60 overflow-y-auto ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                  >
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
                          className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${isDark ? "hover:bg-gray-600 text-white" : "hover:bg-gray-100 text-gray-900"}`}
                        >
                          {cat.name}
                        </div>
                      ))
                    ) : (
                      <div className={`px-4 py-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-green-500" />
                          <span>
                            Will create new: "<strong>{categoryQuery}</strong>"
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Wrench size={16} className="text-purple-500" />
                  Sub-Service <span className="text-red-500">*</span>
                </label>
                <input
                  ref={subServiceInputRef}
                  type="text"
                  value={subServiceQuery}
                  onChange={handleSubServiceChange}
                  onFocus={() => setShowSubServiceDropdown(true)}
                  disabled={!form.category && !form.categoryText}
                  placeholder="Select or type sub-service"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-600 disabled:text-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"}`}
                />

                {showSubServiceDropdown && (form.category || form.categoryText) && (
                  <div
                    ref={subServiceDropdownRef}
                    className={`absolute z-50 w-full mt-1 rounded-xl shadow-2xl border-2 max-h-60 overflow-y-auto ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                  >
                    {filteredSubServices.length > 0 ? (
                      filteredSubServices.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleSubServiceSelect(sub)}
                          className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${isDark ? "hover:bg-gray-600 text-white" : "hover:bg-gray-100 text-gray-900"}`}
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

            {/* Assigned Mechanic */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <User size={16} className="text-orange-500" />
                Assigned Mechanic
              </label>
              <input
                type="text"
                placeholder="Type mechanic name"
                value={form.assignedMechanic}
                onChange={(e) => setForm({ ...form, assignedMechanic: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
              />
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <FileText size={16} className="text-indigo-500" />
                Internal Notes (Staff Only)
              </label>
              <textarea
                placeholder="Enter internal notes or special instructions..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
              />
            </div>

            {/* Cost Breakdown with Line Items - ✅ FIXED */}
            <div className={`p-6 rounded-xl space-y-4 ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <h3 className={`flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  <IndianRupee size={20} className="text-green-500" />
                  Cost Breakdown
                </h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg space-y-3 ${isDark ? "bg-gray-800" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Item #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* ✅ FIXED: Conditional layout based on Type */}
                    {item.type === "Part" ? (
                      // Layout for Part: Type, Name, Qty, Unit Price, CGST, SGST
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {/* Type */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Type
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) => updateItem(item.id, "type", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          >
                            <option value="Part">Part</option>
                            <option value="Labor">Labor</option>
                          </select>
                        </div>

                        {/* Name - Only for Part */}
                        <div className="space-y-1 md:col-span-2">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Name
                          </label>
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Unit Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* CGST % */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            CGST %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.cgst}
                            onChange={(e) => updateItem(item.id, "cgst", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* SGST % */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            SGST %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.sgst}
                            onChange={(e) => updateItem(item.id, "sgst", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                      </div>
                    ) : (
                      // Layout for Labor: Type, Qty, Unit Price, CGST, SGST (NO NAME)
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Type */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Type
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) => updateItem(item.id, "type", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          >
                            <option value="Part">Part</option>
                            <option value="Labor">Labor</option>
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Unit Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* CGST % */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            CGST %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.cgst}
                            onChange={(e) => updateItem(item.id, "cgst", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>

                        {/* SGST % */}
                        <div className="space-y-1">
                          <label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            SGST %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.sgst}
                            onChange={(e) => updateItem(item.id, "sgst", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Item Total */}
                    <div className={`flex justify-between items-center pt-2 border-t ${isDark ? "border-gray-600" : "border-gray-200"}`}>
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Item Total:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{calculateItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          

            {/* Discount & Advance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Tag size={16} className="text-red-500" />
                  Discount Type
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                >
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <IndianRupee size={16} className="text-red-500" />
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                />
              </div>
            </div>

            {/* Advance Paid */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <IndianRupee size={16} className="text-blue-500" />
                Advance Paid
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.advancePaid}
                onChange={(e) => setForm({ ...form, advancePaid: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
              />
            </div>

              {/* Billing Summary */}
            <div className={`p-6 rounded-xl space-y-4 ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
              <h3 className={`flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                <IndianRupee size={20} className="text-green-500" />
                Billing Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>Parts Subtotal</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    ₹{partsSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>Labor Subtotal</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    ₹{laborSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>CGST Total</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    ₹{cgstTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>SGST Total</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    ₹{sgstTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>Discount</span>
                  <span className={`font-semibold text-red-600`}>
                    -₹{discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>Advance Paid</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    ₹{Number(form.advancePaid || 0).toFixed(2)}
                  </span>
                </div>

                <div className={`border-t-2 pt-3 mt-3 ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Balance Due
                    </span>
                    <span className={`text-2xl font-bold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                      ₹{balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Media */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Upload size={16} className="text-purple-500" />
                Upload Media (Images/Files)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-green-500 ${isDark ? "border-gray-600 bg-gray-700 hover:bg-gray-600" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
              >
                <Upload size={32} className={`mx-auto mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Click to choose files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {mediaFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {mediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-blue-500" />
                        <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Actions */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-6">
              <button
                disabled={loading}
                onClick={() => handleSubmit("draft")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${isDark ? "bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-700" : "bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300"}`}
              >
                <Save size={16} />
                Save as Draft
              </button>

 

<button
  onClick={handleSend}
  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
    isDark
      ? "bg-green-600 hover:bg-green-500 text-white disabled:bg-green-700"
      : "bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
  }`}
>
  <Send size={16} />
  Send Client Confirmation
</button>


              {/* <button
                disabled={loading || !isEditMode}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${isDark ? "bg-purple-600 hover:bg-purple-500 text-white disabled:bg-gray-700" : "bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-300"}`}
              >
                <Eye size={16} />
                Preview Invoice
              </button> */}
            </div>

            {/* Create Service Button */}
            <button
              disabled={loading}
              onClick={() => handleSubmit("create")}
              className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}