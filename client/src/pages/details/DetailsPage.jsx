import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import OCRUploader from "./components/OCRUploader";
import OCRResults from "./components/OCRResults";
import OCRHistory from "./components/OCRHistory";
import OCRDebugPanel from "./components/OCRDebugPanel";
import { processImage } from "./utils/OCRProcessor.js";
import {
  saveRecord,
  loadHistory,
  deleteRecord,
  clearHistory,
} from "./utils/storageUtils";
import {
  FiFileText,
  FiCheckCircle,
  FiRotateCcw,
  FiUsers,
  FiAlertTriangle,
  FiLoader,
  FiCamera,
  FiUpload,
  FiDatabase,
  FiSettings,
  FiRefreshCw,
  FiTrash2,
  FiSave,
} from "react-icons/fi";

import { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DetailsPage = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const urlClientId = searchParams.get("clientId");
  const urlClientName = searchParams.get("clientName");

  const [clientId, setClientId] = useState(urlClientId || "");
  const [clientName, setClientName] = useState(urlClientName || "");
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

  const [dailyUsage, setDailyUsage] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const processingRef = useRef(false);

  // Use the same color configuration as Layout.js
  const colors = useMemo(
    () => ({
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
      elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    }),
    [isDark],
  );

  /* -----------------------------------------------------
   🧭 Load clients (if not auto-linked)
  ----------------------------------------------------- */
  useEffect(() => {
    const fetchClients = async () => {
      if (urlClientId) return;

      setLoadingClients(true);
      setClientError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again.",
          );
        }

        console.log("Fetching clients from:", `${API_BASE}/api/clients`);
        const res = await fetch(`${API_BASE}/api/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server response:", res.status, errorText);
          throw new Error(`Failed to load clients: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        console.log("Received data:", data);

        let clientsArray = [];
        if (Array.isArray(data)) {
          clientsArray = data;
        } else if (data && Array.isArray(data.clients)) {
          clientsArray = data.clients;
        } else if (data && Array.isArray(data.data)) {
          clientsArray = data.data;
        } else {
          console.warn("Unexpected data format:", data);
          throw new Error("Unexpected data format from server");
        }

        setClientList(clientsArray);
        console.log(`Loaded ${clientsArray.length} clients`);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setClientError(err.message);
        setClientList([]);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, [urlClientId]);

  /* -----------------------------------------------------
   🧠 Load OCR history for this client
  ----------------------------------------------------- */
  useEffect(() => {
    const fetchHistory = async () => {
      if (!clientId) return;

      try {
        const data = await loadHistory(clientId);
        setHistoryData(data);
      } catch (err) {
        console.error("Error loading OCR history:", err);
      }
    };

    fetchHistory();
  }, [clientId]);

  // ----------------------------------------------------------
  // 🚀 Start OCR Process (with plan limit check)
  // ----------------------------------------------------------
  const handleStartOCR = async (image) => {
    if (!image || processingRef.current) return;

    // PLAN LIMIT CHECK
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user?.plan === "BASIC" && dailyUsage >= 10) {
      setShowUpgrade(true);
      return;
    }

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
      setError(`OCR failed: ${err.message}`);
      setOcrStatus("error");
    } finally {
      processingRef.current = false;
    }
  };

  // ----------------------------------------------------------
  // 💾 Save OCR Result (update daily usage)
  // ----------------------------------------------------------
  const handleSave = async (data) => {
    try {
      if (!clientId) {
        toast.error("Please select or open a client to save OCR data.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

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

      // Duplicate RC
      if (res.status === 400) {
        const errorData = await res.json();
        if (errorData.duplicate) {
          toast.error(`Duplicate! RC registered to ${errorData.clientName}`);
          return;
        }
      }

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Failed to save record");
      }

      const { record } = await res.json();

      // --------------------------
      // UPDATE OCR DAILY LIMIT
      // --------------------------
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user?.plan === "BASIC") {
        const today = new Date().toLocaleDateString();
        const usageData = JSON.parse(localStorage.getItem("ocr_usage") || "{}");

        const newCount =
          usageData.date === today ? (usageData.count || 0) + 1 : 1;

        localStorage.setItem(
          "ocr_usage",
          JSON.stringify({ date: today, count: newCount }),
        );

        setDailyUsage(newCount);
      }

      setHistoryData((prev) => [...prev, record]);
      setIsSaved(true);
      toast.success("OCR data saved successfully!");

      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -----------------------------------------------------
   🔄 Reset OCR process
  ----------------------------------------------------- */
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

  // Load daily OCR usage from localStorage
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const usageData = JSON.parse(localStorage.getItem("ocr_usage") || "{}");

    if (usageData.date !== today) {
      // Reset for new day
      localStorage.setItem(
        "ocr_usage",
        JSON.stringify({ date: today, count: 0 }),
      );
      setDailyUsage(0);
    } else {
      setDailyUsage(usageData.count || 0);
    }
  }, []);

  return (
    <div
      className="mspace-y-6 lg:ml-16"
      style={{ backgroundColor: colors.mainBg }}
    >
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: colors.elementBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: "0.75rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: colors.elementBg,
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: colors.elementBg,
              },
            },
          }}
        />
      </div>

      <div className=" mx-auto space-y-6 sm:space-y-8 ">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl bg-gradient-to-r from-blue-900 to-blue-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                <FiFileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
                  RC Scanner Pro
                </h1>
                <p style={{ color: "white/80", fontSize: "1rem" }}>
                  OCR-based RC extraction — now linked with backend
                </p>

                {/* Client Info */}
                {clientId ? (
                  <div className="mt-3 flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-400/30 w-fit">
                    <FiCheckCircle style={{ color: "#86EFAC" }} />
                    <span
                      style={{
                        color: "#86EFAC",
                        fontSize: "0.875rem",
                        fontWeight: "medium",
                      }}
                    >
                      Linked to: {clientName || "Selected Client"}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-400/30 w-fit">
                    <FiAlertTriangle style={{ color: "#FDE047" }} />
                    <span
                      style={{
                        color: "#FDE047",
                        fontSize: "0.875rem",
                        fontWeight: "medium",
                      }}
                    >
                      Please select a client before saving
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isSaved && (
              <div className="bg-green-500/20 border-2 border-green-400 text-white px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                <FiCheckCircle /> <span>Saved!</span>
              </div>
            )}
          </div>

          {/* Manual client selection */}
          {!urlClientId && (
            <div
              className="mt-6"
              style={{
                backgroundColor: colors.elementBg,
                border: `1px solid ${colors.border}`,
                borderRadius: "0.75rem",
                padding: "1rem",
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div
                  className="flex items-center gap-2"
                  style={{ color: colors.textPrimary }}
                >
                  <FiUsers className="text-lg" />
                  <span style={{ fontWeight: "medium" }}>Select Client:</span>
                </div>

                {loadingClients ? (
                  <div
                    className="flex items-center gap-2"
                    style={{ color: colors.textPrimary }}
                  >
                    <FiLoader className="animate-spin" />
                    <span>Loading clients...</span>
                  </div>
                ) : clientError ? (
                  <div
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#FEF2F2",
                      color: "#DC2626",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {clientError}
                  </div>
                ) : (
                  <select
                    value={clientId}
                    onChange={(e) => {
                      const selected = clientList.find(
                        (c) => c.id === parseInt(e.target.value),
                      );
                      setClientId(selected?.id || "");
                      setClientName(selected?.fullName || "");
                    }}
                    style={{
                      backgroundColor: colors.elementBg,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                      width: "100%",
                      maxWidth: "200px",
                      outline: "none",
                    }}
                  >
                    <option
                      value=""
                      style={{
                        backgroundColor: colors.elementBg,
                        color: colors.textPrimary,
                      }}
                    >
                      Select Client
                    </option>
                    {clientList.length > 0 ? (
                      clientList.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          style={{
                            backgroundColor: colors.elementBg,
                            color: colors.textPrimary,
                          }}
                        >
                          {c.fullName} ({c.vehicleMake} {c.vehicleModel})
                        </option>
                      ))
                    ) : (
                      <option
                        value=""
                        disabled
                        style={{
                          backgroundColor: colors.elementBg,
                          color: colors.textPrimary,
                        }}
                      >
                        No clients available
                      </option>
                    )}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload or Camera */}
        <div
          className="rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 flex items-center justify-center text-white">
              <FiCamera />
            </div>
            <h2
              style={{
                color: colors.textPrimary,
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              Capture RC Document
            </h2>
          </div>

          <OCRUploader
            isDark={isDark}
            onImageSelect={setSelectedImage}
            onImageCaptured={handleStartOCR}
            selectedImage={selectedImage}
            onReset={handleReset}
          />
        </div>

        {/* Progress Bar */}
        {ocrStatus !== "idle" && (
          <div
            className="rounded-2xl p-6 shadow-xl transition-all duration-300"
            style={{
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiLoader
                  className={`text-lg ${
                    ocrStatus === "error" ? "text-red-500" : "text-blue-500"
                  } ${
                    ocrStatus !== "error" && ocrStatus !== "done"
                      ? "animate-spin"
                      : ""
                  }`}
                />
                <span
                  className={`font-medium ${
                    ocrStatus === "error"
                      ? "text-red-500"
                      : isDark
                        ? "text-blue-300"
                        : "text-blue-700"
                  }`}
                >
                  {ocrStatus}
                </span>
              </div>
              <span
                className={`font-semibold ${
                  isDark ? "text-blue-300" : "text-blue-700"
                }`}
              >
                {ocrProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  ocrStatus === "error"
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-blue-600 to-purple-600"
                }`}
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {parsedData && (
          <div
            className="rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
            style={{ backgroundColor: colors.elementBg }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white">
                <FiDatabase />
              </div>
              <h2
                style={{
                  color: colors.textPrimary,
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                }}
              >
                OCR Results
              </h2>
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

        {/* Debug Info */}
        <div
          className="rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white">
              <FiSettings />
            </div>
            <h2
              style={{
                color: colors.textPrimary,
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              Debug Information
            </h2>
          </div>

          <OCRDebugPanel isDark={isDark} debugInfo={debugInfo} />
        </div>

        {/* History */}
        <div
          className="rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <FiDatabase />
            </div>
            <h2
              style={{
                color: colors.textPrimary,
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              OCR History
            </h2>
          </div>

          <OCRHistory
            isDark={isDark}
            historyData={historyData}
            onDelete={async (id) => {
              await deleteRecord(id);
              const data = await loadHistory(clientId);
              setHistoryData(data);
              toast.success("Record deleted successfully");
            }}
            onClear={async () => {
              await clearHistory(clientId);
              setHistoryData([]);
              toast.success("History cleared successfully");
            }}
          />
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <FiRefreshCw /> New Scan
          </button>
        </div>

        <div
          className="text-center text-sm py-4"
          style={{ color: colors.textSecondary }}
        >
          <div className="flex items-center justify-center gap-2">
            <FiUpload className="text-lg" />
            <span>
              Powered by Tesseract.js — OCR processed locally, results stored in
              backend
            </span>
          </div>
        </div>
      </div>
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className={`relative max-w-md w-full transform transition-all duration-300 scale-100 animate-slideUp ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Decorative element */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>

            <div className="pt-16 pb-6 px-8">
              <h2 className="text-2xl font-bold text-center mb-2">
                Daily OCR Limit Reached
              </h2>

              <div
                className={`my-6 p-4 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Current Plan
                  </span>
                  <span className="text-sm font-semibold">Basic</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  10/10 scans used today
                </p>
              </div>

              <p
                className={`text-center mb-6 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Upgrade to{" "}
                <span className="font-semibold">Standard or Premium</span> for
                unlimited scanning and additional features.
              </p>

              {/* Feature comparison */}
              <div
                className={`grid grid-cols-2 gap-4 mb-6 ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                } rounded-lg p-4`}
              >
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-blue-600">Standard</h3>
                  <ul
                    className={`text-sm space-y-1 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <li className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Unlimited OCR
                    </li>
                    <li className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Priority Support
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-purple-600">
                    Premium
                  </h3>
                  <ul
                    className={`text-sm space-y-1 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <li className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      All Standard
                    </li>
                    <li className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Advanced Features
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => (window.location.href = "/upgrade")}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowUpgrade(false)}
              className={`absolute top-4 right-4 rounded-full p-1 transition-colors duration-200 ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DetailsPage;
