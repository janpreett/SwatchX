/**
 * Global setup for Playwright E2E tests.
 * 
 * Handles test database setup, user authentication state, and other
 * global test preparations.
 */
import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Setup test database
  await setupTestDatabase();
  
  // Create test user and save auth state
  await createAuthenticatedUser();
  
  // Setup test data
  await seedTestData();

  console.log('✅ Global setup completed successfully');
}

async function setupTestDatabase() {
  console.log('📋 Setting up test database...');
  
  // Copy clean database for testing
  const sourcePath = path.join(__dirname, '../backend/data/swatchx_template.db');
  const testPath = path.join(__dirname, '../backend/data/swatchx_test.db');
  
  try {
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, testPath);
    }
    
    console.log('📋 Test database setup complete');
  } catch (error) {
    console.warn('⚠️ Could not setup test database:', error);
  }
}

async function createAuthenticatedUser() {
  console.log('🔐 Creating authenticated user...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to signup page
    await page.goto('http://localhost:5173/signup');
    
    // Create test user
    await page.fill('[data-testid="signup-name"]', 'Test User');
    await page.fill('[data-testid="signup-email"]', 'test@example.com');
    await page.fill('[data-testid="signup-password"]', 'SecurePassword123!');
    await page.fill('[data-testid="signup-confirm-password"]', 'SecurePassword123!');
    
    await page.click('[data-testid="signup-submit"]');
    
    // Wait for successful signup and dashboard redirect
    await page.waitForURL('**/dashboard');
    
    // Save authenticated state
    await context.storageState({ 
      path: path.join(__dirname, '../.auth/user.json') 
    });
    
    console.log('🔐 Authenticated user created and state saved');
  } catch (error) {
    console.warn('⚠️ Could not create authenticated user:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Make API calls to seed test data
    const response = await fetch('http://localhost:8000/api/test/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        createVehicles: true,
        createDrivers: true,
        createVendors: true,
        createSampleExpenses: true
      })
    });
    
    if (response.ok) {
      console.log('🌱 Test data seeded successfully');
    } else {
      console.warn('⚠️ Could not seed test data:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to API for seeding:', error);
  }
}

export default globalSetup;
