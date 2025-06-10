# Emergency SSL Fix for instantiate.dev

## Current Status
- Domain: instantiate.dev is configured in Namecheap DNS
- Issue: ERR_CERT_COMMON_NAME_INVALID (SSL certificate mismatch)
- Cause: Custom domain not configured in hosting platform

## Immediate Solutions

### Option 1: GitHub Pages (Recommended)
GitHub Pages provides free SSL certificates for custom domains.

1. **Enable GitHub Pages:**
   - Go to Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / root
   - Custom domain: instantiate.dev
   - Enforce HTTPS: ✓

2. **Automatic deployment is configured via GitHub Actions**

### Option 2: Netlify (Alternative)
1. Go to https://app.netlify.com
2. Import from GitHub: https://github.com/Imole-cloud/-Instantiate.dev
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. Add custom domain: instantiate.dev
5. SSL certificate auto-provisions

### Option 3: Vercel (Fast deployment)
1. Go to https://vercel.com
2. Import GitHub repository
3. Add domain: instantiate.dev
4. SSL certificate automatic

## DNS Configuration (Already Complete)
Your Namecheap DNS is correctly configured:
```
@ (root)    CNAME    target_determined_by_hosting_platform
www         CNAME    target_determined_by_hosting_platform
```

## Expected Timeline
- GitHub Pages: 5-10 minutes after enabling
- Netlify: 2-5 minutes after domain addition
- Vercel: 1-3 minutes after domain addition

## Verification
After deployment, https://instantiate.dev should load without SSL errors.

## Environment Variables Needed
For full functionality, add these environment variables in your hosting platform:
- GROQ_API_KEY (for AI chat)
- DATABASE_URL (for data persistence)
- NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME (for domain management)

The SSL error will resolve immediately once the custom domain is properly configured in any of these platforms.
