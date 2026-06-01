import { Platform, StyleSheet } from 'react-native';

import { COLORS, SIZES } from '../../styles/theme';

const shadow = {
  ...Platform.select({
    ios: {
      shadowColor: '#7A6E87',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
    },
    android: {
      elevation: 7,
    },
    default: {
      shadowColor: '#7A6E87',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
    },
  }),
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9FD',
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 26,
    paddingBottom: 28,
  },
  loader: {
    marginTop: 80,
  },
  balanceCard: {
    minHeight: 168,
    overflow: 'hidden',
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 27,
    ...shadow,
  },
  balanceAccent: {
    position: 'absolute',
    top: 0,
    right: -14,
    width: '48%',
    height: '74%',
    borderBottomLeftRadius: 72,
    backgroundColor: 'rgba(255, 184, 0, 0.22)',
  },
  balanceLabel: {
    color: '#C7A9EA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  balanceValue: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
  },
  balanceDivider: {
    width: '82%',
    height: 1,
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  balanceGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  balanceGrowthText: {
    marginLeft: 6,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  newButton: {
    height: 56,
    marginTop: 28,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  newButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 32,
  },
  summaryCard: {
    flex: 1,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...shadow,
  },
  summaryIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  summaryLabel: {
    marginTop: 17,
    color: '#9A91A6',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 19,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 35,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  statementCard: {
    borderRadius: 25,
    backgroundColor: '#FDFDFD',
    padding: 9,
    ...shadow,
  },
  transactionItem: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#C78B4B',
  },
  expenseIcon: {
    backgroundColor: COLORS.primary,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  transactionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },
  transactionTime: {
    marginTop: 4,
    color: '#8B8493',
    fontSize: 11,
    fontWeight: '500',
  },
  transactionValueArea: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  transactionValue: {
    color: '#9B6800',
    fontSize: 12,
    fontWeight: '900',
  },
  expenseValue: {
    color: COLORS.primary,
  },
  statusPill: {
    marginTop: 5,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confirmedPill: {
    backgroundColor: '#FFE5A6',
  },
  pendingPill: {
    backgroundColor: '#E8E3ED',
  },
  statusText: {
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  confirmedText: {
    color: '#9B6800',
  },
  pendingText: {
    color: '#61566B',
  },
  emptyText: {
    paddingVertical: 26,
    paddingHorizontal: 10,
    color: '#8B8493',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportCard: {
    minHeight: 138,
    justifyContent: 'center',
    marginTop: 34,
    borderRadius: 34,
    backgroundColor: '#FFC24B',
    paddingHorizontal: 30,
    ...shadow,
  },
  reportTitle: {
    color: '#2F213E',
    fontSize: 17,
    fontWeight: '900',
  },
  reportText: {
    maxWidth: 230,
    marginTop: 9,
    color: '#745716',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
