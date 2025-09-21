import { LEIDEN_BOUNDS } from './constants';

export function generateRandomLeidenLocation() {
    // Use higher precision random generation
    const lat = Math.random() * (LEIDEN_BOUNDS.north - LEIDEN_BOUNDS.south) + LEIDEN_BOUNDS.south;
    const lng = Math.random() * (LEIDEN_BOUNDS.east - LEIDEN_BOUNDS.west) + LEIDEN_BOUNDS.west;
    
    // Use higher precision (8 decimal places) for better accuracy
    const preciseLat = parseFloat(lat.toFixed(8));
    const preciseLng = parseFloat(lng.toFixed(8));
    
    return {
        lat: preciseLat,
        lng: preciseLng,
        name: `Random Location in Leiden (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    };
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    // Return distance with higher precision
    return Math.round(R * c * 100) / 100; // Round to 2 decimal places
}

export function calculateScore(distance) {
    return Math.max(0, Math.round(5000 - (distance / 10)));
}
