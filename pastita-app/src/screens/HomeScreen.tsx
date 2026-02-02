import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Cardapio: undefined;
  Cart: undefined;
  Login: undefined;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const features = [
    {
      icon: 'restaurant-outline',
      title: 'Receita Artesanal',
      description: 'Massa fresca feita diariamente com ingredientes selecionados',
    },
    {
      icon: 'time-outline',
      title: 'Entrega Rápida',
      description: 'Receba seu pedido quentinho em até 45 minutos',
    },
    {
      icon: 'heart-outline',
      title: 'Feito com Amor',
      description: 'Cada pastita é preparada com carinho e dedicação',
    },
  ];

  const steps = [
    { number: '1', title: 'Escolha', description: 'Navegue pelo cardápio' },
    { number: '2', title: 'Peça', description: 'Adicione ao carrinho' },
    { number: '3', title: 'Receba', description: 'Entrega na sua porta' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>PASTITA</Text>
          <Text style={styles.heroSubtitle}>Massa Artesanal</Text>
          <Text style={styles.heroDescription}>
            Sabores autênticos da Itália direto para sua mesa
          </Text>
          <Button
            title="Ver Cardápio"
            onPress={() => navigation.navigate('Cardapio')}
            style={styles.heroButton}
          />
        </View>
        <View style={styles.heroImageContainer}>
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="restaurant" size={80} color={colors.marsala} />
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Por que Pastita?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={32} color={colors.marsala} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How it Works */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={styles.sectionTitle}>Como Funciona</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Pronto para experimentar?</Text>
        <Text style={styles.ctaDescription}>
          Faça seu pedido agora e descubra o sabor autêntico da massa artesanal
        </Text>
        <Button
          title="Fazer Pedido"
          onPress={() => navigation.navigate('Cardapio')}
          variant="secondary"
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>PASTITA</Text>
        <Text style={styles.footerText}>© 2026 Pastita. Todos os direitos reservados.</Text>
        <View style={styles.socialIcons}>
          <Ionicons name="logo-instagram" size={24} color={colors.white} />
          <Ionicons name="logo-whatsapp" size={24} color={colors.white} />
          <Ionicons name="logo-facebook" size={24} color={colors.white} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  hero: {
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.marsala,
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.gold,
    fontWeight: '500',
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  heroDescription: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  heroButton: {
    minWidth: 200,
  },
  heroImageContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  heroImagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  section: {
    padding: spacing.lg,
  },
  sectionAlt: {
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.marsala,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featuresGrid: {
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.marsala,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: colors.marsala,
    padding: spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  footer: {
    backgroundColor: colors.marsalaDark,
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
