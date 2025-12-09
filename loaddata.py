import boto3
import json
from decimal import Decimal
import os

# Tên file dữ liệu
JSON_FILE = 'D:/a_Bao_Nguyen/AWS_FOODMIND/foodmind-foods.json'

# Kết nối DynamoDB (Region Singapore)
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('FoodMind-Foods')

def load_data():
    # Kiểm tra file có tồn tại không
    if not os.path.exists(JSON_FILE):
        print(f"❌ Lỗi: Không tìm thấy file '{JSON_FILE}'")
        return

    print(f"📂 Đang đọc dữ liệu từ {JSON_FILE}...")
    
    try:
        # Mở file và đọc JSON
        # parse_float=Decimal: Tự động chuyển số thực (400.0) thành Decimal để DynamoDB chịu nhận
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            foods_data = json.load(f, parse_float=Decimal)
            
        print(f"🚀 Bắt đầu nạp {len(foods_data)} món ăn vào DynamoDB...")

        # Dùng batch_writer để ghi nhanh hơn
        with table.batch_writer() as batch:
            for food in foods_data:
                batch.put_item(Item=food)
                print(f"✅ Đã cập nhật: {food.get('FoodName')} (ID: {food.get('FoodID')})")
        
        print("\n🎉 HOÀN TẤT! Dữ liệu đã an toàn trên Cloud.")

    except json.JSONDecodeError:
        print("❌ Lỗi: File JSON bị sai cú pháp (kiểm tra dấu phẩy, ngoặc).")
    except Exception as e:
        print(f"❌ Lỗi hệ thống: {str(e)}")

if __name__ == "__main__":
    load_data()