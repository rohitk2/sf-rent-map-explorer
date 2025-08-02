import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import PropertyCard from './PropertyCard';

interface PropertySidebarProps {
  properties: any[];
  onPropertySelect: (property: any) => void;
  selectedProperty: any;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ 
  properties, 
  onPropertySelect, 
  selectedProperty 
}) => {
  return (
    <div className="w-96 bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold mb-4">SF Rentals</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by neighborhood, address..."
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-2000">$0 - $2,000</SelectItem>
              <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
              <SelectItem value="3000-4000">$3,000 - $4,000</SelectItem>
              <SelectItem value="4000+">$4,000+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="1">1 Bed</SelectItem>
              <SelectItem value="2">2 Beds</SelectItem>
              <SelectItem value="3+">3+ Beds</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          {properties.length} properties found
        </p>
      </div>
      
      {/* Property List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={() => onPropertySelect(property)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertySidebar;