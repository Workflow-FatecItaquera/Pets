import React, { useContext } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../styles/theme';
import Header from '../components/Header';
import Home from '../screens/Home/index';
import Agenda from '../screens/Agenda/index';
import Pets from '../screens/Pets/index';
import Finance from '../screens/Finance/index';
import Team from '../screens/Team/index';

const Tab = createBottomTabNavigator();

export default function TAB() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabItemSize = Math.min((width / 5) * 0.85, 54);
  const { userData } = useContext(AuthContext);
  const isAdmin = userData?.isAdmin || false; 

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 14,
          paddingHorizontal: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="home" label="HOME" size={tabItemSize} />
          )
        }}
      />
      <Tab.Screen 
        name="Agenda" 
        component={Agenda} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="calendar-outline" label="AGENDA" size={tabItemSize} />
          )
        }}
      />
      <Tab.Screen 
        name="Pets" 
        component={Pets} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="paw" label="PETS" size={tabItemSize} />
          )
        }}
      />
      {isAdmin && (
        <>
          <Tab.Screen 
            name="Finance" 
            component={Finance} 
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabItem focused={focused} iconName="wallet-outline" label="FINANCE" size={tabItemSize} />
              )
            }}
          />
          <Tab.Screen 
            name="Team" 
            component={Team} 
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabItem focused={focused} iconName="people-outline" label="TEAM" size={tabItemSize} />
              )
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const CustomTabItem = ({ focused, iconName, label, size }) => {
  return (
    <View style={[
      styles.itemContainer, 
      { 
        width: size, 
        height: size,
        borderRadius: size / 2
      },
      focused && styles.itemContainerFocused
    ]}>
      <Ionicons 
        name={iconName} 
        size={20}
        color={focused ? COLORS.white : COLORS.inactive} 
      />
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        style={[styles.label, { color: focused ? COLORS.white : COLORS.inactive }]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainerFocused: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  }
});