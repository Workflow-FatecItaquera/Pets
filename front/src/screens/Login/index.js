import React, { useState, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URI } from '@env';
import { COLORS, SIZES } from '../../styles/theme';
import style from './style';
import { AuthContext } from '../../contexts/AuthContext';

export default function Login() {
  const { signIn } = useContext(AuthContext); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Referência para o input de senha
  const passwordInputRef = useRef(null);

  const validateEmail = (text) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('E-mail inválido', 'Insira um endereço de e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URI}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas. Tente novamente.');
      }

      const token = data.token ? data.token : String(data._id);
      const user = data;

      if (signIn) {
        await signIn(token, user);
      }

    } catch (error) {
      console.error('[Login Error]', error);
      Alert.alert('Erro de Autenticação', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.mainWrapper}>

      <View style={style.bgTopPurpleContainer} pointerEvents="none">
        <View style={style.bgTopPurpleSolid} />
        <View style={style.bgWaveCrest} />
        <View style={style.bgGoldBlob} />
        <View style={style.bgLightPurpleBlob} />
        <View style={style.bgWaveValley} />
      </View>

      <KeyboardAvoidingView 
        style={style.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={style.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={style.headerContainer}>
              <Image 
                source={require('../../../assets/Logo.png')} 
                style={style.logo} 
                resizeMode="contain"
              />
            <Text style={style.title}>Bem-vindo(a)!</Text>
          </View>

          <View style={style.formContainer}>
            <Text style={style.inputLabel}>E-mail</Text>
            <View style={style.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.inactive || '#9CA3AF'} style={style.icon} />
              <TextInput
                style={style.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <Text style={style.inputLabel}>Senha</Text>
            <View style={style.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.inactive || '#9CA3AF'} style={style.icon} />
              <TextInput
                ref={passwordInputRef}
                style={style.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={style.eyeIcon}
               >
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.inactive || '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={style.forgotPasswordContainer}>
              <Text style={style.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[style.loginButton, loading && style.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white || '#FFFFFF'} />
              ) : (
                <Text style={style.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}