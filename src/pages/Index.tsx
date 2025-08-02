import React, { useState } from 'react';
import MapView from '@/components/MapView';
// import PropertySidebar from '@/components/PropertySidebar';
import { properties } from '@/data/properties';

const Index = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const handleNeighborhoodSelect = (neighborhood: any) => {
    setSelectedNeighborhood(neighborhood);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* <PropertySidebar
        properties={properties}
        onPropertySelect={handlePropertySelect}
        selectedProperty={selectedProperty}
      /> */}
      <div className="flex-1">
        <MapView
          onNeighborhoodSelect={handleNeighborhoodSelect}
          selectedNeighborhood={selectedNeighborhood}
          properties={properties}
        />
      </div>
    </div>
  );
};

export default Index;
