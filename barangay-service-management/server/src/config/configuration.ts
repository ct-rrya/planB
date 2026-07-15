export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/barangay-service-management',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  meta: {
    verifyToken: process.env.META_VERIFY_TOKEN || '',
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
    appSecret: process.env.META_APP_SECRET || '',
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
});
