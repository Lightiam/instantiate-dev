import OpenAI from 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ConversationContext {
  messages: ChatMessage[];
  conversationId?: string;
  lastActivity?: Date;
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
  private conversations: Map<string, ConversationContext> = new Map();
  private codeExtractionRegex = /^```(?:[^\n]*)\n([\s\S]*?)\n```$/gm;
  private isInitialized = false;
  private initializationError: string | null = null;

  constructor() {
    this.systemPrompt = `You are an expert cloud infrastructure and DevOps assistant for </> instanti8.dev, a multi-cloud deployment platform. Your role is to help users with:

1. Infrastructure planning and architecture recommendations
2. Troubleshooting deployment issues across Azure, AWS, GCP and other cloud providers
3. Generating Infrastructure as Code (Terraform, Pulumi, Docker) 
4. Optimizing cloud costs and performance
5. Security best practices and compliance
6. Real-time deployment assistance and error resolution

Always provide practical, actionable advice with code examples when relevant. Be concise but thorough.`;

    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      console.log('🔧 OpenAI Service Initialization starting...');
      
      // Try multiple possible environment variable names for OpenAI API key
      const possibleApiKeys = [
        { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY },
        { name: 'Open_AI_Key', value: process.env.Open_AI_Key },
        { name: 'OPEN_AI_API_KEY', value: process.env.OPEN_AI_API_KEY },
        { name: 'openai_api_key', value: process.env.openai_api_key },
        { name: 'OPEN_AI_KEY', value: process.env.OPEN_AI_KEY },
        { name: 'OpenAI_API_Key', value: process.env.OpenAI_API_Key }
      ];
      
      const envKeys = Object.keys(process.env);
      console.log('🔍 Environment analysis:');
      console.log('- Total env vars:', envKeys.length);
      console.log('- OpenAI-related vars:', envKeys.filter(k => 
        k.toLowerCase().includes('openai') || 
        k.toLowerCase().includes('open_ai') ||
        k.toLowerCase().includes('ai_key')
      ));
      
      console.log('🔑 Checking possible API key names:');
      possibleApiKeys.forEach(({ name, value }) => {
        console.log(`- ${name}: ${value ? 'found' : 'not found'} ${value ? `(length: ${value.length})` : ''}`);
      });
      
      const apiKey = possibleApiKeys.find(({ value }) => value && value.trim().length > 0)?.value;
      
      if (!apiKey || apiKey.trim().length === 0) {
        this.initializationError = 'OpenAI API key not found in environment variables. Expected one of: OPENAI_API_KEY, Open_AI_Key, OPEN_AI_API_KEY, openai_api_key, OPEN_AI_KEY, or OpenAI_API_Key';
        console.error('❌', this.initializationError);
        this.openai = null;
        this.isInitialized = false;
        return;
      }

      // Validate API key format
      const trimmedKey = apiKey.trim();
      if (!trimmedKey.startsWith('sk-') || trimmedKey.length < 20) {
        this.initializationError = `Invalid OpenAI API key format. API keys should start with "sk-" and be longer than 20 characters. Found key: ${trimmedKey.substring(0, 7)}...${trimmedKey.substring(trimmedKey.length - 4)} (length: ${trimmedKey.length})`;
        console.error('❌', this.initializationError);
        this.openai = null;
        this.isInitialized = false;
        return;
      }

      console.log('✅ Valid API key found, initializing OpenAI client...');
      this.openai = new OpenAI({ 
        apiKey: trimmedKey,
        timeout: 60000 // 60 second timeout
      });
      
      this.isInitialized = true;
      this.initializationError = null;
      console.log('✅ OpenAI service initialized successfully');
      
      // Test the connection
      this.testConnection();
    } catch (error: any) {
      this.initializationError = `Failed to initialize OpenAI service: ${error.message}`;
      console.error('❌', this.initializationError, error);
      this.openai = null;
      this.isInitialized = false;
    }
  }

  private async testConnection() {
    try {
      console.log('🧪 Testing OpenAI connection...');
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }
      
      const testResponse = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
        max_tokens: 5,
        temperature: 0
      });
      
      console.log('✅ OpenAI connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ OpenAI connection test failed:', error.message);
      this.initializationError = `OpenAI connection test failed: ${error.message}`;
      this.isInitialized = false;
      return false;
    }
  }

  async generateResponse(context: DeploymentContext, chatHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      if (!this.isInitialized || !this.openai) {
        console.error('❌ OpenAI service not initialized:', this.initializationError);
        return this.getFallbackResponse(context);
      }

      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...chatHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user' as const, content: this.buildContextualPrompt(context) }
      ];

      console.log('📡 Calling OpenAI chat completion API...');
      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('✅ OpenAI chat response received, length:', response.length);
      return this.parseAIResponse(response, context);
    } catch (error: any) {
      console.error('💥 OpenAI chat completion error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code
      });
      return this.getFallbackResponse(context);
    }
  }

  async generateInfrastructureCode(prompt: string, provider?: 'azure' | 'aws' | 'gcp' | 'kubernetes', codeType: 'terraform' | 'pulumi' = 'terraform', conversationId?: string): Promise<{ code: string; explanation: string; detectedProvider?: string }> {
    try {
      console.log(`🚀 Infrastructure code generation starting...`);
      console.log(`📝 Prompt: "${prompt}"`);
      console.log(`🎯 Provider: ${provider || 'auto-detect'}`);
      console.log(`🔧 Code type: ${codeType}`);
      console.log(`🔑 Service initialized: ${this.isInitialized}`);
      
      if (this.initializationError) {
        console.log(`❌ Initialization error: ${this.initializationError}`);
      }
      
      const detectedProvider = provider || this.detectCloudProvider(prompt);
      console.log(`🎯 Final provider: ${detectedProvider}`);
      
      if (!this.isInitialized || !this.openai) {
        console.log('⚠️ OpenAI not available, using fallback code generation');
        const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
        return { ...fallback, detectedProvider };
      }

      const conversation = this.getOrCreateConversation(conversationId);
      
      const enhancedPrompt = `Generate production-ready ${codeType} infrastructure code for ${detectedProvider} cloud provider.

REQUEST: "${prompt}"

REQUIREMENTS:
- Generate ONLY valid ${codeType} code for ${detectedProvider}
- Include proper provider configuration and required resources
- Use appropriate resource naming conventions for ${detectedProvider}
- Include security best practices and proper tagging
- Make the code deployable and functional
- Focus specifically on: ${prompt}

Return ONLY the code in a markdown code block:

\`\`\`${codeType}
# Your ${codeType} code here
\`\`\`

Generate the infrastructure code now:`;

      conversation.messages.push({
        role: 'user',
        content: enhancedPrompt,
        timestamp: new Date().toISOString()
      });

      console.log('📡 Calling OpenAI API for code generation...');
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert Infrastructure as Code generator. Generate only valid, production-ready code in markdown code blocks. Be specific and accurate.' },
          ...conversation.messages.slice(-3) // Keep last 3 messages for context
        ],
        model: 'gpt-4o-mini',
        temperature: 0.1, // Very low temperature for consistent code generation
        max_tokens: 2500,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('✅ OpenAI code generation response received, length:', response.length);
      
      if (!response || response.length < 50) {
        throw new Error('OpenAI returned empty or very short response');
      }
      
      conversation.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });
      
      const extractedCode = this.extractCodeFromResponse(response);
      console.log('📄 Extracted code analysis:', {
        found: !!extractedCode,
        length: extractedCode?.length || 0,
        hasResources: extractedCode?.includes('resource') || false,
        hasProvider: extractedCode?.includes('provider') || false
      });
      
      if (!extractedCode || extractedCode.length < 50) {
        console.log('⚠️ OpenAI response insufficient, using fallback');
        const fallback = this.getFallbackCode(prompt, detectedProvider, codeType);
        return { ...fallback, detectedProvider };
      }

      const explanation = `Generated ${codeType} infrastructure code for ${detectedProvider} to fulfill your request: "${prompt}". This code includes proper provider configuration, resource definitions, and follows best practices for security and naming conventions.`;
      
      console.log('🎉 Successfully generated infrastructure code');
      return { 
        code: extractedCode, 
        explanation, 
        detectedProvider 
      };
    } catch (error: any) {
      console.error('💥 Infrastructure Code Generation Error:', error);
      console.error('Detailed error info:', {
        name: error.name,
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code,
        response: error.response?.data,
        stack: error.stack?.substring(0, 500)
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
    
    const providerPatterns = {
      kubernetes: [
        'kubernetes', 'k8s', 'gke', 'eks', 'aks', 'cluster', 'pod', 'deployment', 'service mesh',
        'ingress', 'helm', 'kubectl', 'container orchestration', 'namespace', 'configmap'
      ],
      aws: [
        'aws', 'amazon', 's3', 'ec2', 'lambda', 'rds', 'vpc', 'cloudformation', 'iam',
        'elastic', 'dynamo', 'sqs', 'sns', 'cloudwatch', 'route53', 'elb', 'alb', 'ecs', 'fargate'
      ],
      gcp: [
        'gcp', 'google cloud', 'gce', 'cloud storage', 'compute engine', 'cloud sql',
        'cloud functions', 'bigquery', 'cloud run', 'firebase', 'app engine', 'gke', 'firestore'
      ],
      azure: [
        'azure', 'microsoft', 'blob', 'cosmos', 'app service', 'sql database', 'vnet', 'nsg',
        'resource group', 'virtual machine', 'storage account', 'function app', 'key vault', 'aks', 'container instance'
      ]
    };
    
    const scores = { kubernetes: 0, aws: 0, gcp: 0, azure: 0 };
    
    for (const [provider, keywords] of Object.entries(providerPatterns)) {
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          scores[provider as keyof typeof scores] += 1;
          if (['aws', 'azure', 'gcp', 'kubernetes'].includes(keyword)) {
            scores[provider as keyof typeof scores] += 2;
          }
        }
      }
    }
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      const detectedProvider = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
      if (detectedProvider) {
        console.log(`🎯 Detected cloud provider: ${detectedProvider} (score: ${maxScore})`);
        return detectedProvider;
      }
    }
    
    console.log('🎯 No specific provider detected, defaulting to Azure');
    return 'azure';
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
    const errorMsg = this.initializationError || 'OpenAI service unavailable';
    return {
      message: `I can help you with ${context.provider || 'cloud'} infrastructure deployment. However, there's an issue with the OpenAI configuration: ${errorMsg}. Please check your API key configuration in Supabase Edge Function Secrets.`,
      suggestions: [
        'Configure OpenAI API key in Supabase Edge Function Secrets',
        'Verify API key format (should start with sk-)',
        'Review infrastructure requirements',
        'Check deployment logs for errors'
      ]
    };
  }

  private getFallbackCode(prompt: string, provider: string, codeType: string): { code: string; explanation: string } {
    const resourceName = prompt.toLowerCase().includes('database') ? 'database' :
                        prompt.toLowerCase().includes('storage') ? 'storage' :
                        prompt.toLowerCase().includes('compute') || prompt.toLowerCase().includes('vm') ? 'compute' :
                        prompt.toLowerCase().includes('network') || prompt.toLowerCase().includes('vnet') || prompt.toLowerCase().includes('vpc') ? 'network' : 
                        prompt.toLowerCase().includes('container') ? 'container' : 'infrastructure';

    if (provider === 'azure') {
      if (prompt.toLowerCase().includes('vnet') || prompt.toLowerCase().includes('network') || prompt.toLowerCase().includes('subnet')) {
        return `# ${codeType} configuration for Azure Virtual Network
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

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "instanti8-network-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
    Project     = "Network Infrastructure"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "instanti8-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
  }
}

# Public Subnet
resource "azurerm_subnet" "public" {
  name                 = "public-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Private Subnet
resource "azurerm_subnet" "private" {
  name                 = "private-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Network Security Group for Public Subnet
resource "azurerm_network_security_group" "public" {
  name                = "public-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "HTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTPS"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
  }
}

# Network Security Group for Private Subnet
resource "azurerm_network_security_group" "private" {
  name                = "private-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "AllowVnetInBound"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "*"
  }

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
  }
}

# Associate NSG to Public Subnet
resource "azurerm_subnet_network_security_group_association" "public" {
  subnet_id                 = azurerm_subnet.public.id
  network_security_group_id = azurerm_network_security_group.public.id
}

# Associate NSG to Private Subnet
resource "azurerm_subnet_network_security_group_association" "private" {
  subnet_id                 = azurerm_subnet.private.id
  network_security_group_id = azurerm_network_security_group.private.id
}

# Public IP for Load Balancer
resource "azurerm_public_ip" "lb" {
  name                = "instanti8-lb-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
  }
}

# Load Balancer
resource "azurerm_lb" "main" {
  name                = "instanti8-lb"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.lb.id
  }

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
  }
}

# Load Balancer Backend Pool
resource "azurerm_lb_backend_address_pool" "main" {
  loadbalancer_id = azurerm_lb.main.id
  name            = "BackEndAddressPool"
}

# Load Balancer Probe
resource "azurerm_lb_probe" "main" {
  loadbalancer_id = azurerm_lb.main.id
  name            = "http-probe"
  port            = 80
  protocol        = "Http"
  request_path    = "/"
}

# Load Balancer Rule
resource "azurerm_lb_rule" "main" {
  loadbalancer_id                = azurerm_lb.main.id
  name                           = "LBRule"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.main.id
}

# Outputs
output "virtual_network_id" {
  value       = azurerm_virtual_network.main.id
  description = "ID of the virtual network"
}

output "public_subnet_id" {
  value       = azurerm_subnet.public.id
  description = "ID of the public subnet"
}

output "private_subnet_id" {
  value       = azurerm_subnet.private.id
  description = "ID of the private subnet"
}

output "load_balancer_public_ip" {
  value       = azurerm_public_ip.lb.ip_address
  description = "Public IP address of the load balancer"
}`;
      }

      if (prompt.toLowerCase().includes('container')) {
        return `# ${codeType} configuration for Azure Container Instances
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

resource "azurerm_resource_group" "container_rg" {
  name     = "instanti8-container-rg"
  location = "East US"

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
    Project     = "Container"
    Purpose     = "Container deployment"
  }
}

resource "azurerm_container_group" "main" {
  name                = "instanti8-container-group"
  location            = azurerm_resource_group.container_rg.location
  resource_group_name = azurerm_resource_group.container_rg.name
  ip_address_type     = "Public"
  dns_name_label      = "instanti8-container-app"
  os_type             = "Linux"

  container {
    name   = "main-container"
    image  = "nginx:alpine"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  tags = {
    Environment = "Development"
    CreatedBy   = "instanti8.dev"
    Project     = "Container"
  }
}

output "container_ip_address" {
  value = azurerm_container_group.main.ip_address
}

output "container_fqdn" {
  value = azurerm_container_group.main.fqdn
}`;
      }

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
