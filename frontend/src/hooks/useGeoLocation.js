import { useState, useEffect } from 'react';

/**
 * Returns user's live GPS coords, or null if denied/unavailable.
 * { lat, lng, error, loading }
 */
const useGeoLocation = () => {
    const [state, setState] = useState({ lat: null, lng: null, error: null, loading: true });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, loading: false, error: 'Geolocation not supported by your browser.' }));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null, loading: false }),
            (err) => setState(s => ({ ...s, loading: false, error: 'Location access denied. Distance check disabled.' })),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }, []);

    return state;
};

export default useGeoLocation;
