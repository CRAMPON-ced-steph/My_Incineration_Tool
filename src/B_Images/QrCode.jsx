import React from 'react';
import { QRCode } from 'react-qrcode-logo';

const CustomQRCode = ({ value = "https://google.com" }) => {
  return (
    <div className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 w-fit mx-auto">
      <QRCode
        value={value}
        size={250}
        logoImage="https://cdn-icons-png.flaticon.com/512/8039/8039132.png" // Optionnel : votre logo au centre
        logoWidth={50}
        logoOpacity={0.8}
        qrStyle="squares"
        eyeRadius={[15, 15, 15, 15]} // Arrondit les coins des trois grands carrés
        quietZone={10}
        enableCORS={true}
        // Couleurs pour imiter votre image (dégradé sombre/rougeâtre)
        fgColor="#4b4b4b" 
        eyeColor={[
          { outer: '#a36d6d', inner: '#7e4e4e' }, // Yeux du haut
          { outer: '#a36d6d', inner: '#7e4e4e' }, 
          { outer: '#7e4e4e', inner: '#5a5a5a' }, // Oeil du bas
        ]}
      />
    </div>
  );
};

export default CustomQRCode;