module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin-jwt-secret-key-change-in-production-123456789'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api-token-salt-change-in-production-987654321'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer-token-salt-change-in-production-456789123'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
