# Namecheap Hosting Deployment Guide

## Upload Instructions

1. **Build the Application**
   - Run `npm install` to install dependencies
   - Run `npm run build` to create production build
   - Upload contents of `client/dist` folder to your domain's public_html directory

2. **File Structure on Namecheap**
   ```
   public_html/
   ├── index.html (main app file)
   ├── assets/ (CSS, JS, images)
   ├── api/ (API routes - needs PHP or Node.js hosting)
   └── .htaccess (URL rewriting)
   ```

3. **Server Requirements**
   - Node.js hosting (if available) OR
   - PHP hosting with custom API endpoints OR
   - Static hosting with external API

4. **Environment Configuration**
   Create these files in your hosting:
   - `.env` with your API keys
   - Database configuration
   - Domain settings

## Files Included
- Complete source code
- Build configuration
- Server files
- Database schema
- Environment templates

## Deployment Options

### Option A: Full Stack (Node.js hosting required)
Upload entire application with server

### Option B: Frontend Only (Static hosting)
Upload only client/dist folder contents

### Option C: Hybrid (Recommended)
Frontend on Namecheap + Backend on external service

## Post-Upload Steps
1. Configure environment variables
2. Set up database connections
3. Configure DNS (already done)
4. Test all functionality
5. Enable SSL certificate

Your instantiate.dev domain is already configured to point to Namecheap hosting.
