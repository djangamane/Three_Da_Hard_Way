/**
 * Scholar Insights Backend
 * 
 * Main entry point that starts both the admin API server
 * and the email processor for handling news data.
 */

const express = require('express');
const adminApi = require('./admin-api');
const emailProcessor = require('./email-processor');
const config = require('./config');
const morgan = require('morgan');

// Create a new Express app for the combined services
const app = express();

// Use the admin API as middleware
app.use(adminApi);

// Add logging middleware
app.use(morgan('combined'));

// Start the server
const server = app.listen(config.port, () => {
  console.log(`Scholar Insights backend running on port ${config.port}`);
  
  // Start the email processor on a schedule if email credentials are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('Starting email processor...');
    
    // Check emails every 30 minutes (configurable)
    const checkInterval = process.env.EMAIL_CHECK_INTERVAL || 30;
    emailProcessor.scheduleEmailChecks(checkInterval);
  } else {
    console.log('Email processor not started: missing credentials');
    console.log('Set EMAIL_USER and EMAIL_PASSWORD environment variables to enable');
  }
  
  console.log('Server is ready!');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, adminApi, emailProcessor }; 