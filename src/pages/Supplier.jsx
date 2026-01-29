import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast"; // Notifikasi Keren

export default function Supplier() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nama_perusahaan: "",
    alamat: "",
    telepon: "",
  });
  const [loadingSimpan, setLoadingSimpan] = useState(false);

  // State Edit
  const [editMode, setEditMode] = useState(false);
  const [idEdit, setIdEdit] = useState(null);

  // --- 1. AMBIL DATA ---
  const fetchData = async () => {
    try {
      const res = await api.get("supplier/");
      const hasil = res.data.results ? res.data.results : res.data;
      setData(hasil);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data supplier.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. LOGIKA MODAL ---
  const openModalTambah = () => {
    setEditMode(false);
    setForm({ nama_perusahaan: "", alamat: "", telepon: "" });
    setIsModalOpen(true);
  };

  const openModalEdit = (item) => {
    setEditMode(true);
    setIdEdit(item.id);
    setForm({
      nama_perusahaan: item.nama_perusahaan,
      alamat: item.alamat,
      telepon: item.telepon,
    });
    setIsModalOpen(true);
  };

  // --- 3. SIMPAN DATA ---
  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.nama_perusahaan)
      return toast.error("Nama Perusahaan wajib diisi!");

    setLoadingSimpan(true);
    const toastId = toast.loading("Menyimpan...");

    try {
      if (editMode) {
        await api.put(`supplier/${idEdit}/`, form);
        toast.success("Data supplier diperbarui!", { id: toastId });
      } else {
        await api.post("supplier/", form);
        toast.success("Supplier baru ditambahkan!", { id: toastId });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data.", { id: toastId });
    } finally {
      setLoadingSimpan(false);
    }
  };

  // --- 4. HAPUS DATA ---
  const handleHapus = async (id) => {
    if (!confirm("⚠️ Hapus supplier ini?")) return;

    const toastId = toast.loading("Menghapus...");
    try {
      await api.delete(`supplier/${id}/`);
      toast.success("Supplier dihapus.", { id: toastId });
      fetchData();
    } catch {
      toast.error("Gagal menghapus data.", { id: toastId });
    }
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏭 Data Supplier</h1>
          <p className="text-gray-500 text-sm">Daftar pemasok barang gudang</p>
        </div>
        <button
          onClick={openModalTambah}
          className="btn btn-primary shadow-lg hover:scale-105 transition-transform"
        >
          + Tambah Supplier
        </button>
      </div>

      {/* Tabel */}
      <div className="card bg-base-100 shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="w-16 text-center">No</th>
                <th>Perusahaan</th>
                <th>Kontak Info</th>
                <th className="text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    🏭 Belum ada data supplier.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="text-center font-medium">{index + 1}</td>
                    <td className="font-bold text-gray-800 text-lg">
                      {item.nama_perusahaan}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          📞 {item.telepon || "-"}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          📍 {item.alamat || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="flex justify-center gap-2 items-center h-full pt-4">
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
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform scale-100 transition-transform">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editMode ? "✏️ Edit Supplier" : "➕ Supplier Baru"}
            </h3>

            <form onSubmit={handleSimpan} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Nama Perusahaan</span>
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="PT. Maju Mundur"
                  className="input input-bordered w-full focus:input-primary"
                  value={form.nama_perusahaan}
                  onChange={(e) =>
                    setForm({ ...form, nama_perusahaan: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">No Telepon</span>
                </label>
                <input
                  type="text"
                  placeholder="0812xxxx"
                  className="input input-bordered w-full focus:input-primary"
                  value={form.telepon}
                  onChange={(e) =>
                    setForm({ ...form, telepon: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Alamat Lengkap</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:textarea-primary h-24"
                  placeholder="Jl. Jendral Sudirman..."
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
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
