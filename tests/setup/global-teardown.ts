/**
 * Global Test Teardown
 * 
 * Runs once after all test suites complete
 */

import * as fs from 'fs';
import * as path from 'path';

module.exports = async () => {
  console.log('🧹 Global test teardown starting...');
  
  try {
    // Clean up test artifacts
    const artifactsToClean = [
      'test-config.json',
      'temp-test-data',
      '.nyc_output'
    ];
    
    for (const artifact of artifactsToClean) {
      const artifactPath = path.join(process.cwd(), artifact);
      if (fs.existsSync(artifactPath)) {
        if (fs.statSync(artifactPath).isDirectory()) {
          fs.rmSync(artifactPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(artifactPath);
        }
        console.log(`🗑️ Cleaned up: ${artifact}`);
      }
    }
    
    // Generate test execution summary
    const summaryPath = path.join(process.cwd(), 'test-results', 'execution-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      environment: 'test',
      status: 'completed',
      cleanupCompleted: true,
      artifactsCleaned: artifactsToClean.length
    };
    
    // Ensure test-results directory exists
    const testResultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Reset environment variables
    delete process.env.TEST_MODE;
    delete process.env.LOG_LEVEL;
    
    console.log('✅ Global test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw in teardown to avoid masking test results
  }
};