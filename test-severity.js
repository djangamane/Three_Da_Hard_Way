// Simple test script to check severity score extraction
const fs = require('fs');
const path = require('path');

// Read the sample email content
const emailContent = fs.readFileSync(path.join(__dirname, 'sample-email.txt'), 'utf8');

// Extract severity scores
function extractSeverityScore(headline) {
  // Look for a pattern like: "Severity Score": 84.7
  const match = headline.match(/"Severity Score":\s*(\d+\.?\d*)/);
  
  if (match && match[1]) {
    // Try to parse the score as a float
    try {
      return parseFloat(match[1]);
    } catch (e) {
      console.error('Error parsing severity score:', e);
      return null;
    }
  }
  
  return null;
}

// Match raw headlines to extract severity scores
const rawHeadlinePattern = /^# (.*?)$/gm;
const rawHeadlines = [];

let rawMatch;
while ((rawMatch = rawHeadlinePattern.exec(emailContent)) !== null) {
  rawHeadlines.push(rawMatch[0]); // Include the full line with # and severity score
}

console.log("=== RAW HEADLINES WITH SEVERITY SCORES ===");
rawHeadlines.forEach((headline, i) => {
  const score = extractSeverityScore(headline);
  console.log(`${i+1}. ${headline.substring(0, 50)}...`);
  console.log(`   Severity Score: ${score !== null ? score : 'Not found'}`);
  console.log('-'.repeat(50));
}); 