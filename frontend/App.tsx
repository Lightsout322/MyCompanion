import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from './constants/colors';
import { authAPI, LoginData, RegisterData } from './services/api';

// Gradient View component with web fallback
const GradientView = ({ children, style }: { children: React.ReactNode; style: any }) => {
  if (Platform.OS === 'web') {
    // For web, use a simple View with background color (middle gradient color)
    return (
      <View style={[style, { backgroundColor: Colors.backgroundGradient.middle }]}>
        {children}
      </View>
    );
  }
  return (
    <LinearGradient
      colors={[Colors.backgroundGradient.start, Colors.backgroundGradient.middle, Colors.backgroundGradient.end]}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

type AuthMode = 'login' | 'register';

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Error boundary for debugging
  React.useEffect(() => {
    console.log('App mounted, Platform:', Platform.OS);
  }, []);
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Button animation
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  // Check if form is valid
  const isLoginValid = loginPhone.trim().length > 0 && loginPassword.trim().length > 0;
  const isRegisterValid = 
    registerName.trim().length > 0 &&
    registerPhone.trim().length > 0 &&
    registerEmail.trim().length > 0 &&
    registerPassword.trim().length > 0;

  const isFormValid = mode === 'login' ? isLoginValid : isRegisterValid;

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const loginData: LoginData = {
          phone: loginPhone.trim(),
          password: loginPassword,
        };
        const response = await authAPI.login(loginData);
        
        if (response.success) {
          Alert.alert('Успешно', 'Вход выполнен!', [
            { text: 'OK', onPress: () => {
              // Navigate to main app screen here
              console.log('User logged in:', response.user);
            }},
          ]);
        }
      } else {
        const registerData: RegisterData = {
          name: registerName.trim(),
          phone: registerPhone.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        };
        const response = await authAPI.register(registerData);
        
        if (response.success) {
          Alert.alert('Успешно', 'Регистрация завершена!', [
            { text: 'OK', onPress: () => {
              // Navigate to main app screen here
              console.log('User registered:', response.user);
            }},
          ]);
        }
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'web' ? undefined : 'height'}
    >
      <GradientView style={styles.gradient}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo placeholder */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🐱</Text>
            </View>

            {/* Toggle Switch */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, mode === 'login' && styles.toggleButtonActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                  Вход
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, mode === 'register' && styles.toggleButtonActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>
                  Регистрация
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {mode === 'login' ? (
                <View>
                  <TextInput
                    style={[styles.input, styles.inputSpacing]}
                    placeholder="Номер телефона"
                    placeholderTextColor={Colors.textSecondary}
                    value={loginPhone}
                    onChangeText={setLoginPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    placeholderTextColor={Colors.textSecondary}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View>
                  <TextInput
                    style={[styles.input, styles.inputSpacing]}
                    placeholder="Имя"
                    placeholderTextColor={Colors.textSecondary}
                    value={registerName}
                    onChangeText={setRegisterName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, styles.inputSpacing]}
                    placeholder="Номер телефона"
                    placeholderTextColor={Colors.textSecondary}
                    value={registerPhone}
                    onChangeText={setRegisterPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={[styles.input, styles.inputSpacing]}
                    placeholder="Электронная почта"
                    placeholderTextColor={Colors.textSecondary}
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    placeholderTextColor={Colors.textSecondary}
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Submit Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !isFormValid && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isLoading}
                >
                  <Text style={[
                    styles.submitButtonText,
                    !isFormValid && styles.submitButtonTextDisabled,
                  ]}>
                    {isLoading ? 'Загрузка...' : 'ВВОД'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </GradientView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      width: '100%',
    }),
  },
  gradient: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      width: '100%',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 64,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.text,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.surface,
  },
  formContainer: {
    width: '100%',
  },
  inputSpacing: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: Colors.buttonActive,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.buttonActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  submitButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});

