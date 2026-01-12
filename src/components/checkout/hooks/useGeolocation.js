/**
 * Hook for geolocation and address detection
 * Includes caching for route calculations to improve performance
 */
import { useState, useCallback } from 'react';
import * as storeApi from '../../../services/storeApi';
import { getStateCode, STORE_LOCATION } from '../utils';
import { getCachedRoute, cacheRoute } from '../../../utils/routeCache';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // Reverse geocode using HERE Maps API
  const reverseGeocode = useCallback(async (lat, lng) => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!apiKey) {
      console.error('HERE API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      if (data && data.items && data.items.length > 0) {
        const item = data.items[0];
        const addr = item.address || {};
        return {
          street: addr.street || '',
          number: addr.houseNumber || '',
          neighborhood: addr.district || '',
          city: addr.city || '',
          state: addr.stateCode || getStateCode(addr.state || ''),
          zip_code: addr.postalCode || '',
          country: addr.countryName || 'Brasil',
          display_name: addr.label || '',
          lat,
          lng
        };
      }
      return null;
    } catch (err) {
      console.error('Reverse geocode error:', err);
      return null;
    }
  }, []);

  // Calculate route and delivery fee with caching
  const calculateRouteAndFee = useCallback(async (lat, lng) => {
    try {
      const storeLat = STORE_LOCATION?.latitude;
      const storeLng = STORE_LOCATION?.longitude;
      
      // Check cache first for route
      let routeData = null;
      if (storeLat && storeLng) {
        const cachedRoute = getCachedRoute(storeLat, storeLng, lat, lng);
        if (cachedRoute) {
          console.log('Route cache hit');
          routeData = cachedRoute;
          setRouteInfo({
            distance_km: routeData.distance_km || routeData.distance,
            duration_minutes: routeData.duration_minutes || routeData.duration,
            polyline: routeData.polyline,
            summary: routeData.summary
          });
        }
      }
      
      // If not cached, fetch from API
      if (!routeData) {
        routeData = await storeApi.calculateRoute(lat, lng);
        if (routeData) {
          // Cache the route
          if (storeLat && storeLng) {
            cacheRoute(storeLat, storeLng, lat, lng, routeData);
          }
          setRouteInfo({
            distance_km: routeData.distance_km || routeData.distance,
            duration_minutes: routeData.duration_minutes || routeData.duration,
            polyline: routeData.polyline,
            summary: routeData.summary
          });
        }
      }

      // Get delivery fee (this also validates the address)
      const deliveryData = await storeApi.validateDeliveryAddress(lat, lng);
      if (deliveryData) {
        setDeliveryInfo({
          fee: Number(deliveryData.delivery_fee || deliveryData.fee) || 0,
          zone_name: deliveryData.delivery_zone || deliveryData.zone_name || 'Área de entrega',
          estimated_days: deliveryData.estimated_days || 0,
          distance_km: deliveryData.distance_km,
          estimated_minutes: deliveryData.estimated_minutes,
          is_valid: deliveryData.is_valid !== false,
          polyline: deliveryData.polyline || routeData?.polyline
        });
      }

      return { routeData, deliveryData };
    } catch (err) {
      console.error('Route calculation error:', err);
      return null;
    }
  }, []);

  // Detect user location
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = pos.coords;
      setPosition({ lat: latitude, lng: longitude });

      // Reverse geocode
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        setDetectedAddress(address);
      }

      // Calculate route and fee
      await calculateRouteAndFee(latitude, longitude);

      setLoading(false);
      return { lat: latitude, lng: longitude, address };
    } catch (err) {
      setLoading(false);
      
      if (err.code === 1) {
        setError('Permissão de localização negada');
      } else if (err.code === 2) {
        setError('Localização indisponível');
      } else if (err.code === 3) {
        setError('Tempo esgotado ao obter localização');
      } else {
        setError('Erro ao obter localização');
      }
      return null;
    }
  }, [reverseGeocode, calculateRouteAndFee]);

  // Update location manually (from map click)
  const updateLocation = useCallback(async (lat, lng) => {
    setPosition({ lat, lng });
    setLoading(true);

    const address = await reverseGeocode(lat, lng);
    if (address) {
      setDetectedAddress(address);
    }

    await calculateRouteAndFee(lat, lng);
    setLoading(false);

    return address;
  }, [reverseGeocode, calculateRouteAndFee]);

  // Clear all data
  const clearLocation = useCallback(() => {
    setPosition(null);
    setDetectedAddress(null);
    setRouteInfo(null);
    setDeliveryInfo(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    position,
    detectedAddress,
    routeInfo,
    deliveryInfo,
    detectLocation,
    updateLocation,
    clearLocation,
    calculateRouteAndFee,
    setDeliveryInfo
  };
};

export default useGeolocation;
