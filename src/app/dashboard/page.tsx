"use client";

import { HandCoins, Users, Heart, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    income: 0,
    outcome: 0,
    muzakkiCount: 0,
    mustahiqCount: 0
  });
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load Tx stats
      const { data: txs } = await supabase.from('transactions').select('type, amount');
      let income = 0;
      let outcome = 0;
      if (txs) {
        txs.forEach(t => {
          if (t.type === 'in') income += Number(t.amount);
          if (t.type === 'out') outcome += Number(t.amount);
        });
      }

      // Load counts
      const { count: muzakkiCount } = await supabase.from('muzakki').select('*', { count: 'exact', head: true });
      const { count: mustahiqCount } = await supabase.from('mustahiq').select('*', { count: 'exact', head: true });

      setStats({
        income,
        outcome,
        muzakkiCount: muzakkiCount || 0,
        mustahiqCount: mustahiqCount || 0
      });

      // Load recent txs
      const { data: recent } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentTxs(recent || []);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] md:text-sm font-medium text-black mb-1 truncate">Total Pemasukan ZIS</p>
            <h3 className="text-sm md:text-2xl font-bold text-black truncate">
              {loading ? "..." : `Rp ${stats.income.toLocaleString('id-ID')}`}
            </h3>
          </div>
          <div className="bg-emerald-50 p-2 md:p-3 rounded-lg md:rounded-xl shrink-0">
            <HandCoins className="h-4 w-4 md:h-6 md:w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] md:text-sm font-medium text-black mb-1 truncate">Total Penyaluran</p>
            <h3 className="text-sm md:text-2xl font-bold text-black truncate">
              {loading ? "..." : `Rp ${stats.outcome.toLocaleString('id-ID')}`}
            </h3>
          </div>
          <div className="bg-blue-50 p-2 md:p-3 rounded-lg md:rounded-xl shrink-0">
            <Heart className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] md:text-sm font-medium text-black mb-1 truncate">Total Muzakki</p>
            <h3 className="text-base md:text-2xl font-bold text-black truncate">
              {loading ? "..." : stats.muzakkiCount}
            </h3>
          </div>
          <div className="bg-yellow-50 p-2 md:p-3 rounded-lg md:rounded-xl shrink-0">
            <Users className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] md:text-sm font-medium text-black mb-1 truncate">Total Mustahiq</p>
            <h3 className="text-base md:text-2xl font-bold text-black truncate">
              {loading ? "..." : stats.mustahiqCount}
            </h3>
          </div>
          <div className="bg-purple-50 p-2 md:p-3 rounded-lg md:rounded-xl shrink-0">
            <Users className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">Transaksi Terbaru</h3>
            <Link href="/dashboard/transaksi" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-sm text-black">
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium">Jenis</th>
                  <th className="px-6 py-4 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-black">Memuat...</td>
                  </tr>
                ) : recentTxs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-black">Belum ada transaksi.</td>
                  </tr>
                ) : (
                  recentTxs.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{trx.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trx.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {trx.type === 'in' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-black">
                        Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
