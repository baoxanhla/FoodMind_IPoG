// app-frontend/src/app/auth/confirm/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp } from "@/lib/auth";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = (e.currentTarget as any).code.value;

    const result = await confirmSignUp(email, code);

    if (result.success) {
      toast.success("Xác nhận thành công! Hãy đăng nhập.");
      router.push("/auth/signin");
    } else {
      toast.error(result.message);
    }
  };

  // THÊM CÁI KHUNG DIV NÀY ĐỂ GIỐNG TRANG LOGIN
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600">Xác thực tài khoản</h1>
        <p className="text-sm text-gray-500 mt-2">Mã OTP đã gửi đến <span className="font-semibold text-gray-700">{email}</span></p>
      </div>
      
      <form onSubmit={handleConfirm} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-center block">Nhập mã 6 số</Label>
          <Input 
            id="code" 
            name="code" 
            placeholder="123456" 
            className="text-center text-2xl tracking-[0.5em] h-14 font-bold" 
            required 
            maxLength={6}
          />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
          Xác nhận ngay
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-500">Không nhận được mã? <button className="text-green-600 font-semibold hover:underline">Gửi lại</button></p>
      </div>
    </div>
  );
}