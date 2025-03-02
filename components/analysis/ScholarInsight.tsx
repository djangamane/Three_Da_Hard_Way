import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ScholarInsightProps = {
  scholar: string;
  analysis: string;
};

export default function ScholarInsight({ scholar, analysis }: ScholarInsightProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.scholarName}>{scholar}</Text>
      </View>
      <Text style={styles.analysisText}>{analysis}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
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