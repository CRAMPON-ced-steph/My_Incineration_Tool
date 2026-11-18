// Onglet « Design » de l'économiseur : surface d'échange (Pyrofluid ClassEconomiseur) et pompe.
import React from 'react';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { fmt } from '../../../A_Transverse_fonction/formatNumber';
import { ChampNumerique, Messages, styles } from './WATERCOOLER_ui';

const WATERCOOLERDesign = ({ params, setParam, res, t }) => {
  const echange = [
    { text: t('nbEchangeurs'), value: fmt(res.nbEchangeurs, 0) },
    { text: t('PuissanceEchangeur'), value: fmt(res.Q_fumees_ech_kcal_h, 0) },
    { text: t('DTML'), value: fmt(res.DTML_C, 1) },
    { text: t('FacteurF'), value: fmt(res.F, 2) },
    { text: t('UA'), value: fmt(res.UA_ech_kcal_h_C, 0) },
    { text: t('U_SI'), value: fmt(res.U_W_m2_K, 1) },
    { text: t('SurfaceEch'), value: fmt(res.S_ech_m2, 1) },
    { text: t('SurfaceTot'), value: fmt(res.S_tot_m2, 1) },
    { text: t('PeauSat'), value: fmt(res.P_eau_bar, 2) },
  ];
  const pompe = [
    { text: t('DebitEauTotM3'), value: fmt(res.Qv_eau_tot_m3_h, 2) },
    { text: t('PuissancePompe'), value: fmt(res.Puissance_pompe_kW, 2) },
  ];

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('echangeThermique')}</h3>
      <div style={styles.bloc}>
        <ChampNumerique label={t('Encrassement')} value={params.Encrassement_pct} onChange={(v) => setParam('Encrassement_pct', v)} />
        <ChampNumerique label={t('U')} value={params.U_kcal_h_m2_C} onChange={(v) => setParam('U_kcal_h_m2_C', v)} />
        <p style={styles.note}>{t('noteSurface')}</p>
      </div>
      <Messages erreurs={res.erreurs} alertes={[]} t={t} />
      <TableGeneric elements={echange} />

      <h3>{t('pompeCirculation')}</h3>
      <div style={styles.bloc}>
        <ChampNumerique label={t('DPpompe')} value={params.DP_pompe_bar} onChange={(v) => setParam('DP_pompe_bar', v)} />
        <ChampNumerique label={t('RdtPompe')} value={params.Rdt_pompe_pct} onChange={(v) => setParam('Rdt_pompe_pct', v)} />
        <p style={styles.note}>{t('notePompe')}</p>
      </div>
      <TableGeneric elements={pompe} />
    </div>
  );
};

export default WATERCOOLERDesign;
