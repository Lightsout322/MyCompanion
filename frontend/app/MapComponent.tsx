import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Fallback Map component when MapView is not available
export const FallbackMap = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.fallbackMap}>
    <View style={styles.fallbackMapContent}>
      <Ionicons name="map-outline" size={48} color="#666" />
      <Text style={styles.fallbackMapText}>Карта недоступна</Text>
      <Text style={styles.fallbackMapSubtext}>Установите Google Play Services</Text>
      <TouchableOpacity 
        style={styles.fallbackMapButton}
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.fallbackMapButtonText}>Настройки</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  fallbackMap: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackMapContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fallbackMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackMapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  fallbackMapButton: {
    backgroundColor: '#ff8b4c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
