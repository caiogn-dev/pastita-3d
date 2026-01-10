/**
 * Geocoding Service - Address lookup, reverse geocoding, and routing.
 * 
 * Primary: Backend API + HERE Maps (for map display)
 * Fallback: Nominatim (geocoding) + OSRM (routing) - free, no API key required
 * Brazilian CEP: ViaCEP API
 * 
 * Note: For map display and interactive features, use hereMapService.js and hereRoutingService.js
 */
import api from './api';

// Fallback services (free, no API key required)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OSRM_URL = 'https://router.project-osrm.org';

/**
 * Forward geocoding - convert address to coordinates.
 * @param {string} query - Address or place name to search
 * @param {Object} options - Search options
 * @param {string[]} options.countryCodes - Country codes to limit search (default: ['br'])
 * @param {number} options.limit - Maximum results (default: 5)
 * @returns {Promise<Array>} Array of location results
 */
export async function geocodeAddress(query, options = {}) {
  const { countryCodes = ['br'], limit = 5 } = options;
  
  try {
    // Try backend API first
    const response = await api.post('/geocoding/search/', {
      query,
      country_codes: countryCodes,
      limit,
    });
    return response.data.results || [];
  } catch (error) {
    console.warn('Backend geocoding failed, falling back to Nominatim:', error);
    // Fallback to direct Nominatim
    return geocodeAddressDirect(query, options);
  }
}

/**
 * Direct Nominatim geocoding (fallback).
 */
async function geocodeAddressDirect(query, options = {}) {
  const { countryCodes = ['br'], limit = 5 } = options;
  
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
      countrycodes: countryCodes.join(','),
    });
    
    const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'pastita-platform/1.0',
      },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map(item => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      display_name: item.display_name,
      address: buildAddressString(item.address),
      city: item.address?.city || item.address?.town || item.address?.village || '',
      state: item.address?.state || '',
      country: item.address?.country || '',
      zip_code: item.address?.postcode || '',
      place_id: item.place_id,
      importance: item.importance || 0,
      bounding_box: item.boundingbox?.map(parseFloat) || null,
    }));
  } catch (error) {
    console.error('Direct geocoding failed:', error);
    return [];
  }
}

/**
 * Reverse geocoding - convert coordinates to address.
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} zoom - Level of detail (0-18, default: 18)
 * @returns {Promise<Object|null>} Location object or null
 */
export async function reverseGeocode(latitude, longitude, zoom = 18) {
  try {
    // Try backend API first
    const response = await api.post('/geocoding/reverse/', {
      latitude,
      longitude,
      zoom,
    });
    return response.data;
  } catch (error) {
    console.warn('Backend reverse geocoding failed, falling back to Nominatim:', error);
    // Fallback to direct Nominatim
    return reverseGeocodeDirect(latitude, longitude, zoom);
  }
}

/**
 * Direct Nominatim reverse geocoding (fallback).
 */
async function reverseGeocodeDirect(latitude, longitude, zoom = 18) {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
      addressdetails: '1',
      zoom: String(zoom),
    });
    
    const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'pastita-platform/1.0',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.error) return null;
    
    return {
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      display_name: data.display_name,
      address: buildAddressString(data.address),
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || '',
      country: data.address?.country || '',
      zip_code: data.address?.postcode || '',
      place_id: data.place_id,
    };
  } catch (error) {
    console.error('Direct reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Get address autocomplete suggestions.
 * @param {string} query - Partial address or place name (min 3 chars)
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getAddressSuggestions(query, options = {}) {
  if (!query || query.length < 3) return [];
  
  const { countryCodes = ['br'], limit = 10 } = options;
  
  try {
    // Try backend API first
    const params = new URLSearchParams({
      q: query,
      country_codes: countryCodes.join(','),
      limit: String(limit),
    });
    
    const response = await api.get(`/geocoding/suggestions/?${params}`);
    return response.data.suggestions || [];
  } catch (error) {
    console.warn('Backend suggestions failed, falling back to Nominatim:', error);
    // Fallback to direct geocoding
    const results = await geocodeAddressDirect(query, { countryCodes, limit });
    return results.map(r => ({
      display_name: r.display_name,
      latitude: r.latitude,
      longitude: r.longitude,
      place_id: r.place_id,
      address_type: '',
      importance: r.importance,
    }));
  }
}

/**
 * Calculate route between two points.
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @param {Object} options - Route options
 * @param {string} options.profile - Routing profile ('driving', 'walking', 'cycling')
 * @param {boolean} options.steps - Include turn-by-turn directions
 * @returns {Promise<Object|null>} Route info or null
 */
export async function calculateRoute(origin, destination, options = {}) {
  const { profile = 'driving', steps = true } = options;
  
  try {
    // Try backend API first
    const response = await api.post('/geocoding/route/', {
      origin,
      destination,
      profile,
      steps,
    });
    return response.data;
  } catch (error) {
    console.warn('Backend routing failed, falling back to OSRM:', error);
    // Fallback to direct OSRM
    return calculateRouteDirect(origin, destination, options);
  }
}

/**
 * Direct OSRM routing (fallback).
 */
async function calculateRouteDirect(origin, destination, options = {}) {
  const { profile = 'driving', steps = true } = options;
  
  const profileMap = {
    driving: 'driving',
    car: 'driving',
    walking: 'foot',
    foot: 'foot',
    cycling: 'bike',
    bike: 'bike',
  };
  
  const osrmProfile = profileMap[profile] || 'driving';
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  
  try {
    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'polyline6',
      steps: steps ? 'true' : 'false',
    });
    
    const response = await fetch(`${OSRM_URL}/route/v1/${osrmProfile}/${coords}?${params}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    
    const route = data.routes[0];
    return {
      distance_km: (route.distance / 1000).toFixed(2),
      duration_minutes: Math.round(route.duration / 60),
      geometry: route.geometry,
      summary: route.legs?.[0]?.summary || '',
      steps: steps ? extractSteps(route) : null,
    };
  } catch (error) {
    console.error('Direct routing failed:', error);
    return null;
  }
}

/**
 * Extract steps from OSRM route.
 */
function extractSteps(route) {
  const steps = [];
  for (const leg of route.legs || []) {
    for (const step of leg.steps || []) {
      const maneuver = step.maneuver || {};
      steps.push({
        instruction: getStepInstruction(step, maneuver),
        distance: step.distance || 0,
        duration: step.duration || 0,
        name: step.name || '',
        maneuver_type: maneuver.type || '',
        maneuver_modifier: maneuver.modifier || '',
      });
    }
  }
  return steps;
}

/**
 * Generate human-readable instruction for a route step.
 */
function getStepInstruction(step, maneuver) {
  const type = maneuver.type || '';
  const modifier = maneuver.modifier || '';
  const name = step.name || '';
  
  const instructions = {
    depart: `Siga em frente${name ? ' pela ' + name : ''}`,
    arrive: `Você chegou ao destino${name ? ' em ' + name : ''}`,
    turn: getTurnInstruction(modifier, name),
    continue: `Continue${name ? ' pela ' + name : ''}`,
    merge: `Entre na via${name ? ' ' + name : ''}`,
    'on ramp': `Pegue a rampa${name ? ' para ' + name : ''}`,
    'off ramp': `Saia pela rampa${name ? ' para ' + name : ''}`,
    fork: `Mantenha-se à ${translateModifier(modifier)}${name ? ' para ' + name : ''}`,
    'end of road': `No final da via, vire à ${translateModifier(modifier)}`,
    roundabout: `Na rotatória, pegue a saída${name ? ' para ' + name : ''}`,
    rotary: `Na rotatória, pegue a saída${name ? ' para ' + name : ''}`,
  };
  
  return instructions[type] || `Continue${name ? ' pela ' + name : ''}`;
}

function getTurnInstruction(modifier, name) {
  const turnTypes = {
    left: 'Vire à esquerda',
    right: 'Vire à direita',
    'slight left': 'Vire levemente à esquerda',
    'slight right': 'Vire levemente à direita',
    'sharp left': 'Vire acentuadamente à esquerda',
    'sharp right': 'Vire acentuadamente à direita',
    uturn: 'Faça retorno',
    straight: 'Continue em frente',
  };
  
  let instruction = turnTypes[modifier] || 'Continue';
  if (name) instruction += ` para ${name}`;
  return instruction;
}

function translateModifier(modifier) {
  const translations = {
    left: 'esquerda',
    right: 'direita',
    'slight left': 'esquerda',
    'slight right': 'direita',
    'sharp left': 'esquerda',
    'sharp right': 'direita',
    straight: 'frente',
  };
  return translations[modifier] || modifier;
}

/**
 * Brazilian CEP (zip code) lookup.
 * @param {string} cep - Brazilian CEP (8 digits)
 * @returns {Promise<Object|null>} Address data or null
 */
export async function lookupCEP(cep) {
  const cleanCep = cep.replace(/\D/g, '').slice(0, 8);
  if (cleanCep.length !== 8) return null;
  
  try {
    // Try backend API first
    const response = await api.get(`/geocoding/cep/${cleanCep}/`);
    return response.data;
  } catch (error) {
    console.warn('Backend CEP lookup failed, falling back to ViaCEP:', error);
    // Fallback to direct ViaCEP
    return lookupCEPDirect(cleanCep);
  }
}

/**
 * Direct ViaCEP lookup (fallback).
 */
async function lookupCEPDirect(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.erro) return null;
    
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
    console.error('Direct CEP lookup failed:', error);
    return null;
  }
}

/**
 * Geocode a Brazilian address using CEP for better accuracy.
 * @param {string} cep - Brazilian CEP
 * @param {Object} addressData - Additional address data
 * @returns {Promise<Object|null>} Location object or null
 */
export async function geocodeBrazilianAddress(cep, addressData = {}) {
  try {
    const response = await api.post('/geocoding/geocode-brazilian/', {
      cep,
      address: addressData.address || '',
      city: addressData.city || '',
      state: addressData.state || '',
    });
    return response.data;
  } catch (error) {
    console.warn('Backend Brazilian geocoding failed:', error);
    
    // Fallback: lookup CEP and geocode
    const cepData = await lookupCEP(cep);
    if (!cepData) return null;
    
    const query = [
      addressData.address || cepData.address,
      cepData.neighborhood,
      addressData.city || cepData.city,
      addressData.state || cepData.state,
      'Brasil',
    ].filter(Boolean).join(', ');
    
    const results = await geocodeAddress(query, { limit: 1 });
    if (results.length > 0) {
      return {
        ...results[0],
        zip_code: cepData.cep,
      };
    }
    
    return null;
  }
}

/**
 * Get user's current location using browser geolocation.
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location coordinates
 */
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
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
        let message = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            message = 'Tempo esgotado ao obter localização';
            break;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

/**
 * Build address string from address components.
 */
function buildAddressString(address) {
  if (!address) return '';
  
  const parts = [];
  if (address.road) {
    let road = address.road;
    if (address.house_number) {
      road = `${road}, ${address.house_number}`;
    }
    parts.push(road);
  }
  if (address.suburb || address.neighbourhood) {
    parts.push(address.suburb || address.neighbourhood);
  }
  return parts.join(', ');
}

/**
 * Calculate haversine distance between two points in km.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
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
};
