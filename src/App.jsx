import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import des composants
import Flow from './Main_FLOW';

//import Flow from './Main_MultiFlow';

import EmailManagementModal from './E_Gestion_acces/EmailManagementModal';
import AccessRequestModal from './E_Gestion_acces/AccessRequestModal';
import EmailVerification from './E_Gestion_acces/EmailVerification';

// Import du fichier de configuration des emails
import { EMAILS_CONFIG, CONFIG_VERSION } from './ListeEmailAccess';

// Import du service OPEX pour déclencher les calculs
import { updateOpexData } from './A_Transverse_fonction/opexDataService';

const adminEmail = "cedric.crampon@gmail.com";

// Conversion des emails permanents du fichier de configuration
const PERMANENT_AUTHORIZED_EMAILS = EMAILS_CONFIG.PERMANENT_EMAILS.map(email => ({
  ...email,
  validUntil: new Date(email.validUntil)
}));

// Fonction pour récupérer les emails autorisés (fichier + localStorage)
const getAuthorizedEmails = () => {
  const stored = localStorage.getItem('authorizedEmails');
  let storedEmails = [];
  
  if (stored) {
    try {
      storedEmails = JSON.parse(stored).map(item => ({
        ...item,
        validUntil: new Date(item.validUntil)
      }));
    } catch (error) {
      console.error("Erreur lors de la lecture des emails autorisés:", error);
    }
  }
  
  const filteredStoredEmails = storedEmails.filter(
    storedEmail => !PERMANENT_AUTHORIZED_EMAILS.some(permEmail => permEmail.email === storedEmail.email)
  );
  
  return [...PERMANENT_AUTHORIZED_EMAILS, ...filteredStoredEmails];
};

// Fonction pour sauvegarder les emails autorisés
const saveAuthorizedEmails = (emails) => {
  const permanentEmails = PERMANENT_AUTHORIZED_EMAILS.map(email => email.email);
  const emailsToSave = emails.filter(email => !permanentEmails.includes(email.email));
  localStorage.setItem('authorizedEmails', JSON.stringify(emailsToSave));
};

// Function to initialize OPEX default parameters - CORRIGÉE
const initializeOPEXDefaults = async () => {
  const defaultOPEXParams = {
    // Section 1: Général
    opex_selectedCountryCode: 'FR',
    opex_selectedRatio: 83,
    opex_ratioElec: 83,
    opex_currency: '€',
    opex_availability: 8760,

    // Section 2: Transportation Type
    opex_truck15TCO2: 0.238,
    opex_truck15TPrice: 0.25,
    opex_truck20TCO2: 0.223,
    opex_truck20TPrice: 0.24,
    opex_truck25TCO2: 0.119,
    opex_truck25TPrice: 0.23,

    // Section 3: Compressed Air
    opex_airPressure: 7,
    opex_compressorType: 'à vis',
    opex_powerRatio: 0.11,
    opex_airConsumptionPrice: 0.1,

    // Section 4: Electricité
    opex_purchaseElectricityPrice: 200,
    opex_sellingElectricityPrice: 120,

    // Section 5: Gas
    opex_gasTypes: {
      naturalGasH: {molecule: 80, co2Emission: 197},
      naturalGasL: {molecule: 80, co2Emission: 200},
      processGas: {molecule: 60, co2Emission: 210},
    },

    opex_fuelTypes: {
      FOD: {liquid: 1.04, co2Emission: 3.85},
      FOL: {liquid: 0.8, co2Emission: 3.64},
      FOM: {liquid: 0.75, co2Emission: 3.64},
      FOH: {liquid: 0.70, co2Emission: 3.64},
      MDO: {liquid: 1.1, co2Emission: 3.86},
      HFO: {liquid: 0.70, co2Emission: 3.64},
    },

    opex_reagentsTypes: {
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
    },

    // Section 6: Steam
    opex_steamPrices: {
      highPressure: 40,
      lowPressure1: 30,
      lowPressure2: 25,
      fatal: 10
    },

    // Section 7: Water
    opex_waterPrices: {
      potable: 3,
      cooling: 1,
      demineralized: 5,
      soft: 2,
      river: 0.5
    },

    // Section 8: Byproducts
    opex_byproducts: [
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

    // Active tab
    opex_activeTab: 1
  };

  // MÉTHODE CORRIGÉE : Vérification plus robuste
  let initialized = 0;
  let skipped = 0;

  Object.entries(defaultOPEXParams).forEach(([key, value]) => {
    const existingValue = localStorage.getItem(key);
    
    // Vérification plus robuste : null, undefined, ou chaîne vide
    if (!existingValue || existingValue === 'null' || existingValue === 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        initialized++;
        console.log(`✅ Initialized: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${key}:`, error);
      }
    } else {
      skipped++;
      // Optionnel: vérifier si la valeur existante est valide
      try {
        JSON.parse(existingValue);
      } catch (error) {
        console.warn(`⚠️ Invalid JSON for ${key}, reinitializing...`);
        localStorage.setItem(key, JSON.stringify(value));
        initialized++;
      }
    }
  });


  // NOUVEAU: Déclencher updateOpexData après l'initialisation
  // Ceci assure que les calculs électriques fonctionnent immédiatement
  try {
    const opexData = {
      availability: JSON.parse(localStorage.getItem('opex_availability') || '8760'),
      ratioElec: JSON.parse(localStorage.getItem('opex_ratioElec') || '83'),
      currency: JSON.parse(localStorage.getItem('opex_currency') || '"€"'),
      selectedCountryCode: JSON.parse(localStorage.getItem('opex_selectedCountryCode') || '"FR"'),
      selectedRatio: JSON.parse(localStorage.getItem('opex_selectedRatio') || '83'),
      truck15TCO2: JSON.parse(localStorage.getItem('opex_truck15TCO2') || '0.238'),
      truck15TPrice: JSON.parse(localStorage.getItem('opex_truck15TPrice') || '0.25'),
      truck20TCO2: JSON.parse(localStorage.getItem('opex_truck20TCO2') || '0.223'),
      truck20TPrice: JSON.parse(localStorage.getItem('opex_truck20TPrice') || '0.24'),
      truck25TCO2: JSON.parse(localStorage.getItem('opex_truck25TCO2') || '0.119'),
      truck25TPrice: JSON.parse(localStorage.getItem('opex_truck25TPrice') || '0.23'),
      airPressure: JSON.parse(localStorage.getItem('opex_airPressure') || '7'),
      compressorType: JSON.parse(localStorage.getItem('opex_compressorType') || '"à vis"'),
      powerRatio: JSON.parse(localStorage.getItem('opex_powerRatio') || '0.11'),
      airConsumptionPrice: JSON.parse(localStorage.getItem('opex_airConsumptionPrice') || '0.1'),
      purchaseElectricityPrice: JSON.parse(localStorage.getItem('opex_purchaseElectricityPrice') || '200'),
      sellingElectricityPrice: JSON.parse(localStorage.getItem('opex_sellingElectricityPrice') || '120'),
      gasTypes: JSON.parse(localStorage.getItem('opex_gasTypes') || JSON.stringify(defaultOPEXParams.opex_gasTypes)),
      fuelTypes: JSON.parse(localStorage.getItem('opex_fuelTypes') || JSON.stringify(defaultOPEXParams.opex_fuelTypes)),
      reagentsTypes: JSON.parse(localStorage.getItem('opex_reagentsTypes') || JSON.stringify(defaultOPEXParams.opex_reagentsTypes)),
      steamPrices: JSON.parse(localStorage.getItem('opex_steamPrices') || JSON.stringify(defaultOPEXParams.opex_steamPrices)),
      waterPrices: JSON.parse(localStorage.getItem('opex_waterPrices') || JSON.stringify(defaultOPEXParams.opex_waterPrices)),
      byproducts: JSON.parse(localStorage.getItem('opex_byproducts') || JSON.stringify(defaultOPEXParams.opex_byproducts))
    };

    updateOpexData(opexData);
    console.log('updateOpexData called successfully with initialized values');
  } catch (error) {
    console.error('Error calling updateOpexData:', error);
  }
};

// Fonction pour forcer la mise à jour des calculs OPEX
const forceUpdateOpexCalculations = () => {
  try {
    const opexData = {
      availability: JSON.parse(localStorage.getItem('opex_availability') || '8760'),
      ratioElec: JSON.parse(localStorage.getItem('opex_ratioElec') || '83'),
      currency: JSON.parse(localStorage.getItem('opex_currency') || '"€"'),
      selectedCountryCode: JSON.parse(localStorage.getItem('opex_selectedCountryCode') || '"FR"'),
      selectedRatio: JSON.parse(localStorage.getItem('opex_selectedRatio') || '83'),
      truck15TCO2: JSON.parse(localStorage.getItem('opex_truck15TCO2') || '0.238'),
      truck15TPrice: JSON.parse(localStorage.getItem('opex_truck15TPrice') || '0.25'),
      truck20TCO2: JSON.parse(localStorage.getItem('opex_truck20TCO2') || '0.223'),
      truck20TPrice: JSON.parse(localStorage.getItem('opex_truck20TPrice') || '0.24'),
      truck25TCO2: JSON.parse(localStorage.getItem('opex_truck25TCO2') || '0.119'),
      truck25TPrice: JSON.parse(localStorage.getItem('opex_truck25TPrice') || '0.23'),
      airPressure: JSON.parse(localStorage.getItem('opex_airPressure') || '7'),
      compressorType: JSON.parse(localStorage.getItem('opex_compressorType') || '"à vis"'),
      powerRatio: JSON.parse(localStorage.getItem('opex_powerRatio') || '0.11'),
      airConsumptionPrice: JSON.parse(localStorage.getItem('opex_airConsumptionPrice') || '0.1'),
      purchaseElectricityPrice: JSON.parse(localStorage.getItem('opex_purchaseElectricityPrice') || '200'),
      sellingElectricityPrice: JSON.parse(localStorage.getItem('opex_sellingElectricityPrice') || '120'),
      gasTypes: JSON.parse(localStorage.getItem('opex_gasTypes') || '{"naturalGasH":{"molecule":80,"co2Emission":197},"naturalGasL":{"molecule":80,"co2Emission":200},"processGas":{"molecule":60,"co2Emission":210}}'),
      fuelTypes: JSON.parse(localStorage.getItem('opex_fuelTypes') || '{"FOD":{"liquid":1.04,"co2Emission":3.85},"FOL":{"liquid":0.8,"co2Emission":3.64},"FOM":{"liquid":0.75,"co2Emission":3.64},"FOH":{"liquid":0.70,"co2Emission":3.64},"MDO":{"liquid":1.1,"co2Emission":3.86},"HFO":{"liquid":0.70,"co2Emission":3.64}}'),
      reagentsTypes: JSON.parse(localStorage.getItem('opex_reagentsTypes') || '{}'),
      steamPrices: JSON.parse(localStorage.getItem('opex_steamPrices') || '{"highPressure":40,"lowPressure1":30,"lowPressure2":25,"fatal":10}'),
      waterPrices: JSON.parse(localStorage.getItem('opex_waterPrices') || '{"potable":3,"cooling":1,"demineralized":5,"soft":2,"river":0.5}'),
      byproducts: JSON.parse(localStorage.getItem('opex_byproducts') || '[]')
    };

    updateOpexData(opexData);
    console.log('OPEX calculations manually updated');
    return true;
  } catch (error) {
    console.error('Error in forceUpdateOpexCalculations:', error);
    return false;
  }
};

// Alternative: Fonction pour forcer la réinitialisation (utile pour le debug)
const forceReinitializeOPEXDefaults = () => {
  // Supprimer tous les paramètres OPEX existants
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('opex_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Réinitialiser
  initializeOPEXDefaults();
  console.log('🔄 OPEX parameters forcibly reinitialized');
};

// Fonction pour diagnostiquer les problèmes de localStorage
const diagnoseOPEXStorage = () => {
  const expectedKeys = [
    'opex_selectedCountryCode', 'opex_selectedRatio', 'opex_ratioElec', 'opex_currency', 
    'opex_availability', 'opex_truck15TCO2', 'opex_truck15TPrice', 'opex_truck20TCO2', 
    'opex_truck20TPrice', 'opex_truck25TCO2', 'opex_truck25TPrice', 'opex_airPressure', 
    'opex_compressorType', 'opex_powerRatio', 'opex_airConsumptionPrice', 
    'opex_purchaseElectricityPrice', 'opex_sellingElectricityPrice', 'opex_gasTypes', 
    'opex_fuelTypes', 'opex_reagentsTypes', 'opex_steamPrices', 'opex_waterPrices', 
    'opex_byproducts', 'opex_activeTab'
  ];

  console.log('🔍 OPEX Storage Diagnosis:');
  
  const missing = [];
  const present = [];
  const invalid = [];

  expectedKeys.forEach(key => {
    const value = localStorage.getItem(key);
    
    if (!value || value === 'null' || value === 'undefined') {
      missing.push(key);
    } else {
      try {
        JSON.parse(value);
        present.push(key);
      } catch (error) {
        invalid.push(key);
      }
    }
  });



  return { present, missing, invalid };
};

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showEmailManagement, setShowEmailManagement] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState(getAuthorizedEmails);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("authorizedEmail") || "");

  // Initialize OPEX defaults on component mount
  useEffect(() => {
    // Diagnostic optionnel (à supprimer en production)
    if (process.env.NODE_ENV === 'development') {
      diagnoseOPEXStorage();
    }
    
    initializeOPEXDefaults();
    
    // Exposer les fonctions de debug en développement
    if (process.env.NODE_ENV === 'development') {
      window.forceReinitializeOPEX = forceReinitializeOPEXDefaults;
      window.diagnoseOPEXStorage = diagnoseOPEXStorage;
      window.forceUpdateOpexCalculations = forceUpdateOpexCalculations;
    }
  }, []);

  // Update localStorage when authorized emails change
  useEffect(() => {
    saveAuthorizedEmails(authorizedEmails);
  }, [authorizedEmails]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("authorizedEmail");
    const savedValidUntil = localStorage.getItem("authorizedEmailValidUntil");

    if (savedEmail && savedValidUntil) {
      const authorizedEmails = getAuthorizedEmails();
      
      const authorizedEmail = authorizedEmails.find(
        auth => 
          auth.email === savedEmail && 
          new Date() <= new Date(savedValidUntil)
      );

      if (authorizedEmail) {
        setIsAuthorized(true);
        setCurrentUser(savedEmail);
      } else {
        localStorage.removeItem("authorizedEmail");
        localStorage.removeItem("authorizedEmailValidUntil");
      }
    }
  }, []);

  const handleUpdateEmails = (updatedEmails) => {
    setAuthorizedEmails(updatedEmails);
  };

  const handleLogout = () => {
    localStorage.removeItem("authorizedEmail");
    localStorage.removeItem("authorizedEmailValidUntil");
    setIsAuthorized(false);
    setCurrentUser("");
  };

  const handleAuthorize = (authorized, email = "") => {
    setIsAuthorized(authorized);
    if (authorized && email) {
      setCurrentUser(email);
    }
  };

  return (
    <ReactFlowProvider>
      {isAuthorized ? (
        <>
          <Flow
            currentUser={currentUser}
            adminEmail={adminEmail}
            authorizedEmails={authorizedEmails}
            onUpdateEmails={handleUpdateEmails}
            onShowEmailManagement={() => setShowEmailManagement(true)}
            onLogout={handleLogout}
          />
          
          {showEmailManagement && (
            <EmailManagementModal 
              onClose={() => setShowEmailManagement(false)}
              currentEmails={authorizedEmails}
              onUpdateEmails={handleUpdateEmails}
            />
          )}
        </>
      ) : (
        <EmailVerification onAuthorize={handleAuthorize} />
      )}
    </ReactFlowProvider>
  );
}

export default App;