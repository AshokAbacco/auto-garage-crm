import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getInventory = () => api.get("/api/car-inventory");
export const createInventory = (data) => api.post("/api/car-inventory", data);
export const updateInventory = (id, data) => api.put(`/api/car-inventory/${id}`, data);
export const deleteInventory = (id) => api.delete(`/api/car-inventory/${id}`);

// Supplier API
export const createSupplier = (data) => api.post("/api/car-inventory/suppliers", data);
export const getSuppliers = () => api.get("/api/car-inventory/suppliers");
export const getInventoryById = (id) => api.get(`/api/car-inventory/${id}`);
// export const updateSupplier = (id, data) => api.put(`/api/car-inventory/suppliers/${id}`, data);
// export const deleteSupplier = (id) => api.delete(`/api/car-inventory/suppliers/${id}`);
// export const getSupplierById = (id) => api.get(`/api/car-inventory/suppliers/${id}`);
// export const getSupplierInventory = (supplierId) => api.get(`/api/car-inventory/suppliers/${supplierId}/inventory`);
// export const deductInventory = (id, quantity) => api.post(`/api/car-inventory/${id}/deduct`, { quantity });
export const deductInventory = (data) => api.post("/api/car-inventory/deduct", data);