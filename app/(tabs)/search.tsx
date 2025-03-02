import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { searchNews } from '@/services/NewsService';
import { router } from 'expo-router';
import { Search, Clock, ExternalLink } from 'lucide-react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['searchNews', searchQuery],
    queryFn: () => searchNews(searchQuery),
    enabled: false,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      refetch().finally(() => setIsSearching(false));
    }
  };

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
      <Text style={styles.newsTitle}>{item.title}</Text>
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

  const renderContent = () => {
    if (isLoading || isSearching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Searching news...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error searching news</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!searchResults) {
      return (
        <View style={styles.centerContainer}>
          <Search size={48} color="#666" />
          <Text style={styles.emptyTitle}>Search for news</Text>
          <Text style={styles.emptySubtitle}>Enter keywords to find relevant news articles</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search news topics..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={[styles.searchButton, !searchQuery.trim() && styles.disabledButton]} 
          onPress={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
        >
          <Search size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2196f3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#90caf9',
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
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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