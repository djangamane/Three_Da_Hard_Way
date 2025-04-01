import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to scholar-trends after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/scholar-trends');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/theme.png')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(13, 27, 42, 0.8)', 'rgba(27, 38, 59, 0.8)', 'rgba(65, 90, 119, 0.8)']}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>SLIM</Text>
          </View>
          <Text style={styles.title}>Scholar Insights</Text>
          <Text style={styles.subtitle}>Powered by RAG Technology</Text>
        </View>
        
        <ActivityIndicator size="large" color="#e0e1dd" />
        <Text style={styles.loadingText}>Loading scholar analysis...</Text>
        
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e0e1dd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e0e1dd',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc6d1',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    color: '#bdc6d1',
    fontSize: 16,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(65, 90, 119, 0.15)',
    zIndex: -1,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -40,
    left: -40,
    backgroundColor: 'rgba(27, 38, 59, 0.2)',
    zIndex: -1,
  },
});