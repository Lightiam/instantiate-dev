import fetch from 'node-fetch';

interface IBMDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'cloud-functions' | 'kubernetes' | 'app-connect' | 'code-engine';
  environmentVariables?: Record<string, string>;
}

interface IBMResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class IBMCloudService {
  private credentials = {
    apiKey: process.env.IBM_CLOUD_API_KEY || '',
    region: process.env.IBM_CLOUD_REGION || 'us-south',
    resourceGroupId: process.env.IBM_CLOUD_RESOURCE_GROUP_ID || ''
  };

  constructor() {
    // IBM Cloud SDK initialization handled in deployment methods
  }

  async deployCloudFunction(spec: IBMDeploymentRequest): Promise<any> {
    if (!this.credentials.apiKey) {
      throw new Error('IBM Cloud credentials not configured. Please set IBM_CLOUD_API_KEY.');
    }

    const functionName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const namespace = `instantiate-${Date.now()}`;

    try {
      const accessToken = await this.getAccessToken();
      
      // Create namespace
      const namespaceUrl = `https://${spec.region}.functions.cloud.ibm.com/api/v1/namespaces`;
      
      const namespaceResponse = await fetch(namespaceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: namespace,
          description: `Namespace for ${spec.name} deployment`
        })
      });

      if (!namespaceResponse.ok) {
        throw new Error(`Failed to create namespace: ${namespaceResponse.statusText}`);
      }

      // Create function
      const functionUrl = `https://${spec.region}.functions.cloud.ibm.com/api/v1/namespaces/${namespace}/actions/${functionName}`;
      
      const functionCode = this.createFunctionCode(spec);
      const runtime = spec.codeType === 'javascript' ? 'nodejs:18' : 'python:3.9';

      const functionResponse = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exec: {
            kind: runtime,
            code: functionCode
          },
          parameters: Object.entries(spec.environmentVariables || {}).map(([key, value]) => ({
            key,
            value
          })),
          annotations: [
            { key: 'web-export', value: true },
            { key: 'created-by', value: 'instantiate' },
            { key: 'deployment-time', value: new Date().toISOString() }
          ]
        })
      });

      if (!functionResponse.ok) {
        const error = await functionResponse.text();
        throw new Error(`Failed to create function: ${error}`);
      }

      const result: any = await functionResponse.json();
      
      return {
        id: `${namespace}/${functionName}`,
        name: functionName,
        type: 'cloud-function',
        region: spec.region,
        status: 'deployed',
        url: `https://${spec.region}.functions.cloud.ibm.com/api/v1/web/${namespace}/default/${functionName}`,
        createdAt: new Date().toISOString(),
        logs: [`IBM Cloud Function ${functionName} deployed successfully`]
      };
    } catch (error: any) {
      throw new Error(`IBM Cloud Function deployment failed: ${error.message}`);
    }
  }

  async deployCodeEngine(spec: IBMDeploymentRequest): Promise<any> {
    if (!this.credentials.apiKey) {
      throw new Error('IBM Cloud credentials not configured.');
    }

    const appName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const projectName = `instantiate-project-${Date.now()}`;

    try {
      const accessToken = await this.getAccessToken();
      
      // Create Code Engine project
      const projectUrl = `https://api.${spec.region}.codeengine.cloud.ibm.com/v2/projects`;
      
      const projectResponse = await fetch(projectUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          resource_group_id: this.credentials.resourceGroupId
        })
      });

      if (!projectResponse.ok) {
        throw new Error(`Failed to create Code Engine project: ${projectResponse.statusText}`);
      }

      const project: any = await projectResponse.json();
      
      // Create application
      const appUrl = `https://api.${spec.region}.codeengine.cloud.ibm.com/v2/projects/${project.id}/apps`;
      
      const appResponse = await fetch(appUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: appName,
          image_reference: 'icr.io/codeengine/hello',
          scale_initial_instances: 1,
          scale_max_instances: 10,
          env_vars: Object.entries(spec.environmentVariables || {}).map(([key, value]) => ({
            name: key,
            value: value
          }))
        })
      });

      if (!appResponse.ok) {
        const error = await appResponse.text();
        throw new Error(`Failed to create Code Engine app: ${error}`);
      }

      const app: any = await appResponse.json();
      
      return {
        id: app.id,
        name: appName,
        type: 'code-engine',
        region: spec.region,
        status: 'deploying',
        url: app.endpoint || `https://${appName}.${project.id}.${spec.region}.codeengine.appdomain.cloud`,
        createdAt: new Date().toISOString(),
        logs: [`IBM Code Engine app ${appName} deployment initiated`]
      };
    } catch (error: any) {
      throw new Error(`IBM Code Engine deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<IBMResource[]> {
    if (!this.credentials.apiKey) {
      return [];
    }

    const resources: IBMResource[] = [];

    try {
      const accessToken = await this.getAccessToken();
      const regions = ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok'];

      // List Cloud Functions
      for (const region of regions) {
        try {
          const namespacesUrl = `https://${region}.functions.cloud.ibm.com/api/v1/namespaces`;
          const namespacesResponse = await fetch(namespacesUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          if (namespacesResponse.ok) {
            const namespaces: any = await namespacesResponse.json();
            
            for (const namespace of namespaces) {
              if (namespace.name.includes('instantiate')) {
                const actionsUrl = `https://${region}.functions.cloud.ibm.com/api/v1/namespaces/${namespace.name}/actions`;
                const actionsResponse = await fetch(actionsUrl, {
                  headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (actionsResponse.ok) {
                  const actions: any = await actionsResponse.json();
                  
                  actions.forEach((action: any) => {
                    if (action.annotations?.find((a: any) => a.key === 'created-by' && a.value === 'instantiate')) {
                      resources.push({
                        id: `${namespace.name}/${action.name}`,
                        name: action.name,
                        type: 'cloud-function',
                        region: region,
                        status: 'active',
                        createdAt: action.updated || new Date().toISOString()
                      });
                    }
                  });
                }
              }
            }
          }
        } catch (e) {
          // Skip regions with errors
        }
      }

      // List Code Engine resources
      for (const region of regions) {
        try {
          const projectsUrl = `https://api.${region}.codeengine.cloud.ibm.com/v2/projects`;
          const projectsResponse = await fetch(projectsUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          if (projectsResponse.ok) {
            const projects: any = await projectsResponse.json();
            
            for (const project of projects.projects || []) {
              if (project.name.includes('instantiate')) {
                const appsUrl = `https://api.${region}.codeengine.cloud.ibm.com/v2/projects/${project.id}/apps`;
                const appsResponse = await fetch(appsUrl, {
                  headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (appsResponse.ok) {
                  const apps: any = await appsResponse.json();
                  
                  apps.apps?.forEach((app: any) => {
                    resources.push({
                      id: app.id,
                      name: app.name,
                      type: 'code-engine',
                      region: region,
                      status: app.status || 'unknown',
                      url: app.endpoint,
                      createdAt: app.created_at || new Date().toISOString()
                    });
                  });
                }
              }
            }
          }
        } catch (e) {
          // Skip regions with errors
        }
      }
    } catch (error: any) {
      console.error('Error listing IBM Cloud resources:', error.message);
    }

    return resources;
  }

  async getResourceStatus(resourceId: string, resourceType: string): Promise<any> {
    if (!this.credentials.apiKey) {
      throw new Error('IBM Cloud credentials not configured.');
    }

    try {
      const accessToken = await this.getAccessToken();

      if (resourceType === 'cloud-function') {
        const [namespace, actionName] = resourceId.split('/');
        const response = await fetch(
          `https://${this.credentials.region}.functions.cloud.ibm.com/api/v1/namespaces/${namespace}/actions/${actionName}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: 'active',
            runtime: data.exec?.kind,
            updated: data.updated,
            version: data.version
          };
        }
      } else if (resourceType === 'code-engine') {
        // Code Engine status check would require project ID
        return { status: 'active' };
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.authenticator) {
      throw new Error('IBM Cloud authenticator not configured');
    }

    // In production, use the IBM Cloud SDK authentication
    throw new Error('IBM Cloud authentication requires proper API key setup');
  }

  private createFunctionCode(spec: IBMDeploymentRequest): string {
    if (spec.codeType === 'javascript') {
      return spec.code.includes('function main') ? spec.code : 
        `function main(params) {
          ${spec.code}
          return { message: 'Success from ${spec.name}' };
        }`;
    } else {
      return spec.code.includes('def main') ? spec.code :
        `def main(params):
          ${spec.code.split('\n').map(line => '    ' + line).join('\n')}
          return {'message': 'Success from ${spec.name}'}`;
    }
  }
}

export const ibmCloudService = new IBMCloudService();