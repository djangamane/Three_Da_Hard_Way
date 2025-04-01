import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Dimensions, FlatList, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getScholarAnalysis } from '@/services/AnalysisService';
import { BookOpen, Search, Brain, History, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScholarInsight from '@/components/analysis/ScholarInsight';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Recent search topics
const recentTopics = [
  "Trump's immigration policies",
  "DEI program cancellations",
  "January 6th pardons",
  "Black economic empowerment",
  "Voter suppression tactics"
];

// Add a safe Haptics wrapper function at the top after imports
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

export default function AnalysisScreen() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState('all');
  const [showRecent, setShowRecent] = useState(false);
  const [searchHistory, setSearchHistory] = useState(recentTopics);
  const scrollViewRef = useRef(null);

  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ['scholarAnalysis', topic, selectedScholar],
    queryFn: () => getScholarAnalysis(topic, selectedScholar),
    enabled: false,
  });

  const generateAnalysis = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const results = await getScholarAnalysis(topic, selectedScholar);
      setAnalyses(results);
    } catch (error) {
      console.error('Error generating analysis:', error);
      // Reset analyses and show an alert
      setAnalyses([]);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message || 'Failed to generate scholar analysis. Please check API key configuration.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectRecentTopic = (selectedTopic) => {
    setTopic(selectedTopic);
    safeHaptics.impact();
    setShowRecent(false);
    
    // Auto analyze after selecting
    setTimeout(() => {
      setLoading(true);
      getScholarAnalysis(selectedTopic, selectedScholar)
        .then(results => {
          setAnalyses(results);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error generating analysis:', error);
          setAnalyses([]);
          setLoading(false);
          if (Platform.OS === 'web') {
            alert(`Error: ${error.message || 'Failed to generate scholar analysis. Please check API key configuration.'}`);
          }
        });
    }, 300);
  };

  const renderScholarTab = (id, name, icon) => (
    <TouchableOpacity
      style={[styles.scholarTab, selectedScholar === id && styles.activeScholarTab]}
      onPress={() => {
        safeHaptics.impact();
        setSelectedScholar(id);
        if (topic.trim() && analysis) {
          setTimeout(() => {
            setLoading(true);
            refetch().finally(() => setLoading(false));
          }, 300);
        }
      }}
    >
      {icon}
      <Text style={[styles.scholarTabText, selectedScholar === id && styles.activeScholarTabText]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  const renderAnalysisContent = () => {
    if (isLoading || loading) {
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
          <Text style={styles.errorText}>Error generating analysis. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateAnalysis}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysis) {
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('@/assets/images/splashscreen_logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>SLIM News Analysis</Text>
          <Text style={styles.emptySubtitle}>
            Scholars as Leaders for the Individual Movement
          </Text>
          <Text style={styles.planetaryText}>
            In the game of Planetary Chess, knowledge is your most powerful piece
          </Text>
          
          <View style={styles.suggestedTopics}>
            <Text style={styles.suggestedTitle}>Suggested Topics</Text>
            <FlatList
              data={searchHistory}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.topicChip}
                  onPress={() => selectRecentTopic(item)}
                >
                  <Text style={styles.topicChipText}>{item}</Text>
                  <ChevronRight size={16} color="#6200ee" />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.topicsContainer}
            />
          </View>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.analysisContent}
        ref={scrollViewRef}
        contentContainerStyle={styles.analysisContentContainer}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.analysisGradient}
        >
          <Text style={styles.analysisTopic}>"{topic}"</Text>
          <Text style={styles.analysisSubheading}>
            Analyzed through the Planetary Chess framework
          </Text>
        </LinearGradient>
        
        {analysis.map((item, index) => (
          <ScholarInsight 
            key={index} 
            scholar={item.scholar} 
            analysis={item.analysis}
            image={item.image}
            index={index}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <ImageBackground
      source={require('@/assets/theme.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(13, 27, 42, 0.8)', 'rgba(27, 38, 59, 0.8)', 'rgba(65, 90, 119, 0.8)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Scholar Analysis</Text>
            <Text style={styles.headerSubtitle}>Examine any topic through the lens of Black scholarship</Text>
          </View>

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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter a topic for analysis..."
              placeholderTextColor="#8D99AE"
              value={topic}
              onChangeText={setTopic}
              multiline
            />
            
            <View style={styles.scholarSelector}>
              <Text style={styles.selectorLabel}>Select Scholar:</Text>
              <View style={styles.scholarButtons}>
                <TouchableOpacity
                  style={[styles.scholarButton, selectedScholar === 'all' && styles.activeScholar]}
                  onPress={() => setSelectedScholar('all')}
                >
                  <Text style={[styles.scholarButtonText, selectedScholar === 'all' && styles.activeScholarText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scholarButton, selectedScholar === 'welsing' && styles.activeScholar]}
                  onPress={() => setSelectedScholar('welsing')}
                >
                  <Text style={[styles.scholarButtonText, selectedScholar === 'welsing' && styles.activeScholarText]}>Dr. Welsing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scholarButton, selectedScholar === 'wilson' && styles.activeScholar]}
                  onPress={() => setSelectedScholar('wilson')}
                >
                  <Text style={[styles.scholarButtonText, selectedScholar === 'wilson' && styles.activeScholarText]}>Dr. Wilson</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scholarButton, selectedScholar === 'barashango' && styles.activeScholar]}
                  onPress={() => setSelectedScholar('barashango')}
                >
                  <Text style={[styles.scholarButtonText, selectedScholar === 'barashango' && styles.activeScholarText]}>Dr. Barashango</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateAnalysis}
              disabled={loading || !topic.trim()}
            >
              <Text style={styles.generateButtonText}>Generate Analysis</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E0E1DD" />
              <Text style={styles.loadingText}>Retrieving scholar insights...</Text>
            </View>
          ) : (
            <View style={styles.analysesContainer}>
              {analyses.map((analysis, index) => (
                <View key={index} style={styles.analysisCard}>
                  <View style={styles.scholarHeader}>
                    <Image source={analysis.image} style={styles.scholarImage} />
                    <Text style={styles.scholarName}>{analysis.scholar}</Text>
                  </View>
                  <Text style={styles.analysisText}>{analysis.analysis}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorLine} />
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
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textShadow: '1px 1px 5px rgba(0, 0, 0, 0.75)',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8D99AE',
    marginTop: 4,
    textAlign: 'center',
  },
  themeImageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  themeImageBorder: {
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(72, 110, 166, 0.5)',
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  themeImage: {
    width: 280,
    height: 180,
    borderRadius: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    color: '#E0E1DD',
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
    marginBottom: 16,
  },
  scholarSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 8,
  },
  scholarButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scholarButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
  },
  activeScholar: {
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scholarButtonText: {
    color: '#8D99AE',
    fontSize: 14,
  },
  activeScholarText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    fontSize: 16,
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
});