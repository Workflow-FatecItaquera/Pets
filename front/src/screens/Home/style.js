import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 25,
        paddingTop: 45,
    },
    title: {
        fontSize: SIZES.fontTitle,
        fontWeight: 'bold',
        color: COLORS.text,

    },
    boardadmin: {
        width: '100%',
        padding: 27,
        paddingLeft: 32,
        paddingRight: 32,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },

    yellowGlow: {
        position: 'absolute',
        width: 215,
        height: 240,
        borderRadius: 999,

        backgroundColor: COLORS.secondary,

        top: -20,
        right: -30,

        opacity: 0.20,

        //android
        elevation: 20,

        //iOS - não tirar
        shadowColor: COLORS.secondary,
        shadowOffset: {
            width: -50,
            height: -2,
        },
        shadowOpacity: 0.9,
        shadowRadius: 40,
    },
    type: {
        color: COLORS.white,
        fontSize: SIZES.fontSection,
        textTransform: 'uppercase',
        opacity: 0.9,
        
    },
    name: {
        color: COLORS.white,
        fontSize: SIZES.fontTitle,
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
    },
    text: {
        color: COLORS.white,
        fontSize: SIZES.fontText,
        opacity: 0.8
    },
    appointments: {
        width: '100%',
        backgroundColor: COLORS.container,
        padding: 32,
        borderRadius: 30,
        marginTop: 30,
    },
    popularservices: {
        backgroundColor: COLORS.container,
        padding: 30,
        paddingTop: 25,
        paddingBottom: 20,
        borderRadius: 30,
        marginTop: 30,
    },
    appointmentmonths: {
        backgroundColor: COLORS.container,
        padding: 30,
        paddingTop: 25,
        paddingBottom: 20,
        borderRadius: 30,
        marginTop: 30
    },
    totalinvoiceds: {
        backgroundColor: COLORS.container,
        padding: 30,
        paddingTop: 25,
        paddingBottom: 20,
        borderRadius: 30,
        marginTop: 30
    },
    titleSection: {
        fontSize: SIZES.fontSubsection,
        fontWeight: 'bold',
        color: COLORS.section,
    },
    numbers: {
        fontSize: SIZES.fontNumbers,
        fontWeight: 'bold',
        color: COLORS.section,
    },
    information: {
        fontSize: SIZES.fontSection,
        color: COLORS.titlesubsection,
        paddingTop: 5,
        paddingBottom: 20,
    },
    buttonAppointment: {
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        color: COLORS.section,
        width: 185,
        alignItems: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    appointment:{
        backgroundColor: COLORS.white,
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pet: {
        fontSize: SIZES.fontHeader,
        fontWeight: 'bold',
        color: COLORS.section,
    },
    service:{
        color: COLORS.titlesubsection,
    },
    hour: {
        color: COLORS.titlesubsection,
    },
    status: {
        width: '40%',
        color: COLORS.titlesubsection,
        fontSize: SIZES.fontStatus,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        backgroundColor: COLORS.gray,
        textAlign: 'center',
        padding: 8,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 20,
    },
    datappointment: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'start',
    },
    imagecontainer: {
        width: 45,
        height: 75,
        borderRadius: 15,
        sizeImage: 'cover',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        sizeImage: 'cover',
    },
    iconSection: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 43,
        padding: 5,
        height: 45,
        borderRadius: 17,
        backgroundColor: COLORS.iconBackground,
    },
    iconStar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 43,
        padding: 5,
        height: 45,
        borderRadius: 17,
        backgroundColor: COLORS.iconStar
    },
    infoSection: {
        fontSize: SIZES.fontStatus,
        color: COLORS.titlesubsection,
        textTransform: 'uppercase',
        paddingTop: 25,
        paddingBottom: 5,    
    },
})