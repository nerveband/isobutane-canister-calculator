import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, ListChecks, Database, Mail, Shield, Fuel } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <Fuel className="w-6 h-6 text-orange-500 shrink-0" />
          <CardTitle className="text-lg sm:text-xl font-bold">About the Isobutane Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-orange-500 shrink-0" />
            <span>What is this tool?</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            The Isobutane Canister Calculator is a free tool that helps outdoor enthusiasts accurately measure the remaining fuel in their isobutane canisters. Whether you're planning a backpacking trip or just want to know if you need a new canister, this calculator provides precise measurements for a wide range of canister brands and sizes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-orange-500 shrink-0" />
            <span>How to Use</span>
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-600">
            <li>Select your canister brand from the available options</li>
            <li>Choose your specific canister model</li>
            <li>Enter the current weight of your canister (in grams or ounces)</li>
            <li>View the remaining fuel amount and percentage</li>
          </ol>
          <p className="text-sm sm:text-base text-gray-600">
            The calculator will automatically validate your input and warn you if the weight is outside the expected range for your canister.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
            <Database className="w-5 h-5 text-orange-500 shrink-0" />
            <span>Data Source</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            The weight data used in this calculator is sourced from{' '}
            <a 
              href="https://bantamoutdoors.com/wp-content/uploads/2023/02/Isobutane-Canister-Weight-Table-g.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600"
            >
              Bantam Outdoors
            </a>
            . We maintain an extensive database of canister specifications to ensure accurate calculations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
            <Mail className="w-5 h-5 text-orange-500 shrink-0" />
            <span>Contributing</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Have data for a canister brand or model that's not listed? Please email{' '}
            <a 
              href="mailto:hello@ashrafali.net"
              className="text-orange-500 hover:text-orange-600"
            >
              hello@ashrafali.net
            </a>
            {' '}with the following information:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 ml-4">
            <li>Brand name</li>
            <li>Model name/number</li>
            <li>Empty canister weight</li>
            <li>Full canister weight</li>
            <li>Fuel capacity</li>
            <li>Source of information</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-500 shrink-0" />
            <span>Privacy</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            This calculator works entirely in your browser. No data is collected or stored on any servers.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}; 