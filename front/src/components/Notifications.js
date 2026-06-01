import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,ScrollView,Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function Notifications({ 
  visible, 
  onClose, 
  notifications, 
  onMarkAllAsRead, 
  onClearAll, 
  onReadSingle 
}) {
  const [selectedNotif, setSelectedNotif] = useState(null);

  const handleClose = () => {
    setSelectedNotif(null);
    onClose();
  };

  const handleNotificationPress = (notif) => {
    onReadSingle(notif.id);
    setSelectedNotif(notif);
  };

  const confirmClearAll = () => {
    Alert.alert(
      "Limpar Notificações",
      "Tem certeza que deseja apagar todas as notificações? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar Tudo", 
          style: "destructive", 
          onPress: () => {
            onClearAll();
            if (selectedNotif) setSelectedNotif(null);
          } 
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              
              {!selectedNotif ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Notificações ({notifications.length})</Text>
                    <TouchableOpacity onPress={handleClose}>
                      <Ionicons name="close" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>

                  {notifications.length > 0 && (
                    <View style={styles.globalActionsRow}>
                      <TouchableOpacity onPress={onMarkAllAsRead} style={styles.actionButton}>
                        <Ionicons name="checkmark-done-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.actionText}>Ler todas</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmClearAll} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                        <Text style={[styles.actionText, { color: '#FF3B30' }]}>Limpar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                    {notifications.length === 0 ? (
                      <Text style={styles.emptyText}>Nenhuma notificação no momento.</Text>
                    ) : (
                      notifications.map((item, index) => (
                        <TouchableOpacity 
                          key={item.id} 
                          style={[
                            styles.notificationItem, 
                            index === notifications.length - 1 && { borderBottomWidth: 0 },
                            item.unread ? styles.unreadItemBg : null 
                          ]}
                          onPress={() => handleNotificationPress(item)}
                        >
                          <View style={styles.unreadContainer}>
                            {item.unread && <View style={styles.unreadDot} />}
                          </View>
                          <View style={styles.iconCircle}>
                            <Ionicons name={item.icon} size={20} color="#B8860B" />
                          </View>
                          <Text style={styles.notificationText} numberOfLines={2}>
                            {item.title ? <Text style={styles.textBold}>{item.title}</Text> : null}
                            {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </>
              ) : (
                <View style={styles.detailView}>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailIconCircle}>
                      <Ionicons name={selectedNotif.icon} size={28} color="#B8860B" />
                    </View>
                    <Text style={styles.modalTitle}>Detalhes</Text>
                  </View>
                  
                  <ScrollView style={styles.detailScroll}>
                    <Text style={styles.detailFullText}>
                      {selectedNotif.title ? <Text style={styles.textBold}>{selectedNotif.title}</Text> : null}
                      {selectedNotif.text}
                    </Text>
                  </ScrollView>

                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setSelectedNotif(null)}
                  >
                    <Ionicons name="arrow-back-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }}/>
                    <Text style={styles.backButtonText}>Voltar para notificações</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  globalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  listContainer: {
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadItemBg: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  unreadContainer: {
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F5DEB3'
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  textBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  detailView: {
    minHeight: 200,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
  },
  detailIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F5DEB3'
  },
  detailScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  detailFullText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  }
});