/**
 * Admin API Server
 * 
 * This server provides secure backend endpoints for managing news content.
 * It's meant to be deployed separately from your frontend app and 
 * accessible only to administrators.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholar_insights', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// News Item Schema
const newsItemSchema = new mongoose.Schema({
  // Use a Number type for id to match frontend expectations
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

const NewsItem = mongoose.model('NewsItem', newsItemSchema);

// User Schema for admin authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    
    req.user = user;
    next();
  });
};

// Routes

// Authentication
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, you would hash passwords and compare the hashed values
    const user = await User.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, username: user.username, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// News Items API

// Get all news items
app.get('/api/news', async (req, res) => {
  try {
    const newsItems = await NewsItem.find().sort({ publishedAt: -1 });
    
    // Format dates to match frontend expectations
    const formattedItems = newsItems.map(item => ({
      ...item.toObject(),
      publishedAt: item.publishedAt.toLocaleDateString()
    }));
    
    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching news items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create news item (admin only)
app.post('/api/news', authenticateToken, async (req, res) => {
  try {
    const { headline, source, content, category, url, severityScore } = req.body;
    
    if (!headline || !source) {
      return res.status(400).json({ message: 'Headline and source are required' });
    }
    
    // Get the next available ID
    const maxIdItem = await NewsItem.findOne().sort('-id');
    const nextId = maxIdItem ? maxIdItem.id + 1 : 1;
    
    const newsItem = new NewsItem({
      id: nextId,
      headline,
      source,
      content,
      category,
      url,
      severityScore: severityScore ? Number(severityScore) : null,
    });
    
    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (error) {
    console.error('Error creating news item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process email content to extract news items (admin only)
app.post('/api/news/process-email', authenticateToken, async (req, res) => {
  try {
    const { emailContent } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ message: 'Email content is required' });
    }
    
    // This is where you would use your email parser logic
    // For now, we'll just return a mock success message
    
    res.json({ 
      message: 'Email processed successfully', 
      itemsExtracted: 5 
    });
    
    // In a real implementation, you would:
    // 1. Import the extractNewsFromEmail function
    // 2. Parse the email content
    // 3. Create NewsItem documents for each extracted item
    // 4. Return the created items
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update news item (admin only)
app.put('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const { headline, source, content, category, url, severityScore } = req.body;
    
    const newsItem = await NewsItem.findOne({ id: req.params.id });
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }
    
    // Update fields
    if (headline) newsItem.headline = headline;
    if (source) newsItem.source = source;
    if (content !== undefined) newsItem.content = content;
    if (category !== undefined) newsItem.category = category;
    if (url !== undefined) newsItem.url = url;
    if (severityScore !== undefined) newsItem.severityScore = severityScore ? Number(severityScore) : null;
    
    newsItem.updatedAt = Date.now();
    
    await newsItem.save();
    res.json(newsItem);
  } catch (error) {
    console.error('Error updating news item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete news item (admin only)
app.delete('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const newsItem = await NewsItem.findOneAndDelete({ id: Number(req.params.id) });
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }
    
    res.json({ message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin API server running on port ${PORT}`);
});

module.exports = app; 