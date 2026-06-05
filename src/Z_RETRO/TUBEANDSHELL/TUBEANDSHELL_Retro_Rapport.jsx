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

const TUBEANDSHELL_Retro_Rapport = ({ calculationResult, inputParams, onClose }) => {
  const r  = calculationResult || {};
  const df = r.dataFlow || {};
  const d  = r.dataTUBEANDSHELL || {};
  const p  = inputParams || {};

  const fluide = p.fluide || 'eau';
  const isEau  = fluide === 'eau';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Tube &amp; Shell — Rapport rétro-calcul</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>Rapport de synthèse — Mode rétro-calcul Tube &amp; Shell</h1>

            {/* ── 1. Paramètres d'entrée ─────────────────────────────────────── */}
            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Côté fumées">
                  <KV label="T fumées sortie (aval)"  value={fmt(df.T_FG_out ?? p.T_fumee_out_node, 1)} unit="°C" />
                  <KV label="T fumées entrée"          value={fmt(p.T_fumee_in, 1)}                       unit="°C" />
                  <KV label="PDC échangeur"            value={fmt(p.PDC_econo, 0)}                        unit="mmCE" />
                </SubSection>
                <SubSection title={`Côté ${fluide}`}>
                  <KV label={`T entrée ${fluide}`}     value={fmt(p.T_fluide_in, 1)}                      unit="°C" />
                  <KV label={`T sortie ${fluide}`}     value={fmt(d.T_fluide_out, 1)}                     unit="°C" />
                  {isEau
                    ? <KV label="Débit eau"            value={fmt(p.m_eau, 0)}                            unit="kg/h" />
                    : <KV label="Débit air"            value={fmt(p.V_air, 0)}                            unit="Nm³/h" />
                  }
                  <KV label="Rendement échangeur"      value={fmt(p.Rendement, 1)}                        unit="%" />
                  <KV label="Encrassement"             value={fmt(p.Encrassement, 1)}                     unit="%" />
                </SubSection>
              </div>
            </Section>

            {/* ── 2. Gaz entrants ───────────────────────────────────────────── */}
            <Section title="2. Gaz entrants (upstream node)">
              <div style={styles.twoCol}>
                <SubSection title="Débits massiques">
                  <KV label="CO₂"            value={fmt(df.Qm_CO2_kg_h, 0)}  unit="kg/h" />
                  <KV label="H₂O"            value={fmt(df.Qm_H2O_kg_h, 0)}  unit="kg/h" />
                  <KV label="O₂"             value={fmt(df.Qm_O2_kg_h, 0)}   unit="kg/h" />
                  <KV label="N₂"             value={fmt(df.Qm_N2_kg_h, 0)}   unit="kg/h" />
                  <KV label="Total"          value={fmt(df.Qm_tot_kg_h, 0)}  unit="kg/h" />
                </SubSection>
                <SubSection title="Débits volumiques &amp; fractions">
                  <KV label="Débit humide"   value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec"      value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="O₂ sec"         value={fmt(df.O2_dry_pourcent, 2)}   unit="%" />
                  <KV label="O₂ humide"      value={fmt(df.O2_humide_pourcent, 2)} unit="%" />
                  <KV label="CO₂ sec"        value={fmt(df.CO2_dry_pourcent, 2)}  unit="%" />
                  <KV label="H₂O"            value={fmt(df.H2O_pourcent, 2)}      unit="%" />
                </SubSection>
              </div>
            </Section>

            {/* ── 3. Bilan thermique ────────────────────────────────────────── */}
            <Section title="3. Bilan thermique">
              <div style={styles.twoCol}>
                <SubSection title="Côté fumées">
                  <KV label="Enthalpie fumées entrée" value={fmt(df.H_tot_kW, 1)}    unit="kW" />
                  <KV label="Enthalpie CO₂"           value={fmt(df.H_CO2_kj, 0)}    unit="kJ/h" />
                  <KV label="Enthalpie H₂O"           value={fmt(df.H_H2O_kj, 0)}    unit="kJ/h" />
                  <KV label="Enthalpie O₂"            value={fmt(df.H_O2_kj, 0)}     unit="kJ/h" />
                  <KV label="Enthalpie N₂"            value={fmt(df.H_N2_kj, 0)}     unit="kJ/h" />
                  <KV label="Chaleur cédée fumées"    value={fmt(d.Q_FG_kWh, 1)}     unit="kWh" />
                </SubSection>
                <SubSection title={`Côté ${fluide}`}>
                  <KV label="Chaleur utile fluide"    value={fmt(d.Q_utile_eau_kWh, 1)} unit="kWh" />
                  <KV label={`T entrée ${fluide}`}    value={fmt(p.T_fluide_in, 1)}     unit="°C" />
                  <KV label={`T sortie ${fluide}`}    value={fmt(d.T_fluide_out, 1)}    unit="°C" />
                  <KV label="T moyenne fluide"        value={fmt(d.T_moyen_eau, 1)}     unit="°C" />
                  <KV label={isEau ? 'Débit eau' : 'Débit air'}
                              value={fmt(d.m_eau_kg_h, 0)} unit={isEau ? 'kg/h' : 'Nm³/h'} />
                </SubSection>
              </div>
            </Section>

            {/* ── 4. Dimensionnement échangeur ─────────────────────────────── */}
            <Section title="4. Dimensionnement échangeur">
              <div style={styles.twoCol}>
                <SubSection title="Facteurs thermiques">
                  <KV label="ΔT log. moyen"       value={fmt(d.D_TLM, 1)}        unit="°C" />
                  <KV label="Facteur UA"           value={fmt(d.Fact_UA, 3)}      unit="kW/K" />
                  <KV label="Coefficient U liste"  value={fmt(d.Fact_U_list, 0)}  unit="W/(m²·K)" />
                </SubSection>
                <SubSection title="Surface">
                  <KV label="Surface d'échange"   value={fmt(d.Surface_m2, 2)}   unit="m²" />
                  <KV label="PDC échangeur"        value={fmt(p.PDC_econo, 0)}    unit="mmCE" />
                </SubSection>
              </div>
            </Section>

            {/* ── 5. Gaz de sortie propagés ────────────────────────────────── */}
            <Section title="5. Gaz propagés (vers l'amont)">
              <div style={styles.twoCol}>
                <SubSection title="Températures &amp; pression">
                  <KV label="T propagée (= T entrée)"  value={fmt(df.T, 1)}       unit="°C" />
                  <KV label="Pression propagée"        value={fmt(df.P_mmCE, 0)}  unit="mmCE" />
                  <KV label="Débit humide propagé"     value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                </SubSection>
                <SubSection title="Composition inchangée">
                  <KV label="CO₂" value={fmt(df.Qm_CO2_kg_h, 0)} unit="kg/h" />
                  <KV label="H₂O" value={fmt(df.Qm_H2O_kg_h, 0)} unit="kg/h" />
                  <KV label="O₂"  value={fmt(df.Qm_O2_kg_h, 0)}  unit="kg/h" />
                  <KV label="N₂"  value={fmt(df.Qm_N2_kg_h, 0)}  unit="kg/h" />
                </SubSection>
              </div>
            </Section>

            {/* ── 6. Synthèse ──────────────────────────────────────────────── */}
            <Section title="6. Synthèse">
              <div style={styles.tagRow}>
                {[
                  { label: 'Q cédé fumées [kWh]',              val: fmt(d.Q_FG_kWh, 1),        color: '#e74c3c' },
                  { label: `Q utile ${fluide} [kWh]`,          val: fmt(d.Q_utile_eau_kWh, 1), color: '#2ecc71' },
                  { label: `T sortie ${fluide} [°C]`,          val: fmt(d.T_fluide_out, 1),    color: '#4a90e2' },
                  { label: isEau ? 'Débit eau [kg/h]' : 'Débit air [Nm³/h]',
                                                                val: fmt(d.m_eau_kg_h, 0),      color: '#9b59b6' },
                  { label: 'ΔT log. moyen [°C]',               val: fmt(d.D_TLM, 1),           color: '#f39c12' },
                  { label: 'Surface échange [m²]',             val: fmt(d.Surface_m2, 2),      color: '#1abc9c' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ ...styles.tag, borderLeft: `4px solid ${color}` }}>
                    <span style={styles.tagLabel}>{label}</span>
                    <span style={{ ...styles.tagValue, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay:       { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '20px' },
  modal:         { background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 1100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' },
  header:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#1a3a6b', flexShrink: 0 },
  headerTitle:   { margin: 0, fontSize: 17, fontWeight: 'bold', color: '#fff' },
  closeBtn:      { padding: '7px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13, background: '#c0392b', color: '#fff' },
  scrollArea:    { flex: 1, overflowY: 'auto', background: '#f0f2f5', padding: '20px' },
  reportContent: { background: '#fff', maxWidth: 1000, margin: '0 auto', padding: '20px 24px', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222' },
  mainTitle:     { fontSize: 20, fontWeight: 'bold', color: '#1a3a6b', borderBottom: '3px solid #4a90e2', paddingBottom: 8, marginBottom: 24 },
  section:       { marginBottom: 28, border: '1px solid #d0daea', borderRadius: 6, overflow: 'hidden' },
  sectionTitle:  { fontSize: 15, fontWeight: 'bold', color: '#fff', background: '#4a90e2', margin: 0, padding: '8px 14px' },
  subSection:    { padding: '10px 14px' },
  subTitle:      { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b', margin: '0 0 6px 0', borderBottom: '1px solid #e0e8f4', paddingBottom: 3 },
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  kvRow:         { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel:       { color: '#444', flex: 1 },
  kvValue:       { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  kvUnit:        { fontWeight: 'normal', color: '#666', fontSize: 11 },
  tagRow:        { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 14px' },
  tag:           { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 },
  tagLabel:      { fontSize: 10, color: '#555' },
  tagValue:      { fontSize: 15, fontWeight: 'bold', color: '#1a3a6b' },
};

export default TUBEANDSHELL_Retro_Rapport;
