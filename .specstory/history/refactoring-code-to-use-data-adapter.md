## SpecStory

## Refactoring Code to Use Data Adapter (2/5/2025, 4:56:47 PM)

_**User**_

how would you adjust this code so that it uses a data adapter so that data can be injected through any means like pocketbase or supabase or whatever is desired in the future?

---

_**Assistant**_

Below is one example of how you might refactor your code to decouple the static data by introducing a data adapter. In this example, we create an adapter file (e.g., using a promise to simulate asynchronous fetching) that supplies the canister data. Then, the component uses that adapter to load its data. In the future you can update just the adapter (for example, to fetch from PocketBase, Supabase, etc.) without modifying the rest of your component code.

---

### 1. Create the Data Adapter

Create a new file at `src/adapters/canisterAdapter.ts` that exports a function to retrieve the canister data. For now, we return the static data wrapped in a promise:

```typescript:src/adapters/canisterAdapter.ts
export interface CanisterData {
  brand: string;
  fuelWeight: number;
  weights: number[];
}

export type CanisterDataMap = {
  [key: string]: CanisterData;
};

const staticCanisterData: CanisterDataMap = {
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

export const getCanisterData = async (): Promise<CanisterDataMap> => {
  // Simulate asynchronous data fetching.
  return Promise.resolve(staticCanisterData);
};
```

---

### 2. Update the Component to Use the Adapter

Now modify your `src/isobutane.tsx` file. Remove the in-file `CANISTER_DATA` and instead import and load the data using the adapter (using a hook and the `useEffect` to account for asynchronous loading):

```tsx:src/isobutane.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from "@/components/ui/switch";
import { getCanisterData, CanisterDataMap } from '@/adapters/canisterAdapter';

const IsobutaneCalculator = () => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [selectedCanister, setSelectedCanister] = useState('');
  const [useOunces, setUseOunces] = useState(false);
  const [canisterDataMap, setCanisterDataMap] = useState<CanisterDataMap | null>(null);

  // Load the canister data from the adapter on component mount.
  useEffect(() => {
    getCanisterData().then((data) => {
      setCanisterDataMap(data);
    });
  }, []);

  const gramsToOz = (g: number) => (g / 28.35).toFixed(2);
  const ozToGrams = (oz: number) => (oz * 28.35).toFixed(1);

  const calculateFuelRemaining = (
    weight: string,
    canisterData: { weights: number[]; fuelWeight: number }
  ) => {
    if (!weight || !canisterData) return null;
    
    const weightInGrams = useOunces ? ozToGrams(parseFloat(weight)) : weight;
    const numWeight = parseFloat(weightInGrams as string);
    if (isNaN(numWeight)) return null;

    const percentages = [0, 25, 50, 75, 100];
    const weights = canisterData.weights;

    if (numWeight <= weights[0]) return 0;
    if (numWeight >= weights[weights.length - 1]) return 100;

    for (let i = 0; i < weights.length - 1; i++) {
      if (numWeight >= weights[i] && numWeight <= weights[i + 1]) {
        const weightRange = weights[i + 1] - weights[i];
        const percentageRange = percentages[i + 1] - percentages[i];
        const weightDiff = numWeight - weights[i];
        return percentages[i] + (weightDiff / weightRange) * percentageRange;
      }
    }

    return null;
  };

  const result = useMemo(() => {
    if (!selectedCanister || !currentWeight || !canisterDataMap) return null;
    
    const canData = canisterDataMap[selectedCanister];
    if (!canData) return null;

    const percentage = calculateFuelRemaining(currentWeight, canData);
    if (percentage === null) return null;

    const emptyWeight = canData.weights[0];
    const weightInGrams = useOunces ? ozToGrams(parseFloat(currentWeight)) : currentWeight;
    const remainingFuel = Math.max(0, parseFloat(weightInGrams as string) - emptyWeight);
    
    return {
      percentage: percentage.toFixed(1),
      remainingFuel: useOunces ? gramsToOz(remainingFuel) : remainingFuel.toFixed(1),
      emptyWeight: useOunces ? gramsToOz(emptyWeight) : emptyWeight,
      totalFuel: useOunces ? gramsToOz(canData.fuelWeight) : canData.fuelWeight,
    };
  }, [selectedCanister, currentWeight, useOunces, canisterDataMap]);

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
          <div className="space-y-2">
            <Label>Brand & Size</Label>
            <Select value={selectedCanister} onValueChange={setSelectedCanister}>
              <SelectTrigger className="border-orange-200 focus:ring-orange-500">
                <SelectValue placeholder="Select canister type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(canisterDataMap).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.brand} - {useOunces ? gramsToOz(data.fuelWeight) : data.fuelWeight}
                    {useOunces ? 'oz' : 'g'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              className="w-full border-orange-200 focus:ring-orange-500"
            />
          </div>

          {selectedCanister && currentWeight && !result && (
            <Alert variant="destructive">
              <AlertDescription>
                Please enter a valid weight for this canister type
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Canister Details</h3>
                <p className="text-sm text-gray-600">
                  Empty Weight: {result.emptyWeight}{useOunces ? 'oz' : 'g'}
                </p>
                <p className="text-sm text-gray-600">
                  Total Fuel When Full: {result.totalFuel}{useOunces ? 'oz' : 'g'}
                </p>
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
    </Card>
  );
};

export default IsobutaneCalculator;
```

---

### Explanation

- **Data Adapter (`src/adapters/canisterAdapter.ts`):**  
  This file encapsulates your data. Today it returns a static object as a promise. In the future, you can modify this adapter to retrieve data from PocketBase, Supabase, or any other backend service without changing your component’s logic.

- **Component (`src/isobutane.tsx`):**  
  Instead of directly using a hardcoded constant, the component fetches data from the adapter on mount using `useEffect` and stores it in a state variable. The UI then renders based on that state. This makes it easy to swap out data sources as needed.

This approach cleanly separates your component’s UI and logic from data retrieval, making your code more modular and future-proof.

---



---

