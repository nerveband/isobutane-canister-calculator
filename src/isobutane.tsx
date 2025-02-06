'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from "@/components/ui/switch";
import { getCanisterData, CanisterDataMap, getCanisterByBarcode } from '@/adapters/canisterAdapter';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { About } from '@/components/About';
import { Flame, Scale, Percent, Info, AlertTriangle, CheckCircle2, Fuel, Camera, Store, Package } from 'lucide-react';
import BarcodeScanner from '@/components/ui/BarcodeScanner';

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

// Feature flags
const FEATURES = {
  BARCODE_SCANNING: false, // Set to false to disable barcode scanning
};

const IsobutaneCalculator = () => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [useOunces, setUseOunces] = useState(false);
  const [canisterDataMap, setCanisterDataMap] = useState<CanisterDataMap | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [weightWarning, setWeightWarning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'barcode' | 'about'>('calculator');
  const [ocrError, setOcrError] = useState<string | null>(null);

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

  // Add effect to focus input when model is selected
  useEffect(() => {
    if (selectedModel) {
      const inputElement = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [selectedModel]);

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

  // Handle OCR result
  const handleOCRResult = (text: string) => {
    // Basic extraction of weight value
    const extracted = text.match(/\d+(\.\d+)?/);
    if (extracted) {
      setCurrentWeight(extracted[0]);
      setOcrError(null);
    } else {
      setOcrError("No valid weight detected in the image. Please try again.");
    }
  };

  // Handle barcode scanning result
  const handleBarcodeResult = async (barcode: string) => {
    try {
      const canisterData = await getCanisterByBarcode(barcode);
      if (canisterData) {
        setSelectedBrand(canisterData.brand);
        // Find the model ID from brandModels
        const modelId = Object.entries(canisterDataMap || {})
          .find(([id, data]) => 
            data.brand === canisterData.brand && 
            data.fuelWeight === canisterData.fuelWeight
          )?.[0];
        if (modelId) {
          setSelectedModel(modelId);
        }
      } else {
        setWeightError("Canister not found for this barcode. Please select manually.");
      }
    } catch (err) {
      console.error("Error processing barcode:", err);
      setWeightError("Failed to process barcode. Please select canister manually.");
    }
  };

  // Render a loading state while the canister data is fetched.
  if (!canisterDataMap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-4">
          <div className="text-center mb-4">
            <Fuel className="w-8 h-8 text-orange-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-semibold mt-2 text-white">Loading Canister Data</h2>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-1000"
              style={{ width: '90%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} showBarcodeTab={FEATURES.BARCODE_SCANNING} />
      
      {activeTab === 'about' ? (
        <About />
      ) : activeTab === 'barcode' && FEATURES.BARCODE_SCANNING ? (
        <Card className="w-full max-w-4xl mx-auto glass-effect float-animation">
          <CardHeader className="p-2 sm:p-6">
            <div className="flex items-center space-x-3">
              <Camera className="w-6 h-6 text-orange-500" />
              <CardTitle className="text-xl font-bold">Barcode Scanner & Weight Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan your canister's barcode to automatically select the correct brand and model, or use the camera/image upload to read the weight from your scale.
              </p>
              <BarcodeScanner 
                onBarcodeDetected={handleBarcodeResult}
                onOCRResult={handleOCRResult}
              />
              {ocrError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{ocrError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="p-6 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Fuel className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl font-bold">Isobutane Calculator</CardTitle>
              </div>
              <div className="flex items-center space-x-2 justify-center w-full sm:w-auto">
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
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-10">
              <div className="space-y-4">
                <Label className="mb-3 block flex items-center space-x-2">
                  <Store className="w-4 h-4 text-orange-500" />
                  <span>Select Brand</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  {uniqueBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`p-2 text-sm rounded-md border transition-colors text-center
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
                <div className="space-y-4">
                  <Label className="mb-3 block flex items-center space-x-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span>Model</span>
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
                    {brandModels[selectedBrand]?.map(({ id, fuelWeight }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedModel(id)}
                        className={`p-2 text-sm rounded-md border transition-colors text-center
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

              {selectedModel && (
                <div className="space-y-4">
                  <Label className="mb-3 block flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-orange-500" />
                    <span className="text-lg">Current Weight ({useOunces ? 'oz' : 'g'})</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      placeholder={`Enter weight in ${useOunces ? 'ounces' : 'grams'}`}
                      className="w-full h-16 text-2xl px-4 pr-12 text-center font-medium tracking-wide rounded-xl
                        bg-white shadow-sm border-2 border-orange-100
                        focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:ring-offset-2
                        transition-all duration-200 ease-out
                        placeholder:text-gray-400 placeholder:text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-gray-500">
                      {useOunces ? 'oz' : 'g'}
                    </div>
                  </div>
                </div>
              )}

              {(weightError || weightWarning) && (
                <div className="space-y-3">
                  {weightError && (
                    <Alert className="border-red-500 bg-red-50/90 text-red-800 text-sm backdrop-blur-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <AlertDescription>{weightError}</AlertDescription>
                    </Alert>
                  )}

                  {weightWarning && !weightError && (
                    <Alert className="border-yellow-500 bg-yellow-50/90 text-yellow-800 text-sm backdrop-blur-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <AlertDescription>{weightWarning}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
                      <Info className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Canister Details</span>
                    </h3>
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {canisterDataMap[selectedModel].brand} - {useOunces ? gramsToOz(canisterDataMap[selectedModel].fuelWeight) : canisterDataMap[selectedModel].fuelWeight}{useOunces ? 'oz' : 'g'} canister
                    </p>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p className="text-gray-600">
                        Empty Weight: {result.emptyWeight}{useOunces ? 'oz' : 'g'}
                      </p>
                      <p className="text-gray-600">
                        Total Fuel When Full: {result.totalFuel}{useOunces ? 'oz' : 'g'}
                      </p>
                      <p className="text-gray-600">
                        Total Weight When Full: {result.fullWeight}{useOunces ? 'oz' : 'g'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold mb-1 flex items-center space-x-2 text-sm sm:text-base justify-center sm:justify-start">
                        <Fuel className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Remaining Fuel</span>
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-orange-500">
                        {result.remainingFuel}{useOunces ? 'oz' : 'g'}
                      </p>
                    </div>

                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold mb-1 flex items-center space-x-2 text-sm sm:text-base justify-center sm:justify-start">
                        <Percent className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Fuel Percentage</span>
                      </h3>
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-xl sm:text-2xl font-bold text-orange-500 mb-2">
                          {result.percentage}%
                        </span>
                        <div className="h-2 rounded bg-orange-100 w-full">
                          <div 
                            style={{ width: `${result.percentage}%` }}
                            className="h-full rounded bg-orange-500 transition-all duration-500 ease-out"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <div className="text-center p-2 pb-6 sm:p-4 text-xs sm:text-sm text-gray-500">
            Made by <a href="https://ashrafali.net" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">Ashraf Ali</a>
          </div>
        </Card>
      )}
    </div>
  );
};

export default IsobutaneCalculator;