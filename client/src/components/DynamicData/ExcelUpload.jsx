import { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUpload = ({ onProceed, isDark }) => {
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });
      setParsedData(json);
    };

    reader.readAsBinaryString(file);
  };

  const handleProceed = () => {
    if (parsedData.length === 0) return;
    onProceed(parsedData);
    setParsedData([]);
    setFileName("");
  };

  return (
    <div
      className={`rounded-2xl p-1 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* CUSTOM FILE INPUT BUTTON */}
        <label className="relative group cursor-pointer flex-1 sm:flex-none">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
          <div
            className={`flex items-center gap-3 px-6 py-3.5 border rounded-2xl transition-all group-hover:shadow-lg ${
              isDark
                ? "bg-gray-700/50 border-gray-600 text-gray-300 group-hover:bg-gray-700"
                : "bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-white"
            } group-hover:border-blue-500 group-hover:shadow-blue-500/5`}
          >
            <div className={isDark ? "text-blue-400" : "text-blue-600"}>
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
                  strokeWidth={2.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span
              className={`font-black text-xs uppercase tracking-widest transition-colors ${
                isDark
                  ? "text-gray-300 group-hover:text-blue-400"
                  : "text-slate-600 group-hover:text-blue-600"
              }`}
            >
              Import Excel
            </span>
          </div>
        </label>

        {/* PARSED DATA STATE */}
        {parsedData.length > 0 && (
          <div className="flex-1 w-full animate-in slide-in-from-left-4 duration-500">
            <div
              className={`flex items-center justify-between border-2 p-2 pl-5 rounded-2xl shadow-xl ${
                isDark
                  ? "bg-gray-800 border-emerald-500/30"
                  : "bg-white border-emerald-500/20"
              } shadow-emerald-500/5`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p
                    className={`font-black text-xs truncate max-w-[150px] ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {fileName}
                  </p>
                </div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-tighter ${
                    isDark ? "text-gray-500" : "text-slate-400"
                  }`}
                >
                  {parsedData.length} records ready
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setParsedData([]);
                    setFileName("");
                  }}
                  className={`px-4 py-2 font-bold text-xs transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK TIP (Only when empty) */}
      {parsedData.length === 0 && (
        <p
          className={`mt-3 ml-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
            isDark ? "text-gray-500" : "text-slate-400"
          }`}
        >
          <span className="text-blue-500">★</span> Max 500 rows per import
        </p>
      )}
    </div>
  );
};

export default ExcelUpload;