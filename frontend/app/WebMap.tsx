import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';

interface WebMapProps {
  getCurrentData: () => any[];
  getMarkerColor: () => string;
  getMarkerEmoji: () => string;
  showMarkerInfo: (item: any) => void;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function WebMap({
  getCurrentData,
  getMarkerColor,
  getMarkerEmoji,
  showMarkerInfo,
  initialRegion
}: WebMapProps) {
  const data = getCurrentData();

  // Простейшая "проекция": растягиваем координаты имеющихся точек
  // на виртуальную карту от 0 до 100% по ширине/высоте
  const coords = data
    .map((item) => item.coords)
    .filter((c) => c && typeof c.latitude === 'number' && typeof c.longitude === 'number');

  const lats = coords.map((c: any) => c.latitude);
  const lngs = coords.map((c: any) => c.longitude);

  const minLat = lats.length ? Math.min(...lats) : initialRegion.latitude - 0.05;
  const maxLat = lats.length ? Math.max(...lats) : initialRegion.latitude + 0.05;
  const minLng = lngs.length ? Math.min(...lngs) : initialRegion.longitude - 0.05;
  const maxLng = lngs.length ? Math.max(...lngs) : initialRegion.longitude + 0.05;

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const projectPoint = (item: any) => {
    const { latitude, longitude } = item.coords;
    const x = ((longitude - minLng) / lngRange) * 100;
    const y = ((maxLat - latitude) / latRange) * 100; // инвертируем, чтобы север был сверху
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Схематичная сетка улиц (похоже на кварталы Авиастроительного района)
  const horizontalStreets = [22, 30, 38, 46, 54, 62, 70, 78];
  const verticalStreets = [10, 18, 26, 34, 42, 50, 58, 66, 74, 82];

  // ВАЖНО: положи сюда свой скриншот карты и назови, например, aviastroitelny_map.png
  // путь предполагается: frontend/assets/aviastroitelny_map.png
  const mapImage = require('../assets/aviastroitelny_map.png');

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Схематичная карта города</Text>
        <Text style={styles.coordinates}>
          Центр: {initialRegion.latitude.toFixed(3)}, {initialRegion.longitude.toFixed(3)}
        </Text>

        {/* Карта как фоновое изображение + маркеры */}
        <View style={styles.mapArea}>
          <ImageBackground
            source={mapImage}
            style={styles.mapBackground}
            imageStyle={styles.mapImage}
          >
            {/* Лёгкий полупрозрачный слой, чтобы текст меток читался лучше */}
            <View style={styles.mapOverlay} />

            {data.map((item) => {
              if (!item.coords) return null;
              const pos = projectPoint(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.mapMarker,
                    {
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      backgroundColor: getMarkerColor(),
                    },
                  ]}
                  onPress={() => showMarkerInfo(item)}
                >
                  <Text style={styles.mapMarkerEmoji}>{getMarkerEmoji()}</Text>
                </TouchableOpacity>
              );
            })}
          </ImageBackground>
        </View>

        {/* Список точек под картой */}
        <ScrollView style={styles.markersList}>
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.markerItem, { borderColor: getMarkerColor() }]}
              onPress={() => showMarkerInfo(item)}
            >
              <View style={[styles.markerIcon, { backgroundColor: getMarkerColor() }]}>
                <Text style={styles.markerEmoji}>{getMarkerEmoji()}</Text>
              </View>
              <View style={styles.markerInfo}>
                <Text style={styles.markerTitle}>{item.title}</Text>
                {item.details && (
                  <Text style={styles.markerDetails}>{item.details}</Text>
                )}
                {item.coords && (
                  <Text style={styles.markerCoords}>
                    {item.coords.latitude.toFixed(3)}, {item.coords.longitude.toFixed(3)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d0e8f0',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  coordinates: {
    fontSize: 12,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  mapArea: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mapBackground: {
    flex: 1,
  },
  mapImage: {
    resizeMode: 'cover',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  mapMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapMarkerEmoji: {
    fontSize: 16,
  },
  markersList: {
    flex: 1,
  },
  markerItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerInfo: {
    flex: 1,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  markerDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  markerCoords: {
    fontSize: 12,
    color: '#95a5a6',
  },
});
