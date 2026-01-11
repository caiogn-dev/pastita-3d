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

// Default map center (Tocantins, Brazil)
const DEFAULT_CENTER = { lat: -10.1847, lng: -48.3336 };
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
 * Create a store marker with custom icon
 */
export function createStoreMarker(coords) {
  const svgIcon = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${PASTITA_COLORS.marsala}" stroke="white" stroke-width="2"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
    </svg>
  `;
  return createMarker(coords, { svgIcon, iconOptions: { size: { w: 40, h: 40 }, anchor: { x: 20, y: 20 } } });
}

/**
 * Create a delivery marker
 */
export function createDeliveryMarker(coords, options = {}) {
  const color = options.color || PASTITA_COLORS.gold;
  const svgIcon = `
    <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
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
  
  let lineString;
  if (typeof coordinates === 'string') {
    // Flexible polyline encoded string
    lineString = H.geo.LineString.fromFlexiblePolyline(coordinates);
  } else {
    // Array of coordinates
    lineString = new H.geo.LineString();
    coordinates.forEach(coord => {
      lineString.pushPoint({ lat: coord.lat || coord[0], lng: coord.lng || coord[1] });
    });
  }

  return new H.map.Polyline(lineString, {
    style: {
      strokeColor: options.strokeColor || PASTITA_COLORS.routeColor,
      lineWidth: options.lineWidth || 4,
      lineCap: 'round',
      lineJoin: 'round'
    }
  });
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

// Export constants
export { DEFAULT_CENTER, DEFAULT_ZOOM, PASTITA_COLORS, HERE_API_KEY };
