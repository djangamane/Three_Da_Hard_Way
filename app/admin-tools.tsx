import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { processManualEmailInput } from '@/services/NewsEmailExtractor';
import { useNewsStore } from '@/hooks/useNewsStore';

export default function AdminToolsScreen() {
  const [emailContent, setEmailContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const updateNewsFromEmail = async () => {
    if (!emailContent.trim()) {
      setResult('Please paste the email content first.');
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const { fetchNewsFromEmail } = useNewsStore.getState();
      await fetchNewsFromEmail(emailContent);
      
      setResult('Success! News items have been updated from your email content.');
      
      // Clear the input after successful processing
      setEmailContent('');
      
      // Show alert (native) or console log (web)
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Success',
          'News items have been updated from your email content.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('News items updated successfully.');
      }
    } catch (error) {
      console.error('Error processing email:', error);
      setResult(`Error: ${error.message || 'Failed to process email content'}`);
    } finally {
      setIsProcessing(false);
    }
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
        <Stack.Screen 
          options={{ 
            title: 'Admin Tools',
            headerStyle: {
              backgroundColor: '#0d1b2a',
            },
            headerTintColor: '#e0e1dd',
          }} 
        />
        
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <Text style={styles.title}>Update News from Email</Text>
              
              <Text style={styles.description}>
                Paste the content of your "State of White Supremacy Alerts" email below to update the app's news feed.
              </Text>
              
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={10}
                placeholder="Paste email content here..."
                placeholderTextColor="#8d99ae"
                value={emailContent}
                onChangeText={setEmailContent}
              />
              
              <TouchableOpacity
                style={[
                  styles.button,
                  isProcessing && styles.buttonDisabled,
                  !emailContent.trim() && styles.buttonDisabled
                ]}
                onPress={updateNewsFromEmail}
                disabled={isProcessing || !emailContent.trim()}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#e0e1dd" />
                ) : (
                  <Text style={styles.buttonText}>Process Email</Text>
                )}
              </TouchableOpacity>
              
              {result && (
                <View style={styles.resultContainer}>
                  <Text style={[
                    styles.resultText,
                    result.startsWith('Error') ? styles.errorText : styles.successText
                  ]}>
                    {result}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Email Format Guidelines:</Text>
                <Text style={styles.infoText}>
                  • Email should contain headlines marked with '#' symbols{'\n'}
                  • URLs should be in markdown format: [Read more](https://example.com){'\n'}
                  • Plain URLs are also supported: https://example.com{'\n'}
                  • Each headline should be followed by a URL
                </Text>
                
                <Text style={styles.infoText}>
                  Example:{'\n'}
                  # Article Title{'\n\n'}
                  [Read more](https://example.com/article){'\n\n'}
                  # Another Article Title{'\n\n'}
                  https://another-example.com/article
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e1dd',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#bdc6d1',
    marginBottom: 24,
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: '#e0e1dd',
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4361ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(67, 97, 238, 0.5)',
  },
  buttonText: {
    color: '#e0e1dd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 24,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: '#4ade80',
  },
  errorText: {
    color: '#f87171',
  },
  infoContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e0e1dd',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#bdc6d1',
    marginBottom: 16,
    lineHeight: 20,
  },
}); 