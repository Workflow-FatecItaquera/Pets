import { StyleSheet, Dimensions } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 40 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginHorizontal: SIZES.padding, marginBottom: 20, letterSpacing: -0.5 },
  horizontalCalendarContainer: { marginBottom: 20 },
  scrollContent: { paddingHorizontal: SIZES.padding, alignItems: 'center' },
  dayCard: { width: 62, height: 82, backgroundColor: COLORS.border || '#F0F2F5', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  dayCardActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  weekDayText: { fontSize: 11, color: COLORS.inactive || '#7F8C8D', marginBottom: 6, fontWeight: '700', letterSpacing: 0.5 },
  dayText: { fontSize: 22, color: COLORS.text || '#2C3E50', fontWeight: 'bold' },
  textActive: { color: COLORS.white },
  fullCalendarBtn: { width: 62, height: 82, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.padding },
  fullCalendarWrapper: { backgroundColor: COLORS.white, marginHorizontal: SIZES.padding, borderRadius: 20, padding: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, marginBottom: 20 },
  closeCalendarBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 12, backgroundColor: '#F5F5F7', borderRadius: 12 },
  closeCalendarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  listContainer: { paddingHorizontal: SIZES.padding, paddingBottom: 120 },
  cardPressableWrapper: { marginBottom: 12 },
  emptyText: { textAlign: 'center', color: COLORS.inactive, marginTop: 60, fontSize: 15, paddingHorizontal: 40, lineHeight: 22 },
  fab: { position: 'absolute', bottom: 30, right: SIZES.padding, backgroundColor: COLORS.secondary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  dropdownContainer: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginTop: 5, maxHeight: 150 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: 14, color: COLORS.text },
  errorInput: { borderColor: 'red', borderWidth: 1 },
});