import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Fix for missing default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14);
    }, [center, map]);
    return null;
};

const DeliveryMap = ({ address, name }) => {
    // Default to New Delhi coordinates
    const [position, setPosition] = useState([28.6139, 77.2090]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!address) {
            setLoading(false);
            return;
        }

        const fetchCoordinates = async () => {
            try {
                // Using OpenStreetMap's free Nominatim Geocoding API
                const q = encodeURIComponent(address);
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
                const data = await response.json();

                if (data && data.length > 0) {
                    setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                }
            } catch (error) {
                console.error("Geocoding failed:", error);
                // Fallback position is already set
            }
            setLoading(false);
            setSearched(true);
        };

        fetchCoordinates();
    }, [address]);

    if (loading) {
        return (
            <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading Map...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ 
                height: '350px', 
                width: '100%', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid var(--glass-border)'
            }}
        >
            <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={position} />
                <Marker position={position}>
                    <Popup>
                        <div style={{ padding: '4px', textAlign: 'center' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800 }}>{name || "Restaurant"}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{address || "Default Location"}</p>
                            {!searched && <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#ff4757', fontStyle: 'italic' }}>*Location estimated</p>}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </motion.div>
    );
};

export default DeliveryMap;
