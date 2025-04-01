/**
 * Server Configuration
 * 
 * This file contains environment-specific configuration settings.
 * In production, you should use environment variables instead of
 * hardcoded values.
 */

module.exports = {
  // Server settings
  port: process.env.PORT || 5000,
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/scholar_insights',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // JWT settings for authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your_development_secret_key',
    expiresIn: '24h',
  },
  
  // Email configuration for automated email processing
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    mailbox: process.env.EMAIL_MAILBOX || 'INBOX',
    // Email address to forward news alerts to
    forwardingAddress: process.env.FORWARDING_EMAIL,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // API version
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'server.log',
  },
}; 