import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface DeploymentContext {
  provider?: 'azure' | 'aws' | 'replit';
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
  private groq: Groq;
  private systemPrompt: string;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    this.systemPrompt = `You are an expert cloud infrastructure and DevOps assistant for Instantiate.dev, a multi-cloud deployment platform. Your role is to help users with:

1. Infrastructure planning and architecture recommendations
2. Troubleshooting deployment issues across Azure, AWS, and Replit
3. Generating Infrastructure as Code (Terraform, Pulumi, Docker)
4. Optimizing cloud costs and performance
5. Security best practices and compliance
6. Real-time deployment assistance and error resolution

Key capabilities:
- Analyze deployment logs and error messages
- Suggest specific fixes for failed deployments
- Generate working code examples
- Provide step-by-step troubleshooting guides
- Recommend best practices for each cloud provider
- Help with container orchestration and serverless architectures

Always provide practical, actionable advice with specific examples. When generating code, ensure it's production-ready and follows security best practices.

Response format:
- Provide clear, step-by-step solutions
- Include relevant code snippets when helpful
- Suggest preventive measures for future deployments
- Reference specific error codes and troubleshooting steps
- Recommend optimal configurations for each cloud provider`;
  }

  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: this.formatUserQuery(context) }
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

      return this.parseAIResponse(response, context);
    } catch (error: any) {
      console.error('AI Chat Service Error:', error);
      return {
        message: 'I encountered an issue while processing your request. Please try again or contact support if the problem persists.',
        suggestions: ['Check your internet connection', 'Try rephrasing your question', 'Contact support for assistance']
      };
    }
  }

  async generateInfrastructureCode(prompt: string, provider: 'azure' | 'aws' | 'replit', codeType: 'terraform' | 'pulumi'): Promise<{ code: string; explanation: string }> {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        { 
          role: 'user', 
          content: `Generate ${codeType} code for ${provider} to: ${prompt}. ${provider === 'aws' ? 'Include proper VPC, security groups, and load balancer configuration for secure web applications.' : ''} Provide the code and a brief explanation of what it does.` 
        }
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Extract code and explanation from response
      const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : response;
      const explanation = response.replace(/```[\w]*\n[\s\S]*?\n```/g, '').trim();

      return { code, explanation };
    } catch (error: any) {
      console.error('Infrastructure Code Generation Error:', error);
      return {
        code: '# Error generating code',
        explanation: 'Unable to generate infrastructure code at this time.'
      };
    }
  }

  async troubleshootDeployment(errorMessage: string, context: DeploymentContext): Promise<AIResponse> {
    const troubleshootingContext: DeploymentContext = {
      ...context,
      userQuery: `I'm experiencing a deployment error: ${errorMessage}. Please help me troubleshoot and resolve this issue.`
    };

    return this.generateResponse(troubleshootingContext);
  }

  async optimizeInfrastructure(currentSetup: any, goals: string[]): Promise<AIResponse> {
    const optimizationContext: DeploymentContext = {
      userQuery: `Please help me optimize my current infrastructure setup. Goals: ${goals.join(', ')}`,
      currentInfrastructure: currentSetup
    };

    return this.generateResponse(optimizationContext);
  }

  private formatUserQuery(context: DeploymentContext): string {
    let query = context.userQuery;
    
    if (context.provider) {
      query += `\n\nCloud Provider: ${context.provider}`;
    }
    
    if (context.resourceType) {
      query += `\nResource Type: ${context.resourceType}`;
    }
    
    if (context.deploymentId) {
      query += `\nDeployment ID: ${context.deploymentId}`;
    }
    
    if (context.errorLogs) {
      query += `\n\nError Logs:\n${context.errorLogs}`;
    }
    
    if (context.currentInfrastructure) {
      query += `\n\nCurrent Infrastructure:\n${JSON.stringify(context.currentInfrastructure, null, 2)}`;
    }

    return query;
  }

  private parseAIResponse(response: string, context: DeploymentContext): AIResponse {
    // Extract code snippets if present
    const codeMatches = response.match(/```(\w+)?\n([\s\S]*?)\n```/g);
    let codeSnippet;
    
    if (codeMatches && codeMatches.length > 0) {
      const firstMatch = codeMatches[0];
      const languageMatch = firstMatch.match(/```(\w+)?/);
      const codeMatch = firstMatch.match(/```\w*\n([\s\S]*?)\n```/);
      
      if (codeMatch) {
        codeSnippet = {
          language: (languageMatch?.[1] as any) || 'bash',
          code: codeMatch[1],
          description: 'Generated code snippet'
        };
      }
    }

    // Extract suggestions (lines starting with -)
    const suggestionMatches = response.match(/^- .+$/gm);
    const suggestions = suggestionMatches?.map(s => s.replace(/^- /, '')) || [];

    // Clean message by removing code blocks
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
}

const aiChatService = new AIChatService();
export { aiChatService };
