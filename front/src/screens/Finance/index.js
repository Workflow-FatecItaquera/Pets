import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URI } from '@env';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../../styles/theme';
import style from './style';

const API_URL = BACKEND_URI;

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

function getGrowthText(value, filterType) {
  if (value === null || value === undefined) return 'Sem comparativo anterior';
  const label = filterType === 'weekly' ? 'à semana anterior' : 'ao mês anterior';
  const signal = value >= 0 ? '+' : '';
  return `${signal}${value.toFixed(0)}% em relação ${label}`;
}

function sumReservations(reservations, startDate = null, endDate = null) {
  return reservations.reduce((total, reservation) => {
    const status = String(reservation.status).toUpperCase();
    if (status !== 'PAGO') return total;

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
    <View style={[style.summaryCard, { flex: 1 }]}>
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
  const status = String(item.status).toUpperCase();
  const isEncerrado = status === 'PAGO';
  const petName = item.pet?.name ? `: ${item.pet.name}` : '';

  return (
    <View style={style.transactionItem}>
      <View style={style.transactionIcon}>
        <Ionicons name="paw" size={21} color={COLORS.white} />
      </View>

      <View style={style.transactionInfo}>
        <Text numberOfLines={1} style={style.transactionTitle}>
          {item.title || 'Serviço'}{petName}
        </Text>
        <Text style={style.transactionTime}>{formatReservationDate(item.startDate)}</Text>
      </View>

      <View style={style.transactionValueArea}>
        <Text style={style.transactionValue}>+ {formatCurrency(item.price)}</Text>
        <View style={[
          style.statusPill,
          isEncerrado ? style.confirmedPill : style.pendingPill,
        ]}>
          <Text style={[
            style.statusText,
            isEncerrado ? style.confirmedText : style.pendingText,
          ]}>
            {isEncerrado ? 'Pago' : 'Pendente'}
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
  const [filter, setFilter] = useState('monthly');

  const fetchReservations = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      console.log(`[Finance] Buscando agendamentos reais em: ${API_URL}/reservations`);
      const response = await fetch(`${API_URL}/reservations`);
      
      if (!response.ok) {
        throw new Error(`Erro do servidor: Status ${response.status}`);
      }

      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros da API.');
      console.error('[Fetch Reservations Error]', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchReservations();
    }, [fetchReservations])
  );

  const financialData = useMemo(() => {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentWeekStart = new Date(now);
    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);

    const targetStartDate = filter === 'weekly' ? currentWeekStart : currentMonthStart;
    const targetEndDate = filter === 'weekly' ? null : nextMonthStart;

    const periodIncome = sumReservations(reservations, targetStartDate, targetEndDate);

    const currentMonthIncome = sumReservations(reservations, currentMonthStart, nextMonthStart);
    const previousMonthIncome = sumReservations(reservations, previousMonthStart, currentMonthStart);
    const currentWeekIncome = sumReservations(reservations, currentWeekStart);
    const previousWeekIncome = sumReservations(reservations, previousWeekStart, currentWeekStart);

    const growth = filter === 'weekly'
      ? calculateGrowth(currentWeekIncome, previousWeekIncome)
      : calculateGrowth(currentMonthIncome, previousMonthIncome);

    return {
      activeBalance: periodIncome,
      growth: growth,
      weeklyGrowth: calculateGrowth(currentWeekIncome, previousWeekIncome)
    };
  }, [reservations, filter]);

  const filteredRecentReservations = useMemo(() => {
    const now = new Date();
    let limitDate = new Date(now.getFullYear(), now.getMonth(), 1);

    if (filter === 'weekly') {
      limitDate = new Date(now);
      limitDate.setHours(0, 0, 0, 0);
      limitDate.setDate(now.getDate() - now.getDay());
    }

    return [...reservations]
      .filter((res) => {
        const status = String(res.status).toUpperCase();
        const isEncerrado = status === 'PAGO';
        const date = getReservationDate(res);
        return isEncerrado && Number(res.price) > 0 && date >= limitDate;
      })
      .sort((a, b) => getReservationDate(b) - getReservationDate(a));
  }, [reservations, filter]);

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
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F4F8', borderRadius: 12, padding: 4, marginBottom: 16 }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: filter === 'weekly' ? COLORS.white : 'transparent', elevation: filter === 'weekly' ? 1 : 0 }}
              onPress={() => setFilter('weekly')}
            >
              <Text style={{ fontWeight: 'bold', color: filter === 'weekly' ? COLORS.primary : COLORS.inactive }}>Visão Semanal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: filter === 'monthly' ? COLORS.white : 'transparent', elevation: filter === 'monthly' ? 1 : 0 }}
              onPress={() => setFilter('monthly')}
            >
              <Text style={{ fontWeight: 'bold', color: filter === 'monthly' ? COLORS.primary : COLORS.inactive }}>Visão Mensal</Text>
            </TouchableOpacity>
          </View>

          <View style={style.balanceCard}>
            <View style={style.balanceAccent} />
            <Text style={style.balanceLabel}>FATURADO {filter === 'weekly' ? 'ESTA SEMANA' : 'ESTE MÊS'}</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={style.balanceValue}>
              {formatCurrency(financialData.activeBalance)}
            </Text>
            <View style={style.balanceDivider} />
            <View style={style.balanceGrowth}>
              <Ionicons
                name={(financialData.growth || 0) >= 0 ? 'trending-up' : 'trending-down'}
                size={13}
                color={COLORS.secondary}
              />
              <Text style={style.balanceGrowthText}>{getGrowthText(financialData.growth, filter)}</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} style={style.newButton} onPress={() => navigation.navigate('Agenda')}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.white} />
            <Text style={style.newButtonText}>Novo Agendamento</Text>
          </TouchableOpacity>

          <View style={style.summaryRow}>
            <SummaryCard
              icon="wallet-outline"
              iconBackground="#E7D1FF"
              label="TOTAL RECEBIDO NO PERÍODO"
              value={formatCurrency(financialData.activeBalance)}
              valueColor={COLORS.primary}
            />
          </View>

          <View style={style.sectionHeader}>
            <Text style={style.sectionTitle}>Extrato ({filter === 'weekly' ? 'Semana' : 'Mês'})</Text>
          </View>

          <View style={style.statementCard}>
            {filteredRecentReservations.length === 0 ? (
              <Text style={style.emptyText}>Nenhum serviço marcado com o status "pago" neste período. O serviço deve ser pago para aparecer aqui.</Text>
            ) : (
              filteredRecentReservations.map((item) => (
                <ReservationTransactionItem key={item._id} item={item} />
              ))
            )}
          </View>

          <View style={style.reportCard}>
            <Text style={style.reportTitle}>Relatório de Desempenho</Text>
            <Text style={style.reportText}>
              {financialData.weeklyGrowth === null || financialData.weeklyGrowth === undefined
                ? 'Ainda não há dados suficientes para analisar evolução.'
                : `Sua receita semanal ${financialData.weeklyGrowth >= 0 ? 'cresceu' : 'caiu'} ${Math.abs(financialData.weeklyGrowth).toFixed(0)}% em relação aos 7 dias anteriores.`}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}