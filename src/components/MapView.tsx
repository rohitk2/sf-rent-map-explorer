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
          // Create custom icon element based on type
          const el = document.createElement('div');
          const getIconAndClass = (type: string) => {
            switch (type) {
              case 'shelter': return { icon: '🏠', className: 'shelter-marker' };
              case 'hospital': return { icon: '🏥', className: 'hospital-marker' };
              default: return { icon: '🍽️', className: 'food-marker' };
            }
          };
          const { icon, className } = getIconAndClass(property.type);
          el.className = className;
          el.innerHTML = icon;
          el.style.cssText = `
            font-size: 24px;
            cursor: pointer;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
          `;

          const marker = new mapboxgl.Marker(el)
            .setLngLat([property.lng, property.lat])
            .addTo(map.current!);

          el.addEventListener('click', () => {
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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded-lg p-3 max-w-xs w-80 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{selectedProperty.name}</h3>
            <button 
              onClick={() => onPropertySelect(null)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {selectedProperty.type === 'shelter' ? '🏠' : 
                 selectedProperty.type === 'hospital' ? '🏥' : '🍽️'}
              </span>
              <span className="text-sm font-medium text-green-600">
                {selectedProperty.type === 'hospital' ? 'Medical Services' : 'Free Service'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-muted-foreground text-xs">{selectedProperty.address}</p>
              <div className="flex gap-3 text-muted-foreground">
                <span>
                  {selectedProperty.type === 'shelter' ? 'Shelter Services' : 
                   selectedProperty.type === 'hospital' ? 'Hospital' : 'Food Distribution Center'}
                </span>
              </div>
              {selectedProperty.inventory && (
                <div className="mt-3 pt-2 border-t border-border/20">
                  <h4 className="text-xs font-medium text-foreground mb-2">Available Items</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(selectedProperty.inventory).map(([item, quantity]) => (
                      <div key={item} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{item}:</span>
                        <span className={`font-medium ${quantity === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {String(quantity)}
                        </span>
                      </div>
                    ))}
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