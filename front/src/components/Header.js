import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../styles/theme';
import Notifications from './Notifications';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    icon: 'calendar-outline',
    title: '',
    text: 'Novo Agendamento: Bento (Banho e Tosa) marcado para amanhã às 09:30.',
    unread: true,
  },
  {
    id: '2',
    icon: 'cash-outline',
    title: 'Lembrete: ',
    text: 'Pagamento de Mel (Banho Higiênico) está pendente.',
    unread: true,
  },
  {
    id: '3',
    icon: 'leaf-outline',
    title: '',
    text: 'Observação Atualizada: Verifique as novas preferências estéticas de Maximus.',
    unread: false,
  }
];

export default function Header() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isNotifVisible, setIsNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleReadSingle = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
        
        <View style={styles.leftSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.title}>Pêlos & Lambeijos</Text>
        </View>

        <View style={styles.rightSection}>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setIsNotifVisible(true)}
          >
            <View>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

      </View>

      <Notifications 
        visible={isNotifVisible} 
        onClose={() => setIsNotifVisible(false)} 
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onReadSingle={handleReadSingle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLogo,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: SIZES.fontHeader,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15, 
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
  }
});