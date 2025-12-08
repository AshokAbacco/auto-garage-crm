//client/src/utils/carApi.js

const API = import.meta.env.VITE_API_BASE_URL;

// Fetch brand list
export const fetchLocalMakes = async (token) =>
    fetch(`${API}/api/cars/local-makes`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

// Fetch model list for selected brand
export const fetchLocalModels = async (make, token) =>
    fetch(`${API}/api/cars/local-models?make=${make}`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());
