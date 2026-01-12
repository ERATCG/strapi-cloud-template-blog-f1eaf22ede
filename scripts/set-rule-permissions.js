'use strict';

/**
 * Script to set public permissions for the rule content type
 * Run this with: node scripts/set-rule-permissions.js
 */

async function setRulePermissions() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    // Find the ID of the public role
    const publicRole = await app.query('plugin::users-permissions.role').findOne({
      where: {
        type: 'public',
      },
    });

    if (!publicRole) {
      console.error('Public role not found');
      await app.destroy();
      process.exit(1);
    }

    // Check if permissions already exist
    const existingPermissions = await app.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
        action: {
          $in: ['api::rule.rule.find', 'api::rule.rule.findOne'],
        },
      },
    });

    const existingActions = existingPermissions.map(p => p.action);

    // Create permissions that don't exist
    const permissionsToCreate = ['find', 'findOne']
      .filter(action => !existingActions.includes(`api::rule.rule.${action}`))
      .map(action => {
        return app.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::rule.rule.${action}`,
            role: publicRole.id,
          },
        });
      });

    if (permissionsToCreate.length > 0) {
      await Promise.all(permissionsToCreate);
      console.log('✅ Rule permissions set successfully!');
      console.log('   - find: enabled');
      console.log('   - findOne: enabled');
    } else {
      console.log('✅ Rule permissions already exist');
    }
  } catch (error) {
    console.error('Error setting rule permissions:', error);
  }

  await app.destroy();
  process.exit(0);
}

setRulePermissions();

