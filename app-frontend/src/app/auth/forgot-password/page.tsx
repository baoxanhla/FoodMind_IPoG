// app-frontend/src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth"; 

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email");

    setLoading(true);
    
    const res = await forgotPassword(email);

    if (res.success) {
      toast.success(res.message); 
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(res.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl bg-white">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu?</h1>
          <p className="text-gray-500 text-sm mt-2">Nhập email để nhận mã đặt lại mật khẩu.</p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <Input 
            type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12"
          />
          <Button type="submit" disabled={loading} className="w-full h-12 bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin" /> : "Gửi mã xác nhận"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-green-600 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}