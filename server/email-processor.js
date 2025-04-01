/**
 * Email Processor
 * 
 * This module automatically checks a designated email account for new
 * White Supremacy Alert emails, processes them using the email extraction
 * logic, and adds the extracted news items to the database.
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const mongoose = require('mongoose');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Import your email extraction logic
// For actual implementation, you'd move the extraction code from your frontend
// and include it here
const extractNewsFromEmail = (emailContent) => {
  // This is a placeholder for the actual extraction logic
  // In a real implementation, copy your extraction code from NewsEmailExtractor.ts
  
  // Return mock data for demonstration
  return [
    {
      headline: "Alabama Senator Proposes Bill to Ban Critical Race Theory",
      source: "example.com",
      publishedAt: new Date(),
      content: "The Alabama state legislature is considering a bill that would prohibit teaching Critical Race Theory in public schools.",
      category: "Systemic Racism",
      url: "https://www.example.com/alabama-crt-ban",
      severityScore: 79.8,
    },
    {
      headline: "GOP Lawmakers Push Back Against Corporate DEI Programs",
      source: "example.com",
      publishedAt: new Date(),
      content: "Legislators in several states have introduced measures to restrict diversity, equity, and inclusion initiatives.",
      category: "Systemic Racism",
      url: "https://www.example.com/dei-backlash",
      severityScore: 82.3,
    }
  ];
};

// Connect to MongoDB
mongoose.connect(config.database.uri, config.database.options)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Before defining the News Item model, update the schema
const NewsItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  headline: { type: String, required: true },
  source: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  content: String,
  category: String,
  url: String,
  severityScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Define the News Item model
const NewsItem = mongoose.model('NewsItem', NewsItemSchema);

// Configure email connection
const imapConfig = {
  user: config.email.auth.user,
  password: config.email.auth.pass,
  host: config.email.host,
  port: config.email.port,
  tls: config.email.secure,
  tlsOptions: { rejectUnauthorized: false }
};

// Setup email transport for sending notifications
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: config.email.auth
});

// Function to check for new emails
const checkEmails = () => {
  const imap = new Imap(imapConfig);
  
  imap.once('ready', () => {
    imap.openBox(config.email.mailbox, false, (err, box) => {
      if (err) {
        console.error('Error opening mailbox:', err);
        return;
      }
      
      // Search for unread emails with "White Supremacy Alert" in the subject
      const searchCriteria = ['UNSEEN', ['SUBJECT', 'White Supremacy Alert']];
      
      imap.search(searchCriteria, (err, results) => {
        if (err) {
          console.error('Error searching emails:', err);
          return;
        }
        
        if (results.length === 0) {
          console.log('No new White Supremacy Alert emails found');
          imap.end();
          return;
        }
        
        console.log(`Found ${results.length} new emails to process`);
        
        const fetch = imap.fetch(results, { bodies: '' });
        
        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error('Error parsing email:', err);
                return;
              }
              
              const { subject, text, html } = parsed;
              console.log(`Processing email: ${subject}`);
              
              // Use the HTML content if available, otherwise use plain text
              const emailContent = html || text;
              
              // Extract news items from the email
              const extractedItems = extractNewsFromEmail(emailContent);
              
              if (extractedItems && extractedItems.length > 0) {
                // Save extracted items to the database
                try {
                  // Find the highest existing ID
                  const maxIdItem = await NewsItem.findOne().sort('-id');
                  let nextId = maxIdItem ? maxIdItem.id + 1 : 1;
                  
                  const savedItems = await Promise.all(
                    extractedItems.map(async (item) => {
                      const newsItem = new NewsItem({
                        ...item,
                        id: nextId++, // Assign and increment ID
                        publishedAt: item.publishedAt || new Date()
                      });
                      await newsItem.save();
                      return newsItem;
                    })
                  );
                  
                  console.log(`Successfully saved ${savedItems.length} news items`);
                  
                  // Send notification about processed emails
                  sendNotification(subject, savedItems);
                  
                  // Mark the email as read
                  imap.setFlags(results, ['\\Seen'], (err) => {
                    if (err) console.error('Error marking email as read:', err);
                  });
                  
                  // Log the processing
                  logProcessedEmail(subject, savedItems.length);
                } catch (error) {
                  console.error('Error saving news items:', error);
                }
              } else {
                console.log('No news items extracted from the email');
              }
            });
          });
        });
        
        fetch.once('error', (err) => {
          console.error('Error fetching email:', err);
        });
        
        fetch.once('end', () => {
          console.log('Email processing completed');
          imap.end();
        });
      });
    });
  });
  
  imap.once('error', (err) => {
    console.error('IMAP connection error:', err);
  });
  
  imap.once('end', () => {
    console.log('IMAP connection ended');
  });
  
  imap.connect();
};

// Function to send notification about processed emails
const sendNotification = (subject, items) => {
  if (!config.email.forwardingAddress) return;
  
  const mailOptions = {
    from: config.email.auth.user,
    to: config.email.forwardingAddress,
    subject: `[PROCESSED] ${subject}`,
    html: `
      <h2>Email Processing Report</h2>
      <p>We've processed an email with the subject "${subject}" and extracted ${items.length} news items:</p>
      <ul>
        ${items.map(item => `
          <li>
            <strong>${item.headline}</strong> (Severity: ${item.severityScore || 'N/A'})
            <br>
            Category: ${item.category || 'Uncategorized'}
            <br>
            <a href="${item.url || '#'}">${item.source}</a>
          </li>
        `).join('')}
      </ul>
      <p>These items have been added to the database and will appear in the app.</p>
    `,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending notification:', error);
    } else {
      console.log('Notification sent:', info.response);
    }
  });
};

// Function to log processed emails
const logProcessedEmail = (subject, itemCount) => {
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, 'email-processing.log');
  
  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logEntry = `[${new Date().toISOString()}] Processed "${subject}" - ${itemCount} items extracted\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

// Schedule regular email checks (e.g., every hour)
const scheduleEmailChecks = (intervalMinutes = 60) => {
  console.log(`Scheduling email checks every ${intervalMinutes} minutes`);
  
  // Check immediately on startup
  checkEmails();
  
  // Then check at regular intervals
  setInterval(checkEmails, intervalMinutes * 60 * 1000);
};

// Export functions for use in the main server
module.exports = {
  checkEmails,
  scheduleEmailChecks,
  extractNewsFromEmail,
}; 