# Environment Variables Setup Guide

## Required for Full Functionality

### Database (Already Configured)
```
DATABASE_URL=postgresql://neondb_owner:npg_FE5lzguCWNQ7@ep-plain-cake-a5dj6iy2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### AI Chat Assistant (Already Configured)
```
GROQ_API_KEY=Configured
```

## Cloud Provider Integration

### AWS (Optional - for AWS deployments)
1. Go to AWS IAM Console
2. Create new access key
3. Add to Netlify environment variables:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### Azure (Optional - for Azure deployments)
1. Go to Azure Portal > App Registrations
2. Create new app registration
3. Add to Netlify environment variables:
```
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...
AZURE_SUBSCRIPTION_ID=...
```

### Google Cloud (Optional - for GCP deployments)
1. Go to GCP Console > Service Accounts
2. Create service account and download JSON key
3. Add to Netlify environment variables:
```
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_KEY=base64_encoded_json_key
```

## Netlify Deployment Steps

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Select GitHub and choose: Imole-cloud/-Instantiate.dev

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Add Environment Variables**
   In Netlify Site Settings > Environment Variables:
   - DATABASE_URL: postgresql://neondb_owner:npg_FE5lzguCWNQ7@ep-plain-cake-a5dj6iy2.us-east-2.aws.neon.tech/neondb?sslmode=require
   - GROQ_API_KEY: [Configured]
   - Add cloud provider credentials as needed

4. **Deploy**
   - Click "Deploy site"
   - Monitor build logs

## Features Available After Deployment

✅ Multi-cloud dashboard with real-time analytics
✅ 3D isometric cloud architecture visualization
✅ AI-powered deployment assistance
✅ Live performance monitoring from 11 cloud providers
✅ Cost analysis and optimization recommendations
✅ Security assessment and compliance tracking

Your platform will be live at: https://your-site-name.netlify.app