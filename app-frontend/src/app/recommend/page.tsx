// app-frontend/src/app/recommend/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  RefreshCw, Loader2, Utensils, Lock, Edit3, 
  Menu, UtensilsCrossed, CheckCircle2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUserSub } from "@/lib/user";
import FloatingLogButton from "@/components/FloatingLogButton";

// --- TYPES ---
type FoodItem = {
  FoodID: string;
  FoodName: string;
  Calorie: number;
  Unit: string;
  Category: string;
};
type MealOption = { items: FoodItem[]; totalCalorie: number; };
type MealRecommendation = { budget: number; options: MealOption[]; };
type RecommendResponse = { breakfast: MealRecommendation; lunch: MealRecommendation; dinner: MealRecommendation; };
type SelectionState = { [key: string]: { main: FoodItem | null; dessert: FoodItem | null; }; };

type MealStatus = {
  isSaved: boolean;      
  refreshCount: number;  
  editCount: number;     
};

const MAX_LIMIT = 2; 

export default function Recommend() {
  const router = useRouter();
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState<{[key: string]: boolean}>({});

  const [selections, setSelections] = useState<SelectionState>({
    breakfast: { main: null, dessert: null },
    lunch: { main: null, dessert: null },
    dinner: { main: null, dessert: null },
  });

  const [mealStates, setMealStates] = useState<{[key: string]: MealStatus}>({
    breakfast: { isSaved: false, refreshCount: 0, editCount: 0 },
    lunch: { isSaved: false, refreshCount: 0, editCount: 0 },
    dinner: { isSaved: false, refreshCount: 0, editCount: 0 },
  });

  useEffect(() => {
    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const savedState = localStorage.getItem(`mealState_${today}`);
      if (savedState) {
        setMealStates(JSON.parse(savedState));
      }

      const savedMenu = localStorage.getItem(`savedMenu_${today}`);
      if (savedMenu) {
        setData(JSON.parse(savedMenu));
        setLoading(false);
      } else {
        await fetchData(true); 
      }
    };
    init();
  }, []);

  const updateMealState = (mealKey: string, updates: Partial<MealStatus>) => {
    setMealStates(prev => {
      const newState = { ...prev, [mealKey]: { ...prev[mealKey], ...updates } };
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`mealState_${today}`, JSON.stringify(newState));
      return newState;
    });
  };

  const fetchData = async (isInitialLoad = false) => {
    const sub = getUserSub();
    if (!sub) return router.push("/auth/signin");
    
    if (!isInitialLoad) setLoading(true);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recommend?userId=${sub}&t=${Date.now()}`);
      setData(res.data);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`savedMenu_${today}`, JSON.stringify(res.data));
    } catch (e) { 
      console.error(e); 
      toast.error("Lỗi tải thực đơn");
    } finally { 
      setLoading(false); 
    }
  };

  const handleRefreshMeal = async (mealKey: string) => {
    const currentCount = mealStates[mealKey].refreshCount;
    if (currentCount >= MAX_LIMIT) {
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
          <rect width="24" height="24" rx="6" fill="#3aa360ff" />
          <path
            d="M7 12.5l3 3 7-8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Đã mở khóa để chỉnh sửa!
      </span>);
    }

    await fetchData(); 

    updateMealState(mealKey, { refreshCount: currentCount + 1 });
    setSelections(prev => ({ ...prev, [mealKey]: { main: null, dessert: null } }));
    toast.success("");
  };

  const handleSelect = (mealKey: string, food: FoodItem) => {
    if (mealStates[mealKey].isSaved) return; 

    setSelections(prev => {
      const cur = prev[mealKey];
      const type = food.Category.toLowerCase() === "món ăn" ? "main" : "dessert";
      return { ...prev, [mealKey]: { ...cur, [type]: cur[type]?.FoodID === food.FoodID ? null : food } };
    });
  };

  const handleSaveMeal = async (mealKey: string) => {
    const sub = getUserSub();
    const sel = selections[mealKey];
    const foods = [sel.main, sel.dessert].filter(Boolean) as FoodItem[];

    if (foods.length === 0) return toast.warning("Bạn chưa chọn món nào!");

    setSavingMap(prev => ({ ...prev, [mealKey]: true }));
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
        sub: sub,
        logs: [{ meal: mealKey, foods: foods }]
      });

      updateMealState(mealKey, { isSaved: true });
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
          <rect width="24" height="24" rx="6" fill="#3aa360ff" />
          <path
            d="M7 12.5l3 3 7-8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>);
    } catch (e) {
      toast.error("Lỗi khi lưu.");
    } finally {
      setSavingMap(prev => ({ ...prev, [mealKey]: false }));
    }
  };

  const handleEditMeal = (mealKey: string) => {
    const currentCount = mealStates[mealKey].editCount;
    if (currentCount >= MAX_LIMIT) {
      return toast.error("Hôm nay bạn đã dùng hết lượt chỉnh sửa cho bữa này!");
    }

    updateMealState(mealKey, { isSaved: false, editCount: currentCount + 1 });
    toast.info("Đã mở khóa để chỉnh sửa!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-50"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;
  if (!data) return <div className="text-center p-10">No data</div>;

  const mealsDisplay = [
    { key: "breakfast", name: "Bữa Sáng", data: data.breakfast },
    { key: "lunch", name: "Bữa Trưa", data: data.lunch },
    { key: "dinner", name: "Bữa Tối", data: data.dinner },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-3 md:p-6 pb-24">
      <FloatingLogButton />

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center pt-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Thực đơn Gợi ý</h1>
          <p className="text-gray-500 mt-2">Chọn 1 Món chính + 1 Tráng miệng cho mỗi bữa</p>
        </div>

        {mealsDisplay.map((meal) => {
          const status = mealStates[meal.key];
          const isSaving = savingMap[meal.key];
          const mySel = selections[meal.key];
          const currentMealCalo = (mySel.main?.Calorie || 0) + (mySel.dessert?.Calorie || 0);

          return (
            <div key={meal.key} className={`rounded-xl shadow-sm border p-4 transition-all ${status.isSaved ? 'bg-gray-50 border-gray-200' : 'bg-white border-green-100'}`}>
              
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <div>
                  <h2 className={`text-xl font-bold flex gap-2 ${status.isSaved ? 'text-gray-500' : 'text-green-800'}`}>
                    <Utensils className="w-5 h-5"/> {meal.name}
                    {status.isSaved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã chốt</span>}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Đã chọn: <span className={status.isSaved ? "font-bold text-green-700" : "font-bold text-green-600"}>{Math.round(currentMealCalo)}</span> / {Math.round(meal.data.budget)} kcal
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRefreshMeal(meal.key)}
                    disabled={status.isSaved || status.refreshCount >= MAX_LIMIT}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Menu className="w-4 h-4 mr-2"/> Gợi ý
                  </Button>

                  {status.isSaved ? (
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditMeal(meal.key)}
                        disabled={status.editCount >= MAX_LIMIT}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2"/> Sửa
                    </Button>
                  ) : (
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveMeal(meal.key)}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UtensilsCrossed className="w-4 h-4 mr-2"/> Lưu</>}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* BODY: DANH SÁCH MÓN */}
              <div className={`${status.isSaved ? 'pointer-events-none' : ''}`}>
                <div className="grid md:grid-cols-2 gap-4">
                    {meal.data.options.map((opt, i) => (
                        <div key={i} className={`border p-3 rounded-lg relative ${i===0 ? 'bg-orange-50/30 border-orange-100' : 'bg-blue-50/30 border-blue-100'}`}>
                            <div className={`absolute -top-2 left-3 px-2 text-[10px] font-bold uppercase bg-white border rounded ${i===0 ? 'text-orange-600 border-orange-200' : 'text-blue-600 border-blue-200'}`}>
                                Option {i+1}
                            </div>
                            <div className="mt-2 space-y-2">
                                {opt.items.map(f => {
                                    const isMain = f.Category.toLowerCase() === "món ăn";
                                    const isSelected = mySel[isMain ? 'main':'dessert']?.FoodID === f.FoodID;

                                    const itemClass = status.isSaved
                                        ? (isSelected 
                                            ? 'bg-green-100 border-green-600 ring-1 ring-green-600 opacity-100 scale-[1.01]' 
                                            : 'bg-gray-50 border-transparent opacity-40 grayscale') 
                                        : (isSelected 
                                            ? 'bg-green-100 border-green-500 shadow-sm scale-[1.01]' 
                                            : 'bg-white hover:border-green-300 border-transparent shadow-sm');

                                    return (
                                        <div key={f.FoodID} onClick={() => handleSelect(meal.key, f)} 
                                            className={`p-2 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${itemClass}`}
                                        >
                                            <div>
                                                <div className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>
                                                    {f.FoodName} {status.isSaved && isSelected && ""}
                                                </div>
                                                <div className="text-[10px] text-gray-500 capitalize">{f.Category}</div>
                                            </div>
                                            <div className={`text-sm font-bold ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
                                                {f.Calorie}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}