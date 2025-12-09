import json
import boto3
import os
from decimal import Decimal

# 1. KHAI BÁO CORS CHUẨN
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

# 2. KHỞI TẠO CLIENT
bedrock = boto3.client(
    service_name='bedrock-runtime', 
    region_name='ap-northeast-1' 
)

def lambda_handler(event, context):
    try:
        # XỬ LÝ OPTIONS (PREFLIGHT)
        route = event.get('routeKey', '')
        if route and route.startswith("OPTIONS"):
             return resp(200, {"message": "CORS Preflight OK"})

        # Lấy text từ Frontend
        body = json.loads(event.get('body', '{}'))
        user_text = body.get('text', '')
        
        if not user_text:
            return resp(400, {"error": "Vui lòng nhập món ăn"})

        # Prompt
        system_content = """Bạn là chuyên gia dinh dưỡng. Phân tích món ăn và trả về JSON CHÍNH XÁC như mẫu:
        {
            "items": [
                { "name": "Tên món", "calo": 500, "unit": "1 tô" }
            ],
            "total": 500
        }
        Không giải thích thêm."""

        # MODEL ID DEEPSEEK
        model_id = "deepseek.v3-v1:0"
        
        # CẤU TRÚC REQUEST
        native_request = {
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_text}
            ],
            "max_tokens": 2048,
            "temperature": 0.1
        }

        # Gọi Bedrock
        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(native_request)
        )
        
        # Xử lý kết quả
        model_response = json.loads(response["body"].read())
        
        if "choices" in model_response:
            ai_text = model_response["choices"][0]["message"]["content"]
        else:
            ai_text = model_response.get("generation", "")
        
        cleaned_json = ai_text.replace("```json", "").replace("```", "").strip()
        result_data = json.loads(cleaned_json)

        return resp(200, result_data)

    except Exception as e:
        print(f"LỖI CHI TIẾT: {str(e)}")
        return resp(500, {"error": "Lỗi AI phân tích", "details": str(e)})

def resp(code, body):
    return {
        "statusCode": code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False)
    }