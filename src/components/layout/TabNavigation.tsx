'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Calculator, Info } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'calculator' | 'about';
  onTabChange: (tab: 'calculator' | 'about') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('calculator')}
        className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center space-x-2 ${
          activeTab === 'calculator'
            ? 'text-orange-500 border-b-2 border-orange-500 -mb-px'
            : 'text-gray-500 hover:text-orange-500'
        }`}
      >
        <Calculator className="w-4 h-4" />
        <span>Calculator</span>
      </button>
      <button
        onClick={() => onTabChange('about')}
        className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center space-x-2 ${
          activeTab === 'about'
            ? 'text-orange-500 border-b-2 border-orange-500 -mb-px'
            : 'text-gray-500 hover:text-orange-500'
        }`}
      >
        <Info className="w-4 h-4" />
        <span>About</span>
      </button>
    </div>
  );
}; 