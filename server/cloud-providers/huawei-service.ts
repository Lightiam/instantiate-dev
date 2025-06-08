import fetch from 'node-fetch';

interface HuaweiDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'function-graph' | 'ecs' | 'obs' | 'cce';
  environmentVariables?: Record<string, string>;
}

interface HuaweiResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class HuaweiCloudService {
  private credentials = {
    accessKey: process.env.HUAWEI_ACCESS_KEY || '',
    secretKey: process.env.HUAWEI_SECRET_KEY || '',
    projectId: process.env.HUAWEI_PROJECT_ID || '',
    region: process.env.HUAWEI_REGION || 'cn-north-4'
  };

  constructor() {
    // Huawei Cloud SDK initialization handled in deployment methods
  }

  async deployFunctionGraph(spec: HuaweiDeploymentRequest): Promise<any> {
    if (!this.credentials.accessKey) {
      throw new Error('Huawei Cloud credentials not configured. Please set HUAWEI_ACCESS_KEY and HUAWEI_SECRET_KEY.');
    }

    const functionName = `${spec.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const packageName = `instantiate-${spec.name}`;

    try {
      const functionCode = this.createFunctionCode(spec);
      const runtime = spec.codeType === 'javascript' ? 'Node.js14.18' : 'Python3.9';

      // Create function
      const createFunctionRequest = {
        function_name: functionName,
        package: packageName,
        runtime: runtime,
        handler: spec.codeType === 'javascript' ? 'index.handler' : 'index.handler',
        memory_size: 128,
        timeout: 30,
        code_type: 'inline',
        func_code: {
          file: Buffer.from(functionCode).toString('base64')
        },
        description: `Deployed via Instantiate - ${spec.name}`,
        enterprise_project_id: '0',
        environment_variables: spec.environmentVariables || {},
        user_data: JSON.stringify({
          createdBy: 'instantiate',
          deploymentTime: new Date().toISOString()
        })
      };

      const response = await this.makeRequest('POST', '/v2/fgs/functions', createFunctionRequest);
      
      return {
        id: response.func_urn,
        name: functionName,
        type: 'function-graph',
        region: spec.region,
        status: 'active',
        url: `https://console.huaweicloud.com/functiongraph/?region=${spec.region}#/serverless/dashboard`,
        createdAt: new Date().toISOString(),
        logs: [`Huawei FunctionGraph ${functionName} deployed successfully`]
      };
    } catch (error: any) {
      throw new Error(`Huawei Cloud FunctionGraph deployment failed: ${error.message}`);
    }
  }

  async deployECS(spec: HuaweiDeploymentRequest): Promise<any> {
    if (!this.credentials.accessKey) {
      throw new Error('Huawei Cloud credentials not configured.');
    }

    const serverName = `${spec.name}-${Date.now()}`.toLowerCase();

    try {
      const userData = this.createUserData(spec);

      // Create ECS instance
      const createServerRequest = {
        server: {
          name: serverName,
          imageRef: 'ed2c4c45-9d0a-44e9-9b9b-2570b4e7b50a', // Ubuntu 20.04
          flavorRef: 's6.small.1', // 1vCPU, 1GB RAM
          availability_zone: `${spec.region}a`,
          user_data: Buffer.from(userData).toString('base64'),
          metadata: {
            created_by: 'instantiate',
            deployment_time: new Date().toISOString()
          },
          tags: ['instantiate', 'auto-deployed']
        }
      };

      const response = await this.makeRequest('POST', '/v1/cloudservers', createServerRequest, 'ecs');
      
      return {
        id: response.job_id,
        name: serverName,
        type: 'ecs',
        region: spec.region,
        status: 'creating',
        url: `https://console.huaweicloud.com/ecm/?region=${spec.region}#/ecs/manager/vmList`,
        createdAt: new Date().toISOString(),
        logs: [`Huawei ECS instance ${serverName} creation initiated`]
      };
    } catch (error: any) {
      throw new Error(`Huawei Cloud ECS deployment failed: ${error.message}`);
    }
  }

  async deployOBS(spec: HuaweiDeploymentRequest): Promise<any> {
    if (!this.credentials.accessKey) {
      throw new Error('Huawei Cloud credentials not configured.');
    }

    const bucketName = `${spec.name}-${Date.now()}`.toLowerCase();

    try {
      // Create OBS bucket
      const createBucketRequest = {
        bucket: bucketName,
        location: spec.region,
        acl: 'public-read'
      };

      const response = await this.makeRequest('PUT', `/${bucketName}`, createBucketRequest, 'obs');

      // Upload index.html
      const uploadRequest = {
        key: 'index.html',
        body: spec.code,
        content_type: 'text/html'
      };

      await this.makeRequest('PUT', `/${bucketName}/index.html`, uploadRequest, 'obs');

      // Configure static website hosting
      const websiteConfig = {
        website: {
          index_document: { suffix: 'index.html' },
          error_document: { key: 'error.html' }
        }
      };

      await this.makeRequest('PUT', `/${bucketName}?website`, websiteConfig, 'obs');

      const websiteUrl = `http://${bucketName}.obs-website.${spec.region}.myhuaweicloud.com`;

      return {
        id: bucketName,
        name: spec.name,
        type: 'obs-website',
        region: spec.region,
        status: 'active',
        url: websiteUrl,
        createdAt: new Date().toISOString(),
        logs: [`Huawei OBS static website deployed to ${websiteUrl}`]
      };
    } catch (error: any) {
      throw new Error(`Huawei Cloud OBS deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<HuaweiResource[]> {
    if (!this.credentials.accessKey) {
      return [];
    }

    const resources: HuaweiResource[] = [];

    try {
      // List FunctionGraph functions
      const functionsResponse = await this.makeRequest('GET', '/v2/fgs/functions');
      
      functionsResponse.functions?.forEach((func: any) => {
        if (func.user_data && JSON.parse(func.user_data)?.createdBy === 'instantiate') {
          resources.push({
            id: func.func_urn,
            name: func.func_name,
            type: 'function-graph',
            region: this.credentials.region,
            status: func.status?.toLowerCase() || 'active',
            createdAt: func.last_modified || new Date().toISOString()
          });
        }
      });

      // List ECS instances
      const serversResponse = await this.makeRequest('GET', '/v1/cloudservers/detail', {}, 'ecs');
      
      serversResponse.servers?.forEach((server: any) => {
        if (server.tags?.includes('instantiate')) {
          resources.push({
            id: server.id,
            name: server.name,
            type: 'ecs',
            region: this.credentials.region,
            status: server.status?.toLowerCase() || 'unknown',
            url: `http://${server.addresses?.vpc?.[0]?.addr}`,
            createdAt: server.created || new Date().toISOString()
          });
        }
      });

      // List OBS buckets
      const bucketsResponse = await this.makeRequest('GET', '/', {}, 'obs');
      
      bucketsResponse.buckets?.forEach((bucket: any) => {
        if (bucket.name.includes('instantiate')) {
          resources.push({
            id: bucket.name,
            name: bucket.name,
            type: 'obs-bucket',
            region: bucket.location,
            status: 'active',
            createdAt: bucket.creation_date || new Date().toISOString()
          });
        }
      });
    } catch (error: any) {
      console.error('Error listing Huawei Cloud resources:', error.message);
    }

    return resources;
  }

  async getResourceStatus(resourceId: string, resourceType: string): Promise<any> {
    if (!this.credentials.accessKey) {
      throw new Error('Huawei Cloud credentials not configured.');
    }

    try {
      if (resourceType === 'function-graph') {
        const response = await this.makeRequest('GET', `/v2/fgs/functions/${resourceId}`);
        return {
          status: response.status?.toLowerCase() || 'active',
          runtime: response.runtime,
          memory_size: response.memory_size,
          timeout: response.timeout
        };
      } else if (resourceType === 'ecs') {
        const response = await this.makeRequest('GET', `/v1/cloudservers/${resourceId}`, {}, 'ecs');
        return {
          status: response.server?.status?.toLowerCase(),
          flavor: response.server?.flavor,
          image: response.server?.image,
          addresses: response.server?.addresses
        };
      } else if (resourceType === 'obs-bucket' || resourceType === 'obs-website') {
        const response = await this.makeRequest('HEAD', `/${resourceId}`, {}, 'obs');
        return {
          status: 'active',
          location: response.location
        };
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async makeRequest(method: string, path: string, body: any = {}, service: string = 'functiongraph'): Promise<any> {
    const endpoints = {
      functiongraph: `https://functiongraph.${this.credentials.region}.myhuaweicloud.com`,
      ecs: `https://ecs.${this.credentials.region}.myhuaweicloud.com`,
      obs: `https://obs.${this.credentials.region}.myhuaweicloud.com`
    };

    const url = `${endpoints[service as keyof typeof endpoints]}${path}`;
    
    // In production, implement proper Huawei Cloud API authentication
    const headers = {
      'Content-Type': 'application/json',
      'X-Project-Id': this.credentials.projectId
    };

    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Huawei Cloud API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  private createFunctionCode(spec: HuaweiDeploymentRequest): string {
    if (spec.codeType === 'javascript') {
      return spec.code.includes('exports.handler') ? spec.code : 
        `exports.handler = async (event, context) => {
          ${spec.code}
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success from ${spec.name}' })
          };
        };`;
    } else {
      return spec.code.includes('def handler') ? spec.code :
        `def handler(event, context):
          ${spec.code.split('\n').map(line => '    ' + line).join('\n')}
          return {
            'statusCode': 200,
            'body': '{"message": "Success from ${spec.name}"}'
          }`;
    }
  }

  private createUserData(spec: HuaweiDeploymentRequest): string {
    return `#!/bin/bash
yum update -y
yum install -y httpd

# Create simple web server
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>${spec.name} - Huawei Cloud</title></head>
<body>
<h1>Huawei Cloud Deployment: ${spec.name}</h1>
<p>Deployed via Instantiate</p>
<pre>${spec.code}</pre>
</body>
</html>
EOF

systemctl start httpd
systemctl enable httpd

# Configure firewall
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
`;
  }
}

export const huaweiCloudService = new HuaweiCloudService();