#!/bin/bash
# Netlify Environment Variables Setup Script

echo "Setting up Netlify environment variables..."

# Required variables (already configured in Replit)
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_FE5lzguCWNQ7@ep-plain-cake-a5dj6iy2.us-east-2.aws.neon.tech/neondb?sslmode=require"
netlify env:set GROQ_API_KEY "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"

# Application settings
netlify env:set NODE_ENV "production"
netlify env:set PORT "5000"

echo "✅ Core environment variables configured"
echo "Add cloud provider credentials manually in Netlify dashboard as needed"
echo "Your platform is ready for deployment!"