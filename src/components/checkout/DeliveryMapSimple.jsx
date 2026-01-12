/**
 * DeliveryMapSimple - Simplified map component for delivery location selection
 * 
 * Features:
 * - Store marker (fixed)
 * - Customer marker (draggable or fixed)
 * - Route line between store and customer
 * - CEP/Address search
 * - GPS location detection
 */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../styles/DeliveryMap.module.css';

// HERE Maps configuration
const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY || '';
const HERE_API_VERSION = '3.1';

// CDN URLs
const HERE_SCRIPTS = [
  `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-core.js`,
  `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-service.js`,
  `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-mapevents.js`,
  `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-ui.js`,
];
const HERE_CSS = `https://js.api.here.com/v3/${HERE_API_VERSION}/mapsjs-ui.css`;

// Colors
const COLORS = {
  marsala: '#722F37',
  gold: '#D4AF37',
  route: '#722F37',
};

// Store marker SVG - Pin vermelho com "P" de Pastita
const STORE_MARKER_SVG = `
<svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow1" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M25 0C11.2 0 0 11.2 0 25c0 20 25 35 25 35s25-15 25-35C50 11.2 38.8 0 25 0z" 
        fill="#722F37" stroke="#fff" stroke-width="3" filter="url(#shadow1)"/>
  <circle cx="25" cy="22" r="14" fill="#fff"/>
  <text x="25" y="28" text-anchor="middle" fill="#722F37" font-size="16" font-weight="bold" font-family="Arial, sans-serif">P</text>
</svg>
`;

// Customer marker SVG - Pin dourado com ícone de pessoa
const CUSTOMER_MARKER_SVG = `
<svg width="44" height="54" viewBox="0 0 44 54" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M22 0C9.85 0 0 9.85 0 22c0 17 22 32 22 32s22-15 22-32C44 9.85 34.15 0 22 0z" 
        fill="#D4AF37" stroke="#fff" stroke-width="2" filter="url(#shadow2)"/>
  <circle cx="22" cy="16" r="7" fill="#fff"/>
  <path d="M12 32c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#fff" stroke="#fff" stroke-width="1"/>
</svg>
`;

// Load script helper
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load CSS helper
const loadCSS = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

// Global state for HERE Maps
let hereMapsLoaded = false;
let hereMapsLoading = null;

const loadHereMaps = async () => {
  if (hereMapsLoaded) return;
  if (hereMapsLoading) return hereMapsLoading;
  
  hereMapsLoading = (async () => {
    for (const src of HERE_SCRIPTS) {
      await loadScript(src);
    }
    loadCSS(HERE_CSS);
    hereMapsLoaded = true;
  })();
  
  return hereMapsLoading;
};

const DeliveryMapSimple = ({
  storeLocation,
  customerLocation = null,
  routePolyline = null,
  onLocationSelect,
  onAddressFound,
  enableSelection = true,
  showSearch = true,
  showGpsButton = true,
  height = '350px',
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const platformRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const behaviorRef = useRef(null);
  
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    
    const initMap = async () => {
      try {
        await loadHereMaps();
        if (!mounted || !mapContainerRef.current) return;
        
        const H = window.H;
        
        // Create platform
        const platform = new H.service.Platform({ apikey: HERE_API_KEY });
        platformRef.current = platform;
        
        // Create map
        const defaultLayers = platform.createDefaultLayers();
        const center = storeLocation 
          ? { lat: storeLocation.latitude, lng: storeLocation.longitude }
          : { lat: -10.1847, lng: -48.3336 };
        
        const map = new H.Map(
          mapContainerRef.current,
          defaultLayers.vector.normal.map,
          { zoom: 14, center, pixelRatio: window.devicePixelRatio || 1 }
        );
        mapRef.current = map;
        
        // Add interaction
        const mapEvents = new H.mapevents.MapEvents(map);
        const behavior = new H.mapevents.Behavior(mapEvents);
        behaviorRef.current = behavior;
        
        // Add UI
        H.ui.UI.createDefault(map, defaultLayers);
        
        // Handle resize
        const resizeHandler = () => map.getViewPort().resize();
        window.addEventListener('resize', resizeHandler);
        
        // Add store marker - always visible
        if (storeLocation && storeLocation.latitude && storeLocation.longitude) {
          const storeIcon = new H.map.Icon(STORE_MARKER_SVG, { 
            size: { w: 50, h: 60 }, 
            anchor: { x: 25, y: 60 } 
          });
          const storeMarker = new H.map.Marker(
            { lat: storeLocation.latitude, lng: storeLocation.longitude },
            { icon: storeIcon, zIndex: 100 }
          );
          map.addObject(storeMarker);
          storeMarkerRef.current = storeMarker;
          console.log('Store marker added at:', storeLocation.latitude, storeLocation.longitude);
        }
        
        // Add click handler for selection
        if (enableSelection) {
          map.addEventListener('tap', handleMapTap);
        }
        
        setIsReady(true);
        
        // Cleanup
        return () => {
          window.removeEventListener('resize', resizeHandler);
          map.dispose();
        };
      } catch (err) {
        console.error('Map init error:', err);
        if (mounted) setError('Erro ao carregar o mapa');
      }
    };
    
    initMap();
    
    return () => {
      mounted = false;
    };
  }, [storeLocation]);

  // Update customer marker when location changes
  useEffect(() => {
    if (!isReady || !mapRef.current || !customerLocation) return;
    
    const H = window.H;
    const map = mapRef.current;
    const lat = customerLocation.lat || customerLocation.latitude;
    const lng = customerLocation.lng || customerLocation.longitude;
    
    if (!lat || !lng) return;
    
    console.log('Adding customer marker at:', lat, lng);
    
    // Remove existing marker
    if (customerMarkerRef.current) {
      try {
        map.removeObject(customerMarkerRef.current);
      } catch (e) {}
      customerMarkerRef.current = null;
    }
    
    // Create new marker with customer icon
    const customerIcon = new H.map.Icon(CUSTOMER_MARKER_SVG, { 
      size: { w: 44, h: 54 }, 
      anchor: { x: 22, y: 54 } 
    });
    const marker = new H.map.Marker({ lat, lng }, { icon: customerIcon, zIndex: 200 });
    
    if (enableSelection) {
      marker.draggable = true;
    }
    
    map.addObject(marker);
    customerMarkerRef.current = marker;
    
    // Center map to show both markers with padding
    if (storeLocation && storeLocation.latitude && storeLocation.longitude) {
      fitMapToBounds(map, storeLocation, { lat, lng });
    } else {
      map.setCenter({ lat, lng });
      map.setZoom(16);
    }
  }, [customerLocation, isReady, enableSelection, storeLocation]);
  
  // Handle marker dragging separately
  useEffect(() => {
    if (!isReady || !mapRef.current || !enableSelection) return;
    
    const map = mapRef.current;
    
    const onDragStart = (ev) => {
      if (ev.target === customerMarkerRef.current) {
        behaviorRef.current?.disable();
      }
    };
    
    const onDrag = (ev) => {
      if (ev.target === customerMarkerRef.current) {
        const pointer = ev.currentPointer;
        const geoPoint = map.screenToGeo(pointer.viewportX, pointer.viewportY);
        ev.target.setGeometry(geoPoint);
      }
    };
    
    const onDragEnd = (ev) => {
      behaviorRef.current?.enable();
      if (ev.target === customerMarkerRef.current) {
        const geo = ev.target.getGeometry();
        handleLocationSelected(geo.lat, geo.lng);
      }
    };
    
    map.addEventListener('dragstart', onDragStart);
    map.addEventListener('drag', onDrag);
    map.addEventListener('dragend', onDragEnd);
    
    return () => {
      map.removeEventListener('dragstart', onDragStart);
      map.removeEventListener('drag', onDrag);
      map.removeEventListener('dragend', onDragEnd);
    };
  }, [isReady, enableSelection]);

  // Update route line when polyline changes
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    
    const H = window.H;
    const map = mapRef.current;
    
    // Remove existing route
    if (routeLineRef.current) {
      try {
        map.removeObject(routeLineRef.current);
      } catch (e) {}
      routeLineRef.current = null;
    }
    
    // Add new route if polyline provided
    if (routePolyline && typeof routePolyline === 'string') {
      try {
        console.log('Drawing route polyline');
        const lineString = H.geo.LineString.fromFlexiblePolyline(routePolyline);
        const polyline = new H.map.Polyline(lineString, {
          style: {
            strokeColor: COLORS.route,
            lineWidth: 6,
            lineCap: 'round',
            lineJoin: 'round',
            lineHeadCap: 'arrow-head',
            lineTailCap: 'arrow-tail'
          },
          zIndex: 50
        });
        map.addObject(polyline);
        routeLineRef.current = polyline;
        
        // Fit map to show entire route
        const bounds = polyline.getBoundingBox();
        if (bounds) {
          map.getViewModel().setLookAtData({ bounds }, true);
          setTimeout(() => {
            const currentZoom = map.getZoom();
            if (currentZoom > 14) map.setZoom(14);
            if (currentZoom < 10) map.setZoom(10);
          }, 200);
        }
      } catch (err) {
        console.error('Error creating route line:', err);
      }
    }
  }, [routePolyline, isReady]);

  // Fit map to show both store and customer with padding
  const fitMapToBounds = (map, store, customer) => {
    const H = window.H;
    
    const storeLat = store.latitude || store.lat;
    const storeLng = store.longitude || store.lng;
    const custLat = customer.lat;
    const custLng = customer.lng;
    
    if (!storeLat || !storeLng || !custLat || !custLng) return;
    
    // Calculate bounds manually with padding
    const minLat = Math.min(storeLat, custLat);
    const maxLat = Math.max(storeLat, custLat);
    const minLng = Math.min(storeLng, custLng);
    const maxLng = Math.max(storeLng, custLng);
    
    // Add 20% padding
    const latPadding = (maxLat - minLat) * 0.2 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.2 || 0.01;
    
    const bounds = new H.geo.Rect(
      maxLat + latPadding,
      minLng - lngPadding,
      minLat - latPadding,
      maxLng + lngPadding
    );
    
    map.getViewModel().setLookAtData({ bounds }, true);
    
    // Ensure reasonable zoom level
    setTimeout(() => {
      const currentZoom = map.getZoom();
      if (currentZoom > 15) map.setZoom(15);
      if (currentZoom < 10) map.setZoom(10);
    }, 200);
  };

  // Handle map tap
  const handleMapTap = useCallback((evt) => {
    if (!enableSelection || !mapRef.current) return;
    
    const coord = mapRef.current.screenToGeo(
      evt.currentPointer.viewportX,
      evt.currentPointer.viewportY
    );
    
    handleLocationSelected(coord.lat, coord.lng);
  }, [enableSelection]);

  // Handle location selection
  const handleLocationSelected = async (lat, lng) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reverse geocode to get address
      const address = await reverseGeocodeHERE(lat, lng);
      
      onLocationSelect?.({ lat, lng, ...address });
      onAddressFound?.(address);
    } catch (err) {
      console.error('Reverse geocode error:', err);
      onLocationSelect?.({ lat, lng });
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocode using HERE API
  const reverseGeocodeHERE = async (lat, lng) => {
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=pt-BR&apikey=${HERE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const addr = item.address || {};
      
      // Build a clean address display
      let streetDisplay = addr.street || '';
      if (addr.houseNumber) {
        streetDisplay = `${streetDisplay}, ${addr.houseNumber}`;
      }
      
      return {
        street: addr.street || '',
        number: addr.houseNumber || '',
        neighborhood: addr.district || '',
        city: addr.city || '',
        state: addr.stateCode || '',
        zip_code: addr.postalCode || '',
        formatted_address: addr.label || '',
        display_name: streetDisplay || addr.label || '',
      };
    }
    
    return {};
  };

  // Handle GPS button click
  const handleGetGPS = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });
      
      const { latitude, longitude } = position.coords;
      await handleLocationSelected(latitude, longitude);
    } catch (err) {
      const messages = {
        1: 'Permissão de localização negada',
        2: 'Localização indisponível',
        3: 'Tempo esgotado'
      };
      setError(messages[err.code] || 'Erro ao obter localização');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Check if it's a CEP (8 digits)
    const cleanQuery = query.replace(/\D/g, '');
    if (cleanQuery.length === 8) {
      searchTimeoutRef.current = setTimeout(() => searchByCEP(cleanQuery), 300);
      return;
    }
    
    // Search by address
    searchTimeoutRef.current = setTimeout(() => searchByAddress(query), 400);
  };

  // Search by CEP using ViaCEP + HERE geocoding
  const searchByCEP = async (cep) => {
    setIsLoading(true);
    try {
      // First get address from ViaCEP
      const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const viaCepData = await viaCepResponse.json();
      
      if (viaCepData.erro) {
        setSearchResults([]);
        setShowResults(false);
        setError('CEP não encontrado');
        return;
      }
      
      // Build search query for HERE
      const searchAddress = [
        viaCepData.logradouro,
        viaCepData.bairro,
        viaCepData.localidade,
        viaCepData.uf,
        'Brasil'
      ].filter(Boolean).join(', ');
      
      // Geocode with HERE
      const hereResponse = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchAddress)}&in=countryCode:BRA&limit=1&apikey=${HERE_API_KEY}`
      );
      const hereData = await hereResponse.json();
      
      if (hereData.items && hereData.items.length > 0) {
        const item = hereData.items[0];
        setSearchResults([{
          display_name: `${viaCepData.logradouro || ''}, ${viaCepData.bairro || ''}, ${viaCepData.localidade} - ${viaCepData.uf}`,
          latitude: item.position.lat,
          longitude: item.position.lng,
          address: {
            street: viaCepData.logradouro || '',
            neighborhood: viaCepData.bairro || '',
            city: viaCepData.localidade || '',
            state: viaCepData.uf || '',
            zip_code: cep,
          }
        }]);
        setShowResults(true);
      } else {
        setError('Endereço não encontrado para este CEP');
      }
    } catch (err) {
      console.error('CEP search error:', err);
      setError('Erro ao buscar CEP');
    } finally {
      setIsLoading(false);
    }
  };

  // Search by address using HERE Autosuggest
  const searchByAddress = async (query) => {
    try {
      // Use store location as center for better results
      const center = storeLocation 
        ? `${storeLocation.latitude},${storeLocation.longitude}`
        : '-10.1847,-48.3336';
      
      const response = await fetch(
        `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&at=${center}&in=countryCode:BRA&limit=5&apikey=${HERE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const results = data.items
          .filter(item => item.position)
          .map(item => ({
            display_name: item.title,
            latitude: item.position.lat,
            longitude: item.position.lng,
            address: item.address || {}
          }));
        
        setSearchResults(results);
        setShowResults(results.length > 0);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (err) {
      console.error('Address search error:', err);
    }
  };

  // Handle search result selection
  const handleResultSelect = async (result) => {
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchResults([]);
    
    if (result.latitude && result.longitude) {
      await handleLocationSelected(result.latitude, result.longitude);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultSelect(searchResults[0]);
    }
  };

  // Close results on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.mapContainer}>
      {/* Search bar */}
      {showSearch && (
        <div className={styles.searchWrapper} ref={resultsRef}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Digite o CEP ou endereço..."
              className={styles.searchInput}
            />
            {isLoading && <span className={styles.searchSpinner}>⏳</span>}
          </form>
          
          {showResults && searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  className={styles.searchResultItem}
                >
                  <span className={styles.resultIcon}>📍</span>
                  <span className={styles.resultText}>{result.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* GPS Button */}
      {showGpsButton && enableSelection && (
        <button 
          type="button"
          onClick={handleGetGPS}
          className={styles.gpsButton}
          disabled={isLoading}
          title="Usar minha localização"
        >
          📍 Usar minha localização
        </button>
      )}
      
      {/* Error message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className={styles.map}
        style={{ height }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendMarker} style={{ backgroundColor: COLORS.marsala }}>P</span>
          <span>Loja</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendMarker} style={{ backgroundColor: COLORS.gold }}>👤</span>
          <span>Você</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMapSimple;
