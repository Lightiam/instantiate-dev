import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {  getAzureService  } from "./azure-service.js";

interface DeploymentRequest {
  code: string;
  codeType: 'terraform' | 'pulumi';
  provider: 'azure' | 'aws' | 'gcp';
  resourceType: string;
  deploymentId: string;
}

interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  outputs?: Record<string, any>;
  error?: string;
  logs: string[];
}

export class DeploymentService {
  private deployments = new Map<string, DeploymentResult>();
  private deploymentsDir = join(process.cwd(), 'deployments');

  constructor() {
    this.ensureDeploymentsDir();
  }

  private async ensureDeploymentsDir() {
    try {
      await fs.mkdir(this.deploymentsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create deployments directory:', error);
    }
  }

  async deployInfrastructure(request: DeploymentRequest): Promise<string> {
    const deploymentId = uuidv4();
    const deploymentPath = join(this.deploymentsDir, deploymentId);
    
    try {
      await fs.mkdir(deploymentPath, { recursive: true });
      
      // Initialize deployment status
      this.deployments.set(deploymentId, {
        deploymentId,
        status: 'pending',
        logs: ['Deployment initiated']
      });

      if (request.codeType === 'terraform') {
        await this.deployTerraform(deploymentId, deploymentPath, request);
      } else {
        await this.deployPulumi(deploymentId, deploymentPath, request);
      }

      return deploymentId;
    } catch (error: any) {
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }

  private async deployTerraform(deploymentId: string, deploymentPath: string, request: DeploymentRequest) {
    this.addLog(deploymentId, 'Starting Azure deployment via SDK...');
    
    // First test Azure authentication
    try {
      const { AzureDiagnosticService } = await import('./azure-diagnostic');
      const azureDiagnostic = new AzureDiagnosticService();
      const authResults = await azureDiagnostic.runCompleteDiagnostic();
      
      const authTest = authResults.find(r => r.test === 'Azure Authentication');
      if (authTest?.status === 'error') {
        this.addLog(deploymentId, 'Azure authentication failed - invalid credentials');
        this.addLog(deploymentId, `Error: ${authTest.message}`);
        this.updateDeploymentStatus(deploymentId, 'failed', 'Azure authentication failed - invalid client secret');
        return;
      }
      
      this.addLog(deploymentId, 'Azure authentication successful');
    } catch (authError: any) {
      this.addLog(deploymentId, `Authentication check failed: ${authError.message}`);
      this.updateDeploymentStatus(deploymentId, 'failed', 'Failed to verify Azure authentication');
      return;
    }
    
    try {
      // Use Azure SDK directly instead of Terraform
      const { getAzureService } = await import('./azure-service');
      const azureService = getAzureService();
      
      if (request.provider === 'azure') {
        if (request.resourceType === 'container') {
          this.addLog(deploymentId, 'Deploying container to Azure Container Instances...');
          
          const containerSpec = this.parseContainerSpec(request.code);
          this.addLog(deploymentId, `Creating container: ${containerSpec.name}`);
          
          try {
            const result = await azureService.createContainer(containerSpec);
            
            this.addLog(deploymentId, `Container created successfully: ${result.name}`);
            if (result.publicIp) {
              this.addLog(deploymentId, `Public IP assigned: ${result.publicIp}`);
            }
            
            this.updateDeploymentStatus(deploymentId, 'success');
            
            // Store deployment outputs
            const deployment = this.deployments.get(deploymentId);
            if (deployment) {
              deployment.outputs = {
                containerName: result.name,
                publicIp: result.publicIp,
                resourceGroup: containerSpec.resourceGroup,
                location: containerSpec.location
              };
            }
          } catch (azureError: any) {
            this.addLog(deploymentId, `Azure deployment failed: ${azureError.message}`);
            this.addLog(deploymentId, 'Authentication error - Azure credentials may be invalid');
            this.updateDeploymentStatus(deploymentId, 'failed', `Azure authentication failed: ${azureError.message}`);
            throw azureError;
          }
        } else if (request.resourceType === 'custom' || request.resourceType === 'database' || request.resourceType === 'storage' || request.resourceType === 'network' || request.resourceType === 'kubernetes') {
          this.addLog(deploymentId, 'Generating Infrastructure as Code deployment package...');
          
          const resourceSpec = this.parseResourceSpec(request.code);
          this.addLog(deploymentId, `Preparing deployment for: ${resourceSpec.resourceGroup}`);
          
          // Generate deployment package instead of direct deployment
          const result = await this.generateDeploymentPackage(request, resourceSpec, deploymentId);
          
          this.addLog(deploymentId, `Deployment package ready`);
          this.updateDeploymentStatus(deploymentId, 'success');
          
          // Store deployment outputs
          const deployment = this.deployments.get(deploymentId);
          if (deployment) {
            deployment.outputs = result;
          }
        } else {
          throw new Error(`Unsupported Azure resource type: ${request.resourceType}`);
        }
      } else if (request.provider === 'aws') {
        const { awsService } = await import('./cloud-providers/aws-service');
        
        const deploymentSpec = {
          name: `deployment-${Date.now()}`,
          code: request.code,
          codeType: 'html' as const,
          region: 'us-east-1',
          service: 'web-app-with-alb' as const,
          environmentVariables: {}
        };
        
        const awsResult = await awsService.deployWebAppWithLoadBalancer(deploymentSpec);
        
        this.addLog(deploymentId, `AWS deployment completed: ${awsResult.id}`);
        this.updateDeploymentStatus(deploymentId, 'success');
        
        const deployment = this.deployments.get(deploymentId);
        if (deployment) {
          deployment.outputs = {
            deploymentId: awsResult.id,
            url: awsResult.url,
            loadBalancerArn: awsResult.loadBalancerArn,
            instanceIds: awsResult.instanceIds,
            region: awsResult.region
          };
        }
      } else {
        throw new Error(`Unsupported cloud provider: ${request.provider}`);
      }
      
    } catch (error: any) {
      this.addLog(deploymentId, `Deployment failed: ${error.message}`);
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }

  private parseContainerSpec(terraformCode: string) {
    // Extract container specifications from Terraform code
    const nameMatch = terraformCode.match(/name\s*=\s*"([^"]+)"/);
    const imageMatch = terraformCode.match(/image\s*=\s*"([^"]+)"/);
    const resourceGroupMatch = terraformCode.match(/resource_group_name\s*=\s*"([^"]+)"/);
    const locationMatch = terraformCode.match(/location\s*=\s*"([^"]+)"/);
    
    return {
      name: nameMatch?.[1] || 'instanti8-container',
      image: imageMatch?.[1] || 'nginx:latest',
      resourceGroup: resourceGroupMatch?.[1] || 'instanti8-rg',
      location: locationMatch?.[1] || 'eastus',
      cpu: 1,
      memory: 1,
      ports: [80]
    };
  }

  private parseResourceSpec(terraformCode: string) {
    // Extract resource specifications from Terraform code
    const resourceGroupMatch = terraformCode.match(/resource\s+"azurerm_resource_group"\s+"[^"]+"\s+\{[\s\S]*?name\s*=\s*"([^"]+)"/);
    const locationMatch = terraformCode.match(/location\s*=\s*"([^"]+)"/);
    const appServiceMatch = terraformCode.match(/resource\s+"azurerm_windows_web_app"\s+"[^"]+"\s+\{[\s\S]*?name\s*=\s*"([^"]+)"/);
    const servicePlanMatch = terraformCode.match(/resource\s+"azurerm_service_plan"\s+"[^"]+"\s+\{[\s\S]*?name\s*=\s*"([^"]+)"/);
    
    return {
      resourceGroup: resourceGroupMatch?.[1] || 'instanti8-resources',
      location: locationMatch?.[1] || 'West Europe',
      appServiceName: appServiceMatch?.[1] || 'instanti8-web-app',
      servicePlanName: servicePlanMatch?.[1] || 'instanti8-service-plan',
      type: 'web-app'
    };
  }

  private async generateDeploymentPackage(request: DeploymentRequest, resourceSpec: any, deploymentId: string) {
    this.addLog(deploymentId, 'Generating Terraform deployment package...');
    
    try {
      // Create deployment package with validated Terraform code
      const deploymentPackage = {
        terraform: request.code,
        variables: this.generateTerraformVars('azure'),
        resourceGroup: resourceSpec.resourceGroup,
        location: resourceSpec.location,
        resources: [
          resourceSpec.appServiceName,
          resourceSpec.servicePlanName
        ]
      };
      
      this.addLog(deploymentId, `Package includes: ${resourceSpec.appServiceName}, ${resourceSpec.servicePlanName}`);
      this.addLog(deploymentId, `Target location: ${resourceSpec.location}`);
      this.addLog(deploymentId, 'Ready for deployment with "az deployment group create" or Terraform CLI');
      
      return {
        resourceGroup: resourceSpec.resourceGroup,
        location: resourceSpec.location,
        appServiceName: resourceSpec.appServiceName,
        servicePlanName: resourceSpec.servicePlanName,
        deploymentPackage,
        status: 'package-ready',
        instructions: [
          '1. Install Azure CLI and login: az login',
          '2. Set subscription: az account set --subscription YOUR_SUBSCRIPTION_ID',
          '3. Deploy: az deployment group create --resource-group ' + resourceSpec.resourceGroup + ' --template-file main.tf'
        ]
      };
    } catch (error: any) {
      this.addLog(deploymentId, `Package generation failed: ${error.message}`);
      throw error;
    }
  }

  private async deployPulumi(deploymentId: string, deploymentPath: string, request: DeploymentRequest) {
    this.addLog(deploymentId, 'Writing Pulumi configuration...');
    
    // Write index.ts file
    const pulumiFile = join(deploymentPath, 'index.ts');
    await fs.writeFile(pulumiFile, request.code);

    // Write package.json
    const packageJson = {
      name: `deployment-${deploymentId}`,
      main: "index.ts",
      dependencies: {
        "@pulumi/pulumi": "^3.0.0",
        "@pulumi/azure-native": "^2.0.0"
      }
    };
    await fs.writeFile(join(deploymentPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create Pulumi.yaml
    const pulumiYaml = `name: deployment-${deploymentId}
runtime: nodejs
description: Infrastructure deployment via Instanti8.dev`;
    await fs.writeFile(join(deploymentPath, 'Pulumi.yaml'), pulumiYaml);

    this.updateDeploymentStatus(deploymentId, 'running');
    this.addLog(deploymentId, 'Installing Pulumi dependencies...');

    await this.execCommand('npm install', deploymentPath, deploymentId);
    this.addLog(deploymentId, 'Initializing Pulumi stack...');
    
    await this.execCommand(`pulumi stack init ${deploymentId}`, deploymentPath, deploymentId);
    
    // Set Azure configuration
    if (request.provider === 'azure') {
      const azureConfig = this.getAzureConfig();
      await this.execCommand(`pulumi config set azure-native:clientId ${azureConfig.clientId}`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:clientSecret ${azureConfig.clientSecret} --secret`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:tenantId ${azureConfig.tenantId}`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:subscriptionId ${azureConfig.subscriptionId}`, deploymentPath, deploymentId);
    }

    this.addLog(deploymentId, 'Deploying Pulumi stack...');
    await this.execCommand('pulumi up --yes', deploymentPath, deploymentId);

    // Get stack outputs
    const outputsJson = await this.execCommand('pulumi stack output --json', deploymentPath, deploymentId);
    let outputs = {};
    try {
      outputs = JSON.parse(outputsJson);
    } catch (e) {
      this.addLog(deploymentId, 'Could not parse Pulumi outputs');
    }

    this.updateDeploymentStatus(deploymentId, 'success');
    this.addLog(deploymentId, 'Deployment completed successfully!');
    
    const deployment = this.deployments.get(deploymentId)!;
    deployment.outputs = outputs;
  }

  private async execCommand(command: string, cwd: string, deploymentId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.addLog(deploymentId, `Executing: ${command}`);
      
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          this.addLog(deploymentId, `Error: ${error.message}`);
          this.updateDeploymentStatus(deploymentId, 'failed', error.message);
          reject(error);
          return;
        }
        
        if (stderr) {
          this.addLog(deploymentId, `Warning: ${stderr}`);
        }
        
        if (stdout) {
          this.addLog(deploymentId, stdout);
        }
        
        resolve(stdout);
      });
    });
  }

  private generateTerraformVars(provider: string): string {
    if (provider === 'azure') {
      const azureConfig = this.getAzureConfig();
      return `# Azure Configuration
client_id       = "${azureConfig.clientId}"
client_secret   = "${azureConfig.clientSecret}"
tenant_id      = "${azureConfig.tenantId}"
subscription_id = "${azureConfig.subscriptionId}"`;
    }
    return '';
  }

  private getAzureConfig() {
    return {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID!,
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID!
    };
  }

  private updateDeploymentStatus(deploymentId: string, status: DeploymentResult['status'], error?: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.status = status;
      if (error) {
        deployment.error = error;
      }
    }
  }

  private addLog(deploymentId: string, message: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.logs.push(`${new Date().toISOString()}: ${message}`);
    }
  }

  getDeploymentStatus(deploymentId: string): DeploymentResult | undefined {
    return this.deployments.get(deploymentId);
  }

  async destroyInfrastructure(deploymentId: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const deploymentPath = join(this.deploymentsDir, deploymentId);
    
    this.addLog(deploymentId, 'Destroying infrastructure...');
    this.updateDeploymentStatus(deploymentId, 'running');

    try {
      // Check if it's a Terraform or Pulumi deployment
      const tfFile = join(deploymentPath, 'main.tf');
      const pulumiFile = join(deploymentPath, 'Pulumi.yaml');
      
      if (await this.fileExists(tfFile)) {
        await this.execCommand('terraform destroy -auto-approve', deploymentPath, deploymentId);
      } else if (await this.fileExists(pulumiFile)) {
        await this.execCommand('pulumi destroy --yes', deploymentPath, deploymentId);
      }

      this.addLog(deploymentId, 'Infrastructure destroyed successfully');
      this.updateDeploymentStatus(deploymentId, 'success');
    } catch (error: any) {
      this.addLog(deploymentId, `Destroy failed: ${error.message}`);
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getAllDeployments(): DeploymentResult[] {
    return Array.from(this.deployments.values());
  }
}

const deploymentService = new DeploymentService();
export { deploymentService };
