import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import style from './style';

export default function ReservationCard({ data }) {
  // Extrai apenas a hora do startDate
  const time = new Date(data.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={style.cardContainer}>
      <View style={style.leftIndicator} />
      
      <View style={style.content}>
        <View style={style.header}>
          <Image source={{ uri: data.pet.photo }} style={style.avatar} />
          <View style={style.headerText}>
            <Text style={style.petName}>{data.pet.name}</Text>
            <Text style={style.tutorName}>Tutor: {data.pet.tutor.name}</Text>
          </View>
          <View style={[style.statusBadge, data.status === 'EM BANHO' && style.statusBadgeActive]}>
            <Text style={[style.statusText, data.status === 'EM BANHO' && style.statusTextActive]}>
              {data.status}
            </Text>
          </View>
        </View>

        <View style={style.detailsRow}>
          <View style={style.detailBlock}>
            <Text style={style.detailLabel}>HORÁRIO</Text>
            <Text style={style.detailValue}>{time}</Text>
          </View>
          <View style={style.detailBlock}>
            <Text style={style.detailLabel}>SERVIÇO</Text>
            <Text style={style.detailValue}>{data.title}</Text>
          </View>
        </View>

        {data.notes && (
          <View style={style.footer}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.inactive} />
            <Text style={style.footerText}>{data.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}