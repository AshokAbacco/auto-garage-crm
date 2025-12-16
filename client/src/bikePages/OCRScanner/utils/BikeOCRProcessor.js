// src/bikePages/OCRScanner/utils/BikeOCRProcessor.js
import Tesseract from "tesseract.js";
// BikeOCRProcessor.js
import { preprocessImage } from "./BikepreprocessImage.js";
import { parseOCRText } from "./BikeparseOCRText.js";

/**
 * Runs the complete OCR pipeline:
 * 1. Preprocess image for clarity
 * 2. Run Tesseract OCR
 * 3. Parse structured RC data
 * 4. Return text, parsed fields & confidence
 *
 * @param {string|Blob} imageData - base64 or file input
 * @param {function} onProgress - callback(progress: number)
 * @returns {Promise<{ text: string, parsed: object, confidence: number, raw: object }>}
 */
export const processImage = async (imageData, onProgress) => {
    if (!imageData) throw new Error("No image provided for OCR.");

    try {
        // 🧠 Step 1: Enhance image before OCR
        const preprocessed = await preprocessImage(imageData);

        // 🧠 Step 2: Run OCR
        const result = await Tesseract.recognize(preprocessed, "eng", {
            logger: (m) => {
                if (m.status === "recognizing text" && m.progress && onProgress) {
                    onProgress(m.progress);
                }
            },
        });

        const rawText = result.data.text.trim();
        const confidence = Math.round(result.data.confidence || 0);

        // 🧠 Step 3: Parse structured RC data
        const parsed = parseOCRText(rawText, confidence);

        // 🧩 Step 4: Return result
        return {
            text: rawText,
            parsed,
            confidence,
            raw: result.data, // full Tesseract metadata if needed for debugging
        };
    } catch (err) {
        console.error("❌ OCR processing error:", err);
        throw new Error("OCR failed during recognition or preprocessing.");
    }
};
