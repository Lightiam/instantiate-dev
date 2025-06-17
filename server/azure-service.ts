
import { v4 as uuidv4 } from 'uuid';
import { ClientSecretCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ContainerInstanceManagementClient } from '@azure/arm-containerinstance';

interface AzureCredentials {
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface AzureDeploymentResult {
  success: boolean;
  deploymentId?: string;
  resourceGroup?: string;
  location?: string;
  error?: string;
  resources?: any[];
  ipAddress?: string;
}

export class AzureService {
  private credentials: AzureCredentials | null = null;

  setCredentials(credentials: AzureCredentials) {
    this.credentials = credentials;
  }

  async testConnection(credentials: AzureCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Azure connection with credentials');
      
      const credential = new ClientSecretCredential(
        credentials.tenantId,
        credentials.clientId,
        credentials.clientSecret
      );
      
      const client = new ResourceManagementClient(credential, credentials.subscriptionId);
      
      const resourceGroups = client.resourceGroups.list();
      await resourceGroups.next();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createResourceGroup(name: string, location: string, tags?: Record<string, string>): Promise<AzureDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('Azure credentials not configured');
      }

      console.log(`Creating resource group: ${name} in ${location}`);
      
      const credential = new ClientSecretCredential(
        this.credentials.tenantId,
        this.credentials.clientId,
        this.credentials.clientSecret
      );
      
      const client = new ResourceManagementClient(credential, this.credentials.subscriptionId);
      
      const result = await client.resourceGroups.createOrUpdate(name, {
        location: location,
        tags: tags
      });
      
      return {
        success: true,
        deploymentId: result.id || uuidv4(),
        resourceGroup: name,
        location: location,
        resources: [result]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deployContainerInstance(spec: any): Promise<AzureDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('Azure credentials not configured');
      }

      console.log(`Deploying container: ${spec.name}`);
      
      const credential = new ClientSecretCredential(
        this.credentials.tenantId,
        this.credentials.clientId,
        this.credentials.clientSecret
      );
      
      const containerClient = new ContainerInstanceManagementClient(credential, this.credentials.subscriptionId);
      
      const containerGroupSpec = {
        location: spec.location,
        containers: [{
          name: spec.name,
          image: spec.image || 'nginx:alpine',
          resources: {
            requests: {
              cpu: spec.cpu || 0.5,
              memoryInGB: spec.memory || 1.0
            }
          },
          ports: spec.ports ? spec.ports.map((port: number) => ({ port, protocol: 'TCP' })) : [{ port: 80, protocol: 'TCP' }]
        }],
        osType: 'Linux',
        ipAddress: {
          type: 'Public',
          ports: spec.ports ? spec.ports.map((port: number) => ({ port, protocol: 'TCP' })) : [{ port: 80, protocol: 'TCP' }]
        },
        environmentVariables: spec.environmentVariables ? Object.entries(spec.environmentVariables).map(([name, value]) => ({ name, value: String(value) })) : []
      };
      
      const result = await containerClient.containerGroups.beginCreateOrUpdateAndWait(
        spec.resourceGroup,
        spec.name,
        containerGroupSpec
      );
      
      return {
        success: true,
        deploymentId: result.id || uuidv4(),
        resourceGroup: spec.resourceGroup,
        location: spec.location,
        ipAddress: result.ipAddress?.ip,
        resources: [result]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const azureService = new AzureService();
export const getAzureService = () => azureService;
