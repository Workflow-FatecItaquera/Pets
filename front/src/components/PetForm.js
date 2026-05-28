import React, { useState } from 'react';
import { Image, View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const formatPhone = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  
  if (!match) return value;
  
  let formatted = '';
  if (match[1]) formatted += `(${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  
  return formatted;
};

export default function PetForm({ visible, onClose, apiUrl, onSaveSuccess, mode = 'quick' }) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    petName: '', type: 'Cachorro', breed: '', size: 'M',
    tutorName: '', phone: '',
    temperament: 'Dócil',
    allergies: '', notes: '', photo: null
  });

  const isQuickMode = mode === 'quick';

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

  const handlePhoneChange = (text) => {
    setForm({ ...form, phone: formatPhone(text) });
  };

  const handleSave = async () => {
    if (!form.petName.trim() || !form.tutorName.trim()) {
      return Alert.alert('Atenção', 'Nome do Pet e do Tutor são obrigatórios.');
    }

    if (form.phone.length > 0 && form.phone.length < 14) {
      return Alert.alert('Atenção', 'Por favor, insira um número de telefone válido.');
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

      const responseData = await response.json();
      const novoPet = responseData.pet || responseData; 
      
      Alert.alert('Sucesso', 'Pet e Tutor cadastrados com sucesso!');
      setForm({ petName: '', type: 'Cachorro', breed: '', size: 'M', tutorName: '', phone: '', temperament: 'Dócil', allergies: '', notes: '', photo: null });

      onSaveSuccess(novoPet);
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. ' + error.message);
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
              <Text style={styles.title}>{isQuickMode ? 'Cadastro Rápido' : 'Cadastro Completo'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {!isQuickMode && (
              <View style={styles.fieldContainer}>
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
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>TIPO DE PET</Text>
              <View style={styles.toggleRow}>
                {['Cachorro', 'Gato'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, form.type === t && styles.toggleBtnActive]}
                    onPress={() => setForm({ ...form, type: t })}
                  >
                    <View style={styles.toggleContent}>
                      <MaterialCommunityIcons name={t === 'Gato' ? "cat" : "dog"} size={20} color={form.type === t ? COLORS.primary : COLORS.inactive} />
                      <Text style={[styles.toggleText, { color: form.type === t ? COLORS.primary : COLORS.inactive }]}>{t}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>NOME DO PET</Text>
              <TextInput 
                style={styles.input} 
                value={form.petName} 
                maxLength={40}
                placeholder="Ex: Bob"
                onChangeText={t => setForm({...form, petName: t})} 
              />
            </View>

            <View style={[styles.row, styles.fieldContainer]}>
              <View style={{ flex: 1.2, marginRight: 12 }}>
                <Text style={styles.label}>RAÇA</Text>
                <TextInput 
                  style={styles.input} 
                  value={form.breed} 
                  maxLength={40}
                  placeholder="Ex: Poodle"
                  onChangeText={t => setForm({...form, breed: t})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>TAMANHO / PORTE</Text>
                <View style={styles.sizeRowContainer}>
                  {['P', 'M', 'G', 'GG'].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sizeBtn, form.size === s && styles.sizeBtnActive]}
                      onPress={() => setForm({ ...form, size: s })}
                    >
                      <Text style={form.size === s ? styles.sizeTextActive : styles.sizeTextInactive}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {!isQuickMode && (
              <>
                <View style={styles.fieldContainer}>
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
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>ALERGIAS E RESTRIÇÕES MÉDICAS</Text>
                  <TextInput 
                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]} 
                    placeholder="Ex: Alergia a perfumes fortes..."
                    multiline 
                    maxLength={150}
                    value={form.allergies} 
                    onChangeText={t => setForm({...form, allergies: t})} 
                  />
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>NOME DO TUTOR</Text>
              <TextInput 
                style={styles.input} 
                value={form.tutorName} 
                maxLength={60}
                placeholder="Ex: Maria Oliveira"
                onChangeText={t => setForm({...form, tutorName: t})} 
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>TELEFONE / WHATSAPP</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="phone-pad" 
                value={form.phone} 
                maxLength={15}
                onChangeText={handlePhoneChange}
                placeholder="(11) 99999-9999"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>NOTAS E OBSERVAÇÕES DO PET</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Tipo de tesoura, estilo de tosa, pelo embaraça fácilmente, etc..."
                multiline 
                maxLength={300}
                value={form.notes} 
                onChangeText={t => setForm({...form, notes: t})} 
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.saveBtnText}>
                    {isQuickMode ? 'Salvar e Selecionar' : 'Salvar'}
                  </Text>
                  {isQuickMode && (
                    <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                  )}
                </View>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '95%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  closeBtn: { padding: 4, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border }, 

  fieldContainer: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  
  petPhoto: { width: '100%', height: 250, borderRadius: 16 },
  photoUpload: { backgroundColor: '#F8F9FA', height: 250, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  photoText: { marginTop: 8, color: COLORS.primary, fontWeight: '600' },

  input: { backgroundColor: '#F4F5F7', borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#E5E7EB' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  toggleRow: { flexDirection: 'row', backgroundColor: '#F4F5F7', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.white, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  toggleContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleText: { fontWeight: 'bold', fontSize: 15 },
  
  sizeRowContainer: { flexDirection: 'row', backgroundColor: '#F4F5F7', borderRadius: 12, padding: 4, height: 52, borderWidth: 1, borderColor: '#E5E7EB' },
  sizeBtn: { flex: 1, height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sizeBtnActive: { backgroundColor: COLORS.white, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  sizeTextActive: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  sizeTextInactive: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 14 },
  
  rowTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  tagBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  
  textActive: { color: COLORS.white, fontWeight: 'bold' },
  textInactive: { color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 24 },

  saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20, justifyContent: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});