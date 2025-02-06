'use client';

import * as React from "react";

interface TabNavigationProps {
  activeTab: 'calculator' | 'barcode' | 'about';
  onTabChange: (tab: 'calculator' | 'barcode' | 'about') => void;
  showBarcodeTab?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange,
  showBarcodeTab = false
}) => {
  return (
    <div className="flex justify-center mb-4">
      <nav className="flex space-x-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => onTabChange('calculator')}
          className={`flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all
            ${activeTab === 'calculator' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
            }`}
        >
          Calculator
        </button>

        {showBarcodeTab && (
          <button
            onClick={() => onTabChange('barcode')}
            className={`flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all
              ${activeTab === 'barcode' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
          >
            Weight Input
          </button>
        )}

        <button
          onClick={() => onTabChange('about')}
          className={`flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all
            ${activeTab === 'about' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
            }`}
        >
          About
        </button>
      </nav>
    </div>
  );
}; 