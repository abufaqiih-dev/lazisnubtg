"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  ArrowRightLeft, 
  Settings,
  LogOut,
  Heart
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string; email: string } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        
        setProfile({
          email: user.email || '',
          full_name: data?.full_name || 'Pengurus',
          role: data?.role || 'amil'
        });
      }
    }
    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Muzakki", href: "/dashboard/muzakki", icon: Users },
    { name: "Mustahiq", href: "/dashboard/mustahiq", icon: HeartHandshake },
    { name: "Transaksi", href: "/dashboard/transaksi", icon: ArrowRightLeft },
    ...(profile?.role === 'admin' ? [{ name: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      
      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:flex flex-col w-64 bg-emerald-900 text-white flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b border-emerald-800 bg-white">
          <img 
            src="https://i.ibb.co.com/x8zydZz1/Chat-GPT-Image-Sep-2-2026-08-52-41-AM.png" 
            alt="LAZISNU NU CARE" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-6 px-4">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Menu Utama
            </p>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-emerald-800 text-white font-medium" 
                      : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-yellow-400" : "text-emerald-300"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="w-full p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 px-4 py-3 text-emerald-100">
            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm uppercase shrink-0">
              {profile?.full_name ? profile.full_name.substring(0, 2) : 'AD'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-white truncate">{profile?.full_name || 'Loading...'}</span>
              <span className="text-xs text-emerald-400 truncate">{profile?.email || ''}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-3 px-4 py-3 text-emerald-300 hover:bg-emerald-800 hover:text-white rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 md:h-20 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Logo */}
            <div className="md:hidden h-10 w-auto">
              <img 
                src="https://i.ibb.co.com/x8zydZz1/Chat-GPT-Image-Sep-2-2026-08-52-41-AM.png" 
                alt="LAZISNU NU CARE" 
                className="h-full w-auto object-contain"
              />
            </div>
            {/* Desktop Title */}
            <h1 className="text-2xl font-bold text-slate-800 hidden md:block">
              {navigation.find(n => n.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <span className={`text-xs md:text-sm font-medium py-1 px-3 rounded-full capitalize ${
                profile.role === 'admin' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                Role: {profile.role}
              </span>
            )}
            {/* Mobile Logout Button */}
            <button 
              onClick={handleLogout}
              className="md:hidden p-2 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 px-2 pb-safe">
        <nav className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-emerald-700" : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-700" : ""}`} />
                <span className="text-[10px] font-medium truncate px-1 max-w-full text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
