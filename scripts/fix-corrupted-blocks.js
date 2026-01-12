'use strict';

/**
 * Script to fix corrupted blocks data in Strapi
 * This removes invalid selection/cursor data from blocks fields
 * 
 * Run: node scripts/fix-corrupted-blocks.js
 */

async function fixCorruptedBlocks() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    console.log('🔧 Fixing corrupted blocks data...\n');

    // Function to clean blocks data
    function cleanBlocks(blocks) {
      if (!blocks || !Array.isArray(blocks)) {
        return blocks;
      }

      return blocks.map(block => {
        if (typeof block === 'object' && block !== null) {
          // Remove selection, operations, history, and other editor-specific data
          const cleaned = { ...block };
          
          // Remove Slate editor-specific properties that can cause issues
          delete cleaned.selection;
          delete cleaned.operations;
          delete cleaned.history;
          delete cleaned.lastInsertedLinkPath;
          delete cleaned.marks;
          
          // Recursively clean children if they exist
          if (cleaned.children && Array.isArray(cleaned.children)) {
            cleaned.children = cleanBlocks(cleaned.children);
          }
          
          return cleaned;
        }
        return block;
      });
    }

    // Fix Home content type
    console.log('📄 Fixing Home content type...');
    try {
      const home = await app.documents('api::home.home').findOne({});
      if (home) {
        const fieldsToClean = [
          'heroheading', 'herosubheading', 'herobelowsubheading',
          'concu_heading', 'concu_subheading', 'concu_para_1', 'concu_para_2',
          'concu_below_para', 'concu_slider_1', 'concu_slider_2', 'concu_slider_3',
          'comment_heading', 'comment_para_1', 'comment_para_2', 'comment_para_3',
          'construisez_heading', 'construisez_para_1', 'construisez_para_2', 'construisez_para_3'
        ];

        let needsUpdate = false;
        const updateData = {};

        for (const field of fieldsToClean) {
          if (home[field]) {
            const cleaned = cleanBlocks(home[field]);
            if (JSON.stringify(cleaned) !== JSON.stringify(home[field])) {
              updateData[field] = cleaned;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          await app.documents('api::home.home').update({
            documentId: home.id,
            data: updateData,
          });
          console.log('  ✅ Fixed Home blocks data');
        } else {
          console.log('  ℹ️  No corrupted data found in Home');
        }
      }
    } catch (error) {
      console.log('  ⚠️  Home not found or error:', error.message);
    }

    // Fix Rule content type
    console.log('\n📄 Fixing Rule content type...');
    try {
      const rule = await app.documents('api::rule.rule').findOne({});
      if (rule) {
        const fieldsToClean = Object.keys(rule).filter(key => 
          key.startsWith('heading_') && Array.isArray(rule[key])
        );

        let needsUpdate = false;
        const updateData = {};

        for (const field of fieldsToClean) {
          if (rule[field]) {
            const cleaned = cleanBlocks(rule[field]);
            if (JSON.stringify(cleaned) !== JSON.stringify(rule[field])) {
              updateData[field] = cleaned;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          await app.documents('api::rule.rule').update({
            documentId: rule.id,
            data: updateData,
          });
          console.log('  ✅ Fixed Rule blocks data');
        } else {
          console.log('  ℹ️  No corrupted data found in Rule');
        }
      }
    } catch (error) {
      console.log('  ⚠️  Rule not found or error:', error.message);
    }

    // Fix Articles with blocks
    console.log('\n📰 Fixing Articles...');
    try {
      const articles = await app.documents('api::article.article').findMany({
        populate: '*',
      });

      let fixedCount = 0;
      for (const article of articles) {
        if (article.blocks && Array.isArray(article.blocks)) {
          const cleaned = cleanBlocks(article.blocks);
          if (JSON.stringify(cleaned) !== JSON.stringify(article.blocks)) {
            await app.documents('api::article.article').update({
              documentId: article.id,
              data: { blocks: cleaned },
            });
            fixedCount++;
          }
        }
      }

      if (fixedCount > 0) {
        console.log(`  ✅ Fixed ${fixedCount} article(s)`);
      } else {
        console.log('  ℹ️  No corrupted data found in Articles');
      }
    } catch (error) {
      console.log('  ⚠️  Error fixing articles:', error.message);
    }

    // Fix About
    console.log('\n📄 Fixing About content type...');
    try {
      const about = await app.documents('api::about.about').findOne({});
      if (about && about.blocks) {
        const cleaned = cleanBlocks(about.blocks);
        if (JSON.stringify(cleaned) !== JSON.stringify(about.blocks)) {
          await app.documents('api::about.about').update({
            documentId: about.id,
            data: { blocks: cleaned },
          });
          console.log('  ✅ Fixed About blocks data');
        } else {
          console.log('  ℹ️  No corrupted data found in About');
        }
      }
    } catch (error) {
      console.log('  ⚠️  About not found or error:', error.message);
    }

    console.log('\n✨ Cleanup complete!');
    console.log('\n💡 Tip: If errors persist, try:');
    console.log('   1. Clear browser cache');
    console.log('   2. Restart Strapi server');
    console.log('   3. Try editing the content again');

  } catch (error) {
    console.error('❌ Error fixing corrupted blocks:', error);
  }

  await app.destroy();
  process.exit(0);
}

fixCorruptedBlocks();

