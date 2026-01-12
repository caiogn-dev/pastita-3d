/**
 * HERE Maps Service
 * Core service for HERE Maps JavaScript API integration
 */

import logger from './logger';

// HERE Maps API configuration
const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY || '';
const HERE_API_VERSION = '3.1';

// CDN URLs for HERE Maps
const HERE_CORE_JS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-core.js`;
const HERE_SERVICE_JS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-service.js`;
const HERE_UI_JS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-ui.js`;
const HERE_EVENTS_JS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-mapevents.js`;
const HERE_CLUSTERING_JS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-clustering.js`;
const HERE_UI_CSS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-ui.css`;

// Default map center - Ivoneth Banqueteria/Pastita (Palmas, TO)
const DEFAULT_CENTER = { lat: -10.1854332, lng: -48.3038653 };
const DEFAULT_ZOOM = 13;

// Pastita brand colors
const PASTITA_COLORS = {
  marsala: '#722F37',
  marsalaDark: '#4a1e23',
  gold: '#D4AF37',
  cream: '#FDFBF7',
  zoneFill: 'rgba(114, 47, 55, 0.2)',
  zoneStroke: '#722F37',
  routeColor: '#722F37',
  isochoneFill: 'rgba(212, 175, 55, 0.15)',
  isochroneStroke: '#D4AF37'
};

let platform = null;
let isLoaded = false;
let loadPromise = null;

/**
 * Load HERE Maps scripts dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load HERE Maps CSS
 */
function loadCSS(href) {
  return new Promise((resolve) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

/**
 * Initialize HERE Maps platform
 */
export async function initHereMaps() {
  if (isLoaded && platform) {
    return platform;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Load scripts in order
      await loadScript(HERE_CORE_JS);
      await loadScript(HERE_SERVICE_JS);
      await loadScript(HERE_EVENTS_JS);
      await loadScript(HERE_UI_JS);
      await loadScript(HERE_CLUSTERING_JS);
      await loadCSS(HERE_UI_CSS);

      // Initialize platform
      platform = new window.H.service.Platform({
        apikey: HERE_API_KEY
      });

      isLoaded = true;
      logger.mapEvent('HERE Maps initialized successfully');
      return platform;
    } catch (error) {
      logger.error('Failed to load HERE Maps', error);
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Get HERE Maps platform instance
 */
export function getPlatform() {
  if (!platform) {
    throw new Error('HERE Maps not initialized. Call initHereMaps() first.');
  }
  return platform;
}

/**
 * Create a new map instance
 */
export function createMap(container, options = {}) {
  const H = window.H;
  const plt = getPlatform();
  const defaultLayers = plt.createDefaultLayers();

  const mapOptions = {
    zoom: options.zoom || DEFAULT_ZOOM,
    center: options.center || DEFAULT_CENTER,
    pixelRatio: window.devicePixelRatio || 1
  };

  const map = new H.Map(
    container,
    defaultLayers.vector.normal.map,
    mapOptions
  );

  // Enable map interaction
  const mapEvents = new H.mapevents.MapEvents(map);
  const behavior = new H.mapevents.Behavior(mapEvents);

  // Add default UI (zoom controls, etc.)
  const ui = H.ui.UI.createDefault(map, defaultLayers);

  // Handle window resize
  const resizeHandler = () => map.getViewPort().resize();
  window.addEventListener('resize', resizeHandler);

  return {
    map,
    behavior,
    ui,
    defaultLayers,
    cleanup: () => {
      window.removeEventListener('resize', resizeHandler);
      map.dispose();
    }
  };
}

/**
 * Create a marker
 */
export function createMarker(coords, options = {}) {
  const H = window.H;
  const position = { lat: coords.lat || coords.latitude, lng: coords.lng || coords.longitude };

  let marker;
  if (options.icon) {
    const icon = new H.map.Icon(options.icon, options.iconOptions || {});
    marker = new H.map.Marker(position, { icon });
  } else if (options.svgIcon) {
    const icon = new H.map.Icon(options.svgIcon, options.iconOptions || {});
    marker = new H.map.Marker(position, { icon });
  } else {
    marker = new H.map.Marker(position);
  }

  if (options.draggable) {
    marker.draggable = true;
  }

  if (options.data) {
    marker.setData(options.data);
  }

  return marker;
}

/**
 * Create a store marker with custom icon (Pastita logo style)
 */
export function createStoreMarker(coords) {
  logger.info('createStoreMarker called with coords:', coords);
  const svgIcon = `<svg width="48" height="56" xmlns="http://www.w3.org/2000/svg"><path d="M24 0C10.745 0 0 10.745 0 24c0 18 24 32 24 32s24-14 24-32C48 10.745 37.255 0 24 0z" fill="#722F37" stroke="white" stroke-width="3"/><circle cx="24" cy="20" r="12" fill="white"/><text x="24" y="25" text-anchor="middle" fill="#722F37" font-size="12" font-weight="bold">P</text></svg>`;
  
  try {
    const marker = createMarker(coords, { 
      svgIcon, 
      iconOptions: { size: { w: 48, h: 56 }, anchor: { x: 24, y: 56 } },
      data: { type: 'store' }
    });
    logger.info('Store marker created successfully');
    return marker;
  } catch (error) {
    logger.error('Failed to create store marker:', error);
    // Fallback to default marker
    return createMarker(coords, { data: { type: 'store' } });
  }
}

/**
 * Create a customer/delivery marker (user location)
 */
export function createDeliveryMarker(coords, options = {}) {
  logger.info('createDeliveryMarker called with coords:', coords);
  const svgIcon = `<svg width="40" height="48" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 28 20 28s20-13 20-28C40 8.954 31.046 0 20 0z" fill="#D4AF37" stroke="white" stroke-width="2"/><circle cx="20" cy="16" r="8" fill="white"/></svg>`;
  
  try {
    const marker = createMarker(coords, { 
      svgIcon, 
      iconOptions: { size: { w: 40, h: 48 }, anchor: { x: 20, y: 48 } },
      draggable: options.draggable,
      data: { type: 'customer', ...options.data }
    });
    logger.info('Delivery marker created successfully');
    return marker;
  } catch (error) {
    logger.error('Failed to create delivery marker:', error);
    return createMarker(coords, { draggable: options.draggable, data: { type: 'customer' } });
  }
}

/**
 * Create a simple location pin marker
 */
export function createLocationPin(coords, options = {}) {
  const color = options.color || '#E53935';
  const svgIcon = `
    <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="white"/>
    </svg>
  `;
  return createMarker(coords, { 
    svgIcon, 
    iconOptions: { size: { w: 32, h: 40 }, anchor: { x: 16, y: 40 } },
    draggable: options.draggable,
    data: options.data
  });
}

/**
 * Create a circle (delivery zone)
 */
export function createCircle(center, radiusMeters, options = {}) {
  const H = window.H;
  const position = { lat: center.lat || center.latitude, lng: center.lng || center.longitude };

  const circle = new H.map.Circle(position, radiusMeters, {
    style: {
      fillColor: options.fillColor || PASTITA_COLORS.zoneFill,
      strokeColor: options.strokeColor || PASTITA_COLORS.zoneStroke,
      lineWidth: options.lineWidth || 2
    }
  });

  if (options.data) {
    circle.setData(options.data);
  }

  return circle;
}

/**
 * Create a polygon (custom zone)
 */
export function createPolygon(coordinates, options = {}) {
  const H = window.H;
  
  // Convert coordinates array to LineString
  const lineString = new H.geo.LineString();
  coordinates.forEach(coord => {
    lineString.pushPoint({ lat: coord.lat || coord[0], lng: coord.lng || coord[1] });
  });

  const polygon = new H.map.Polygon(lineString, {
    style: {
      fillColor: options.fillColor || PASTITA_COLORS.zoneFill,
      strokeColor: options.strokeColor || PASTITA_COLORS.zoneStroke,
      lineWidth: options.lineWidth || 2
    }
  });

  if (options.data) {
    polygon.setData(options.data);
  }

  return polygon;
}

/**
 * Create a polyline (route)
 */
export function createPolyline(coordinates, options = {}) {
  const H = window.H;
  logger.info('createPolyline called', { 
    type: typeof coordinates, 
    isString: typeof coordinates === 'string',
    length: typeof coordinates === 'string' ? coordinates.length : coordinates?.length 
  });
  
  try {
    let lineString;
    if (typeof coordinates === 'string') {
      // Flexible polyline encoded string
      lineString = H.geo.LineString.fromFlexiblePolyline(coordinates);
      logger.info('Polyline decoded from flexible polyline string');
    } else {
      // Array of coordinates
      lineString = new H.geo.LineString();
      coordinates.forEach(coord => {
        lineString.pushPoint({ lat: coord.lat || coord[0], lng: coord.lng || coord[1] });
      });
      logger.info('Polyline created from coordinate array');
    }

    const polyline = new H.map.Polyline(lineString, {
      style: {
        strokeColor: options.strokeColor || PASTITA_COLORS.routeColor,
        lineWidth: options.lineWidth || 4,
        lineCap: 'round',
        lineJoin: 'round'
      }
    });
    logger.info('Polyline object created successfully');
    return polyline;
  } catch (error) {
    logger.error('Failed to create polyline:', error);
    throw error;
  }
}

/**
 * Create an info bubble
 */
export function createInfoBubble(coords, content, ui) {
  const H = window.H;
  const position = { lat: coords.lat || coords.latitude, lng: coords.lng || coords.longitude };
  
  const bubble = new H.ui.InfoBubble(position, { content });
  ui.addBubble(bubble);
  
  return bubble;
}

/**
 * Check if a point is inside a circle
 */
export function isPointInCircle(point, circleCenter, radiusMeters) {
  const H = window.H;
  const p = new H.geo.Point(point.lat || point.latitude, point.lng || point.longitude);
  const c = new H.geo.Point(circleCenter.lat || circleCenter.latitude, circleCenter.lng || circleCenter.longitude);
  
  return p.distance(c) <= radiusMeters;
}

/**
 * Check if a point is inside a polygon
 */
export function isPointInPolygon(point, polygon) {
  const geometry = polygon.getGeometry();
  const p = { lat: point.lat || point.latitude, lng: point.lng || point.longitude };
  
  return geometry.containsPoint(p);
}

/**
 * Calculate distance between two points (in meters)
 */
export function calculateDistance(point1, point2) {
  const H = window.H;
  const p1 = new H.geo.Point(point1.lat || point1.latitude, point1.lng || point1.longitude);
  const p2 = new H.geo.Point(point2.lat || point2.latitude, point2.lng || point2.longitude);
  
  return p1.distance(p2);
}

/**
 * Fit map to show all objects
 */
export function fitMapToObjects(map, objects) {
  const H = window.H;
  const group = new H.map.Group();
  
  objects.forEach(obj => group.addObject(obj));
  
  const bounds = group.getBoundingBox();
  if (bounds) {
    map.getViewModel().setLookAtData({ bounds }, true);
  }
  
  // Clean up - remove from group but don't dispose
  group.removeAll();
}

/**
 * Set map center with animation
 */
export function setMapCenter(map, coords, zoom = null) {
  const position = { lat: coords.lat || coords.latitude, lng: coords.lng || coords.longitude };
  
  const lookAtData = { position };
  if (zoom !== null) {
    lookAtData.zoom = zoom;
  }
  
  map.getViewModel().setLookAtData(lookAtData, true);
}

/**
 * Enable dragging for map objects
 */
export function enableObjectDragging(map, behavior, onDragEnd) {
  const H = window.H;

  map.addEventListener('dragstart', (ev) => {
    const target = ev.target;
    if (target instanceof H.map.Marker || target instanceof H.map.Circle) {
      behavior.disable();
    }
  }, false);

  map.addEventListener('drag', (ev) => {
    const target = ev.target;
    const pointer = ev.currentPointer;

    if (target instanceof H.map.Marker) {
      const geoPoint = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      target.setGeometry(geoPoint);
    } else if (target instanceof H.map.Circle) {
      const geoPoint = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      target.setCenter(geoPoint);
    }
  }, false);

  map.addEventListener('dragend', (ev) => {
    const target = ev.target;
    behavior.enable();

    if (onDragEnd) {
      if (target instanceof H.map.Marker) {
        const geo = target.getGeometry();
        onDragEnd({ type: 'marker', target, position: { lat: geo.lat, lng: geo.lng } });
      } else if (target instanceof H.map.Circle) {
        const center = target.getCenter();
        onDragEnd({ type: 'circle', target, center: { lat: center.lat, lng: center.lng }, radius: target.getRadius() });
      }
    }
  }, false);
}

/**
 * Get routing service
 */
export function getRoutingService() {
  const plt = getPlatform();
  return plt.getRoutingService(null, 8);
}

/**
 * Get isoline routing service
 */
export function getIsolineService() {
  const plt = getPlatform();
  // Isoline service uses the platform directly
  return {
    calculateIsoline: (params, onSuccess, onError) => {
      const url = `https://isoline.router.hereapi.com/v8/isolines?apikey=${HERE_API_KEY}&${new URLSearchParams(params).toString()}`;
      fetch(url)
        .then(res => res.json())
        .then(onSuccess)
        .catch(onError);
    }
  };
}

// =============================================================================
// GEOCODING FUNCTIONS (replacing geocoding.js)
// =============================================================================

const HERE_GEOCODE_URL = 'https://geocode.search.hereapi.com/v1/geocode';
const HERE_REVGEOCODE_URL = 'https://revgeocode.search.hereapi.com/v1/revgeocode';
const HERE_AUTOSUGGEST_URL = 'https://autosuggest.search.hereapi.com/v1/autosuggest';
const HERE_ROUTING_URL = 'https://router.hereapi.com/v8/routes';
const VIACEP_URL = 'https://viacep.com.br/ws';
const REQUEST_TIMEOUT = 10000;

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
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
 * Forward geocoding - convert address to coordinates
 */
// Palmas, TO bounding box (approximate)
const PALMAS_BOUNDS = {
  south: -10.35,
  north: -10.10,
  west: -48.45,
  east: -48.25
};

export async function geocodeAddress(query, options = {}) {
  const { countryCodes = ['BRA'], limit = 5, restrictToPalmas = true } = options;

  if (!query || query.trim().length < 3) {
    return [];
  }

  if (!HERE_API_KEY) {
    logger.warn('HERE API key not configured');
    return [];
  }

  try {
    // Add "Palmas TO" to query if not already present to improve results
    let searchQuery = query;
    const queryLower = query.toLowerCase();
    if (restrictToPalmas && !queryLower.includes('palmas') && !queryLower.includes('tocantins')) {
      searchQuery = `${query}, Palmas, TO`;
    }

    const params = new URLSearchParams({
      q: searchQuery,
      in: `countryCode:${countryCodes.join(',')}`,
      limit: String(limit * 2), // Request more to filter
      apikey: HERE_API_KEY,
    });

    // Add bounding box to restrict to Palmas area
    if (restrictToPalmas) {
      params.set('in', `bbox:${PALMAS_BOUNDS.west},${PALMAS_BOUNDS.south},${PALMAS_BOUNDS.east},${PALMAS_BOUNDS.north}`);
    }

    const response = await fetchWithTimeout(`${HERE_GEOCODE_URL}?${params}`);
    if (!response.ok) throw new Error(`HERE Geocode API error: ${response.status}`);

    const data = await response.json();
    if (!data.items || data.items.length === 0) return [];

    let results = data.items.map((item) => ({
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

    // Filter to only Palmas, TO results
    if (restrictToPalmas) {
      results = results.filter(r => {
        const cityLower = (r.city || '').toLowerCase();
        const stateLower = (r.state || '').toLowerCase();
        return (cityLower.includes('palmas') || cityLower === '') && 
               (stateLower === 'to' || stateLower === 'tocantins' || stateLower === '');
      });
    }

    return results.slice(0, limit);
  } catch (error) {
    logger.error('Geocoding error', error);
    return [];
  }
}

/**
 * Reverse geocoding - convert coordinates to address
 */
export async function reverseGeocode(latitude, longitude) {
  if (!HERE_API_KEY) {
    logger.warn('HERE API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      at: `${latitude},${longitude}`,
      lang: 'pt-BR',
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_REVGEOCODE_URL}?${params}`);
    if (!response.ok) throw new Error(`HERE Reverse Geocode API error: ${response.status}`);

    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

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
    logger.error('Reverse geocoding error', error);
    return null;
  }
}

/**
 * Address autocomplete suggestions
 */
export async function getAddressSuggestions(query, options = {}) {
  const { countryCodes = ['BRA'], limit = 8, center = null } = options;

  if (!query || query.trim().length < 3) return [];
  if (!HERE_API_KEY) return [];

  try {
    // HERE Autosuggest API requires 'at' parameter
    // Use center if provided, otherwise use default (Palmas, TO)
    const atParam = center 
      ? `${center.lat || center.latitude},${center.lng || center.longitude}`
      : `${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng}`;

    const params = new URLSearchParams({
      q: query,
      at: atParam,
      in: `countryCode:${countryCodes.join(',')}`,
      limit: String(limit),
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_AUTOSUGGEST_URL}?${params}`);
    if (!response.ok) throw new Error(`HERE Autosuggest API error: ${response.status}`);

    const data = await response.json();
    if (!data.items || data.items.length === 0) return [];

    return data.items
      .filter((item) => item.position)
      .map((item) => ({
        display_name: item.title,
        latitude: item.position.lat,
        longitude: item.position.lng,
        place_id: item.id,
        address_type: item.resultType,
        address: item.address || {},
      }));
  } catch (error) {
    logger.error('Suggestions error', error);
    return [];
  }
}

/**
 * Calculate route between two points
 */
export async function calculateRouteAPI(origin, destination, options = {}) {
  const { transportMode = 'car' } = options;

  if (!HERE_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      transportMode,
      return: 'summary,polyline',
      apikey: HERE_API_KEY,
    });

    const response = await fetchWithTimeout(`${HERE_ROUTING_URL}?${params}`);
    if (!response.ok) throw new Error(`HERE Routing API error: ${response.status}`);

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const section = route.sections[0];

    return {
      distance_km: parseFloat((section.summary.length / 1000).toFixed(2)),
      duration_minutes: Math.round(section.summary.duration / 60),
      polyline: section.polyline,
      summary: `${(section.summary.length / 1000).toFixed(1)} km • ${Math.round(section.summary.duration / 60)} min`,
    };
  } catch (error) {
    logger.error('Routing error', error);
    return null;
  }
}

/**
 * Brazilian CEP lookup using ViaCEP
 */
export async function lookupCEP(cep) {
  const cleanCep = cep.replace(/\D/g, '').slice(0, 8);
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetchWithTimeout(`${VIACEP_URL}/${cleanCep}/json/`);
    if (!response.ok) throw new Error(`ViaCEP API error: ${response.status}`);

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
    logger.error('CEP lookup error', error);
    return null;
  }
}

/**
 * Geocode Brazilian address using CEP + HERE Maps
 * Only accepts addresses in Palmas, TO
 */
export async function geocodeBrazilianAddress(cep, addressData = {}) {
  const cepData = await lookupCEP(cep);

  // Validate that the CEP is from Palmas, TO
  if (cepData) {
    const city = (cepData.city || '').toLowerCase();
    const state = (cepData.state || '').toLowerCase();
    if (!city.includes('palmas') || (state !== 'to' && state !== 'tocantins')) {
      logger.warn('CEP is not from Palmas, TO:', cepData);
      return {
        error: true,
        message: 'Desculpe, só entregamos em Palmas - TO',
        city: cepData.city,
        state: cepData.state
      };
    }
  }

  const queryParts = [];
  if (addressData.address) {
    queryParts.push(addressData.address);
  } else if (cepData?.address) {
    queryParts.push(cepData.address);
  }
  if (addressData.number) queryParts.push(addressData.number);
  if (cepData?.neighborhood) queryParts.push(cepData.neighborhood);
  // Always use Palmas, TO
  queryParts.push('Palmas');
  queryParts.push('TO');
  queryParts.push('Brasil');

  const query = queryParts.filter(Boolean).join(', ');
  const results = await geocodeAddress(query, { limit: 1, restrictToPalmas: true });

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
 * Get user's current location using browser geolocation
 * Always requests fresh location (no cache) for accuracy
 */
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0, // Always get fresh location
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS: ${latitude}, ${longitude} (accuracy: ${Math.round(accuracy)}m)`);
        
        resolve({
          latitude,
          longitude,
          accuracy,
        });
      },
      (error) => {
        const messages = {
          1: 'Permissão de localização negada. Permita o acesso nas configurações do navegador.',
          2: 'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
          3: 'Tempo esgotado ao obter localização. Tente novamente.',
        };
        reject(new Error(messages[error.code] || 'Erro ao obter localização'));
      },
      defaultOptions
    );
  });
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

// Export constants
export { DEFAULT_CENTER, DEFAULT_ZOOM, PASTITA_COLORS, HERE_API_KEY };
