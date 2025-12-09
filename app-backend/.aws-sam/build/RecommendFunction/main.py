import json
import boto3
import os
import random
from datetime import datetime, timedelta
from decimal import Decimal
from boto3.dynamodb.conditions import Key

# 1. KHAI BÁO CORS CHUẨN
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

dynamodb = boto3.resource('dynamodb')
TABLE_USERS = dynamodb.Table(os.environ.get('USER_TABLE', 'FoodMind-Users'))
TABLE_LOGS = dynamodb.Table(os.environ.get('LOGS_TABLE', 'FoodMind-MealLogs'))
TABLE_FOODS = dynamodb.Table(os.environ.get('FOOD_TABLE', 'FoodMind-Foods'))

# ... (Giữ nguyên các hàm get_vietnam_time, get_history_blacklist, generate_combo không đổi) ...
def get_vietnam_time():
    return datetime.utcnow() + timedelta(hours=7)

def get_history_blacklist(user_id):
    blacklist = set()
    today = get_vietnam_time()
    dates_to_check = []
    for i in range(1, 3): 
        d = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        dates_to_check.append(d)
    try:
        for d in dates_to_check:
            resp = TABLE_LOGS.query(
                KeyConditionExpression=Key('sub').eq(user_id) & Key('dateMeal').begins_with(d)
            )
            for item in resp.get('Items', []):
                for food in item.get('foods', []):
                    if food.get('category') == 'món ăn': 
                        blacklist.add(food.get('foodName'))
    except Exception as e:
        print(f"Lỗi blacklist: {e}")
    return blacklist

def generate_combo(mains, desserts, budget, exclude_names=[]):
    available_mains = [m for m in mains if m['FoodName'] not in exclude_names]
    if not available_mains: available_mains = mains
    if not available_mains: return None

    random.shuffle(available_mains)
    selected_main = None
    selected_dessert = None
    total_calo = 0

    for main in available_mains:
        cal = float(main.get('Calorie', 0))
        if cal <= budget:
            selected_main = main
            total_calo += cal
            break
    
    if not selected_main and available_mains:
        selected_main = min(available_mains, key=lambda x: float(x.get('Calorie', 0)))
        total_calo = float(selected_main.get('Calorie', 0))

    remaining = budget - total_calo
    if remaining > 30:
        valid_desserts = [d for d in desserts if float(d.get('Calorie', 0)) <= remaining]
        if valid_desserts:
            selected_dessert = random.choice(valid_desserts)
            total_calo += float(selected_dessert.get('Calorie', 0))

    combo_items = []
    if selected_main: combo_items.append(selected_main)
    if selected_dessert: combo_items.append(selected_dessert)

    return {
        "items": combo_items,
        "totalCalorie": int(total_calo)
    }

def lambda_handler(event, context):
    # XỬ LÝ OPTIONS (PREFLIGHT)
    route = event.get('routeKey', '')
    if route and route.startswith("OPTIONS"):
            return resp(200, {"message": "CORS Preflight OK"})

    user_id = event.get('queryStringParameters', {}).get('userId')
    if not user_id: return resp(400, {"error": "Missing userId"})

    try:
        # 1. Lấy thông tin User
        user_res = TABLE_USERS.get_item(Key={'sub': user_id})
        user = user_res.get('Item')
        if not user: return resp(404, {"error": "User not found"})
        
        tdee = float(user.get('tdee', 2000))
        limit_health = user.get('limitHealth', 'Không')

        # 2. Lấy Blacklist
        blacklist = get_history_blacklist(user_id)

        # 3. Lấy tất cả món ăn
        foods_res = TABLE_FOODS.scan()
        all_foods = foods_res.get('Items', [])

        # 4. Tính Budget Calo
        meal_configs = {
            "breakfast": {"percent": 0.30, "db_key": "Breakfast"},
            "lunch":     {"percent": 0.40, "db_key": "Lunch"},
            "dinner":    {"percent": 0.30, "db_key": "Dinner"}
        }
        
        recommendations = {}

        for meal_key, config in meal_configs.items():
            budget = tdee * config["percent"]
            db_meal_key = config["db_key"]
            
            mains = []
            desserts = []
            
            for f in all_foods:
                # 1. Lọc bệnh lý
                if limit_health != 'Không' and limit_health in f.get('RestrictedDiseases', []): continue
                
                # 2. Lọc thời gian (Bữa)
                if not f.get('Meals', {}).get(db_meal_key, False): continue

                cat = f.get('Category', '').strip()
                
                if cat == 'món ăn':
                    if f.get('FoodName') not in blacklist: 
                        mains.append(f)
                elif cat == 'tráng miệng':
                    desserts.append(f)
                else:
                    continue

            # Option 1
            option1 = generate_combo(mains, desserts, budget, exclude_names=[])
            
            # Option 2
            exclude_list = []
            if option1 and len(option1['items']) > 0:
                exclude_list.append(option1['items'][0]['FoodName'])
            
            option2 = generate_combo(mains, desserts, budget, exclude_names=exclude_list)

            recommendations[meal_key] = {
                "budget": int(budget),
                "options": [option1, option2]
            }

        return resp(200, recommendations)

    except Exception as e:
        print(f"Error: {str(e)}")
        return resp(500, {"error": str(e)})

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal): return float(obj)
        return super(DecimalEncoder, self).default(obj)

# HÀM RESP CHUẨN (DÙNG CORS_HEADERS)
def resp(code, body):
    return {
        "statusCode": code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder, ensure_ascii=False)
    }