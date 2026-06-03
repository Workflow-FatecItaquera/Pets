import React, { useState, useContext } from 'react';
import { Image, View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AuthContext } from '../contexts/AuthContext';

export default function PetFormModal({ visible, onClose, apiUrl, onSaveSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const { userData } = useContext(AuthContext);
  const [form, setForm] = useState({
    petName: '', type: 'Cachorro', breed: '', size: 'M',
    tutorName: '', phone: '',
    temperament: 'Dócil',
    allergies: '', notes: '', photo: null, userId: userData ? userData._id : null
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      setForm({ ...form, photo: base64 });
    }
  };

  const handleSave = async () => {
    if (!form.petName.trim() || !form.tutorName.trim()) {
      return Alert.alert('Atenção', 'Nome do Pet e do Tutor são obrigatórios.');
    }

    try {
      setIsSaving(true);
      
      const response = await fetch(`${apiUrl}/pets/quick-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok){ 
        throw new Error(`Status ${response.status} - ${JSON.stringify(response)}`);
      }
      
      Alert.alert('Sucesso', 'Pet e Tutor cadastrados com sucesso!');
      
      setForm({ petName: '', type: 'Cachorro', breed: '', size: 'M', tutorName: '', phone: '', temperament: 'Dócil', allergies: '', notes: '', photo: null, userId: userData ? userData._id : null });
      onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro.' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Cadastro Rápido</Text>
              <Text style={styles.subtitle}>Ficha do Pet e Tutor</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
              {form.photo ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${form.photo}` }}
                  style={styles.petPhoto}
                />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.primary} />
                  <Text style={styles.photoText}>Adicionar Foto do Pet</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>TIPO E PORTE</Text>
            <View style={styles.row}>
              <View style={[styles.toggleRow, { flex: 1, marginRight: 10 }]}>
                {['Cachorro', 'Gato'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, form.type === t && styles.toggleBtnActive]}
                    onPress={() => setForm({ ...form, type: t })}
                  >
                    <MaterialCommunityIcons name={t === 'Gato' ? "cat" : "dog"} size={20} color={form.type === t ? COLORS.primary : COLORS.inactive} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.sizeRow, { flex: 1 }]}>
                {['P', 'M', 'G', 'GG'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeBtn, form.size === s && styles.sizeBtnActive]}
                    onPress={() => setForm({ ...form, size: s })}
                  >
                    <Text style={form.size === s ? styles.textActive : styles.textInactive}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>NOME DO PET</Text>

            <TextInput style={styles.input} value={form.petName} onChangeText={t => setForm({...form, petName: t})} />

            <Text style={styles.label}>RAÇA</Text>
            <TextInput style={styles.input} value={form.breed} onChangeText={t => setForm({...form, breed: t})} />

            <Text style={styles.label}>COMPORTAMENTO / TEMPERAMENTO</Text>
            <View style={styles.rowTags}>
              {['Dócil', 'Agitado', 'Medroso', 'Agressivo'].map(temp => (
                <TouchableOpacity
                  key={temp}
                  style={[styles.tagBtn, form.temperament === temp && styles.tagBtnActive]}
                  onPress={() => setForm({ ...form, temperament: temp })}
                >
                  <Text style={form.temperament === temp ? styles.textActive : styles.textInactive}>{temp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>ALERGIAS E RESTRIÇÕES MÉDICAS</Text>
            <TextInput 
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]} 
              placeholder="Ex: Alergia a perfumes fortes, produtos tóxicos..."
              multiline 
              value={form.allergies} 
              onChangeText={t => setForm({...form, allergies: t})} 
            />

            <View style={styles.divider} />

            <Text style={styles.label}>NOME DO TUTOR</Text>
            <TextInput style={styles.input} value={form.tutorName} onChangeText={t => setForm({...form, tutorName: t})} />

            <Text style={styles.label}>WHATSAPP / TELEFONE</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" value={form.phone} onChangeText={t => setForm({...form, phone: t})} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Cadastrar Pet e Tutor</Text>}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.inactive },
  closeBtn: { padding: 5 }, petPhoto: {
  width: 380,
  height: 380,
  borderRadius: 16,
},
  
  photoUpload: { backgroundColor: '#F8F9FA', height: 400, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginBottom: 20 },
  photoText: { marginTop: 8, color: COLORS.primary, fontWeight: '600' },

  label: { fontSize: 12, fontWeight: 'bold', color: COLORS.inactive, marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 16, color: COLORS.text, backgroundColor: '#FAFAFA' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#F0F4F8', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: COLORS.white, elevation: 1 },
  
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sizeBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  sizeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  
  rowTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  tagBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  
  textActive: { color: COLORS.white, fontWeight: 'bold' },
  textInactive: { color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },

  saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});