// ClientForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiSave, FiX, FiCamera } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

import PersonalInfoSection from "./components/PersonalInfoSection";
import VehicleInfoSection from "./components/VehicleInfoSection";
import ImageUploader from "./components/ImageUploader";

import { processImage } from "../details/utils/OCRProcessor.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  regNumber: "",
  vin: "",
  color: "",
  fuel: "",
  seats: "",
  notes: "",
  carImage: "",
  adImage: "",
  damageImages: [],
};

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [isProcessingRC, setIsProcessingRC] = useState(false);

  // carMakes: [{ make, slug, logoUrl }]
  const [carMakes, setCarMakes] = useState([]);
  // carModels: [{ id, name, thumbnailUrl, heroUrl, yearVariants }]
  const [carModels, setCarModels] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [seatOptions, setSeatOptions] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // -------------------------------
  // SMART NORMALIZATION HELPERS (OCR)
  // -------------------------------
  const CLEANWORDS = [
    "india",
    "ltd",
    "limited",
    "pvt",
    "private",
    "motors",
    "motor",
    "automobiles",
    "automobile",
    "company",
  ];

  const normalizeText = (s = "") =>
    s.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

  const cleanBrand = (s = "") => {
    let t = s.toLowerCase();
    CLEANWORDS.forEach((w) => (t = t.replace(w, "")));
    return t.replace(/[^a-z]/gi, "").trim();
  };

  const cleanModel = (s = "") =>
    s.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

  const levenshtein = (a, b) => {
    const matrix = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  };

  const fuzzyMatch = (input, list) => {
    if (!input || list.length === 0) return "";

    const target = normalizeText(input);

    let bestMatch = "";
    let bestScore = Infinity;

    list.forEach((item) => {
      const norm = normalizeText(item);
      const dist = levenshtein(target, norm);
      if (dist < bestScore) {
        bestScore = dist;
        bestMatch = item;
      }
    });

    return bestMatch;
  };

  const normalizeReg = (s = "") =>
    String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");

  const extractFuel = (s = "") => {
    const parts = s
      .split(/\/|,| |-|\(|\)/)
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    const fuels = ["petrol", "diesel", "cng", "electric", "hyb"];
    const found = parts.find((p) => fuels.includes(p));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : "";
  };

  const extractSeats = (s = "") => {
    const m = s.match(/\b[2-9]\b/);
    return m ? m[0] : "";
  };

  // -------------------------------
  // SMART OCR → FORM MAPPER
  // -------------------------------
  const mapOcrToForm = async (parsed = {}) => {
    let newData = { ...form };

    const grab = (keys) => {
      for (let k of keys) {
        if (parsed[k]) return parsed[k];
        const found = Object.keys(parsed).find((x) =>
          x.toLowerCase().includes(k.toLowerCase())
        );
        if (found) return parsed[found];
      }
      return "";
    };

    // BASIC FIELDS
    newData.regNumber = normalizeReg(grab(["reg", "registration"]));
    newData.fullName = grab(["owner"]);
    newData.address = grab(["address"]);
    newData.vin = grab(["vin", "chassis"])?.toUpperCase();

    // YEAR
    const y = grab(["year", "mfg"]);
    const ym = String(y).match(/\b(19|20)\d{2}\b/);
    if (ym) newData.vehicleYear = ym[0];

    // COLOR
    newData.color = grab(["color"]);

    // FUEL
    newData.fuel = extractFuel(grab(["fuel"]));

    // SEATS
    newData.seats = extractSeats(grab(["seat", "seating"]));

    // MAKE (SMART)
    const rawMake = grab(["make", "manufacturer", "maker", "brand"]);
    const cleanedMake = cleanBrand(rawMake);

    const makeNames = carMakes.map((m) => m.make);

    const directMakeObj =
      carMakes.find((m) => cleanBrand(m.make).includes(cleanedMake)) || null;

    const fuzzyMakeName = fuzzyMatch(rawMake, makeNames);
    const selectedMakeName = directMakeObj?.make || fuzzyMakeName;

    newData.vehicleMake = selectedMakeName || rawMake;

    // MODEL (SMART)
    const rawModel = grab(["model", "variant"]);
    let bestModelName = rawModel;

    if (selectedMakeName) {
      try {
        const models = await fetchCarModels(selectedMakeName);
        const justNames = (models || []).map((m) => m.name);
        const bestModel = fuzzyMatch(rawModel, justNames);
        bestModelName = bestModel || rawModel;
      } catch (err) {
        console.error("Model match error:", err);
        bestModelName = rawModel;
      }
    }

    newData.vehicleModel = bestModelName;

    return newData;
  };

  // -------------------------------
  // RC FILE HANDLER
  // -------------------------------
  const handleRCFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRC(true);

    try {
      const blobURL = URL.createObjectURL(file);
      const img = new Image();

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg");

        const ocr = await processImage(dataUrl);

        const mapped = await mapOcrToForm(ocr?.parsed || {});

        // Merge OCR result into form (user can still manually edit afterwards)
        setForm((prev) => ({ ...prev, ...mapped }));

        toast.success("RC scanned — details auto-filled!");
      };

      img.src = blobURL;
    } catch (err) {
      console.error(err);
      toast.error("RC scan failed");
    } finally {
      setIsProcessingRC(false);
      e.target.value = "";
    }
  };

  // -------------------------------
  // LOAD META (fuel + seats)
  // -------------------------------
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/cars/meta`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setFuelTypes(data.fuelTypes || []);
        setSeatOptions(data.seats || []);
      } catch (err) {
        console.error("Meta load error", err);
      }
    };

    loadMeta();
  }, []);


  // -------------------------------
  // LOAD EXISTING CLIENT (EDIT MODE)
  // -------------------------------
  useEffect(() => {
    if (!id) return; // Not editing

    const loadClient = async () => {
      try {
        setLoadingClient(true);

        // 1. Try reading React Router passed state
        if (location.state?.clientData) {
          setForm(prev => ({
            ...prev,
            ...location.state.clientData
          }));

          // Load models for correct make
          if (location.state.clientData.vehicleMake) {
            await fetchCarModels(location.state.clientData.vehicleMake);
          }

          setLoadingClient(false);
          return; // STOP — skip backend fetch
        }

        // 2. If page refreshed OR state missing → fetch from backend
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        setForm(prev => ({
          ...prev,
          ...data
        }));

        if (data.vehicleMake) {
          await fetchCarModels(data.vehicleMake);
        }
      } catch (err) {
        console.error("Edit load failed:", err);
        toast.error("Failed to load client for editing");
      } finally {
        setLoadingClient(false);
      }
    };

    loadClient();
  }, [id, location.state]);


  // -------------------------------
  // LOAD MAKES (local)
  // -------------------------------
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/cars/local-makes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        // keep full objects for logo, slug, etc.
        setCarMakes(data.makes || []);
      } catch (err) {
        console.error("Makes load error", err);
      }
    };

    loadMakes();
  }, []);

  // -------------------------------
  // LOAD MODELS WHEN MAKE SELECTED
  // -------------------------------
  const fetchCarModels = async (makeName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/cars/local-models?make=${encodeURIComponent(
          makeName
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const models = (data.models || []).map((m, i) => ({
        id: i + 1,
        name: m.name,
        thumbnailUrl: m.thumbnailUrl,
        heroUrl: m.heroUrl,
        yearVariants: m.yearVariants || {},
      }));

      setCarModels(models);
      return models;
    } catch (e) {
      console.log("Models load error", e);
      return [];
    }
  };

  // -------------------------------
  // AUTO LOAD CAR IMAGE FROM LOCAL DATASET
  // -------------------------------
  useEffect(() => {
    const make = form.vehicleMake;
    const model = form.vehicleModel;
    const year = form.vehicleYear;

    if (!make || !model) return;

    const loadLocalImage = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/api/cars/local-image?make=${encodeURIComponent(
            make
          )}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(
            year || ""
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();

        if (res.ok) {
          setForm((prev) => ({
            ...prev,
            carImage: data.heroUrl || data.thumbnailUrl || prev.carImage,
          }));
        }
      } catch (err) {
        console.error("Local image fetch error", err);
      }
    };

    loadLocalImage();
  }, [form.vehicleMake, form.vehicleModel, form.vehicleYear]);

  // -------------------------------
  // SAVE CLIENT
  // -------------------------------
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/clients${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Save failed");

      toast.success("Client saved!");
      navigate("/clients");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // LOADING UI
  // -------------------------------
  if (loadingClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // -------------------------------
  // MAIN UI
  // -------------------------------
  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      // 🛑 DISABLE RIGHT CLICK ON ENTIRE PAGE
      onContextMenu={(e) => e.preventDefault()}
    >
      <Toaster position="top-right" />

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
        {/* Hidden Inputs for RC */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleRCFile}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleRCFile}
        />

        {/* Header */}
        <div
          className={`rounded-3xl p-8 shadow-lg flex items-center justify-between ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          <div>
            <h1 className="text-3xl font-bold">
              {id ? "Edit Client" : "New Client"}
            </h1>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Manage customer & vehicle details
            </p>
          </div>

          {user?.plan !== "BASIC" ? (
            <button
              type="button"
              onClick={() =>
                navigator.mediaDevices?.getUserMedia
                  ? cameraInputRef.current.click()
                  : fileInputRef.current.click()
              }
              disabled={isProcessingRC}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 text-white shadow-md ${isDark
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-500 hover:bg-indigo-600"
                }`}
            >
              <FiCamera />
              {isProcessingRC ? "Scanning..." : "Scan RC"}
            </button>
          ) : (
            <p className="text-sm text-red-500 font-medium">
              RC Auto-fill is for Standard & Premium plans.
            </p>
          )}
        </div>

        {/* Personal Info */}
        <div >
          <PersonalInfoSection form={form} setForm={setForm} isDark={isDark} />
        </div>

        {/* Vehicle Info */}
        <div>

          <VehicleInfoSection
            form={form}
            setForm={setForm}
            isDark={isDark}
            userPlan={user?.plan}
            carMakes={carMakes}
            carModels={carModels}
            fetchCarModels={fetchCarModels}
            fuelTypes={fuelTypes}
            seatOptions={seatOptions}
          />
        </div>

        {/* Vehicle Images */}
        <div>

          {/* Auto-filled image from local dataset */}
          {form.carImage && (
            <div className="mb-4 flex justify-center"> {/* Added flex justify-center */}
              <img
                src={form.carImage}
                // Adjusted width for better centering control
                className="w-full rounded-2xl shadow-lg object-cover"
                alt="Vehicle Preview"
              />
            </div>
          )}

          <ImageUploader
            form={form}
            setForm={setForm}
            isDark={isDark}
            isImageUploaded={!!form.carImage}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/clients")}
            className={`px-6 py-3 rounded-xl font-medium shadow ${isDark
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            <FiX className="inline-block mr-1" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-white font-semibold shadow ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : isDark
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
              }`}
          >
            <FiSave />
            {loading ? "Saving..." : "Save Client"}
          </button>
        </div>
      </form>
    </div>
  );
}