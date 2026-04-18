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

const WHB_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const r = calculationResult || {};
  const df = r.dataFlow || {};
  const air = r.data_Air_WHB || {};
  const vap = r.data_vapeur_WHB || {};
  const eau = r.data_eau_alim_WHB || {};
  const p = inputParams || {};

  const isSuperheated = (p.bilanTypeVapeur || air.bilanTypeVapeur) === 'SUPERHEATED_STEAM';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Chaudière de récupération — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>Rapport de synthèse — Mode rétro-calcul WHB</h1>

            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Vapeur et eau">
                  <KV label="Type vapeur" value={isSuperheated ? 'Vapeur surchauffée' : 'Vapeur saturée'} />
                  <KV label="Pression vapeur" value={fmt(p.P_vapeur_bar, 1)} unit="bar" />
                  {isSuperheated && <KV label="T vapeur surchauffée" value={fmt(p.T_vapeur_surchauffee_C, 1)} unit="°C" />}
                  <KV label="T eau alimentation" value={fmt(p.T_eau_alimentation_C, 1)} unit="°C" />
                  <KV label="Purge" value={fmt(p.Q_eau_purge_pourcent, 1)} unit="%" />
                </SubSection>
                <SubSection title="Conditions calcul">
                  <KV label="Type bilan" value={p.bilanType || '—'} />
                  <KV label="Type bilan air" value={p.bilanTypeAir || '—'} />
                  <KV label="T amont WHB" value={fmt(p.T_amont_WHB_C, 1)} unit="°C" />
                  <KV label="T air extérieur" value={fmt(p.T_air_exterieur_C, 1)} unit="°C" />
                  <KV label="Pertes thermiques" value={fmt(p.P_th_pourcent, 1)} unit="%" />
                </SubSection>
              </div>
            </Section>

            <Section title="2. Résultats vapeur">
              <div style={styles.twoCol}>
                <SubSection title="Production vapeur">
                  <KV label="T vapeur saturée" value={fmt(vap.Tvap_saturee, 1)} unit="°C" />
                  {isSuperheated && <KV label="T vapeur surchauffée" value={fmt(vap.Tvap_surchauffee, 1)} unit="°C" />}
                  <KV label="Q vapeur produite" value={fmt(vap.Q_vapeur_calculee_kg_h, 0)} unit="kg/h" />
                  <KV label="Enthalpie vapeur" value={fmt(vap.H_vapeur, 0)} unit="kJ/kg" />
                </SubSection>
                <SubSection title="Énergie récupérée">
                  <KV label="Énergie récupérée WHB" value={fmt(air.Energie_recuperee_WHB_kW, 0)} unit="kW" />
                  <KV label="T aval WHB" value={fmt(air.Taval_WHB, 1)} unit="°C" />
                </SubSection>
              </div>
            </Section>

            <Section title="3. Eau d'alimentation">
              <div style={styles.twoCol}>
                <SubSection title="Alimentation">
                  <KV label="T eau alimentation" value={fmt(eau.Teau_alim, 1)} unit="°C" />
                  <KV label="Q eau alimentation" value={fmt(eau.Q_eau_alimentation_kg_h, 0)} unit="kg/h" />
                </SubSection>
                <SubSection title="Enthalpie">
                  <KV label="H eau alimentation" value={fmt(eau.H_eau_alimentation_kj, 0)} unit="kJ/kg" />
                  <KV label="H eau alimentation" value={fmt(eau.H_eau_alimentation_kW, 0)} unit="kW" />
                </SubSection>
              </div>
            </Section>

            <Section title="4. Gaz de sortie">
              <div style={styles.twoCol}>
                <SubSection title="Débits">
                  <KV label="Débit humide" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                </SubSection>
                <SubSection title="Conditions sortie">
                  <KV label="T aval WHB" value={fmt(air.Taval_WHB, 1)} unit="°C" />
                  <KV label="Pression sortie" value={fmt(df.P_mmCE, 0)} unit="mmCE" />
                </SubSection>
              </div>
            </Section>

            <Section title="5. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'Énergie récupérée [kW]', val: fmt(air.Energie_recuperee_WHB_kW, 0), color: '#e74c3c' },
                  { label: 'Q vapeur [kg/h]', val: fmt(vap.Q_vapeur_calculee_kg_h, 0), color: '#4a90e2' },
                  { label: 'T aval [°C]', val: fmt(air.Taval_WHB, 1), color: '#f39c12' },
                  { label: 'P vapeur [bar]', val: fmt(p.P_vapeur_bar, 1), color: '#2ecc71' },
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

export default WHB_Retro_Rapport;
