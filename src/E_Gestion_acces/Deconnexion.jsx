import React from 'react';

const LogoutButton = () => {
  const handleLogout = () => {
    // Clear authorization from localStorage
    localStorage.removeItem("authorizedEmail");
    localStorage.removeItem("authorizedEmailValidUntil");

    // Trigger re-authorization
    window.location.reload();
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#f44336', // Rouge pour indiquer la déconnexion
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <button style={buttonStyle} onClick={handleLogout}>
      Déconnexion
    </button>
  );
};

export default LogoutButton;
