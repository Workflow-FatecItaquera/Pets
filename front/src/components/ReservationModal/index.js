import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import style from './style';

export default function ReservationModal({ visible, onClose, selectedDate }) {
  const [form, setForm] = useState({
    date: selectedDate,
    time: '',
    packageType: 'Avulso',
    services: [],
    notes: '',
  });

  const handleSave = () => {
    // Aqui seria chamada a Action/API para ReservationController.insertOne
    console.log("Salvando Agendamento:", form);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={style.modalOverlay}>
        <View style={style.modalContainer}>
          
          <View style={style.header}>
            <View>
              <Text style={style.title}>Novo Agendamento</Text>
              <Text style={style.subtitle}>Preencha os dados do serviço abaixo</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={style.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Seleção de Pet & Tutor (Mock visual) */}
            <Text style={style.sectionLabel}>PET & TUTOR</Text>
            <TouchableOpacity style={style.inputBox}>
              <Text style={{ color: COLORS.inactive }}>Selecionar Pet...</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={style.row}>
              <View style={style.halfInput}>
                <Text style={style.sectionLabel}>DATA</Text>
                <View style={style.inputBox}>
                  <Text>{form.date}</Text>
                </View>
              </View>
              <View style={style.halfInput}>
                <Text style={style.sectionLabel}>HORA</Text>
                <TextInput 
                  style={style.inputBox}
                  placeholder="00:00"
                  value={form.time}
                  onChangeText={(text) => setForm({...form, time: text})}
                />
              </View>
            </View>

            {/* Tipo de Pacote */}
            <Text style={style.sectionLabel}>TIPO DE PACOTE</Text>
            <View style={style.packageRow}>
              <TouchableOpacity 
                style={[style.packageBtn, form.packageType === 'Avulso' && style.packageBtnActive]}
                onPress={() => setForm({...form, packageType: 'Avulso'})}
              >
                <Text style={form.packageType === 'Avulso' ? style.packageTextActive : style.packageText}>Avulso</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[style.packageBtn, form.packageType === 'Recorrente' && style.packageBtnActive]}
                onPress={() => setForm({...form, packageType: 'Recorrente'})}
              >
                <Text style={form.packageType === 'Recorrente' ? style.packageTextActive : style.packageText}>Recorrente</Text>
              </TouchableOpacity>
            </View>

            {/* Checklist de Serviços */}
            <Text style={style.sectionLabel}>SERVIÇOS (CHECKLIST)</Text>
            <TouchableOpacity style={style.serviceCheck}>
              <MaterialCommunityIcons name="checkbox-marked" size={24} color={COLORS.primary} />
              <Text style={style.serviceText}>Banho Premium</Text>
              <MaterialCommunityIcons name="shower" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={style.serviceCheck}>
              <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color={COLORS.inactive} />
              <Text style={style.serviceText}>Tosa Higiênica</Text>
              <MaterialCommunityIcons name="content-cut" size={20} color={COLORS.secondary} />
            </TouchableOpacity>

            {/* Valor Total */}
            <View style={style.totalBox}>
              <MaterialCommunityIcons name="cash" size={24} color={COLORS.secondary} />
              <Text style={style.totalLabel}>Valor Total</Text>
              <Text style={style.totalValue}>R$ 85,00</Text>
            </View>

            {/* Observações */}
            <Text style={style.sectionLabel}>OBSERVAÇÕES</Text>
            <TextInput 
              style={[style.inputBox, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Alergias, comportamento ou preferências..."
              multiline
              value={form.notes}
              onChangeText={(text) => setForm({...form, notes: text})}
            />

            <TouchableOpacity style={style.saveBtn} onPress={handleSave}>
              <Text style={style.saveBtnText}>Salvar Agendamento</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}