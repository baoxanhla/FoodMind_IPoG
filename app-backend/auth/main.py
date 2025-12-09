import json
import boto3
import os
from botocore.exceptions import ClientError

# Lấy CLIENT_ID
CLIENT_ID = os.environ.get('CLIENT_ID', "kakdbah6jbaaf2lq0cgs369c2") 

cognito = boto3.client('cognito-idp', region_name='ap-southeast-1')

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", # Nếu muốn bảo mật hơn thì thay * bằng domain Amplify
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

def lambda_handler(event, context):
    print("Event Raw:", json.dumps(event)) 

    route = event.get('routeKey', '')
    
    # Nếu API Gateway lỡ chuyển request OPTIONS vào đây, ta trả về OK ngay
    if route.startswith("OPTIONS"):
        return resp(200, {"message": "CORS Preflight OK"})

    try:
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
    except:
        body = {}

    # Ép kiểu và xóa khoảng trắng
    email = str(body.get('email', '')).strip()
    password = str(body.get('password', '')).strip() 
    code = str(body.get('code', '')).strip()

    print(f"DEBUG: Route={route}, Email={email}") 

    try:
        # ==================== NHÓM ĐĂNG KÝ & ĐĂNG NHẬP ====================
        
        # 1. ĐĂNG KÝ
        if route == "POST /auth/register":
            cognito.sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[{'Name': 'email', 'Value': email}]
            )
            return resp(200, {"message": "Đăng ký thành công! Hãy kiểm tra email lấy mã OTP."})

        # 2. XÁC THỰC ĐĂNG KÝ (Confirm Signup)
        elif route == "POST /auth/confirm":
            if not code: return resp(400, {"error": "Thiếu mã OTP"})
            cognito.confirm_sign_up(
                ClientId=CLIENT_ID, 
                Username=email, 
                ConfirmationCode=code
            )
            return resp(200, {"message": "Xác thực tài khoản thành công!"})

        # 3. ĐĂNG NHẬP
        elif route == "POST /auth/login":
            result = cognito.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={'USERNAME': email, 'PASSWORD': password}
            )
            # Trích xuất AuthenticationResult để trả về
            auth_result = result.get('AuthenticationResult', {})
            return resp(200, auth_result) 

        # ==================== NHÓM TIỆN ÍCH ====================

        # 4. GỬI LẠI OTP
        elif route == "POST /auth/resend":
            cognito.resend_confirmation_code(ClientId=CLIENT_ID, Username=email)
            return resp(200, {"message": "Đã gửi lại mã OTP vào email."})
            
        # 5. YÊU CẦU QUÊN MẬT KHẨU
        elif route == "POST /auth/forgot-password":
            cognito.forgot_password(ClientId=CLIENT_ID, Username=email)
            return resp(200, {"message": "Mã khôi phục mật khẩu đã được gửi vào email!"})

        # 6. XÁC NHẬN ĐỔI MẬT KHẨU
        elif route == "POST /auth/confirm-forgot-password":
            if not code or not password:
                return resp(400, {"error": "Vui lòng nhập mã OTP và mật khẩu mới."})
            
            cognito.confirm_forgot_password(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=code,
                Password=password
            )
            return resp(200, {"message": "Đổi mật khẩu thành công! Hãy đăng nhập lại."})

        else:
            return resp(404, {"error": f"Không tìm thấy đường dẫn: {route}"})

    except ClientError as e:
        error_code = e.response['Error']['Code']
        msg = e.response['Error']['Message']
        print(f"AWS ERROR: {error_code} - {msg}")
        
        # Mapping lỗi sang tiếng Việt
        if error_code == "CodeMismatchException":
            return resp(400, {"error": "Mã OTP không đúng."})
        elif error_code == "ExpiredCodeException":
            return resp(400, {"error": "Mã OTP đã hết hạn."})
        elif error_code == "NotAuthorizedException":
            return resp(400, {"error": "Email hoặc mật khẩu không đúng."})
        elif error_code == "UserNotFoundException":
            return resp(404, {"error": "Email này chưa được đăng ký."})
        elif error_code == "UsernameExistsException":
            return resp(400, {"error": "Email này đã tồn tại."})
        elif error_code == "LimitExceededException":
            return resp(429, {"error": "Bạn gửi yêu cầu quá nhiều lần. Vui lòng đợi 1 lát."})
        elif error_code == "InvalidPasswordException":
            return resp(400, {"error": "Mật khẩu chưa đủ mạnh (cần chữ hoa, thường, số, ký tự đặc biệt)."})
            
        return resp(400, {"error": f"Lỗi: {msg}"})
        
    except Exception as e:
        print(f"SYSTEM ERROR: {str(e)}")
        return resp(500, {"error": "Lỗi hệ thống không xác định"})


def resp(code, body):
    return {
        "statusCode": code,
        "headers": CORS_HEADERS, 
        "body": json.dumps(body, ensure_ascii=False)
    }