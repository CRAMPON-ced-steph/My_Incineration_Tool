// Onglet « Polluants » des économiseurs (eau / air) : pas de captation (Pyrofluid : sortie = entrée,
// poussières comprises). Affichage des concentrations en entrée / sortie.
import React, { useState, useEffect } from 'react';
import PollutantCalculator from '../../../C_Components/Tableau_polluants';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { fmt } from '../../../A_Transverse_fonction/formatNumber';
import { ChampNumerique, styles } from './economiseur_ui';

const O2_REF_DEFAUT = 11;

const EconomiseurPollutantEmission = ({ innerData = {}, t, nodeId, config }) => {
  const cle = `emissions2_${config.code}_${nodeId}`;
  const [O2ref, setO2ref] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(cle) || '{}').O2_ref ?? O2_REF_DEFAUT;
    } catch {
      return O2_REF_DEFAUT;
    }
  });
  useEffect(() => {
    localStorage.setItem(cle, JSON.stringify({ O2_ref: O2ref }));
  }, [O2ref, cle]);

  const Debit_sec = innerData.FG_sec_tot || 0;
  const Debit_humide = innerData.FG_humide_tot || 0;
  const O2_amont = innerData.O2_calcule; // % (RK/WHB/CO2) ou fraction 0-1 (FB/GF) → normalisé en %
  const O2_mesure = O2_amont > 0 ? (O2_amont <= 0.21 ? O2_amont * 100 : O2_amont) : 11;
  const PInput = innerData.PInput || {};
  const Poutput = innerData.Poutput || {};
  const Residus = innerData.Residus || {};
  const O2refNum = parseFloat(O2ref) || 0;

  const elements = [
    { text: t('QnHumide'), value: fmt(Debit_humide, 0) },
    { text: t('QnSec'), value: fmt(Debit_sec, 0) },
    { text: t('o2Calcule'), value: fmt(O2_mesure, 2) },
  ];
  const residus = [
    { text: t('cendresVolantes'), value: fmt(Residus.FlyAsh_kg_h, 2) },
    { text: t('cendresSeches'), value: fmt(Residus.DryBottomAsh_kg_h, 2) },
    { text: t('cendresHumides'), value: fmt(Residus.WetBottomAsh_kg_h, 2) },
  ];

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div style={styles.bloc}>
        <ChampNumerique label={t('o2Ref')} value={O2ref} onChange={setO2ref} />
        <p style={styles.note}>{t('notePolluants')}</p>
      </div>

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elements} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('inputFlueGas')}</h4>
      <PollutantCalculator masses={PInput} O2_mesure={O2_mesure} O2_ref={O2refNum} Debit_fumees_sec_Nm3_h={Debit_sec} />
      <h4>{t('outputFlueGas')}</h4>
      <PollutantCalculator masses={Poutput} O2_mesure={O2_mesure} O2_ref={O2refNum} Debit_fumees_sec_Nm3_h={Debit_sec} />

      <h3>{t('residusTransmis')}</h3>
      <TableGeneric elements={residus} />
    </div>
  );
};

export default EconomiseurPollutantEmission;
