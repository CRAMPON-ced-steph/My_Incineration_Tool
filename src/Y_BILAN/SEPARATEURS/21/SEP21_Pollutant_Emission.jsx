import React from 'react';
import PollutantCalculator from '../../../C_Components/Tableau_polluants';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SEP21_traduction';
import '../../../index.css';

const SEP21FlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // ✅ DONNÉES D'ENTRÉE
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2_calcule || 12;
  const masse_dechets = innerData?.masse || 10;

  // ✅ POLLUANTS EN ENTRÉE
  const masses_pollutant_input = innerData?.PollutantOutput || {
    SO2: 0,
    HCl: 0,
    HF: 0,
    N2: 0,
    NOx: 0,
    CO2: 0,
    NH3: 0,
    DustFlyAsh: 0,
    Mercury: 0,
    PCDDF: 0,
    Cd_Ti: 0,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: 0,
  };

  // ✅ POLLUANTS EN SORTIE - TRANSFERT DIRECT (pass-through)
  const masses_pollutant_output = {
    SO2: masses_pollutant_input.SO2 || 0,
    HCl: masses_pollutant_input.HCl || 0,
    HF: masses_pollutant_input.HF || 0,
    N2: masses_pollutant_input.N2 || 0,
    NOx: masses_pollutant_input.NOx || 0,
    CO2: innerData?.FG_OUT_kg_h?.CO2 || masses_pollutant_input.CO2 || 0,
    NH3: masses_pollutant_input.NH3 || 0,
    DustFlyAsh: masses_pollutant_input.DustFlyAsh || 0,
    Mercury: masses_pollutant_input.Mercury || 0,
    PCDDF: masses_pollutant_input.PCDDF || 0,
    Cd_Ti: masses_pollutant_input.Cd_Ti || 0,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0,
  };

  // ✅ MISE À JOUR DE innerData
  if (innerData) {
    innerData.PollutantOutput = masses_pollutant_output;
    innerData.PollutantInput = masses_pollutant_input;
  }

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets.toFixed(2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
  ];

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Input flue gas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_input}
        O2_mesure={FG_O2_calcule}
        O2_ref={11}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h4>{t('Output flue gas (pass-through)')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_output}
        O2_mesure={FG_O2_calcule}
        O2_ref={11}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />
    </div>
  );
};

export default SEP21FlueGasPollutantEmission;