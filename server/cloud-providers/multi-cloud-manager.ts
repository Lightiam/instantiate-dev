
import { getAzureService } from '../azure-service';

interface UnifiedDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  provider: 'azure';
  region: string;
  service: string;
  environmentVariables?: Record<string, string>;
}

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: 'azure';
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
  lastChecked: string;
}

interface ProviderStatus {
  provider: 'azure';
  status: 'connected' | 'error' | 'not-configured';
  resourceCount: number;
  totalCost?: number;
  lastSync: string;
  error?: string;
}

interface DeploymentStats {
  totalResources: number;
  totalCost: number;
  providerDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
}

export class MultiCloudManager {
  private providers = {
    azure: getAzureService()
  };

  private resourceCache = new Map<'azure', CloudResource[]>();
  private lastSyncTime = new Map<'azure', Date>();

  async deployToProvider(request: UnifiedDeploymentRequest): Promise<any> {
    if (request.provider !== 'azure') {
      throw new Error(`Unsupported cloud provider: ${request.provider}`);
    }

    const provider = this.providers.azure;

    try {
      let result;

      if (request.service === 'resource_group') {
        result = await provider.createResourceGroup(
          request.name,
          request.region,
          { CreatedBy: 'Instantiate' }
        );
      } else if (request.service === 'container') {
        result = await provider.deployContainerInstance({
          name: request.name,
          resourceGroup: `${request.name}-rg`,
          location: request.region
        });
      } else {
        throw new Error(`Service ${request.service} not supported for Azure`);
      }

      return {
        ...result,
        provider: request.provider,
        deploymentType: 'unified'
      };
    } catch (error: any) {
      throw new Error(`Azure deployment failed: ${error.message}`);
    }
  }

  async getAllResources(forceRefresh: boolean = false): Promise<CloudResource[]> {
    const allResources: CloudResource[] = [];
    
    try {
      await this.getProviderResources('azure', this.providers.azure, forceRefresh);
      
      const resources = this.resourceCache.get('azure') || [];
      resources.forEach(resource => {
        allResources.push({
          ...resource,
          provider: 'azure',
          lastChecked: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error fetching Azure resources:', error);
    }

    return allResources.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private async getProviderResources(
    providerKey: 'azure', 
    provider: any, 
    forceRefresh: boolean
  ): Promise<void> {
    const lastSync = this.lastSyncTime.get(providerKey);
    const cacheAge = lastSync ? Date.now() - lastSync.getTime() : Infinity;
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && cacheAge < cacheExpiry && this.resourceCache.has(providerKey)) {
      return;
    }

    try {
      // For now, return empty array as Azure service doesn't have listResources method
      const resources: CloudResource[] = [];
      this.resourceCache.set(providerKey, resources);
      this.lastSyncTime.set(providerKey, new Date());
    } catch (error) {
      console.error(`Failed to fetch resources from ${providerKey}:`, error);
    }
  }

  async getProviderStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];
    const resources = this.resourceCache.get('azure') || [];
    const lastSync = this.lastSyncTime.get('azure');

    let status: 'connected' | 'error' | 'not-configured' = 'not-configured';
    let error: string | undefined;

    try {
      await this.getProviderResources('azure', this.providers.azure, false);
      status = 'connected';
    } catch (err: any) {
      if (err.message.includes('credentials') || err.message.includes('not configured')) {
        status = 'not-configured';
      } else {
        status = 'error';
        error = err.message;
      }
    }

    const totalCost = resources.reduce((sum, resource) => sum + (resource.cost || 0), 0);

    statuses.push({
      provider: 'azure',
      status,
      resourceCount: resources.length,
      totalCost: totalCost > 0 ? totalCost : undefined,
      lastSync: lastSync?.toISOString() || 'Never',
      error
    });

    return statuses;
  }

  async getDeploymentStats(): Promise<DeploymentStats> {
    const allResources = await this.getAllResources();

    const providerDistribution: Record<string, number> = { azure: 0 };
    const statusDistribution: Record<string, number> = {};
    const regionDistribution: Record<string, number> = {};
    let totalCost = 0;

    allResources.forEach(resource => {
      providerDistribution.azure++;
      statusDistribution[resource.status] = (statusDistribution[resource.status] || 0) + 1;
      regionDistribution[resource.region] = (regionDistribution[resource.region] || 0) + 1;
      totalCost += resource.cost || 0;
    });

    return {
      totalResources: allResources.length,
      totalCost,
      providerDistribution,
      statusDistribution,
      regionDistribution
    };
  }

  getProviderCapabilities(provider: 'azure'): string[] {
    const capabilities: Record<'azure', string[]> = {
      azure: ['resource-group', 'container-instances', 'app-service', 'static-apps']
    };

    return capabilities[provider] || [];
  }

  getSupportedRegions(provider: 'azure'): string[] {
    const regions: Record<'azure', string[]> = {
      azure: ['East US', 'West US 2', 'West Europe', 'Southeast Asia']
    };

    return regions[provider] || [];
  }

  async syncAllProviders(): Promise<void> {
    console.log('Starting Azure resource synchronization...');
    
    try {
      await this.getProviderResources('azure', this.providers.azure, true);
      console.log('✓ Synced Azure');
    } catch (error) {
      console.log('✗ Failed to sync Azure:', error);
    }

    console.log('Azure synchronization completed');
  }
}

export const multiCloudManager = new MultiCloudManager();
