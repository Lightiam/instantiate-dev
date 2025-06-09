# Deployment Guide

## Netlify Setup

1. **Connect Repository**
   - Log into Netlify
   - Click "New site from Git"
   - Select your GitHub repository: Imole-cloud/-Instantiate.dev
   - Choose main branch

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Environment Variables**
   Set these in Netlify dashboard under Site Settings > Environment Variables:
   
   ```
   DATABASE_URL=your_postgresql_connection_string
   GROQ_API_KEY=your_groq_api_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AZURE_CLIENT_ID=your_azure_client_id
   AZURE_CLIENT_SECRET=your_azure_secret
   AZURE_TENANT_ID=your_azure_tenant
   AZURE_SUBSCRIPTION_ID=your_azure_subscription
   ```

4. **Deploy**
   - Click "Deploy site"
   - Monitor build logs for any issues

## Database Setup

Your PostgreSQL database is ready with these connection details:
- Host: Available in DATABASE_URL
- Database: Multi-cloud platform schema
- Tables: Deployments, chat messages, provider configs

## Features Available After Deployment

✅ Real-time analytics from 11 cloud providers
✅ 3D isometric architecture visualization
✅ AI-powered deployment assistance
✅ Multi-cloud resource management
✅ Performance monitoring and cost analysis
✅ Security assessment and compliance tracking

## Monitoring

After deployment, monitor:
- Build logs in Netlify dashboard
- Function logs for API endpoints
- Database performance
- Cloud provider connectivity

Your platform will be live at: https://your-site-name.netlify.app