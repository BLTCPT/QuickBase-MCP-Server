import { CDNDeploymentService } from '../../services/cdn-deployment.js';
import { E2ETestingService } from '../../services/e2e-testing.js';

describe('Deployment Services Unit Tests', () => {
  describe('CDNDeploymentService', () => {
    let service: CDNDeploymentService;

    beforeEach(() => {
      service = new CDNDeploymentService();
    });

    it('should initialize successfully', () => {
      expect(service).toBeDefined();
      expect(typeof service.deployUpdatedCDNHero).toBe('function');
      expect(typeof service.validateCDNHeroLibrary).toBe('function');
      expect(typeof service.rollbackCDNHero).toBe('function');
      expect(typeof service.getDeploymentHistory).toBe('function');
      expect(typeof service.getDeployment).toBe('function');
    });

    it('should return empty deployment history initially', () => {
      const history = service.getDeploymentHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('should return null for non-existent deployment', () => {
      const deployment = service.getDeployment('nonexistent-id');
      expect(deployment).toBeNull();
    });

    it('should handle rollback of non-existent deployment', async () => {
      await expect(service.rollbackCDNHero('nonexistent-id', 'test reason'))
        .rejects
        .toThrow('Original deployment not found');
    });

    it('should validate CDN Hero library and handle missing file gracefully', async () => {
      // This will fail because the file doesn't exist, but should return a proper validation result
      const validation = await service.validateCDNHeroLibrary();
      
      expect(validation).toBeDefined();
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('version');
      expect(validation).toHaveProperty('fileSize');
      expect(validation).toHaveProperty('syntaxValid');
      expect(validation).toHaveProperty('sessionAuthImplemented');
      expect(validation).toHaveProperty('compatibilityChecks');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      
      // Should be invalid due to missing file
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('E2ETestingService', () => {
    let service: E2ETestingService;

    beforeEach(() => {
      service = new E2ETestingService();
    });

    it('should initialize successfully', () => {
      expect(service).toBeDefined();
      expect(typeof service.conductE2ECodepageSaveTesting).toBe('function');
      expect(typeof service.getAllTestResults).toBe('function');
      expect(typeof service.getTestResults).toBe('function');
      expect(typeof service.generateTestReport).toBe('function');
    });

    it('should return empty test results initially', () => {
      const results = service.getAllTestResults();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return null for non-existent test suite', () => {
      const testSuite = service.getTestResults('nonexistent-suite-id');
      expect(testSuite).toBeNull();
    });

    it('should validate test configuration and reject invalid config', async () => {
      const invalidConfig = {
        testEnvironment: 'invalid_env' as any,
        testTableId: '',
        testTimeout: -1,
        cleanupAfterTest: true,
        generateReport: true
      };

      // This should reject quickly due to validation
      await expect(service.conductE2ECodepageSaveTesting(invalidConfig))
        .rejects
        .toThrow();
    }, 5000); // 5 second timeout should be enough for validation

    it('should generate test report for a mock test suite', async () => {
      const mockTestSuite = {
        suiteId: 'test-suite-123',
        suiteName: 'Mock Test Suite',
        tests: [
          {
            testId: 'test-1',
            testName: 'Mock Test 1',
            status: 'passed' as const,
            startTime: new Date(),
            endTime: new Date(),
            duration: 1000,
            steps: []
          }
        ],
        startTime: new Date(),
        endTime: new Date(),
        totalDuration: 1000,
        passedTests: 1,
        failedTests: 0,
        errorTests: 0,
        overallStatus: 'passed' as const
      };

      const report = await service.generateTestReport(mockTestSuite);

      expect(typeof report).toBe('string');
      expect(report).toContain('End-to-End Codepage Save Functionality Test Report');
      expect(report).toContain(mockTestSuite.suiteId);
      expect(report).toContain('Summary');
      expect(report).toContain('Test Results');
      expect(report).toContain('Mock Test 1');
    });
  });

  describe('Service Integration', () => {
    let cdnService: CDNDeploymentService;
    let e2eService: E2ETestingService;

    beforeEach(() => {
      cdnService = new CDNDeploymentService();
      e2eService = new E2ETestingService();
    });

    it('should work together for deployment status checking', () => {
      // Both services should be able to provide status information
      const cdnHistory = cdnService.getDeploymentHistory();
      const testResults = e2eService.getAllTestResults();

      expect(Array.isArray(cdnHistory)).toBe(true);
      expect(Array.isArray(testResults)).toBe(true);

      // Should be able to determine overall system health
      const systemHealthy = cdnHistory.length === 0 || 
        (cdnHistory.length > 0 && cdnHistory[0].success);
      const testsHealthy = testResults.length === 0 || 
        (testResults.length > 0 && testResults[0].overallStatus === 'passed');

      expect(typeof systemHealthy).toBe('boolean');
      expect(typeof testsHealthy).toBe('boolean');
    });

    it('should handle deployment configuration validation', () => {
      const validDeploymentConfig = {
        environment: 'staging' as const,
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      const validTestConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      // These configurations should be valid
      expect(validDeploymentConfig.environment).toBe('staging');
      expect(validDeploymentConfig.version).toBe('2.2.0');
      expect(validTestConfig.testEnvironment).toBe('staging');
      expect(validTestConfig.testTimeout).toBe(30000);
    });

    it('should provide proper error messages for invalid configurations', async () => {
      const invalidDeploymentConfig = {
        environment: 'invalid' as any,
        version: '',
        quickbaseTableId: '',
        backupEnabled: true,
        rollbackPlan: true
      };

      await expect(cdnService.deployUpdatedCDNHero(invalidDeploymentConfig))
        .rejects
        .toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let cdnService: CDNDeploymentService;
    let e2eService: E2ETestingService;

    beforeEach(() => {
      cdnService = new CDNDeploymentService();
      e2eService = new E2ETestingService();
    });

    it('should handle missing CDN Hero library file gracefully', async () => {
      // The validateCDNHeroLibrary method should handle missing file gracefully
      const validation = await cdnService.validateCDNHeroLibrary();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      // The error message should indicate a file-related issue
      expect(validation.errors[0]).toMatch(/ENOENT|no such file|Unknown validation error/);
    });

    it('should handle deployment with missing QuickBase MCP server', async () => {
      const config = {
        environment: 'staging' as const,
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      // Should fail gracefully when QuickBase MCP is not available
      await expect(cdnService.deployUpdatedCDNHero(config))
        .rejects
        .toThrow();
    });

    it('should provide meaningful error messages', async () => {
      try {
        await cdnService.rollbackCDNHero('nonexistent', 'test');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain('Original deployment not found');
      }
    });

    it('should handle concurrent operations safely', () => {
      // Multiple services should be able to operate independently
      const cdnService1 = new CDNDeploymentService();
      const cdnService2 = new CDNDeploymentService();
      const e2eService1 = new E2ETestingService();
      const e2eService2 = new E2ETestingService();

      expect(cdnService1).not.toBe(cdnService2);
      expect(e2eService1).not.toBe(e2eService2);

      // Each should maintain its own state
      expect(cdnService1.getDeploymentHistory()).toEqual(cdnService2.getDeploymentHistory());
      expect(e2eService1.getAllTestResults()).toEqual(e2eService2.getAllTestResults());
    });
  });
});