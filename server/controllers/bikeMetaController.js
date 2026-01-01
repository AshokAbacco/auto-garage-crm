import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIKE_DATA_PATH = path.join(__dirname, "..", "data", "indianBikes.json");

let bikeData = {};

try {
  const raw = fs.readFileSync(BIKE_DATA_PATH, "utf-8");
  const arr = JSON.parse(raw);

  arr.forEach(entry => {
    bikeData[entry.make.toUpperCase()] = entry;
  });

  console.log("Loaded Indian bikes dataset.");
} catch (err) {
  console.error("Failed to load indianBikes.json", err);
}

/* ------------------ BIKE MAKES ------------------ */
export const getBikeMakes = (req, res) => {
  const makes = Object.values(bikeData).map(b => ({
    make: b.make,
    slug: b.slug,
    logoUrl: b.logoUrl,
  }));

  res.json({ makes });
};

/* ------------------ BIKE MODELS ------------------ */
export const getBikeModels = (req, res) => {
  const make = (req.query.make || "").toUpperCase();
  const entry = bikeData[make];

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

/* ------------------ BIKE IMAGE LOOKUP ------------------ */
export const getBikeImage = (req, res) => {
  const { make, model, year } = req.query;

  if (!make || !model) {
    return res.status(400).json({ message: "make and model required" });
  }

  const entry = bikeData[make.toUpperCase()];
  if (!entry) {
    return res.status(404).json({ message: "Make not found" });
  }

  // Fixed: Use exact match like carController instead of includes
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
  res.json({
    make: entry.make,
    model: foundModel.name,
    thumbnailUrl: foundModel.thumbnailUrl,
    heroUrl: foundModel.heroUrl,
  });
};

/* ------------------ BRAND LOGO ASSETS (NEW) ------------------ */
export const getBrandAssets = (req, res) => {
  const make = (req.query.make || "").toUpperCase();
  const entry = bikeData[make];

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