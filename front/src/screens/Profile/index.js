import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Importação do ImagePicker
import style, { colors } from './style';
import { BACKEND_URI } from '@env';
import { AuthContext } from '../../contexts/AuthContext';

export default function Profile() {
    const { userData, signOut } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        admin: userData?.isAdmin || false,
        roleLabel: userData?.isAdmin ? 'ADMINISTRADOR(A)' : 'FUNCIONÁRIO(A)',
        avatar: userData?.picture || null, // Alterado para null se não houver foto
    });

    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = profileData.admin === true;

    useEffect(() => {
        if (userData) {
            setProfileData({
                name: userData.name || '',
                email: userData.email || '',
                admin: userData.isAdmin || false,
                roleLabel: userData.isAdmin ? 'ADMINISTRADOR(A)' : 'FUNCIONÁRIO(A)',
                avatar: userData.picture || null, // Alterado para null
            });
        }
    }, [userData]);

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

    // Função para abrir a galeria e selecionar a imagem
    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto de perfil.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Força um corte quadrado
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileData(prev => ({ ...prev, avatar: result.assets[0].uri }));
            // Aqui você pode adicionar a lógica para enviar a nova foto para o seu backend
        }
    };

    const handleSave = async () => {
        setIsEditing(false);
        Alert.alert("Sucesso", "Informações atualizadas localmente!");
    };

    const handleLogout = async () => {
        Alert.alert(
            "Sair",
            "Tem certeza que deseja sair da sua conta?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sair", 
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                    } 
                }
            ]
        );
    };

    return (
        <ScrollView style={style.container} contentContainerStyle={style.scrollContent}>
            <Text style={style.headerTitle}>Perfil</Text>

            <View style={style.userSection}>
                <View style={style.avatarContainer}>
                    <TouchableOpacity
                        disabled={!badge.canClick}
                        onPress={handleImagePicker} // Chama a função do picker
                    >
                        {/* Condicional: Mostra a imagem ou o ícone roxo com placeholder */}
                        {profileData.avatar ? (
                            <Image source={{ uri: profileData.avatar }} style={style.avatar} />
                        ) : (
                            <View style={[style.avatar, style.avatarPlaceholder]}>
                                <Ionicons name="person" size={50} color={colors.white} />
                            </View>
                        )}

                        <View style={[style.badge, badge.style]}>
                            <Ionicons name={badge.icon} size={12} color={badge.color} />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={style.userName}>{profileData.name}</Text>
                <View style={[style.rolePill, isAdmin ? style.rolePillAdmin : style.rolePillEmployee]}>
                    <Text style={[style.roleText, isAdmin ? style.roleTextAdmin : style.roleTextEmployee]}>
                        ({profileData.roleLabel})
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
                        value={profileData.name}
                        onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                    />
                ) : (
                    <Text style={style.infoValueText}>{profileData.name}</Text>
                )}

                <View style={style.separatorThin} />

                <Text style={style.label}>E-MAIL PROFISSIONAL</Text>
                {isEditing ? (
                    <TextInput
                        style={style.input}
                        value={profileData.email}
                        keyboardType="email-address"
                        onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                    />
                ) : (
                    <Text style={style.infoValueText}>{profileData.email}</Text>
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

            <TouchableOpacity style={style.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={colors.white} style={style.logoutIcon} />
                <Text style={style.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}