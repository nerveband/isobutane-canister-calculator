export interface CanisterData {
  brand: string;
  fuelWeight: number;
  weights: number[];
}

export type CanisterDataMap = {
  [key: string]: CanisterData;
};

// Calculate averages for generic canisters based on common sizes
const genericData = {
  "100": {
    empty: Math.round([100, 100, 98, 102, 101].reduce((a, b) => a + b) / 5),
    quarter: Math.round([125, 125, 123, 127, 126].reduce((a, b) => a + b) / 5),
    half: Math.round([150, 150, 148, 152, 151].reduce((a, b) => a + b) / 5),
    threeQuarter: Math.round([175, 175, 173, 177, 176].reduce((a, b) => a + b) / 5),
    full: Math.round([200, 200, 198, 202, 201].reduce((a, b) => a + b) / 5)
  },
  "230": {
    empty: Math.round([150, 150, 160, 149, 135].reduce((a, b) => a + b) / 5),
    quarter: Math.round([208, 208, 218, 207, 193].reduce((a, b) => a + b) / 5),
    half: Math.round([265, 265, 275, 264, 250].reduce((a, b) => a + b) / 5),
    threeQuarter: Math.round([323, 323, 333, 322, 308].reduce((a, b) => a + b) / 5),
    full: Math.round([380, 380, 390, 379, 365].reduce((a, b) => a + b) / 5)
  },
  "450": {
    empty: Math.round([210, 213, 202, 195, 180].reduce((a, b) => a + b) / 5),
    quarter: Math.round([323, 326, 315, 308, 293].reduce((a, b) => a + b) / 5),
    half: Math.round([435, 438, 427, 420, 405].reduce((a, b) => a + b) / 5),
    threeQuarter: Math.round([548, 551, 540, 533, 518].reduce((a, b) => a + b) / 5),
    full: Math.round([660, 663, 652, 645, 630].reduce((a, b) => a + b) / 5)
  }
};

const staticCanisterData: CanisterDataMap = {
  // Generic/Unknown brand first with averaged data
  "Generic-100": { 
    brand: "Generic", 
    fuelWeight: 100, 
    weights: [
      genericData["100"].empty,
      genericData["100"].quarter,
      genericData["100"].half,
      genericData["100"].threeQuarter,
      genericData["100"].full
    ]
  },
  "Generic-230": { 
    brand: "Generic", 
    fuelWeight: 230, 
    weights: [
      genericData["230"].empty,
      genericData["230"].quarter,
      genericData["230"].half,
      genericData["230"].threeQuarter,
      genericData["230"].full
    ]
  },
  "Generic-450": { 
    brand: "Generic", 
    fuelWeight: 450, 
    weights: [
      genericData["450"].empty,
      genericData["450"].quarter,
      genericData["450"].half,
      genericData["450"].threeQuarter,
      genericData["450"].full
    ]
  },
  // Rest of the brands
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

// Barcode mapping: scanned barcode value to canister ID.
const barcodeMapping: Record<string, string> = {
  // MSR
  "012345678901": "MSR-110",
  "012345678902": "MSR-227",
  "012345678903": "MSR-450",
  // JetBoil
  "112345678901": "JetBoil-100",
  "112345678902": "JetBoil-230",
  "112345678903": "JetBoil-450",
  // Giga Power
  "212345678901": "GigaPower-110",
  "212345678902": "GigaPower-220",
  // GSI
  "312345678901": "GSI-110",
  "312345678902": "GSI-230",
  "312345678903": "GSI-450",
  // Optimus
  "412345678901": "Optimus-110",
  "412345678902": "Optimus-230",
  // Coleman
  "512345678901": "Coleman-240",
  "512345678902": "Coleman-440",
  "512345678903": "ColemanXTREME-240",
  "512345678904": "ColemanXTREME-440",
  // Primus
  "612345678901": "PrimusPower-100",
  "612345678902": "PrimusPower-230",
  "612345678903": "PrimusPower-450",
  "612345678904": "PrimusSummer-100",
  "612345678905": "PrimusSummer-230",
  "612345678906": "PrimusSummer-450",
  "612345678907": "PrimusCold-230",
  "612345678908": "PrimusCold-450",
  // Perune
  "712345678901": "Perune-100",
  "712345678902": "Perune-230"
};

/**
 * Retrieve canister data using a scanned barcode.
 *
 * @param barcode - The scanned barcode string.
 * @returns The matching CanisterData if found; otherwise, null.
 */
export const getCanisterByBarcode = async (barcode: string): Promise<CanisterData | null> => {
  const canisterDataMap = await getCanisterData();
  const canisterId = barcodeMapping[barcode];
  if (canisterId && canisterDataMap[canisterId]) {
    return canisterDataMap[canisterId];
  }
  return null;
}; 