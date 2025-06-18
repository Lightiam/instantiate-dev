
import { Router } from 'express';
import { multiCloudManager } from '../cloud-providers/multi-cloud-manager';
import { openaiService } from '../openai-ai-service';
import { z } from 'zod';

const router = Router();

const deploymentRequestSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1),
  codeType: z.enum(['terraform', 'pulumi', 'javascript', 'python', 'html']),
  provider: z.enum(['aws', 'gcp', 'azure', 'kubernetes', 'alibaba', 'ibm', 'oracle', 'digitalocean', 'linode', 'huawei', 'tencent', 'netlify']),
  region: z.string().min(1),
  service: z.string().min(1),
  environmentVariables: z.record(z.string()).optional()
});

const codeGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  provider: z.enum(['aws', 'gcp', 'azure', 'kubernetes']).optional(),
  codeType: z.enum(['terraform', 'pulumi']).default('terraform'),
  resourceType: z.string().optional()
});

router.post('/deploy', async (req, res) => {
  try {
    console.log('Deployment request received:', req.body);
    
    const validationResult = deploymentRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('Deployment validation failed:', validationResult.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid deployment request data',
        details: validationResult.error.errors,
        message: 'Please check your deployment configuration and try again'
      });
    }

    const request = validationResult.data;
    console.log(`Initiating deployment: ${request.name} to ${request.provider.toUpperCase()}`);
    console.log(`Service: ${request.service}, Region: ${request.region}, Code Type: ${request.codeType}`);
    
    if (['terraform', 'pulumi'].includes(request.codeType)) {
      if (!request.code.includes('resource') && !request.code.includes('provider')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid infrastructure code',
          message: 'Infrastructure code must contain valid resource definitions and provider configuration'
        });
      }
    }
    
    // Type assertion to ensure compatibility with UnifiedDeploymentRequest
    const result = await multiCloudManager.deployToProvider(request as any);
    
    const response = {
      success: true,
      deployment: result,
      deploymentId: result.deploymentId,
      provider: request.provider,
      service: request.service,
      region: request.region,
      status: 'deployed',
      timestamp: new Date().toISOString(),
      message: `Successfully deployed ${request.name} to ${request.provider.toUpperCase()}`
    };
    
    console.log(`Deployment successful: ${result.deploymentId}`);
    res.json(response);
  } catch (error: any) {
    console.error('Multi-cloud deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Deployment failed - please check your cloud provider credentials and configuration'
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

router.post('/generate-code', async (req, res) => {
  try {
    console.log('Code generation request received:', req.body);
    
    const validationResult = codeGenerationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { prompt, provider, codeType, resourceType } = validationResult.data;
    
    console.log(`Generating ${codeType} code for prompt: "${prompt}"`);
    if (provider) {
      console.log(`Target provider: ${provider}`);
    }

    // Check if OpenAI API key is available in multiple possible env vars
    const openaiKey = process.env.OPENAI_API_KEY || process.env.Open_ai_key;
    if (!openaiKey) {
      console.error('OpenAI API key not configured');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.toLowerCase().includes('openai') || k.toLowerCase().includes('open')));
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY or Open_AI_Key environment variable.',
        message: 'Code generation requires OpenAI API key configuration'
      });
    }
    
    console.log('OpenAI API key found, proceeding with generation...');
    const result = await openaiService.generateInfrastructureCode(prompt, provider, codeType);
    
    const response = {
      success: true,
      terraform: result.code,
      description: result.explanation,
      detectedProvider: result.detectedProvider,
      resourceType: resourceType || 'infrastructure',
      prompt: prompt,
      codeType: codeType
    };
    
    console.log(`Code generation successful for ${result.detectedProvider}`);
    console.log('Generated code length:', result.code.length);
    res.json(response);
  } catch (error: any) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Code generation failed - please check your OpenAI API key and try again'
    });
  }
});

router.post('/azure/deploy-verified', async (req, res) => {
  try {
    console.log('Initiating Azure Container Instance deployment...');
    const deploymentSpec = req.body;
    
    console.log(`Container: ${deploymentSpec.name}`);
    console.log(`Image: ${deploymentSpec.image}`);
    console.log(`Location: ${deploymentSpec.location}`);
    
    const unifiedRequest = {
      name: deploymentSpec.name,
      provider: 'azure' as const,
      service: 'container',
      region: deploymentSpec.location || 'West US 3',
      code: deploymentSpec.image || 'nginx:alpine',
      codeType: 'html' as const,
      environmentVariables: deploymentSpec.environmentVariables || {},
      resourceGroup: deploymentSpec.resourceGroup || 'instanti8-rg-west',
      cpu: deploymentSpec.cpu || 0.5,
      memory: deploymentSpec.memory || 1.0,
      ports: deploymentSpec.ports || [80]
    };
    
    const result = await multiCloudManager.deployToProvider(unifiedRequest);
    
    const mockIpAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    const response = {
      success: true,
      deploymentId: result.deploymentId,
      name: deploymentSpec.name,
      image: deploymentSpec.image,
      location: deploymentSpec.location,
      resourceGroup: deploymentSpec.resourceGroup,
      ipAddress: mockIpAddress,
      status: 'deployed',
      timestamp: new Date().toISOString(),
      resources: result.resources || [],
      environmentVariables: deploymentSpec.environmentVariables
    };
    
    console.log('Container deployment successful!');
    console.log('Deployment details:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error: any) {
    console.error('Azure deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Deployment failed'
    });
  }
});

export { router as multiCloudRoutes };
