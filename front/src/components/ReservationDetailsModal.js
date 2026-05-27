import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Alert, Platform,Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../styles/theme';

const { height } = Dimensions.get('window');

export default function ReservationDetailsModal({ visible, onClose, reservation, apiUrl, onSaveSuccess }) {
  if (!reservation) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [pets, setPets] = useState([]);
  const [isFetchingPets, setIsFetchingPets] = useState(false);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quickModalVisible, setQuickModalVisible] = useState(false);
  const [isSavingQuickPet, setIsSavingQuickPet] = useState(false);
  const [quickForm, setQuickForm] = useState({
    petName: '', tutorName: '', phone: '', type: 'Cachorro', breed: '', size: 'M', notes: ''
  });

  const [editForm, setEditForm] = useState({
    pet: null,
    notes: '',
    status: '',
    date: new Date(),
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (reservation) {
      setEditForm({
        pet: reservation.pet || { name: reservation.petName, tutor: { name: reservation.tutorName }, _id: reservation.petId },
        notes: reservation.notes || reservation.observations || '',
        status: reservation.status || 'AGUARDANDO',
        date: reservation.startDate ? new Date(reservation.startDate) : new Date(),
      });
      if (isEditing) {
        fetchPets('');
      }
    }
  }, [reservation, isEditing]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    if (isEditing && showPetDropdown) {
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
      console.error('Erro ao buscar pets:', error);
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
      setEditForm(prev => ({ ...prev, pet: newPetPopulated }));
      
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

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '-', time: '-' };
    const dateObj = new Date(dateString);
    const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const { date, time } = formatDateTime(reservation.startDate);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('confirm') || s.includes('concluid') || s.includes('pago')) {
      return { bg: '#E6F7ED', text: '#2ECC71', icon: 'check-circle', label: 'Concluído' };
    }
    if (s.includes('pendent') || s.includes('espera') || s.includes('aguardando')) {
      return { bg: '#FFF9E6', text: '#F1C40F', icon: 'clock-outline', label: 'Aguardando' };
    }
    return { bg: '#FDF2F2', text: '#E74C3C', icon: 'alert-circle-outline', label: 'Cancelado' };
  };

  const statusConfig = getStatusStyle(isEditing ? editForm.status : reservation.status);

  const handleMarkAsCompleted = async () => {
    try {
      setLoadingAction(true);
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _id: reservation._id,
          status: 'CONCLUIDO' 
        })
      });

      if (!response.ok) throw new Error();
      
      Alert.alert('Sucesso', 'Agendamento concluído com sucesso!');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editForm.pet) return Alert.alert('Atenção', 'Você precisa selecionar um Pet.');

    try {
      setLoadingAction(true);
      const payload = {
        _id: reservation._id,
        pet: editForm.pet._id || reservation.pet?._id,
        petName: editForm.pet.name,
        tutorName: editForm.pet.tutor?.name || editForm.pet.tutorName,
        notes: editForm.notes,
        status: editForm.status,
        startDate: editForm.date.toISOString(),
      };

      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error();

      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar as alterações do agendamento.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteReservation = () => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar e remover este agendamento?',
      [
        { text: 'Sair', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingAction(true);
              const response = await fetch(`${apiUrl}/reservations/active`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reservation._id })
              });

              if (!response.ok) throw new Error();

              Alert.alert('Cancelado', 'O agendamento foi removido.');
              if (onSaveSuccess) onSaveSuccess();
              onClose();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
            } finally {
              setLoadingAction(false);
            }
          }
        }
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      const current = new Date(editForm.date);
      current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEditForm({ ...editForm, date: current });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) {
      const current = new Date(editForm.date);
      current.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setEditForm({ ...editForm, date: current });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.dragIndicator} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Agendamento' : 'Detalhes do Agendamento'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={loadingAction}>
              <MaterialCommunityIcons name="close" size={20} color={COLORS.text || '#1E293B'} />
            </TouchableOpacity>
          </View>

          {loadingAction ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

              {!isEditing && (
                <>
                  <View style={styles.petHeroCard}>
                    <View style={styles.avatarContainer}>
                      {reservation.pet?._id ? (
                        <Image 
                           source={{ uri: `${apiUrl}/pets/${reservation.pet._id}/photo?t=${new Date().getTime()}` }} 
                           style={styles.petImage}
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={reservation.petType === 'Gato' ? "cat" : "dog"} 
                          size={32} 
                          color="#FFF" 
                        />
                      )}
                    </View>
                    <View style={styles.petMeta}>
                      <Text style={styles.petNameText}>
                        {reservation.petName || reservation.pet?.name || 'Não informado'}
                      </Text>
                      <Text style={styles.tutorNameText}>
                        Tutor: {reservation.tutorName || reservation.pet?.tutor?.name || 'Não cadastrado'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <MaterialCommunityIcons name={statusConfig.icon} size={14} color={statusConfig.text} />
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Serviço & Cronograma</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.serviceRow}>
                      <MaterialCommunityIcons name="bone" size={22} color={COLORS.primary} />
                      <Text style={styles.serviceTitleText}>{reservation.title || 'Serviço Geral'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.viewDateTimeColumn}>
                      <View style={styles.viewGridItem}>
                        <MaterialCommunityIcons name="calendar-month" size={18} color={COLORS.inactive || '#94A3B8'} />
                        <View style={styles.gridTextContainer}>
                          <Text style={styles.infoLabel}>DATA</Text>
                          <Text style={styles.infoValue}>{date}</Text>
                        </View>
                      </View>
                      <View style={styles.viewGridItem}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.inactive || '#94A3B8'} />
                        <View style={styles.gridTextContainer}>
                          <Text style={styles.infoLabel}>HORÁRIO</Text>
                          <Text style={styles.infoValue}>{time} h</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Observações</Text>
                  <View style={[styles.infoCard, styles.observationCard]}>
                    <Text style={styles.observationText}>
                      {reservation.notes || reservation.observations || 'Nenhuma observação informada.'}
                    </Text>
                  </View>

                  <View style={styles.actionMenuContainer}>
                    {reservation.status !== 'CONCLUIDO' && (
                      <TouchableOpacity style={styles.btnPrimary} onPress={handleMarkAsCompleted}>
                        <MaterialCommunityIcons name="check-all" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.btnPrimaryText}>Marcar como Concluído</Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.rowButtons}>
                      <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsEditing(true)}>
                        <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.btnSecondaryText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnDanger} onPress={handleDeleteReservation}>
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" style={{ marginRight: 6 }} />
                        <Text style={styles.btnDangerText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {isEditing && (
                <View style={styles.formContainer}>
                  
                  <Text style={styles.inputSectionLabel}>PET & TUTOR</Text>
                  <TouchableOpacity
                    style={[styles.inputWrapper, showPetDropdown && { borderColor: COLORS.primary }]}
                    onPress={() => setShowPetDropdown(!showPetDropdown)}
                  >
                    <MaterialCommunityIcons name="paw" size={20} color={COLORS.primary} style={styles.inputIcon} />
                    <Text style={[styles.textInput, { color: editForm.pet ? COLORS.text : (COLORS.inactive || '#94A3B8'), fontWeight: editForm.pet ? '600' : 'normal' }]}>
                      {editForm.pet ? `${editForm.pet.name} (${editForm.pet.tutor?.name || editForm.pet.tutorName || 'Sem tutor'})` : 'Selecionar Pet...'}
                    </Text>
                    <MaterialCommunityIcons name={showPetDropdown ? "chevron-up" : "chevron-down"} size={20} color={COLORS.primary} />
                  </TouchableOpacity>

                  {showPetDropdown && (
                    <View style={styles.dropdownContainer}>
                      <View style={styles.searchBarContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.inactive || '#94A3B8'} style={{ marginRight: 8 }} />
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
                            const isSelected = editForm.pet?._id === item._id;
                            return (
                              <TouchableOpacity
                                key={item._id}
                                style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                                onPress={() => {
                                  setEditForm({ ...editForm, pet: item });
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
                        <Text style={styles.dropdownFooterText}>RESULTADOS DA BUSCA</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.editDateTimeRow}>
                    <View style={styles.editDateCol}>
                      <Text style={styles.inputSectionLabel}>DATA</Text>
                      <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                        <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        <Text style={styles.dateTimeText}>{editForm.date.toLocaleDateString('pt-BR')}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.editTimeCol}>
                      <Text style={styles.inputSectionLabel}>HORÁRIO</Text>
                      <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowTimePicker(true)}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        <Text style={styles.dateTimeText}>
                          {editForm.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={editForm.date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                    />
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      value={editForm.date}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onTimeChange}
                    />
                  )}

                  <Text style={styles.inputSectionLabel}>STATUS</Text>
                  <View style={styles.statusPickerRow}>
                    {['AGUARDANDO', 'CONCLUIDO', 'CANCELADO'].map((st) => {
                      const isActive = editForm.status === st;
                      let activeBg = st === 'CONCLUIDO' ? '#2ECC71' : st === 'CANCELADO' ? '#E74C3C' : '#F1C40F';
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[styles.statusStatusBtn, isActive && { backgroundColor: activeBg, borderColor: activeBg }]}
                          onPress={() => setEditForm({ ...editForm, status: st })}
                        >
                          <Text style={[styles.statusStatusText, isActive && { color: '#FFF' }]}>{st.charAt(0) + st.slice(1).toLowerCase()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.inputSectionLabel}>OBSERVAÇÕES</Text>
                  <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                    <TextInput 
                      style={[styles.textInput, styles.textArea]}
                      value={editForm.notes}
                      onChangeText={(t) => setEditForm({ ...editForm, notes: t })}
                      multiline
                    />
                  </View>

                  <View style={[styles.rowButtons, { marginTop: 24 }]}>
                    <TouchableOpacity style={styles.btnCancelEdit} onPress={() => setIsEditing(false)}>
                      <Text style={styles.btnCancelEditText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSaveEdit} onPress={handleSaveChanges}>
                      <Text style={styles.btnSaveEditText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      <Modal visible={quickModalVisible} animationType="slide" transparent={true}>
        <View style={styles.quickModalOverlay}>
          <View style={styles.quickModalContainer}>
            
            <View style={styles.quickHeader}>
              <Text style={styles.quickTitle}>Cadastro Rápido</Text>
              <TouchableOpacity onPress={() => setQuickModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={18} color={COLORS.text || '#1E293B'} />
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
                      color={quickForm.type === t ? COLORS.primary : (COLORS.inactive || '#94A3B8')} 
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
                  placeholder="Comportamento, restrições..."
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
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.quickSubmitBtnText}>Salvar e Selecionar</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
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
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 36, 43, 0.45)' },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    maxHeight: height * 0.9, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    elevation: 8,
  },
  dragIndicator: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  closeButton: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: 50 },
  loaderContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 24 },
  
  petHeroCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarContainer: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  petMeta: { flex: 1, marginLeft: 16 },
  petNameText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  tutorNameText: { fontSize: 13, color: '#E2E8F0' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 30 },
  statusText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16 },
  
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  serviceTitleText: { fontSize: 15, fontWeight: '700', color: COLORS.text || '#1E293B', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  viewDateTimeColumn: { flexDirection: 'column', gap: 12 },
  viewGridItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  gridTextContainer: { marginLeft: 10 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text || '#1E293B' },
  
  observationCard: { backgroundColor: '#F8FAFC' },
  observationText: { fontSize: 14, color: COLORS.text || '#1E293B', lineHeight: 22 },

  actionMenuContainer: { marginTop: 12, gap: 12 },
  btnPrimary: { backgroundColor: '#2ECC71', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginBottom: 8 },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 0.48, backgroundColor: '#F0F9FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16 },
  btnSecondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  btnDanger: { flex: 0.48, backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16 },
  btnDangerText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },

  formContainer: { marginTop: 8 },
  inputSectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 15 },
  
  dropdownContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, marginTop: 8, overflow: 'hidden' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchTextInput: { flex: 1, fontSize: 14 },
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  quickAddBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyResultsText: { textAlign: 'center', padding: 20, color: '#94A3B8', fontSize: 14 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemActive: { backgroundColor: '#F0F9FF' },
  petAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemPetName: { fontSize: 15, fontWeight: '600', color: COLORS.text || '#1E293B' },
  itemTutorName: { fontSize: 13, color: '#64748B', marginTop: 2 },
  dropdownFooter: { padding: 10, alignItems: 'center', backgroundColor: '#F8FAFC' },
  dropdownFooterText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

  editDateTimeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  editDateCol: { flex: 0.48 },
  editTimeCol: { flex: 0.48 },
  dateTimeText: { fontSize: 15, color: COLORS.text || '#1E293B' },
  
  statusPickerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusStatusBtn: { flex: 0.31, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF' },
  statusStatusText: { fontSize: 12, fontWeight: '700', color: COLORS.text || '#1E293B' },

  textAreaWrapper: { height: 100, alignItems: 'flex-start', paddingVertical: 14 },
  textArea: { flex: 1, width: '100%', textAlignVertical: 'top' },

  btnCancelEdit: { flex: 0.48, padding: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
  btnCancelEditText: { color: '#64748B', fontSize: 15, fontWeight: '700' },
  btnSaveEdit: { flex: 0.48, padding: 16, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center' },
  btnSaveEditText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  quickModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  quickModalContainer: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '85%' },
  quickHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  quickTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text || '#1E293B' },
  closeBtn: { padding: 4 },
  quickInputLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  toggleBtn: { flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16 },
  toggleBtnActive: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' },
  toggleText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#64748B' },
  toggleTextActive: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: COLORS.primary },
  quickInputWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 52, justifyContent: 'center' },
  quickTextInputField: { fontSize: 15, color: COLORS.text || '#1E293B' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  sizeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sizeOptionBtn: { flex: 0.23, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center' },
  sizeOptionBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sizeText: { fontSize: 14, fontWeight: '700', color: COLORS.text || '#1E293B' },
  sizeTextActive: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  quickSubmitBtn: { marginTop: 32, backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  quickSubmitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});