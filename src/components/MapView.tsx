import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { neighborhoods } from '@/data/neighborhoods';

interface MapViewProps {
  onPropertySelect: (property: any) => void;
  selectedProperty: any;
  properties: any[];
}

const MapView: React.FC<MapViewProps> = ({ onPropertySelect, selectedProperty, properties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

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

        // Remove click events for neighborhoods
        // map.current!.on('click', `neighborhood-fill-${index}`, () => {
        //   onNeighborhoodSelect(neighborhood);
        // });

        // map.current!.on('mouseenter', `neighborhood-fill-${index}`, () => {
        //   map.current!.getCanvas().style.cursor = 'pointer';
        // });

        // map.current!.on('mouseleave', `neighborhood-fill-${index}`, () => {
        //   map.current!.getCanvas().style.cursor = '';
        // });
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
      if (map.current) {
        try {
          // Check if map is loaded before removing
          if (map.current.loaded()) {
            map.current.remove();
          } else {
            // If not loaded, wait for load then remove
            map.current.on('load', () => {
              map.current?.remove();
            });
          }
        } catch (error) {
          console.warn('Error removing map:', error);
          // Force remove if regular removal fails
          try {
            map.current.getContainer()?.remove();
          } catch (e) {
            console.warn('Could not remove map container:', e);
          }
        }
        map.current = null;
      }
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
      
      {/* Neighborhood Legend */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 max-w-xs z-10 shadow-lg">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Neighborhoods</h3>
        <p className="text-xs text-muted-foreground mb-2">Click on property pins to view details</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {neighborhoods.map((neighborhood, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm border border-border/20" 
                style={{ backgroundColor: neighborhood.color }}
              />
              <span className="text-xs text-muted-foreground">{neighborhood.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Property Info Panel */}
      {selectedProperty && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 max-w-sm z-10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">{selectedProperty.title}</h3>
            {selectedProperty.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">NEW</span>
            )}
          </div>
          <div className="space-y-3">
            <img 
              src={selectedProperty.image} 
              alt={selectedProperty.title}
              className="w-full h-32 object-cover rounded"
            />
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{selectedProperty.address}</p>
              <p className="text-2xl font-bold text-green-600">${selectedProperty.price.toLocaleString()}/month</p>
              <div className="flex gap-4 text-muted-foreground">
                <span>{selectedProperty.bedrooms} bed</span>
                <span>{selectedProperty.bathrooms} bath</span>
                <span>{selectedProperty.sqft} sqft</span>
              </div>
              {selectedProperty.amenities && (
                <div className="space-y-1">
                  <p className="font-medium">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProperty.amenities.slice(0, 4).map((amenity: string, index: number) => (
                      <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {selectedProperty.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{selectedProperty.amenities.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;