import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TAB from './TAB';
import Profile from '../screens/Profile/index';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  );
}