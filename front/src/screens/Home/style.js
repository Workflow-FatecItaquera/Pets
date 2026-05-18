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
    boardadmin:{
        padding: 20,
        borderRadius: 12,
    },
    type:{
        color: COLORS.white,
        fontSize: SIZES.fontLabel
    },
    name:{
        color: COLORS.white,
        fontSize: SIZES.fontTitle,
    },
    text:{
        color: COLORS.white,
        fontSize: SIZES.fontLabel
    },
})