import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../styles/theme';

const { height } = Dimensions.get('window');

const SERVICE_CATALOG = [
  { id: 1, name: 'Banho Premium', price: 60.00, icon: 'shower', duration: 45 }, 
  { id: 2, name: 'Tosa Higiênica', price: 25.00, icon: 'content-cut', duration: 30 }
];

export default function ReservaModal({ visible, onClose, selectedDate, apiUrl, onSaveSuccess }) {
  const [pets, setPets] = useState([]);
  const [isFetchingPets, setIsFetchingPets] = useState(false);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [quickModalVisible, setQuickModalVisible] = useState(false);
  const [isSavingQuickPet, setIsSavingQuickPet] = useState(false);
  
  const [quickForm, setQuickForm] = useState({
    petName: '',
    tutorName: '',
    phone: '',
    type: 'Cachorro',
    breed: '',
    size: 'M',
    notes: ''
  });
  
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

  const handleQuickRegister = async () => {
    if (!quickForm.petName.trim() || !quickForm.tutorName.trim()) {
      return Alert.alert('Atenção', 'Nome do Pet e Nome do Tutor são obrigatórios.');
    }

    try {
      setIsSavingQuickPet(true);
      const response = await fetch(`${apiUrl}/pets/quick-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickForm)
      });

      if (!response.ok) throw new Error('Falha no cadastro rápido');

      const newPetPopulated = await response.json();
      
      setPets(prev => [newPetPopulated, ...prev]);
      setForm(prev => ({ ...prev, pet: newPetPopulated }));
      
      setQuickForm({ petName: '', tutorName: '', phone: '', type: 'Cachorro', breed: '', size: 'M', notes: '' });
      setQuickModalVisible(false);
      setShowPetDropdown(false);
      Alert.alert('Sucesso', `${newPetPopulated.name} cadastrado e selecionado!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro rápido.');
    } finally {
      setIsSavingQuickPet(false);
    }
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

    const selectedServiceNames = form.services
      .map(id => SERVICE_CATALOG.find(s => s.id === id).name)
      .join(' + ');

    const payload = {
      pet: form.pet._id,
      title: selectedServiceNames,
      notes: form.notes,
      startDate: startTime,              
      estimatedDuration: totals.duration, 
      price: totals.price,
      status: 'AGUARDANDO',
      recurrence: {
        type: form.packageType,
        active: form.packageType === 'Recorrente'
      }
    };

    try {
      setIsSaving(true);
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao salvar agendamento');

      Alert.alert('Sucesso', 'Agendamento criado!');
      setForm({ pet: null, date: selectedDate, packageType: 'Avulso', services: [], notes: '' });
      setSearchText('');
      onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar na API.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            
            <TouchableOpacity
              style={[styles.inputBox, showPetDropdown && styles.inputBoxActive]}
              onPress={() => setShowPetDropdown(!showPetDropdown)}
            >
              <Text style={{ color: form.pet ? COLORS.text : COLORS.inactive, fontWeight: form.pet ? '600' : 'normal' }}>
                {form.pet ? `${form.pet.name} (${form.pet.tutor?.name || 'Sem tutor'})` : 'Selecionar Pet...'}
              </Text>
              <MaterialCommunityIcons name={showPetDropdown ? "chevron-up" : "chevron-down"} size={20} color={COLORS.primary} />
            </TouchableOpacity>

            {showPetDropdown && (
              <View style={styles.dropdownContainer}>
                
                <View style={styles.searchBarContainer}>
                  <MaterialCommunityIcons name="magnify" size={20} color={COLORS.inactive} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchTextInput}
                    placeholder="Buscar por nome do Pet ou Tutor..."
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCorrect={false}
                  />
                  {isFetchingPets && <ActivityIndicator size="small" color={COLORS.primary} />}
                </View>

                <TouchableOpacity style={styles.quickAddBtn} onPress={() => setQuickModalVisible(true)}>
                  <MaterialCommunityIcons name="plus" size={18} color={COLORS.primary} />
                  <Text style={styles.quickAddBtnText}>Adicionar Novo Pet</Text>
                </TouchableOpacity>

                <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
                  {pets.length === 0 && !isFetchingPets ? (
                    <Text style={styles.emptyResultsText}>Nenhum pet ou tutor encontrado</Text>
                  ) : (
                    pets.map(item => {
                      const isSelected = form.pet?._id === item._id;
                      return (
                        <TouchableOpacity
                          key={item._id}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setForm({ ...form, pet: item });
                            setShowPetDropdown(false);
                          }}
                        >
                          <View style={styles.petAvatarCircle}>
                            <MaterialCommunityIcons 
                              name={item.type === 'Gato' ? "cat" : "dog"} 
                              size={16} 
                              color={COLORS.primary} 
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemPetName}>
                              {item.name} {item.breed ? `• ${item.breed}` : ''}
                            </Text>
                            <Text style={styles.itemTutorName}>{item.tutor?.name || 'Tutor não especificado'}</Text>
                          </View>
                          {isSelected && <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} />}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
                
                <View style={styles.dropdownFooter}>
                  <Text style={styles.dropdownFooterText}>VER TODOS OS REGISTROS</Text>
                </View>
              </View>
            )}

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

            <Text style={styles.sectionLabel}>TIPO DE PACOTE</Text>
            <View style={styles.packageRow}>
              {['Avulso', 'Recorrente'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.packageBtn, form.packageType === type && styles.packageBtnActive]}
                  onPress={() => setForm({ ...form, packageType: type })}
                >
                  <Text style={form.packageType === type ? styles.packageTextActive : styles.packageText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

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

      {/* MODAL DE CADASTRO RÁPIDO ATUALIZADO */}
      <Modal visible={quickModalVisible} animationType="slide" transparent={true}>
        <View style={styles.quickModalOverlay}>
          <View style={styles.quickModalContainer}>
            
            <View style={styles.quickHeader}>
              <Text style={styles.quickTitle}>Cadastro Rápido</Text>
              <TouchableOpacity onPress={() => setQuickModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <Text style={styles.quickInputLabel}>TIPO DE PET</Text>
              <View style={styles.toggleRow}>
                {['Cachorro', 'Gato'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, quickForm.type === t && styles.toggleBtnActive]}
                    onPress={() => setQuickForm({ ...quickForm, type: t })}
                  >
                    <MaterialCommunityIcons 
                      name={t === 'Gato' ? "cat" : "dog"} 
                      size={20} 
                      color={quickForm.type === t ? COLORS.primary : COLORS.inactive} 
                    />
                    <Text style={quickForm.type === t ? styles.toggleTextActive : styles.toggleText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.quickInputLabel}>NOME DO PET</Text>
              <View style={styles.quickInputWrapper}>
                <TextInput
                  style={styles.quickTextInputField}
                  placeholder="Ex: Bob"
                  value={quickForm.petName}
                  onChangeText={text => setQuickForm({...quickForm, petName: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.quickInputLabel}>RAÇA</Text>
                  <View style={styles.quickInputWrapper}>
                    <TextInput
                      style={styles.quickTextInputField}
                      placeholder="Ex: Poodle"
                      value={quickForm.breed}
                      onChangeText={text => setQuickForm({...quickForm, breed: text})}
                    />
                  </View>
                </View>

                <View style={{ width: '48%' }}>
                  <Text style={styles.quickInputLabel}>TAMANHO / PORTE</Text>
                  <View style={styles.sizeSelectorRow}>
                    {['P', 'M', 'G', 'GG'].map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.sizeOptionBtn, quickForm.size === s && styles.sizeOptionBtnActive]}
                        onPress={() => setQuickForm({ ...quickForm, size: s })}
                      >
                        <Text style={quickForm.size === s ? styles.sizeTextActive : styles.sizeText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.quickInputLabel}>NOME DO TUTOR</Text>
              <View style={styles.quickInputWrapper}>
                <TextInput
                  style={styles.quickTextInputField}
                  placeholder="Ex: Maria Oliveira"
                  value={quickForm.tutorName}
                  onChangeText={text => setQuickForm({...quickForm, tutorName: text})}
                />
              </View>

              <Text style={styles.quickInputLabel}>TELEFONE / WHATSAPP</Text>
              <View style={styles.quickInputWrapper}>
                <TextInput
                  style={styles.quickTextInputField}
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                  value={quickForm.phone}
                  onChangeText={text => setQuickForm({...quickForm, phone: text})}
                />
              </View>

              <Text style={styles.quickInputLabel}>NOTAS E OBSERVAÇÕES DO PET</Text>
              <View style={[styles.quickInputWrapper, { height: 75, paddingVertical: 8 }]}>
                <TextInput
                  style={[styles.quickTextInputField, { textAlignVertical: 'top' }]}
                  placeholder="Comportamento, restrições, tipo de tesoura..."
                  multiline
                  numberOfLines={3}
                  value={quickForm.notes}
                  onChangeText={text => setQuickForm({...quickForm, notes: text})}
                />
              </View>

              <TouchableOpacity 
                style={[styles.quickSubmitBtn, isSavingQuickPet && { opacity: 0.8 }]} 
                onPress={handleQuickRegister}
                disabled={isSavingQuickPet}
              >
                {isSavingQuickPet ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.quickSubmitBtnText}>Salvar e Selecionar</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </Modal>
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

  dropdownContainer: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, marginTop: 8, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 8 },
  searchTextInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 0 },
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF7FC', borderRadius: 10, padding: 12, marginBottom: 12, justifyContent: 'center', gap: 6 },
  quickAddBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F2EFF5' },
  dropdownItemActive: { backgroundColor: '#FAF7FC', borderRadius: 8, paddingHorizontal: 8 },
  petAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAF7FC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemPetName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  itemTutorName: { fontSize: 12, color: COLORS.inactive, marginTop: 2 },
  emptyResultsText: { textAlign: 'center', paddingVertical: 20, color: COLORS.inactive, fontSize: 14 },
  dropdownFooter: { borderTopWidth: 1, borderTopColor: '#F2EFF5', paddingTop: 12, marginTop: 4, alignItems: 'center' },
  dropdownFooterText: { fontSize: 11, fontWeight: 'bold', color: COLORS.inactive, letterSpacing: 0.5 },

  quickModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  quickModalContainer: { backgroundColor: COLORS.white, width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: height * 0.9 },
  quickHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  quickTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  quickInputLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.inactive, marginBottom: 6, marginTop: 14 },
  quickInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, height: 52 },
  quickTextInputField: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 0 },
  
  toggleRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, backgroundColor: COLORS.border, borderWidth: 1, borderColor: 'transparent' },
  toggleBtnActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.inactive },
  toggleTextActive: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },

  sizeSelectorRow: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 14, padding: 3, height: 52, alignItems: 'center' },
  sizeOptionBtn: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 11 },
  sizeOptionBtnActive: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E2DFE6' },
  sizeText: { fontSize: 13, fontWeight: 'bold', color: COLORS.inactive },
  sizeTextActive: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },

  quickSubmitBtn: { backgroundColor: COLORS.primary, borderRadius: 20, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 30 },
  quickSubmitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});