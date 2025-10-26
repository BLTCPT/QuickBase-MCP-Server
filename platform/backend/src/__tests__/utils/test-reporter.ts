/**
 * Comprehensive Test Reporting Utility
 * Provides detailed reporting for QuickBase integration tests
 */

export interface TestOperation {
  name: string;
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: string;
  result?: any;
  metadata?: Record<string, any>;
}

export interface TestEnvironment {
  realm?: string;
  appId?: string;
  nodeVersion: string;
  testTableId?: string;
  testStartTime: string;
  testEndTime?: string;
}

export interface TestSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  totalTestTime: number;
  successRate: number;
}

export interface TestReport {
  testSuite: string;
  timestamp: string;
  environment: TestEnvironment;
  operations: TestOperation[];
  summary: TestSummary;
  performanceMetrics: PerformanceMetrics;
  validationResults: ValidationResult[];
}

export interface PerformanceMetrics {
  authenticationTime: number[];
  saveOperationTimes: number[];
  queryOperationTimes: number[];
  networkLatency: number[];
  throughput: {
    operationsPerSecond: number;
    recordsPerSecond: number;
  };
}

export interface ValidationResult {
  operation: string;
  expected: any;
  actual: any;
  isValid: boolean;
  validationType: 'response_structure' | 'data_integrity' | 'performance' | 'authentication';
  details?: string;
}

export class TestReporter {
  private report: TestReport;
  private startTime: number;

  constructor(testSuite: string, environment: Partial<TestEnvironment> = {}) {
    this.startTime = Date.now();
    
    this.report = {
      testSuite,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        testStartTime: new Date().toISOString(),
        ...environment
      },
      operations: [],
      summary: {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        totalTestTime: 0,
        successRate: 0
      },
      performanceMetrics: {
        authenticationTime: [],
        saveOperationTimes: [],
        queryOperationTimes: [],
        networkLatency: [],
        throughput: {
          operationsPerSecond: 0,
          recordsPerSecond: 0
        }
      },
      validationResults: []
    };
  }

  /**
   * Record a test operation with timing and result information
   */
  recordOperation(
    name: string,
    success: boolean,
    responseTime: number,
    error?: string,
    result?: any,
    metadata?: Record<string, any>
  ): void {
    const operation: TestOperation = {
      name,
      success,
      responseTime,
      error,
      timestamp: new Date().toISOString(),
      result,
      metadata
    };

    this.report.operations.push(operation);
    this.updateSummary(operation);
    this.updatePerformanceMetrics(operation);
  }

  /**
   * Record authentication performance metrics
   */
  recordAuthenticationTime(responseTime: number): void {
    this.report.performanceMetrics.authenticationTime.push(responseTime);
  }

  /**
   * Record save operation performance
   */
  recordSaveOperation(responseTime: number): void {
    this.report.performanceMetrics.saveOperationTimes.push(responseTime);
  }

  /**
   * Record query operation performance
   */
  recordQueryOperation(responseTime: number): void {
    this.report.performanceMetrics.queryOperationTimes.push(responseTime);
  }

  /**
   * Add validation result
   */
  addValidation(
    operation: string,
    expected: any,
    actual: any,
    validationType: ValidationResult['validationType'],
    details?: string
  ): void {
    const isValid = this.compareValues(expected, actual, validationType);
    
    this.report.validationResults.push({
      operation,
      expected,
      actual,
      isValid,
      validationType,
      details
    });
  }

  /**
   * Finalize the report and calculate final metrics
   */
  finalize(): TestReport {
    const endTime = Date.now();
    this.report.environment.testEndTime = new Date().toISOString();
    this.report.summary.totalTestTime = endTime - this.startTime;
    
    this.calculateThroughput();
    this.calculateFinalMetrics();
    
    return this.report;
  }

  /**
   * Generate a formatted report string
   */
  generateFormattedReport(): string {
    const report = this.finalize();
    
    let output = '\n';
    output += '='.repeat(60) + '\n';
    output += `TEST REPORT: ${report.testSuite}\n`;
    output += '='.repeat(60) + '\n';
    output += `Timestamp: ${report.timestamp}\n`;
    output += `Duration: ${(report.summary.totalTestTime / 1000).toFixed(2)}s\n`;
    output += '\n';

    // Environment Information
    output += 'ENVIRONMENT:\n';
    output += `-----------\n`;
    output += `Node Version: ${report.environment.nodeVersion}\n`;
    output += `QB Realm: ${report.environment.realm || 'N/A'}\n`;
    output += `App ID: ${report.environment.appId || 'N/A'}\n`;
    output += `Test Table: ${report.environment.testTableId || 'N/A'}\n`;
    output += '\n';

    // Summary Statistics
    output += 'SUMMARY:\n';
    output += '--------\n';
    output += `Total Operations: ${report.summary.totalOperations}\n`;
    output += `Successful: ${report.summary.successfulOperations}\n`;
    output += `Failed: ${report.summary.failedOperations}\n`;
    output += `Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%\n`;
    output += `Average Response Time: ${report.summary.averageResponseTime.toFixed(0)}ms\n`;
    output += `Max Response Time: ${report.summary.maxResponseTime}ms\n`;
    output += `Min Response Time: ${report.summary.minResponseTime === Infinity ? 'N/A' : report.summary.minResponseTime + 'ms'}\n`;
    output += '\n';

    // Performance Metrics
    output += 'PERFORMANCE METRICS:\n';
    output += '-------------------\n';
    if (report.performanceMetrics.authenticationTime.length > 0) {
      const avgAuth = report.performanceMetrics.authenticationTime.reduce((a, b) => a + b, 0) / report.performanceMetrics.authenticationTime.length;
      output += `Average Authentication Time: ${avgAuth.toFixed(0)}ms\n`;
    }
    if (report.performanceMetrics.saveOperationTimes.length > 0) {
      const avgSave = report.performanceMetrics.saveOperationTimes.reduce((a, b) => a + b, 0) / report.performanceMetrics.saveOperationTimes.length;
      output += `Average Save Operation Time: ${avgSave.toFixed(0)}ms\n`;
    }
    if (report.performanceMetrics.queryOperationTimes.length > 0) {
      const avgQuery = report.performanceMetrics.queryOperationTimes.reduce((a, b) => a + b, 0) / report.performanceMetrics.queryOperationTimes.length;
      output += `Average Query Operation Time: ${avgQuery.toFixed(0)}ms\n`;
    }
    output += `Throughput: ${report.performanceMetrics.throughput.operationsPerSecond.toFixed(2)} ops/sec\n`;
    output += '\n';

    // Validation Results
    if (report.validationResults.length > 0) {
      output += 'VALIDATION RESULTS:\n';
      output += '------------------\n';
      const validCount = report.validationResults.filter(v => v.isValid).length;
      output += `Valid: ${validCount}/${report.validationResults.length}\n`;
      
      const failedValidations = report.validationResults.filter(v => !v.isValid);
      if (failedValidations.length > 0) {
        output += '\nFailed Validations:\n';
        failedValidations.forEach(v => {
          output += `  - ${v.operation}: ${v.details || 'Validation failed'}\n`;
        });
      }
      output += '\n';
    }

    // Operation Details
    if (report.operations.length > 0) {
      output += 'OPERATION DETAILS:\n';
      output += '-----------------\n';
      report.operations.forEach((op, index) => {
        const status = op.success ? '✓' : '✗';
        output += `${index + 1}. ${status} ${op.name} (${op.responseTime}ms)`;
        if (op.error) {
          output += ` - Error: ${op.error}`;
        }
        output += '\n';
      });
      output += '\n';
    }

    output += '='.repeat(60) + '\n';
    
    return output;
  }

  /**
   * Export report as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.finalize(), null, 2);
  }

  /**
   * Save report to file (for CI/CD integration)
   */
  async saveToFile(filePath: string, format: 'json' | 'text' = 'json'): Promise<void> {
    const fs = await import('fs/promises');
    const content = format === 'json' ? this.exportAsJSON() : this.generateFormattedReport();
    await fs.writeFile(filePath, content, 'utf8');
  }

  private updateSummary(operation: TestOperation): void {
    this.report.summary.totalOperations++;
    
    if (operation.success) {
      this.report.summary.successfulOperations++;
    } else {
      this.report.summary.failedOperations++;
    }

    this.report.summary.successRate = this.report.summary.successfulOperations / this.report.summary.totalOperations;
    
    // Update response time statistics
    const responseTimes = this.report.operations.map(op => op.responseTime);
    this.report.summary.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    this.report.summary.maxResponseTime = Math.max(...responseTimes);
    this.report.summary.minResponseTime = Math.min(...responseTimes);
  }

  private updatePerformanceMetrics(operation: TestOperation): void {
    // Categorize operations for performance tracking
    if (operation.name.includes('auth') || operation.name.includes('connection')) {
      this.report.performanceMetrics.authenticationTime.push(operation.responseTime);
    } else if (operation.name.includes('create') || operation.name.includes('update') || operation.name.includes('save')) {
      this.report.performanceMetrics.saveOperationTimes.push(operation.responseTime);
    } else if (operation.name.includes('get') || operation.name.includes('query') || operation.name.includes('search')) {
      this.report.performanceMetrics.queryOperationTimes.push(operation.responseTime);
    }
  }

  private calculateThroughput(): void {
    const totalTimeSeconds = this.report.summary.totalTestTime / 1000;
    if (totalTimeSeconds > 0) {
      this.report.performanceMetrics.throughput.operationsPerSecond = 
        this.report.summary.totalOperations / totalTimeSeconds;
      
      // Calculate records per second based on successful create operations
      const createOperations = this.report.operations.filter(
        op => op.success && (op.name.includes('create') || op.name.includes('bulk'))
      );
      this.report.performanceMetrics.throughput.recordsPerSecond = 
        createOperations.length / totalTimeSeconds;
    }
  }

  private calculateFinalMetrics(): void {
    // Calculate network latency if available
    const allResponseTimes = this.report.operations.map(op => op.responseTime);
    if (allResponseTimes.length > 0) {
      this.report.performanceMetrics.networkLatency = allResponseTimes;
    }
  }

  private compareValues(expected: any, actual: any, validationType: ValidationResult['validationType']): boolean {
    switch (validationType) {
      case 'response_structure':
        return this.validateStructure(expected, actual);
      case 'data_integrity':
        return this.validateDataIntegrity(expected, actual);
      case 'performance':
        return this.validatePerformance(expected, actual);
      case 'authentication':
        return this.validateAuthentication(expected, actual);
      default:
        return JSON.stringify(expected) === JSON.stringify(actual);
    }
  }

  private validateStructure(expected: any, actual: any): boolean {
    if (typeof expected !== typeof actual) return false;
    if (Array.isArray(expected) !== Array.isArray(actual)) return false;
    if (expected === null || actual === null) return expected === actual;
    
    if (typeof expected === 'object') {
      const expectedKeys = Object.keys(expected);
      const actualKeys = Object.keys(actual);
      return expectedKeys.every(key => actualKeys.includes(key));
    }
    
    return true;
  }

  private validateDataIntegrity(expected: any, actual: any): boolean {
    // For data integrity, we check if the actual value meets the expected criteria
    if (typeof expected === 'object' && expected.type) {
      switch (expected.type) {
        case 'number':
          return typeof actual === 'number' && !isNaN(actual);
        case 'string':
          return typeof actual === 'string' && actual.length > 0;
        case 'email':
          return typeof actual === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(actual);
        case 'positive_number':
          return typeof actual === 'number' && actual > 0;
        default:
          return true;
      }
    }
    return expected === actual;
  }

  private validatePerformance(expected: any, actual: any): boolean {
    if (typeof expected === 'object' && expected.maxTime) {
      return typeof actual === 'number' && actual <= expected.maxTime;
    }
    if (typeof expected === 'object' && expected.minSuccessRate) {
      return typeof actual === 'number' && actual >= expected.minSuccessRate;
    }
    return actual <= expected;
  }

  private validateAuthentication(expected: any, actual: any): boolean {
    if (typeof expected === 'object' && expected.shouldSucceed !== undefined) {
      return Boolean(actual) === expected.shouldSucceed;
    }
    return Boolean(actual) === Boolean(expected);
  }
}

/**
 * Helper function to create a test reporter with common environment setup
 */
export function createQuickBaseTestReporter(testSuite: string): TestReporter {
  return new TestReporter(testSuite, {
    realm: process.env.QB_REALM,
    appId: process.env.QB_APP_ID
  });
}

/**
 * Helper function to measure operation performance
 */
export async function measureOperation<T>(
  reporter: TestReporter,
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let error: string | undefined;
  let result: T;

  try {
    result = await operation();
    success = true;
    return result;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    throw err;
  } finally {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    reporter.recordOperation(
      operationName,
      success,
      responseTime,
      error,
      success ? result! : undefined,
      metadata
    );
  }
}