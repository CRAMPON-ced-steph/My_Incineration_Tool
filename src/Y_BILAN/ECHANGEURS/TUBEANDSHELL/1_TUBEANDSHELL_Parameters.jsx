/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../../A_Transverse_fonction/conv_calculation';
import { h_fumee, TEMP_FUMEE } from '../../../A_Transverse_fonction/enthalpy_mix_gas';

const STORAGE_KEY = 'TUBEANDSHELL_params';

const DEFAULT = {
  fluide: 'eau',
  bilanType: 'T_fumee_sortie',
  T_fumee_out: 150,
  PDC_econo: 60,
  T_fluide_in: 15,
  T_fluide_out: 50,
  m_eau: 1000,
  V_air: 1000,
  Rendement: 95,
  Encrassement: 25,
};

// Densités air sec à 0°C, 1 atm
const rho_air = 1.293;          // kg/Nm³
const O2_mass_frac = 0.233;     // fraction massique O2 dans l'air
const N2_mass_frac = 0.767;     // fraction massique N2 dans l'air
const cp_eau = 4.1868;          // kJ/(kg·°C)

const TubeAndShellParameters = ({
  innerData,
  upstreamT_IN,
  upstreamFG_IN,
  upstreamP_IN,
}) => {
  const [params, setParams] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULT, ...saved };
    } catch {
      return { ...DEFAULT };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const set = (key, val) => setParams(prev => ({ ...prev, [key]: val }));
  const num = (v) => parseFloat(v) || 0;

  // --- Données amont ---
  const T_FG_in = upstreamT_IN ?? 200;
  const FG_IN = upstreamFG_IN || { CO2: 0, H2O: 0, O2: 0, N2: 0 };
  const P_IN = upstreamP_IN ?? 0;

  // Débit volumique fumées entrée [Nm³/h]
  const FG_tot_Nm3_h =
    CO2_kg_m3(FG_IN.CO2 || 0) +
    H2O_kg_m3(FG_IN.H2O || 0) +
    O2_kg_m3(FG_IN.O2  || 0) +
    N2_kg_m3(FG_IN.N2  || 0);

  // Enthalpie fumées entrée [kJ/h]
  const H_FG_in_kJh = h_fumee(T_FG_in, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);

  const { fluide, bilanType } = params;
  const Rdt = num(params.Rendement) / 100;
  const Enc = num(params.Encrassement) / 100;
  const effFactor = Rdt * (1 - Enc);

  // Enthalpie massique de l'air [kJ/h] pour 1 Nm³/h
  const m_O2_unit = O2_mass_frac * rho_air;  // kg O2 / Nm³ air
  const m_N2_unit = N2_mass_frac * rho_air;  // kg N2 / Nm³ air
  const h_air_unit = (T) => h_fumee(T, 0, 0, m_N2_unit, m_O2_unit); // kJ/h par Nm³/h

  // --- Résolution du bilan thermique ---
  let T_FG_out_calc   = num(params.T_fumee_out);
  let T_fluide_in_calc  = num(params.T_fluide_in);
  let T_fluide_out_calc = num(params.T_fluide_out);
  let m_eau_calc      = num(params.m_eau);
  let V_air_calc      = num(params.V_air);

  if (bilanType === 'T_fumee_sortie') {
    // Calculer T_FG_out à partir de la charge du fluide secondaire
    let Q_fluide_kJh = 0;
    if (fluide === 'eau') {
      Q_fluide_kJh = m_eau_calc * cp_eau * (T_fluide_out_calc - T_fluide_in_calc);
    } else {
      Q_fluide_kJh = V_air_calc * (h_air_unit(T_fluide_out_calc) - h_air_unit(T_fluide_in_calc));
    }
    const Q_FG_needed_kJh = effFactor > 0 && Q_fluide_kJh > 0
      ? Q_fluide_kJh / effFactor
      : 0;
    const H_FG_out_target = H_FG_in_kJh - Q_FG_needed_kJh;
    T_FG_out_calc = H_FG_out_target > 0
      ? TEMP_FUMEE(H_FG_out_target, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2)
      : T_FG_in;
  } else if (bilanType === 'T_sortie') {
    // Calculer T sortie fluide secondaire
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_out_calc = m_eau_calc > 0
        ? T_fluide_in_calc + Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_in_calc;
    } else {
      const H_air_in_kJh    = h_air_unit(T_fluide_in_calc) * V_air_calc;
      const H_air_out_target = H_air_in_kJh + Q_utile_kJh;
      const m_N2_tot = m_N2_unit * V_air_calc;
      const m_O2_tot = m_O2_unit * V_air_calc;
      T_fluide_out_calc = H_air_out_target > 0
        ? TEMP_FUMEE(H_air_out_target, 0, 0, m_N2_tot, m_O2_tot)
        : T_fluide_in_calc;
    }
  } else if (bilanType === 'T_entree') {
    // Calculer T entrée fluide secondaire
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_in_calc = m_eau_calc > 0
        ? T_fluide_out_calc - Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_out_calc;
    } else {
      const H_air_out_kJh   = h_air_unit(T_fluide_out_calc) * V_air_calc;
      const H_air_in_target  = H_air_out_kJh - Q_utile_kJh;
      const m_N2_tot = m_N2_unit * V_air_calc;
      const m_O2_tot = m_O2_unit * V_air_calc;
      T_fluide_in_calc = H_air_in_target > 0
        ? TEMP_FUMEE(H_air_in_target, 0, 0, m_N2_tot, m_O2_tot)
        : T_fluide_out_calc;
    }
  } else if (bilanType === 'debit') {
    // Calculer le débit du fluide secondaire
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      const dT_eau = T_fluide_out_calc - T_fluide_in_calc;
      m_eau_calc = dT_eau > 0 ? Q_utile_kJh / (cp_eau * dT_eau) : 0;
    } else {
      const dH_air_unit = h_air_unit(T_fluide_out_calc) - h_air_unit(T_fluide_in_calc);
      V_air_calc = dH_air_unit > 0 ? Q_utile_kJh / dH_air_unit : 0;
    }
  }

  // --- Résultats finaux ---
  const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_FG_in_kWh  = H_FG_in_kJh  / 3600;
  const H_FG_out_kWh = H_FG_out_kJh / 3600;
  const Q_FG_kWh     = H_FG_in_kWh - H_FG_out_kWh;
  const Q_utile_kWh  = Q_FG_kWh * effFactor;
  const P_out_mmCE   = P_IN - num(params.PDC_econo);

  // Mise à jour innerData (mutations intentionnelles — pattern établi)
  if (innerData) {
    innerData.T_OUT         = T_FG_out_calc;
    innerData.P_OUT         = P_out_mmCE;
    innerData.FG_OUT_kg_h   = { CO2: FG_IN.CO2, H2O: FG_IN.H2O, O2: FG_IN.O2, N2: FG_IN.N2 };
    innerData.FG_humide_tot = FG_tot_Nm3_h;
    innerData.FG_sec_tot    = CO2_kg_m3(FG_IN.CO2 || 0) + O2_kg_m3(FG_IN.O2 || 0) + N2_kg_m3(FG_IN.N2 || 0);
    innerData.H_FG_in_kWh   = H_FG_in_kWh;
    innerData.H_FG_out_kWh  = H_FG_out_kWh;
    innerData.Q_utile_kWh   = Q_utile_kWh;
    innerData.PDC_mmCE      = num(params.PDC_econo);
  }

  const clearMemory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setParams({ ...DEFAULT });
  }, []);

  // --- Helpers de rendu ---
  const isCalc = (key) => {
    if (key === 'T_fumee_out' && bilanType === 'T_fumee_sortie') return true;
    if (key === 'T_fluide_out' && bilanType === 'T_sortie') return true;
    if (key === 'T_fluide_in'  && bilanType === 'T_entree')  return true;
    if ((key === 'm_eau' || key === 'V_air') && bilanType === 'debit') return true;
    return false;
  };

  const InputRow = ({ label, stateKey, unit, readOnly = false, calcValue = null }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
      <label style={{ flex: '1', minWidth: '230px', textAlign: 'right', fontWeight: '500', color: '#333', fontSize: '13px' }}>
        {label} :
      </label>
      <input
        type="number"
        value={readOnly
          ? (calcValue ?? 0).toFixed(1)
          : (params[stateKey] ?? 0)}
        readOnly={readOnly}
        onChange={readOnly ? undefined : (e) => set(stateKey, parseFloat(e.target.value) || 0)}
        style={{
          width: '110px', padding: '5px 8px',
          border: `1px solid ${readOnly ? '#b0c4de' : '#ddd'}`,
          borderRadius: '4px', fontSize: '13px',
          backgroundColor: readOnly ? '#e8f0fb' : 'white',
          textAlign: 'right', color: readOnly ? '#1a3a6b' : 'inherit',
          fontWeight: readOnly ? 'bold' : 'normal',
        }}
      />
      <span style={{ width: '75px', fontSize: '12px', color: '#666' }}>{unit}</span>
    </div>
  );

  const sectionStyle = {
    border: '1px solid #d0daea',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '12px',
    backgroundColor: '#f8fafd',
  };
  const sectionTitle = (text) => (
    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a3a6b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {text}
    </div>
  );

  // Résultats calculés pour TableGeneric
  const calcElements = [
    { text: 'Enthalpie fumées entrée [kWh]', value: H_FG_in_kWh.toFixed(1) },
    { text: 'Enthalpie fumées sortie [kWh]',  value: H_FG_out_kWh.toFixed(1) },
    { text: 'Q échangé côté fumées [kWh]',    value: Q_FG_kWh.toFixed(1) },
    { text: 'Q utile transféré [kWh]',         value: Q_utile_kWh.toFixed(1) },
  ];

  if (bilanType === 'T_fumee_sortie') {
    calcElements.push({ text: 'T fumées sortie calculée [°C]',    value: T_FG_out_calc.toFixed(1) });
  }
  if (bilanType === 'T_sortie') {
    calcElements.push({ text: `T sortie ${fluide} calculée [°C]`, value: T_fluide_out_calc.toFixed(1) });
  }
  if (bilanType === 'T_entree') {
    calcElements.push({ text: `T entrée ${fluide} calculée [°C]`, value: T_fluide_in_calc.toFixed(1) });
  }
  if (bilanType === 'debit') {
    calcElements.push(fluide === 'eau'
      ? { text: 'Débit eau calculé [kg/h]',  value: m_eau_calc.toFixed(1) }
      : { text: 'Débit air calculé [Nm³/h]', value: V_air_calc.toFixed(1) }
    );
  }

  return (
    <div className="cadre_pour_onglet">
      <h3>Tube &amp; Shell — Paramètres</h3>

      <div className="cadre_param_bilan">
        <button
          onClick={clearMemory}
          style={{ padding: '6px 14px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '14px' }}
        >
          Effacer mémoire
        </button>

        {/* Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>Choix du fluide :</label>
            <select
              value={params.fluide}
              onChange={(e) => set('fluide', e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value="eau">Eau</option>
              <option value="air">Air</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>Bilan par :</label>
            <select
              value={params.bilanType}
              onChange={(e) => set('bilanType', e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value="T_fumee_sortie">T fumées sortie</option>
              <option value="T_sortie">T sortie fluide</option>
              <option value="T_entree">T entrée fluide</option>
              <option value="debit">{fluide === 'eau' ? 'Débit eau entrée' : 'Débit air entrée'}</option>
            </select>
          </div>
        </div>

        {/* Côté fumées */}
        <div style={sectionStyle}>
          {sectionTitle('Côté fumées')}
          <InputRow label="T fumées entrée"               readOnly calcValue={T_FG_in}        unit="[°C]" />
          <InputRow label="Débit vol. fumées entrée"       readOnly calcValue={FG_tot_Nm3_h}   unit="[Nm³/h]" />
          {isCalc('T_fumee_out')
            ? <InputRow label="T fumées sortie (calculée)" readOnly calcValue={T_FG_out_calc}  unit="[°C]" />
            : <InputRow label="T fumées sortie"            stateKey="T_fumee_out"              unit="[°C]" />
          }
          <InputRow label="PDC écono"                      stateKey="PDC_econo"                unit="[mmCE]" />
        </div>

        {/* Côté eau */}
        {fluide === 'eau' && (
          <div style={sectionStyle}>
            {sectionTitle('Côté eau')}
            {isCalc('T_fluide_in')
              ? <InputRow label="T entrée eau (calculée)" readOnly calcValue={T_fluide_in_calc}  unit="[°C]" />
              : <InputRow label="T entrée eau"            stateKey="T_fluide_in"                 unit="[°C]" />
            }
            {isCalc('T_fluide_out')
              ? <InputRow label="T sortie eau (calculée)" readOnly calcValue={T_fluide_out_calc} unit="[°C]" />
              : <InputRow label="T sortie eau"            stateKey="T_fluide_out"                unit="[°C]" />
            }
            {isCalc('m_eau')
              ? <InputRow label="Débit eau (calculé)"     readOnly calcValue={m_eau_calc}        unit="[kg/h]" />
              : <InputRow label="Débit eau"               stateKey="m_eau"                       unit="[kg/h]" />
            }
          </div>
        )}

        {/* Côté air */}
        {fluide === 'air' && (
          <div style={sectionStyle}>
            {sectionTitle('Côté air')}
            {isCalc('T_fluide_in')
              ? <InputRow label="T entrée air (calculée)" readOnly calcValue={T_fluide_in_calc}  unit="[°C]" />
              : <InputRow label="T entrée air"            stateKey="T_fluide_in"                 unit="[°C]" />
            }
            {isCalc('T_fluide_out')
              ? <InputRow label="T sortie air (calculée)" readOnly calcValue={T_fluide_out_calc} unit="[°C]" />
              : <InputRow label="T sortie air"            stateKey="T_fluide_out"                unit="[°C]" />
            }
            {isCalc('V_air')
              ? <InputRow label="Débit air (calculé)"     readOnly calcValue={V_air_calc}        unit="[Nm³/h]" />
              : <InputRow label="Débit air"               stateKey="V_air"                       unit="[Nm³/h]" />
            }
          </div>
        )}

        {/* Caractéristiques échangeur */}
        <div style={sectionStyle}>
          {sectionTitle('Caractéristiques échangeur')}
          <InputRow label="Rendement échangeur"    stateKey="Rendement"    unit="[%]" />
          <InputRow label="Encrassement échangeur" stateKey="Encrassement" unit="[%]" />
        </div>
      </div>

      {/* Paramètres calculés */}
      <h3>Paramètres calculés</h3>
      <TableGeneric elements={calcElements} />
    </div>
  );
};

export default TubeAndShellParameters;
