import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import des composants
import Flow from './Main_FLOW';

//import Flow from './Main_MultiFlow';

import EmailManagementModal from './E_Gestion_acces/EmailManagementModal';
import EmailVerification from './E_Gestion_acces/EmailVerification';

// Import du fichier de configuration des emails
import { EMAILS_CONFIG } from './E_Gestion_acces/ListeEmailAccess';

// Import du service OPEX
import { writeDefaultsToStorage, initFromStorage } from './A_Transverse_fonction/opexDataService';

const adminEmail = "cedric.crampon@gmail.com";

// Apps Script comme source des emails autorisés (sheet Drive privé)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzr3xGh0uqUppPuEf_2btR5oXQBe2SSFt4F2Ll-byCXF_JfvJSRQ8Z-617xUN5RzYvH/exec";
export const GSHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/1051SBIOjr-ccUZJs8QezQTv8FfvIh3Oj1Aent2enPjQ/edit`;

// Emails permanents (fallback si le script est inaccessible)
const PERMANENT_AUTHORIZED_EMAILS = EMAILS_CONFIG.PERMANENT_EMAILS.map(email => ({
  ...email,
  validUntil: new Date(email.validUntil)
}));

// Parse la réponse JSON du Apps Script
const parseSheetJSON = (data) => {
  if (!Array.isArray(data)) return [];
  return data
    .filter(obj => obj.email && String(obj.email).includes('@'))
    .map(obj => ({
      email: String(obj.email).trim(),
      validUntil: new Date(obj.validUntil || '2099-12-31'),
      permanent: obj.permanent === true || obj.permanent === 'true' || obj.permanent === 'TRUE',
      addedBy: obj.addedBy || 'gsheet'
    }));
};

// Fetch JSONP — contourne le CORS d'Apps Script
const fetchJsonp = (url) => new Promise((resolve, reject) => {
  const cbName = '__gscb_' + Date.now();
  const script = document.createElement('script');
  const timer = setTimeout(() => {
    delete window[cbName];
    document.body.removeChild(script);
    reject(new Error('JSONP timeout'));
  }, 10000);
  window[cbName] = (data) => {
    clearTimeout(timer);
    delete window[cbName];
    document.body.removeChild(script);
    resolve(data);
  };
  script.onerror = () => {
    clearTimeout(timer);
    delete window[cbName];
    document.body.removeChild(script);
    reject(new Error('Script load error'));
  };
  script.src = `${url}?callback=${cbName}`;
  document.body.appendChild(script);
});

// Merge permanents + sheet + éventuels extras localStorage
const getAuthorizedEmails = (sheetEmails = []) => {
  const allKnown = [...PERMANENT_AUTHORIZED_EMAILS, ...sheetEmails];
  const knownSet = new Set(allKnown.map(e => e.email));

  // Garde les éventuels emails ajoutés localement hors du sheet
  let storedEmails = [];
  try {
    const raw = localStorage.getItem('authorizedEmails');
    if (raw) storedEmails = JSON.parse(raw).map(item => ({ ...item, validUntil: new Date(item.validUntil) }));
  } catch (e) { console.warn("localStorage authorizedEmails parse error:", e); }

  const extra = storedEmails.filter(e => !knownSet.has(e.email));
  return [...allKnown, ...extra];
};


function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showEmailManagement, setShowEmailManagement] = useState(false);
  const [sheetEmails, setSheetEmails] = useState([]);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [authorizedEmails, setAuthorizedEmails] = useState(() => getAuthorizedEmails([]));
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("authorizedEmail") || "");

  // Fetch emails depuis Apps Script au démarrage
  useEffect(() => {
    const fetchSheetEmails = async () => {
      try {
        const data = await fetchJsonp(APPS_SCRIPT_URL);
        const parsed = parseSheetJSON(data);
        setSheetEmails(parsed);
        setAuthorizedEmails(getAuthorizedEmails(parsed));
      } catch (err) {
        console.warn("Apps Script inaccessible, mode dégradé (emails permanents uniquement):", err.message);
        setAuthorizedEmails(getAuthorizedEmails([]));
      } finally {
        setSheetLoading(false);
      }
    };
    fetchSheetEmails();
  }, []);

  // Vérification auto-login après chargement du sheet
  useEffect(() => {
    if (sheetLoading) return;
    const savedEmail = localStorage.getItem("authorizedEmail");
    const savedValidUntil = localStorage.getItem("authorizedEmailValidUntil");

    if (savedEmail && savedValidUntil) {
      const emails = getAuthorizedEmails(sheetEmails);
      const match = emails.find(
        auth => auth.email === savedEmail && new Date() <= new Date(savedValidUntil)
      );
      if (match) {
        setIsAuthorized(true);
        setCurrentUser(savedEmail);
      } else {
        localStorage.removeItem("authorizedEmail");
        localStorage.removeItem("authorizedEmailValidUntil");
      }
    }
  }, [sheetLoading, sheetEmails]);

  // Initialize OPEX defaults on component mount
  useEffect(() => {
    writeDefaultsToStorage(); // écrit les valeurs par défaut si absentes
    initFromStorage();        // charge le service depuis localStorage
  }, []);

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

  if (sheetLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '12px', color: '#666' }}>
        <div style={{ fontSize: '16px' }}>Chargement des accès...</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      {isAuthorized ? (
        <>
          <Flow
            currentUser={currentUser}
            adminEmail={adminEmail}
            authorizedEmails={authorizedEmails}
            onUpdateEmails={setAuthorizedEmails}
            onShowEmailManagement={() => setShowEmailManagement(true)}
            onLogout={handleLogout}
          />

          {showEmailManagement && (
            <EmailManagementModal
              onClose={() => setShowEmailManagement(false)}
              currentEmails={authorizedEmails}
              gsheetEditUrl={GSHEET_EDIT_URL}
            />
          )}
        </>
      ) : (
        <EmailVerification onAuthorize={handleAuthorize} authorizedEmails={authorizedEmails} />
      )}
    </ReactFlowProvider>
  );
}

export default App;