/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';

import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../../A_Transverse_fonction/conv_calculation';
import { h_fumee, TEMP_FUMEE } from '../../../A_Transverse_fonction/enthalpy_mix_gas';
import { CpL_T } from '../../../A_Transverse_fonction/steam_table3';
import { cp_air_kWh_m3_degree, D_TLM, Fact_UA, Surface_echange } from '../../../A_Transverse_fonction/bilan_fct_FB';

const STORAGE_KEY = 'TUBEANDSHELL_params';

const DEFAULT = {
  fluide: 'eau',
  bilanType: 'T_sortie',
  T_fumee_out: null,
  PDC_econo: 60,
  T_fluide_in: 15,
  T_fluide_out: 50,
  m_eau: 1000,
  V_air: 1000,
  Rendement: 95,
  Encrassement: 25,
};

const rho_air     = 1.293;
const O2_mass_frac = 0.233;
const N2_mass_frac = 0.767;
const cp_eau      = 4.1868;

// ─── InputRow défini HORS du composant pour éviter la perte de focus ──────────
const inputStyle = (disabled, readOnly) => ({
  width: '110px', padding: '5px 8px',
  border: `1px solid ${disabled ? '#ccc' : readOnly ? '#b0c4de' : '#ddd'}`,
  borderRadius: '4px', fontSize: '13px',
  backgroundColor: disabled ? '#f0f0f0' : readOnly ? '#e8f0fb' : 'white',
  textAlign: 'right',
  color: disabled ? '#888' : readOnly ? '#1a3a6b' : 'inherit',
  fontWeight: readOnly ? 'bold' : 'normal',
  cursor: disabled ? 'not-allowed' : 'auto',
});

const InputRow = ({ label, unit, value, onChange, disabled = false, readOnly = false, minVal = undefined }) => {
  const locked = disabled || readOnly || !onChange;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
      <label style={{ flex: '1', minWidth: '230px', textAlign: 'right', fontWeight: '500', color: disabled ? '#999' : '#333', fontSize: '13px' }}>
        {label} :
      </label>
      <input
        type="number"
        value={value}
        readOnly={locked}
        disabled={disabled}
        onChange={locked ? undefined : (e) => {
          let v = parseFloat(e.target.value);
          if (isNaN(v)) return;
          if (minVal !== undefined && v < minVal) v = minVal;
          onChange(v);
        }}
        style={inputStyle(disabled, readOnly)}
      />
      <span style={{ width: '75px', fontSize: '12px', color: '#666' }}>{unit}</span>
    </div>
  );
};

const InputRowCalc = ({ label, unit, value, decimals = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
    <label style={{ flex: '1', minWidth: '230px', textAlign: 'right', fontWeight: '500', color: '#999', fontSize: '13px' }}>
      {label} :
    </label>
    <input
      type="number"
      value={(parseFloat(value) || 0).toFixed(decimals)}
      disabled
      style={inputStyle(true, false)}
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

const SectionTitle = ({ text }) => (
  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a3a6b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    {text}
  </div>
);

// ─── Composant principal ───────────────────────────────────────────────────────
const TubeAndShellParameters = ({ innerData, upstreamT_IN, upstreamFG_IN, upstreamP_IN }) => {
  const [params, setParams] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const defaultT_out = (upstreamT_IN ?? 200) - 200;
      const bilanType = saved.bilanType === 'T_fumee_sortie' ? 'T_sortie' : saved.bilanType;
      return {
        ...DEFAULT,
        T_fumee_out: defaultT_out,
        ...saved,
        ...(bilanType ? { bilanType } : {}),
        ...(saved.T_fumee_out == null ? { T_fumee_out: defaultT_out } : {}),
      };
    } catch {
      return { ...DEFAULT, T_fumee_out: (upstreamT_IN ?? 200) - 200 };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const set = useCallback((key, val) => setParams(prev => ({ ...prev, [key]: val })), []);
  const num = (v) => parseFloat(v) || 0;

  // --- Données amont ---
  const T_FG_in   = upstreamT_IN ?? 200;
  const FG_IN     = upstreamFG_IN || { CO2: 0, H2O: 0, O2: 0, N2: 0 };
  const P_IN      = upstreamP_IN ?? 0;

  const FG_tot_Nm3_h =
    CO2_kg_m3(FG_IN.CO2 || 0) + H2O_kg_m3(FG_IN.H2O || 0) +
    O2_kg_m3(FG_IN.O2   || 0) + N2_kg_m3(FG_IN.N2   || 0);

  const H_FG_in_kJh = h_fumee(T_FG_in, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);

  const { fluide, bilanType } = params;
  const Rdt       = num(params.Rendement) / 100;
  const Enc       = num(params.Encrassement) / 100;
  const effFactor = Rdt * (1 - Enc);

  const m_O2_unit = O2_mass_frac * rho_air;
  const m_N2_unit = N2_mass_frac * rho_air;
  const h_air_unit = (T) => h_fumee(T, 0, 0, m_N2_unit, m_O2_unit);

  // --- Résolution bilan ---
  let T_FG_out_calc    = num(params.T_fumee_out);
  let T_fluide_in_calc  = num(params.T_fluide_in);
  let T_fluide_out_calc = num(params.T_fluide_out);
  let m_eau_calc       = num(params.m_eau);
  let V_air_calc       = num(params.V_air);

  if (bilanType === 'T_sortie') {
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_out_calc = m_eau_calc > 0
        ? T_fluide_in_calc + Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_in_calc;
    } else {
      const H_air_out_target = h_air_unit(T_fluide_in_calc) * V_air_calc + Q_utile_kJh;
      T_fluide_out_calc = H_air_out_target > 0
        ? TEMP_FUMEE(H_air_out_target, 0, 0, m_N2_unit * V_air_calc, m_O2_unit * V_air_calc)
        : T_fluide_in_calc;
    }
  } else if (bilanType === 'T_entree') {
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_in_calc = m_eau_calc > 0
        ? T_fluide_out_calc - Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_out_calc;
    } else {
      const H_air_in_target = h_air_unit(T_fluide_out_calc) * V_air_calc - Q_utile_kJh;
      T_fluide_in_calc = H_air_in_target > 0
        ? TEMP_FUMEE(H_air_in_target, 0, 0, m_N2_unit * V_air_calc, m_O2_unit * V_air_calc)
        : T_fluide_out_calc;
    }
  } else if (bilanType === 'debit' && fluide === 'air') {
    const H_FG_out_kJh_d = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    const Q_utile_kJh_d  = (H_FG_in_kJh - H_FG_out_kJh_d) * effFactor;
    const dH_air_unit    = h_air_unit(T_fluide_out_calc) - h_air_unit(T_fluide_in_calc);
    V_air_calc = dH_air_unit > 0 ? Q_utile_kJh_d / dH_air_unit : 0;
  }

  // --- Résultats finaux ---
  const H_FG_out_kJh = h_fumee(T_FG_out_calc, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_FG_in_kWh  = H_FG_in_kJh  / 3600;
  const H_FG_out_kWh = H_FG_out_kJh / 3600;
  const Q_FG_kWh     = H_FG_in_kWh - H_FG_out_kWh;
  const P_out_mmCE   = P_IN - num(params.PDC_econo);

  const Q_utile_eau_kWh = Q_FG_kWh * Rdt;
  const T_moyen_eau     = (T_fluide_in_calc + T_fluide_out_calc) / 2;
  const dT_fluide       = T_fluide_out_calc - T_fluide_in_calc;

  let cp_fluide_val;
  if (fluide === 'eau') {
    const cpL_raw = T_moyen_eau > 0 && T_moyen_eau < 373 ? CpL_T(T_moyen_eau) : null;
    cp_fluide_val = (cpL_raw instanceof Error || cpL_raw == null) ? 4.1868 : cpL_raw;
  } else {
    cp_fluide_val = cp_air_kWh_m3_degree(T_moyen_eau);
  }

  const m_eau_CpL = fluide === 'eau' && cp_fluide_val > 0 && T_moyen_eau > 0
    ? (Q_utile_eau_kWh * 3600) / (cp_fluide_val * T_moyen_eau) : 0;
  const V_air_CpL = fluide === 'air' && cp_fluide_val > 0 && dT_fluide > 0
    ? Q_utile_eau_kWh / (cp_fluide_val * dT_fluide) : 0;

  if (bilanType === 'debit') {
    if (fluide === 'eau') m_eau_calc = m_eau_CpL;
    else V_air_calc = V_air_CpL;
  }

  const dT1   = T_FG_out_calc - T_fluide_in_calc;
  const dT2   = T_FG_in - T_fluide_out_calc;
  const d_tlm = (dT1 > 0 && dT2 > 0 && dT1 !== dT2)
    ? D_TLM(T_FG_out_calc, T_FG_in, T_fluide_out_calc, T_fluide_in_calc) : 0;
  const fact_ua     = Fact_UA(Q_FG_kWh, d_tlm);
  const Fact_U_list = fluide === 'eau' ? 66 : 39;
  const surface     = Surface_echange(fact_ua, Fact_U_list, num(params.Encrassement));

  // --- innerData ---
  if (innerData) {
    innerData.T_IN            = T_FG_in;
    innerData.T_OUT           = T_FG_out_calc;
    innerData.P_OUT           = P_out_mmCE;
    innerData.FG_OUT_kg_h     = { CO2: FG_IN.CO2, H2O: FG_IN.H2O, O2: FG_IN.O2, N2: FG_IN.N2 };
    innerData.FG_humide_tot   = FG_tot_Nm3_h;
    innerData.FG_sec_tot      = CO2_kg_m3(FG_IN.CO2 || 0) + O2_kg_m3(FG_IN.O2 || 0) + N2_kg_m3(FG_IN.N2 || 0);
    innerData.H_FG_in_kWh     = H_FG_in_kWh;
    innerData.H_FG_out_kWh    = H_FG_out_kWh;
    innerData.Q_FG_kWh        = Q_FG_kWh;
    innerData.Q_utile_eau_kWh = Q_utile_eau_kWh;
    innerData.T_moyen_eau     = T_moyen_eau;
    innerData.cp_fluide       = cp_fluide_val;
    innerData.m_eau_kg_h      = fluide === 'eau' ? m_eau_CpL : V_air_CpL;
    innerData.D_TLM           = d_tlm;
    innerData.Fact_UA         = fact_ua;
    innerData.Surface_m2      = surface;
    innerData.PDC_mmCE        = num(params.PDC_econo);
  }

  const clearMemory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setParams({ ...DEFAULT });
  }, []);

  const isCalc = (key) => {
    if (key === 'T_fluide_out' && bilanType === 'T_sortie') return true;
    if (key === 'T_fluide_in'  && bilanType === 'T_entree') return true;
    if ((key === 'm_eau' || key === 'V_air') && bilanType === 'debit') return true;
    return false;
  };

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
            <select value={params.fluide} onChange={(e) => set('fluide', e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}>
              <option value="eau">Eau</option>
              <option value="air">Air</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>Bilan par :</label>
            <select value={params.bilanType} onChange={(e) => set('bilanType', e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}>
              <option value="T_sortie">T sortie fluide</option>
              <option value="T_entree">T entrée fluide</option>
              <option value="debit">{fluide === 'eau' ? 'Débit eau entrée' : 'Débit air entrée'}</option>
            </select>
          </div>
        </div>

        {/* Côté fumées */}
        <div style={sectionStyle}>
          <SectionTitle text="Côté fumées" />
          <InputRow label="T fumées entrée"          disabled value={T_FG_in.toFixed(1)}       unit="[°C]" />
          <InputRow label="Débit vol. fumées entrée" disabled value={FG_tot_Nm3_h.toFixed(0)}   unit="[Nm³/h]" />
          <InputRow label="T fumées sortie"          value={params.T_fumee_out ?? 0} onChange={(v) => set('T_fumee_out', v)} unit="[°C]" />
          <InputRow label="PDC écono"                value={params.PDC_econo}        onChange={(v) => set('PDC_econo', v)}   unit="[mmCE]" />
          <InputRowCalc label="Enthalpie fumées entrée"  value={H_FG_in_kWh}  unit="[kWh]" />
          <InputRowCalc label="Enthalpie fumées sortie"  value={H_FG_out_kWh} unit="[kWh]" />
          <InputRowCalc label="Enthalpie cédée fumées"   value={Q_FG_kWh}     unit="[kWh]" />
        </div>

        {/* Côté eau */}
        {fluide === 'eau' && (
          <div style={sectionStyle}>
            <SectionTitle text="Côté eau" />
            {isCalc('T_fluide_in')
              ? <InputRowCalc label="T entrée eau (calculée)" value={T_fluide_in_calc}  unit="[°C]" />
              : <InputRow     label="T entrée eau"            value={params.T_fluide_in} onChange={(v) => set('T_fluide_in', v)}  unit="[°C]" minVal={0} />
            }
            {isCalc('T_fluide_out')
              ? <InputRowCalc label="T sortie eau (calculée)" value={T_fluide_out_calc}  unit="[°C]" />
              : <InputRow     label="T sortie eau"            value={params.T_fluide_out} onChange={(v) => set('T_fluide_out', v)} unit="[°C]" />
            }
            {isCalc('m_eau')
              ? <InputRowCalc label="Débit eau (calculé)" value={m_eau_calc} unit="[kg/h]" />
              : <InputRow     label="Débit eau"           value={params.m_eau} onChange={(v) => set('m_eau', v)} unit="[kg/h]" />
            }
            <InputRowCalc label="Enthalpie transmise à l'eau" value={Q_utile_eau_kWh} unit="[kWh]" />
            <InputRowCalc label="cp eau à T_moy"              value={cp_fluide_val}    unit="[kJ/(kg·K)]" decimals={4} />
          </div>
        )}

        {/* Côté air */}
        {fluide === 'air' && (
          <div style={sectionStyle}>
            <SectionTitle text="Côté air" />
            {isCalc('T_fluide_in')
              ? <InputRowCalc label="T entrée air (calculée)" value={T_fluide_in_calc}  unit="[°C]" />
              : <InputRow     label="T entrée air"            value={params.T_fluide_in} onChange={(v) => set('T_fluide_in', v)}  unit="[°C]" minVal={0} />
            }
            {isCalc('T_fluide_out')
              ? <InputRowCalc label="T sortie air (calculée)" value={T_fluide_out_calc}  unit="[°C]" />
              : <InputRow     label="T sortie air"            value={params.T_fluide_out} onChange={(v) => set('T_fluide_out', v)} unit="[°C]" />
            }
            {isCalc('V_air')
              ? <InputRowCalc label="Débit air (calculé)"     value={V_air_calc}   unit="[Nm³/h]" />
              : <InputRow     label="Débit air"               value={params.V_air} onChange={(v) => set('V_air', v)} unit="[Nm³/h]" />
            }
            <InputRowCalc label="Enthalpie transmise à l'air" value={Q_utile_eau_kWh} unit="[kWh]" />
            <InputRowCalc label="cp air à T_moy"              value={cp_fluide_val}    unit="[kWh/(Nm³·°C)]" decimals={6} />
          </div>
        )}

        {/* Caractéristiques échangeur */}
        <div style={sectionStyle}>
          <SectionTitle text="Caractéristiques échangeur" />
          <InputRow     label="Rendement échangeur"    value={params.Rendement}    onChange={(v) => set('Rendement', v)}    unit="[%]" />
          <InputRow     label="Encrassement échangeur" value={params.Encrassement} onChange={(v) => set('Encrassement', v)} unit="[%]" />
          <InputRowCalc label="ΔT logarithmique moyen" value={d_tlm}       unit="[°C]" />
          <InputRowCalc label="Facteur UA"             value={fact_ua}     unit="[kW/K]"      decimals={2} />
          <InputRowCalc label={`U liste (${fluide})`}  value={Fact_U_list} unit="[kW/(m²·K)]" decimals={0} />
          <InputRowCalc label="Surface d'échange"      value={surface}     unit="[m²]"        decimals={2} />
        </div>
      </div>
    </div>
  );
};

export default TubeAndShellParameters;
