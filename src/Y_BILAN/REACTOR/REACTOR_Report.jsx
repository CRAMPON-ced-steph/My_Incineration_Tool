import React from 'react';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { makeReportT } from '../../D_BILAN_Rapports/report_traduction';
import { translations } from './REACTOR_traduction';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import OpexRapport from '../../D_BILAN_Rapports/OpexRapport';
const Section = ({ title, children }) => <div style={styles.section}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>;
const SubSection = ({ title, children }) => <div style={styles.subSection}>{title && <h3 style={styles.subTitle}>{title}</h3>}{children}</div>;
const KV = ({ label, value, unit = '' }) => <div style={styles.kvRow}><span style={styles.kvLabel}>{label}</span><span style={styles.kvValue}>{value}{unit ? <span style={styles.kvUnit}> {unit}</span> : null}</span></div>;

const GasTable = ({ data = {}, t = (k) => k }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2'];
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
    <thead><tr><th style={styles.th}>{t('rpt_consommateur')}</th><th style={styles.th}>kW</th></tr></thead>
    <tbody>
      {rows.map(r => <tr key={r.label}><td style={styles.tdLabel}>{r.label}</td><td style={styles.td}>{fmt(r.value)}</td></tr>)}
      <tr style={{ background: '#eaf0fb', fontWeight: 'bold' }}><td style={styles.tdLabel}>{t('rpt_total')}</td><td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0))}</td></tr>
    </tbody>
  </table>
);

const REACTOR_Report = ({ innerData = {}, currentLanguage = 'fr', nodeId }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const tr = makeReportT(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  const T_OUT = innerData.T_OUT || 0;
  const O2_calcule = innerData.O2_calcule || 0;
  const FG_OUT_kg_h = innerData.FG_OUT_kg_h || {};
  const _nm3Computed = { CO2: CO2_kg_m3(FG_OUT_kg_h.CO2||0), H2O: H2O_kg_m3(FG_OUT_kg_h.H2O||0), O2: O2_kg_m3(FG_OUT_kg_h.O2||0), N2: N2_kg_m3(FG_OUT_kg_h.N2||0) };
  _nm3Computed.dry = _nm3Computed.CO2 + _nm3Computed.O2 + _nm3Computed.N2;
  _nm3Computed.wet = _nm3Computed.dry + _nm3Computed.H2O;
  const FG_OUT_Nm3_h = innerData.FG_REACTOR_OUT_Nm3_h || innerData.FG_OUT_Nm3_h || innerData.FG_RK_OUT_Nm3_h || _nm3Computed;
  const FG_wet_total = (FG_OUT_kg_h.CO2 || 0) + (FG_OUT_kg_h.H2O || 0) + (FG_OUT_kg_h.O2 || 0) + (FG_OUT_kg_h.N2 || 0);
  const PInput = innerData.PInput || {};
  const Poutput = innerData.Poutput || {};
  const Residus = innerData.Residus || {};
  const elecRows = [1,2,3,4,5,6,7,8].map(i => ({ label: innerData[`labelElec${i}`] || `Poste ${i}`, value: innerData[`consoElec${i}`] })).filter(r => parseFloat(r.value) > 0);
  const waterConsumption = [
    { label: t('rpt_eau_potable'), value: innerData.Conso_EauPotable_m3 },
    { label: t('rpt_eau_demineralisee'), value: innerData.Conso_EauDemin_m3 },
  ].filter(r => parseFloat(r.value) > 0);
  const reactifConsumption = [
    { label: t('rpt_caoh2_sec'), value: innerData.Conso_CaOH2_dry_kg },
    { label: t('rpt_nahco3'), value: innerData.Conso_NaOHCO3_kg },
    { label: t('rpt_nh3'), value: innerData.Conso_Ammonia_kg },
    { label: t('rpt_cap'), value: innerData.Conso_CAP_kg },
  ].filter(r => parseFloat(r.value) > 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>{t('rpt_reactor_title')}</h1>

      <Section title={t('rpt_section_combustion')}>
        <div style={styles.twoCol}>
          <SubSection>
            <KV label={t('rpt_temp_sortie')} value={fmt(T_OUT, 0)} unit="°C" />
            <KV label={t('rpt_o2_mesure_sec')} value={fmt(O2_calcule)} unit="%" />
            <KV label={t('rpt_debit_humide_total')} value={fmt(FG_wet_total)} />
            <KV label={t('rpt_debit_sec')} value={fmt(FG_OUT_Nm3_h.dry, 0)} />
            <KV label={t('rpt_debit_humide')} value={fmt(FG_OUT_Nm3_h.wet, 0)} />
          </SubSection>
          <SubSection title={t('rpt_composition_gaz_sortie')}>
            <GasTable data={{ 'kg/h': FG_OUT_kg_h, 'Nm³/h': { CO2: FG_OUT_Nm3_h.CO2, H2O: FG_OUT_Nm3_h.H2O, O2: FG_OUT_Nm3_h.O2, N2: FG_OUT_Nm3_h.N2 } }} t={tr} />
          </SubSection>
        </div>
      </Section>

      <Section title={t('rpt_section_emissions')}>
        <SubSection title={t('rpt_gaz_entree')}><PollutantTable masses={PInput} /></SubSection>
        <SubSection title={t('rpt_gaz_sortie')}><PollutantTable masses={Poutput} /></SubSection>
        <div style={styles.twoCol}>
          <SubSection title={t('rpt_residus_calcules')}>
            <KV label={t('rpt_cendres_lourdes_seches')} value={fmt(Residus.DryBottomAsh_kg_h)} />
            <KV label={t('rpt_cendres_volantes')} value={fmt(Residus.FlyAsh_kg_h)} />
          </SubSection>
          {reactifConsumption.length > 0 && <SubSection title={t('rpt_conso_reactifs')}>{reactifConsumption.map(({ label, value }) => <KV key={label} label={label} value={fmt(value, 3)} />)}</SubSection>}
        </div>
      </Section>

      <Section title={t('rpt_section_design')}>
        <div style={styles.twoCol}>
          <SubSection title={t('rpt_conso_electriques')}>
            {elecRows.length > 0 ? <ElecTable rows={elecRows} t={t} /> : <span style={{ color: '#999', fontSize: 12 }}>{t('rpt_donnees_indisponibles_design')}</span>}
          </SubSection>
          <div>
            {waterConsumption.length > 0 && <SubSection title={t('rpt_conso_eau')}>{waterConsumption.map(({ label, value }) => <KV key={label} label={label} value={fmt(value, 3)} />)}</SubSection>}
            <SubSection title={t('rpt_energie_auxiliaire')}>
              <KV label={t('rpt_gaz_haute_valeur')} value={fmt(innerData.conso_gaz_H_MW)} />
              <KV label={t('rpt_fuel')} value={fmt(innerData.conso_fuel_MW)} />
            </SubSection>
          </div>
        </div>
      </Section>

      <Section title={t('rpt_section_opex')}><OpexRapport innerData={innerData} equipmentType="REACTOR" nodeId={nodeId} currentLanguage={currentLanguage} /></Section>
      <div style={styles.footer}>{t('rpt_footer')} — {new Date().toLocaleDateString()}</div>
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

export default REACTOR_Report;
