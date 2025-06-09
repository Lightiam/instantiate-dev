# Deploy to Netlify - Step by Step Guide

## Quick Start (5 minutes)

### Step 1: Access Netlify
1. Go to https://netlify.com
2. Sign in with GitHub account
3. Click "New site from Git"

### Step 2: Connect Repository
1. Select "GitHub" as your Git provider
2. Search for and select: **Imole-cloud/-Instantiate.dev**
3. Choose the **main** branch

### Step 3: Configure Build Settings
Netlify will auto-detect these settings (already configured):
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### Step 4: Add Environment Variables
In Site Settings > Environment Variables, add:

**Required Variables:**
```
DATABASE_URL=postgresql://neondb_owner:npg_FE5lzguCWNQ7@ep-plain-cake-a5dj6iy2.us-east-2.aws.neon.tech/neondb?sslmode=require
GROQ_API_KEY=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
NODE_ENV=production
```

**Optional Cloud Provider Variables (add as needed):**
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_secret
```

### Step 5: Deploy
1. Click "Deploy site"
2. Wait for build to complete (2-3 minutes)
3. Your platform will be live at: https://your-site-name.netlify.app

## What You Get After Deployment

Your live multi-cloud platform will include:

### Dashboard Features
- Real-time analytics from 11 cloud providers
- Interactive 3D cloud architecture visualization
- Live performance monitoring and health scores
- Cost analysis with trend tracking
- Security assessment and compliance reports

### AI Assistant
- Intelligent deployment guidance
- Automated troubleshooting
- Infrastructure code generation
- Smart optimization recommendations

### Multi-Cloud Integration
- AWS, Azure, Google Cloud, Alibaba Cloud
- IBM Cloud, Oracle Cloud, DigitalOcean
- Linode, Huawei Cloud, Tencent Cloud, Netlify
- Unified resource management interface

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node version is 18+

### Missing Data
- Add cloud provider API keys for full functionality
- Database connection required for deployment tracking
- Groq API key needed for AI assistant

### Performance Issues
- Enable Netlify's CDN and caching
- Consider upgrading to Pro plan for better performance
- Monitor function execution times

## Custom Domain (Optional)

1. Go to Site Settings > Domain management
2. Add custom domain
3. Configure DNS records as shown
4. Enable HTTPS (automatic)

## Support

- Repository: https://github.com/Imole-cloud/-Instantiate.dev
- Issues: Create GitHub issue for bugs
- Features: Submit feature requests via GitHub

Your multi-cloud platform is production-ready with enterprise-grade features!