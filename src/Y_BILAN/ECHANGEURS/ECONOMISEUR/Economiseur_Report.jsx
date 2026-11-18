// Rapport Bilan commun des économiseurs (eau / air). Chaque équipement fournit sa configuration
// (code = clé des résultats dans innerData et type OPEX, fluide, traductions).
import React from 'react';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { makeReportT } from '../../../D_BILAN_Rapports/report_traduction';
import { fmt } from '../../../A_Transverse_fonction/formatNumber';
import OpexRapport from '../../../D_BILAN_Rapports/OpexRapport';
import { AUXILIAIRE, FLUIDE } from './economiseur_calculs';

const Section = ({ title, children }) => <div style={styles.section}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>;
const SubSection = ({ title, children }) => <div style={styles.subSection}>{title && <h3 style={styles.subTitle}>{title}</h3>}{children}</div>;
const KV = ({ label, value }) => <div style={styles.kvRow}><span style={styles.kvLabel}>{label}</span><span style={styles.kvValue}>{value}</span></div>;

const GasTable = ({ data = {}, t = (k) => k }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2'];
  return (
    <table style={styles.table}>
      <thead><tr><th style={styles.th}></th>{gases.map(g => <th key={g} style={styles.th}>{g}</th>)}<th style={styles.th}>{t('total')}</th></tr></thead>
      <tbody>{Object.entries(data).map(([lbl, d]) => { const tot = gases.reduce((s, g) => s + (parseFloat(d[g]) || 0), 0); return <tr key={lbl}><td style={styles.tdLabel}>{lbl}</td>{gases.map(g => <td key={g} style={styles.td}>{fmt(d[g])}</td>)}<td style={{ ...styles.td, fontWeight: 'bold' }}>{fmt(tot)}</td></tr>; })}</tbody>
    </table>
  );
};

const PollutantTable = ({ masses = {} }) => {
  const keys = Object.keys(masses).filter(k => masses[k] !== undefined && typeof masses[k] !== 'object');
  if (!keys.length) return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
  return <table style={styles.table}><thead><tr>{keys.map(k => <th key={k} style={styles.th}>{k}</th>)}</tr></thead><tbody><tr>{keys.map(k => <td key={k} style={styles.td}>{fmt(masses[k], 4)}</td>)}</tr></tbody></table>;
};

const Economiseur_Report = ({ innerData = {}, currentLanguage = 'fr', nodeId, config }) => {
  const { code, translations } = config;
  const languageCode = getLanguageCode(currentLanguage);
  const tr = makeReportT(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const e = innerData[code];
  if (!e) {
    return <div style={styles.container}><h1 style={styles.mainTitle}>{t('titreRapport')}</h1><span style={{ color: '#999' }}>{t('rapportVide')}</span></div>;
  }
  const FG = innerData.FG_OUT_kg_h || {};
  const Nm3 = e.FG_Nm3_h || {};
  const erreurs = e.erreurs || [];
  const alertes = e.alertes || [];
  const eau = e.fluide !== FLUIDE.AIR;
  const decDP = AUXILIAIRE[eau ? FLUIDE.EAU : FLUIDE.AIR].decDP;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>{t('titreRapport')}</h1>

      <Section title={t('rapSection1')}>
        <div style={styles.twoCol}>
          <SubSection title={t('rapFumees')}>
            <KV label={t('TfumeesEntree')} value={fmt(e.T_fumees_entree_C, 1)} />
            <KV label={t('TfumeesSortie')} value={fmt(e.T_fumees_sortie_C, 1)} />
            <KV label={t('QnHumide')} value={fmt(Nm3.wet, 0)} />
            <KV label={t('QnSec')} value={fmt(Nm3.dry, 0)} />
            <KV label={t('QvEntree')} value={fmt(e.Q_FG_entree_m3_h, 0)} />
            <KV label={t('QvSortie')} value={fmt(e.Q_FG_sortie_m3_h, 0)} />
            <KV label={t('Pentree')} value={fmt(e.P_entree_mmCE, 1)} />
            <KV label={t('Psortie')} value={fmt(e.P_sortie_mmCE, 1)} />
          </SubSection>
          <SubSection title={t('rapComposition')}>
            <GasTable data={{ 'kg/h': FG, 'Nm³/h': { CO2: Nm3.CO2, H2O: Nm3.H2O, O2: Nm3.O2, N2: Nm3.N2 } }} t={tr} />
          </SubSection>
        </div>
      </Section>

      <Section title={t('rapSection2')}>
        <div style={styles.twoCol}>
          <SubSection title={t('rapOptions')}>
            <KV label={t('calculDe')} value={t(`opt_${e.calcul}`)} />
            <KV label={t('proprietes')} value={t(e.modeOrigine ? 'modeOrigine' : 'modeOutil')} />
            <KV label={t('dimensionnement')} value={t(e.echangeurParFour ? 'parFour' : 'pourTous')} />
            <KV label={t('nbFours')} value={fmt(e.NombreFour, 0)} />
            <KV label={t('nbEchangeurs')} value={fmt(e.nbEchangeurs, 0)} />
            <KV label={t('Rdt')} value={fmt(e.Rdt_pct, 1)} />
          </SubSection>
          <SubSection title={t('rapFluide')}>
            <KV label={t('TfluideEntree')} value={fmt(e.T_fluide_entree_C, 1)} />
            <KV label={t('TfluideSortie')} value={fmt(e.T_fluide_sortie_C, 1)} />
            <KV label={t('DebitFluideEch')} value={fmt(e.Debit_fluide_ech_kg_h, 0)} />
            <KV label={t('DebitFluideTot')} value={fmt(e.Debit_fluide_tot_kg_h, 0)} />
            <KV label={t('DebitFluideTotM3')} value={fmt(e.Qv_fluide_tot_m3_h, eau ? 2 : 0)} />
            {eau
              ? <KV label={t('PeauSat')} value={fmt(e.P_eau_bar, 2)} />
              : <KV label={t('DebitFluideTotNm3')} value={fmt(e.Qn_fluide_tot_Nm3_h, 0)} />}
          </SubSection>
        </div>
        <SubSection title={t('rapPuissances')}>
          <KV label={t('PuissanceFumees')} value={fmt(e.Q_fumees_kW, 1)} />
          <KV label={t('PuissanceFumeesKcal')} value={fmt(e.Q_fumees_kcal_h, 0)} />
          <KV label={t('PuissanceFluide')} value={fmt(e.Q_fluide_kW, 1)} />
          <KV label={t('CpMoyen')} value={fmt(e.Cp_fumees_moy_kcal_kg_C, 4)} />
        </SubSection>
      </Section>

      <Section title={t('rapSection3')}>
        <div style={styles.twoCol}>
          <SubSection title={t('echangeThermique')}>
            <KV label={t('PuissanceEchangeur')} value={fmt(e.Q_fumees_ech_kcal_h, 0)} />
            <KV label={t('DTML')} value={fmt(e.DTML_C, 1)} />
            <KV label={t('FacteurF')} value={fmt(e.F, 2)} />
            <KV label={t('UA')} value={fmt(e.UA_ech_kcal_h_C, 0)} />
            <KV label={t('U')} value={fmt(e.U_kcal_h_m2_C, 1)} />
            <KV label={t('Encrassement')} value={fmt(e.Encrassement_pct, 1)} />
            <KV label={t('SurfaceEch')} value={fmt(e.S_ech_m2, 1)} />
            <KV label={t('SurfaceTot')} value={fmt(e.S_tot_m2, 1)} />
          </SubSection>
          <SubSection title={t('auxTitre')}>
            <KV label={t('auxDP')} value={fmt(e.DP_aux, decDP)} />
            <KV label={t('auxRdt')} value={fmt(e.Rdt_aux_pct, 0)} />
            <KV label={t('auxPuissance')} value={fmt(e.Puissance_aux_kW, 2)} />
          </SubSection>
        </div>
        {(erreurs.length > 0 || alertes.length > 0) && (
          <SubSection title={t('rapMessages')}>
            {erreurs.map((c) => <div key={c} style={{ color: '#b71c1c', fontSize: 12 }}>⛔ {t(c)}</div>)}
            {alertes.map((c) => <div key={c} style={{ color: '#8a4b00', fontSize: 12 }}>⚠ {t(c)}</div>)}
          </SubSection>
        )}
      </Section>

      <Section title={t('rapSection4')}>
        <SubSection title={t('inputFlueGas')}><PollutantTable masses={innerData.PInput || {}} /></SubSection>
        <SubSection title={t('outputFlueGas')}><PollutantTable masses={innerData.Poutput || {}} /></SubSection>
        <p style={{ ...styles.subSection, margin: 0, fontSize: 12, color: '#666', fontStyle: 'italic' }}>{t('notePolluants')}</p>
      </Section>

      <Section title={t('rapSection5')}><OpexRapport innerData={innerData} equipmentType={code} nodeId={nodeId} currentLanguage={currentLanguage} /></Section>
      <div style={styles.footer}>{t('rapportGenere')} — {new Date().toLocaleDateString()}</div>
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
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 },
  kvRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel: { color: '#444', flex: 1 },
  kvValue: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th: { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b' },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel: { border: '1px solid #dde6f0', padding: '3px 8px', textAlign: 'left', color: '#333', fontStyle: 'italic' },
  footer: { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default Economiseur_Report;
