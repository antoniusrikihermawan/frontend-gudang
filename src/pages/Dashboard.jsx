import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBarang: 0,
    totalStok: 0,
    nilaiAset: 0,
    lowStockItems: [], // Menyimpan barang yang stoknya < 5
  });

  useEffect(() => {
    // Simulasi ambil data ringkasan (Anda bisa buat endpoint khusus nanti)
    api.get("barang/").then((res) => {
      const rawData = res.data.results ? res.data.results : res.data;
      // Pastikan data adalah Array sebelum dihitung, untuk mencegah crash
      const data = Array.isArray(rawData) ? rawData : [];

      const totalBarang = data.length;
      const totalStok = data.reduce((acc, item) => acc + item.stok, 0);
      const nilaiAset = data.reduce(
        (acc, item) => acc + item.harga * item.stok,
        0,
      );

      // Filter barang dengan stok kurang dari 5
      const lowStockItems = data.filter((item) => item.stok < 5);

      setStats({ totalBarang, totalStok, nilaiAset, lowStockItems });
    });
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        👋 Selamat Datang, Admin!
      </h2>

      {/* WIDGET STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <div className="stat bg-white shadow-lg rounded-2xl border-l-4 border-blue-500">
          <div className="stat-figure text-blue-500 text-3xl">📦</div>
          <div className="stat-title font-bold text-gray-500">
            Total Jenis Barang
          </div>
          <div className="stat-value text-blue-600">{stats.totalBarang}</div>
          <div className="stat-desc">Item terdaftar di database</div>
        </div>

        <div className="stat bg-white shadow-lg rounded-2xl border-l-4 border-green-500">
          <div className="stat-figure text-green-500 text-3xl">📊</div>
          <div className="stat-title font-bold text-gray-500">
            Total Stok Fisik
          </div>
          <div className="stat-value text-green-600">{stats.totalStok}</div>
          <div className="stat-desc">Unit barang di gudang</div>
        </div>

        <div className="stat bg-white shadow-lg rounded-2xl border-l-4 border-purple-500">
          <div className="stat-figure text-purple-500 text-3xl">💰</div>
          <div className="stat-title font-bold text-gray-500">Nilai Aset</div>
          <div className="stat-value text-purple-600 text-2xl">
            Rp {(stats.nilaiAset / 1000000).toFixed(1)} Jt
          </div>
          <div className="stat-desc">Estimasi valuasi stok</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* KOLOM KIRI: AKSES CEPAT */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-md h-full">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              🚀 Akses Cepat
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/tambah-barang"
                className="btn h-auto py-4 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 border-none text-blue-700"
              >
                <span className="text-2xl">➕</span>
                <span className="text-xs">Tambah Barang</span>
              </Link>
              <Link
                to="/katalog"
                className="btn h-auto py-4 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 border-none text-purple-700"
              >
                <span className="text-2xl">📋</span>
                <span className="text-xs">Lihat Katalog</span>
              </Link>
              <Link
                to="/kasir"
                className="btn h-auto py-4 flex flex-col gap-2 bg-green-50 hover:bg-green-100 border-none text-green-700"
              >
                <span className="text-2xl">📤</span>
                <span className="text-xs">Barang Keluar</span>
              </Link>
              <Link
                to="/data-supplier"
                className="btn h-auto py-4 flex flex-col gap-2 bg-orange-50 hover:bg-orange-100 border-none text-orange-700"
              >
                <span className="text-2xl">🏭</span>
                <span className="text-xs">Supplier</span>
              </Link>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: PERINGATAN STOK */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-red-100">
          <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            ⚠️ Stok Menipis
            {stats.lowStockItems.length > 0 && (
              <span className="badge badge-error text-white">
                {stats.lowStockItems.length}
              </span>
            )}
          </h3>
          <div className="overflow-y-auto max-h-60 space-y-3">
            {stats.lowStockItems.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                Semua stok aman terkendali.
              </p>
            ) : (
              stats.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700">{item.nama}</span>
                  <span className="badge badge-sm badge-error text-white font-bold">
                    {item.stok} unit
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BANNER PROMO / INFO */}
      <div className="hero bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl shadow-xl text-white">
        <div className="hero-content py-12 px-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold">Siap Jualan?</h1>
            <p className="py-4 text-blue-100">
              Cek stok barang yang menipis atau langsung mulai transaksi kasir
              sekarang.
            </p>
            <Link
              to="/kasir"
              className="btn btn-white text-blue-600 border-none hover:bg-gray-100"
            >
              Catat Barang Keluar 📤
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
