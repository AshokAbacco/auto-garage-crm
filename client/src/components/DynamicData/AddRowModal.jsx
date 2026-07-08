import { useState } from "react";
import { createDynamicRow } from "../../api/dynamicApi.js";

const AddRowModal = ({
  tableId,
  columns = [],
  onClose,
  onSuccess,
  isDark,
  onNotify,
}) => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (columnId, value) => {
    setValues((prev) => ({
      ...prev,
      [columnId]: value,
    }));
    if (fieldErrors[columnId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[columnId];
        return next;
      });
    }
  };

  const buildFormattedValues = () => {
    const formatted = {};
    const errors = {};

    columns.forEach((col) => {
      const raw = values[col.id];
      const isEmpty = raw === undefined || raw === null || raw === "";

      if (
        col.required &&
        (isEmpty || (col.type === "BOOLEAN" && raw === false))
      ) {
        // BOOLEAN "false" is a legitimate value; only block on truly empty input
        if (isEmpty) {
          errors[col.id] = `${col.name} is required`;
          return;
        }
      }

      if (isEmpty) {
        formatted[col.id] = null;
        return;
      }

      if (col.type === "NUMBER") {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          errors[col.id] = `${col.name} must be a valid number`;
          return;
        }
        formatted[col.id] = num;
      } else if (col.type === "BOOLEAN") {
        formatted[col.id] = Boolean(raw);
      } else if (col.type === "DATE") {
        if (Number.isNaN(Date.parse(raw))) {
          errors[col.id] = `${col.name} must be a valid date`;
          return;
        }
        formatted[col.id] = raw;
      } else {
        formatted[col.id] = String(raw);
      }
    });

    return { formatted, errors };
  };

  const handleSubmit = async () => {
    setFormError("");
    const { formatted, errors } = buildFormattedValues();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setLoading(true);
      await createDynamicRow({
        tableId,
        data: formatted,
      });

      onNotify?.("Record added successfully", "success");
      onSuccess();
      onClose();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to add row";
      setFormError(message);
      onNotify?.(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-md animate-in fade-in duration-300 ${
          isDark ? "bg-black/70" : "bg-slate-900/10"
        }`}
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl border flex flex-col max-h-[92vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-slate-100 shadow-slate-200/50"
        }`}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 shrink-0">
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Add New <span className="text-blue-500">Entry</span>
          </h2>
          <p
            className={`text-sm font-medium mt-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}
          >
            Fill in the details for the new record.
          </p>
        </div>

        {/* Form-level error banner */}
        {formError && (
          <div className="px-6 sm:px-8 shrink-0">
            <div
              className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs font-semibold mb-2 ${
                isDark
                  ? "bg-rose-900/30 border-rose-800 text-rose-300"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              <span className="mt-0.5">⚠</span>
              <span>{formError}</span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-0 space-y-6 custom-scrollbar">
          {columns.map((col) => (
            <div
              key={col.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <label
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2 ml-1 ${
                  isDark ? "text-gray-400" : "text-slate-400"
                }`}
              >
                {col.name}
                {col.required && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    title="Required Field"
                  ></span>
                )}
              </label>

              {col.type === "BOOLEAN" ? (
                <button
                  type="button"
                  onClick={() => handleChange(col.id, !values[col.id])}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    values[col.id]
                      ? `border-blue-500 ${isDark ? "bg-blue-900/30" : "bg-blue-50/50"}`
                      : `border-slate-100 bg-slate-50/30 ${isDark ? "border-gray-700 bg-gray-700/50" : ""}`
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      values[col.id]
                        ? isDark
                          ? "text-blue-300"
                          : "text-blue-900"
                        : isDark
                          ? "text-gray-400"
                          : "text-slate-500"
                    }`}
                  >
                    {values[col.id] ? "True / Yes" : "False / No"}
                  </span>
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                      values[col.id]
                        ? "bg-blue-600"
                        : isDark
                          ? "bg-gray-600"
                          : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                        values[col.id] ? "left-5" : "left-1"
                      }`}
                    />
                  </div>
                </button>
              ) : (
                <input
                  type={
                    col.type === "NUMBER"
                      ? "number"
                      : col.type === "DATE"
                        ? "date"
                        : "text"
                  }
                  className={`w-full px-5 py-3.5 rounded-2xl outline-none focus:ring-4 transition-all font-bold placeholder:opacity-60 border ${
                    fieldErrors[col.id]
                      ? isDark
                        ? "bg-gray-900 border-rose-600 text-white focus:ring-rose-500/10"
                        : "bg-rose-50/40 border-rose-300 text-slate-800 focus:ring-rose-500/10"
                      : isDark
                        ? "bg-gray-900 border-gray-700 text-white focus:bg-gray-800 focus:border-blue-500 focus:ring-blue-500/10"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                  placeholder={
                    col.type === "DATE"
                      ? undefined
                      : `Enter ${col.name.toLowerCase()}...`
                  }
                  value={values[col.id] ?? ""}
                  onChange={(e) => handleChange(col.id, e.target.value)}
                  disabled={loading}
                />
              )}
              {fieldErrors[col.id] && (
                <p className="mt-1.5 ml-1 text-xs font-semibold text-rose-500">
                  {fieldErrors[col.id]}
                </p>
              )}
            </div>
          ))}

          {columns.length === 0 && (
            <div className="py-10 text-center">
              <p
                className={`font-medium italic ${isDark ? "text-gray-500" : "text-slate-400"}`}
              >
                No columns available to fill.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className={`p-6 sm:p-8 pt-4 border-t flex flex-col sm:flex-row gap-3 shrink-0 ${
            isDark ? "border-gray-700" : "border-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 ${
              isDark
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || columns.length === 0}
            className={`flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${
              isDark
                ? "shadow-lg shadow-blue-900/20"
                : "shadow-xl shadow-blue-200"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Entry...
              </>
            ) : (
              "Save Record"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRowModal;
