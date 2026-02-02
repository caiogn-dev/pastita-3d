import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

export const CheckoutScreen: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleSubmit = async () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        delivery_address: `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.zipCode}`,
        payment_method: paymentMethod,
        total: totalPrice,
      };

      await api.post('/orders/', orderData);
      
      clearCart();
      Alert.alert(
        'Pedido Confirmado! 🎉',
        'Seu pedido foi realizado com sucesso. Você receberá atualizações pelo WhatsApp.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home' as never) }]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Erro', 'Não foi possível finalizar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Finalizar Pedido</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {formatPrice(parseFloat(item.price) * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          <View style={styles.formCard}>
            <Input
              label="Rua *"
              placeholder="Nome da rua"
              value={address.street}
              onChangeText={(text) => setAddress({ ...address, street: text })}
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Número *"
                  placeholder="123"
                  value={address.number}
                  onChangeText={(text) => setAddress({ ...address, number: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Complemento"
                  placeholder="Apto, Bloco..."
                  value={address.complement}
                  onChangeText={(text) => setAddress({ ...address, complement: text })}
                />
              </View>
            </View>
            <Input
              label="Bairro *"
              placeholder="Nome do bairro"
              value={address.neighborhood}
              onChangeText={(text) => setAddress({ ...address, neighborhood: text })}
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Cidade *"
                  placeholder="Sua cidade"
                  value={address.city}
                  onChangeText={(text) => setAddress({ ...address, city: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={address.zipCode}
                  onChangeText={(text) => setAddress({ ...address, zipCode: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.paymentOptions}>
            {[
              { id: 'pix', label: 'PIX', icon: '💳' },
              { id: 'card', label: 'Cartão', icon: '💳' },
              { id: 'cash', label: 'Dinheiro', icon: '💵' },
            ].map((option) => (
              <View
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && styles.paymentOptionSelected,
                ]}
                onTouchEnd={() => setPaymentMethod(option.id)}
              >
                <Text style={styles.paymentIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === option.id && styles.paymentLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.submitContainer}>
          <Button
            title="Confirmar Pedido"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    backgroundColor: colors.marsala,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryItemName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.marsala,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.marsala,
    backgroundColor: colors.cream,
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  paymentLabelSelected: {
    color: colors.marsala,
    fontWeight: '600',
  },
  submitContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
