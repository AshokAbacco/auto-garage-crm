import React, { useState } from "react";
import { X } from "lucide-react";

const DAYS_IN_YEAR = 365;

/* ===========================
   YEARLY DEDUCTION LOGIC
=========================== */
const calculatePerDaySalary = (monthlySalary) => {
  if (!monthlySalary) return 0;
  const annualSalary = monthlySalary * 12;
  return annualSalary / DAYS_IN_YEAR;
};

const calculateDeductions = (monthlySalary, leaves) => {
  if (!monthlySalary || !leaves) return 0;
  const perDay = calculatePerDaySalary(monthlySalary);
  return Math.round(perDay * leaves);
};

const AddEditStaffModal = ({ staff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || "",
    role: staff?.role || "",
    baseSalary: staff?.baseSalary || "",
    bonus: staff?.bonus ?? 0,
    leaves: staff?.leaves ?? 0,
    deductions: staff?.deductions ?? 0,
    joiningDate: staff?.joiningDate
      ? new Date(staff.joiningDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  /* ===========================
     HANDLE INPUT CHANGES
  =========================== */
  const handleChange = (field, value) => {
    let updated = { ...formData, [field]: value };

    if (field === "baseSalary" || field === "leaves") {
      const salary = Number(
        field === "baseSalary" ? value : updated.baseSalary
      );
      const leaves = Number(
        field === "leaves" ? value : updated.leaves
      );

      updated.deductions = calculateDeductions(salary, leaves);
    }

    setFormData(updated);
  };

  /* ===========================
     SUBMIT FORM
  =========================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...formData,
      baseSalary: Number(formData.baseSalary),
      bonus: Number(formData.bonus),
      leaves: Number(formData.leaves),
      deductions: Number(formData.deductions),
      joiningDate: new Date(formData.joiningDate),
    });
  };

  const perDaySalary = calculatePerDaySalary(formData.baseSalary);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>

            {/* Base Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Salary (₹)
              </label>
              <input
                type="number"
                required
                value={formData.baseSalary}
                onChange={(e) => handleChange("baseSalary", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>

            {/* Bonus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus (₹)
              </label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => handleChange("bonus", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>

            {/* Leaves */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leaves Taken
              </label>
              <input
                type="number"
                min="0"
                value={formData.leaves}
                onChange={(e) => handleChange("leaves", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>

            {/* Deductions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Deduction (₹)
              </label>
              <input
                type="number"
                value={formData.deductions}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2.5 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Per day salary (yearly): ₹{perDaySalary.toFixed(2)}  
                <br />
                Annual salary: ₹{(formData.baseSalary * 12 || 0).toLocaleString()}
              </p>
            </div>

            {/* Joining Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining Date
              </label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => handleChange("joiningDate", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg"
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
