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

// Sample data
const sampleWalks = [
  {
    id: 1,
    title: "Вечерняя прогулка",
    time: "Сегодня, 19:00",
    details: "Бигль Роки и корги Фиби",
    owner: "Алексей — Петроградка"
  },
  {
    id: 2,
    title: "Утренний выгул",
    time: "Завтра, 08:30",
    details: "Хаски Сноу и бордер-колли Лаки",
    owner: "Лена — Васильевский"
  },
  {
    id: 3,
    title: "Парк Екатерингоф",
    time: "Суббота, 11:00",
    details: "Мопс Чип и лабрадор Норд",
    owner: "Игорь — Нарвская"
  }
];

const samplePlaces = [
  {
    id: 1,
    title: "ZOOmart",
    time: "10:00 — 22:00",
    details: "Наб. канала Грибоедова, 26",
    info: "Рейтинг 4.7 ★"
  },
  {
    id: 2,
    title: "Ветклиника VetCare",
    time: "Круглосуточно",
    details: "Литейный пр., 14",
    info: "Отзывы с 2ГИС"
  },
  {
    id: 3,
    title: "Приют \"Дом хвостов\"",
    time: "09:00 — 20:00",
    details: "пр. Обуховской Обороны, 86",
    info: "Рейтинг 4.9 ★"
  }
];

const sampleAds = [
  {
    id: 1,
    title: "Пропала Молли",
    description: "Белый шпиц, ушла из двора у Чкаловской."
  },
  {
    id: 2,
    title: "Ищем кота Тимона",
    description: "Серый кот, откликается на имя."
  },
  {
    id: 3,
    title: "Потерялся пёс Ричи",
    description: "Золотистый ретривер, последний раз на Васильевском."
  }
];

type TabType = 'walks' | 'places' | 'ads';

interface MainScreenProps {
  onLogout: () => void;
}

export default function MainScreen({ onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('walks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

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
    
    return allData.filter(item => {
      return Math.random() > 0.3;
    });
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
          <View style={styles.distanceFilter}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.distanceText}>{maxDistance} км</Text>
          </View>
          
          <TouchableOpacity style={styles.burger} onPress={toggleMenu}>
            <View style={[styles.burgerLine, { marginBottom: 4 }]} />
            <View style={[styles.burgerLine, { marginBottom: 4 }]} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView style={styles.contentList}>
          {getCurrentData().map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemCard}
              onPress={() => {
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
              }}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {activeTab === 'walks' && (
                  <>
                    <Text style={styles.itemTime}>{item.time}</Text>
                    <Text style={styles.itemDetails}>{item.details}</Text>
                    <Text style={styles.itemOwner}>{item.owner}</Text>
                  </>
                )}
                {activeTab === 'places' && (
                  <>
                    <Text style={styles.itemTime}>{item.time}</Text>
                    <Text style={styles.itemDetails}>{item.details}</Text>
                    <Text style={styles.itemInfo}>{item.info}</Text>
                  </>
                )}
                {activeTab === 'ads' && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={toggleMenu}
        />
      )}

      {/* Side Menu */}
      <Animated.View 
        style={[
          styles.sideMenu, 
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
          <Text style={styles.userName}>Пользователь</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        <ScrollView style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Редактировать профиль</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Настройки</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
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
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemText, styles.logoutText]}>Выйти</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
  },
  tabSwitcher: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 18,
  },
  tabButtonActive: {
    backgroundColor: '#2ec5b6',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
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
  burger: {
    padding: 4,
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
  },
  mainContent: {
    flex: 1,
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  itemOwner: {
    fontSize: 14,
    color: '#2ec5b6',
  },
  itemInfo: {
    fontSize: 14,
    color: '#ff8b4c',
  },
  itemDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
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
});
