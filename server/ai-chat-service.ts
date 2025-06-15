
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface DeploymentContext {
  provider?: 'azure' | 'replit';
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

export class AIChatService {
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `You are an expert cloud infrastructure and DevOps assistant for Instantiate.dev, a multi-cloud deployment platform. Your role is to help users with:

1. Infrastructure planning and architecture recommendations
2. Troubleshooting deployment issues across Azure and Replit
3. Generating Infrastructure as Code (Terraform, Pulumi, Docker)
4. Optimizing cloud costs and performance
5. Security best practices and compliance
6. Real-time deployment assistance and error resolution`;
  }

  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      // Simulate AI response for now
      const response = this.generateMockResponse(context);
      return this.parseAIResponse(response, context);
    } catch (error: any) {
      console.error('AI Chat Service Error:', error);
      return {
        message: 'I encountered an issue while processing your request. Please try again or contact support if the problem persists.',
        suggestions: ['Check your internet connection', 'Try rephrasing your question', 'Contact support for assistance']
      };
    }
  }

  async generateInfrastructureCode(prompt: string, provider: 'azure' | 'replit', codeType: 'terraform' | 'pulumi'): Promise<{ code: string; explanation: string }> {
    try {
      // Generate mock Terraform code based on prompt
      const code = this.generateMockTerraformCode(prompt, provider);
      const explanation = `Generated ${codeType} code for ${provider} based on your request: ${prompt}`;
      
      return { code, explanation };
    } catch (error: any) {
      console.error('Infrastructure Code Generation Error:', error);
      return {
        code: '# Error generating code',
        explanation: 'Unable to generate infrastructure code at this time.'
      };
    }
  }

  private generateMockResponse(context: DeploymentContext): string {
    if (context.userQuery.toLowerCase().includes('resource group')) {
      return `I can help you with Azure resource group operations. Based on your request, I recommend creating a resource group in the East US region with appropriate tags for tracking and management.

Suggested steps:
- Verify your Azure credentials are configured correctly
- Choose an appropriate naming convention
- Select the optimal Azure region for your workload
- Add relevant tags for cost tracking and organization

Would you like me to generate the Terraform code for this deployment?`;
    }

    return `I can help you with cloud infrastructure deployment. Please provide more specific details about what you'd like to deploy to Azure.`;
  }

  private generateMockTerraformCode(prompt: string, provider: string): string {
    if (prompt.toLowerCase().includes('resource group')) {
      return `resource "azurerm_resource_group" "main" {
  name     = "instanti8-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "Instanti8"
    Project     = "Infrastructure"
  }
}`;
    }

    return `# Terraform code for ${provider}
# Generated from prompt: ${prompt}

resource "azurerm_resource_group" "example" {
  name     = "example-rg"
  location = "East US"
}`;
  }

  private parseAIResponse(response: string, context: DeploymentContext): AIResponse {
    const suggestionMatches = response.match(/^- .+$/gm);
    const suggestions = suggestionMatches?.map(s => s.replace(/^- /, '')) || [];

    const cleanMessage = response.replace(/```[\w]*\n[\s\S]*?\n```/g, '').trim();

    return {
      message: cleanMessage,
      suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : undefined,
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
}

const aiChatService = new AIChatService();
export { aiChatService };
