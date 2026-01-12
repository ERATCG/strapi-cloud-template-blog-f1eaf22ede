# 🚀 Deploying Strapi on cPanel

Deploying Strapi on cPanel can be challenging as cPanel primarily supports PHP. However, many modern cPanel hosts now support Node.js applications. This guide covers different scenarios.

## ⚠️ Prerequisites

Before starting, verify your cPanel hosting supports:
- ✅ **Node.js** (version 18+ recommended)
- ✅ **MySQL** or **PostgreSQL** database
- ✅ **SSH access** (recommended)
- ✅ **npm** package manager

**Check Node.js support:**
- Look for "Node.js Selector" or "Node.js App" in your cPanel
- Or contact your hosting provider

---

## 📋 Pre-Deployment Checklist

1. **Switch from SQLite to MySQL** (required for cPanel)
2. **Build admin panel** (`npm run build`)
3. **Prepare environment variables**
4. **Set up database**
5. **Configure file uploads** (use cloud storage, not local)

---

## 🔧 Step 1: Prepare Your Project Locally

### 1.1 Update Database Configuration

Your `config/database.js` already supports MySQL. You'll need to update your `.env` file:

```env
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_SSL=false
```

### 1.2 Build Admin Panel

```bash
npm run build
```

This creates the admin panel files needed for production.

### 1.3 Install Production Dependencies

```bash
npm install --production
```

### 1.4 Create `.htaccess` File (if needed)

Some cPanel setups require an `.htaccess` file in the public folder:

```apache
# .htaccess in public/ folder
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

---

## 📦 Step 2: Upload Files to cPanel

### Method 1: Using File Manager

1. **Compress your project** (excluding `node_modules` and `.tmp`):
   ```bash
   # Create a zip excluding unnecessary files
   zip -r strapi-deploy.zip . -x "node_modules/*" ".tmp/*" ".git/*" "*.log" ".env"
   ```

2. **Upload via cPanel File Manager:**
   - Log into cPanel
   - Open **File Manager**
   - Navigate to your domain's root (usually `public_html` or a subdomain folder)
   - Upload `strapi-deploy.zip`
   - Extract the zip file

### Method 2: Using FTP/SFTP

1. Use an FTP client (FileZilla, Cyberduck, etc.)
2. Connect to your cPanel server
3. Upload all files except:
   - `node_modules/`
   - `.tmp/`
   - `.git/`
   - `*.log`
   - `.env` (you'll create this on the server)

### Method 3: Using Git (if available)

```bash
# On your local machine
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push origin main

# On cPanel (via SSH)
cd ~/public_html
git clone your-repo-url .
```

---

## 🗄️ Step 3: Set Up Database

1. **Create MySQL Database:**
   - In cPanel, go to **MySQL Databases**
   - Create a new database (e.g., `username_strapi`)
   - Create a database user
   - Add user to database with **ALL PRIVILEGES**
   - Note down the credentials

2. **Import Data (if migrating):**
   - Export your SQLite data first
   - Convert to MySQL format (if needed)
   - Import via phpMyAdmin or MySQL command line

---

## ⚙️ Step 4: Configure Environment Variables

### Option A: Using cPanel Environment Variables

1. In cPanel, look for **Environment Variables** or **Node.js App** settings
2. Add these variables:

```env
NODE_ENV=production
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_SSL=false

APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

HOST=0.0.0.0
PORT=3000
```

### Option B: Create `.env` File on Server

1. Via File Manager or SSH, create `.env` file in your project root
2. Add all environment variables from above
3. **Important:** Set proper file permissions (600 or 644)

---

## 🚀 Step 5: Set Up Node.js Application

### Method 1: Using Node.js Selector (cPanel)

1. In cPanel, find **Node.js Selector** or **Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 18.x or higher
   - **Application root:** `/home/username/public_html` (or your folder)
   - **Application URL:** Your domain/subdomain
   - **Application startup file:** `server.js` or create one (see below)
   - **Application mode:** Production

4. **Create `server.js` in project root** (if needed):

```javascript
// server.js
const strapi = require('@strapi/strapi');

const app = strapi({
  distDir: './dist',
});

app.start();
```

5. **Install dependencies:**
   - In Node.js Selector, click **Run NPM Install**
   - Or via SSH: `cd ~/public_html && npm install --production`

6. **Start the application:**
   - Click **Start** in Node.js Selector

### Method 2: Using SSH + PM2 (Recommended)

If you have SSH access:

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'strapi',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

---

## 🔒 Step 6: Configure File Uploads

**Important:** Don't use local file storage on cPanel. Use cloud storage instead.

### Option 1: AWS S3

Install the provider:
```bash
npm install @strapi/provider-upload-aws-s3
```

Update `config/plugins.js`:
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
});
```

### Option 2: Cloudinary

```bash
npm install @strapi/provider-upload-cloudinary
```

### Option 3: Local Storage (Not Recommended)

If you must use local storage, configure uploads directory:

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  },
});
```

And ensure `public/uploads` directory exists and is writable.

---

## 🌐 Step 7: Configure Domain/Subdomain

1. **Point domain to your application:**
   - If using subdomain: Create subdomain in cPanel
   - Point it to your application folder

2. **Set up reverse proxy** (if needed):

Create `.htaccess` in `public_html`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

---

## ✅ Step 8: Final Steps

1. **Set permissions:**
   ```bash
   chmod 755 public
   chmod 755 public/uploads
   ```

2. **Test the application:**
   - Visit `https://yourdomain.com/admin`
   - Create your admin account
   - Set public permissions for your content types

3. **Set up SSL:**
   - Use cPanel's **SSL/TLS** tool
   - Install Let's Encrypt certificate (free)

---

## 🔧 Troubleshooting

### Application won't start
- Check Node.js version: `node --version` (needs 18+)
- Check logs: `pm2 logs` or check cPanel error logs
- Verify environment variables are set correctly

### Database connection errors
- Verify database credentials
- Check if database host is `localhost` or IP address
- Ensure database user has proper permissions

### 403 Forbidden errors
- Set public permissions in Strapi admin
- Check file permissions: `chmod 755 public`

### Port issues
- cPanel may assign a specific port
- Check Node.js Selector for assigned port
- Update `PORT` in `.env` accordingly

### Memory issues
- Strapi can be memory-intensive
- Consider upgrading hosting plan
- Use PM2 with memory limits

---

## 📝 Alternative: Use cPanel with Reverse Proxy

If your cPanel doesn't support Node.js directly:

1. Deploy Strapi on a VPS or cloud service (Railway, Render, etc.)
2. Use cPanel domain to point to your Strapi instance
3. Configure DNS in cPanel to point to your Strapi server

---

## 🎯 Quick Reference

**Essential Files:**
- `.env` - Environment variables
- `ecosystem.config.js` - PM2 configuration
- `server.js` - Application entry point
- `package.json` - Dependencies

**Important Commands:**
```bash
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 logs
pm2 restart strapi
```

**Check Application:**
- Admin: `https://yourdomain.com/admin`
- API: `https://yourdomain.com/api/articles`

---

## 💡 Tips

1. **Use PM2** for process management (keeps app running)
2. **Enable auto-restart** so app restarts if it crashes
3. **Monitor logs** regularly for errors
4. **Backup database** regularly via cPanel
5. **Use cloud storage** for uploads (don't store locally)
6. **Set up cron jobs** for backups if needed

---

## 📚 Additional Resources

- [Strapi Deployment Docs](https://docs.strapi.io/dev-docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [cPanel Node.js Guide](https://docs.cpanel.net/knowledge-base/web-services/how-to-set-up-a-node-js-application/)

