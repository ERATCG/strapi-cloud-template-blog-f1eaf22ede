# cPanel Deployment Checklist

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
