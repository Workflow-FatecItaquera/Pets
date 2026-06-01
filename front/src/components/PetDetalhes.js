import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BACKEND_URI } from '@env';
import { COLORS, SIZES } from '../styles/theme';
import PetForm from './PetForm';

export default function PetDetalhes({ visible, petId, petData: initialPetData, onClose, onUpdate, onDelete }) {
  const [petData, setPetData] = useState(initialPetData || null);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (visible && initialPetData) {
      setPetData(initialPetData);
    } else if (visible && petId && !initialPetData) {
      fetchPetDetails();
    }
  }, [visible, initialPetData, petId]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URI}/pets/${petId}`);
      if (!response.ok) throw new Error('Falha ao buscar detalhes');
      const data = await response.json();
      setPetData(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as informações do pet.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedPet) => {
    setPetData(updatedPet); 
    setIsFormVisible(false);
    if (onUpdate) onUpdate(updatedPet);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pet</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {loading || !petData ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.profileSection}>
                {petData.photo ? (
                  <Image 
                    source={{ uri: `${BACKEND_URI}/pets/${petData._id}/photo?timestamp=${new Date().getTime()}` }} 
                    style={styles.petPhoto} 
                    cachePolicy="none"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialCommunityIcons name={petData.type === 'Gato' ? "cat" : "dog"} size={64} color={COLORS.primary} /> 
                  </View>
                )}
                <Text style={styles.name}>{petData.name || petData.petName}</Text>
                <Text style={styles.breed}>{petData.breed || 'Raça não informada'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Características</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>{petData.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Porte</Text>
                  <Text style={styles.infoValue}>{petData.size || '-'}</Text> 
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Temperamento</Text>
                  <Text style={styles.infoValue}>{petData.behavior || petData.temperament || '-'}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Saúde e Notas</Text>
                <View style={styles.infoRowVertical}>
                  <Text style={styles.infoLabel}>Alergias / Restrições</Text>
                  <Text style={styles.infoValueText}>{petData.aestheticPreferences || petData.allergies || 'Nenhuma alergia relatada.'}</Text>
                </View>
                <View style={styles.infoRowVertical}>
                  <Text style={styles.infoLabel}>Observações Gerais</Text>
                  <Text style={styles.infoValueText}>{petData.notes || 'Nenhuma observação cadastrada.'}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Dados do Tutor</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoValue}>{petData.tutor?.name || petData.tutorName || 'Não informado'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{petData.tutor?.phone || petData.phone || 'Não informado'}</Text> 
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setIsFormVisible(true)}>
              <MaterialCommunityIcons name="pencil" size={28} color={COLORS.white} /> 
            </TouchableOpacity>

            <PetForm 
              visible={isFormVisible} 
              onClose={() => setIsFormVisible(false)} 
              apiUrl={BACKEND_URI} 
              onSaveSuccess={handleUpdateSuccess}
              onDeleteSuccess={() => {
                setIsFormVisible(false);
                if (onDelete) onDelete();
              }}
              mode="full" 
              initialData={petData} 
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingTop: 20, paddingBottom: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  backBtn: { padding: 4 },
  scrollContent: { padding: SIZES.padding, paddingBottom: 100 },
  profileSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  petPhoto: { width: 140, height: 140, borderRadius: 70, marginBottom: 16 },
  photoPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#F0E6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  breed: { fontSize: 16, color: COLORS.inactive },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoRowVertical: { marginBottom: 16 },
  infoLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  infoValueText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  fab: { position: 'absolute', bottom: 30, right: SIZES.padding, backgroundColor: COLORS.secondary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
});