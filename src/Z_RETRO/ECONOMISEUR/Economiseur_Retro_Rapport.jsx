import React from 'react';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { AUXILIAIRE, FLUIDE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';

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

// Rapport Retro commun des économiseurs (eau / air) ; config = { code, translations }.
const Economiseur_Retro_Rapport = ({ calculationResult, onClose, currentLanguage = 'fr', config }) => {
  const { code, translations } = config;
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  const r = calculationResult || {};
  const df = r.dataFlow || {};
  const d = r[`data${code}`] || {};
  const eau = d.fluide !== FLUIDE.AIR;
  const decDP = AUXILIAIRE[eau ? FLUIDE.EAU : FLUIDE.AIR].decDP;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{t('titreRapportRetro')}</h2>
          <button onClick={onClose} style={styles.closeBtn}>{t('fermer')}</button>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.reportContent}>
            <h1 style={styles.mainTitle}>{t('titreRapportRetro')}</h1>

            <Section title={t('rapSection1')}>
              <div style={styles.twoCol}>
                <SubSection title={t('rapFumees')}>
                  <KV label={t('TfumeesEntree')} value={fmt(df.T, 1)} />
                  <KV label={t('TfumeesSortie')} value={fmt(df.T_in, 1)} />
                  <KV label={t('QnHumide')} value={fmt(df.Qv_wet_Nm3_h, 0)} />
                  <KV label={t('QnSec')} value={fmt(df.Qv_sec_Nm3_h, 0)} />
                  <KV label={t('QvEntree')} value={fmt(d.Q_FG_entree_m3_h, 0)} />
                  <KV label={t('QvSortie')} value={fmt(d.Q_FG_sortie_m3_h, 0)} />
                  <KV label={t('Pentree')} value={fmt(d.P_entree_mmCE, 1)} />
                  <KV label={t('Psortie')} value={fmt(d.P_sortie_mmCE, 1)} />
                </SubSection>
                <SubSection title={t('rapOptions')}>
                  <KV label={t('calculDe')} value={t(`opt_${d.calcul}`)} />
                  <KV label={t('proprietes')} value={t(d.modeOrigine ? 'modeOrigine' : 'modeOutil')} />
                  <KV label={t('nbEchangeurs')} value={fmt(d.nbEchangeurs, 0)} />
                  <KV label={t('Rdt')} value={fmt(d.Rdt_pct, 1)} />
                  <KV label={t('PDCfumees')} value={fmt(d.PDC_fumees_mmCE, 0)} />
                </SubSection>
              </div>
            </Section>

            <Section title={t('rapSection2')}>
              <div style={styles.twoCol}>
                <SubSection title={t('rapFluide')}>
                  <KV label={t('TfluideEntree')} value={fmt(d.T_fluide_entree_C, 1)} />
                  <KV label={t('TfluideSortie')} value={fmt(d.T_fluide_sortie_C, 1)} />
                  <KV label={t('DebitFluideEch')} value={fmt(d.Debit_fluide_ech_kg_h, 0)} />
                  <KV label={t('DebitFluideTot')} value={fmt(d.Debit_fluide_tot_kg_h, 0)} />
                  <KV label={t('DebitFluideTotM3')} value={fmt(d.Qv_fluide_tot_m3_h, eau ? 2 : 0)} />
                  {eau
                    ? <KV label={t('PeauSat')} value={fmt(d.P_eau_bar, 2)} />
                    : <KV label={t('DebitFluideTotNm3')} value={fmt(d.Qn_fluide_tot_Nm3_h, 0)} />}
                </SubSection>
                <SubSection title={t('rapPuissances')}>
                  <KV label={t('PuissanceFumees')} value={fmt(d.Q_fumees_kW, 1)} />
                  <KV label={t('PuissanceFumeesKcal')} value={fmt(d.Q_fumees_kcal_h, 0)} />
                  <KV label={t('PuissanceFluide')} value={fmt(d.Q_fluide_kW, 1)} />
                  <KV label={t('CpMoyen')} value={fmt(d.Cp_fumees_moy_kcal_kg_C, 4)} />
                </SubSection>
              </div>
            </Section>

            <Section title={t('rapSection3')}>
              <div style={styles.twoCol}>
                <SubSection title={t('echangeThermique')}>
                  <KV label={t('DTML')} value={fmt(d.DTML_C, 1)} />
                  <KV label={t('FacteurF')} value={fmt(d.F, 2)} />
                  <KV label={t('UA')} value={fmt(d.UA_ech_kcal_h_C, 0)} />
                  <KV label={t('U')} value={fmt(d.U_kcal_h_m2_C, 1)} />
                  <KV label={t('Encrassement')} value={fmt(d.Encrassement_pct, 1)} />
                  <KV label={t('SurfaceEch')} value={fmt(d.S_ech_m2, 1)} />
                  <KV label={t('SurfaceTot')} value={fmt(d.S_tot_m2, 1)} />
                </SubSection>
                <SubSection title={t('auxTitre')}>
                  <KV label={t('auxDP')} value={fmt(d.DP_aux, decDP)} />
                  <KV label={t('auxRdt')} value={fmt(d.Rdt_aux_pct, 0)} />
                  <KV label={t('auxPuissance')} value={fmt(d.Puissance_aux_kW, 2)} />
                </SubSection>
              </div>
              {((d.erreurs || []).length > 0 || (d.alertes || []).length > 0) && (
                <SubSection title={t('rapMessages')}>
                  {(d.erreurs || []).map((c) => <div key={c} style={{ color: '#b71c1c', fontSize: 12 }}>⛔ {t(c)}</div>)}
                  {(d.alertes || []).map((c) => <div key={c} style={{ color: '#8a4b00', fontSize: 12 }}>⚠ {t(c)}</div>)}
                </SubSection>
              )}
            </Section>

            <div style={styles.footer}>
              {t('rapportGenere')} — {new Date().toLocaleDateString()}
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
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 },
  kvRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel: { color: '#444', flex: 1 },
  kvValue: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  kvUnit: { fontWeight: 'normal', color: '#666', fontSize: 11 },
  footer: { marginTop: 24, textAlign: 'right', fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 8 },
};

export default Economiseur_Retro_Rapport;
