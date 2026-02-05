// client/src/pages/details/utils/storageUtils.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

/**
 * Utility to get JWT token from localStorage
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Load OCR history for a specific client from backend.
 * If clientId is not provided, fetches all records (optional fallback).
 */
export const loadHistory = async (clientId = null) => {
    try {
        const url = clientId
            ? `${API_BASE}/api/ocr/history?clientId=${clientId}`
            : `${API_BASE}/api/ocr/history`;
        const res = await axios.get(url, { headers: getAuthHeaders() });
        return res.data || [];
    } catch (err) {
        console.error("Error loading OCR history:", err);
        return [];
    }
};

/**
 * Save new OCR record to backend.
 * data = {
 *   clientId,
 *   rawText,
 *   parsedData,
 *   confidence,
 *   imageUrl? (optional)
 * }
 */
export const saveRecord = async (data) => {
    try {
        const res = await axios.post(`${API_BASE}/api/ocr/upload`, data, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        });
        return res.data.record;
    } catch (err) {
        console.error("Error saving OCR record:", err);
        throw new Error(
            err.response?.data?.message || "Failed to save OCR record."
        );
    }
};

/**
 * Delete a specific OCR record from backend
 */
export const deleteRecord = async (id) => {
    try {
        await axios.delete(`${API_BASE}/api/ocr/${id}`, {
            headers: getAuthHeaders(),
        });
        return true;
    } catch (err) {
        console.error("Error deleting OCR record:", err);
        throw new Error("Failed to delete OCR record");
    }
};

/**
 * Clear all OCR history for a given client.
 * Loops through each record and deletes them.
 */
export const clearHistory = async (clientId = null) => {
    try {
        const records = await loadHistory(clientId);
        for (const record of records) {
            await deleteRecord(record.id);
        }
        return true;
    } catch (err) {
        console.error("Error clearing OCR history:", err);
        return false;
    }
};
