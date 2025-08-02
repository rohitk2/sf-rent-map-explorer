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

  const neighborhoods = [
    { name: 'Mission District', bounds: [[37.7480, -122.4230], [37.7655, -122.4095]], color: '#ef4444' },
    { name: 'SoMa', bounds: [[37.7750, -122.4140], [37.7900, -122.3950]], color: '#374151' },
    { name: 'Tenderloin', bounds: [[37.7820, -122.4185], [37.7880, -122.4090]], color: '#dc2626' },
    { name: 'Nob Hill', bounds: [[37.7905, -122.4190], [37.7965, -122.4080]], color: '#059669' },
    { name: 'North Beach', bounds: [[37.7990, -122.4130], [37.8060, -122.4030]], color: '#0ea5e9' },
    { name: 'Castro', bounds: [[37.7550, -122.4430], [37.7660, -122.4300]], color: '#8b5cf6' },
    { name: 'Haight-Ashbury', bounds: [[37.7660, -122.4530], [37.7725, -122.4400]], color: '#d946ef' },
    { name: 'Sunset District', bounds: [[37.7380, -122.5080], [37.7620, -122.4630]], color: '#22c55e' },
    { name: 'Richmond District', bounds: [[37.7730, -122.5090], [37.7860, -122.4570]], color: '#eab308' },
    { name: 'Bayview-Hunters Pt', bounds: [[37.7080, -122.3920], [37.7350, -122.3750]], color: '#f97316' },
    { name: 'Excelsior', bounds: [[37.7160, -122.4420], [37.7380, -122.4150]], color: '#84cc16' },
    { name: 'Twin Peaks', bounds: [[37.7450, -122.4600], [37.7570, -122.4410]], color: '#6366f1' },
    { name: 'Marina', bounds: [[37.8000, -122.4480], [37.8080, -122.4270]], color: '#3b82f6' },
    { name: 'Pacific Heights', bounds: [[37.7890, -122.4450], [37.7975, -122.4230]], color: '#06b6d4' },
    { name: 'Financial District', bounds: [[37.7910, -122.4050], [37.7975, -122.3960]], color: '#10b981' },
    { name: 'Chinatown', bounds: [[37.7920, -122.4100], [37.7960, -122.4040]], color: '#f59e0b' },
  ];

  const getNeighborhoodColor = (address: string) => {
    const lowerAddress = address.toLowerCase();
    if (lowerAddress.includes('mission')) return '#ef4444';
    if (lowerAddress.includes('castro')) return '#8b5cf6';
    if (lowerAddress.includes('marina') || lowerAddress.includes('lombard')) return '#3b82f6';
    if (lowerAddress.includes('noe valley')) return '#f97316';
    if (lowerAddress.includes('sunset')) return '#22c55e';
    if (lowerAddress.includes('soma')) return '#374151';
    return '#6b7280'; // default gray
  };

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

      // Add neighborhood overlays
      neighborhoods.forEach((neighborhood, index) => {
        const [[southLat, westLng], [northLat, eastLng]] = neighborhood.bounds;
        
        // Create rectangle coordinates
        const coordinates = [
          [westLng, southLat], // southwest
          [eastLng, southLat], // southeast
          [eastLng, northLat], // northeast
          [westLng, northLat], // northwest
          [westLng, southLat]  // close the polygon
        ];

        // Add source for this neighborhood
        map.current!.addSource(`neighborhood-${index}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates]
            },
            properties: {
              name: neighborhood.name
            }
          }
        });

        // Add fill layer
        map.current!.addLayer({
          id: `neighborhood-fill-${index}`,
          type: 'fill',
          source: `neighborhood-${index}`,
          paint: {
            'fill-color': neighborhood.color,
            'fill-opacity': 0.2
          }
        });

        // Add border layer
        map.current!.addLayer({
          id: `neighborhood-border-${index}`,
          type: 'line',
          source: `neighborhood-${index}`,
          paint: {
            'line-color': neighborhood.color,
            'line-width': 2,
            'line-opacity': 0.8
          }
        });
      });

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