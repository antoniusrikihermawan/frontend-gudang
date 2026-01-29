import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function TambahBarang() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- 1. STATE UNTUK DATA DROPDOWN ---
  const [listKategori, setListKategori] = useState([]);
  const [listSupplier, setListSupplier] = useState([]);

  // --- 2. STATE UNTUK FORM UTAMA ---
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    supplier: "",
    harga: "",
    stok: "",
    keterangan: "",
    gambar: null,
  });

  // --- 3. STATE UNTUK MODAL (POPUP TAMBAH CEPAT) ---
  const [modalOpen, setModalOpen] = useState(""); // Bisa "kategori", "supplier", atau "" (tutup)
  const [inputBaru, setInputBaru] = useState(""); // Menampung teks input di dalam popup
  const [loadingModal, setLoadingModal] = useState(false);

  // --- FUNGSI AMBIL DATA (Diperbarui agar lebih kuat) ---
  const fetchMasterData = async () => {
    try {
      const resKat = await api.get("kategori/");
      const resSup = await api.get("supplier/");

      // LOGIKA PINTAR: Cek apakah respon pakai Pagination (.results) atau Array biasa
      setListKategori(resKat.data.results ? resKat.data.results : resKat.data);
      setListSupplier(resSup.data.results ? resSup.data.results : resSup.data);
    } catch (error) {
      console.error("Gagal load data:", error);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Handle Input Form Utama
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, gambar: e.target.files[0] });
  };

  // --- FUNGSI BARU: SIMPAN KATEGORI/SUPPLIER VIA POPUP ---
  const handleSimpanMaster = async () => {
    if (!inputBaru) return alert("Nama tidak boleh kosong!");
    setLoadingModal(true);

    try {
      if (modalOpen === "kategori") {
        await api.post("kategori/", { nama: inputBaru });
        alert("✅ Kategori Baru Berhasil Ditambahkan!");
      } else if (modalOpen === "supplier") {
        // Default data alamat/telepon strip (-) dulu agar cepat
        await api.post("supplier/", {
          nama_perusahaan: inputBaru,
          alamat: "-",
          telepon: "-",
        });
        alert("✅ Supplier Baru Berhasil Ditambahkan!");
      }

      // Refresh dropdown agar data baru langsung muncul
      await fetchMasterData();

      // Reset & Tutup Modal
      setModalOpen("");
      setInputBaru("");
    } catch (error) {
      console.error(error);
      alert("❌ Gagal Menambah Data Baru.");
    } finally {
      setLoadingModal(false);
    }
  };

  // --- FUNGSI SIMPAN BARANG UTAMA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi Manual
    if (!formData.kategori) return alert("⚠️ Pilih Kategori dulu!");
    if (!formData.supplier) return alert("⚠️ Pilih Supplier dulu!");

    const dataKirim = new FormData();
    dataKirim.append("nama", formData.nama);
    dataKirim.append("kategori", formData.kategori);
    dataKirim.append("supplier", formData.supplier);
    dataKirim.append("harga", formData.harga);
    dataKirim.append("stok", formData.stok);
    dataKirim.append("keterangan", formData.keterangan || "-");

    if (formData.gambar) {
      dataKirim.append("gambar", formData.gambar);
    }

    try {
      // Kita biarkan Axios mengatur header Multipart secara otomatis
      await api.post("barang/", dataKirim);
      alert("✅ Barang Berhasil Ditambahkan!");
      navigate("/katalog");
    } catch (error) {
      console.error("Full Error:", error);
      const pesan = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Cek koneksi backend";
      alert(`❌ Gagal Simpan:\n${pesan}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ➕ Tambah Barang Baru
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Kolom Kiri */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="label font-bold">Nama Barang</label>
            <input
              required
              name="nama"
              type="text"
              className="input input-bordered w-full"
              onChange={handleChange}
            />
          </div>

          {/* KATEGORI DENGAN TOMBOL BARU */}
          <div className="form-control">
            <label className="label font-bold flex justify-between">
              <span>Kategori</span>
              {/* Tombol memicu Modal */}
              <button
                type="button"
                onClick={() => setModalOpen("kategori")}
                className="btn btn-xs btn-outline btn-primary"
              >
                + Baru
              </button>
            </label>
            <select
              required
              name="kategori"
              className="select select-bordered w-full"
              onChange={handleChange}
              value={formData.kategori}
            >
              <option value="">-- Pilih Kategori --</option>
              {listKategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* SUPPLIER DENGAN TOMBOL BARU */}
          <div className="form-control">
            <label className="label font-bold flex justify-between">
              <span>Supplier</span>
              {/* Tombol memicu Modal */}
              <button
                type="button"
                onClick={() => setModalOpen("supplier")}
                className="btn btn-xs btn-outline btn-primary"
              >
                + Baru
              </button>
            </label>
            <select
              required
              name="supplier"
              className="select select-bordered w-full"
              onChange={handleChange}
              value={formData.supplier}
            >
              <option value="">-- Pilih Supplier --</option>
              {listSupplier.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_perusahaan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-bold">Harga (Rp)</label>
              <input
                required
                name="harga"
                type="number"
                className="input input-bordered w-full"
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label font-bold">Stok Awal</label>
              <input
                required
                name="stok"
                type="number"
                className="input input-bordered w-full"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label font-bold">Foto Barang</label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-control">
            <label className="label font-bold">Keterangan</label>
            <textarea
              name="keterangan"
              className="textarea textarea-bordered h-24"
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary w-full shadow-md"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "SIMPAN DATA BARANG 💾"}
          </button>
        </div>
      </form>

      {/* --- BAGIAN MODAL (POPUP) --- */}
      {/* Kode ini hanya muncul jika modalOpen tidak kosong */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform scale-100 transition-transform">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Tambah {modalOpen === "kategori" ? "Kategori" : "Supplier"} Baru
            </h3>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Nama {modalOpen}</span>
              </label>
              <input
                autoFocus
                type="text"
                className="input input-bordered w-full"
                placeholder="Ketik nama disini..."
                value={inputBaru}
                onChange={(e) => setInputBaru(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen("")}
                className="btn btn-ghost"
              >
                Batal
              </button>
              <button
                onClick={handleSimpanMaster}
                className="btn btn-success text-white"
                disabled={loadingModal}
              >
                {loadingModal ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Simpan Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
