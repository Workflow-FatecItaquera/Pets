import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS } from '../styles/theme';

export default function PetDropdown({
  form,
  setForm,
  showPetDropdown,
  setShowPetDropdown,
  searchText,
  setSearchText,
  isFetchingPets,
  setQuickModalVisible,
  pets,
  apiUrl
}) {
  return (
    <View>
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setShowPetDropdown(!showPetDropdown)}
      >
        <View style={styles.triggerContent}>
          {form.pet && (
            <View style={styles.triggerAvatarCircle}>
              {(form.pet.photo || form.pet.hasPhoto) ? (
                <Image
                  source={{ uri: `${apiUrl}/pets/${form.pet._id}/photo` }}
                  style={styles.triggerAvatarImage}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="none"
                />
              ) : (
                <MaterialCommunityIcons 
                  name={form.pet.type === 'Gato' ? "cat" : "dog"} 
                  size={14} 
                  color={COLORS.primary} 
                />
              )}
            </View>
          )}
          <Text 
            style={{ 
              color: form.pet ? COLORS.text : COLORS.inactive, 
              fontWeight: form.pet ? '600' : 'normal',
              flexShrink: 1 
            }}
          >
            {form.pet ? `${form.pet.name} (${form.pet.tutor?.name || 'Sem tutor'})` : 'Selecionar Pet...'}
          </Text>
        </View>

        <MaterialCommunityIcons 
          name={showPetDropdown ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>

      {showPetDropdown && (
        <View style={styles.dropdownContainer}>
          <View style={styles.searchBarContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.inactive} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Buscar por nome do Pet ou Tutor..."
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
            />
            {isFetchingPets && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          <TouchableOpacity style={styles.quickAddBtn} onPress={() => setQuickModalVisible(true)}>
            <MaterialCommunityIcons name="plus" style={styles.quickAddBtnIcon} />
            <Text style={styles.quickAddBtnText}>Adicionar Novo Pet</Text>
          </TouchableOpacity>

          <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
            {pets.length === 0 && !isFetchingPets ? (
              <Text style={styles.emptyResultsText}>Nenhum pet ou tutor encontrado</Text>
            ) : (
              pets.map(item => {
                const isSelected = form.pet?._id === item._id;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      setForm({ ...form, pet: item });
                      setShowPetDropdown(false);
                    }}
                  >
                    <View style={styles.petAvatarCircle}>
                      {(item.photo || item.hasPhoto) ? (
                        <Image
                          source={{ uri: `${apiUrl}/pets/${item._id}/photo` }}
                          style={styles.petAvatarImage}
                          contentFit="cover"
                          transition={150}
                          cachePolicy="none"
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={item.type === 'Gato' ? "cat" : "dog"} 
                          size={16} 
                          color={COLORS.primary} 
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemPetName}>
                        {item.name} {item.breed ? `• ${item.breed}` : ''}
                      </Text>
                      <Text style={styles.itemTutorName}>{item.tutor?.name || 'Tutor não especificado'}</Text>
                    </View>
                    {isSelected && <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.dropdownFooter}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.dropdownFooterText}>VER TODOS OS REGISTROS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  triggerAvatarCircle: {
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#FAF7FC', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8, 
    overflow: 'hidden'
  },
  triggerAvatarImage: {
    width: 24, 
    height: 24, 
    borderRadius: 12 
  },
  dropdownContainer: { 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 16, 
    marginTop: 8, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4 
  },
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.border, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    height: 44, 
    marginBottom: 8 
  },
  searchTextInput: { 
    flex: 1, 
    fontSize: 14, 
    color: COLORS.text, 
    paddingVertical: 0 
  },
  quickAddBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f4edf8', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 12, 
    justifyContent: 'center', 
    gap: 6
  },
  quickAddBtnIcon: { 
    color: COLORS.primary, 
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    borderRadius: 16
  },
  quickAddBtnText: { 
    color: COLORS.primary, 
    fontSize: 14, 
    fontWeight: '700' 
  },
  dropdownItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 4, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2EFF5' 
  },
  dropdownItemActive: { 
    backgroundColor: '#f4edf8', 
    borderRadius: 8, 
    paddingHorizontal: 8 
  },
  petAvatarCircle: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#FAF7FC', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12, 
    overflow: 'hidden' 
  },
  petAvatarImage: { 
    width: 32, 
    height: 32, 
    borderRadius: 16 
  },
  itemPetName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  itemTutorName: { 
    fontSize: 12, 
    color: COLORS.inactive, 
    marginTop: 2 
  },
  emptyResultsText: { 
    textAlign: 'center', 
    paddingVertical: 20, 
    color: COLORS.inactive, 
    fontSize: 14 
  },
  dropdownFooter: { 
    borderTopWidth: 1, 
    borderTopColor: '#F2EFF5', 
    paddingTop: 12, 
    marginTop: 4, 
    alignItems: 'center' 
  },
  dropdownFooterText: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: COLORS.inactive, 
    letterSpacing: 0.5 
  },
});