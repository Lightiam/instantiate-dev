import Core from '@alicloud/pop-core';
import fetch from 'node-fetch';

interface AlibabaDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'function-compute' | 'ecs' | 'oss' | 'container-service';
  environmentVariables?: Record<string, string>;
}

interface AlibabaResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class AlibabaCloudService {
  private credentials = {
    accessKeyId: process.env.ALIBABA_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET || '',
    endpoint: 'https://ecs.aliyuncs.com',
    apiVersion: '2014-05-26'
  };

  private client: Core | null = null;

  constructor() {
    if (this.credentials.accessKeyId && this.credentials.accessKeySecret) {
      this.client = new Core({
        accessKeyId: this.credentials.accessKeyId,
        accessKeySecret: this.credentials.accessKeySecret,
        endpoint: this.credentials.endpoint,
        apiVersion: this.credentials.apiVersion
      });
    }
  }

  async deployFunctionCompute(spec: AlibabaDeploymentRequest): Promise<any> {
    if (!this.client) {
      throw new Error('Alibaba Cloud credentials not configured. Please set ALIBABA_ACCESS_KEY_ID and ALIBABA_ACCESS_KEY_SECRET.');
    }

    const serviceName = `instantiate-${spec.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const functionName = `${spec.name}-function`;
    const region = spec.region || 'cn-hangzhou';

    try {
      const fcClient = new Core({
        accessKeyId: this.credentials.accessKeyId,
        accessKeySecret: this.credentials.accessKeySecret,
        endpoint: `https://${region}.fc.aliyuncs.com`,
        apiVersion: '2016-08-15'
      });

      const serviceParams = {
        serviceName: serviceName,
        description: `Deployed via Instantiate - ${spec.name}`,
        internetAccess: true
      };

      await fcClient.request('POST', `/2016-08-15/services`, serviceParams);

      const runtime = spec.codeType === 'javascript' ? 'nodejs14' : 'python3.9';
      const handler = spec.codeType === 'javascript' ? 'index.handler' : 'index.main_handler';

      const functionParams = {
        functionName: functionName,
        description: `Function deployed via Instantiate`,
        runtime: runtime,
        handler: handler,
        code: {
          zipFile: Buffer.from(this.createFunctionCode(spec)).toString('base64')
        },
        timeout: 60,
        memorySize: 128,
        environmentVariables: spec.environmentVariables || {}
      };

      const result = await fcClient.request('POST', `/2016-08-15/services/${serviceName}/functions`, functionParams);

      return {
        id: `${serviceName}/${functionName}`,
        name: functionName,
        type: 'function-compute',
        region: region,
        status: 'deployed',
        url: `https://fc.console.aliyun.com/fc/service/${region}/${serviceName}/function/${functionName}`,
        createdAt: new Date().toISOString(),
        logs: [`Alibaba Function Compute ${functionName} deployed successfully`]
      };
    } catch (error: any) {
      throw new Error(`Alibaba Cloud Function Compute deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<AlibabaResource[]> {
    if (!this.client) {
      return [];
    }

    const resources: AlibabaResource[] = [];

    try {
      const regions = ['cn-hangzhou', 'cn-beijing', 'cn-shanghai', 'cn-shenzhen'];
      
      for (const region of regions) {
        try {
          const fcClient = new Core({
            accessKeyId: this.credentials.accessKeyId,
            accessKeySecret: this.credentials.accessKeySecret,
            endpoint: `https://${region}.fc.aliyuncs.com`,
            apiVersion: '2016-08-15'
          });

          const services = await fcClient.request('GET', '/2016-08-15/services');
          
          if (services.services) {
            for (const service of services.services) {
              if (service.serviceName.includes('instantiate')) {
                const functions = await fcClient.request('GET', `/2016-08-15/services/${service.serviceName}/functions`);
                
                if (functions.functions) {
                  functions.functions.forEach((func: any) => {
                    resources.push({
                      id: `${service.serviceName}/${func.functionName}`,
                      name: func.functionName,
                      type: 'function-compute',
                      region: region,
                      status: 'active',
                      createdAt: func.createdTime || new Date().toISOString()
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
      console.error('Error listing Alibaba Cloud resources:', error.message);
    }

    return resources;
  }

  private createFunctionCode(spec: AlibabaDeploymentRequest): string {
    if (spec.codeType === 'javascript') {
      return spec.code.includes('exports.handler') ? spec.code : 
        `exports.handler = (event, context, callback) => {
          ${spec.code}
          callback(null, { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Success from ${spec.name}' })
          });
        };`;
    } else {
      return spec.code.includes('def main_handler') ? spec.code :
        `def main_handler(event, context):
          ${spec.code.split('\n').map(line => '    ' + line).join('\n')}
          return {
            'statusCode': 200,
            'body': '{"message": "Success from ${spec.name}"}'
          }`;
    }
  }
}

export const alibabaCloudService = new AlibabaCloudService();