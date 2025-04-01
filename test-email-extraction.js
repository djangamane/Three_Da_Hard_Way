// Simple test script for email extraction
const fs = require('fs');
const path = require('path');

// Read the sample email content
const sampleEmailContent = fs.readFileSync(path.join(__dirname, 'sample-email.txt'), 'utf8');

// Log the content to verify it was read correctly
console.log('Sample email content:');
console.log('-'.repeat(40));
console.log(sampleEmailContent.substring(0, 200) + '...');
console.log('-'.repeat(40));

// Count the headlines (lines starting with #)
const headlines = sampleEmailContent.match(/^# .+$/gm);
console.log(`Number of headlines found: ${headlines ? headlines.length : 0}`);

// Count the URLs
const urls = sampleEmailContent.match(/\(https?:\/\/[^\s\)]+\)/g);
const plainUrls = sampleEmailContent.match(/^https?:\/\/[^\s]+$/gm);
console.log(`Number of markdown URLs found: ${urls ? urls.length : 0}`);
console.log(`Number of plain URLs found: ${plainUrls ? plainUrls.length : 0}`);
console.log(`Total URLs: ${(urls ? urls.length : 0) + (plainUrls ? plainUrls.length : 0)}`);

// Display the extracted headlines
console.log('\nExtracted headlines:');
console.log('-'.repeat(40));
if (headlines) {
  headlines.forEach((headline, index) => {
    console.log(`${index + 1}. ${headline.replace(/^# /, '')}`);
  });
}

// Display the extracted URLs
console.log('\nExtracted URLs:');
console.log('-'.repeat(40));
if (urls) {
  urls.forEach((url, index) => {
    console.log(`${index + 1}. ${url.replace(/^\(|\)$/g, '')}`);
  });
}
if (plainUrls) {
  const startIdx = urls ? urls.length : 0;
  plainUrls.forEach((url, index) => {
    console.log(`${startIdx + index + 1}. ${url}`);
  });
}

console.log('\nTest complete!'); 