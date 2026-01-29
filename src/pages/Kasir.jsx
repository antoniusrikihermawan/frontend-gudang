import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast"; // Panggil notifikasi keren

export default function Kasir() {
  const [barang, setBarang] = useState([]);
  const [keranjang, setKeranjang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State Form Transaksi
  const [namaPembeli, setNamaPembeli] = useState("");
  const [loadingBayar, setLoadingBayar] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk Modal Konfirmasi

  // 1. Ambil Data Barang
  const fetchBarang = async () => {
    try {
      const res = await api.get("barang/");
      const hasil = res.data.results ? res.data.results : res.data;
      setBarang(hasil);
    } catch {
      toast.error("Gagal memuat data barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  // 2. Tambah ke Keranjang
  const tambahKeKeranjang = (item) => {
    if (item.stok <= 0) return toast.error("Stok Habis!");

    const cekItem = keranjang.find((k) => k.id === item.id);
    if (cekItem) {
      if (cekItem.qty + 1 > item.stok) return toast.error("Stok tidak cukup!");
      setKeranjang(
        keranjang.map((k) => (k.id === item.id ? { ...k, qty: k.qty + 1 } : k)),
      );
    } else {
      setKeranjang([...keranjang, { ...item, qty: 1 }]);
    }
    toast.success(`+ ${item.nama} masuk keranjang`);
  };

  // 3. Ubah Jumlah di Keranjang
  const ubahQty = (id, delta) => {
    const itemAsli = barang.find((b) => b.id === id);
    setKeranjang(
      keranjang.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty > itemAsli.stok) {
            toast.error("Melebihi stok tersedia!");
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  // 4. Hapus Item dari Keranjang
  const hapusItem = (id) => {
    setKeranjang(keranjang.filter((item) => item.id !== id));
  };

  // 5. Hitung Total
  const totalBayar = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );

  // 6. PROSES PEMBAYARAN (Checkout)
  const handleBayar = () => {
    if (keranjang.length === 0) return toast.error("Daftar barang kosong!");
    if (!namaPembeli) return toast.error("Masukkan Nama Penerima!");
    // Buka Modal Konfirmasi alih-alih langsung kirim
    setShowModal(true);
  };

  // 7. KIRIM DATA KE BACKEND (Dipanggil dari Modal)
  const prosesTransaksi = async () => {
    setLoadingBayar(true);
    const toastId = toast.loading("Memproses barang keluar...");

    try {
      // Loop setiap barang di keranjang untuk dikirim ke backend
      for (const item of keranjang) {
        // Data yang dikirim harus SAMA PERSIS dengan Serializer backend
        const payload = {
          barang: item.id, // ID Barang (Integer)
          jumlah: item.qty, // Jumlah (Integer)
          nama_pembeli: namaPembeli, // String
        };

        await api.post("transaksi/", payload);
      }

      // Jika loop selesai tanpa error:
      toast.success("✅ Stok Berhasil Dikeluarkan!", { id: toastId });

      // Reset Form
      setKeranjang([]);
      setNamaPembeli("");
      setShowModal(false);
    } catch (error) {
      console.error("Error Bayar:", error);

      // Deteksi Pesan Error dari Backend
      let pesanError = "Transaksi Gagal.";

      if (error.response) {
        // 1. Handle Error 500 (Masalah Database/Server)
        if (error.response.status === 500) {
          pesanError = "❌ Terjadi kesalahan Server (500). Cek Console.";
        }
        // 2. Handle Error Validasi (400)
        else if (error.response.data) {
          const dataError = error.response.data;
          // Cek apakah responnya HTML (Error Page Django)
          if (
            typeof dataError === "string" &&
            dataError.includes("<!DOCTYPE")
          ) {
            pesanError = "❌ Terjadi kesalahan sistem (Lihat Console).";
          } else if (dataError.jumlah) {
            pesanError = `Gagal: ${dataError.jumlah}`;
          } else if (dataError.detail) {
            pesanError = dataError.detail;
          } else {
            // Ambil pesan error pertama yang ditemukan
            pesanError =
              typeof dataError === "object"
                ? Object.values(dataError).flat().join(", ")
                : String(dataError);
          }
        }
      } else {
        pesanError = "❌ Tidak dapat terhubung ke server.";
      }

      toast.error(pesanError, { id: toastId, duration: 5000 });
    } finally {
      setLoadingBayar(false);
      fetchBarang(); // Refresh stok barang di katalog agar update (Sukses/Gagal tetap refresh)
    }
  };

  // Filter Barang berdasarkan Search
  const barangFiltered = barang.filter((b) =>
    b.nama.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-6 bg-base-200">
      {/* --- BAGIAN KIRI: KATALOG BARANG --- */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header & Search */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-700">
            📦 Pilih Barang (Stok Gudang)
          </h2>
          <input
            type="text"
            placeholder="Cari barang..."
            className="input input-bordered input-sm w-full max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid Barang */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20">
          {loading ? (
            <div className="col-span-full text-center mt-10">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : (
            barangFiltered.map((item) => (
              <div
                key={item.id}
                onClick={() => item.stok > 0 && tambahKeKeranjang(item)}
                className={`card bg-base-100 shadow-md hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-primary group ${item.stok === 0 ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
              >
                <figure className="h-32 bg-gray-100 relative">
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                  <div className="absolute top-2 right-2 badge badge-ghost text-xs font-bold">
                    Stok: {item.stok}
                  </div>
                </figure>
                <div className="card-body p-4">
                  <h3 className="font-bold text-gray-700 truncate">
                    {item.nama}
                  </h3>
                  <p className="text-primary font-bold">
                    Rp {parseInt(item.harga).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- BAGIAN KANAN: KERANJANG (CART) --- */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl flex flex-col h-full border border-gray-200">
        <div className="p-5 border-b bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            📋 Barang Keluar{" "}
            <span className="badge badge-primary badge-lg">
              {keranjang.length}
            </span>
          </h2>
        </div>

        {/* List Item Keranjang */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {keranjang.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-5xl mb-2">📦</p>
              <p>Belum ada item dipilih</p>
            </div>
          ) : (
            keranjang.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-base-100 border rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-bold text-sm">{item.nama}</p>
                  <p className="text-xs text-gray-500">
                    Rp {parseInt(item.harga).toLocaleString()} x {item.qty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => ubahQty(item.id, -1)}
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center">{item.qty}</span>
                  <button
                    onClick={() => ubahQty(item.id, 1)}
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    +
                  </button>
                  <button
                    onClick={() => hapusItem(item.id)}
                    className="btn btn-xs btn-circle btn-error text-white ml-2"
                  >
                    x
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Input Pembeli & Total */}
        <div className="p-5 bg-base-100 border-t rounded-b-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="form-control mb-4">
            <label className="label text-xs font-bold text-gray-500">
              PENERIMA / DIVISI
            </label>
            <input
              type="text"
              placeholder="Contoh: Produksi / Bpk. Budi"
              className="input input-bordered w-full bg-gray-50 focus:bg-white transition"
              value={namaPembeli}
              onChange={(e) => setNamaPembeli(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-gray-500">Total Nilai</span>
            <span className="text-2xl font-extrabold text-primary">
              Rp {totalBayar.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleBayar}
            disabled={loadingBayar || keranjang.length === 0}
            className="btn btn-primary w-full btn-lg shadow-lg hover:shadow-primary/50 border-none"
          >
            {loadingBayar ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "📤 KELUARKAN BARANG"
            )}
          </button>
        </div>
      </div>

      {/* --- MODAL KONFIRMASI TRANSAKSI --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                📝 Konfirmasi Barang Keluar
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Penerima / Divisi
                </p>
                <p className="text-xl font-bold text-primary">{namaPembeli}</p>
              </div>

              <div className="bg-base-100 rounded-lg border p-3 max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="text-left pb-2">Barang</th>
                      <th className="text-right pb-2">Jml</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keranjang.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{item.nama}</td>
                        <td className="py-2 text-right font-bold">
                          {item.qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
                disabled={loadingBayar}
              >
                Batal
              </button>
              <button
                onClick={prosesTransaksi}
                className="btn btn-primary px-6"
                disabled={loadingBayar}
              >
                {loadingBayar ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "✅ Ya, Keluarkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
