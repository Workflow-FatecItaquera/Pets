import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', 
        backgroundColor: COLORS.background
    },
    title: {
        fontSize: SIZES.fontTitle,
        fontWeight: 'bold',
        color: COLORS.text
    }
})