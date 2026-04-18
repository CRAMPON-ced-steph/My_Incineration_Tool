import React from 'react';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';

const fmt = (v, decimals = 2) => { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(decimals); };
const Section = ({ title, children }) => <div style={styles.section}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>;
const SubSection = ({ title, children }) => <div style={styles.subSection}>{title && <h3 style={styles.subTitle}>{title}</h3>}{children}</div>;
const KV = ({ label, value, unit = '' }) => <div style={styles.kvRow}><span style={styles.kvLabel}>{label}</span><span style={styles.kvValue}>{value}{unit ? <span style={styles.kvUnit}> {unit}</span> : null}</span></div>;

const GasTable = ({ data = {} }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2'];
  return (
    <table style={styles.table}>
      <thead><tr><th style={styles.th}></th>{gases.map(g => <th key={g} style={styles.th}>{g}</th>)}<th style={styles.th}>Total</th></tr></thead>
      <tbody>{Object.entries(data).map(([lbl, d]) => {
        if (!d || typeof d !== 'object') return null;
        const tot = gases.reduce((s, g) => s + (parseFloat(d[g]) || 0), 0);
        return <tr key={lbl}><td style={styles.tdLabel}>{lbl}</td>{gases.map(g => <td key={g} style={styles.td}>{fmt(d[g])}</td>)}<td style={{ ...styles.td, fontWeight: 'bold' }}>{fmt(tot)}</td></tr>;
      })}</tbody>
    </table>
  );
};

const PollutantTable = ({ masses = {} }) => {
  const keys = Object.keys(masses).filter(k => masses[k] !== undefined);
  if (keys.length === 0) return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
  return <table style={styles.table}><thead><tr>{keys.map(k => <th key={k} style={styles.th}>{k}</th>)}</tr></thead><tbody><tr>{keys.map(k => <td key={k} style={styles.td}>{fmt(masses[k], 4)}</td>)}</tr></tbody></table>;
};

const ElecTable = ({ rows }) => (
  <table style={styles.table}>
    <thead><tr><th style={styles.th}>Consommateur</th><th style={styles.th}>kW</th></tr></thead>
    <tbody>
      {rows.map(r => <tr key={r.label}><td style={styles.tdLabel}>{r.label}</td><td style={styles.td}>{fmt(r.value)}</td></tr>)}
      <tr style={{ background: '#eaf0fb', fontWeight: 'bold' }}><td style={styles.tdLabel}>Total</td><td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0))}</td></tr>
    </tbody>
  </table>
);

const computeOpexCosts = (innerData) => {
  const { purchaseElectricityPrice = 0, ratioElec = 0, availability = 8000, currency = '€', airConsumptionPrice = 0, powerRatio = 0 } = getOpexData();
  const d = innerData || {};
  const elecRows = [1,2,3,4,5,6,7,8].map(i => ({ label: d[`labelElec${i}`] || `Poste ${i}`, kW: d[`consoElec${i}`] || 0 })).filter(r => r.kW > 0);
  const totalElec_kW = elecRows.reduce((s, r) => s + r.kW, 0);
  const coutElec = (totalElec_kW / 1000) * purchaseElectricityPrice;
  const co2Elec = (ratioElec * totalElec_kW) / 1000;
  const conso_air = d.conso_air_co_N_m3 || 0;
  const coutAir = (conso_air / 1000) * airConsumptionPrice;
  const co2Air = (conso_air * powerRatio * ratioElec) / 1000;
  const totalCout_h = coutElec + coutAir;
  const totalCout_an = totalCout_h * availability;
  const totalCO2_kgh = co2Elec + co2Air;
  return { elecRows, totalElec_kW, coutElec, co2Elec, coutAir, co2Air, totalCout_h, totalCout_an, totalCO2_kgh, currency, availability };
};

const STACK_Report = ({ innerData = {} }) => {
  // ── Gaz de combustion ──────────────────────────────────────────────────────
  const T_OUT    = innerData.T_OUT || 0;
  const T_STACK_in = innerData.T_STACK_in || T_OUT;
  const FG_OUT_kg_h   = innerData.FG_OUT_kg_h || {};
  const FG_OUT_Nm3_h  = innerData.FG_STACK_OUT_Nm3_h || innerData.FG_OUT_Nm3_h || {};
  const FG_wet_total  = (FG_OUT_kg_h.CO2 || 0) + (FG_OUT_kg_h.H2O || 0) + (FG_OUT_kg_h.O2 || 0) + (FG_OUT_kg_h.N2 || 0);
  const O2_calcule    = innerData.O2_calcule || innerData.O2calcul || 0;

  // ── Émissions polluantes ───────────────────────────────────────────────────
  const PInput  = innerData.PInput  || innerData.PollutantInput  || {};
  const Poutput = innerData.Poutput || innerData.PollutantOutput || {};

  // ── Design cheminée ────────────────────────────────────────────────────────
  const hp_min        = innerData.stack_hp_min;
  const hp_multistack = innerData.stack_hp_multistack;
  const hp_obstacles  = innerData.stack_hp_obstacles;
  const concentration = innerData.stack_concentration_mg_Nm3;
  const emissionLimit = innerData.stack_emission_limit_mg_Nm3;
  const compliantPct  = innerData.stack_compliant_pct;
  const compliant     = innerData.stack_compliant;
  const pollutantType = innerData.stack_pollutant_type || '—';
  const zone          = innerData.stack_zone;
  const isGaz         = innerData.stack_is_gaz;
  const Qv_Nm3_h      = innerData.stack_Qv_Nm3_h;
  const Qv_m3_h       = innerData.stack_Qv_m3_h;
  const Qm_kg_h       = innerData.stack_Qm_kg_h;

  // ── Consommations électriques (Design tab) ─────────────────────────────────
  const elecRows = [1,2,3,4,5,6,7,8]
    .map(i => ({ label: innerData[`labelElec${i}`] || `Poste ${i}`, value: innerData[`consoElec${i}`] }))
    .filter(r => parseFloat(r.value) > 0);

  const opex = computeOpexCosts(innerData);

  const hasDesignData = hp_min !== undefined;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Cheminée (Stack) — Rapport de synthèse</h1>

      {/* ── Section 1 : Gaz de combustion ─────────────────────────────────── */}
      <Section title="1. Gaz de combustion">
        <div style={styles.twoCol}>
          <SubSection>
            <KV label="Température entrée cheminée [°C]" value={fmt(T_STACK_in, 0)} />
            <KV label="O₂ (sec)" value={fmt(O2_calcule)} unit="%" />
            <KV label="Débit humide total [kg/h]" value={fmt(FG_wet_total)} />
            <KV label="Débit sec [Nm³/h]"    value={fmt(FG_OUT_Nm3_h.dry  ?? innerData.FG_sec_tot,  0)} />
            <KV label="Débit humide [Nm³/h]" value={fmt(FG_OUT_Nm3_h.wet  ?? innerData.FG_humide_tot, 0)} />
          </SubSection>
          <SubSection title="Composition gaz">
            <GasTable data={{
              'kg/h':   FG_OUT_kg_h,
              'Nm³/h':  { CO2: FG_OUT_Nm3_h.CO2, H2O: FG_OUT_Nm3_h.H2O, O2: FG_OUT_Nm3_h.O2, N2: FG_OUT_Nm3_h.N2 },
            }} />
          </SubSection>
        </div>
      </Section>

      {/* ── Section 2 : Émissions polluantes ──────────────────────────────── */}
      <Section title="2. Émissions polluantes">
        <SubSection title="Polluants en entrée [kg/h]"><PollutantTable masses={PInput} /></SubSection>
        <SubSection title="Polluants en sortie [kg/h]"><PollutantTable masses={Poutput} /></SubSection>
      </Section>

      {/* ── Section 3 : Design cheminée ───────────────────────────────────── */}
      <Section title="3. Design — Dimensionnement cheminée">
        {!hasDesignData ? (
          <p style={{ color: '#999', fontSize: 12, padding: '10px 14px' }}>
            Données non disponibles — ouvrir l'onglet Design.
          </p>
        ) : (
          <div style={styles.twoCol}>
            <SubSection title="Débits gaz">
              <KV label="Débit massique humide [kg/h]"   value={fmt(Qm_kg_h,  0)} />
              <KV label="Volume sec [Nm³/h]"              value={fmt(Qv_Nm3_h, 0)} />
              <KV label="Volume réel à T sortie [m³/h]"  value={fmt(Qv_m3_h,  0)} />
              <KV label="Polluant de référence"           value={pollutantType} />
              <KV label="Type"                            value={isGaz ? 'Gaz' : 'Poussières'} />
              <KV label="Zone réglementaire"              value={zone !== undefined ? `Zone ${zone}` : '—'} />
            </SubSection>
            <SubSection title="Hauteurs calculées [m]">
              <KV label="Hauteur min. théorique"          value={fmt(hp_min,        1)} />
              <KV label="Hauteur corrigée multi-stack"    value={fmt(hp_multistack, 1)} />
              <KV label="Hauteur corrigée obstacles"      value={fmt(hp_obstacles,  1)} />
            </SubSection>
          </div>
        )}
        {hasDesignData && (
          <SubSection title="Conformité réglementaire">
            <div style={{ ...styles.complianceBadge, borderColor: compliant ? '#27ae60' : '#e74c3c', background: compliant ? '#eafaf1' : '#fdf2f2' }}>
              <KV label={`Concentration calculée [mg/Nm³]`} value={fmt(concentration, 2)} />
              <KV label={`Limite d'émission VLE [mg/Nm³]`}  value={fmt(emissionLimit,  2)} />
              <KV label="% de la VLE"                       value={fmt(compliantPct,   1)} unit="%" />
              <KV label="Statut"                            value={compliant ? '✔ Conforme' : '✘ Non conforme'} />
            </div>
          </SubSection>
        )}
        {elecRows.length > 0 && (
          <SubSection title="Consommations électriques">
            <ElecTable rows={elecRows} />
          </SubSection>
        )}
      </Section>

      {/* ── Section 4 : OPEX ──────────────────────────────────────────────── */}
      <Section title="4. OPEX — Coûts horaires">
        {opex.totalElec_kW === 0
          ? <p style={{ color: '#999', fontSize: 12, padding: '10px 14px' }}>Coûts OPEX non disponibles — ouvrir les onglets Design et Opex.</p>
          : (
            <div>
              <div style={styles.subSection}>
                <div style={styles.tagRow}>
                  <div style={{ ...styles.tag, borderLeft: '4px solid #4a90e2', minWidth: 130 }}>
                    <span style={styles.tagLabel}>{`Électricité [${opex.currency}/h]`}</span>
                    <span style={{ ...styles.tagValue, color: '#4a90e2' }}>{fmt(opex.coutElec, 2)}</span>
                  </div>
                </div>
              </div>
              <div style={styles.twoCol}>
                <div style={{ ...styles.subSection, background: '#f0f5ff', margin: 8, borderRadius: 6 }}>
                  <h3 style={{ ...styles.subTitle, color: '#1a3a6b', fontSize: 14 }}>Total coût</h3>
                  <KV label={`Coût horaire [${opex.currency}/h]`}                  value={fmt(opex.totalCout_h, 2)} />
                  <KV label={`Coût annuel (${opex.availability}h) [${opex.currency}/an]`} value={fmt(opex.totalCout_an, 0)} />
                </div>
                <div style={{ ...styles.subSection, background: '#f5f0ff', margin: 8, borderRadius: 6 }}>
                  <h3 style={{ ...styles.subTitle, color: '#6a1a6b', fontSize: 14 }}>Total CO₂ [kg/h]</h3>
                  <KV label="CO₂ électricité" value={fmt(opex.co2Elec, 3)} />
                  <KV label="Total CO₂"       value={fmt(opex.totalCO2_kgh, 2)} />
                </div>
              </div>
            </div>
          )
        }
      </Section>

      <div style={styles.footer}>Rapport généré automatiquement — {new Date().toLocaleDateString()}</div>
    </div>
  );
};

const styles = {
  container:      { fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222', maxWidth: 1100, margin: '0 auto', padding: '20px 24px', backgroundColor: '#fff' },
  mainTitle:      { fontSize: 20, fontWeight: 'bold', color: '#1a3a6b', borderBottom: '3px solid #4a90e2', paddingBottom: 8, marginBottom: 24 },
  section:        { marginBottom: 28, border: '1px solid #d0daea', borderRadius: 6, overflow: 'hidden' },
  sectionTitle:   { fontSize: 15, fontWeight: 'bold', color: '#fff', background: '#4a90e2', margin: 0, padding: '8px 14px' },
  subSection:     { padding: '10px 14px' },
  subTitle:       { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b', margin: '0 0 6px 0', borderBottom: '1px solid #e0e8f4', paddingBottom: 3 },
  twoCol:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  kvRow:          { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel:        { color: '#444', flex: 1 },
  kvValue:        { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  kvUnit:         { fontWeight: 'normal', color: '#666', fontSize: 11 },
  table:          { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th:             { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b' },
  td:             { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel:        { border: '1px solid #dde6f0', padding: '3px 8px', textAlign: 'left', color: '#333', fontStyle: 'italic' },
  tagRow:         { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' },
  tag:            { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 },
  tagLabel:       { fontSize: 10, color: '#555' },
  tagValue:       { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b' },
  complianceBadge:{ margin: '4px 0', padding: '8px 12px', borderRadius: 6, border: '2px solid', borderLeft: '5px solid' },
  footer:         { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default STACK_Report;
