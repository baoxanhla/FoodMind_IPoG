// app-frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, TrendingUp, Flame, Utensils, PieChart as PieIcon, Lightbulb } from "lucide-react";
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import axios from "axios";
import { getUserSub } from "@/lib/user";
import { useRouter } from "next/navigation";

// Types
type DashboardData = {
  summary: {
    tdee: number;
    todayCalories: number;
    remaining: number;
    percentage: number;
    goal: string;
  };
  mealDistribution: { name: string; value: number }[];
  insight: { type: string; text: string };
  weeklyChart: { date: string; caloriesIn: number; targetTdee: number }[];
  recentActivities: { mealType: string; name: string; calories: number; time: string; fullDate: string }[];
};

const CircularProgress = ({ percentage, current, target }: { percentage: number, current: number, target: number }) => {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = "#22c55e"; 
  if (percentage > 90) color = "#eab308";
  if (percentage >= 100) color = "#ef4444";

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle stroke="#f1f5f9" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-800">{current}</span>
        <span className="text-[10px] text-gray-500">/ {target} kcal</span>
      </div>
    </div>
  );
};

const MEAL_COLORS = {
  "Sáng": "#fbbf24", // Vàng
  "Trưa": "#f97316", // Cam
  "Tối": "#1e40af"   // Xanh đậm
};

// Hàm render nhãn % nằm bên trong miếng bánh
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Chỉ hiện số nếu miếng bánh đủ lớn (> 5%)
  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold shadow-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const sub = getUserSub();
      if (!sub) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/auth/signin");
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard?userId=${sub}&t=${Date.now()}`;
        const res = await axios.get(url);
        setData(res.data);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-50"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;
  if (!data) return <div className="text-center p-10">Không có dữ liệu.</div>;

  // Lọc dữ liệu biểu đồ tròn: Chỉ lấy những bữa có Calo > 0
  const activeMeals = data.mealDistribution.filter(m => m.value > 0);
  const hasData = activeMeals.length > 0;

  const insightColor = data.insight.type === 'warning' ? 'bg-red-50 text-red-800 border-red-200' 
                     : data.insight.type === 'alert' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
                     : 'bg-blue-50 text-blue-800 border-blue-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-24 p-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm">Theo dõi sức khỏe toàn diện</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-medium text-green-700 capitalize">
            Mục tiêu: {data.summary.goal}
          </div>
        </div>

        {/* --- GRID LAYOUT 4 CỘT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. HÔM NAY */}
          <Card className="lg:col-span-1 p-5 bg-white shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 w-full">
              <Flame className="w-4 h-4 text-orange-500" /> Tiêu điểm Hôm nay
            </h2>
            <CircularProgress percentage={data.summary.percentage} current={data.summary.todayCalories} target={data.summary.tdee} />
            <p className={`mt-3 text-xs font-medium ${data.summary.remaining < 0 ? "text-red-500" : "text-green-600"}`}>
              {data.summary.remaining >= 0 ? `Còn ${data.summary.remaining} kcal` : `Vượt ${Math.abs(data.summary.remaining)} kcal`}
            </p>
          </Card>

          {/* 2. CƠ CẤU BỮA ĂN */}
          <Card className="lg:col-span-1 p-5 bg-white shadow-lg flex flex-col">
            <h2 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-500" /> Phân bổ Calo
            </h2>
            <div className="flex-1 min-h-[180px] flex items-center justify-center">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={activeMeals} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" cy="50%" 
                      outerRadius={80} 
                      innerRadius={0}  
                      labelLine={false} 
                      label={renderCustomizedLabel} 
                    >
                      {activeMeals.map((entry, index) => (
                        // @ts-ignore
                        <Cell key={`cell-${index}`} fill={MEAL_COLORS[entry.name] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} kcal`} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 text-xs">
                  Chưa có dữ liệu ăn uống hôm nay
                </div>
              )}
            </div>
          </Card>

          {/* 3. PHONG ĐỘ 7 NGÀY */}
          <Card className="lg:col-span-2 p-5 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Phong độ 7 ngày
              </h2>
              <div className="flex gap-3 text-[10px]">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Đã ăn</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 h-[2px]"></div> Mục tiêu</div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.weeklyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="caloriesIn" name="Đã ăn" barSize={24} radius={[4, 4, 0, 0]}>
                    {data.weeklyChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.caloriesIn > entry.targetTdee ? "#ef4444" : "#22c55e"} />
                    ))}
                  </Bar>
                  <Line type="step" dataKey="targetTdee" name="Mục tiêu" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 4. LỜI KHUYÊN */}
          <Card className={`lg:col-span-2 p-5 border ${insightColor} shadow-md flex gap-4 items-start`}>
            <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1">Lời khuyên dành cho bạn</h3>
                <p className="text-sm leading-relaxed opacity-90">
                    {data.insight.text}
                </p>
            </div>
          </Card>

          {/* 5. NHẬT KÝ VỪA NHẬP */}
          <Card className="lg:col-span-2 p-5 bg-white shadow-lg">
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-green-600" /> Hoạt động gần đây
            </h2>
            {data.recentActivities.length === 0 ? (
              <p className="text-center text-gray-400 py-2 text-xs">Chưa có dữ liệu.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.recentActivities.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex gap-2 items-center overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border text-sm shadow-sm shrink-0">
                        {item.mealType === 'breakfast' ? '🍳' : item.mealType === 'lunch' ? '🍱' : '🥗'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{item.fullDate} • {item.time}</p>
                      </div>
                    </div>
                    <div className="font-bold text-green-600 text-sm whitespace-nowrap ml-2">{item.calories} kcal</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}