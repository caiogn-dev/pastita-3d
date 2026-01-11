/**
 * HERE Isoline Service
 * Isochrone and isodistance calculation using HERE Isoline Routing API v8
 */

import { createPolygon, PASTITA_COLORS, HERE_API_KEY } from './hereMapService';
import logger from './logger';

/**
 * Calculate isoline (isochrone or isodistance)
 * @param {Object} center - { lat, lng } center point
 * @param {Object} options - isoline options
 * @returns {Promise<Object>} isoline data
 */
export async function calculateIsoline(center, options = {}) {
  const originStr = `${center.lat || center.latitude},${center.lng || center.longitude}`;
  
  const params = new URLSearchParams({
    apikey: HERE_API_KEY,
    origin: originStr,
    transportMode: options.transportMode || 'car',
    'range[type]': options.rangeType || 'time', // 'time' or 'distance'
    'range[values]': options.rangeValues || '1800', // 30 minutes in seconds, or meters for distance
    optimizeFor: options.optimizeFor || 'balanced'
  });

  const url = `https://isoline.router.hereapi.com/v8/isolines?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.isolines && data.isolines.length > 0) {
      const isoline = data.isolines[0];
      
      return {
        success: true,
        center: { lat: center.lat || center.latitude, lng: center.lng || center.longitude },
        rangeType: options.rangeType || 'time',
        rangeValue: parseInt(options.rangeValues) || 1800,
        polygons: isoline.polygons.map(p => ({
          outer: p.outer,
          // Decode the flexible polyline to coordinates
          coordinates: decodeFlexiblePolyline(p.outer)
        })),
        raw: data
      };
    } else {
      throw new Error('No isoline data returned');
    }
  } catch (error) {
    logger.error('Isoline calculation error', error, { center, options });
    throw error;
  }
}

/**
 * Calculate isochrone (time-based)
 * @param {Object} center - { lat, lng }
 * @param {number} minutes - time in minutes
 * @returns {Promise<Object>} isochrone data
 */
export async function calculateIsochrone(center, minutes) {
  return calculateIsoline(center, {
    rangeType: 'time',
    rangeValues: String(minutes * 60) // Convert to seconds
  });
}

/**
 * Calculate isodistance (distance-based)
 * @param {Object} center - { lat, lng }
 * @param {number} kilometers - distance in km
 * @returns {Promise<Object>} isodistance data
 */
export async function calculateIsodistance(center, kilometers) {
  return calculateIsoline(center, {
    rangeType: 'distance',
    rangeValues: String(kilometers * 1000) // Convert to meters
  });
}

/**
 * Calculate multiple isolines at once
 * @param {Object} center - { lat, lng }
 * @param {Array<number>} ranges - array of range values
 * @param {string} rangeType - 'time' or 'distance'
 * @returns {Promise<Array>} array of isoline data
 */
export async function calculateMultipleIsolines(center, ranges, rangeType = 'time') {
  const originStr = `${center.lat || center.latitude},${center.lng || center.longitude}`;
  
  // Convert ranges based on type
  const rangeValues = ranges.map(r => {
    if (rangeType === 'time') {
      return r * 60; // minutes to seconds
    }
    return r * 1000; // km to meters
  }).join(',');

  const params = new URLSearchParams({
    apikey: HERE_API_KEY,
    origin: originStr,
    transportMode: 'car',
    'range[type]': rangeType,
    'range[values]': rangeValues,
    optimizeFor: 'balanced'
  });

  const url = `https://isoline.router.hereapi.com/v8/isolines?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.isolines && data.isolines.length > 0) {
      return data.isolines.map((isoline, index) => ({
        success: true,
        center: { lat: center.lat || center.latitude, lng: center.lng || center.longitude },
        rangeType,
        rangeValue: rangeType === 'time' ? ranges[index] : ranges[index],
        rangeValueRaw: rangeType === 'time' ? ranges[index] * 60 : ranges[index] * 1000,
        polygons: isoline.polygons.map(p => ({
          outer: p.outer,
          coordinates: decodeFlexiblePolyline(p.outer)
        }))
      }));
    } else {
      throw new Error('No isoline data returned');
    }
  } catch (error) {
    logger.error('Multiple isolines calculation error', error);
    throw error;
  }
}

/**
 * Create a map polygon from isoline data
 */
export function createIsolinePolygon(isolineData, options = {}) {
  if (!isolineData.polygons || isolineData.polygons.length === 0) {
    return null;
  }

  const coordinates = isolineData.polygons[0].coordinates;
  
  return createPolygon(coordinates, {
    fillColor: options.fillColor || PASTITA_COLORS.isochoneFill,
    strokeColor: options.strokeColor || PASTITA_COLORS.isochroneStroke,
    lineWidth: options.lineWidth || 2,
    data: options.data || isolineData
  });
}

/**
 * Decode HERE flexible polyline format
 * Based on HERE's flexible polyline encoding
 */
function decodeFlexiblePolyline(encoded) {
  const H = window.H;
  
  if (H && H.geo && H.geo.LineString && H.geo.LineString.fromFlexiblePolyline) {
    try {
      const lineString = H.geo.LineString.fromFlexiblePolyline(encoded);
      const points = [];
      lineString.eachLatLngAlt((lat, lng) => {
        points.push({ lat, lng });
      });
      return points;
    } catch (e) {
      logger.warn('Failed to decode with HERE SDK, using fallback');
    }
  }

  // Fallback decoder
  return decodeFlexiblePolylineFallback(encoded);
}

/**
 * Fallback flexible polyline decoder
 */
function decodeFlexiblePolylineFallback(encoded) {
  const DECODING_TABLE = [
    62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
  ];

  const decode = (encoded) => {
    const result = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    // Skip header (first few characters contain precision info)
    // For simplicity, assume default precision
    const headerEnd = encoded.indexOf('A') !== -1 ? encoded.indexOf('A') + 1 : 0;
    index = headerEnd > 0 ? headerEnd : 0;

    while (index < encoded.length) {
      let shift = 0;
      let deltaLat = 0;
      let deltaLng = 0;

      // Decode latitude
      let byte;
      do {
        byte = DECODING_TABLE[encoded.charCodeAt(index++) - 45];
        deltaLat |= (byte & 0x1F) << shift;
        shift += 5;
      } while (byte >= 32 && index < encoded.length);

      if (deltaLat & 1) {
        deltaLat = ~deltaLat;
      }
      deltaLat >>= 1;
      lat += deltaLat;

      // Decode longitude
      shift = 0;
      do {
        byte = DECODING_TABLE[encoded.charCodeAt(index++) - 45];
        deltaLng |= (byte & 0x1F) << shift;
        shift += 5;
      } while (byte >= 32 && index < encoded.length);

      if (deltaLng & 1) {
        deltaLng = ~deltaLng;
      }
      deltaLng >>= 1;
      lng += deltaLng;

      result.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return result;
  };

  try {
    return decode(encoded);
  } catch (e) {
    logger.warn('Polyline decode error', { error: e.message });
    return [];
  }
}

/**
 * Get isoline summary text
 */
export function getIsolineSummary(isolineData) {
  if (isolineData.rangeType === 'time') {
    const minutes = isolineData.rangeValue;
    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}h ${minutes % 60}min de carro`;
    }
    return `${minutes} min de carro`;
  } else {
    const km = isolineData.rangeValue;
    return `${km} km de distância`;
  }
}

export default {
  calculateIsoline,
  calculateIsochrone,
  calculateIsodistance,
  calculateMultipleIsolines,
  createIsolinePolygon,
  getIsolineSummary
};
