import React, { useEffect, useRef, useState } from 'react';
import './StreetView.scss';

const StreetView = ({ currentLocation, apiKey, onPositionUpdate, onStreetViewReady, actualStreetViewLocation, streetViewError }) => {
    const streetViewRef = useRef(null);
    const panoramaRef = useRef(null);

    useEffect(() => {
        if (!currentLocation || !apiKey || !streetViewRef.current || !window.google) return;

        if (panoramaRef.current) {
            // Clear the StreetView container
            if (streetViewRef.current) {
                streetViewRef.current.innerHTML = '';
            }
            panoramaRef.current = null;
        }

        setTimeout(() => {
            try {
                console.log("Street view request:", {
                    requestedPosition: currentLocation,
                    lat: currentLocation.lat,
                    lng: currentLocation.lng
                });
                
                // First try to find Street View with a larger search radius
                const streetViewService = new google.maps.StreetViewService();
                const request = {
                    location: currentLocation,
                    radius: 200, // Search within 200m radius for better accuracy
                    source: google.maps.StreetViewSource.OUTDOOR
                };
                
                streetViewService.getPanorama(request, (data, status) => {
                    if (status === 'OK' && data) {
                        const distanceFromGenerated = google.maps.geometry.spherical.computeDistanceBetween(
                            currentLocation, 
                            data.location.latLng
                        );
                        
                        console.log("Street view data:", {
                            position: data.location.latLng,
                            panoId: data.location.panoId,
                            distance: distanceFromGenerated
                        });
                        
                        // Warn if Street View location is significantly different from generated location
                        if (distanceFromGenerated > 50) {
                            console.warn(`⚠️ Street View location is ${Math.round(distanceFromGenerated)}m away from generated location. This may cause distance discrepancies.`);
                        }
                        
                        // Use the found Street View position
                        const streetViewPosition = data.location.latLng;
                        
                        panoramaRef.current = new google.maps.StreetViewPanorama(
                            streetViewRef.current,
                            {
                                position: streetViewPosition,
                                pov: {
                                    heading: 34,
                                    pitch: 10
                                },
                                addressControl: false,
                                linksControl: false,
                                fullscreenControl: false,
                                motionTracking: false,
                                motionTrackingControl: false,
                                zoomControl: false,
                                panControl: false,
                                scrollwheel: false,
                                clickToGo: false,
                                enableCloseButton: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                                scaleControl: false,
                                rotateControl: false,
                                tiltControl: false,
                                keyboardShortcuts: false,
                                disableDefaultUI: true,
                                visible: true,
                                imageDateControl: false,
                                showRoadLabels: false,
                                // Prevent automatic panorama switching
                                disableDoubleClickZoom: true,
                                gestureHandling: 'none',
                                options: {
                                    addressControl: false,
                                    fullscreenControl: false,
                                    linksControl: false,
                                    motionTracking: false,
                                    motionTrackingControl: false,
                                    panControl: false,
                                    scrollwheel: false,
                                    zoomControl: false,
                                    clickToGo: false,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    scaleControl: false,
                                    rotateControl: false,
                                    tiltControl: false,
                                    keyboardShortcuts: false,
                                    disableDefaultUI: true,
                                    imageDateControl: false,
                                    showRoadLabels: false
                                }
                            }
                        );
                        
                        // Add all the listeners after Street View is created
                        addStreetViewListeners();
                        
                    } else {
                        console.warn('⚠️ No Street View found within 200m radius, trying fallback...');
                        // Fallback: try with original position but allow Google to find nearest
                        panoramaRef.current = new google.maps.StreetViewPanorama(
                            streetViewRef.current,
                            {
                                position: currentLocation,
                                pov: { heading: 34, pitch: 10 },
                                addressControl: false,
                                linksControl: false,
                                fullscreenControl: false,
                                motionTracking: false,
                                motionTrackingControl: false,
                                zoomControl: false,
                                panControl: false,
                                scrollwheel: false,
                                clickToGo: false,
                                enableCloseButton: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                                scaleControl: false,
                                rotateControl: false,
                                tiltControl: false,
                                keyboardShortcuts: false,
                                disableDefaultUI: true,
                                visible: true,
                                imageDateControl: false,
                                showRoadLabels: false,
                                // Prevent automatic panorama switching
                                disableDoubleClickZoom: true,
                                gestureHandling: 'none'
                            }
                        );
                        addStreetViewListeners();
                    }
                });
                
                // Function to add all Street View listeners
                function addStreetViewListeners() {
                    // Add listener to capture the actual Street View position
                    google.maps.event.addListener(panoramaRef.current, 'position_changed', () => {
                        const actualPosition = panoramaRef.current.getPosition();
                        if (actualPosition) {
                            const actualCoords = {
                                lat: actualPosition.lat(),
                                lng: actualPosition.lng()
                            };
                            console.log("Position changed:", {
                                lat: actualCoords.lat,
                                lng: actualCoords.lng,
                                latFormatted: actualCoords.lat.toFixed(8),
                                lngFormatted: actualCoords.lng.toFixed(8),
                                difference: {
                                    latDiff: Math.abs(actualCoords.lat - currentLocation.lat),
                                    lngDiff: Math.abs(actualCoords.lng - currentLocation.lng)
                                }
                            });
                            
                            // Notify parent component of actual position
                            if (onPositionUpdate) {
                                onPositionUpdate(actualCoords);
                            }
                        }
                    });
                
                    // Add listener for when Street View is fully loaded
                    google.maps.event.addListener(panoramaRef.current, 'pano_changed', () => {
                        const actualPosition = panoramaRef.current.getPosition();
                        if (actualPosition) {
                            const actualCoords = {
                                lat: actualPosition.lat(),
                                lng: actualPosition.lng()
                            };
                            console.log("Pano changed:", {
                                lat: actualCoords.lat,
                                lng: actualCoords.lng,
                                latFormatted: actualCoords.lat.toFixed(8),
                                lngFormatted: actualCoords.lng.toFixed(8),
                                panoId: panoramaRef.current.getPano()
                            });
                            
                            // Notify parent component that Street View is ready with final position
                            if (onPositionUpdate) {
                                onPositionUpdate(actualCoords);
                            }
                            if (onStreetViewReady) {
                                onStreetViewReady(true);
                            }
                        }
                    });
                
                    // Add listener for Street View status changes
                    google.maps.event.addListener(panoramaRef.current, 'status_changed', () => {
                        const status = panoramaRef.current.getStatus();
                        
                        if (status === 'OK') {
                        } else if (status === 'ZERO_RESULTS') {
                            console.warn('⚠️ No Street View coverage at this location');
                        } else if (status === 'UNKNOWN_ERROR') {
                            console.error('❌ Street View error occurred');
                        }
                    });
                    
                    // Add listener for when Street View is visible
                    google.maps.event.addListener(panoramaRef.current, 'visible_changed', () => {
                        const isVisible = panoramaRef.current.getVisible();
                        
                        if (!isVisible) {
                            console.warn('⚠️ Street View is not visible - may need to find nearby location');
                        }
                    });
                    
                    // Prevent panorama changes - lock to initial panorama
                    let initialPanoId = null;
                    google.maps.event.addListener(panoramaRef.current, 'pano_changed', () => {
                        const currentPanoId = panoramaRef.current.getPano();

                        if (!initialPanoId) {
                            // Set the initial panorama ID
                            initialPanoId = currentPanoId;
                        } else if (currentPanoId !== initialPanoId) {
                            // If panorama changed, switch back to initial
                            console.log("Switching back to initial pano:", {
                                from: currentPanoId,
                                to: initialPanoId
                            });
                            panoramaRef.current.setPano(initialPanoId);
                        }
                    });

                }
            } catch (error) {
                console.error('Error initializing Street View:', error);
            }
        }, 100);
    }, [currentLocation, apiKey]);

    return (
        <div className="street-view">
            <div
                ref={streetViewRef}
                className="street-view-container w-full h-full"
            />
            {!currentLocation && (
                <div className="street-view__loading">
                    <div className="street-view__loading-content">
                        <div className="street-view__loading-spinner"></div>
                        <p className="street-view__loading-text">Street View laden...</p>
                    </div>
                </div>
            )}
            {streetViewError && (
                <div className="street-view__error">
                    ⚠️ Geen Street View
                </div>
            )}
        </div>
    );
};

export default StreetView;
