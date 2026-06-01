import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../styles/theme';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
  },

  bgTopPurpleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
    zIndex: 0,
    overflow: 'hidden', 
  },
  bgTopPurpleSolid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: '#4B2384',
  },
  bgWaveCrest: {
    position: 'absolute',
    top: 200,
    right: -width * 0.25,
    width: width * 1.1,
    height: 250,
    backgroundColor: '#4B2384',
    borderRadius: 300,
  },
  bgWaveValley: {
    position: 'absolute',
    top: 240,
    left: -width * 0.2,
    width: width * 1.0,
    height: 250,
    backgroundColor: '#F5F5F5',
    borderRadius: 120, 
    zIndex: 1,
  },
  bgGoldBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#A57442',
  },
  bgLightPurpleBlob: {
    position: 'absolute',
    top: 150,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#62369E',
  },

  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES?.padding || 24,
    paddingBottom: 40,
  },
  
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 80 : 60,
    marginBottom: 20,
  },

  logo: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B2384',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS?.text || '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS?.border || '#E5E7EB',
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS?.text || '#1F2937',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS?.primary || '#4B2384',
  },
  loginButton: {
    backgroundColor: COLORS?.primary || '#4B2384',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS?.primary || '#4B2384',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  loginButtonDisabled: {
    backgroundColor: COLORS?.inactive || '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS?.white || '#FFFFFF',
  },
});