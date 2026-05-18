import { StyleSheet, Dimensions } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SIZES.padding,
    height: height * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.inactive,
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: COLORS.border,
    padding: 6,
    borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.inactive,
    marginBottom: 8,
    marginTop: 15,
  },
  inputBox: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 4,
  },
  packageBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  packageBtnActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  packageText: {
    color: COLORS.inactive,
    fontWeight: 'bold',
  },
  packageTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  serviceCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7FC',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  totalLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});