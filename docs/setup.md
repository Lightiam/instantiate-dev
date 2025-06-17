# Development Setup Guide

## Prerequisites

Before setting up Instantiate.dev, ensure you have the following installed:

- **Node.js 18+** and npm/yarn
- **PostgreSQL database** (local or remote)
- **Git** for version control
- **Cloud provider accounts** (AWS, Azure, GCP) - optional for deployment testing
- **OpenAI API key** for AI-powered code generation

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Lightiam/instantiate-dev.git
cd instantiate-dev

# Install dependencies
npm install
```

### 2. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Required: AI-Powered Code Generation
OPENAI_API_KEY=your_openai_api_key_here

# Required: Database
DATABASE_URL=your_postgresql_database_url

# Required: Server Configuration
NODE_ENV=development
PORT=5000

# Optional: Cloud Provider Credentials (for actual deployments)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id

GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
GCP_PROJECT_ID=your_gcp_project_id

KUBECONFIG=path_to_kubeconfig_file
```

### 3. Database Setup

Ensure your PostgreSQL database is running and accessible via the `DATABASE_URL` you configured.

### 4. Start Development Servers

**Critical**: Both frontend and backend servers must be running simultaneously for the application to work properly.

#### Option A: Manual Start (Recommended for Development)

Open two terminal windows/tabs:

**Terminal 1 - Frontend Server:**
```bash
npm run dev
```
This starts the React frontend on http://localhost:8080

**Terminal 2 - Backend Server:**
```bash
npx tsx server/index.ts
```
This starts the Node.js backend API on http://localhost:5000

#### Option B: Combined Start

```bash
npm run dev:full
```
This starts both servers simultaneously using concurrently.

### 5. Verify Setup

1. **Frontend Access**: Open http://localhost:8080 in your browser
2. **Backend Health**: Check http://localhost:5000/api/health
3. **Code Generation**: Test the Multi-Cloud section in the dashboard
4. **Deploy Buttons**: Verify deploy buttons in the Projects section

## Development Workflow

### Daily Development

1. **Start both servers** (frontend + backend)
2. **Make changes** to frontend (src/) or backend (server/) code
3. **Hot reload** will automatically refresh the frontend
4. **Backend changes** require manual restart of the backend server

### Testing Code Generation

1. Navigate to the **Multi-Cloud** section in the dashboard
2. Select a resource type (e.g., "Kubernetes Cluster")
3. Enter a prompt like: "Create a GKE cluster on Google Cloud Platform with 3 nodes"
4. Click **Generate IaC Code**
5. Verify the generated Terraform code and provider detection

### Testing Deploy Functionality

1. Go to the **Projects** section
2. Click the **Deploy** button on any project
3. Check browser console and backend logs for deployment status

## Troubleshooting

### Common Issues

**Issue**: "Failed to generate IaC code" or 500 errors
- **Solution**: Ensure backend server is running and OPENAI_API_KEY is set

**Issue**: Frontend loads but API calls fail
- **Solution**: Verify backend server is running on port 5000

**Issue**: "No queryFn was passed" errors in console
- **Solution**: These are non-critical React Query warnings, functionality still works

**Issue**: Authentication issues
- **Solution**: Development mode auto-authenticates, no setup needed for local development

### Logs and Debugging

**Frontend logs**: Check browser console (F12)
**Backend logs**: Check terminal running `npx tsx server/index.ts`

### Port Conflicts

If ports 8080 or 5000 are in use:

**Frontend**: Edit `vite.config.ts` to change the port
**Backend**: Edit `server/index.ts` or set `PORT` environment variable

## Production Deployment

For production deployment:

1. **Build the frontend**: `npm run build`
2. **Set production environment variables**
3. **Configure cloud provider credentials**
4. **Set up PostgreSQL database**
5. **Deploy to your hosting platform**

## API Endpoints

Key endpoints for development:

- `POST /api/multi-cloud/generate-code` - Generate infrastructure code
- `POST /api/multi-cloud/deploy` - Deploy to cloud providers
- `GET /api/health` - Health check
- `GET /api/projects` - Get projects list
- `GET /api/stats` - Get dashboard statistics

## Support

If you encounter issues:

1. Check this setup guide
2. Review the main README.md
3. Check GitHub issues
4. Contact the development team

---

**Next Steps**: Once setup is complete, explore the Multi-Cloud section to test AI-powered infrastructure code generation!
