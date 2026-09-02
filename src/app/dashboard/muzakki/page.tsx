"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, Phone, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function MuzakkiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<{ role: string; id: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role, id').eq('id', user.id).single();
      setProfile(prof as any);
    }
  }

  async function fetchData() {
    setLoading(true);
    const { data: muzakki } = await supabase
      .from('muzakki')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (muzakki) setData(muzakki);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('muzakki').insert([
      { name, phone, address, created_by: profile?.id }
    ]);

    setSubmitting(false);
    if (!error) {
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      fetchData();
    } else {
      alert("Gagal menambahkan data: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    const { error } = await supabase.from('muzakki').delete().eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert("Gagal menghapus data: " + error.message);
    }
  }

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.phone && item.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Muzakki</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data donatur dan riwayat mereka.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Muzakki
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau no. telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Memuat data...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Belum ada data Muzakki.</div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                  {profile?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-2">{item.address || '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Nama Donatur</th>
                <th className="px-6 py-4 font-medium">No. Telepon</th>
                <th className="px-6 py-4 font-medium">Alamat</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data Muzakki.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {item.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 max-w-xs truncate">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {item.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {profile?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Tambah Muzakki</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="H. Abdullah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. WhatsApp/Telepon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="08123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Jl. Merdeka No. 1, Bontang"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 text-white font-medium hover:bg-emerald-800 rounded-lg transition disabled:opacity-70"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
