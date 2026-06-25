import React, { useMemo } from 'react';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

const SchemaProcessus = ({ currentLanguage = 'fr' }) => {
  const t = useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    }}>
      <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
        {t('Schéma du Procédé')}
      </h2>

      {/* Schéma SVG */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <svg viewBox="0 0 1050 500" style={{ width: '100%', maxWidth: '1050px', margin: '0 auto', display: 'block' }}>
          {/* Définitions pour les flèches et dégradés */}
          <defs>
            <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#ef923c" />
            </marker>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
            </marker>
            <linearGradient id="fluidBedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>

          {/* LIT FLUIDISÉ */}
          <g>
            <rect x="400" y="180" width="180" height="180" fill="url(#fluidBedGrad)" stroke="#3b82f6" strokeWidth="3" rx="5" />
            <text x="490" y="265" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af">{t('Lit Fluidisé')}</text>
          </g>

          {/* FLUX 4: Air combustion tertiaire - Orange */}
          <g>
            <rect x="20" y="30" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="60" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Air combustion tertiaire')}</text>
            <line x1="190" y1="54" x2="290" y2="54" stroke="#ef923c" strokeWidth="3" />
            <line x1="290" y1="54" x2="290" y2="180" stroke="#ef923c" strokeWidth="3" />
            <line x1="290" y1="180" x2="400" y2="180" stroke="#ef923c" strokeWidth="3" markerEnd="url(#arrowOrange)" />
            <circle cx="220" cy="44" r="14" fill="white" stroke="#ef923c" strokeWidth="2" />
            <text x="220" y="50" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ef923c">4</text>
          </g>

          {/* FLUX 3: Air combustion secondaire - Orange */}
          <g>
            <rect x="20" y="98" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="128" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Air combustion secondaire')}</text>
            <line x1="190" y1="122" x2="320" y2="122" stroke="#ef923c" strokeWidth="3" />
            <line x1="320" y1="122" x2="320" y2="200" stroke="#ef923c" strokeWidth="3" />
            <line x1="320" y1="200" x2="400" y2="200" stroke="#ef923c" strokeWidth="3" markerEnd="url(#arrowOrange)" />
            <circle cx="220" cy="112" r="14" fill="white" stroke="#ef923c" strokeWidth="2" />
            <text x="220" y="118" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ef923c">3</text>
          </g>

          {/* FLUX 2: Air de combustion - Bleu */}
          <g>
            <rect x="20" y="166" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="196" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Air de combustion')}</text>
            <line x1="190" y1="190" x2="350" y2="190" stroke="#60a5fa" strokeWidth="3" />
            <line x1="350" y1="190" x2="350" y2="220" stroke="#60a5fa" strokeWidth="3" />
            <line x1="350" y1="220" x2="400" y2="220" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowBlue)" />
            <circle cx="220" cy="180" r="14" fill="white" stroke="#60a5fa" strokeWidth="2" />
            <text x="220" y="186" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#60a5fa">2</text>
          </g>

          {/* FLUX 6: Pertes thermiques - Orange */}
          <g>
            <rect x="20" y="234" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="264" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Pertes thermiques')}</text>
            <line x1="400" y1="258" x2="190" y2="258" stroke="#ef923c" strokeWidth="3" markerEnd="url(#arrowOrange)" />
            <circle cx="360" cy="248" r="14" fill="white" stroke="#ef923c" strokeWidth="2" />
            <text x="360" y="254" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ef923c">6</text>
          </g>

          {/* FLUX 1: OM entrée - Orange */}
          <g>
            <rect x="20" y="302" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="332" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('OM entrée')}</text>
            <line x1="190" y1="326" x2="350" y2="326" stroke="#ef923c" strokeWidth="3" />
            <line x1="350" y1="326" x2="350" y2="300" stroke="#ef923c" strokeWidth="3" />
            <line x1="350" y1="300" x2="400" y2="300" stroke="#ef923c" strokeWidth="3" markerEnd="url(#arrowOrange)" />
            <circle cx="220" cy="316" r="14" fill="white" stroke="#ef923c" strokeWidth="2" />
            <text x="220" y="322" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ef923c">1</text>
          </g>

          {/* FLUX 5: Appoint gaz - Bleu */}
          <g>
            <rect x="20" y="370" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="400" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Appoint gaz')}</text>
            <line x1="190" y1="394" x2="320" y2="394" stroke="#60a5fa" strokeWidth="3" />
            <line x1="320" y1="394" x2="320" y2="340" stroke="#60a5fa" strokeWidth="3" />
            <line x1="320" y1="340" x2="400" y2="340" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowBlue)" />
            <circle cx="220" cy="384" r="14" fill="white" stroke="#60a5fa" strokeWidth="2" />
            <text x="220" y="390" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#60a5fa">5</text>
          </g>

          {/* FLUX 7: Air de balayage - Bleu */}
          <g>
            <rect x="20" y="438" width="170" height="48" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2" rx="5" />
            <text x="105" y="468" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Air de balayage')}</text>
            <line x1="190" y1="462" x2="290" y2="462" stroke="#60a5fa" strokeWidth="3" />
            <line x1="290" y1="462" x2="290" y2="360" stroke="#60a5fa" strokeWidth="3" />
            <line x1="290" y1="360" x2="400" y2="360" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowBlue)" />
            <circle cx="220" cy="452" r="14" fill="white" stroke="#60a5fa" strokeWidth="2" />
            <text x="220" y="458" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#60a5fa">7</text>
          </g>

          {/* FLUX 8: Sortie fumées - Orange */}
          <g>
            <line x1="580" y1="270" x2="680" y2="270" stroke="#ef923c" strokeWidth="4" markerEnd="url(#arrowOrange)" />
            <circle cx="620" cy="255" r="16" fill="white" stroke="#ef923c" strokeWidth="2" />
            <text x="620" y="262" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ef923c">8</text>
            <text x="680" y="305" textAnchor="middle" fontSize="13" fontWeight="600" fill="#374151">{t('Sortie fumées')}</text>
          </g>
        </svg>
      </div>

      {/* Légende des flux */}
      <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>{t('Légende des Flux')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          {[
            { num: 1, color: '#ef923c', label: t('Entrée OM') },
            { num: 2, color: '#60a5fa', label: t('Air de combustion primaire') },
            { num: 3, color: '#ef923c', label: t('Air de combustion secondaire') },
            { num: 4, color: '#ef923c', label: t('Air de combustion tertiaire') },
            { num: 5, color: '#60a5fa', label: t("Gaz d'appoint") },
            { num: 6, color: '#ef923c', label: t('Pertes thermiques') },
            { num: 7, color: '#60a5fa', label: t('Air de balayage') },
            { num: 8, color: '#ef923c', label: t('Sortie fumées') },
          ].map(({ num, color, label }) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'white', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color, flexShrink: 0 }}>{num}</div>
              <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemaProcessus;
