import json
import boto3
import os
import time
from datetime import datetime, timedelta
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
TABLE_LOGS = dynamodb.Table(os.environ.get('LOGS_TABLE', 'FoodMind-MealLogs'))

# 👇 HÀM QUAN TRỌNG: ĐỒNG NHẤT GIỜ VN (UTC+7)
def get_vietnam_time():
    return datetime.utcnow() + timedelta(hours=7)

def lambda_handler(event, context):
    try:
        # Parse body
        body = json.loads(event.get('body', '{}'), parse_float=Decimal)
        user_id = body.get('sub')
        logs = body.get('logs', []) # Danh sách các bữa ăn cần lưu

        if not user_id or not logs:
            return resp(400, {"error": "Thiếu thông tin userId hoặc dữ liệu logs"})

        # 👇 SỬA Ở ĐÂY: Lấy giờ VN để xác định ngày
        now_vn = get_vietnam_time()
        current_date = now_vn.strftime('%Y-%m-%d') # Ra đúng ngày VN (Ví dụ: 2025-12-08)
        
        timestamp = int(time.time())

        # Duyệt qua từng bữa (breakfast, lunch, dinner) được gửi lên
        with TABLE_LOGS.batch_writer() as batch:
            for log in logs:
                meal_type = log.get('meal') 
                foods = log.get('foods', [])
                
                if not foods: continue

                # Tính tổng calo của bữa đó
                total_cal = sum(float(f.get('Calorie', 0)) for f in foods)

                item = {
                    'sub': user_id,
                    'dateMeal': f"{current_date}#{meal_type}", # Key theo ngày VN
                    'dateShort': current_date,                 # Key theo ngày VN
                    'mealType': meal_type,
                    'loggedAt': timestamp,
                    'totalCalories': Decimal(str(total_cal)),
                    'foods': foods 
                }
                
                batch.put_item(Item=item)

        return resp(200, {"message": "Đã lưu nhật ký thành công!"})

    except Exception as e:
        print(f"Error: {str(e)}")
        return resp(500, {"error": str(e)})

def resp(code, body):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body, default=str, ensure_ascii=False)
    }