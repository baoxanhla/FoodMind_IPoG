# 🥗 FoodMind_IPoG - Intelligent Nutrition Assistant

![AWS Architecture](https://img.shields.io/badge/Architecture-Serverless-orange) ![Next.js](https://img.shields.io/badge/Frontend-Next.js-black) ![Python](https://img.shields.io/badge/Backend-Python_3.12-blue) ![Security](https://img.shields.io/badge/Security-WAF%20%26%20Shield-red)

**FoodMind** is an application for nutrition tracking and meal recommendations powered by Generative AI (Amazon Bedrock). It is built on a fully serverless AWS architecture, ensuring low cost, high scalability, and enterprise-grade security.

------------------------------------------------------------------------

## 🏗 System Architecture

* **Frontend:** Next.js (Hosted on AWS Amplify with CloudFront CDN)
* **Backend:** AWS Lambda (Python 3.12) & API Gateway (HTTP API)
* **Database:** Amazon DynamoDB (On-demand)
* **Authentication:** Amazon Cognito (User Pools)
* **AI Engine:** Amazon Bedrock
* **Security & Monitoring:** AWS WAF, Route 53, CloudWatch, SNS

------------------------------------------------------------------------

## 🚀 Prerequisites

Ensure your computer has the following installed:

1. **Git** – to clone the repository and manage version control.
2. **AWS CLI** – to configure AWS access.
3. **AWS SAM CLI** – to deploy backend infrastructure.
4. **Node.js (v18+)** – to run the frontend.
5. **Python (v3.12)** – to run backend Lambda code.

------------------------------------------------------------------------

## 🛠 Installation & Deployment Guide (Step-by-Step)

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/baoxanhla/FoodMind_IPoG.git
cd FoodMind_IPoG
```

### **Step 2: Configure AWS Profile**

```bash
aws configure
```
Enter your AWS credentials:

- **AWS Access Key ID:** [Your Key]
- **AWS Secret Access Key:** [Your Secret]
- **Default region:** ap-southeast-1 (Singapore)
- **Output format:** json

### **Step 3: Create Amazon Cognito (Manual Setup)**
You must create a User Pool manually to obtain the App Client ID.

1. Open AWS Console → Search **Cognito**.
2. Click **Create user pool**.
3. **Sign-in options:** Select Email.
4. **User pool name:** `foodmind-user`.
5. **App client:** Select *Don't generate a client secret*.
6. Name it **FoodMindWebClient**.
7. Click **Create user pool**.

After creation, save:
- **User Pool ID**
- **App Client ID**

### **Step 4: Deploy Backend (AWS SAM)**

#### **4.1 Update configuration**
Modify `backend/template.yaml`:

```yaml
Globals:
  Function:
    Environment:
      Variables:
        CLIENT_ID: "<YOUR_COGNITO_APP_CLIENT_ID>"
```

#### **4.2 Deploy backend**

```bash
cd backend
sam build
sam deploy --guided
```
Provide inputs:
- Stack name: `foodmind-stack`
- Region: `ap-southeast-1`
- Confirm changes: `y`
- Allow role creation: `y`

📌 **After deployment:** Copy the **ApiUrl** from SAM Outputs.

### **Step 5: Enable Amazon Bedrock Models**

1. Go to Amazon Bedrock console.
2. Switch to **Tokyo** or **US East** if needed.
3. Navigate to **Model access → Modify model access**.
4. Enable the models you want (Claude 3 Sonnet, Titan, etc.).
5. Update `model_id` inside `backend/analyze_food/main.py`.

### **Step 6: Setup and Run Frontend (Local)**

```bash
cd ../frontend
npm install
```
Create `.env.local` inside `frontend/`:

```
NEXT_PUBLIC_API_URL=https://<your-api-id>.execute-api.ap-southeast-1.amazonaws.com
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_USER_POOL_ID=<Your_User_Pool_ID>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<Your_Client_ID>
```

Run frontend:

```bash
npm run dev
```
Open browser: http://localhost:3000

### **Step 7: Host Frontend on AWS Amplify (via GitLab)**

#### **7.1 Push code to GitLab**

```bash
git init
git branch -M main
git add .
git commit -m "First commit FoodMind"
git remote add origin https://gitlab.com/YOUR_USERNAME/FoodMind.git
git push -u origin main
```

#### **7.2 Connect AWS Amplify**
- Create new app → Select GitLab.
- Authorize GitLab.
- Choose repo **FoodMind**, branch **main**.
- Enable **My app is a monorepo** → set root to `frontend`.

#### **7.3 Configure Environment Variables**
Add in Amplify:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_USER_POOL_ID`
- `NEXT_PUBLIC_USER_POOL_CLIENT_ID`
- `NEXT_PUBLIC_AWS_REGION`

#### **7.4 Deploy**
Click **Save and Deploy**.
Your app is live! 🎉

------------------------------------------------------------------------

## 🛡️ Enhanced Security & Monitoring (Production Ready)

### **1. Web Application Firewall (AWS WAF)**
- Rate-based Rule: Blocks IP sending >500 requests/5 min.
- AWS Managed Rules: Protect against OWASP Top 10.

### **2. High Availability Monitoring (Route 53 & CloudWatch)**
- Route 53 Health Checks every 30 seconds.
- CloudWatch Alarm triggers SNS email if unhealthy.

