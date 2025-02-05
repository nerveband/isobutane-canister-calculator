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