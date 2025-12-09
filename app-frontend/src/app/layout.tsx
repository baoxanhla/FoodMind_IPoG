import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Thư viện thông báo
import AppNavbar from "@/components/AppNavbar"; 
import FloatingLogButton from "@/components/FloatingLogButton";

import '@/lib/amplify-config';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodMind - AI Nutrition Assistant",
  description: "Trợ lý dinh dưỡng cá nhân hóa bữa ăn Việt Nam",  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Navbar cố định ở trên cùng */}
        <AppNavbar />

        {/* 👇 4. Chỉnh padding-top thành pt-16 để không bị Navbar che mất */}
        <div className="pt-16 min-h-screen bg-white">
            {children}
        </div>

        {/* Các thành phần nổi (Nút tô phở, Thông báo) */}
        <FloatingLogButton />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}