import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext'; 
import Login from '../screens/Login/index';
import TAB from './TAB';
import Profile from '../screens/Profile/index';

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { userToken } = useContext(AuthContext); 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <>
          <Stack.Screen name="Main" component={TAB} />
          <Stack.Screen 
            name="Profile" 
            component={Profile} 
            options={{ 
              headerShown: true, 
              title: 'Meu Perfil',
              headerTintColor: '#5C2D91'
            }} 
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}