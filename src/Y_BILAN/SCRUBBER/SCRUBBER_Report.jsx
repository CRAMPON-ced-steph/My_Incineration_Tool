import React from 'react';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';

const fmt = (v, decimals = 2) => { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(decimals); };
const Section = ({ title, children }) => <div style={styles.section}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>;
const SubSection = ({ title, children }) => <div style={styles.subSection}>{title && <h3 style={styles.subTitle}>{title}</h3>}{children}</div>;
const KV = ({ label, value, unit = '' }) => <div style={styles.kvRow}><span style={styles.kvLabel}>{label}</span><span style={styles.kvValue}>{value}{unit ? <span style={styles.kvUnit}> {unit}</span> : null}</span></div>;

const GasTable = ({ data = {} }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2'];
  return (
    <table style={styles.table}>
      <thead><tr><th style={styles.th}></th>{gases.map(g => <th key={g} style={styles.th}>{g}</th>)}<th style={styles.th}>Total</th></tr></thead>
      <tbody>{Object.entries(data).map(([lbl, d]) => { const tot = gases.reduce((s, g) => s + (parseFloat(d[g]) || 0), 0); return <tr key={lbl}><td style={styles.tdLabel}>{lbl}</td>{gases.map(g => <td key={g} style={styles.td}>{fmt(d[g])}</td>)}<td style={{ ...styles.td, fontWeight: 'bold' }}>{fmt(tot)}</td></tr>; })}</tbody>
    </table>
  );
};

const PollutantTable = ({ masses = {} }) => {
  const keys = Object.keys(masses).filter(k => masses[k] !== undefined);
  return <table style={styles.table}><thead><tr>{keys.map(k => <th key={k} style={styles.th}>{k}</th>)}</tr></thead><tbody><tr>{keys.map(k => <td key={k} style={styles.td}>{fmt(masses[k], 4)}</td>)}</tr></tbody></table>;
};

const computeOpexCosts = (innerData) => {
  const { purchaseElectricityPrice = 0, ratioElec = 0, availability = 8000, currency = '€', airConsumptionPrice = 0, powerRatio = 0, waterPrices = {}, reagentsTypes = {} } = getOpexData();
  const d = innerData || {};
  const elecRows = [1,2,3,4,5,6,7,8].map(i => ({ label: d[`labelElec${i}`] || `Poste ${i}`, kW: d[`consoElec${i}`] || 0 })).filter(r => r.kW > 0);
  const totalElec_kW = elecRows.reduce((s, r) => s + r.kW, 0);
  const coutElec = (totalElec_kW / 1000) * purchaseElectricityPrice;
  const co2Elec = (ratioElec * totalElec_kW) / 1000;
  const conso_air = d.conso_air_co_N_m3 || 0;
  const coutAir = (conso_air / 1000) * airConsumptionPrice;
  const co2Air = (conso_air * powerRatio * ratioElec) / 1000;
  const eauRows = [
    { label: 'Eau potable', m3h: d.Conso_EauPotable_m3 || 0, prix: waterPrices?.potable || 0 },
    { label: 'Eau déminéralisée', m3h: d.Conso_EauDemin_m3 || 0, prix: waterPrices?.demineralized || 0 },
  ].filter(r => r.m3h > 0);
  const coutEau = eauRows.reduce((s, r) => s + r.m3h * r.prix, 0);
  const reactifRows = [
    { label: 'NaOH', kgh: d.Conso_NaOH_kg || 0, prix: reagentsTypes?.NaOH?.cost || 0 },
    { label: 'CAP', kgh: d.Conso_CAP_kg || 0, prix: reagentsTypes?.CAP?.cost || 0 },
    { label: 'NaHCO₃', kgh: d.Conso_NaOHCO3_kg || 0, prix: reagentsTypes?.NaOHCO3?.cost || 0 },
  ].filter(r => r.kgh > 0);
  const coutReactifs = reactifRows.reduce((s, r) => s + (r.kgh / 1000) * r.prix, 0);
  const totalCout_h = coutElec + coutAir + coutEau + coutReactifs;
  const totalCout_an = totalCout_h * availability;
  const totalCO2_kgh = co2Elec + co2Air;
  return { totalElec_kW, coutElec, co2Elec, coutAir, co2Air, eauRows, coutEau, reactifRows, coutReactifs, totalCout_h, totalCout_an, totalCO2_kgh, currency, availability };
};

const OpexSummary = ({ opex }) => {
  const { coutElec, co2Elec, coutAir, co2Air, coutEau, coutReactifs, totalCout_h, totalCout_an, totalCO2_kgh, currency, availability, totalElec_kW } = opex;
  if (totalElec_kW === 0 && coutEau === 0 && coutReactifs === 0) return <p style={{ color: '#999', fontSize: 12, padding: '10px 14px' }}>Coûts OPEX non disponibles — ouvrir l'onglet Opex.</p>;
  return (
    <div>
      <div style={styles.subSection}>
        <div style={styles.tagRow}>
          {[{ label: `Électricité [${currency}/h]`, val: coutElec, color: '#4a90e2' }, { label: `Eau [${currency}/h]`, val: coutEau, color: '#2ecc71' }, { label: `Réactifs [${currency}/h]`, val: coutReactifs, color: '#e74c3c' }].map(({ label, val, color }) => (
            <div key={label} style={{ ...styles.tag, borderLeft: `4px solid ${color}`, minWidth: 130 }}><span style={styles.tagLabel}>{label}</span><span style={{ ...styles.tagValue, color }}>{fmt(val, 2)}</span></div>
          ))}
        </div>
      </div>
      <div style={styles.twoCol}>
        <div style={{ ...styles.subSection, background: '#f0f5ff', margin: 8, borderRadius: 6 }}>
          <h3 style={{ ...styles.subTitle, color: '#1a3a6b', fontSize: 14 }}>Total coût</h3>
          <KV label={`Coût horaire [${currency}/h]`} value={fmt(totalCout_h, 2)} />
          <KV label={`Coût annuel (${availability}h) [${currency}/an]`} value={fmt(totalCout_an, 0)} />
        </div>
        <div style={{ ...styles.subSection, background: '#f5f0ff', margin: 8, borderRadius: 6 }}>
          <h3 style={{ ...styles.subTitle, color: '#6a1a6b', fontSize: 14 }}>Total CO₂ [kg/h]</h3>
          <KV label="CO₂ électricité" value={fmt(co2Elec, 3)} />
          <KV label="Total CO₂" value={fmt(totalCO2_kgh, 2)} />
        </div>
      </div>
    </div>
  );
};

const SCRUBBER_Report = ({ innerData = {} }) => {
  const T_OUT = innerData.T_OUT || 0;
  const O2_calcule = innerData.O2_calcule || 0;
  const FG_OUT_kg_h = innerData.FG_OUT_kg_h || {};
  const _nm3Computed = { CO2: CO2_kg_m3(FG_OUT_kg_h.CO2||0), H2O: H2O_kg_m3(FG_OUT_kg_h.H2O||0), O2: O2_kg_m3(FG_OUT_kg_h.O2||0), N2: N2_kg_m3(FG_OUT_kg_h.N2||0) };
  _nm3Computed.dry = _nm3Computed.CO2 + _nm3Computed.O2 + _nm3Computed.N2;
  _nm3Computed.wet = _nm3Computed.dry + _nm3Computed.H2O;
  const FG_OUT_Nm3_h = innerData.FG_OUT_Nm3_h || _nm3Computed;
  const FG_wet_total = (FG_OUT_kg_h.CO2 || 0) + (FG_OUT_kg_h.H2O || 0) + (FG_OUT_kg_h.O2 || 0) + (FG_OUT_kg_h.N2 || 0);
  const PInput = innerData.PInput || {};
  const Poutput = innerData.Poutput || {};
  const opex = computeOpexCosts(innerData);

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Laveur de fumées (Scrubber) — Rapport de synthèse</h1>

      <Section title="1. Gaz de combustion">
        <div style={styles.twoCol}>
          <SubSection>
            <KV label="Température de sortie" value={fmt(T_OUT, 0)} unit="°C" />
            <KV label="O₂ mesuré (sec)" value={fmt(O2_calcule)} unit="%" />
            <KV label="Débit humide total [kg/h]" value={fmt(FG_wet_total)} />
            <KV label="Débit sec [Nm³/h]" value={fmt(FG_OUT_Nm3_h.dry, 0)} />
            <KV label="Débit humide [Nm³/h]" value={fmt(FG_OUT_Nm3_h.wet, 0)} />
          </SubSection>
          <SubSection title="Composition gaz de sortie">
            <GasTable data={{ 'kg/h': FG_OUT_kg_h, 'Nm³/h': { CO2: FG_OUT_Nm3_h.CO2, H2O: FG_OUT_Nm3_h.H2O, O2: FG_OUT_Nm3_h.O2, N2: FG_OUT_Nm3_h.N2 } }} />
          </SubSection>
        </div>
      </Section>

      <Section title="2. Émissions polluantes">
        <SubSection title="Gaz en entrée [kg/h]"><PollutantTable masses={PInput} /></SubSection>
        <SubSection title="Gaz en sortie [kg/h]"><PollutantTable masses={Poutput} /></SubSection>
      </Section>

      <Section title="3. Scrubber acide — Traitement HCl">
        <div style={styles.twoCol}>
          <SubSection title="Performances">
            <KV label="Température gaz sortie" value={fmt(innerData.T_FG_out_acid, 1)} unit="°C" />
            <KV label="Efficacité HCl [%]" value={fmt(innerData.FG_HCl_efficiency, 1)} />
          </SubSection>
          <SubSection title="Paramètres d'entrée">
            <KV label="HCl entrant [kg/h]" value={fmt(PInput?.HCl)} />
            <KV label="HCl sortant [kg/h]" value={fmt(Poutput?.HCl)} />
          </SubSection>
        </div>
      </Section>

      <Section title="4. Scrubber basique — Traitement SO₂">
        <div style={styles.twoCol}>
          <SubSection title="Performances">
            <KV label="Efficacité SO₂ [%]" value={fmt(innerData.SO2_efficiency, 1)} />
            <KV label="SO₂ éliminé [kg/h]" value={fmt(innerData.SO2_removed_load)} />
            <KV label="Consommation réactif [kg/h]" value={fmt(innerData.SO2_consumption)} />
          </SubSection>
          <SubSection title="Design colonne">
            <KV label="Diamètre colonne [m]" value={fmt(innerData.column_diameter, 2)} />
            <KV label="Volume garnissage [m³]" value={fmt(innerData.packing_volume, 2)} />
            <KV label="Débit solution lavage [m³/h]" value={fmt(innerData.wash_solution_flow, 2)} />
          </SubSection>
        </div>
      </Section>

      <Section title="5. OPEX — Coûts horaires"><OpexSummary opex={opex} /></Section>

      <div style={styles.footer}>Rapport généré automatiquement — {new Date().toLocaleDateString()}</div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222', maxWidth: 1100, margin: '0 auto', padding: '20px 24px', backgroundColor: '#fff' },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a3a6b', borderBottom: '3px solid #4a90e2', paddingBottom: 8, marginBottom: 24 },
  section: { marginBottom: 28, border: '1px solid #d0daea', borderRadius: 6, overflow: 'hidden' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', background: '#4a90e2', margin: 0, padding: '8px 14px' },
  subSection: { padding: '10px 14px' },
  subTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b', margin: '0 0 6px 0', borderBottom: '1px solid #e0e8f4', paddingBottom: 3 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  kvRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel: { color: '#444', flex: 1 },
  kvValue: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  kvUnit: { fontWeight: 'normal', color: '#666', fontSize: 11 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th: { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b' },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel: { border: '1px solid #dde6f0', padding: '3px 8px', textAlign: 'left', color: '#333', fontStyle: 'italic' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' },
  tag: { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 },
  tagLabel: { fontSize: 10, color: '#555' },
  tagValue: { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b' },
  footer: { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default SCRUBBER_Report;
