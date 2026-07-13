import requests
import json
import sys

# Change this to your Railway URL once deployed
BASE_URL = "https://your-go-app.up.railway.app"

def print_result(name, res):
    print(f"\n--- {name} ---")
    print(f"Status Code: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)

def test_health():
    res = requests.get(f"{BASE_URL}/api/health")
    print_result("Health Check", res)

def test_login(email, password):
    payload = {
        "email": email,
        "password": password,
        "device_name": "test_script"
    }
    res = requests.post(f"{BASE_URL}/api/v1/student/login", json=payload)
    print_result("Login", res)
    if res.status_code == 200:
        return res.json().get("token")
    return None

def test_me(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/api/v1/student/me", headers=headers)
    print_result("Me (Profile)", res)

def test_internal_ai_authorize():
    # Testing the internal credit engine
    secret = "YOUR_INTERNAL_API_SECRET_FROM_RAILWAY"
    headers = {"Authorization": f"Bearer {secret}"}
    payload = {
        "user_id": 2516, # Example ID from backup
        "amount": 5,
        "request_id": "test_req_123",
        "action_type": "flashcard_gen",
        "model_used": "gpt-4o"
    }
    res = requests.post(f"{BASE_URL}/api/v1/internal/ai/authorize", json=payload, headers=headers)
    print_result("Internal AI Authorize", res)

if __name__ == "__main__":
    print("Testing Skeeme Go API...")
    test_health()
    
    # Uncomment and fill in details to test full flow once data is migrated
    # token = test_login("admin@skeeme.dev", "your_password")
    # if token:
    #     test_me(token)
    
    # test_internal_ai_authorize()
