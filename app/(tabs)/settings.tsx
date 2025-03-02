import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, Filter, Info, Shield, Trash } from 'lucide-react-native';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [breakingNewsEnabled, setBreakingNewsEnabled] = useState(true);
  const [scholarUpdatesEnabled, setScholarUpdatesEnabled] = useState(true);
  const [filterKeywords, setFilterKeywords] = useState(['racism', 'MAGA', 'politics', 'economy']);

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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#d1d1d1', true: '#b39ddb' }}
              thumbColor={notificationsEnabled ? '#6200ee' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, !notificationsEnabled && styles.disabledSetting]}>
            <Text style={[styles.settingLabel, !notificationsEnabled && styles.disabledText]}>
              Breaking News Alerts
            </Text>
            <Switch
              value={breakingNewsEnabled}
              onValueChange={setBreakingNewsEnabled}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#d1d1d1', true: '#b39ddb' }}
              thumbColor={breakingNewsEnabled ? '#6200ee' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, !notificationsEnabled && styles.disabledSetting]}>
            <Text style={[styles.settingLabel, !notificationsEnabled && styles.disabledText]}>
              Scholar Analysis Updates
            </Text>
            <Switch
              value={scholarUpdatesEnabled}
              onValueChange={setScholarUpdatesEnabled}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#d1d1d1', true: '#b39ddb' }}
              thumbColor={scholarUpdatesEnabled ? '#6200ee' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Filter size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>News Filters</Text>
          </View>
          
          <Text style={styles.filterDescription}>
            You will receive notifications for news related to these topics:
          </Text>
          
          <View style={styles.filterTags}>
            {filterKeywords.map((keyword, index) => (
              <View key={index} style={styles.filterTag}>
                <Text style={styles.filterTagText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <Text style={styles.aboutText}>
            Scholar Trends aggregates real-time trending news and provides AI-driven analysis from three renowned scholars: Dr. Frances Cress Welsing, Dr. Amos Wilson, and Dr. Ishakamusa Barashango.
          </Text>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
          </View>
          
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Trash size={16} color="#fff" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#6200ee',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  disabledSetting: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  filterDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTag: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterTagText: {
    color: '#1a73e8',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});