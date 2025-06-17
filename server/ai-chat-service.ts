
import { openaiService } from './openai-ai-service';

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

export class AIChatService {
  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    return await openaiService.generateResponse(context, chatHistory);
  }

  async generateInfrastructureCode(prompt: string, provider: 'azure' | 'aws' | 'gcp', codeType: 'terraform' | 'pulumi'): Promise<{ code: string; explanation: string }> {
    return await openaiService.generateInfrastructureCode(prompt, provider, codeType);
  }
}

const aiChatService = new AIChatService();
export { aiChatService };
