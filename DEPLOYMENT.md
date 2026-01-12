# Deployment Guide

This Strapi application can be deployed to various platforms. **Note: Strapi cannot run on Netlify** as it requires a persistent Node.js server and database.

## 🚀 Recommended: Strapi Cloud

Since you have `@strapi/plugin-cloud` installed, the easiest option is Strapi Cloud:

1. Sign up at https://cloud.strapi.io
2. In your Strapi admin panel, go to **Settings → Cloud → Deploy**
3. Follow the deployment wizard

### 📦 Migrating Your Existing Data to Strapi Cloud

**⚠️ IMPORTANT: Strapi Cloud creates a fresh instance, so your local data won't automatically transfer.**

**Your articles and data will NOT be lost** if you follow these steps:

#### Step 1: Export Your Data (Before Deployment)

Before deploying to Strapi Cloud, export all your content:

```bash
node scripts/export-data.js
```

This will create an `exports/` folder with:
- `articles.json` - All your articles
- `authors.json` - All authors
- `categories.json` - All categories
- `global.json` - Global settings
- `about.json` - About page
- `home.json` - Home page
- `media.json` - Media file metadata
- `export-summary.json` - Summary of exported data

**Also backup your uploads:**
```bash
# Copy the uploads folder
cp -r data/uploads exports/uploads
```

#### Step 2: Deploy to Strapi Cloud

1. Deploy your Strapi project to Strapi Cloud (as described above)
2. Wait for deployment to complete
3. Access your Strapi Cloud admin panel

#### Step 3: Import Your Data

**Option A: Manual Import via Admin Panel**
- Go to Content Manager in Strapi Cloud
- Manually recreate your content types
- Copy/paste content from exported JSON files

**Option B: Automated Import (Recommended for fresh deployments)**

1. Generate an API Token in Strapi Cloud:
   - Go to **Settings → API Tokens → Create new API Token**
   - Give it **Full access** or **Read & Write** permissions
   - Copy the token

2. Update the import script:
   ```bash
   # Edit scripts/import-to-cloud.js
   # Update API_URL and API_TOKEN
   ```

3. Install axios (if not already installed):
   ```bash
   npm install axios
   ```

4. Run the import script:
   ```bash
   npm run import:cloud
   ```

5. Upload media files:
   - Media files need to be uploaded separately
   - Use the Strapi admin panel to upload images
   - Or use the Strapi upload API

**Option C: Sync/Update Existing Data (If you already have data on Strapi Cloud)**

If you **already have data on Strapi Cloud** and want to update it or merge with local data:

1. Export your local data:
   ```bash
   npm run export:data
   ```

2. Update the sync script:
   ```bash
   # Edit scripts/sync-to-cloud.js
   # Update API_URL and API_TOKEN
   # Set UPDATE_EXISTING = true to update existing entries
   # Set DRY_RUN = true to preview changes without applying
   ```

3. Run the sync script:
   ```bash
   npm run sync:cloud
   ```

**What the sync script does:**
- ✅ **Checks for existing entries** by slug, title, or name
- ✅ **Updates existing entries** (if `UPDATE_EXISTING = true`)
- ✅ **Creates new entries** if they don't exist
- ✅ **Skips duplicates** (if `UPDATE_EXISTING = false`)
- ✅ **Provides a summary** of created/updated/skipped entries
- ✅ **Dry run mode** to preview changes before applying

**Example scenarios:**

**Scenario 1: You have articles on Cloud, want to update them with local changes**
```javascript
// In sync-to-cloud.js
const UPDATE_EXISTING = true;  // Will update existing articles
const DRY_RUN = false;         // Actually apply changes
```

**Scenario 2: You want to add new articles without overwriting existing ones**
```javascript
// In sync-to-cloud.js
const UPDATE_EXISTING = false; // Will skip existing, create new
const DRY_RUN = false;
```

**Scenario 3: You want to preview what would happen**
```javascript
// In sync-to-cloud.js
const UPDATE_EXISTING = true;
const DRY_RUN = true;  // Preview only, no changes made
```

#### Alternative: Strapi Data Transfer Tool

Strapi Cloud also supports data transfer through the admin panel:
1. In your **local** Strapi admin, go to **Settings → Cloud**
2. Look for **Data Transfer** or **Export** options
3. Follow the prompts to transfer data to Strapi Cloud

#### Best Practices

1. **Always export before deploying** - Keep backups of your data
2. **Test the import** - Try importing to a test instance first
3. **Verify media files** - Make sure all images are properly uploaded
4. **Check relationships** - Ensure article-author and article-category relationships are preserved
5. **Update permissions** - Don't forget to set public permissions in Strapi Cloud (same as you did locally)

## 🚂 Railway

1. Sign up at https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Add a PostgreSQL database service
5. Set environment variables (see below)
6. Deploy!

**Environment Variables for Railway:**
```env
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=<from Railway PostgreSQL service>
APP_KEYS=<generate 4 random keys>
API_TOKEN_SALT=<random string>
ADMIN_JWT_SECRET=<random string>
TRANSFER_TOKEN_SALT=<random string>
JWT_SECRET=<random string>
HOST=0.0.0.0
PORT=$PORT
```

## 🎨 Render

1. Sign up at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Use the `render.yaml` file (already created)
5. Render will automatically set up the database

## ☁️ Heroku

1. Install Heroku CLI
2. Create a Heroku app: `heroku create your-app-name`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
4. Set environment variables
5. Deploy: `git push heroku main`

## 📝 Important Notes

### Database Migration
- **SQLite** (current) won't work in production
- Switch to **PostgreSQL** or **MySQL** for production
- Update `DATABASE_CLIENT` in your `.env` file

### Environment Variables
Generate secure random strings for:
- `APP_KEYS` (comma-separated, at least 4 keys)
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`

You can generate them using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### File Uploads
For production, configure cloud storage (AWS S3, Cloudinary, etc.) instead of local file storage.

### Build Command
Make sure to run `npm run build` before deploying to build the admin panel.

## 🔗 Frontend Deployment (Netlify)

If you have a **frontend application** that consumes this Strapi API:

1. Deploy Strapi backend to one of the platforms above
2. Deploy your frontend to Netlify
3. Update your frontend's API URL to point to your deployed Strapi instance
4. Configure CORS in Strapi to allow requests from your Netlify domain

### CORS Configuration
Add to `config/middlewares.js`:
```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'your-netlify-domain.netlify.app'],
          'media-src': ["'self'", 'data:', 'blob:', 'your-netlify-domain.netlify.app'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

And in `config/server.js`, add CORS origin:
```javascript
module.exports = ({ env }) => ({
  // ... existing config
  cors: {
    origin: ['http://localhost:3000', 'https://your-netlify-domain.netlify.app'],
  },
});
```

