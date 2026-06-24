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

const GasTable = ({ df }) => {
  const rows = [
    { name: 'CO₂', nm3h: df.Qv_CO2_Nm3_h, kgh: df.Qm_CO2_kg_h, hkj: df.H_CO2_kj, pctWet: df.CO2_humide_pourcent, pctDry: df.CO2_dry_pourcent },
    { name: 'H₂O', nm3h: df.Qv_H2O_Nm3_h, kgh: df.Qm_H2O_kg_h, hkj: df.H_H2O_kj, pctWet: df.H2O_pourcent, pctDry: undefined },
    { name: 'O₂',  nm3h: df.Qv_O2_Nm3_h,  kgh: df.Qm_O2_kg_h,  hkj: df.H_O2_kj,  pctWet: df.O2_humide_pourcent, pctDry: df.O2_dry_pourcent },
    { name: 'N₂',  nm3h: df.Qv_N2_Nm3_h,  kgh: df.Qm_N2_kg_h,  hkj: df.H_N2_kj,  pctWet: df.N2_humide_pourcent, pctDry: undefined },
  ];
  const totNm3h = rows.reduce((s, r) => s + (parseFloat(r.nm3h) || 0), 0);
  const totKgh  = rows.reduce((s, r) => s + (parseFloat(r.kgh)  || 0), 0);
  const totHkj  = rows.reduce((s, r) => s + (parseFloat(r.hkj)  || 0), 0);
  return (
    <table style={styles.table}>
      <thead><tr>
        <th style={styles.th}>Composant</th><th style={styles.th}>Nm³/h</th><th style={styles.th}>kg/h</th>
        <th style={styles.th}>Enthalpie [kJ/h]</th><th style={styles.th}>% vol (humide)</th><th style={styles.th}>% vol (sec)</th>
      </tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td style={styles.tdLabel}>{r.name}</td>
            <td style={styles.td}>{fmt(r.nm3h, 0)}</td><td style={styles.td}>{fmt(r.kgh, 0)}</td>
            <td style={styles.td}>{fmt(r.hkj, 0)}</td>
            <td style={styles.td}>{r.pctWet !== undefined ? fmt(r.pctWet, 2) : '—'}</td>
            <td style={styles.td}>{r.pctDry !== undefined ? fmt(r.pctDry, 2) : '—'}</td>
          </tr>
        ))}
        <tr style={{ fontWeight: 'bold', background: '#eaf0fb' }}>
          <td style={styles.tdLabel}>Total</td><td style={styles.td}>{fmt(totNm3h, 0)}</td>
          <td style={styles.td}>{fmt(totKgh, 0)}</td><td style={styles.td}>{fmt(totHkj, 0)}</td>
          <td style={styles.td}>—</td><td style={styles.td}>—</td>
        </tr>
      </tbody>
    </table>
  );
};

export default function ELECTROFILTER_Retro_Rapport({ calculationResult, inputParams, onClose }) {
  const df = calculationResult?.dataFlow || {};
  const de = calculationResult?.dataELECTROFILTER || {};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Électrofiltre (ELECTROFILTER) — Rapport Rétro</h1>
          <button style={styles.closeBtn} onClick={onClose}>✕ Fermer</button>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <div style={styles.mainTitle}>Électrofiltre (ELECTROFILTER)</div>

            {/* Section 1 — Synthèse */}
            <Section title="1. Synthèse">
              <div style={styles.tagRow}>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>T entrée (amont)</span>
                  <span style={styles.tagValue}>{fmt(df.T, 1)} °C</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>T sortie (aval)</span>
                  <span style={styles.tagValue}>{fmt(df.T_in, 1)} °C</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>Débit humide</span>
                  <span style={styles.tagValue}>{fmt(df.Qv_wet_Nm3_h, 0)} Nm³/h</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>Débit sec</span>
                  <span style={styles.tagValue}>{fmt(df.Qv_sec_Nm3_h, 0)} Nm³/h</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>Débit massique</span>
                  <span style={styles.tagValue}>{fmt(df.Qm_tot_kg_h, 0)} kg/h</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>Air parasite</span>
                  <span style={styles.tagValue}>{fmt(de.Qair_parasite, 0)} Nm³/h</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>Puissance</span>
                  <span style={styles.tagValue}>{fmt(df.H_tot_kW, 1)} kW</span>
                </div>
                <div style={styles.tag}>
                  <span style={styles.tagLabel}>O₂ sec</span>
                  <span style={styles.tagValue}>{fmt(df.O2_dry_pourcent, 2)} %</span>
                </div>
              </div>
            </Section>

            {/* Section 2 — Fumées en entrée */}
            <Section title="2. Fumées en entrée (côté amont ELECTROFILTER)">
              <SubSection>
                <GasTable df={df} />
              </SubSection>
              <SubSection>
                <div style={styles.twoCol}>
                  <div>
                    <KV label="T entrée fumées" value={fmt(df.T, 1)} unit="°C" />
                    <KV label="T sortie fumées (aval)" value={fmt(df.T_in, 1)} unit="°C" />
                    <KV label="Pression sortie" value={fmt(df.P_mmCE, 1)} unit="mmCE" />
                  </div>
                  <div>
                    <KV label="Débit humide" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                    <KV label="Débit sec" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                    <KV label="Débit massique total" value={fmt(df.Qm_tot_kg_h, 0)} unit="kg/h" />
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Section 3 — Enthalpies */}
            <Section title="3. Bilan enthalpique">
              <SubSection>
                <div style={styles.twoCol}>
                  <div>
                    <KV label="H CO₂" value={fmt(df.H_CO2_kj, 0)} unit="kJ/h" />
                    <KV label="H H₂O" value={fmt(df.H_H2O_kj, 0)} unit="kJ/h" />
                    <KV label="H O₂"  value={fmt(df.H_O2_kj, 0)}  unit="kJ/h" />
                    <KV label="H N₂"  value={fmt(df.H_N2_kj, 0)}  unit="kJ/h" />
                  </div>
                  <div>
                    <KV label="H total" value={fmt(df.H_tot_kj, 0)} unit="kJ/h" />
                    <KV label="Puissance totale" value={fmt(df.H_tot_kW, 2)} unit="kW" />
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Section 4 — Air parasite ELECTROFILTER */}
            <Section title="4. Air parasite (ELECTROFILTER)">
              <SubSection>
                <div style={styles.twoCol}>
                  <div>
                    <KV label="Air parasite (fuite)" value={fmt(de.Qair_parasite, 0)} unit="Nm³/h" />
                    <KV label="Débit air entrant" value={fmt(de.Qv_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                    <KV label="Débit air entrant" value={fmt(de.Qm_air_entrant_kg_h, 0)} unit="kg/h" />
                  </div>
                  <div>
                    <KV label="O₂ air entrant" value={fmt(de.Qv_O2_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                    <KV label="O₂ air entrant" value={fmt(de.Qm_O2_air_entrant_kg_h, 0)} unit="kg/h" />
                    <KV label="N₂ air entrant" value={fmt(de.Qv_N2_air_entrant_Nm3_h, 0)} unit="Nm³/h" />
                    <KV label="N₂ air entrant" value={fmt(de.Qm_N2_air_entrant_kg_h, 0)} unit="kg/h" />
                    <KV label="Pression sortie" value={fmt(df.P_mmCE, 1)} unit="mmCE" />
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Section 5 — Composition % */}
            <Section title="5. Composition volumique des fumées">
              <SubSection>
                <div style={styles.twoCol}>
                  <div>
                    <KV label="O₂ (sec)"     value={fmt(df.O2_dry_pourcent, 2)}     unit="%" />
                    <KV label="O₂ (humide)"  value={fmt(df.O2_humide_pourcent, 2)}  unit="%" />
                    <KV label="CO₂ (sec)"    value={fmt(df.CO2_dry_pourcent, 2)}    unit="%" />
                    <KV label="CO₂ (humide)" value={fmt(df.CO2_humide_pourcent, 2)} unit="%" />
                  </div>
                  <div>
                    <KV label="H₂O (humide)" value={fmt(df.H2O_pourcent, 2)}        unit="%" />
                    <KV label="N₂ (humide)"  value={fmt(df.N2_humide_pourcent, 2)}  unit="%" />
                  </div>
                </div>
              </SubSection>
            </Section>

            <div style={styles.footer}>Rapport généré automatiquement — ELECTROFILTER Retro</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999, display: 'flex', alignItems: 'stretch', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: 1100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', background: '#1a3a6b', flexShrink: 0,
  },
  headerTitle: { margin: 0, fontSize: 17, fontWeight: 'bold', color: '#fff' },
  closeBtn: {
    padding: '7px 14px', border: 'none', borderRadius: 4, cursor: 'pointer',
    fontWeight: 'bold', fontSize: 13, background: '#c0392b', color: '#fff',
  },
  scrollArea: { flex: 1, overflowY: 'auto', background: '#f0f2f5', padding: '20px' },
  reportContent: {
    background: '#fff', maxWidth: 1000, margin: '0 auto',
    padding: '20px 24px', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222',
  },
  mainTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#1a3a6b',
    borderBottom: '3px solid #4a90e2', paddingBottom: 8, marginBottom: 24,
  },
  section: { marginBottom: 28, border: '1px solid #d0daea', borderRadius: 6, overflow: 'hidden' },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#fff',
    background: '#4a90e2', margin: 0, padding: '8px 14px',
  },
  subSection: { padding: '10px 14px' },
  subTitle: {
    fontSize: 13, fontWeight: 'bold', color: '#1a3a6b',
    margin: '0 0 6px 0', borderBottom: '1px solid #e0e8f4', paddingBottom: 3,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  kvRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '3px 0', borderBottom: '1px dotted #e8e8e8',
  },
  kvLabel: { color: '#444', flex: 1 },
  kvValue: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  kvUnit: { fontWeight: 'normal', color: '#666', fontSize: 11 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th: {
    background: '#eaf0fb', border: '1px solid #c5d5ea',
    padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b',
  },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel: {
    border: '1px solid #dde6f0', padding: '3px 8px',
    textAlign: 'left', color: '#333', fontStyle: 'italic',
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 14px' },
  tag: {
    background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4,
    padding: '6px 12px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', minWidth: 140,
  },
  tagLabel: { fontSize: 10, color: '#555' },
  tagValue: { fontSize: 15, fontWeight: 'bold', color: '#1a3a6b' },
  footer: {
    marginTop: 24, textAlign: 'right', fontSize: 11,
    color: '#999', borderTop: '1px solid #eee', paddingTop: 8,
  },
};
