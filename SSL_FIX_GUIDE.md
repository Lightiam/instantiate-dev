# SSL Certificate Fix for instantiate.dev

## Current Issue
The domain instantiate.dev is showing "ERR_CERT_COMMON_NAME_INVALID" because:
1. DNS points to a deployment without the custom domain configured
2. SSL certificate is for the default domain, not instantiate.dev

## Solution Steps

### Step 1: Deploy to Netlify
1. Go to https://app.netlify.com
2. Connect your GitHub repository: https://github.com/Imole-cloud/-Instantiate.dev
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`

### Step 2: Add Custom Domain
1. In Netlify dashboard → Domain settings
2. Add custom domain: `instantiate.dev`
3. Add domain alias: `www.instantiate.dev`
4. Netlify will automatically provision SSL certificate

### Step 3: DNS Configuration (Already Done)
Your Namecheap DNS is already configured:
```
@ (root)    CNAME    [your-netlify-site].netlify.app
www         CNAME    [your-netlify-site].netlify.app
```

### Step 4: SSL Certificate Provisioning
- Netlify automatically provisions Let's Encrypt SSL
- Certificate will be valid for instantiate.dev
- Process takes 1-5 minutes after domain addition

### Step 5: Environment Variables
Add these in Netlify dashboard → Environment variables:
```
DATABASE_URL=your_postgresql_database_url
GROQ_API_KEY=your_groq_api_key
NAMECHEAP_API_USER=your_namecheap_api_user
NAMECHEAP_API_KEY=your_namecheap_api_key
NAMECHEAP_USERNAME=your_namecheap_username
NODE_ENV=production
```

## Alternative: Deploy via Deploy Button
Use the Replit deploy button to automatically:
1. Create Netlify site
2. Connect repository
3. Configure build settings
4. Set up custom domain

## Verification
After deployment:
1. Visit https://instantiate.dev (should work without SSL errors)
2. Check SSL certificate (should be valid for instantiate.dev)
3. Test all features: domain management, deployments, AI chat

## Timeline
- Deployment: 2-5 minutes
- SSL provisioning: 1-5 minutes after domain addition
- DNS propagation: Already complete (5-15 minutes total)

The SSL error will resolve once the custom domain is properly configured in your hosting platform.
