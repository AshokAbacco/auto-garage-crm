import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Indian car dataset
const CAR_DATA_PATH = path.join(__dirname, "..", "data", "indianCars.json");

// carData will be converted to:
// {
//   "TATA": { make, slug, logoUrl, models: [...] },
//   "MAHINDRA": { ... }
// }
let carData = {};

try {
    const raw = fs.readFileSync(CAR_DATA_PATH, "utf-8");
    const arr = JSON.parse(raw);

    // Convert array → map
    arr.forEach(entry => {
        carData[entry.make.toUpperCase()] = entry;
    });

    console.log("Loaded Indian cars dataset (normalized).");
} catch (err) {
    console.error("Failed to load indianCars.json", err);
    carData = {};
}

// ------------------------------------
// STATIC META (Fuel types + Seats)
// ------------------------------------
export const getMetaData = (req, res) => {
    return res.json({
        fuelTypes: [
            "Petrol",
            "Diesel",
            "CNG",
            "LPG",
            "Electric",

            // Hybrid
            "Petrol + Electric (Hybrid)",
            "Diesel + Electric (Hybrid)",
            "Petrol + Mild Hybrid",
            "Diesel + Mild Hybrid",

            // Dual Fuel
            "Petrol + CNG",
            "Petrol + LPG",
            "Diesel + CNG",
            "Diesel + LPG",

            // Optional future types
            "Petrol + Hydrogen",
            "Hydrogen (Fuel Cell)"
        ],
        seats: ["2", "4", "5", "6", "7", "8"],
    });
};

// ------------------------------------
// LOCAL INDIA MAKES
// ------------------------------------
export const getLocalMakes = (req, res) => {
    const makes = Object.values(carData).map(m => ({
        make: m.make,
        slug: m.slug,
        logoUrl: m.logoUrl,
    }));

    res.json({ makes });
};

// ------------------------------------
// LOCAL INDIA MODELS
// ------------------------------------
export const getLocalModels = (req, res) => {
    const make = (req.query.make || "").toUpperCase();
    const entry = carData[make];

    if (!entry) {
        return res.json({ make, models: [] });
    }

    res.json({
        make: entry.make,
        slug: entry.slug,
        logoUrl: entry.logoUrl,
        models: entry.models,
    });
};

// ------------------------------------
// LOCAL IMAGE LOOKUP (thumbnail + hero)
// ------------------------------------
export const getLocalImage = (req, res) => {
    const { make, model, year } = req.query;

    if (!make || !model) {
        return res.status(400).json({ message: "make and model are required" });
    }

    const entry = carData[make.toUpperCase()];
    if (!entry) {
        return res.status(404).json({ message: "Make not found" });
    }

    const foundModel = entry.models.find(
        m => m.name.toLowerCase() === model.toLowerCase()
    );

    if (!foundModel) {
        return res.status(404).json({ message: "Model not found" });
    }

    // Prefer year-specific images if available
    if (year && foundModel.yearVariants && foundModel.yearVariants[year]) {
        return res.json({
            make: entry.make,
            model: foundModel.name,
            year,
            thumbnailUrl: foundModel.yearVariants[year].thumbnailUrl,
            heroUrl: foundModel.yearVariants[year].heroUrl,
        });
    }

    // Default images
    return res.json({
        make: entry.make,
        model: foundModel.name,
        thumbnailUrl: foundModel.thumbnailUrl,
        heroUrl: foundModel.heroUrl,
    });
};

// ------------------------------------
// BRAND LOGO ASSETS (Optional / Legacy)
// ------------------------------------
export const getBrandAssets = (req, res) => {
    const make = (req.query.make || "").toUpperCase();
    const entry = carData[make];

    if (!entry) {
        return res.json({ make, assets: null });
    }

    return res.json({
        make: entry.make,
        assets: {
            logo: entry.logoUrl,
        },
    });
};
