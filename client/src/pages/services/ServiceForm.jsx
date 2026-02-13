// client/src/pages/services/ServiceForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import {
  FiTool,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiUser,
  FiArrowLeft,
  FiSave,
  FiFileText,
  FiPlus,
  FiTrash,
  FiPackage,
  FiClock,
  FiAlertCircle,
  FiUserCheck,
  FiEdit3,
  FiUpload,
  FiSend,
  FiDownload,
  FiFile,
  FiX,
  FiCheck,
  FiCamera,
} from "react-icons/fi";
import { GrUserWorker } from "react-icons/gr";
import { FaIndianRupeeSign, FaTruck } from "react-icons/fa6";

import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return response;
};

export default function ServiceForm() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    clientId: "",
    categoryId: "",
    date: "",
    notes: "",
    status: "Pending",
    priority: "Normal",
    serviceInDate: "",
    serviceOutDate: "",
    expectedDelivery: "",
    internalNotes: "",
    assignedMechanic: "",
    advancePaid: "",
  });

  /** 🔹 Sub-service typing state */
  const [subServiceInput, setSubServiceInput] = useState("");
  const [subServiceSuggestions, setSubServiceSuggestions] = useState([]);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [showCreateSubService, setShowCreateSubService] = useState(false);
  const [creatingSubService, setCreatingSubService] = useState(false);

  /** 🔹 Cost breakdown rows */
  const [costItems, setCostItems] = useState([
    {
      type: "part",
      name: "",
      quantity: 1,
      unitPrice: "",
      cgstRate: "",
      sgstRate: "",
    },
  ]);

  /** 🔹 Mechanic typing state */
  const [mechanicInput, setMechanicInput] = useState("");
  const [mechanicSuggestions, setMechanicSuggestions] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [showCreateMechanic, setShowCreateMechanic] = useState(false);
  const [creatingMechanic, setCreatingMechanic] = useState(false);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [media, setMedia] = useState([]);
  const [discount, setDiscount] = useState({ type: "amount", value: "" });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await apiRequest("/api/clients");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load clients");
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setClients(data);
        } else if (Array.isArray(data.clients)) {
          setClients(data.clients);
        } else if (data?.data && Array.isArray(data.data)) {
          setClients(data.data);
        } else {
          console.warn("Unexpected /api/clients response:", data);
          setClients([]);
        }
      } catch (err) {
        console.error("❌ Error loading clients:", err);
        setClients([]);
        setError("Unable to fetch clients. Please check your API or token.");
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await apiRequest("/api/services/list");
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch (err) {
        console.error("Error fetching service types:", err);
      }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    const loadMechanics = async () => {
      try {
        const res = await apiRequest("/api/mechanics");
        const data = await res.json();
        if (res.ok) setMechanics(data);
      } catch (err) {
        console.error("Error fetching mechanics:", err);
      }
    };
    loadMechanics();
  }, []);

  // Load sub-services when category changes
  useEffect(() => {
    if (form.categoryId) {
      const loadSubServices = async () => {
        try {
          const r = await apiRequest(
            `/api/services/sub-services/search?categoryId=${form.categoryId}`,
          );
          const data = await r.json();
          setSubServiceSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching sub-services:", err);
          setSubServiceSuggestions([]);
        }
      };

      loadSubServices();
    } else {
      setSubServiceSuggestions([]);
    }
  }, [form.categoryId]);

  // Load mechanics when typing
  useEffect(() => {
    if (mechanicInput.trim()) {
      const loadMechanics = async () => {
        try {
          const r = await apiRequest(
            `/api/mechanics/search?q=${encodeURIComponent(mechanicInput)}`,
          );
          const data = await r.json();
          setMechanicSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error searching mechanics:", err);
          setMechanicSuggestions([]);
        }
      };

      loadMechanics();
    } else {
      setMechanicSuggestions([]);
    }
  }, [mechanicInput]);

  useEffect(() => {
    if (location.state?.customerId) {
      const clientId = location.state.customerId;
      setForm((f) => ({ ...f, clientId }));
      const fetchClient = async () => {
        const res = await apiRequest(`/api/clients/${clientId}`);
        const data = await res.json();
        if (res.ok) setSelectedClient(data);
      };
      fetchClient();
    }
  }, [location.state]);

  // Load existing service data for editing
  useEffect(() => {
    if (!id) return;

    const loadService = async () => {
      const res = await apiRequest(`/api/services/${id}`);
      const data = await res.json();

      setForm({
        clientId: data.client?.id || "",
        categoryId: data.category?.id || "",
        notes: data.notes || "",
        status: data.status || "Pending",
        priority: data.priority || "Normal",

        serviceInDate: data.serviceInDate
          ? data.serviceInDate.slice(0, 16)
          : "",
        serviceOutDate: data.serviceOutDate
          ? data.serviceOutDate.slice(0, 16)
          : "",
        expectedDelivery: data.expectedDelivery
          ? data.expectedDelivery.slice(0, 16)
          : "",

        internalNotes: data.internalNotes || "",
        assignedMechanic: data.assignedMechanic || "",
        advancePaid: data.advancePaid || "",
      });

      setMechanicInput(data.assignedMechanic || "");
      setCostItems(data.serviceCostItems || []);
      setExistingMedia(data.mediaFiles || []);

      if (data.subService) {
        setSelectedSubService(data.subService); // 🔥 important
        setSubServiceInput(data.subService.name); // 🔥 important
        setForm((f) => ({
          ...f,
          subServiceId: data.subService.id,
        }));
      }
    };

    loadService();
  }, [id]);

  /* ================= COST UTILS ================= */

  const num = (v) => (Number.isFinite(+v) ? +v : 0);

  const totalAmount = costItems.reduce((sum, i) => {
    const itemTotal = num(i.quantity) * num(i.unitPrice);
    const cgstAmount = (itemTotal * num(i.cgstRate)) / 100;
    const sgstAmount = (itemTotal * num(i.sgstRate)) / 100;
    return sum + itemTotal + cgstAmount + sgstAmount;
  }, 0);

  const partsSubtotal = costItems
    .filter((item) => item.type === "part")
    .reduce((sum, i) => {
      const itemTotal = num(i.quantity) * num(i.unitPrice);
      const cgstAmount = (itemTotal * num(i.cgstRate)) / 100;
      const sgstAmount = (itemTotal * num(i.sgstRate)) / 100;
      return sum + itemTotal + cgstAmount + sgstAmount;
    }, 0);

  const laborSubtotal = costItems
    .filter((item) => item.type === "labor")
    .reduce((sum, i) => {
      const itemTotal = num(i.quantity) * num(i.unitPrice);
      const cgstAmount = (itemTotal * num(i.cgstRate)) / 100;
      const sgstAmount = (itemTotal * num(i.sgstRate)) / 100;
      return sum + itemTotal + cgstAmount + sgstAmount;
    }, 0);

  const cgstTotal = costItems.reduce((sum, i) => {
    const itemTotal = num(i.quantity) * num(i.unitPrice);
    return sum + (itemTotal * num(i.cgstRate)) / 100;
  }, 0);

  const sgstTotal = costItems.reduce((sum, i) => {
    const itemTotal = num(i.quantity) * num(i.unitPrice);
    return sum + (itemTotal * num(i.sgstRate)) / 100;
  }, 0);

  const discountAmount =
    discount.type === "amount"
      ? num(discount.value)
      : (totalAmount * num(discount.value)) / 100;

  const grandTotal = totalAmount - discountAmount;
  const balanceDue = grandTotal - (num(form.advancePaid) || 0);

  /* ================= HANDLERS ================= */

  const handleCostChange = (idx, field, value) => {
    const copy = [...costItems];
    copy[idx][field] = value;
    setCostItems(copy);
  };

  const addCostRow = () =>
    setCostItems((p) => [
      ...p,
      {
        type: "part",
        name: "",
        quantity: 1,
        unitPrice: "",
        cgstRate: "",
        sgstRate: "",
      },
    ]);

  const removeCostRow = (i) =>
    setCostItems((p) => p.filter((_, idx) => idx !== i));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setDiscount((d) => ({ ...d, [name]: value }));
  };

  const handleMechanicChange = (e) => {
    const { value } = e.target;
    setMechanicInput(value);
    setSelectedMechanic(null);
    setShowCreateMechanic(false);
  };

  // Create a new sub-service
  const createNewSubService = async () => {
    if (!subServiceInput.trim() || !form.categoryId) return;

    setCreatingSubService(true);
    try {
      const res = await apiRequest("/api/services/sub-services", {
        method: "POST",
        body: JSON.stringify({
          name: subServiceInput.trim(),
          categoryId: form.categoryId,
        }),
      });

      if (res.ok) {
        const newSubService = await res.json();
        setSelectedSubService(newSubService);
        setSubServiceInput(newSubService.name);
        setSubServiceSuggestions([...subServiceSuggestions, newSubService]);
        setShowCreateSubService(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create sub-service");
      }
    } catch (err) {
      console.error("Error creating sub-service:", err);
      setError(err.message || "Failed to create sub-service");
    } finally {
      setCreatingSubService(false);
    }
  };

  // Create a new mechanic
  const createNewMechanic = async () => {
    if (!mechanicInput.trim()) return;

    setCreatingMechanic(true);
    try {
      const res = await apiRequest("/api/mechanics", {
        method: "POST",
        body: JSON.stringify({
          name: mechanicInput.trim(),
        }),
      });

      if (res.ok) {
        const newMechanic = await res.json();
        setSelectedMechanic(newMechanic);
        setMechanicInput(newMechanic.name);
        setMechanicSuggestions([...mechanicSuggestions, newMechanic]);
        setShowCreateMechanic(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create mechanic");
      }
    } catch (err) {
      console.error("Error creating mechanic:", err);
      setError(err.message || "Failed to create mechanic");
    } finally {
      setCreatingMechanic(false);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.clientId) throw new Error("Please select a client.");
      if (!form.serviceInDate) {
        throw new Error("Please select service in date.");
      }

      const formData = new FormData();

      formData.append("clientId", form.clientId);
      formData.append("categoryId", form.categoryId);
      const toISO = (v) => (v ? new Date(v).toISOString() : "");

      formData.append("serviceInDate", toISO(form.serviceInDate));
      formData.append("serviceOutDate", toISO(form.serviceOutDate));
      formData.append("expectedDelivery", toISO(form.expectedDelivery));

      formData.append("notes", form.notes);
      formData.append("status", form.status);
      formData.append("priority", form.priority);
      // formData.append("serviceInDate", form.serviceInDate);
      // formData.append("serviceOutDate", form.serviceOutDate);
      // formData.append("expectedDelivery", form.expectedDelivery);
      formData.append("internalNotes", form.internalNotes);
      formData.append("assignedMechanic", mechanicInput);
      formData.append("cost", totalAmount.toFixed(2));
      formData.append("discount", discountAmount.toFixed(2));
      formData.append("advancePaid", form.advancePaid || "0");
      formData.append("balanceDue", balanceDue.toFixed(2));

      if (selectedSubService)
        formData.append("subServiceId", selectedSubService.id);
      else formData.append("subServiceName", subServiceInput);

      formData.append("costItems", JSON.stringify(costItems));

      media.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(
        `${API_BASE}${id ? `/api/services/${id}` : "/api/services"}`,
        {
          method: id ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save service");

      const serviceId = result?.service?.id ?? (id ? id : null);
      if (serviceId) {
        navigate("/billing/new", {
          state: {
            serviceId: serviceId,
          },
        });
      } else {
        navigate("/services");
      }
    } catch (err) {
      setError(err.message || "Error saving service");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div
      className={`min-h-screen ${
        isDark ? " text-gray-100" : "bg-gray-50 text-gray-900"
      } p-1 lg:ml-16`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold">
                {id ? "Edit Service" : "Add New Service"}
              </h1>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-500"
                } mt-1 text-sm`}
              >
                {selectedClient
                  ? `Service for ${selectedClient.fullName}`
                  : "Manage your service record easily"}
              </p>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <FiArrowLeft /> Back
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* Service Header with Client Info */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client & Vehicle Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FiUser /> Client
              </div>
              <select
                value={form.clientId}
                onChange={(e) => {
                  const clientId = e.target.value;
                  setForm((f) => ({ ...f, clientId }));
                  if (clientId) {
                    const client = clients.find(
                      (c) => c.id === parseInt(clientId),
                    );
                    setSelectedClient(client);
                  }
                }}
                className={`w-full rounded-lg border p-2 text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.regNumber})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <>
                  <div className="text-lg font-semibold">
                    {selectedClient.fullName}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <FaTruck /> {selectedClient.vehicleMake}{" "}
                    {selectedClient.vehicleModel}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedClient.regNumber}
                  </div>
                </>
              )}
            </div>

            {/* Service Status & Priority */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FiCheckCircle /> Status
              </div>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>

              <div className="flex items-center gap-2 text-sm font-medium mt-4">
                <FiAlertCircle /> Priority
              </div>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Service Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FiClock /> Timeline
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    In Date
                  </label>
                  <input
                    type="datetime-local"
                    name="serviceInDate"
                    value={form.serviceInDate}
                    onChange={handleChange}
                    className={`w-full rounded-lg border p-2 text-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Out Date
                  </label>
                  <input
                    type="datetime-local"
                    name="serviceOutDate"
                    value={form.serviceOutDate}
                    onChange={handleChange}
                    className={`w-full rounded-lg border p-2 text-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Expected Delivery
                </label>
                <input
                  type="datetime-local"
                  name="expectedDelivery"
                  value={form.expectedDelivery}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 text-sm ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl p-6 shadow-lg space-y-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Service Category Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold flex items-center gap-2">
                <FiTool /> Service Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className={`w-full rounded-lg border p-3 ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Mechanic */}
            <div className="space-y-1">
              <label className="font-semibold flex items-center gap-2">
                <GrUserWorker /> Assigned Mechanic
              </label>
              <div className="relative">
                <input
                  value={mechanicInput}
                  onChange={handleMechanicChange}
                  onFocus={() => {
                    if (mechanicInput.trim() === "") {
                      setMechanicSuggestions(mechanics);
                    }
                  }}
                  placeholder="Type mechanic name"
                  className={`w-full rounded-lg border p-3 ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />

                {mechanicSuggestions.length > 0 && (
                  <div
                    className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                      isDark ? "bg-gray-700" : "bg-white"
                    } border ${isDark ? "border-gray-600" : "border-gray-200"}`}
                  >
                    {mechanicSuggestions.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMechanic(m);
                          setMechanicInput(m.name);
                          setMechanicSuggestions([]);
                        }}
                        className={`p-3 cursor-pointer ${
                          isDark ? "hover:bg-gray-600" : "hover:bg-gray-100"
                        }`}
                      >
                        {m.name}
                      </div>
                    ))}

                    {mechanicInput.trim() !== "" &&
                      !mechanicSuggestions.some(
                        (m) =>
                          m.name.toLowerCase() === mechanicInput.toLowerCase(),
                      ) && (
                        <div
                          onClick={() => setShowCreateMechanic(true)}
                          className={`p-3 cursor-pointer border-t ${
                            isDark
                              ? "border-gray-600 hover:bg-gray-600"
                              : "border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FiPlus className="text-green-500" />
                            <span>Create "{mechanicInput.trim()}"</span>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUB-SERVICE TYPEAHEAD */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiTool /> Sub-Service
            </label>
            <div className="relative">
              <input
                value={subServiceInput}
                onChange={async (e) => {
                  const v = e.target.value;
                  setSubServiceInput(v);
                  setSelectedSubService(null);
                  setShowCreateSubService(false);

                  if (form.categoryId && v.trim() !== "") {
                    try {
                      const r = await apiRequest(
                        `/api/services/sub-services/search?categoryId=${
                          form.categoryId
                        }&q=${encodeURIComponent(v)}`,
                      );
                      const data = await r.json();
                      setSubServiceSuggestions(Array.isArray(data) ? data : []);
                    } catch (err) {
                      console.error("Error searching sub-services:", err);
                      setSubServiceSuggestions([]);
                    }
                  } else if (form.categoryId && v.trim() === "") {
                    try {
                      const r = await apiRequest(
                        `/api/services/sub-services/search?categoryId=${form.categoryId}`,
                      );
                      const data = await r.json();
                      setSubServiceSuggestions(Array.isArray(data) ? data : []);
                    } catch (err) {
                      console.error("Error fetching sub-services:", err);
                      setSubServiceSuggestions([]);
                    }
                  } else {
                    setSubServiceSuggestions([]);
                  }
                }}
                onFocus={() => {
                  if (form.categoryId && subServiceInput.trim() === "") {
                    apiRequest(
                      `/api/services/sub-services/search?categoryId=${form.categoryId}`,
                    )
                      .then((r) => r.json())
                      .then((data) =>
                        setSubServiceSuggestions(
                          Array.isArray(data) ? data : [],
                        ),
                      )
                      .catch((err) => {
                        console.error("Error fetching sub-services:", err);
                        setSubServiceSuggestions([]);
                      });
                  }
                }}
                placeholder="Type sub-service name"
                className={`w-full rounded-lg border p-3 ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              />

              {subServiceSuggestions.length > 0 && (
                <div
                  className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                    isDark ? "bg-gray-700" : "bg-white"
                  } border ${isDark ? "border-gray-600" : "border-gray-200"}`}
                >
                  {subServiceSuggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSubService(s);
                        setSubServiceInput(s.name);
                        setSubServiceSuggestions([]);
                      }}
                      className={`p-3 cursor-pointer ${
                        isDark ? "hover:bg-gray-600" : "hover:bg-gray-100"
                      }`}
                    >
                      {s.name}
                    </div>
                  ))}

                  {subServiceInput.trim() !== "" &&
                    !subServiceSuggestions.some(
                      (s) =>
                        s.name.toLowerCase() === subServiceInput.toLowerCase(),
                    ) && (
                      <div
                        onClick={() => setShowCreateSubService(true)}
                        className={`p-3 cursor-pointer border-t ${
                          isDark
                            ? "border-gray-600 hover:bg-gray-600"
                            : "border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FiPlus className="text-green-500" />
                          <span>Create "{subServiceInput.trim()}"</span>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiEdit3 /> Internal Notes (Staff Only)
            </label>
            <textarea
              name="internalNotes"
              rows={3}
              placeholder="Enter internal notes or special instructions..."
              value={form.internalNotes}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 resize-none ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          </div>

          {/* COST BREAKDOWN - REDESIGNED */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl flex items-center gap-2">
              <FaIndianRupeeSign /> Cost Breakdown
            </h3>

            <div className="space-y-3">
              {costItems.map((row, i) => {
                const itemTotal = num(row.quantity) * num(row.unitPrice);
                const cgstAmount = (itemTotal * num(row.cgstRate)) / 100;
                const sgstAmount = (itemTotal * num(row.sgstRate)) / 100;
                const rowTotal = itemTotal + cgstAmount + sgstAmount;

                return (
                  <div
                    key={i}
                    className={`rounded-lg overflow-hidden shadow-md ${
                      isDark ? "bg-gray-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              isDark ? "bg-gray-600" : "bg-gray-100"
                            }`}
                          >
                            <FiPackage
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            />
                          </div>
                          <span className="font-medium">Item #{i + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCostRow(i)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        {/* Item Type */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Type
                          </label>
                          <select
                            value={row.type}
                            onChange={(e) =>
                              handleCostChange(i, "type", e.target.value)
                            }
                            className={`w-full p-2 rounded-lg border text-sm ${
                              isDark
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <option value="part">Part</option>
                            <option value="labor">Labor</option>
                          </select>
                        </div>

                        {/* Item Name - Only show for parts */}
                        {row.type === "part" && (
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-500 block mb-1">
                              Name
                            </label>
                            <input
                              placeholder="Item name"
                              value={row.name}
                              onChange={(e) =>
                                handleCostChange(i, "name", e.target.value)
                              }
                              className={`w-full p-2 rounded-lg border text-sm ${
                                isDark
                                  ? "bg-gray-800 border-gray-600"
                                  : "bg-white border-gray-200"
                              }`}
                            />
                          </div>
                        )}

                        {/* Quantity */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) =>
                              handleCostChange(i, "quantity", e.target.value)
                            }
                            className={`w-full p-2 rounded-lg border text-sm ${
                              isDark
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          />
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={row.unitPrice}
                            onChange={(e) =>
                              handleCostChange(i, "unitPrice", e.target.value)
                            }
                            className={`w-full p-2 rounded-lg border text-sm ${
                              isDark
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          />
                        </div>

                        {/* CGST Rate */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            CGST %
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={row.cgstRate}
                            onChange={(e) =>
                              handleCostChange(i, "cgstRate", e.target.value)
                            }
                            className={`w-full p-2 rounded-lg border text-sm ${
                              isDark
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          />
                        </div>

                        {/* SGST Rate */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            SGST %
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={row.sgstRate}
                            onChange={(e) =>
                              handleCostChange(i, "sgstRate", e.target.value)
                            }
                            className={`w-full p-2 rounded-lg border text-sm ${
                              isDark
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Row Total */}
                      <div
                        className={`mt-3 p-2 rounded-lg flex justify-between items-center ${
                          isDark ? "bg-gray-600" : "bg-gray-100"
                        }`}
                      >
                        <span className="font-medium text-sm">Total</span>
                        <span className="text-lg font-bold text-green-500">
                          ₹{rowTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addCostRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md"
              >
                <FiPlus /> Add Item
              </button>
            </div>
          </div>

          {/* BILLING SUMMARY - HIGHLIGHTED PANEL */}
          <div
            className={`p-6 rounded-xl border-2 border-green-500 ${
              isDark ? "bg-gray-900" : "bg-green-50"
            }`}
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FiDollarSign /> Billing Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Parts Subtotal</span>
                  <span className="font-medium">
                    ₹{partsSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor Subtotal</span>
                  <span className="font-medium">
                    ₹{laborSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST Total</span>
                  <span className="font-medium">₹{cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST Total</span>
                  <span className="font-medium">₹{sgstTotal.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Paid</span>
                    <span className="font-medium">
                      ₹{num(form.advancePaid || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Grand Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Balance Due</span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold">Discount Type</label>
              <select
                name="type"
                value={discount.type}
                onChange={handleDiscountChange}
                className={`w-full rounded-lg border p-3 ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <option value="amount">Fixed Amount</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Discount Value</label>
              <input
                type="number"
                name="value"
                value={discount.value}
                onChange={handleDiscountChange}
                placeholder="0.00"
                className={`w-full rounded-lg border p-3 ${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Advance Paid */}
          <div className="space-y-1">
            <label className="font-semibold">Advance Paid</label>
            <input
              type="number"
              name="advancePaid"
              value={form.advancePaid}
              onChange={handleChange}
              placeholder="0.00"
              className={`w-full rounded-lg border p-3 ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="font-semibold flex items-center gap-2">
              <FiUpload /> Upload Media (Images/Files)
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              capture="environment" // 🔥 opens rear camera on mobile
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setMedia((prev) => [...prev, ...files]);
              }}
              className={`w-full rounded-lg border p-3 ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />

            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {media.map((file, index) => (
                  <div
                    key={index}
                    className="relative group border p-1 rounded-lg"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMedia((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 hover:opacity-100"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Actions Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Invoice Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiSave /> Save as Draft
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiSend /> Send Invoice
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiDownload /> Preview Invoice
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              <FiSave />{" "}
              {loading ? "Saving..." : id ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>

      {/* Create Sub-Service Modal */}
      {showCreateSubService && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            isDark ? "bg-black bg-opacity-50" : "bg-black bg-opacity-50"
          }`}
        >
          <div
            className={`w-full max-w-md p-6 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Create New Sub-Service</h3>
            <div className="mb-4">
              <p className="text-sm mb-2">
                Are you sure you want to create a new sub-service named "
                {subServiceInput.trim()}"?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateSubService(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createNewSubService}
                disabled={creatingSubService}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  creatingSubService
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {creatingSubService ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Mechanic Modal */}
      {showCreateMechanic && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            isDark ? "bg-black bg-opacity-50" : "bg-black bg-opacity-50"
          }`}
        >
          <div
            className={`w-full max-w-md p-6 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Create New Mechanic</h3>
            <div className="mb-4">
              <p className="text-sm mb-2">
                Are you sure you want to create a new mechanic named "
                {mechanicInput.trim()}"?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateMechanic(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createNewMechanic}
                disabled={creatingMechanic}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  creatingMechanic
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {creatingMechanic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
