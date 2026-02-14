import React, { useState } from "react";
import { X, User, Mail, Phone, MapPin, IndianRupee, Briefcase } from "lucide-react";

const AddEditStaffModal = ({ staff, staffList = [], onClose, onSave, isDark }) => {
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

  // Only check while ADDING (not editing)
  if (!staff) {
    const exists = staffList.some(s =>
      s.name?.toLowerCase() === formData.name.toLowerCase() &&
      s.email?.toLowerCase() === formData.email.toLowerCase()
    );

    if (exists) {
      alert("Staff with same name and email already exists");
      return;
    }
  }

  onSave({
    ...formData,
    annualSalary: Number(formData.annualSalary),
  });
};


  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
          isDark ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-white"
        }`}
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 backdrop-blur-xl border-b px-6 py-5 flex items-center justify-between ${
            isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"
          }`}
        >
          <div>
            <h3
              className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
            >
              {staff ? "Edit Staff Member" : "Add New Staff Member"}
            </h3>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {staff ? "Update employee information" : "Add a new team member"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95 ${
              isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <User size={16} className="text-blue-500" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="Enter full name"
              />
            </div>

            {/* Role */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Briefcase size={16} className="text-purple-500" />
                Role *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="e.g., Mechanic, Manager"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Mail size={16} className="text-emerald-500" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Phone size={16} className="text-orange-500" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Annual Salary */}
            <div className="md:col-span-2 group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <IndianRupee size={16} className="text-green-500" />
                Annual Salary (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.annualSalary}
                onChange={(e) => handleChange("annualSalary", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="Enter annual salary"
              />
              <div
                className={`mt-2 p-3 rounded-lg ${
                  isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-700"
                }`}
              >
                <p className="text-sm font-medium">
                  Monthly: ₹
                  {formData.annualSalary
                    ? (formData.annualSalary / 12).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })
                    : "0"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <MapPin size={16} className="text-red-500" />
                Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group relative flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative">{staff ? "Update Staff" : "Add Staff"}</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AddEditStaffModal;