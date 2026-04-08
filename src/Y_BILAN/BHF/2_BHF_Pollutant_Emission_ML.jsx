import React, { useState, useEffect } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { R_1, R_2, R_3 } from '../../A_Transverse_fonction/FGT_fct';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './BHF_traduction';

const FlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {
  const [emissionsBHF, setEmissions2] = useState(() => {
    const savedEmissions = localStorage.getItem('emissionsBHF');
    return savedEmissions ? JSON.parse(savedEmissions) : {
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
  });

  const { reagentsTypes } = getOpexData();
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  useEffect(() => {
    localStorage.setItem('emissionsBHF', JSON.stringify(emissionsBHF));
  }, [emissionsBHF]);

  // Extract values from emissionsBHF
  const FlyAsh_g_Nm3 = emissionsBHF['Fly ashes content [g/Nm3]'];
  const Bottom_Ash_Siccity = emissionsBHF['siccity bottom ash [%]'];
  const O2ref = emissionsBHF['O2 ref [%]'];

  const SOx_reactif = emissionsBHF['SOx reactif'];
  const HCl_reactif = emissionsBHF['HCl reactif'];
  const HF_reactif = emissionsBHF['HF reactif'];

  const efficacite_SOx = emissionsBHF['efficacite_SOx'];
  const HCl_efficacité = emissionsBHF['HCl efficacité'];
  const HF_efficacité = emissionsBHF['HF efficacité'];

  const SOx_stoechiométrie = emissionsBHF['SOx stoechiométrie'];
  const HCl_stoechiométrie = emissionsBHF['HCl stoechiométrie'];
  const HF_stoechiométrie = emissionsBHF['HF stoechiométrie'];

  // Input data from innerData
  const Debit_fumees_sec_Nm3_h = innerData?.FG_RK_OUT_Nm3_h?.dry || 10000;
  const Debit_fumees_humide_Nm3_h = innerData?.FG_RK_OUT_Nm3_h?.wet || 10000;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masse_dechets = innerData?.masse || 10;
  const Inert_kg_h = innerData?.Inertmass || 1;

  let masses_pollutant_input = innerData?.PollutantOutput || {};

  // Calculate R1, R2, R3 ratios
  let R1_SOx = 1, R1_HCl = 1, R1_HF = 1;
  let R2_SOx = 1, R2_HCl = 1, R2_HF = 1;
  let R3_SOx = 1, R3_HCl = 1, R3_HF = 1;

  if (SOx_reactif !== 'None') {
    try {
      R1_SOx = R_1('SOx', SOx_reactif) || 1;
      R2_SOx = R_2('SOx', SOx_reactif) || 1;
      R3_SOx = R_3('SOx', SOx_reactif) || 1;
    } catch (error) {
      console.warn('Error calculating R_SOx:', error);
    }
  }

  if (HCl_reactif !== 'None') {
    try {
      R1_HCl = R_1('HCl', HCl_reactif) || 1;
      R2_HCl = R_2('HCl', HCl_reactif) || 1;
      R3_HCl = R_3('HCl', HCl_reactif) || 1;
    } catch (error) {
      console.warn('Error calculating R_HCl:', error);
    }
  }

  if (HF_reactif !== 'None') {
    try {
      R1_HF = R_1('HF', HF_reactif) || 1;
      R2_HF = R_2('HF', HF_reactif) || 1;
      R3_HF = R_3('HF', HF_reactif) || 1;
    } catch (error) {
      console.warn('Error calculating R_HF:', error);
    }
  }

  // Calculate mass reductions
  const mass_reduction_SOx = SOx_reactif !== 'None' ? (masses_pollutant_input.SO2 * efficacite_SOx) / 100 : 0;
  const mass_reduction_HCl = HCl_reactif !== 'None' ? (masses_pollutant_input.HCl * HCl_efficacité) / 100 : 0;
  const mass_reduction_HF = HF_reactif !== 'None' ? (masses_pollutant_input.HF * HF_efficacité) / 100 : 0;

  // Calculate stoichiometric and actual reagent masses
  const mass_reactif_st_SOx = SOx_reactif !== 'None' ? mass_reduction_SOx * R1_SOx : 0;
  const mass_reactif_st_HCl = HCl_reactif !== 'None' ? mass_reduction_HCl * R1_HCl : 0;
  const mass_reactif_st_HF = HF_reactif !== 'None' ? mass_reduction_HF * R1_HF : 0;

  const mass_reactif_reel_SOx = SOx_reactif !== 'None' ? mass_reactif_st_SOx * SOx_stoechiométrie : 0;
  const mass_reactif_reel_HCl = HCl_reactif !== 'None' ? mass_reactif_st_HCl * HCl_stoechiométrie : 0;
  const mass_reactif_reel_HF = HF_reactif !== 'None' ? mass_reactif_st_HF * HF_stoechiométrie : 0;

  // Calculate residue masses
  const mass_residus_SOx = SOx_reactif !== 'None' ? R2_SOx * (mass_reactif_reel_SOx - mass_reactif_st_SOx) + R3_SOx * mass_reduction_SOx : 0;
  const mass_residus_HCl = HCl_reactif !== 'None' ? R2_HCl * (mass_reactif_reel_HCl - mass_reactif_st_HCl) + R3_HCl * mass_reduction_HCl : 0;
  const mass_residus_HF = HF_reactif !== 'None' ? R2_HF * (mass_reactif_reel_HF - mass_reactif_st_HF) + R3_HF * mass_reduction_HF : 0;
  const mass_residus_tot = mass_residus_SOx + mass_residus_HCl + mass_residus_HF;

  // Output pollutant masses
  const masses_pollutant_output = {
    HCl: masses_pollutant_input.HCl - mass_reduction_HCl,
    HF: masses_pollutant_input.HF - mass_reduction_HF,
    SO2: masses_pollutant_input.SO2 - mass_reduction_SOx,
    N2: masses_pollutant_input.N2,
    NOx: masses_pollutant_input.NOx,
    CO2: masses_pollutant_input.CO2,
    NH3: masses_pollutant_input.NH3,
    DustFlyAsh: masses_pollutant_input.DustFlyAsh,
    Mercury: masses_pollutant_input.Mercury,
    PCDDF: masses_pollutant_input.PCDDF,
    Cd_Ti: masses_pollutant_input.Cd_Ti,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V,
  };

  masses_pollutant_output.Cl = masses_pollutant_output.HCl * 35 / 36.5;
  masses_pollutant_output.S = masses_pollutant_output.SO2 / 2;

  // Calculate ash masses
  let DryBottomAsh_kg_h = 0;
  let FlyAsh_kg_h = 0;
  let WetBottomAsh_kg_h = 0;

  if (Inert_kg_h !== 0) {
    FlyAsh_kg_h = FlyAsh_g_Nm3 * Debit_fumees_sec_Nm3_h / 1000;
    DryBottomAsh_kg_h = Inert_kg_h - FlyAsh_kg_h;
  }

  DryBottomAsh_kg_h = DryBottomAsh_kg_h + mass_residus_tot;
  WetBottomAsh_kg_h = DryBottomAsh_kg_h / (Bottom_Ash_Siccity / 100);

  // Calculate reagent consumption
  let conso_CaCO3_SOx = 0, conso_CaO_SOx = 0, conso_CaOH2wet_SOx = 0;
  let conso_CaOH2dry_SOx = 0, conso_NaOH_SOx = 0, conso_NaOHCO3_SOx = 0, conso_CAP_SOx = 0;
  let conso_CaCO3_HCl = 0, conso_CaO_HCl = 0, conso_CaOH2wet_HCl = 0;
  let conso_CaOH2dry_HCl = 0, conso_NaOH_HCl = 0, conso_NaOHCO3_HCl = 0, conso_CAP_HCl = 0;
  let conso_CaCO3_HF = 0, conso_CaO_HF = 0, conso_CaOH2wet_HF = 0;
  let conso_CaOH2dry_HF = 0, conso_NaOH_HF = 0, conso_NaOHCO3_HF = 0, conso_CAP_HF = 0;

  // Assign reagent consumption for SOx
  if (SOx_reactif === 'CaCO3') conso_CaCO3_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'CaO') conso_CaO_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'CaOH2wet') conso_CaOH2wet_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'CaOH2dry') conso_CaOH2dry_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'NaOH') conso_NaOH_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'NaOHCO3') conso_NaOHCO3_SOx = mass_reactif_reel_SOx;
  if (SOx_reactif === 'CAP') conso_CAP_SOx = mass_reactif_reel_SOx;

  // Assign reagent consumption for HCl
  if (HCl_reactif === 'CaCO3') conso_CaCO3_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'CaO') conso_CaO_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'CaOH2wet') conso_CaOH2wet_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'CaOH2dry') conso_CaOH2dry_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'NaOH') conso_NaOH_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'NaOHCO3') conso_NaOHCO3_HCl = mass_reactif_reel_HCl;
  if (HCl_reactif === 'CAP') conso_CAP_HCl = mass_reactif_reel_HCl;

  // Assign reagent consumption for HF
  if (HF_reactif === 'CaCO3') conso_CaCO3_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'CaO') conso_CaO_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'CaOH2wet') conso_CaOH2wet_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'CaOH2dry') conso_CaOH2dry_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'NaOH') conso_NaOH_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'NaOHCO3') conso_NaOHCO3_HF = mass_reactif_reel_HF;
  if (HF_reactif === 'CAP') conso_CAP_HF = mass_reactif_reel_HF;

  // Total consumption by reagent type
  const Conso_CaCO3_kg = conso_CaCO3_SOx + conso_CaCO3_HCl + conso_CaCO3_HF;
  const Conso_CaO_kg = conso_CaO_SOx + conso_CaO_HCl + conso_CaO_HF;
  const Conso_CaOH2wet_kg = conso_CaOH2wet_SOx + conso_CaOH2wet_HCl + conso_CaOH2wet_HF;
  const Conso_CaOH2dry_kg = conso_CaOH2dry_SOx + conso_CaOH2dry_HCl + conso_CaOH2dry_HF;
  const Conso_NaOH_kg = conso_NaOH_SOx + conso_NaOH_HCl + conso_NaOH_HF;
  const Conso_NaOHCO3_kg = conso_NaOHCO3_SOx + conso_NaOHCO3_HCl + conso_NaOHCO3_HF;
  const Conso_CAP_kg = conso_CAP_SOx + conso_CAP_HCl + conso_CAP_HF;

  // Calculate costs
  const cout_conso_reactifs = (
    (reagentsTypes?.CaCO3 ? Conso_CaCO3_kg / 1000 * reagentsTypes.CaCO3.cost : 0) +
    (reagentsTypes?.CaO ? Conso_CaO_kg / 1000 * reagentsTypes.CaO.cost : 0) +
    (reagentsTypes?.CaOH2wet ? Conso_CaOH2wet_kg / 1000 * reagentsTypes.CaOH2wet.cost : 0) +
    (reagentsTypes?.CaOH2dry ? Conso_CaOH2dry_kg / 1000 * reagentsTypes.CaOH2dry.cost : 0) +
    (reagentsTypes?.NaOH ? Conso_NaOH_kg / 1000 * reagentsTypes.NaOH.cost : 0) +
    (reagentsTypes?.NaOHCO3 ? Conso_NaOHCO3_kg / 1000 * reagentsTypes.NaOHCO3.cost : 0) +
    (reagentsTypes?.CAP ? Conso_CAP_kg / 1000 * reagentsTypes.CAP.cost : 0)
  );

  // Calculate CO2 emissions
  const CO2_total_reactifs = (
    (reagentsTypes?.CaCO3 ? Conso_CaCO3_kg / 1000 * reagentsTypes.CaCO3.co2PerTrip : 0) +
    (reagentsTypes?.CaO ? Conso_CaO_kg / 1000 * reagentsTypes.CaO.co2PerTrip : 0) +
    (reagentsTypes?.CaOH2wet ? Conso_CaOH2wet_kg / 1000 * reagentsTypes.CaOH2wet.co2PerTrip : 0) +
    (reagentsTypes?.CaOH2dry ? Conso_CaOH2dry_kg / 1000 * reagentsTypes.CaOH2dry.co2PerTrip : 0) +
    (reagentsTypes?.NaOH ? Conso_NaOH_kg / 1000 * reagentsTypes.NaOH.co2PerTrip : 0) +
    (reagentsTypes?.NaOHCO3 ? Conso_NaOHCO3_kg / 1000 * reagentsTypes.NaOHCO3.co2PerTrip : 0) +
    (reagentsTypes?.CAP ? Conso_CAP_kg / 1000 * reagentsTypes.CAP.co2PerTrip : 0)
  );

  const Conso_Reactifs = {
    CaCO3: Conso_CaCO3_kg,
    CaO: Conso_CaO_kg,
    CaOH2wet: Conso_CaOH2wet_kg,
    CaOH2dry: Conso_CaOH2dry_kg,
    NaOH: Conso_NaOH_kg,
    NaOHCO3: Conso_NaOHCO3_kg,
    CAP: Conso_CAP_kg,
    cout: cout_conso_reactifs,
    CO2_transport: CO2_total_reactifs,
  };

  const Residus = { DryBottomAsh_kg_h, WetBottomAsh_kg_h };

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets.toFixed(2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
    { text: t('inert mass [kg/h]'), value: Inert_kg_h.toFixed(2) },
  ];

  const residusCalculations = [
    { text: t('Dry residus [kg/h]'), value: DryBottomAsh_kg_h.toFixed(2) },
    { text: t('Wet residus [kg/h]'), value: WetBottomAsh_kg_h.toFixed(2) },
  ];

  // Update innerData
  if (innerData) {
    innerData.Residus = Residus;
    innerData.PInput = masses_pollutant_input;
    innerData.Poutput = masses_pollutant_output;
    innerData.REFIDIS = mass_residus_tot;
    innerData.Conso_reactifs = Conso_Reactifs;
  }

  const handleChange = (name, value) => {
    if (typeof value === 'number' && value < 0) {
      value = 0;
    }
    setEmissions2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    const defaultValues = {
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
    setEmissions2(defaultValues);
    localStorage.removeItem('emissionsBHF');
  };

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div className="cadre_param_bilan">
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}
        >
          {t('Reset to Default Values')}
        </button>

        {/* Inline parameters form */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          {['Fly ashes content [g/Nm3]', 'siccity bottom ash [%]', 'O2 ref [%]'].map((key) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <label
                style={{
                  flex: '1',
                  minWidth: '250px',
                  textAlign: 'right',
                  fontWeight: '500',
                  color: '#333',
                }}
              >
                {t(key)}:
              </label>
              <input
                type="number"
                value={emissionsBHF[key]}
                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                style={{
                  flex: '0 0 150px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>
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
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '10px',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Pollutant')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Reagent')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Mass (kg/h)')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Efficiency (%)')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Stoich. Coeff.')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Output Mass')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Residue Mass')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Reagent Mass')}</th>
              <th style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>{t('Abated Mass')}</th>
            </tr>
          </thead>
          <tbody>
            {/* SOx Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>SOx</td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <select
                  value={SOx_reactif}
                  onChange={(e) => handleChange('SOx reactif', e.target.value)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px' }}
                >
                  <option value="None">None</option>
                  <option value="CaCO3">CaCO3</option>
                  <option value="CaO">CaO</option>
                  <option value="CaOH2dry">CaOH2dry</option>
                  <option value="CaOH2wet">CaOH2wet</option>
                  <option value="CAP">CAP</option>
                </select>
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {SOx_reactif !== 'None' ? masses_pollutant_output.SO2.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  value={efficacite_SOx}
                  onChange={(e) => handleChange('efficacite_SOx', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  max="100"
                  disabled={SOx_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  step="0.1"
                  value={SOx_stoechiométrie}
                  onChange={(e) => handleChange('SOx stoechiométrie', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  disabled={SOx_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {masses_pollutant_output.SO2.toFixed(3)}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {SOx_reactif !== 'None' ? mass_residus_SOx.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {SOx_reactif !== 'None' ? mass_reactif_reel_SOx.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {SOx_reactif !== 'None' ? mass_reduction_SOx.toFixed(3) : '0.000'}
              </td>
            </tr>

            {/* HCl Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>HCl</td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <select
                  value={HCl_reactif}
                  onChange={(e) => handleChange('HCl reactif', e.target.value)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px' }}
                >
                  <option value="None">None</option>
                  <option value="CaCO3">CaCO3</option>
                  <option value="CaO">CaO</option>
                  <option value="CaOH2dry">CaOH2dry</option>
                  <option value="CaOH2wet">CaOH2wet</option>
                  <option value="CAP">CAP</option>
                </select>
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HCl_reactif !== 'None' ? masses_pollutant_output.HCl.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  value={HCl_efficacité}
                  onChange={(e) => handleChange('HCl efficacité', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  max="100"
                  disabled={HCl_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  step="0.1"
                  value={HCl_stoechiométrie}
                  onChange={(e) => handleChange('HCl stoechiométrie', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  disabled={HCl_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {masses_pollutant_output.HCl.toFixed(3)}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HCl_reactif !== 'None' ? mass_residus_HCl.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HCl_reactif !== 'None' ? mass_reactif_reel_HCl.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HCl_reactif !== 'None' ? mass_reduction_HCl.toFixed(3) : '0.000'}
              </td>
            </tr>

            {/* HF Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>HF</td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <select
                  value={HF_reactif}
                  onChange={(e) => handleChange('HF reactif', e.target.value)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px' }}
                >
                  <option value="None">None</option>
                  <option value="CaCO3">CaCO3</option>
                  <option value="CaO">CaO</option>
                  <option value="CaOH2dry">CaOH2dry</option>
                  <option value="CaOH2wet">CaOH2wet</option>
                  <option value="CAP">CAP</option>
                </select>
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HF_reactif !== 'None' ? masses_pollutant_output.HF.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  value={HF_efficacité}
                  onChange={(e) => handleChange('HF efficacité', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  max="100"
                  disabled={HF_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '4px', textAlign: 'center', width: '11.11%' }}>
                <input
                  type="number"
                  step="0.1"
                  value={HF_stoechiométrie}
                  onChange={(e) => handleChange('HF stoechiométrie', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '2px', fontSize: '10px', textAlign: 'center' }}
                  min="0"
                  disabled={HF_reactif === 'None'}
                />
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {masses_pollutant_output.HF.toFixed(3)}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HF_reactif !== 'None' ? mass_residus_HF.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HF_reactif !== 'None' ? mass_reactif_reel_HF.toFixed(3) : '0.000'}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', width: '11.11%' }}>
                {HF_reactif !== 'None' ? mass_reduction_HF.toFixed(3) : '0.000'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>{t('Output flue gas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_output}
        O2_mesure={FG_O2_calcule}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h3>{t('Residus calculated')}</h3>
      <TableGeneric elements={residusCalculations} />
    </div>
  );
};

export default FlueGasPollutantEmission;