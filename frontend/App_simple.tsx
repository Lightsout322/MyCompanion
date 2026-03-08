import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MainScreen from './app/MainScreen';
import { authAPI, LoginData, RegisterData } from './services/api';

export default function App() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginPhone('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterPhone('');
    setRegisterEmail('');
    setRegisterPassword('');
    setMode('login');
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called', { mode });
    
    if (mode === 'login' && (!loginPhone || !loginPassword)) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    
    if (mode === 'register' && (!registerName || !registerPhone || !registerEmail || !registerPassword)) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('Attempting login...');
        const loginData: LoginData = {
          phone: loginPhone.trim(),
          password: loginPassword,
        };
        const response = await authAPI.login(loginData);
        console.log('Login response:', response);
        
        if (response.success) {
          Alert.alert('Успешно', 'Вход выполнен!', [
            { text: 'OK', onPress: () => {
              setIsAuthenticated(true);
              console.log('User logged in:', response.user);
            }},
          ]);
        }
      } else {
        console.log('Attempting registration...');
        const registerData: RegisterData = {
          name: registerName.trim(),
          phone: registerPhone.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        };
        const response = await authAPI.register(registerData);
        console.log('Register response:', response);
        
        if (response.success) {
          Alert.alert('Успешно', 'Регистрация завершена!', [
            { text: 'OK', onPress: () => {
              setIsAuthenticated(true);
              console.log('User registered:', response.user);
            }},
          ]);
        }
      }
    } catch (error: any) {
      console.log('Error:', error);
      Alert.alert('Ошибка', error.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // If authenticated, show main screen
  if (isAuthenticated) {
    return <MainScreen onLogout={handleLogout} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🐱</Text>
          <Text style={styles.logoSubtext}>My Companion</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'login' && styles.toggleButtonActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.toggleButtonText, mode === 'login' && styles.toggleButtonTextActive]}>
              Вход
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'register' && styles.toggleButtonActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.toggleButtonText, mode === 'register' && styles.toggleButtonTextActive]}>
              Регистрация
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Имя"
              value={registerName}
              onChangeText={setRegisterName}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Телефон"
            value={mode === 'login' ? loginPhone : registerPhone}
            onChangeText={mode === 'login' ? setLoginPhone : setRegisterPhone}
            keyboardType="phone-pad"
          />
          
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={mode === 'login' ? loginPassword : registerPassword}
            onChangeText={mode === 'login' ? setLoginPassword : setRegisterPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#2ec5b6',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2ec5b6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
