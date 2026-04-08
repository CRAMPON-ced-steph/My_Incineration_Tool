import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Settings, 
  Thermometer, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const t = (key, lang) => translations[lang]?.[key] || translations['fr']?.[key] || key;

// Configuration des matériaux
const MATERIAUX_CONFIG = {
  p265gh: { 
    nom: 'P265GH', 
    contrainte: 157, 
    temp_max: 400,
    description: 'Acier non allié pour chaudières'
  },
  p355gh: { 
    nom: 'P355GH', 
    contrainte: 200, 
    temp_max: 400,
    description: 'Acier haute résistance pour chaudières'
  },
  '16mo3': { 
    nom: '16Mo3', 
    contrainte: 177, 
    temp_max: 500,
    description: 'Acier au molybdène pour haute température'
  },
  '13crmo44': { 
    nom: '13CrMo4-4', 
    contrainte: 206, 
    temp_max: 530,
    description: 'Acier au chrome-molybdène'
  }
};

export default function CalculateurChaudiere({ currentLanguage = 'fr' }) {
  const lang = getLanguageCode(currentLanguage);

  const [parametres, setParametres] = useState({
    pressionService: 16,
    tempService: 210,
    debitVapeur: 5000,
    tempEauAlim: 105,
    pciDechets: 10,
    rendementCombustion: 85,
    materiau: 'p265gh',
    contrainteAdmissible: 157,
    coeffSoudure: 1.0,
    suppCorrosion: 3,
    diametreInt: 1200,
    longueurCorps: 6000,
    nbTubes: 150,
    diametreTubeExt: 51,
    diametreTubeInt: 45
  });

  const [showDonneesBase, setShowDonneesBase] = useState(true);
  const [showMateriaux, setShowMateriaux] = useState(true);
  const [showGeometrie, setShowGeometrie] = useState(true);

  // Calculs automatiques
  const resultats = useMemo(() => {
    const {
      pressionService,
      tempService,
      debitVapeur,
      tempEauAlim,
      pciDechets,
      rendementCombustion,
      contrainteAdmissible,
      coeffSoudure,
      suppCorrosion,
      diametreInt,
      longueurCorps,
      nbTubes,
      diametreTubeExt,
      diametreTubeInt
    } = parametres;

    if (!pressionService || !tempService || !debitVapeur) {
      return null;
    }

    const rendement = rendementCombustion / 100;
    const pressionCalcul = pressionService * 1.1;
    const pressionEpreuve = 1.43 * pressionService;
    const epaisseurCorps = (pressionCalcul * diametreInt) / (2 * contrainteAdmissible * coeffSoudure - pressionCalcul) + suppCorrosion;
    const epaisseurTubes = (pressionCalcul * diametreTubeInt) / (2 * contrainteAdmissible * coeffSoudure - pressionCalcul) + suppCorrosion;
    
    const enthalpieVapeur = 2780 + 1.8 * tempService;
    const enthalpieEau = 4.18 * tempEauAlim;
    const puissanceVapeur = (debitVapeur * (enthalpieVapeur - enthalpieEau)) / 3600;
    const puissanceCombustible = puissanceVapeur / rendement;
    const debitDechets = (puissanceCombustible / (pciDechets * 1000)) * 3600;
    
    const surfaceEchangeTubes = Math.PI * (diametreTubeExt / 1000) * (longueurCorps / 1000) * nbTubes;
    const densiteFlux = puissanceVapeur / surfaceEchangeTubes;
    const vitesseTubes = (debitVapeur / 900 / 3600) / (Math.PI * Math.pow(diametreTubeInt / 2000, 2) * nbTubes);

    return {
      pressionCalcul,
      pressionEpreuve,
      epaisseurCorps,
      epaisseurTubes,
      puissanceVapeur,
      puissanceCombustible,
      debitDechets,
      rendementGlobal: rendement * 100,
      surfaceEchangeTubes,
      densiteFlux,
      vitesseTubes
    };
  }, [parametres]);

  // Messages de vérification
  const messages = useMemo(() => {
    if (!resultats) return [];
    
    const msgs = [];
    if (resultats.epaisseurCorps < 6) {
      msgs.push({ type: 'warning', texte: t('warningThickness', lang) });
    }
    if (resultats.densiteFlux > 200) {
      msgs.push({ type: 'warning', texte: t('warningFluxDensity', lang) });
    }
    if (resultats.vitesseTubes > 3) {
      msgs.push({ type: 'error', texte: t('errorVelocity', lang) });
    }
    if (msgs.length === 0) {
      msgs.push({ type: 'success', texte: t('conformityCheck', lang) });
    }
    
    return msgs;
  }, [resultats, lang]);

  // Mise à jour automatique contrainte
  useEffect(() => {
    const materiau = MATERIAUX_CONFIG[parametres.materiau];
    if (materiau) {
      let contrainte = materiau.contrainte;
      if (parametres.tempService > 300) {
        contrainte *= Math.max(1 - (parametres.tempService - 300) / 1000, 0.6);
      }
      setParametres(prev => ({
        ...prev,
        contrainteAdmissible: Math.round(contrainte)
      }));
    }
  }, [parametres.materiau, parametres.tempService]);

  const updateParam = (key, value) => {
    setParametres(prev => ({ ...prev, [key]: value }));
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    margin: '20px 0',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #4a90e2, #357abd)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle = {
    padding: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#4a90e2',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Calculator size={30} color="white" />
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>
            {t('boilerTubesCalculator', lang)}
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
            {t('dimensioningEN12952', lang)}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Colonne Paramètres */}
          <div>
            
            {/* Section Données de Base */}
            <div style={cardStyle}>
              <div style={headerStyle} onClick={() => setShowDonneesBase(!showDonneesBase)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={20} />
                  <span>{t('basicData', lang)}</span>
                </div>
                <span style={{ transform: showDonneesBase ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
              {showDonneesBase && (
                <div style={contentStyle}>
                  <div style={gridStyle}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('servicePressure', lang)}
                      </label>
                      <input
                        type="number"
                        value={parametres.pressionService}
                        onChange={(e) => updateParam('pressionService', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('serviceTemperature', lang)} 
                      </label>
                      <input
                        type="number"
                        value={parametres.tempService}
                        onChange={(e) => updateParam('tempService', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('vaporFlow', lang)} (kg/h)
                      </label>
                      <input
                        type="number"
                        value={parametres.debitVapeur}
                        onChange={(e) => updateParam('debitVapeur', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="100"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('feedwaterTemp', lang)}
                      </label>
                      <input
                        type="number"
                        value={parametres.tempEauAlim}
                        onChange={(e) => updateParam('tempEauAlim', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('wasteHHV', lang)} (MJ/kg)
                      </label>
                      <input
                        type="number"
                        value={parametres.pciDechets}
                        onChange={(e) => updateParam('pciDechets', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('combustionEfficiency', lang)}
                      </label>
                      <input
                        type="number"
                        value={parametres.rendementCombustion}
                        onChange={(e) => updateParam('rendementCombustion', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.5"
                        min="60"
                        max="95"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Matériaux */}
            <div style={cardStyle}>
              <div style={headerStyle} onClick={() => setShowMateriaux(!showMateriaux)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Thermometer size={20} />
                  <span>{t('materialCharacteristics', lang)}</span>
                </div>
                <span style={{ transform: showMateriaux ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
              {showMateriaux && (
                <div style={contentStyle}>
                  <div style={gridStyle}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('material', lang)}
                      </label>
                      <select
                        value={parametres.materiau}
                        onChange={(e) => updateParam('materiau', e.target.value)}
                        style={inputStyle}
                      >
                        {Object.entries(MATERIAUX_CONFIG).map(([key, mat]) => (
                          <option key={key} value={key}>
                            {mat.nom} (≤{mat.temp_max}°C)
                          </option>
                        ))}
                      </select>
                      <small style={{ color: '#666', fontSize: '12px' }}>
  {MATERIAUX_CONFIG[parametres.materiau]?.description || 'Aucune description disponible'}
</small>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('admissibleStress', lang)} (N/mm²)
                      </label>
                      <input
                        type="number"
                        value={parametres.contrainteAdmissible}
                        onChange={(e) => updateParam('contrainteAdmissible', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('weldingCoefficient', lang)}
                      </label>
                      <input
                        type="number"
                        value={parametres.coeffSoudure}
                        onChange={(e) => updateParam('coeffSoudure', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.05"
                        min="0.7"
                        max="1.0"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('corrosionAllowance', lang)} (mm)
                      </label>
                      <input
                        type="number"
                        value={parametres.suppCorrosion}
                        onChange={(e) => updateParam('suppCorrosion', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.5"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Géométrie */}
            <div style={cardStyle}>
              <div style={headerStyle} onClick={() => setShowGeometrie(!showGeometrie)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} />
                  <span>{t('bodyGeometry', lang)}</span>
                </div>
                <span style={{ transform: showGeometrie ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
              {showGeometrie && (
                <div style={contentStyle}>
                  <div style={gridStyle}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('bodyInnerDiameter', lang)} (mm)
                      </label>
                      <input
                        type="number"
                        value={parametres.diametreInt}
                        onChange={(e) => updateParam('diametreInt', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="10"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('bodyLength', lang)} (mm)
                      </label>
                      <input
                        type="number"
                        value={parametres.longueurCorps}
                        onChange={(e) => updateParam('longueurCorps', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="100"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('tubeNumber', lang)}
                      </label>
                      <input
                        type="number"
                        value={parametres.nbTubes}
                        onChange={(e) => updateParam('nbTubes', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('tubeOuterDiameter', lang)} (mm)
                      </label>
                      <input
                        type="number"
                        value={parametres.diametreTubeExt}
                        onChange={(e) => updateParam('diametreTubeExt', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                        {t('tubeInnerDiameter', lang)} (mm)
                      </label>
                      <input
                        type="number"
                        value={parametres.diametreTubeInt}
                        onChange={(e) => updateParam('diametreTubeInt', parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne Résultats */}
          <div>
            
            {/* Messages */}
            {messages.length > 0 && (
              <div style={cardStyle}>
                <div style={headerStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} />
                    <span>{t('checks', lang)}</span>
                  </div>
                </div>
                <div style={contentStyle}>
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: msg.type === 'success' ? '#f0fdf4' : msg.type === 'warning' ? '#fffbeb' : '#fef2f2',
                      color: msg.type === 'success' ? '#166534' : msg.type === 'warning' ? '#92400e' : '#991b1b',
                      border: `2px solid ${msg.type === 'success' ? '#22c55e' : msg.type === 'warning' ? '#f59e0b' : '#ef4444'}`
                    }}>
                      {msg.texte}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats */}
            {resultats && (
              <div style={cardStyle}>
                <div style={headerStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calculator size={20} />
                    <span>{t('mainResults', lang)}</span>
                  </div>
                </div>
                <div style={contentStyle}>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('calculationPressure', lang)}:</strong> {resultats.pressionCalcul.toFixed(1)} {t('bar', lang)}
                  </div>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('bodyThickness', lang)}:</strong> {resultats.epaisseurCorps.toFixed(1)} mm
                  </div>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('tubeThickness', lang)}:</strong> {resultats.epaisseurTubes.toFixed(1)} mm
                  </div>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('steamPower', lang)}:</strong> {resultats.puissanceVapeur.toFixed(0)} kW
                  </div>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('wasteFlow', lang)}:</strong> {resultats.debitDechets.toFixed(0)} kg/h
                  </div>
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong>{t('globalEfficiency', lang)}:</strong> {resultats.rendementGlobal.toFixed(1)} {t('percent', lang)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}