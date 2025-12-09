// src/lib/auth.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("ERROR: NEXT_PUBLIC_API_URL không có! Kiểm tra .env.local");
}

// 1. ĐĂNG KÝ (Đã thêm tham số name)
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, { 
        email, 
        password,
        name // 👇 Đã bổ sung gửi tên xuống Backend
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || "Lỗi đăng ký" };
  }
};

// 2. XÁC THỰC OTP ĐĂNG KÝ
export const confirmSignUp = async (email: string, code: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/confirm`, { email, code });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || "Sai mã OTP" };
  }
};

// 3. ĐĂNG NHẬP
export const signIn = async (email: string, password: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    const accessToken = 
        res.data.AccessToken || 
        res.data.accessToken || 
        res.data.AuthenticationResult?.AccessToken;

    const idToken = 
        res.data.IdToken || 
        res.data.idToken || 
        res.data.AuthenticationResult?.IdToken;

    if (accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", accessToken);
        if (idToken) localStorage.setItem("idToken", idToken);
      }
      document.cookie = `token=${accessToken}; path=/; max-age=86400`;
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.error || "Sai email hoặc mật khẩu" };
  }
};

// 4. GỬI LẠI OTP
export const resendOtp = async (email: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/resend`, { email });
    return { success: true, message: res.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Gửi lại OTP thất bại",
    };
  }
};

// 5. YÊU CẦU QUÊN MẬT KHẨU (Gửi mã về email)
export const forgotPassword = async (email: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return { success: true, message: res.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Lỗi gửi yêu cầu",
    };
  }
};

// 6. XÁC NHẬN ĐỔI MẬT KHẨU MỚI
export const confirmResetPassword = async (email: string, code: string, password: string) => {
  try {
    const res = await axios.post(`${API_URL}/auth/confirm-forgot-password`, {
      email,
      code,
      password,
    });
    return { success: true, message: res.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Đổi mật khẩu thất bại",
    };
  }
};