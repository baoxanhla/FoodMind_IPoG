import json
import boto3
import os
import time
from decimal import Decimal # <--- QUAN TRỌNG
from datetime import datetime

# Kết nối DynamoDB
dynamodb = boto3.resource('dynamodb')
# Lấy tên bảng từ biến môi trường, nếu không có thì dùng tên mặc định
TABLE_USERS = dynamodb.Table(os.environ.get('USER_TABLE', 'FoodMind-Users'))
TABLE_HISTORY = dynamodb.Table(os.environ.get('HISTORY_TABLE', 'FoodMind-Update-Tdee'))

# Helper: Tính toán chỉ số cơ thể
def calculate_stats(weight, height, age, gender, activity, goal):
    # Chuyển hết về float để tính toán cho dễ
    w = float(weight)
    h = float(height)
    a = int(age)
    act = float(activity)

    # 1. Tính BMI = kg / m^2
    height_m = h / 100
    bmi = round(w / (height_m * height_m), 1)

    # 2. Tính BMR (Mifflin-St Jeor)
    bmr = (10 * w) + (6.25 * h) - (5 * a)
    if gender == 'male':
        bmr += 5
    else:
        bmr -= 161
    
    # 3. Tính TDEE = BMR * Activity
    tdee = int(bmr * act)

    # 4. Điều chỉnh theo Goal
    if goal == 'lose':
        tdee -= 500
    elif goal == 'gain':
        tdee += 500
    
    if tdee < 1200: tdee = 1200

    return bmi, int(bmr), int(tdee)

def lambda_handler(event, context):
    print("Event:", json.dumps(event))
    
    route = event.get('routeKey', '')
    
    try:
        # ======================================================
        # API 1: LẤY THÔNG TIN PROFILE (GET /user/profile)
        # ======================================================
        if route == "GET /user/profile":
            user_id = event.get('queryStringParameters', {}).get('userId')
            if not user_id: return resp(400, {"error": "Missing userId"})
            
            res = TABLE_USERS.get_item(Key={'sub': user_id})
            item = res.get('Item')
            
            if not item: return resp(404, {"error": "User not found"})
            return resp(200, item)

        # ======================================================
        # API 2: CẬP NHẬT & TÍNH TOÁN (POST /user/profile)
        # ======================================================
        elif route == "POST /user/profile":
            # 👇 FIX LỖI FLOAT: Thêm parse_float=Decimal để tự động chuyển số thập phân
            body = json.loads(event.get('body', '{}'), parse_float=Decimal)
            
            user_id = body.get('sub')
            if not user_id: return resp(400, {"error": "Missing sub (userId)"})

            # Lấy dữ liệu cũ để tính diff
            try:
                old_data = TABLE_USERS.get_item(Key={'sub': user_id}).get('Item', {})
            except:
                old_data = {}

            # Lấy Input (Dữ liệu lúc này đã là Decimal nhờ lệnh json.loads ở trên)
            weight = body.get('currentWeight')
            height = body.get('height')
            age = body.get('age')
            gender = body.get('gender')
            activity = body.get('activityLevel')
            goal = body.get('goal')
            limit_health = body.get('limitHealth', 'Không')
            note = body.get('note', 'Cập nhật hồ sơ')

            # Tính toán (Convert sang float để tính, rồi convert ngược lại Decimal để lưu)
            bmi_val, bmr_val, tdee_val = calculate_stats(weight, height, age, gender, activity, goal)
            
            # Tính diff cân nặng
            old_w = old_data.get('currentWeight', weight)
            diff_val = float(weight) - float(old_w)

            timestamp = datetime.now().isoformat()

            # Chuẩn bị data bảng Users (Ép kiểu Decimal cho chắc chắn)
            user_item = {
                'sub': user_id,
                'name': body.get('name', old_data.get('name', 'User')),
                'email': body.get('email', old_data.get('email', '')),
                'gender': gender,
                'age': int(age),
                'height': Decimal(str(height)),
                'currentWeight': Decimal(str(weight)),
                'limitHealth': limit_health,
                'activityLevel': Decimal(str(activity)),
                'goal': goal,
                'tdee': int(tdee_val), # Integer thì DynamoDB chịu
                'updatedAt': timestamp
            }

            # Chuẩn bị data bảng History
            history_item = {
                'sub': user_id,
                'updatedAt': timestamp,
                'weight': Decimal(str(weight)),
                'tdee': int(tdee_val),
                'bmi': Decimal(str(bmi_val)), # 👇 Convert float -> Decimal(str(...))
                'bmr': int(bmr_val),
                'activityLevel': Decimal(str(activity)),
                'goal': goal,
                'limitHealth': limit_health,
                'diff': Decimal(str(round(diff_val, 2))), # 👇 Convert float -> Decimal
                'note': note
            }

            # Lưu vào DB
            TABLE_USERS.put_item(Item=user_item)
            TABLE_HISTORY.put_item(Item=history_item)

            return resp(200, {
                "message": "Cập nhật thành công!", 
                "tdee": tdee_val, 
                "bmi": bmi_val
            })

    except Exception as e:
        print(f"Error: {str(e)}")
        return resp(500, {"error": str(e)})

# Class hỗ trợ convert Decimal sang JSON khi trả về Frontend
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def resp(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        },
        "body": json.dumps(body, cls=DecimalEncoder, ensure_ascii=False)
    }