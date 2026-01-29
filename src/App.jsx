import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Notifikasi
import { AuthProvider } from "./context/AuthContext"; // 1. Import Provider

// --- IMPORT SEMUA HALAMAN (Pastikan tidak ada yang ketinggalan) ---
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Katalog from "./pages/Katalog";
import Kasir from "./pages/Kasir";
import TambahBarang from "./pages/TambahBarang";

// 👇 JANGAN LUPA DUA BARIS INI 👇
import Kategori from "./pages/Kategori";
import Supplier from "./pages/Supplier";

// Komponen Cek Login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* 2. Bungkus Aplikasi dengan AuthProvider */}
        {/* Pasang Toaster untuk notifikasi popup */}
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Halaman Login */}
          <Route path="/login" element={<Login />} />

          {/* Halaman Utama (Harus Login) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Fitur Utama */}
            <Route path="katalog" element={<Katalog />} />
            <Route path="tambah-barang" element={<TambahBarang />} />
            <Route path="kasir" element={<Kasir />} />

            {/* 👇 PASTIKAN RUTE INI ADA & KOMPONENNYA SUDAH DI-IMPORT DI ATAS 👇 */}
            <Route path="data-kategori" element={<Kategori />} />
            <Route path="data-supplier" element={<Supplier />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
