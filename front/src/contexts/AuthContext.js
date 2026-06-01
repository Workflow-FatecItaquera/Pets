// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userString = await SecureStore.getItemAsync('userData');
        
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
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
    setUserToken(token);
    setUserData(user);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setUserToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};