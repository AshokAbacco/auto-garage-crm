import React, { useState } from "react";
import {
  Scan,
  Camera,
  Upload,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const OCRScanner = () => {
  const { isDark } = useTheme();

  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);

    setImage(imgUrl);
    setText(""); // reset previous OCR results
  };

  const simulateOCR = () => {
    setLoading(true);

    setTimeout(() => {
      setText(
        "Sample OCR Text:\n\nName: Rajesh Kumar\nBike: Royal Enfield Classic 350\nService: Engine Repair\nDate: 02 Dec 2025\n\n(This is dummy extracted text — you can connect real OCR later.)"
      );
      setLoading(false);
    }, 2000);
  };

  const clearAll = () => {
    setImage(null);
    setText("");
    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100"
      }`}
    >
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
          OCR Scanner
        </h1>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Scan bills, invoices, RC documents & extract text instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Preview Box */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-5 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Upload Document
          </h2>

          {!image ? (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-16 cursor-pointer transition-all ${
                isDark
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-orange-300 hover:bg-orange-50"
              }`}
            >
              <Upload className="w-12 h-12 text-orange-600 mb-3" />
              <p
                className={`text-lg ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Click to upload image
              </p>
              <p className="text-sm text-gray-400">PNG, JPG, JPEG</p>

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <img
                src={image}
                alt="Uploaded"
                className="w-full rounded-xl shadow-md"
              />

              <div className="flex gap-3">
                <button
                  onClick={simulateOCR}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium transition-all ${
                    loading
                      ? "bg-gray-500"
                      : "bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Scan className="w-5 h-5" />
                  )}
                  {loading ? "Scanning..." : "Scan OCR"}
                </button>

                <button
                  onClick={clearAll}
                  className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OCR Extracted Text Box */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-5 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Extracted Text
          </h2>

          {!text ? (
            <div
              className={`flex flex-col items-center justify-center h-64 rounded-xl border border-dashed ${
                isDark ? "border-gray-600" : "border-orange-300"
              }`}
            >
              <FileText className="w-12 h-12 text-orange-600 mb-3" />
              <p className="text-gray-500">No text extracted yet</p>
            </div>
          ) : (
            <textarea
              value={text}
              readOnly
              className={`w-full h-80 rounded-xl p-4 outline-none resize-none font-mono shadow-inner ${
                isDark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            ></textarea>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OCRScanner;
