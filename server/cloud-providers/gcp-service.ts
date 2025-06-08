import fetch from 'node-fetch';

interface GCPDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'functions' | 'compute' | 'storage' | 'run';
  environmentVariables?: Record<string, string>;
}

interface GCPResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class GCPService {
  private credentials = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY || ''
  };

  constructor() {
    // GCP client initialization handled in deployment methods
  }

  async deployCloudFunction(spec: GCPDeploymentRequest): Promise<any> {
    if (!this.credentials.projectId) {
      throw new Error('GCP credentials not configured. Please set GOOGLE_CLOUD_PROJECT_ID and authentication.');
    }

    const functionName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const region = spec.region || 'us-central1';

    try {
      const accessToken = await this.getAccessToken();
      
      const functionUrl = `https://cloudfunctions.googleapis.com/v1/projects/${this.credentials.projectId}/locations/${region}/functions`;
      
      const functionConfig = {
        name: `projects/${this.credentials.projectId}/locations/${region}/functions/${functionName}`,
        description: `Deployed via Instantiate - ${spec.name}`,
        sourceArchiveUrl: await this.uploadSourceCode(spec),
        entryPoint: spec.codeType === 'javascript' ? 'handler' : 'main',
        runtime: spec.codeType === 'javascript' ? 'nodejs18' : 'python39',
        httpsTrigger: {},
        environmentVariables: spec.environmentVariables || {},
        labels: {
          'created-by': 'instantiate',
          'deployment-time': Date.now().toString()
        }
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(functionConfig)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to deploy Cloud Function: ${error}`);
      }

      const result: any = await response.json();
      
      return {
        id: result.name,
        name: functionName,
        type: 'cloud-function',
        region: region,
        status: 'deploying',
        url: result.httpsTrigger?.url || `https://${region}-${this.credentials.projectId}.cloudfunctions.net/${functionName}`,
        createdAt: new Date().toISOString(),
        logs: [`GCP Cloud Function ${functionName} deployment initiated`]
      };
    } catch (error: any) {
      throw new Error(`GCP Cloud Function deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<GCPResource[]> {
    if (!this.credentials.projectId) {
      return [];
    }

    const resources: GCPResource[] = [];

    try {
      const accessToken = await this.getAccessToken();

      const functionsUrl = `https://cloudfunctions.googleapis.com/v1/projects/${this.credentials.projectId}/locations/-/functions`;
      const functionsResponse = await fetch(functionsUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (functionsResponse.ok) {
        const functionsData: any = await functionsResponse.json();
        functionsData.functions?.forEach((func: any) => {
          if (func.labels?.['created-by'] === 'instantiate') {
            resources.push({
              id: func.name,
              name: func.name.split('/').pop() || '',
              type: 'cloud-function',
              region: func.name.split('/')[3],
              status: func.status?.toLowerCase() || 'unknown',
              url: func.httpsTrigger?.url,
              createdAt: func.updateTime || new Date().toISOString()
            });
          }
        });
      }

      const regions = ['us-central1', 'us-east1', 'europe-west1', 'asia-east1'];
      for (const region of regions) {
        const runUrl = `https://${region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${this.credentials.projectId}/services`;
        const runResponse = await fetch(runUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (runResponse.ok) {
          const runData: any = await runResponse.json();
          runData.items?.forEach((service: any) => {
            if (service.metadata?.labels?.['created-by'] === 'instantiate') {
              resources.push({
                id: service.metadata.name,
                name: service.metadata.name,
                type: 'cloud-run',
                region: region,
                status: service.status?.conditions?.[0]?.status === 'True' ? 'ready' : 'deploying',
                url: service.status?.url,
                createdAt: service.metadata.creationTimestamp || new Date().toISOString()
              });
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error listing GCP resources:', error.message);
    }

    return resources;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.credentials.clientEmail || !this.credentials.privateKey) {
      throw new Error('Google Cloud service account credentials not configured');
    }
    
    throw new Error('GCP authentication requires proper service account setup');
  }

  private async uploadSourceCode(spec: GCPDeploymentRequest): Promise<string> {
    return `gs://${this.credentials.projectId}-source/${spec.name}-${Date.now()}.zip`;
  }
}

export const gcpService = new GCPService();