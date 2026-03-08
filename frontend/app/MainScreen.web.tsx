import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import WebMap from './WebMap';

const { width } = Dimensions.get('window');

// Fallback Map component (на вебе почти не нужен, но оставим как запасной вариант)
const FallbackMap = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.fallbackMap}>
    <View style={styles.fallbackMapContent}>
      <Ionicons name="map-outline" size={48} color="#666" />
      <Text style={styles.fallbackMapText}>Карта недоступна</Text>
      <Text style={styles.fallbackMapSubtext}>Попробуйте обновить страницу</Text>
      <TouchableOpacity
        style={styles.fallbackMapButton}
        onPress={() => Linking.openURL(window.location.href)}
      >
        <Text style={styles.fallbackMapButtonText}>Обновить</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

// Sample data
const sampleWalks = [
  {
    id: 1,
    title: 'Вечерняя прогулка',
    time: 'Сегодня, 19:00',
    details: 'Бигль Роки и корги Фиби',
    owner: 'Алексей — Петроградка',
    coords: { latitude: 59.956, longitude: 30.318 },
  },
  {
    id: 2,
    title: 'Утренний выгул',
    time: 'Завтра, 08:30',
    details: 'Хаски Сноу и бордер-колли Лаки',
    owner: 'Лена — Васильевский',
    coords: { latitude: 59.935, longitude: 30.275 },
  },
  {
    id: 3,
    title: 'Парк Екатерингоф',
    time: 'Суббота, 11:00',
    details: 'Мопс Чип и лабрадор Норд',
    owner: 'Игорь — Нарвская',
    coords: { latitude: 59.905, longitude: 30.269 },
  },
];

const samplePlaces = [
  {
    id: 1,
    title: 'ZOOmart',
    time: '10:00 — 22:00',
    details: 'Наб. канала Грибоедова, 26',
    info: 'Рейтинг 4.7 ★',
    coords: { latitude: 59.932, longitude: 30.329 },
  },
  {
    id: 2,
    title: 'Ветклиника VetCare',
    time: 'Круглосуточно',
    details: 'Литейный пр., 14',
    info: 'Отзывы с 2ГИС',
    coords: { latitude: 59.939, longitude: 30.348 },
  },
  {
    id: 3,
    title: 'Приют "Дом хвостов"',
    time: '09:00 — 20:00',
    details: 'пр. Обуховской Обороны, 86',
    info: 'Рейтинг 4.9 ★',
    coords: { latitude: 59.896, longitude: 30.450 },
  },
];

const sampleAds = [
  {
    id: 1,
    title: 'Пропала Молли',
    description: 'Белый шпиц, ушла из двора у Чкаловской.',
    details: 'Белый шпиц, ушла из двора у Чкаловской.',
    contact: 'Мария, +7 900 000-00-00',
    coords: { latitude: 59.955, longitude: 30.328 },
  },
  {
    id: 2,
    title: 'Ищем кота Тимона',
    description: 'Серый кот, откликается на имя.',
    details: 'Серый кот, откликается на имя.',
    contact: 'Иван, @timon-owner',
    coords: { latitude: 59.921, longitude: 30.317 },
  },
  {
    id: 3,
    title: 'Потерялся пёс Ричи',
    description: 'Золотистый ретривер, последний раз на Васильевском.',
    details: 'Золотистый ретривер, последний раз на Васильевском.',
    contact: 'Анна, +7 911 111-11-11',
    coords: { latitude: 59.945, longitude: 30.259 },
  },
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
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [maxDistance] = useState(10); // в км
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'ru' | 'en' | 'tt'>('ru');
  
  // Состояния для контекстных меню
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Динамические цвета в зависимости от темы
  const colors = {
    background: theme === 'dark' ? '#1a1a1a' : '#fff',
    card: theme === 'dark' ? '#2d2d2d' : '#fff',
    text: theme === 'dark' ? '#fff' : '#333',
    textSecondary: theme === 'dark' ? '#aaa' : '#666',
    border: theme === 'dark' ? '#404040' : '#e0e0e0',
    header: theme === 'dark' ? '#2d2d2d' : '#fff',
    tabSwitcher: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    tabActive: theme === 'dark' ? '#fff' : '#333',
    button: '#ff8b4c',
    toggleSwitch: theme === 'dark' ? '#555' : '#ccc',
    toggleActive: '#ff8b4c',
  };

  // Слушаем глобальные изменения темы
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  const [myEvents, setMyEvents] = useState<
    { id: number; title: string; time?: string; details?: string; type: 'place' }
  >([]);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const detailsSlideAnim = React.useRef(new Animated.Value(-width * 0.8)).current;

  const initialRegion = {
    latitude: 59.9386,
    longitude: 30.3141,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const toggleMenu = () => {
    console.log('toggleMenu called, isMenuOpen:', isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  const getCurrentData = () => {
    const allData =
      activeTab === 'walks' ? sampleWalks : activeTab === 'places' ? samplePlaces : sampleAds;

    return allData.filter(() => Math.random() > 0.3);
  };

  const getMarkerColor = () => {
    switch (activeTab) {
      case 'walks':
      case 'places':
      case 'ads':
      default:
        return '#ff8b4c';
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
    setSelectedItem(item);
    Animated.timing(detailsSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDetailsPanel = () => {
    Animated.timing(detailsSlideAnim, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedItem(null);
    });
  };

  const handleJoinWalk = () => {
    if (!selectedItem) return;
    Alert.alert('Присоединение', 'Вы присоединились к прогулке');
    closeDetailsPanel();
  };

  const handleGoToPlace = () => {
    if (!selectedItem) return;
    setMyEvents((prev) => {
      if (prev.some((event) => event.id === selectedItem.id && event.type === 'place')) {
        return prev;
      }
      return [
        ...prev,
        {
          type: 'place',
          id: selectedItem.id,
          title: selectedItem.title,
          time: selectedItem.time,
          details: selectedItem.details,
        },
      ];
    });
    Alert.alert('Добавлено', 'Мероприятие добавлено в "Мои события"');
    closeDetailsPanel();
  };

  const openHelpDialog = () => {
    setHelpMessage('');
    setHelpModalVisible(true);
  };

  const sendHelpMessage = () => {
    setHelpModalVisible(false);
    Alert.alert('Сообщение отправлено', 'Мы передали ваше сообщение автору объявления');
    closeDetailsPanel();
  };

  const openMyEvents = () => {
    if (!myEvents.length) {
      Alert.alert('Мои события', 'Пока нет запланированных мероприятий');
      return;
    }

    const message = myEvents
      .map((event) => `${event.title}${event.time ? ` — ${event.time}` : ''}`)
      .join('\n');

    Alert.alert('Мои события', message);
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🐱</Text>
        </View>

        <View style={styles.tabSwitcher}>
          <TabButton type="walks" title="Прогулки" />
          <TabButton type="places" title="Адреса" />
          <TabButton type="ads" title="Объявления" />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.burger} onPress={toggleMenu}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
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
        ) : (
          <WebMap
            getCurrentData={getCurrentData}
            getMarkerColor={getMarkerColor}
            getMarkerEmoji={getMarkerEmoji}
            showMarkerInfo={showMarkerInfo}
            initialRegion={initialRegion}
          />
        )}

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.adBanner}>
          <Text style={styles.adBannerText}>
            Реклама: Корм премиум-класса для активных питомцев
          </Text>
        </View>
      </View>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMenu}
          activeOpacity={0}
        />
      )}

      {/* Side Menu */}
      {isMenuOpen && (
        <View style={[styles.sidePanel, { transform: [{ translateX: 0 }], backgroundColor: colors.card }]}>
          <View style={styles.sidePanelHeader}>
            <View style={styles.sidePanelTitleContainer}>
              <Text style={[styles.sidePanelTitle, { color: colors.text }]}>Меню</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.panelList}>
            <TouchableOpacity style={styles.panelItem}>
              <View style={styles.avatarCircle} />
              <Text style={[styles.panelItemText, { color: colors.text }]}>Аватар</Text>
            </TouchableOpacity>

            <View style={styles.panelItem}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Профиль</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>Имя, питомец, порода, район</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.panelItem} onPress={openMyEvents}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Мои события</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>Список запланированных мероприятий</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.panelItem} onPress={toggleSettingsMenu}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Настройки</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>Уведомления, язык, тема</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.panelItem, styles.logoutItem]}
              onPress={() => {
                Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Выйти',
                    style: 'destructive',
                    onPress: () => {
                      toggleMenu();
                      onLogout();
                    },
                  },
                ]);
              }}
            >
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, styles.logoutText, { color: colors.text }]}>Выйти</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>Завершить сеанс</Text>
              </View>
              <Ionicons name="log-out-outline" size={20} color="#f04e4e" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Settings Menu Overlay */}
      {isSettingsMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleSettingsMenu}
          activeOpacity={0}
        />
      )}

      {/* Settings Menu */}
      {isSettingsMenuOpen && (
        <View style={[styles.sidePanel, { transform: [{ translateX: 0 }], backgroundColor: colors.card }]}>
          <View style={styles.sidePanelHeader}>
            <View style={styles.sidePanelTitleContainer}>
              <Text style={[styles.sidePanelTitle, { color: colors.text }]}>Настройки</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={toggleSettingsMenu}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.panelList}>
            <TouchableOpacity style={styles.panelItem} onPress={() => setNotifications(!notifications)}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Уведомления</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>{notifications ? 'Включены' : 'Выключены'}</Text>
              </View>
              <View style={[styles.toggleSwitch, { backgroundColor: colors.toggleSwitch }, notifications && { backgroundColor: colors.toggleActive }]}>
                <View style={styles.toggleSwitchKnob} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.panelItem} onPress={() => setShowLanguageMenu(true)}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Язык</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>{language === 'ru' ? 'Русский' : language === 'en' ? 'English' : 'Татарский'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.panelItem} onPress={() => setShowThemeMenu(true)}>
              <View style={styles.panelItemContent}>
                <Text style={[styles.panelItemTitle, { color: colors.text }]}>Тема</Text>
                <Text style={[styles.panelItemSubtitle, { color: colors.textSecondary }]}>
                  {theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Как у системы'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

                      </ScrollView>
        </View>
      )}

      {/* Language Context Menu */}
      {showLanguageMenu && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setShowLanguageMenu(false)}
            activeOpacity={0}
          />
          <View style={[styles.contextMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.contextMenuHeader}>
              <Text style={[styles.contextMenuTitle, { color: colors.text }]}>Выберите язык</Text>
            </View>
            <ScrollView style={styles.contextMenuList}>
              <TouchableOpacity 
                style={[styles.contextMenuItem, language === 'ru' && styles.selectedContextItem]} 
                onPress={() => {
                  setLanguage('ru');
                  setShowLanguageMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Русский</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contextMenuItem, language === 'en' && styles.selectedContextItem]} 
                onPress={() => {
                  setLanguage('en');
                  setShowLanguageMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contextMenuItem, language === 'tt' && styles.selectedContextItem]} 
                onPress={() => {
                  setLanguage('tt');
                  setShowLanguageMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Татарский</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.contextMenuFooter}>
              <TouchableOpacity 
                style={[styles.contextMenuButton, { backgroundColor: colors.button }]}
                onPress={() => setShowLanguageMenu(false)}
              >
                <Text style={styles.contextMenuButtonText}>ОК</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Theme Context Menu */}
      {showThemeMenu && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setShowThemeMenu(false)}
            activeOpacity={0}
          />
          <View style={[styles.contextMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.contextMenuHeader}>
              <Text style={[styles.contextMenuTitle, { color: colors.text }]}>Выберите тему</Text>
            </View>
            <ScrollView style={styles.contextMenuList}>
              <TouchableOpacity 
                style={[styles.contextMenuItem, theme === 'light' && styles.selectedContextItem]} 
                onPress={() => {
                  setTheme('light');
                  setShowThemeMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Светлая</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contextMenuItem, theme === 'dark' && styles.selectedContextItem]} 
                onPress={() => {
                  setTheme('dark');
                  setShowThemeMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Тёмная</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contextMenuItem, theme === 'system' && styles.selectedContextItem]} 
                onPress={() => {
                  setTheme('system');
                  setShowThemeMenu(false);
                }}
              >
                <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Как у системы</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.contextMenuFooter}>
              <TouchableOpacity 
                style={[styles.contextMenuButton, { backgroundColor: colors.button }]}
                onPress={() => setShowThemeMenu(false)}
              >
                <Text style={styles.contextMenuButtonText}>ОК</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Marker details sliding panel */}
      {selectedItem && (
        <>
          <TouchableOpacity
            style={styles.detailsOverlay}
            activeOpacity={1}
            onPress={closeDetailsPanel}
          />
          <Animated.View
            style={[
              styles.detailsPanel,
              { transform: [{ translateX: detailsSlideAnim }] },
            ]}
          >
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{selectedItem.title}</Text>
              <TouchableOpacity onPress={closeDetailsPanel}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContent}>
              {activeTab === 'walks' && (
                <>
                  <Text style={styles.detailsLabel}>Время прогулки</Text>
                  <Text style={styles.detailsValue}>{selectedItem.time}</Text>
                  <Text style={styles.detailsLabel}>Питомцы</Text>
                  <Text style={styles.detailsValue}>{selectedItem.details}</Text>
                  <Text style={styles.detailsLabel}>Хозяин</Text>
                  <Text style={styles.detailsValue}>{selectedItem.owner}</Text>
                  <Text style={styles.detailsLabel}>Место</Text>
                  <Text style={styles.detailsValue}>
                    {selectedItem.coords?.latitude?.toFixed(3)},{' '}
                    {selectedItem.coords?.longitude?.toFixed(3)}
                  </Text>
                </>
              )}

              {activeTab === 'places' && (
                <>
                  <Text style={styles.detailsLabel}>Адрес</Text>
                  <Text style={styles.detailsValue}>{selectedItem.details}</Text>
                  <Text style={styles.detailsLabel}>Время</Text>
                  <Text style={styles.detailsValue}>{selectedItem.time}</Text>
                  {selectedItem.info && (
                    <>
                      <Text style={styles.detailsLabel}>Информация</Text>
                      <Text style={styles.detailsValue}>{selectedItem.info}</Text>
                    </>
                  )}
                  <Text style={styles.detailsLabel}>Место</Text>
                  <Text style={styles.detailsValue}>
                    {selectedItem.coords?.latitude?.toFixed(3)},{' '}
                    {selectedItem.coords?.longitude?.toFixed(3)}
                  </Text>
                </>
              )}

              {activeTab === 'ads' && (
                <>
                  <Text style={styles.detailsLabel}>Описание</Text>
                  <Text style={styles.detailsValue}>{selectedItem.description}</Text>
                  {selectedItem.contact && (
                    <>
                      <Text style={styles.detailsLabel}>Контакты</Text>
                      <Text style={styles.detailsValue}>{selectedItem.contact}</Text>
                    </>
                  )}
                  <Text style={styles.detailsLabel}>Последнее место</Text>
                  <Text style={styles.detailsValue}>
                    {selectedItem.coords?.latitude?.toFixed(3)},{' '}
                    {selectedItem.coords?.longitude?.toFixed(3)}
                  </Text>
                </>
              )}
            </ScrollView>

            <View style={styles.detailsButtonContainer}>
              {activeTab === 'walks' && (
                <TouchableOpacity
                  style={styles.detailsPrimaryButton}
                  onPress={handleJoinWalk}
                >
                  <Text style={styles.detailsPrimaryButtonText}>Присоединиться</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'places' && (
                <TouchableOpacity
                  style={styles.detailsPrimaryButton}
                  onPress={handleGoToPlace}
                >
                  <Text style={styles.detailsPrimaryButtonText}>Иду!</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'ads' && (
                <TouchableOpacity
                  style={styles.detailsPrimaryButton}
                  onPress={openHelpDialog}
                >
                  <Text style={styles.detailsPrimaryButtonText}>Помочь</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </>
      )}

      {/* Help dialog for ads */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.helpModalOverlay}>
          <View style={styles.helpModalContent}>
            <Text style={styles.helpModalTitle}>Написать автору объявления</Text>
            <TextInput
              style={styles.helpModalInput}
              placeholder="Опишите, как вы можете помочь"
              multiline
              value={helpMessage}
              onChangeText={setHelpMessage}
            />
            <View style={styles.helpModalButtons}>
              <TouchableOpacity
                style={[styles.helpModalButton, styles.helpModalCancelButton]}
                onPress={() => setHelpModalVisible(false)}
              >
                <Text style={styles.helpModalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.helpModalButton, styles.helpModalSendButton]}
                onPress={sendHelpMessage}
              >
                <Text style={styles.helpModalSendText}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
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
    padding: 4,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#333',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    padding: 8,
    borderRadius: 4,
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    marginVertical: 1,
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
  },
  adDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff8b4c',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  adBanner: {
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
    right: width * 0.2,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 0,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidePanelTitleContainer: {
    flex: 1,
  },
  sidePanelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  panelList: {
    flex: 1,
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 16,
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
    marginBottom: 4,
  },
  panelItemSubtitle: {
    fontSize: 14,
    color: '#666',
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
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
  },
  detailsPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  detailsContent: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
  },
  detailsValue: {
    fontSize: 15,
    color: '#333',
    marginTop: 2,
  },
  detailsButtonContainer: {
    paddingVertical: 16,
  },
  detailsPrimaryButton: {
    backgroundColor: '#ff8b4c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailsPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  helpModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  helpModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpModalInput: {
    minHeight: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  helpModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  helpModalCancelButton: {
    backgroundColor: '#eee',
  },
  helpModalSendButton: {
    backgroundColor: '#ff8b4c',
  },
  helpModalButtonText: {
    color: '#333',
    fontSize: 14,
  },
  helpModalSendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#ff8b4c',
  },
  toggleSwitchKnob: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedThemeItem: {
    backgroundColor: '#fff3e6',
  },
  contextMenu: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2000,
  },
  contextMenuHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contextMenuList: {
    maxHeight: 200,
  },
  contextMenuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedContextItem: {
    backgroundColor: '#fff3e6',
  },
  contextMenuItemText: {
    fontSize: 16,
  },
  contextMenuFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contextMenuButton: {
    backgroundColor: '#ff8b4c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contextMenuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

