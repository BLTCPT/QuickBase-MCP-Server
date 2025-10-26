import request from 'supertest';
import express from 'express';
import { AuthService } from '../../services/auth.js';
import { CDNDeploymentService } from '../../services/cdn-deployment.js';
import { E2ETestingService } from '../../services/e2e-testing.js';
import { createDeploymentRoutes } from '../../routes/deployment.js';

describe('Deployment Validation Integration Tests', () => {
  let app: express.Application;
  let authService: AuthService;
  let cdnDeploymentService: CDNDeploymentService;
  let e2eTestingService: E2ETestingService;
  let authToken: string;

  beforeEach(async () => {
    authService = new AuthService();
    cdnDeploymentService = new CDNDeploymentService();
    e2eTestingService = new E2ETestingService();
    
    app = express();
    app.use(express.json());
    
    // Add auth routes for login
    const authRouter = express.Router();
    authRouter.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.json({ success: true, data: result });
      } catch (error: any) {
        res.status(401).json({ success: false, error: error.message });
      }
    });
    app.use('/auth', authRouter);
    
    // Add deployment routes
    app.use('/deployment', createDeploymentRoutes(cdnDeploymentService, e2eTestingService));

    // Get auth token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@dealership.com',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('CDN Hero Library Deployment', () => {
    it('should validate CDN Hero library successfully', async () => {
      const response = await request(app)
        .post('/deployment/cdn/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('fileSize');
      expect(response.body.data).toHaveProperty('sessionAuthImplemented');
      expect(response.body.data).toHaveProperty('compatibilityChecks');
    });

    it('should deploy CDN Hero library to staging environment', async () => {
      const deploymentConfig = {
        environment: 'staging',
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      const response = await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deploymentId');
      expect(response.body.data).toHaveProperty('version', '2.2.0');
      expect(response.body.data).toHaveProperty('environment', 'staging');
      expect(response.body.data).toHaveProperty('deployedAt');
      expect(response.body.data.success).toBe(true);
    });

    it('should deploy CDN Hero library to production environment with staging validation', async () => {
      const deploymentConfig = {
        environment: 'production',
        version: '2.2.0',
        quickbaseTableId: 'prod_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      const response = await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.environment).toBe('production');
      expect(response.body.data.rollbackAvailable).toBe(true);
    });

    it('should return 400 for invalid deployment configuration', async () => {
      const invalidConfig = {
        environment: 'invalid_env',
        version: '',
        quickbaseTableId: ''
      };

      const response = await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should get CDN deployment history', async () => {
      // First create a deployment
      const deploymentConfig = {
        environment: 'staging',
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig);

      // Then get history
      const response = await request(app)
        .get('/deployment/cdn/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should get specific deployment details', async () => {
      // First create a deployment
      const deploymentConfig = {
        environment: 'staging',
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      const deployResponse = await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig);

      const deploymentId = deployResponse.body.data.deploymentId;

      // Then get specific deployment
      const response = await request(app)
        .get(`/deployment/cdn/${deploymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deploymentId).toBe(deploymentId);
    });

    it('should return 404 for non-existent deployment', async () => {
      const response = await request(app)
        .get('/deployment/cdn/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should rollback CDN deployment successfully', async () => {
      // First create a deployment
      const deploymentConfig = {
        environment: 'staging',
        version: '2.2.0',
        quickbaseTableId: 'test_table_id',
        backupEnabled: true,
        rollbackPlan: true
      };

      const deployResponse = await request(app)
        .post('/deployment/cdn/deploy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deploymentConfig);

      const deploymentId = deployResponse.body.data.deploymentId;

      // Then rollback
      const rollbackData = {
        deploymentId,
        reason: 'Testing rollback functionality'
      };

      const response = await request(app)
        .post('/deployment/cdn/rollback')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rollbackData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deploymentId');
      expect(response.body.data.version).toBe('previous');
    });
  });

  describe('End-to-End Testing', () => {
    it('should conduct comprehensive E2E testing', async () => {
      const testConfig = {
        testEnvironment: 'staging',
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const response = await request(app)
        .post('/deployment/test/e2e')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testConfig)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('suiteId');
      expect(response.body.data).toHaveProperty('suiteName');
      expect(response.body.data).toHaveProperty('tests');
      expect(response.body.data).toHaveProperty('overallStatus');
      expect(Array.isArray(response.body.data.tests)).toBe(true);
    });

    it('should return 400 for invalid test configuration', async () => {
      const invalidConfig = {
        testEnvironment: 'invalid_env',
        testTableId: '',
        testTimeout: -1
      };

      const response = await request(app)
        .post('/deployment/test/e2e')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should get all E2E test results', async () => {
      // First run a test
      const testConfig = {
        testEnvironment: 'staging',
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      await request(app)
        .post('/deployment/test/e2e')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testConfig);

      // Then get results
      const response = await request(app)
        .get('/deployment/test/results')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should get specific test suite results', async () => {
      // First run a test
      const testConfig = {
        testEnvironment: 'staging',
        testTableId: 'test_table_id',
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      const testResponse = await request(app)
        .post('/deployment/test/e2e')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testConfig);

      const suiteId = testResponse.body.data.suiteId;

      // Then get specific results
      const response = await request(app)
        .get(`/deployment/test/results/${suiteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suiteId).toBe(suiteId);
    });

    it('should return 404 for non-existent test suite', async () => {
      const response = await request(app)
        .get('/deployment/test/results/nonexistent-suite-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should test pricing calculator functionality specifically', async () => {
      const testData = {
        testTableId: 'test_table_id',
        testEnvironment: 'staging'
      };

      const response = await request(app)
        .post('/deployment/test/pricing-calculator')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('focusedTest', 'pricing-calculator');
      expect(response.body.data.tests.length).toBeGreaterThan(0);
    });

    it('should return 400 for pricing calculator test without table ID', async () => {
      const response = await request(app)
        .post('/deployment/test/pricing-calculator')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Deployment Status', () => {
    it('should get overall deployment and testing status', async () => {
      const response = await request(app)
        .get('/deployment/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cdn');
      expect(response.body.data).toHaveProperty('testing');
      expect(response.body.data).toHaveProperty('overall');
      expect(response.body.data.cdn).toHaveProperty('totalDeployments');
      expect(response.body.data.testing).toHaveProperty('totalTestSuites');
      expect(response.body.data.overall).toHaveProperty('systemHealthy');
    });
  });

  describe('Authentication', () => {
    it('should return 401 without auth token for CDN validation', async () => {
      const response = await request(app)
        .post('/deployment/cdn/validate')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without auth token for E2E testing', async () => {
      const testConfig = {
        testEnvironment: 'staging',
        testTableId: 'test_table_id'
      };

      const response = await request(app)
        .post('/deployment/test/e2e')
        .send(testConfig)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid auth token', async () => {
      const response = await request(app)
        .post('/deployment/cdn/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});