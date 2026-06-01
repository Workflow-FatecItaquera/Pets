import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URI } from '@env';

import { COLORS } from '../../styles/theme';
import style from './style';

const API_URL = BACKEND_URI;

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PL';
}

function TeamMemberCard({ member, onPressMenu }) {
  const roleLabel = member.isAdmin ? 'Administrador' : 'Colaborador';
  const isInactive = member.isActive === false;

  return (
    <View style={style.memberCard}>
      <View style={style.memberHeader}>
        <View style={style.avatarWrapper}>
          {member.picture ? (
            <Image source={{ uri: member.picture }} style={style.avatar} />
          ) : (
            <View style={style.avatarFallback}>
              <Text style={style.avatarInitials}>{getInitials(member.name)}</Text>
            </View>
          )}
          <View style={[style.onlineDot, isInactive && { backgroundColor: '#999' }]} />
        </View>

        <View style={[style.statusBadge, isInactive && style.statusBadgeInactive]}>
          <Text style={[style.statusText, isInactive && style.statusTextInactive]}>
            {isInactive ? 'INATIVO' : 'ATIVO'}
          </Text>
        </View>
      </View>

      <Text numberOfLines={1} style={style.memberName}>{member.name}</Text>
      <Text numberOfLines={1} style={style.memberRole}>{roleLabel}</Text>

      <View style={style.memberFooter}>
        <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
        <Text numberOfLines={1} style={style.memberEmail}>{member.email}</Text>
        
        <TouchableOpacity 
          onPress={() => onPressMenu(member)} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // States dos Modais
  const [form, setForm] = useState(INITIAL_FORM);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState(null); // Membro clicado para opções
  const [editingMember, setEditingMember] = useState(null); // Membro sendo editado

  const fetchMembers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Falha ao buscar equipe');

      const data = await response.json();
      setMembers(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os membros da equipe.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.isActive !== false);
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (filter === 'active') return activeMembers;
    if (filter === 'inactive') return members.filter((member) => member.isActive === false);
    return members;
  }, [activeMembers, filter, members]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMembers(false);
  };

  // Abre Modal de Opções do Card (3 pontinhos)
  const handleOpenControlOptions = (member) => {
    setSelectedMember(member);
    setOptionsModalVisible(true);
  };

  // Botão "Editar" dentro do modal de Opções
  const handleOpenEditModal = () => {
    setOptionsModalVisible(false); // Fecha o modal de opções
    setEditingMember(selectedMember); // Define quem vai ser editado
    setForm({
      name: selectedMember.name,
      email: selectedMember.email,
      password: '', // Senha em branco (não será editada)
    });
    setTimeout(() => setFormModalVisible(true), 300); // Abre o formulário após a animação
  };

  // Botão "Ativar/Desativar" dentro do modal de Opções
  const handleToggleStatus = async () => {
    setOptionsModalVisible(false);
    try {
      setLoading(true);
      const targetId = selectedMember._id || selectedMember.id;
      
      const response = await fetch(`${API_URL}/users/active`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId }),
      });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Falha ao alterar status do colaborador');
          }

          await fetchMembers(false);
        } catch (error) {
          Alert.alert('Erro', error.message || 'Não foi possível alterar o status.');
        } finally {
          setLoading(false);
        }
      };

  // Cria (POST) ou Atualiza (PUT) o Colaborador
  const handleSaveMember = async () => {
    const isEditing = !!editingMember;

    if (!form.name.trim() || !form.email.trim()) {
      return Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.');
    }
    
    // Valida senha APENAS se for novo cadastro
    if (!isEditing && !form.password.trim()) {
      return Alert.alert('Atenção', 'A senha provisória é obrigatória para novos cadastros.');
    }

    try {
      setSaving(true);
      const method = isEditing ? 'PUT' : 'POST';

      const bodyData = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
      };

      if (isEditing) {
        // Envia o _id junto no body conforme seu UserController espera no update
        bodyData._id = editingMember._id || editingMember.id;
      } else {
        bodyData.password = form.password;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao salvar informações.');
      }

      setForm(INITIAL_FORM);
      setEditingMember(null);
      setFormModalVisible(false);
      setShowPassword(false);
      await fetchMembers(false);
      Alert.alert('Sucesso', `Membro ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={style.container}
        contentContainerStyle={style.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        <Text style={style.eyebrow}>ADMINISTRAÇÃO</Text>
        <Text style={style.pageTitle}>Gerenciamento de Equipe</Text>
        <Text style={style.subtitle}>
          Gerencie permissões, adicione novos membros e monitore o status dos colaboradores da unidade.
        </Text>

        <View style={style.summaryCard}>
          <View style={style.summaryIcon}>
            <Ionicons name="people-outline" size={24} color="#9B6800" />
          </View>
          <View>
            <Text style={style.summaryLabel}>MEMBROS DA EQUIPE</Text>
            <Text style={style.summaryValue}>{activeMembers.length} colaboradores</Text>
          </View>
        </View>

        <View style={style.filterBar}>
          {[
            { id: 'all', label: 'TODOS' },
            { id: 'active', label: 'ATIVOS' },
            { id: 'inactive', label: 'INATIVOS' },
          ].map((item) => {
            const isSelected = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[style.filterButton, isSelected && style.filterButtonActive]}
                onPress={() => setFilter(item.id)}
              >
                <Text style={[style.filterText, isSelected && style.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={style.loader} />
        ) : filteredMembers.length === 0 ? (
          <View style={style.emptyCard}>
            <Ionicons name="person-add-outline" size={24} color={COLORS.primary} />
            <Text style={style.emptyText}>Nenhum membro encontrado.</Text>
          </View>
        ) : (
          filteredMembers.map((member) => (
            <TeamMemberCard 
              key={member._id || member.email} 
              member={member} 
              onPressMenu={handleOpenControlOptions} 
            />
          ))
        )}
      </ScrollView>

      {/* Botão Flutuante (Novo Cadastro) */}
      <TouchableOpacity 
        activeOpacity={0.85} 
        style={style.floatingButton}
        onPress={() => {
          setEditingMember(null);
          setForm(INITIAL_FORM);
          setFormModalVisible(true);
        }}
      >
        <Ionicons name="person-add" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal 1: FORMULÁRIO (Adicionar / Editar) */}
      <Modal
        visible={formModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => { setFormModalVisible(false); setEditingMember(null); }}
      >
        <View style={style.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={style.modalContainer}>
            <View style={style.modalHeader}>
              <Text style={style.formTitle}>
                {editingMember ? 'Editar Colaborador' : 'Adicionar Novo'}
              </Text>
              <TouchableOpacity 
                onPress={() => { setFormModalVisible(false); setEditingMember(null); setForm(INITIAL_FORM); setShowPassword(false); }}
                style={style.closeModalButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={style.inputLabel}>NOME COMPLETO</Text>
            <TextInput
              style={style.input}
              placeholder="Ex: Maria Silva"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
            />

            <Text style={style.inputLabel}>EMAIL PROFISSIONAL</Text>
            <TextInput
              style={style.input}
              placeholder="maria@email.com"
              value={form.email}
              onChangeText={(email) => setForm({ ...form, email })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* A SENHA SÓ APARECE SE NÃO ESTIVER EDITANDO (NOVO CADASTRO) */}
            {!editingMember && (
              <>
                <Text style={style.inputLabel}>SENHA PROVISÓRIA</Text>
                <View style={style.passwordContainer}>
                  <TextInput
                    style={style.passwordInput}
                    placeholder="********"
                    value={form.password}
                    onChangeText={(password) => setForm({ ...form, password })}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={style.eyeButton}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6E637A" />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              activeOpacity={0.86}
              style={[style.submitButton, saving && style.submitButtonDisabled]}
              onPress={handleSaveMember}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name={editingMember ? "save" : "person-add"} size={18} color={COLORS.white} />
                  <Text style={style.submitButtonText}>
                    {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal 2: OPÇÕES DO COLABORADOR */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity style={style.optionsModalOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <View style={style.optionsModalContainer}>
            
            {/* Header com as iniciais para contexto */}
            <View style={style.optionsModalHeader}>
               <View style={[style.avatarFallback, { width: 40, height: 40, marginRight: 10 }]}>
                 <Text style={[style.avatarInitials, { fontSize: 14 }]}>
                    {selectedMember ? getInitials(selectedMember.name) : ''}
                 </Text>
               </View>
               <View>
                 <Text style={style.optionsModalTitle} numberOfLines={1}>{selectedMember?.name}</Text>
                 <Text style={style.optionsModalSubtitle}>Escolha uma ação</Text>
               </View>
            </View>

            <TouchableOpacity style={style.optionButton} onPress={handleOpenEditModal}>
              <View style={style.optionIconCircle}>
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
              </View>
              <Text style={style.optionButtonText}>Editar Dados Pessoais</Text>
              <Ionicons name="chevron-forward" size={18} color="#C4C4C4" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <View style={style.optionSeparator} />

            <TouchableOpacity style={style.optionButton} onPress={handleToggleStatus}>
              <View style={[style.optionIconCircle, { backgroundColor: selectedMember?.isActive === false ? '#E6F4EA' : '#FCE8E8' }]}>
                <Ionicons 
                  name={selectedMember?.isActive === false ? "checkmark-circle" : "power"} 
                  size={20} 
                  color={selectedMember?.isActive === false ? "#137333" : "#C5221F"} 
                />
              </View>
              <Text style={[style.optionButtonText, { color: selectedMember?.isActive === false ? "#137333" : "#C5221F" }]}>
                {selectedMember?.isActive === false ? 'Reativar Colaborador' : 'Desativar Colaborador'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={style.cancelOptionButton} onPress={() => setOptionsModalVisible(false)}>
              <Text style={style.cancelOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}