import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductCard } from '../components/ProductCard';
import { useCart, Product } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { colors, spacing } from '../styles/theme';

type RootStackParamList = {
  Login: undefined;
  Cart: undefined;
};

export const CardapioScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data for demo
      setProducts([
        {
          id: 1,
          name: 'Rondelli de Carne',
          description: 'Massa recheada com carne moída temperada e molho especial',
          price: '45.90',
          image: '',
        },
        {
          id: 2,
          name: 'Rondelli de Frango',
          description: 'Massa recheada com frango desfiado e temperos frescos',
          price: '42.90',
          image: '',
        },
        {
          id: 3,
          name: 'Rondelli 4 Queijos',
          description: 'Massa recheada com blend de queijos selecionados',
          price: '48.90',
          image: '',
        },
        {
          id: 4,
          name: 'Lasanha Bolonhesa',
          description: 'Camadas de massa fresca com molho bolonhesa e bechamel',
          price: '52.90',
          image: '',
        },
        {
          id: 5,
          name: 'Canelone de Ricota',
          description: 'Massa recheada com ricota fresca e espinafre',
          price: '44.90',
          image: '',
        },
        {
          id: 6,
          name: 'Nhoque da Casa',
          description: 'Nhoque de batata artesanal com molho ao sugo',
          price: '38.90',
          image: '',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Necessário',
        'Faça login para adicionar produtos ao carrinho',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    
    addToCart(product);
    Alert.alert('Sucesso!', `${product.name} adicionado ao carrinho`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.marsala} />
        <Text style={styles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cardápio</Text>
        <Text style={styles.subtitle}>Escolha suas delícias</Text>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.marsala]}
            tintColor={colors.marsala}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum produto disponível</Text>
          </View>
        }
      />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
  },
});
