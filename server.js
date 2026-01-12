const strapi = require('@strapi/strapi');

const app = strapi({
  distDir: './dist',
  autoReload: false,
  serveAdminPanel: true,
});

app.start();

