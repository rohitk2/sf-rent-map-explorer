import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <div className="text-orange-500 text-xl font-bold">🏠 HopeSF</div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
            Find Help
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
            For Organizations
          </a>
        </nav>

        {/* Action Button */}
        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Header;