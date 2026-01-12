'use strict';

/**
 * Script to import exported data into Strapi Cloud (or any Strapi instance)
 * 
 * Usage:
 * 1. First export your data: node scripts/export-data.js
 * 2. Deploy to Strapi Cloud
 * 3. Update the API_URL in this script to point to your Strapi Cloud instance
 * 4. Run: node scripts/import-to-cloud.js
 * 
 * Note: This script uses the Strapi API, so you'll need an API token
 * Generate one in: Settings → API Tokens → Create new API Token
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// ⚠️ UPDATE THESE VALUES
const API_URL = 'https://your-strapi-cloud-instance.strapi.app'; // Your Strapi Cloud URL
const API_TOKEN = 'your-api-token-here'; // Your API token from Strapi admin

const exportsDir = path.join(process.cwd(), 'exports');

async function importData() {
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    console.log('📦 Starting data import to Strapi Cloud...\n');
    console.log(`🌐 Target: ${API_URL}\n`);

    // Check if exports directory exists
    if (!(await fs.pathExists(exportsDir))) {
      console.error('❌ Exports directory not found!');
      console.log('   Run "node scripts/export-data.js" first to export your data.');
      process.exit(1);
    }

    // Import Categories first (they might be referenced by articles)
    if (await fs.pathExists(path.join(exportsDir, 'categories.json'))) {
      console.log('Importing categories...');
      const categories = await fs.readJSON(path.join(exportsDir, 'categories.json'));
      for (const category of categories) {
        try {
          const { data } = category;
          await axios.post(`${API_URL}/api/categories`, { data }, { headers });
          console.log(`  ✅ Imported: ${data.name}`);
        } catch (error) {
          if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
            console.log(`  ⚠️  Skipped (already exists): ${category.data.name}`);
          } else {
            console.error(`  ❌ Error importing category:`, error.response?.data || error.message);
          }
        }
      }
    }

    // Import Authors
    if (await fs.pathExists(path.join(exportsDir, 'authors.json'))) {
      console.log('\nImporting authors...');
      const authors = await fs.readJSON(path.join(exportsDir, 'authors.json'));
      for (const author of authors) {
        try {
          const { data } = author;
          await axios.post(`${API_URL}/api/authors`, { data }, { headers });
          console.log(`  ✅ Imported: ${data.name}`);
        } catch (error) {
          if (error.response?.status === 400) {
            console.log(`  ⚠️  Skipped (already exists): ${author.data.name}`);
          } else {
            console.error(`  ❌ Error importing author:`, error.response?.data || error.message);
          }
        }
      }
    }

    // Import Articles
    if (await fs.pathExists(path.join(exportsDir, 'articles.json'))) {
      console.log('\nImporting articles...');
      const articles = await fs.readJSON(path.join(exportsDir, 'articles.json'));
      for (const article of articles) {
        try {
          const { data } = article;
          await axios.post(`${API_URL}/api/articles`, { data }, { headers });
          console.log(`  ✅ Imported: ${data.title}`);
        } catch (error) {
          if (error.response?.status === 400) {
            console.log(`  ⚠️  Skipped (already exists): ${article.data.title}`);
          } else {
            console.error(`  ❌ Error importing article:`, error.response?.data || error.message);
          }
        }
      }
    }

    // Import Global (single type - use PUT to update)
    if (await fs.pathExists(path.join(exportsDir, 'global.json'))) {
      console.log('\nImporting global settings...');
      try {
        const global = await fs.readJSON(path.join(exportsDir, 'global.json'));
        const { data } = global;
        await axios.put(`${API_URL}/api/global`, { data }, { headers });
        console.log('  ✅ Imported global settings');
      } catch (error) {
        console.error('  ❌ Error importing global:', error.response?.data || error.message);
      }
    }

    // Import About (single type)
    if (await fs.pathExists(path.join(exportsDir, 'about.json'))) {
      console.log('\nImporting about page...');
      try {
        const about = await fs.readJSON(path.join(exportsDir, 'about.json'));
        const { data } = about;
        await axios.put(`${API_URL}/api/about`, { data }, { headers });
        console.log('  ✅ Imported about page');
      } catch (error) {
        console.error('  ❌ Error importing about:', error.response?.data || error.message);
      }
    }

    // Import Home (single type)
    if (await fs.pathExists(path.join(exportsDir, 'home.json'))) {
      console.log('\nImporting home page...');
      try {
        const home = await fs.readJSON(path.join(exportsDir, 'home.json'));
        const { data } = home;
        await axios.put(`${API_URL}/api/home`, { data }, { headers });
        console.log('  ✅ Imported home page');
      } catch (error) {
        console.error('  ❌ Error importing home:', error.response?.data || error.message);
      }
    }

    console.log('\n✨ Import completed!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Media files need to be uploaded separately');
    console.log('   - You may need to re-upload images through the Strapi admin');
    console.log('   - Or use the Strapi upload API to bulk upload files');
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  importData();
} catch (error) {
  console.error('❌ axios is required for this script');
  console.log('   Install it with: npm install axios');
  process.exit(1);
}

