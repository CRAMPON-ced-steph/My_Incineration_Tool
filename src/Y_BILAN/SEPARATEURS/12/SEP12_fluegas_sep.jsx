/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import MassCalculator from '../../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../../A_Transverse_fonction/conv_calculation';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SEP12_traduction';

const SEP12FluegasSep = ({ innerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [pct_flux1, setPct_flux1] = useState(() => {
    const saved = localStorage.getItem('pct_flux1_SEP12');
    return saved !== null ? parseFloat(saved) : 50;
  });

  useEffect(() => {
    localStorage.setItem('pct_flux1_SEP12', String(pct_flux1));
  }, [pct_flux1]);

  // Données amont — capturées au montage pour rester fixes malgré les mutations de innerData
  const T_IN_ref  = useRef(innerData?.T_OUT ?? 200);
  const FG_IN_ref = useRef(innerData?.FG_OUT_kg_h || { CO2: 0, H2O: 0, O2: 0, N2: 0 });
  const T_IN  = T_IN_ref.current;
  const FG_IN = FG_IN_ref.current;

  const frac1 = Math.max(0, Math.min(100, pct_flux1)) / 100;
  const frac2 = 1 - frac1;

  const FG_flux1 = {
    CO2: FG_IN.CO2 * frac1,
    H2O: FG_IN.H2O * frac1,
    O2:  FG_IN.O2  * frac1,
    N2:  FG_IN.N2  * frac1,
  };
  const FG_flux2 = {
    CO2: FG_IN.CO2 * frac2,
    H2O: FG_IN.H2O * frac2,
    O2:  FG_IN.O2  * frac2,
    N2:  FG_IN.N2  * frac2,
  };

  const total_in = FG_IN.CO2 + FG_IN.H2O + FG_IN.O2 + FG_IN.N2;

  const dry1 = CO2_kg_m3(FG_flux1.CO2) + O2_kg_m3(FG_flux1.O2) + N2_kg_m3(FG_flux1.N2);
  const wet1 = dry1 + H2O_kg_m3(FG_flux1.H2O);
  const dry2 = CO2_kg_m3(FG_flux2.CO2) + O2_kg_m3(FG_flux2.O2) + N2_kg_m3(FG_flux2.N2);
  const wet2 = dry2 + H2O_kg_m3(FG_flux2.H2O);

  // Mutations innerData (pattern établi — flux 1 transmis au nœud suivant)
  if (innerData) {
    innerData.FG_OUT_kg_h     = FG_flux1;
    innerData.T_OUT           = T_IN;
    innerData.FG_flux2        = FG_flux2;
    innerData.pct_flux1_SEP12 = pct_flux1;
    innerData.P_out_mmCE      = innerData.P_OUT ?? 0;
  }

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('SEP12 — 1 to 2 Separator')}</h3>

      {/* Flux entrant */}
      <h4>{t('Inlet stream')} ({T_IN.toFixed(1)} °C)</h4>
      <MassCalculator masses={FG_IN} TemperatureImposee={T_IN} />
      <TableGeneric elements={[
        { text: t('Total mass flow [kg/h]'), value: total_in.toFixed(0) },
      ]} />

      {/* Rapport de séparation */}
      <h4>{t('Split ratio')}</h4>
      <div className="cadre_param_bilan">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: '1', minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
            {t('% to Flux 1')} :
          </label>
          <input
            type="number"
            value={pct_flux1}
            min={0}
            max={100}
            onChange={(e) => setPct_flux1(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
          <label style={{ flex: '1', minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#888' }}>
            {t('% to Flux 2')} :
          </label>
          <input
            type="number"
            value={(100 - pct_flux1).toFixed(1)}
            disabled
            style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f5f5f5' }}
          />
        </div>
      </div>

      {/* Flux 1 — transmis au nœud suivant */}
      <h4>{t('Flux 1 — to next node')} — {pct_flux1.toFixed(1)} %</h4>
      <MassCalculator masses={FG_flux1} TemperatureImposee={T_IN} />
      <TableGeneric elements={[
        { text: t('Total mass flow [kg/h]'), value: (FG_flux1.CO2 + FG_flux1.H2O + FG_flux1.O2 + FG_flux1.N2).toFixed(0) },
        { text: t('Dry flow [Nm³/h]'),       value: dry1.toFixed(0) },
        { text: t('Wet flow [Nm³/h]'),       value: wet1.toFixed(0) },
      ]} />

      {/* Flux 2 — évacué */}
      <h4>{t('Flux 2 — evacuated')} — {(100 - pct_flux1).toFixed(1)} %</h4>
      <MassCalculator masses={FG_flux2} TemperatureImposee={T_IN} />
      <TableGeneric elements={[
        { text: t('Total mass flow [kg/h]'), value: (FG_flux2.CO2 + FG_flux2.H2O + FG_flux2.O2 + FG_flux2.N2).toFixed(0) },
        { text: t('Dry flow [Nm³/h]'),       value: dry2.toFixed(0) },
        { text: t('Wet flow [Nm³/h]'),       value: wet2.toFixed(0) },
      ]} />
    </div>
  );
};

export default SEP12FluegasSep;
