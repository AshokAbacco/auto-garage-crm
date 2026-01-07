import React, { useState } from "react";
import { X } from "lucide-react";

const AddEditStaffModal = ({ staff, onClose, onSave, isDark }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    address: staff?.address || "",
    annualSalary: staff?.annualSalary || "",
    role: staff?.role || "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      annualSalary: Number(formData.annualSalary),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-xl font-bold transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </h3>
          <button
            onClick={onClose}
            className={`transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter full name"
              />
            </div>

            {/* Role */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Role *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="e.g., Mechanic, Manager"
              />
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Annual Salary */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Annual Salary (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.annualSalary}
                onChange={(e) => handleChange("annualSalary", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter annual salary"
              />
              <p
                className={`text-xs mt-1 transition-colors duration-300 ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Monthly: ₹
                {formData.annualSalary
                  ? (formData.annualSalary / 12).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </p>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Buttons */}
          <div
            className={`flex gap-3 pt-6 border-t transition-colors duration-300 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {staff ? "Update Staff" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditStaffModal;