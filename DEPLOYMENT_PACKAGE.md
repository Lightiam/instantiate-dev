# Instantiate.dev Deployment Package

## Download Options

### Option 1: GitHub Repository (Recommended)
- **Repository:** https://github.com/Imole-cloud/-Instantiate.dev
- **Download:** Click "Code" → "Download ZIP"
- **Contains:** Complete source code and deployment files

### Option 2: GitHub Release
- **Release Page:** Will be available after creation
- **Download:** Direct ZIP download with deployment package
- **Pre-configured:** Ready for Namecheap hosting

## Quick Deployment Steps

1. **Download and Extract**
   - Download from GitHub repository or release
   - Extract the ZIP file locally

2. **Build Application**
   ```bash
   cd instantiate-dev
   npm install
   npm run build
   ```

3. **Upload to Namecheap**
   - Login to your Namecheap cPanel
   - Go to File Manager → public_html
   - Upload all files from `client/dist/` folder
   - Upload `.htaccess` file to root

4. **Configure Environment**
   - Create `.env` file in public_html
   - Add your API keys (Groq, Namecheap credentials)

5. **Test Deployment**
   - Visit https://instantiate.dev
   - SSL certificate auto-provisions
   - All features should work immediately

## Files Structure After Upload

```
public_html/
├── index.html              (main application)
├── assets/                 (CSS, JS, images)
├── .htaccess              (Apache configuration)
├── .env                   (environment variables)
└── api/                   (optional PHP backend)
```

## Domain Configuration Status
✅ DNS configured in Namecheap
✅ Points to your hosting account  
✅ SSL auto-provisioning enabled
✅ HTTPS redirects configured
✅ Ready for immediate deployment

Your complete multi-cloud infrastructure management platform is ready for deployment to instantiate.dev!
