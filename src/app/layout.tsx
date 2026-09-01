import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen ZIS - LAZISNU Bontang",
  description: "Aplikasi Back-Office pengelolaan ZIS LAZISNU Bontang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
