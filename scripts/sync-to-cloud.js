'use strict';

/**
 * Script to sync/update data to Strapi Cloud (handles existing data)
 * 
 * This script will:
 * - Check if entries already exist (by slug, title, or unique field)
 * - Update existing entries instead of creating duplicates
 * - Create new entries if they don't exist
 * 
 * Usage:
 * 1. Export your local data: npm run export:data
 * 2. Update API_URL and API_TOKEN below
 * 3. Run: node scripts/sync-to-cloud.js
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// ⚠️ UPDATE THESE VALUES
const API_URL = 'https://your-strapi-cloud-instance.strapi.app';
const API_TOKEN = 'your-api-token-here';

// Options
const UPDATE_EXISTING = true; // Set to false to skip existing entries
const DRY_RUN = false; // Set to true to see what would happen without making changes

const exportsDir = path.join(process.cwd(), 'exports');

async function findExistingEntry(apiUrl, contentType, identifier, headers) {
  try {
    // Try to find by slug (for articles)
    if (identifier.slug) {
      const response = await axios.get(
        `${apiUrl}/api/${contentType}?filters[slug][$eq]=${identifier.slug}`,
        { headers }
      );
      if (response.data?.data?.length > 0) {
        return response.data.data[0];
      }
    }
    
    // Try to find by name (for categories, authors)
    if (identifier.name) {
      const response = await axios.get(
        `${apiUrl}/api/${contentType}?filters[name][$eq]=${encodeURIComponent(identifier.name)}`,
        { headers }
      );
      if (response.data?.data?.length > 0) {
        return response.data.data[0];
      }
    }
    
    // Try to find by title (for articles)
    if (identifier.title) {
      const response = await axios.get(
        `${apiUrl}/api/${contentType}?filters[title][$eq]=${encodeURIComponent(identifier.title)}`,
        { headers }
      );
      if (response.data?.data?.length > 0) {
        return response.data.data[0];
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function syncData() {
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔄 Starting data sync to Strapi Cloud...\n');
    console.log(`🌐 Target: ${API_URL}`);
    console.log(`📝 Update existing: ${UPDATE_EXISTING ? 'Yes' : 'No (skip)'}`);
    console.log(`🧪 Dry run: ${DRY_RUN ? 'Yes' : 'No'}\n`);

    if (!(await fs.pathExists(exportsDir))) {
      console.error('❌ Exports directory not found!');
      console.log('   Run "npm run export:data" first to export your data.');
      process.exit(1);
    }

    let stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    // Sync Categories
    if (await fs.pathExists(path.join(exportsDir, 'categories.json'))) {
      console.log('📂 Syncing categories...');
      const categories = await fs.readJSON(path.join(exportsDir, 'categories.json'));
      
      for (const category of categories) {
        const { data } = category;
        const existing = await findExistingEntry(API_URL, 'categories', { name: data.name }, headers);
        
        if (existing) {
          if (UPDATE_EXISTING && !DRY_RUN) {
            try {
              await axios.put(`${API_URL}/api/categories/${existing.id}`, { data }, { headers });
              console.log(`  ✅ Updated: ${data.name}`);
              stats.updated++;
            } catch (error) {
              console.error(`  ❌ Error updating category:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ⏭️  Skipped (exists): ${data.name}`);
            stats.skipped++;
          }
        } else {
          if (!DRY_RUN) {
            try {
              await axios.post(`${API_URL}/api/categories`, { data }, { headers });
              console.log(`  ➕ Created: ${data.name}`);
              stats.created++;
            } catch (error) {
              console.error(`  ❌ Error creating category:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ➕ Would create: ${data.name}`);
            stats.created++;
          }
        }
      }
    }

    // Sync Authors
    if (await fs.pathExists(path.join(exportsDir, 'authors.json'))) {
      console.log('\n👤 Syncing authors...');
      const authors = await fs.readJSON(path.join(exportsDir, 'authors.json'));
      
      for (const author of authors) {
        const { data } = author;
        const existing = await findExistingEntry(API_URL, 'authors', { name: data.name }, headers);
        
        if (existing) {
          if (UPDATE_EXISTING && !DRY_RUN) {
            try {
              await axios.put(`${API_URL}/api/authors/${existing.id}`, { data }, { headers });
              console.log(`  ✅ Updated: ${data.name}`);
              stats.updated++;
            } catch (error) {
              console.error(`  ❌ Error updating author:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ⏭️  Skipped (exists): ${data.name}`);
            stats.skipped++;
          }
        } else {
          if (!DRY_RUN) {
            try {
              await axios.post(`${API_URL}/api/authors`, { data }, { headers });
              console.log(`  ➕ Created: ${data.name}`);
              stats.created++;
            } catch (error) {
              console.error(`  ❌ Error creating author:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ➕ Would create: ${data.name}`);
            stats.created++;
          }
        }
      }
    }

    // Sync Articles
    if (await fs.pathExists(path.join(exportsDir, 'articles.json'))) {
      console.log('\n📰 Syncing articles...');
      const articles = await fs.readJSON(path.join(exportsDir, 'articles.json'));
      
      for (const article of articles) {
        const { data } = article;
        const existing = await findExistingEntry(
          API_URL,
          'articles',
          { slug: data.slug, title: data.title },
          headers
        );
        
        if (existing) {
          if (UPDATE_EXISTING && !DRY_RUN) {
            try {
              await axios.put(`${API_URL}/api/articles/${existing.id}`, { data }, { headers });
              console.log(`  ✅ Updated: ${data.title}`);
              stats.updated++;
            } catch (error) {
              console.error(`  ❌ Error updating article:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ⏭️  Skipped (exists): ${data.title}`);
            stats.skipped++;
          }
        } else {
          if (!DRY_RUN) {
            try {
              await axios.post(`${API_URL}/api/articles`, { data }, { headers });
              console.log(`  ➕ Created: ${data.title}`);
              stats.created++;
            } catch (error) {
              console.error(`  ❌ Error creating article:`, error.response?.data || error.message);
              stats.errors++;
            }
          } else {
            console.log(`  ➕ Would create: ${data.title}`);
            stats.created++;
          }
        }
      }
    }

    // Sync Single Types (always update)
    const singleTypes = [
      { file: 'global.json', endpoint: 'global' },
      { file: 'about.json', endpoint: 'about' },
      { file: 'home.json', endpoint: 'home' },
    ];

    for (const { file, endpoint } of singleTypes) {
      if (await fs.pathExists(path.join(exportsDir, file))) {
        console.log(`\n📄 Syncing ${endpoint}...`);
        if (!DRY_RUN) {
          try {
            const data = await fs.readJSON(path.join(exportsDir, file));
            await axios.put(`${API_URL}/api/${endpoint}`, { data: data.data }, { headers });
            console.log(`  ✅ Updated ${endpoint}`);
            stats.updated++;
          } catch (error) {
            console.error(`  ❌ Error updating ${endpoint}:`, error.response?.data || error.message);
            stats.errors++;
          }
        } else {
          console.log(`  ✅ Would update ${endpoint}`);
          stats.updated++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Sync Summary:');
    console.log(`   ➕ Created: ${stats.created}`);
    console.log(`   ✅ Updated: ${stats.updated}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('='.repeat(50));

    if (DRY_RUN) {
      console.log('\n⚠️  This was a dry run. No changes were made.');
      console.log('   Set DRY_RUN = false to apply changes.');
    }

  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  syncData();
} catch (error) {
  console.error('❌ axios is required for this script');
  console.log('   Install it with: npm install axios');
  process.exit(1);
}

