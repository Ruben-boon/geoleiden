import React, { useEffect, useRef } from 'react';
import './GuessMap.scss';

const GuessMap = ({ 
    gameState, 
    currentLocation, 
    guessLocation, 
    onGuessLocation, 
    apiKey 
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);

    useEffect(() => {
        if (!apiKey || !mapRef.current || !window.google) return;

        if (!mapInstanceRef.current) {
            try {
                mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                    center: { lat: 52.1601, lng: 4.4970 },
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'greedy',
                    minZoom: 11,
                    maxZoom: 20, // Increased max zoom for better precision
                    clickableIcons: false,
                    clickableLabels: false, // Disable clickable labels for better click accuracy
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        },
                        {
                            featureType: 'transit',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        },
                        {
                            featureType: 'landscape',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });
            } catch (error) {
                console.error('Error initializing map:', error);
                return;
            }
        }

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        if (gameState === 'guessing' && mapInstanceRef.current) {
            const clickListener = mapInstanceRef.current.addListener('click', (event) => {
                try {
                    const position = event.latLng;
                    if (position) {
                        const guessCoords = { lat: position.lat(), lng: position.lng() };
                        console.log("Guess location:", {
                            lat: guessCoords.lat,
                            lng: guessCoords.lng,
                            latFormatted: guessCoords.lat.toFixed(6),
                            lngFormatted: guessCoords.lng.toFixed(6),
                            rawEvent: event,
                            rawLatLng: position
                        });
                        
                        onGuessLocation(guessCoords);
                        
                        markersRef.current.forEach(marker => marker.setMap(null));
                        markersRef.current = [];
                        
                        const guessMarker = new google.maps.Marker({
                            position: position,
                            map: mapInstanceRef.current,
                            icon: {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                                        <circle cx="12" cy="12" r="4" fill="white"/>
                                        <circle cx="12" cy="12" r="1" fill="#3B82F6"/>
                                    </svg>
                                `),
                                scaledSize: new google.maps.Size(24, 24),
                                anchor: new google.maps.Point(12, 12) // Center anchor for precise positioning
                            },
                            title: 'Jouw Gok',
                            optimized: false // Disable optimization for more accurate positioning
                        });
                        markersRef.current.push(guessMarker);
                    }
                } catch (error) {
                    console.error('Error handling map click:', error);
                }
            });
            
            return () => google.maps.event.removeListener(clickListener);
        }
    }, [gameState, apiKey, onGuessLocation]);

    useEffect(() => {
        if (gameState === 'result' && currentLocation && guessLocation && mapInstanceRef.current && window.google) {
            try {
                console.log("Result locations:", {
                    actualLocation: {
                        lat: currentLocation.lat,
                        lng: currentLocation.lng,
                        latFormatted: currentLocation.lat.toFixed(6),
                        lngFormatted: currentLocation.lng.toFixed(6)
                    },
                    guessLocation: {
                        lat: guessLocation.lat,
                        lng: guessLocation.lng,
                        latFormatted: guessLocation.lat.toFixed(6),
                        lngFormatted: guessLocation.lng.toFixed(6)
                    },
                    difference: {
                        latDiff: Math.abs(currentLocation.lat - guessLocation.lat),
                        lngDiff: Math.abs(currentLocation.lng - guessLocation.lng)
                    }
                });
                
                const actualMarker = new google.maps.Marker({
                    position: currentLocation,
                    map: mapInstanceRef.current,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
                                <circle cx="12" cy="12" r="4" fill="white"/>
                                <circle cx="12" cy="12" r="1" fill="#EF4444"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12) // Center anchor for precise positioning
                    },
                    title: 'Actual Street View Location',
                    optimized: false // Disable optimization for more accurate positioning
                });
                markersRef.current.push(actualMarker);

                if (markersRef.current.length === 1) {
                    const guessMarker = new google.maps.Marker({
                        position: guessLocation,
                        map: mapInstanceRef.current,
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="4" fill="white"/>
                                    <circle cx="12" cy="12" r="1" fill="#3B82F6"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(24, 24),
                            anchor: new google.maps.Point(12, 12) // Center anchor for precise positioning
                        },
                        title: 'Your Guess',
                        optimized: false // Disable optimization for more accurate positioning
                    });
                    markersRef.current.push(guessMarker);
                }

                polylineRef.current = new google.maps.Polyline({
                    path: [currentLocation, guessLocation],
                    geodesic: true,
                    strokeColor: '#FF6B6B',
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                    map: mapInstanceRef.current
                });

                const bounds = new google.maps.LatLngBounds();
                bounds.extend(currentLocation);
                bounds.extend(guessLocation);
                
                // Add padding to bounds to prevent markers from being at the edge
                const padding = 0.0001; // Small padding in degrees
                bounds.extend({ lat: currentLocation.lat + padding, lng: currentLocation.lng + padding });
                bounds.extend({ lat: currentLocation.lat - padding, lng: currentLocation.lng - padding });
                bounds.extend({ lat: guessLocation.lat + padding, lng: guessLocation.lng + padding });
                bounds.extend({ lat: guessLocation.lat - padding, lng: guessLocation.lng - padding });
                
                mapInstanceRef.current.fitBounds(bounds);
            } catch (error) {
                console.error('Error showing results:', error);
            }
        }
    }, [gameState, currentLocation, guessLocation]);

    // Reset map position when a new round starts (gameState changes from 'result' to 'guessing')
    useEffect(() => {
        if (gameState === 'guessing' && mapInstanceRef.current) {
            // Reset map to default center and zoom
            mapInstanceRef.current.setCenter({ lat: 52.1601, lng: 4.4970 });
            mapInstanceRef.current.setZoom(13);
        }
    }, [gameState]);

    return (
        <div className="guess-map">
            <div
                ref={mapRef}
                className="map-container guess-map__container"
                style={{ pointerEvents: 'auto' }}
            />
            <div className="guess-map__status">
                {gameState === 'guessing' ? 'Klik om je gok te plaatsen' : 'Resultaten'}
            </div>
            {/* Distance scale indicator for results */}
            {gameState === 'result' && currentLocation && guessLocation && (
                <div className="guess-map__distance-scale">
                    <div className="distance-scale__content">
                        <div className="distance-scale__line"></div>
                        <div className="distance-scale__label">50m</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuessMap;
