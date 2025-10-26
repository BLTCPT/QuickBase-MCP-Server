import express from 'express';
import { CDNDeploymentService, CDNDeploymentConfigSchema } from '../services/cdn-deployment.js';
import { E2ETestingService, E2ETestConfigSchema } from '../services/e2e-testing.js';
import { authMiddleware } from '../middleware/auth.js';

export function createDeploymentRoutes(
  cdnDeploymentService: CDNDeploymentService,
  e2eTestingService: E2ETestingService
): express.Router {
  const router = express.Router();

  // Apply authentication middleware to all routes
  router.use(authMiddleware);

  /**
   * POST /deployment/cdn/deploy
   * Deploy updated CDN Hero library to production
   */
  router.post('/cdn/deploy', async (req, res) => {
    try {
      const config = CDNDeploymentConfigSchema.parse(req.body);
      
      console.log(`🚀 CDN deployment requested by user ${req.user?.id}`);
      console.log(`📋 Environment: ${config.environment}, Version: ${config.version}`);

      const result = await cdnDeploymentService.deployUpdatedCDNHero(config);

      res.status(201).json({
        success: true,
        data: result,
        message: `CDN Hero library v${config.version} deployment ${result.success ? 'completed' : 'failed'}`
      });

    } catch (error: any) {
      console.error('❌ CDN deployment failed:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid deployment configuration',
            details: error.errors
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DEPLOYMENT_ERROR',
          message: error.message || 'CDN deployment failed'
        }
      });
    }
  });

  /**
   * POST /deployment/cdn/validate
   * Validate CDN Hero library before deployment
   */
  router.post('/cdn/validate', async (req, res) => {
    try {
      console.log(`🔍 CDN validation requested by user ${req.user?.id}`);

      const validation = await cdnDeploymentService.validateCDNHeroLibrary();

      res.json({
        success: true,
        data: validation,
        message: validation.isValid ? 'CDN Hero library validation passed' : 'CDN Hero library validation failed'
      });

    } catch (error: any) {
      console.error('❌ CDN validation failed:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'CDN validation failed'
        }
      });
    }
  });

  /**
   * POST /deployment/cdn/rollback
   * Rollback CDN Hero library to previous version
   */
  router.post('/cdn/rollback', async (req, res) => {
    try {
      const { deploymentId, reason } = req.body;

      if (!deploymentId || !reason) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Deployment ID and reason are required'
          }
        });
      }

      console.log(`🔄 CDN rollback requested by user ${req.user?.id}`);
      console.log(`📋 Deployment ID: ${deploymentId}, Reason: ${reason}`);

      const result = await cdnDeploymentService.rollbackCDNHero(deploymentId, reason);

      res.json({
        success: true,
        data: result,
        message: 'CDN Hero library rollback completed successfully'
      });

    } catch (error: any) {
      console.error('❌ CDN rollback failed:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROLLBACK_ERROR',
          message: error.message || 'CDN rollback failed'
        }
      });
    }
  });

  /**
   * GET /deployment/cdn/history
   * Get CDN deployment history
   */
  router.get('/cdn/history', async (req, res) => {
    try {
      const history = cdnDeploymentService.getDeploymentHistory();

      res.json({
        success: true,
        data: history,
        count: history.length,
        message: 'CDN deployment history retrieved successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to get CDN deployment history:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: error.message || 'Failed to retrieve deployment history'
        }
      });
    }
  });

  /**
   * GET /deployment/cdn/:deploymentId
   * Get specific CDN deployment details
   */
  router.get('/cdn/:deploymentId', async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const deployment = cdnDeploymentService.getDeployment(deploymentId);

      if (!deployment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Deployment not found'
          }
        });
      }

      res.json({
        success: true,
        data: deployment,
        message: 'Deployment details retrieved successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to get deployment details:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DEPLOYMENT_ERROR',
          message: error.message || 'Failed to retrieve deployment details'
        }
      });
    }
  });

  /**
   * POST /deployment/test/e2e
   * Conduct end-to-end testing of codepage save functionality
   */
  router.post('/test/e2e', async (req, res) => {
    try {
      const config = E2ETestConfigSchema.parse(req.body);
      
      console.log(`🧪 E2E testing requested by user ${req.user?.id}`);
      console.log(`📋 Environment: ${config.testEnvironment}, Table ID: ${config.testTableId}`);

      // Start E2E testing (this is a long-running operation)
      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(config);

      res.status(201).json({
        success: true,
        data: testSuite,
        message: `E2E testing completed with ${testSuite.overallStatus} status`
      });

    } catch (error: any) {
      console.error('❌ E2E testing failed:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid test configuration',
            details: error.errors
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'TESTING_ERROR',
          message: error.message || 'E2E testing failed'
        }
      });
    }
  });

  /**
   * GET /deployment/test/results
   * Get all E2E test results
   */
  router.get('/test/results', async (req, res) => {
    try {
      const results = e2eTestingService.getAllTestResults();

      res.json({
        success: true,
        data: results,
        count: results.length,
        message: 'E2E test results retrieved successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to get E2E test results:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RESULTS_ERROR',
          message: error.message || 'Failed to retrieve test results'
        }
      });
    }
  });

  /**
   * GET /deployment/test/results/:suiteId
   * Get specific E2E test suite results
   */
  router.get('/test/results/:suiteId', async (req, res) => {
    try {
      const { suiteId } = req.params;
      const testSuite = e2eTestingService.getTestResults(suiteId);

      if (!testSuite) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Test suite not found'
          }
        });
      }

      res.json({
        success: true,
        data: testSuite,
        message: 'Test suite results retrieved successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to get test suite results:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RESULTS_ERROR',
          message: error.message || 'Failed to retrieve test suite results'
        }
      });
    }
  });

  /**
   * POST /deployment/test/pricing-calculator
   * Test pricing calculator save functionality specifically
   */
  router.post('/test/pricing-calculator', async (req, res) => {
    try {
      const { testTableId, testEnvironment = 'staging' } = req.body;

      if (!testTableId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Test table ID is required'
          }
        });
      }

      console.log(`💰 Pricing calculator testing requested by user ${req.user?.id}`);

      // Create a focused test configuration for pricing calculator
      const config = {
        testEnvironment: testEnvironment as 'staging' | 'production',
        testTableId,
        testTimeout: 30000,
        cleanupAfterTest: true,
        generateReport: true
      };

      // Run only the pricing calculator test
      const testSuite = await e2eTestingService.conductE2ECodepageSaveTesting(config);
      
      // Filter to only pricing calculator related tests
      const pricingTests = testSuite.tests.filter(test => 
        test.testName.toLowerCase().includes('pricing')
      );

      res.json({
        success: true,
        data: {
          ...testSuite,
          tests: pricingTests,
          focusedTest: 'pricing-calculator'
        },
        message: 'Pricing calculator testing completed successfully'
      });

    } catch (error: any) {
      console.error('❌ Pricing calculator testing failed:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'TESTING_ERROR',
          message: error.message || 'Pricing calculator testing failed'
        }
      });
    }
  });

  /**
   * GET /deployment/status
   * Get overall deployment and testing status
   */
  router.get('/status', async (req, res) => {
    try {
      const cdnHistory = cdnDeploymentService.getDeploymentHistory();
      const testResults = e2eTestingService.getAllTestResults();

      const latestCDNDeployment = cdnHistory[0];
      const latestTestSuite = testResults[0];

      const status = {
        cdn: {
          latestDeployment: latestCDNDeployment,
          totalDeployments: cdnHistory.length,
          successfulDeployments: cdnHistory.filter(d => d.success).length,
          failedDeployments: cdnHistory.filter(d => !d.success).length
        },
        testing: {
          latestTestSuite: latestTestSuite,
          totalTestSuites: testResults.length,
          passedSuites: testResults.filter(s => s.overallStatus === 'passed').length,
          failedSuites: testResults.filter(s => s.overallStatus === 'failed').length,
          errorSuites: testResults.filter(s => s.overallStatus === 'error').length
        },
        overall: {
          systemHealthy: latestCDNDeployment?.success && latestTestSuite?.overallStatus === 'passed',
          lastActivity: Math.max(
            latestCDNDeployment?.deployedAt.getTime() || 0,
            latestTestSuite?.startTime.getTime() || 0
          )
        }
      };

      res.json({
        success: true,
        data: status,
        message: 'Deployment and testing status retrieved successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to get deployment status:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: error.message || 'Failed to retrieve deployment status'
        }
      });
    }
  });

  return router;
}