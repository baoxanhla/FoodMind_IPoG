import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Activity, ChefHat } from "lucide-react";
import { PhoAnimatedIcon } from "@/components/icons/PhoAnimatedIcon"; 

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" />
            <span>🤖 Trợ lý dinh dưỡng đầu tiên tại Việt Nam</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Ăn ngon, sống khỏe cùng <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">FoodMind</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
            Không cần đau đầu nghĩ "Hôm nay ăn gì?". Hãy để AI phân tích khẩu vị, tính toán calo và gợi ý thực đơn cá nhân hóa dành riêng cho bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in zoom-in duration-700 delay-200">
            <Link href="/onboarding">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200">
                Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-gray-300 hover:bg-gray-50">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Icons Decor */}
        <div className="absolute top-1/4 left-10 opacity-20 animate-bounce duration-[3000ms]">
            <PhoAnimatedIcon className="w-24 h-24" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Theo dõi Calo & TDEE</h3>
              <p className="text-gray-500">Tự động tính toán chỉ số cơ thể và đề xuất lượng calo phù hợp để tăng/giảm cân.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Phân tích món ăn</h3>
              <p className="text-gray-500">Chỉ cần nhập "1 tô phở", AI sẽ phân tích thành phần dinh dưỡng chi tiết trong tích tắc.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gợi ý thực đơn</h3>
              <p className="text-gray-500">Hệ thống gợi ý món ăn dựa trên sở thích, dị ứng và mục tiêu sức khỏe của bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer đơn giản */}
      <footer className="py-8 border-t text-center text-gray-400 text-sm">
        © 2025 FoodMind. All rights reserved.
      </footer>
    </div>
  );
}