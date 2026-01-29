import { createContext, useContext, useState, useEffect } from "react";
import api, { getProfile, login as apiLogin } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Coba ambil profile user dari backend
          // Jika backend belum siap handle profile, kita bisa mock dulu atau handle error
          try {
             const res = await getProfile();
             setUser(res.data);
          } catch (err) {
            console.warn("Gagal load profile, mungkin endpoint belum siap. Asumsi user aktif.");
            setUser({ username: "admin", role: "admin" }); // Fallback sementara
          }
        } catch (error) {
          console.error("Auth error", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await apiLogin({ username, password });
      const newToken = res.data.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      // setUser akan di-trigger oleh useEffect di atas atau bisa set manual disini
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
