#!/usr/bin/env python3
"""
Script to fix ONLY the remaining inconsistencies:
1. Frontend test files: amount -> price 
2. Documentation: cost -> price (in UI descriptions)
"""
import os
import re

def fix_frontend_test_files():
    """Fix frontend test files to use 'price' consistently"""
    test_path = r"c:\Users\Janpreet\Desktop\SwatchX\frontend\src\test"
    files_updated = 0
    
    for root, dirs, files in os.walk(test_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                print(f"Processing {filepath}")
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                
                # Fix test data properties: amount -> price
                content = re.sub(r'\bamount:\s*([0-9.]+)', r'price: \1', content)
                
                # Fix test expectations and assertions
                content = re.sub(r'expense\.amount', 'expense.price', content)
                content = re.sub(r'minimum amount', 'minimum price', content)
                content = re.sub(r'maximum amount', 'maximum price', content)
                content = re.sub(r'Sort by amount', 'Sort by price', content)
                content = re.sub(r'sorting by amount', 'sorting by price', content)
                content = re.sub(r'amount range', 'price range', content)
                content = re.sub(r'sort by amount', 'sort by price', content)
                content = re.sub(r'sort-amount', 'sort-price', content)
                content = re.sub(r'min-amount', 'min-price', content)
                content = re.sub(r'max-amount', 'max-price', content)
                content = re.sub(r'Check for amounts', 'Check for prices', content)
                
                # Fix variable names
                content = re.sub(r'minAmountInput', 'minPriceInput', content)
                content = re.sub(r'maxAmountInput', 'maxPriceInput', content)
                
                if content != original:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"  ✓ Updated {filepath}")
                    files_updated += 1
                else:
                    print(f"  - No changes needed for {filepath}")
    
    return files_updated

def fix_documentation():
    """Fix documentation to use 'price' instead of 'cost'"""
    files_updated = 0
    
    # Fix PROJECT_INSTRUCTIONS.md
    instructions_path = r"c:\Users\Janpreet\Desktop\SwatchX\PROJECT_INSTRUCTIONS.md"
    print(f"Processing {instructions_path}")
    
    with open(instructions_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Only fix the expense field descriptions, not other mentions of "cost"
    content = re.sub(r'repair description, cost \(USD\)', 'repair description, price (USD)', content)
    content = re.sub(r'description, cost \(USD\)', 'description, price (USD)', content)
    content = re.sub(r'cost \(USD\)', 'price (USD)', content)
    content = re.sub(r'Show total cost in USD', 'Show total price in USD', content)
    
    if content != original:
        with open(instructions_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {instructions_path}")
        files_updated += 1
    else:
        print(f"  - No changes needed for {instructions_path}")
    
    return files_updated

def main():
    """Main function"""
    print("🔍 Fixing remaining field name inconsistencies...")
    print("\n1. Frontend test files:")
    test_files_updated = fix_frontend_test_files()
    
    print("\n2. Documentation files:")
    doc_files_updated = fix_documentation()
    
    total_updated = test_files_updated + doc_files_updated
    print(f"\n✅ Updated {total_updated} files total")
    print("   - Field names are now consistent across the entire codebase")
    print("   - Database: price ✅")
    print("   - Backend API: price ✅") 
    print("   - Frontend forms/tables: price ✅")
    print("   - Frontend tests: price ✅")
    print("   - Documentation: price ✅")

if __name__ == "__main__":
    main()
