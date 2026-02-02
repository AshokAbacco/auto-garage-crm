import { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUpload = ({ onProceed }) => {
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
    <div className="bg-white rounded-2xl p-1">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* CUSTOM FILE INPUT BUTTON */}
        <label className="relative group cursor-pointer flex-1 sm:flex-none">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl transition-all group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/5">
            <div className="text-blue-600">
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
            <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-blue-600 transition-colors">
              Import Excel
            </span>
          </div>
        </label>

        {/* PARSED DATA STATE */}
        {parsedData.length > 0 && (
          <div className="flex-1 w-full animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between bg-white border-2 border-emerald-500/20 p-2 pl-5 rounded-2xl shadow-xl shadow-emerald-500/5">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="font-black text-slate-900 text-xs truncate max-w-[150px]">
                    {fileName}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {parsedData.length} records ready
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setParsedData([]);
                    setFileName("");
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 active:scale-95"
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
        <p className="mt-3 ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="text-blue-500">★</span> Max 500 rows per import
        </p>
      )}
    </div>
  );
};

export default ExcelUpload;
