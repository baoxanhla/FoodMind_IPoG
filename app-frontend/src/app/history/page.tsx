// app-frontend/src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Calendar, ChevronDown, Utensils } from "lucide-react";
import axios from "axios";
import { getUserSub } from "@/lib/user";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu từ API
type DailyHistory = {
  date: string;
  displayDate: string;
  totalCalories: number;
  meals: {
    mealType: string;
    calories: number;
    foodCount: number;
    foodNames: string;
  }[];
};

export default function History() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<DailyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý việc mở rộng danh sách
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sub = getUserSub();
      if (!sub) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/auth/signin");
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/history?userId=${sub}&t=${Date.now()}`;
        const res = await axios.get(url);
        setHistoryData(res.data);
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
        toast.error("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Nếu đã mở rộng (isExpanded = true) -> Lấy hết
  // Nếu chưa -> Chỉ lấy 3 ngày đầu tiên
  const visibleData = isExpanded ? historyData : historyData.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-24 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Nhật Ký Ăn Uống</h1>
          <p className="text-gray-500 text-sm">Lịch sử dinh dưỡng trong 7 ngày qua</p>
        </div>

        {historyData.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-white rounded-xl shadow-sm">
            Bạn chưa lưu nhật ký nào. Hãy bắt đầu ghi chép nhé!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Render danh sách các ngày */}
            {visibleData.map((day) => (
              <Card key={day.date} className="overflow-hidden bg-white shadow-md border-l-4 border-l-green-500">
                {/* Header của Card Ngày */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <Calendar className="w-5 h-5 text-green-600" />
                    {day.displayDate}
                    {/* Label Hôm nay nếu trùng ngày */}
                    {day.date === new Date().toISOString().split('T')[0] && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-2">Hôm nay</span>
                    )}
                  </div>
                  <div className="text-green-700 font-bold">
                    {Math.round(day.totalCalories)} <span className="text-xs font-normal text-gray-500">kcal</span>
                  </div>
                </div>

                {/* Danh sách bữa ăn trong ngày */}
                <div className="p-4 space-y-3">
                  {day.meals.map((meal, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm border-b last:border-0 pb-2 last:pb-0 border-gray-100">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          {meal.mealType === 'breakfast' ? '🍳' : meal.mealType === 'lunch' ? '🍱' : '🥗'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 capitalize">
                            {meal.mealType === 'breakfast' ? 'Bữa Sáng' : meal.mealType === 'lunch' ? 'Bữa Trưa' : 'Bữa Tối'}
                          </p>
                          <p className="text-gray-500 text-xs line-clamp-1">{meal.foodNames}</p>
                        </div>
                      </div>
                      <div className="font-medium text-gray-600 whitespace-nowrap">
                        {meal.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Nút Xem Tất Cả (Chỉ hiện khi dữ liệu nhiều hơn 3 và chưa mở rộng) */}
        {!isExpanded && historyData.length > 3 && (
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setIsExpanded(true)}
              variant="outline"
              className="bg-white border-green-200 text-green-700 hover:bg-green-50 px-8 py-2 rounded-full shadow-sm"
            >
              Xem tất cả 7 ngày <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Thông báo hết danh sách (Khi đã mở rộng) */}
        {isExpanded && (
          <p className="text-center text-xs text-gray-400 pt-4">
            Đã hiển thị toàn bộ lịch sử 7 ngày gần nhất.
          </p>
        )}

      </div>
    </div>
  );
}