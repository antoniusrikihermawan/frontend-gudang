import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

// export default function Layout()
export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // Daftar Menu Sidebar
  const menus = [
    { path: "/", label: "🏠 Dashboard" },
    { path: "/katalog", label: "📦 Data Barang" },
    { path: "/data-kategori", label: "📂 Data Kategori" }, // Menu Baru
    { path: "/data-supplier", label: "🏭 Data Supplier" }, // Menu Baru
    { path: "/kasir", label: "🏪 Kasir / POS" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR KIRI --- */}
      <aside className="w-64 bg-white shadow-xl hidden md:flex flex-col z-10">
        {/* Logo */}
        <div className="p-6 border-b flex items-center justify-center">
          <h1 className="text-2xl font-extrabold text-primary tracking-tighter">
            ⚡ GUDANG<span className="text-gray-600">PRO</span>
          </h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                location.pathname === menu.path
                  ? "bg-primary text-white shadow-lg translate-x-1"
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        {/* Tombol Logout */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error w-full btn-sm flex items-center gap-2"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN KANAN --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden z-20">
          <span className="font-bold text-lg text-primary">GudangPro</span>
          <button
            onClick={handleLogout}
            className="text-red-500 font-bold text-sm"
          >
            Logout
          </button>
        </header>

        {/* AREA UTAMA (Outlet) */}
        <main className="flex-1 overflow-y-auto bg-base-200 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
