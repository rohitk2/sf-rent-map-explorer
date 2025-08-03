import React, { useState } from 'react';
import MapView from '@/components/MapView';
import Chatbot from '@/components/Chatbot';
import Header from '@/components/Header';
// import PropertySidebar from '@/components/PropertySidebar';
// import { properties } from '@/data/properties';
import { foodDistributionCenters } from '@/data/food-distribution-centers';
import { shelters } from '@/data/shelters';
import { hospitals } from '@/data/hospitals';
import { restrooms } from '@/data/restrooms';
import { laundromats } from '@/data/laundromats';

const Index = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      {/* <PropertySidebar
        properties={properties}
        onPropertySelect={handlePropertySelect}
        selectedProperty={selectedProperty}
      /> */}
      <div className="flex flex-1">
        <MapView
          onPropertySelect={handlePropertySelect}
          selectedProperty={selectedProperty}
          properties={[...foodDistributionCenters, ...shelters, ...hospitals, ...restrooms, ...laundromats]}
        />
      </div>
      <Chatbot />
    </div>
  );
};

export default Index;
