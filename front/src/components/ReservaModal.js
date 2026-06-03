import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../styles/theme';
import PetForm from '../components/PetForm';
import PetDropdown from '../components/PetDropdown';
import { AuthContext } from '../contexts/AuthContext';

const { height } = Dimensions.get('window');

const SERVICE_CATALOG = [
  { id: 1, name: 'Banho Premium', price: 60.00, icon: 'shower', duration: 45 }, 
  { id: 2, name: 'Tosa Higiênica', price: 25.00, icon: 'content-cut', duration: 30 }
];

export default function ReservaModal({ visible, onClose, selectedDate, apiUrl, onSaveSuccess }) {
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;

  const [pets, setPets] = useState([]);
  const [isFetchingPets, setIsFetchingPets] = useState(false);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [quickModalVisible, setQuickModalVisible] = useState(false);
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());

  const [form, setForm] = useState({
    pet: null,
    date: selectedDate,
    packageType: 'Avulso',
    services: [], 
    notes: '',
  });

  useEffect(() => {
    if (visible) {
      const baseDate = selectedDate || new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, date: baseDate }));
      setStartTime(new Date(`${baseDate}T09:00:00`));
      fetchPets('');
    }
  }, [visible, selectedDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    if (visible) {
      fetchPets(debouncedSearch);
    }
  }, [debouncedSearch]);

  const fetchPets = async (query = '') => {
    try {
      setIsFetchingPets(true);
      const response = await fetch(`${apiUrl}/pets/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setPets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingPets(false);
    }
  };

  const handlePetCreated = (newPet) => {
    setForm(prev => ({ ...prev, pet: newPet }));
    setQuickModalVisible(false);
    setShowPetDropdown(false);
    fetchPets('');
  };

  const toggleService = (serviceId) => {
    setForm(prev => {
      const exists = prev.services.includes(serviceId);
      if (exists) {
        return { ...prev, services: prev.services.filter(id => id !== serviceId) };
      }
      return { ...prev, services: [...prev.services, serviceId] };
    });
  };

  const totals = useMemo(() => {
    return form.services.reduce((acc, id) => {
      const serv = SERVICE_CATALOG.find(s => s.id === id);
      if (serv) {
        acc.price += serv.price;
        acc.duration += serv.duration;
      }
      return acc;
    }, { price: 0, duration: 0 });
  }, [form.services]);

  const endTime = useMemo(() => {
    const end = new Date(startTime.getTime());
    end.setMinutes(end.getMinutes() + totals.duration);
    return end;
  }, [startTime, totals.duration]);

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setStartTime(selectedTime);
  };

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = async () => {
    if (!form.pet) return Alert.alert('Atenção', 'Selecione um Pet.');
    if (form.services.length === 0) return Alert.alert('Atenção', 'Selecione ao menos um serviço.');
    if (!userId) return Alert.alert('Erro', 'Usuário não identificado.');

    const selectedServiceNames = form.services
      .map(id => SERVICE_CATALOG.find(s => s.id === id).name)
      .join(', ');

    const payload = {
      user: userId,
      pet: form.pet._id,
      title: selectedServiceNames,
      notes: form.notes,
      startDate: startTime,              
      estimatedDuration: totals.duration, 
      price: totals.price,
      status: 'AGUARDANDO',
      recurrence: {
        type: 'Avulso',
        active: false
      }
    };

    try {
      setIsSaving(true);
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar agendamento');
      }

      Alert.alert('Sucesso', 'Agendamento criado!');
      setForm({ pet: null, date: selectedDate, packageType: 'Avulso', services: [], notes: '' });
      setSearchText('');
      onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao salvar na API.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Novo Agendamento</Text>
                <Text style={styles.subtitle}>Preencha os dados do serviço abaixo</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <Text style={styles.sectionLabel}>PET & TUTOR</Text>

              <PetDropdown
                form={form}
                setForm={setForm}
                showPetDropdown={showPetDropdown}
                setShowPetDropdown={setShowPetDropdown}
                searchText={searchText}
                setSearchText={setSearchText}
                isFetchingPets={isFetchingPets}
                setQuickModalVisible={setQuickModalVisible}
                pets={pets}
                apiUrl={apiUrl}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.sectionLabel}>DATA</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.textBold}>{form.date.split('-').reverse().join('/')}</Text>
                  </View>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.sectionLabel}>HORA DE INÍCIO</Text>
                  <TouchableOpacity style={styles.timeSelector} onPress={() => setShowTimePicker(true)}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                  onChange={handleTimeChange}
                />
              )}

              {totals.duration > 0 && (
                <View style={styles.durationAlert}>
                  <MaterialCommunityIcons name="timer-sand" size={16} color="#D97706" />
                  <Text style={styles.durationText}>
                    Duração total: {totals.duration} min | Término previsto: {formatTime(endTime)}
                  </Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>SERVIÇOS (CHECKLIST)</Text>
              {SERVICE_CATALOG.map(serv => {
                const isChecked = form.services.includes(serv.id);
                return (
                  <TouchableOpacity key={serv.id} style={styles.serviceCheck} onPress={() => toggleService(serv.id)}>
                    <MaterialCommunityIcons name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={isChecked ? COLORS.primary : COLORS.inactive} />
                    <Text style={[styles.serviceText, isChecked && styles.textBold]}>{serv.name}</Text>
                    <Text style={{ marginRight: 10, color: COLORS.inactive, fontSize: 12 }}>+{serv.duration} min</Text>
                    <Text style={{ marginRight: 10, color: COLORS.text, fontWeight: '500' }}>R$ {serv.price.toFixed(2)}</Text>
                    <MaterialCommunityIcons name={serv.icon} size={20} color={COLORS.secondary} />
                  </TouchableOpacity>
                );
              })}

              <View style={styles.totalBox}>
                <MaterialCommunityIcons name="cash" size={24} color={COLORS.secondary} />
                <Text style={styles.totalLabel}>Valor Total</Text>
                <Text style={styles.totalValue}>R$ {totals.price.toFixed(2).replace('.', ',')}</Text>
              </View>

              <Text style={styles.sectionLabel}>OBSERVAÇÕES DO AGENDAMENTO</Text>
              <TextInput
                style={[styles.inputBox, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Alergias, comportamento..."
                multiline
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
              />

              <TouchableOpacity style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Salvar Agendamento</Text>}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <PetForm 
        visible={quickModalVisible} 
        onClose={() => setQuickModalVisible(false)} 
        apiUrl={apiUrl} 
        mode="quick"
        onSaveSuccess={handlePetCreated}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.padding, height: height * 0.85 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 12, color: COLORS.inactive, marginTop: 4 },
  closeBtn: { backgroundColor: COLORS.border, padding: 6, borderRadius: 16 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.inactive, marginBottom: 8, marginTop: 15 },
  inputBox: { backgroundColor: COLORS.border, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', color: COLORS.text, borderWidth: 1, borderColor: 'transparent' },
  inputBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  packageRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.border, borderRadius: 12, padding: 4 },
  packageBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  packageBtnActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary, borderWidth: 1 },
  packageText: { color: COLORS.inactive, fontWeight: 'bold' },
  packageTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  serviceCheck: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  serviceText: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.text },
  totalBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF7FC', padding: 15, borderRadius: 12, marginTop: 10 },
  totalLabel: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  timeSelector: { backgroundColor: '#FAF7FC', borderColor: COLORS.primary, borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  timeText: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
  durationAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5', padding: 12, borderRadius: 10, marginTop: 12, gap: 6 },
  durationText: { fontSize: 12, color: '#D97706', fontWeight: 'bold' },
  textBold: { fontWeight: 'bold', color: COLORS.text },
});