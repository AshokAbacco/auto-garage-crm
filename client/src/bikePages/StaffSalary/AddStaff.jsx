import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";

const DAYS_IN_YEAR = 365;

const calculatePerDaySalary = (annualSalary) => {
  if (!annualSalary) return 0;
  return annualSalary / DAYS_IN_YEAR;
};

const calculateDeductions = (annualSalary, leaves) => {
  if (!annualSalary || !leaves) return 0;
  const perDay = calculatePerDaySalary(annualSalary);
  return Math.round(perDay * leaves);
};

const AddSalaryModal = ({ salary, onClose, onSave, isDark }) => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    staffId: salary?.staffId || "",
    bonus: salary?.bonus || 0,
    leaves: salary?.leaves || 0,
  });
  const [selectedStaffData, setSelectedStaffData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (formData.staffId) {
      const staff = staffList.find((s) => s.id === Number(formData.staffId));
      setSelectedStaffData(staff);
    } else {
      setSelectedStaffData(null);
    }
  }, [formData.staffId, staffList]);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/api/staff");
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch staff error:", err);
      toast.error("Failed to load staff list");
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffId) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        staffId: Number(formData.staffId),
        annualSalary: selectedStaffData?.annualSalary || 0,
        bonus: Number(formData.bonus),
        leaves: Number(formData.leaves),
        deductions: calculateDeductions(
          selectedStaffData?.annualSalary || 0,
          formData.leaves
        ),
        status: "pending",
      };

      if (salary) {
        await api.put(`/api/bike-staff-salary/${salary.id}`, payload);
        toast.success("Salary entry updated successfully");
      } else {
        await api.post("/api/bike-staff-salary", payload);
        toast.success("Salary entry added successfully");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Save salary error:", err);
      toast.error(err.response?.data?.message || "Failed to save salary entry");
    } finally {
      setLoading(false);
    }
  };

  const perDaySalary = selectedStaffData
    ? calculatePerDaySalary(selectedStaffData.annualSalary)
    : 0;
  const deductions = selectedStaffData
    ? calculateDeductions(selectedStaffData.annualSalary, formData.leaves)
    : 0;
  const monthlySalary = selectedStaffData
    ? selectedStaffData.annualSalary / 12
    : 0;
  const netSalary = monthlySalary + Number(formData.bonus) - deductions;

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
            {salary ? "Edit Salary Entry" : "Add Salary Entry"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Staff Selection */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Select Staff Member *
            </label>
            <div className="relative">
              <select
                required
                value={formData.staffId}
                onChange={(e) => handleChange("staffId", e.target.value)}
                disabled={!!salary}
                className={`w-full appearance-none border rounded-lg px-4 py-3 pr-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${salary ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.role}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-300 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
                size={18}
              />
            </div>
            {salary && (
              <p
                className={`text-xs mt-1 transition-colors duration-300 ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Staff cannot be changed when editing
              </p>
            )}
          </div>

          {/* Staff Details (Auto-populated) */}
          {selectedStaffData && (
            <div
              className={`p-4 rounded-lg border space-y-3 transition-colors duration-300 ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h4
                className={`font-semibold transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Staff Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p
                    className={`transition-colors duration-300 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Role
                  </p>
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedStaffData.role}
                  </p>
                </div>
                <div>
                  <p
                    className={`transition-colors duration-300 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Annual Salary
                  </p>
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹{selectedStaffData.annualSalary.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className={`transition-colors duration-300 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Monthly Salary
                  </p>
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹{monthlySalary.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p
                    className={`transition-colors duration-300 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Per Day Salary
                  </p>
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹{perDaySalary.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Salary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bonus */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Bonus (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonus}
                onChange={(e) => handleChange("bonus", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter bonus amount"
              />
            </div>

            {/* Leaves Taken */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Leaves Taken (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.leaves}
                onChange={(e) => handleChange("leaves", e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter number of leaves"
              />
            </div>

            {/* Leave Deduction (Read-only) */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Leave Deduction (₹)
              </label>
              <input
                type="text"
                value={`₹${deductions.toLocaleString()}`}
                readOnly
                className={`w-full border rounded-lg px-4 py-2.5 cursor-not-allowed transition-colors duration-300 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                }`}
              />
            </div>

            {/* Net Salary (Calculated) */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Net Salary (₹)
              </label>
              <input
                type="text"
                value={`₹${netSalary.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`}
                readOnly
                className={`w-full border rounded-lg px-4 py-2.5 font-bold cursor-not-allowed transition-colors duration-300 ${
                  isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              />
            </div>
          </div>

          {/* Calculation Note */}
          {selectedStaffData && (
            <div
              className={`p-3 rounded-lg text-xs transition-colors duration-300 ${
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <p className="font-medium mb-1">Calculation Method:</p>
              <p>
                Net Salary = Monthly Salary (₹
                {monthlySalary.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
                ) + Bonus (₹{Number(formData.bonus).toLocaleString()}) - Leave
                Deduction (₹{deductions.toLocaleString()})
              </p>
              <p className="mt-1">
                Leave Deduction = Per Day Salary (₹{perDaySalary.toFixed(2)}) ×
                Leaves ({formData.leaves})
              </p>
            </div>
          )}

          {/* Buttons */}
          <div
            className={`flex gap-3 pt-6 border-t transition-colors duration-300 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.staffId}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ${
                loading || !formData.staffId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Saving..." : salary ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalaryModal;