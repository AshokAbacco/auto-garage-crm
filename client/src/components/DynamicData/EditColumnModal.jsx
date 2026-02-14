import { useState } from "react";

const EditColumnModal = ({ column, onClose, onSave, isDark }) => {
  const [name, setName] = useState(column.name);
  const [required, setRequired] = useState(column.required);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className={`absolute inset-0 backdrop-blur-md animate-in fade-in duration-300 ${
          isDark ? "bg-black/70" : "bg-slate-900/10"
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border animate-in zoom-in-95 duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-slate-100 shadow-slate-200/50"
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <h3
              className={`text-2xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Edit <span className="text-blue-500">Column</span>
            </h3>
            {/* Read-only Type Badge */}
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                isDark
                  ? "bg-gray-700 text-gray-400 border-gray-600"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {column.type}
            </span>
          </div>
          <p className={`text-sm font-medium mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Update column name and validation rules.
          </p>
        </div>

        <div className="space-y-6">
          {/* Column Name Input */}
          <div>
            <label
              className={`block text-xs font-black uppercase tracking-widest mb-2 ml-1 ${
                isDark ? "text-gray-400" : "text-slate-400"
              }`}
            >
              Column Name
            </label>
            <input
              autoFocus
              className={`w-full px-5 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:opacity-60 ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white focus:bg-gray-800 focus:border-blue-500"
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500"
              }`}
              placeholder="Enter new name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Validation Toggle */}
          <div>
            <label
              className={`block text-xs font-black uppercase tracking-widest mb-2 ml-1 ${
                isDark ? "text-gray-400" : "text-slate-400"
              }`}
            >
              Settings
            </label>
            <div
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                required
                  ? `border-blue-500 ${isDark ? "bg-blue-900/30" : "bg-blue-50/50"}`
                  : `border-slate-100 bg-slate-50/30 ${isDark ? "border-gray-700 bg-gray-700/50" : ""}`
              }`}
              onClick={() => setRequired(!required)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    required
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-600 text-gray-400"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span
                  className={`font-bold text-sm ${
                    required
                      ? isDark
                        ? "text-blue-300"
                        : "text-blue-900"
                      : isDark
                      ? "text-gray-400"
                      : "text-slate-500"
                  }`}
                >
                  Required Field
                </span>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  required
                    ? "bg-blue-600"
                    : isDark
                    ? "bg-gray-600"
                    : "bg-slate-200"
                }`}
              >
                <div
                  className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                    required ? "left-5" : "left-1"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all ${
              isDark
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...column, name, required })}
            disabled={!name.trim()}
            className={`flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 ${
              isDark ? "shadow-lg shadow-blue-900/20" : "shadow-xl shadow-blue-200"
            }`}
          >
            Update Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditColumnModal;