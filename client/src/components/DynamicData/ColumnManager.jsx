import { useState } from "react";
import AddColumnModal from "./AddColumnModal";
import EditColumnModal from "./EditColumnModal";

const ColumnManager = ({ columns = [], onAdd, onEdit, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editCol, setEditCol] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true); // Toggle state

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* HEADER SECTION - Always Visible */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 md:p-6 bg-white">
        <div className="flex items-center gap-3">
          {/* SHRINK/EXPAND BUTTON */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
            title={isExpanded ? "Collapse Section" : "Expand Section"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Column Structure
            </h2>
            {isExpanded && (
              <p className="text-xs text-slate-500 font-medium animate-in fade-in duration-500">
                Define the data types and constraints
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isExpanded && columns.length > 0 && (
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter animate-in zoom-in duration-300">
              {columns.length} Columns Active
            </span>
          )}
          <button
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-100 whitespace-nowrap"
            onClick={() => setShowAdd(true)}
          >
            <span>+</span> Add Column
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE CONTENT */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[1000px] opacity-100 p-5 pt-0"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Name
                </th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Type
                </th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Validation
                </th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {columns && columns.length > 0 ? (
                columns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-tighter">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.required ? (
                        <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          Required
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          onClick={() => setEditCol(c)}
                          title="Edit Column"
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
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          onClick={() => onDelete(c.id)}
                          title="Delete Column"
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-300 font-bold italic"
                  >
                    No columns defined for this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showAdd && (
        <AddColumnModal onClose={() => setShowAdd(false)} onSave={onAdd} />
      )}
      {editCol && (
        <EditColumnModal
          column={editCol}
          onClose={() => setEditCol(null)}
          onSave={onEdit}
        />
      )}
    </div>
  );
};

export default ColumnManager;
