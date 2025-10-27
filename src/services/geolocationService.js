const axios = require('axios');
const config = require('../config');

/**
 * Calcular distancia entre dos puntos (Haversine)
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // en kilómetros
};

/**
 * Convertir grados a radianes
 */
exports.toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Obtener dirección desde coordenadas (Geocodificación inversa)
 */
exports.reverseGeocode = async (lat, lng) => {
  try {
    if (!config.googleMapsApiKey) {
      throw new Error('Google Maps API Key no configurada');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.googleMapsApiKey}`;
    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    return null;
  }
};

/**
 * Obtener coordenadas desde dirección (Geocodificación)
 */
exports.geocode = async (address) => {
  try {
    if (!config.googleMapsApiKey) {
      throw new Error('Google Maps API Key no configurada');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleMapsApiKey}`;
    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return null;
  }
};

/**
 * Calcular ruta entre dos puntos
 */
exports.calculateRoute = async (origin, destination) => {
  try {
    if (!config.googleMapsApiKey) {
      throw new Error('Google Maps API Key no configurada');
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${config.googleMapsApiKey}`;
    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.legs[0].distance.value / 1000, // en km
        duration: route.legs[0].duration.value / 60, // en minutos
        polyline: route.overview_polyline.points,
      };
    }

    return null;
  } catch (error) {
    console.error('Error al calcular ruta:', error);
    return null;
  }
};

/**
 * Verificar si un punto está dentro de un radio
 */
exports.isWithinRadius = (point1, point2, radiusKm) => {
  const distance = this.calculateDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  return distance <= radiusKm;
};
