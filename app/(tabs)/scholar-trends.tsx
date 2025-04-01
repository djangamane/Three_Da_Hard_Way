import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable, Image, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useNewsStore } from '@/hooks/useNewsStore';

// Local NewsItemCard component
const NewsItemCard = ({ newsItem }) => (
  <View style={styles.newsCard}>
    {newsItem.category && (
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{newsItem.category}</Text>
      </View>
    )}
    <Text style={styles.newsHeadline}>{newsItem.headline}</Text>
    <View style={styles.newsFooter}>
      <Text style={styles.newsSource}>{newsItem.source}</Text>
      <Text style={styles.newsDate}>{newsItem.publishedAt}</Text>
    </View>
  </View>
);

export default function ScholarTrendsScreen() {
  const { newsItems, isLoading, error, fetchNewsFromApi, refreshNews } = useNewsStore();
  
  // Fetch news on component mount - use API-based method first
  useEffect(() => {
    console.log("Initializing app with API news data");
    fetchNewsFromApi();
  }, []);
  
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#e0e1dd" />
      ) : (
        <>
          <Text style={styles.emptyText}>No news articles available</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Pressable 
            style={styles.retryButton}
            onPress={fetchNewsFromApi}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('@/assets/theme.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(13, 27, 42, 0.8)', 'rgba(27, 38, 59, 0.8)', 'rgba(65, 90, 119, 0.8)']}
        style={styles.container}
      >
        {/* Hero section with logo */}
        <View style={styles.heroContainer}>
          {/* Use the splashscreen logo image */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/splashscreen_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroText}>Scholar Trends</Text>
          <Text style={styles.subText}>Critical analysis through the lens of Black scholarship</Text>
        </View>
        
        {/* News items list */}
        <View style={styles.listContainer}>
          <FlatList
            data={newsItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.itemContainer,
                  pressed && styles.pressed,
                ]}
              >
                <Link href={`/news-detail?id=${item.id}&title=${encodeURIComponent(item.headline)}&source=${encodeURIComponent(item.source)}&publishedAt=${encodeURIComponent(item.publishedAt)}&url=${encodeURIComponent(item.url || '')}`} asChild>
                  <Pressable>
                    <NewsItemCard newsItem={item} />
                  </Pressable>
                </Link>
              </Pressable>
            )}
            ListEmptyComponent={renderEmptyComponent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshNews}
                colors={['#e0e1dd']}
                tintColor="#e0e1dd"
              />
            }
          />
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorLine1} />
        <View style={styles.decorLine2} />
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e0e1dd',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subText: {
    fontSize: 16,
    color: '#bdc6d1',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  separator: {
    height: 16,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
    backgroundColor: 'rgba(65, 90, 119, 0.2)',
    zIndex: -1,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -30,
    left: -30,
    backgroundColor: 'rgba(27, 38, 59, 0.3)',
    zIndex: -1,
  },
  decorLine1: {
    position: 'absolute',
    width: 3,
    height: '40%',
    top: '10%',
    right: 40,
    backgroundColor: 'rgba(200, 210, 225, 0.08)',
    zIndex: -1,
  },
  decorLine2: {
    position: 'absolute',
    width: 3,
    height: '30%',
    bottom: '15%',
    left: 60,
    backgroundColor: 'rgba(200, 210, 225, 0.08)',
    zIndex: -1,
  },
  newsCard: {
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(98, 0, 238, 0.8)',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  newsHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e1dd',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 14,
    color: '#bdc6d1',
  },
  newsDate: {
    fontSize: 14,
    color: '#bdc6d1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#e0e1dd',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.8)',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
}); 