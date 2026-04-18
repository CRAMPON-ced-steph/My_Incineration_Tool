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

const SCRUBBER_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const r = calculationResult || {};
  const df = r.dataFlow || {};
  const p = inputParams || {};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Laveur de gaz — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>Rapport de synthèse — Mode rétro-calcul SCRUBBER</h1>

            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Conditions">
                  <KV label="Mode de calcul" value={p.bilanType || '—'} />
                  <KV label="T eau injectée" value={fmt(p.Teau, 1)} unit="°C" />
                  <KV label="T fumées amont" value={fmt(p.T_amont_SCRUBBER, 1)} unit="°C" />
                  <KV label="PDC aérodynamique" value={fmt(p.PDC_aero, 0)} unit="mmCE" />
                </SubSection>
                <SubSection title="Gaz entrant">
                  <KV label="Débit humide" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="T amont" value={fmt(df.T, 1)} unit="°C" />
                </SubSection>
              </div>
            </Section>

            <Section title="2. Gaz de sortie">
              <div style={styles.twoCol}>
                <SubSection title="Débits">
                  <KV label="Débit humide sortie" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec sortie" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit massique" value={fmt(df.Qm_tot_kg_h, 0)} unit="kg/h" />
                </SubSection>
                <SubSection title="Composition">
                  <KV label="O₂ sec" value={fmt(df.O2_dry_pourcent, 2)} unit="%" />
                  <KV label="CO₂ sec" value={fmt(df.CO2_dry_pourcent, 2)} unit="%" />
                  <KV label="H₂O" value={fmt(df.H2O_pourcent, 2)} unit="%" />
                </SubSection>
              </div>
            </Section>

            <Section title="3. Conditions de sortie">
              <div style={styles.twoCol}>
                <SubSection title="Thermique">
                  <KV label="Température sortie" value={fmt(df.T, 1)} unit="°C" />
                  <KV label="Enthalpie totale" value={fmt(df.H_tot_kW, 0)} unit="kW" />
                </SubSection>
                <SubSection title="Pression">
                  <KV label="Pression sortie" value={fmt(df.P_mmCE, 0)} unit="mmCE" />
                </SubSection>
              </div>
            </Section>

            <Section title="4. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'Débit humide [Nm³/h]', val: fmt(df.Qv_wet_Nm3_h, 0), color: '#4a90e2' },
                  { label: 'T sortie [°C]', val: fmt(df.T, 1), color: '#e74c3c' },
                  { label: 'Enthalpie [kW]', val: fmt(df.H_tot_kW, 0), color: '#2ecc71' },
                  { label: 'PDC [mmCE]', val: fmt(p.PDC_aero, 0), color: '#f39c12' },
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

export default SCRUBBER_Retro_Rapport;
