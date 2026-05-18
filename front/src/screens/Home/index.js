import { View, Text, Button } from 'react-native';
import style from './style';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
    return (
        <View style={style.container}>
            <LinearGradient
                colors={['#430F78', '#5B2D90']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={style.boardadmin}
            >
                <Text style={style.type}>Painel administrativo</Text>
                <Text style={style.name}>Olá, |função/nome|</Text>
                <Text style={style.text}>Bem-vindo ao centro de comando na Pêlos & Lambeijos. Hoje temos |nº de pets a serem atendidos no dia| aguardando carinhos e cuidados. </Text>
            </LinearGradient>


            <View style={style.appointments}>
                <Text>Agendamentos do Dia</Text>
                <Text>|dia da semana. ex: quarta-feira|, |dia. ex: 29| de |mês ex: maio|</Text>
                <Button>Novo agendamento</Button>

                {/* iteração de arrays com agendamentos do dia */}
                <View style={style.appointment}>
                    <Text>|serviços| |horário do agendamento</Text>
                    <Button>|status do agendamento|</Button>
                </View>
                {/* final */}
            </View>

            <View style={style.appointmentmonths}>
                <Text>Atendimentos no mês</Text>
                <Text>|nº de atendimentos|</Text>
            </View>
            <View style={style.popularservices}>
                <Text>serviços mais populares</Text>
                <Text>|serviços ex: Banho & Tosa Premium|</Text>
            </View>
            <View style={style.totalinvoiceds}>
                <Text>Faturamento total</Text>
                <Text>|valor total em real. ex: R$11.320,00</Text>
            </View>

        </View>
    )
}