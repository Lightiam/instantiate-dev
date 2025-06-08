import { Router } from 'express';
import { multiCloudManager } from '../cloud-providers/multi-cloud-manager';
import { z } from 'zod';

const router = Router();

const deploymentRequestSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1),
  codeType: z.enum(['javascript', 'python', 'html']),
  provider: z.enum(['aws', 'gcp', 'azure', 'alibaba', 'ibm', 'oracle', 'digitalocean', 'linode', 'huawei', 'tencent', 'netlify']),
  region: z.string().min(1),
  service: z.string().min(1),
  environmentVariables: z.record(z.string()).optional()
});

router.post('/deploy', async (req, res) => {
  try {
    const request = deploymentRequestSchema.parse(req.body);
    const result = await multiCloudManager.deployToProvider(request);
    
    res.json({
      success: true,
      deployment: result,
      message: `Successfully deployed ${request.name} to ${request.provider.toUpperCase()}`
    });
  } catch (error: any) {
    console.error('Multi-cloud deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/resources', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const resources = await multiCloudManager.getAllResources(forceRefresh);
    res.json(resources);
  } catch (error: any) {
    console.error('Error fetching multi-cloud resources:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/status', async (req, res) => {
  try {
    const statuses = await multiCloudManager.getProviderStatuses();
    res.json(statuses);
  } catch (error: any) {
    console.error('Error fetching provider statuses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await multiCloudManager.getDeploymentStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching deployment stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/resource/:provider/:resourceId/status', async (req, res) => {
  try {
    const { provider, resourceId } = req.params;
    const { type } = req.query;
    
    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Resource type is required'
      });
    }

    const status = await multiCloudManager.getResourceStatus(
      resourceId,
      provider as any,
      type
    );
    
    res.json(status);
  } catch (error: any) {
    console.error('Error fetching resource status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/providers/:provider/capabilities', async (req, res) => {
  try {
    const { provider } = req.params;
    const capabilities = multiCloudManager.getProviderCapabilities(provider as any);
    const regions = multiCloudManager.getSupportedRegions(provider as any);
    
    res.json({
      provider,
      capabilities,
      regions
    });
  } catch (error: any) {
    console.error('Error fetching provider capabilities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/providers/capabilities', async (req, res) => {
  try {
    const providers = ['aws', 'gcp', 'azure', 'alibaba', 'ibm', 'oracle', 'digitalocean', 'linode', 'huawei', 'tencent', 'netlify'];
    
    const allCapabilities = providers.map(provider => ({
      provider,
      capabilities: multiCloudManager.getProviderCapabilities(provider as any),
      regions: multiCloudManager.getSupportedRegions(provider as any)
    }));
    
    res.json(allCapabilities);
  } catch (error: any) {
    console.error('Error fetching all provider capabilities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/sync', async (req, res) => {
  try {
    await multiCloudManager.syncAllProviders();
    
    res.json({
      success: true,
      message: 'Successfully synchronized all cloud providers'
    });
  } catch (error: any) {
    console.error('Error syncing providers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    const statuses = await multiCloudManager.getProviderStatuses();
    const connectedProviders = statuses.filter(p => p.status === 'connected').length;
    const totalProviders = statuses.length;
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers: {
        connected: connectedProviders,
        total: totalProviders,
        percentage: Math.round((connectedProviders / totalProviders) * 100)
      },
      statuses
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as multiCloudRoutes };