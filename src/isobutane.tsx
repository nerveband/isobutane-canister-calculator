'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from "@/components/ui/switch";
import { getCanisterData, CanisterDataMap } from '@/adapters/canisterAdapter';

const CANISTER_DATA = {
  "MSR-110": { brand: "MSR", fuelWeight: 110, weights: [101, 129, 156, 184, 211] },
  "MSR-227": { brand: "MSR", fuelWeight: 227, weights: [147, 204, 261, 317, 374] },
  "MSR-450": { brand: "MSR", fuelWeight: 450, weights: [210, 323, 435, 548, 660] },
  "JetBoil-100": { brand: "Jet Boil", fuelWeight: 100, weights: [100, 125, 150, 175, 200] },
  "JetBoil-230": { brand: "Jet Boil", fuelWeight: 230, weights: [150, 208, 265, 323, 380] },
  "JetBoil-450": { brand: "Jet Boil", fuelWeight: 450, weights: [213, 326, 438, 551, 663] },
  "GigaPower-110": { brand: "Giga Power", fuelWeight: 110, weights: [103, 131, 158, 186, 213] },
  "GigaPower-220": { brand: "Giga Power", fuelWeight: 220, weights: [150, 205, 260, 315, 370] },
  "GSI-110": { brand: "GSI", fuelWeight: 110, weights: [101, 129, 156, 184, 211] },
  "GSI-230": { brand: "GSI", fuelWeight: 230, weights: [153, 211, 268, 326, 383] },
  "GSI-450": { brand: "GSI", fuelWeight: 450, weights: [202, 315, 427, 540, 652] },
  "Optimus-110": { brand: "Energy by Optimus", fuelWeight: 110, weights: [90, 118, 145, 173, 200] },
  "Optimus-230": { brand: "Energy by Optimus", fuelWeight: 230, weights: [130, 188, 245, 303, 360] },
  "Coleman-240": { brand: "Coleman Performance", fuelWeight: 240, weights: [121, 181, 241, 301, 361] },
  "Coleman-440": { brand: "Coleman Performance", fuelWeight: 440, weights: [158, 268, 378, 488, 598] },
  "PrimusPower-100": { brand: "Primus Power Gas", fuelWeight: 100, weights: [98, 123, 148, 173, 198] },
  "PrimusPower-230": { brand: "Primus Power Gas", fuelWeight: 230, weights: [160, 218, 275, 333, 390] },
  "PrimusPower-450": { brand: "Primus Power Gas", fuelWeight: 450, weights: [195, 308, 420, 533, 645] },
  "PrimusSummer-100": { brand: "Primus Summer Gas", fuelWeight: 100, weights: [102, 127, 152, 177, 202] },
  "PrimusSummer-230": { brand: "Primus Summer Gas", fuelWeight: 230, weights: [149, 207, 264, 322, 379] },
  "PrimusSummer-450": { brand: "Primus Summer Gas", fuelWeight: 450, weights: [180, 293, 405, 518, 630] },
  "Perune-100": { brand: "Perune", fuelWeight: 100, weights: [101, 126, 151, 176, 201] },
  "Perune-230": { brand: "Perune", fuelWeight: 230, weights: [135, 193, 250, 308, 365] },
  "ColemanXTREME-240": { brand: "Coleman XTREME", fuelWeight: 240, weights: [111, 171, 231, 291, 351] },
  "ColemanXTREME-440": { brand: "Coleman XTREME", fuelWeight: 440, weights: [220, 330, 440, 550, 660] },
  "PrimusCold-230": { brand: "Primus Cold Gas", fuelWeight: 230, weights: [160, 218, 275, 333, 390] },
  "PrimusCold-450": { brand: "Primus Cold Gas", fuelWeight: 450, weights: [195, 308, 420, 533, 645] }
};

const IsobutaneCalculator = () => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [useOunces, setUseOunces] = useState(false);
  const [canisterDataMap, setCanisterDataMap] = useState<CanisterDataMap | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [weightWarning, setWeightWarning] = useState<string | null>(null);

  // Add effect to validate weight whenever it changes
  useEffect(() => {
    if (!selectedModel || !canisterDataMap || !currentWeight) {
      setWeightError(null);
      setWeightWarning(null);
      return;
    }

    const canisterData = canisterDataMap[selectedModel];
    const validation = validateWeight(currentWeight, canisterData);
    setWeightError(validation.error || null);
    setWeightWarning(validation.warning || null);
  }, [currentWeight, selectedModel, canisterDataMap, useOunces]);

  // Remove the reset of errors in this effect since we handle it in the validation effect
  useEffect(() => {
    setSelectedModel('');
  }, [selectedBrand]);

  // Load the canister data from the adapter on component mount.
  useEffect(() => {
    getCanisterData().then((data) => {
      setCanisterDataMap(data);
    });
  }, []);

  const brandModels = useMemo(() => {
    if (!canisterDataMap) return {};
    
    const brands: { [key: string]: { id: string; fuelWeight: number }[] } = {};
    
    Object.entries(canisterDataMap).forEach(([id, data]) => {
      if (!brands[data.brand]) {
        brands[data.brand] = [];
      }
      brands[data.brand].push({ id, fuelWeight: data.fuelWeight });
    });

    return brands;
  }, [canisterDataMap]);

  const uniqueBrands = useMemo(() => {
    return Object.keys(brandModels).sort();
  }, [brandModels]);

  const gramsToOz = (g: number) => (g / 28.35).toFixed(2);
  const ozToGrams = (oz: number) => (oz * 28.35).toFixed(1);

  const validateWeight = (
    weight: string,
    canisterData: { weights: number[] }
  ): { isValid: boolean; error?: string; warning?: string } => {
    if (!weight) {
      return { isValid: false, error: "Please enter a weight" };
    }

    const weightInGrams = useOunces ? parseFloat(ozToGrams(parseFloat(weight))) : parseFloat(weight);
    
    if (isNaN(weightInGrams)) {
      return { isValid: false, error: "Please enter a valid number" };
    }

    const minWeight = canisterData.weights[0];
    const maxWeight = canisterData.weights[canisterData.weights.length - 1];

    // Check for physically impossible weights (significantly outside valid range)
    if (weightInGrams < minWeight * 0.9) { // More than 10% below empty weight
      return { 
        isValid: false, 
        error: `Weight too low: ${useOunces ? gramsToOz(weightInGrams) : weightInGrams}${useOunces ? 'oz' : 'g'} is below minimum empty weight (${useOunces ? gramsToOz(minWeight) : minWeight}${useOunces ? 'oz' : 'g'})`
      };
    }

    if (weightInGrams > maxWeight * 1.1) { // More than 10% above full weight
      return { 
        isValid: false, 
        error: `Weight too high: ${useOunces ? gramsToOz(weightInGrams) : weightInGrams}${useOunces ? 'oz' : 'g'} is above maximum full weight (${useOunces ? gramsToOz(maxWeight) : maxWeight}${useOunces ? 'oz' : 'g'})`
      };
    }

    // Check for weights slightly outside normal range (might be measurement error)
    if (weightInGrams < minWeight) {
      return { 
        isValid: true, 
        warning: `Weight ${useOunces ? gramsToOz(weightInGrams) : weightInGrams}${useOunces ? 'oz' : 'g'} is slightly below empty weight (${useOunces ? gramsToOz(minWeight) : minWeight}${useOunces ? 'oz' : 'g'}). Please verify your measurement.`
      };
    }

    if (weightInGrams > maxWeight) {
      return { 
        isValid: true, 
        warning: `Weight ${useOunces ? gramsToOz(weightInGrams) : weightInGrams}${useOunces ? 'oz' : 'g'} is slightly above full weight (${useOunces ? gramsToOz(maxWeight) : maxWeight}${useOunces ? 'oz' : 'g'}). Please verify your measurement.`
      };
    }

    return { isValid: true };
  };

  const calculateFuelRemaining = (
    weight: string,
    canisterData: { weights: number[]; fuelWeight: number }
  ) => {
    if (!weight || !canisterData) return null;
    
    const validation = validateWeight(weight, canisterData);
    setWeightError(validation.error || null);
    setWeightWarning(validation.warning || null);
    
    if (!validation.isValid) {
      return null;
    }
    
    const weightInGrams = useOunces ? parseFloat(ozToGrams(parseFloat(weight))) : parseFloat(weight);
    const percentages = [0, 25, 50, 75, 100];
    const weights = canisterData.weights;

    // Handle edge cases with clamping
    if (weightInGrams <= weights[0]) return 0;
    if (weightInGrams >= weights[weights.length - 1]) return 100;

    // Find the interval where the weight falls
    for (let i = 0; i < weights.length - 1; i++) {
      if (weightInGrams >= weights[i] && weightInGrams <= weights[i + 1]) {
        const weightRange = weights[i + 1] - weights[i];
        const percentageRange = percentages[i + 1] - percentages[i];
        const weightDiff = weightInGrams - weights[i];
        return percentages[i] + (weightDiff / weightRange) * percentageRange;
      }
    }

    return null;
  };

  const result = useMemo(() => {
    if (!selectedModel || !currentWeight || !canisterDataMap) return null;
    
    const canData = canisterDataMap[selectedModel];
    if (!canData) return null;

    const percentage = calculateFuelRemaining(currentWeight, canData);
    if (percentage === null) return null;

    const emptyWeight = canData.weights[0];
    const fullWeight = canData.weights[canData.weights.length - 1];
    const weightInGrams = useOunces ? ozToGrams(parseFloat(currentWeight)) : currentWeight;
    const remainingFuel = Math.max(0, parseFloat(weightInGrams as string) - emptyWeight);
    
    return {
      percentage: percentage.toFixed(1),
      remainingFuel: useOunces ? gramsToOz(remainingFuel) : remainingFuel.toFixed(1),
      emptyWeight: useOunces ? gramsToOz(emptyWeight) : emptyWeight,
      totalFuel: useOunces ? gramsToOz(canData.fuelWeight) : canData.fuelWeight,
      fullWeight: useOunces ? gramsToOz(fullWeight) : fullWeight,
    };
  }, [selectedModel, currentWeight, useOunces, canisterDataMap]);

  // Render a loading state while the canister data is fetched.
  if (!canisterDataMap) {
    return <div>Loading canister data...</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Isobutane Calculator</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="unit-toggle" className="text-sm">g</Label>
            <Switch
              id="unit-toggle"
              checked={useOunces}
              onCheckedChange={setUseOunces}
              className="data-[state=checked]:bg-orange-500"
            />
            <Label htmlFor="unit-toggle" className="text-sm">oz</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Brand</Label>
              <div className="grid grid-cols-2 gap-2">
                {uniqueBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`p-2 text-sm rounded-md border transition-colors
                      ${selectedBrand === brand 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'border-orange-200 hover:border-orange-500'
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {selectedBrand && (
              <div>
                <Label className="mb-2 block">Model</Label>
                <div className="grid grid-cols-1 gap-2">
                  {brandModels[selectedBrand]?.map(({ id, fuelWeight }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedModel(id)}
                      className={`p-2 text-sm rounded-md border transition-colors text-left
                        ${selectedModel === id 
                          ? 'bg-orange-500 text-white border-orange-500' 
                          : 'border-orange-200 hover:border-orange-500'
                        }`}
                    >
                      {useOunces ? gramsToOz(fuelWeight) : fuelWeight}{useOunces ? 'oz' : 'g'} canister
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight ({useOunces ? 'oz' : 'g'})</Label>
            <Input
              id="weight"
              type="number"
              step={useOunces ? "0.01" : "1"}
              placeholder={`Enter weight in ${useOunces ? 'ounces' : 'grams'}`}
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className={`w-full border-2 transition-colors ${
                weightError ? 'border-red-500 focus:ring-red-500 bg-red-50' :
                weightWarning ? 'border-yellow-500 focus:ring-yellow-500 bg-yellow-50' :
                'border-orange-200 focus:ring-orange-500'
              }`}
            />
            {selectedModel && canisterDataMap[selectedModel] && (
              <p className="text-sm text-gray-500 mt-1">
                Valid range: {useOunces 
                  ? `${gramsToOz(canisterDataMap[selectedModel].weights[0])}oz - ${gramsToOz(canisterDataMap[selectedModel].weights[4])}oz`
                  : `${canisterDataMap[selectedModel].weights[0]}g - ${canisterDataMap[selectedModel].weights[4]}g`}
              </p>
            )}
          </div>

          {weightError && (
            <Alert className="border-red-500 bg-red-50 text-red-800">
              <AlertDescription>{weightError}</AlertDescription>
            </Alert>
          )}

          {weightWarning && !weightError && (
            <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
              <AlertDescription>{weightWarning}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Canister Details</h3>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {canisterDataMap[selectedModel].brand} - {useOunces ? gramsToOz(canisterDataMap[selectedModel].fuelWeight) : canisterDataMap[selectedModel].fuelWeight}{useOunces ? 'oz' : 'g'} canister
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Empty Weight: {result.emptyWeight}{useOunces ? 'oz' : 'g'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Fuel When Full: {result.totalFuel}{useOunces ? 'oz' : 'g'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Weight When Full: {result.fullWeight}{useOunces ? 'oz' : 'g'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Remaining Fuel</h3>
                  <p className="text-2xl font-bold text-orange-500">
                    {result.remainingFuel}{useOunces ? 'oz' : 'g'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Fuel Percentage</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-orange-500">
                          {result.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-100">
                      <div 
                        style={{ width: `${result.percentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="text-center p-4 text-sm text-gray-500">
        Made by <a href="https://ashrafali.net" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">Ashraf Ali</a>
      </div>
    </Card>
  );
};

export default IsobutaneCalculator;