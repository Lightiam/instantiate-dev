import { awsService } from './aws-service';
import { gcpService } from './gcp-service';
import { alibabaCloudService } from './alibaba-service';
import { ibmCloudService } from './ibm-service';
import { oracleCloudService } from './oracle-service';
import { digitalOceanService } from './digitalocean-service';
import { linodeService } from './linode-service';
import { huaweiCloudService } from './huawei-service';
import { tencentCloudService } from './tencent-service';
import { getAzureService } from '../azure-service';
import { netlifyDeploymentService } from '../netlify-deployment-service';

interface UnifiedDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  provider: CloudProvider;
  region: string;
  service: string;
  environmentVariables?: Record<string, string>;
}

type CloudProvider = 
  | 'aws' 
  | 'gcp' 
  | 'azure' 
  | 'alibaba' 
  | 'ibm' 
  | 'oracle' 
  | 'digitalocean' 
  | 'linode' 
  | 'huawei' 
  | 'tencent' 
  | 'netlify';

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: CloudProvider;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
  lastChecked: string;
}

interface ProviderStatus {
  provider: CloudProvider;
  status: 'connected' | 'error' | 'not-configured';
  resourceCount: number;
  totalCost?: number;
  lastSync: string;
  error?: string;
}

interface DeploymentStats {
  totalResources: number;
  totalCost: number;
  providerDistribution: Record<CloudProvider, number>;
  statusDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
}

export class MultiCloudManager {
  private providers = {
    aws: awsService,
    gcp: gcpService,
    azure: getAzureService(),
    alibaba: alibabaCloudService,
    ibm: ibmCloudService,
    oracle: oracleCloudService,
    digitalocean: digitalOceanService,
    linode: linodeService,
    huawei: huaweiCloudService,
    tencent: tencentCloudService,
    netlify: netlifyDeploymentService
  };

  private resourceCache = new Map<CloudProvider, CloudResource[]>();
  private lastSyncTime = new Map<CloudProvider, Date>();

  async deployToProvider(request: UnifiedDeploymentRequest): Promise<any> {
    const provider = this.providers[request.provider];
    if (!provider) {
      throw new Error(`Unsupported cloud provider: ${request.provider}`);
    }

    try {
      let result;

      switch (request.provider) {
        case 'aws':
          if (request.service === 'lambda') {
            result = await provider.deployLambda(request);
          } else if (request.service === 's3') {
            result = await provider.deployS3Website(request);
          }
          break;

        case 'gcp':
          if (request.service === 'functions') {
            result = await provider.deployCloudFunction(request);
          } else if (request.service === 'run') {
            result = await provider.deployCloudRun(request);
          }
          break;

        case 'azure':
          result = await provider.deployToAzure({
            name: request.name,
            code: request.code,
            codeType: request.codeType,
            resourceGroup: `instantiate-${request.name}`,
            location: request.region
          });
          break;

        case 'alibaba':
          if (request.service === 'function-compute') {
            result = await provider.deployFunctionCompute(request);
          } else if (request.service === 'oss') {
            result = await provider.deployOSS(request);
          }
          break;

        case 'ibm':
          if (request.service === 'cloud-functions') {
            result = await provider.deployCloudFunction(request);
          } else if (request.service === 'code-engine') {
            result = await provider.deployCodeEngine(request);
          }
          break;

        case 'oracle':
          if (request.service === 'functions') {
            result = await provider.deployFunction(request);
          } else if (request.service === 'compute') {
            result = await provider.deployComputeInstance(request);
          }
          break;

        case 'digitalocean':
          if (request.service === 'app-platform') {
            result = await provider.deployAppPlatform(request);
          } else if (request.service === 'droplet') {
            result = await provider.deployDroplet(request);
          } else if (request.service === 'functions') {
            result = await provider.deployFunction(request);
          }
          break;

        case 'linode':
          if (request.service === 'linode') {
            result = await provider.deployLinode(request);
          } else if (request.service === 'object-storage') {
            result = await provider.deployObjectStorage(request);
          }
          break;

        case 'huawei':
          if (request.service === 'function-graph') {
            result = await provider.deployFunctionGraph(request);
          } else if (request.service === 'ecs') {
            result = await provider.deployECS(request);
          } else if (request.service === 'obs') {
            result = await provider.deployOBS(request);
          }
          break;

        case 'tencent':
          if (request.service === 'scf') {
            result = await provider.deploySCF(request);
          } else if (request.service === 'cvm') {
            result = await provider.deployCVM(request);
          } else if (request.service === 'cos') {
            result = await provider.deployCOS(request);
          }
          break;

        case 'netlify':
          result = await provider.deployCode({
            name: request.name,
            code: request.code,
            codeType: request.codeType
          });
          break;

        default:
          throw new Error(`Service ${request.service} not supported for provider ${request.provider}`);
      }

      // Add provider information to result
      return {
        ...result,
        provider: request.provider,
        deploymentType: 'unified'
      };
    } catch (error: any) {
      throw new Error(`${request.provider.toUpperCase()} deployment failed: ${error.message}`);
    }
  }

  async getAllResources(forceRefresh: boolean = false): Promise<CloudResource[]> {
    const allResources: CloudResource[] = [];
    const promises: Promise<void>[] = [];

    for (const [providerName, provider] of Object.entries(this.providers)) {
      const providerKey = providerName as CloudProvider;
      
      promises.push(this.getProviderResources(providerKey, provider, forceRefresh));
    }

    await Promise.allSettled(promises);

    // Combine all cached resources
    for (const [provider, resources] of this.resourceCache.entries()) {
      resources.forEach(resource => {
        allResources.push({
          ...resource,
          provider,
          lastChecked: new Date().toISOString()
        });
      });
    }

    return allResources.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private async getProviderResources(
    providerKey: CloudProvider, 
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
      let resources = [];
      
      if (provider.listResources) {
        resources = await provider.listResources();
      } else if (provider.listDeployments) {
        resources = await provider.listDeployments();
      } else if (provider.listSites) {
        resources = await provider.listSites();
      }

      this.resourceCache.set(providerKey, resources);
      this.lastSyncTime.set(providerKey, new Date());
    } catch (error) {
      console.error(`Failed to fetch resources from ${providerKey}:`, error);
      // Keep existing cache if available
    }
  }

  async getProviderStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    for (const [providerName] of Object.entries(this.providers)) {
      const provider = providerName as CloudProvider;
      const resources = this.resourceCache.get(provider) || [];
      const lastSync = this.lastSyncTime.get(provider);

      let status: 'connected' | 'error' | 'not-configured' = 'not-configured';
      let error: string | undefined;

      try {
        // Check if provider is configured by attempting to list resources
        await this.getProviderResources(provider, this.providers[provider], false);
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
        provider,
        status,
        resourceCount: resources.length,
        totalCost: totalCost > 0 ? totalCost : undefined,
        lastSync: lastSync?.toISOString() || 'Never',
        error
      });
    }

    return statuses;
  }

  async getDeploymentStats(): Promise<DeploymentStats> {
    const allResources = await this.getAllResources();

    const providerDistribution: Record<CloudProvider, number> = {
      aws: 0, gcp: 0, azure: 0, alibaba: 0, ibm: 0,
      oracle: 0, digitalocean: 0, linode: 0, huawei: 0,
      tencent: 0, netlify: 0
    };

    const statusDistribution: Record<string, number> = {};
    const regionDistribution: Record<string, number> = {};
    let totalCost = 0;

    allResources.forEach(resource => {
      // Provider distribution
      providerDistribution[resource.provider]++;

      // Status distribution
      statusDistribution[resource.status] = (statusDistribution[resource.status] || 0) + 1;

      // Region distribution
      regionDistribution[resource.region] = (regionDistribution[resource.region] || 0) + 1;

      // Total cost
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

  async getResourceStatus(resourceId: string, provider: CloudProvider, resourceType: string): Promise<any> {
    const providerService = this.providers[provider];
    if (!providerService || !providerService.getResourceStatus) {
      throw new Error(`Provider ${provider} does not support status checking`);
    }

    try {
      return await providerService.getResourceStatus(resourceId, resourceType);
    } catch (error: any) {
      throw new Error(`Failed to get status for ${provider} resource: ${error.message}`);
    }
  }

  async deleteResource(resourceId: string, provider: CloudProvider, resourceType: string): Promise<boolean> {
    const providerService = this.providers[provider];
    if (!providerService || !providerService.deleteResource) {
      throw new Error(`Provider ${provider} does not support resource deletion`);
    }

    try {
      await providerService.deleteResource(resourceId, resourceType);
      
      // Remove from cache
      const cachedResources = this.resourceCache.get(provider) || [];
      const updatedResources = cachedResources.filter(r => r.id !== resourceId);
      this.resourceCache.set(provider, updatedResources);

      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete ${provider} resource: ${error.message}`);
    }
  }

  getProviderCapabilities(provider: CloudProvider): string[] {
    const capabilities: Record<CloudProvider, string[]> = {
      aws: ['lambda', 's3', 'ec2', 'ecs'],
      gcp: ['functions', 'compute', 'storage', 'run'],
      azure: ['functions', 'app-service', 'container-instances', 'static-apps'],
      alibaba: ['function-compute', 'ecs', 'oss', 'container-service'],
      ibm: ['cloud-functions', 'kubernetes', 'app-connect', 'code-engine'],
      oracle: ['functions', 'compute', 'container-instances', 'api-gateway'],
      digitalocean: ['droplet', 'app-platform', 'kubernetes', 'functions'],
      linode: ['linode', 'kubernetes', 'object-storage', 'nodebalancer'],
      huawei: ['function-graph', 'ecs', 'obs', 'cce'],
      tencent: ['scf', 'cvm', 'cos', 'tke'],
      netlify: ['static-sites', 'functions', 'edge-functions']
    };

    return capabilities[provider] || [];
  }

  getSupportedRegions(provider: CloudProvider): string[] {
    const regions: Record<CloudProvider, string[]> = {
      aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
      gcp: ['us-central1', 'us-east1', 'europe-west1', 'asia-east1'],
      azure: ['East US', 'West US 2', 'West Europe', 'Southeast Asia'],
      alibaba: ['cn-hangzhou', 'cn-beijing', 'cn-shanghai', 'cn-shenzhen'],
      ibm: ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok'],
      oracle: ['us-ashburn-1', 'us-phoenix-1', 'eu-frankfurt-1', 'ap-tokyo-1'],
      digitalocean: ['nyc1', 'nyc3', 'ams3', 'sgp1', 'lon1', 'fra1'],
      linode: ['us-east', 'us-west', 'eu-west', 'ap-south'],
      huawei: ['cn-north-4', 'cn-north-1', 'cn-east-2', 'cn-south-1'],
      tencent: ['ap-guangzhou', 'ap-shanghai', 'ap-beijing', 'ap-singapore'],
      netlify: ['global']
    };

    return regions[provider] || [];
  }

  async syncAllProviders(): Promise<void> {
    console.log('Starting multi-cloud resource synchronization...');
    
    const promises = Object.keys(this.providers).map(async (providerName) => {
      const provider = providerName as CloudProvider;
      try {
        await this.getProviderResources(provider, this.providers[provider], true);
        console.log(`✓ Synced ${provider}`);
      } catch (error) {
        console.log(`✗ Failed to sync ${provider}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('Multi-cloud synchronization completed');
  }
}

export const multiCloudManager = new MultiCloudManager();