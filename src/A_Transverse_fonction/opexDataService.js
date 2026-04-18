
// Single source of truth for OPEX default values and localStorage persistence.
// Keys stored with 'opex_' prefix; service object uses keys without prefix.

export const DEFAULT_OPEX_DATA = {
  // UI
  activeTab: 1,

  // Section 1: Général
  selectedCountryCode: 'FR',
  selectedRatio: 83,
  ratioElec: 83,
  currency: '€',
  availability: 8760,

  // Section 2: Transportation
  truck15TCO2: 0.238,
  truck15TPrice: 0.25,
  truck20TCO2: 0.223,
  truck20TPrice: 0.24,
  truck25TCO2: 0.119,
  truck25TPrice: 0.23,

  // Section 3: Compressed Air
  airPressure: 7,
  compressorType: 'à vis',
  powerRatio: 0.11,
  airConsumptionPrice: 0.1,

  // Section 4: Electricité
  purchaseElectricityPrice: 200,
  sellingElectricityPrice: 120,

  // Section 5: Gas
  gasTypes: {
    naturalGasH: { molecule: 80, co2Emission: 197 },
    naturalGasL: { molecule: 80, co2Emission: 200 },
    processGas:  { molecule: 60, co2Emission: 210 },
  },
  fuelTypes: {
    FOD: { liquid: 1.04, co2Emission: 3.85 },
    FOL: { liquid: 0.8,  co2Emission: 3.64 },
    FOM: { liquid: 0.75, co2Emission: 3.64 },
    FOH: { liquid: 0.70, co2Emission: 3.64 },
    MDO: { liquid: 1.1,  co2Emission: 3.86 },
    HFO: { liquid: 0.70, co2Emission: 3.64 },
  },
  reagentsTypes: {
    CaOH2:      { cost: 0.1,  Purity: 90,  CO2emission: 0.846, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    CaO:        { cost: 0.1,  Purity: 95,  CO2emission: 1.11,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    CaCO3:      { cost: 0.1,  Purity: 95,  CO2emission: 0.76,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    HCO3:       { cost: 1,    Purity: 100, CO2emission: 1.166, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    NaOH:       { cost: 0.3,  Purity: 100, CO2emission: 1.174, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    NaOHCO3:    { cost: 200,  Purity: 100, CO2emission: 0.76,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    NH3:        { cost: 0.05, Purity: 95,  CO2emission: 2.11,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    Urea:       { cost: 0.05, Purity: 95,  CO2emission: 0.76,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    NaBr_CaBr2: { cost: 1,    Purity: 52,  CO2emission: 0.76,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
    CAP:        { cost: 1,    Purity: 100, CO2emission: 0.99,  truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57 },
  },

  // Section 6: Steam
  steamPrices: {
    highPressure: 40,
    lowPressure1: 30,
    lowPressure2: 25,
    fatal: 10,
  },

  // Section 7: Water
  waterPrices: {
    potable:       3,
    cooling:       1,
    demineralized: 5,
    soft:          2,
    river:         0.5,
  },

  // Section 8: Byproducts
  byproducts: [
    { name: 'Incineration ash / clinker / residues', cost: 150, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 89.25 },
    { name: 'Boiler ashes disposal',                 cost: 100, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 89.25 },
    { name: 'Fly ashes disposal',                    cost: 100, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 89.25 },
  ],
};

// --- localStorage helpers ---

// Writes default values to localStorage (opex_ prefix) only if not already set.
export const writeDefaultsToStorage = () => {
  Object.entries(DEFAULT_OPEX_DATA).forEach(([key, value]) => {
    const storageKey = `opex_${key}`;
    const existing = localStorage.getItem(storageKey);
    if (!existing || existing === 'null' || existing === 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to write OPEX default for ${storageKey}:`, e);
      }
    } else {
      // Repair corrupted JSON
      try { JSON.parse(existing); } catch (e) {
        console.warn(`Invalid JSON for ${storageKey}, reinitializing...`);
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    }
  });
};

// Reads all OPEX values from localStorage, falls back to defaults.
export const loadFromStorage = () => {
  const result = { ...DEFAULT_OPEX_DATA };
  Object.keys(DEFAULT_OPEX_DATA).forEach(key => {
    const stored = localStorage.getItem(`opex_${key}`);
    if (stored && stored !== 'null' && stored !== 'undefined') {
      try { result[key] = JSON.parse(stored); } catch (e) { /* keep default */ }
    }
  });
  return result;
};

// --- Service singleton ---
// Starts with real defaults so calculations work immediately, before any async init.
let opexData = { ...DEFAULT_OPEX_DATA };

export const getOpexData = () => opexData;

export const updateOpexData = (newData) => {
  opexData = { ...opexData, ...newData };
};

// Reloads service state from localStorage (called once at app startup).
export const initFromStorage = () => {
  opexData = loadFromStorage();
};
