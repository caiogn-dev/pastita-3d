import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../styles/theme';

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

export const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      
      const loginResult = await signIn(formData.email.trim(), formData.password);
      if (loginResult.success) {
        navigation.navigate('MainTabs', { screen: 'Cardapio' });
      } else {
        Alert.alert('Conta Criada!', 'Conta criada. Faça login para continuar.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao criar conta';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>PASTITA</Text>
          <Text style={styles.subtitle}>Crie sua conta</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Cadastro</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Nome"
                placeholder="Seu nome"
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Sobrenome"
                placeholder="Seu sobrenome"
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
              />
            </View>
          </View>
          
          <Input
            label="Usuário *"
            placeholder="Escolha um usuário"
            value={formData.username}
            onChangeText={(text) => updateField('username', text)}
            autoCapitalize="none"
            error={errors.username}
          />
          
          <Input
            label="Email *"
            placeholder="seu@email.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Senha *"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            error={errors.password}
          />
          
          <Input
            label="Confirmar Senha *"
            placeholder="Repita a senha"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.marsala,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.sm,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
  },
  footerLink: {
    fontSize: 14,
    color: colors.marsala,
    fontWeight: '600',
  },
});
