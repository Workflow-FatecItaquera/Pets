import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        let token = null;
        let userString = null;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
          userString = localStorage.getItem('userData');
        } else {
          token = await SecureStore.getItemAsync('userToken');
          userString = await SecureStore.getItemAsync('userData');
        }
        
        if (token && userString) {
          setUserToken(token);
          setUserData(JSON.parse(userString));
        }
      } catch (e) {
        console.error("Erro ao recuperar os dados de autenticação", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token, user) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
      }
      setUserToken(token);
      setUserData(user);
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  };

  const updateUser = async (user) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
      }
      setUserData(user);
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
    }
  };

  const signOut = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
      }
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userData, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};