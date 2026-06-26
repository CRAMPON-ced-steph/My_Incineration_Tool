import React from 'react';
import { fmt } from '../../A_Transverse_fonction/formatNumber';

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
    { name: 'O₂', nm3h: df.Qv_O2_Nm3_h, kgh: df.Qm_O2_kg_h, hkj: df.H_O2_kj, pctWet: df.O2_humide_pourcent, pctDry: df.O2_dry_pourcent },
    { name: 'N₂', nm3h: df.Qv_N2_Nm3_h, kgh: df.Qm_N2_kg_h, hkj: df.H_N2_kj, pctWet: df.N2_humide_pourcent, pctDry: undefined },
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

const TUBEANDSHELL_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const df = calculationResult?.dataFlow || {};
  const dt = calculationResult?.dataTUBEANDSHELL || {};
  const p  = inputParams || {};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* ── En-tête ────────────────────────────────────────────────────────── */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Échangeur tubes et calandre (TUBEANDSHELL) — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        {/* ── Contenu ────────────────────────────────────────────────────────── */}
        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>
              Rapport de synthèse — Mode rétro-calcul TUBEANDSHELL
            </h1>

            {/* ── Section 1 : Paramètres d'entrée ──────────────────────────── */}
            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Conditions fumées">
                  <KV label="T fumées entrée"        value={fmt(df.T, 1)}              unit="°C" />
                  <KV label="T fumées sortie"         value={fmt(df.T_in, 1)}           unit="°C" />
                  <KV label="T fluide entrée"         value={fmt(p.T_fluide_in, 1)}     unit="°C" />
                  <KV label="T fluide sortie"         value={fmt(p.T_fluide_out, 1)}    unit="°C" />
                  <KV label="PDC fumées"              value={fmt(p.PDC_econo, 0)}       unit="mmCE" />
                </SubSection>
                <SubSection title="Gaz entrant">
                  <KV label="Débit volumique humide" value={fmt(df.Qv_wet_Nm3_h, 0)}  unit="Nm³/h" />
                  <KV label="Débit volumique sec"    value={fmt(df.Qv_sec_Nm3_h, 0)}  unit="Nm³/h" />
                  <KV label="Débit massique total"   value={fmt(df.Qm_tot_kg_h, 0)}   unit="kg/h" />
                </SubSection>
              </div>
            </Section>

            {/* ── Section 2 : Composition calculée ─────────────────────────── */}
            <Section title="2. Composition calculée des fumées">
              <div style={styles.twoCol}>
                <SubSection title="Débits volumiques">
                  <KV label="Débit humide"        value={fmt(df.Qv_wet_Nm3_h, 0)}  unit="Nm³/h" />
                  <KV label="Débit sec"            value={fmt(df.Qv_sec_Nm3_h, 0)}  unit="Nm³/h" />
                  <KV label="Débit humide (réel)"  value={fmt(df.Qv_wet_m3_h, 0)}   unit="m³/h" />
                </SubSection>
                <SubSection title="Composition humide calculée">
                  <KV label="CO₂ humide" value={fmt(df.CO2_humide_pourcent, 2)} unit="%" />
                  <KV label="H₂O"        value={fmt(df.H2O_pourcent, 2)}        unit="%" />
                  <KV label="O₂ humide"  value={fmt(df.O2_humide_pourcent, 2)}  unit="%" />
                  <KV label="N₂ humide"  value={fmt(df.N2_humide_pourcent, 2)}  unit="%" />
                </SubSection>
              </div>
              <SubSection title="Détail par composant">
                <GasTable df={df} />
              </SubSection>
            </Section>

            {/* ── Section 3 : Bilan enthalpique ────────────────────────────── */}
            <Section title="3. Bilan enthalpique">
              <div style={styles.twoCol}>
                <SubSection title="Enthalpies par composant [kJ/h]">
                  <KV label="CO₂"   value={fmt(df.H_CO2_kj, 0)} unit="kJ/h" />
                  <KV label="H₂O"   value={fmt(df.H_H2O_kj, 0)} unit="kJ/h" />
                  <KV label="O₂"    value={fmt(df.H_O2_kj, 0)}  unit="kJ/h" />
                  <KV label="N₂"    value={fmt(df.H_N2_kj, 0)}  unit="kJ/h" />
                  <KV label="Total" value={fmt(df.H_tot_kj, 0)}  unit="kJ/h" />
                </SubSection>
                <SubSection title="Puissance thermique">
                  <KV label="Puissance thermique totale" value={fmt(df.H_tot_kW, 1)}                                       unit="kW" />
                  <KV label="Puissance thermique totale" value={fmt((parseFloat(df.H_tot_kW) || 0) / 1000, 3)}              unit="MW" />
                  <KV label="Débit massique total"       value={fmt(df.Qm_tot_kg_h, 0)}                                     unit="kg/h" />
                </SubSection>
              </div>
            </Section>

            {/* ── Section 4 : Échange thermique ────────────────────────────── */}
            <Section title="4. Échange thermique">
              <div style={styles.twoCol}>
                <SubSection title="Bilan thermique">
                  <KV label="Puissance côté fumées"       value={fmt(dt.Q_FG_kWh, 1)}          unit="kW" />
                  <KV label="Puissance utile côté fluide"  value={fmt(dt.Q_utile_eau_kWh, 1)}   unit="kW" />
                  <KV label="T fluide sortie calculée"    value={fmt(dt.T_fluide_out, 1)}       unit="°C" />
                  <KV label="T moyenne fluide"            value={fmt(dt.T_moyen_eau, 1)}        unit="°C" />
                  <KV label="Débit massique fluide"       value={fmt(dt.m_eau_kg_h, 0)}         unit="kg/h" />
                </SubSection>
                <SubSection title="Dimensionnement">
                  <KV label="DTL moyen (D_TLM)"           value={fmt(dt.D_TLM, 1)}              unit="°C" />
                  <KV label="Surface d'échange"            value={fmt(dt.Surface_m2, 1)}         unit="m²" />
                  <KV label="Pression sortie"              value={fmt(df.P_mmCE, 0)}             unit="mmCE" />
                </SubSection>
              </div>
            </Section>

            {/* ── Section 5 : Synthèse ─────────────────────────────────────── */}
            <Section title="5. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'T entrée [°C]',           val: fmt(df.T, 1),               color: '#e67e22' },
                  { label: 'T sortie [°C]',            val: fmt(df.T_in, 1),            color: '#e74c3c' },
                  { label: 'Débit humide [Nm³/h]',    val: fmt(df.Qv_wet_Nm3_h, 0),   color: '#4a90e2' },
                  { label: 'Débit sec [Nm³/h]',       val: fmt(df.Qv_sec_Nm3_h, 0),   color: '#2980b9' },
                  { label: 'Débit massique [kg/h]',   val: fmt(df.Qm_tot_kg_h, 0),    color: '#2ecc71' },
                  { label: 'Surface [m²]',             val: fmt(dt.Surface_m2, 1),      color: '#8e44ad' },
                  { label: 'Puissance [kW]',          val: fmt(df.H_tot_kW, 1),        color: '#f39c12' },
                  { label: 'O₂ sec [%]',              val: fmt(df.O2_dry_pourcent, 2), color: '#9b59b6' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ ...styles.tag, borderLeft: `4px solid ${color}` }}>
                    <span style={styles.tagLabel}>{label}</span>
                    <span style={{ ...styles.tagValue, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div style={styles.footer}>
              Rapport généré automatiquement — {new Date().toLocaleDateString()}
            </div>
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
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th: { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b' },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel: { border: '1px solid #dde6f0', padding: '3px 8px', textAlign: 'left', color: '#333', fontStyle: 'italic' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 14px' },
  tag: { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 },
  tagLabel: { fontSize: 10, color: '#555' },
  tagValue: { fontSize: 15, fontWeight: 'bold', color: '#1a3a6b' },
  footer: { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default TUBEANDSHELL_Retro_Rapport;
