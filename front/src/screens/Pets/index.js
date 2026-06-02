import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import PetForm from '../../components/PetForm';
import PetDetalhes from '../../components/PetDetalhes';
import { COLORS } from '../../styles/theme';
import style from './style';
import { BACKEND_URI } from '@env';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = BACKEND_URI;

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Estados para modais
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [detalhesVisible, setDetalhesVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchPets = async (query = '') => {
    try {
      setLoading(true);
      const urlCompleta = `${API_URL}/pets/search?q=${encodeURIComponent(query)}`;
      
      console.log(`[Fetch Pets] Disparando requisição para: "${urlCompleta}"`);
      const response = await fetch(urlCompleta);
      console.log(`[Fetch Pets] Resposta recebida. Status HTTP: ${response.status}`);

      if (!response.ok) {
        const textoDeErro = await response.text();
        console.error(`[Fetch Pets Erro] O servidor retornou um erro não-200. Conteúdo bruto:\n`, textoDeErro);
        throw new Error('Falha ao buscar pets');
      }

      const data = await response.json();
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a lista de pets.');
      console.error('[Fetch Pets Catch]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
      fetchPets(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Função para abrir os detalhes do pet
  const handleOpenDetails = (pet) => {
    setSelectedPet(pet);
    setDetalhesVisible(true);
  };

  const renderPetCard = ({ item }) => (
    <TouchableOpacity 
      style={style.cardContainer}
      onPress={() => handleOpenDetails(item)} 
    >
      {item.photo ? (
        <Image 
          source={{ uri: `${API_URL}/pets/${item._id}/photo` }} 
          style={style.avatar} 
          transition={150}
          cachePolicy="disk"
        />
      ) : (
        <View style={[style.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E6FF' }]}>
          <MaterialCommunityIcons 
            name={item.type === 'Gato' ? 'cat' : 'dog'} 
            size={28} 
            color={COLORS.primary} 
          />
        </View>
      )}

      <View style={style.cardContent}>
        <View style={style.cardHeader}>
          <Text style={style.petName}>{item.name}</Text>
          <MaterialCommunityIcons 
            name={item.type === 'Gato' ? 'cat' : 'dog'} 
            size={18} 
            color={COLORS.primary} 
          />
        </View>
        <Text style={style.tutorName}>Tutor: {item.tutor?.name || 'Não informado'}</Text>
        <View style={style.tagsRow}>
          {item.breed && (
            <View style={style.tag}><Text style={style.tagText}>{item.breed}</Text></View>
          )}
          <View style={style.tag}><Text style={style.tagText}>Porte {item.size || 'N/A'}</Text></View>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.inactive} />
    </TouchableOpacity>
  );

  return (
    <View style={style.container}>
      <Text style={style.pageTitle}>Meus Pets</Text>

      <View style={style.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={COLORS.inactive} style={style.searchIcon} />
        <TextInput
          style={style.searchInput}
          placeholder="Buscar pet ou tutor..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.inactive}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={style.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={renderPetCard}
          refreshing={loading}
          onRefresh={() => fetchPets(search)}
          ListEmptyComponent={<Text style={style.emptyText}>Nenhum pet encontrado.</Text>}
        />
      )}

      <TouchableOpacity style={style.fab} onPress={() => setModalFormVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <PetForm 
        visible={modalFormVisible} 
        onClose={() => setModalFormVisible(false)} 
        apiUrl={API_URL}
        onSaveSuccess={() => fetchPets(search)}
        mode="full"
      />

      <PetDetalhes
        visible={detalhesVisible}
        petData={selectedPet}
        petId={selectedPet?._id}
        onClose={() => {
          setDetalhesVisible(false);
          setSelectedPet(null);
        }}
        onUpdate={(updatedPet) => {
          fetchPets(search);
          setSelectedPet(updatedPet);
        }}
        onDelete={() => {
          setDetalhesVisible(false);
          setSelectedPet(null);
          fetchPets(search);
        }}
      />
    </View>
  );
}