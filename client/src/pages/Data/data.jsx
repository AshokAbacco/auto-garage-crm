import { useEffect, useState } from "react";
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
    // Strictly white background for both modes as requested
    <div className="min-h-screen bg-white text-slate-800 dark:text-slate-900 lg:ml-16 transition-colors duration-300 p-4 md:p-8">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Dynamic Data <span className="text-blue-600">Tables</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Manage your database structures with a clean, light interface.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {selectedTableId && <ExcelUpload onProceed={handleExcelImport} />}
        {/* TABLE MANAGER SECTION */}
        <section className="bg-white p-1 rounded-xl border-b-2 border-slate-100 transition-all">
          <TableManager
            tables={tables}
            selectedTableId={selectedTableId}
            onSelect={setSelectedTableId}
            onCreate={handleCreateTable}
            onRename={handleRenameTable}
            onDelete={handleDeleteTable}
          />
        </section>

        {/* COLUMN MANAGER SECTION */}
        {selectedTableId && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <ColumnManager
                columns={columns}
                onAdd={handleAddColumn}
                onEdit={handleEditColumn}
                onDelete={handleDeleteColumn}
              />
            </div>
          </section>
        )}

        {/* DATA GRID SECTION */}
        {selectedTableId && columns.length > 0 && (
          <div className="mt-2 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
              <div>
                <h2 className="font-bold text-2xl text-slate-900">
                  Table Records
                </h2>
                <p className="text-sm text-slate-400">
                  Viewing all active rows
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 font-bold text-sm"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white border-b border-slate-100 text-slate-400">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className="px-8 py-5 font-black tracking-widest"
                      >
                        {col.name}
                      </th>
                    ))}
                    <th className="px-8 py-5 font-black tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className="px-8 py-5 whitespace-nowrap font-semibold text-slate-700"
                          >
                            {row.values[col.id] ?? (
                              <span className="text-slate-300 italic font-normal">
                                empty
                              </span>
                            )}
                          </td>
                        ))}

                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-6 opacity-1 group-hover:opacity-100 transition-opacity">
                            <button
                              className="text-blue-500 hover:text-blue-700 font-bold"
                              onClick={() => setEditRow(row)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-rose-400 hover:text-rose-600 font-bold"
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
                        className="px-8 py-24 text-center text-slate-300 font-bold text-lg"
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
