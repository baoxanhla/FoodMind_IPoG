// app-frontend/src/lib/user.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm giải mã JWT để lấy User ID (sub) từ cookie hoặc localStorage
export function getUserSub() {
  // Ưu tiên lấy từ LocalStorage 
  let token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // Nếu không có, thử tìm trong Cookie
  if (!token && typeof document !== 'undefined') {
    token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || null;;
  }

  if (!token) {
    console.warn("Không tìm thấy token đăng nhập!");
    return null;
  }

  try {
    // Giải mã JWT để lấy 'sub' (User ID)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).sub;
  } catch (e) {
    console.error("Lỗi giải mã token:", e);
    return null;
  }
}

// Gọi API lưu profile
export async function saveUserProfile(data: any) {
  const sub = getUserSub();
  if (!sub) return { success: false, message: "Chưa đăng nhập!" };

  try {
    const payload = {
      sub: sub, 
      ...data
    };
    
    console.log("Sending to Backend:", payload);
    const res = await axios.post(`${API_URL}/user/profile`, payload);
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("Save Profile Error:", error);
    return { success: false, message: error.response?.data?.error || "Lỗi kết nối server" };
  }
}

// Gọi API lấy profile
export async function getUserProfile() {
  const sub = getUserSub();
  if (!sub) return { success: false, message: "Chưa đăng nhập!" };

  try {
    const res = await axios.get(`${API_URL}/user/profile?userId=${sub}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || "Chưa có hồ sơ" };
  }
}