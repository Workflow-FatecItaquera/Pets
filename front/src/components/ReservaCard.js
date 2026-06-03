import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS } from '../styles/theme';
import { BACKEND_URI } from '@env';

const API_URL = BACKEND_URI;

export default function ReservaCard({ data, onPress }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const time = data?.startDate
    ? new Date(data.startDate).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const petName = data?.pet?.name || data?.petName || 'Pet desconhecido';
  const tutorName = data?.pet?.tutor?.name || data?.tutorName || 'Tutor não informado';
  const statusLabel = data?.status || 'AGUARDANDO';

  const petType = (data?.pet?.type || data?.petType || '').toLowerCase().trim();
  const petIconName = petType === 'gato' ? 'cat' : 'dog';

  const petId = data?.pet?._id;
  
  const rawPhoto = petId ? `${API_URL}/pets/${petId}/photo` : data?.pet?.photo;
  const petPhotoUrl = typeof rawPhoto === 'string' && rawPhoto.trim().length > 0 ? rawPhoto : null;

  useEffect(() => {
    setIsImageLoaded(false);
  }, [petPhotoUrl]);

  const imageSource = useMemo(() => {
    return petPhotoUrl ? { uri: petPhotoUrl } : null;
  }, [petPhotoUrl]);

  const getStatusTheme = (status) => {
    const normalized = status?.toLowerCase().trim();

    if (['concluído', 'concluido', 'pago'].includes(normalized)) {
      return { bg: '#EAF7EF', text: '#2E8B57', bar: '#3AA76D' };
    }
    if (['aguardando', 'agendado'].includes(normalized)) {
      return { bg: '#FFF7E8', text: '#B7791F', bar: '#D69E2E' };
    }
    if (normalized === 'cancelado') {
      return { bg: '#FDEEEF', text: '#B85063', bar: '#D16A7B' };
    }

    return { bg: '#F3F4F6', text: COLORS.text, bar: '#7C3AED' };
  };

  const theme = getStatusTheme(statusLabel);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.bar, { backgroundColor: theme.bar }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>

            {(!petPhotoUrl || !isImageLoaded) && (
              <View style={styles.placeholder}>
                <MaterialCommunityIcons
                  name={petIconName}
                  size={22}
                  color="#7C3AED"
                />
              </View>
            )}

            {!!petPhotoUrl && (
              <Image
                source={imageSource}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="none"
                onLoad={() => setIsImageLoaded(true)}
              />
            )}
          </View>

          <View style={styles.headerText}>
            <Text 
              style={styles.petName} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {petName}
            </Text>

            <Text 
              style={styles.tutorName} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              Tutor: {tutorName}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: theme.bg }]}>
            <Text
              style={[styles.badgeText, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {statusLabel.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.label}>HORÁRIO</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={[styles.detail, styles.service]}>
            <Text style={styles.label}>SERVIÇO</Text>
            <Text
              style={styles.value}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {data?.title || 'Serviço Geral'}
            </Text>
          </View>
        </View>

        {!!data?.notes && (
          <View style={styles.footer}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={15}
              color="#9CA3AF"
            />
            <Text
              style={styles.footerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {data.notes}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
    backgroundColor: '#F9FAFB',
  },
  bar: { width: 6 },
  content: {
    flex: 1,
    padding: 15,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  placeholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  avatarImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  headerText: {
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0, 
  },
  petName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  tutorName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badge: {
    maxWidth: 110,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 16,
  },
  detail: {
    flexShrink: 1,
  },
  service: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    paddingTop: 10,
    minWidth: 0,
  },
  footerText: {
    flex: 1, 
    marginLeft: 5,
    fontSize: 12,
    color: '#6B7280',
  },
});