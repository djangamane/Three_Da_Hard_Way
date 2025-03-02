import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getScholarAnalysis } from '@/services/AnalysisService';
import { ArrowLeft, ExternalLink, Share2, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const { id, title, source, publishedAt, url, content } = params;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ['newsAnalysis', id],
    queryFn: () => getScholarAnalysis(title, 'all'),
    enabled: false,
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    refetch().finally(() => setIsAnalyzing(false));
  };

  const handleOpenLink = async () => {
    if (url) {
      const canOpen = await Linking.canOpenURL(url.toString());
      if (canOpen) {
        await Linking.openURL(url.toString());
      }
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: `Check out this news: ${title}`,
            url: url,
          });
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        console.log('Web Share API not supported');
      }
    } else {
      // For native platforms, we would use the Share API
      // This is a placeholder for native implementation
      console.log('Share functionality for native platforms');
    }
  };

  const renderAnalysisContent = () => {
    if (isLoading || isAnalyzing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Generating scholar insights...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error generating analysis</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleAnalyze}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysis) {
      return (
        <View style={styles.analyzeContainer}>
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <BookOpen size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Get Scholar Analysis</Text>
          </TouchableOpacity>
          <Text style={styles.analyzeDescription}>
            Get insights from Dr. Welsing, Dr. Wilson, and Dr. Barashango on this topic
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.analysisSection}>
        <Text style={styles.analysisSectionTitle}>Scholar Analysis</Text>
        {analysis.map((item, index) => (
          <View key={index} style={styles.scholarAnalysis}>
            <Text style={styles.scholarName}>{item.scholar}</Text>
            <Text style={styles.analysisText}>{item.analysis}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenLink} style={styles.actionButton}>
            <ExternalLink size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceText}>{source}</Text>
          </View>
          <Text style={styles.dateText}>{publishedAt}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.contentText}>{content || 'No content available for this article. Please click the link above to read the full story.'}</Text>
        
        <View style={styles.divider} />
        
        {renderAnalysisContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceContainer: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  sourceText: {
    fontSize: 14,
    color: '#1A73E8',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  analyzeContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  analyzeButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  analyzeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  analysisSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  analysisSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  scholarAnalysis: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scholarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200ee',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});