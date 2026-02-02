import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

export const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.notLoggedContainer}>
        <Ionicons name="person-circle-outline" size={100} color={colors.gray300} />
        <Text style={styles.notLoggedTitle}>Faça login</Text>
        <Text style={styles.notLoggedText}>
          Entre na sua conta para ver seu perfil e histórico de pedidos
        </Text>
        <Button
          title="Entrar"
          onPress={() => navigation.navigate('Login' as never)}
          style={styles.loginButton}
        />
      </View>
    );
  }

  const menuItems = [
    { icon: 'receipt-outline', label: 'Meus Pedidos', onPress: () => {} },
    { icon: 'location-outline', label: 'Endereços', onPress: () => {} },
    { icon: 'card-outline', label: 'Formas de Pagamento', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notificações', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Ajuda', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={colors.marsala} />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="outline"
        />
      </View>

      <Text style={styles.version}>Versão 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    backgroundColor: colors.marsala,
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  menuContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    fontSize: 16,
    color: colors.text,
  },
  logoutContainer: {
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray400,
    marginTop: spacing.md,
  },
  notLoggedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
    padding: spacing.xl,
  },
  notLoggedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  notLoggedText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  loginButton: {
    minWidth: 200,
  },
});
