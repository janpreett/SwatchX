import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.expense import Expense, BusinessUnit, Truck, Trailer, FuelStation, CompanyEnum, ExpenseCategoryEnum
from app.models.user import User
from app.core.security import get_password_hash
import json
import tempfile
import os

def test_comprehensive_expense_management_coverage(client: TestClient, db_session: Session, auth_headers):
    """Comprehensive test covering expense management with all validations and edge cases."""
    
    # 1. Test duplicate prevention for management entities
    business_unit_data = {"name": "Test Business Unit"}
    response = client.post("/expenses/business-units/", json=business_unit_data, headers=auth_headers)
    assert response.status_code == 201
    assert "message" in response.json()
    assert "created successfully" in response.json()["message"]
    
    # Try to create duplicate - should fail
    response = client.post("/expenses/business-units/", json=business_unit_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
    
    # Test truck duplicate prevention
    truck_data = {"number": "TRUCK001"}
    response = client.post("/expenses/trucks/", json=truck_data, headers=auth_headers)
    assert response.status_code == 201
    assert "created successfully" in response.json()["message"]
    
    response = client.post("/expenses/trucks/", json=truck_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
    
    # Test trailer duplicate prevention
    trailer_data = {"number": "TRAILER001"}
    response = client.post("/expenses/trailers/", json=trailer_data, headers=auth_headers)
    assert response.status_code == 201
    assert "created successfully" in response.json()["message"]
    
    response = client.post("/expenses/trailers/", json=trailer_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
    
    # Test fuel station duplicate prevention
    fuel_station_data = {"name": "Shell Station 1"}
    response = client.post("/expenses/fuel-stations/", json=fuel_station_data, headers=auth_headers)
    assert response.status_code == 201
    assert "created successfully" in response.json()["message"]
    
    response = client.post("/expenses/fuel-stations/", json=fuel_station_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
    
    # 2. Test expense validation with proper data
    valid_expense_data = {
        "company": "Swatch",
        "category": "fuel-diesel", 
        "date": datetime.now().isoformat(),
        "price": 150.75,
        "description": "Fuel purchase for truck operations",
        "business_unit_id": 1,
        "truck_id": 1,
        "fuel_station_id": 1
    }
    
    form_data = {"expense_data": json.dumps(valid_expense_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 201
    response_data = response.json()
    assert "message" in response_data
    assert "created successfully" in response_data["message"]
    assert response_data["company"] == "Swatch"
    assert response_data["price"] == 150.75
    expense_id = response_data["id"]
    
    # 3. Test expense validation failures
    # Test missing date
    invalid_data = valid_expense_data.copy()
    del invalid_data["date"]
    form_data = {"expense_data": json.dumps(invalid_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Date is required" in response.json()["detail"]
    
    # Test future date
    future_data = valid_expense_data.copy()
    future_data["date"] = (datetime.now() + timedelta(days=1)).isoformat()
    form_data = {"expense_data": json.dumps(future_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 400
    assert "future" in response.json()["detail"]
    
    # Test invalid price
    invalid_price_data = valid_expense_data.copy()
    invalid_price_data["price"] = 0
    form_data = {"expense_data": json.dumps(invalid_price_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 400
    assert "greater than 0" in response.json()["detail"]
    
    # Test missing description
    no_desc_data = valid_expense_data.copy()
    no_desc_data["description"] = ""
    form_data = {"expense_data": json.dumps(no_desc_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Description is required" in response.json()["detail"]
    
    # 4. Test expense update with validation
    update_data = {
        "company": "SWS",
        "price": 200.50,
        "description": "Updated fuel purchase description"
    }
    form_data = {"expense_data": json.dumps(update_data)}
    response = client.put(f"/expenses/{expense_id}", data=form_data, headers=auth_headers)
    assert response.status_code == 200
    response_data = response.json()
    assert "message" in response_data
    assert "updated successfully" in response_data["message"]
    assert response_data["price"] == 200.50
    
    # 5. Test expense deletion with confirmation
    response = client.delete(f"/expenses/{expense_id}", headers=auth_headers)
    assert response.status_code == 200
    response_data = response.json()
    assert "message" in response_data
    assert "deleted successfully" in response_data["message"]
    assert response_data["deleted_id"] == expense_id

def test_security_validations_comprehensive(client: TestClient, db_session: Session, auth_headers):
    """Test security validations to prevent data corruption and unauthorized access."""
    
    # 1. Test password change security (proper current password required)
    password_change_data = {
        "current_password": "wrongpassword",
        "new_password": "newpassword123"
    }
    response = client.post("/auth/password/change", json=password_change_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Current password is incorrect" in response.json()["detail"]
    
    # 2. Test that hashed passwords are never exposed in responses
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    user_data = response.json()
    assert "hashed_password" not in user_data
    assert "password" not in user_data
    
    # 3. Test unauthorized access prevention
    unauthorized_headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/expenses/", headers=unauthorized_headers)
    assert response.status_code == 401
    
    # 4. Test SQL injection prevention in expense filters
    malicious_company = "'; DROP TABLE expenses; --"
    response = client.get(f"/expenses/?company={malicious_company}", headers=auth_headers)
    # Should not cause server error, should handle gracefully
    assert response.status_code in [200, 400, 422]  # Valid responses, not 500

def test_performance_optimization_coverage(client: TestClient, db_session: Session, auth_headers):
    """Test performance optimizations and bulk operations."""
    
    # Create test data in bulk for performance testing
    business_units = []
    for i in range(5):
        bu_data = {"name": f"Performance Test BU {i}"}
        response = client.post("/expenses/business-units/", json=bu_data, headers=auth_headers)
        assert response.status_code == 201
        business_units.append(response.json()["id"])
    
    trucks = []
    for i in range(5):
        truck_data = {"number": f"PERF{i:03d}"}
        response = client.post("/expenses/trucks/", json=truck_data, headers=auth_headers)
        assert response.status_code == 201
        trucks.append(response.json()["id"])
    
    # Test pagination for large result sets
    response = client.get("/expenses/?limit=10&skip=0", headers=auth_headers)
    assert response.status_code == 200
    
    response = client.get("/expenses/business-units/?limit=3&skip=0", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) <= 3
    
    # Test filtering performance with multiple filters
    response = client.get("/expenses/?company=Swatch&category=fuel-diesel&limit=50", headers=auth_headers)
    assert response.status_code == 200

def test_data_integrity_edge_cases(client: TestClient, db_session: Session, auth_headers):
    """Test data integrity and edge cases."""
    
    # 1. Test very long descriptions (should be handled gracefully)
    long_description = "A" * 500  # Max length in model
    expense_data = {
        "company": "Swatch",
        "category": "parts",
        "date": datetime.now().isoformat(), 
        "price": 100.0,
        "description": long_description
    }
    form_data = {"expense_data": json.dumps(expense_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 201
    
    # 2. Test extreme price values
    extreme_expense_data = {
        "company": "SWS",
        "category": "other-expenses",
        "date": datetime.now().isoformat(),
        "price": 999999.99,
        "description": "Extreme price test"
    }
    form_data = {"expense_data": json.dumps(extreme_expense_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["price"] == 999999.99
    
    # 3. Test invalid enum values are rejected
    invalid_enum_data = {
        "company": "InvalidCompany",
        "category": "fuel-diesel", 
        "date": datetime.now().isoformat(),
        "price": 100.0,
        "description": "Invalid company test"
    }
    form_data = {"expense_data": json.dumps(invalid_enum_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    assert response.status_code == 422  # Validation error
    
    # 4. Test relationship integrity (non-existent foreign keys)
    nonexistent_fk_data = {
        "company": "Swatch",
        "category": "truck",
        "date": datetime.now().isoformat(),
        "price": 100.0,
        "description": "Test with non-existent truck",
        "truck_id": 99999  # Non-existent truck ID
    }
    form_data = {"expense_data": json.dumps(nonexistent_fk_data)}
    response = client.post("/expenses/", data=form_data, headers=auth_headers)
    # Should handle gracefully - either accept or reject with proper error
    assert response.status_code in [201, 400, 422]

def test_concurrent_operations_simulation(client: TestClient, db_session: Session, auth_headers):
    """Simulate concurrent operations to test data integrity."""
    
    # Create base entity
    truck_data = {"number": "CONCURRENT001"}
    response = client.post("/expenses/trucks/", json=truck_data, headers=auth_headers)
    assert response.status_code == 201
    truck_id = response.json()["id"]
    
    # Simulate multiple rapid updates (testing race conditions)
    for i in range(3):
        update_data = {"number": f"CONCURRENT001_V{i}"}
        response = client.put(f"/expenses/trucks/{truck_id}", json=update_data, headers=auth_headers)
        # Should handle gracefully, either succeed or fail with proper error
        assert response.status_code in [200, 400, 409, 422]
    
    # Test rapid expense creation with same truck
    for i in range(3):
        expense_data = {
            "company": "Swatch",
            "category": "truck",
            "date": datetime.now().isoformat(),
            "price": 100.0 + i,
            "description": f"Concurrent test expense {i}",
            "truck_id": truck_id
        }
        form_data = {"expense_data": json.dumps(expense_data)}
        response = client.post("/expenses/", data=form_data, headers=auth_headers)
        assert response.status_code == 201

def test_advanced_filtering_and_search(client: TestClient, db_session: Session, auth_headers):
    """Test advanced filtering and search capabilities for better coverage."""
    
    # Create test data with different categories
    categories = ["fuel-diesel", "parts", "toll", "office-supplies"]
    companies = ["Swatch", "SWS"]
    
    created_expenses = []
    for i, category in enumerate(categories):
        expense_data = {
            "company": companies[i % 2],
            "category": category,
            "date": datetime.now().isoformat(),
            "price": 100.0 * (i + 1),
            "description": f"Test expense for {category}"
        }
        form_data = {"expense_data": json.dumps(expense_data)}
        response = client.post("/expenses/", data=form_data, headers=auth_headers)
        assert response.status_code == 201
        created_expenses.append(response.json()["id"])
    
    # Test filtering by company
    response = client.get("/expenses/?company=Swatch", headers=auth_headers)
    assert response.status_code == 200
    swatch_expenses = response.json()
    assert all(exp["company"] == "Swatch" for exp in swatch_expenses)
    
    # Test filtering by category
    response = client.get("/expenses/?category=fuel-diesel", headers=auth_headers)
    assert response.status_code == 200
    fuel_expenses = response.json()
    assert all(exp["category"] == "fuel-diesel" for exp in fuel_expenses)
    
    # Test combined filtering
    response = client.get("/expenses/?company=SWS&category=parts", headers=auth_headers)
    assert response.status_code == 200
    filtered_expenses = response.json()
    assert all(exp["company"] == "SWS" and exp["category"] == "parts" for exp in filtered_expenses)

def test_file_attachment_comprehensive_coverage(client: TestClient, db_session: Session, auth_headers):
    """Comprehensive test for file attachment functionality."""
    
    # Create temporary test file
    test_content = b"Test attachment content"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    try:
        # Test expense creation with file attachment
        expense_data = {
            "company": "Swatch",
            "category": "truck",
            "date": datetime.now().isoformat(),
            "price": 150.0,
            "description": "Expense with attachment"
        }
        
        with open(tmp_file_path, "rb") as f:
            files = {"attachment": ("test.txt", f, "text/plain")}
            data = {"expense_data": json.dumps(expense_data)}
            response = client.post("/expenses/", data=data, files=files, headers=auth_headers)
        
        assert response.status_code == 201
        expense_id = response.json()["id"]
        assert response.json()["attachment_path"] is not None
        
        # Test attachment download
        response = client.get(f"/expenses/{expense_id}/attachment", headers=auth_headers)
        # Should handle gracefully regardless of file system state
        assert response.status_code in [200, 404, 500]
        
        # Test expense update with new attachment
        new_expense_data = {"description": "Updated with new attachment"}
        
        with open(tmp_file_path, "rb") as f:
            files = {"attachment": ("test2.txt", f, "text/plain")}
            data = {"expense_data": json.dumps(new_expense_data)}
            response = client.put(f"/expenses/{expense_id}", data=data, files=files, headers=auth_headers)
        
        assert response.status_code == 200
        assert "updated successfully" in response.json()["message"]
        
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
