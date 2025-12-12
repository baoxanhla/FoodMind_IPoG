# 🥗 FoodMind_IPoG - Intelligent Nutrition Assistant

**FoodMind** is an application for nutrition tracking and meal
recommendations powered by Generative AI (Amazon Bedrock).\
It is built on a fully serverless AWS architecture, ensuring low cost
and high scalability.

------------------------------------------------------------------------

## System Architecture

-   **Frontend:** Next.js (AWS Amplify)
-   **Backend:** AWS Lambda (Python 3.12) & API Gateway (HTTP API)
-   **Database:** Amazon DynamoDB (On-demand)
-   **Authentication:** Amazon Cognito
-   **AI Engine:** Amazon Bedrock
-   **Foodmind Architecture**
<img width="7756" height="4324" alt="image" src="https://github.com/user-attachments/assets/e2ca902b-e1a8-4b34-9d62-8eed3940b412" />

------------------------------------------------------------------------

## Prerequisites

Ensure your computer has the following installed:

1.  **Git** -- to clone the repository\
2.  **AWS CLI** -- to configure AWS access\
3.  **AWS SAM CLI** -- to deploy backend infrastructure\
4.  **Node.js (v18+)** -- to run the frontend\
5.  **Python (v3.12)** -- to run backend Lambda code

------------------------------------------------------------------------

## Installation & Deployment Guide (Step-by-Step)

### **Step 1: Clone the Repository**

``` bash
git clone https://github.com/baoxanhla/FoodMind_IPoG.git
cd FoodMind_IPoG
```

------------------------------------------------------------------------

### **Step 2: Configure AWS Profile**

``` bash
aws configure
```

Enter your AWS credentials:

-   **AWS Access Key ID**
-   **AWS Secret Access Key**
-   **Default region:** `ap-southeast-1`
-   **Output format:** `json`

------------------------------------------------------------------------

### **Step 3: Create Amazon Cognito (Manual Setup)**

You must create a User Pool to obtain the App Client ID.

1.  Open AWS Console → search **Cognito**\
2.  Click **Create user pool**\
3.  Define your application  **Single-page application (SPA)**\
4.  Name **foodmind-user**
5.  Configure options **Email**\
6. Required attributes for sign-up **Email**\
7. Click **Create user directory**

After creation, copy:
1. Click on user pool name
-   **User Pool ID**\
2. From user pool name click App clients
-   **App Client ID**

Save them for later.

------------------------------------------------------------------------

### **Step 4: Deploy Backend (AWS SAM)**

#### 4.1 Update configuration

Open `backend/template.yaml` and update:

``` yaml
Globals:
  Function:
    Environment:
      Variables:
        CLIENT_ID: "<YOUR_COGNITO_APP_CLIENT_ID>"
```

#### 4.2 Deploy backend

``` bash
cd backend
sam build
sam deploy --guided
```

Provide:

-   Stack name: **foodmind-stack**
-   Region: **ap-southeast-1**
-   Confirm changes: **y**
-   Allow role creation: **y**

After deploy, copy the **ApiUrl** from the Outputs.

------------------------------------------------------------------------

### **Step 5: Enable Amazon Bedrock Models**

1.  Go to **Amazon Bedrock console**\
2.  Shift to **Tokyo ap-northeast-1 region**
3.  Navigate to **Model catalog**\
4.  Find **deepSeek-V3.1**\
5.  Coppy **model_id**\
6.  Changes in the analyze_food/main.py file **model_id**

------------------------------------------------------------------------

### **Step 6: Setup and Run Frontend**

``` bash
cd ../frontend
npm install
```

Create a `.env.local` file:

    # API URL from SAM Outputs
    NEXT_PUBLIC_API_URL=https://<your-api-id>.execute-api.ap-southeast-1.amazonaws.com

    # Cognito information
    NEXT_PUBLIC_AWS_REGION=ap-southeast-1
    NEXT_PUBLIC_USER_POOL_ID=<Your_User_Pool_ID>
    NEXT_PUBLIC_USER_POOL_CLIENT_ID=<Your_Client_ID>

Run the frontend:

``` bash
npm run dev
```
Open in browser:\
**http://localhost:3000**

### **Step 7: Host frontend to amplify**
1. Create and register a GitLab account. 
2. Push the frontend to GitLab.
3. 
```
git init
git branch -M main
git add .
git commit -m "First commit FoodMind"
git remote add origin https://gitlab.com/USERNAME_CUA_BAN/FoodMind
```
4. DEPLOY TO AWS AMPLIFY
- Go to AWS Console > Search for AWS Amplify.

- Select Create new app (or the big orange button).

- On the "Start building" screen, select GitLab. Click Next.

- Authorize: This will take you to the GitLab page. Click the Authorize button to allow AWS to read your code.

- Repository and branch **gitlab repository**, branch **main**
- Tick **My app is a monorepo**
- Environment Variables
- In the Environment variables section, you must enter 4 variables from the Backend:

- NEXT_PUBLIC_API_URL: (API Gateway Link)

- NEXT_PUBLIC_USER_POOL_ID: (User Pool ID)

- NEXT_PUBLIC_USER_POOL_CLIENT_ID: (Client ID)

- NEXT_PUBLIC_AWS_REGION: ap-southeast-1

Check if you have entered everything. Click Next.

5. Deploy
- It takes about 3-5 minutes, then a green checkmark ✅ appears, indicating the link is the **domain**.
