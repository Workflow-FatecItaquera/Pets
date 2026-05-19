import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function ReservaCard({ data }) {
  const time = data.startDate 
    ? new Date(data.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

  const petName = data?.pet?.name || 'Pet desconhecido';
  const tutorName = data?.pet?.tutor?.name || 'Tutor não informado';
  const petPhoto = data?.pet?.photo || 'https://via.placeholder.com/50';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftIndicator} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={{ uri: petPhoto }} style={styles.avatar} />
          
          <View style={styles.headerText}>
            <Text style={styles.petName}>{petName}</Text>
            <Text style={styles.tutorName}>Tutor: {tutorName}</Text>
          </View>

          <View style={[styles.statusBadge, data.status === 'EM BANHO' && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, data.status === 'EM BANHO' && styles.statusTextActive]}>
              {data.status || 'AGUARDANDO'}
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
            <Text style={styles.detailValue}>{data.title}</Text>
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
  leftIndicator: { width: 6, backgroundColor: COLORS.primary },
  content: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.border },
  headerText: { flex: 1, marginLeft: 10 },
  petName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  tutorName: { fontSize: 12, color: COLORS.inactive },
  statusBadge: { backgroundColor: '#FFF4E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeActive: { backgroundColor: COLORS.primary },
  statusText: { fontSize: 10, fontWeight: 'bold', color: COLORS.secondary },
  statusTextActive: { color: COLORS.white },
  detailsRow: { flexDirection: 'row', marginBottom: 15 },
  detailBlock: { marginRight: 40 },
  detailLabel: { fontSize: 10, color: COLORS.inactive, fontWeight: 'bold', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  footerText: { fontSize: 12, color: COLORS.inactive, marginLeft: 5 },
});