// src/lib/amplify-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {  // <--- Bạn thiếu wrapper này
      userPoolId: 'ap-southeast-1_JsXGgJsNA',
      userPoolClientId: 'kakdbah6jbaaf2lq0cgs369c2', // Đổi tên từ userPoolWebClientId thành userPoolClientId cho đúng chuẩn v6
    }
  }
});

// Export một function trống để gọi bên layout nếu cần, hoặc chỉ cần import file này là đủ
export default function ConfigureAmplifyClientSide() {
  return null;
}