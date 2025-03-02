import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getScholarAnalysis } from '@/services/AnalysisService';
import { BookOpen, Brain, History } from 'lucide-react-native';

export default function AnalysisScreen() {
  const [topic, setTopic] = useState('');
  const [activeScholar, setActiveScholar] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ['scholarAnalysis', topic, activeScholar],
    queryFn: () => getScholarAnalysis(topic, activeScholar),
    enabled: false,
  });

  const handleAnalyze = () => {
    if (topic.trim()) {
      setIsAnalyzing(true);
      refetch().finally(() => setIsAnalyzing(false));
    }
  };

  const renderScholarTab = (id, name, icon) => (
    <TouchableOpacity
      style={[styles.scholarTab, activeScholar === id && styles.activeScholarTab]}
      onPress={() => setActiveScholar(id)}
    >
      {icon}
      <Text style={[styles.scholarTabText, activeScholar === id && styles.activeScholarTabText]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.errorText}>Error generating analysis. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleAnalyze}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysis) {
      return (
        <View style={styles.emptyContainer}>
          <BookOpen size={48} color="#6200ee" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Enter a topic to analyze</Text>
          <Text style={styles.emptySubtitle}>
            Get insights from renowned scholars on any topic of interest
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.analysisContent}>
        {analysis.map((item, index) => (
          <View key={index} style={styles.scholarAnalysis}>
            <View style={styles.scholarHeader}>
              <Text style={styles.scholarName}>{item.scholar}</Text>
            </View>
            <Text style={styles.analysisText}>{item.analysis}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a topic for scholar analysis..."
          value={topic}
          onChangeText={setTopic}
          onSubmitEditing={handleAnalyze}
        />
        <TouchableOpacity 
          style={[styles.analyzeButton, !topic.trim() && styles.disabledButton]} 
          onPress={handleAnalyze}
          disabled={!topic.trim() || isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scholarTabs}>
        {renderScholarTab('all', 'All Scholars', <BookOpen size={16} color={activeScholar === 'all' ? '#fff' : '#6200ee'} />)}
        {renderScholarTab('welsing', 'Dr. Welsing', <Brain size={16} color={activeScholar === 'welsing' ? '#fff' : '#6200ee'} />)}
        {renderScholarTab('wilson', 'Dr. Wilson', <Brain size={16} color={activeScholar === 'wilson' ? '#fff' : '#6200ee'} />)}
        {renderScholarTab('barashango', 'Dr. Barashango', <History size={16} color={activeScholar === 'barashango' ? '#fff' : '#6200ee'} />)}
      </View>

      {renderAnalysisContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  analyzeButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b39ddb',
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scholarTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scholarTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeScholarTab: {
    backgroundColor: '#6200ee',
  },
  scholarTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 4,
  },
  activeScholarTabText: {
    color: '#fff',
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  analysisContent: {
    flex: 1,
    padding: 16,
  },
  scholarAnalysis: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scholarHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  scholarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200ee',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});