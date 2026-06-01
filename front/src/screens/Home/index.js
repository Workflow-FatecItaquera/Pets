import { View, Text, Button, Pressable, ScrollView, Image } from 'react-native';
import style from './style';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
    return (
        <View style={style.container}>
            <ScrollView>
                <LinearGradient
                    colors={['#430F78', '#5B2D90']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={style.boardadmin}
                >
                    {/* Mancha amarela */}
                    <View style={style.yellowGlow} />

                    <Text style={style.type}>Painel administrativo</Text>

                    <Text style={style.name}>
                        Olá, |função/nome|
                    </Text>

                    <Text style={style.text}>
                        Bem-vindo ao centro de comando da Pêlos & Lambeijos.
                        Hoje temos |nº de pets| aguardando carinhos e cuidados.
                    </Text>
                </LinearGradient>

                <View style={style.appointments}>
                    <Text style={style.titleSection}>Agendamentos do Dia</Text>
                    {/* dia de hoje, data atualizada dinamicamente, exemplo: quarta-feira, 24 de maio */}
                    <Text style={style.information}>Quarta-feira, 24 de maio</Text>
                    <Pressable style={style.buttonAppointment}>
                        <Text style={{ color: '#FFFFFF', padding: 10 }}>Novo agendamento</Text>
                    </Pressable>

                    {/* iteração de arrays com agendamentos do dia */}
                    <View style={style.appointment}>
                        <View style={style.imagecontainer}>
                            <Image style={style.image} source={require('../../../assets/labrador.jpg')} />
                        </View>
                        <View style={style.datappointment}>
                            <Text style={style.pet}>Marlon</Text>
                            <Text style={style.service}>Tosa</Text>
                            <Text style={style.hour}>• 10:30</Text>
                        </View>
                        <Text style={style.status}>Status</Text>
                    </View>

                    <View style={style.appointment}>
                        <View style={style.imagecontainer}>
                            <Image style={style.image} source={require('../../../assets/gato.png')} />
                        </View>
                        <View style={style.datappointment}>
                            <Text style={style.pet}>Otoneu</Text>
                            <Text style={style.service}>Banho</Text>
                            <Text style={style.hour}>• 08:40</Text>
                        </View>
                        <Text style={style.status}>Status</Text>
                    </View>
                    {/* final */}
                </View>

                <View style={style.appointmentmonths}>
                    <View style={style.iconSection}>
                        <Ionicons name="calendar-outline" size={23} color="#430F78" />
                    </View>
                    <Text style={style.infoSection}>Atendimentos no mês</Text>
                    <Text style={style.numbers}>342</Text>
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
                    <Text style={style.infoSection}>faturamento total</Text>
                    <Text style={style.numbers}>R$18.420,00</Text>
                </View>
            </ScrollView>
        </View>
    )
}