import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext"; 

import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Katalog from "./pages/Katalog";
import Kasir from "./pages/Kasir";
import TambahBarang from "./pages/TambahBarang";
import Kategori from "./pages/Kategori";
import Supplier from "./pages/Supplier";

// login check
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
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
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
            <Route path="data-kategori" element={<Kategori />} />
            <Route path="data-supplier" element={<Supplier />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
