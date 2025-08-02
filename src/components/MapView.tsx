import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MapViewProps {
  onPropertySelect: (property: any) => void;
  properties: any[];
}

const MapView: React.FC<MapViewProps> = ({ onPropertySelect, properties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = () => {
    console.log('Initializing map with token:', mapboxToken ? 'Token present' : 'No token');
    if (!mapContainer.current || !mapboxToken) {
      console.log('Cannot initialize map - missing container or token');
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      console.log('Creating map...');
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-122.4194, 37.7749], // San Francisco center
        zoom: 12,
      });

      console.log('Map created successfully');
    } catch (error) {
      console.error('Error creating map:', error);
      return;
    }

    // Add navigation controls after map loads
    map.current.on('load', () => {
      console.log('Map loaded successfully');
      map.current!.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add property markers
      console.log('Adding property markers:', properties.length);
      properties.forEach((property, index) => {
        try {
          const marker = new mapboxgl.Marker({
            color: getNeighborhoodColor(property.address),
          })
            .setLngLat([property.lng, property.lat])
            .addTo(map.current!);

          marker.getElement().addEventListener('click', () => {
            onPropertySelect(property);
          });
          console.log(`Added marker ${index + 1}/${properties.length}`);
        } catch (error) {
          console.error(`Error adding marker for property ${property.id}:`, error);
        }
      });
    });
  };

  const handleTokenSubmit = () => {
    console.log('Token submit clicked, token length:', mapboxToken.length);
    if (mapboxToken && mapboxToken.startsWith('pk.')) {
      console.log('Valid token format detected');
      setShowTokenInput(false);
      setTimeout(() => {
        initializeMap();
      }, 100);
    } else {
      console.error('Invalid token format - should start with pk.');
      alert('Please enter a valid Mapbox token (should start with "pk.")');
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-subtle">
        <Card className="p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Setup Required</h3>
          <p className="text-muted-foreground mb-4">
            Please enter your Mapbox public token to display the map. 
            Get yours at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            <br /><small className="text-xs">Token should start with "pk."</small>
          </p>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Initialize Map
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapView;