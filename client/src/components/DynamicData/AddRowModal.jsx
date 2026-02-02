import { useState } from "react";
import { createDynamicRow } from "../../api/dynamicApi.js";

const AddRowModal = ({ tableId, columns = [], onClose, onSuccess }) => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (columnId, value) => {
    setValues((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formattedValues = {};
      columns.forEach((col) => {
        let value = values[col.id];

        if (col.type === "NUMBER") value = Number(value);
        if (col.type === "BOOLEAN") value = Boolean(value);

        formattedValues[col.id] = value;
      });

      await createDynamicRow({
        tableId,
        data: formattedValues,
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add row");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur - strictly no black background */}
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Add New <span className="text-blue-600">Entry</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Fill in the details for the new record.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-6 custom-scrollbar">
          {columns.map((col) => (
            <div
              key={col.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
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
                  onClick={() => handleChange(col.id, !values[col.id])}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    values[col.id]
                      ? "border-blue-500 bg-blue-50/50 text-blue-900"
                      : "border-slate-100 bg-slate-50/50 text-slate-500"
                  }`}
                >
                  <span className="font-bold text-sm">
                    {values[col.id] ? "True / Yes" : "False / No"}
                  </span>
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors ${values[col.id] ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <div
                      className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${values[col.id] ? "left-5" : "left-1"}`}
                    />
                  </div>
                </button>
              ) : (
                <input
                  type={col.type === "NUMBER" ? "number" : "text"}
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder={`Enter ${col.name.toLowerCase()}...`}
                  value={values[col.id] || ""}
                  onChange={(e) => handleChange(col.id, e.target.value)}
                  disabled={loading}
                />
              )}
            </div>
          ))}

          {columns.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-slate-400 font-medium italic">
                No columns available to fill.
              </p>
            </div>
          )}
        </div>

        {/* Actions - Permanently Visible */}
        <div className="p-8 pt-4 border-t border-slate-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || columns.length === 0}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
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
