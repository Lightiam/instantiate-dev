import * as yaml from 'js-yaml';

export interface ImportConfiguration {
  type: 'terraform' | 'cloudformation' | 'arm' | 'kubernetes';
  source: string;
  action: 'import' | 'convert' | 'deploy';
  options?: {
    workspace?: string;
    region?: string;
    subscription?: string;
    namespace?: string;
    resourceGroup?: string;
  };
}

export interface ImportResult {
  success: boolean;
  resourceCount: number;
  warnings: string[];
  errors: string[];
  convertedConfig?: string;
  deploymentId?: string;
}

export class InfrastructureImportService {
  async importConfiguration(config: ImportConfiguration): Promise<ImportResult> {
    try {
      switch (config.type) {
        case 'terraform':
          return await this.importTerraform(config);
        case 'cloudformation':
          return await this.importCloudFormation(config);
        case 'arm':
          return await this.importAzureARM(config);
        case 'kubernetes':
          return await this.importKubernetes(config);
        default:
          throw new Error(`Unsupported import type: ${config.type}`);
      }
    } catch (error: any) {
      return {
        success: false,
        resourceCount: 0,
        warnings: [],
        errors: [error.message],
      };
    }
  }

  private async importTerraform(config: ImportConfiguration): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      resourceCount: 0,
      warnings: [],
      errors: []
    };

    try {
      const hclConfig = this.parseTerraformHCL(config.source);
      const resources = this.extractTerraformResources(hclConfig);
      result.resourceCount = resources.length;

      if (config.action === 'convert') {
        result.convertedConfig = await this.convertToUniversalFormat(resources, 'terraform');
      }

      const validation = this.validateTerraformResources(resources);
      result.warnings = validation.warnings;
      result.errors = validation.errors;

      if (validation.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Terraform import failed: ${error.message}`);
      return result;
    }
  }

  private async importCloudFormation(config: ImportConfiguration): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      resourceCount: 0,
      warnings: [],
      errors: []
    };

    try {
      const template = this.parseCloudFormationTemplate(config.source);
      const resources = this.extractCloudFormationResources(template);
      result.resourceCount = resources.length;

      if (config.action === 'convert') {
        result.convertedConfig = await this.convertToUniversalFormat(resources, 'cloudformation');
      }

      const validation = this.validateCloudFormationResources(resources);
      result.warnings = validation.warnings;
      result.errors = validation.errors;

      if (validation.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(`CloudFormation import failed: ${error.message}`);
      return result;
    }
  }

  private async importAzureARM(config: ImportConfiguration): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      resourceCount: 0,
      warnings: [],
      errors: []
    };

    try {
      const template = JSON.parse(config.source);
      const resources = this.extractARMResources(template);
      result.resourceCount = resources.length;

      if (config.action === 'convert') {
        result.convertedConfig = await this.convertToUniversalFormat(resources, 'arm');
      }

      const validation = this.validateARMResources(resources);
      result.warnings = validation.warnings;
      result.errors = validation.errors;

      if (validation.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(`ARM template import failed: ${error.message}`);
      return result;
    }
  }

  private async importKubernetes(config: ImportConfiguration): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      resourceCount: 0,
      warnings: [],
      errors: []
    };

    try {
      const manifests = this.parseKubernetesYAML(config.source);
      const resources = this.extractKubernetesResources(manifests);
      result.resourceCount = resources.length;

      if (config.action === 'convert') {
        result.convertedConfig = await this.convertToUniversalFormat(resources, 'kubernetes');
      }

      const validation = this.validateKubernetesResources(resources);
      result.warnings = validation.warnings;
      result.errors = validation.errors;

      if (validation.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Kubernetes import failed: ${error.message}`);
      return result;
    }
  }

  private parseTerraformHCL(source: string): any {
    const lines = source.split('\n');
    const resources: any[] = [];
    
    let currentResource: any = null;
    let bracketDepth = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('resource ')) {
        const match = trimmed.match(/resource\s+"([^"]+)"\s+"([^"]+)"/);
        if (match) {
          currentResource = {
            type: match[1],
            name: match[2],
            config: {}
          };
        }
      }
      
      if (trimmed === '{') {
        bracketDepth++;
      } else if (trimmed === '}') {
        bracketDepth--;
        if (bracketDepth === 0 && currentResource) {
          resources.push(currentResource);
          currentResource = null;
        }
      }
    }
    
    return { resources };
  }

  private parseCloudFormationTemplate(source: string): any {
    try {
      return JSON.parse(source);
    } catch {
      return yaml.load(source) as any;
    }
  }

  private parseKubernetesYAML(source: string): any[] {
    const docs = yaml.loadAll(source) as any[];
    return docs.filter(doc => doc && doc.kind);
  }

  private extractTerraformResources(config: any): any[] {
    return config.resources || [];
  }

  private extractCloudFormationResources(template: any): any[] {
    const resources = template.Resources || {};
    return Object.keys(resources).map(key => ({
      name: key,
      type: resources[key].Type,
      properties: resources[key].Properties
    }));
  }

  private extractARMResources(template: any): any[] {
    return template.resources || [];
  }

  private extractKubernetesResources(manifests: any[]): any[] {
    return manifests;
  }

  private validateTerraformResources(resources: any[]): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const resource of resources) {
      if (this.isUnsupportedTerraformResource(resource.type)) {
        warnings.push(`Resource type ${resource.type} may require manual configuration`);
      }

      if (this.hasDeprecatedTerraformConfig(resource)) {
        warnings.push(`Resource ${resource.name} uses deprecated configuration`);
      }
    }

    return { warnings, errors };
  }

  private validateCloudFormationResources(resources: any[]): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const resource of resources) {
      if (this.isUnsupportedCloudFormationResource(resource.type)) {
        warnings.push(`Resource type ${resource.type} may require manual configuration`);
      }
    }

    return { warnings, errors };
  }

  private validateARMResources(resources: any[]): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const resource of resources) {
      if (this.isUnsupportedARMResource(resource.type)) {
        warnings.push(`Resource type ${resource.type} may require manual configuration`);
      }
    }

    return { warnings, errors };
  }

  private validateKubernetesResources(resources: any[]): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const resource of resources) {
      if (this.isUnsupportedKubernetesResource(resource.kind)) {
        warnings.push(`Kubernetes resource ${resource.kind} may require manual configuration`);
      }
    }

    return { warnings, errors };
  }

  private async convertToUniversalFormat(resources: any[], sourceType: string): Promise<string> {
    const universalConfig = {
      version: '1.0',
      source: sourceType,
      timestamp: new Date().toISOString(),
      resources: resources.map(resource => ({
        id: this.generateResourceId(resource),
        type: this.mapToUniversalType(resource, sourceType),
        name: this.extractResourceName(resource, sourceType),
        properties: this.extractResourceProperties(resource, sourceType),
        dependencies: this.extractResourceDependencies(resource, sourceType)
      }))
    };

    return JSON.stringify(universalConfig, null, 2);
  }

  private generateResourceId(resource: any): string {
    return `${resource.type || resource.kind}_${resource.name || resource.metadata?.name || Math.random().toString(36).substr(2, 9)}`;
  }

  private mapToUniversalType(resource: any, sourceType: string): string {
    const typeMappings: Record<string, Record<string, string>> = {
      terraform: {
        'aws_instance': 'compute.instance',
        'aws_s3_bucket': 'storage.bucket',
        'aws_rds_instance': 'database.instance'
      },
      cloudformation: {
        'AWS::EC2::Instance': 'compute.instance',
        'AWS::S3::Bucket': 'storage.bucket',
        'AWS::RDS::DBInstance': 'database.instance'
      },
      arm: {
        'Microsoft.Compute/virtualMachines': 'compute.instance',
        'Microsoft.Storage/storageAccounts': 'storage.account',
        'Microsoft.Sql/servers': 'database.server'
      },
      kubernetes: {
        'Deployment': 'workload.deployment',
        'Service': 'network.service',
        'ConfigMap': 'configuration.map'
      }
    };

    const resourceType = resource.type || resource.kind;
    return typeMappings[sourceType]?.[resourceType] || `${sourceType}.${resourceType}`;
  }

  private extractResourceName(resource: any, sourceType: string): string {
    return resource.name || resource.metadata?.name || 'unnamed-resource';
  }

  private extractResourceProperties(resource: any, sourceType: string): any {
    switch (sourceType) {
      case 'terraform':
        return resource.config || {};
      case 'cloudformation':
        return resource.properties || {};
      case 'arm':
        return resource.properties || {};
      case 'kubernetes':
        return resource.spec || {};
      default:
        return {};
    }
  }

  private extractResourceDependencies(resource: any, sourceType: string): string[] {
    switch (sourceType) {
      case 'terraform':
        return resource.depends_on || [];
      case 'cloudformation':
        return resource.DependsOn || [];
      case 'arm':
        return resource.dependsOn || [];
      case 'kubernetes':
        return [];
      default:
        return [];
    }
  }

  private isUnsupportedTerraformResource(type: string): boolean {
    const unsupportedTypes = ['aws_api_gateway_rest_api_policy', 'aws_lambda_permission'];
    return unsupportedTypes.includes(type);
  }

  private isUnsupportedCloudFormationResource(type: string): boolean {
    const unsupportedTypes = ['AWS::ApiGateway::RestApi', 'AWS::Lambda::Permission'];
    return unsupportedTypes.includes(type);
  }

  private isUnsupportedARMResource(type: string): boolean {
    const unsupportedTypes = ['Microsoft.Web/sites/config'];
    return unsupportedTypes.includes(type);
  }

  private isUnsupportedKubernetesResource(kind: string): boolean {
    const unsupportedKinds = ['CustomResourceDefinition'];
    return unsupportedKinds.includes(kind);
  }

  private hasDeprecatedTerraformConfig(resource: any): boolean {
    return resource.config && resource.config.deprecated_attribute;
  }
}

export const infrastructureImportService = new InfrastructureImportService();