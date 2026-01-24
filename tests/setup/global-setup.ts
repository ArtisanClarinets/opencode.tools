/**
 * Global Test Setup
 * 
 * Runs once before all test suites
 */

import * as fs from 'fs';
import * as path from 'path';

module.exports = async () => {
  console.log('🧪 Global test setup starting...');
  
  try {
    // Create test directories if they don't exist
    const testDirs = [
      'test-results',
      'coverage',
      'performance-results',
      'load-test-results',
      'mutation-results'
    ];
    
    for (const dir of testDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    }
    
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
    process.env.LOG_LEVEL = 'error';
    process.env.TZ = 'UTC';
    
    // Create test configuration
    const testConfig = {
      environment: 'test',
      maxTestTimeout: 30000,
      slowTestThreshold: 5000,
      performance: {
        maxResponseTime: 1000,
        maxMemoryUsage: 512 * 1024 * 1024, // 512MB
        maxCpuUsage: 80
      },
      security: {
        enableVulnerabilityScanning: true,
        maxVulnerabilities: 0
      }
    };
    
    // Save test configuration
    const configPath = path.join(process.cwd(), 'test-config.json');
    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
    
    console.log('✅ Global test setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
};