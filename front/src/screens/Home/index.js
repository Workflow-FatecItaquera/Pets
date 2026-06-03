import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import style from './style';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BACKEND_URI } from '@env';
import { useNavigation } from '@react-navigation/native';
import ReservaCard from '../../components/ReservaCard';
import ReservaDetails from '../../components/ReservaDetails';
import { COLORS } from '../../styles/theme';
import { AuthContext } from '../../contexts/AuthContext';

const API_URL = BACKEND_URI;

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Home() {
    const navigation = useNavigation();
    const { userData } = useContext(AuthContext);
    const userId = userData?._id;
    const isAdmin = userData?.role === 'admin';
    
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ monthTotal: 0, revenue: 0 });
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    }).format(currentDate);

    const fetchDashboardData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reservations?userId=${userId}&isAdmin=${isAdmin}`);
            if (!response.ok) throw new Error('Erro ao buscar reservas');
            
            const data = await response.json();
            const reservationsArray = Array.isArray(data) ? data : [];
            const todayString = getLocalDateString(currentDate);
            const currentMonth = currentDate.getMonth();
            
            const filteredToday = reservationsArray
                .filter(res => {
                    if (!res.startDate) return false;
                    return getLocalDateString(new Date(res.startDate)) === todayString;
                })
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const filteredMonth = reservationsArray.filter(res => {
                if (!res.startDate) return false;
                return new Date(res.startDate).getMonth() === currentMonth;
            });

            const totalRevenue = filteredMonth.reduce((acc, curr) => {
                const isCancelled = curr.status?.toLowerCase().trim() === 'cancelado';
                if (isCancelled) return acc;
                return acc + (curr.price || curr.value || 0);
            }, 0);

            setTodayAppointments(filteredToday);
            setStats({
                monthTotal: filteredMonth.length,
                revenue: totalRevenue
            });

        } catch (error) {
            console.error("Erro ao carregar Dashboard:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, isAdmin]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const handleOpenDetails = (reservation) => {
        setSelectedReservation(reservation);
        setDetailsModalVisible(true);
    };

    const onReservationSaved = () => {
        fetchDashboardData(false);
    };

    return (
        <View style={style.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#430F78" />
                }
            >
                <LinearGradient
                    colors={['#430F78', '#5B2D90']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={style.boardadmin}
                >
                    <View style={style.yellowGlow} />

                    <Text style={style.type}>
                        {isAdmin ? "Painel administrativo" : "Painel do Cliente"}
                    </Text>

                    <Text style={style.name}>Olá, {userData.isAdmin ? 'Administrador' : 'Colaborador'}</Text>

                    <Text style={style.text}>
                        Bem-vindo ao centro de comando da Pêlos & Lambeijos.
                        Hoje temos {todayAppointments.length} {todayAppointments.length === 1 ? 'pet aguardando carinho' : 'pets aguardando carinhos'} e cuidados.
                    </Text>
                </LinearGradient>

                <View style={style.appointments}>
                    <Text style={style.titleSection}>Agendamentos do Dia</Text>
                    <Text style={style.information}>
                        {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                    </Text>
                    
                    <Pressable style={style.buttonAppointment} onPress={() => navigation.navigate('Agenda')}>
                        <Text style={{ color: '#FFFFFF', padding: 10, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }}>
                            Novo agendamento
                        </Text>
                    </Pressable>

                    <View style={{ marginTop: 10 }}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#430F78" style={{ marginTop: 20 }} />
                        ) : todayAppointments.length === 0 ? (
                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                <Text style={[style.information, { paddingBottom: 0 }]}>Nenhum agendamento para hoje.</Text>
                            </View>
                        ) : (
                            todayAppointments.map((appointment) => (
                                <ReservaCard 
                                    key={appointment._id || Math.random().toString()} 
                                    data={appointment}
                                    onPress={() => handleOpenDetails(appointment)}
                                />
                            ))
                        )}
                    </View>
                </View>

                <View style={style.appointmentmonths}>
                    <View style={style.iconSection}>
                        <Ionicons name="calendar-outline" size={23} color="#430F78" />
                    </View>
                    <Text style={style.infoSection}>Atendimentos no mês</Text>
                    <Text style={style.numbers}>{stats.monthTotal}</Text>
                </View>

                <View style={style.popularservices}>
                    <View style={style.iconStar}>
                        <Ionicons name="star" size={22} color="#7A5900" />
                    </View>
                    <Text style={style.infoSection}>serviços mais populares</Text>
                    <Text style={style.titleSection}>Banho & Tosa Premium</Text>
                </View>

                <View style={style.totalinvoiceds}>
                    <View style={style.iconSection}>
                        <Ionicons name="wallet-outline" size={23} color="#430F78" />
                    </View>
                    <Text style={style.infoSection}>faturamento total (Mês)</Text>
                    <Text style={style.numbers}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                    </Text>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>

            <ReservaDetails
                visible={detailsModalVisible}
                onClose={() => {
                    setDetailsModalVisible(false);
                    setSelectedReservation(null);
                }}
                reservation={selectedReservation}
                apiUrl={API_URL}
                onSaveSuccess={onReservationSaved}
            />
        </View>
    );
}