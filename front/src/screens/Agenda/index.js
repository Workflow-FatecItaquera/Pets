import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReservationCard from '../../components/ReservationCard';
import ReservationModal from '../../components/ReservationModal';
import { COLORS } from '../../styles/theme';
import style from './style';

// Configuração de idioma para o Calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [weekDays, setWeekDays] = useState([]);
  
  // Mock de dados simulando retorno do backend (Reservation.find().populate('pet'))
  const [reservations, setReservations] = useState([
    {
      _id: '1',
      startDate: `${selectedDate}T09:30:00`,
      title: 'Banho + Tosa',
      status: 'AGUARDANDO',
      pet: { name: 'Bento', photo: 'https://via.placeholder.com/50', tutor: { name: 'Maria Eduarda' } },
      notes: 'Leva e Traz'
    },
    {
      _id: '2',
      startDate: `${selectedDate}T10:45:00`,
      title: 'Banho Higiênico',
      status: 'EM BANHO',
      pet: { name: 'Mel', photo: 'https://via.placeholder.com/50', tutor: { name: 'João Ricardo' } },
      notes: 'Plano Mensal'
    }
  ]);

  useEffect(() => {
    generateWeekDays(new Date());
  }, []);

  const generateWeekDays = (baseDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      days.push({
        dateString: date.toISOString().split('T')[0],
        day: date.getDate(),
        weekDay: LocaleConfig.locales['pt-br'].dayNamesShort[date.getDay()].toUpperCase()
      });
    }
    setWeekDays(days);
  };

  const markedDates = useMemo(() => {
    // Marcando dias com agendamento
    return {
      [selectedDate]: { selected: true, selectedColor: COLORS.primary },
      '2026-05-20': { marked: true, dotColor: COLORS.secondary }, // Exemplo de dia com evento
    };
  }, [selectedDate]);

  return (
    <View style={style.container}>
      <Text style={style.pageTitle}>Agenda</Text>

      {/* Header do Calendário - Scroll Horizontal */}
      {!showFullCalendar && (
        <View style={style.horizontalCalendarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={style.scrollContent}>
            {weekDays.map((item) => {
              const isActive = item.dateString === selectedDate;
              return (
                <TouchableOpacity 
                  key={item.dateString} 
                  style={[style.dayCard, isActive && style.dayCardActive]}
                  onPress={() => setSelectedDate(item.dateString)}
                >
                  <Text style={[style.weekDayText, isActive && style.textActive]}>{item.weekDay}</Text>
                  <Text style={[style.dayText, isActive && style.textActive]}>{item.day}</Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Botão de abrir calendário completo */}
            <TouchableOpacity 
              style={style.fullCalendarBtn} 
              onPress={() => setShowFullCalendar(true)}
            >
              <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Calendário Completo da Biblioteca */}
      {showFullCalendar && (
        <View style={style.fullCalendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              generateWeekDays(new Date(day.dateString + 'T00:00:00'));
              setShowFullCalendar(false);
            }}
            markedDates={markedDates}
            theme={{
              calendarBackground: COLORS.background,
              textSectionTitleColor: COLORS.inactive,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.secondary,
              dayTextColor: COLORS.text,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
            }}
          />
          <TouchableOpacity 
            style={style.closeCalendarBtn} 
            onPress={() => setShowFullCalendar(false)}
          >
            <Text style={style.closeCalendarText}>Fechar Calendário</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de Agendamentos */}
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={style.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ReservationCard data={item} />}
        ListEmptyComponent={
          <Text style={style.emptyText}>Nenhum agendamento para este dia.</Text>
        }
      />

      {/* FAB - Botão Flutuante de Adicionar */}
      <TouchableOpacity style={style.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal de Novo Agendamento */}
      <ReservationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        selectedDate={selectedDate}
      />
    </View>
  );
}