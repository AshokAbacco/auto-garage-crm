import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Indian car dataset safely
const CAR_DATA_PATH = path.join(__dirname, "..", "data", "indianCars.json");

let carData = {};
try {
    const raw = fs.readFileSync(CAR_DATA_PATH, "utf-8");
    carData = JSON.parse(raw);
    console.log("Loaded Indian cars dataset.");
} catch (err) {
    console.error("Failed to load indianCars.json", err);
    carData = {};
}

// ------------------------------------
// STATIC META (Fuel types + Seats)
// ------------------------------------
export const getMetaData = (req, res) => {
    return res.json({
        fuelTypes: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
        seats: ["2", "4", "5", "6", "7", "8"]
    });
};

// ------------------------------------
// NHTSA API FOR GLOBAL MAKES
// ------------------------------------
const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

let makesCache = {
    data: null,
    fetchedAt: 0,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const isCacheStale = () =>
    !makesCache.data || Date.now() - makesCache.fetchedAt > ONE_DAY_MS;

export const getMakes = async (req, res, next) => {
    try {
        const search = (req.query.search || "").toLowerCase();
        const limit = parseInt(req.query.limit, 10) || 20;

        if (isCacheStale()) {
            const { data } = await axios.get(
                `${NHTSA_BASE}/GetAllMakes?format=json`
            );

            makesCache = {
                data: data?.Results || [],
                fetchedAt: Date.now(),
            };
        }

        let results = makesCache.data;

        if (search) {
            results = results.filter((m) =>
                m.Make_Name?.toLowerCase().includes(search)
            );
        }

        const payload = results.slice(0, limit).map((m) => ({
            id: m.Make_ID,
            name: m.Make_Name,
            slug: m.Make_Name.toLowerCase().replace(/\s+/g, "-"),
        }));

        res.json({ makes: payload });

    } catch (err) {
        next(err);
    }
};

export const getModels = async (req, res, next) => {
    try {
        const make = req.query.make;
        if (!make) {
            return res.status(400).json({ message: "make is required" });
        }

        const makeEncoded = encodeURIComponent(make);

        const { data } = await axios.get(
            `${NHTSA_BASE}/GetModelsForMake/${makeEncoded}?format=json`
        );

        const models = (data?.Results || []).map((m) => ({
            id: m.Model_ID,
            name: m.Model_Name,
        }));

        res.json({ models });

    } catch (err) {
        next(err);
    }
};

// ------------------------------------
// OPTION A: INDIA LOCAL DATASET
// ------------------------------------
export const getLocalMakes = (req, res) => {
    const makes = Object.keys(carData); // ["TATA", "MAHINDRA", ...]
    res.json({ makes });
};

export const getLocalModels = (req, res) => {
    const make = (req.query.make || "").toUpperCase();

    if (!make || !carData[make]) {
        return res.json({ models: [] });
    }

    res.json({
        make,
        models: carData[make]
    });
};

// ------------------------------------
// BRAND LOGO ASSETS (Premium)
// ------------------------------------
const BRAND_ASSETS = {
    TATA: { logo: "https://www.carlogos.org/car-logos/tata-logo.png" },
    MAHINDRA: { logo: "https://www.carlogos.org/car-logos/mahindra-logo.png" },
    "MARUTI SUZUKI": { logo: "https://www.carlogos.org/car-logos/maruti-suzuki-logo.png" },
    HYUNDAI: { logo: "https://www.carlogos.org/car-logos/hyundai-logo.png" },
    HONDA: { logo: "https://www.carlogos.org/car-logos/honda-logo.png" },
};

export const getBrandAssets = (req, res) => {
    const make = (req.query.make || "").toUpperCase();
    const assets = BRAND_ASSETS[make] || null;

    res.json({
        make,
        assets,
    });
};
