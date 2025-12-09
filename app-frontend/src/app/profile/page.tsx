// app-frontend/src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/user"; 
import { KeyRound, LogOut, User as UserIcon } from "lucide-react"; // Thêm icon cho đẹp

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
      } else {
        const local = localStorage.getItem("profile");
        if (local) setProfile(JSON.parse(local));
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"; 
    localStorage.clear();
    toast.success("Đã đăng xuất");
    router.push("/auth/signin");
  };

  const handleUpdateProfile = () => {
    router.push("/onboarding");
  };

  const handleChangePassword = () => {
    const email = profile?.email || "";
    router.push(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-700 animate-pulse font-semibold">Đang tải hồ sơ...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="p-10 text-center shadow-lg bg-white/80 backdrop-blur-sm">
          <p className="text-xl mb-6 font-semibold text-gray-700">Chưa có hồ sơ dinh dưỡng</p>
          <Button onClick={() => router.push("/onboarding")} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
            Thiết lập ngay
          </Button>
        </Card>
      </div>
    );
  }

  const displayName = profile.name && profile.name.trim() !== "" 
    ? profile.name 
    : (profile.email ? profile.email.split('@')[0] : "FoodMind User");

  const avatarChar = displayName ? displayName[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          Hồ sơ Cá nhân
        </h1>

        {/* Thông tin tài khoản */}
        <Card className="p-6 bg-white shadow-xl border-green-100 border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <Avatar className="h-20 w-20 border-4 border-green-100 shadow-sm">
                <AvatarFallback className="text-3xl bg-green-600 text-white font-bold">
                  {avatarChar}
                </AvatarFallback>
              </Avatar>
              <div className="text-left flex-1">
                <p className="text-2xl font-bold text-gray-900">{displayName}</p>
                <p className="text-gray-500 font-medium">{profile.email}</p>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Thành viên
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white shadow-red-200 shadow-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </Card>

        {/* Chỉ số cơ thể & TDEE */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white shadow-xl border-t-4 border-t-blue-500">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-500" /> Chỉ số & Mục tiêu
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-lg">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Tuổi</p>
                <p className="font-semibold text-gray-800">{profile.age} tuổi</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Giới tính</p>
                <p className="font-semibold text-gray-800">{profile.gender === "male" ? "Nam ♂" : "Nữ ♀"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Chiều cao</p>
                <p className="font-semibold text-gray-800">{profile.height} cm</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Cân nặng</p>
                <p className="font-semibold text-gray-800">{profile.currentWeight} kg</p>
              </div>
              <div className="col-span-2 border-t pt-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Mức độ vận động</p>
                <p className="font-medium text-green-700 bg-green-50 px-3 py-1 rounded-lg inline-block">
                  {Number(profile.activityLevel) === 1.2 ? "Ít vận động (Văn phòng)" :
                   Number(profile.activityLevel) === 1.375 ? "Nhẹ nhàng (1-3 buổi/tuần)" :
                   Number(profile.activityLevel) === 1.55 ? "Trung bình (3-5 buổi/tuần)" : "Nặng nhọc (Vận động viên)"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Mục tiêu hiện tại</p>
                <p className="font-bold text-blue-600 text-xl uppercase tracking-tight">
                  {profile.goal === "lose" ? "📉 Giảm cân" :
                   profile.goal === "maintain" ? "⚖️ Duy trì cân nặng" : "📈 Tăng cân"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-xl flex flex-col justify-center items-center text-center border-t-4 border-t-green-500 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-2 text-gray-800 z-10">Năng lượng mục tiêu (TDEE)</h2>
            <p className="text-sm text-gray-500 mb-8 z-10">Mức năng lượng cần thiết mỗi ngày</p>
            
            <div className="relative z-10">
                <div className="absolute inset-0 bg-green-300 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 relative z-10 drop-shadow-sm">
                {profile.tdee?.toLocaleString()}
                </p>
            </div>
            <p className="text-xl font-medium text-gray-400 mt-2 mb-8 z-10">kcal/ngày</p>
            
            <Button 
              onClick={handleUpdateProfile}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-300 z-10"
              size="lg"
            >
              Cập nhật chỉ số mới
            </Button>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-green-50 opacity-50 z-0"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-50 opacity-50 z-0"></div>
          </Card>
        </div>

        {/* Hạn chế sức khỏe */}
        {profile.limitHealth && profile.limitHealth !== "Không" && (
          <Card className="p-6 bg-white shadow-xl border-l-4 border-red-500 bg-red-50/30">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-red-700">
                ⚠️ Lưu ý Sức khỏe & Dị ứng
            </h2>
            <div className="text-lg text-gray-700">
                Hệ thống sẽ tự động loại bỏ các món ăn chứa: 
                <div className="mt-2 flex flex-wrap gap-2">
                    {profile.limitHealth.split(',').map((item: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-full font-bold text-sm shadow-sm">
                            {item.trim()}
                        </span>
                    ))}
                </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}