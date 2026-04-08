import React, { useState } from 'react';
import AccessRequestModal from './AccessRequestModal';
import { EMAILS_CONFIG } from '../ListeEmailAccess';

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

function EmailVerification({ onAuthorize }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const authorizedEmails = getAuthorizedEmails();
    
    // Find the matching authorized email
    const authorizedEmail = authorizedEmails.find(
      auth => auth.email === email && new Date() <= auth.validUntil
    );

    if (authorizedEmail) {
      localStorage.setItem("authorizedEmail", email);
      localStorage.setItem("authorizedEmailValidUntil", authorizedEmail.validUntil.toISOString());
      onAuthorize(true, email);
    } else {
      setError("Accès refusé : adresse e-mail non autorisée ou expirée.");
    }
  };

  const toggleEmailVisibility = () => {
    setShowEmail(!showEmail);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Accès restreint</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type={showEmail ? "text" : "password"}
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              style={{ 
                padding: '8px', 
                paddingRight: '30px',
                borderRadius: '4px', 
                border: error ? '1px solid red' : '1px solid #ccc', 
                width: '250px' 
              }}
              required
            />
            <span 
              onClick={toggleEmailVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {showEmail ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          <button 
            type="submit" 
            style={{ 
              marginLeft: '10px', 
              padding: '8px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Vérifier
          </button>
        </form>
        
        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </p>
        )}
        
        {/* Bouton pour demander un accès */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Vous n'avez pas encore d'accès ?
          </p>
          <button
            onClick={() => setShowAccessRequest(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Demander un accès
          </button>
        </div>
      </div>
      
      {/* Modal de demande d'accès */}
      {showAccessRequest && (
        <AccessRequestModal onClose={() => setShowAccessRequest(false)} />
      )}
    </div>
  );
}

export default EmailVerification;