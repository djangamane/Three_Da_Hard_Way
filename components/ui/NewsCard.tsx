import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

type NewsCardProps = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  content: string;
  rank?: string;
};

export default function NewsCard({ id, title, source, publishedAt, url, content, rank }: NewsCardProps) {
  return (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => router.push({
        pathname: '/news-detail',
        params: { id, title, source, publishedAt, url, content }
      })}
    >
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{title}</Text>
        {rank && (
          <View style={styles.trendingContainer}>
            <TrendingUp size={16} color="#FF4500" />
            <Text style={styles.trendingText}>{rank}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.newsFooter}>
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>{source}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#666" />
          <Text style={styles.timeText}>{publishedAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});