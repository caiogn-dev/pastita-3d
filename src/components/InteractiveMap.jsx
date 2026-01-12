'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initHereMaps,
  createMap,
  createDeliveryMarker,
  createStoreMarker,
  createCircle,
  createPolyline,
  setMapCenter,
  enableObjectDragging,
  calculateDistance,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  PASTITA_COLORS,
  lookupCEP,
  geocodeBrazilianAddress,
  getCurrentLocation,
  reverseGeocode
} from '../services/hereMapService';
import { calculateRouteWithPolyline, getRouteSummary } from '../services/hereRoutingService';
import logger from '../services/logger';

/**
 * Interactive Map Component using HERE Maps JavaScript API
 * 
 * Features:
 * - Click to select location
 * - Use current location (geolocation)
 * - Search for address (ViaCEP + HERE)
 * - Reverse geocoding on selection
 * - Draggable marker
 * - Route visualization
 * - Delivery zones display
 */
export default function InteractiveMap({
  initialLocation = null,
  storeLocation = null,
  onLocationSelect,
  onAddressChange,
  height = '400px',
  showSearch = true,
  showGeolocation = true,
  showMarker = true,
  markerDraggable = true,
  showRoute = false,
  showZones = false,
  zones = [],
  className = '',
  placeholder = 'Buscar endereço ou CEP...',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const zoneObjectsRef = useRef([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Initialize HERE Maps
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    const init = async () => {
      try {
        await initHereMaps();
        if (mounted) {
          setIsLoaded(true);
        }
      } catch (err) {
        logger.error('Failed to initialize HERE Maps', err);
        if (mounted) {
          setError('Erro ao carregar o mapa');
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Create map instance
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const center = initialLocation 
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : storeLocation
        ? { lat: storeLocation.latitude, lng: storeLocation.longitude }
        : DEFAULT_CENTER;

      const zoom = initialLocation || storeLocation ? 15 : DEFAULT_ZOOM;

      const instance = createMap(mapContainerRef.current, { center, zoom });
      mapInstanceRef.current = instance;

      // Add store marker if provided
      if (storeLocation) {
        const storeMarker = createStoreMarker({
          lat: storeLocation.latitude,
          lng: storeLocation.longitude
        });
        instance.map.addObject(storeMarker);
        storeMarkerRef.current = storeMarker;
      }

      // Add delivery marker if initial location
      if (initialLocation && showMarker) {
        const marker = createDeliveryMarker(
          { lat: initialLocation.latitude, lng: initialLocation.longitude },
          { draggable: markerDraggable }
        );
        instance.map.addObject(marker);
        markerRef.current = marker;
      }

      // Enable dragging if needed
      if (markerDraggable) {
        enableObjectDragging(instance.map, instance.behavior, handleDragEnd);
      }

      // Add click handler
      instance.map.addEventListener('tap', handleMapClick);

    } catch (err) {
      logger.error('Failed to create map', err);
      setError('Erro ao criar o mapa');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.cleanup();
        mapInstanceRef.current = null;
        markerRef.current = null;
        storeMarkerRef.current = null;
        routeLineRef.current = null;
        zoneObjectsRef.current = [];
      }
    };
  }, [isLoaded]);

  // Display zones
  useEffect(() => {
    if (!mapInstanceRef.current || !showZones) return;

    const map = mapInstanceRef.current.map;

    // Remove existing zone objects
    zoneObjectsRef.current.forEach(obj => {
      try {
        map.removeObject(obj);
      } catch (e) {
        // Object might already be removed
      }
    });
    zoneObjectsRef.current = [];

    // Add new zones
    zones.forEach((zone, index) => {
      if (zone.center && zone.radius) {
        const colors = [
          { fill: 'rgba(114, 47, 55, 0.15)', stroke: '#722F37' },
          { fill: 'rgba(212, 175, 55, 0.15)', stroke: '#D4AF37' },
          { fill: 'rgba(76, 175, 80, 0.15)', stroke: '#4CAF50' },
        ];
        const colorIndex = index % colors.length;
        
        const circle = createCircle(
          { lat: zone.center.latitude || zone.center.lat, lng: zone.center.longitude || zone.center.lng },
          zone.radius * 1000, // Convert km to meters
          {
            fillColor: colors[colorIndex].fill,
            strokeColor: colors[colorIndex].stroke,
            data: zone
          }
        );
        map.addObject(circle);
        zoneObjectsRef.current.push(circle);
      }
    });
  }, [zones, showZones, isLoaded]);

  // Handle map click
  const handleMapClick = useCallback(async (evt) => {
    if (!mapInstanceRef.current) return;
    
    const coord = mapInstanceRef.current.map.screenToGeo(
      evt.currentPointer.viewportX,
      evt.currentPointer.viewportY
    );
    
    await selectLocation(coord.lat, coord.lng);
  }, []);

  // Handle marker drag end
  const handleDragEnd = useCallback(async (event) => {
    if (event.type === 'marker' && event.position) {
      await selectLocation(event.position.lat, event.position.lng, false);
    }
  }, []);

  // Select location and reverse geocode
  const selectLocation = useCallback(async (latitude, longitude, updateMarker = true) => {
    if (!mapInstanceRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const map = mapInstanceRef.current.map;

      // Update or create marker
      if (updateMarker && showMarker) {
        if (markerRef.current) {
          markerRef.current.setGeometry({ lat: latitude, lng: longitude });
        } else {
          const marker = createDeliveryMarker(
            { lat: latitude, lng: longitude },
            { draggable: markerDraggable }
          );
          map.addObject(marker);
          markerRef.current = marker;
        }
      }

      // Center map
      setMapCenter(map, { lat: latitude, lng: longitude }, 15);

      // Try to get address via HERE reverse geocoding
      let addressData = {};
      try {
        const response = await fetch(
          `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apikey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          addressData = {
            street: item.address.street || '',
            number: item.address.houseNumber || '',
            neighborhood: item.address.district || '',
            city: item.address.city || '',
            state: item.address.stateCode || item.address.state || '',
            zip_code: item.address.postalCode || '',
            formatted_address: item.address.label || '',
          };
        }
      } catch (e) {
        logger.warn('Reverse geocoding failed', { error: e.message });
      }

      const location = {
        latitude,
        longitude,
        ...addressData,
      };

      setSelectedLocation(location);
      onLocationSelect?.(location);
      onAddressChange?.(addressData);

      // Calculate route if store location is set
      if (showRoute && storeLocation) {
        await calculateAndShowRoute(
          { lat: storeLocation.latitude, lng: storeLocation.longitude },
          { lat: latitude, lng: longitude }
        );
      }

    } catch (err) {
      logger.error('Error selecting location', err);
      setError('Erro ao obter endereço');
      
      const location = { latitude, longitude };
      setSelectedLocation(location);
      onLocationSelect?.(location);
    } finally {
      setIsLoading(false);
    }
  }, [showMarker, markerDraggable, onLocationSelect, onAddressChange, showRoute, storeLocation]);

  // Calculate and display route
  const calculateAndShowRoute = useCallback(async (origin, destination) => {
    if (!mapInstanceRef.current) return;

    try {
      const map = mapInstanceRef.current.map;

      // Remove existing route
      if (routeLineRef.current) {
        map.removeObject(routeLineRef.current);
        routeLineRef.current = null;
      }

      const routeData = await calculateRouteWithPolyline(origin, destination);
      
      map.addObject(routeData.mapPolyline);
      routeLineRef.current = routeData.mapPolyline;

      const summary = getRouteSummary(routeData);
      setRouteInfo({
        distance: routeData.distanceKm,
        duration: routeData.durationMinutes,
        summary: summary.full
      });

    } catch (err) {
      logger.error('Route calculation failed', err);
      setRouteInfo(null);
    }
  }, []);

  // Handle geolocation
  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      await selectLocation(position.latitude, position.longitude);
    } catch (err) {
      setError(err.message || 'Erro ao obter localização');
    } finally {
      setIsLoading(false);
    }
  }, [selectLocation]);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Check if it's a CEP (8 digits)
    const cleanQuery = query.replace(/\D/g, '');
    if (cleanQuery.length === 8) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const cepData = await lookupCEP(cleanQuery);
          if (cepData && !cepData.erro) {
            setSuggestions([{
              display_name: `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}`,
              cep: cleanQuery,
              ...cepData
            }]);
            setShowSuggestions(true);
          }
        } catch {
          setSuggestions([]);
        }
      }, 300);
      return;
    }

    // Search via HERE
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&in=countryCode:BRA&limit=5&apikey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const results = data.items
            .filter(item => item.position)
            .map(item => ({
              display_name: item.title,
              latitude: item.position.lat,
              longitude: item.position.lng,
              address: item.address
            }));
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(async (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);

    // If it's a CEP result, geocode the address
    if (suggestion.cep) {
      try {
        const geoData = await geocodeBrazilianAddress({
          street: suggestion.logradouro,
          city: suggestion.localidade,
          state: suggestion.uf
        });
        if (geoData && geoData.latitude) {
          await selectLocation(geoData.latitude, geoData.longitude);
          return;
        }
      } catch {
        // Fall through to use HERE geocoding
      }
    }

    // Use coordinates from suggestion
    if (suggestion.latitude && suggestion.longitude) {
      await selectLocation(suggestion.latitude, suggestion.longitude);
    }
  }, [selectLocation]);

  // Handle CEP search
  const handleCEPSearch = useCallback(async (cep) => {
    if (cep.replace(/\D/g, '').length !== 8) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodeBrazilianAddress(cep);
      if (result) {
        await selectLocation(result.latitude, result.longitude);
        setSearchQuery(result.display_name || '');
      } else {
        setError('CEP não encontrado');
      }
    } catch {
      setError('Erro ao buscar CEP');
    } finally {
      setIsLoading(false);
    }
  }, [selectLocation]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if input looks like a CEP
  const isCEPFormat = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 8 && /^\d{8}$/.test(digits);
  };

  // Handle search submit
  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isCEPFormat(searchQuery)) {
      handleCEPSearch(searchQuery);
    } else if (suggestions.length > 0) {
      handleSuggestionSelect(suggestions[0]);
    } else if (searchQuery.length >= 3) {
      // Direct search via HERE geocoding
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchQuery)}&in=countryCode:BRA&limit=1&apikey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const result = {
            display_name: item.title,
            latitude: item.position.lat,
            longitude: item.position.lng,
            address: item.address
          };
          handleSuggestionSelect(result);
        } else {
          setError('Endereço não encontrado');
        }
      } catch (err) {
        setError('Erro ao buscar endereço');
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchQuery, suggestions, handleCEPSearch, handleSuggestionSelect]);

  if (error && !isLoaded) {
    return (
      <div className={`interactive-map-error ${className}`} style={{ height }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`interactive-map ${className}`}>
      {/* Search and controls */}
      {(showSearch || showGeolocation) && (
        <div className="map-controls">
          {showSearch && (
            <div onSubmit={handleSearchSubmit} className="map-search" ref={suggestionsRef}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchSubmit(e))}
                  placeholder={placeholder}
                  className="search-input"
                />
                <button type="button" onClick={handleSearchSubmit} className="search-button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.place_id || index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="suggestion-item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{suggestion.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showGeolocation && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="geolocation-button"
              disabled={isLoading}
              title="Usar minha localização"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="2" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="22" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="map-container"
        style={{ height }}
      >
        {!isLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <span>Carregando mapa...</span>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="map-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Route info */}
      {routeInfo && (
        <div className="route-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span>{routeInfo.summary}</span>
        </div>
      )}

      {/* Selected location info */}
      {selectedLocation && (selectedLocation.formatted_address || selectedLocation.display_name) && (
        <div className="selected-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="location-text">{selectedLocation.formatted_address || selectedLocation.display_name}</span>
        </div>
      )}

      <style jsx>{`
        .interactive-map {
          position: relative;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .map-controls {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }

        .map-search {
          flex: 1;
          position: relative;
        }

        .search-input-wrapper {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .search-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          font-size: 14px;
          outline: none;
        }

        .search-button {
          padding: 10px 12px;
          background: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-button:hover {
          background: #45a049;
        }

        .search-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          list-style: none;
          margin: 0;
          padding: 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #f5f5f5;
        }

        .suggestion-item svg {
          flex-shrink: 0;
          color: #666;
        }

        .suggestion-item span {
          font-size: 13px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .geolocation-button {
          padding: 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.2s;
        }

        .geolocation-button:hover {
          background: #f5f5f5;
          color: #4CAF50;
        }

        .geolocation-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .map-container {
          width: 100%;
          position: relative;
        }

        .map-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #f5f5f5;
          color: #666;
        }

        .map-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          z-index: 1000;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .map-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #ffebee;
          color: #c62828;
          font-size: 13px;
        }

        .map-error button {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
        }

        .route-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #fff3e0;
          border-top: 1px solid #ffe0b2;
        }

        .route-info svg {
          flex-shrink: 0;
          color: #f57c00;
        }

        .route-info span {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }

        .selected-location {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #e8f5e9;
          border-top: 1px solid #c8e6c9;
        }

        .selected-location svg {
          flex-shrink: 0;
          color: #4CAF50;
        }

        .location-text {
          font-size: 13px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .interactive-map-error {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffebee;
          color: #c62828;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
