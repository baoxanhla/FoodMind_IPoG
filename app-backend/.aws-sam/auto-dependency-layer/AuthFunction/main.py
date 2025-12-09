import json
import boto3
from botocore.exceptions import ClientError

# Thay bằng App client ID mới (không secret) của bạn
CLIENT_ID = "kakdbah6jbaaf2lq0cgs369c2"  # ← SỬA THÀNH CỦA BẠN

cognito = boto3.client('cognito-idp', region_name='ap-southeast-1')

def lambda_handler(event, context):
    route = event.get('routeKey', '')
    body = json.loads(event.get('body', '{}')) if event.get('body') else {}

    try:
        if route == "POST /auth/register":
            cognito.sign_up(
                ClientId=CLIENT_ID,
                Username=body['email'],
                Password=body['password'],
                UserAttributes=[{'Name': 'email', 'Value': body['email']}]
            )
            return resp(200, {"message": "Đăng ký thành công! Kiểm tra email lấy OTP"})

        elif route == "POST /auth/login":
            result = cognito.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={'USERNAME': body['email'], 'PASSWORD': body['password']}
            )['AuthenticationResult']
            return resp(200, {
                "accessToken": result['AccessToken'],
                "idToken": result['IdToken'],
                "refreshToken": result['RefreshToken'],
                "expiresIn": result['ExpiresIn']
            })

        elif route == "POST /auth/confirm":
            cognito.confirm_sign_up(ClientId=CLIENT_ID, Username=body['email'], ConfirmationCode=body['code'])
            return resp(200, {"message": "Xác nhận thành công!"})

        elif route == "POST /auth/resend-otp":
            cognito.resend_confirmation_code(ClientId=CLIENT_ID, Username=body['email'])
            return resp(200, {"message": "Gửi lại OTP thành công!"})

        elif route in ["POST /auth/forgot-password", "POST /forgot-password"]:
            cognito.forgot_password(ClientId=CLIENT_ID, Username=body['email'])
            return resp(200, {"message": "Mã reset đã gửi!"})

        else:
            return resp(404, {"error": "Not found"})
    except ClientError as e:
        return resp(400, {"error": e.response['Error']['Message']})
    except Exception as e:
        return resp(500, {"error": str(e)})

def resp(code, body):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body, ensure_ascii=False)
    }