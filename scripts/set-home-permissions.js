'use strict';

/**
 * Script to set public permissions for the home content type
 * Run this with: node scripts/set-home-permissions.js
 */

async function setHomePermissions() {
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
          $in: ['api::home.home.find', 'api::home.home.findOne'],
        },
      },
    });

    const existingActions = existingPermissions.map(p => p.action);

    // Create permissions that don't exist
    const permissionsToCreate = ['find', 'findOne']
      .filter(action => !existingActions.includes(`api::home.home.${action}`))
      .map(action => {
        return app.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::home.home.${action}`,
            role: publicRole.id,
          },
        });
      });

    if (permissionsToCreate.length > 0) {
      await Promise.all(permissionsToCreate);
      console.log('✅ Home permissions set successfully!');
    } else {
      console.log('✅ Home permissions already exist');
    }
  } catch (error) {
    console.error('Error setting home permissions:', error);
  }

  await app.destroy();
  process.exit(0);
}

setHomePermissions();

