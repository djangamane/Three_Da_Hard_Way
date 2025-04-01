import { NewsItem } from '@/hooks/useNewsStore';

/**
 * Extracts URLs and news information from the State of White Supremacy Alerts email content
 * This service parses the email content and extracts news articles with their URLs
 */

/**
 * Extracts the severity score from a headline when available
 */
const extractSeverityScore = (headline: string): number | null => {
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
};

/**
 * Parses and extracts news items from the State of White Supremacy Alert email
 * Currently a mock implementation that can be updated with actual parsing logic
 */
export const extractNewsFromEmail = (emailContent: string): NewsItem[] => {
  try {
    // Example extraction logic (this should be updated with actual parsing logic)
    // The pattern will depend on the exact structure of the emails
    const newsItems: NewsItem[] = [];
    
    // Match markdown URLs [text](url)
    const markdownUrlPattern = /\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
    // Match plain URLs (on their own line)
    const plainUrlPattern = /^(https?:\/\/[^\s]+)$/gm;
    // Match headlines with optional severity score
    const headlinePattern = /^# (.*?)(?:\s*"Severity Score".*)?$/gm;
    // Match raw headlines to extract severity scores
    const rawHeadlinePattern = /^# (.*?)$/gm;
    
    // Extract all URLs
    const urls: string[] = [];
    
    // Extract markdown URLs
    let urlMatch;
    while ((urlMatch = markdownUrlPattern.exec(emailContent)) !== null) {
      urls.push(urlMatch[1]);
    }
    
    // Extract plain URLs
    while ((urlMatch = plainUrlPattern.exec(emailContent)) !== null) {
      urls.push(urlMatch[1]);
    }
    
    // Extract headlines and their raw versions to get severity scores
    const headlines: string[] = [];
    const rawHeadlines: string[] = [];
    
    let headlineMatch;
    while ((headlineMatch = headlinePattern.exec(emailContent)) !== null) {
      // Skip if it's the email title or meter
      if (headlineMatch[1].includes("State of White Supremacy Alert") || 
          headlineMatch[1].includes("STATE OF WHITE SUPREMACY METER")) {
        continue;
      }
      headlines.push(headlineMatch[1]);
    }
    
    let rawMatch;
    while ((rawMatch = rawHeadlinePattern.exec(emailContent)) !== null) {
      // Skip if it's the email title or meter
      if (rawMatch[1].includes("State of White Supremacy Alert") || 
          rawMatch[1].includes("STATE OF WHITE SUPREMACY METER")) {
        continue;
      }
      rawHeadlines.push(rawMatch[0]); // Include the full line with # and severity score
    }
    
    // Create news items from the extracted data
    // Match headlines with URLs if possible
    const maxItems = Math.min(headlines.length, urls.length);
    for (let i = 0; i < maxItems; i++) {
      const headline = headlines[i];
      const url = urls[i];
      const rawHeadline = i < rawHeadlines.length ? rawHeadlines[i] : '';
      const severityScore = extractSeverityScore(rawHeadline);
      
      newsItems.push({
        id: i + 1,
        headline,
        source: extractSourceFromUrl(url) || "White Supremacy Alert",
        publishedAt: new Date().toLocaleDateString(),
        content: `This article discusses trends related to white supremacy. Click to read more.`,
        category: categorizeHeadline(headline),
        severityScore,
        url
      });
    }
    
    return newsItems;
  } catch (error) {
    console.error('Error extracting news from email:', error);
    return [];
  }
};

/**
 * Attempts to extract the news source from a URL
 */
const extractSourceFromUrl = (url: string): string => {
  try {
    if (!url) return '';
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    // Remove www. prefix if present
    const source = domain.replace(/^www\./, '');
    // Get the main domain part
    const parts = source.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2]; // Return the main domain name
    }
    return source;
  } catch {
    return '';
  }
};

/**
 * Categorizes a headline into one of the predefined categories
 */
const categorizeHeadline = (headline: string): string => {
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
};

/**
 * A helper function to handle manual input of email content when testing
 */
export const processManualEmailInput = (emailText: string): NewsItem[] => {
  return extractNewsFromEmail(emailText);
};

// Sample email content for testing purposes
export const getSampleEmailContent = (): string => {
  return `# State of White Supremacy Alert - March 2024

## Current Severity Level: 73.2% | *ALERT*

# Alabama Senator Proposes Bill to Ban Critical Race Theory "Severity Score": 79.8

The Alabama state legislature is considering a bill that would prohibit teaching Critical Race Theory in public schools. Critics argue this is part of a broader pattern of attempts to suppress discussions about racism in educational settings.

[Read more](https://www.example.com/alabama-crt-ban)

# GOP Lawmakers Push Back Against Corporate DEI Programs "Severity Score": 82.3

Legislators in several states have introduced measures to restrict diversity, equity, and inclusion initiatives in both public institutions and private companies that receive state funding, claiming such programs are "divisive."

[Read more](https://www.example.com/dei-backlash)

# Study Shows Persistent Health Disparities in Minority Communities "Severity Score": 77.1

New research published in the Journal of Health Equity reveals continued systemic inequalities in healthcare access and outcomes across racial lines, particularly affecting Black and Hispanic communities.

[Read more](https://www.example.com/health-disparities-study)

# White Nationalist Content Increasing on Social Media Platforms "Severity Score": 85.6

Despite promised content moderation improvements, researchers documented a 34% rise in white supremacist content across major social media platforms in the first quarter of 2024.

https://www.example.com/white-nationalist-content-report

# Voter ID Laws Disproportionately Impact Minority Voters, New Analysis Shows

A comprehensive analysis of voting patterns reveals that recently implemented voter ID laws have created barriers that disproportionately affect Black and Hispanic voters in key swing states.

[Read more](https://www.example.com/voter-id-impact-study)

## STATE OF WHITE SUPREMACY METER: 
"Current Level": 73.2% | "ALERT": The current environment reveals significant activity in systemic white supremacy circuits. As Brother Malcolm X reminded us, "You can't separate peace from freedom because no one can be at peace unless he has his freedom." It's our watchful eye and mobilized effort that keeps us battling this pervasive force. Stay alert—organize and mobilize!`;
}; 