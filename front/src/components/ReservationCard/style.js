import { StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export default StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftIndicator: {
    width: 6,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tutorName: {
    fontSize: 12,
    color: COLORS.inactive,
  },
  statusBadge: {
    backgroundColor: '#FFF4E5', // Amarelo claro para aguardando
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statusTextActive: {
    color: COLORS.white,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailBlock: {
    marginRight: 40,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.inactive,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.inactive,
    marginLeft: 5,
  }
});