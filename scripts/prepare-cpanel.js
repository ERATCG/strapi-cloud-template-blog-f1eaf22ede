#!/usr/bin/env node

/**
 * Script to prepare Strapi project for cPanel deployment
 * Run: node scripts/prepare-cpanel.js
 */

const fs = require('fs-extra');
const path = require('path');

async function prepareForCpanel() {
  console.log('🚀 Preparing Strapi for cPanel deployment...\n');

  try {
    // 1. Build admin panel
    console.log('📦 Building admin panel...');
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Admin panel built\n');

    // 2. Create .env.example for reference
    console.log('📝 Creating .env.example...');
    const envExample = `# cPanel Environment Variables
# Copy this to .env on your cPanel server and fill in the values

NODE_ENV=production

# Database Configuration (MySQL)
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_SSL=false

# App Keys (generate secure random strings)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Server Configuration
HOST=0.0.0.0
PORT=3000

# Optional: Cloud Storage (recommended for cPanel)
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# AWS_REGION=us-east-1
# AWS_BUCKET=your_bucket_name
`;

    await fs.writeFile('.env.example', envExample);
    console.log('✅ Created .env.example\n');

    // 3. Create deployment checklist
    console.log('📋 Creating deployment checklist...');
    const checklist = `# cPanel Deployment Checklist

## Pre-Deployment
- [ ] Build admin panel: npm run build
- [ ] Switch database from SQLite to MySQL
- [ ] Create MySQL database in cPanel
- [ ] Generate secure environment variables
- [ ] Configure cloud storage for uploads (recommended)

## Upload Files
- [ ] Upload project files to cPanel (exclude node_modules, .tmp, .git)
- [ ] Create .env file on server with production values
- [ ] Set proper file permissions (755 for directories, 644 for files)

## Setup Node.js
- [ ] Install Node.js via cPanel Node.js Selector (version 18+)
- [ ] Run: npm install --production
- [ ] Configure Node.js application in cPanel
- [ ] Set environment variables in cPanel or .env file

## Database
- [ ] Create MySQL database and user
- [ ] Import data if migrating from SQLite
- [ ] Test database connection

## Start Application
- [ ] Start application via Node.js Selector
- [ ] Or use PM2: pm2 start ecosystem.config.js
- [ ] Verify application is running

## Post-Deployment
- [ ] Access admin panel: https://yourdomain.com/admin
- [ ] Create admin account
- [ ] Set public permissions for content types
- [ ] Test API endpoints
- [ ] Configure SSL certificate
- [ ] Set up backups

## Troubleshooting
- Check PM2 logs: pm2 logs
- Check cPanel error logs
- Verify environment variables
- Check database connection
- Verify file permissions
`;

    await fs.writeFile('CPANEL_CHECKLIST.md', checklist);
    console.log('✅ Created CPANEL_CHECKLIST.md\n');

    // 4. Create logs directory
    console.log('📁 Creating logs directory...');
    await fs.ensureDir('logs');
    await fs.writeFile('logs/.gitkeep', '');
    console.log('✅ Created logs directory\n');

    console.log('✨ Preparation complete!\n');
    console.log('📚 Next steps:');
    console.log('   1. Review CPANEL_DEPLOYMENT.md for detailed instructions');
    console.log('   2. Follow CPANEL_CHECKLIST.md');
    console.log('   3. Upload files to cPanel');
    console.log('   4. Configure environment variables');
    console.log('   5. Start your application\n');

  } catch (error) {
    console.error('❌ Error preparing for deployment:', error.message);
    process.exit(1);
  }
}

prepareForCpanel();

