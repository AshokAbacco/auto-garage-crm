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
} from "react-icons/fi";
import { GrUserWorker } from "react-icons/gr";
import { FaIndianRupeeSign } from "react-icons/fa6";

import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      partName: "",
      partCost: "",
      partGst: "",
      laborCost: "",
      laborGst: "",
    },
  ]);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [media, setMedia] = useState([]);

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

  // Load sub-services when category changes
  useEffect(() => {
    if (form.categoryId) {
      const loadSubServices = async () => {
        try {
          const r = await apiRequest(
            `/api/services/sub-services/search?categoryId=${form.categoryId}`
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
    if (!id) return; // Fixed: Added early return when no id

    const loadService = async () => {
      try {
        const res = await apiRequest(`/api/services/${id}`);

        // Check if response is ok before trying to parse JSON
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load service");
        }

        const data = await res.json();

        // Debug log to see what we're getting
        console.log("Service data:", data);

        setForm({
          clientId: data.client?.id || "",
          categoryId: data.category?.id || "",
          date: data.date ? new Date(data.date).toISOString().slice(0, 10) : "",
          notes: data.notes || "",
          status: data.status || "Pending",
        });

        // Load cost items if they exist
        if (data.costItems && Array.isArray(data.costItems)) {
          setCostItems(data.costItems);
        }

        // Load sub-service if it exists
        if (data.subService) {
          setSelectedSubService({
            id: data.subService.id,
            name: data.subService.name,
          });
          setSubServiceInput(data.subService.name || "");
        }

        // Load client data
        if (data.client?.id) {
          const clientRes = await apiRequest(`/api/clients/${data.client.id}`);
          const clientData = await clientRes.json();
          if (clientRes.ok) setSelectedClient(clientData);
        }
      } catch (err) {
        console.error("Error loading service:", err);
        setError(err.message);
      }
    };
    loadService();
  }, [id]); // Fixed: Added id dependency

  /* ================= COST UTILS ================= */

  const num = (v) => (Number.isFinite(+v) ? +v : 0);

  const totalAmount = costItems.reduce((sum, i) => {
    const part = num(i.partCost) + (num(i.partCost) * num(i.partGst)) / 100;
    const labor = num(i.laborCost) + (num(i.laborCost) * num(i.laborGst)) / 100;
    return sum + part + labor;
  }, 0);

  /* ================= HANDLERS ================= */

  const handleCostChange = (idx, field, value) => {
    const copy = [...costItems];
    copy[idx][field] = value;
    setCostItems(copy);
  };

  const addCostRow = () =>
    setCostItems((p) => [
      ...p,
      { partName: "", partCost: "", partGst: "", laborCost: "", laborGst: "" },
    ]);

  const removeCostRow = (i) =>
    setCostItems((p) => p.filter((_, idx) => idx !== i));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.clientId) throw new Error("Please select a client.");
      if (!form.date) throw new Error("Please select a date.");

      const formData = new FormData();

      formData.append("clientId", form.clientId);
      formData.append("categoryId", form.categoryId);
      formData.append("date", form.date);
      formData.append("notes", form.notes);
      formData.append("status", form.status);
      formData.append("cost", totalAmount.toFixed(2));

      if (selectedSubService)
        formData.append("subServiceId", selectedSubService.id);
      else formData.append("subServiceName", subServiceInput);

      formData.append("costItems", JSON.stringify(costItems));

      media.forEach((m) => formData.append("media", m));

      const res = await fetch(
        `${API_BASE}${id ? `/api/services/${id}` : "/api/services"}`,
        {
          method: id ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save service");

      const serviceId = result?.service?.id ?? (id ? id : null);
      if (serviceId) {
        // Navigate to billing form with service data
        navigate("/billing/new", {
          state: {
            serviceData: {
              id: serviceId,
              clientId: form.clientId,
              vehicle: `${selectedClient?.vehicleMake || ""} ${
                selectedClient?.vehicleModel || ""
              }`,
              serviceType: form.categoryId
                ? categories.find((c) => c.id === parseInt(form.categoryId))
                    ?.name
                : "",
              serviceCategory: form.categoryId
                ? categories.find((c) => c.id === parseInt(form.categoryId))
                    ?.name
                : "",
              serviceSubCategory: selectedSubService?.name || "",
              serviceNotes: form.notes,
              partsCost: totalAmount,
              partsGst: 0, // Calculate if needed
              laborCost: 0, // Calculate if needed
              laborGst: 0, // Calculate if needed
              costItems: costItems,
            },
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
      <div className="max-w-5xl mx-auto space-y-6">
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
                  ? `Adding service for ${selectedClient.fullName}`
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl p-6 shadow-lg space-y-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Client */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiUser /> Client
            </label>
            {selectedClient ? (
              <div
                className={`w-full rounded-lg border p-3 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              >
                {selectedClient.fullName} ({selectedClient.regNumber})
              </div>
            ) : (
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
                className={`w-full rounded-lg border p-3 ${
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
            )}
          </div>

          {/* Date */}
          <InputField
            label="Date"
            icon={<FiCalendar />}
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            isDark={isDark}
            required
          />

          {/* Category */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiTool /> Service Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
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

          {/* SUB-SERVICE TYPEAHEAD - COMPLETE VERSION */}
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

                  // Only search if we have a category
                  if (form.categoryId && v.trim() !== "") {
                    try {
                      const r = await apiRequest(
                        `/api/services/sub-services/search?categoryId=${
                          form.categoryId
                        }&q=${encodeURIComponent(v)}`
                      );
                      const data = await r.json();
                      setSubServiceSuggestions(Array.isArray(data) ? data : []);
                    } catch (err) {
                      console.error("Error searching sub-services:", err);
                      setSubServiceSuggestions([]);
                    }
                  } else if (form.categoryId && v.trim() === "") {
                    // If input is empty but we have a category, show all sub-services
                    try {
                      const r = await apiRequest(
                        `/api/services/sub-services/search?categoryId=${form.categoryId}`
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
                  // Load all sub-services for category when field is focused
                  if (form.categoryId && subServiceInput.trim() === "") {
                    apiRequest(
                      `/api/services/sub-services/search?categoryId=${form.categoryId}`
                    )
                      .then((r) => r.json())
                      .then((data) =>
                        setSubServiceSuggestions(
                          Array.isArray(data) ? data : []
                        )
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

                  {/* Add option to create new sub-service if no exact match */}
                  {subServiceInput.trim() !== "" &&
                    !subServiceSuggestions.some(
                      (s) =>
                        s.name.toLowerCase() === subServiceInput.toLowerCase()
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
                <h3 className="text-xl font-bold mb-4">
                  Create New Sub-Service
                </h3>
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

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiFileText /> Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Enter additional notes or details..."
              value={form.notes}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 resize-none ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="font-semibold">Upload Media (Images/Files)</label>

            <input
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setMedia((prev) => [...prev, ...files]);
              }}
              className={`w-full rounded-lg border p-3 ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            />

            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
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
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COST BREAKDOWN - COMPACT DESIGN */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl flex items-center gap-2">
              <FaIndianRupeeSign /> Cost Breakdown
            </h3>

            <div className="space-y-3">
              {costItems.map((row, i) => {
                const partTotal =
                  num(row.partCost) +
                  (num(row.partCost) * num(row.partGst)) / 100;
                const laborTotal =
                  num(row.laborCost) +
                  (num(row.laborCost) * num(row.laborGst)) / 100;
                const rowTotal = partTotal + laborTotal;

                return (
                  <div
                    key={i}
                    className={`rounded-lg overflow-hidden shadow-md ${
                      isDark ? "bg-gray-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? "bg-gray-600" : "bg-gray-100"
                            }`}
                          >
                            <FiPackage
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            />
                          </div>
                          <span className="font-medium text-sm">
                            Item #{i + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCostRow(i)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>

                      <div className="mb-2">
                        <input
                          placeholder="Part Name"
                          value={row.partName}
                          onChange={(e) =>
                            handleCostChange(i, "partName", e.target.value)
                          }
                          className={`w-full p-2 rounded-lg border text-sm ${
                            isDark
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-gray-50 border-gray-200"
                          } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Parts Section */}
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-gray-800" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <FiPackage className="text-green-500" size={14} />
                            <h4 className="font-medium text-sm">Parts</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Cost
                              </label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={row.partCost}
                                onChange={(e) =>
                                  handleCostChange(
                                    i,
                                    "partCost",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-1.5 rounded-lg border text-sm ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-200"
                                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                GST %
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={row.partGst}
                                onChange={(e) =>
                                  handleCostChange(i, "partGst", e.target.value)
                                }
                                className={`w-full p-1.5 rounded-lg border text-sm ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-200"
                                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                              />
                            </div>
                          </div>
                          <div
                            className={`mt-2 p-1.5 rounded-lg flex justify-between items-center ${
                              isDark ? "bg-gray-600" : "bg-gray-100"
                            }`}
                          >
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-sm font-medium text-green-500">
                              ₹{partTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Labor Section */}
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-gray-800" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <GrUserWorker className="text-blue-500" size={14} />
                            <h4 className="font-medium text-sm">Labor</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Cost
                              </label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={row.laborCost}
                                onChange={(e) =>
                                  handleCostChange(
                                    i,
                                    "laborCost",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-1.5 rounded-lg border text-sm ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-200"
                                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                GST %
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={row.laborGst}
                                onChange={(e) =>
                                  handleCostChange(
                                    i,
                                    "laborGst",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-1.5 rounded-lg border text-sm ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-200"
                                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-all`}
                              />
                            </div>
                          </div>
                          <div
                            className={`mt-2 p-1.5 rounded-lg flex justify-between items-center ${
                              isDark ? "bg-gray-600" : "bg-gray-100"
                            }`}
                          >
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-sm font-medium text-blue-500">
                              ₹{laborTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row Total */}
                      <div
                        className={`mt-2 p-2 rounded-lg flex justify-between items-center ${
                          isDark ? "bg-gray-600" : "bg-gray-100"
                        }`}
                      >
                        <span className="font-medium text-sm">Item Total</span>
                        <span className="text-lg font-bold text-green-500">
                          ₹{rowTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Item Button - Moved to Bottom */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addCostRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md"
              >
                <FiPlus /> Add Item
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiCheckCircle /> Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`rounded-lg border p-3 text-sm ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* TOTAL */}
          <div
            className={`p-6 rounded-xl ${
              isDark
                ? "bg-gradient-to-r from-gray-700 to-gray-600"
                : "bg-gradient-to-r from-gray-50 to-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-green-500">
                ₹{totalAmount.toFixed(2)}
              </span>
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
    </div>
  );
}

/* Helper Input Component */
function InputField({
  label,
  icon,
  name,
  type = "text",
  value,
  onChange,
  isDark,
  required,
}) {
  return (
    <div className="space-y-1">
      <label className="font-semibold flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border p-3 ${
          isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
        }`}
      />
    </div>
  );
}
