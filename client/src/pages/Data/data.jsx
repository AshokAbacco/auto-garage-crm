import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext"; // ✅ Import Theme Context
import ExcelUpload from "../../components/DynamicData/ExcelUpload.jsx";
import {
  getDynamicTables,
  getDynamicTableDetails,
  createDynamicTable,
  renameDynamicTable,
  deleteDynamicTable,
  createDynamicColumn,
  updateDynamicColumn,
  deleteDynamicColumn,
  createDynamicRow,
  deleteDynamicRow,
} from "../../api/dynamicApi.js";

import AddRowModal from "../../components/DynamicData/AddRowModal.jsx";
import EditRowModal from "../../components/DynamicData/EditRowModal.jsx";
import TableManager from "../../components/DynamicData/TableManager.jsx";
import ColumnManager from "../../components/DynamicData/ColumnManager.jsx";

const DynamicData = () => {
  const { isDark } = useTheme(); // ✅ Get Theme State

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRow, setEditRow] = useState(null);

  /**
   * LOADERS
   */
  const loadTables = async () => {
    const res = await getDynamicTables();
    setTables(res.data);
  };

  const loadTableDetails = async (tableId) => {
    const res = await getDynamicTableDetails(tableId);
    setColumns(res.data.columns);
    setRows(res.data.rows);
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTableId) {
      loadTableDetails(selectedTableId);
    } else {
      setColumns([]);
      setRows([]);
    }
  }, [selectedTableId]);

  /**
   * ACTIONS
   */
  const handleCreateTable = async (name) => {
    const res = await createDynamicTable(name);
    setTables((prev) => [...prev, res.data]);
    setSelectedTableId(res.data.id);
  };

  const handleRenameTable = async (id, name) => {
    await renameDynamicTable(id, name);
    loadTables();
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Delete table permanently?")) return;
    await deleteDynamicTable(id);
    setSelectedTableId("");
    loadTables();
  };

  const handleAddColumn = async (column) => {
    try {
      await createDynamicColumn({
        tableId: selectedTableId,
        name: column.name,
        type: column.type,
        required: column.required,
      });
      await loadTableDetails(selectedTableId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add column");
    }
  };

  const handleEditColumn = async (column) => {
    try {
      await updateDynamicColumn(column.id, {
        name: column.name,
        required: column.required,
      });
      await loadTableDetails(selectedTableId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Deleting a column will remove its data. Continue?"))
      return;
    try {
      await deleteDynamicColumn(columnId);
      await loadTableDetails(selectedTableId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete column");
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    try {
      await deleteDynamicRow(rowId);
      await loadTableDetails(selectedTableId);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete row");
    }
  };

  const handleExcelImport = async (excelRows) => {
    if (!selectedTableId || excelRows.length === 0) return;

    const firstRow = excelRows[0];

    // 1️⃣ Create missing columns (ALL TEXT)
    for (const key of Object.keys(firstRow)) {
      const exists = columns.find(
        (c) => c.name.toLowerCase() === key.toLowerCase(),
      );

      if (!exists) {
        await createDynamicColumn({
          tableId: selectedTableId,
          name: key,
          type: "TEXT", // ✅ ALWAYS TEXT
          required: false,
        });
      }
    }

    // Reload columns to get IDs
    const updated = await getDynamicTableDetails(selectedTableId);
    const updatedColumns = updated.data.columns;

    // 2️⃣ Insert rows
    for (const row of excelRows) {
      const data = {};

      updatedColumns.forEach((col) => {
        data[col.id] =
          row[col.name] !== undefined ? String(row[col.name]) : null;
      });

      await createDynamicRow({
        tableId: selectedTableId,
        data,
      });
    }

    await loadTableDetails(selectedTableId);
  };

  return (
    <div
      className={`min-h-screen lg:ml-16 transition-colors duration-300 p-4 md:p-8 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-white text-slate-800"
      }`}
    >
      {/* Header Section */}
      <header className="mb-10">
        <h1
          className={`text-4xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Dynamic Data <span className="text-blue-500">Tables</span>
        </h1>
        <p
          className={`font-medium mt-2 ${
            isDark ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Manage your database structures with a clean, flexible interface.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {/* Passing isDark to child components if needed */}
        {selectedTableId && (
          <ExcelUpload isDark={isDark} onProceed={handleExcelImport} />
        )}

        {/* TABLE MANAGER SECTION */}
        <section
          className={`p-1 rounded-xl border-b-2 transition-all ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-slate-100"
          }`}
        >
          <TableManager
            tables={tables}
            selectedTableId={selectedTableId}
            onSelect={setSelectedTableId}
            onCreate={handleCreateTable}
            onRename={handleRenameTable}
            onDelete={handleDeleteTable}
            isDark={isDark}
          />
        </section>

        {/* COLUMN MANAGER SECTION */}
        {selectedTableId && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div
              className={`p-6 rounded-2xl border shadow-sm ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <ColumnManager
                columns={columns}
                onAdd={handleAddColumn}
                onEdit={handleEditColumn}
                onDelete={handleDeleteColumn}
                isDark={isDark}
              />
            </div>
          </section>
        )}

        {/* DATA GRID SECTION */}
        {selectedTableId && columns.length > 0 && (
          <div
            className={`mt-2 rounded-3xl border overflow-hidden ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
            }`}
          >
            <div
              className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                isDark ? "border-gray-700 bg-gray-800" : "border-slate-100 bg-slate-50/30"
              }`}
            >
              <div>
                <h2
                  className={`font-bold text-2xl ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Table Records
                </h2>
                <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                  Viewing all active rows
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/30 active:scale-95 font-bold text-sm"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead
                  className={`text-xs uppercase border-b font-bold ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-400"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <tr>
                    {columns.map((col) => (
                      <th key={col.id} className="px-8 py-5 tracking-widest">
                        {col.name}
                      </th>
                    ))}
                    <th className="px-8 py-5 tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${
                    isDark ? "divide-gray-700" : "divide-slate-50"
                  }`}
                >
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition-colors group ${
                          isDark
                            ? "hover:bg-gray-700/50"
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className={`px-8 py-5 whitespace-nowrap font-semibold ${
                              isDark ? "text-gray-300" : "text-slate-700"
                            }`}
                          >
                            {row.values[col.id] ?? (
                              <span
                                className={`italic font-normal ${
                                  isDark ? "text-gray-600" : "text-slate-300"
                                }`}
                              >
                                empty
                              </span>
                            )}
                          </td>
                        ))}

                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-6 opacity-1 group-hover:opacity-100 transition-opacity">
                            <button
                              className={`font-bold ${
                                isDark
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-500 hover:text-blue-700"
                              }`}
                              onClick={() => setEditRow(row)}
                            >
                              Edit
                            </button>
                            <button
                              className={`font-bold ${
                                isDark
                                  ? "text-rose-400 hover:text-rose-300"
                                  : "text-rose-400 hover:text-rose-600"
                              }`}
                              onClick={() => handleDeleteRow(row.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className={`px-8 py-24 text-center font-bold text-lg ${
                          isDark ? "text-gray-600" : "text-slate-300"
                        }`}
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddRowModal
          tableId={selectedTableId}
          columns={columns}
          isDark={isDark}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadTableDetails(selectedTableId);
          }}
        />
      )}

      {editRow && (
        <EditRowModal
          row={editRow}
          columns={columns}
          isDark={isDark}
          onClose={() => setEditRow(null)}
          onSuccess={() => {
            setEditRow(null);
            loadTableDetails(selectedTableId);
          }}
        />
      )}
    </div>
  );
};

export default DynamicData;