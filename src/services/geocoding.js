/**
 * Geocoding Service - Production-ready address lookup, reverse geocoding, and routing.
 * 
 * Service hierarchy:
 * 1. HERE Maps API (primary) - Professional geocoding with Brazilian address support
 * 2. ViaCEP (Brazilian CEP) - Official Brazilian postal code lookup
 * 
 * Note: Nominatim/OSRM fallbacks have been removed in favor of HERE Maps reliability.
 */

import logger from './logger';

const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY || '';
const HERE_GEOCODE_URL = 'https://geocode.search.hereapi.com/v1/geocode';
const HERE_REVGEOCODE_URL = 'https://revgeocode.search.hereapi.com/v1/revgeocode';
const HERE_AUTOSUGGEST_URL = 'https://autosuggest.search.hereapi.com/v1/autosuggest';
const HERE_ROUTING_URL = 'https://router.hereapi.com/v8/routes';
const VIACEP_URL = 'https://viacep.com.br/ws';

const REQUEST_TIMEOUT = 10000;

/**
 * Create a fetch request with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if HERE API key is configured
 */
function isHEREConfigured() {
  return Boolean(HERE_API_KEY && HERE_API_KEY.length > 10);
}

/**
 * Validate coordinates
 */
function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Build address string from HERE address components
 */
function buildAddressFromHERE(address) {
  const parts = [];

  if (address.street) {
    let street = address.street;
    if (address.houseNumber) {
      street = `${street}, ${address.houseNumber}`;
    }
    parts.push(street);
  }

  if (address.district) {
    parts.push(address.district);
  }

  return parts.join(' - ');
}

/**
 * Forward geocoding - convert address to coordinates using HERE Maps.
 * @param {string} query - Address or place name to search
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of location results
 */
export async function geocodeAddress(query, options = {}) {
  const { countryCodes = ['BRA'], limit = 5 } = options;

  if (!query || query.trim().length < 3) {
    return [];
  }

  if (!isHEREConfigured()) {
    logger.warn('HERE API key not configured. Geocoding unavailable.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      in: `countryCode:${countryCodes.join(',')}`,
      limit: String(limit),
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_GEOCODE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HERE Geocode API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => ({
      latitude: item.position.lat,
      longitude: item.position.lng,
      display_name: item.address.label,
      address: buildAddressFromHERE(item.address),
      street: item.address.street || '',
      number: item.address.houseNumber || '',
      neighborhood: item.address.district || '',
      city: item.address.city || '',
      state: item.address.stateCode || item.address.state || '',
      country: item.address.countryName || '',
      zip_code: item.address.postalCode || '',
      place_id: item.id,
      confidence: item.scoring?.queryScore || 0,
    }));
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Geocoding request timed out', { query });
    } else {
      logger.error('Geocoding error', error, { query });
    }
    return [];
  }
}

/**
 * Reverse geocoding - convert coordinates to address using HERE Maps.
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object|null>} Location object or null
 */
export async function reverseGeocode(latitude, longitude) {
  if (!isHEREConfigured()) {
    logger.warn('HERE API key not configured. Reverse geocoding unavailable.');
    return null;
  }

  if (!isValidCoordinate(latitude, longitude)) {
    logger.warn('Invalid coordinates provided', { latitude, longitude });
    return null;
  }

  try {
    const params = new URLSearchParams({
      at: `${latitude},${longitude}`,
      lang: 'pt-BR',
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_REVGEOCODE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HERE Reverse Geocode API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];

    return {
      latitude: item.position.lat,
      longitude: item.position.lng,
      display_name: item.address.label,
      address: buildAddressFromHERE(item.address),
      street: item.address.street || '',
      number: item.address.houseNumber || '',
      neighborhood: item.address.district || '',
      city: item.address.city || '',
      state: item.address.stateCode || item.address.state || '',
      country: item.address.countryName || '',
      zip_code: item.address.postalCode || '',
      place_id: item.id,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Reverse geocoding request timed out', { latitude, longitude });
    } else {
      logger.error('Reverse geocoding error', error, { latitude, longitude });
    }
    return null;
  }
}

/**
 * Get address autocomplete suggestions using HERE Autosuggest.
 * @param {string} query - Partial address or place name (min 3 chars)
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getAddressSuggestions(query, options = {}) {
  const { countryCodes = ['BRA'], limit = 8 } = options;

  if (!query || query.trim().length < 3) {
    return [];
  }

  if (!isHEREConfigured()) {
    logger.warn('HERE API key not configured. Suggestions unavailable.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      in: `countryCode:${countryCodes.join(',')}`,
      limit: String(limit),
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_AUTOSUGGEST_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HERE Autosuggest API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items
      .filter((item) => item.position)
      .map((item) => ({
        display_name: item.title,
        latitude: item.position.lat,
        longitude: item.position.lng,
        place_id: item.id,
        address_type: item.resultType,
        confidence: 1,
      }));
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Suggestions request timed out', { query });
    } else {
      logger.error('Suggestions error', error, { query });
    }
    return [];
  }
}

/**
 * Calculate route between two points using HERE Routing API.
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @param {Object} options - Route options
 * @returns {Promise<Object|null>} Route info or null
 */
export async function calculateRoute(origin, destination, options = {}) {
  const { transportMode = 'car', routingMode = 'fast' } = options;

  if (!isHEREConfigured()) {
    logger.warn('HERE API key not configured. Routing unavailable.');
    return null;
  }

  if (
    !isValidCoordinate(origin.latitude, origin.longitude) ||
    !isValidCoordinate(destination.latitude, destination.longitude)
  ) {
    logger.warn('Invalid coordinates provided for routing', { origin, destination });
    return null;
  }

  try {
    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      transportMode,
      routingMode,
      return: 'summary,polyline',
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_ROUTING_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HERE Routing API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const section = route.sections[0];

    return {
      distance_km: parseFloat((section.summary.length / 1000).toFixed(2)),
      duration_minutes: Math.round(section.summary.duration / 60),
      polyline: section.polyline,
      summary: `${(section.summary.length / 1000).toFixed(1)} km • ${Math.round(section.summary.duration / 60)} min`,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Routing request timed out', { origin, destination });
    } else {
      logger.error('Routing error', error, { origin, destination });
    }
    return null;
  }
}

/**
 * Brazilian CEP (zip code) lookup using ViaCEP.
 * @param {string} cep - Brazilian CEP (8 digits)
 * @returns {Promise<Object|null>} Address data or null
 */
export async function lookupCEP(cep) {
  const cleanCep = cep.replace(/\D/g, '').slice(0, 8);

  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetchWithTimeout(`${VIACEP_URL}/${cleanCep}/json/`);

    if (!response.ok) {
      throw new Error(`ViaCEP API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep || '',
      address: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      state_full: data.estado || '',
      ibge_code: data.ibge || '',
      ddd: data.ddd || '',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('CEP lookup request timed out', { cep });
    } else {
      logger.error('CEP lookup error', error, { cep });
    }
    return null;
  }
}

/**
 * Geocode a Brazilian address using CEP + HERE Maps for accuracy.
 * @param {string} cep - Brazilian CEP
 * @param {Object} addressData - Additional address data
 * @returns {Promise<Object|null>} Location object or null
 */
export async function geocodeBrazilianAddress(cep, addressData = {}) {
  const cepData = await lookupCEP(cep);

  const queryParts = [];

  if (addressData.address) {
    queryParts.push(addressData.address);
  } else if (cepData?.address) {
    queryParts.push(cepData.address);
  }

  if (addressData.number) {
    queryParts.push(addressData.number);
  }

  if (cepData?.neighborhood) {
    queryParts.push(cepData.neighborhood);
  }

  if (addressData.city || cepData?.city) {
    queryParts.push(addressData.city || cepData?.city || '');
  }

  if (addressData.state || cepData?.state) {
    queryParts.push(addressData.state || cepData?.state || '');
  }

  queryParts.push('Brasil');

  const query = queryParts.filter(Boolean).join(', ');

  const results = await geocodeAddress(query, { limit: 1 });

  if (results.length > 0) {
    return {
      ...results[0],
      zip_code: cepData?.cep || cep,
      neighborhood: cepData?.neighborhood || results[0].neighborhood,
    };
  }

  return null;
}

/**
 * Get user's current location using browser geolocation.
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location coordinates
 */
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        const messages = {
          1: 'Permissão de localização negada',
          2: 'Localização indisponível',
          3: 'Tempo esgotado ao obter localização',
        };
        reject(new Error(messages[error.code] || 'Erro ao obter localização'));
      },
      defaultOptions
    );
  });
}

/**
 * Calculate haversine distance between two points in km.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format CEP with mask (00000-000)
 */
export function formatCEP(cep) {
  const clean = cep.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

/**
 * Validate CEP format
 */
export function isValidCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8 && /^\d{8}$/.test(clean);
}

export default {
  geocodeAddress,
  reverseGeocode,
  getAddressSuggestions,
  calculateRoute,
  lookupCEP,
  geocodeBrazilianAddress,
  getCurrentLocation,
  haversineDistance,
  formatCEP,
  isValidCEP,
};
