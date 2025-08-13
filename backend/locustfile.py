"""
Locust load testing configuration for SwatchX API.

Run with: locust -f locustfile.py --host=http://localhost:8000
"""
from locust import HttpUser, task, between
import random
import string


class SwatchXUser(HttpUser):
    """Simulate a user interacting with SwatchX API."""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def on_start(self):
        """Called when a user starts - setup user data."""
        # Generate random user credentials
        random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.email = f"loadtest{random_id}@example.com"
        self.password = "LoadTest123!"
        self.token = None
        
        # Try to signup (might fail if user exists, that's ok)
        self.signup()
    
    def signup(self):
        """Attempt to sign up a new user."""
        with self.client.post("/auth/signup", json={
            "email": self.email,
            "password": self.password,
            "confirm_password": self.password
        }, catch_response=True) as response:
            if response.status_code == 201:
                data = response.json()
                self.token = data.get("access_token")
                response.success()
            elif response.status_code == 400:
                # User might already exist, try to login instead
                self.login()
                response.success()
            else:
                response.failure(f"Signup failed with status {response.status_code}")
    
    def login(self):
        """Login with user credentials."""
        with self.client.post("/auth/login", data={
            "username": self.email,
            "password": self.password
        }, catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                response.success()
            else:
                response.failure(f"Login failed with status {response.status_code}")
    
    @task(10)
    def test_login(self):
        """Test login endpoint - high frequency task."""
        self.client.post("/auth/login", data={
            "username": self.email,
            "password": self.password
        })
    
    @task(5)
    def test_signup_new_user(self):
        """Test signup endpoint with new random user."""
        random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        random_email = f"newuser{random_id}@example.com"
        
        self.client.post("/auth/signup", json={
            "email": random_email,
            "password": "NewUser123!",
            "confirm_password": "NewUser123!"
        })
    
    @task(8)
    def test_protected_endpoint(self):
        """Test protected endpoint if user is logged in."""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/auth/me", headers=headers)
        else:
            # If no token, try to login first
            self.login()
    
    @task(15)
    def test_health_check(self):
        """Test health check endpoint - most frequent task."""
        self.client.get("/health")
    
    @task(3)
    def test_invalid_login(self):
        """Test login with invalid credentials."""
        self.client.post("/auth/login", data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        })
    
    @task(2)
    def test_invalid_signup(self):
        """Test signup with invalid data."""
        self.client.post("/auth/signup", json={
            "email": "invalid-email",
            "password": "weak",
            "confirm_password": "weak"
        })


class HeavyLoadUser(HttpUser):
    """User that creates heavier load for stress testing."""
    
    wait_time = between(0.5, 1)  # Faster requests
    
    def on_start(self):
        """Setup for heavy load user."""
        random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        self.email = f"heavy{random_id}@example.com"
        self.password = "HeavyLoad123!"
        self.token = None
        self.signup()
    
    def signup(self):
        """Sign up heavy load user."""
        response = self.client.post("/auth/signup", json={
            "email": self.email,
            "password": self.password,
            "confirm_password": self.password
        })
        if response.status_code == 201:
            self.token = response.json().get("access_token")
        elif response.status_code == 400:
            self.login()
    
    def login(self):
        """Login heavy load user."""
        response = self.client.post("/auth/login", data={
            "username": self.email,
            "password": self.password
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
    
    @task(20)
    def rapid_fire_requests(self):
        """Make rapid requests to various endpoints."""
        endpoints = ["/health", "/", "/auth/me"]
        
        for endpoint in endpoints:
            if endpoint == "/auth/me" and self.token:
                headers = {"Authorization": f"Bearer {self.token}"}
                self.client.get(endpoint, headers=headers)
            elif endpoint != "/auth/me":
                self.client.get(endpoint)


# Custom load shapes for different scenarios
from locust.env import Environment


def create_load_test_scenarios():
    """Define different load testing scenarios."""
    scenarios = {
        "normal_load": {
            "description": "Normal user load simulation",
            "users": 50,
            "spawn_rate": 5,
            "duration": "5m"
        },
        "stress_test": {
            "description": "High load stress test",
            "users": 200,
            "spawn_rate": 10,
            "duration": "10m"
        },
        "spike_test": {
            "description": "Sudden traffic spike",
            "users": 500,
            "spawn_rate": 50,
            "duration": "2m"
        },
        "endurance_test": {
            "description": "Long-running endurance test",
            "users": 100,
            "spawn_rate": 2,
            "duration": "30m"
        }
    }
    return scenarios


if __name__ == "__main__":
    # Print available scenarios
    scenarios = create_load_test_scenarios()
    print("Available load test scenarios:")
    for name, config in scenarios.items():
        print(f"  {name}: {config['description']}")
        print(f"    Users: {config['users']}, Rate: {config['spawn_rate']}/s, Duration: {config['duration']}")
        print()
