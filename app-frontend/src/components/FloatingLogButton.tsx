"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Edit3 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { getUserSub } from "@/lib/user";
import { PhoAnimatedIcon } from "@/components/icons/PhoAnimatedIcon";
import { useRouter } from "next/navigation"; // 👈 Import Router

// Hàm tiện ích: Tự đoán bữa ăn dựa trên giờ hiện tại
const getMealByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  return "dinner";
};

export default function FloatingLogButton() {
  const router = useRouter(); // Khởi tạo router
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [result, setResult] = useState<any>(null);
  const [mealType, setMealType] = useState(getMealByTime());

  // 👇 HÀM XỬ LÝ KHI BẤM NÚT TÔ PHỞ (KIỂM TRA ĐĂNG NHẬP)
  const handleOpen = () => {
    const sub = getUserSub();
    if (!sub) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng AI!");
      router.push("/auth/signin"); // Chuyển hướng
      return;
    }
    setOpen(true);
  };

  // 1. GỌI AI PHÂN TÍCH
  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        text: text
      });
      
      setResult(res.data);
      setMealType(getMealByTime()); 
      
      // Toast thông báo đẹp (Icon tùy chỉnh)
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
          <span>AI đã phân tích xong!</span>
        </span>
      );

    } catch (error) {
      console.error(error);
      toast.error("Lỗi phân tích. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  };

  // 2. LƯU VÀO DATABASE
  const handleSave = async () => {
    const sub = getUserSub();
    if (!sub || !result) {
        toast.error("Vui lòng đăng nhập lại");
        return;
    }

    setSaving(true);
    try {
      const payload = {
        sub: sub,
        logs: [
          {
            meal: mealType, 
            foods: result.items.map((item: any) => ({
              FoodName: item.name,      
              Calorie: item.calo,       
              Unit: item.unit || "1 phần", 
              Category: "món ăn"        
            }))
          }
        ]
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/meals`, payload);

      toast.success(`Đã lưu ${result.total} kcal vào bữa ${mealType === 'breakfast' ? 'Sáng' : mealType === 'lunch' ? 'Trưa' : 'Tối'}!`);
      
      // Tự động đóng và reset form (KHÔNG reload trang)
      setOpen(false);
      setText("");
      setResult(null);

    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu nhật ký.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Nút Floating Button - Hình Tô Phở Động */}
      <button
        onClick={handleOpen} // Sử dụng hàm handleOpen để kiểm tra đăng nhập
        className="fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center 
                   transition-transform hover:scale-110 active:scale-95
                   drop-shadow-[0_10px_15px_rgba(251,146,60,0.4)] hover:drop-shadow-[0_20px_25px_rgba(251,146,60,0.5)]"
        aria-label="Ghi nhật ký ăn uống"
      >
        <PhoAnimatedIcon className="w-full h-full" />
      </button>

      {/* Dialog Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-center font-bold text-gray-800 flex items-center justify-center gap-2">
               🥗 AI Food Logger
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!result ? (
              // --- MÀN HÌNH 1: NHẬP LIỆU ---
              <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center">
                  Nhập món bạn vừa ăn, AI sẽ tự tính calo cho bạn.
                </p>
                <Textarea
                  placeholder="Ví dụ: Sáng nay ăn 1 ổ bánh mì thịt và uống ly cà phê sữa..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[120px] resize-none text-base p-4 border-gray-200 focus:border-green-500 rounded-xl bg-gray-50"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || analyzing}
                  className="w-full bg-black hover:bg-gray-800 text-white py-6 rounded-xl text-lg font-medium transition-all"
                >
                  {analyzing ? (
                    <><Loader2 className="mr-2 animate-spin" /> Đang suy nghĩ...</>
                  ) : (
                    "Phân tích ngay ⚡"
                  )}
                </Button>
              </div>
            ) : (
              // --- MÀN HÌNH 2: KẾT QUẢ & XÁC NHẬN ---
              <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                
                {/* Danh sách món AI tìm được */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-200 text-green-800 text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                    AI DEEPSEEK
                  </div>
                  <div className="mb-3 flex items-end gap-2">
                     <h3 className="text-2xl font-bold text-green-700">{result.total}</h3>
                     <span className="text-sm text-gray-600 mb-1">kcal</span>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {result.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                        <span className="font-medium text-gray-700 text-sm">{item.name} <span className="text-gray-400 text-xs">({item.unit})</span></span>
                        <span className="font-bold text-gray-600 text-sm">{item.calo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chọn bữa ăn (Icon sinh động) */}
                <div>
                    <p className="text-xs text-gray-500 text-center mb-2 uppercase tracking-wider font-bold">Chọn bữa ăn</p>
                    <div className="flex gap-2 justify-center">
                    {['breakfast', 'lunch', 'dinner'].map((m) => (
                        <button
                        key={m}
                        onClick={() => setMealType(m)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                            mealType === m 
                            ? "bg-green-600 text-white border-green-600 shadow-md transform -translate-y-1" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                        >
                        {m === 'breakfast' ? '🌅 Sáng' : m === 'lunch' ? '🌞 Trưa' : '🌇 Tối'}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Button variant="outline" onClick={() => setResult(null)} className="col-span-1 border-gray-200 text-gray-500 hover:bg-gray-50">
                    <Edit3 className="w-4 h-4 mr-1" /> Sửa
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="col-span-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Lưu Nhật Ký</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}