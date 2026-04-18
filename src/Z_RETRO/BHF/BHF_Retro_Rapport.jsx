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

const BHF_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const r = calculationResult || {};
  const df = r.dataFlow || {};
  const d = r.dataBHF || {};
  const p = inputParams || {};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Filtre à manches — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>Rapport de synthèse — Mode rétro-calcul BHF</h1>

            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Conditions amont">
                  <KV label="T fumées amont" value={fmt(p.T_amont_BHF, 1)} unit="°C" />
                  <KV label="T air décolmatage" value={fmt(p.T_air_decolmatation, 1)} unit="°C" />
                  <KV label="Q air décolmatage" value={fmt(p.Qair_decolmatation, 0)} unit="m³/h" />
                  <KV label="PDC aérodynamique" value={fmt(p.PDC_aero, 0)} unit="mmCE" />
                </SubSection>
                <SubSection title="Gaz entrant (upstream)">
                  <KV label="Débit humide amont" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec amont" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Température amont" value={fmt(df.T, 1)} unit="°C" />
                </SubSection>
              </div>
            </Section>

            <Section title="2. Air de décolmatage">
              <div style={styles.twoCol}>
                <SubSection title="Débits">
                  <KV label="Q air entrant" value={fmt(d.Qv_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Q air entrant" value={fmt(d.Qm_air_entrant_kg_h, 0)} unit="kg/h" />
                  <KV label="Q air parasite" value={fmt(d.Qair_parasite, 0)} unit="Nm³/h" />
                </SubSection>
                <SubSection title="Composition air">
                  <KV label="Q O₂ air entrant" value={fmt(d.Qm_O2_air_entrant_kg_h, 0)} unit="kg/h" />
                  <KV label="Q N₂ air entrant" value={fmt(d.Qm_N2_air_entrant_kg_h, 0)} unit="kg/h" />
                  <KV label="Q O₂ (vol)" value={fmt(d.Qv_O2_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Q N₂ (vol)" value={fmt(d.Qv_N2_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                </SubSection>
              </div>
            </Section>

            <Section title="3. Gaz de sortie">
              <div style={styles.twoCol}>
                <SubSection title="Débits sortie">
                  <KV label="Débit humide sortie" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec sortie" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Pression sortie" value={fmt(d.PDC_aero, 0)} unit="mmCE" />
                </SubSection>
                <SubSection title="Température">
                  <KV label="Température sortie" value={fmt(df.T, 1)} unit="°C" />
                </SubSection>
              </div>
            </Section>

            <Section title="4. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'Q air décolmatage [Nm³/h]', val: fmt(d.Qv_air_entrant_Nm3_h, 0), color: '#4a90e2' },
                  { label: 'Q air parasite [Nm³/h]', val: fmt(d.Qair_parasite, 0), color: '#e74c3c' },
                  { label: 'PDC aéro [mmCE]', val: fmt(d.PDC_aero, 0), color: '#2ecc71' },
                  { label: 'T amont [°C]', val: fmt(df.T, 1), color: '#f39c12' },
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

export default BHF_Retro_Rapport;
