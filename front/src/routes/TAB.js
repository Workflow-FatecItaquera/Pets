import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Home from '../screens/Home/index';
import Agenda from '../screens/Agenda/index';
import Pets from '../screens/Pets/index';
import Finance from '../screens/Finance/index';
import Team from '../screens/Team/index';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#5C2D91',
  inactive: '#B39DCD',
  white: '#FFFFFF',
  background: '#FFFFFF'
};

export default function TAB() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabItemWidth = (width / 5) * 0.85;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 70,
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
          paddingHorizontal: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="home" label="HOME" itemWidth={tabItemWidth} />
          )
        }}
      />
      <Tab.Screen 
        name="Agenda" 
        component={Agenda} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="calendar-outline" label="AGENDA" itemWidth={tabItemWidth} />
          )
        }}
      />
      <Tab.Screen 
        name="Pets" 
        component={Pets} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="paw" label="PETS" itemWidth={tabItemWidth} />
          )
        }}
      />
      <Tab.Screen 
        name="Finance" 
        component={Finance} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="wallet-outline" label="FINANCE" itemWidth={tabItemWidth} />
          )
        }}
      />
      <Tab.Screen 
        name="Team" 
        component={Team} 
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabItem focused={focused} iconName="people-outline" label="TEAM" itemWidth={tabItemWidth} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const CustomTabItem = ({ focused, iconName, label, itemWidth }) => {
  return (
    <View style={[
      styles.itemContainer, 
      { width: itemWidth },
      focused && styles.itemContainerFocused
    ]}>
      <Ionicons 
        name={iconName} 
        size={22}
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
    paddingVertical: 8,
    borderRadius: 30,
  },
  itemContainerFocused: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  }
});