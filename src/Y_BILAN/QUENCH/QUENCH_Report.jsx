import React from 'react';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { makeReportT } from '../../D_BILAN_Rapports/report_traduction';
import { translations } from './QUENCH_traduction';
import { qdTranslations } from './QUENCH_Design_traduction';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import OpexRapport from '../../D_BILAN_Rapports/OpexRapport';
const Section = ({ title, children }) => <div style={styles.section}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>;
const SubSection = ({ title, children }) => <div style={styles.subSection}>{title && <h3 style={styles.subTitle}>{title}</h3>}{children}</div>;
const KV = ({ label, value, unit = '' }) => <div style={styles.kvRow}><span style={styles.kvLabel}>{label}</span><span style={styles.kvValue}>{value}{unit ? <span style={styles.kvUnit}> {unit}</span> : null}</span></div>;

const GasTable = ({ data = {}, t = (k) => k, gases = ['CO2', 'H2O', 'O2', 'N2'] }) => {
  return (
    <table style={styles.table}>
      <thead><tr><th style={styles.th}></th>{gases.map(g => <th key={g} style={styles.th}>{g}</th>)}<th style={styles.th}>{t("total")}</th></tr></thead>
      <tbody>{Object.entries(data).map(([lbl, d]) => { const tot = gases.reduce((s, g) => s + (parseFloat(d[g]) || 0), 0); return <tr key={lbl}><td style={styles.tdLabel}>{lbl}</td>{gases.map(g => <td key={g} style={styles.td}>{fmt(d[g])}</td>)}<td style={{ ...styles.td, fontWeight: 'bold' }}>{fmt(tot)}</td></tr>; })}</tbody>
    </table>
  );
};

const PollutantTable = ({ masses = {} }) => {
  const keys = Object.keys(masses).filter(k => masses[k] !== undefined);
  return <table style={styles.table}><thead><tr>{keys.map(k => <th key={k} style={styles.th}>{k}</th>)}</tr></thead><tbody><tr>{keys.map(k => <td key={k} style={styles.td}>{fmt(masses[k], 4)}</td>)}</tr></tbody></table>;
};

const ElecTable = ({ rows, t }) => (
  <table style={styles.table}>
    <thead><tr><th style={styles.th}>{t('Consommateur')}</th><th style={styles.th}>kW</th></tr></thead>
    <tbody>
      {rows.map(r => <tr key={r.label}><td style={styles.tdLabel}>{r.label}</td><td style={styles.td}>{fmt(r.value)}</td></tr>)}
      <tr style={{ background: '#eaf0fb', fontWeight: 'bold' }}><td style={styles.tdLabel}>{t('Total')}</td><td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0))}</td></tr>
    </tbody>
  </table>
);

const QUENCH_Report = ({ innerData = {}, currentLanguage = 'fr', nodeId }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const tr = makeReportT(currentLanguage);
  const t = (key) =>
    qdTranslations[languageCode]?.[key] ||
    qdTranslations['fr']?.[key] ||
    translations[languageCode]?.[key] ||
    translations['fr']?.[key] ||
    key;

  const T_OUT = innerData.T_OUT || 0;
  const O2_calcule = innerData.O2_calcule || 0;
  const FG_OUT_kg_h = innerData.FG_OUT_kg_h || {};
  const _nm3Computed = { CO2: CO2_kg_m3(FG_OUT_kg_h.CO2||0), H2O: H2O_kg_m3(FG_OUT_kg_h.H2O||0), O2: O2_kg_m3(FG_OUT_kg_h.O2||0), N2: N2_kg_m3(FG_OUT_kg_h.N2||0) };
  _nm3Computed.dry = _nm3Computed.CO2 + _nm3Computed.O2 + _nm3Computed.N2;
  _nm3Computed.wet = _nm3Computed.dry + _nm3Computed.H2O;
  const FG_OUT_Nm3_h = innerData.FG_QUENCH_OUT_Nm3_h || innerData.FG_OUT_Nm3_h || innerData.FG_RK_OUT_Nm3_h || _nm3Computed;
  const FG_wet_total = (FG_OUT_kg_h.CO2 || 0) + (FG_OUT_kg_h.H2O || 0) + (FG_OUT_kg_h.O2 || 0) + (FG_OUT_kg_h.N2 || 0);
  const PInput = innerData.PInput || {};
  const Poutput = innerData.Poutput || {};
  const Residus = innerData.Residus || {};
  const elecRows = [1,2,3,4,5,6,7,8].map(i => ({ label: innerData[`labelElec${i}`] || `Poste ${i}`, value: innerData[`consoElec${i}`] })).filter(r => parseFloat(r.value) > 0);
  const waterConsumption = [
    { label: t('Eau potable [m³/h]'), value: innerData.Conso_EauPotable_m3 },
    { label: t('Eau de refroidissement [m³/h]'), value: innerData.Conso_EauRefroidissement_m3 },
    { label: t('Eau déminéralisée [m³/h]'), value: innerData.Conso_EauDemin_m3 },
  ].filter(r => parseFloat(r.value) > 0);
  const reactifConsumption = [
    { label: t('CaO [kg/h]'), value: innerData.Conso_CaO_kg },
    { label: t('Ca(OH)₂ sec [kg/h]'), value: innerData.Conso_CaOH2_dry_kg },
    { label: t('NaHCO₃ [kg/h]'), value: innerData.Conso_NaOHCO3_kg },
    { label: t('CAP [kg/h]'), value: innerData.Conso_CAP_kg },
  ].filter(r => parseFloat(r.value) > 0);

  // Dimensionnement de l'onglet Design (quench sans saturation)
  const QDd = innerData.QUENCH_design || null;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>{t('Quench — Rapport de synthèse')}</h1>

      <Section title={t('1. Gaz de combustion')}>
        <div style={styles.twoCol}>
          <SubSection>
            <KV label={t('Température de sortie')} value={fmt(T_OUT, 0)} unit="°C" />
            <KV label={t('O₂ mesuré (sec)')} value={fmt(O2_calcule)} unit="%" />
            <KV label={t('Débit humide total [kg/h]')} value={fmt(FG_wet_total)} />
            <KV label={t('Débit sec [Nm³/h]')} value={fmt(FG_OUT_Nm3_h.dry, 0)} />
            <KV label={t('Débit humide [Nm³/h]')} value={fmt(FG_OUT_Nm3_h.wet, 0)} />
          </SubSection>
          <SubSection title={t('Composition gaz de sortie')}>
            <GasTable data={{ 'kg/h': FG_OUT_kg_h, 'Nm³/h': { CO2: FG_OUT_Nm3_h.CO2, H2O: FG_OUT_Nm3_h.H2O, O2: FG_OUT_Nm3_h.O2, N2: FG_OUT_Nm3_h.N2 } }} t={tr} />
          </SubSection>
        </div>
      </Section>

      <Section title={t('2. Émissions polluantes')}>
        <SubSection title={t('Gaz en entrée [kg/h]')}><PollutantTable masses={PInput} /></SubSection>
        <SubSection title={t('Gaz en sortie [kg/h]')}><PollutantTable masses={Poutput} /></SubSection>
        <div style={styles.twoCol}>
          <SubSection title={t('Résidus calculés')}>
            <KV label={t('Cendres lourdes sèches [kg/h]')} value={fmt(Residus.DryBottomAsh_kg_h)} />
            <KV label={t('Cendres volantes [kg/h]')} value={fmt(Residus.FlyAsh_kg_h)} />
          </SubSection>
          {reactifConsumption.length > 0 && <SubSection title={t('Consommation réactifs')}>{reactifConsumption.map(({ label, value }) => <KV key={label} label={label} value={fmt(value, 3)} />)}</SubSection>}
        </div>
      </Section>

      <Section title={t('3. Design')}>
        {QDd && (
          <div style={styles.twoCol}>
            <SubSection title={t('Dimensionnement du Quench')}>
              <KV label={t('Quench diameter [m]')} value={fmt(innerData.Quench_diameter_std, 2)} unit="m" />
              <KV label={t('QD_vitesse_colonne')} value={fmt(QDd.vitesse, 2)} unit="m/s" />
              <KV label={t('QD_vitesse_cone')} value={fmt(QDd.vPassage, 2)} unit="m/s" />
              <KV label={t('QD_diam_cone_retenu')} value={fmt(QDd.diamCone, 0)} unit="mm" />
              <KV label={t('QD_pventuri')} value={fmt(QDd.pVenturi, 1)} unit="mmCE" />
            </SubSection>
            <SubSection title={t('QD_section_eau')}>
              <KV label={t('Temperature inlet QUENCH [°C]')} value={fmt(QDd.T_IN, 1)} />
              <KV label={t('QD_temp_sortie')} value={fmt(QDd.T_OUT, 1)} unit="°C" />
              <KV label={t('Sprayed/cooling water [kg/h]')} value={fmt(QDd.Q_eau_kg_h, 0)} />
              <KV label={t('QD_debit_reel_sortie')} value={fmt(QDd.debReelOut, 0)} unit="m³/h" />
              <KV label={t('QD_ro_sortie')} value={fmt(QDd.roSortie, 3)} unit="kg/m³" />
            </SubSection>
          </div>
        )}
        <div style={styles.twoCol}>
          <SubSection title={t('Consommations électriques')}>
            {elecRows.length > 0 ? <ElecTable rows={elecRows} t={t} /> : <span style={{ color: '#999', fontSize: 12 }}>{t('Données non disponibles (ouvrir l\'onglet Design)')}</span>}
          </SubSection>
          <div>
            {waterConsumption.length > 0 && <SubSection title={t('Consommation d\'eau')}>{waterConsumption.map(({ label, value }) => <KV key={label} label={label} value={fmt(value, 3)} />)}</SubSection>}
            <SubSection title={t('Énergie auxiliaire')}>
              <KV label={t('Gaz haute valeur [MW]')} value={fmt(innerData.conso_gaz_H_MW)} />
              <KV label={t('Air comprimé [Nm³/h]')} value={fmt(innerData.conso_air_co_N_m3)} />
            </SubSection>
          </div>
        </div>
      </Section>

      <Section title={t('4. OPEX — Coûts horaires')}><OpexRapport innerData={innerData} equipmentType="QUENCH" nodeId={nodeId} currentLanguage={currentLanguage} /></Section>
      <div style={styles.footer}>{t('Rapport généré automatiquement')} — {new Date().toLocaleDateString()}</div>
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

export default QUENCH_Report;
