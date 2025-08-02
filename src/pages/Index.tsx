import React, { useState } from 'react';
import MapView from '@/components/MapView';
// import PropertySidebar from '@/components/PropertySidebar';
import { properties } from '@/data/properties';

const Index = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
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
          onPropertySelect={handlePropertySelect}
          selectedProperty={selectedProperty}
          properties={properties}
        />
      </div>
    </div>
  );
};

export default Index;
