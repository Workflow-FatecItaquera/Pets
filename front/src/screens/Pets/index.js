import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PetFormModal from '../../components/PetFormModal';
import { COLORS } from '../../styles/theme';
import style from './style';
import { BACKEND_URI } from '@env';

const API_URL = BACKEND_URI;

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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

  const renderPetCard = ({ item }) => (
    <TouchableOpacity style={style.cardContainer}>
      <Image 
        source={{ uri: item.photo || 'https://via.placeholder.com/60' }} 
        style={style.avatar} 
      />
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
          <View style={style.tag}><Text style={style.tagText}>Porte {item.size}</Text></View>
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
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={style.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={renderPetCard}
          ListEmptyComponent={<Text style={style.emptyText}>Nenhum pet encontrado.</Text>}
        />
      )}

      <TouchableOpacity style={style.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <PetFormModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        apiUrl={API_URL}
        onSaveSuccess={() => fetchPets(search)}
      />
    </View>
  );
}