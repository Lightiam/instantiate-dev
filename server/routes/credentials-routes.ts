import express from 'express';
import { multiCloudManager } from '../cloud-providers/multi-cloud-manager';
import crypto from 'crypto';

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

interface CredentialValidationResult {
  success: boolean;
  error?: string;
  details?: {
    provider: string;
    validatedAt: Date;
    permissions?: string[];
    regions?: string[];
  };
}

class SecureCredentialStore {
  private credentials: Map<string, string> = new Map();
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  setCredentials(provider: string, credentials: any): void {
    const credentialString = JSON.stringify(credentials);
    const encryptedCredentials = this.encrypt(credentialString);
    this.credentials.set(provider, encryptedCredentials);
    console.log(`Securely stored credentials for ${provider}`);
  }

  getCredentials(provider: string): any | null {
    const encryptedCredentials = this.credentials.get(provider);
    if (!encryptedCredentials) {
      return null;
    }
    
    try {
      const decryptedCredentials = this.decrypt(encryptedCredentials);
      return JSON.parse(decryptedCredentials);
    } catch (error) {
      console.error(`Failed to decrypt credentials for ${provider}:`, error);
      return null;
    }
  }

  hasCredentials(provider: string): boolean {
    return this.credentials.has(provider);
  }

  removeCredentials(provider: string): void {
    this.credentials.delete(provider);
    console.log(`Removed credentials for ${provider}`);
  }
}

const credentialStore = new SecureCredentialStore();
let storedEnvVars: EnvironmentVariable[] = [
  { id: "1", key: "AWS_ACCESS_KEY_ID", value: "", isSecret: true, provider: "aws" },
  { id: "2", key: "AWS_SECRET_ACCESS_KEY", value: "", isSecret: true, provider: "aws" },
  { id: "3", key: "AWS_DEFAULT_REGION", value: "us-east-1", isSecret: false, provider: "aws" },
  { id: "4", key: "AZURE_CLIENT_ID", value: "", isSecret: true, provider: "azure" },
  { id: "5", key: "AZURE_CLIENT_SECRET", value: "", isSecret: true, provider: "azure" },
  { id: "6", key: "AZURE_TENANT_ID", value: "", isSecret: true, provider: "azure" },
  { id: "7", key: "AZURE_SUBSCRIPTION_ID", value: "", isSecret: true, provider: "azure" },
  { id: "8", key: "GOOGLE_APPLICATION_CREDENTIALS", value: "", isSecret: true, provider: "gcp" },
  { id: "9", key: "GCP_PROJECT_ID", value: "", isSecret: false, provider: "gcp" },
];

async function validateAWSCredentials(credentials: any): Promise<CredentialValidationResult> {
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      return {
        success: false,
        error: 'AWS credentials must include accessKeyId and secretAccessKey'
      };
    }

    if (credentials.accessKeyId.length < 16 || credentials.secretAccessKey.length < 28) {
      return {
        success: false,
        error: 'AWS credentials appear to be invalid (incorrect length)'
      };
    }

    const result = await multiCloudManager.testProviderConnection('aws', credentials);
    
    if (result.success) {
      return {
        success: true,
        details: {
          provider: 'aws',
          validatedAt: new Date(),
          permissions: ['basic_access'],
          regions: [credentials.region || 'us-east-1']
        }
      };
    } else {
      return {
        success: false,
        error: result.error || 'AWS credential validation failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `AWS validation error: ${error.message}`
    };
  }
}

async function validateAzureCredentials(credentials: any): Promise<CredentialValidationResult> {
  try {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.tenantId) {
      return {
        success: false,
        error: 'Azure credentials must include clientId, clientSecret, and tenantId'
      };
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(credentials.clientId) || !guidRegex.test(credentials.tenantId)) {
      return {
        success: false,
        error: 'Azure clientId and tenantId must be valid GUIDs'
      };
    }

    const result = await multiCloudManager.testProviderConnection('azure', credentials);
    
    if (result.success) {
      return {
        success: true,
        details: {
          provider: 'azure',
          validatedAt: new Date(),
          permissions: ['basic_access'],
          regions: ['eastus', 'westus2']
        }
      };
    } else {
      return {
        success: false,
        error: result.error || 'Azure credential validation failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Azure validation error: ${error.message}`
    };
  }
}

async function validateGCPCredentials(credentials: any): Promise<CredentialValidationResult> {
  try {
    if (!credentials.projectId) {
      return {
        success: false,
        error: 'GCP credentials must include projectId'
      };
    }

    const projectIdRegex = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
    if (!projectIdRegex.test(credentials.projectId)) {
      return {
        success: false,
        error: 'GCP projectId format is invalid'
      };
    }

    const result = await multiCloudManager.testProviderConnection('gcp', credentials);
    
    if (result.success) {
      return {
        success: true,
        details: {
          provider: 'gcp',
          validatedAt: new Date(),
          permissions: ['basic_access'],
          regions: ['us-central1', 'us-west1']
        }
      };
    } else {
      return {
        success: false,
        error: result.error || 'GCP credential validation failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `GCP validation error: ${error.message}`
    };
  }
}

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
        credentialStore.setCredentials(provider, credentials);
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
    
    const credentials = credentialStore.getCredentials(provider);
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: `No credentials found for ${provider}`
      });
    }
    
    let validationResult: CredentialValidationResult;
    
    switch (provider) {
      case 'aws':
        validationResult = await validateAWSCredentials(credentials);
        break;
      case 'azure':
        validationResult = await validateAzureCredentials(credentials);
        break;
      case 'gcp':
        validationResult = await validateGCPCredentials(credentials);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported provider'
        });
    }
    
    res.json(validationResult);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/validate-credentials', async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be aws, azure, or gcp'
      });
    }
    
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: 'Credentials are required'
      });
    }
    
    let validationResult: CredentialValidationResult;
    
    switch (provider) {
      case 'aws':
        validationResult = await validateAWSCredentials(credentials);
        break;
      case 'azure':
        validationResult = await validateAzureCredentials(credentials);
        break;
      case 'gcp':
        validationResult = await validateGCPCredentials(credentials);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported provider'
        });
    }
    
    if (validationResult.success) {
      credentialStore.setCredentials(provider, credentials);
      await multiCloudManager.setProviderCredentials(provider as any, credentials);
      console.log(`Successfully validated and stored credentials for ${provider}`);
    }
    
    res.json(validationResult);
  } catch (error: any) {
    console.error(`Credential validation error for ${req.body.provider}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/credentials/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be aws, azure, or gcp'
      });
    }
    
    credentialStore.removeCredentials(provider);
    
    res.json({
      success: true,
      message: `Credentials for ${provider} have been removed`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/credentials/status', async (req, res) => {
  try {
    const status = {
      aws: credentialStore.hasCredentials('aws'),
      azure: credentialStore.hasCredentials('azure'),
      gcp: credentialStore.hasCredentials('gcp')
    };
    
    res.json({
      success: true,
      credentialStatus: status
    });
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
      credentialStore.setCredentials(provider, credentials);
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
