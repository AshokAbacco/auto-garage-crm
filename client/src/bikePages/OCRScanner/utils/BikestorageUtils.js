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

export const loadHistory = async (bikeClientId) => {
  const res = await fetch(
    `${API_BASE}/api/bike-ocr/history?bikeClientId=${bikeClientId}`,
    { headers: getAuthHeaders() }
  );
  return res.json();
};

export const saveRecord = async (data) => {
  const res = await fetch(`${API_BASE}/api/bike-ocr/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteRecord = async (id) => {
  await fetch(`${API_BASE}/api/bike-ocr/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
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
