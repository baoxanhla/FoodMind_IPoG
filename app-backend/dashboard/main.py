import json
import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
TABLE_USERS = dynamodb.Table(os.environ.get('USER_TABLE', 'FoodMind-Users'))
TABLE_LOGS = dynamodb.Table(os.environ.get('LOGS_TABLE', 'FoodMind-MealLogs'))
TABLE_HISTORY = dynamodb.Table(os.environ.get('HISTORY_TABLE', 'FoodMind-Update-Tdee'))

def get_vietnam_time():
    return datetime.utcnow() + timedelta(hours=7)

def get_tdee_for_date(target_date_str, history_items, current_tdee):
    valid_updates = [item for item in history_items if item.get('updatedAt', '')[:10] <= target_date_str]
    if not valid_updates: return current_tdee
    latest = sorted(valid_updates, key=lambda x: x.get('updatedAt', ''))[-1]
    return float(latest.get('tdee', current_tdee))

# 👇 HÀM LOGIC LỜI KHUYÊN MỚI (THEO YÊU CẦU)
def generate_smart_insight(current_hour, breakfast_cal, lunch_cal, total_today, tdee, goal):
    # 1. Logic SAU 20h (8h tối)
    if current_hour >= 20:
        if total_today > (tdee * 1.25):
            return {
                "type": "warning", # Đỏ
                "text": "Hãy hạn chế ăn thêm và ưu tiên uống nước hoặc chọn các món rất nhẹ nếu thật sự đói."
            }
    
    # 2. Logic SAU 17h (5h chiều) - Kiểm tra Sáng + Trưa
    if current_hour >= 17:
        morning_calories = breakfast_cal + lunch_cal
        if morning_calories <= (tdee * 0.5):
            return {
                "type": "alert", # Vàng
                "text": "Hãy bổ sung một bữa tối nhẹ, giàu protein và rau để giữ gìn sức khỏe và năng lượng ổn định cho cơ thể."
            }

    # 3. Logic mặc định (Nếu không rơi vào 2 trường hợp trên)
    remaining = tdee - total_today
    if remaining < 0:
        return {"type": "warning", "text": "Bạn đã nạp quá lượng Calo mục tiêu hôm nay. Hãy nghỉ ngơi nhé!"}
    elif remaining < 200:
        return {"type": "success", "text": "Bạn đã hoàn thành xuất sắc mục tiêu dinh dưỡng hôm nay!"}
    else:
        if goal == 'lose': return {"type": "info", "text": "Tiếp tục duy trì, bạn đang giảm cân rất tốt!"}
        if goal == 'gain': return {"type": "info", "text": "Đừng quên ăn đủ bữa để đạt mục tiêu tăng cân nhé."}
        return {"type": "info", "text": "Chúc bạn một ngày tràn đầy năng lượng!"}

def lambda_handler(event, context):
    user_id = event.get('queryStringParameters', {}).get('userId')
    if not user_id: return resp(400, {"error": "Missing userId"})

    try:
        user_res = TABLE_USERS.get_item(Key={'sub': user_id})
        user = user_res.get('Item')
        if not user: return resp(404, {"error": "User not found"})
        
        current_tdee = float(user.get('tdee', 2000))
        goal = user.get('goal', 'maintain')

        hist_res = TABLE_HISTORY.query(KeyConditionExpression=Key('sub').eq(user_id))
        history_items = hist_res.get('Items', [])

        today = get_vietnam_time()
        start_date = (today - timedelta(days=7)).strftime('%Y-%m-%d')
        
        logs_res = TABLE_LOGS.query(
            KeyConditionExpression=Key('sub').eq(user_id) & Key('dateMeal').gte(start_date)
        )
        logs = logs_res.get('Items', [])

        # XỬ LÝ DỮ LIỆU
        chart_data = []
        today_str = today.strftime('%Y-%m-%d')
        today_calories = 0
        
        # Biến đếm Calo từng bữa cho ngày hôm nay
        today_break = 0
        today_lunch = 0
        today_dinner = 0

        for i in range(6, -1, -1):
            d_date = today - timedelta(days=i)
            d_str = d_date.strftime('%Y-%m-%d')
            d_label = d_date.strftime('%d/%m')

            # Lấy log của ngày d_str
            daily_logs = [l for l in logs if l.get('dateShort') == d_str]
            daily_eat = sum(float(l['totalCalories']) for l in daily_logs)
            daily_target = get_tdee_for_date(d_str, history_items, current_tdee)

            chart_data.append({
                "date": d_label,
                "caloriesIn": int(daily_eat),
                "targetTdee": int(daily_target)
            })

            if d_str == today_str:
                today_calories = int(daily_eat)
                # Phân loại calo theo bữa (cho biểu đồ tròn & logic lời khuyên)
                for l in daily_logs:
                    meal = l.get('mealType')
                    cal = float(l.get('totalCalories', 0))
                    if meal == 'breakfast': today_break += cal
                    elif meal == 'lunch': today_lunch += cal
                    elif meal == 'dinner': today_dinner += cal

        # Lời khuyên thông minh
        insight = generate_smart_insight(today.hour, today_break, today_lunch, today_calories, current_tdee, goal)

        # Recent logs
        sorted_logs = sorted(logs, key=lambda x: int(x.get('loggedAt', 0)), reverse=True)[:3] # Lấy 3 cái
        recent_activities = []
        for l in sorted_logs:
            foods = l.get('foods', [])
            if not foods: continue
            first_food = foods[0].get('FoodName', 'Món ăn')
            count = len(foods) - 1
            name = f"{first_food}" + (f" + {count} món" if count > 0 else "")
            
            recent_activities.append({
                "mealType": l.get('mealType'),
                "name": name,
                "calories": int(l.get('totalCalories', 0)),
                "time": datetime.fromtimestamp(int(l.get('loggedAt')) + 7*3600).strftime('%H:%M'),
                "fullDate": l.get('dateShort')
            })

        dashboard_data = {
            "summary": {
                "tdee": int(current_tdee),
                "todayCalories": today_calories,
                "remaining": int(current_tdee - today_calories),
                "percentage": min(int((today_calories / current_tdee) * 100) if current_tdee > 0 else 0, 100),
                "goal": goal
            },
            "mealDistribution": [ # Dữ liệu cho biểu đồ tròn
                {"name": "Sáng", "value": int(today_break)},
                {"name": "Trưa", "value": int(today_lunch)},
                {"name": "Tối", "value": int(today_dinner)},
            ],
            "insight": insight, # Object {type, text}
            "weeklyChart": chart_data,
            "recentActivities": recent_activities
        }

        return resp(200, dashboard_data)

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