'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  reverseGeocode,
  getAddressSuggestions,
  getCurrentLocation,
  geocodeBrazilianAddress,
} from '../services/geocoding';

// Leaflet CSS is loaded dynamically
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// Default center (Brazil)
const DEFAULT_CENTER = [-10.3333, -53.2];
const DEFAULT_ZOOM = 4;

/**
 * Interactive Map Component using OpenStreetMap/Leaflet
 * 
 * Features:
 * - Click to select location
 * - Use current location (geolocation)
 * - Search for address
 * - Reverse geocoding on selection
 * - Draggable marker
 */
export default function InteractiveMap({
  initialLocation = null,
  onLocationSelect,
  onAddressChange,
  height = '400px',
  showSearch = true,
  showGeolocation = true,
  showMarker = true,
  markerDraggable = true,
  className = '',
  placeholder = 'Buscar endereço...',
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if already loaded
    if (window.L) {
      setIsLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Erro ao carregar o mapa');
    document.head.appendChild(script);

    return () => {
      // Cleanup is handled by Leaflet
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    
    // Create map
    const map = L.map(mapContainerRef.current, {
      center: initialLocation 
        ? [initialLocation.latitude, initialLocation.longitude]
        : DEFAULT_CENTER,
      zoom: initialLocation ? 15 : DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker if initial location
    if (initialLocation && showMarker) {
      const marker = L.marker([initialLocation.latitude, initialLocation.longitude], {
        draggable: markerDraggable,
      }).addTo(map);

      markerRef.current = marker;
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isLoaded, initialLocation, showMarker, markerDraggable]);

  // Select location and reverse geocode
  const selectLocation = useCallback(async (latitude, longitude, updateMarker = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update marker position
      if (updateMarker && mapRef.current) {
        const L = window.L;
        
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else if (showMarker) {
          const marker = L.marker([latitude, longitude], {
            draggable: markerDraggable,
          }).addTo(mapRef.current);

          markerRef.current = marker;
        }

        // Center map on location
        mapRef.current.setView([latitude, longitude], Math.max(mapRef.current.getZoom(), 15));
      }

      // Reverse geocode
      const addressData = await reverseGeocode(latitude, longitude);
      
      const location = {
        latitude,
        longitude,
        ...addressData,
      };

      setSelectedLocation(location);
      onLocationSelect?.(location);
      onAddressChange?.(addressData);
      
    } catch {
      setError('Erro ao obter endereço');
      
      // Still update location even if reverse geocoding fails
      const location = { latitude, longitude };
      setSelectedLocation(location);
      onLocationSelect?.(location);
    } finally {
      setIsLoading(false);
    }
  }, [showMarker, markerDraggable, onLocationSelect, onAddressChange]);

  // Set up map click and marker drag handlers
  useEffect(() => {
    if (!mapRef.current) return;

    // Click handler
    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      await selectLocation(lat, lng);
    };
    mapRef.current.on('click', handleMapClick);

    // Marker drag handler
    if (markerRef.current && markerDraggable) {
      const handleMarkerDragEnd = async (e) => {
        const { lat, lng } = e.target.getLatLng();
        await selectLocation(lat, lng, false);
      };
      markerRef.current.on('dragend', handleMarkerDragEnd);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click');
      }
    };
  }, [selectLocation, markerDraggable]);

  // Handle geolocation
  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      await selectLocation(position.latitude, position.longitude);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectLocation]);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getAddressSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        // Search failed - suggestions will be empty
      }
    }, 300);
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(async (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    await selectLocation(suggestion.latitude, suggestion.longitude);
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
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (isCEPFormat(searchQuery)) {
      handleCEPSearch(searchQuery);
    } else if (suggestions.length > 0) {
      handleSuggestionSelect(suggestions[0]);
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
            <form onSubmit={handleSearchSubmit} className="map-search" ref={suggestionsRef}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className="search-input"
                />
                <button type="submit" className="search-button" disabled={isLoading}>
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
            </form>
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

      {/* Selected location info */}
      {selectedLocation && selectedLocation.display_name && (
        <div className="selected-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="location-text">{selectedLocation.display_name}</span>
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
