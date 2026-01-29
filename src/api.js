import axios from "axios";

// Buat instance axios dengan setting dasar
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor: Tugasnya menyelipkan Token secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// AUTH
export const login = (data) => api.post("auth/login/", data);
export const getProfile = () => api.get("profile/"); // Asumsi endpoint profile ada

// KATEGORI
export const getKategori = () => api.get("kategori/");
export const createKategori = (data) => api.post("kategori/", data);
export const updateKategori = (id, data) => api.put(`kategori/${id}/`, data);
export const deleteKategori = (id) => api.delete(`kategori/${id}/`);

// SUPPLIER
export const getSupplier = () => api.get("supplier/");
export const createSupplier = (data) => api.post("supplier/", data);
export const updateSupplier = (id, data) => api.put(`supplier/${id}/`, data);
export const deleteSupplier = (id) => api.delete(`supplier/${id}/`);

export default api;
