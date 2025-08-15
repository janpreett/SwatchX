#!/usr/bin/env python3
"""
Script to fix test files for standardizing to 'price' and valid enum values
"""
import os
import re

def fix_file(filepath):
    """Fix a single file"""
    print(f"Processing {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix field names: amount -> price, cost -> price
    content = re.sub(r'\bamount\s*=', 'price=', content)
    content = re.sub(r'\bcost\s*=', 'price=', content)
    content = re.sub(r'expense\.amount', 'expense.price', content)
    content = re.sub(r'expense\.cost', 'expense.price', content)
    
    # Fix company enum values
    content = re.sub(r'company="swatchx"', 'company="Swatch"', content)
    content = re.sub(r'"swatchx"', '"Swatch"', content)
    content = re.sub(r"'swatchx'", "'Swatch'", content)
    
    # Fix response field names in assertions
    content = re.sub(r'data\["amount"\]', 'data["price"]', content)
    content = re.sub(r'db_expense\.amount', 'db_expense.price', content)
    
    # Special cases for SQL injection tests
    content = re.sub(r"'swatchx'; UPDATE expenses SET amount=0; --'", "'Swatch'; UPDATE expenses SET price=0; --'", content)
    content = re.sub(r'"swatchx\'; UPDATE users SET email=\'hacked@evil.com\'; --"', '"Swatch\'; UPDATE users SET email=\'hacked@evil.com\'; --"', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath}")
        return True
    else:
        print(f"  - No changes needed for {filepath}")
        return False

def main():
    """Main function"""
    backend_path = r"c:\Users\Janpreet\Desktop\SwatchX\backend"
    test_dirs = ["tests"]
    
    files_updated = 0
    
    for test_dir in test_dirs:
        test_path = os.path.join(backend_path, test_dir)
        for root, dirs, files in os.walk(test_path):
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    if fix_file(filepath):
                        files_updated += 1
    
    print(f"\n✅ Updated {files_updated} files")

if __name__ == "__main__":
    main()
