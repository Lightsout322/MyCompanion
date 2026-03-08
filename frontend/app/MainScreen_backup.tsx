import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Fallback Map component when MapView is not available
const FallbackMap = ({ children }: { children?: React.ReactNode }) => (
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

// Sample data
const sampleWalks = [
  {
    id: 1,
    title: "Вечерняя прогулка",
    time: "Сегодня, 19:00",
    details: "Бигль Роки и корги Фиби",
    owner: "Алексей — Петроградка",
    coords: { latitude: 59.956, longitude: 30.318 }
  },
  {
    id: 2,
    title: "Утренний выгул",
    time: "Завтра, 08:30",
    details: "Хаски Сноу и бордер-колли Лаки",
    owner: "Лена — Васильевский",
    coords: { latitude: 59.935, longitude: 30.275 }
  },
  {
    id: 3,
    title: "Парк Екатерингоф",
    time: "Суббота, 11:00",
    details: "Мопс Чип и лабрадор Норд",
    owner: "Игорь — Нарвская",
    coords: { latitude: 59.905, longitude: 30.269 }
  }
];

const samplePlaces = [
  {
    id: 1,
    title: "ZOOmart",
    time: "10:00 — 22:00",
    details: "Наб. канала Грибоедова, 26",
    info: "Рейтинг 4.7 ★",
    coords: { latitude: 59.932, longitude: 30.329 }
  },
  {
    id: 2,
    title: "Ветклиника VetCare",
    time: "Круглосуточно",
    details: "Литейный пр., 14",
    info: "Отзывы с 2ГИС",
    coords: { latitude: 59.939, longitude: 30.348 }
  },
  {
    id: 3,
    title: "Приют \"Дом хвостов\"",
    time: "09:00 — 20:00",
    details: "пр. Обуховской Обороны, 86",
    info: "Рейтинг 4.9 ★",
    coords: { latitude: 59.896, longitude: 30.450 }
  }
];

const sampleAds = [
  {
    id: 1,
    title: "Пропала Молли",
    description: "Белый шпиц, ушла из двора у Чкаловской.",
    coords: { latitude: 59.955, longitude: 30.328 }
  },
  {
    id: 2,
    title: "Ищем кота Тимона",
    description: "Серый кот, откликается на имя.",
    coords: { latitude: 59.921, longitude: 30.317 }
  },
  {
    id: 3,
    title: "Потерялся пёс Ричи",
    description: "Золотистый ретривер, последний раз на Васильевском.",
    coords: { latitude: 59.945, longitude: 30.259 }
  }
];

type TabType = 'walks' | 'places' | 'ads';
type AdsMode = 'map' | 'list';

interface MainScreenProps {
  onLogout: () => void;
}

export default function MainScreen({ onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('walks');
  const [adsMode, setAdsMode] = useState<AdsMode>('map');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // в км
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const initialRegion = {
    latitude: 59.9386,
    longitude: 30.3141,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -width : 0;
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: isMenuOpen ? 0 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsMenuOpen(!isMenuOpen);
  };

  const getCurrentData = () => {
    const allData = activeTab === 'walks' ? sampleWalks : 
                   activeTab === 'places' ? samplePlaces : sampleAds;
    
    // Фильтрация по расстоянию (упрощенная логика)
    return allData.filter(item => {
      // Для примера используем случайную фильтрацию
      return Math.random() > 0.3; // Показываем примерно 70% элементов
    });
  };

  const getMarkerColor = () => {
    switch (activeTab) {
      case 'walks':
        return '#2ec5b6';
      case 'places':
        return '#ff8b4c';
      case 'ads':
        return '#f04e4e';
      default:
        return '#2ec5b6';
    }
  };

  const getMarkerEmoji = () => {
    switch (activeTab) {
      case 'walks':
        return '🐾';
      case 'places':
        return '📍';
      case 'ads':
        return '⚠️';
      default:
        return '🐾';
    }
  };

  const showMarkerInfo = (item: any) => {
    let message = '';
    if (activeTab === 'walks') {
      message = `${item.title}\n${item.time}\n${item.details}\n${item.owner}`;
    } else if (activeTab === 'places') {
      message = `${item.title}\n${item.details}\n${item.time}\n${item.info}`;
    } else if (activeTab === 'ads') {
      message = `${item.title}\n${item.description}`;
    }
    
    Alert.alert(
      item.title,
      message,
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  const TabButton = ({ type, title }: { type: TabType; title: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === type && styles.tabButtonActive]}
      onPress={() => {
        setIsTabLoading(true);
        setTimeout(() => {
          setActiveTab(type);
          setIsTabLoading(false);
        }, 300);
      }}
      disabled={isTabLoading}
    >
      {isTabLoading && activeTab === type ? (
        <Text style={[styles.tabButtonText, styles.loadingText]}>Загрузка...</Text>
      ) : (
        <Text style={[styles.tabButtonText, activeTab === type && styles.tabButtonTextActive]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* Logo with cat emoji */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🐱</Text>
        </View>
        
        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TabButton type="walks" title="Прогулки" />
          <TabButton type="places" title="Адреса" />
          <TabButton type="ads" title="Объявления" />
        </View>
        
        {/* Filter and Burger */}
        <View style={styles.headerRight}>
          {/* Distance Filter */}
          <View style={styles.distanceFilter}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.distanceText}>{maxDistance} км</Text>
          </View>
          
          {/* Burger Menu */}
          <TouchableOpacity style={styles.burger} onPress={toggleMenu}>
            <View style={[styles.burgerLine, { marginBottom: 4 }]} />
            <View style={[styles.burgerLine, { marginBottom: 4 }]} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ads Filter Bar */}
      {activeTab === 'ads' && (
        <View style={styles.adsFilterBar}>
          <TouchableOpacity
            style={[styles.chip, adsMode === 'map' && styles.chipActive]}
            onPress={() => setAdsMode('map')}
          >
            <Text style={[styles.chipText, adsMode === 'map' && styles.chipTextActive]}>
              На карте
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, adsMode === 'list' && styles.chipActive]}
            onPress={() => setAdsMode('list')}
          >
            <Text style={[styles.chipText, adsMode === 'list' && styles.chipTextActive]}>
              Списком
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {activeTab === 'ads' && adsMode === 'list' ? (
          <ScrollView style={styles.adsList}>
            {sampleAds.map((ad) => (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adCardContent}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adDescription}>{ad.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : MapView ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
          >
            {getCurrentData().map((item) => (
              <Marker
                key={item.id}
                coordinate={item.coords}
                onPress={() => showMarkerInfo(item)}
              >
                <View style={[styles.marker, { borderColor: getMarkerColor() }]}>
                  <Text style={styles.markerEmoji}>{getMarkerEmoji()}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <FallbackMap />
        )}
        
        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.adBanner}>
          <Text style={styles.adBannerText}>Реклама: Корм премиум-класса для активных питомцев</Text>
        </View>
      </View>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <Animated.View 
          style={[styles.overlay, { opacity: overlayAnim }]}
          onTouchStart={toggleMenu}
        />
      )}

      {/* Side Menu */}
      <Animated.View 
        style={[styles.sidePanel, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sidePanelHeader}>
          <Text style={styles.sidePanelTitle}>Меню</Text>
          <TouchableOpacity onPress={toggleMenu}>
            <Text style={styles.panelClose}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.panelList}>
          {/* Avatar */}
          <TouchableOpacity style={styles.panelItem}>
            <View style={styles.avatarCircle} />
            <Text style={styles.panelItemText}>Аватар</Text>
          </TouchableOpacity>
          
          {/* Profile */}
          <View style={styles.panelItem}>
            <View style={styles.panelItemContent}>
              <Text style={styles.panelItemTitle}>Профиль</Text>
              <Text style={styles.panelItemSubtitle}>Имя, питомец, порода, район</Text>
            </View>
          </View>
          
          {/* Settings */}
          <View style={styles.panelItem}>
            <View style={styles.panelItemContent}>
              <Text style={styles.panelItemTitle}>Настройки</Text>
              <Text style={styles.panelItemSubtitle}>Уведомления, язык, темы</Text>
            </View>
          </View>
          
          {/* Logout */}
          <TouchableOpacity 
            style={[styles.panelItem, styles.logoutItem]}
            onPress={() => {
              Alert.alert(
                'Выход',
                'Вы уверены, что хотите выйти из аккаунта?',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { 
                    text: 'Выйти', 
                    style: 'destructive',
                    onPress: () => {
                      toggleMenu();
                      onLogout();
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.panelItemContent}>
              <Text style={[styles.panelItemTitle, styles.logoutText]}>Выйти</Text>
              <Text style={styles.panelItemSubtitle}>Завершить сеанс</Text>
            </View>
            <Ionicons name="log-out-outline" size={20} color="#f04e4e" />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
  },
  tabSwitcher: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#333',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  burger: {
    marginLeft: 12,
    padding: 4,
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  adsFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  adsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  adCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2ec5b6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  adBanner: {
    padding: 12,
    alignItems: 'center',
  },
  adBannerText: {
    fontSize: 12,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 101,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidePanelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  panelClose: {
    fontSize: 24,
    color: '#666',
  },
  panelList: {
    flex: 1,
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  panelItemText: {
    fontSize: 16,
    color: '#333',
  },
  panelItemContent: {
    flex: 1,
  },
  panelItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  panelItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 16,
  },
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
    backgroundColor: '#2ec5b6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutText: {
    color: '#f04e4e',
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});
