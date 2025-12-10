import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { toast, Toaster } from "react-hot-toast";
 
import OCRUploader from "../../pages/details/components/OCRUploader.jsx";
import OCRResults from "../../pages/details/components/OCRResults.jsx";
import OCRHistory from "../../pages/details/components/OCRHistory.jsx";
import OCRDebugPanel from "../../pages/details/components/OCRDebugPanel.jsx";
import { processImage } from "../../pages/details/utils/OCRProcessor.js";
import {
  saveRecord,
  loadHistory,
  deleteRecord,
  clearHistory,
} from "../../pages/details/utils/storageUtils.js";

import {
  FiFileText,
  FiCheckCircle,
  FiUsers,
  FiAlertTriangle,
  FiLoader,
  FiCamera,
  FiDatabase,
  FiSettings,
  FiRefreshCw,
  FiUpload,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const OCRScanner = () => {
  const { isDark } = useTheme();

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientList, setClientList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientError, setClientError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [rawOcrText, setRawOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("idle");
  const [debugInfo, setDebugInfo] = useState({});
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const processingRef = useRef(false);

  /* ---------------- LOAD CLIENTS ---------------- */
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        setClientList(Array.isArray(data) ? data : data.clients || []);
      } catch (err) {
        setClientError("Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  /* ---------------- LOAD HISTORY ---------------- */
  useEffect(() => {
    if (!clientId) return;
    loadHistory(clientId).then(setHistoryData);
  }, [clientId]);

  /* ---------------- START OCR ---------------- */
  const handleStartOCR = async (image) => {
    if (!image || processingRef.current) return;
    processingRef.current = true;

    setError(null);
    setOcrProgress(0);
    setOcrStatus("Starting OCR...");

    try {
      const result = await processImage(image, (progress) => {
        setOcrProgress(Math.round(progress * 100));
        setOcrStatus(`Processing... ${Math.round(progress * 100)}%`);
      });

      setParsedData(result.parsed);
      setRawOcrText(result.text);

      setDebugInfo({
        confidence: result.confidence,
        quality:
          result.confidence >= 80
            ? "High"
            : result.confidence >= 60
            ? "Medium"
            : "Low",
        extractedFields: Object.values(result.parsed).filter(Boolean).length,
      });

      setOcrStatus("done");
    } catch (err) {
      setError("OCR Failed");
      setOcrStatus("error");
    } finally {
      processingRef.current = false;
    }
  };

  /* ---------------- SAVE OCR ---------------- */
  const handleSave = async (data) => {
    if (!clientId) {
      toast.error("Select client first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/ocr/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          rawText: rawOcrText,
          parsedData: JSON.stringify(data),
          confidence: debugInfo.confidence || 0,
        }),
      });

      const { record } = await res.json();
      setHistoryData((prev) => [...prev, record]);
      setIsSaved(true);
      toast.success("Saved Successfully");
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      toast.error("Save Failed");
    }
  };

  /* ---------------- RESET ---------------- */
  const handleReset = () => {
    setSelectedImage(null);
    setParsedData(null);
    setRawOcrText("");
    setEditedData({});
    setError(null);
    setOcrProgress(0);
    setOcrStatus("idle");
    setDebugInfo({});
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="rounded-3xl p-8 shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white mb-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="bg-white/20 p-4 rounded-2xl">
              <FiFileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">OCR Scanner Pro</h1>
              <p className="text-white/80">RC & Document Scanner</p>

              {clientId ? (
                <div className="mt-2 bg-green-500/20 px-3 py-1 rounded-lg flex gap-2 items-center text-green-200">
                  <FiCheckCircle /> Linked: {clientName}
                </div>
              ) : (
                <div className="mt-2 bg-yellow-500/20 px-3 py-1 rounded-lg flex gap-2 items-center text-yellow-200">
                  <FiAlertTriangle /> Select Client
                </div>
              )}
            </div>
          </div>

          {isSaved && (
            <div className="bg-green-500 px-4 py-2 rounded-xl flex items-center gap-2">
              <FiCheckCircle /> Saved
            </div>
          )}
        </div>

        {/* CLIENT SELECT */}
        <div className="mt-6">
          {loadingClients ? (
            <p className="text-white flex gap-2 items-center">
              <FiLoader className="animate-spin" /> Loading clients...
            </p>
          ) : (
            <select
              value={clientId}
              onChange={(e) => {
                const c = clientList.find(
                  (x) => x.id === Number(e.target.value)
                );
                setClientId(c?.id || "");
                setClientName(c?.fullName || "");
              }}
              className="px-4 py-2 rounded-lg bg-white/20 text-white border w-full sm:w-auto"
            >
              <option value="">Select Client</option>
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.vehicleModel})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* UPLOADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiCamera />
          <h2 className="text-xl font-bold">Upload Document</h2>
        </div>

        <OCRUploader
          isDark={isDark}
          onImageSelect={setSelectedImage}
          onImageCaptured={handleStartOCR}
          selectedImage={selectedImage}
          onReset={handleReset}
        />
      </div>

      {/* PROGRESS */}
      {ocrStatus !== "idle" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl mb-6">
          <div className="flex justify-between mb-2">
            <span>{ocrStatus}</span>
            <span>{ocrProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-300 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* RESULTS */}
      {parsedData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
          <div className="flex gap-2 items-center mb-4">
            <FiDatabase />
            <h2 className="text-xl font-bold">OCR Results</h2>
          </div>

          <OCRResults
            isDark={isDark}
            parsedData={parsedData}
            rawOcrText={rawOcrText}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editedData={editedData}
            setEditedData={setEditedData}
            onSave={handleSave}
          />
        </div>
      )}

      {/* DEBUG */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
        <div className="flex gap-2 items-center mb-4">
          <FiSettings />
          <h2 className="text-xl font-bold">Debug Info</h2>
        </div>
        <OCRDebugPanel isDark={isDark} debugInfo={debugInfo} />
      </div>

      {/* HISTORY */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
        <div className="flex gap-2 items-center mb-4">
          <FiDatabase />
          <h2 className="text-xl font-bold">OCR History</h2>
        </div>

        <OCRHistory
          isDark={isDark}
          historyData={historyData}
          onDelete={async (id) => {
            await deleteRecord(id);
            setHistoryData(await loadHistory(clientId));
          }}
          onClear={async () => {
            await clearHistory(clientId);
            setHistoryData([]);
          }}
        />
      </div>

      {/* RESET */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl flex gap-2 items-center"
        >
          <FiRefreshCw /> New Scan
        </button>
      </div>

      <div className="text-center text-sm mt-6 text-gray-400">
        <FiUpload className="inline mr-2" /> OCR Powered by Tesseract.js
      </div>
    </div>
  );
};

export default OCRScanner;
