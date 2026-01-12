'use strict';

/**
 * Script to export all content from Strapi to JSON files
 * This allows you to backup your data before migrating to Strapi Cloud
 * 
 * Run this with: node scripts/export-data.js
 */

const fs = require('fs-extra');
const path = require('path');

async function exportData() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    console.log('📦 Starting data export...\n');

    const exportDir = path.join(process.cwd(), 'exports');
    await fs.ensureDir(exportDir);

    // Export Articles
    console.log('Exporting articles...');
    const articles = await app.documents('api::article.article').findMany({
      populate: '*',
    });
    await fs.writeJSON(
      path.join(exportDir, 'articles.json'),
      articles,
      { spaces: 2 }
    );
    console.log(`✅ Exported ${articles.length} articles`);

    // Export Authors
    console.log('Exporting authors...');
    const authors = await app.documents('api::author.author').findMany({
      populate: '*',
    });
    await fs.writeJSON(
      path.join(exportDir, 'authors.json'),
      authors,
      { spaces: 2 }
    );
    console.log(`✅ Exported ${authors.length} authors`);

    // Export Categories
    console.log('Exporting categories...');
    const categories = await app.documents('api::category.category').findMany({
      populate: '*',
    });
    await fs.writeJSON(
      path.join(exportDir, 'categories.json'),
      categories,
      { spaces: 2 }
    );
    console.log(`✅ Exported ${categories.length} categories`);

    // Export Global (single type)
    console.log('Exporting global settings...');
    try {
      const global = await app.documents('api::global.global').findOne({
        populate: '*',
      });
      if (global) {
        await fs.writeJSON(
          path.join(exportDir, 'global.json'),
          global,
          { spaces: 2 }
        );
        console.log('✅ Exported global settings');
      }
    } catch (error) {
      console.log('⚠️  No global settings found');
    }

    // Export About (single type)
    console.log('Exporting about page...');
    try {
      const about = await app.documents('api::about.about').findOne({
        populate: '*',
      });
      if (about) {
        await fs.writeJSON(
          path.join(exportDir, 'about.json'),
          about,
          { spaces: 2 }
        );
        console.log('✅ Exported about page');
      }
    } catch (error) {
      console.log('⚠️  No about page found');
    }

    // Export Home (single type)
    console.log('Exporting home page...');
    try {
      const home = await app.documents('api::home.home').findOne({
        populate: '*',
      });
      if (home) {
        await fs.writeJSON(
          path.join(exportDir, 'home.json'),
          home,
          { spaces: 2 }
        );
        console.log('✅ Exported home page');
      }
    } catch (error) {
      console.log('⚠️  No home page found');
    }

    // Export uploaded files metadata
    console.log('Exporting media files metadata...');
    try {
      const files = await app.query('plugin::upload.file').findMany({});
      await fs.writeJSON(
        path.join(exportDir, 'media.json'),
        files,
        { spaces: 2 }
      );
      console.log(`✅ Exported ${files.length} media files metadata`);
    } catch (error) {
      console.log('⚠️  Error exporting media:', error.message);
    }

    // Create a summary
    const summary = {
      exportDate: new Date().toISOString(),
      articles: articles.length,
      authors: authors.length,
      categories: categories.length,
      files: {
        articles: 'articles.json',
        authors: 'authors.json',
        categories: 'categories.json',
        global: 'global.json',
        about: 'about.json',
        home: 'home.json',
        media: 'media.json',
      },
    };

    await fs.writeJSON(
      path.join(exportDir, 'export-summary.json'),
      summary,
      { spaces: 2 }
    );

    console.log('\n✨ Export completed successfully!');
    console.log(`📁 Files saved to: ${exportDir}`);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - The actual media files are in: data/uploads/');
    console.log('   - Make sure to backup the uploads folder as well');
    console.log('   - You can zip the exports folder for easy transfer');
  } catch (error) {
    console.error('❌ Error during export:', error);
  }

  await app.destroy();
  process.exit(0);
}

exportData();

