import React, { useState } from 'react';

function AccessRequestModal({ onClose, adminEmail = "cedric.crampon@gmail.com" }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    // Préparer le contenu de l'email
    const subject = encodeURIComponent("Demande d'accès à l'application");
    const body = encodeURIComponent(
      `Bonjour,\n\n` +
      `Je souhaiterais obtenir un accès à l'application.\n\n` +
      `Mon adresse email : ${email}\n\n` +
      `Message : ${message || "Aucun message supplémentaire"}\n\n` +
      `Merci de bien vouloir étudier ma demande.\n\n` +
      `Cordialement`
    );

    // Ouvrir le client email par défaut
    const mailtoLink = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = mailtoLink;
      setSuccess("Votre demande d'accès a été préparée. Veuillez envoyer l'email qui vient de s'ouvrir dans votre client email.");
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setError(`Impossible d'ouvrir votre client email. Veuillez contacter ${adminEmail} manuellement.`);
    }
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
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2>Demander un accès</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Remplissez ce formulaire pour demander un accès à l'application. Un email sera automatiquement préparé pour l'administrateur.
        </p>
        
        <form onSubmit={handleSubmitRequest}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Votre adresse email *
            </label>
            <input
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '4px', 
                border: error ? '1px solid red' : '1px solid #ccc',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Message (optionnel)
            </label>
            <textarea
              placeholder="Indiquez la raison de votre demande d'accès..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
              {error}
            </p>
          )}
          
          {success && (
            <p style={{ color: 'green', marginBottom: '15px', fontSize: '14px' }}>
              {success}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#607D8B', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccessRequestModal;