/**
 * Test data fixtures for QuickBase integration tests
 * Provides consistent test data across different test suites
 */

export interface TestRecord {
  fields: Record<string, { value: any }>;
}

export interface TestTable {
  name: string;
  description: string;
  fields: Array<{
    label: string;
    fieldType: string;
    required?: boolean;
    unique?: boolean;
    choices?: string[];
  }>;
}

/**
 * Standard test table definition for integration tests
 */
export const TEST_TABLE_DEFINITION: TestTable = {
  name: 'Integration Test Table',
  description: 'Table created for QuickBase integration testing',
  fields: [
    {
      label: 'Test Name',
      fieldType: 'text',
      required: true,
      unique: false
    },
    {
      label: 'Test Value',
      fieldType: 'numeric',
      required: false,
      unique: false
    },
    {
      label: 'Test Date',
      fieldType: 'date',
      required: false,
      unique: false
    },
    {
      label: 'Test Status',
      fieldType: 'text_choice',
      required: false,
      unique: false,
      choices: ['Active', 'Inactive', 'Pending', 'Completed']
    },
    {
      label: 'Test Email',
      fieldType: 'email',
      required: false,
      unique: false
    },
    {
      label: 'Test Checkbox',
      fieldType: 'checkbox',
      required: false,
      unique: false
    }
  ]
};

/**
 * Valid test records for creation and update operations
 */
export const VALID_TEST_RECORDS: TestRecord[] = [
  {
    fields: {
      6: { value: 'Sample Record 1' },
      7: { value: 100 },
      8: { value: '2024-01-15' },
      9: { value: 'Active' },
      10: { value: 'test1@example.com' },
      11: { value: true }
    }
  },
  {
    fields: {
      6: { value: 'Sample Record 2' },
      7: { value: 250 },
      8: { value: '2024-02-20' },
      9: { value: 'Pending' },
      10: { value: 'test2@example.com' },
      11: { value: false }
    }
  },
  {
    fields: {
      6: { value: 'Sample Record 3' },
      7: { value: 500 },
      8: { value: '2024-03-10' },
      9: { value: 'Completed' },
      10: { value: 'test3@example.com' },
      11: { value: true }
    }
  }
];

/**
 * Invalid test records for error testing
 */
export const INVALID_TEST_RECORDS: Array<{ record: TestRecord; expectedError: string }> = [
  {
    record: {
      fields: {
        7: { value: 100 } // Missing required field 6 (Test Name)
      }
    },
    expectedError: 'Missing required field'
  },
  {
    record: {
      fields: {
        6: { value: 'Invalid Number Test' },
        7: { value: 'not_a_number' } // Invalid numeric value
      }
    },
    expectedError: 'Invalid field type'
  },
  {
    record: {
      fields: {
        6: { value: 'Invalid Choice Test' },
        9: { value: 'InvalidStatus' } // Not in defined choices
      }
    },
    expectedError: 'Invalid choice value'
  },
  {
    record: {
      fields: {
        6: { value: 'Invalid Email Test' },
        10: { value: 'not-an-email' } // Invalid email format
      }
    },
    expectedError: 'Invalid email format'
  }
];

/**
 * Bulk test records for performance testing
 */
export const generateBulkTestRecords = (count: number): TestRecord[] => {
  const records: TestRecord[] = [];
  const statuses = ['Active', 'Inactive', 'Pending', 'Completed'];
  
  for (let i = 0; i < count; i++) {
    records.push({
      fields: {
        6: { value: `Bulk Test Record ${i + 1}` },
        7: { value: (i + 1) * 10 },
        8: { value: `2024-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` },
        9: { value: statuses[i % statuses.length] },
        10: { value: `bulk${i + 1}@example.com` },
        11: { value: i % 2 === 0 }
      }
    });
  }
  
  return records;
};

/**
 * Update test data for record modification tests
 */
export const UPDATE_TEST_DATA = {
  singleUpdate: {
    6: { value: 'Updated Record Name' },
    7: { value: 999 },
    9: { value: 'Completed' }
  },
  bulkUpdates: [
    {
      updates: {
        6: { value: 'Bulk Updated 1' },
        9: { value: 'Active' }
      }
    },
    {
      updates: {
        6: { value: 'Bulk Updated 2' },
        9: { value: 'Inactive' }
      }
    }
  ]
};

/**
 * Search test data for query operations
 */
export const SEARCH_TEST_DATA = {
  searchTerms: [
    'Sample',
    'Record',
    'Test',
    'Active',
    'example.com'
  ],
  whereQueries: [
    '{6.CT.\'Sample\'}', // Contains 'Sample' in Test Name field
    '{7.GT.200}', // Test Value greater than 200
    '{9.EX.\'Active\'}', // Test Status equals 'Active'
    '{8.GTE.\'2024-02-01\'}', // Test Date greater than or equal to Feb 1, 2024
    '{11.EX.true}' // Test Checkbox is true
  ]
};

/**
 * Performance test configuration
 */
export const PERFORMANCE_TEST_CONFIG = {
  smallLoad: 10,
  mediumLoad: 50,
  largeLoad: 100,
  maxResponseTime: 5000, // 5 seconds
  maxBulkResponseTime: 30000, // 30 seconds
  timeoutThreshold: 10000 // 10 seconds
};

/**
 * Codepage test data for codepage-specific testing
 */
export const CODEPAGE_TEST_DATA = {
  validCodepages: [
    {
      name: 'Simple Calculator',
      code: `
        function calculate(a, b, operation) {
          switch(operation) {
            case 'add': return a + b;
            case 'subtract': return a - b;
            case 'multiply': return a * b;
            case 'divide': return b !== 0 ? a / b : 'Error: Division by zero';
            default: return 'Error: Invalid operation';
          }
        }
      `,
      description: 'A simple calculator function for testing'
    },
    {
      name: 'Data Validator',
      code: `
        function validateData(data) {
          const errors = [];
          if (!data.name || data.name.trim() === '') {
            errors.push('Name is required');
          }
          if (data.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
          }
          if (data.age && (data.age < 0 || data.age > 150)) {
            errors.push('Age must be between 0 and 150');
          }
          return { isValid: errors.length === 0, errors };
        }
      `,
      description: 'Data validation function for form inputs'
    }
  ],
  invalidCodepages: [
    {
      name: 'Syntax Error Test',
      code: 'function invalid( { // Missing closing brace and parameters',
      description: 'Codepage with syntax errors for testing validation'
    },
    {
      name: 'Empty Code Test',
      code: '',
      description: 'Empty codepage for testing validation'
    }
  ]
};

/**
 * Authentication test scenarios
 */
export const AUTH_TEST_SCENARIOS = {
  validCredentials: {
    // These would be set from environment variables in actual tests
    realm: process.env.QB_REALM || 'test.quickbase.com',
    userToken: process.env.QB_USER_TOKEN || 'test_token',
    appId: process.env.QB_APP_ID || 'test_app_id'
  },
  invalidCredentials: [
    {
      realm: 'invalid.quickbase.com',
      userToken: 'invalid_token',
      appId: 'invalid_app_id',
      expectedError: 'Authentication failed'
    },
    {
      realm: '',
      userToken: '',
      appId: '',
      expectedError: 'Missing credentials'
    }
  ],
  sessionTestData: {
    validSession: {
      sessionId: 'test_session_123',
      userId: 'test_user_456',
      permissions: ['read', 'write', 'admin']
    },
    expiredSession: {
      sessionId: 'expired_session_789',
      userId: 'test_user_456',
      permissions: []
    }
  }
};

/**
 * Helper function to create test table with all required fields
 */
export const createTestTableStructure = async (qbClient: any, tableName?: string): Promise<string> => {
  const tableDefinition = {
    ...TEST_TABLE_DEFINITION,
    name: tableName || `Test_${Date.now()}`
  };
  
  const tableId = await qbClient.createTable({
    name: tableDefinition.name,
    description: tableDefinition.description
  });
  
  // Create all test fields
  for (const field of tableDefinition.fields) {
    await qbClient.createField(tableId, field);
  }
  
  return tableId;
};

/**
 * Helper function to clean up test data
 */
export const cleanupTestData = async (qbClient: any, tableId: string, recordIds: number[] = []): Promise<void> => {
  try {
    // Delete test records if any
    if (recordIds.length > 0) {
      await qbClient.deleteRecords(tableId, recordIds);
    }
    
    // Delete test table
    await qbClient.deleteTable(tableId);
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
};