import React, { useState } from 'react';
import { EMAILS_CONFIG, CONFIG_VERSION } from '../ListeEmailAccess';

// Conversion des emails permanents du fichier de configuration
const PERMANENT_AUTHORIZED_EMAILS = EMAILS_CONFIG.PERMANENT_EMAILS.map(email => ({
  ...email,
  validUntil: new Date(email.validUntil)
}));

// Fonction pour exporter la configuration des emails
const exportEmailsConfig = (emails) => {
  const configData = {
    version: CONFIG_VERSION,
    exportDate: new Date().toISOString(),
    emails: emails.map(email => ({
      email: email.email,
      validUntil: email.validUntil.toISOString(),
      permanent: email.permanent || false,
      addedBy: email.addedBy || "user",
      addedDate: email.addedDate || new Date().toISOString()
    }))
  };

  const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ListeEmailAccess_backup.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Fonction pour importer la configuration des emails
const importEmailsConfig = (file, onSuccess, onError) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const configData = JSON.parse(event.target.result);
      
      if (!configData.emails || !Array.isArray(configData.emails)) {
        throw new Error("Format de fichier invalide");
      }

      const importedEmails = configData.emails.map(email => ({
        ...email,
        validUntil: new Date(email.validUntil)
      }));

      onSuccess(importedEmails);
    } catch (error) {
      onError("Erreur lors de l'importation: " + error.message);
    }
  };
  reader.readAsText(file);
};

function EmailManagementModal({ onClose, currentEmails, onUpdateEmails }) {
  const [newEmail, setNewEmail] = useState("");
  const [newValidUntil, setNewValidUntil] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleAddEmail = () => {
    if (!validateEmail(newEmail)) {
      setError("L'adresse email n'est pas valide.");
      return;
    }

    if (!newValidUntil) {
      setError("La date de validité est requise.");
      return;
    }

    const validUntilDate = new Date(newValidUntil);
    if (isNaN(validUntilDate.getTime())) {
      setError("La date n'est pas valide.");
      return;
    }

    if (currentEmails.some(e => e.email === newEmail)) {
      setError("Cette adresse email est déjà autorisée.");
      return;
    }

    const updatedEmails = [
      ...currentEmails,
      { 
        email: newEmail, 
        validUntil: validUntilDate,
        addedBy: localStorage.getItem("authorizedEmail") || "user",
        addedDate: new Date().toISOString()
      }
    ];
    onUpdateEmails(updatedEmails);
    setNewEmail("");
    setNewValidUntil("");
    setError("");
    setSuccess("Email ajouté avec succès!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveEmail = (emailToRemove) => {
    const isPermanent = PERMANENT_AUTHORIZED_EMAILS.some(e => e.email === emailToRemove);
    
    if (isPermanent) {
      setError("Impossible de supprimer un utilisateur permanent.");
      return;
    }
    
    const updatedEmails = currentEmails.filter(e => e.email !== emailToRemove);
    onUpdateEmails(updatedEmails);
    setSuccess("Email supprimé avec succès!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleExportEmails = () => {
    exportEmailsConfig(currentEmails);
    setSuccess("Configuration exportée avec succès!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleImportEmails = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        importEmailsConfig(
          file,
          (importedEmails) => {
            const merged = [...currentEmails];
            importedEmails.forEach(imported => {
              if (!merged.some(existing => existing.email === imported.email)) {
                merged.push(imported);
              }
            });
            onUpdateEmails(merged);
            setSuccess("Configuration importée avec succès!");
            setTimeout(() => setSuccess(""), 3000);
          },
          (errorMsg) => {
            setError(errorMsg);
            setTimeout(() => setError(""), 5000);
          }
        );
      }
    };
    
    input.click();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '700px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2>Gestion des accès utilisateurs</h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportEmails}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Exporter Configuration
          </button>
          <button
            onClick={handleImportEmails}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#FF9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Importer Configuration
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Ajouter un nouvel utilisateur</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="date"
              value={newValidUntil}
              onChange={(e) => setNewValidUntil(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleAddEmail}
              style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Ajouter
            </button>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
        
        <div>
          <h3>Utilisateurs autorisés ({currentEmails.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Valide jusqu'au</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Source</th>
                <th style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmails.map((item, index) => {
                const isPermanent = PERMANENT_AUTHORIZED_EMAILS.some(e => e.email === item.email);
                return (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {item.email}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{formatDate(item.validUntil)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {isPermanent ? 'Permanent' : 'Temporaire'}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveEmail(item.email)}
                        disabled={isPermanent}
                        style={{ 
                          padding: '4px 8px', 
                          backgroundColor: isPermanent ? '#ccc' : '#F44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: isPermanent ? 'not-allowed' : 'pointer' 
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailManagementModal;