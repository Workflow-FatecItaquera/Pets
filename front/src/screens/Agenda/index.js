import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReservationCard from '../../components/ReservaCard';
import ReservationModal from '../../components/ReservaModal';
import { COLORS } from '../../styles/theme';
import style from './style';
import { BACKEND_URI } from '@env';

const API_URL = BACKEND_URI;

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
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateWeekDays(new Date(selectedDate + 'T12:00:00'));
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reservations`);
      if (!response.ok) throw new Error('Falha ao buscar agendamentos');
      
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos da API.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      if (!res.startDate) return false;
      const resDate = new Date(res.startDate).toISOString().split('T')[0];
      return resDate === selectedDate;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [reservations, selectedDate]);

  const markedDates = useMemo(() => {
    const marks = {};
    reservations.forEach(res => {
      if(res.startDate){
        const d = new Date(res.startDate).toISOString().split('T')[0];
        marks[d] = { marked: true, dotColor: COLORS.secondary };
      }
    });
    marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: COLORS.primary };
    return marks;
  }, [reservations, selectedDate]);

  const onReservationSaved = () => {
    fetchReservations();
  };

  return (
    <View style={style.container}>
      <Text style={style.pageTitle}>Agenda</Text>

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
            
            <TouchableOpacity 
              style={style.fullCalendarBtn} 
              onPress={() => setShowFullCalendar(true)}
            >
              <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {showFullCalendar && (
        <View style={style.fullCalendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              generateWeekDays(new Date(day.dateString + 'T12:00:00'));
              setShowFullCalendar(false);
            }}
            markedDates={markedDates}
            theme={{
              calendarBackground: COLORS.background,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.secondary,
              arrowColor: COLORS.primary,
            }}
          />
          <TouchableOpacity style={style.closeCalendarBtn} onPress={() => setShowFullCalendar(false)}>
            <Text style={style.closeCalendarText}>Fechar Calendário</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={style.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ReservationCard data={item} />}
          ListEmptyComponent={<Text style={style.emptyText}>Nenhum agendamento para este dia.</Text>}
        />
      )}

      <TouchableOpacity style={style.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <ReservationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        selectedDate={selectedDate}
        apiUrl={API_URL}
        onSaveSuccess={onReservationSaved}
      />
    </View>
  );
}