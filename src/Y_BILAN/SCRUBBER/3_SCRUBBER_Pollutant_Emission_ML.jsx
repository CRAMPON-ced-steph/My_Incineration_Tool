import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import FGT from '../../C_Components/Traitement_fumées';
import { R_1, R_2, R_3 } from '../../A_Transverse_fonction/FGT_fct';
import SCC_NOxAndMercuryCalculator from '../../C_Components/Traitement_fumées_SCC';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SCRUBBER_traduction';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';

const FlueGasPollutantEmission = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  // ============ ÉTATS PRINCIPAUX ============
  const initialEmissionsSCRUBBER = {
    'Fly ashes content [g/Nm3]': 0,
    'siccity bottom ash [%]': 98,
    'O2 ref [%]': 11,
    'SOx reactif': 'None',
    'HCl reactif': 'None',
    'HF reactif': 'None',
    'efficacite_SOx': 40,
    'HCl efficacité': 40,
    'HF efficacité': 40,
    'SOx stoechiométrie': 1.2,
    'HCl stoechiométrie': 1.2,
    'HF stoechiométrie': 1.2,
  };

  const [emissionsSCRUBBER, setEmissions2] = useState(() => {
    const saved = localStorage.getItem('emissionsSCRUBBER');
    return saved ? JSON.parse(saved) : initialEmissionsSCRUBBER;
  });

  useEffect(() => {
    localStorage.setItem('emissionsSCRUBBER', JSON.stringify(emissionsSCRUBBER));
  }, [emissionsSCRUBBER]);

  // ============ DONNÉES EXTERNES ============
  const { reagentsTypes } = getOpexData();
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // ============ EXTRACTION DES PARAMÈTRES ============
  const FlyAsh_g_Nm3 = emissionsSCRUBBER['Fly ashes content [g/Nm3]'];
  const Bottom_Ash_Siccity = emissionsSCRUBBER['siccity bottom ash [%]'];
  const O2ref = emissionsSCRUBBER['O2 ref [%]'];

  const SOx_reactif = emissionsSCRUBBER['SOx reactif'];
  const HCl_reactif = emissionsSCRUBBER['HCl reactif'];
  const HF_reactif = emissionsSCRUBBER['HF reactif'];

  const efficacite_SOx = emissionsSCRUBBER['efficacite_SOx'];
  const HCl_efficacité = emissionsSCRUBBER['HCl efficacité'];
  const HF_efficacité = emissionsSCRUBBER['HF efficacité'];

  const SOx_stoechiométrie = emissionsSCRUBBER['SOx stoechiométrie'];
  const HCl_stoechiométrie = emissionsSCRUBBER['HCl stoechiométrie'];
  const HF_stoechiométrie = emissionsSCRUBBER['HF stoechiométrie'];

  // Data from innerData
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_EAU_tot_Nm3_h || 10000;
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_EAU_tot_Nm3_h || 10000;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masse_dechets = innerData?.masse || 10;
  const Inert_kg_h = innerData?.Inertmass || 1;
  const masses_pollutant_input = innerData?.PollutantOutput || {};

  // ============ CALCULS MÉMORISÉS - COEFFICIENTS R ============
  const rCoefficients = useMemo(() => {
    const calculateRCoeffs = (pollutant, reactif) => {
      if (reactif === 'None') return { R1: 1, R2: 1, R3: 1 };
      try {
        return {
          R1: R_1(pollutant, reactif) || 1,
          R2: R_2(pollutant, reactif) || 1,
          R3: R_3(pollutant, reactif) || 1,
        };
      } catch (error) {
        console.warn(`Error calculating R for ${pollutant}:`, error);
        return { R1: 1, R2: 1, R3: 1 };
      }
    };

    return {
      SOx: calculateRCoeffs('SOx', SOx_reactif),
      HCl: calculateRCoeffs('HCl', HCl_reactif),
      HF: calculateRCoeffs('HF', HF_reactif),
    };
  }, [SOx_reactif, HCl_reactif, HF_reactif]);

  // ============ CALCULS MÉMORISÉS - RÉDUCTIONS ET MASSES ============
  const reductionCalculations = useMemo(() => {
    try {
      const mass_reduction_SOx = SOx_reactif !== 'None' 
        ? (masses_pollutant_input.SO2 * efficacite_SOx) / 100 
        : 0;
      const mass_reduction_HCl = HCl_reactif !== 'None' 
        ? (masses_pollutant_input.HCl * HCl_efficacité) / 100 
        : 0;
      const mass_reduction_HF = HF_reactif !== 'None' 
        ? (masses_pollutant_input.HF * HF_efficacité) / 100 
        : 0;

      const mass_reactif_st_SOx = SOx_reactif !== 'None' 
        ? mass_reduction_SOx * rCoefficients.SOx.R1 
        : 0;
      const mass_reactif_st_HCl = HCl_reactif !== 'None' 
        ? mass_reduction_HCl * rCoefficients.HCl.R1 
        : 0;
      const mass_reactif_st_HF = HF_reactif !== 'None' 
        ? mass_reduction_HF * rCoefficients.HF.R1 
        : 0;

      const mass_reactif_reel_SOx = SOx_reactif !== 'None' 
        ? mass_reactif_st_SOx * SOx_stoechiométrie 
        : 0;
      const mass_reactif_reel_HCl = HCl_reactif !== 'None' 
        ? mass_reactif_st_HCl * HCl_stoechiométrie 
        : 0;
      const mass_reactif_reel_HF = HF_reactif !== 'None' 
        ? mass_reactif_st_HF * HF_stoechiométrie 
        : 0;

      const mass_residus_SOx = SOx_reactif !== 'None'
        ? rCoefficients.SOx.R2 * (mass_reactif_reel_SOx - mass_reactif_st_SOx) + rCoefficients.SOx.R3 * mass_reduction_SOx
        : 0;
      const mass_residus_HCl = HCl_reactif !== 'None'
        ? rCoefficients.HCl.R2 * (mass_reactif_reel_HCl - mass_reactif_st_HCl) + rCoefficients.HCl.R3 * mass_reduction_HCl
        : 0;
      const mass_residus_HF = HF_reactif !== 'None'
        ? rCoefficients.HF.R2 * (mass_reactif_reel_HF - mass_reactif_st_HF) + rCoefficients.HF.R3 * mass_reduction_HF
        : 0;
      const mass_residus_tot = mass_residus_SOx + mass_residus_HCl + mass_residus_HF;

      return {
        mass_reduction_SOx, mass_reduction_HCl, mass_reduction_HF,
        mass_reactif_st_SOx, mass_reactif_st_HCl, mass_reactif_st_HF,
        mass_reactif_reel_SOx, mass_reactif_reel_HCl, mass_reactif_reel_HF,
        mass_residus_SOx, mass_residus_HCl, mass_residus_HF,
        mass_residus_tot,
      };
    } catch (error) {
      console.error('Erreur calculs réductions:', error);
      return {
        mass_reduction_SOx: 0, mass_reduction_HCl: 0, mass_reduction_HF: 0,
        mass_reactif_st_SOx: 0, mass_reactif_st_HCl: 0, mass_reactif_st_HF: 0,
        mass_reactif_reel_SOx: 0, mass_reactif_reel_HCl: 0, mass_reactif_reel_HF: 0,
        mass_residus_SOx: 0, mass_residus_HCl: 0, mass_residus_HF: 0,
        mass_residus_tot: 0,
      };
    }
  }, [masses_pollutant_input, efficacite_SOx, HCl_efficacité, HF_efficacité,
      SOx_stoechiométrie, HCl_stoechiométrie, HF_stoechiométrie,
      SOx_reactif, HCl_reactif, HF_reactif, rCoefficients]);

  // ============ CALCULS MÉMORISÉS - POLLUANTS DE SORTIE ============
  const outputPollutants = useMemo(() => {
    try {
      const output = {
        HCl: masses_pollutant_input.HCl - reductionCalculations.mass_reduction_HCl,
        HF: masses_pollutant_input.HF - reductionCalculations.mass_reduction_HF,
        SO2: masses_pollutant_input.SO2 - reductionCalculations.mass_reduction_SOx,
        N2: masses_pollutant_input.N2 || 0,
        NOx: masses_pollutant_input.NOx || 0,
        CO2: masses_pollutant_input.CO2 || 0,
        NH3: masses_pollutant_input.NH3 || 0,
        DustFlyAsh: masses_pollutant_input.DustFlyAsh || 0,
        Mercury: masses_pollutant_input.Mercury || 0,
        PCDDF: masses_pollutant_input.PCDDF || 0,
        Cd_Ti: masses_pollutant_input.Cd_Ti || 0,
        Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0,
      };
      
      output.Cl = output.HCl * 35 / 36.5;
      output.S = output.SO2 / 2;
      
      return output;
    } catch (error) {
      console.error('Erreur calculs polluants:', error);
      return masses_pollutant_input;
    }
  }, [masses_pollutant_input, reductionCalculations]);

  // ============ CALCULS MÉMORISÉS - RÉSIDUS ============
  const residueCalculations = useMemo(() => {
    try {
      let FlyAsh_kg_h = 0;
      let DryBottomAsh_kg_h = 0;

      if (Inert_kg_h !== 0) {
        FlyAsh_kg_h = FlyAsh_g_Nm3 * Debit_fumees_sec_Nm3_h / 1000;
        DryBottomAsh_kg_h = Inert_kg_h - FlyAsh_kg_h;
      }

      DryBottomAsh_kg_h = DryBottomAsh_kg_h + reductionCalculations.mass_residus_tot;
      const WetBottomAsh_kg_h = DryBottomAsh_kg_h / (Bottom_Ash_Siccity / 100);

      return {
        FlyAsh_kg_h,
        DryBottomAsh_kg_h,
        WetBottomAsh_kg_h,
      };
    } catch (error) {
      console.error('Erreur calculs résidus:', error);
      return { FlyAsh_kg_h: 0, DryBottomAsh_kg_h: 0, WetBottomAsh_kg_h: 0 };
    }
  }, [Inert_kg_h, FlyAsh_g_Nm3, Debit_fumees_sec_Nm3_h, Bottom_Ash_Siccity, reductionCalculations.mass_residus_tot]);

  // ============ CALCULS MÉMORISÉS - RÉACTIFS ============
  const reagentCalculations = useMemo(() => {
    try {
      const reactifMap = {
        'CaCO3': (SOx_reactif === 'CaCO3' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
                 (HCl_reactif === 'CaCO3' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
                 (HF_reactif === 'CaCO3' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'CaO': (SOx_reactif === 'CaO' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
               (HCl_reactif === 'CaO' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
               (HF_reactif === 'CaO' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'CaOH2wet': (SOx_reactif === 'CaOH2wet' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
                    (HCl_reactif === 'CaOH2wet' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
                    (HF_reactif === 'CaOH2wet' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'CaOH2dry': (SOx_reactif === 'CaOH2dry' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
                    (HCl_reactif === 'CaOH2dry' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
                    (HF_reactif === 'CaOH2dry' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'NaOH': (SOx_reactif === 'NaOH' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
                (HCl_reactif === 'NaOH' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
                (HF_reactif === 'NaOH' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'NaOHCO3': (SOx_reactif === 'NaOHCO3' ? reductionCalculations.mass_reactif_reel_SOx : 0) +
                   (HCl_reactif === 'NaOHCO3' ? reductionCalculations.mass_reactif_reel_HCl : 0) +
                   (HF_reactif === 'NaOHCO3' ? reductionCalculations.mass_reactif_reel_HF : 0),
        'CAP': 1,
        'NaBr_CaBr2': 0,
        'Ammonia': 0,
      };

      let totalCost = 0;
      let totalCO2 = 0;

      Object.entries(reactifMap).forEach(([reactif, mass]) => {
        if (reagentsTypes?.[reactif] && mass > 0) {
          totalCost += (mass / 1000) * reagentsTypes[reactif].cost;
          totalCO2 += (mass / 1000) * reagentsTypes[reactif].co2PerTrip;
        }
      });

      return {
        totalByReactif: reactifMap,
        totalCost,
        totalCO2,
      };
    } catch (error) {
      console.error('Erreur calculs réactifs:', error);
      return {
        totalByReactif: { CaCO3: 0, CaO: 0, CaOH2wet: 0, CaOH2dry: 0, NaOH: 0, NaOHCO3: 0, CAP: 0, NaBr_CaBr2: 0, Ammonia: 0 },
        totalCost: 0,
        totalCO2: 0,
      };
    }
  }, [reductionCalculations, SOx_reactif, HCl_reactif, HF_reactif, reagentsTypes]);

  // ============ MISE À JOUR INNERDATA ============
  useEffect(() => {
    if (innerData && setInnerData) {
      innerData.Residus = {
        DryBottomAsh_kg_h: residueCalculations.DryBottomAsh_kg_h,
        WetBottomAsh_kg_h: residueCalculations.WetBottomAsh_kg_h,
        FlyAsh_kg_h: residueCalculations.FlyAsh_kg_h,
      };
      innerData.PInput = masses_pollutant_input;
      innerData.Poutput = outputPollutants;
      innerData.REFIDIS = reductionCalculations.mass_residus_tot;
      innerData.Conso_reactifs = {
        ...reagentCalculations.totalByReactif,
        cout: reagentCalculations.totalCost,
        CO2_transport: reagentCalculations.totalCO2,
      };
    }
  }, [innerData, setInnerData, residueCalculations, masses_pollutant_input, outputPollutants, reductionCalculations, reagentCalculations]);

  // ============ ÉLÉMENTS DE TABLEAU ============
  const calculationParameters = useMemo(() => ({
    'Fly ashes content [g/Nm3]': emissionsSCRUBBER['Fly ashes content [g/Nm3]'],
    'siccity bottom ash [%]': emissionsSCRUBBER['siccity bottom ash [%]'],
    'O2 ref [%]': emissionsSCRUBBER['O2 ref [%]'],
  }), [emissionsSCRUBBER]);

  const elementsGeneric = useMemo(() => [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
    { text: t('inert mass [kg/h]'), value: Inert_kg_h.toFixed(2) },
  ], [masse_dechets, Debit_fumees_humide_Nm3_h, Debit_fumees_sec_Nm3_h, FG_O2_calcule, Inert_kg_h, t]);

  const residusCalculations = useMemo(() => [
    { text: t('Bottom ash [kg/h]'), value: residueCalculations.DryBottomAsh_kg_h },
    { text: t('Bottom ash wet [kg/h]'), value: residueCalculations.WetBottomAsh_kg_h },
    { text: t('Fly ash [kg/h]'), value: residueCalculations.FlyAsh_kg_h },
  ], [residueCalculations, t]);

  // ============ STYLES ============
  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '10px',
    tableLayout: 'fixed'
  };

  const cellStyle = {
    padding: '8px',
    textAlign: 'center',
    width: '11.11%'
  };

  const headerStyle = {
    backgroundColor: '#f5f5f5'
  };

  const inputRowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const inputLabelStyle = {
    flex: '1',
    marginRight: '10px',
    textAlign: 'right',
    fontWeight: 'bold'
  };

  const inputStyle = {
    flex: '0 0 150px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  // ============ HANDLERS ============
  const handleChange = useCallback((name, value) => {
    if (typeof value === 'number' && value < 0) {
      value = 0;
    }
    setEmissions2((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setEmissions2(initialEmissionsSCRUBBER);
    localStorage.removeItem('emissionsSCRUBBER');
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div className="cadre_param_bilan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span></span>
          <button onClick={handleReset} style={buttonStyle}>
            {t('Reset to Default Values')}
          </button>
        </div>

        {Object.entries(calculationParameters).map(([key, value]) => (
          <div key={key} style={inputRowStyle}>
            <label style={inputLabelStyle}>
              {t(key)}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Input flue gas')}</h4>
      <PollutantCalculator 
        masses={masses_pollutant_input} 
        O2_mesure={FG_O2_calcule} 
        O2_ref={O2ref} 
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h4>{t('Pollutant Treatment Table')}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerStyle}>
              <th style={cellStyle}>{t('Polluant')}</th>
              <th style={cellStyle}>{t('Réactif')}</th>
              <th style={cellStyle}>{t('Masse (kg/h)')}</th>
              <th style={cellStyle}>{t('Efficacité (%)')}</th>
              <th style={cellStyle}>{t('Coeff. Stoech')}</th>
              <th style={cellStyle}>{t('Masse sortie')}</th>
              <th style={cellStyle}>{t('Masse résidu')}</th>
              <th style={cellStyle}>{t('Masse réactif')}</th>
              <th style={cellStyle}>{t('Masse abattue')}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { pollutant: 'SOx', reactif: SOx_reactif, efficiency: efficacite_SOx, stoech: SOx_stoechiométrie },
              { pollutant: 'HCl', reactif: HCl_reactif, efficiency: HCl_efficacité, stoech: HCl_stoechiométrie },
              { pollutant: 'HF', reactif: HF_reactif, efficiency: HF_efficacité, stoech: HF_stoechiométrie }
            ].map((row) => (
              <tr key={row.pollutant}>
                <td style={cellStyle}>{t(row.pollutant)}</td>
                <td style={{ ...cellStyle, padding: '4px' }}>
                  <select 
                    value={row.reactif}
                    onChange={(e) => handleChange(`${row.pollutant} reactif`, e.target.value)}
                    style={{ width: '100%', padding: '2px', fontSize: '10px' }}
                  >
                    <option value="None">{t('None')}</option>
                    <option value="CaCO3">CaCO3</option>
                    <option value="CaO">CaO</option>
                    <option value="CaOH2dry">{t('CaOH2dry')}</option>
                    <option value="CaOH2wet">{t('CaOH2wet')}</option>
                    <option value="CAP">CAP</option>
                  </select>
                </td>
                <td style={cellStyle}>{masses_pollutant_input[row.pollutant]?.toFixed(3) || '0.000'}</td>
                <td style={{ ...cellStyle, padding: '4px' }}>
                  <input
                    type="number"
                    value={row.efficiency}
                    onChange={(e) => handleChange(`${row.pollutant} efficacité`, parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                    min="0" max="100"
                    disabled={row.reactif === 'None'}
                  />
                </td>
                <td style={{ ...cellStyle, padding: '4px' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={row.stoech}
                    onChange={(e) => handleChange(`${row.pollutant} stoechiométrie`, parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                    min="0"
                    disabled={row.reactif === 'None'}
                  />
                </td>
                <td style={cellStyle}>{outputPollutants[row.pollutant]?.toFixed(3) || '0.000'}</td>
                <td style={cellStyle}>{row.reactif !== 'None' ? reductionCalculations[`mass_residus_${row.pollutant.toLowerCase()}`]?.toFixed(3) || '0.000' : '0.000'}</td>
                <td style={cellStyle}>{row.reactif !== 'None' ? reductionCalculations[`mass_reactif_reel_${row.pollutant.toLowerCase()}`]?.toFixed(3) || '0.000' : '0.000'}</td>
                <td style={cellStyle}>{row.reactif !== 'None' ? reductionCalculations[`mass_reduction_${row.pollutant.toLowerCase()}`]?.toFixed(3) || '0.000' : '0.000'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>{t('Output flue gas')}</h4>
      <PollutantCalculator 
        masses={outputPollutants} 
        O2_mesure={FG_O2_calcule} 
        O2_ref={O2ref} 
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h3>{t('Bottom ashes calculated')}</h3>
      <TableGeneric elements={residusCalculations} />
    </div>
  );
};

export default FlueGasPollutantEmission;