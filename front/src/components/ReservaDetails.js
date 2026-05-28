import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../styles/theme';
import PetForm from '../components/PetForm';

const { height } = Dimensions.get('window');

const SERVICE_CATALOG = [
  { id: 1, name: 'Banho Premium', price: 60.00, icon: 'shower', duration: 45 },
  { id: 2, name: 'Tosa Higiênica', price: 25.00, icon: 'content-cut', duration: 30 },
  { id: 3, name: 'Banho e Tosa Completa', price: 100.00, icon: 'spray', duration: 90 },
];

export default function ReservaDetails({ visible, onClose, reservation, apiUrl, onSaveSuccess }) {
  if (!reservation) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [pets, setPets] = useState([]);
  const [isFetchingPets, setIsFetchingPets] = useState(false);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quickModalVisible, setQuickModalVisible] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);

  // Estado do formulário de edição
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
      return { bg: '#E6F7ED', text: '#2ECC71', icon: 'check-circle', label: 'Concluído' };
    }
    if (s.includes('pendent') || s.includes('espera') || s.includes('aguardando')) {
      return { bg: '#FFF9E6', text: '#F1C40F', icon: 'clock-outline', label: 'Aguardando' };
    }
    return { bg: '#FDF2F2', text: '#E74C3C', icon: 'alert-circle-outline', label: 'Cancelado' };
  };

  const statusConfig = getStatusStyle(isEditing ? editForm.status : reservation.status);
  const displayServices = reservation.title ? reservation.title.split(',').map(s => s.trim()) : ['Serviço Geral'];

  const handleMarkAsCompleted = async () => {
    try {
      setLoadingAction(true);
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: reservation._id, status: 'CONCLUIDO' })
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
                            cachePolicy="disk"
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

                    <Text style={styles.sectionLabel}>Serviço & Cronograma</Text>
                    <View style={styles.infoCard}>

                      <View style={styles.viewServicesContainer}>
                        {displayServices.map((srv, idx) => (
                          <View key={idx} style={styles.viewServiceBadge}>
                            <MaterialCommunityIcons name="bone" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.viewServiceBadgeText}>{srv}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.viewDateTimeGrid}>
                        <View style={styles.viewDateTimeRow}>
                          <View style={styles.viewGridItem}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>DATA</Text>
                              <Text style={styles.infoValue}>{date}</Text>
                            </View>
                          </View>

                          <View style={styles.viewGridItem}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>INÍCIO</Text>
                              <Text style={styles.infoValue}>{time} h</Text>
                            </View>
                          </View>

                          <View style={styles.viewGridItem}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="timer-sand" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>DURAÇÃO</Text>
                              <Text style={styles.infoValue}>{viewDuration ? `${viewDuration} min` : 'N/A'}</Text>
                            </View>
                          </View>

                          <View style={styles.viewGridItem}>
                            <View style={styles.iconCircleInfo}>
                              <MaterialCommunityIcons name="clock-end" size={20} color={COLORS.primary} />
                            </View>

                            <View style={styles.gridTextContainer}>
                              <Text style={styles.infoLabel}>TÉRMINO</Text>

                              <Text style={styles.infoValue}>
                                {getEstimatedEndTime(
                                  new Date(reservation.startDate),
                                  viewDuration
                                )}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.priceHighlightContainer}>
                          <View>
                            <Text style={styles.infoLabel}>VALOR TOTAL DO SERVIÇO</Text>
                            <Text style={styles.priceHighlight}>{formatCurrency(reservation.price)}</Text>
                          </View>
                          <MaterialCommunityIcons name="cash-multiple" size={32} color="#2ECC71" style={{ opacity: 0.8 }} />
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

                {/* --- MODO DE EDIÇÃO --- */}
                {isEditing && (
                  <View style={styles.formContainer}>

                    {/* SEÇÃO: VÍNCULO DO PET */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.sectionLabel}>PET & TUTOR</Text>
                      <TouchableOpacity
                        style={[styles.inputDropdownWrapper, showPetDropdown && { borderColor: COLORS.primary }]}
                        onPress={() => setShowPetDropdown(!showPetDropdown)}
                      >
                        {editForm.pet ? (
                          (editForm.pet.photo || editForm.pet.hasPhoto) ? (
                            <Image
                              source={{ uri: `${apiUrl}/pets/${editForm.pet._id}/photo` }}
                              style={[styles.inputIcon, { width: 24, height: 24, borderRadius: 12 }]}
                              contentFit="cover"
                            />
                          ) : (
                            <MaterialCommunityIcons
                              name={editForm.pet.type === 'Gato' ? "cat" : "dog"}
                              size={20}
                              color={COLORS.primary}
                              style={styles.inputIcon}
                            />
                          )
                        ) : (
                          <MaterialCommunityIcons name="paw" size={20} color={COLORS.primary} style={styles.inputIcon} />
                        )}

                        <Text style={[styles.dropdownSelectedText, { color: editForm.pet ? COLORS.text : '#94A3B8', fontWeight: editForm.pet ? '600' : 'normal' }]}>
                          {editForm.pet ? `${editForm.pet.name} (${editForm.pet.tutor?.name || editForm.pet.tutorName || 'Sem tutor'})` : 'Selecionar Pet...'}
                        </Text>
                        <MaterialCommunityIcons name={showPetDropdown ? "chevron-up" : "chevron-down"} size={20} color={COLORS.primary} />
                      </TouchableOpacity>

                      {showPetDropdown && (
                        <View style={styles.dropdownContainer}>
                          <View style={styles.searchBarContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
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
                              <Text style={styles.emptyResultsText}>Nenhum pet encontrado</Text>
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
                                      {(item.photo || item.hasPhoto) ? (
                                        <Image
                                          source={{ uri: `${apiUrl}/pets/${item._id}/photo` }}
                                          style={{ width: '100%', height: '100%' }}
                                          contentFit="cover"
                                        />
                                      ) : (
                                        <MaterialCommunityIcons name={item.type === 'Gato' ? "cat" : "dog"} size={16} color={COLORS.primary} />
                                      )}
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
                        </View>
                      )}
                    </View>

                    {/* SEÇÃO: SERVIÇOS (CHECKLIST COM CÁLCULO DE TEMPO E PREÇO) */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.sectionLabel}>SERVIÇOS (CHECKLIST)</Text>
                      {SERVICE_CATALOG.map(serv => {
                        const isChecked = selectedServices.some(s => s.id === serv.id);
                        return (
                          <TouchableOpacity
                            key={serv.id}
                            style={[styles.serviceCheck, isChecked && { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' }]}
                            onPress={() => toggleService(serv.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons
                              name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
                              size={24}
                              color={isChecked ? COLORS.primary : COLORS.inactive || '#9CA3AF'}
                            />
                            <Text style={[styles.serviceText, isChecked && styles.textBold]}>{serv.name}</Text>
                            <View style={styles.serviceMetaRight}>
                              <Text style={styles.durationBadgeText}>+{serv.duration} min</Text>
                              <Text style={styles.priceBadgeText}>R$ {serv.price.toFixed(2)}</Text>
                              <MaterialCommunityIcons name={serv.icon} size={18} color={COLORS.secondary || '#94A3B8'} style={{ marginLeft: 6 }} />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* SEÇÃO: CRONOGRAMA (DATA & HORA) */}
                    <View style={[styles.row, styles.fieldContainer]}>
                      <View style={styles.flexHalf}>
                        <Text style={styles.sectionLabel}>DATA</Text>
                        <TouchableOpacity style={styles.inputDateTimeButton} onPress={() => setShowDatePicker(true)}>
                          <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} style={styles.inputIcon} />
                          <Text style={styles.dateTimeText}>{editForm.date.toLocaleDateString('pt-BR')}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.flexHalf, { marginLeft: 12 }]}>
                        <Text style={styles.sectionLabel}>HORÁRIO DE INÍCIO</Text>
                        <TouchableOpacity style={styles.inputDateTimeButton} onPress={() => setShowTimePicker(true)}>
                          <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                          <Text style={styles.dateTimeText}>
                            {editForm.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Feedback Dinâmico de Tempo */}
                    <View style={styles.timeCalcFeedback}>
                      <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.timeCalcText}>
                        Duração Total: <Text style={{ fontWeight: 'bold' }}>{editForm.duration} min</Text>
                      </Text>
                      <Text style={styles.timeCalcTextDivider}>•</Text>
                      <Text style={styles.timeCalcText}>
                        Término Estimado: <Text style={{ fontWeight: 'bold' }}>{getEstimatedEndTime(editForm.date, editForm.duration)}</Text>
                      </Text>
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

                    {/* SEÇÃO: PREÇO / VALOR E STATUS */}
                    <View style={[styles.row, styles.fieldContainer]}>
                      <View style={[styles.flexHalf, { flex: 0.8 }]}>
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
                          let activeBg = st === 'CONCLUIDO' ? '#2ECC71' : st === 'CANCELADO' ? '#E74C3C' : '#F1C40F';
                          return (
                            <TouchableOpacity
                              key={st}
                              style={[styles.toggleBtn, isActive && { backgroundColor: activeBg }]}
                              onPress={() => setEditForm({ ...editForm, status: st })}
                            >
                              <Text style={[styles.toggleText, { color: isActive ? '#FFF' : '#9CA3AF' }]}>
                                {st.charAt(0) + st.slice(1).toLowerCase()}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* SEÇÃO: OBSERVAÇÕES */}
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

                    {/* BOTÕES DE SALVAMENTO */}
                    <View style={[styles.rowButtons, { marginTop: 10 }]}>
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
  // ESTRUTURA GERAL
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

  // LABELS DO FORMULÁRIO
  fieldContainer: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 8, textTransform: 'uppercase' },

  // INPUTS DE TEXTO E SELETORES
  input: { backgroundColor: '#F4F5F7', borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#E5E7EB' },
  inputDropdownWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  inputDateTimeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  dropdownSelectedText: { flex: 1, fontSize: 15 },
  dateTimeText: { fontSize: 15, color: COLORS.text || '#1E293B' },
  textArea: { height: 80, textAlignVertical: 'top' },

  priceInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, height: 52 },
  currencySymbol: { fontSize: 16, color: '#94A3B8', fontWeight: '700', marginRight: 8 },
  priceInput: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },

  // CHECKLIST DE SERVIÇOS (NOVO)
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
  serviceMetaRight: { flexDirection: 'row', alignItems: 'center' },
  durationBadgeText: { marginRight: 8, color: '#64748B', fontSize: 12, fontWeight: '600' },
  priceBadgeText: { color: COLORS.text || '#1E293B', fontWeight: '700', fontSize: 14 },

  // CÁLCULO DE TEMPO ESTIMADO (EDIÇÃO)
  timeCalcFeedback: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 24, marginTop: -12 },
  timeCalcText: { fontSize: 13, color: '#1E3A8A', marginLeft: 8 },
  timeCalcTextDivider: { marginHorizontal: 6, color: '#93C5FD' },

  // SELETOR SIMPLIFICADO / TOGGLE
  toggleRow: { flexDirection: 'row', backgroundColor: '#F4F5F7', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  toggleText: { fontWeight: 'bold', fontSize: 13 },

  // CARD DE HERO / INFORMAÇÕES DO PET (VISUALIZAÇÃO)
  petHeroCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  petMeta: { flex: 1, marginLeft: 16 },
  petNameText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  tutorNameText: { fontSize: 13, color: '#E2E8F0', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30 },
  statusText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },

  // LAYOUT DE GRID E DETALHES DA RESERVA (RESPONSIVIDADE AJUSTADA)
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },

  viewServicesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  viewServiceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BAE6FD' },
  viewServiceBadgeText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

  // GRID RESPONSIVO DA DATA E HORA
  viewDateTimeGrid: { flexDirection: 'column', gap: 16 },
  viewDateTimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, // FlexWrap permite quebrar a linha se a tela for pequena
  viewGridItem: { flex: 1, minWidth: 100, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  iconCircleInfo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  gridTextContainer: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text || '#1E293B' },

  priceHighlightContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 4 },
  priceHighlight: { color: '#16A34A', fontWeight: '800', fontSize: 24 },

  observationCard: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  observationText: { fontSize: 14, color: '#475569', lineHeight: 22 },

  // DROPDOWN DE BUSCA INTERNA DE PETS
  dropdownContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: 8, overflow: 'hidden' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchTextInput: { flex: 1, fontSize: 14 },
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  quickAddBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyResultsText: { textAlign: 'center', padding: 20, color: '#94A3B8', fontSize: 14 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemActive: { backgroundColor: '#F0F9FF' },
  petAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  itemPetName: { fontSize: 15, fontWeight: '600', color: COLORS.text || '#1E293B' },
  itemTutorName: { fontSize: 13, color: '#64748B', marginTop: 2 },

  // CONFIGURAÇÃO DOS BOTÕES DE AÇÃO
  actionMenuContainer: { marginTop: 12, gap: 12 },
  btnPrimary: { backgroundColor: '#2ECC71', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 0.48, backgroundColor: '#F0F9FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  btnSecondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  btnDanger: { flex: 0.48, backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  btnDangerText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },

  // CONFIGURAÇÕES DE BOTÕES DE SALVAMENTO (EDIÇÃO)
  btnCancelEdit: { flex: 0.48, padding: 16, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  btnCancelEditText: { color: '#64748B', fontSize: 15, fontWeight: '700' },
  btnSaveEdit: { flex: 0.48, padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  btnSaveEditText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});