import { NewsItem } from '@/hooks/useNewsStore';

// Mock data for when RSS feeds can't be fetched
const mockNewsItems: NewsItem[] = [
  {
    id: 1,
    headline: "MAGA Rally Draws Record Crowds in Swing State",
    source: "Politics Today",
    publishedAt: "3 hours ago",
    content: "A recent political rally drew thousands of supporters in a key swing state. Political analysts suggest this could indicate shifting voter demographics in the upcoming election. Counter-protesters also gathered nearby, highlighting the deep political divisions in the country.",
    category: "MAGA"
  },
  {
    id: 2,
    headline: "Systemic Racism in Healthcare: New Study Reveals Disparities",
    source: "Health Journal",
    publishedAt: "5 hours ago",
    content: "A groundbreaking study published today reveals significant disparities in healthcare outcomes based on race. Researchers found that patients of color received different treatment protocols and experienced longer wait times for critical procedures. Medical institutions are being called upon to address these systemic issues.",
    category: "Systemic Racism"
  },
  {
    id: 3,
    headline: "White Supremacy Groups Increasingly Using Online Platforms for Recruitment",
    source: "Tech Watch",
    publishedAt: "8 hours ago",
    content: "A new report from online safety researchers indicates a rise in white supremacist content across social media platforms. The report highlights sophisticated recruitment tactics targeting young users through gaming communities and fringe forums. Tech companies are facing renewed pressure to improve content moderation policies.",
    category: "White Supremacy"
  },
  {
    id: 4,
    headline: "Economic Power Shift: African American Businesses See Historic Growth",
    source: "Business Review",
    publishedAt: "8 hours ago",
    content: "A new economic report indicates unprecedented growth in African American-owned businesses over the past year. Despite economic challenges, these enterprises have shown remarkable resilience and innovation. Experts attribute this to increased community support and strategic networking initiatives.",
    category: "Systemic Racism"
  },
  {
    id: 5,
    headline: "New Psychological Study Examines Racial Bias in Children",
    source: "Psychology Today",
    publishedAt: "2 days ago",
    content: "Researchers have published findings from a comprehensive study on the development of racial bias in young children. The study suggests that environmental factors play a more significant role than previously thought. Educational interventions focused on diversity have shown promising results in reducing implicit bias from an early age.",
    category: "Systemic Racism"
  },
];

/**
 * Fetches news from all RSS feeds and combines them
 * Currently returns mock data due to CORS/compatibility issues
 */
export const fetchAllRssFeeds = async (): Promise<NewsItem[]> => {
  try {
    console.log('Starting to fetch news...');
    // For now, we'll simulate a delay and return mock data
    // until we can properly set up the RSS feeds
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log success message
    console.log(`Successfully fetched ${mockNewsItems.length} mock news items`);
    
    // Return mock data
    return mockNewsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return mockNewsItems;
  }
}; 