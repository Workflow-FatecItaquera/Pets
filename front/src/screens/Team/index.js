import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
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
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
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

  const handleOpenDetails = (pet) => {
    setSelectedPet(pet);
    setDetailModalVisible(true);
  };

  const renderPetCard = ({ item }) => (
    <TouchableOpacity style={style.cardContainer} onPress={() => handleOpenDetails(item)}>
      {item.photo ? (
        <Image 
          source={{ uri: item.photo }} 
          style={style.avatar} 
        />
      ) : (
        <View style={[style.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E6FF' }]}>
          <Feather name="user" size={28} color={COLORS.primary} />
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, minHeight: '50%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>Detalhes do Pet</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={26} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedPet && (
              <View style={{ gap: 12 }}>
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                  {selectedPet.photo ? (
                    <Image source={{ uri: selectedPet.photo }} style={{ width: 90, height: 90, borderRadius: 45 }} />
                  ) : (
                    <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0E6FF', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="user" size={40} color={COLORS.primary} />
                    </View>
                  )}
                </View>

                <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Nome:</Text> {selectedPet.name}</Text>
                <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {selectedPet.type}</Text>
                <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Raça:</Text> {selectedPet.breed || 'Não informada'}</Text>
                <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Porte:</Text> {selectedPet.size || 'Não informado'}</Text>
                
                <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 }} />
                
                <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Tutor:</Text> {selectedPet.tutor?.name || 'Não informado'}</Text>
                {selectedPet.tutor?.phone && (
                  <Text style={{ fontSize: 16, color: '#666' }}><Text style={{ fontWeight: 'bold' }}>Telefone do Tutor:</Text> {selectedPet.tutor.phone}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}