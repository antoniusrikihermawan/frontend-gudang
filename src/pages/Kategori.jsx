import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast"; // Notifikasi Keren

export default function Kategori() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const [loadingSimpan, setLoadingSimpan] = useState(false);

  // State Edit
  const [editMode, setEditMode] = useState(false);
  const [idEdit, setIdEdit] = useState(null);

  // --- 1. AMBIL DATA ---
  const fetchData = async () => {
    try {
      const response = await api.get("kategori/");
      // Deteksi format pagination atau array biasa
      const hasil = response.data.results
        ? response.data.results
        : response.data;
      setData(hasil);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal memuat data kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. LOGIKA BUKA MODAL ---
  const openModalTambah = () => {
    setEditMode(false);
    setNamaBaru("");
    setIsModalOpen(true);
  };

  const openModalEdit = (item) => {
    setEditMode(true);
    setIdEdit(item.id);
    setNamaBaru(item.nama);
    setIsModalOpen(true);
  };

  // --- 3. SIMPAN DATA (Create / Update) ---
  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!namaBaru.trim()) return toast.error("Nama kategori wajib diisi!");

    setLoadingSimpan(true);
    const toastId = toast.loading("Menyimpan data...");

    try {
      if (editMode) {
        await api.put(`kategori/${idEdit}/`, { nama: namaBaru });
        toast.success("Kategori berhasil diperbarui!", { id: toastId });
      } else {
        await api.post("kategori/", { nama: namaBaru });
        toast.success("Kategori baru ditambahkan!", { id: toastId });
      }

      setIsModalOpen(false);
      fetchData(); // Refresh tabel
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data.", { id: toastId });
    } finally {
      setLoadingSimpan(false);
    }
  };

  // --- 4. HAPUS DATA ---
  const handleHapus = async (id) => {
    // Kita pakai confirm bawaan dulu untuk safety, tapi hasilnya pakai Toast
    if (!confirm("⚠️ Yakin ingin menghapus kategori ini?")) return;

    const toastId = toast.loading("Menghapus...");
    try {
      await api.delete(`kategori/${id}/`);
      toast.success("Kategori berhasil dihapus.", { id: toastId });
      fetchData();
    } catch {
      toast.error("Gagal menghapus. Mungkin data sedang digunakan.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📂 Data Kategori</h1>
          <p className="text-gray-500 text-sm">
            Kelola kategori barang di gudang
          </p>
        </div>
        <button
          onClick={openModalTambah}
          className="btn btn-primary shadow-lg hover:scale-105 transition-transform"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* Tabel */}
      <div className="card bg-base-100 shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="w-16 text-center">No</th>
                <th>Nama Kategori</th>
                <th className="text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-10">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">
                    📂 Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="text-center font-medium">{index + 1}</td>
                    <td className="font-bold text-gray-700 text-lg">
                      {item.nama}
                    </td>
                    <td className="flex justify-center gap-2">
                      <button
                        onClick={() => openModalEdit(item)}
                        className="btn btn-warning btn-xs text-white shadow-sm"
                        title="Edit Data"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleHapus(item.id)}
                        className="btn btn-error btn-xs text-white shadow-sm"
                        title="Hapus Data"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 transition-transform">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editMode ? "✏️ Edit Kategori" : "➕ Kategori Baru"}
            </h3>

            <form onSubmit={handleSimpan}>
              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text font-semibold">
                    Nama Kategori
                  </span>
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Contoh: Elektronik"
                  className="input input-bordered w-full focus:input-primary"
                  value={namaBaru}
                  onChange={(e) => setNamaBaru(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-6"
                  disabled={loadingSimpan}
                >
                  {loadingSimpan ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
