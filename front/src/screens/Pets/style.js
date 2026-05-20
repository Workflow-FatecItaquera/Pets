import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../styles/theme";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginHorizontal: SIZES.padding, marginBottom: 15 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text },
  
  listContainer: { paddingHorizontal: SIZES.padding, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: COLORS.inactive, marginTop: 40, fontSize: 16 },
  
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.border, marginRight: 15 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  petName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginRight: 8 },
  tutorName: { fontSize: 14, color: COLORS.inactive, marginBottom: 8 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#F0F4F8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  tagText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  
  fab: { position: 'absolute', bottom: 30, right: SIZES.padding, backgroundColor: COLORS.secondary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
});