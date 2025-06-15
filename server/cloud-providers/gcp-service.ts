
interface GCPDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: string;
  environmentVariables?: Record<string, string>;
}

export class GCPService {
  async deployCloudFunction(spec: GCPDeploymentRequest): Promise<any> {
    throw new Error('GCP service not implemented');
  }

  async deployCloudRun(spec: GCPDeploymentRequest): Promise<any> {
    throw new Error('GCP service not implemented');
  }

  async listResources(): Promise<any[]> {
    return [];
  }
}

export const gcpService = new GCPService();
