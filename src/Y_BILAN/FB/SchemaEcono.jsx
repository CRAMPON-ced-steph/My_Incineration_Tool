import React from 'react';

const Economiseur = () => {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
      <svg
        viewBox="0 0 600 300"
        className="w-full max-w-2xl h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- DÉFINITIONS DES GRADIENTS --- */}
        <defs>
          <linearGradient id="tubeFluid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="shellFluid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* --- CORPS PRINCIPAL (SHELL) --- */}
        {/* Extrémités arrondies */}
        <path d="M 100 100 A 50 50 0 0 0 100 200" fill="none" stroke="black" strokeWidth="2" />
        <path d="M 500 100 A 50 50 0 0 1 500 200" fill="none" stroke="black" strokeWidth="2" />
        
        {/* Lignes horizontales de la calandre */}
        <line x1="100" y1="100" x2="500" y2="100" stroke="black" strokeWidth="2" />
        <line x1="100" y1="200" x2="500" y2="200" stroke="black" strokeWidth="2" />

        {/* Plaques tubulaires (cloisons verticales) */}
        <line x1="130" y1="100" x2="130" y2="200" stroke="black" strokeWidth="2" strokeDasharray="4" />
        <line x1="470" y1="100" x2="470" y2="200" stroke="black" strokeWidth="2" strokeDasharray="4" />

        {/* --- TUBES INTERNES (Faisceau bleu) --- */}
        {[115, 130, 145, 160, 175, 190].map((y, index) => (
          <rect
            key={index}
            x="130"
            y={y - 3}
            width="340"
            height="6"
            fill="#1e40af"
            rx="2"
          />
        ))}

        {/* --- ENTRÉES ET SORTIES (VALVES/PORTS) --- */}
        
        {/* Fluide Chaud (Brun - Shell side) */}
        {/* Entrée Haut Gauche */}
        <rect x="180" y="70" width="40" height="30" fill="white" stroke="black" strokeWidth="2" />
        <path d="M 200 20 L 200 60" stroke="#92400e" strokeWidth="8" markerEnd="url(#arrow-brown)" />
        <polygon points="190,50 200,65 210,50" fill="#92400e" />
        
        {/* Sortie Bas Droite */}
        <rect x="380" y="200" width="40" height="30" fill="white" stroke="black" strokeWidth="2" />
        <polygon points="390,240 400,255 410,240" fill="#92400e" />
        <path d="M 400 230 L 400 270" stroke="#92400e" strokeWidth="8" />

        {/* Fluide Froid (Bleu - Tube side) */}
        {/* Entrée Haut Droite */}
        <rect x="480" y="70" width="40" height="30" fill="white" stroke="black" strokeWidth="2" />
        <polygon points="490,50 500,65 510,50" fill="#2563eb" />
        
        {/* Sortie Bas Gauche */}
        <rect x="80" y="200" width="40" height="30" fill="white" stroke="black" strokeWidth="2" />
        <polygon points="90,240 100,255 110,240" fill="#2563eb" />
        <path d="M 100 230 L 100 270" stroke="#2563eb" strokeWidth="8" />

        {/* Étiquettes (Optionnel) */}
        <text x="200" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400e">Entrée Calandre</text>
        <text x="500" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563eb">Entrée Tubes</text>
      </svg>
    </div>
  );
};

export default Economiseur;