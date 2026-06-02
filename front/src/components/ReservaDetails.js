import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../styles/theme';
import PetForm from '../components/PetForm';
import PetDropdown from '../components/PetDropdown';
import { AuthContext } from '../contexts/AuthContext';

const { height } = Dimensions.get('window');

const SERVICE_CATALOG = [
  { id: 1, name: 'Banho Premium', price: 60.00, icon: 'shower', duration: 45 },
  { id: 2, name: 'Tosa Higiênica', price: 25.00, icon: 'content-cut', duration: 30 },
  { id: 3, name: 'Banho e Tosa Completa', price: 100.00, icon: 'spray', duration: 90 },
];

export default function ReservaDetails({ visible, onClose, reservation, apiUrl, onSaveSuccess }) {

  const [isEditing, setIsEditing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [pets, setPets] = useState([]);
  const [isFetchingPets, setIsFetchingPets] = useState(false);

  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quickModalVisible, setQuickModalVisible] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);
  const { userData } = useContext(AuthContext);

  const [editForm, setEditForm] = useState({
    pet: null,
    price: '',
    duration: 0,
    notes: '',
    status: '',
    date: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (reservation) {
      const currentTitle = reservation.title || '';
      const initialServices = SERVICE_CATALOG.filter(service =>
        currentTitle.toLowerCase().includes(service.name.toLowerCase())
      );
      setSelectedServices(initialServices);

      const initialDuration = reservation.duration || initialServices.reduce((sum, s) => sum + s.duration, 0);

      setEditForm({
        pet: reservation.pet || {
          name: reservation.petName,
          type: reservation.petType,
          tutor: { name: reservation.tutorName },
          _id: reservation.petId
        },
        price: reservation.price ? String(reservation.price) : '',
        duration: initialDuration,
        notes: reservation.notes || reservation.observations || '',
        status: reservation.status || 'AGUARDANDO',
        date: reservation.startDate ? new Date(reservation.startDate) : new Date(),
      });

      if (isEditing) fetchPets('');
    }
  }, [reservation, isEditing]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    if (isEditing && showPetDropdown) fetchPets(debouncedSearch);
  }, [debouncedSearch]);

  if (!reservation) return null;

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

  const toggleService = (serviceId) => {
    const isSelected = selectedServices.some(s => s.id === serviceId);
    let newSelected;

    if (isSelected) {
      newSelected = selectedServices.filter(s => s.id !== serviceId);
    } else {
      const serviceToAdd = SERVICE_CATALOG.find(s => s.id === serviceId);
      newSelected = [...selectedServices, serviceToAdd];
    }

    setSelectedServices(newSelected);

    const autoCalculatedTotal = newSelected.reduce((sum, s) => sum + s.price, 0);
    const autoCalculatedDuration = newSelected.reduce((sum, s) => sum + s.duration, 0);

    setEditForm(prev => ({
      ...prev,
      price: String(autoCalculatedTotal.toFixed(2)),
      duration: autoCalculatedDuration
    }));
  };

  const formatTime = (dateObj) => {
    const date = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '-', time: '-' };
    const dateObj = new Date(dateString);
    const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const num = parseFloat(value);
    return isNaN(num) ? 'R$ 0,00' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getEstimatedEndTime = (startDate, durationMinutes) => {
    if (!startDate || !durationMinutes) return '--:--';
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const { date, time } = formatDateTime(reservation.startDate);
  const viewDuration = reservation.duration || selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('confirm') || s.includes('concluid') || s.includes('pago')) {
      return { bg: '#EAF7EF', text: '#2E8B57', icon: 'check-circle', label: 'Concluído' };
    }
    if (s.includes('pendent') || s.includes('espera') || s.includes('aguardando')) {
      return { bg: '#FFF7E8', text: '#B7791F', icon: 'clock-outline', label: 'Aguardando' };
    }
    return { bg: '#FDEEEF', text: '#B85063', icon: 'alert-circle-outline', label: 'Cancelado' };
  };

  const statusConfig = getStatusStyle(isEditing ? editForm.status : reservation.status);
  const displayServices = reservation.title ? reservation.title.split(',').map(s => s.trim()) : ['Serviço Geral'];

  const handleMarkAsCompleted = async () => {
    try {
      setLoadingAction(true);
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: reservation._id, status: 'CONCLUIDO', userId: userData._id })
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
    if (selectedServices.length === 0) return Alert.alert('Atenção', 'Selecione pelo menos um serviço no checklist.');

    try {
      setLoadingAction(true);

      const updatedTitle = selectedServices.map(s => s.name).join(', ');
      const payload = {
        _id: reservation._id,
        pet: editForm.pet._id || reservation.pet?._id,
        petName: editForm.pet.name,
        tutorName: editForm.pet.tutor?.name || editForm.pet.tutorName,
        title: updatedTitle,
        price: parseFloat(editForm.price.replace(',', '.')) || 0,
        duration: editForm.duration,
        notes: editForm.notes,
        status: editForm.status,
        startDate: editForm.date.toISOString(),
        userId: userData._id,
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
                body: JSON.stringify({ _id: reservation._id, userId: userData._id })
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
    <>
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
                        <MaterialCommunityIcons
                          name={reservation.petType === 'Gato' || reservation.pet?.type === 'Gato' ? "cat" : "dog"}
                          size={32}
                          color="#FFF"
                          style={{ position: 'absolute' }}
                        />
                        {reservation.pet?._id && (
                          <Image
                            source={{ uri: `${apiUrl}/pets/${reservation.pet._id}/photo` }}
                            style={styles.petImage}
                            transition={150}
                            cachePolicy="none"
                          />
                        )}
                      </View>

                      <View style={styles.petMeta}>
                        <Text style={styles.petNameText} numberOfLines={1} ellipsizeMode="tail">
                          {reservation.petName || reservation.pet?.name || 'Não informado'}
                        </Text>
                        <Text style={styles.tutorNameText} numberOfLines={1} ellipsizeMode="tail">
                          Tutor: {reservation.tutorName || reservation.pet?.tutor?.name || 'Não cadastrado'}
                        </Text>
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <MaterialCommunityIcons name={statusConfig.icon} size={14} color={statusConfig.text} />
                        <Text style={[styles.statusText, { color: statusConfig.text }]} numberOfLines={1} adjustsFontSizeToFit>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.sectionLabel}>Serviço & Cronograma</Text>
                    <View style={styles.infoCard}>

                      <View style={styles.viewServicesContainer}>
                        {displayServices.map((srv, idx) => (
                          <View key={idx} style={styles.viewServiceBadge}>
                            <MaterialCommunityIcons name="bone" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.viewServiceBadgeText} numberOfLines={1}>{srv}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.viewDateTimeGrid}>
                        <View style={styles.viewGridItem}>
                          <View style={styles.iconCircleInfo}>
                            <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.primary} />
                          </View>
                          <View style={styles.gridTextContainer}>
                            <Text style={styles.infoLabel}>DATA</Text>
                            <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>{date}</Text>
                          </View>
                        </View>

                        <View style={styles.viewDateTimeRow}>
                          <View style={[styles.viewGridItem, { flex: 1 }]}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>INÍCIO</Text>
                              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>{time} h</Text>
                            </View>
                          </View>

                          <View style={[styles.viewGridItem, { flex: 1 }]}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="clock-end" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>TÉRMINO</Text>
                              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                                {getEstimatedEndTime(new Date(reservation.startDate), viewDuration)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.viewGridItem}>
                          <View style={styles.iconCircleInfo}>
                            <MaterialCommunityIcons name="timer-sand" size={20} color={COLORS.primary} />
                          </View>
                          <View style={styles.gridTextContainer}>
                            <Text style={styles.infoLabel}>DURAÇÃO</Text>
                            <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>{viewDuration ? `${viewDuration} min` : 'N/A'}</Text>
                          </View>
                        </View>

                        <View style={styles.priceHighlightContainer}>
                          <View style={{ flexShrink: 1, marginRight: 10 }}>
                            <Text style={styles.infoLabel}>VALOR TOTAL DO SERVIÇO</Text>
                            <Text style={styles.priceHighlight} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(reservation.price)}</Text>
                          </View>
                          <MaterialCommunityIcons name="cash-multiple" size={32} color="#2E8B57" style={{ opacity: 0.8 }} />
                        </View>
                      </View>
                    </View>

                    <Text style={styles.sectionLabel}>Observações</Text>
                    <View style={[styles.infoCard, styles.observationCard]}>
                      <Text style={styles.observationText}>
                        {reservation.notes || reservation.observations || 'Nenhuma observação informada para este agendamento.'}
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
                          <Text style={styles.btnSecondaryText}>Editar Reserva</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDanger} onPress={handleDeleteReservation}>
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" style={{ marginRight: 6 }} />
                          <Text style={styles.btnDangerText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {isEditing && (
                  <View style={styles.formContainer}>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.sectionLabel}>PET & TUTOR</Text>

                      <PetDropdown
                        form={editForm}
                        setForm={setEditForm}
                        showPetDropdown={showPetDropdown}
                        setShowPetDropdown={setShowPetDropdown}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        isFetchingPets={isFetchingPets}
                        setQuickModalVisible={setQuickModalVisible}
                        pets={pets}
                        apiUrl={apiUrl}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.sectionLabel}>SERVIÇOS (CHECKLIST)</Text>
                      {SERVICE_CATALOG.map(serv => {
                        const isChecked = selectedServices.some(s => s.id === serv.id);
                        return (
                          <TouchableOpacity
                            key={serv.id}
                            style={[styles.serviceCheck, isChecked && { borderColor: COLORS.primary, backgroundColor: '#faf7fc' }]}
                            onPress={() => toggleService(serv.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons
                              name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
                              size={24}
                              color={isChecked ? COLORS.primary : COLORS.inactive || '#9CA3AF'}
                            />
                            <Text style={[styles.serviceText, isChecked && styles.textBold]} numberOfLines={1} ellipsizeMode="tail">{serv.name}</Text>
                            <View style={styles.serviceMetaRight}>
                               <Text style={styles.durationBadgeText} numberOfLines={1}>+{serv.duration} min</Text>
                              <Text style={styles.priceBadgeText} numberOfLines={1}>R$ {serv.price.toFixed(2)}</Text>
                              <MaterialCommunityIcons name={serv.icon} size={18} color={COLORS.secondary || '#94A3B8'} style={{ marginLeft: 6 }} />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={[styles.row, styles.fieldContainer]}>
                      <View style={styles.flexHalf}>
                        <Text style={styles.sectionLabel}>DATA</Text>
                        <TouchableOpacity style={styles.inputDateTimeButton} onPress={() => setShowDatePicker(true)}>
                          <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} style={styles.inputIcon} />
                          <Text style={styles.dateTimeText} numberOfLines={1} adjustsFontSizeToFit>{editForm.date.toLocaleDateString('pt-BR')}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.flexHalf, { marginLeft: 12 }]}>
                        <Text style={styles.sectionLabel}>HORÁRIO DE INÍCIO</Text>
                        <TouchableOpacity style={styles.inputDateTimeButton} onPress={() => setShowTimePicker(true)}>
                          <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                          <Text style={styles.dateTimeText} numberOfLines={1} adjustsFontSizeToFit>
                            {editForm.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.timeCalcFeedback}>
                      <MaterialCommunityIcons name="information-outline" size={18} color={"#D97706"} style={{ flexShrink: 0 }} />
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1, marginLeft: 8, alignItems: 'center' }}>
                        <Text style={styles.timeCalcText}>
                          Duração: <Text style={{ fontWeight: 'bold' }}>{editForm.duration} min</Text>
                        </Text>
                        <Text style={styles.timeCalcTextDivider}>•</Text>
                        <Text style={styles.timeCalcText}>
                          Fim: <Text style={{ fontWeight: 'bold' }}>{getEstimatedEndTime(editForm.date, editForm.duration)}</Text>
                        </Text>
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

                    <View style={[styles.row, styles.fieldContainer]}>
                      <View style={[styles.flexHalf, { flex: 1 }]}>
                        <Text style={styles.sectionLabel}>VALOR TOTAL (R$)</Text>
                        <View style={styles.priceInputWrapper}>
                          <Text style={styles.currencySymbol}>R$</Text>
                          <TextInput
                            style={styles.priceInput}
                            value={editForm.price}
                            keyboardType="numeric"
                            placeholder="0.00"
                            onChangeText={t => setEditForm({ ...editForm, price: t })}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                       <Text style={styles.sectionLabel}>STATUS DO AGENDAMENTO</Text>
                      <View style={styles.toggleRow}>
                        {['AGUARDANDO', 'CONCLUIDO', 'CANCELADO'].map((st) => {
                          const isActive = editForm.status === st;
                          let activeBg = st === 'CONCLUIDO' ? '#2E8B57' : st === 'CANCELADO' ? '#B85063' : '#D69E2E';
                          return (
                            <TouchableOpacity
                              key={st}
                              style={[styles.toggleBtn, isActive && { backgroundColor: activeBg }]}
                              onPress={() => setEditForm({ ...editForm, status: st })}
                            >
                              <Text 
                                style={[styles.toggleText, { color: isActive ? '#FFF' : '#9CA3AF' }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                              >
                                {st === 'CONCLUIDO' ? 'Concluído' : st.charAt(0) + st.slice(1).toLowerCase()}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.sectionLabel}>OBSERVAÇÕES (OPCIONAL)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={editForm.notes}
                        onChangeText={(t) => setEditForm({ ...editForm, notes: t })}
                        multiline
                        maxLength={300}
                        placeholder="Informações, restrições ou detalhes do serviço..."
                      />
                     </View>

                    <View style={[styles.rowButtons, { marginTop: 10 }]}>
                      <TouchableOpacity style={styles.btnCancelEdit} onPress={() => setIsEditing(false)}>
                        <Text style={styles.btnCancelEditText} numberOfLines={1}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnSaveEdit} onPress={handleSaveChanges}>
                        <Text style={styles.btnSaveEditText} numberOfLines={1}>Salvar Alterações</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <PetForm
        visible={quickModalVisible}
        onClose={() => setQuickModalVisible(false)}
        apiUrl={apiUrl}
        mode="quick"
        onSaveSuccess={() => fetchPets(debouncedSearch)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 36, 43, 0.45)' },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: height * 0.95, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    elevation: 8,
  },
  dragIndicator: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  closeButton: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: 50 },
  loaderContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flexHalf: { flex: 1 },

  fieldContainer: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 8, textTransform: 'uppercase' },

  input: { backgroundColor: '#F4F5F7', borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#E5E7EB' },
  inputDateTimeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  
  inputIcon: { marginRight: 10 },
  dateTimeText: { fontSize: 15, color: COLORS.text || '#1E293B', flexShrink: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },

  priceInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, height: 52 },
  currencySymbol: { fontSize: 16, color: '#94A3B8', fontWeight: '700', marginRight: 8 },
  priceInput: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },

  serviceCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8
  },
  serviceText: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text || '#1E293B' },
  textBold: { fontWeight: 'bold', color: COLORS.primary },
  serviceMetaRight: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  durationBadgeText: { marginRight: 8, color: '#D97706', fontSize: 12, fontWeight: '600' },
  priceBadgeText: { color: COLORS.text || '#1E293B', fontWeight: '700', fontSize: 14 },

  timeCalcFeedback: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5', padding: 12, borderRadius: 12, marginBottom: 24, marginTop: -12 },
  timeCalcText: { fontSize: 13, color: '#D97706' },
  timeCalcTextDivider: { marginHorizontal: 6, color: '#D97706' },

  toggleRow: { flexDirection: 'row', backgroundColor: '#F4F5F7', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  toggleText: { fontWeight: 'bold', fontSize: 13 },

  petHeroCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 },
  petImage: { width: '100%', height: '100%', contentFit: 'cover' },
  petMeta: { flex: 1, marginLeft: 16, marginRight: 8 },
  petNameText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  tutorNameText: { fontSize: 13, color: '#E2E8F0', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30, maxWidth: 110, flexShrink: 1 },
  statusText: { fontSize: 12, fontWeight: '700', marginLeft: 4, flexShrink: 1 },

  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },

  viewServicesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  viewServiceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#faf7fc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ebdaff' },
  viewServiceBadgeText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, flexShrink: 1 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

viewDateTimeGrid: { flexDirection: 'column', gap: 12 },
  viewDateTimeRow: { flexDirection: 'row', gap: 12 },
  viewGridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
 
  iconCircleInfo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 10,  borderWidth: 1, borderColor: '#F1F5F9' },
  gridTextContainer: { flex: 1, flexShrink: 1 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text || '#1E293B' },

  priceHighlightContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 4 },
  priceHighlight: { color: '#2E8B57', fontWeight: '800', fontSize: 24 },

  observationCard: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  observationText: { fontSize: 14, color: '#475569', lineHeight: 22 },

  actionMenuContainer: { marginTop: 12, gap: 12 },
  btnPrimary: { backgroundColor: '#2E8B57', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 0.48, backgroundColor: '#f9f5fd', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ebdaff' },
  btnSecondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  btnDanger: { flex: 0.48, backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  btnDangerText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },

  btnCancelEdit: { flex: 0.48, padding: 16, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  btnCancelEditText: { color: '#64748B', fontSize: 15, fontWeight: '700' },
  btnSaveEdit: { flex: 0.48, padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  btnSaveEditText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});