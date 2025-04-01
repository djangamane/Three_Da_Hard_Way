import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Image, Linking, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, Filter, Info, Shield, Trash, Tool } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [breakingNewsEnabled, setBreakingNewsEnabled] = useState(true);
  const [scholarUpdatesEnabled, setScholarUpdatesEnabled] = useState(true);
  const [filterKeywords, setFilterKeywords] = useState(['racism', 'MAGA', 'politics', 'economy']);
  const router = useRouter();

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notificationsEnabled);
        setBreakingNewsEnabled(parsedSettings.breakingNewsEnabled);
        setScholarUpdatesEnabled(parsedSettings.scholarUpdatesEnabled);
        if (parsedSettings.filterKeywords) {
          setFilterKeywords(parsedSettings.filterKeywords);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notificationsEnabled,
        breakingNewsEnabled,
        scholarUpdatesEnabled,
        filterKeywords,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleNotifications = async (value) => {
    if (value && Platform.OS !== 'web') {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
    }
    
    setNotificationsEnabled(value);
    // If turning off notifications, also turn off sub-settings
    if (!value) {
      setBreakingNewsEnabled(false);
      setScholarUpdatesEnabled(false);
    } else {
      // If turning on notifications, turn on default sub-settings
      setBreakingNewsEnabled(true);
      setScholarUpdatesEnabled(true);
    }
  };

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [notificationsEnabled, breakingNewsEnabled, scholarUpdatesEnabled, filterKeywords]);

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setNotificationsEnabled(false);
              setBreakingNewsEnabled(true);
              setScholarUpdatesEnabled(true);
              setFilterKeywords(['racism', 'MAGA', 'politics', 'economy']);
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
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
            <Text style={styles.headerTitle}>SLIM Settings</Text>
            <Text style={styles.headerSubtitle}>Scholar Lens Insights Module</Text>
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

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Scholar Insights System</Text>
            <Text style={styles.sectionDescription}>
              SLIM uses advanced Retrieval Augmented Generation (RAG) to provide authentic scholar perspectives on current events.
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Current Implementation</Text>
              <View style={styles.cardDivider} />
              <Text style={styles.cardText}>
                • Hybrid system combining RAG with OpenAI{'\n'}
                • Core excerpts from scholar works{'\n'}
                • Authentically crafted scholar perspectives{'\n'}
                • Semantic search for relevant context
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Development Roadmap</Text>
              <View style={styles.cardDivider} />
              <Text style={styles.cardText}>
                • Complete scholar text integration{'\n'}
                • Enhanced retrieval accuracy{'\n'}
                • Expanded scholar database{'\n'}
                • More sophisticated analysis patterns
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.learnMoreButton}
              onPress={() => Linking.openURL('https://en.wikipedia.org/wiki/Retrieval-augmented_generation')}
            >
              <Text style={styles.learnMoreText}>Learn More About RAG</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About The Scholars</Text>
            <Text style={styles.sectionDescription}>
              SLIM features insightful analysis from these remarkable scholars:
            </Text>

            <View style={styles.scholarCard}>
              <Image 
                source={require('@/assets/images/fcwelsing.png')} 
                style={styles.scholarImage}
              />
              <View style={styles.scholarInfo}>
                <Text style={styles.scholarName}>Dr. Frances Cress Welsing</Text>
                <Text style={styles.scholarDesc}>
                  Psychiatrist and author of "The Isis Papers"; developed the Color-Confrontation theory examining white supremacy psychology.
                </Text>
              </View>
            </View>

            <View style={styles.scholarCard}>
              <Image 
                source={require('@/assets/images/dramos-Photoroom.png')} 
                style={styles.scholarImage}
              />
              <View style={styles.scholarInfo}>
                <Text style={styles.scholarName}>Dr. Amos Wilson</Text>
                <Text style={styles.scholarDesc}>
                  Theoretical psychologist and author of "Blueprint for Black Power"; known for analysis of power dynamics and economics.
                </Text>
              </View>
            </View>

            <View style={styles.scholarCard}>
              <Image 
                source={require('@/assets/images/ishakamusa-Photoroom.png')} 
                style={styles.scholarImage}
              />
              <View style={styles.scholarInfo}>
                <Text style={styles.scholarName}>Dr. Ishakamusa Barashango</Text>
                <Text style={styles.scholarDesc}>
                  Historian, lecturer and author focused on African spiritual systems and historical revisionism.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
            <Text style={styles.sectionDescription}>
              Access administrative tools for updating news content and managing the app.
            </Text>
            
            <Link href="admin-tools" asChild>
              <TouchableOpacity style={styles.adminButton}>
                <Tool size={20} color="#e0e1dd" style={styles.adminButtonIcon} />
                <Text style={styles.adminButtonText}>Update News from Email</Text>
              </TouchableOpacity>
            </Link>
            
            <Text style={styles.adminDescription}>
              Use the admin tools to manually update the news feed with your latest State of White Supremacy Alerts email content.
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <View style={styles.optionItem}>
              <TouchableOpacity 
                style={styles.dangerButton}
                onPress={clearAllData}
              >
                <Text style={styles.buttonText}>Clear All Data</Text>
              </TouchableOpacity>
              <Text style={styles.optionDescription}>
                This will clear all saved data, including settings and cached news
              </Text>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.copyrightText}>© 2024 SLIM Analysis</Text>
          </View>
        </ScrollView>
        
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorLine1} />
        <View style={styles.decorLine2} />
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textShadow: '1px 1px 5px rgba(0, 0, 0, 0.75)',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8D99AE',
    marginTop: 4,
  },
  themeImageContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  themeImageBorder: {
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(72, 110, 166, 0.5)',
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  themeImage: {
    width: 320,
    height: 200,
    borderRadius: 12,
  },
  sectionContainer: {
    backgroundColor: 'rgba(14, 17, 23, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8D99AE',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  learnMoreButton: {
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  learnMoreText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
  scholarCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(35, 41, 54, 0.95)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(72, 110, 166, 0.3)',
  },
  scholarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scholarInfo: {
    flex: 1,
  },
  scholarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 4,
  },
  scholarDesc: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#8D99AE',
  },
  copyrightText: {
    fontSize: 12,
    color: '#8D99AE',
    marginTop: 4,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
    backgroundColor: 'rgba(65, 90, 119, 0.2)',
    zIndex: -1,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -30,
    left: -30,
    backgroundColor: 'rgba(27, 38, 59, 0.3)',
    zIndex: -1,
  },
  decorLine1: {
    position: 'absolute',
    width: 3,
    height: '40%',
    top: '10%',
    right: 40,
    backgroundColor: 'rgba(200, 210, 225, 0.08)',
    zIndex: -1,
  },
  decorLine2: {
    position: 'absolute',
    width: 3,
    height: '30%',
    bottom: '15%',
    left: 60,
    backgroundColor: 'rgba(200, 210, 225, 0.08)',
    zIndex: -1,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 80, 120, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adminButtonIcon: {
    marginRight: 12,
  },
  adminButtonText: {
    color: '#e0e1dd',
    fontSize: 16,
    fontWeight: '500',
  },
  adminDescription: {
    color: '#bdc6d1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  optionItem: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#E0E1DD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: '#8D99AE',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  dangerButton: {
    backgroundColor: 'rgba(119, 65, 65, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
});