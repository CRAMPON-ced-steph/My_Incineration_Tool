import React from 'react';

const fmt = (v, decimals = 2) => {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : n.toFixed(decimals);
};

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const SubSection = ({ title, children }) => (
  <div style={styles.subSection}>
    {title && <h3 style={styles.subTitle}>{title}</h3>}
    {children}
  </div>
);

const KV = ({ label, value, unit = '' }) => (
  <div style={styles.kvRow}>
    <span style={styles.kvLabel}>{label}</span>
    <span style={styles.kvValue}>
      {value}
      {unit ? <span style={styles.kvUnit}> {unit}</span> : null}
    </span>
  </div>
);

const DENOX_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const r = calculationResult || {};
  const df = r.dataFlow || {};
  const d = r.dataDENOX || {};
  const p = inputParams || {};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>DeNOx — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>Rapport de synthèse — Mode rétro-calcul DENOX</h1>

            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Objectif NOx">
                  <KV label="Cible NOx" value={fmt(p.targetNOx, 0)} unit="mg/Nm³" />
                  <KV label="T eau spray" value={fmt(p.sprayWaterTemp, 1)} unit="°C" />
                  <KV label="Coef. stœchiométrique" value={fmt(p.coeffStoech, 2)} unit="—" />
                  <KV label="PDC" value={fmt(p.pdc, 0)} unit="mmCE" />
                </SubSection>
                <SubSection title="Solution réductrice">
                  <KV label="Concentration solution" value={fmt(p.solutionConc, 1)} unit="%" />
                  <KV label="Densité solution" value={fmt(p.solutionDensity, 0)} unit="kg/m³" />
                  <KV label="Débit spray" value={fmt(p.sprayFlowrate, 1)} unit="l/h" />
                </SubSection>
              </div>
            </Section>

            <Section title="2. Gaz entrant">
              <div style={styles.twoCol}>
                <SubSection title="Débits">
                  <KV label="Débit humide" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="T amont" value={fmt(df.T, 1)} unit="°C" />
                </SubSection>
                <SubSection title="NOx entrant">
                  <KV label="Concentration NOx" value={fmt(d.NOx_concentration_mg_Nm3, 0)} unit="mg/Nm³" />
                  <KV label="Débit sec (real)" value={fmt(d.Qv_sec_m3_h, 0)} unit="m³/h" />
                  <KV label="Débit sec 11% O₂" value={fmt(d.Qv_sec_11pourcent_Nm3_h, 0)} unit="Nm³/h" />
                </SubSection>
              </div>
            </Section>

            <Section title="3. Résultats de réduction NOx">
              <div style={styles.twoCol}>
                <SubSection title="Quantités molaires">
                  <KV label="NH₃ injecté" value={fmt(d.Quantite_NH3_mol_h, 0)} unit="mol/h" />
                  <KV label="NO à éliminer" value={fmt(d.Quantite_NO_a_eliminer_mol_h, 0)} unit="mol/h" />
                  <KV label="NOx éliminable" value={fmt(d.Quantite_NOx_eliminable_kg_h, 2)} unit="kg/h" />
                </SubSection>
                <SubSection title="Consommation réactif">
                  <KV label="Conso. stœchio." value={fmt(d.Conso_stoechio_reactif_kg_h, 2)} unit="kg/h" />
                </SubSection>
              </div>
            </Section>

            <Section title="4. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'NOx cible [mg/Nm³]', val: fmt(p.targetNOx, 0), color: '#e74c3c' },
                  { label: 'NOx mesuré [mg/Nm³]', val: fmt(d.NOx_concentration_mg_Nm3, 0), color: '#f39c12' },
                  { label: 'NH₃ injecté [mol/h]', val: fmt(d.Quantite_NH3_mol_h, 0), color: '#4a90e2' },
                  { label: 'Conso réactif [kg/h]', val: fmt(d.Conso_stoechio_reactif_kg_h, 2), color: '#2ecc71' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ ...styles.tag, borderLeft: `4px solid ${color}` }}>
                    <span style={styles.tagLabel}>{label}</span>
                    <span style={{ ...styles.tagValue, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div style={styles.footer}>Rapport généré automatiquement — {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '20px' },
  modal: { background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 1100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#1a3a6b', flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: 17, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: '7px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13, background: '#c0392b', color: '#fff' },
  scrollArea: { flex: 1, overflowY: 'auto', background: '#f0f2f5', padding: '20px' },
  reportContent: { background: '#fff', maxWidth: 1000, margin: '0 auto', padding: '20px 24px', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222' },
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
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 14px' },
  tag: { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 },
  tagLabel: { fontSize: 10, color: '#555' },
  tagValue: { fontSize: 15, fontWeight: 'bold', color: '#1a3a6b' },
  footer: { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default DENOX_Retro_Rapport;
