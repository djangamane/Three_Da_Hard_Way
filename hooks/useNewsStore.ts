import { create } from 'zustand';
import { fetchAllRssFeeds } from '@/services/RssService';
import { extractNewsFromEmail, getSampleEmailContent } from '@/services/NewsEmailExtractor';

// API URL - should be configured from environment variables in production
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Define the News Item type
export type NewsItem = {
  id: number;
  headline: string;
  source: string;
  publishedAt: string;
  content?: string;
  category?: string;
  url?: string;
  severityScore?: number | null;
};

// Define the store state type
type NewsStore = {
  newsItems: NewsItem[];
  selectedNewsItem: NewsItem | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  setSelectedNewsItem: (newsItem: NewsItem) => void;
  fetchNewsItems: () => Promise<void>;
  fetchNewsFromEmail: (emailContent?: string) => Promise<void>;
  refreshNews: () => Promise<void>;
  setNewsItems: (newsItems: NewsItem[]) => void;
  addNewsItem: (newsItem: NewsItem) => void;
  fetchNewsFromApi: () => Promise<void>;
};

// Sample news data (fallback data)
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

// Create the store
export const useNewsStore = create<NewsStore>((set, get) => ({
  newsItems: [],
  selectedNewsItem: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  
  setSelectedNewsItem: (newsItem) => set({ selectedNewsItem: newsItem }),
  
  fetchNewsItems: async () => {
    // Immediately set loading to true so UI can show the loading state
    set({ isLoading: true, error: null });
    
    try {
      // Don't fetch again if we fetched in the last 15 minutes, unless explicitly refreshing
      const lastFetched = get().lastFetched;
      if (lastFetched && (new Date().getTime() - lastFetched.getTime() < 15 * 60 * 1000)) {
        console.log('Using cached news data (fetched within the last 15 minutes)');
        // Even though we're returning early, we need to set isLoading back to false
        set({ isLoading: false });
        return;
      }
      
      console.log('Fetching news items...');
      
      const newsItems = await fetchAllRssFeeds();
      
      console.log(`Successfully fetched ${newsItems.length} news items`);
      set({ 
        newsItems: newsItems,
        isLoading: false,
        error: null,
        lastFetched: new Date()
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      set({ 
        error: 'Failed to fetch news. Please try again.', 
        isLoading: false
      });
    }
  },
  
  fetchNewsFromEmail: async (emailContent?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Extracting news from email content...');
      
      // Use provided email content or get sample content
      const content = emailContent || getSampleEmailContent();
      const newsItems = extractNewsFromEmail(content);
      
      console.log(`Successfully extracted ${newsItems.length} news items from email`);
      set({
        newsItems,
        isLoading: false,
        error: null,
        lastFetched: new Date()
      });
    } catch (error) {
      console.error('Error extracting news from email:', error);
      set({
        error: 'Failed to process email content. Please try again.',
        isLoading: false
      });
    }
  },
  
  fetchNewsFromApi: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching news from API...');
      
      const response = await fetch(`${API_URL}/news`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const newsItems = await response.json();
      
      console.log(`Successfully fetched ${newsItems.length} news items from API`);
      set({
        newsItems,
        isLoading: false,
        error: null,
        lastFetched: new Date()
      });
    } catch (error) {
      console.error('Error fetching news from API:', error);
      set({
        error: 'Failed to fetch news from API. Falling back to sample data.',
        isLoading: false
      });
      
      // Fallback to sample data if API call fails
      get().fetchNewsFromEmail();
    }
  },
  
  refreshNews: async () => {
    // Don't refresh if already loading
    if (get().isLoading) {
      console.log('Already loading news, refresh skipped');
      return;
    }
    
    console.log('Forcing refresh of news data');
    // Force a refresh by setting lastFetched to null
    set({ lastFetched: null });
    
    // Try to fetch from API first, fallback is handled in the API method
    return get().fetchNewsFromApi();
  },

  // Add a method to replace the entire news items array
  setNewsItems: (newsItems) => {
    set({
      newsItems,
      lastFetched: new Date()
    });
  },
  
  // Add a method to add a single news item
  addNewsItem: (newsItem) => {
    const currentItems = get().newsItems;
    set({
      newsItems: [...currentItems, newsItem],
      lastFetched: new Date()
    });
  },
})); 