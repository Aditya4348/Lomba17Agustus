import axios from "axios";


const Api_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Buat instance axios dengan konfigurasi default
const apiInstance = axios.create({
  baseURL: Api_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
});

// Tambahkan interceptor untuk menyisipkan token ke setiap permintaan
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default apiInstance;