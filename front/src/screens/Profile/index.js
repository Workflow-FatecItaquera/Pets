import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import style, { colors } from './style';

export default function Profile() {
    const [userData, setUserData] = useState({
        name: 'Letícia Mariana',
        admin: true,
        roleLabel: 'ADMINISTRADORA',
        email: 'mariana@peloselambeijos.com.br',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    });

    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = userData.admin === true;

    const getBadgeConfig = () => {
        if (isAdmin) {
            return {
                icon: isEditing ? "pencil" : "shield-checkmark",
                color: isEditing ? colors.white : colors.primary,
                style: isEditing ? style.badgeEmployee : style.badgeAdmin,
                canClick: isEditing
            };
        }
        return {
            icon: "pencil",
            color: colors.white,
            style: style.badgeEmployee,
            canClick: true
        };
    };

    const badge = getBadgeConfig();

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert("Sucesso", "Perfil atualizado!");
    };

    return (
        <ScrollView style={style.container} contentContainerStyle={style.scrollContent}>
            <Text style={style.headerTitle}>Perfil</Text>

            <View style={style.userSection}>
                <View style={style.avatarContainer}>
                    <TouchableOpacity
                        disabled={!badge.canClick}
                        onPress={() => Alert.alert("Upload", "Selecionar nova foto")}
                    >
                        <Image source={{ uri: userData.avatar }} style={style.avatar} />

                        <View style={[style.badge, badge.style]}>
                            <Ionicons name={badge.icon} size={12} color={badge.color} />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={style.userName}>{userData.name}</Text>
                <View style={[style.rolePill, isAdmin ? style.rolePillAdmin : style.rolePillEmployee]}>
                    <Text style={[style.roleText, isAdmin ? style.roleTextAdmin : style.roleTextEmployee]}>
                        ({userData.roleLabel})
                    </Text>
                </View>
            </View>

            <View style={style.card}>
                <View style={style.cardHeader}>
                    <Ionicons name="person-outline" size={18} color={colors.primary} />
                    <Text style={style.cardTitle}>Minhas Informações</Text>
                </View>

                <Text style={style.label}>NOME COMPLETO</Text>
                {isEditing ? (
                    <TextInput
                        style={style.input}
                        value={userData.name}
                        onChangeText={(text) => setUserData({ ...userData, name: text })}
                    />
                ) : (
                    <Text style={style.infoValueText}>{userData.name}</Text>
                )}

                <View style={style.separatorThin} />

                <Text style={style.label}>E-MAIL PROFISSIONAL</Text>
                {isEditing ? (
                    <TextInput
                        style={style.input}
                        value={userData.email}
                        keyboardType="email-address"
                        onChangeText={(text) => setUserData({ ...userData, email: text })}
                    />
                ) : (
                    <Text style={style.infoValueText}>{userData.email}</Text>
                )}

                {isAdmin && (
                    <TouchableOpacity
                        style={[style.outlineButton, isEditing ? style.saveButton : { marginTop: 20 }]}
                        onPress={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                        <Text style={isEditing ? style.saveButtonText : style.outlineButtonText}>
                            {isEditing ? "Salvar" : "Editar informações"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={style.card}>
                <View style={style.cardHeader}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                    <Text style={style.cardTitle}>Segurança</Text>
                </View>
                <Text style={style.label}>SENHA</Text>
                <View style={style.inputFake}>
                    <Text style={style.inputText}>••••••••••••</Text>
                </View>
                <TouchableOpacity style={style.outlineButton}>
                    <Text style={style.outlineButtonText}>Alterar Senha</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={style.logoutButton}>
                <Ionicons name="log-out-outline" size={20} color={colors.white} style={style.logoutIcon} />
                <Text style={style.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}