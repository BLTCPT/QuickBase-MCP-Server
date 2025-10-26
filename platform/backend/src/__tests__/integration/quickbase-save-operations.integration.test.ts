import { QuickBaseClient } from '../../../../../src/quickbase/client.js';
import { QuickBaseConfig } from '../../../../../src/types/quickbase.js';
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

describe('QuickBase Save Operations Integration Tests', () => {
  let qbClient: QuickBaseClient;
  let testTableId: string;
  let testRecordIds: number[] = [];

  beforeAll(async () => {
    // Skip tests if QuickBase credentials are not available
    if (!process.env.QB_REALM || !process.env.QB_USER_TOKEN || !process.env.QB_APP_ID) {
      console.warn('Skipping QuickBase integration tests - missing credentials');
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

    // Test connection first
    const isConnected = await qbClient.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to QuickBase - check credentials');
    }

    // Create a test table for our integration tests
    testTableId = await qbClient.createTable({
      name: 'Integration Test Records',
      description: 'Table for testing QuickBase save operations'
    });

    // Add some test fields
    await qbClient.createField(testTableId, {
      label: 'Test Name',
      fieldType: 'text',
      required: true,
      unique: false
    });

    await qbClient.createField(testTableId, {
      label: 'Test Value',
      fieldType: 'numeric',
      required: false,
      unique: false
    });

    await qbClient.createField(testTableId, {
      label: 'Test Date',
      fieldType: 'date',
      required: false,
      unique: false
    });

    await qbClient.createField(testTableId, {
      label: 'Test Status',
      fieldType: 'text_choice',
      required: false,
      unique: false,
      choices: ['Active', 'Inactive', 'Pending']
    });
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    if (!qbClient || !testTableId) return;

    try {
      // Clean up test records
      if (testRecordIds.length > 0) {
        await qbClient.deleteRecords(testTableId, testRecordIds);
      }
      
      // Clean up test table
      await qbClient.deleteTable(testTableId);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }, 30000);

  beforeEach(() => {
    // Skip individual tests if setup failed
    if (!qbClient || !testTableId) {
      console.warn('QuickBase integration tests skipped - setup failed');
      return;
    }
  });

  describe('Record Creation Operations', () => {
    it('should create a single record successfully', async () => {
      const testData = {
        fields: {
          6: { value: 'Test Record 1' }, // Test Name field
          7: { value: 100 }, // Test Value field
          8: { value: '2024-01-15' }, // Test Date field
          9: { value: 'Active' } // Test Status field
        }
      };

      const recordId = await qbClient.createRecord(testTableId, testData);
      testRecordIds.push(recordId);

      expect(recordId).toBeDefined();
      expect(typeof recordId).toBe('number');
      expect(recordId).toBeGreaterThan(0);

      // Verify the record was created by retrieving it
      const retrievedRecord = await qbClient.getRecord(testTableId, recordId);
      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord[6]?.value).toBe('Test Record 1');
      expect(retrievedRecord[7]?.value).toBe(100);
    }, 30000);

    it('should create multiple records in bulk', async () => {
      const testRecords = [
        {
          fields: {
            6: { value: 'Bulk Record 1' },
            7: { value: 200 },
            9: { value: 'Active' }
          }
        },
        {
          fields: {
            6: { value: 'Bulk Record 2' },
            7: { value: 300 },
            9: { value: 'Pending' }
          }
        },
        {
          fields: {
            6: { value: 'Bulk Record 3' },
            7: { value: 400 },
            9: { value: 'Inactive' }
          }
        }
      ];

      const recordIds = await qbClient.createRecords(testTableId, testRecords);
      testRecordIds.push(...recordIds);

      expect(recordIds).toBeDefined();
      expect(Array.isArray(recordIds)).toBe(true);
      expect(recordIds.length).toBe(3);
      
      recordIds.forEach(id => {
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
      });

      // Verify all records were created
      const allRecords = await qbClient.getRecords(testTableId, {
        where: recordIds.map(id => `{3.EX.${id}}`).join('OR')
      });
      expect(allRecords.length).toBe(3);
    }, 30000);

    it('should handle validation errors gracefully', async () => {
      const invalidData = {
        fields: {
          6: { value: '' }, // Empty required field
          7: { value: 'invalid_number' }, // Invalid numeric value
          9: { value: 'InvalidStatus' } // Invalid choice value
        }
      };

      await expect(qbClient.createRecord(testTableId, invalidData))
        .rejects
        .toThrow();
    }, 15000);
  });

  describe('Record Update Operations', () => {
    let updateTestRecordId: number;

    beforeEach(async () => {
      // Create a record for update tests
      const testData = {
        fields: {
          6: { value: 'Update Test Record' },
          7: { value: 500 },
          9: { value: 'Pending' }
        }
      };
      updateTestRecordId = await qbClient.createRecord(testTableId, testData);
      testRecordIds.push(updateTestRecordId);
    });

    it('should update a single record successfully', async () => {
      const updates = {
        6: { value: 'Updated Record Name' },
        7: { value: 750 },
        9: { value: 'Active' }
      };

      await qbClient.updateRecord(testTableId, updateTestRecordId, updates);

      // Verify the updates
      const updatedRecord = await qbClient.getRecord(testTableId, updateTestRecordId);
      expect(updatedRecord[6]?.value).toBe('Updated Record Name');
      expect(updatedRecord[7]?.value).toBe(750);
      expect(updatedRecord[9]?.value).toBe('Active');
    }, 15000);

    it('should update multiple records in bulk', async () => {
      // Create additional records for bulk update
      const additionalRecords = [
        {
          fields: {
            6: { value: 'Bulk Update 1' },
            7: { value: 100 }
          }
        },
        {
          fields: {
            6: { value: 'Bulk Update 2' },
            7: { value: 200 }
          }
        }
      ];

      const additionalIds = await qbClient.createRecords(testTableId, additionalRecords);
      testRecordIds.push(...additionalIds);

      // Perform bulk update
      const bulkUpdates = [
        {
          recordId: additionalIds[0],
          updates: {
            6: { value: 'Bulk Updated 1' },
            9: { value: 'Active' }
          }
        },
        {
          recordId: additionalIds[1],
          updates: {
            6: { value: 'Bulk Updated 2' },
            9: { value: 'Inactive' }
          }
        }
      ];

      await qbClient.updateRecords(testTableId, bulkUpdates);

      // Verify updates
      const updatedRecords = await qbClient.getRecords(testTableId, {
        where: additionalIds.map(id => `{3.EX.${id}}`).join('OR')
      });

      expect(updatedRecords.length).toBe(2);
      const record1 = updatedRecords.find(r => r[3].value === additionalIds[0]);
      const record2 = updatedRecords.find(r => r[3].value === additionalIds[1]);
      
      expect(record1[6]?.value).toBe('Bulk Updated 1');
      expect(record2[6]?.value).toBe('Bulk Updated 2');
    }, 30000);
  });

  describe('API Response Handling', () => {
    it('should handle successful API responses correctly', async () => {
      const testData = {
        fields: {
          6: { value: 'API Response Test' },
          7: { value: 999 }
        }
      };

      const recordId = await qbClient.createRecord(testTableId, testData);
      testRecordIds.push(recordId);

      expect(recordId).toBeDefined();
      expect(typeof recordId).toBe('number');

      // Test retrieval response
      const record = await qbClient.getRecord(testTableId, recordId);
      expect(record).toBeDefined();
      expect(record[3]?.value).toBe(recordId);
      expect(record[6]?.value).toBe('API Response Test');
    }, 15000);

    it('should handle API errors appropriately', async () => {
      // Test with invalid table ID
      const invalidTableId = 'invalid_table_id';
      const testData = {
        fields: {
          6: { value: 'Error Test' }
        }
      };

      await expect(qbClient.createRecord(invalidTableId, testData))
        .rejects
        .toThrow();
    }, 15000);

    it('should handle network timeouts gracefully', async () => {
      // Create a client with very short timeout
      const shortTimeoutConfig: QuickBaseConfig = {
        realm: process.env.QB_REALM!,
        userToken: process.env.QB_USER_TOKEN!,
        appId: process.env.QB_APP_ID!,
        timeout: 1, // 1ms timeout to force timeout
        maxRetries: 1
      };

      const shortTimeoutClient = new QuickBaseClient(shortTimeoutConfig);
      
      const testData = {
        fields: {
          6: { value: 'Timeout Test' }
        }
      };

      await expect(shortTimeoutClient.createRecord(testTableId, testData))
        .rejects
        .toThrow();
    }, 15000);
  });

  describe('Error Scenario Testing', () => {
    it('should handle missing required fields', async () => {
      const incompleteData = {
        fields: {
          7: { value: 123 } // Missing required field 6 (Test Name)
        }
      };

      await expect(qbClient.createRecord(testTableId, incompleteData))
        .rejects
        .toThrow();
    }, 15000);

    it('should handle invalid field types', async () => {
      const invalidTypeData = {
        fields: {
          6: { value: 'Valid Name' },
          7: { value: 'not_a_number' } // Invalid numeric field
        }
      };

      await expect(qbClient.createRecord(testTableId, invalidTypeData))
        .rejects
        .toThrow();
    }, 15000);

    it('should handle invalid choice values', async () => {
      const invalidChoiceData = {
        fields: {
          6: { value: 'Choice Test' },
          9: { value: 'InvalidChoice' } // Not in the defined choices
        }
      };

      await expect(qbClient.createRecord(testTableId, invalidChoiceData))
        .rejects
        .toThrow();
    }, 15000);
  });

  describe('Performance and Load Testing', () => {
    it('should handle moderate load of record creation', async () => {
      const startTime = Date.now();
      const recordCount = 10;
      const records = [];

      for (let i = 0; i < recordCount; i++) {
        records.push({
          fields: {
            6: { value: `Load Test Record ${i + 1}` },
            7: { value: i * 10 },
            9: { value: i % 2 === 0 ? 'Active' : 'Inactive' }
          }
        });
      }

      const recordIds = await qbClient.createRecords(testTableId, records);
      testRecordIds.push(...recordIds);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(recordIds.length).toBe(recordCount);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      
      // Verify all records were created correctly
      const createdRecords = await qbClient.getRecords(testTableId, {
        where: recordIds.map(id => `{3.EX.${id}}`).join('OR')
      });
      expect(createdRecords.length).toBe(recordCount);
    }, 45000);

    it('should measure API response times', async () => {
      const measurements = [];
      const testCount = 5;

      for (let i = 0; i < testCount; i++) {
        const startTime = Date.now();
        
        const recordId = await qbClient.createRecord(testTableId, {
          fields: {
            6: { value: `Performance Test ${i + 1}` },
            7: { value: i }
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        measurements.push(responseTime);
        testRecordIds.push(recordId);
      }

      const averageResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxResponseTime = Math.max(...measurements);
      
      console.log(`Average response time: ${averageResponseTime}ms`);
      console.log(`Max response time: ${maxResponseTime}ms`);
      
      expect(averageResponseTime).toBeLessThan(5000); // Average should be under 5 seconds
      expect(maxResponseTime).toBeLessThan(10000); // Max should be under 10 seconds
    }, 60000);
  });
});