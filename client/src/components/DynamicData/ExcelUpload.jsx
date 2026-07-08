import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const MAX_ROWS = 500;

const ExcelUpload = ({ onProceed, isDark, importProgress }) => {
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef(null);

  const isImporting = !!importProgress;

  const resetState = () => {
    setParsedData([]);
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFile = (file) => {
    if (!file) return;

    const validExt = /\.(xlsx|xls)$/i.test(file.name);
    if (!validExt) {
      setError("Please upload a valid Excel file (.xlsx or .xls).");
      return;
    }

    setError("");
    setIsParsing(true);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (json.length === 0) {
          setError("This file doesn't contain any rows to import.");
          setParsedData([]);
          setIsParsing(false);
          return;
        }

        if (json.length > MAX_ROWS) {
          setError(
            `This file has ${json.length} rows. Only the first ${MAX_ROWS} will be imported (max ${MAX_ROWS} rows per import).`,
          );
          setParsedData(json.slice(0, MAX_ROWS));
        } else {
          setParsedData(json);
        }
      } catch (err) {
        console.error("Excel parse failed", err);
        setError(
          "Couldn't read this file. Please check it's a valid Excel spreadsheet.",
        );
        setParsedData([]);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsParsing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFile = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isImporting) return;
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleProceed = () => {
    if (parsedData.length === 0 || isImporting) return;
    onProceed(parsedData);
  };

  const previewColumns =
    parsedData.length > 0 ? Object.keys(parsedData[0]).slice(0, 4) : [];

  return (
    <div
      className={`rounded-2xl p-1 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* DROP ZONE / FILE PICKER */}
        {parsedData.length === 0 && (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              if (!isImporting) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative group flex flex-col sm:flex-row items-center justify-center gap-3 px-6 py-8 sm:py-6 border-2 border-dashed rounded-2xl transition-all text-center sm:text-left ${
              isImporting ? "opacity-60 pointer-events-none" : "cursor-pointer"
            } ${
              isDragging
                ? isDark
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-blue-500 bg-blue-50/60"
                : isDark
                  ? "bg-gray-700/50 border-gray-600 group-hover:bg-gray-700"
                  : "bg-slate-50 border-slate-200 group-hover:bg-white"
            } group-hover:border-blue-500`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="hidden"
              disabled={isImporting || isParsing}
            />
            <div className={isDark ? "text-blue-400" : "text-blue-600"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-6 sm:w-6"
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
            <div>
              <p
                className={`font-black text-xs uppercase tracking-widest ${
                  isDark
                    ? "text-gray-300 group-hover:text-blue-400"
                    : "text-slate-600 group-hover:text-blue-600"
                }`}
              >
                {isParsing ? "Reading file..." : "Import Excel"}
              </p>
              <p
                className={`text-[11px] font-medium mt-1 ${
                  isDark ? "text-gray-500" : "text-slate-400"
                }`}
              >
                Drag & drop a .xlsx / .xls file here, or click to browse · max{" "}
                {MAX_ROWS} rows
              </p>
            </div>
          </label>
        )}

        {/* ERROR / WARNING BANNER */}
        {error && (
          <div
            className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs font-semibold ${
              isDark
                ? "bg-amber-900/30 border-amber-800 text-amber-300"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* PARSED DATA STATE */}
        {parsedData.length > 0 && (
          <div className="w-full animate-in slide-in-from-bottom-2 duration-500 space-y-3">
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 p-4 rounded-2xl shadow-xl ${
                isDark
                  ? "bg-gray-800 border-emerald-500/30"
                  : "bg-white border-emerald-500/20"
              } shadow-emerald-500/5`}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <p
                    className={`font-black text-xs truncate ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {fileName}
                  </p>
                </div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-tighter mt-0.5 ${
                    isDark ? "text-gray-500" : "text-slate-400"
                  }`}
                >
                  {parsedData.length} record{parsedData.length !== 1 ? "s" : ""}{" "}
                  ready
                  {previewColumns.length > 0 && (
                    <span className="normal-case font-medium tracking-normal">
                      {" "}
                      · columns: {previewColumns.join(", ")}
                      {Object.keys(parsedData[0]).length > 4 ? "…" : ""}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={resetState}
                  disabled={isImporting}
                  className={`px-4 py-2.5 font-bold text-xs transition-colors disabled:opacity-40 ${
                    isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  disabled={isImporting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importing {importProgress.current}/{importProgress.total}
                    </>
                  ) : (
                    "Proceed"
                  )}
                </button>
              </div>
            </div>

            {/* IMPORT PROGRESS BAR */}
            {isImporting && (
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isDark ? "bg-gray-700" : "bg-slate-100"
                }`}
              >
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (importProgress.current / importProgress.total) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* QUICK TIP (Only when empty) */}
        {parsedData.length === 0 && !error && (
          <p
            className={`ml-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
              isDark ? "text-gray-500" : "text-slate-400"
            }`}
          >
            <span className="text-blue-500">★</span> New columns are created
            automatically as TEXT fields
          </p>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
