// app-frontend/src/app/auth/signin/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { getUserProfile } from "@/lib/user"; 
import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Gọi API Đăng nhập
    const result = await signIn(email, password);

    if (result.success) {
      // 2. Đăng nhập thành công
      // Gọi API kiểm tra xem user này đã có hồ sơ trong DynamoDB chưa
      const profileRes = await getUserProfile();

      if (profileRes.success) {
        // TRƯỜNG HỢP 1: ĐÃ CÓ HỒ SƠ (User cũ)
        // Lưu data vào localStorage để dùng
        localStorage.setItem("profile", JSON.stringify(profileRes.data));
        if (profileRes.data.tdee) {
            localStorage.setItem("tdee", profileRes.data.tdee);
        }
        
        toast.info(
  <span className="flex items-center gap-2">
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg"
    >
      <rect width="24" height="24" rx="6" fill="#4ade80" />
      <path
        d="M7 12.5l3 3 7-8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

        router.push("/recommend");
      } else {
        // TRƯỜNG HỢP 2: CHƯA CÓ HỒ SƠ (User mới)
        // Backend trả về lỗi 404 hoặc không tìm thấy data
        toast.info("Thiết lập hồ sơ sức khỏe");
        console.log("User mới -> Chuyển hướng sang Onboarding");
        router.push("/onboarding"); 
      }
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">FoodMind AI</h1>
        <p className="text-gray-500">Đăng nhập để tiếp tục</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link href="/auth/forgot-password" className="text-xs text-green-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Chưa có tài khoản? </span>
        <Link href="/auth/signup" className="font-semibold text-green-600 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}