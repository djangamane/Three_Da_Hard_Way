import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type NewsItemProps = {
  newsItem: {
    id: string | number;
    headline: string;
    source: string;
    publishedAt: string;
    url?: string;
    category?: string;
    content?: string;
    severityScore?: number | null;
  };
};

const NewsItemCard = ({ newsItem }: NewsItemProps) => {
  return (
    <View style={styles.card}>
      {newsItem.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{newsItem.category}</Text>
        </View>
      )}
      <Text style={styles.headline}>{newsItem.headline}</Text>
      
      {newsItem.severityScore && (
        <View style={styles.severityContainer}>
          <Text style={styles.severityLabel}>Severity:</Text>
          <View style={[
            styles.severityScoreBadge,
            newsItem.severityScore >= 85 ? styles.severityHigh :
            newsItem.severityScore >= 75 ? styles.severityMedium :
            styles.severityLow
          ]}>
            <Text style={styles.severityScoreText}>{newsItem.severityScore}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.source}>{newsItem.source}</Text>
        <Text style={styles.date}>{newsItem.publishedAt}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e0e1dd',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#8d99ae',
  },
  date: {
    fontSize: 12,
    color: '#8d99ae',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#e0e1dd',
    fontWeight: '600',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 12,
    color: '#bdc6d1',
    marginRight: 6,
  },
  severityScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityScoreText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e0e1dd',
  },
  severityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red
  },
  severityMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.6)', // Orange
  },
  severityLow: {
    backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green
  },
});

export default NewsItemCard; 