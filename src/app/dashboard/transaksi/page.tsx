"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function TransaksiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<{ role: string; id: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [txType, setTxType] = useState<"in" | "out">("in");

  // Form State
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const kategoriPenerimaan = ["Zakat Fitrah", "Zakat Maal", "Infaq", "Sedekah", "Fidyah", "Kifarat", "CSR", "Dana Kemanusiaan", "Lainnya"];
  const kategoriPenyaluran = ["Fakir", "Miskin", "Amil", "Muallaf", "Riqab", "Gharimin", "Fisabilillah", "Ibnu Sabil", "Bantuan Bencana", "Lainnya"];

  const supabase = createClient();

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isModalOpen) fetchPeopleList();
  }, [isModalOpen, txType]);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role, id').eq('id', user.id).single();
      setProfile(prof as any);
    }
  }

  async function fetchData() {
    setLoading(true);
    const { data: txs } = await supabase
      .from('transactions')
      .select(`
        *,
        muzakki:muzakki_id(name),
        mustahiq:mustahiq_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (txs) setData(txs);
    setLoading(false);
  }

  async function fetchPeopleList() {
    if (txType === "in") {
      const { data } = await supabase.from('muzakki').select('id, name').order('name');
      setPeopleList(data || []);
    } else {
      const { data } = await supabase.from('mustahiq').select('id, name').order('name');
      setPeopleList(data || []);
    }
  }

  const formatRupiah = (value: string) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? 'Rp. ' + rupiah : '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRupiah(e.target.value);
    setAmountDisplay(formatted);
    const rawValue = formatted.replace(/[^0-9]/g, '');
    setAmount(rawValue);
  };

  function openModal(type: "in" | "out") {
    setEditingId(null);
    setTxType(type);
    setAmount("");
    setAmountDisplay("");
    setDescription(type === "in" ? kategoriPenerimaan[0] : kategoriPenyaluran[0]);
    setSelectedPerson("");
    setIsModalOpen(true);
  }

  function openEditModal(item: any) {
    setEditingId(item.id);
    setTxType(item.type);
    setAmount(item.amount.toString());
    setAmountDisplay(formatRupiah(item.amount.toString()));
    setDescription(item.description);
    setSelectedPerson(item.type === "in" ? item.muzakki_id || "" : item.mustahiq_id || "");
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload: any = {
      type: txType,
      amount: parseFloat(amount),
      description,
    };

    if (selectedPerson) {
      if (txType === "in") {
        payload.muzakki_id = selectedPerson;
        payload.mustahiq_id = null;
      }
      if (txType === "out") {
        payload.mustahiq_id = selectedPerson;
        payload.muzakki_id = null;
      }
    } else {
      payload.muzakki_id = null;
      payload.mustahiq_id = null;
    }

    let error;
    if (editingId) {
      const res = await supabase.from('transactions').update(payload).eq('id', editingId);
      error = res.error;
    } else {
      payload.created_by = profile?.id;
      const res = await supabase.from('transactions').insert([payload]);
      error = res.error;
    }

    setSubmitting(false);
    if (!error) {
      setIsModalOpen(false);
      fetchData();
    } else {
      console.error("Error saving transaction:", error);
      alert(`Gagal menyimpan transaksi: ${error.message}\n${error.details || ''}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert("Gagal menghapus data: " + error.message);
    }
  }

  const filteredData = data.filter(item => 
    item.description.toLowerCase().includes(search.toLowerCase()) || 
    (item.muzakki?.name && item.muzakki.name.toLowerCase().includes(search.toLowerCase())) ||
    (item.mustahiq?.name && item.mustahiq.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Transaksi ZIS</h2>
          <p className="text-black text-sm mt-1">Catat dan pantau arus dana masuk dan keluar.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => openModal("out")}
            className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <TrendingUp className="h-4 w-4" />
            Catat Penyaluran
          </button>
          <button 
            onClick={() => openModal("in")}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <TrendingDown className="h-4 w-4" />
            Catat Penerimaan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-black text-sm">Memuat data...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-black text-sm">Belum ada riwayat transaksi.</div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {new Date(item.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="font-bold text-black leading-tight">{item.description}</div>
                    <div className="text-xs text-black">
                      {item.type === 'in' ? item.muzakki?.name || 'Tanpa Relasi' : item.mustahiq?.name || 'Tanpa Relasi'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      item.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.type === 'in' ? 'Masuk' : 'Keluar'}
                    </span>
                    <div className="font-bold text-black text-sm">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 mt-1">
                  <button 
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-black">
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
                <th className="px-6 py-4 font-medium">Relasi</th>
                <th className="px-6 py-4 font-medium">Jenis</th>
                <th className="px-6 py-4 font-medium text-right">Nominal</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black">Belum ada riwayat transaksi.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-black">
                      {new Date(item.transaction_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-medium text-black">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-black">
                      {item.type === 'in' ? item.muzakki?.name || '-' : item.mustahiq?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.type === 'in' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-black">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className={`p-6 border-b flex justify-between items-center shrink-0 ${txType === 'in' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <h3 className={`text-lg font-bold ${txType === 'in' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {editingId ? 'Edit Transaksi' : (txType === 'in' ? 'Penerimaan ZIS' : 'Penyaluran ZIS')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="txForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="text"
                    required
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Rp. 50.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan *</label>
                  <select
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
                    {(txType === 'in' ? kategoriPenerimaan : kategoriPenyaluran).map(kategori => (
                      <option key={kategori} value={kategori}>{kategori}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {txType === 'in' ? 'Pilih Muzakki (Opsional)' : 'Pilih Mustahiq (Opsional)'}
                  </label>
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">-- Tanpa Relasi / Hamba Allah --</option>
                    {peopleList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-black font-medium hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="txForm"
                disabled={submitting || !amount}
                className={`px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-70 ${
                  txType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
