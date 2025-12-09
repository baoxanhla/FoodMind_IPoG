// app-frontend/src/app/auth/signup/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const name = formData.get("name") as string;

    const result = await signUp(email, password, name);

    if (result.success) {
      toast.success("Đăng ký thành công! Hãy kiểm tra email.");
      router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Tạo tài khoản</h1>
        <p className="text-gray-500">Tham gia cộng đồng FoodMind</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Họ tên</Label>
          {/* Input đã có name="name" để FormData lấy được */}
          <Input id="name" name="name" required placeholder="Nguyễn Văn A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="name@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" name="password" type="password" required minLength={8} placeholder="••••••••" />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Đã có tài khoản? </span>
        <Link href="/auth/signin" className="font-semibold text-green-600 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}