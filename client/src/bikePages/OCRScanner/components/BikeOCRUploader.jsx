// client/src/pages/details/components/OCRUploader.jsx
import React, { useRef, useState } from "react";
import { FiUpload, FiCamera, FiX } from "react-icons/fi";
import CameraComponent from "./BikeCameraComponent.jsx";

const OCRUploader = ({
  isDark,
  onImageSelect,
  onImageCaptured,
  selectedImage,
  onReset,
}) => {
  const fileInputRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelect(event.target.result);
      onImageCaptured(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-lg ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      {/* If image already selected → show preview */}
      {selectedImage ? (
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-80 object-contain"
          />
          <button
            onClick={onReset}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          >
            <FiX />
          </button>
        </div>
      ) : cameraOpen ? (
        /* Camera Mode */
        <CameraComponent
          onCapture={(img) => {
            setCameraOpen(false);
            onImageSelect(img);
            onImageCaptured(img);
          }}
          onStop={() => setCameraOpen(false)}
        />
      ) : (
        /* Upload UI + Camera Button */
        <div
          onClick={() => fileInputRef.current.click()}
          className={`border-dashed border-2 rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDark
              ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 hover:border-blue-500"
              : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-500"
          }`}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FiUpload className="text-white" size={32} />
          </div>

          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
            Upload RC Document
          </h3>

          <p className="text-gray-500 mb-4">(JPG / PNG)</p>

          {/* Upload Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Browse File
          </button>

          {/* Camera Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCameraOpen(true);
            }}
            className="mt-4 ml-3 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2"
          >
            <FiCamera size={18} /> Use Camera
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default OCRUploader;
