import React, { useState, useEffect } from "react";
import { X, ChevronDown, IndianRupee, Gift, CalendarX, TrendingDown, Calculator } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../utils/axiosInstance";

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
  const [existingSalaries, setExistingSalaries] = useState([]);

    useEffect(() => {
    fetchStaff();
    fetchSalaries();
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
      const res = await api.get("/api/washing-staff");
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load staff list");
    }
  };

  const fetchSalaries = async () => {
    try {
        const res = await api.get("/api/washing-staff-salary");
        setExistingSalaries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
        toast.error("Failed to load salary records");
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

      const alreadyHasSalary = existingSalaries.some(
        (s) => s.staffId === Number(formData.staffId)
        );

        if (!salary && alreadyHasSalary) {
        toast.error("Salary already added for this employee");
        return;
      }


      if (salary) {
        await api.put(`/api/washing-staff-salary/${salary.id}`, payload);
        toast.success("Salary entry updated successfully");
      } else {
        await api.post("/api/washing-staff-salary", payload);
        toast.success("Salary entry added successfully");
      }

      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save salary entry");
    } finally {
      setLoading(false);
    }
  };

  const perDaySalary = selectedStaffData ? calculatePerDaySalary(selectedStaffData.annualSalary) : 0;
  const deductions = selectedStaffData ? calculateDeductions(selectedStaffData.annualSalary, formData.leaves) : 0;
  const monthlySalary = selectedStaffData ? selectedStaffData.annualSalary / 12 : 0;
  const netSalary = monthlySalary + Number(formData.bonus) - deductions;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className={`rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
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
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {salary ? "Edit Salary Entry" : "Add Salary Entry"}
            </h3>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {salary ? "Update employee salary details" : "Create new salary record"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Staff Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Select Staff Member *
            </label>
            <div className="relative">
              <select
                required
                value={formData.staffId}
                onChange={(e) => handleChange("staffId", e.target.value)}
                disabled={!!salary}
                className={`w-full appearance-none border-2 rounded-xl px-4 py-3 pr-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white"
                } ${salary ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((staff) => (
                  <option
                    key={staff.id}
                    value={staff.id}
                    disabled={existingSalaries.some(s => s.staffId === staff.id)}
                    >
                    {staff.name} - {staff.email}  
                </option>

                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-gray-500" : "text-gray-400"}`} size={20} />
            </div>
            {salary && (
              <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                Staff cannot be changed when editing
              </p>
            )}
          </div>

          {/* Staff Details */}
          {selectedStaffData && (
            <div
              className={`p-5 rounded-2xl border bg-gradient-to-br ${
                isDark ? "from-blue-500/10 to-purple-500/10 border-blue-500/30" : "from-blue-50 to-purple-50 border-blue-200"
              }`}
            >
              <h4 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Calculator size={20} className="text-blue-500" />
                Staff Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Role", value: selectedStaffData.role },
                  { label: "Annual Salary", value: `₹${selectedStaffData.annualSalary.toLocaleString()}` },
                  { label: "Monthly Salary", value: `₹${monthlySalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` },
                  { label: "Per Day Salary", value: `₹${perDaySalary.toFixed(2)}` },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-white/70"}`}>
                    <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.label}</p>
                    <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bonus */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <Gift size={16} className="text-green-500" />
                Bonus (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonus}
                onChange={(e) => handleChange("bonus", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="Enter bonus amount"
              />
            </div>

            {/* Leaves Taken */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <CalendarX size={16} className="text-orange-500" />
                Leaves Taken (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.leaves}
                onChange={(e) => handleChange("leaves", e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
                placeholder="Enter number of leaves"
              />
            </div>

            {/* Leave Deduction */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <TrendingDown size={16} className="text-red-500" />
                Leave Deduction (₹)
              </label>
              <div
                className={`w-full border-2 rounded-xl px-4 py-3 font-bold text-red-600 ${
                  isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"
                }`}
              >
                ₹{deductions.toLocaleString()}
              </div>
            </div>

            {/* Net Salary */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <IndianRupee size={16} className="text-emerald-500" />
                Net Salary (₹)
              </label>
              <div
                className={`w-full border-2 rounded-xl px-4 py-3 font-bold text-emerald-600 flex items-center gap-2 ${
                  isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <IndianRupee size={20} />
                {netSalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              
            </div>
          </div>

          {/* Calculation Note */}
          {/* {selectedStaffData && (
            <div
              className={`p-4 rounded-2xl text-sm ${
                isDark ? "bg-blue-500/10 text-blue-400 border-2 border-blue-500/30" : "bg-blue-50 text-blue-700 border-2 border-blue-200"
              }`}
            >
              <p className="font-bold mb-2 flex items-center gap-2">
                <Calculator size={16} />
                Calculation Method:
              </p>
              <div className="space-y-1 ml-6">
                <p>
                  Net Salary = Monthly Salary (₹{monthlySalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) 
                  + Bonus (₹{Number(formData.bonus).toLocaleString()}) 
                  - Leave Deduction (₹{deductions.toLocaleString()})
                </p>
                <p>
                  Leave Deduction = Per Day Salary (₹{perDaySalary.toFixed(2)}) × Leaves ({formData.leaves})
                </p>
              </div>
            </div>
          )} */}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-6 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.staffId}
              className={`group relative flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ${
                loading || !formData.staffId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative">{loading ? "Saving..." : salary ? "Update Entry" : "Add Entry"}</span>
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

export default AddSalaryModal;