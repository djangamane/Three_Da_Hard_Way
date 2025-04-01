// Simple test script
const fs = require('fs');
const path = require('path');

// Read the sample email content
const emailContent = fs.readFileSync(path.join(__dirname, 'sample-email.txt'), 'utf8');

// Match patterns
const markdownUrlPattern = /\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
const plainUrlPattern = /^(https?:\/\/[^\s]+)$/gm;
const headlinePattern = /^# (.*?)(?:\s*"Severity Score".*)?$/gm;

// Extract markdown URLs
const urls = [];
let urlMatch;
while ((urlMatch = markdownUrlPattern.exec(emailContent)) !== null) {
  urls.push(urlMatch[1]);
}

// Extract plain URLs
while ((urlMatch = plainUrlPattern.exec(emailContent)) !== null) {
  urls.push(urlMatch[1]);
}

// Extract headlines
const headlines = [];
let headlineMatch;
while ((headlineMatch = headlinePattern.exec(emailContent)) !== null) {
  // Skip if it's the email title
  if (headlineMatch[1].includes("State of White Supremacy Alert")) {
    continue;
  }
  headlines.push(headlineMatch[1]);
}

console.log("=== HEADLINES ===");
headlines.forEach((headline, i) => console.log(`${i+1}. ${headline}`));

console.log("\n=== URLs ===");
urls.forEach((url, i) => console.log(`${i+1}. ${url}`));

// Create news items
const newsItems = [];
const maxItems = Math.min(headlines.length, urls.length);

// Categorization function
function categorizeHeadline(headline) {
  const lowerHeadline = headline.toLowerCase();
  
  // MAGA category
  if (
    lowerHeadline.includes('maga') || 
    lowerHeadline.includes('trump') || 
    lowerHeadline.includes('republican') ||
    lowerHeadline.includes('gop') ||
    lowerHeadline.includes('conservative')
  ) {
    return 'MAGA';
  }
  
  // White Supremacy category
  if (
    lowerHeadline.includes('white supremacy') || 
    lowerHeadline.includes('white nationalist') ||
    lowerHeadline.includes('supremacist') ||
    lowerHeadline.includes('alt-right') ||
    lowerHeadline.includes('hate group') ||
    lowerHeadline.includes('xenophob')
  ) {
    return 'White Supremacy';
  }
  
  // Systemic Racism category
  if (
    lowerHeadline.includes('systemic') || 
    lowerHeadline.includes('racism') ||
    lowerHeadline.includes('discrimination') ||
    lowerHeadline.includes('disparities') || 
    lowerHeadline.includes('dei') ||
    lowerHeadline.includes('equity') ||
    lowerHeadline.includes('diversity') ||
    lowerHeadline.includes('inclusion') ||
    lowerHeadline.includes('minority') ||
    lowerHeadline.includes('voter') ||
    lowerHeadline.includes('disenfranchise') ||
    lowerHeadline.includes('critical race theory') ||
    lowerHeadline.includes('crt')
  ) {
    return 'Systemic Racism';
  }
  
  // Default category if none of the above match
  return 'White Supremacy';
}

for (let i = 0; i < maxItems; i++) {
  const headline = headlines[i];
  const url = urls[i];
  
  // Extract source from URL
  let source = "example.com";
  try {
    if (url) {
      const domain = new URL(url).hostname;
      source = domain.replace(/^www\./, '');
    }
  } catch (e) {
    console.error('Error extracting source:', e);
  }
  
  // Determine category
  let category = categorizeHeadline(headline);
  
  newsItems.push({
    id: i + 1,
    headline,
    source,
    publishedAt: new Date().toLocaleDateString(),
    category,
    url
  });
}

// Print each news item separately to prevent truncation
console.log("================================");
console.log("TOTAL NEWS ITEMS:", newsItems.length);
console.log("================================");

newsItems.forEach((item, i) => {
  console.log(`\nNEWS ITEM #${i+1}`);
  console.log(`Headline: ${item.headline}`);
  console.log(`Category: ${item.category}`);
  console.log(`Source: ${item.source}`);
  console.log(`URL: ${item.url}`);
  console.log(`Published: ${item.publishedAt}`);
});

// Save the news items to a JSON file
fs.writeFileSync(
  path.join(__dirname, 'extracted-news.json'), 
  JSON.stringify(newsItems, null, 2)
);

console.log("\nResults saved to extracted-news.json"); 