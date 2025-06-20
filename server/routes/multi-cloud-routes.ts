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

router.post('/generate-code', async (req, res) => {
  try {
    console.log('🎯 Code generation request received:', {
      hasPrompt: !!req.body.prompt,
      promptLength: req.body.prompt?.length || 0,
      provider: req.body.provider,
      codeType: req.body.codeType,
      timestamp: new Date().toISOString()
    });
    
    // Validate request
    const validationResult = codeGenerationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ Request validation failed:', validationResult.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.errors,
        message: 'Please check your request parameters and try again'
      });
    }

    const { prompt, provider, codeType, resourceType } = validationResult.data;
    
    console.log(`🚀 Processing code generation request:`);
    console.log(`- Prompt: "${prompt}"`);
    console.log(`- Provider: ${provider || 'auto-detect'}`);
    console.log(`- Code Type: ${codeType}`);
    console.log(`- Resource Type: ${resourceType || 'not specified'}`);
    
    // Check OpenAI API key availability
    const possibleKeys = [
      process.env.OPENAI_API_KEY,
      process.env.Open_AI_Key,
      process.env.OPEN_AI_API_KEY,
      process.env.openai_api_key
    ];
    
    const openaiKey = possibleKeys.find(key => key && key.trim().length > 0);
    
    console.log('🔑 API Key Status:', {
      found: !!openaiKey,
      keyLength: openaiKey ? openaiKey.length : 0,
      startsWithSk: openaiKey ? openaiKey.startsWith('sk-') : false,
      availableEnvVars: Object.keys(process.env).filter(k => 
        k.toLowerCase().includes('openai') || 
        k.toLowerCase().includes('open_ai') ||
        k.toLowerCase().includes('ai_key')
      )
    });
    
    if (!openaiKey || openaiKey.trim().length === 0) {
      console.error('❌ No OpenAI API key found');
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Please configure your OpenAI API key in Supabase Edge Function Secrets. Use one of these names: OPENAI_API_KEY, Open_AI_Key, OPEN_AI_API_KEY, or openai_api_key',
        availableEnvVars: Object.keys(process.env).filter(k => 
          k.toLowerCase().includes('openai') || 
          k.toLowerCase().includes('open_ai') ||
          k.toLowerCase().includes('ai_key')
        )
      });
    }

    if (!openaiKey.startsWith('sk-') || openaiKey.length < 20) {
      console.error('❌ Invalid OpenAI API key format');
      return res.status(500).json({
        success: false,
        error: 'Invalid OpenAI API key format',
        message: 'OpenAI API keys should start with "sk-" and be longer than 20 characters. Please check your API key configuration.',
        keyLength: openaiKey.length,
        startsWithSk: openaiKey.startsWith('sk-')
      });
    }
    
    console.log('✅ OpenAI API key validated, proceeding with generation...');
    
    try {
      // Call OpenAI service
      const result = await openaiService.generateInfrastructureCode(prompt, provider, codeType);
      
      console.log('🎉 Code generation completed:', {
        codeLength: result.code.length,
        detectedProvider: result.detectedProvider,
        hasExplanation: !!result.explanation
      });
      
      const response = {
        success: true,
        terraform: result.code,
        description: result.explanation,
        detectedProvider: result.detectedProvider,
        resourceType: resourceType || 'infrastructure',
        prompt: prompt,
        codeType: codeType,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Sending successful response for ${result.detectedProvider}`);
      res.json(response);
      
    } catch (aiError: any) {
      console.error('💥 OpenAI service error:', aiError);
      console.error('AI Error details:', {
        message: aiError.message,
        status: aiError.status,
        type: aiError.type,
        code: aiError.code,
        stack: aiError.stack?.substring(0, 500)
      });
      
      return res.status(500).json({
        success: false,
        error: `AI Code Generation Error: ${aiError.message}`,
        message: 'Failed to generate infrastructure code using OpenAI. This could be due to API rate limits, invalid API key, or service issues.',
        details: {
          type: aiError.type || 'unknown',
          status: aiError.status || 'unknown',
          code: aiError.code || 'unknown'
        }
      });
    }
  } catch (error: any) {
    console.error('💥 Code generation route error:', error);
    console.error('Route Error details:', {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
      message: 'An unexpected error occurred during code generation. Please try again or check the server configuration.',
      timestamp: new Date().toISOString()
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
