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

// response interceptor untuk menangani error global
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Token tidak valid atau sudah kadaluarsa, lakukan logout
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirect ke halaman login
      } else if (status === 403) {
        // Akses ditolak, bisa tampilkan pesan error atau redirect
        alert("Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.");
      } else if (status >= 500) {
        // Server error, bisa tampilkan pesan error umum
        alert("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
      }
    } else if (error.request) {
      // Permintaan dibuat tetapi tidak ada respons yang diterima
      alert("Tidak dapat terhubung ke server. Silakan periksa koneksi Anda.");
    } else {
      // Kesalahan lain saat menyiapkan permintaan
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
    return Promise.reject(error);
  }
);



export default apiInstance;