import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ScholarInsightProps = {
  scholar: string;
  analysis: string;
  image: any;
  index: number;
};

const ScholarInsight = ({ scholar, analysis, image, index }: ScholarInsightProps) => {
  // Different colors for each scholar card
  const gradientColors = [
    ['#1a1a2e', '#16213e'],
    ['#1b3a4b', '#235668'],
    ['#2c3e50', '#4a6572'],
  ][index % 3];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Image source={image} style={styles.scholarImage} />
          <Text style={styles.scholarName}>{scholar}</Text>
        </View>
        
        <Text style={styles.analysisText}>{analysis}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  scholarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff50',
  },
  scholarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 12,
    borderRadius: 8,
  },
});

export default ScholarInsight;