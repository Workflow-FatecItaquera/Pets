import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URI } from '@env';

import { COLORS } from '../../styles/theme';
import style from './style';

const API_URL = BACKEND_URI;
const USE_MOCK_RESERVATIONS = true;

const MOCK_RESERVATIONS = [
  {
    _id: 'mock-1',
    title: 'Banho & Tosa',
    startDate: new Date().toISOString(),
    price: 120,
    status: 'CONFIRMADO',
    pet: {
      name: 'Max',
      tutor: { name: 'Mariana Souza' },
    },
  },
  {
    _id: 'mock-2',
    title: 'Banho Premium',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    price: 85,
    status: 'AGUARDANDO',
    pet: {
      name: 'Thor',
      tutor: { name: 'Pedro Lima' },
    },
  },
  {
    _id: 'mock-3',
    title: 'Tosa Higienica',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    price: 250,
    status: 'CONFIRMADO',
    pet: {
      name: 'Luna',
      tutor: { name: 'Bianca Alves' },
    },
  },
  {
    _id: 'mock-4',
    title: 'Pacote Recorrente',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    price: 340,
    status: 'CONFIRMADO',
    pet: {
      name: 'Mel',
      tutor: { name: 'Rafael Costa' },
    },
  },
  {
    _id: 'mock-5',
    title: 'Banho Simples',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    price: 70,
    status: 'CONFIRMADO',
    pet: {
      name: 'Bento',
      tutor: { name: 'Camila Rocha' },
    },
  },
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function getReservationDate(reservation) {
  return reservation.startDate ? new Date(reservation.startDate) : new Date(0);
}

function isSameDay(firstDate, secondDate) {
  return firstDate.toDateString() === secondDate.toDateString();
}

function formatReservationDate(value) {
  if (!value) return 'Sem data';

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isSameDay(date, today)) return `Hoje, ${time}`;
  if (isSameDay(date, yesterday)) return `Ontem, ${time}`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getGrowthText(value) {
  if (value === null || value === undefined) return 'Sem comparativo anterior';

  const signal = value >= 0 ? '+' : '';
  return `${signal}${value.toFixed(0)}% em relacao ao mes anterior`;
}

function sumReservations(reservations, startDate = null, endDate = null) {
  return reservations.reduce((total, reservation) => {
    const date = getReservationDate(reservation);
    const inRange = (!startDate || date >= startDate) && (!endDate || date < endDate);

    if (!inRange) return total;

    return total + (Number(reservation.price) || 0);
  }, 0);
}

function calculateGrowth(currentValue, previousValue) {
  if (!previousValue) return null;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

function SummaryCard({ icon, iconBackground, label, value, valueColor }) {
  return (
    <View style={style.summaryCard}>
      <View style={[style.summaryIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={23} color={COLORS.text} />
      </View>
      <Text style={style.summaryLabel}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[style.summaryValue, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

function ReservationTransactionItem({ item }) {
  const isConfirmed = item.status !== 'AGUARDANDO';
  const petName = item.pet?.name ? `: ${item.pet.name}` : '';

  return (
    <View style={style.transactionItem}>
      <View style={style.transactionIcon}>
        <Ionicons name="paw" size={21} color={COLORS.white} />
      </View>

      <View style={style.transactionInfo}>
        <Text numberOfLines={1} style={style.transactionTitle}>
          {item.title || 'Servico'}{petName}
        </Text>
        <Text style={style.transactionTime}>{formatReservationDate(item.startDate)}</Text>
      </View>

      <View style={style.transactionValueArea}>
        <Text style={style.transactionValue}>+ {formatCurrency(item.price)}</Text>
        <View style={[
          style.statusPill,
          isConfirmed ? style.confirmedPill : style.pendingPill,
        ]}>
          <Text style={[
            style.statusText,
            isConfirmed ? style.confirmedText : style.pendingText,
          ]}>
            {isConfirmed ? 'Confirmado' : 'Pendente'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function Finance() {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      if (USE_MOCK_RESERVATIONS) {
        setReservations(MOCK_RESERVATIONS);
        return;
      }

      const response = await fetch(`${API_URL}/reservations`);
      if (!response.ok) throw new Error('Falha ao buscar agendamentos');

      const data = await response.json();
      setReservations(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar os agendamentos da API.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - now.getDay());

    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);

    const totalIncome = sumReservations(reservations);
    const currentMonthIncome = sumReservations(reservations, currentMonthStart, nextMonthStart);
    const previousMonthIncome = sumReservations(reservations, previousMonthStart, currentMonthStart);
    const currentWeekIncome = sumReservations(reservations, weekStart);
    const previousWeekIncome = sumReservations(reservations, previousWeekStart, weekStart);

    return {
      balance: totalIncome,
      totalIncome,
      totalExpense: 0,
      monthlyGrowth: calculateGrowth(currentMonthIncome, previousMonthIncome),
      weeklyGrowth: calculateGrowth(currentWeekIncome, previousWeekIncome),
    };
  }, [reservations]);

  const recentReservations = useMemo(() => {
    return [...reservations]
      .filter((reservation) => Number(reservation.price) > 0)
      .sort((a, b) => getReservationDate(b) - getReservationDate(a))
      .slice(0, 8);
  }, [reservations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReservations(false);
  };

  return (
    <ScrollView
      style={style.container}
      contentContainerStyle={style.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={style.loader} />
      ) : (
        <>
          <View style={style.balanceCard}>
            <View style={style.balanceAccent} />
            <Text style={style.balanceLabel}>SALDO FATURADO</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={style.balanceValue}>
              {formatCurrency(summary.balance)}
            </Text>
            <View style={style.balanceDivider} />
            <View style={style.balanceGrowth}>
              <Ionicons
                name={(summary.monthlyGrowth || 0) >= 0 ? 'trending-up' : 'trending-down'}
                size={13}
                color={COLORS.secondary}
              />
              <Text style={style.balanceGrowthText}>{getGrowthText(summary.monthlyGrowth)}</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} style={style.newButton} onPress={() => navigation.navigate('Agenda')}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.white} />
            <Text style={style.newButtonText}>Novo Agendamento</Text>
          </TouchableOpacity>

          <View style={style.summaryRow}>
            <SummaryCard
              icon="arrow-down"
              iconBackground="#FFD98F"
              label="ENTRADAS"
              value={formatCurrency(summary.totalIncome)}
              valueColor="#8F6500"
            />
            <SummaryCard
              icon="arrow-up"
              iconBackground="#E7D1FF"
              label="SAIDAS"
              value={formatCurrency(summary.totalExpense)}
              valueColor={COLORS.primary}
            />
          </View>

          <View style={style.sectionHeader}>
            <Text style={style.sectionTitle}>Extrato Recente</Text>
          </View>

          <View style={style.statementCard}>
            {recentReservations.length === 0 ? (
              <Text style={style.emptyText}>Nenhum agendamento faturado encontrado.</Text>
            ) : (
              recentReservations.map((item) => (
                <ReservationTransactionItem key={item._id} item={item} />
              ))
            )}
          </View>

          <View style={style.reportCard}>
            <Text style={style.reportTitle}>Relatorio Semanal</Text>
            <Text style={style.reportText}>
              {summary.weeklyGrowth === null || summary.weeklyGrowth === undefined
                ? 'Ainda nao ha dados suficientes para comparar a semana.'
                : `Sua receita ${summary.weeklyGrowth >= 0 ? 'cresceu' : 'caiu'} ${Math.abs(summary.weeklyGrowth).toFixed(0)}% esta semana.`}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
