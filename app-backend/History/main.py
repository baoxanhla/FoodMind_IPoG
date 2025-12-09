import json
import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
TABLE_LOGS = dynamodb.Table(os.environ.get('LOGS_TABLE', 'FoodMind-MealLogs'))

def get_vietnam_time():
    return datetime.utcnow() + timedelta(hours=7)

def lambda_handler(event, context):
    user_id = event.get('queryStringParameters', {}).get('userId')
    if not user_id: return resp(400, {"error": "Missing userId"})

    try:
        # 1. Xác định khoảng thời gian (7 ngày gần nhất)
        today = get_vietnam_time()
        start_date = (today - timedelta(days=6)).strftime('%Y-%m-%d')
        
        # 2. Query DynamoDB
        # Lấy tất cả các bữa ăn từ ngày start_date trở đi
        logs_res = TABLE_LOGS.query(
            KeyConditionExpression=Key('sub').eq(user_id) & Key('dateMeal').gte(start_date)
        )
        items = logs_res.get('Items', [])

        # 3. Gom nhóm theo Ngày (Grouping by Date)
        # Cấu trúc mong muốn: { "2025-12-08": { total: 2000, meals: [...] }, ... }
        history_map = {}

        for item in items:
            date_str = item.get('dateShort') # "2025-12-08"
            
            if date_str not in history_map:
                history_map[date_str] = {
                    "date": date_str,
                    "displayDate": datetime.strptime(date_str, '%Y-%m-%d').strftime('%d/%m/%Y'),
                    "totalCalories": 0,
                    "meals": []
                }
            
            # Cộng dồn calo ngày đó
            cal = float(item.get('totalCalories', 0))
            history_map[date_str]["totalCalories"] += cal
            
            # Thêm thông tin bữa ăn (Sáng/Trưa/Tối)
            history_map[date_str]["meals"].append({
                "mealType": item.get('mealType'), # breakfast, lunch...
                "calories": int(cal),
                "foodCount": len(item.get('foods', [])),
                "foodNames": ", ".join([f['FoodName'] for f in item.get('foods', [])]) # "Phở, Chuối"
            })

        # 4. Chuyển Map thành List và Sắp xếp (Mới nhất lên đầu)
        final_list = list(history_map.values())
        final_list.sort(key=lambda x: x['date'], reverse=True)

        return resp(200, final_list)

    except Exception as e:
        print(f"Error: {str(e)}")
        return resp(500, {"error": str(e)})

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal): return float(obj)
        return super(DecimalEncoder, self).default(obj)

def resp(code, body):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body, cls=DecimalEncoder, ensure_ascii=False)
    }