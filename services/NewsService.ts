import axios from 'axios';

// Mock data for trending news (since we can't directly use google-trends-api in the browser)
const mockTrendingNews = [
  {
    id: '1',
    title: 'Systemic Racism in Healthcare: New Study Reveals Disparities',
    content: 'A groundbreaking study published today reveals significant disparities in healthcare outcomes based on race. Researchers found that Black patients were less likely to receive pain medication and had longer wait times in emergency rooms compared to white patients with similar symptoms and insurance coverage.',
    source: 'Health Journal',
    publishedAt: '2 hours ago',
    url: 'https://example.com/healthcare-racism',
    rank: '#1 Trending'
  },
  {
    id: '2',
    title: 'MAGA Rally Draws Record Crowds in Swing State',
    content: 'A recent political rally drew thousands of supporters in a key swing state. Political analysts suggest this could indicate shifting voter demographics in the upcoming election. Counter-protesters also gathered nearby, highlighting the deep political divisions in the country.',
    source: 'Politics Today',
    publishedAt: '5 hours ago',
    url: 'https://example.com/maga-rally',
    rank: '#2 Trending'
  },
  {
    id: '3',
    title: 'Economic Power Shift: African American Businesses See Historic Growth',
    content: 'New economic data shows unprecedented growth in Black-owned businesses across the United States. This shift comes after targeted investment initiatives and changing consumer preferences supporting diverse businesses. Experts suggest this could help address the racial wealth gap over time.',
    source: 'Business Weekly',
    publishedAt: '1 day ago',
    url: 'https://example.com/economic-shift',
    rank: '#3 Trending'
  },
  {
    id: '4',
    title: 'Historical Artifacts Reveal European Influence on Ancient African Civilizations',
    content: 'Archaeological discoveries in North Africa have uncovered new evidence of cultural exchange between European and African civilizations dating back to 500 BCE. The findings challenge previous historical narratives and suggest a more complex relationship between these ancient societies.',
    source: 'History Channel',
    publishedAt: '2 days ago',
    url: 'https://example.com/historical-artifacts',
    rank: '#4 Trending'
  },
  {
    id: '5',
    title: 'New Psychological Study Examines Racial Bias in Children',
    content: 'Researchers have published findings from a comprehensive study on how racial biases develop in children as young as four years old. The study suggests that environmental factors play a significant role in shaping these biases and offers strategies for parents and educators to promote more inclusive attitudes.',
    source: 'Psychology Today',
    publishedAt: '3 days ago',
    url: 'https://example.com/racial-bias-study',
    rank: '#5 Trending'
  }
];

// In a real implementation, this would use the google-trends-api
export const fetchTrendingNews = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, we would fetch from Google Trends API
  // const trends = await googleTrends.realTimeTrends({
  //   geo: 'US',
  //   category: 'all',
  // });
  
  return mockTrendingNews;
};

// Mock search functionality
export const searchNews = async (query: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Filter mock data based on search query
  return mockTrendingNews.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.content.toLowerCase().includes(query.toLowerCase())
  );
};

// In a real implementation, we would implement proper API calls to Google Trends
// This would require a backend proxy due to CORS restrictions