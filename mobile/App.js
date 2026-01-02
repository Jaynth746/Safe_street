import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

// ==========================================
// 🔧 BACKEND API CONFIGURATION
// Configure your backend details here
// ==========================================
const API_CONFIG = {
  // Base URL for the API
  // Android Emulator uses 10.0.2.2, iOS uses localhost
  baseUrl: 'ADD_YOUR_IP',

  // Endpoint path for image analysis
  endpoint: '/analyze',

  // Name of the field expected by the backend for the image file
  imageFieldName: 'roadImage',
};

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    try {
      console.log("Requesting media library permissions...");
      // Ensure we have permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      console.log("Launching image library...");
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Using array string format which is safer across versions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image picker result:", result.canceled ? "Canceled" : "Selected");

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error("PickImage Error:", error);
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please upload an image first.');
      return;
    }

    setLoading(true);
    console.log("Starting analysis...");

    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Web specific handling: Fetch the blob from the URI
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append(API_CONFIG.imageFieldName, blob, 'upload.jpg');
        console.log("Web: Blob prepared");
      } catch (err) {
        console.error("Web Blob Error:", err);
        setLoading(false);
        Alert.alert('Error', 'Failed to process image on web.');
        return;
      }
    } else {
      // Mobile handling
      const uri = image;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append(API_CONFIG.imageFieldName, {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      // Use the configured base URL and endpoint
      const fullUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`;
      console.log(`Sending request to: ${fullUrl}`);

      const response = await axios.post(fullUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Response received:", response.status);

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        Alert.alert('Analysis Failed', response.data.error || 'Unknown error from server');
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      // improved error message
      const errMsg = error.response ? `Server Error: ${error.response.status}` : error.message;
      Alert.alert('Connection Error', `Could not connect to backend.\nDetails: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#ef4444'; // Red
      case 'Medium': return '#eab308'; // Yellow
      case 'Low': return '#22c55e'; // Green
      default: return '#94a3b8'; // Gray
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.logoText}>Safe Street Mobile</Text>
          <Text style={styles.subtitle}>AI Road Damage Detection</Text>
        </View>

        <View style={styles.card}>
          {image ? (
            <View>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {!result && (
                <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Tap to Upload Road Image</Text>
            </TouchableOpacity>
          )}

          {image && !result && !loading && (
            <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeImage}>
              <Text style={styles.btnText}>Analyze Road</Text>
            </TouchableOpacity>
          )}

          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loaderText}>Analyzing Image...</Text>
            </View>
          )}
        </View>

        {result && (
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.resultTitle}>Analysis Report</Text>

            <View style={styles.resultRow}>
              <Text style={styles.label}>Damage Type</Text>
              <Text style={styles.value}>{result.damageType}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.label}>Severity</Text>
              <View style={[styles.badge, { backgroundColor: getSeverityColor(result.severity) + '33' }]}>
                <Text style={[styles.badgeText, { color: getSeverityColor(result.severity) }]}>
                  {result.severity}
                </Text>
              </View>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.label}>Confidence</Text>
              <Text style={styles.value}>
                {typeof result.confidence === 'number'
                  ? Math.round(result.confidence * 100) + '%'
                  : result.confidence}
              </Text>
            </View>

            <View style={styles.descContainer}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{result.description}</Text>
            </View>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setImage(null); setResult(null); }}>
              <Text style={styles.secondaryBtnText}>Analyze Another</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  uploadArea: {
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  uploadIcon: {
    fontSize: 50,
    marginBottom: 10,
    color: '#6366f1',
  },
  uploadText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeBtn: {
    marginTop: 20,
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderText: {
    color: '#94a3b8',
    marginTop: 10,
  },
  resultCard: {
    borderColor: '#6366f1',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  value: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  descContainer: {
    marginTop: 10,
  },
  description: {
    color: '#f8fafc',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  secondaryBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryBtnText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
});
