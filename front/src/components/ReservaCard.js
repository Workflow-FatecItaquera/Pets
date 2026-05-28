import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS } from '../styles/theme';
import { BACKEND_URI } from '@env';

const API_URL = BACKEND_URI; 

export default function ReservaCard({ data }) {
  const time = data.startDate
    ? new Date(data.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const petName = data?.pet?.name || data?.petName || 'Pet desconhecido';
  const tutorName = data?.pet?.tutor?.name || data?.tutorName || 'Tutor não informado';
  const statusLabel = data.status || 'AGUARDANDO';

  const petId = data?.pet?._id;

  const petPhotoUrl = petId
    ? `${API_URL}/pets/${petId}/photo`
    : data?.pet?.photo || null;

  const petType = data?.pet?.type || data?.petType || '';
  const petIconName = petType.toLowerCase().trim() === 'gato' ? 'cat' : 'dog';

  const getStatusTheme = (status) => {
    const normalized = status?.toLowerCase().trim();
    if (normalized === 'concluído' || normalized === 'concluido' || normalized === 'pago') {
      return { bg: '#E8F8F5', text: '#27AE60', bar: '#2ECC71' };
    }
    if (normalized === 'aguardando' || normalized === 'agendado') {
      return { bg: '#FEF9E7', text: '#B7950B', bar: '#F1C40F' };
    }
    if (normalized === 'cancelado') {
      return { bg: '#FDEDEC', text: '#C0392B', bar: '#E74C3C' };
    }
    return { bg: '#F0F2F5', text: COLORS.text, bar: COLORS.primary };
  };

  const theme = getStatusTheme(statusLabel);

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.leftIndicator, { backgroundColor: theme.bar }]} />

      <View style={styles.content}>
        <View style={styles.header}>

          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons 
              name={petIconName} 
              size={22} 
              color="#7C3AED"
            />
            {petPhotoUrl && (
              <Image
                source={{ uri: petPhotoUrl }}
                style={styles.avatarImage}
                transition={200}
                cachePolicy="disk"
              />
            )}
          </View>

          <View style={styles.headerText}>
            <Text style={styles.petName}>{petName}</Text>
            <Text style={styles.tutorName}>Tutor: {tutorName}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              {statusLabel.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>HORÁRIO</Text>
            <Text style={styles.detailValue}>{time}</Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>SERVIÇO</Text>
            <Text style={styles.detailValue}>{data.title || 'Serviço Geral'}</Text>
          </View>
        </View>

        {data.notes ? (
          <View style={styles.footer}>
            <MaterialCommunityIcons name="text-box-outline" size={16} color={COLORS.inactive} />
            <Text style={styles.footerText} numberOfLines={1}>{data.notes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: COLORS.white, borderRadius: 16, flexDirection: 'row', marginBottom: 15, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: COLORS.border },
  leftIndicator: { width: 6 },
  content: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },

  avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  avatarImage: { ...StyleSheet.absoluteFillObject },

  headerText: { flex: 1, marginLeft: 10, marginRight: 10 },
  petName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  tutorName: { fontSize: 12, color: COLORS.inactive },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', marginBottom: 15 },
  detailBlock: { marginRight: 40 },
  detailLabel: { fontSize: 10, color: COLORS.inactive, fontWeight: 'bold', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  footerText: { fontSize: 12, color: COLORS.inactive, marginLeft: 5, flex: 1 },
});