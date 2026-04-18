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

const GasTable = ({ rows }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Composant</th>
        <th style={styles.th}>Nm³/h</th>
        <th style={styles.th}>kg/h</th>
        <th style={styles.th}>% vol (humide)</th>
        <th style={styles.th}>% vol (sec)</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.name}>
          <td style={styles.tdLabel}>{r.name}</td>
          <td style={styles.td}>{fmt(r.nm3h, 0)}</td>
          <td style={styles.td}>{fmt(r.kgh, 0)}</td>
          <td style={styles.td}>{r.pctWet !== undefined ? fmt(r.pctWet, 2) : '—'}</td>
          <td style={styles.td}>{r.pctDry !== undefined ? fmt(r.pctDry, 2) : '—'}</td>
        </tr>
      ))}
      <tr style={{ fontWeight: 'bold', background: '#eaf0fb' }}>
        <td style={styles.tdLabel}>Total</td>
        <td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.nm3h) || 0), 0), 0)}</td>
        <td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.kgh) || 0), 0), 0)}</td>
        <td style={styles.td}>—</td>
        <td style={styles.td}>—</td>
      </tr>
    </tbody>
  </table>
);

const RK_Retro_Rapport = ({ calculationResult, nodeData, inputParams, onClose }) => {
  const r = calculationResult || {};
  const df = r.dataFlow || nodeData?.result?.dataFlow || {};
  const whb = nodeData?.result?.data_Air_WHB || {};
  const p = inputParams || {};

  const isWithWHB = p.bilanType_whb === 'WITH_WHB';
  const isNCV = p.bilanType_NCV_Masse === 'NET_CALORIFIC_VALUE';

  const gasRows = [
    {
      name: 'CO₂',
      nm3h: df.Qv_CO2_Nm3_h,
      kgh: df.Qm_CO2_kg_h,
      pctWet: df.CO2_humide_pourcent,
      pctDry: df.CO2_dry_pourcent,
    },
    {
      name: 'H₂O',
      nm3h: df.Qv_H2O_Nm3_h,
      kgh: df.Qm_H2O_kg_h,
      pctWet: df.H2O_pourcent,
      pctDry: undefined,
    },
    {
      name: 'O₂',
      nm3h: df.Qv_O2_Nm3_h,
      kgh: df.Qm_O2_kg_h,
      pctWet: df.O2_humide_pourcent,
      pctDry: df.O2_dry_pourcent,
    },
    {
      name: 'N₂',
      nm3h: df.Qv_N2_Nm3_h,
      kgh: df.Qm_N2_kg_h,
      pctWet: df.N2_humide_pourcent,
      pctDry: undefined,
    },
  ];

  // NCV en kcal/kg → kJ/kg
  const NCV_kJ_kg = (parseFloat(r.NCV) || 0) * 4.1868;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* En-tête */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            Four à grille / Four tournant — Rapport rétro-calcul
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕ Fermer</button>
        </div>

        {/* Contenu scrollable */}
        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>
              Rapport de synthèse — Mode rétro-calcul RK
            </h1>

            {/* ── Section 1 : Paramètres d'entrée ────────────────────────────── */}
            <Section title="1. Paramètres d'entrée">
              <div style={styles.twoCol}>
                <SubSection title="Conditions de calcul">
                  <KV
                    label="Mode de calcul"
                    value={isWithWHB ? 'Avec chaudière de récupération (WHB)' : 'Sans WHB'}
                  />
                  <KV
                    label="Type de bilan"
                    value={isNCV ? 'Calcul du débit déchets (NCV connu)' : 'Calcul du NCV (débit connu)'}
                  />
                  <KV label="Température de l'air" value={fmt(p.Tair_RK_C, 1)} unit="°C" />
                  <KV label="Pertes thermiques" value={fmt(p.Thermal_losses_MW, 2)} unit="MW" />
                </SubSection>
                <SubSection title="Données d'entrée combustion">
                  {isNCV ? (
                    <KV label="PCI déchet (donné)" value={fmt(p.NCV_kcal_kg, 0)} unit="kcal/kg" />
                  ) : (
                    <KV label="Débit déchets (donné)" value={fmt(p.Masse_dechet_kg_h, 0)} unit="kg/h" />
                  )}
                  {isWithWHB && (
                    <KV
                      label="Énergie récupérée WHB"
                      value={fmt(whb.Energie_recuperee_WHB_kW)}
                      unit="kW"
                    />
                  )}
                </SubSection>
              </div>
            </Section>

            {/* ── Section 2 : Gaz de fumée mesurés ───────────────────────────── */}
            <Section title="2. Gaz de fumée — données de sortie procédé">
              <div style={styles.twoCol}>
                <SubSection title="Débits volumiques">
                  <KV label="Débit humide" value={fmt(df.Qv_wet_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit sec" value={fmt(df.Qv_sec_Nm3_h, 0)} unit="Nm³/h" />
                  <KV label="Débit humide (conditions réelles)" value={fmt(r.Qv_wet_m3_h, 0)} unit="m³/h" />
                  <KV label="Pression" value={fmt(df.P_mmCE, 0)} unit="mmCE" />
                </SubSection>
                <SubSection title="Enthalpie">
                  <KV label="Enthalpie totale sortie" value={fmt(df.H_tot_kW, 0)} unit="kW" />
                  {!isWithWHB && (
                    <KV label="Enthalpie air d'entrée (calculée)" value={fmt(r.H_air_kW, 0)} unit="kW" />
                  )}
                </SubSection>
              </div>
              <SubSection title="Composition des gaz de sortie">
                <GasTable rows={gasRows} />
              </SubSection>
            </Section>

            {/* ── Section 3 : Résultats du rétro-calcul ───────────────────────── */}
            <Section title="3. Résultats du rétro-calcul">
              <div style={styles.twoCol}>
                <SubSection title="Bilan énergétique four">
                  <KV
                    label="Puissance thermique incinérateur"
                    value={fmt(r.P_incinerateur_MWH, 3)}
                    unit="MW"
                  />
                  <KV
                    label="Puissance thermique incinérateur"
                    value={fmt((parseFloat(r.P_incinerateur_MWH) || 0) * 1000, 0)}
                    unit="kW"
                  />
                  <KV label="Pertes thermiques" value={fmt(p.Thermal_losses_MW, 2)} unit="MW" />
                </SubSection>
                <SubSection title="Déchets traités">
                  <KV label="Débit déchets" value={fmt(r.MasseDechet, 0)} unit="kg/h" />
                  <KV
                    label="Débit déchets"
                    value={fmt((parseFloat(r.MasseDechet) || 0) / 1000, 2)}
                    unit="t/h"
                  />
                  <KV label="PCI déchet" value={fmt(r.NCV, 0)} unit="kcal/kg" />
                  <KV label="PCI déchet" value={fmt(NCV_kJ_kg, 0)} unit="kJ/kg" />
                </SubSection>
              </div>
            </Section>

            {/* ── Section 4 : Synthèse ─────────────────────────────────────────── */}
            <Section title="4. Synthèse">
              <div style={styles.tagRow}>
                {[
                  {
                    label: 'Puissance thermique [MW]',
                    val: fmt(r.P_incinerateur_MWH, 3),
                    color: '#e74c3c',
                  },
                  {
                    label: 'Débit déchets [kg/h]',
                    val: fmt(r.MasseDechet, 0),
                    color: '#2ecc71',
                  },
                  {
                    label: 'PCI [kcal/kg]',
                    val: fmt(r.NCV, 0),
                    color: '#f39c12',
                  },
                  {
                    label: 'PCI [kJ/kg]',
                    val: fmt(NCV_kJ_kg, 0),
                    color: '#f39c12',
                  },
                  {
                    label: 'Débit fumées humides [Nm³/h]',
                    val: fmt(df.Qv_wet_Nm3_h, 0),
                    color: '#4a90e2',
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    style={{ ...styles.tag, borderLeft: `4px solid ${color}` }}
                  >
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
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 1100,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: '#1a3a6b',
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    padding: '7px 14px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 13,
    background: '#c0392b',
    color: '#fff',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    background: '#f0f2f5',
    padding: '20px',
  },
  reportContent: {
    background: '#fff',
    maxWidth: 1000,
    margin: '0 auto',
    padding: '20px 24px',
    fontFamily: 'Arial, sans-serif',
    fontSize: 13,
    color: '#222',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a6b',
    borderBottom: '3px solid #4a90e2',
    paddingBottom: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    border: '1px solid #d0daea',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    background: '#4a90e2',
    margin: 0,
    padding: '8px 14px',
  },
  subSection: {
    padding: '10px 14px',
  },
  subTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a3a6b',
    margin: '0 0 6px 0',
    borderBottom: '1px solid #e0e8f4',
    paddingBottom: 3,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
  },
  kvRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    borderBottom: '1px dotted #e8e8e8',
  },
  kvLabel: {
    color: '#444',
    flex: 1,
  },
  kvValue: {
    fontWeight: 'bold',
    color: '#1a3a6b',
    minWidth: 80,
    textAlign: 'right',
  },
  kvUnit: {
    fontWeight: 'normal',
    color: '#666',
    fontSize: 11,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 11,
    marginBottom: 8,
  },
  th: {
    background: '#eaf0fb',
    border: '1px solid #c5d5ea',
    padding: '4px 6px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a3a6b',
  },
  td: {
    border: '1px solid #dde6f0',
    padding: '3px 6px',
    textAlign: 'center',
    color: '#222',
  },
  tdLabel: {
    border: '1px solid #dde6f0',
    padding: '3px 8px',
    textAlign: 'left',
    color: '#333',
    fontStyle: 'italic',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    padding: '10px 14px',
  },
  tag: {
    background: '#f0f5ff',
    border: '1px solid #c5d5ea',
    borderRadius: 4,
    padding: '6px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 140,
  },
  tagLabel: {
    fontSize: 10,
    color: '#555',
  },
  tagValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a3a6b',
  },
  footer: {
    marginTop: 24,
    textAlign: 'right',
    fontSize: 11,
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 8,
  },
};

export default RK_Retro_Rapport;
