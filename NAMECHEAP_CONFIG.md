# Namecheap Hosting Configuration

## Manual Upload Configuration
This application is configured for manual upload to Namecheap hosting.

### Upload Instructions
1. Build: npm run build
2. Upload: client/dist/* to public_html/
3. Config: Upload .htaccess to root
4. Environment: Create .env with API keys

### Files for Namecheap
- client/dist/* → public_html/
- .htaccess → public_html/
- .env → public_html/

### Domain Configuration  
- DNS: Already configured in Namecheap
- SSL: Auto-provisions via hosting provider
- Domain: instantiate.dev

No Netlify configuration needed for manual deployment.
