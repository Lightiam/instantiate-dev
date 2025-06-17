# Instantiate.dev - AI-Powered Multi-Cloud Infrastructure Platform

🚀 Professional multi-cloud deployment platform with AI-powered infrastructure code generation and real-time analytics

## ✨ Key Features

### 🤖 AI-Powered Infrastructure Generation
- **Natural Language Processing**: Describe your infrastructure needs in plain English
- **Multi-Cloud Code Generation**: Automatic Terraform/Pulumi code generation for AWS, Azure, GCP, and Kubernetes
- **Groq AI Integration**: Advanced language model for intelligent infrastructure planning
- **Provider Detection**: Automatically detects target cloud provider from user prompts

### ☁️ Multi-Cloud Support
- **AWS Integration**: ECS, EC2, Lambda, RDS, VPC, and more
- **Azure Integration**: Container Instances, App Service, Storage Accounts, Resource Groups
- **Google Cloud Platform**: Cloud Functions, GKE, Cloud Storage, BigQuery
- **Kubernetes**: Cluster management and application deployment
- **Unified Dashboard**: Single interface for all cloud providers

### 🎯 Professional Interface
- **Enterprise-Grade UI**: Matches industry-standard deployment platforms
- **Real-time Analytics**: Live monitoring and performance metrics
- **Interactive Chat**: ChatGPT-like interface for infrastructure assistance
- **Code Editor**: Built-in editor with syntax highlighting and validation

### 🔧 Advanced Capabilities
- **Infrastructure as Code**: Generate production-ready Terraform configurations
- **Deployment Automation**: One-click deployment to multiple cloud providers
- **Credential Management**: Secure storage and management of cloud credentials
- **Cost Analysis**: Real-time cost monitoring and optimization suggestions
- **Security Assessment**: Automated security scanning and compliance checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Cloud provider accounts (AWS, Azure, GCP)
- Groq API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lightiam/instantiate-dev.git
   cd instantiate-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start the development servers**
   
   **Important**: Both frontend and backend servers must be running simultaneously for full functionality.
   
   ```bash
   # Terminal 1: Start frontend (port 8080)
   npm run dev

   # Terminal 2: Start backend (port 5000)
   npx tsx server/index.ts
   ```
   
   **Alternative**: Use the combined script (after step 6)
   ```bash
   npm run dev:full
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - API: http://localhost:5000

## 🔑 Environment Configuration

### Required Variables
```env
# AI-Powered Code Generation
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=your_postgresql_database_url

# Server Configuration
NODE_ENV=development
PORT=5000
```

### Cloud Provider Credentials (Optional)
Configure via UI or environment variables:

```env
# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# Azure
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id

# Google Cloud Platform
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
GCP_PROJECT_ID=your_gcp_project_id

# Kubernetes
KUBECONFIG=path_to_kubeconfig_file
```

## 💡 Usage Examples

### AI-Powered Infrastructure Generation

**Example Prompts:**
- "Deploy a web application to AWS using ECS with load balancer and RDS database"
- "Create Azure storage account with blob containers and App Service for web hosting"
- "Set up GCP Cloud Functions with Cloud Storage and BigQuery for data processing"
- "Create a Kubernetes cluster on GCP with 3 nodes and deploy a web application"

**Generated Output:**
The system automatically detects the target cloud provider and generates appropriate Terraform code:

```hcl
# AWS Example Output
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
}
```

### API Integration

**Code Generation API:**
```javascript
const response = await fetch('/api/multi-cloud/generate-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Deploy a containerized app to Azure",
    codeType: "terraform"
  })
});

const result = await response.json();
console.log(result.terraform); // Generated Terraform code
console.log(result.detectedProvider); // "azure"
```

**Deployment API:**
```javascript
const deploymentSpec = {
  name: "my-app",
  image: "nginx:alpine",
  resourceGroup: "my-rg",
  location: "West US 3",
  cpu: 0.5,
  memory: 1.0,
  ports: [80]
};

const response = await fetch('/api/multi-cloud/azure/deploy-verified', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(deploymentSpec)
});
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Wouter routing
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI Integration**: OpenAI API for natural language processing
- **Cloud SDKs**: AWS SDK, Azure SDK, Google Cloud SDK
- **Infrastructure**: Terraform/Pulumi code generation

### Project Structure
```
instantiate-dev/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   └── lib/               # Utilities and helpers
├── server/                # Backend Node.js application
│   ├── routes/            # API route handlers
│   ├── cloud-providers/   # Cloud provider integrations
│   └── services/          # Business logic services
└── docs/                  # Documentation
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start frontend development server
npm run dev:backend  # Start backend development server
npm run dev:full     # Start both frontend and backend servers
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### API Endpoints
- `POST /api/multi-cloud/generate-code` - Generate infrastructure code
- `POST /api/multi-cloud/deploy` - Deploy to cloud providers
- `POST /api/multi-cloud/azure/deploy-verified` - Azure-specific deployment
- `GET /api/health` - Health check endpoint
- `POST /api/credentials/*` - Credential management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@instantiate.dev
- 💬 Discord: [Join our community](https://discord.gg/instantiate)
- 📖 Documentation: [docs.instantiate.dev](https://docs.instantiate.dev)

---

Built with ❤️ by the Instantiate.dev team
