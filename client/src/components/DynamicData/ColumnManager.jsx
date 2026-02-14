import { useState } from "react";
import AddColumnModal from "./AddColumnModal";
import EditColumnModal from "./EditColumnModal";

const ColumnManager = ({
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  isDark, // ✅ Added isDark prop
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editCol, setEditCol] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true); // Toggle state

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"
      }`}
    >
      {/* HEADER SECTION - Always Visible */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 md:p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* SHRINK/EXPAND BUTTON */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl border transition-all active:scale-90 ${
              isDark
                ? "text-gray-400 hover:text-blue-400 border-gray-600 hover:bg-gray-700"
                : "text-slate-400 hover:text-blue-600 border-slate-100 hover:bg-slate-50"
            }`}
            title={isExpanded ? "Collapse Section" : "Expand Section"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
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
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Column Structure
            </h2>
            {isExpanded && (
              <p
                className={`text-xs font-medium animate-in fade-in duration-500 ${
                  isDark ? "text-gray-500" : "text-slate-500"
                }`}
              >
                Define the data types and constraints
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isExpanded && columns.length > 0 && (
            <span
              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter animate-in zoom-in duration-300 ${
                isDark
                  ? "text-blue-400 bg-blue-900/30"
                  : "text-blue-600 bg-blue-50"
              }`}
            >
              {columns.length} Columns Active
            </span>
          )}
          <button
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg whitespace-nowrap ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
            }`}
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
        <div
          className={`overflow-x-auto border rounded-2xl shadow-sm ${
            isDark
              ? "border-gray-700 bg-gray-800"
              : "border-slate-100 bg-white"
          }`}
        >
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr
                className={`border-b font-bold text-[10px] uppercase tracking-widest ${
                  isDark
                    ? "bg-gray-700/50 border-gray-700 text-gray-400"
                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                }`}
              >
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Validation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-gray-700" : "divide-slate-50"
              }`}
            >
              {columns && columns.length > 0 ? (
                columns.map((c) => (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-gray-700/50" : "hover:bg-slate-50/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          isDark ? "text-gray-100" : "text-slate-800"
                        }`}
                      >
                        {c.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-tighter ${
                          isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.required ? (
                        <span
                          className={`flex items-center gap-1.5 font-bold text-xs ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              isDark ? "bg-blue-400" : "bg-blue-600"
                            }`}
                          ></span>
                          Required
                        </span>
                      ) : (
                        <span
                          className={`font-medium text-xs ${
                            isDark ? "text-gray-500" : "text-slate-400"
                          }`}
                        >
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          className={`p-2 rounded-lg transition-all ${
                            isDark
                              ? "text-blue-400 hover:bg-blue-900/30"
                              : "text-blue-500 hover:bg-blue-50"
                          }`}
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
                          className={`p-2 rounded-lg transition-all ${
                            isDark
                              ? "text-rose-400 hover:bg-rose-900/30"
                              : "text-rose-500 hover:bg-rose-50"
                          }`}
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
                    className={`px-6 py-12 text-center font-bold italic ${
                      isDark ? "text-gray-600" : "text-slate-300"
                    }`}
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
        <AddColumnModal
          isDark={isDark}
          onClose={() => setShowAdd(false)}
          onSave={onAdd}
        />
      )}
      {editCol && (
        <EditColumnModal
          column={editCol}
          isDark={isDark}
          onClose={() => setEditCol(null)}
          onSave={onEdit}
        />
      )}
    </div>
  );
};

export default ColumnManager;