import React, { useState, useEffect } from 'react';
import InputField from './C_Components/input_retro';
import DropdownField from './C_Components/input_retro_deroulant';
import CountryDropdown from './C_Components/input_retro_double_deroulant';
import { updateOpexData } from './A_Transverse_fonction/opexDataService';
import { getOPEXTranslations } from './OPEX_traduction';
import { getLanguageCode } from './F_Gestion_Langues/Fonction_Traduction';

const OPEX_form = ({ onClose, currentLanguage = 'fr' }) => {
  
  const languageCode = getLanguageCode(currentLanguage);
  const t = getOPEXTranslations(languageCode);

  // Options for countries with their CO2 ratios
  const countryOptions = [
    { value: 'FR', label: 'France', ratio: 83 },
    { value: 'DE', label: 'Germany', ratio: 350 },
    { value: 'ES', label: 'Spain', ratio: 200 },
    { value: 'IT', label: 'Italy', ratio: 280 },
    { value: 'UK', label: 'United Kingdom', ratio: 220 },
    { value: 'PL', label: 'Poland', ratio: 650 },
    { value: 'NL', label: 'Netherlands', ratio: 280 },
    { value: 'BE', label: 'Belgium', ratio: 150 },
    { value: 'AT', label: 'Austria', ratio: 120 },
    { value: 'CH', label: 'Switzerland', ratio: 40 },
    { value: 'NO', label: 'Norway', ratio: 20 },
    { value: 'SE', label: 'Sweden', ratio: 35 },
    { value: 'DK', label: 'Denmark', ratio: 110 },
    { value: 'FI', label: 'Finland', ratio: 85 },
    { value: 'PT', label: 'Portugal', ratio: 240 },
    { value: 'GR', label: 'Greece', ratio: 550 },
    { value: 'CZ', label: 'Czech Republic', ratio: 430 },
    { value: 'HU', label: 'Hungary', ratio: 250 },
    { value: 'SK', label: 'Slovakia', ratio: 180 },
    { value: 'SI', label: 'Slovenia', ratio: 270 }
  ];
  const defaultValues = {
    // Section 1: Général
    activeTab: 1,
    selectedCountryCode: 'FR',
    selectedRatio: 83,
    ratioElec: 83,
    currency: '€',
    availability: 8760,

    // Section 2: Transportation Type
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
      naturalGasH: {molecule: 80, co2Emission: 197},
      naturalGasL: {molecule: 80, co2Emission: 200},
      processGas: {molecule: 60, co2Emission: 210},
    },

    // Section 6: Steam
    steamPrices: {
      highPressure: 40,
      lowPressure1: 30,
      lowPressure2: 25,
      fatal: 10
    },

    // Section 7: Water
    waterPrices: {
      potable: 3,
      cooling: 1,
      demineralized: 5,
      soft: 2,
      river: 0.5
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
      CAP: {cost: 1, Purity: 100, CO2emission: 0.99, truckType: 25, distance: 30, co2PerTKm: 0.119, co2PerTrip: 3.57},
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // State management
  const [activeTab, setActiveTab] = useState(loadFromLocalStorage('opex_activeTab', defaultValues.activeTab));
  const [selectedCountryCode, setSelectedCountryCode] = useState(loadFromLocalStorage('opex_selectedCountryCode', defaultValues.selectedCountryCode));
  const [selectedRatio, setSelectedRatio] = useState(loadFromLocalStorage('opex_selectedRatio', defaultValues.selectedRatio));
  const [ratioElec, setRatioElec] = useState(loadFromLocalStorage('opex_ratioElec', defaultValues.ratioElec));
  const [currency, setCurrency] = useState(loadFromLocalStorage('opex_currency', defaultValues.currency));
  const [availability, setAvailability] = useState(loadFromLocalStorage('opex_availability', defaultValues.availability));

  // Transportation
  const [truck15TCO2, setTruck15TCO2] = useState(loadFromLocalStorage('opex_truck15TCO2', defaultValues.truck15TCO2));
  const [truck15TPrice, setTruck15TPrice] = useState(loadFromLocalStorage('opex_truck15TPrice', defaultValues.truck15TPrice));
  const [truck20TCO2, setTruck20TCO2] = useState(loadFromLocalStorage('opex_truck20TCO2', defaultValues.truck20TCO2));
  const [truck20TPrice, setTruck20TPrice] = useState(loadFromLocalStorage('opex_truck20TPrice', defaultValues.truck20TPrice));
  const [truck25TCO2, setTruck25TCO2] = useState(loadFromLocalStorage('opex_truck25TCO2', defaultValues.truck25TCO2));
  const [truck25TPrice, setTruck25TPrice] = useState(loadFromLocalStorage('opex_truck25TPrice', defaultValues.truck25TPrice));

  // Compressed Air
  const [airPressure, setAirPressure] = useState(loadFromLocalStorage('opex_airPressure', defaultValues.airPressure));
  const [compressorType, setCompressorType] = useState(loadFromLocalStorage('opex_compressorType', defaultValues.compressorType));
  const [powerRatio, setPowerRatio] = useState(loadFromLocalStorage('opex_powerRatio', defaultValues.powerRatio));
  const [airConsumptionPrice, setAirConsumptionPrice] = useState(loadFromLocalStorage('opex_airConsumptionPrice', defaultValues.airConsumptionPrice));

  // Electricity
  const [purchaseElectricityPrice, setPurchaseElectricityPrice] = useState(loadFromLocalStorage('opex_purchaseElectricityPrice', defaultValues.purchaseElectricityPrice));
  const [sellingElectricityPrice, setSellingElectricityPrice] = useState(loadFromLocalStorage('opex_sellingElectricityPrice', defaultValues.sellingElectricityPrice));

  // Gas, Steam, Water, Byproducts
  const [gasTypes, setGasTypes] = useState(loadFromLocalStorage('opex_gasTypes', defaultValues.gasTypes));
  const [steamPrices, setSteamPrices] = useState(loadFromLocalStorage('opex_steamPrices', defaultValues.steamPrices));
  const [waterPrices, setWaterPrices] = useState(loadFromLocalStorage('opex_waterPrices', defaultValues.waterPrices));
  const [byproducts, setByproducts] = useState(loadFromLocalStorage('opex_byproducts', defaultValues.byproducts));
  const [fuelTypes, setFuelTypes] = useState(loadFromLocalStorage('opex_fuelTypes', defaultValues.fuelTypes));
  const [reagentsTypes, setReagentsTypes] = useState(loadFromLocalStorage('opex_reagentsTypes', defaultValues.reagentsTypes));

  // Save to localStorage effects
  useEffect(() => {
    localStorage.setItem('opex_activeTab', JSON.stringify(activeTab));
    localStorage.setItem('opex_selectedCountryCode', JSON.stringify(selectedCountryCode));
    localStorage.setItem('opex_selectedRatio', JSON.stringify(selectedRatio));
    localStorage.setItem('opex_ratioElec', JSON.stringify(ratioElec));
    localStorage.setItem('opex_currency', JSON.stringify(currency));
    localStorage.setItem('opex_availability', JSON.stringify(availability));
  }, [activeTab, selectedCountryCode, selectedRatio, ratioElec, currency, availability]);

  useEffect(() => {
    localStorage.setItem('opex_truck15TCO2', JSON.stringify(truck15TCO2));
    localStorage.setItem('opex_truck15TPrice', JSON.stringify(truck15TPrice));
    localStorage.setItem('opex_truck20TCO2', JSON.stringify(truck20TCO2));
    localStorage.setItem('opex_truck20TPrice', JSON.stringify(truck20TPrice));
    localStorage.setItem('opex_truck25TCO2', JSON.stringify(truck25TCO2));
    localStorage.setItem('opex_truck25TPrice', JSON.stringify(truck25TPrice));
  }, [truck15TCO2, truck15TPrice, truck20TCO2, truck20TPrice, truck25TCO2, truck25TPrice]);

  useEffect(() => {
    localStorage.setItem('opex_airPressure', JSON.stringify(airPressure));
    localStorage.setItem('opex_compressorType', JSON.stringify(compressorType));
    localStorage.setItem('opex_powerRatio', JSON.stringify(powerRatio));
    localStorage.setItem('opex_airConsumptionPrice', JSON.stringify(airConsumptionPrice));
  }, [airPressure, compressorType, powerRatio, airConsumptionPrice]);

  useEffect(() => {
    localStorage.setItem('opex_purchaseElectricityPrice', JSON.stringify(purchaseElectricityPrice));
    localStorage.setItem('opex_sellingElectricityPrice', JSON.stringify(sellingElectricityPrice));
  }, [purchaseElectricityPrice, sellingElectricityPrice]);

  useEffect(() => {
    localStorage.setItem('opex_gasTypes', JSON.stringify(gasTypes));
    localStorage.setItem('opex_fuelTypes', JSON.stringify(fuelTypes));
    localStorage.setItem('opex_reagentsTypes', JSON.stringify(reagentsTypes));
    localStorage.setItem('opex_steamPrices', JSON.stringify(steamPrices));
    localStorage.setItem('opex_waterPrices', JSON.stringify(waterPrices));
    localStorage.setItem('opex_byproducts', JSON.stringify(byproducts));
  }, [gasTypes, fuelTypes, reagentsTypes, steamPrices, waterPrices, byproducts]);

  // Tab configuration
  const tabs = [
    { id: 1, title: t.general || "Général", icon: '⚙️' },
    { id: 2, title: t.transport || "Transport", icon: '🚚' },
    { id: 3, title: t.compressedAir || "Air Comprimé", icon: '💨' },
    { id: 4, title: t.energy || "Energie", icon: '⚡' },
    { id: 5, title: t.gas || "Gaz", icon: '🔥' },
    { id: 6, title: t.steam || "Vapeur", icon: '💧' },
    { id: 7, title: t.water || "Eau", icon: '💙' },
    { id: 8, title: t.byproducts || "Sous-produits", icon: '♻️' },
    { id: 9, title: t.fuel || "Fuel", icon: '🛢️' },
    { id: 10, title: t.reagents || "Reagents", icon: '🧪' }
  ];

  // Air compressor power ratio mapping
  const airCompressorPowerRatios = {
    7: {'à piston sec': 0.17,'à spirales non lub': 0.15,'à lobes': 0.13,'à vis': 0.11},
    10: {'à piston sec': 0,'à spirales non lub': 0.25,'à vis': 0.13,'à lobes': 0},
    13: {'à piston sec': 0.2,'à spirales non lub': 0,'à vis': 0.16,'à lobes': 0},
    15: {'à piston sec': 0,'à spirales non lub': 0,'à vis': 0.19,'à lobes': 0}
  };

  // Effect for air compressor selection
  useEffect(() => {
    const ratio = airCompressorPowerRatios[airPressure]?.[compressorType] || 0;
    setPowerRatio(ratio);
  }, [airPressure, compressorType]);

  // Calculate CO2 per trip for byproducts
  useEffect(() => {
    const updatedByproducts = byproducts.map(item => ({
      ...item,
      co2PerTrip: item.co2PerTKm * item.distance 
    }));
    setByproducts(updatedByproducts);
  }, [byproducts.map(item => `${item.co2PerTKm}-${item.distance}`).join(',')]);

  // Update reagent CO2 per trip calculations
  useEffect(() => {
    setReagentsTypes(prevState => {
      const updatedReagents = { ...prevState };
      Object.keys(updatedReagents).forEach(reagentKey => {
        const reagent = updatedReagents[reagentKey];
        const newCo2PerTrip = reagent.co2PerTKm * reagent.truckType * reagent.distance * 2;
        updatedReagents[reagentKey] = {
          ...reagent,
          co2PerTrip: parseFloat(newCo2PerTrip.toFixed(3))
        };
      });
      return updatedReagents;
    });
  }, [JSON.stringify(Object.keys(reagentsTypes).reduce((acc, key) => {
    acc[key] = {
      co2PerTKm: reagentsTypes[key]?.co2PerTKm,
      truckType: reagentsTypes[key]?.truckType,
      distance: reagentsTypes[key]?.distance
    };
    return acc;
  }, {}))]);

  // Update OPEX data service
  useEffect(() => {
    updateOpexData({
      availability,
      ratioElec,
      currency,
      selectedCountryCode,
      selectedRatio,
      truck15TCO2,
      truck15TPrice,
      truck20TCO2,
      truck20TPrice,
      truck25TCO2,
      truck25TPrice,
      airPressure,
      compressorType,
      powerRatio,
      airConsumptionPrice,
      purchaseElectricityPrice,
      sellingElectricityPrice,
      gasTypes,
      fuelTypes,
      reagentsTypes,
      steamPrices,
      waterPrices,
      byproducts
    });
  }, [
    availability, ratioElec, currency, selectedCountryCode, selectedRatio,
    truck15TCO2, truck15TPrice, truck20TCO2, truck20TPrice, truck25TCO2, truck25TPrice,
    airPressure, compressorType, powerRatio, airConsumptionPrice,
    purchaseElectricityPrice, sellingElectricityPrice,
    gasTypes, fuelTypes, reagentsTypes, steamPrices, waterPrices, byproducts
  ]);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountryCode(countryCode);
    
    const country = countryOptions.find(c => c.value === countryCode);
    if (country) {
      setSelectedRatio(country.ratio);
      setRatioElec(country.ratio);
    }
  };

  const handleGasTypeChange = (type, field, value) => {
    setGasTypes(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleFuelTypeChange = (type, field, value) => {
    setFuelTypes(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleWaterPriceChange = (type, value) => {
    setWaterPrices(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const handleByproductChange = (index, field, value) => {
    const updatedByproducts = [...byproducts];
    updatedByproducts[index] = {
      ...updatedByproducts[index],
      [field]: field === 'name' ? value : (parseFloat(value) || 0)
    };
    setByproducts(updatedByproducts);
  };

  const handleSteamPriceChange = (type, value) => {
    setSteamPrices(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const handleReagentChange = (type, field, value) => {
    setReagentsTypes(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: field === 'Purity' || field === 'distance' || field === 'truckType' ? 
          parseInt(value) || 0 : parseFloat(value) || 0
      }
    }));
  };

  const handleReset = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('opex_')) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  const handleSave = () => {
    console.log('Data saved successfully');
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  const zoneCurrency = ['€', '$'];
  const handleCurrencyChange = (e) => setCurrency(e.target.value);

  const pressureOptions = ['7', '10', '13', '15'];
  const handlePressureChange = (e) => setAirPressure(e.target.value);

  const compressorTypeOptions = ['à lobes', 'à vis', 'à piston sec', 'à spirales non lub'];
  const handlecompressorTypeOptionsChange = (e) => setCompressorType(e.target.value);

  // Fonction pour obtenir le style de grille selon l'onglet
  const getFormGridStyle = () => {
    const baseStyle = styles.formGrid;
    const bgColors = {
      1: '#EEF2FF', // Bleu clair
      2: '#FEF3C7', // Jaune clair
      3: '#ECFDF5', // Vert clair
      4: '#FEF3C7', // Jaune clair (électricité)
      5: '#FFF7ED', // Orange clair
      6: '#F0F9FF', // Bleu très clair (vapeur)
      7: '#CFFAFE', // Cyan clair
      8: '#DCFCE7', // Vert pâle
      9: '#FEDBA8', // Orange pêche
      10: '#E9D5FF', // Violet clair
    };
    return {
      ...baseStyle,
      backgroundColor: bgColors[activeTab] || '#F0F4F8',
    };
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Sohne:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Sohne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        h1, h2, h3, h4 {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .tab-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .tab-btn:hover {
          transform: translateY(-2px);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3B82F6, #1D4ED8);
          animation: slideInLeft 0.3s ease-out;
        }

        .section-card {
          animation: slideInUp 0.4s ease-out;
          position: relative;
          overflow: hidden;
        }

        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }

        input[type="number"], input[type="text"], select {
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        input[type="number"]:focus, input[type="text"]:focus, select:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-group button {
          position: relative;
          overflow: hidden;
        }

        .btn-group button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-group button:active::before {
          width: 300px;
          height: 300px;
        }

        table {
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        table thead tr {
          background: linear-gradient(135deg, #1F2937, #111827);
          color: white;
        }

        table td, table th {
          padding: 12px;
          border: none;
          border-bottom: 1px solid #E5E7EB;
        }

        table tbody tr {
          transition: background-color 0.2s ease;
        }

        table tbody tr:hover {
          background-color: #F9FAFB;
        }

        table tbody tr:nth-child(odd) {
          background-color: #F9FAFB;
        }

        table tbody tr:last-child td {
          border-bottom: none;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{t.opexParameters || "Paramètres OPEX"}</h1>
        <p style={styles.subtitle}>Gérez tous vos paramètres opérationnels en un seul endroit</p>
      </div>
  
      {/* Tab Navigation */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className="tab-btn"
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive),
              animationDelay: `${index * 50}ms`
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabTitle}>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.contentArea}>
        <div className="section-card" style={styles.sectionCard}>
          {activeTab === 1 && (
            <div>
              <h2 style={styles.sectionTitle}>⚙️ {t.general || "Général"}</h2>
              <div style={getFormGridStyle()}>
                <CountryDropdown 
                  label={t.country || "Pays"} 
                  value={selectedCountryCode} 
                  onChange={handleCountryChange} 
                  unit=""
                  options={countryOptions}
                />
                <InputField 
                  label={t.ratioElec || "Ratio élec"} 
                  unit="[g CO2/kWhé]" 
                  value={ratioElec} 
                  onChange={(e) => setRatioElec(parseFloat(e.target.value) || 0)} 
                />
                <DropdownField 
                  label={t.currency || "Devise"} 
                  value={currency} 
                  onChange={handleCurrencyChange} 
                  unit="" 
                  options={zoneCurrency}
                />
                <InputField 
                  label={t.availability || "Disponibilité"} 
                  unit="[h]" 
                  value={availability} 
                  onChange={(e) => setAvailability(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h2 style={styles.sectionTitle}>🚚 {t.transportationType || "Types de Transport"}</h2>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>15 Tonnes</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.co2EmissionPerKmPerT || "CO2/km/T"} 
                    unit="[kgCO2/T.km]" 
                    value={truck15TCO2} 
                    onChange={(e) => setTruck15TCO2(parseFloat(e.target.value) || 0)} 
                  />
                  <InputField 
                    label={t.evacuationPrice || "Prix évacuation"} 
                    unit="[€/km]" 
                    value={truck15TPrice} 
                    onChange={(e) => setTruck15TPrice(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>20 Tonnes</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.co2EmissionPerKmPerT || "CO2/km/T"} 
                    unit="[kgCO2/T.km]" 
                    value={truck20TCO2} 
                    onChange={(e) => setTruck20TCO2(parseFloat(e.target.value) || 0)} 
                  />
                  <InputField 
                    label={t.evacuationPrice || "Prix évacuation"} 
                    unit="[€/km]" 
                    value={truck20TPrice} 
                    onChange={(e) => setTruck20TPrice(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>25 Tonnes</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.co2EmissionPerKmPerT || "CO2/km/T"} 
                    unit="[kgCO2/T.km]" 
                    value={truck25TCO2} 
                    onChange={(e) => setTruck25TCO2(parseFloat(e.target.value) || 0)} 
                  />
                  <InputField 
                    label={t.evacuationPrice || "Prix évacuation"} 
                    unit="[€/km]" 
                    value={truck25TPrice} 
                    onChange={(e) => setTruck25TPrice(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <h2 style={styles.sectionTitle}>💨 {t.compressedAirN2 || "Air Comprimé / N2"}</h2>
              <h3 style={styles.subTitle}>Production sur site</h3>
              <div style={getFormGridStyle()}>
                <DropdownField 
                  label={t.compressedAirPressure || "Pression"} 
                  value={airPressure} 
                  onChange={handlePressureChange} 
                  unit="bar" 
                  options={pressureOptions}
                />
                <DropdownField 
                  label={t.airCompressorTechnology || "Technologie"} 
                  value={compressorType} 
                  onChange={handlecompressorTypeOptionsChange} 
                  unit="" 
                  options={compressorTypeOptions}
                />
                <InputField 
                  label={t.electricConsumptionRatio || "Ratio conso élec"} 
                  unit="[kWh/Nm³]" 
                  value={powerRatio} 
                  readOnly 
                />
                <InputField 
                  label={t.consumptionPrice || "Prix consommation"} 
                  unit="[k€/1000 Nm³]" 
                  value={airConsumptionPrice} 
                  onChange={(e) => setAirConsumptionPrice(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div>
              <h2 style={styles.sectionTitle}>⚡ {t.electricity || "Électricité"}</h2>
              <div style={getFormGridStyle()}>
                <InputField 
                  label={t.purchasePriceElectricity || "Prix d'achat"} 
                  unit="[€/MWh]" 
                  value={purchaseElectricityPrice} 
                  onChange={(e) => setPurchaseElectricityPrice(parseFloat(e.target.value) || 0)} 
                />
                <InputField 
                  label={t.sellingPriceElectricity || "Prix de vente"} 
                  unit="[€/MWh]" 
                  value={sellingElectricityPrice} 
                  onChange={(e) => setSellingElectricityPrice(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          )}

          {activeTab === 5 && (
            <div>
              <h2 style={styles.sectionTitle}>🔥 {t.gas || "Gaz"}</h2>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Gaz naturel type H</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.natGasMolecule || "Prix"} 
                    unit="[€/MWh PCS]" 
                    value={gasTypes.naturalGasH.molecule} 
                    onChange={(e) => handleGasTypeChange('naturalGasH', 'molecule', e.target.value)} 
                  />
                  <InputField 
                    label={t.co2Emission || "Émission CO2"} 
                    unit="[kgCO2/MWh]" 
                    value={gasTypes.naturalGasH.co2Emission} 
                    onChange={(e) => handleGasTypeChange('naturalGasH', 'co2Emission', e.target.value)} 
                  />
                </div>
              </div>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Gaz naturel type L</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.natGasMolecule || "Prix"} 
                    unit="[€/MWh PCS]" 
                    value={gasTypes.naturalGasL.molecule} 
                    onChange={(e) => handleGasTypeChange('naturalGasL', 'molecule', e.target.value)} 
                  />
                  <InputField 
                    label={t.co2Emission || "Émission CO2"} 
                    unit="[kgCO2/MWh]" 
                    value={gasTypes.naturalGasL.co2Emission} 
                    onChange={(e) => handleGasTypeChange('naturalGasL', 'co2Emission', e.target.value)} 
                  />
                </div>
              </div>
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Gaz de procédé</h3>
                <div style={getFormGridStyle()}>
                  <InputField 
                    label={t.natGasMolecule || "Prix"} 
                    unit="[€/MWh PCS]" 
                    value={gasTypes.processGas.molecule} 
                    onChange={(e) => handleGasTypeChange('processGas', 'molecule', e.target.value)} 
                  />
                  <InputField 
                    label={t.co2Emission || "Émission CO2"} 
                    unit="[kgCO2/MWh]" 
                    value={gasTypes.processGas.co2Emission} 
                    onChange={(e) => handleGasTypeChange('processGas', 'co2Emission', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 6 && (
            <div>
              <h2 style={styles.sectionTitle}>💧 {t.steamSellingPrice || "Prix de vente - Vapeur"}</h2>
              <div style={getFormGridStyle()}>
                <InputField 
                  label={t.steamHighPressure || "Haute pression"} 
                  unit="[€/T]" 
                  value={steamPrices.highPressure} 
                  onChange={(e) => handleSteamPriceChange('highPressure', e.target.value)} 
                />
                <InputField 
                  label={t.steamLowPressureP1 || "Basse pression P1"} 
                  unit="[€/T]" 
                  value={steamPrices.lowPressure1} 
                  onChange={(e) => handleSteamPriceChange('lowPressure1', e.target.value)} 
                />
                <InputField 
                  label={t.steamLowPressureP2 || "Basse pression P2"} 
                  unit="[€/T]" 
                  value={steamPrices.lowPressure2} 
                  onChange={(e) => handleSteamPriceChange('lowPressure2', e.target.value)} 
                />
                <InputField 
                  label={t.fatalSteam || "Vapeur fatale"} 
                  unit="[€/MWh]" 
                  value={steamPrices.fatal} 
                  onChange={(e) => handleSteamPriceChange('fatal', e.target.value)} 
                />
              </div>
            </div>
          )}

          {activeTab === 7 && (
            <div>
              <h2 style={styles.sectionTitle}>💙 {t.water || "Eau"}</h2>
              <div style={getFormGridStyle()}>
                <InputField 
                  label={t.potableWater || "Eau potable"} 
                  unit="[€/m³]" 
                  value={waterPrices.potable} 
                  onChange={(e) => handleWaterPriceChange('potable', e.target.value)} 
                />
                <InputField 
                  label={t.coolingWater || "Eau de refroidissement"} 
                  unit="[€/m³]" 
                  value={waterPrices.cooling} 
                  onChange={(e) => handleWaterPriceChange('cooling', e.target.value)} 
                />
                <InputField 
                  label={t.demineralizedWater || "Eau déminéralisée"} 
                  unit="[€/m³]" 
                  value={waterPrices.demineralized} 
                  onChange={(e) => handleWaterPriceChange('demineralized', e.target.value)} 
                />
                <InputField 
                  label={t.softWater || "Eau adoucie"} 
                  unit="[€/m³]" 
                  value={waterPrices.soft} 
                  onChange={(e) => handleWaterPriceChange('soft', e.target.value)} 
                />
                <InputField 
                  label={t.riverWater || "Eau de rivière"} 
                  unit="[€/m³]" 
                  value={waterPrices.river} 
                  onChange={(e) => handleWaterPriceChange('river', e.target.value)} 
                />
              </div>
            </div>
          )}

          {activeTab === 8 && (
            <div>
              <h2 style={styles.sectionTitle}>♻️ {t.byproductsShippingTreatment || "Sous-produits : transport + traitement"}</h2>
              <div style={{overflowX: 'auto', marginTop: '20px'}}>
                <table style={styles.table}>
                  <colgroup>
                    <col style={{width: '25%'}} />
                    <col style={{width: '20%'}} />
                    <col style={{width: '15%'}} />
                    <col style={{width: '12%'}} />
                    <col style={{width: '18%'}} />
                    <col style={{width: '18%'}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>{t.product || "Produit"}</th>
                      <th style={styles.tableHeader}>{t.cost || "Coût"} (€/T)</th>
                      <th style={styles.tableHeader}>{t.truckType || "Camion"} [T]</th>
                      <th style={styles.tableHeader}>{t.distance || "Distance"} [km]</th>
                      <th style={styles.tableHeader}>kg.CO2/T.km</th>
                      <th style={styles.tableHeader}>kg CO2/trajet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byproducts.map((item, index) => {
                      const getCO2PerTKm = (truckType) => {
                        switch(parseInt(truckType)) {
                          case 15: return truck15TCO2;
                          case 20: return truck20TCO2;
                          case 25: return truck25TCO2;
                          default: return 0;
                        }
                      };
                      
                      return (
                        <tr key={index}>
                          <td style={styles.tableCell}>
                            <span style={{display: 'block', fontSize: '13px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.name}>{item.name}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <input 
                              type="number" 
                              step="0.01"
                              style={styles.tableInput}
                              value={item.cost}
                              onChange={(e) => handleByproductChange(index, 'cost', e.target.value)}
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <select
                              style={styles.tableInput}
                              value={item.truckType.toString()}
                              onChange={(e) => {
                                const truckType = parseInt(e.target.value);
                                const updatedByproducts = [...byproducts];
                                updatedByproducts[index] = {
                                  ...updatedByproducts[index],
                                  truckType: truckType,
                                  co2PerTKm: getCO2PerTKm(truckType)
                                };
                                setByproducts(updatedByproducts);
                              }}
                            >
                              <option value="15">15 T</option>
                              <option value="20">20 T</option>
                              <option value="25">25 T</option>
                            </select>
                          </td>
                          <td style={styles.tableCell}>
                            <input 
                              type="number" 
                              step="1"
                              style={styles.tableInput}
                              value={item.distance}
                              onChange={(e) => handleByproductChange(index, 'distance', e.target.value)}
                            />
                          </td>
                          <td style={{...styles.tableCell, background: '#F3F4F6'}}>
                            <div style={{textAlign: 'center', fontSize: '12px'}}>
                              {getCO2PerTKm(item.truckType).toFixed(3)}
                            </div>
                          </td>
                          <td style={{...styles.tableCell, background: '#F3F4F6'}}>
                            <div style={{textAlign: 'center', fontSize: '12px'}}>
                              {item.co2PerTrip.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 9 && (
            <div>
              <h2 style={styles.sectionTitle}>🛢️ {t.fuel || "Fuel"}</h2>
              {Object.entries(fuelTypes).map(([fuelKey, fuelData]) => (
                <div key={fuelKey} style={styles.subSection}>
                  <h3 style={styles.subTitle}>{fuelKey}</h3>
                  <div style={getFormGridStyle()}>
                    <InputField 
                      label="Prix" 
                      unit="[€/kg]" 
                      value={fuelData.liquid} 
                      onChange={(e) => handleFuelTypeChange(fuelKey, 'liquid', e.target.value)} 
                    />
                    <InputField 
                      label={t.co2Emission || "Émission CO2"} 
                      unit="[kgCO2/kg]" 
                      value={fuelData.co2Emission} 
                      onChange={(e) => handleFuelTypeChange(fuelKey, 'co2Emission', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 10 && (
            <div>
              <h2 style={styles.sectionTitle}>🧪 {t.reagents || "Réactifs"}</h2>
              
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Chaux éteinte - Ca(OH)₂</h3>
                <div style={getFormGridStyle()}>
                  <InputField label={t.cost || "Coût"} unit="[€/kg]" value={reagentsTypes.CaOH2.cost} onChange={(e) => handleReagentChange('CaOH2', 'cost', e.target.value)} />
                  <InputField label={t.Purity || "Pureté"} unit="[%]" value={reagentsTypes.CaOH2.Purity} onChange={(e) => handleReagentChange('CaOH2', 'Purity', e.target.value)} />
                  <InputField label={t.co2Emission || "Émission CO2"} unit="[kgCO2/kg]" value={reagentsTypes.CaOH2.CO2emission} onChange={(e) => handleReagentChange('CaOH2', 'CO2emission', e.target.value)} />
                  <InputField label={t.truckType || "Camion"} unit="[T]" value={reagentsTypes.CaOH2.truckType} onChange={(e) => handleReagentChange('CaOH2', 'truckType', e.target.value)} />
                  <InputField label={t.distance || "Distance"} unit="[km]" value={reagentsTypes.CaOH2.distance} onChange={(e) => handleReagentChange('CaOH2', 'distance', e.target.value)} />
                  <InputField label={t.co2PerTKm || "CO2/T.km"} unit="[kgCO2/t.km]" value={reagentsTypes.CaOH2.co2PerTKm} onChange={(e) => handleReagentChange('CaOH2', 'co2PerTKm', e.target.value)} />
                  <InputField label={t.co2PerDelivery || "CO2/livraison"} unit="[kg]" value={reagentsTypes.CaOH2.co2PerTrip} readOnly />
                </div>
              </div>

              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Chaux vive - CaO</h3>
                <div style={getFormGridStyle()}>
                  <InputField label={t.cost || "Coût"} unit="[€/kg]" value={reagentsTypes.CaO.cost} onChange={(e) => handleReagentChange('CaO', 'cost', e.target.value)} />
                  <InputField label={t.Purity || "Pureté"} unit="[%]" value={reagentsTypes.CaO.Purity} onChange={(e) => handleReagentChange('CaO', 'Purity', e.target.value)} />
                  <InputField label={t.co2Emission || "Émission CO2"} unit="[kgCO2/kg]" value={reagentsTypes.CaO.CO2emission} onChange={(e) => handleReagentChange('CaO', 'CO2emission', e.target.value)} />
                  <InputField label={t.truckType || "Camion"} unit="[T]" value={reagentsTypes.CaO.truckType} onChange={(e) => handleReagentChange('CaO', 'truckType', e.target.value)} />
                  <InputField label={t.distance || "Distance"} unit="[km]" value={reagentsTypes.CaO.distance} onChange={(e) => handleReagentChange('CaO', 'distance', e.target.value)} />
                  <InputField label={t.co2PerTKm || "CO2/T.km"} unit="[kgCO2/t.km]" value={reagentsTypes.CaO.co2PerTKm} onChange={(e) => handleReagentChange('CaO', 'co2PerTKm', e.target.value)} />
                  <InputField label={t.co2PerDelivery || "CO2/livraison"} unit="[kg]" value={reagentsTypes.CaO.co2PerTrip} readOnly />
                </div>
              </div>

              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>Carbonate de calcium - CaCO₃</h3>
                <div style={getFormGridStyle()}>
                  <InputField label={t.cost || "Coût"} unit="[€/kg]" value={reagentsTypes.CaCO3.cost} onChange={(e) => handleReagentChange('CaCO3', 'cost', e.target.value)} />
                  <InputField label={t.Purity || "Pureté"} unit="[%]" value={reagentsTypes.CaCO3.Purity} onChange={(e) => handleReagentChange('CaCO3', 'Purity', e.target.value)} />
                  <InputField label={t.co2Emission || "Émission CO2"} unit="[kgCO2/kg]" value={reagentsTypes.CaCO3.CO2emission} onChange={(e) => handleReagentChange('CaCO3', 'CO2emission', e.target.value)} />
                  <InputField label={t.truckType || "Camion"} unit="[T]" value={reagentsTypes.CaCO3.truckType} onChange={(e) => handleReagentChange('CaCO3', 'truckType', e.target.value)} />
                  <InputField label={t.distance || "Distance"} unit="[km]" value={reagentsTypes.CaCO3.distance} onChange={(e) => handleReagentChange('CaCO3', 'distance', e.target.value)} />
                  <InputField label={t.co2PerTKm || "CO2/T.km"} unit="[kgCO2/t.km]" value={reagentsTypes.CaCO3.co2PerTKm} onChange={(e) => handleReagentChange('CaCO3', 'co2PerTKm', e.target.value)} />
                  <InputField label={t.co2PerDelivery || "CO2/livraison"} unit="[kg]" value={reagentsTypes.CaCO3.co2PerTrip} readOnly />
                </div>
              </div>

              {Object.entries(reagentsTypes).filter(([key]) => !['CaOH2', 'CaO', 'CaCO3'].includes(key)).map(([reagentKey, reagentData]) => (
                <div key={reagentKey} style={styles.subSection}>
                  <h3 style={styles.subTitle}>{t[reagentKey] || reagentKey}</h3>
                  <div style={getFormGridStyle()}>
                    <InputField label={t.cost || "Coût"} unit="[€/kg]" value={reagentData.cost} onChange={(e) => handleReagentChange(reagentKey, 'cost', e.target.value)} />
                    <InputField label={t.Purity || "Pureté"} unit="[%]" value={reagentData.Purity} onChange={(e) => handleReagentChange(reagentKey, 'Purity', e.target.value)} />
                    <InputField label={t.co2Emission || "Émission CO2"} unit="[kgCO2/kg]" value={reagentData.CO2emission} onChange={(e) => handleReagentChange(reagentKey, 'CO2emission', e.target.value)} />
                    <InputField label={t.truckType || "Camion"} unit="[T]" value={reagentData.truckType} onChange={(e) => handleReagentChange(reagentKey, 'truckType', e.target.value)} />
                    <InputField label={t.distance || "Distance"} unit="[km]" value={reagentData.distance} onChange={(e) => handleReagentChange(reagentKey, 'distance', e.target.value)} />
                    <InputField label={t.co2PerTKm || "CO2/T.km"} unit="[kgCO2/t.km]" value={reagentData.co2PerTKm} onChange={(e) => handleReagentChange(reagentKey, 'co2PerTKm', e.target.value)} />
                    <InputField label={t.co2PerDelivery || "CO2/livraison"} unit="[kg]" value={reagentData.co2PerTrip} readOnly />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={styles.buttonGroup} className="btn-group">
        <button 
          style={{...styles.button, ...styles.buttonReset}}
          onClick={handleReset}
        >
          ↺ {t.reset || "Réinitialiser"}
        </button>
        <button 
          style={{...styles.button, ...styles.buttonSave}}
          onClick={handleSave}
        >
          ✓ {t.save || "Enregistrer"}
        </button>
        <button 
          style={{...styles.button, ...styles.buttonCancel}}
          onClick={handleCancel}
        >
          ✕ {t.cancel || "Annuler"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    minHeight: '100vh',
    padding: '40px',
    fontFamily: "'Sohne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: '40px',
    animation: 'slideInUp 0.5s ease-out',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6B7280',
    fontWeight: '400',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollBehavior: 'smooth',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  tabButtonActive: {
    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    color: '#FFFFFF',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  },
  tabButtonInactive: {
    background: '#FFFFFF',
    color: '#6B7280',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  tabIcon: {
    fontSize: '18px',
  },
  tabTitle: {
    fontSize: '13px',
  },
  contentArea: {
    marginBottom: '32px',
  },
  sectionCard: {
    background: '#FAFBFC',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  subTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginTop: '20px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.9,
  },
  subSection: {
    marginBottom: '28px',
    padding: '20px',
    backgroundColor: '#FFFBF0',
    borderRadius: '10px',
    border: '1px solid #FFE4C4',
    borderLeft: '4px solid #F59E0B',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#F0F4F8',
    borderRadius: '10px',
    border: '1px solid #DCE3ED',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  tableHeader: {
    padding: '14px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #E5E7EB',
    textAlign: 'center',
    fontSize: '13px',
  },
  tableInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '12px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  buttonReset: {
    background: '#FCD34D',
    color: '#78350F',
  },
  buttonSave: {
    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    color: '#FFFFFF',
  },
  buttonCancel: {
    background: '#E5E7EB',
    color: '#374151',
  },
};

export default OPEX_form;