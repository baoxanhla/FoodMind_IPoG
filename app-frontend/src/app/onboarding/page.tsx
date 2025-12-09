"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { saveUserProfile, getUserProfile } from "@/lib/user"; 

const MACRO = [
  { name: "Protein", value: 30, color: "#2563eb" },
  { name: "Fat", value: 30, color: "#10b981" },
  { name: "Carb", value: 40, color: "#4ade80" },
];

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "", 
    age: "", 
    gender: "male", 
    height: "", 
    weight: "", 
    activity: "1.2", 
    goal: "lose", 
    restrictions: [] as string[],
    customRestriction: ""       
  });

  const [resultTdee, setResultTdee] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
        const res = await getUserProfile();
        if (res.success && res.data) {
            const p = res.data;
            setForm(prev => ({
                ...prev,
                name: p.name || "", // Lấy tên cũ
                age: p.age || "",
                gender: p.gender || "male",
                height: p.height || "",
                weight: p.currentWeight || "",
                activity: String(p.activityLevel || "1.2"),
                goal: p.goal || "lose"
            }));
        }
    }
    loadData();
  }, []);

  // --- 1. TÍNH TDEE TỨC THÌ ---
  useEffect(() => {
    const calculateTDEE = () => {
      const w = parseFloat(form.weight);
      const h = parseFloat(form.height);
      const a = parseFloat(form.age);
      const act = parseFloat(form.activity);

      if (!w || !h || !a) {
        setResultTdee(null);
        return;
      }

      let bmr = (10 * w) + (6.25 * h) - (5 * a);
      bmr += (form.gender === 'male' ? 5 : -161);

      let tdee = bmr * act;

      if (form.goal === 'lose') tdee -= 500;
      if (form.goal === 'gain') tdee += 500;

      setResultTdee(Math.round(tdee));
    };

    calculateTDEE();
  }, [form.weight, form.height, form.age, form.activity, form.gender, form.goal]);

  // --- 2. XỬ LÝ LƯU VÀO DATABASE ---
  const handleSubmit = async () => {
    // Kiểm tra thêm trường Name
    if (!form.name || !form.age || !form.height || !form.weight) return toast.error("Vui lòng điền đầy đủ thông tin!");
    
    setLoading(true);

    const finalRestrictions = [
        ...form.restrictions,
        form.customRestriction.trim()
    ].filter(Boolean).join(", "); 

    const payload = {
      name: form.name, 
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      currentWeight: Number(form.weight),
      activityLevel: form.activity,
      goal: form.goal,
      limitHealth: finalRestrictions,
      note: "Cập nhật từ Onboarding"
    };

    const res = await saveUserProfile(payload);

    if (res.success) {
      const finalTdee = res.data.tdee;
      localStorage.setItem("tdee", String(finalTdee));
      localStorage.setItem("profile", JSON.stringify(res.data));

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
      <rect width="24" height="24" rx="6" fill="#3cb569ff" />
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

      setTimeout(() => router.push("/recommend"), 1500);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const toggleRestriction = (item: string, checked: boolean) => {
    setForm(prev => ({
        ...prev,
        restrictions: checked 
            ? [...prev.restrictions, item] 
            : prev.restrictions.filter(r => r !== item)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-2">
      <div className="max-w-5xl mx-auto pt-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Nutri-Profile Setup</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form bên trái */}
          <Card className="p-8 shadow-9xl bg-white">
            <h2 className="text-2xl font-bold mb-6">Thiết lập Hồ sơ Dinh dưỡng</h2>
            <div className="space-y-5">
              
              <div>
                <Label>Tên hiển thị</Label>
                <Input 
                    placeholder="Nhập tên của bạn" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tuổi</Label><Input type="number" placeholder="20" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label>Giới tính</Label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.gender === "male"} onChange={() => setForm({ ...form, gender: "male" })} className="text-green-600 accent-green-600 w-4 h-4" /> Nam</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.gender === "female"} onChange={() => setForm({ ...form, gender: "female" })} className="text-green-600 accent-green-600 w-4 h-4" /> Nữ</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Chiều cao (cm)</Label><Input type="number" placeholder="170" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></div>
                <div><Label>Cân nặng (kg)</Label><Input type="number" placeholder="65" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
              </div>

              <div><Label>Mức độ vận động</Label>
                <Select value={form.activity} onValueChange={v => setForm({ ...form, activity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">Ít vận động (Văn phòng)</SelectItem>
                    <SelectItem value="1.375">Nhẹ nhàng (1-3 buổi/tuần)</SelectItem>
                    <SelectItem value="1.55">Trung bình (3-5 buổi/tuần)</SelectItem>
                    <SelectItem value="1.725">Nặng nhọc (6-7 buổi/tuần)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div><Label>Mục tiêu</Label>
                <div className="flex gap-4 mt-2">
                  {["Giảm cân", "Duy trì", "Tăng cân"].map((g, i) => {
                      const val = i===0?"lose":i===1?"maintain":"gain";
                      return (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.goal === val} onChange={() => setForm({ ...form, goal: val })} className="text-green-600 accent-green-600 w-4 h-4" />
                      {g}
                    </label>
                  )})}
                </div>
              </div>

              {/* PHẦN HẠN CHẾ SỨC KHỎE */}
              <div>
                <Label>Hạn chế sức khỏe / Dị ứng</Label>
                <div className="space-y-3 mt-2 border p-3 rounded-lg bg-gray-50">
                    {["Dị ứng hải sản", "Ăn chay", "Bệnh Gout"].map(item => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox 
                                id={item} 
                                checked={form.restrictions.includes(item)}
                                onCheckedChange={(checked) => toggleRestriction(item, checked as boolean)}
                            />
                            <label htmlFor={item} className="text-sm font-medium leading-none cursor-pointer">
                                {item}
                            </label>
                        </div>
                    ))}
                    <div className="pt-2 border-t mt-2">
                        <Label className="text-xs text-gray-500 mb-1 block">Khác (Nhập thêm)</Label>
                        <div className="relative">
                            <Input 
                                placeholder="VD: Không ăn hành..." 
                                maxLength={50}
                                value={form.customRestriction}
                                onChange={(e) => setForm({ ...form, customRestriction: e.target.value })}
                                className="bg-white"
                            />
                            <div className="text-[10px] text-gray-400 absolute right-2 bottom-2">
                                {form.customRestriction.length}/50
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bên phải (Kết quả TDEE) */}
          <div className="space-y-6">
            <Card className="p-6 shadow-xl bg-white border-2 border-green-100 sticky top-6">
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-700">TDEE Dự kiến</h3>
              <div className="text-center py-6">
                {resultTdee ? (
                   <div className="animate-in zoom-in duration-300">
                     <span className="text-6xl text-green-600 font-extrabold tracking-tighter">
                        {resultTdee.toLocaleString()}
                     </span>
                     <span className="text-xl text-gray-500 block mt-2 font-medium">kcal/ngày</span>
                   </div>
                ) : (
                    <div className="text-gray-300 text-4xl font-bold py-4">---</div>
                )}
              </div>
              <p className="text-center text-xs text-gray-400 mb-4">
                Tự động tính toán theo công thức Mifflin-St Jeor
              </p>

              <Card className="p-4 shadow-xl bg-white">

              <h3 className="text-lg font-semibold mb-1 text-center">Phân bổ Macro (Gợi ý)</h3>

              <ResponsiveContainer width="100%" height={200}>

                <PieChart>

                  <Pie data={MACRO} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>

                    {MACRO.map((e, i) => <Cell key={i} fill={e.color} />)}

                  </Pie>

                </PieChart>

              </ResponsiveContainer>

              <div className="flex justify-center gap-4 mt-1 text-sm pb-2">

                {MACRO.map(m => (

                  <div key={m.name} className="flex items-center gap-2">

                    <div className="w-3 h-3 rounded-full" style={{background: m.color}}></div>

                    <span className="font-medium text-gray-700">{m.name} {m.value}%</span>

                  </div>

                ))}

              </div>
              </Card>

              <Button 
                  onClick={handleSubmit} 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-8 shadow-lg shadow-green-200 transition-all hover:scale-[1.02]" 
                  disabled={loading || !resultTdee}
              >
                {loading ? "Đang lưu..." : "Lưu Hồ sơ & Bắt đầu 🚀"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}