import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URI } from '@env';

import { COLORS } from '../../styles/theme';
import style from './style';

const API_URL = BACKEND_URI;
const SHOW_MOCK_MEMBERS = true;

const MOCK_MEMBERS = [

];

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

function TeamMemberCard({ member }) {
  const roleLabel = member.isAdmin ? 'Administrador' : 'Colaborador';

  return (
    <View style={style.memberCard}>
      <View style={style.memberHeader}>
        <View>
          <View style={style.avatarFallback}>
            <Text style={style.avatarInitials}>{getInitials(member.name)}</Text>
          </View>
          <View style={style.onlineDot} />
        </View>

        <View style={[style.statusBadge, member.isActive === false && style.statusBadgeInactive]}>
          <Text style={[style.statusText, member.isActive === false && style.statusTextInactive]}>
            {member.isActive === false ? 'INATIVO' : 'ATIVO'}
          </Text>
        </View>
      </View>

      <Text numberOfLines={1} style={style.memberName}>{member.name}</Text>
      <Text numberOfLines={1} style={style.memberRole}>{roleLabel}</Text>

      <View style={style.memberFooter}>
        <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
        <Text numberOfLines={1} style={style.memberEmail}>{member.email}</Text>
        <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
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
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchMembers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Falha ao buscar equipe');

      const data = await response.json();
      setMembers(SHOW_MOCK_MEMBERS ? [...MOCK_MEMBERS, ...(data || [])] : (data || []));
    } catch (error) {
      if (SHOW_MOCK_MEMBERS) {
        setMembers(MOCK_MEMBERS);
      }
      Alert.alert('Erro', 'Nao foi possivel carregar os membros da equipe.');
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

  const handleCreateMember = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return Alert.alert('Atencao', 'Nome, email e senha provisoria sao obrigatorios.');
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao cadastrar membro');
      }

      setForm(INITIAL_FORM);
      await fetchMembers(false);
      Alert.alert('Sucesso', 'Membro cadastrado no backend com sucesso.');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Nao foi possivel cadastrar o membro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={style.container}
      contentContainerStyle={style.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      <Text style={style.eyebrow}>ADMINISTRACAO</Text>
      <Text style={style.pageTitle}>Gerenciamento de Equipe</Text>
      <Text style={style.subtitle}>
        Gerencie permissoes, adicione novos membros e monitore o status dos colaboradores da unidade.
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
          <TeamMemberCard key={member._id || member.email} member={member} />
        ))
      )}

      <View style={style.formCard}>
        <Text style={style.formTitle}>Adicionar Novo Funcionario</Text>

        <Text style={style.inputLabel}>NOME COMPLETO</Text>
        <TextInput
          style={style.input}
          placeholder="Ex: Maria Silva"
          placeholderTextColor="#9F98A7"
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
        />

        <Text style={style.inputLabel}>EMAIL PROFISSIONAL</Text>
        <TextInput
          style={style.input}
          placeholder="maria@peloselambeijos.com"
          placeholderTextColor="#9F98A7"
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={style.inputLabel}>SENHA PROVISORIA</Text>
        <TextInput
          style={style.input}
          placeholder="********"
          placeholderTextColor="#9F98A7"
          value={form.password}
          onChangeText={(password) => setForm({ ...form, password })}
          secureTextEntry
        />

        <TouchableOpacity
          activeOpacity={0.86}
          style={[style.submitButton, saving && style.submitButtonDisabled]}
          onPress={handleCreateMember}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="person-add" size={18} color={COLORS.white} />
              <Text style={style.submitButtonText}>Cadastrar Membro</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={style.floatingButton}>
        <Ionicons name="person-add" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}