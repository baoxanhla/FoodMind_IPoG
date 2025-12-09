// app-frontend/src/app/auth/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { confirmResetPassword } from "@/lib/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) return toast.error("Vui lòng điền đủ thông tin");

    setLoading(true);
    
    const res = await confirmResetPassword(email, code, password);

    if (res.success) {
      toast.success(res.message); 

      setTimeout(() => router.push("/auth/signin"), 2000);
    } else {
      toast.error(res.message);
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-xl bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đặt mật khẩu mới</h1>
        <p className="text-sm text-gray-500 mt-1">Cho tài khoản: <span className="font-semibold text-green-600">{email}</span></p>
      </div>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mã xác thực (OTP)</label>
          <Input placeholder="Nhập mã 6 số" value={code} onChange={(e) => setCode(e.target.value)} className="h-12 text-center text-lg tracking-widest"/>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mật khẩu mới</label>
          <Input type="password" placeholder="Nhập mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12"/>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 bg-green-600 hover:bg-green-700">
          {loading ? <Loader2 className="animate-spin" /> : "Xác nhận đổi mật khẩu"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <Suspense fallback={<Loader2 className="animate-spin text-green-600" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}