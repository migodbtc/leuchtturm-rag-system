import sys 
import pytest
import requests
from pathlib import Path

# Add parent directory to scope to import necessary modules
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_URL = "http://127.0.0.1:8000"

# --- HELPER FIXTURES ---

"""
check_server: ensure the server is up before proceeding with the testing.
"""
@pytest.fixture(scope="session", autouse=True)
def check_server():
    try:
        response = requests.get(f"{BASE_URL}/", timeout=2)
        assert response.status_code == 200, "Server not running at port 8000"
    except Exception as e:
        pytest.exit(f"Server connection failed: {e}")


# --- TEST SUITES --- 

"""
test_root: validate GET / endpoint returns 200 regardless of the message.
"""
def test_root():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200

"""
test_register_happy: successful registration with valid credentials
Expected: 201 Created with user id, username, email, is_active
"""
def test_register_happy():
    requests.delete(f"{BASE_URL}/auth/delete", json={"username": "testuser"})
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "s3cret"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 201
    assert "id" in response.json()
    requests.delete(f"{BASE_URL}/auth/delete", json={"username": payload["username"]})

"""
test_register_missing_email: registration fails when email field is missing
Expected: 422 Unprocessable Entity (validation error)
"""
def test_register_missing_email():
    payload = {"username": "testuser2", "password": "pw123"}
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 422

"""
test_register_invalid_email: registration fails when email format is invalid
Expected: 422 Unprocessable Entity (validation error)
"""
def test_register_invalid_email():
    payload = {
        "username": "testuser3",
        "email": "not-an-email",
        "password": "pw123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 422

"""
test_register_duplicate: registration fails when username already exists
Expected: 400 Bad Request with detail about duplicate username/email
"""
def test_register_duplicate():
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "s3cret"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)

    payload = {
        "username": "testuser",
        "email": "another@example.com",
        "password": "pw123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 400
    requests.delete(f"{BASE_URL}/auth/delete", json={"username": payload["username"]})

"""
test_login_happy: successful login with valid credentials returns JWT access token
Expected: 200 OK with access_token and token_type: bearer
"""
def test_login_happy():
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "s3cret"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)

    data = {"username": "testuser", "password": "s3cret"}
    response = requests.post(f"{BASE_URL}/auth/login", data=data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    requests.delete(f"{BASE_URL}/auth/delete", json={"username": payload["username"]})

"""
test_login_wrong_password: login fails when password is incorrect
Expected: 401 Unauthorized with detail "Incorrect credentials"
"""
def test_login_wrong_password():
    data = {"username": "testuser", "password": "wrongpw"}
    response = requests.post(f"{BASE_URL}/auth/login", data=data)
    assert response.status_code == 401

"""
test_login_nonexistent: login fails when user does not exist
Expected: 401 Unauthorized with detail "Incorrect credentials"
"""
def test_login_nonexistent():
    data = {"username": "nonexistent", "password": "pw123"}
    response = requests.post(f"{BASE_URL}/auth/login", data=data)
    assert response.status_code == 401