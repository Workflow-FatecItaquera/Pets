import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import style, { colors } from './style';
import { BACKEND_URI } from '@env';
import { AuthContext } from '../../contexts/AuthContext';

export default function Profile() {
    const { userData, signOut, updateUser } = useContext(AuthContext);

    const formatPhoneNumber = (text) => {
        if (!text) return '';
        let value = text.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        
        return value;
    };

    const [profileData, setProfileData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: formatPhoneNumber(userData?.phone || ''), 
        admin: userData?.isAdmin || false,
        roleLabel: userData?.isAdmin ? 'ADMINISTRADOR(A)' : 'FUNCIONÁRIO(A)',
        avatar: userData?.picture || null, 
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    
    const isAdmin = profileData.admin === true;

    useEffect(() => {
        if (userData) {
            setProfileData({
                name: userData.name || '',
                email: userData.email || '',
                phone: formatPhoneNumber(userData.phone || ''),
                admin: userData.isAdmin || false,
                roleLabel: userData.isAdmin ? 'ADMINISTRADOR(A)' : 'FUNCIONÁRIO(A)',
                avatar: userData.picture || null,
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
            canClick: isEditing 
        };
    };

    const badge = getBadgeConfig();

    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto de perfil.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfileData(prev => ({ ...prev, avatar: base64Image }));
        }
    };

    const handleSave = async () => {
        if (!profileData.name.trim() || !profileData.email.trim()) {
            Alert.alert("Atenção", "Os campos Nome e E-mail são obrigatórios e não podem ficar vazios.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            Alert.alert("Atenção", "Por favor, insira um endereço de e-mail válido.");
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`${BACKEND_URI}/users`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData?.token || ''}`
                },
                body: JSON.stringify({
                    _id: userData?._id,
                    name: profileData.name.trim(),
                    email: profileData.email.toLowerCase().trim(),
                    picture: profileData.avatar,
                    phone: profileData.phone.trim(),
                    userId: userData ? userData._id : null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Não foi possível atualizar as informações.");
            }

            await updateUser({ ...userData, ...data });

            Alert.alert("Sucesso", "Suas informações foram atualizadas com sucesso na base de dados.");
            setIsEditing(false);
            
        } catch (error) {
            console.error('[Profile Update Error]', error);
            Alert.alert("Erro ao Salvar", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Encerrar Sessão",
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

    const handleMockPasswordRecovery = () => {
        setModalVisible(false);
        setTimeout(() => {
            Alert.alert(
                "Aviso do Sistema",
                "Funcionalidade em desenvolvimento.",
                [{ text: "Entendido", style: "default" }]
            );
        }, 300);
    };

    return (
        <View style={style.container}>
            <ScrollView contentContainerStyle={style.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={style.headerTitle}>Meu Perfil</Text>

                <View style={style.userSection}>
                    <View style={style.avatarContainer}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={!badge.canClick || loading}
                            onPress={handleImagePicker}
                        >
                            {profileData.avatar ? (
                                <Image source={{ uri: profileData.avatar }} cachePolicy="none" style={style.avatar} />
                            ) : (
                                <View style={[style.avatar, style.avatarPlaceholder]}>
                                    <Ionicons name="person" size={45} color={colors.white} />
                                </View>
                            )}

                            <View style={[style.badge, badge.style]}>
                                <Ionicons name={badge.icon} size={14} color={badge.color} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={style.userName}>{profileData.name}</Text>
                    
                    <View style={[style.rolePill, isAdmin ? style.rolePillAdmin : style.rolePillEmployee]}>
                        <Text style={[style.roleText, isAdmin ? style.roleTextAdmin : style.roleTextEmployee]}>
                            {profileData.roleLabel}
                        </Text>
                    </View>
                </View>

                <View style={style.card}>
                    <View style={style.cardHeader}>
                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                        <Text style={style.cardTitle}>Dados Pessoais</Text>
                    </View>

                    <Text style={style.label}>NOME COMPLETO</Text>
                    {isEditing ? (
                        <TextInput
                            style={style.input}
                            value={profileData.name}
                            onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                            editable={!loading}
                            placeholderTextColor="#A0A0A0"
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
                            editable={!loading}
                            autoCapitalize="none"
                            placeholderTextColor="#A0A0A0"
                        />
                    ) : (
                        <Text style={style.infoValueText}>{profileData.email}</Text>
                    )}

                    <View style={style.separatorThin} />

                    <Text style={style.label}>TELEFONE</Text>
                    {isEditing ? (
                        <TextInput
                            style={style.input}
                            value={profileData.phone}
                            keyboardType="phone-pad"
                            maxLength={15}
                            onChangeText={(text) => setProfileData({ ...profileData, phone: formatPhoneNumber(text) })}
                            editable={!loading}
                            placeholder="(00) 00000-0000"
                            placeholderTextColor="#A0A0A0"
                        />
                    ) : (
                        <Text style={style.infoValueText}>{profileData.phone || 'Não informado'}</Text>
                    )}

                    <TouchableOpacity
                        style={[style.outlineButton, isEditing ? style.saveButton : { marginTop: 20 }]}
                        onPress={isEditing ? handleSave : () => setIsEditing(true)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={isEditing ? colors.white : colors.primary} />
                        ) : (
                            <Text style={isEditing ? style.saveButtonText : style.outlineButtonText}>
                                {isEditing ? "Salvar Alterações" : "Editar Informações"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={style.card}>
                    <View style={style.cardHeader}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                        <Text style={style.cardTitle}>Segurança</Text>
                    </View>
                    
                    <Text style={style.label}>SENHA DE ACESSO</Text>
                    <View style={style.inputFake}>
                        <Text style={style.inputText}>••••••••••••</Text>
                    </View>
                    
                    <TouchableOpacity style={style.outlineButton} onPress={() => setModalVisible(true)}>
                        <Text style={style.outlineButtonText}>Recuperar Senha</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={style.logoutButton} onPress={handleLogout} disabled={loading}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} style={style.logoutIcon} />
                    <Text style={style.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </ScrollView>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={style.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        style={style.modalContainer}
                    >
                        <View style={style.modalIconContainer}>
                            <Ionicons name="key-outline" size={32} color={colors.primary} />
                        </View>
                        
                        <Text style={style.modalTitle}>Esqueci minha senha</Text>
                        <Text style={style.modalSubtitle}>
                            Enviaremos um link de recuperação seguro para o seu e-mail cadastrado.
                        </Text>

                        <Text style={[style.label, { width: '100%' }]}>SEU E-MAIL</Text>
                        <TextInput
                            style={[style.input, { width: '100%', marginBottom: 25 }]}
                            placeholder="exemplo@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#A0A0A0"
                        />

                        <TouchableOpacity style={style.primaryButton} onPress={handleMockPasswordRecovery}>
                            <Text style={style.primaryButtonText}>Enviar Link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.cancelModalButton} onPress={() => setModalVisible(false)}>
                            <Text style={style.cancelModalText}>Cancelar</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}