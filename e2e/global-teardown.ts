/**
 * Global teardown for Playwright E2E tests.
 * 
 * Cleans up test data, closes connections, and performs cleanup operations.
 */
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global teardown for E2E tests...');

  // Cleanup test database
  await cleanupTestDatabase();
  
  // Cleanup auth state files
  await cleanupAuthState();
  
  // Cleanup test artifacts
  await cleanupTestArtifacts();

  console.log('✅ Global teardown completed successfully');
}

async function cleanupTestDatabase() {
  console.log('🗑️ Cleaning up test database...');
  
  const testDbPath = path.join(__dirname, '../backend/data/swatchx_test.db');
  
  try {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
      console.log('🗑️ Test database cleaned up');
    }
  } catch (error) {
    console.warn('⚠️ Could not cleanup test database:', error);
  }
}

async function cleanupAuthState() {
  console.log('🔐 Cleaning up auth state...');
  
  const authDir = path.join(__dirname, '../.auth');
  
  try {
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log('🔐 Auth state cleaned up');
    }
  } catch (error) {
    console.warn('⚠️ Could not cleanup auth state:', error);
  }
}

async function cleanupTestArtifacts() {
  console.log('📁 Cleaning up test artifacts...');
  
  const artifactDirs = [
    path.join(__dirname, '../test-results'),
    path.join(__dirname, '../playwright-report'),
  ];
  
  for (const dir of artifactDirs) {
    try {
      if (fs.existsSync(dir)) {
        // Keep the directory but clean old files
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          // Remove files older than 7 days
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (stats.mtime.getTime() < sevenDaysAgo) {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(filePath);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not cleanup ${dir}:`, error);
    }
  }
  
  console.log('📁 Test artifacts cleaned up');
}

export default globalTeardown;
