import { useState } from "react";

const TableManager = ({
  tables = [],
  selectedTableId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [newTableName, setNewTableName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="bg-white rounded-2xl p-2 md:p-4">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Available Tables
        </h2>
        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
          {tables.length} Total
        </span>
      </div>

      {/* CREATE SECTION */}
      <div className="flex gap-3 mb-8 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
        <input
          className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-slate-400"
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-100"
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
            // Entire row is now clickable
            onClick={() => onSelect(t.id)}
            className={`flex justify-between items-center p-3 rounded-xl transition-all border-2 cursor-pointer active:scale-[0.99] ${
              selectedTableId === t.id
                ? "border-blue-500 bg-blue-50/30 shadow-sm"
                : "border-transparent bg-slate-50/30 border-slate-50 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex-1 flex items-center min-w-0 mr-4">
              {editId === t.id ? (
                <input
                  autoFocus
                  className="w-full bg-white border border-blue-400 px-3 py-1.5 rounded-lg outline-none font-semibold text-sm shadow-inner"
                  value={editName}
                  // Stop propagation so clicking the input doesn't trigger onSelect
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
                      ? "text-blue-700"
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
                      e.stopPropagation(); // Prevent row click
                      onRename(t.id, editName);
                      setEditId(null);
                    }}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      setEditId(null);
                    }}
                    className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                  >
                    Esc
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      setEditId(t.id);
                      setEditName(t.name);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
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
                      e.stopPropagation(); // Prevent row click
                      onDelete(t.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
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
          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">
              No tables created yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManager;
