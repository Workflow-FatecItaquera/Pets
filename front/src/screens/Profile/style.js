import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from "../../styles/theme";

export const colors = {
  ...COLORS,
  brown: '#8B4513'
};

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9', 
    paddingHorizontal: SIZES.padding 
  },
  scrollContent: { 
    paddingBottom: 30 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginTop: 20, 
    marginBottom: 20 
  },
  userSection: { 
    alignItems: 'center', 
    marginBottom: 25 
  },
  avatarContainer: { 
    position: 'relative', 
    marginBottom: 10 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    borderColor: COLORS.primary 
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 5, 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    borderWidth: 2, 
    borderColor: COLORS.white,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingRight: 1,
    paddingTop: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  badgeAdmin: { 
    backgroundColor: COLORS.secondary 
  },
  badgeEmployee: { 
    backgroundColor: COLORS.primary 
  },

  userName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  rolePill: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 15, 
    marginTop: 5 
  },
  rolePillAdmin: { 
    backgroundColor: '#E8DEF8' 
  },
  rolePillEmployee: { 
    backgroundColor: '#FFD700' 
  },
  roleText: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  roleTextAdmin: { 
    color: COLORS.primary 
  },
  roleTextEmployee: { 
    color: '#8B4513' 
  },
  
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 20, 
    elevation: 3 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  cardTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginLeft: 8 
  },
  label: { 
    fontSize: 10, 
    color: '#999', 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  infoValueText: { 
    fontSize: 14, 
    color: COLORS.text, 
    marginBottom: 10 
  },
  
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 5
  },
  
  inputFake: { 
    backgroundColor: '#F5F5F5', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  inputText: { 
    color: COLORS.text, 
    fontSize: 13 
  },
  
  outlineButton: { 
    borderWidth: 1.5, 
    borderColor: COLORS.primary, 
    borderRadius: 25, 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  outlineButtonText: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  
  saveButton: { 
    backgroundColor: COLORS.secondary, 
    borderColor: COLORS.secondary,
    marginTop: 15
  },
  saveButtonText: { 
    color: COLORS.primary, 
    fontWeight: 'bold'
  },
  
  separatorThin: { 
    height: 1, 
    backgroundColor: '#EEE', 
    marginVertical: 10 
  },
  
  logoutButton: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 30, 
    paddingVertical: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  logoutIcon: { 
    marginRight: 10 
  },
  logoutText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // ==========================================
  // ESTILOS ADICIONADOS PARA O MODAL (ESQUECI A SENHA)
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8DEF8', // Cor de fundo suave para combinar com o ícone
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelModalButton: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelModalText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'bold',
  },
});