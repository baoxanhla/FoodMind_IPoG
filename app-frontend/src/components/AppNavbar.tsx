"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FoodMindLogo } from "@/components/icons/FoodMindLogo";

export default function AppNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/recommend", label: "Gợi ý" },
    { href: "/dashboard", label: "Tổng quan" },
    { href: "/history", label: "Lịch sử" },
    { href: "/profile", label: "Hồ sơ" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-green-100 z-50 h-16 flex items-center shadow-sm">
      <div className="max-w-6xl mx-auto px-4 w-full flex items-center justify-between">
        
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">

          <FoodMindLogo className="h-9" /> 
        </Link>

        {/* Menu Links */}
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href;
            
            return (
              <Link 
                key={href} 
                href={href} 
                className={`px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive 
                    ? "bg-green-100 text-green-700 shadow-sm" 
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50" 
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}