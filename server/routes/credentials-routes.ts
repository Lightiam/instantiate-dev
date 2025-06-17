import express from 'express';
import { multiCloudManager } from '../cloud-providers/multi-cloud-manager';

const router = express.Router();

interface CredentialRequest {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: any;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  provider?: string;
}

let storedCredentials: Map<string, any> = new Map();
let storedEnvVars: EnvironmentVariable[] = [
  { id: "1", key: "AWS_ACCESS_KEY_ID", value: "", isSecret: true, provider: "aws" },
  { id: "2", key: "AWS_SECRET_ACCESS_KEY", value: "", isSecret: true, provider: "aws" },
  { id: "3", key: "AWS_DEFAULT_REGION", value: "us-east-1", isSecret: false, provider: "aws" },
  { id: "4", key: "AZURE_CLIENT_ID", value: "", isSecret: true, provider: "azure" },
  { id: "5", key: "AZURE_CLIENT_SECRET", value: "", isSecret: true, provider: "azure" },
  { id: "6", key: "AZURE_TENANT_ID", value: "", isSecret: true, provider: "azure" },
  { id: "7", key: "GOOGLE_APPLICATION_CREDENTIALS", value: "", isSecret: true, provider: "gcp" },
  { id: "8", key: "GCP_PROJECT_ID", value: "", isSecret: false, provider: "gcp" },
];

router.get('/env-vars', async (req, res) => {
  try {
    const maskedEnvVars = storedEnvVars.map(envVar => ({
      ...envVar,
      value: envVar.isSecret && envVar.value ? '••••••••' : envVar.value
    }));
    
    res.json({
      success: true,
      envVars: maskedEnvVars
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/env-vars', async (req, res) => {
  try {
    const { envVars } = req.body;
    
    if (!Array.isArray(envVars)) {
      return res.status(400).json({
        success: false,
        error: 'envVars must be an array'
      });
    }
    
    storedEnvVars = envVars;
    
    const providerCredentials = {
      aws: {} as any,
      azure: {} as any,
      gcp: {} as any
    };
    
    envVars.forEach((envVar: EnvironmentVariable) => {
      if (envVar.provider && envVar.value) {
        if (envVar.provider === 'aws') {
          if (envVar.key === 'AWS_ACCESS_KEY_ID') providerCredentials.aws.accessKeyId = envVar.value;
          if (envVar.key === 'AWS_SECRET_ACCESS_KEY') providerCredentials.aws.secretAccessKey = envVar.value;
          if (envVar.key === 'AWS_DEFAULT_REGION') providerCredentials.aws.region = envVar.value;
        } else if (envVar.provider === 'azure') {
          if (envVar.key === 'AZURE_CLIENT_ID') providerCredentials.azure.clientId = envVar.value;
          if (envVar.key === 'AZURE_CLIENT_SECRET') providerCredentials.azure.clientSecret = envVar.value;
          if (envVar.key === 'AZURE_TENANT_ID') providerCredentials.azure.tenantId = envVar.value;
        } else if (envVar.provider === 'gcp') {
          if (envVar.key === 'GOOGLE_APPLICATION_CREDENTIALS') providerCredentials.gcp.keyFilename = envVar.value;
          if (envVar.key === 'GCP_PROJECT_ID') providerCredentials.gcp.projectId = envVar.value;
        }
      }
    });
    
    for (const [provider, credentials] of Object.entries(providerCredentials)) {
      if (Object.keys(credentials).length > 0) {
        storedCredentials.set(provider, credentials);
        await multiCloudManager.setProviderCredentials(provider as any, credentials);
      }
    }
    
    res.json({
      success: true,
      message: 'Environment variables updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/test-connection', async (req, res) => {
  try {
    const { provider } = req.body as CredentialRequest;
    
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be aws, azure, or gcp'
      });
    }
    
    const credentials = storedCredentials.get(provider);
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: `No credentials found for ${provider}`
      });
    }
    
    const result = await multiCloudManager.testProviderConnection(provider, credentials);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/provider-status', async (req, res) => {
  try {
    const statuses = await multiCloudManager.getProviderStatuses();
    
    res.json({
      success: true,
      statuses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/credentials/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { credentials } = req.body;
    
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be aws, azure, or gcp'
      });
    }
    
    const result = await multiCloudManager.setProviderCredentials(provider as any, credentials);
    
    if (result.success) {
      storedCredentials.set(provider, credentials);
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as credentialsRoutes };
