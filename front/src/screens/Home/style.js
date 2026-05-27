import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 25,
    },
    title: {
        fontSize: SIZES.fontTitle,
        fontWeight: 'bold',
        color: COLORS.text
    },
    boardadmin: {
        width: '100%',
        padding: 24,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },

    yellowGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 999,

        backgroundColor: COLORS.secondary,

        top: -40,
        right: -30,

        opacity: 0.25,

        //android
        elevation: 20,

        //iOS - não tirar
        shadowColor: COLORS.secondary,
        shadowOffset: {
            width: -50,
            height: -2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 40,
    },
    type: {
        color: COLORS.white,
        fontSize: SIZES.fontLabel
    },
    name: {
        color: COLORS.white,
        fontSize: SIZES.fontTitle,
    },
    text: {
        color: COLORS.white,
        fontSize: SIZES.fontLabel
    },
    appointments: {
        backgroundColor: COLORS.container,
        padding: 30,
        borderRadius: 12
    },
    popularservices: {
        backgroundColor: COLORS.container,
        padding: 30,
        borderRadius: 12
    },
    appointmentmonths: {
        backgroundColor: COLORS.container,
        padding: 30,
        borderRadius: 12
    },
    totalinvoiceds: {
        backgroundColor: COLORS.container,
        padding: 30,
        borderRadius: 12
    }
})