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
} from "react-icons/fi";
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

  // Add partsGst and laborGst; default status to "Pending"
  const [form, setForm] = useState({
    clientId: "",
    categoryId: "",
    subServiceId: "",
    notes: "",
    date: "",
    partsCost: "",
    partsGst: "", // percentage, e.g., 18
    laborCost: "",
    laborGst: "", // percentage
    status: "Pending", // changed from Unpaid
  });

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [media, setMedia] = useState([]);//media attachments support


  // ✅ Load clients list
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

  // ✅ Load service categories & sub-services
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

  // ✅ When a category changes, filter sub-services
  useEffect(() => {
    if (form.categoryId) {
      const selected = categories.find((cat) => cat.id === Number(form.categoryId));
      setSubServices(selected?.subServices || []);
    } else {
      setSubServices([]);
    }
  }, [form.categoryId, categories]);

  // ✅ When navigated from client page
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

  // ✅ Handle editing (populate form). Keep existing values if present.
  useEffect(() => {
    if (id) {
      const loadService = async () => {
        const res = await apiRequest(`/api/services/${id}`);
        const data = await res.json();
        if (res.ok) {
          // ensure new fields are present (fallback to 0 / empty)
          setForm((prev) => ({
            ...prev,
            ...data,
            categoryId: data.categoryId ?? "",
            subServiceId: data.subServiceId ?? "",
            partsCost: data.partsCost != null ? String(data.partsCost) : "",
            laborCost: data.laborCost != null ? String(data.laborCost) : "",
            partsGst: data.partsGst != null ? String(data.partsGst) : "",
            laborGst: data.laborGst != null ? String(data.laborGst) : "",
            status: data.status ?? "Pending",
            date: data.date ? new Date(data.date).toISOString().slice(0, 10) : prev.date,
            notes: data.notes ?? "",
            clientId: data.clientId ?? prev.clientId,
          }));
          if (data.clientId) {
            const clientRes = await apiRequest(`/api/clients/${data.clientId}`);
            const clientData = await clientRes.json();
            if (clientRes.ok) setSelectedClient(clientData);
          }
        } else {
          console.error("Failed to load service for editing:", data);
        }
      };
      loadService();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // helper to parse numeric fields safely
  const toNumber = (v) => {
    const n = parseFloat(String(v).replace(",", ""));
    return Number.isFinite(n) ? n : 0;
  };

  // ✅ Estimated total calculation (including GST %)
  const estimatedTotal = (() => {
    const pCost = toNumber(form.partsCost);
    const lCost = toNumber(form.laborCost);
    const pGst = toNumber(form.partsGst);
    const lGst = toNumber(form.laborGst);

    const partsWithGst = pCost + (pCost * pGst) / 100;
    const laborWithGst = lCost + (lCost * lGst) / 100;

    return partsWithGst + laborWithGst;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // keep numeric inputs free-form but store as string (so user can type)
    setForm((f) => ({ ...f, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     // basic validation
  //     if (!form.clientId) throw new Error("Please select a client.");
  //     if (!form.date) throw new Error("Please select a date.");

  //     const payload = {
  //       ...form,
  //       clientId: Number(form.clientId),
  //       categoryId: form.categoryId ? Number(form.categoryId) : null,
  //       subServiceId: form.subServiceId ? Number(form.subServiceId) : null,
  //       partsCost: toNumber(form.partsCost),
  //       laborCost: toNumber(form.laborCost),
  //       partsGst: toNumber(form.partsGst),
  //       laborGst: toNumber(form.laborGst),
  //       // send estimated total as `cost` so backend stores it consistently
  //       cost: Number(estimatedTotal.toFixed(2)),
  //     };

  //     // const res = await apiRequest(id ? `/api/services/${id}` : "/api/services", {
  //     //   method: id ? "PUT" : "POST",
  //     //   body: JSON.stringify(payload),
  //     // });

  //     // const result = await res.json();
  //     // if (!res.ok) throw new Error(result.message || "Failed to save service");
  //     // ✅ Build FormData
  //     const formData = new FormData();

  //     Object.entries(payload).forEach(([key, value]) => {
  //       if (value !== null && value !== undefined) {
  //         formData.append(key, value);
  //       }
  //     });

  //     // ✅ Attach uploaded files
  //     media.forEach((file) => {
  //       formData.append("media", file);
  //     });

  //     const res = await fetch(
  //       `${API_BASE}${id ? `/api/services/${id}` : "/api/services"}`,
  //       {
  //         method: id ? "PUT" : "POST",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           // ✅ Do NOT set Content-Type
  //         },
  //         body: formData,
  //       }
  //     );

  //     const result = await res.json();
  //     if (!res.ok) throw new Error(result.message || "Failed to save service");


  //     // in case backend returns created/updated service location
  //     const serviceId = result?.service?.id ?? (id ? id : null);
  //     if (serviceId) navigate(`/services/${serviceId}`);
  //     else navigate("/services");
  //   } catch (err) {
  //     setError(err.message || "Error saving service");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.clientId) throw new Error("Please select a client.");
      if (!form.date) throw new Error("Please select a date.");

      const payload = {
        ...form,
        clientId: Number(form.clientId),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        subServiceId: form.subServiceId ? Number(form.subServiceId) : null,
        partsCost: toNumber(form.partsCost),
        laborCost: toNumber(form.laborCost),
        partsGst: toNumber(form.partsGst),
        laborGst: toNumber(form.laborGst),
        cost: Number(estimatedTotal.toFixed(2)),
      };

      // ✅ Build FormData instead of JSON
      const formData = new FormData();

      // ✅ Append text fields first
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // ✅ Append images/files
      media.forEach((file) => {
        formData.append("media", file);
      });

      // ✅ Send using fetch not apiRequest (because apiRequest forces JSON header)
      const res = await fetch(
        `${API_BASE}${id ? `/api/services/${id}` : "/api/services"}`,
        {
          method: id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // ✅ DO NOT set "Content-Type"
          },
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save service");


      const serviceId = result?.service?.id ?? (id ? id : null);
      if (serviceId) navigate(`/services/${serviceId}`);
      else navigate("/services");
    } catch (err) {
      setError(err.message || "Error saving service");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        } p-6 lg:ml-16`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold">
                {id ? "Edit Service" : "Add New Service"}
              </h1>
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mt-1 text-sm`}>
                {selectedClient
                  ? `Adding service for ${selectedClient.fullName}`
                  : "Manage your service record easily"}
              </p>
            </div>
            <Link to="/services" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
              <FiArrowLeft /> Back
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-red-100 text-red-700 border border-red-300 rounded-xl p-4">{error}</div>}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6 ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          {/* Client */}
          <div className="space-y-1 md:col-span-2">
            <label className="font-semibold flex items-center gap-2">
              <FiUser /> Client
            </label>
            {selectedClient ? (
              <div className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-800"}`}>
                {selectedClient.fullName} ({selectedClient.regNumber})
              </div>
            ) : (
              <select
                name="clientId"
                value={form.clientId}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
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
          <InputField label="Date" icon={<FiCalendar />} name="date" type="date" value={form.date} onChange={handleChange} isDark={isDark} required />

          {/* Category */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiTool /> Service Category
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Service */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiTool /> Sub-Service
            </label>
            <select
              name="subServiceId"
              value={form.subServiceId}
              onChange={handleChange}
              disabled={!form.categoryId}
              className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
            >
              <option value="">Select Sub-Service</option>
              {subServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiFileText /> Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Enter additional notes or details..."
              value={form.notes}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 resize-none ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
            />
          </div>



          {/* Media Upload */}
          <div className="md:col-span-2 space-y-3">
            <label className="font-semibold">Upload Media (Images/Files)</label>

            {/* File picker + camera */}
            <input
              type="file"
              multiple
              accept="image/*"
              capture="environment"    // ✅ opens camera on mobile
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setMedia((prev) => [...prev, ...files]);
              }}
              className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
            />

            {/* Preview Grid */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {media.map((file, index) => (
                  <div key={index} className="relative group border p-1 rounded-lg">
                    {/* Thumbnail */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />

                    {/* Remove Button */}
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



          {/* Parts Section */}
          <div className="md:col-span-2 rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FiDollarSign /> Parts
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-500">Parts Cost</label>
                <input
                  type="number"
                  name="partsCost"
                  value={form.partsCost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Parts GST (%)</label>
                <input
                  type="number"
                  name="partsGst"
                  value={form.partsGst}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 18"
                  className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <div>Subtotal: ₹{toFixedSafe(form.partsCost)}</div>
                  <div>With GST: ₹{(toFixedSafe(form.partsCost) * (1 + (toNumber(form.partsGst) / 100))).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Section */}
          <div className="md:col-span-2 rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FiTool /> Labor
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-500">Labor Cost</label>
                <input
                  type="number"
                  name="laborCost"
                  value={form.laborCost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Labor GST (%)</label>
                <input
                  type="number"
                  name="laborGst"
                  value={form.laborGst}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 18"
                  className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <div>Subtotal: ₹{toFixedSafe(form.laborCost)}</div>
                  <div>With GST: ₹{(toFixedSafe(form.laborCost) * (1 + (toNumber(form.laborGst) / 100))).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status (removed Paid option; only Pending and Processing) */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FiCheckCircle /> Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`rounded-lg border p-3 text-sm ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>


          </div>

          {/* Estimated Total Display */}
          <div className="flex items-center justify-between md:col-span-2 mt-4 border-t pt-4">
            <p className="font-semibold text-lg">Estimated Total:</p>
            <p className="font-bold text-green-500 text-xl">₹{estimatedTotal.toFixed(2)}</p>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              <FiSave /> {loading ? "Saving..." : id ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Helper Input Component */
function InputField({ label, icon, name, type = "text", value, onChange, isDark, required }) {
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
        className={`w-full rounded-lg border p-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
      />
    </div>
  );
}

/* utility: safe toFixed for strings/empties */
function toFixedSafe(val) {
  const n = parseFloat(String(val).replace(",", ""));
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

/* utility used inside render (can't be referenced before) */
function toNumber(v) {
  const n = parseFloat(String(v).replace(",", ""));
  return Number.isFinite(n) ? n : 0;
}
