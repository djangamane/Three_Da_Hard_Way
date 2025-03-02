import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your actual project ID
    });
    
    // Store the token
    await AsyncStorage.setItem('pushToken', token.data);
    
    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Send a local notification
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    const userSettings = await AsyncStorage.getItem('userSettings');
    const settings = userSettings ? JSON.parse(userSettings) : { notificationsEnabled: true };
    
    if (!settings.notificationsEnabled) {
      console.log('Notifications are disabled by user');
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null means send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

// Check if a news item matches user's filter keywords
export const matchesUserFilters = async (newsTitle, newsContent) => {
  try {
    const userSettings = await AsyncStorage.getItem('userSettings');
    const settings = userSettings ? JSON.parse(userSettings) : { filterKeywords: ['racism', 'MAGA', 'politics', 'economy'] };
    
    const filterKeywords = settings.filterKeywords || [];
    const combinedText = `${newsTitle} ${newsContent}`.toLowerCase();
    
    return filterKeywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.error('Error checking user filters:', error);
    return false;
  }
};

// Process incoming news for notifications
export const processNewsForNotification = async (newsItem) => {
  try {
    const matches = await matchesUserFilters(newsItem.title, newsItem.content);
    
    if (matches) {
      await sendLocalNotification(
        'Breaking News: ' + newsItem.title,
        newsItem.content.substring(0, 100) + '...',
        { newsId: newsItem.id }
      );
    }
  } catch (error) {
    console.error('Error processing news for notification:', error);
  }
};

// Set up notification listeners
export const setupNotificationListeners = () => {
  // Only set up listeners for non-web platforms
  if (Platform.OS === 'web') {
    return { remove: () => {} };
  }
  
  // Handle notifications received while app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
  });
  
  // Handle notification interaction
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { newsId } = response.notification.request.content.data;
    // Navigate to the news detail screen
    // This would typically use navigation, but since we're using expo-router:
    // router.push({ pathname: '/news-detail', params: { id: newsId } });
  });
  
  // Return a cleanup function
  return {
    remove: () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    }
  };
};