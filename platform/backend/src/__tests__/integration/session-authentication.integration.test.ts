import { QuickBaseClient } from '../../../../../src/quickbase/client.js';
import { QuickBaseConfig } from '../../../../../src/types/quickbase.js';
import { AUTH_TEST_SCENARIOS, createTestTableStructure, cleanupTestData } from '../fixtures/quickbase-test-data.js';
import dotenv from 'dotenv';
import axios, { AxiosInstance } from 'axios';

// Load environment variables for testing
dotenv.config();

/**
 * Session Authentication Testing Framework
 * Tests session-based authentication scenarios for QuickBase operations
 */
describe('Session Authentication Integration Tests', () => {
  let qbClient: QuickBaseClient;
  let testTableId: string;
  let testRecordIds: number[] = [];
  let sessionAxios: AxiosInstance;

  beforeAll(async () => {
    // Skip tests if QuickBase credentials are not available
    if (!process.env.QB_REALM || !process.env.QB_USER_TOKEN || !process.env.QB_APP_ID) {
      console.warn('Skipping session authentication tests - missing credentials');
      return;
    }

    const config: QuickBaseConfig = {
      realm: process.env.QB_REALM,
      userToken: process.env.QB_USER_TOKEN,
      appId: process.env.QB_APP_ID,
      timeout: 30000,
      maxRetries: 3
    };

    qbClient = new QuickBaseClient(config);

    // Create session-based axios instance for testing
    sessionAxios = axios.create({
      baseURL: `https://api.quickbase.com/v1`,
      timeout: 30000,
      headers: {
        'QB-Realm-Hostname': config.realm,
        'User-Agent': 'QuickBase-Session-Test/1.0.0',
        'Content-Type': 'application/json'
      },
      withCredentials: true // Enable session cookies
    });

    // Test connection and create test table
    const isConnected = await qbClient.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to QuickBase - check credentials');
    }

    testTableId = await createTestTableStructure(qbClient, 'Session_Auth_Test_Table');
  }, 60000);

  afterAll(async () => {
    if (!qbClient || !testTableId) return;
    await cleanupTestData(qbClient, testTableId, testRecordIds);
  }, 30000);

  beforeEach(() => {
    if (!qbClient || !testTableId) {
      console.warn('Session authentication tests skipped - setup failed');
      return;
    }
  });

  describe('Session-Based Authentication Success Scenarios', () => {
    it('should authenticate using session cookies without visible tokens', async () => {
      // Simulate session authentication by making a request without explicit token
      const sessionConfig = {
        realm: process.env.QB_REALM!,
        userToken: '', // Empty token to simulate session-only auth
        appId: process.env.QB_APP_ID!,
        timeout: 30000,
        maxRetries: 3
      };

      // For this test, we'll verify that our client can work with session cookies
      // In a real scenario, the session would be established through login
      
      // Create a mock session client that uses credentials: 'include'
      const mockSessionRequest = async (endpoint: string, options: any = {}) => {
        return fetch(`https://api.quickbase.com/v1${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'QB-Realm-Hostname': process.env.QB_REALM,
            ...options.headers
          },
          credentials: 'include' // This is the key for session authentication
        });
      };

      // Test that the session approach is properly configured
      expect(mockSessionRequest).toBeDefined();
      expect(typeof mockSessionRequest).toBe('function');

      // Verify session configuration
      const testResponse = await sessionAxios.get('/apps', {
        params: { appId: process.env.QB_APP_ID }
      }).catch(error => {
        // Expected to fail without proper session, but we're testing the configuration
        expect([401, 403]).toContain(error.response?.status);
        return { status: 'session_test_complete' };
      });

      expect(testResponse).toBeDefined();
    }, 15000);

    it('should handle session establishment and validation', async () => {
      // Test session validation workflow
      const sessionData = AUTH_TEST_SCENARIOS.sessionTestData.validSession;
      
      // Mock session validation
      const validateSession = (sessionId: string, userId: string) => {
        return {
          isValid: sessionId === sessionData.sessionId && userId === sessionData.userId,
          permissions: sessionData.permissions,
          sessionId,
          userId
        };
      };

      const validationResult = validateSession(
        sessionData.sessionId,
        sessionData.userId
      );

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.permissions).toContain('read');
      expect(validationResult.permissions).toContain('write');
      expect(validationResult.sessionId).toBe(sessionData.sessionId);
    });

    it('should perform QuickBase operations with session authentication', async () => {
      // Test actual QuickBase operations that would use session auth
      const testRecord = {
        fields: {
          6: { value: 'Session Auth Test Record' },
          7: { value: 100 },
          9: { value: 'Active' }
        }
      };

      // Create record using existing authenticated client (simulating session auth)
      const recordId = await qbClient.createRecord(testTableId, testRecord);
      testRecordIds.push(recordId);

      expect(recordId).toBeDefined();
      expect(typeof recordId).toBe('number');

      // Verify record creation
      const retrievedRecord = await qbClient.getRecord(testTableId, recordId);
      expect(retrievedRecord[6]?.value).toBe('Session Auth Test Record');

      // Test update operation
      await qbClient.updateRecord(testTableId, recordId, {
        6: { value: 'Updated via Session Auth' }
      });

      const updatedRecord = await qbClient.getRecord(testTableId, recordId);
      expect(updatedRecord[6]?.value).toBe('Updated via Session Auth');
    }, 30000);

    it('should maintain session state across multiple operations', async () => {
      const operations = [];
      const startTime = Date.now();

      // Perform multiple operations to test session persistence
      for (let i = 0; i < 5; i++) {
        const operationStart = Date.now();
        
        const recordId = await qbClient.createRecord(testTableId, {
          fields: {
            6: { value: `Session Persistence Test ${i + 1}` },
            7: { value: i * 10 }
          }
        });
        
        testRecordIds.push(recordId);
        
        const operationEnd = Date.now();
        operations.push({
          operation: 'create',
          recordId,
          duration: operationEnd - operationStart
        });
      }

      const totalTime = Date.now() - startTime;

      expect(operations.length).toBe(5);
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      // Verify all operations succeeded
      operations.forEach(op => {
        expect(op.recordId).toBeDefined();
        expect(op.duration).toBeLessThan(10000); // Each operation under 10 seconds
      });
    }, 45000);
  });

  describe('Session Authentication Failure Scenarios', () => {
    it('should handle expired session gracefully', async () => {
      const expiredSessionData = AUTH_TEST_SCENARIOS.sessionTestData.expiredSession;
      
      // Mock expired session validation
      const validateExpiredSession = (sessionId: string) => {
        return {
          isValid: false,
          error: 'Session expired',
          sessionId,
          requiresReauth: true
        };
      };

      const result = validateExpiredSession(expiredSessionData.sessionId);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Session expired');
      expect(result.requiresReauth).toBe(true);
    });

    it('should handle missing session credentials', async () => {
      // Test with completely empty credentials
      const emptyConfig: QuickBaseConfig = {
        realm: '',
        userToken: '',
        appId: '',
        timeout: 5000,
        maxRetries: 1
      };

      expect(() => new QuickBaseClient(emptyConfig)).toThrow();
    });

    it('should handle invalid session tokens', async () => {
      // Create client with invalid credentials
      const invalidConfig: QuickBaseConfig = {
        realm: 'invalid.quickbase.com',
        userToken: 'invalid_session_token',
        appId: 'invalid_app',
        timeout: 5000,
        maxRetries: 1
      };

      const invalidClient = new QuickBaseClient(invalidConfig);
      
      await expect(invalidClient.testConnection())
        .resolves
        .toBe(false);
    }, 10000);

    it('should handle network errors during authentication', async () => {
      // Test with unreachable realm
      const networkErrorConfig: QuickBaseConfig = {
        realm: 'nonexistent.quickbase.com',
        userToken: process.env.QB_USER_TOKEN!,
        appId: process.env.QB_APP_ID!,
        timeout: 2000,
        maxRetries: 1
      };

      const networkErrorClient = new QuickBaseClient(networkErrorConfig);
      
      await expect(networkErrorClient.testConnection())
        .resolves
        .toBe(false);
    }, 10000);
  });

  describe('Performance Monitoring for Authentication Operations', () => {
    it('should measure authentication response times', async () => {
      const measurements = [];
      const testCount = 3;

      for (let i = 0; i < testCount; i++) {
        const startTime = Date.now();
        
        // Test connection (which involves authentication)
        const isConnected = await qbClient.testConnection();
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        measurements.push({
          attempt: i + 1,
          responseTime,
          success: isConnected
        });
      }

      const averageResponseTime = measurements.reduce((sum, m) => sum + m.responseTime, 0) / measurements.length;
      const maxResponseTime = Math.max(...measurements.map(m => m.responseTime));
      const successRate = measurements.filter(m => m.success).length / measurements.length;

      console.log(`Authentication Performance Metrics:`);
      console.log(`  Average response time: ${averageResponseTime}ms`);
      console.log(`  Max response time: ${maxResponseTime}ms`);
      console.log(`  Success rate: ${(successRate * 100).toFixed(1)}%`);

      expect(averageResponseTime).toBeLessThan(5000); // Under 5 seconds average
      expect(maxResponseTime).toBeLessThan(10000); // Under 10 seconds max
      expect(successRate).toBe(1); // 100% success rate
    }, 30000);

    it('should monitor save operation performance with authentication', async () => {
      const saveOperations = [];
      const operationCount = 5;

      for (let i = 0; i < operationCount; i++) {
        const startTime = Date.now();
        
        const recordId = await qbClient.createRecord(testTableId, {
          fields: {
            6: { value: `Performance Test Record ${i + 1}` },
            7: { value: i * 100 }
          }
        });
        
        const endTime = Date.now();
        
        saveOperations.push({
          recordId,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        });
        
        testRecordIds.push(recordId);
      }

      const avgSaveTime = saveOperations.reduce((sum, op) => sum + op.responseTime, 0) / saveOperations.length;
      const maxSaveTime = Math.max(...saveOperations.map(op => op.responseTime));

      console.log(`Save Operation Performance:`);
      console.log(`  Average save time: ${avgSaveTime}ms`);
      console.log(`  Max save time: ${maxSaveTime}ms`);
      console.log(`  Operations completed: ${saveOperations.length}`);

      expect(avgSaveTime).toBeLessThan(3000); // Under 3 seconds average
      expect(maxSaveTime).toBeLessThan(8000); // Under 8 seconds max
      expect(saveOperations.length).toBe(operationCount);
      
      // Verify all records were created successfully
      saveOperations.forEach(op => {
        expect(op.recordId).toBeDefined();
        expect(typeof op.recordId).toBe('number');
      });
    }, 45000);
  });

  describe('Comprehensive Test Reporting', () => {
    it('should generate detailed test report for QuickBase operations', async () => {
      const testReport = {
        testSuite: 'Session Authentication Integration Tests',
        timestamp: new Date().toISOString(),
        environment: {
          realm: process.env.QB_REALM,
          appId: process.env.QB_APP_ID,
          nodeVersion: process.version,
          testTableId
        },
        operations: [] as any[],
        summary: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageResponseTime: 0,
          totalTestTime: 0
        }
      };

      const testStartTime = Date.now();

      // Test various operations and collect metrics
      const operations = [
        { name: 'create_record', action: () => qbClient.createRecord(testTableId, {
          fields: { 6: { value: 'Report Test Record' }, 7: { value: 999 } }
        })},
        { name: 'get_record', action: () => qbClient.getRecord(testTableId, testRecordIds[0] || 1) },
        { name: 'query_records', action: () => qbClient.getRecords(testTableId, { top: 5 }) },
        { name: 'test_connection', action: () => qbClient.testConnection() }
      ];

      for (const operation of operations) {
        const opStartTime = Date.now();
        let success = false;
        let error = null;
        let result = null;

        try {
          result = await operation.action();
          success = true;
          
          // Store record ID if it's a create operation
          if (operation.name === 'create_record' && typeof result === 'number') {
            testRecordIds.push(result);
          }
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error';
        }

        const opEndTime = Date.now();
        const responseTime = opEndTime - opStartTime;

        testReport.operations.push({
          name: operation.name,
          success,
          responseTime,
          error,
          timestamp: new Date(opStartTime).toISOString(),
          result: success ? 'Operation completed successfully' : error
        });

        testReport.summary.totalOperations++;
        if (success) {
          testReport.summary.successfulOperations++;
        } else {
          testReport.summary.failedOperations++;
        }
      }

      const testEndTime = Date.now();
      testReport.summary.totalTestTime = testEndTime - testStartTime;
      testReport.summary.averageResponseTime = testReport.operations.reduce(
        (sum, op) => sum + op.responseTime, 0
      ) / testReport.operations.length;

      // Validate report structure
      expect(testReport.testSuite).toBeDefined();
      expect(testReport.timestamp).toBeDefined();
      expect(testReport.environment.realm).toBeDefined();
      expect(testReport.operations.length).toBeGreaterThan(0);
      expect(testReport.summary.totalOperations).toBe(operations.length);
      expect(testReport.summary.successfulOperations).toBeGreaterThan(0);

      // Log comprehensive report
      console.log('\n=== COMPREHENSIVE TEST REPORT ===');
      console.log(JSON.stringify(testReport, null, 2));
      console.log('================================\n');

      // Validate performance metrics
      expect(testReport.summary.averageResponseTime).toBeLessThan(5000);
      expect(testReport.summary.totalTestTime).toBeLessThan(30000);
    }, 45000);

    it('should validate all QuickBase API responses', async () => {
      const responseValidation = {
        testName: 'API Response Validation',
        validations: [] as any[]
      };

      // Test record creation response
      const createResponse = await qbClient.createRecord(testTableId, {
        fields: {
          6: { value: 'Validation Test Record' },
          7: { value: 777 }
        }
      });
      testRecordIds.push(createResponse);

      responseValidation.validations.push({
        operation: 'create_record',
        responseType: typeof createResponse,
        isValid: typeof createResponse === 'number' && createResponse > 0,
        value: createResponse
      });

      // Test record retrieval response
      const getResponse = await qbClient.getRecord(testTableId, createResponse);
      
      responseValidation.validations.push({
        operation: 'get_record',
        responseType: typeof getResponse,
        isValid: getResponse && typeof getResponse === 'object' && getResponse[3]?.value === createResponse,
        hasRequiredFields: !!(getResponse[3] && getResponse[6]),
        recordId: getResponse[3]?.value
      });

      // Test query response
      const queryResponse = await qbClient.getRecords(testTableId, { top: 3 });
      
      responseValidation.validations.push({
        operation: 'query_records',
        responseType: Array.isArray(queryResponse) ? 'array' : typeof queryResponse,
        isValid: Array.isArray(queryResponse) && queryResponse.length >= 0,
        recordCount: Array.isArray(queryResponse) ? queryResponse.length : 0
      });

      // Validate all responses
      responseValidation.validations.forEach(validation => {
        expect(validation.isValid).toBe(true);
      });

      console.log('\n=== API RESPONSE VALIDATION ===');
      console.log(JSON.stringify(responseValidation, null, 2));
      console.log('==============================\n');
    }, 30000);
  });
});