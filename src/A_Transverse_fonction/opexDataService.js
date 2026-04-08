
// opexDataService.js
let opexData = {
  // Section 1: Général
  availability: 8760,
  ratioElec: 83,
  currency: '€',
  selectedCountryCode: 'FR',
  selectedRatio: 83,

  // Section 2: Transportation Type
  truck15TCO2: 0.238,
  truck15TPrice: 0.25,
  truck20TCO2: 0.223,
  truck20TPrice: 0.25,
  truck25TCO2: 0.119,
  truck25TPrice: 0.25,

  // Section 3: Compressed Air
  airPressure: 7,
  compressorType: 'à vis',
  powerRatio: 0.11,
  airConsumptionPrice: 0,

  // Section 4: Electricité
  purchaseElectricityPrice: 0,
  sellingElectricityPrice: 0,

  // Section 5: Gas
  gasTypes: {
    naturalGasH: {molecule: 0, co2Emission: 0},
    naturalGasL: {molecule: 0, co2Emission: 0},
    processGas: {molecule: 0, co2Emission: 0},
  },

  // Section 6: Steam
  steamPrices: {
    highPressure: 0,
    lowPressure1: 0,
    lowPressure2: 0,
    fatal: 0
  },

  // Section 7: Water
  waterPrices: {
    potable: 0,
    cooling: 0,
    demineralized: 0,
    soft: 0,
    river: 0
  },

  // Section 8: Byproducts
  byproducts: [
    {
      name: "Incineration ash / clinker / residues",
      cost: 150,
      truckType: 25,
      distance: 30,
      co2PerTKm: 0.119,
      co2PerTrip: 89.25
    },
    {
      name: "Boiler ashes disposal",
      cost: 100,
      truckType: 25,
      distance: 30,
      co2PerTKm: 0.119,
      co2PerTrip: 89.25
    },
    {
      name: "Fly ashes disposal",
      cost: 100,
      truckType: 25,
      distance: 30,
      co2PerTKm: 0.119,
      co2PerTrip: 89.25
    }
  ],

  // Section 9: Fuel Types
  fuelTypes: {
    FOD: {liquid: 1.04, co2Emission: 3.85},
    FOL: {liquid: 0.8, co2Emission: 3.64},
    FOM: {liquid: 0.75, co2Emission: 3.64},
    FOH: {liquid: 0.70, co2Emission: 3.64},
    MDO: {liquid: 1.1, co2Emission: 3.86},
    HFO: {liquid: 0.70, co2Emission: 3.64},
  },

  // Section 10: Reagents
  reagentsTypes: {
    CaOH2: {cost: 0.1, Purity: 90, CO2emission: 0.846, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    CaO: {cost: 0.1, Purity: 95, CO2emission: 1.11, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    CaCO3: {cost: 0.1, Purity: 95, CO2emission: 0.76, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    HCO3: {cost: 1, Purity: 100, CO2emission: 1.166, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    NaOH: {cost: 0.3, Purity: 100, CO2emission: 1.174, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    NaOHCO3: {cost: 200, Purity: 100, CO2emission: 0.76, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    NH3: {cost: 0.05, Purity: 95, CO2emission: 2.11, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    Urea: {cost: 0.05, Purity: 95, CO2emission: 0.76, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    NaBr_CaBr2: {cost: 1, Purity: 52, CO2emission: 0.76, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    CAP: {cost: 1, Purity: 100, CO2emission: 0.99, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57}
  }
};

export const getOpexData = () => opexData;

export const updateOpexData = (newData) => {
  opexData = { ...opexData, ...newData };
};