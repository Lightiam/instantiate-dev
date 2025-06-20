
import OpenAI from 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface DeploymentContext {
  provider?: 'azure' | 'aws' | 'gcp' | 'kubernetes' | 'docker';
  resourceType?: string;
  userQuery: string;
  errorLogs?: string;
  currentInfrastructure?: any;
  deploymentId?: string;
  detectedServices?: string[];
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  codeSnippet?: {
    language: 'terraform' | 'pulumi' | 'bash' | 'yaml' | 'javascript' | 'python';
    code: string;
    description: string;
  };
  troubleshooting?: {
    possibleCauses: string[];
    solutions: string[];
    preventionTips: string[];
  };
  nextSteps?: string[];
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `You are an expert cloud infrastructure and DevOps assistant for </> instanti8.dev, a multi-cloud deployment platform. Your role is to help users with:

1. Infrastructure planning and architecture recommendations
2. Troubleshooting deployment issues across Azure, AWS, GCP and other cloud providers
3. Generating Infrastructure as Code (Terraform, Pulumi, Docker)
4. Optimizing cloud costs and performance
5. Security best practices and compliance
6. Real-time deployment assistance and error resolution

Always provide practical, actionable advice with code examples when relevant. Be concise but thorough.`;

    const apiKey = process.env.OPENAI_API_KEY || process.env.Open_AI_Key;
    console.log('OpenAI API Key check:', apiKey ? 'Found' : 'Not found');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.toLowerCase().includes('openai') || k.toLowerCase().includes('open')));
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('OpenAI service initialized successfully');
    } else {
      console.warn('OpenAI API key not found in environment variables');
      console.warn('Checked: OPENAI_API_KEY, Open_AI_Key');
    }
  }

  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      if (!this.openai) {
        console.error('OpenAI client not initialized - API key missing');
        return this.getFallbackResponse(context);
      }

      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...chatHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user' as const, content: this.buildContextualPrompt(context) }
      ];

      console.log('Calling OpenAI with messages:', messages.length);
      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('OpenAI response received, length:', response.length);
      return this.parseAIResponse(response, context);
    } catch (error: any) {
      console.error('OpenAI Service Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      return this.getFallbackResponse(context);
    }
  }

  async generateInfrastructureCode(prompt: string, provider?: 'azure' | 'aws' | 'gcp' | 'kubernetes', codeType: 'terraform' | 'pulumi' = 'terraform'): Promise<{ code: string; explanation: string; detectedProvider?: string }> {
    try {
      const detectedProvider = provider || this.detectCloudProvider(prompt);
      console.log(`Generating ${codeType} code for ${detectedProvider} with prompt: "${prompt}"`);
      
      if (!this.openai) {
        console.log('OpenAI not available, using fallback code generation');
        const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
        return { ...fallback, detectedProvider };
      }

      const codePrompt = `Generate complete, production-ready ${codeType} code for ${detectedProvider} based on this request: "${prompt}". 

IMPORTANT REQUIREMENTS:
1. Generate ONLY valid ${codeType} code for ${detectedProvider}
2. Include proper provider configuration and required resources
3. Use appropriate resource naming conventions for ${detectedProvider}
4. Include security best practices and proper tagging
5. Make the code deployable and functional

Please provide ONLY the ${codeType} code without any additional formatting or explanations. The code should be ready to save to a .tf file and use immediately.`;

      console.log('Calling OpenAI for code generation...');
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert Infrastructure as Code generator. Generate only valid, production-ready code.' },
          { role: 'user', content: codePrompt }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('OpenAI response received, length:', response.length);
      
      // Clean up the response to get just the code
      let cleanCode = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanCode.includes('```')) {
        const codeMatch = cleanCode.match(/```(?:terraform|hcl)?\n?([\s\S]*?)```/);
        if (codeMatch) {
          cleanCode = codeMatch[1].trim();
        }
      }
      
      // If the response is too short or doesn't contain terraform syntax, use fallback
      if (cleanCode.length < 50 || (!cleanCode.includes('terraform') && !cleanCode.includes('resource') && !cleanCode.includes('provider'))) {
        console.log('OpenAI response insufficient, using fallback');
        const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
        return { ...fallback, detectedProvider };
      }

      const explanation = `Generated ${codeType} code for ${detectedProvider} to ${prompt}. This code includes proper provider configuration, resource definitions, and follows best practices for security and naming conventions.`;
      
      console.log('Successfully generated infrastructure code');
      return { 
        code: cleanCode, 
        explanation, 
        detectedProvider 
      };
    } catch (error: any) {
      console.error('Infrastructure Code Generation Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      const detectedProvider = provider || this.detectCloudProvider(prompt);
      const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
      return { ...fallback, detectedProvider };
    }
  }

  private buildContextualPrompt(context: DeploymentContext): string {
    let prompt = `User query: ${context.userQuery}`;
    
    if (context.provider) {
      prompt += `\nTarget provider: ${context.provider}`;
    }
    
    if (context.resourceType) {
      prompt += `\nResource type: ${context.resourceType}`;
    }
    
    if (context.errorLogs) {
      prompt += `\nError logs: ${context.errorLogs}`;
    }
    
    if (context.deploymentId) {
      prompt += `\nDeployment ID: ${context.deploymentId}`;
    }
    
    return prompt;
  }

  private detectCloudProvider(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('kubernetes') || lowerPrompt.includes('k8s') || 
        lowerPrompt.includes('kubectl') || lowerPrompt.includes('helm') ||
        lowerPrompt.includes('pod') || lowerPrompt.includes('deployment') ||
        lowerPrompt.includes('service mesh') || lowerPrompt.includes('ingress')) {
      return 'kubernetes';
    }
    
    if (lowerPrompt.includes('aws') || lowerPrompt.includes('amazon') ||
        lowerPrompt.includes('ec2') || lowerPrompt.includes('s3') ||
        lowerPrompt.includes('lambda') || lowerPrompt.includes('rds') ||
        lowerPrompt.includes('vpc') || lowerPrompt.includes('iam') ||
        lowerPrompt.includes('cloudformation') || lowerPrompt.includes('ecs') ||
        lowerPrompt.includes('eks') || lowerPrompt.includes('fargate')) {
      return 'aws';
    }
    
    if (lowerPrompt.includes('gcp') || lowerPrompt.includes('google cloud') ||
        lowerPrompt.includes('compute engine') || lowerPrompt.includes('cloud storage') ||
        lowerPrompt.includes('cloud functions') || lowerPrompt.includes('cloud run') ||
        lowerPrompt.includes('gke') || lowerPrompt.includes('bigquery') ||
        lowerPrompt.includes('firestore') || lowerPrompt.includes('cloud sql')) {
      return 'gcp';
    }
    
    if (lowerPrompt.includes('azure') || lowerPrompt.includes('microsoft') ||
        lowerPrompt.includes('resource group') || lowerPrompt.includes('app service') ||
        lowerPrompt.includes('cosmos db') || lowerPrompt.includes('key vault') ||
        lowerPrompt.includes('aks') || lowerPrompt.includes('container instance') ||
        lowerPrompt.includes('storage account') || lowerPrompt.includes('function app')) {
      return 'azure';
    }
    
    return 'azure';
  }

  private parseCodeResponse(response: string, prompt: string, provider: string, codeType: string): { code: string; explanation: string } {
    const codeMatch = response.match(/CODE:\s*([\s\S]*?)\s*EXPLANATION:/);
    const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)$/);
    
    const code = codeMatch?.[1]?.trim() || this.generateFallbackTerraform(prompt, provider, codeType);
    const explanation = explanationMatch?.[1]?.trim() || `Generated ${codeType} code for ${provider} based on: ${prompt}`;
    
    return { code, explanation };
  }

  private parseAIResponse(response: string, context: DeploymentContext): AIResponse {
    const suggestionMatches = response.match(/^- .+$/gm);
    const suggestions = suggestionMatches?.map(s => s.replace(/^- /, '')) || [];

    const codeBlockMatch = response.match(/```(\w+)\n([\s\S]*?)\n```/);
    let codeSnippet;
    
    if (codeBlockMatch) {
      codeSnippet = {
        language: codeBlockMatch[1] as any,
        code: codeBlockMatch[2],
        description: 'Generated code snippet'
      };
    }

    const cleanMessage = response.replace(/```[\w]*\n[\s\S]*?\n```/g, '').trim();

    return {
      message: cleanMessage,
      suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : undefined,
      codeSnippet,
      nextSteps: this.extractNextSteps(response)
    };
  }

  private extractNextSteps(response: string): string[] {
    const nextStepsMatch = response.match(/(?:next steps?|recommendations?):?\s*\n((?:(?:\d+\.|\-)\s*.+\n?)+)/i);
    if (nextStepsMatch) {
      return nextStepsMatch[1]
        .split('\n')
        .filter(step => step.trim())
        .map(step => step.replace(/^\d+\.\s*|\-\s*/, '').trim())
        .slice(0, 3);
    }
    return [];
  }

  private getFallbackResponse(context: DeploymentContext): AIResponse {
    return {
      message: `I can help you with ${context.provider || 'cloud'} infrastructure deployment. Please ensure your OpenAI API key is configured in the environment variables for enhanced AI responses. For now, I can provide basic guidance based on your query: "${context.userQuery}"`,
      suggestions: [
        'Configure cloud provider credentials',
        'Review infrastructure requirements',
        'Check deployment logs for errors',
        'Verify resource quotas and limits'
      ]
    };
  }

  private getFallbackCode(prompt: string, provider: string, codeType: string): { code: string; explanation: string } {
    const fallbackCode = this.generateFallbackTerraform(prompt, provider, codeType);
    return {
      code: fallbackCode,
      explanation: `Generated ${codeType} template for ${provider} based on: "${prompt}". This is a basic template - configure your OpenAI API key for enhanced code generation with specific resource configurations.`
    };
  }

  private generateFallbackTerraform(prompt: string, provider: string, codeType: string): string {
    const resourceName = prompt.toLowerCase().includes('database') ? 'database' :
                        prompt.toLowerCase().includes('storage') ? 'storage' :
                        prompt.toLowerCase().includes('compute') || prompt.toLowerCase().includes('vm') ? 'compute' :
                        prompt.toLowerCase().includes('network') ? 'network' : 'infrastructure';

    if (provider === 'azure') {
      return `# ${codeType} configuration for Azure
# Generated from: ${prompt}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "instanti8-${resourceName}-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
    Project     = "${resourceName}"
    Purpose     = "Infrastructure deployment"
  }
}

# Additional resources based on your requirements
# Configure specific resources for your ${resourceName} needs`;
    }
    
    if (provider === 'aws') {
      return `# ${codeType} configuration for AWS
# Generated from: ${prompt}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "instanti8-${resourceName}-vpc"
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
    Project     = "${resourceName}"
  }
}

resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "instanti8-${resourceName}-subnet"
  }
}

# Additional AWS resources for your ${resourceName} requirements`;
    }
    
    if (provider === 'gcp') {
      return `# ${codeType} configuration for GCP
# Generated from: ${prompt}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = "us-central1"
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

resource "google_compute_network" "main" {
  name                    = "instanti8-${resourceName}-network"
  auto_create_subnetworks = false

  labels = {
    environment = "development"
    created-by  = "instanti8-dev"
    project     = "${resourceName}"
  }
}

resource "google_compute_subnetwork" "main" {
  name          = "instanti8-${resourceName}-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.main.id
}

# Additional GCP resources for your ${resourceName} needs`;
    }
    
    if (provider === 'kubernetes') {
      return `# ${codeType} configuration for Kubernetes
# Generated from: ${prompt}

apiVersion: apps/v1
kind: Deployment
metadata:
  name: instanti8-${resourceName}-app
  labels:
    app: instanti8-${resourceName}-app
    created-by: instanti8.dev
spec:
  replicas: 3
  selector:
    matchLabels:
      app: instanti8-${resourceName}-app
  template:
    metadata:
      labels:
        app: instanti8-${resourceName}-app
    spec:
      containers:
      - name: ${resourceName}-container
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: instanti8-${resourceName}-service
  labels:
    created-by: instanti8.dev
spec:
  selector:
    app: instanti8-${resourceName}-app
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
  type: LoadBalancer

# Additional Kubernetes resources for your ${resourceName} application`;
    }
    
    return `# ${codeType} code for ${provider}
# Generated from prompt: ${prompt}
# Configure your ${provider} resources for ${resourceName} here

# This is a basic template - configure OpenAI API key for detailed resource generation`;
  }
}

export const openaiService = new OpenAIService();
