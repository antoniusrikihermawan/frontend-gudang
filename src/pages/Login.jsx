import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate("/"); // Masuk ke Dashboard
    } catch {
      alert("Login Gagal! Cek username/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 font-sans">
      <div className="card w-full max-w-md bg-white/10 backdrop-blur-md shadow-2xl border border-white/20">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">📦</div>
            <h2 className="text-3xl font-bold text-white">Gudang Apps</h2>
            <p className="text-blue-200 text-sm mt-1">
              Sistem Manajemen Inventaris
            </p>
          </div>

          <p className="text-center text-gray-300 mb-4 text-sm">
            Masukkan kredensial Anda untuk melanjutkan
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">
                  Username
                </span>
              </label>
              <input
                type="text"
                placeholder="Contoh: admin"
                className="input input-bordered w-full bg-white/20 border-none text-white placeholder-gray-400 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">
                  Password
                </span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full bg-white/20 border-none text-white placeholder-gray-400 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6 border-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg transform active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Masuk Dashboard 🚀"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
