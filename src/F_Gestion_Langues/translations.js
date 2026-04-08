// 1. Créer un fichier languages/translations.js
export const translations = {
  fr: {
    // Boutons principaux
    buttons: {
      logout: 'Déconnexion',
      saveProject: 'Sauvegarder Projet',
      loadProject: 'Charger Projet',
      showGraph: 'Afficher Graphique',
      hideGraph: 'Masquer Graphique',
      showCombinedData: 'Afficher Données Combinées',
      hideCombinedData: 'Masquer Données Combinées',
      consumptions: 'Consommations',
      manageUsers: 'Gérer Utilisateurs',
      openOPEX: 'Ouvrir OPEX',
      closeOPEX: 'Fermer OPEX',
      changeLanguage: 'Changer Langue'
    },
    // Gestion des emails
    emailManagement: {
      title: 'Gestion des accès utilisateurs',
      addNewUser: 'Ajouter un nouvel utilisateur',
      authorizedUsers: 'Utilisateurs autorisés',
      email: 'Email',
      validUntil: 'Valide jusqu\'au',
      source: 'Source',
      actions: 'Actions',
      add: 'Ajouter',
      remove: 'Supprimer',
      close: 'Fermer',
      exportConfig: 'Exporter Configuration',
      importConfig: 'Importer Configuration',
      emailAdded: 'Email ajouté avec succès!',
      emailRemoved: 'Email supprimé avec succès!',
      configExported: 'Configuration exportée avec succès!',
      configImported: 'Configuration importée avec succès!',
      invalidEmail: 'L\'adresse email n\'est pas valide.',
      dateRequired: 'La date de validité est requise.',
      emailExists: 'Cette adresse email est déjà autorisée.',
      cannotRemovePermanent: 'Impossible de supprimer un utilisateur permanent.'
    },
    // Vérification email
    emailVerification: {
      restrictedAccess: 'Accès restreint',
      enterEmail: 'Entrez votre email',
      verify: 'Vérifier',
      accessDenied: 'Accès refusé : adresse e-mail non autorisée ou expirée.',
      noAccess: 'Vous n\'avez pas encore d\'accès ?',
      requestAccess: 'Demander un accès'
    },
    // Demande d'accès
    accessRequest: {
      title: 'Demander un accès',
      description: 'Remplissez ce formulaire pour demander un accès à l\'application. Un email sera automatiquement préparé pour l\'administrateur.',
      yourEmail: 'Votre adresse email',
      message: 'Message (optionnel)',
      messagePlaceholder: 'Indiquez la raison de votre demande d\'accès...',
      cancel: 'Annuler',
      sendRequest: 'Envoyer la demande',
      requestPrepared: 'Votre demande d\'accès a été préparée. Veuillez envoyer l\'email qui vient de s\'ouvrir dans votre client email.',
      emailError: 'Impossible d\'ouvrir votre client email. Veuillez contacter cedric.crampon@gmail.com manuellement.',
      validEmail: 'Veuillez entrer une adresse email valide.'
    }
  },
  en: {
    // Main buttons
    buttons: {
      logout: 'Logout',
      saveProject: 'Save Project',
      loadProject: 'Load Project',
      showGraph: 'Show Graph',
      hideGraph: 'Hide Graph',
      showCombinedData: 'Show Combined Data',
      hideCombinedData: 'Hide Combined Data',
      consumptions: 'Consumptions',
      manageUsers: 'Manage Users',
      openOPEX: 'Open OPEX',
      closeOPEX: 'Close OPEX',
      changeLanguage: 'Change Language'
    },
    // Email management
    emailManagement: {
      title: 'User Access Management',
      addNewUser: 'Add New User',
      authorizedUsers: 'Authorized Users',
      email: 'Email',
      validUntil: 'Valid Until',
      source: 'Source',
      actions: 'Actions',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      exportConfig: 'Export Configuration',
      importConfig: 'Import Configuration',
      emailAdded: 'Email added successfully!',
      emailRemoved: 'Email removed successfully!',
      configExported: 'Configuration exported successfully!',
      configImported: 'Configuration imported successfully!',
      invalidEmail: 'The email address is not valid.',
      dateRequired: 'Valid until date is required.',
      emailExists: 'This email address is already authorized.',
      cannotRemovePermanent: 'Cannot remove permanent user.'
    },
    // Email verification
    emailVerification: {
      restrictedAccess: 'Restricted Access',
      enterEmail: 'Enter your email',
      verify: 'Verify',
      accessDenied: 'Access denied: unauthorized or expired email address.',
      noAccess: 'Don\'t have access yet?',
      requestAccess: 'Request Access'
    },
    // Access request
    accessRequest: {
      title: 'Request Access',
      description: 'Fill out this form to request application access. An email will be automatically prepared for the administrator.',
      yourEmail: 'Your email address',
      message: 'Message (optional)',
      messagePlaceholder: 'Indicate the reason for your access request...',
      cancel: 'Cancel',
      sendRequest: 'Send Request',
      requestPrepared: 'Your access request has been prepared. Please send the email that just opened in your email client.',
      emailError: 'Unable to open your email client. Please contact cedric.crampon@gmail.com manually.',
      validEmail: 'Please enter a valid email address.'
    }
  },
  es: {
    // Botones principales
    buttons: {
      logout: 'Cerrar Sesión',
      saveProject: 'Guardar Proyecto',
      loadProject: 'Cargar Proyecto',
      showGraph: 'Mostrar Gráfico',
      hideGraph: 'Ocultar Gráfico',
      showCombinedData: 'Mostrar Datos Combinados',
      hideCombinedData: 'Ocultar Datos Combinados',
      consumptions: 'Consumos',
      manageUsers: 'Gestionar Usuarios',
      openOPEX: 'Abrir OPEX',
      closeOPEX: 'Cerrar OPEX',
      changeLanguage: 'Cambiar Idioma'
    },
    // Gestión de emails
    emailManagement: {
      title: 'Gestión de Acceso de Usuarios',
      addNewUser: 'Agregar Nuevo Usuario',
      authorizedUsers: 'Usuarios Autorizados',
      email: 'Email',
      validUntil: 'Válido Hasta',
      source: 'Fuente',
      actions: 'Acciones',
      add: 'Agregar',
      remove: 'Eliminar',
      close: 'Cerrar',
      exportConfig: 'Exportar Configuración',
      importConfig: 'Importar Configuración',
      emailAdded: '¡Email agregado con éxito!',
      emailRemoved: '¡Email eliminado con éxito!',
      configExported: '¡Configuración exportada con éxito!',
      configImported: '¡Configuración importada con éxito!',
      invalidEmail: 'La dirección de email no es válida.',
      dateRequired: 'La fecha de validez es requerida.',
      emailExists: 'Esta dirección de email ya está autorizada.',
      cannotRemovePermanent: 'No se puede eliminar un usuario permanente.'
    },
    // Verificación de email
    emailVerification: {
      restrictedAccess: 'Acceso Restringido',
      enterEmail: 'Ingrese su email',
      verify: 'Verificar',
      accessDenied: 'Acceso denegado: dirección de email no autorizada o expirada.',
      noAccess: '¿Aún no tienes acceso?',
      requestAccess: 'Solicitar Acceso'
    },
    // Solicitud de acceso
    accessRequest: {
      title: 'Solicitar Acceso',
      description: 'Complete este formulario para solicitar acceso a la aplicación. Se preparará automáticamente un email para el administrador.',
      yourEmail: 'Su dirección de email',
      message: 'Mensaje (opcional)',
      messagePlaceholder: 'Indique la razón de su solicitud de acceso...',
      cancel: 'Cancelar',
      sendRequest: 'Enviar Solicitud',
      requestPrepared: 'Su solicitud de acceso ha sido preparada. Por favor envíe el email que se acaba de abrir en su cliente de email.',
      emailError: 'No se pudo abrir su cliente de email. Por favor contacte a cedric.crampon@gmail.com manualmente.',
      validEmail: 'Por favor ingrese una dirección de email válida.'
    }
  }
};

// 2. Créer un Context React pour les langues (LanguageContext.js)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
    return localStorage.getItem('selectedLanguage') || 'fr';
  });

  // Sauvegarder la langue dans localStorage quand elle change
  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // Fallback vers le français si la traduction n'existe pas
        translation = translations['fr'];
        for (const k of keys) {
          if (translation && typeof translation === 'object') {
            translation = translation[k];
          } else {
            return key; // Retourner la clé si aucune traduction n'est trouvée
          }
        }
        break;
      }
    }
    
    return translation || key;
  };

  const getAvailableLanguages = () => {
    return Object.keys(translations).map(code => ({
      code,
      name: getLanguageName(code)
    }));
  };

  const getLanguageName = (code) => {
    const names = {
      fr: 'Français',
      en: 'English',
      es: 'Español',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português',
      zh: '中文',
      ja: '日本語',
      ar: 'العربية'
    };
    return names[code] || code.toUpperCase();
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      getAvailableLanguages,
      getLanguageName
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 3. Composant LanguageSelector
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

const LanguageSelector = ({ style = {} }) => {
  const { currentLanguage, changeLanguage, getAvailableLanguages, getLanguageName } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          minWidth: '120px'
        }}
      >
        🌍 {getLanguageName(currentLanguage)}
        <span style={{ marginLeft: '5px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '120px'
        }}>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: currentLanguage === lang.code ? '#f0f0f0' : 'white',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = currentLanguage === lang.code ? '#f0f0f0' : 'white'}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;