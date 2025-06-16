import Groq from 'groq-sdk';

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

export class GroqAIService {
  private groq: Groq | null = null;
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `You are an expert cloud infrastructure and DevOps assistant for Instantiate.dev (</> instanti8.dev), a multi-cloud deployment platform. Your role is to help users with:

1. Infrastructure planning and architecture recommendations
2. Troubleshooting deployment issues across Azure, AWS, GCP and other cloud providers
3. Generating Infrastructure as Code (Terraform, Pulumi, Docker)
4. Optimizing cloud costs and performance
5. Security best practices and compliance
6. Real-time deployment assistance and error resolution

Always provide practical, actionable advice with code examples when relevant. Be concise but thorough.`;

    // Initialize Groq if API key is available
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      if (!this.groq) {
        return this.getFallbackResponse(context);
      }

      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...chatHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user' as const, content: this.buildContextualPrompt(context) }
      ];

      const completion = await this.groq.chat.completions.create({
        messages,
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(response, context);
    } catch (error: any) {
      console.error('Groq AI Service Error:', error);
      return this.getFallbackResponse(context);
    }
  }

  async generateInfrastructureCode(prompt: string, provider?: 'azure' | 'aws' | 'gcp' | 'kubernetes', codeType: 'terraform' | 'pulumi' = 'terraform'): Promise<{ code: string; explanation: string; detectedProvider?: string }> {
    try {
      const detectedProvider = provider || this.detectCloudProvider(prompt);
      
      if (!this.groq) {
        const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
        return { ...fallback, detectedProvider };
      }

      const codePrompt = `Generate ${codeType} code for ${detectedProvider} based on this request: "${prompt}". 

      IMPORTANT: Analyze the prompt carefully and ensure the generated code matches the requested cloud provider and services.
      
      Provide:
      1. Complete, production-ready code specific to ${detectedProvider}
      2. Proper resource naming conventions for ${detectedProvider}
      3. Best security practices for ${detectedProvider}
      4. Cost optimization considerations
      5. Appropriate resource types and configurations for the detected services
      
      Format your response as:
      CODE:
      [your ${detectedProvider}-specific code here]
      
      EXPLANATION:
      [detailed explanation of the generated infrastructure and why it matches the request]`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: codePrompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || '';
      const result = this.parseCodeResponse(response, prompt, detectedProvider, codeType);
      return { ...result, detectedProvider };
    } catch (error: any) {
      console.error('Infrastructure Code Generation Error:', error);
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
      message: `I can help you with ${context.provider || 'cloud'} infrastructure deployment. Please configure your Groq API key in the environment variables for enhanced AI responses. For now, I can provide basic guidance based on your query: "${context.userQuery}"`,
      suggestions: [
        'Configure cloud provider credentials',
        'Review infrastructure requirements',
        'Check deployment logs for errors',
        'Verify resource quotas and limits'
      ]
    };
  }

  private getFallbackCode(prompt: string, provider: string, codeType: string): { code: string; explanation: string } {
    return {
      code: this.generateFallbackTerraform(prompt, provider, codeType),
      explanation: `Generated basic ${codeType} template for ${provider}. Configure Groq API key for enhanced code generation.`
    };
  }

  private generateFallbackTerraform(prompt: string, provider: string, codeType: string): string {
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
  name     = "instantiate-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "Instantiate"
    Project     = "Infrastructure"
  }
}`;
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
    Name        = "instantiate-vpc"
    Environment = "Development"
    CreatedBy   = "Instantiate"
  }
}`;
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
  name                    = "instantiate-network"
  auto_create_subnetworks = false
}`;
    }
    
    if (provider === 'kubernetes') {
      return `# ${codeType} configuration for Kubernetes
# Generated from: ${prompt}

apiVersion: apps/v1
kind: Deployment
metadata:
  name: instantiate-app
  labels:
    app: instantiate-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: instantiate-app
  template:
    metadata:
      labels:
        app: instantiate-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: instantiate-service
spec:
  selector:
    app: instantiate-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer`;
    }
    
    return `# ${codeType} code for ${provider}\n# Generated from prompt: ${prompt}\n\n# Configure your ${provider} resources here`;
  }
}

export const groqAIService = new GroqAIService();
