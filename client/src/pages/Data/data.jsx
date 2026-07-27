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
import ToastStack from "../../components/DynamicData/Toast.jsx";

const DynamicData = () => {
  const { isDark } = useTheme(); // ✅ Get Theme State

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [importProgress, setImportProgress] = useState(null); // { current, total } | null
  const [toasts, setToasts] = useState([]);

  /**
   * TOASTS (replaces blocking window.alert())
   */
  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * LOADERS
   */
  const loadTables = async () => {
    try {
      const res = await getDynamicTables();
      setTables(res.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load tables",
        "error",
      );
    }
  };

  const loadTableDetails = async (tableId) => {
    try {
      setLoadingTable(true);
      const res = await getDynamicTableDetails(tableId);
      setColumns(res.data.columns);
      setRows(res.data.rows);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load table details",
        "error",
      );
    } finally {
      setLoadingTable(false);
    }
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
    try {
      const res = await createDynamicTable(name);

      // 🆕 FIXED: this used to only do an optimistic
      // `setTables(prev => [...prev, res.data])`, which silently failed to
      // show the new table unless `res.data` happened to be EXACTLY the
      // shape TableManager expects. If the backend returns a wrapped
      // response (e.g. `{ success, data: {...} }` — the pattern used
      // throughout the rest of this API), the appended item is malformed
      // and only a full page refresh (which properly calls
      // getDynamicTables() again) ever showed it correctly.
      //
      // Fix: just refetch from the server, exactly like handleRenameTable
      // and handleDeleteTable already do below — guaranteed correct
      // regardless of the exact response shape, and still shows up
      // immediately (no page reload needed).
      await loadTables();

      // Handle both a raw table object and a { success, data } wrapper
      // when picking which table to auto-select.
      const newTable = res?.data?.data ?? res?.data ?? null;
      if (newTable?.id) {
        setSelectedTableId(newTable.id);
      }

      showToast(`Table "${name}" created`, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to create table",
        "error",
      );
    }
  };

  const handleRenameTable = async (id, name) => {
    try {
      await renameDynamicTable(id, name);
      loadTables();
      showToast("Table renamed", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to rename table",
        "error",
      );
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Delete table permanently?")) return;
    try {
      await deleteDynamicTable(id);
      setSelectedTableId("");
      loadTables();
      showToast("Table deleted", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete table",
        "error",
      );
    }
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
      showToast(`Column "${column.name}" added`, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to add column",
        "error",
      );
      throw error; // let the modal know so it doesn't close/reset optimistically
    }
  };

  const handleEditColumn = async (column) => {
    try {
      await updateDynamicColumn(column.id, {
        name: column.name,
        required: column.required,
      });
      await loadTableDetails(selectedTableId);
      showToast("Column updated", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update column",
        "error",
      );
      throw error;
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Deleting a column will remove its data. Continue?"))
      return;
    try {
      await deleteDynamicColumn(columnId);
      await loadTableDetails(selectedTableId);
      showToast("Column deleted", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete column",
        "error",
      );
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    try {
      await deleteDynamicRow(rowId);
      await loadTableDetails(selectedTableId);
      showToast("Row deleted", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete row",
        "error",
      );
    }
  };

  /**
   * EXCEL IMPORT
   * Hardened version: never throws uncaught, dedupes column names within the
   * same batch (case-insensitively), reports progress, and gives a clear
   * success/failure summary instead of silently dying partway through.
   */
  const handleExcelImport = async (excelRows) => {
    if (!selectedTableId || excelRows.length === 0 || importProgress) return;

    try {
      const firstRow = excelRows[0];

      // 1️⃣ Work out which columns are genuinely new, case-insensitively,
      //    and don't try to create the same "new" column twice in one batch.
      const existingNames = new Set(columns.map((c) => c.name.toLowerCase()));
      const plannedNames = new Set();
      const columnsToCreate = [];

      for (const key of Object.keys(firstRow)) {
        const lower = key.toLowerCase();
        if (!existingNames.has(lower) && !plannedNames.has(lower)) {
          plannedNames.add(lower);
          columnsToCreate.push(key);
        }
      }

      for (const key of columnsToCreate) {
        try {
          await createDynamicColumn({
            tableId: selectedTableId,
            name: key,
            type: "TEXT", // ✅ ALWAYS TEXT
            required: false,
          });
        } catch (err) {
          // A 409 (name already exists) is safe to ignore and continue with import.
          if (err?.response?.status !== 409) {
            throw new Error(
              err?.response?.data?.message ||
                `Failed to create column "${key}"`,
            );
          }
        }
      }

      // Reload columns to get IDs (including any just created)
      const updated = await getDynamicTableDetails(selectedTableId);
      const updatedColumns = updated.data.columns;

      // 2️⃣ Insert rows one at a time, tracking progress + collecting failures
      //    so one bad row doesn't silently kill the whole import.
      let successCount = 0;
      let failCount = 0;
      setImportProgress({ current: 0, total: excelRows.length });

      for (let i = 0; i < excelRows.length; i++) {
        const row = excelRows[i];
        const data = {};

        updatedColumns.forEach((col) => {
          data[col.id] =
            row[col.name] !== undefined && row[col.name] !== ""
              ? String(row[col.name])
              : null;
        });

        try {
          await createDynamicRow({
            tableId: selectedTableId,
            data,
          });
          successCount++;
        } catch (err) {
          failCount++;
        }

        setImportProgress({ current: i + 1, total: excelRows.length });
      }

      await loadTableDetails(selectedTableId);

      if (failCount === 0) {
        showToast(
          `Imported ${successCount} row${successCount !== 1 ? "s" : ""} successfully`,
          "success",
        );
      } else {
        showToast(
          `Imported ${successCount} row${successCount !== 1 ? "s" : ""}, ${failCount} failed`,
          "warning",
        );
      }
    } catch (error) {
      showToast(
        error?.message ||
          "Import failed. Please check your file and try again.",
        "error",
      );
    } finally {
      setImportProgress(null);
    }
  };

  return (
    <div
      className={`min-h-screen lg:ml-16 transition-colors duration-300 p-4 md:p-8 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-white text-slate-800"
      }`}
    >
      <ToastStack toasts={toasts} onDismiss={dismissToast} isDark={isDark} />

      {/* Header Section */}
      <header className="mb-8 md:mb-10">
        <h1
          className={`text-3xl md:text-4xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Dynamic Data <span className="text-blue-500">Tables</span>
        </h1>
        <p
          className={`font-medium mt-2 text-sm md:text-base ${
            isDark ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Manage your database structures with a clean, flexible interface.
        </p>
      </header>

      <div className="flex flex-col gap-6 md:gap-10">
        {/* TABLE MANAGER SECTION */}
        <section
          className={`p-1 rounded-xl border-b-2 transition-all ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"
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

        {/* Passing isDark to child components if needed */}
        {selectedTableId && (
          <ExcelUpload
            isDark={isDark}
            onProceed={handleExcelImport}
            importProgress={importProgress}
          />
        )}

        {/* COLUMN MANAGER SECTION */}
        {selectedTableId && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div
              className={`p-4 md:p-6 rounded-2xl border shadow-sm ${
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

        {/* EMPTY STATE: table selected but no columns yet */}
        {selectedTableId && !loadingTable && columns.length === 0 && (
          <div
            className={`rounded-3xl border-2 border-dashed p-10 md:p-14 text-center ${
              isDark
                ? "border-gray-700 text-gray-500"
                : "border-slate-200 text-slate-400"
            }`}
          >
            <p className="font-bold text-lg mb-1">No columns yet</p>
            <p className="text-sm font-medium">
              Add at least one column above, or import an Excel file, before
              adding records.
            </p>
          </div>
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
              className={`p-4 md:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${
                isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-slate-100 bg-slate-50/30"
              }`}
            >
              <div>
                <h2
                  className={`font-bold text-xl md:text-2xl ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Table Records
                </h2>
                <p
                  className={`text-sm ${isDark ? "text-gray-500" : "text-slate-400"}`}
                >
                  {rows.length} row{rows.length !== 1 ? "s" : ""} · viewing all
                  active records
                </p>
              </div>
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/30 active:scale-95 font-bold text-sm"
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
                      <th
                        key={col.id}
                        className="px-8 py-5 tracking-widest whitespace-nowrap"
                      >
                        {col.name}
                      </th>
                    ))}
                    <th className="px-8 py-5 tracking-widest text-right whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${
                    isDark ? "divide-gray-700" : "divide-slate-50"
                  }`}
                >
                  {loadingTable ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className={`px-8 py-24 text-center font-bold text-lg ${
                          isDark ? "text-gray-600" : "text-slate-300"
                        }`}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length > 0 ? (
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
          onNotify={showToast}
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
          onNotify={showToast}
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
