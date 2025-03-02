import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { fetchTrendingNews } from '@/services/NewsService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, TrendingUp, ExternalLink } from 'lucide-react-native';

export default function TrendingScreen() {
  const [filter, setFilter] = useState('');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trendingNews'],
    queryFn: fetchTrendingNews,
  });

  const filteredNews = data?.filter(item => 
    item.title.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => router.push({
        pathname: '/news-detail',
        params: { 
          id: item.id,
          title: item.title,
          source: item.source,
          publishedAt: item.publishedAt,
          url: item.url,
          content: item.content
        }
      })}
    >
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <View style={styles.trendingContainer}>
          <TrendingUp size={16} color="#FF4500" />
          <Text style={styles.trendingText}>{item.rank}</Text>
        </View>
      </View>
      
      <View style={styles.newsFooter}>
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>{item.source}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#666" />
          <Text style={styles.timeText}>{item.publishedAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading trending news</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading trending news...</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No trending news found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  trendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4500',
    marginLeft: 4,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sourceContainer: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});