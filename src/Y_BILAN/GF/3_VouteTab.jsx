import React, { useState } from 'react';

import gfZonesImg from '../../B_Images/GF_zones.png';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

import { fmt } from '../../A_Transverse_fonction/formatNumber';
const DimensionnementTab = ({ innerData = {}, innerDataTick, currentLanguage = 'fr' }) => {
  void innerDataTick;

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [zoneWidths, setZoneWidths] = useState([15, 32, 32, 15, 6]);

  const TempEntreeBoiteVent_C = innerData?.Temp_air_fluidisation_av_prechauffe_C ?? 0;
  const VolAirEntreeBoiteVent_Nm3h = innerData?.Q_air_comb_tot_Nm3_h ?? 0;

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
  };
  const readOnlyStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#374151',
  };
  const labelStyle = {
    display: 'block',
    color: '#374151',
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '6px',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a202c' }}>🔄 {t('Dimensionnement') || 'Dimensionnement'}</h1>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px', textAlign: 'center' }}>
        <img src={gfZonesImg} alt="GF Zones" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          ⚙️ {t('Paramètres grille') || 'Paramètres grille'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start' }}>
          <div>
            <label style={labelStyle}>{t('Temperature Entree Boite à Vent [°C]')}</label>
            <input type="text" value={TempEntreeBoiteVent_C} readOnly style={readOnlyStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('Débit Air humide Entree Boite à Vent [Nm3/h]')}</label>
            <input type="text" value={Number(VolAirEntreeBoiteVent_Nm3h).toFixed(2)} readOnly style={readOnlyStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('Débit air combustion total [kg/h]')}</label>
            <input type="text" value={Number(innerData?.Masse_air_sec_combustion_tot_kg_h || 0).toFixed(2)} readOnly style={readOnlyStyle} />
          </div>
        </div>

        {/* ── Combustion Air Repartition Diagram ── */}
        {(() => {
          const totalAir = innerData?.Masse_air_sec_combustion_tot_kg_h || 0;
          const sumW = zoneWidths.reduce((s, w) => s + w, 0) || 1;
          const airValues = zoneWidths.map(w => totalAir * (w / sumW));
          const handleZoneWidth = (idx, val) => {
            const next = [...zoneWidths];
            next[idx] = Math.max(0, Number(val) || 0);
            setZoneWidths(next);
          };

          return (
            <div style={{ marginTop: 25 }}>
              <h3 style={{ fontSize: 15, fontWeight: 'bold', color: '#444', borderBottom: '2px solid #ddd', paddingBottom: 8, marginBottom: 15 }}>
                {t('Combustion air repartition')}
              </h3>

              {/* Zone labels */}
              <div style={{ position: 'relative', display: 'flex', height: 28, width: '100%', marginBottom: 4 }}>
                <div style={{ position: 'absolute', left: 0, width: `${zoneWidths[0] + zoneWidths[1]}%`, height: '100%', background: '#b30000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', borderRadius: '4px 0 0 4px' }}>
                  DRYING ZONE
                </div>
                <div style={{ position: 'absolute', left: `${zoneWidths[0] + zoneWidths[1]}%`, width: `${zoneWidths[2] + zoneWidths[3]}%`, height: '100%', background: '#ff1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                  COMBUSTION ZONE
                </div>
                <div style={{ position: 'absolute', right: 0, width: `${zoneWidths[4]}%`, height: '100%', background: '#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', borderRadius: '0 4px 4px 0' }}>
                  ASH
                </div>
              </div>

              {/* Separator line */}
              <div style={{ width: '100%', borderBottom: '2px solid #444', marginBottom: 6 }} />

              {/* Values + width inputs */}
              <div style={{ display: 'flex', width: '100%', fontSize: 11 }}>
                {zoneWidths.map((w, i) => (
                  <div key={i} style={{ width: `${w / sumW * 100}%`, textAlign: 'center', borderLeft: i > 0 ? '1px solid #ccc' : 'none', padding: '4px 2px' }}>
                    <div style={{ fontWeight: 'bold', color: '#1a3a6b' }}>{fmt(airValues[i], 0)} kg/h</div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={w}
                        onChange={(e) => handleZoneWidth(i, e.target.value)}
                        style={{ width: 40, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 11, textAlign: 'center' }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ marginTop: 8, fontSize: 12, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total : <b>{fmt(sumW, 0)}%</b></span>
                <span>Air combustion total : <b>{fmt(totalAir, 0)} kg/h</b></span>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
};

export default DimensionnementTab;
