/**
 * useCheckout Hook - Handles checkout process using unified Store API
 */
import { useState, useCallback } from 'react';
import * as storeApi from '../services/storeApi';

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  /**
   * Calculate delivery fee based on distance or coordinates
   */
  const calculateDeliveryFee = useCallback(async (distanceKm = null, zipCode = null) => {
    try {
      const result = await storeApi.calculateDeliveryFee(distanceKm, zipCode);
      return result;
    } catch (err) {
      console.error('Error calculating delivery fee:', err);
      return { fee: 0, zone_name: 'Padrão', estimated_minutes: 30 };
    }
  }, []);

  /**
   * Validate delivery address
   */
  const validateDelivery = useCallback(async (lat, lng) => {
    try {
      const result = await storeApi.validateDeliveryAddress(lat, lng);
      return result;
    } catch (err) {
      console.error('Error validating delivery:', err);
      return { is_valid: false, message: 'Erro ao validar endereço' };
    }
  }, []);

  /**
   * Validate coupon code
   */
  const validateCoupon = useCallback(async (code, subtotal) => {
    try {
      const result = await storeApi.validateCoupon(code, subtotal);
      return result;
    } catch (err) {
      console.error('Error validating coupon:', err);
      return { valid: false, error: 'Erro ao validar cupom' };
    }
  }, []);

  /**
   * Process checkout
   */
  const processCheckout = useCallback(async ({
    customerName,
    customerEmail,
    customerPhone,
    deliveryMethod = 'delivery',
    deliveryAddress = {},
    deliveryNotes = '',
    distanceKm = null,
    paymentMethod = 'pix',
    couponCode = '',
    notes = '',
  }) => {
    setIsProcessing(true);
    setError(null);
    setOrderResult(null);

    try {
      const checkoutData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes,
        distance_km: distanceKm,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        notes,
      };

      const result = await storeApi.checkout(checkoutData);

      if (result.success) {
        setOrderResult(result);
        return { success: true, data: result };
      } else {
        setError(result.error || 'Erro ao processar pedido');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao processar pedido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Get order status
   */
  const getOrderStatus = useCallback(async (orderId) => {
    try {
      const result = await storeApi.getOrderStatus(orderId);
      return result;
    } catch (err) {
      console.error('Error getting order status:', err);
      return null;
    }
  }, []);

  /**
   * Calculate route from store to delivery address
   */
  const calculateRoute = useCallback(async (destLat, destLng) => {
    try {
      const result = await storeApi.calculateRoute(destLat, destLng);
      return result;
    } catch (err) {
      console.error('Error calculating route:', err);
      return null;
    }
  }, []);

  /**
   * Get address suggestions
   */
  const getAddressSuggestions = useCallback(async (query) => {
    if (!query || query.length < 3) return [];
    try {
      const suggestions = await storeApi.autosuggestAddress(query);
      return suggestions;
    } catch (err) {
      console.error('Error getting suggestions:', err);
      return [];
    }
  }, []);

  /**
   * Geocode address
   */
  const geocodeAddress = useCallback(async (address) => {
    try {
      const result = await storeApi.geocodeAddress(address);
      return result;
    } catch (err) {
      console.error('Error geocoding address:', err);
      return null;
    }
  }, []);

  return {
    // State
    isProcessing,
    error,
    orderResult,
    
    // Actions
    calculateDeliveryFee,
    validateDelivery,
    validateCoupon,
    processCheckout,
    getOrderStatus,
    calculateRoute,
    getAddressSuggestions,
    geocodeAddress,
    
    // Reset
    clearError: () => setError(null),
    clearResult: () => setOrderResult(null),
  };
};

export default useCheckout;
