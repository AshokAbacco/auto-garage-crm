import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDynamicTables = () => api.get("/api/dynamic/tables");

export const getDynamicTableDetails = (tableId) =>
  api.get(`/api/dynamic/tables/${tableId}`);



export const createDynamicRow = (payload) =>
  api.post("/api/dynamic-rows", payload);

export const updateDynamicRow = (rowId, payload) =>
  api.patch(`/api/dynamic-rows/${rowId}`, payload);

export const deleteDynamicRow = (rowId) =>
  api.delete(`/api/dynamic-rows/${rowId}`);



export const createDynamicTable = (name) =>
  api.post("/api/dynamic-tables", { name });

export const renameDynamicTable = (id, name) =>
  api.patch(`/api/dynamic-tables/${id}`, { name });

export const deleteDynamicTable = (id) =>
  api.delete(`/api/dynamic-tables/${id}`);


export const createDynamicColumn = (payload) =>
  api.post("/api/dynamic-columns", payload);

export const updateDynamicColumn = (id, payload) =>
  api.patch(`/api/dynamic-columns/${id}`, payload);

export const deleteDynamicColumn = (id) =>
  api.delete(`/api/dynamic-columns/${id}`);
