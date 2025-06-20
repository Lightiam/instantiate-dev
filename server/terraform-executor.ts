import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface TerraformExecutionResult {
  success: boolean;
  deploymentId?: string;
  resources?: any[];
  outputs?: Record<string, any>;
  error?: string;
  logs?: string[];
}

interface TerraformConfig {
  code: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  credentials?: Record<string, any>;
}

export class TerraformExecutor {
  private workingDir: string;
  private logs: string[] = [];

  constructor() {
    this.workingDir = path.join(process.cwd(), 'terraform-workspace');
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  private async ensureWorkingDirectory(): Promise<void> {
    try {
      await fs.access(this.workingDir);
    } catch {
      await fs.mkdir(this.workingDir, { recursive: true });
      this.log(`Created Terraform working directory: ${this.workingDir}`);
    }
  }

  private async validateTerraformCode(code: string): Promise<boolean> {
    try {
      const requiredPatterns = [
        /terraform\s*{/,  // terraform block
        /provider\s+"\w+"/,  // provider block
        /resource\s+"\w+"/   // at least one resource
      ];

      const hasRequiredSyntax = requiredPatterns.every(pattern => pattern.test(code));
      
      if (!hasRequiredSyntax) {
        this.log('Terraform code validation failed: missing required blocks');
        return false;
      }

      const securityPatterns = [
        /password\s*=\s*"[^"]*"/i,
        /secret\s*=\s*"[^"]*"/i,
        /key\s*=\s*"[^"]*"/i
      ];

      const hasSecurityIssues = securityPatterns.some(pattern => pattern.test(code));
      
      if (hasSecurityIssues) {
        this.log('Terraform code validation failed: potential security issues detected');
        return false;
      }

      this.log('Terraform code validation passed');
      return true;
    } catch (error: any) {
      this.log(`Terraform code validation error: ${error.message}`);
      return false;
    }
  }

  private async writeTerraformFiles(config: TerraformConfig, deploymentId: string): Promise<string> {
    const deploymentDir = path.join(this.workingDir, deploymentId);
    await fs.mkdir(deploymentDir, { recursive: true });

    const mainTfPath = path.join(deploymentDir, 'main.tf');
    await fs.writeFile(mainTfPath, config.code, 'utf8');
    this.log(`Written main.tf to ${mainTfPath}`);

    if (config.credentials) {
      const tfvarsContent = Object.entries(config.credentials)
        .map(([key, value]) => `${key} = "${value}"`)
        .join('\n');
      
      const tfvarsPath = path.join(deploymentDir, 'terraform.tfvars');
      await fs.writeFile(tfvarsPath, tfvarsContent, 'utf8');
      this.log(`Written terraform.tfvars to ${tfvarsPath}`);
    }

    const versionsTf = `
terraform {
  required_version = ">= 1.0"
  required_providers {
    ${config.provider} = {
      source  = "hashicorp/${config.provider}"
      version = "~> 5.0"
    }
  }
}
`;
    const versionsTfPath = path.join(deploymentDir, 'versions.tf');
    await fs.writeFile(versionsTfPath, versionsTf, 'utf8');
    this.log(`Written versions.tf to ${versionsTfPath}`);

    return deploymentDir;
  }

  private async executeTerraformCommand(command: string, workingDir: string): Promise<{ stdout: string; stderr: string }> {
    this.log(`Executing: ${command} in ${workingDir}`);
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: workingDir,
        timeout: 300000, // 5 minutes timeout
        env: {
          ...process.env,
          TF_IN_AUTOMATION: 'true',
          TF_INPUT: 'false'
        }
      });
      
      if (stdout) this.log(`STDOUT: ${stdout}`);
      if (stderr) this.log(`STDERR: ${stderr}`);
      
      return { stdout, stderr };
    } catch (error: any) {
      this.log(`Command failed: ${error.message}`);
      throw error;
    }
  }

  private async parseTerraformOutput(stdout: string): Promise<{ resources: any[]; outputs: Record<string, any> }> {
    const resources: any[] = [];
    const outputs: Record<string, any> = {};

    try {
      const resourceMatches = stdout.match(/# (\w+\.\w+) will be created/g);
      if (resourceMatches) {
        resourceMatches.forEach(match => {
          const resourceName = match.replace('# ', '').replace(' will be created', '');
          resources.push({
            name: resourceName,
            status: 'planned'
          });
        });
      }

      const outputMatches = stdout.match(/(\w+) = (.+)/g);
      if (outputMatches) {
        outputMatches.forEach(match => {
          const [key, value] = match.split(' = ');
          outputs[key] = value.replace(/"/g, '');
        });
      }

      this.log(`Parsed ${resources.length} resources and ${Object.keys(outputs).length} outputs`);
    } catch (error: any) {
      this.log(`Error parsing Terraform output: ${error.message}`);
    }

    return { resources, outputs };
  }

  async executeTerraform(config: TerraformConfig): Promise<TerraformExecutionResult> {
    const deploymentId = uuidv4();
    this.logs = []; // Reset logs for this execution
    
    try {
      this.log(`Starting Terraform execution for deployment ${deploymentId}`);
      
      if (!await this.validateTerraformCode(config.code)) {
        return {
          success: false,
          error: 'Terraform code validation failed',
          logs: this.logs
        };
      }

      await this.ensureWorkingDirectory();

      const deploymentDir = await this.writeTerraformFiles(config, deploymentId);

      this.log('Initializing Terraform...');
      await this.executeTerraformCommand('terraform init', deploymentDir);

      this.log('Validating Terraform configuration...');
      await this.executeTerraformCommand('terraform validate', deploymentDir);

      this.log('Planning Terraform deployment...');
      const planResult = await this.executeTerraformCommand('terraform plan -out=tfplan', deploymentDir);

      const { resources, outputs } = await this.parseTerraformOutput(planResult.stdout);


      this.log(`Terraform execution completed successfully for deployment ${deploymentId}`);
      
      return {
        success: true,
        deploymentId,
        resources,
        outputs,
        logs: this.logs
      };

    } catch (error: any) {
      this.log(`Terraform execution failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        logs: this.logs
      };
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<TerraformExecutionResult> {
    try {
      const deploymentDir = path.join(this.workingDir, deploymentId);
      
      await fs.access(deploymentDir);
      
      const stateResult = await this.executeTerraformCommand('terraform show -json', deploymentDir);
      
      let resources: any[] = [];
      try {
        const state = JSON.parse(stateResult.stdout);
        resources = state.values?.root_module?.resources || [];
      } catch (parseError) {
        this.log('Could not parse Terraform state JSON');
      }

      return {
        success: true,
        deploymentId,
        resources,
        logs: this.logs
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Deployment ${deploymentId} not found or inaccessible: ${error.message}`,
        logs: this.logs
      };
    }
  }

  async destroyDeployment(deploymentId: string): Promise<TerraformExecutionResult> {
    try {
      const deploymentDir = path.join(this.workingDir, deploymentId);
      
      this.log(`Destroying Terraform deployment ${deploymentId}`);
      
      await this.executeTerraformCommand('terraform plan -destroy -out=destroy.tfplan', deploymentDir);
      
      
      this.log(`Terraform destroy completed for deployment ${deploymentId}`);
      
      return {
        success: true,
        deploymentId,
        logs: this.logs
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: this.logs
      };
    }
  }

  async cleanupWorkspace(): Promise<void> {
    try {
      const entries = await fs.readdir(this.workingDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const entry of entries) {
        const entryPath = path.join(this.workingDir, entry);
        const stats = await fs.stat(entryPath);
        
        if (stats.isDirectory() && (now - stats.mtime.getTime()) > maxAge) {
          await fs.rm(entryPath, { recursive: true, force: true });
          this.log(`Cleaned up old deployment directory: ${entry}`);
        }
      }
    } catch (error: any) {
      this.log(`Workspace cleanup error: ${error.message}`);
    }
  }
}

export const terraformExecutor = new TerraformExecutor();
