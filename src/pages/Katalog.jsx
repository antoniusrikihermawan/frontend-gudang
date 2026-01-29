import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom"; // 1. Import Link

export default function Katalog() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State pencarian

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("barang/");
        setBarang(
          response.data.results ? response.data.results : response.data,
        );
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter barang berdasarkan search term
  const filteredBarang = barang.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-base-200 p-8 font-sans">
      {/* NAVBAR */}
      <div className="navbar bg-base-100 shadow-xl rounded-box mb-8">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl text-primary font-bold">
            🏢 Gudang Apps
          </a>
        </div>
        <div className="flex-none gap-2">
          {/* 2. INI TOMBOL YANG SUDAH DIGANTI JADI LINK */}
          <Link to="/tambah-barang" className="btn btn-primary btn-sm">
            + Tambah Barang
          </Link>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="https://ui-avatars.com/api/?name=Admin+Gudang" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-700">📦 Katalog Barang</h2>
        <input
          type="text"
          placeholder="🔍 Cari nama barang..."
          className="input input-bordered w-full md:w-80 shadow-sm focus:input-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBarang.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p className="text-2xl">🤔</p>
              <p>Barang tidak ditemukan.</p>
            </div>
          )}
          {filteredBarang.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <figure className="h-48 bg-gray-100 relative overflow-hidden">
                {item.gambar ? (
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <span className="text-4xl">📷</span>
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 badge badge-secondary">
                  {item.kategori_nama}
                </div>
              </figure>

              <div className="card-body p-5">
                <h3 className="card-title text-lg font-bold">
                  {item.nama}
                  {item.stok < 5 && (
                    <div className="badge badge-warning text-xs">
                      Stok Tipis!
                    </div>
                  )}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.keterangan || "Tidak ada keterangan barang."}
                </p>

                <div className="divider my-1"></div>

                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-xs text-gray-400">Harga</p>
                    <p className="text-xl font-extrabold text-primary">
                      Rp {parseInt(item.harga).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Stok</p>
                    <span
                      className={`font-bold ${item.stok > 0 ? "text-success" : "text-error"}`}
                    >
                      {item.stok} pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
