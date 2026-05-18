import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: SIZES.padding,
    marginBottom: 15,
  },
  horizontalCalendarContainer: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
  },
  dayCard: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.border,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
  },
  weekDayText: {
    fontSize: 12,
    color: COLORS.inactive,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  textActive: {
    color: COLORS.white,
  },
  fullCalendarBtn: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  fullCalendarWrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  closeCalendarBtn: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  closeCalendarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.inactive,
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: SIZES.padding,
    backgroundColor: COLORS.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  }
});