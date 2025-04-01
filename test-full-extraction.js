// Test script to simulate the full email extraction process
const fs = require('fs');
const path = require('path');

// Read the sample email content
const emailContent = fs.readFileSync(path.join(__dirname, 'sample-email.txt'), 'utf8');

console.log("Email content length:", emailContent.length);
console.log("First 100 characters:", emailContent.substring(0, 100));

// Simulate the NewsEmailExtractor.extractNewsFromEmail function
function extractNewsFromEmail(emailContent) {
  try {
    const newsItems = [];
    
    // Extract headline and URL pairs from the email content
    // Match markdown URLs
    const markdownUrlPattern = /\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
    // Match plain URLs
    const plainUrlPattern = /^(https?:\/\/[^\s]+)$/gm;
    // Match headlines (lines starting with #)
    const headlinePattern = /^# (.*?)(?:\s*"Severity Score".*)?$/gm;
    
    // Extract markdown URLs
    const urls = [];
    let urlMatch;
    while ((urlMatch = markdownUrlPattern.exec(emailContent)) !== null) {
      urls.push(urlMatch[1]);
      console.log("Found markdown URL:", urlMatch[1]);
    }
    
    // Extract plain URLs
    while ((urlMatch = plainUrlPattern.exec(emailContent)) !== null) {
      urls.push(urlMatch[1]);
      console.log("Found plain URL:", urlMatch[1]);
    }
    
    // Extract headlines
    const headlines = [];
    let headlineMatch;
    while ((headlineMatch = headlinePattern.exec(emailContent)) !== null) {
      // Skip the headline if it's the email title
      if (headlineMatch[1].includes("State of White Supremacy Alert")) {
        console.log("Skipping email title:", headlineMatch[1]);
        continue;
      }
      headlines.push(headlineMatch[1]);
      console.log("Found headline:", headlineMatch[1]);
    }
    
    console.log(`Found ${headlines.length} headlines and ${urls.length} URLs`);
    
    // Create news items from the extracted data
    // Match headlines with URLs if possible
    const maxItems = Math.min(headlines.length, urls.length);
    for (let i = 0; i < maxItems; i++) {
      const headline = headlines[i];
      const url = urls[i];
      
      // Extract source from URL
      let source = "White Supremacy Alert";
      try {
        if (url) {
          const domain = new URL(url).hostname;
          source = domain.replace(/^www\./, '');
          const parts = source.split('.');
          if (parts.length >= 2) {
            source = parts[parts.length - 2]; // Return the main domain name
          }
        }
      } catch (e) {
        console.error('Error extracting source:', e);
      }
      
      // Categorize headline
      let category = "White Supremacy";
      const lowerHeadline = headline.toLowerCase();
      if (lowerHeadline.includes('maga') || lowerHeadline.includes('trump')) {
        category = 'MAGA';
      } else if (lowerHeadline.includes('white supremacy') || lowerHeadline.includes('white nationalist')) {
        category = 'White Supremacy';
      } else if (lowerHeadline.includes('systemic') || lowerHeadline.includes('racism') || 
                lowerHeadline.includes('disparities') || lowerHeadline.includes('dei')) {
        category = 'Systemic Racism';
      }
      
      // Create news item
      newsItems.push({
        id: i + 1,
        headline,
        source,
        publishedAt: new Date().toLocaleDateString(),
        content: `This article discusses trends related to white supremacy. Click to read more.`,
        category,
        url
      });
    }
    
    return newsItems;
  } catch (error) {
    console.error('Error extracting news from email:', error);
    return [];
  }
}

// Simulate processing
const newsItems = extractNewsFromEmail(emailContent);

// Display results
console.log('\nExtracted News Items:');
console.log('='.repeat(80));
newsItems.forEach((item, index) => {
  console.log(`${index + 1}. ${item.headline}`);
  console.log(`   Category: ${item.category}`);
  console.log(`   Source: ${item.source}`);
  console.log(`   URL: ${item.url}`);
  console.log('-'.repeat(80));
});

console.log(`\nTotal news items extracted: ${newsItems.length}`); 