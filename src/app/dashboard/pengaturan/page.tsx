"use client";

import { useState, useEffect } from "react";
import { Users, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PengaturanPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfiles() {
      // Security check: Only Admin can view this
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      if (currentUserProfile?.role !== 'admin') {
        alert("Akses Ditolak: Halaman ini hanya untuk Administrator.");
        router.push("/dashboard");
        return;
      }

      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setProfiles(data);
      setLoading(false);
    }

    fetchProfiles();
  }, [router, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Pengaturan Akun</h2>
          <p className="text-black text-sm mt-1">Kelola hak akses pengguna (Admin & Amil).</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h3 className="font-bold text-black">Daftar Pengguna Sistem</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-sm text-black">
                <th className="px-6 py-4 font-medium">Nama Pengguna</th>
                <th className="px-6 py-4 font-medium">Role / Peran</th>
                <th className="px-6 py-4 font-medium">Tgl Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-black">Memuat data...</td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-black">Belum ada profil.</td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs uppercase text-black">
                        {p.full_name?.substring(0, 2) || '?'}
                      </div>
                      {p.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        p.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
