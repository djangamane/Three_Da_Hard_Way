import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform, Image, Dimensions, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getScholarAnalysis } from '@/services/AnalysisService';
import { ArrowLeft, ExternalLink, Share2, BookOpen, Brain, Shield, ChevronDown, ChevronUp } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ScholarInsight from '@/components/analysis/ScholarInsight';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const safeHaptics = {
  impact: (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  },
  notification: (type = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(type);
      } catch (error) {
        console.warn('Haptic notification failed:', error);
      }
    }
  }
};

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const { 
    id, 
    title, 
    source, 
    publishedAt, 
    url, 
    content 
  } = params;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState('all');
  const router = useRouter();

  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ['newsAnalysis', id],
    queryFn: () => getScholarAnalysis(title?.toString() || "", selectedScholar),
    enabled: false,
  });

  useEffect(() => {
    const loadAnalyses = async () => {
      setIsAnalyzing(true);
      try {
        const result = await getScholarAnalysis(title?.toString() || "", selectedScholar);
        setAnalyses(result);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        // Set an empty array to show the error state
        setAnalyses([]);
        // Show an alert to the user
        if (Platform.OS === 'web') {
          alert(`Error: ${error.message || 'Failed to generate scholar analysis. Please check API key configuration.'}`);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    loadAnalyses();
  }, [id, selectedScholar, title]);

  const handleAnalyze = () => {
    safeHaptics.notification();
    setIsAnalyzing(true);
    // Use try/catch to properly handle errors
    try {
      refetch()
        .then(result => {
          if (result.data) {
            setAnalyses(result.data);
          }
        })
        .catch(err => {
          console.error('Error during refetch:', err);
          if (Platform.OS === 'web') {
            alert(`Error: ${err.message || 'Failed to generate scholar analysis. Please check API key configuration.'}`);
          }
        })
        .finally(() => setIsAnalyzing(false));
    } catch (error) {
      console.error('Error initiating analysis:', error);
      setIsAnalyzing(false);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message || 'Failed to generate scholar analysis. Please check API key configuration.'}`);
      }
    }
  };

  const handleOpenLink = async () => {
    if (url) {
      safeHaptics.impact();
      try {
        const urlString = url.toString();
        const canOpen = await Linking.canOpenURL(urlString);
        if (canOpen) {
          await Linking.openURL(urlString);
        } else {
          console.error("Can't open URL:", urlString);
        }
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    } else {
      console.log("No URL available for this article");
    }
    setShowActionMenu(false);
  };

  const handleShare = async () => {
    safeHaptics.impact();
    try {
      if (Platform.OS === 'web') {
        if (navigator.share && typeof navigator.share === 'function') {
          try {
            await navigator.share({
              title: title?.toString() || "News Article",
              text: `Check out this news: ${title}`,
              url: url?.toString() || window.location.href,
            });
            console.log('Content shared successfully');
          } catch (error) {
            // User might have canceled or sharing failed
            if (error.name !== 'AbortError') {
              console.log('Error sharing:', error);
              
              // Fallback to clipboard copy if sharing fails
              if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                const shareText = `${title} - ${window.location.href}`;
                await navigator.clipboard.writeText(shareText);
                alert('Link copied to clipboard!');
              }
            }
          }
        } else {
          // If Web Share API is not available, fallback to clipboard
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            const shareText = `${title} - ${window.location.href}`;
            await navigator.clipboard.writeText(shareText);
            alert('Link copied to clipboard!');
          } else {
            console.log('Clipboard API not supported');
            alert('Sharing not supported in this browser');
          }
        }
      } else {
        // For native platforms, we would use the Share API
        // This is a placeholder for native implementation
        console.log('Share functionality for native platforms');
      }
    } catch (error) {
      console.error('Unexpected error in share handling:', error);
    }
    setShowActionMenu(false);
  };

  const toggleActionMenu = () => {
    safeHaptics.impact();
    setShowActionMenu(!showActionMenu);
  };

  const renderAnalysisContent = () => {
    if (isLoading || isAnalyzing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Generating scholar insights...</Text>
          <Text style={styles.loadingSubtext}>Analyzing through the Planetary Chess framework</Text>
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
        <LinearGradient
          colors={['#6200ee', '#9D50BB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.analyzeContainer}
        >
          <View style={styles.chessPattern}>
            {/* Generate chess board pattern */}
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.chessRow}>
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <View 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    style={[
                      styles.chessCell,
                      (rowIndex + colIndex) % 2 === 0 ? styles.chessCellLight : styles.chessCellDark
                    ]} 
                  />
                ))}
              </View>
            ))}
          </View>
          
          <BookOpen size={32} color="#fff" style={styles.analyzeIcon} />
          
          <Text style={styles.analyzeTitle}>SLIM News Analysis</Text>
          <Text style={styles.analyzeDescription}>
            Get insights from Dr. Welsing, Dr. Wilson, and Dr. Barashango on this topic
          </Text>
          
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <Text style={styles.analyzeButtonText}>Get Scholar Analysis</Text>
          </TouchableOpacity>
          
          <View style={styles.scholarIconsContainer}>
            <View style={styles.scholarIconWrapper}>
              <Brain size={20} color="#fff" />
              <Text style={styles.scholarIconText}>Psychological</Text>
            </View>
            <View style={styles.scholarIconWrapper}>
              <Shield size={20} color="#fff" />
              <Text style={styles.scholarIconText}>Power Dynamics</Text>
            </View>
            <View style={styles.scholarIconWrapper}>
              <BookOpen size={20} color="#fff" />
              <Text style={styles.scholarIconText}>Historical</Text>
            </View>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.analysisSection}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.analysisHeader}
        >
          <Text style={styles.analysisSectionTitle}>Scholar Analysis</Text>
          <Text style={styles.analysisSectionSubtitle}>
            Through the Planetary Chess framework
          </Text>
        </LinearGradient>
        
        {analyses.map((item, index) => (
          <ScholarInsight 
            key={index} 
            scholar={item.scholar} 
            analysis={item.analysis}
            image={item.image}
            index={index}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0d1b2a', '#1b263b', '#415a77']}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            safeHaptics.impact();
            // In web environments, check window history first
            if (Platform.OS === 'web') {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                // If no history, use router to navigate to home
                router.replace("/");
              }
            } else {
              // On native, use the router's back function
              router.back();
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scholar Analysis</Text>
        
        {/* Action Button in Header */}
        {url && (
          <TouchableOpacity 
            style={styles.actionButtonHeader}
            onPress={toggleActionMenu}
          >
            <Text style={styles.actionButtonText}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Action Menu - Rendered as part of Header for better positioning */}
      {showActionMenu && (
        <View style={styles.actionMenu}>
          <TouchableOpacity 
            style={styles.actionMenuItem}
            onPress={handleOpenLink}
          >
            <ExternalLink size={18} color="#e0e1dd" />
            <Text style={styles.actionMenuItemText}>Open in Browser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionMenuItem}
            onPress={handleShare}
          >
            <Share2 size={18} color="#e0e1dd" />
            <Text style={styles.actionMenuItemText}>Share</Text>
          </TouchableOpacity>

          {/* Home navigation option for web */}
          {Platform.OS === 'web' && (
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => {
                safeHaptics.impact();
                router.replace("/");
                setShowActionMenu(false);
              }}
            >
              <BookOpen size={18} color="#e0e1dd" />
              <Text style={styles.actionMenuItemText}>Go to Home</Text>
            </TouchableOpacity>
          )}

          {/* Close menu button */}
          <TouchableOpacity 
            style={styles.actionMenuClose}
            onPress={() => setShowActionMenu(false)}
          >
            <Text style={styles.actionMenuCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView style={styles.scrollContainer}>
        {/* News Item Header */}
        <View style={styles.newsHeader}>
          <Text style={styles.headline}>{title}</Text>
          <View style={styles.sourceContainer}>
            <Text style={styles.source}>{source}</Text>
            <Text style={styles.publishedAt}>{publishedAt}</Text>
          </View>
          
          {/* Add "Read Original Article" button when URL is available */}
          {url && (
            <TouchableOpacity 
              style={styles.readOriginalButton}
              onPress={handleOpenLink}
            >
              <ExternalLink size={16} color="#e0e1dd" />
              <Text style={styles.readOriginalText}>Read Original Article</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Scholar Analysis</Text>
          <Text style={styles.prompt}>Based on comprehensive retrieval and analysis</Text>
        </View>

        {/* Scholar Selection Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, selectedScholar === 'all' && styles.activeTab]}
            onPress={() => setSelectedScholar('all')}
          >
            <Text style={[styles.tabText, selectedScholar === 'all' && styles.activeTabText]}>All Scholars</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedScholar === 'welsing' && styles.activeTab]}
            onPress={() => setSelectedScholar('welsing')}
          >
            <Text style={[styles.tabText, selectedScholar === 'welsing' && styles.activeTabText]}>Dr. Welsing</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedScholar === 'wilson' && styles.activeTab]}
            onPress={() => setSelectedScholar('wilson')}
          >
            <Text style={[styles.tabText, selectedScholar === 'wilson' && styles.activeTabText]}>Dr. Wilson</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedScholar === 'barashango' && styles.activeTab]}
            onPress={() => setSelectedScholar('barashango')}
          >
            <Text style={[styles.tabText, selectedScholar === 'barashango' && styles.activeTabText]}>Dr. Barashango</Text>
          </Pressable>
        </View>

        {/* Loading Indicator or Analysis Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E0E1DD" />
            <Text style={styles.loadingText}>Retrieving scholar insights...</Text>
          </View>
        ) : (
          <View style={styles.analysesContainer}>
            {analyses.map((analysis, index) => (
              <View key={index} style={styles.analysisCard}>
                <View style={styles.scholarHeader}>
                  <Image 
                    source={analysis.image} 
                    style={styles.scholarImage} 
                    resizeMode="cover"
                  />
                  <Text style={styles.scholarName}>{analysis.scholar}</Text>
                </View>
                <Text style={styles.analysisText}>{analysis.analysis}</Text>
                <View style={styles.cardGlow} />
              </View>
            ))}

            {/* Theme Image with Border */}
            <View style={styles.themeImageContainer}>
              <View style={styles.themeImageBorder}>
                <Image 
                  source={require('@/assets/images/splashscreen_logo.png')} 
                  style={styles.themeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}
        
        {/* Citation note */}
        <Text style={styles.citationNote}>
          Analysis based on scholarly works and theoretical frameworks.
        </Text>
      </ScrollView>
      
      {/* Decorative elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorLine} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#E0E1DD',
  },
  headerTitle: {
    fontSize: 18,
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
  actionButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 24,
    color: '#E0E1DD',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  newsHeader: {
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  source: {
    fontSize: 14,
    color: '#8D99AE',
  },
  publishedAt: {
    fontSize: 14,
    color: '#8D99AE',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginTop: 8,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 14,
    color: '#8D99AE',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
  },
  tabText: {
    color: '#8D99AE',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 17, 23, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingText: {
    marginTop: 12,
    color: '#E0E1DD',
    fontSize: 16,
  },
  analysesContainer: {
    gap: 20,
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: 'rgba(35, 41, 54, 0.9)',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
  },
  scholarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  scholarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scholarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E1DD',
  },
  analysisText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
  },
  themeImageContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
  },
  themeImageBorder: {
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(72, 110, 166, 0.5)',
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  themeImage: {
    width: 280,
    height: 200,
    borderRadius: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(100, 120, 190, 0.08)',
  },
  citationNote: {
    textAlign: 'center',
    color: '#8D99AE',
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(65, 90, 119, 0.15)',
    zIndex: -1,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -40,
    left: -40,
    backgroundColor: 'rgba(27, 38, 59, 0.2)',
    zIndex: -1,
  },
  decorLine: {
    position: 'absolute',
    width: 2,
    height: '70%',
    top: '20%',
    right: 30,
    backgroundColor: 'rgba(200, 210, 225, 0.06)',
    zIndex: -1,
  },
  analysisSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  analysisHeader: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  analysisSectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  analyzeContainer: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  chessPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.07,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chessRow: {
    flexDirection: 'row',
    height: 50,
  },
  chessCell: {
    flex: 1,
    height: 50,
  },
  chessCellLight: {
    backgroundColor: 'transparent',
  },
  chessCellDark: {
    backgroundColor: '#fff',
  },
  analyzeIcon: {
    marginBottom: 16,
  },
  analyzeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  analyzeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scholarIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  scholarIconWrapper: {
    alignItems: 'center',
    opacity: 0.8,
  },
  scholarIconText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  readOriginalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  readOriginalText: {
    color: '#e0e1dd',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  actionMenu: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: 'rgba(27, 38, 59, 0.95)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  actionMenuItemText: {
    color: '#e0e1dd',
    marginLeft: 8,
    fontSize: 16,
  },
  actionMenuClose: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  actionMenuCloseText: {
    fontSize: 14,
    color: '#E0E1DD',
    textAlign: 'center',
  },
});