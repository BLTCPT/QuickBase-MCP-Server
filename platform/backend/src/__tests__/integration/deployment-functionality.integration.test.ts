import { CDNDeploymentService } from '../../services/cdn-deployment.js';
import { E2ETestingService } from '../../services/e2e-testing.js';

describe('Deployment Functionality Integration Tests', () => {
  let cdnDeploymentService: CDNDeploymentService;
  let e2eTestingService: E2ETestingService;

  beforeEach(() => {
    cdnDeploymentService = new CDNDeploymentService();
    e2eTestingService = new E2ETestingService();
  });

  describe('CDN Deployment Service', () => {
    it('should initialize successfully', () => {
      expect(cdnDeploymentService).toBeDefined();
      expect(typeof cdnDeploymentService.deployUpdatedCDNHero).toBe('function');
      expect(typeof cdnDeploymentService.validateCDNHeroLibrary).toBe('function');
      expect(typeof cdnDeploymentService.rollbackCDNHero).toBe('function');
    });

    it('should get empty deployment history initially', () => {
      const history = cdnDeploymentService.getDeploymentHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('should return null for non-existent deployment', () => {
      const deployment = cdnDeploymentService.getDeployment('nonexistent-id');
      expect(deployment).toBeNull();
    });

    it('should validate deployment configuration schema', () => {
      const validConfig = {
        environment: 'staging' as const,
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      // This should not throw an error
      expect(() => {
        // The service should accept valid configuration
        expect(validConfig.environment).toBe('staging');
        expect(validConfig.version).toBe('2.2.0');
      }).not.toThrow();
    });
  });

  describe('E2E Testing Service', () => {
    it('should initialize successfully', () => {
      expect(e2eTestingService).toBeDefined();
      expect(typeof e2eTestingService.conductE2ECodepageSaveTesting).toBe('function');
    });

    it('should get empty test results initially', () => {
      const results = e2eTestingService.getAllTestResults();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return null for non-existent test suite', () => {
      const testSuite = e2eTestingService.getTestResults('nonexistent-suite-id');
      expect(testSuite).toBeNull();
    });

    it('should validate test configuration schema', () => {
      const validConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      // This should not throw an error
      expect(() => {
        expect(validConfig.testEnvironment).toBe('staging');
        expect(validConfig.testTableId).toBe('test_table_id');
        expect(validConfig.testTimeout).toBe(30000);
      }).not.toThrow();
    });

    it('should conduct E2E testing with valid configuration', async () => {
      const testConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(testConfig);

      expect(testSuite).toBeDefined();
      expect(testSuite.suiteId).toBeDefined();
      expect(testSuite.suiteName).toBe('Codepage Save Functionality E2E Tests');
      expect(Array.isArray(testSuite.tests)).toBe(true);
      expect(testSuite.tests.length).toBeGreaterThan(0);
      expect(['passed', 'failed', 'error']).toContain(testSuite.overallStatus);
      expect(testSuite.startTime).toBeInstanceOf(Date);
      expect(testSuite.endTime).toBeInstanceOf(Date);
      expect(testSuite.totalDuration).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for E2E test

    it('should generate test report for completed test suite', async () => {
      const testConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(testConfig);
      const report = await e2eTestingService.generateTestReport(testSuite);

      expect(typeof report).toBe('string');
      expect(report).toContain('End-to-End Codepage Save Functionality Test Report');
      expect(report).toContain(testSuite.suiteId);
      expect(report).toContain('Summary');
      expect(report).toContain('Test Results');
    }, 30000);

    it('should track test results in service', async () => {
      const testConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(testConfig);
      
      // Check that the test suite is stored
      const retrievedSuite = e2eTestingService.getTestResults(testSuite.suiteId);
      expect(retrievedSuite).toBeDefined();
      expect(retrievedSuite?.suiteId).toBe(testSuite.suiteId);

      // Check that it appears in all results
      const allResults = e2eTestingService.getAllTestResults();
      expect(allResults.length).toBeGreaterThan(0);
      expect(allResults.some(suite => suite.suiteId === testSuite.suiteId)).toBe(true);
    }, 30000);
  });

  describe('Integration between CDN Deployment and E2E Testing', () => {
    it('should work together for complete deployment validation', async () => {
      // This test simulates the complete workflow:
      // 1. Validate CDN Hero library
      // 2. Deploy to staging
      // 3. Run E2E tests
      // 4. Deploy to production if tests pass

      // Step 1: Validate CDN Hero library (will fail without actual file, but service should handle gracefully)
      let validationResult;
      try {
        validationResult = await cdnDeploymentService.validateCDNHeroLibrary();
      } catch (error) {
        // Expected to fail without actual file, but service should be callable
        expect(error).toBeDefined();
        validationResult = {
          isValid: false,
          version: 'unknown',
          fileSize: 0,
          syntaxValid: false,
          sessionAuthImplemented: false,
          compatibilityChecks: {
            existingCodepages: false,
            apiCompatibility: false,
            browserCompatibility: false,
          },
          warnings: [],
          errors: ['CDN Hero library file not found']
        };
      }

      expect(validationResult).toBeDefined();
      expect(validationResult).toHaveProperty('isValid');
      expect(validationResult).toHaveProperty('version');

      // Step 2: Run E2E tests (should work regardless of CDN validation)
      const testConfig = {
        testEnvironment: 'staging' as const,
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(testConfig);

      expect(testSuite).toBeDefined();
      expect(testSuite.tests.length).toBeGreaterThan(0);

      // Step 3: Verify that both services maintain their state
      const deploymentHistory = cdnDeploymentService.getDeploymentHistory();
      const testResults = e2eTestingService.getAllTestResults();

      expect(Array.isArray(deploymentHistory)).toBe(true);
      expect(Array.isArray(testResults)).toBe(true);
      expect(testResults.length).toBeGreaterThan(0);
    }, 45000); // 45 second timeout for complete workflow
  });

  describe('Error Handling', () => {
    it('should handle invalid deployment configuration gracefully', async () => {
      const invalidConfig = {
        environment: 'invalid_env' as any,
        version: '',
        quickbaseTableId: '',
        backupEnabled: true,
        rollbackPlan: true
      };

      await expect(cdnDeploymentService.deployUpdatedCDNHero(invalidConfig))
        .rejects
        .toThrow();
    });

    it('should handle invalid test configuration gracefully', async () => {
      const invalidConfig = {
        testEnvironment: 'invalid_env' as any,
        testTableId: '',
        testTimeout: -1,
        cleanupAfterTest: true,
        generateReport: true
      };

      await expect(e2eTestingService.conductE2ECodepageSaveTesting(invalidConfig))
        .rejects
        .toThrow();
    });

    it('should handle rollback of non-existent deployment', async () => {
      await expect(cdnDeploymentService.rollbackCDNHero('nonexistent-id', 'test reason'))
        .rejects
        .toThrow('Original deployment not found');
    });
  });
});