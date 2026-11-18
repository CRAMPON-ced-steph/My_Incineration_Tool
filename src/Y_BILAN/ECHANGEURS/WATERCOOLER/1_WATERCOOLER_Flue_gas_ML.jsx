// Onglet « Gaz » de l'économiseur : options de calcul Pyrofluid et bilan thermique fumées / eau.
import React from 'react';
import MassCalculator from '../../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { fmt } from '../../../A_Transverse_fonction/formatNumber';
import { CALCUL, OPTIONS_BILAN } from './WATERCOOLER_calculs';
import { ChoixBoutons, ChampNumerique, LigneChoix, Messages, styles } from './WATERCOOLER_ui';

// Champs saisis ; celui que l'option choisie calcule devient une valeur calculée.
const CHAMPS = [
  { cle: 'T_fumees_sortie_C', label: 'TfumeesSortie', calcul: CALCUL.T_FUMEES_SORTIE, res: 'T_fumees_sortie_C', dec: 1 },
  { cle: 'T_eau_entree_C', label: 'TeauEntree', calcul: CALCUL.T_EAU_ENTREE, res: 'T_eau_entree_C', dec: 1 },
  { cle: 'T_eau_sortie_C', label: 'TeauSortie', calcul: CALCUL.T_EAU_SORTIE, res: 'T_eau_sortie_C', dec: 1 },
  { cle: 'Debit_eau_kg_h', label: 'DebitEauEch', calcul: CALCUL.DEBIT_EAU, res: 'Debit_eau_ech_kg_h', dec: 0 },
  { cle: 'Rdt_pct', label: 'Rdt' },
  { cle: 'PDC_fumees_mmCE', label: 'PDCfumees' },
];

const WATERCOOLERFlueGas = ({ params, setParam, resetParams, res, amont, innerData, t }) => {
  const T_OUT = innerData?.T_OUT;
  const FG_OUT = innerData?.FG_OUT_kg_h || {};

  // Comme Pyrofluid : en changeant d'option, la grandeur jusqu'ici calculée garde sa valeur
  // et devient une donnée.
  const changerCalcul = (option) => {
    const actuel = CHAMPS.find((c) => c.calcul && c.calcul === params.calcul);
    const v = actuel ? res[actuel.res] : NaN;
    if (actuel && Number.isFinite(v)) setParam(actuel.cle, String(Number(v.toFixed(actuel.dec))));
    setParam('calcul', option);
  };

  const elements = [
    { text: t('PuissanceFumees'), value: fmt(res.Q_fumees_kW, 1) },
    { text: t('PuissanceFumeesKcal'), value: fmt(res.Q_fumees_kcal_h, 0) },
    { text: t('PuissanceEau'), value: fmt(res.Q_eau_kW, 1) },
    { text: t('CpMoyen'), value: fmt(res.Cp_fumees_moy_kcal_kg_C, 4) },
    { text: t('DebitEauEch'), value: fmt(res.Debit_eau_ech_kg_h, 0) },
    { text: t('DebitEauTot'), value: fmt(res.Debit_eau_tot_kg_h, 0) },
    { text: t('DebitEauTotM3'), value: fmt(res.Qv_eau_tot_m3_h, 2) },
    { text: t('PeauSat'), value: fmt(res.P_eau_bar, 2) },
    { text: t('QnHumide'), value: fmt(res.FG_Nm3_h?.wet, 0) },
    { text: t('QnSec'), value: fmt(res.FG_Nm3_h?.dry, 0) },
    { text: t('QvEntree'), value: fmt(res.Q_FG_entree_m3_h, 0) },
    { text: t('QvSortie'), value: fmt(res.Q_FG_sortie_m3_h, 0) },
    { text: t('Pentree'), value: fmt(res.P_entree_mmCE, 1) },
    { text: t('Psortie'), value: fmt(res.P_sortie_mmCE, 1) },
  ];

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div style={styles.bloc}>
        <button onClick={resetParams} style={styles.boutonReset}>{t('Clear memory')}</button>

        <LigneChoix label={t('calculDe')}>
          <ChoixBoutons
            options={OPTIONS_BILAN.map((o) => ({ value: o, label: t(`opt_${o}`) }))}
            value={params.calcul}
            onChange={changerCalcul}
          />
        </LigneChoix>
        <LigneChoix label={t('proprietes')}>
          <ChoixBoutons
            options={[{ value: false, label: t('modeOutil') }, { value: true, label: t('modeOrigine') }]}
            value={!!params.modeOrigine}
            onChange={(v) => setParam('modeOrigine', v)}
          />
        </LigneChoix>
        <LigneChoix label={t('dimensionnement')}>
          <ChoixBoutons
            options={[{ value: true, label: t('parFour') }, { value: false, label: t('pourTous') }]}
            value={!!params.echangeurParFour}
            onChange={(v) => setParam('echangeurParFour', v)}
          />
        </LigneChoix>
        <ChampNumerique label={t('nbFours')} value={fmt(res.NombreFour, 0)} readOnly />
        <ChampNumerique label={t('nbEchangeurs')} value={fmt(res.nbEchangeurs, 0)} readOnly />

        <ChampNumerique label={t('TfumeesEntree')} value={fmt(amont.T_IN, 1)} readOnly suffixe={t('amont')} />
        {CHAMPS.map((c) => {
          const calcule = c.calcul && c.calcul === params.calcul;
          return (
            <ChampNumerique
              key={c.cle}
              label={t(c.label)}
              value={calcule ? fmt(res[c.res], c.dec) : params[c.cle]}
              readOnly={calcule}
              suffixe={calcule ? t('calcule') : undefined}
              onChange={(v) => setParam(c.cle, v)}
            />
          );
        })}
        <p style={styles.note}>{t(params.modeOrigine ? 'noteModeOrigine' : 'noteModeOutil')}</p>
      </div>

      <Messages erreurs={res.erreurs} alertes={res.alertes} t={t} />

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elements} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Flue gas inlet at inlet temperature')} ({fmt(amont.T_IN, 1)} °C)</h4>
      <MassCalculator masses={amont.FG_IN} TemperatureImposee={amont.T_IN} />

      <h4>{t('Flue gas outlet at outlet temperature')} ({fmt(T_OUT, 1)} °C)</h4>
      <MassCalculator masses={FG_OUT} TemperatureImposee={T_OUT} />
    </div>
  );
};

export default WATERCOOLERFlueGas;
