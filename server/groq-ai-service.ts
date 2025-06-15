
import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface DeploymentContext {
  provider?: 'azure' | 'aws' | 'gcp';
  resourceType?: string;
  userQuery: string;
  errorLogs?: string;
  currentInfrastructure?: any;
  deploymentId?: string;
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

  async generateInfrastructureCode(prompt: string, provider: 'azure' | 'aws' | 'gcp', codeType: 'terraform' | 'pulumi'): Promise<{ code: string; explanation: string }> {
    try {
      if (!this.groq) {
        return this.getFallbackCode(prompt, provider, codeType);
      }

      const codePrompt = `Generate ${codeType} code for ${provider} based on this request: "${prompt}". 
      
      Provide:
      1. Complete, production-ready code
      2. Proper resource naming conventions
      3. Best security practices
      4. Cost optimization considerations
      
      Format your response as:
      CODE:
      [your code here]
      
      EXPLANATION:
      [explanation here]`;

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
      return this.parseCodeResponse(response, prompt, provider, codeType);
    } catch (error: any) {
      console.error('Infrastructure Code Generation Error:', error);
      return this.getFallbackCode(prompt, provider, codeType);
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

  private parseCodeResponse(response: string, prompt: string, provider: string, codeType: string): { code: string; explanation: string } {
    const codeMatch = response.match(/CODE:\s*([\s\S]*?)\s*EXPLANATION:/);
    const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)$/);
    
    const code = codeMatch?.[1]?.trim() || this.generateFallbackTerraform(prompt, provider);
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
      code: this.generateFallbackTerraform(prompt, provider),
      explanation: `Generated basic ${codeType} template for ${provider}. Configure Groq API key for enhanced code generation.`
    };
  }

  private generateFallbackTerraform(prompt: string, provider: string): string {
    if (provider === 'azure') {
      return `# Terraform configuration for Azure
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
    
    return `# ${codeType} code for ${provider}\n# Generated from prompt: ${prompt}\n\n# Configure your ${provider} resources here`;
  }
}

export const groqAIService = new GroqAIService();
