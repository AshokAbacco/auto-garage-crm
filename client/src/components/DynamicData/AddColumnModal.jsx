import { useState } from "react";

const AddColumnModal = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSave({
        name: name.trim(),
        type,
        required,
      });
      onClose();
    } catch (error) {
      console.error("Add column failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur - No Black Background */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Add New <span className="text-blue-600">Column</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Define the structure of your data table.
          </p>
        </div>

        <div className="space-y-6">
          {/* Column Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Column Name
            </label>
            <input
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. Phone Number"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Data Type */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Data Type
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-bold text-slate-700 cursor-pointer"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              >
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="DATE">DATE</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Validation Toggle */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              required
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-100 bg-slate-50/30"
            }`}
            onClick={() => !loading && setRequired(!required)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${required ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
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
                className={`font-bold text-sm ${required ? "text-blue-900" : "text-slate-500"}`}
              >
                Required Field
              </span>
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              disabled={loading}
            />
            <div
              className={`w-10 h-6 rounded-full relative transition-colors ${required ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${required ? "left-5" : "left-1"}`}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Create Column"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnModal;
