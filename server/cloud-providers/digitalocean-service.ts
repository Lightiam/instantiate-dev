import fetch from 'node-fetch';

interface DigitalOceanDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'droplet' | 'app-platform' | 'kubernetes' | 'functions';
  environmentVariables?: Record<string, string>;
}

interface DigitalOceanResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class DigitalOceanService {
  private token: string;
  private apiUrl = 'https://api.digitalocean.com/v2';

  constructor() {
    this.token = process.env.DIGITALOCEAN_ACCESS_TOKEN || '';
  }

  async deployAppPlatform(spec: DigitalOceanDeploymentRequest): Promise<any> {
    if (!this.token) {
      throw new Error('DigitalOcean credentials not configured. Please set DIGITALOCEAN_ACCESS_TOKEN.');
    }

    const appName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      const appSpec = {
        name: appName,
        region: spec.region || 'nyc1',
        services: [{
          name: 'web',
          source_dir: '/',
          github: {
            repo: 'digitalocean/sample-nodejs',
            branch: 'main'
          },
          run_command: spec.codeType === 'javascript' ? 'npm start' : 'python app.py',
          environment_slug: spec.codeType === 'javascript' ? 'node-js' : 'python',
          instance_count: 1,
          instance_size_slug: 'basic-xxs',
          http_port: 8080,
          envs: Object.entries(spec.environmentVariables || {}).map(([key, value]) => ({
            key,
            value,
            scope: 'RUN_AND_BUILD_TIME'
          }))
        }],
        static_sites: spec.codeType === 'html' ? [{
          name: 'static',
          source_dir: '/',
          index_document: 'index.html',
          output_dir: '/'
        }] : undefined
      };

      const response = await fetch(`${this.apiUrl}/apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spec: appSpec })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create app: ${error}`);
      }

      const result: any = await response.json();
      
      return {
        id: result.app.id,
        name: appName,
        type: 'app-platform',
        region: spec.region,
        status: 'deploying',
        url: result.app.live_url || `https://${appName}.ondigitalocean.app`,
        createdAt: new Date().toISOString(),
        logs: [`DigitalOcean App Platform ${appName} deployment initiated`]
      };
    } catch (error: any) {
      throw new Error(`DigitalOcean App Platform deployment failed: ${error.message}`);
    }
  }

  async deployDroplet(spec: DigitalOceanDeploymentRequest): Promise<any> {
    if (!this.client) {
      throw new Error('DigitalOcean credentials not configured.');
    }

    const dropletName = `${spec.name}-${Date.now()}`.toLowerCase();

    try {
      const userData = this.createUserData(spec);
      
      const dropletConfig = {
        name: dropletName,
        region: spec.region || 'nyc1',
        size: 's-1vcpu-1gb', // $5/month droplet
        image: 'ubuntu-20-04-x64',
        ssh_keys: [], // Add SSH key IDs if available
        backups: false,
        ipv6: true,
        user_data: userData,
        monitoring: true,
        tags: ['instantiate', 'auto-deployed'],
        vpc_uuid: null
      };

      const response = await fetch(`${this.apiUrl}/droplets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dropletConfig)
      });

      if (!response.ok) {
        throw new Error(`DigitalOcean API error: ${response.status}`);
      }

      const result: any = await response.json();
      
      return {
        id: result.droplet.id.toString(),
        name: dropletName,
        type: 'droplet',
        region: spec.region,
        status: 'new',
        url: `https://cloud.digitalocean.com/droplets/${result.droplet.id}`,
        createdAt: new Date().toISOString(),
        logs: [`DigitalOcean Droplet ${dropletName} creation initiated`]
      };
    } catch (error: any) {
      throw new Error(`DigitalOcean Droplet deployment failed: ${error.message}`);
    }
  }

  async deployFunction(spec: DigitalOceanDeploymentRequest): Promise<any> {
    if (!this.token) {
      throw new Error('DigitalOcean credentials not configured.');
    }

    const functionName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const namespaceName = `instantiate-${Date.now()}`;

    try {
      // Create namespace
      const namespaceResponse = await fetch(`${this.apiUrl}/functions/namespaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label: namespaceName,
          region: spec.region || 'nyc1'
        })
      });

      if (!namespaceResponse.ok) {
        throw new Error(`Failed to create namespace: ${namespaceResponse.statusText}`);
      }

      const namespace: any = await namespaceResponse.json();
      
      // Create function package
      const functionCode = this.createFunctionCode(spec);
      const runtime = spec.codeType === 'javascript' ? 'nodejs:18' : 'python:3.9';

      const functionResponse = await fetch(`${this.apiUrl}/functions/namespaces/${namespace.namespace.label}/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: functionName,
          annotations: {
            'web-export': true,
            'created-by': 'instantiate'
          },
          parameters: Object.entries(spec.environmentVariables || {}).map(([key, value]) => ({
            key,
            value
          })),
          actions: [{
            name: 'main',
            exec: {
              kind: runtime,
              code: functionCode
            }
          }]
        })
      });

      if (!functionResponse.ok) {
        const error = await functionResponse.text();
        throw new Error(`Failed to create function: ${error}`);
      }

      const result: any = await functionResponse.json();
      
      return {
        id: `${namespace.namespace.label}/${functionName}`,
        name: functionName,
        type: 'function',
        region: spec.region,
        status: 'deployed',
        url: `https://faas-${spec.region}.doserverless.co/api/v1/web/${namespace.namespace.label}/${functionName}/main`,
        createdAt: new Date().toISOString(),
        logs: [`DigitalOcean Function ${functionName} deployed successfully`]
      };
    } catch (error: any) {
      throw new Error(`DigitalOcean Function deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<DigitalOceanResource[]> {
    if (!this.token) {
      return [];
    }

    const resources: DigitalOceanResource[] = [];

    try {
      // List App Platform apps
      const appsResponse = await fetch(`${this.apiUrl}/apps`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (appsResponse.ok) {
        const apps: any = await appsResponse.json();
        
        apps.apps?.forEach((app: any) => {
          if (app.spec?.name?.includes('instantiate') || app.spec?.name?.includes('deploy')) {
            resources.push({
              id: app.id,
              name: app.spec.name,
              type: 'app-platform',
              region: app.spec.region || 'nyc1',
              status: app.phase?.toLowerCase() || 'unknown',
              url: app.live_url,
              createdAt: app.created_at || new Date().toISOString()
            });
          }
        });
      }

      // List Droplets
      const dropletsResponse = await fetch(`${this.apiUrl}/droplets`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (dropletsResponse.ok) {
        const droplets: any = await dropletsResponse.json();
        
        droplets.droplets?.forEach((droplet: any) => {
          if (droplet.tags?.includes('instantiate')) {
            resources.push({
              id: droplet.id.toString(),
              name: droplet.name,
              type: 'droplet',
              region: droplet.region.slug,
              status: droplet.status,
              url: `http://${droplet.networks?.v4?.[0]?.ip_address}`,
              createdAt: droplet.created_at
            });
          }
        });
      }

      // List Functions
      const namespacesResponse = await fetch(`${this.apiUrl}/functions/namespaces`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (namespacesResponse.ok) {
        const namespaces: any = await namespacesResponse.json();
        
        for (const namespace of namespaces.namespaces || []) {
          if (namespace.label.includes('instantiate')) {
            const packagesResponse = await fetch(`${this.apiUrl}/functions/namespaces/${namespace.label}/packages`, {
              headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (packagesResponse.ok) {
              const packages: any = await packagesResponse.json();
              
              packages.packages?.forEach((pkg: any) => {
                if (pkg.annotations?.['created-by'] === 'instantiate') {
                  resources.push({
                    id: `${namespace.label}/${pkg.name}`,
                    name: pkg.name,
                    type: 'function',
                    region: namespace.region,
                    status: 'active',
                    createdAt: pkg.updated || new Date().toISOString()
                  });
                }
              });
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error listing DigitalOcean resources:', error.message);
    }

    return resources;
  }

  async getResourceStatus(resourceId: string, resourceType: string): Promise<any> {
    if (!this.token) {
      throw new Error('DigitalOcean credentials not configured.');
    }

    try {
      if (resourceType === 'app-platform') {
        const response = await fetch(`${this.apiUrl}/apps/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: data.app.phase?.toLowerCase(),
            liveUrl: data.app.live_url,
            region: data.app.spec.region,
            updatedAt: data.app.updated_at
          };
        }
      } else if (resourceType === 'droplet') {
        const response = await fetch(`${this.apiUrl}/droplets/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: data.droplet.status,
            ipAddress: data.droplet.networks?.v4?.[0]?.ip_address,
            memory: data.droplet.memory,
            vcpus: data.droplet.vcpus
          };
        }
      } else if (resourceType === 'function') {
        const [namespace, packageName] = resourceId.split('/');
        const response = await fetch(`${this.apiUrl}/functions/namespaces/${namespace}/packages/${packageName}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (response.ok) {
          const data: any = await response.json();
          return {
            status: 'active',
            updated: data.package.updated,
            actions: data.package.actions?.length || 0
          };
        }
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private createUserData(spec: DigitalOceanDeploymentRequest): string {
    return `#!/bin/bash
apt-get update
apt-get install -y nginx

# Create simple web server
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>${spec.name} - DigitalOcean</title></head>
<body>
<h1>DigitalOcean Deployment: ${spec.name}</h1>
<p>Deployed via Instantiate</p>
<pre>${spec.code}</pre>
</body>
</html>
EOF

systemctl start nginx
systemctl enable nginx

# Configure firewall
ufw allow 'Nginx Full'
ufw --force enable
`;
  }

  private createFunctionCode(spec: DigitalOceanDeploymentRequest): string {
    if (spec.codeType === 'javascript') {
      return spec.code.includes('function main') ? spec.code : 
        `function main(args) {
          ${spec.code}
          return { body: { message: 'Success from ${spec.name}' } };
        }`;
    } else {
      return spec.code.includes('def main') ? spec.code :
        `def main(args):
          ${spec.code.split('\n').map(line => '    ' + line).join('\n')}
          return {'body': {'message': 'Success from ${spec.name}'}}`;
    }
  }
}

export const digitalOceanService = new DigitalOceanService();