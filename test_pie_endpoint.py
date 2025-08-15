#!/usr/bin/env python3

import requests
import json
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.database import get_db
from app.models.expense import Expense

def test_pie_endpoint():
    # Test the endpoint directly
    url = "http://127.0.0.1:8000/api/v1/pie-chart-data/Swatch?period=total"
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Parsed data: {json.dumps(data, indent=2)}")
        else:
            print("Error response")
            
    except Exception as e:
        print(f"Error making request: {e}")

def check_database_data():
    # Check what's actually in the database
    try:
        db = next(get_db())
        expenses = db.query(Expense).filter(Expense.company == "Swatch").all()
        print(f"Found {len(expenses)} Swatch expenses in database")
        
        for expense in expenses[:5]:  # Show first 5
            print(f"  - {expense.category}: ${expense.cost} on {expense.date}")
            
        # Group by category
        categories = {}
        for expense in expenses:
            cat = expense.category.value if hasattr(expense.category, 'value') else expense.category
            if cat in categories:
                categories[cat] += float(expense.cost or 0)
            else:
                categories[cat] = float(expense.cost or 0)
                
        print(f"Categories: {categories}")
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    print("=== Checking Database Data ===")
    check_database_data()
    
    print("\n=== Testing API Endpoint ===")
    test_pie_endpoint()
