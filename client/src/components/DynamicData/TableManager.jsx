import { useState } from "react";

const TableManager = ({
  tables = [],
  selectedTableId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isDark, // ✅ Added isDark prop
}) => {
  const [newTableName, setNewTableName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  return (
    <div
      className={`rounded-2xl p-2 md:p-4 transition-colors ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2
          className={`text-xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Available Tables
        </h2>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
            isDark
              ? "bg-gray-700 text-gray-400"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {tables.length} Total
        </span>
      </div>

      {/* CREATE SECTION */}
      <div
        className={`flex gap-3 mb-8 p-3 rounded-xl border ${
          isDark
            ? "bg-gray-700/30 border-gray-700"
            : "bg-slate-50/50 border-slate-100"
        }`}
      >
        <input
          className={`flex-1 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium placeholder:opacity-60 ${
            isDark
              ? "bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
              : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
          }`}
          placeholder="Enter table name..."
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTableName) {
              onCreate(newTableName);
              setNewTableName("");
            }
          }}
        />
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg ${
            isDark ? "shadow-blue-900/20" : "shadow-blue-100"
          }`}
          onClick={() => {
            if (!newTableName) return;
            onCreate(newTableName);
            setNewTableName("");
          }}
        >
          Create
        </button>
      </div>

      {/* TABLES LIST */}
      <div className="space-y-2">
        {tables.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex justify-between items-center p-3 rounded-xl transition-all border-2 cursor-pointer active:scale-[0.99] ${
              selectedTableId === t.id
                ? isDark
                  ? "border-blue-500 bg-blue-500/10" // Dark Selected
                  : "border-blue-500 bg-blue-50/30" // Light Selected
                : isDark
                ? "border-transparent bg-gray-700/50 hover:border-gray-600 hover:bg-gray-700" // Dark Unselected
                : "border-transparent bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50" // Light Unselected
            }`}
          >
            <div className="flex-1 flex items-center min-w-0 mr-4">
              {editId === t.id ? (
                <input
                  autoFocus
                  className={`w-full border px-3 py-1.5 rounded-lg outline-none font-semibold text-sm shadow-inner ${
                    isDark
                      ? "bg-gray-900 border-blue-500 text-white"
                      : "bg-white border-blue-400 text-slate-800"
                  }`}
                  value={editName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setEditId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRename(t.id, editName);
                      setEditId(null);
                    }
                  }}
                />
              ) : (
                <span
                  className={`text-sm font-bold truncate transition-colors ${
                    selectedTableId === t.id
                      ? isDark
                        ? "text-blue-400"
                        : "text-blue-700"
                      : isDark
                      ? "text-gray-300"
                      : "text-slate-600"
                  }`}
                >
                  {t.name}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-1">
              {editId === t.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(t.id, editName);
                      setEditId(null);
                    }}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-colors ${
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    Esc
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(t.id);
                      setEditName(t.name);
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      isDark
                        ? "text-gray-400 hover:text-blue-400 hover:bg-gray-600"
                        : "text-slate-400 hover:text-blue-600 hover:bg-white"
                    }`}
                    title="Rename Table"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t.id);
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      isDark
                        ? "text-gray-400 hover:text-rose-400 hover:bg-gray-600"
                        : "text-slate-400 hover:text-rose-500 hover:bg-white"
                    }`}
                    title="Delete Table"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <div
            className={`py-10 text-center border-2 border-dashed rounded-2xl ${
              isDark
                ? "border-gray-700 text-gray-500"
                : "border-slate-100 text-slate-400"
            }`}
          >
            <p className="text-sm font-medium">No tables created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManager;