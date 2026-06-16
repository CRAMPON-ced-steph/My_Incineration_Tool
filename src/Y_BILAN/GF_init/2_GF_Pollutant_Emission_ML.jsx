/**
 * 2_GF_Pollutant_Emission_ML.jsx
 * Onglet "Émissions polluantes" pour le four à grille (GF) — mode Bilan.
 *
 * Adapté de FB/3_Pollutant_Emission.jsx :
 *  - clés localStorage suffixées _GF
 *  - données lues depuis innerData (FG_dry_Nm3_h, FG_wet_Nm3_h, O2_calcule,
 *    masse_dechets, FG_pollutant_OUT_kg_h, masse_pollutant_metallique_kg_h)
 *    renseignées par 1_GF_Combustion_ML via onInnerDataChange.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import { R_1, R_2, R_3 } from '../../A_Transverse_fonction/FGT_fct';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

const useTranslation = (currentLanguage = 'fr') =>
  useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);

// ── Composant ─────────────────────────────────────────────────────────────────
const GFPollutantEmission = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const t = useTranslation(currentLanguage);
  const languageCode = getLanguageCode(currentLanguage);

  // ── État principal : paramètres émissions ──
  const [emissions2, setEmissions2] = useState(() => {
    const saved = localStorage.getItem('emissions2_GF');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fall through */ }
    }
    return {
      mercuryTreatmentThreshold: 9,
      pcddf: 500,
      hfPercent: 1,
      cdTi: 0.05,
      heavyMetals: 0.5,
      flyAshesContent: 2.3,
      siccityBottomAsh: 66,
      o2Ref: 11,
      sncrtEnabled: false,
      noxLimit: 150,
      stoichiometry: 1.2,
      hgTreatmentEnabled: false,
      brHgRatio: 400,
      soxReactif: 'None',
      hclReactif: 'None',
      hfReactif: 'None',
      efficaciteSox: 40,
      hclEfficacite: 40,
      hfEfficacite: 40,
      soxStoechiometrie: 1.2,
      hclStoechiometrie: 1.2,
      hfStoechiometrie: 1.2,
    };
  });

  const { reagentsTypes } = getOpexData();

  useEffect(() => {
    localStorage.setItem('emissions2_GF', JSON.stringify(emissions2));
  }, [emissions2]);

  // ── Extraction des paramètres de emissions2 ──
  const Hg_microg_m3                 = emissions2.mercuryTreatmentThreshold ?? 9;
  const HF_pourcent                  = emissions2.hfPercent ?? 1;
  const FlyAsh_g_Nm3                 = emissions2.flyAshesContent ?? 2.3;
  const Bottom_Ash_Siccity           = emissions2.siccityBottomAsh ?? 66;
  const O2ref                        = emissions2.o2Ref ?? 11;
  const SNCR_enabled                 = emissions2.sncrtEnabled ?? false;
  const NOx_limit_mg_Nm3             = emissions2.noxLimit ?? 150;
  const Stoichiometry                = emissions2.stoichiometry ?? 1.2;
  const Hg_treatment_enabled        = emissions2.hgTreatmentEnabled ?? false;
  const Br_Hg_ratio                  = emissions2.brHgRatio ?? 400;
  const SOx_reactif                  = emissions2.soxReactif ?? 'None';
  const HCl_reactif                  = emissions2.hclReactif ?? 'None';
  const HF_reactif                   = emissions2.hfReactif ?? 'None';
  const efficacite_SOx               = emissions2.efficaciteSox ?? 40;
  const HCl_efficacite               = emissions2.hclEfficacite ?? 40;
  const HF_efficacite                = emissions2.hfEfficacite ?? 40;
  const SOx_stoechiometrie           = emissions2.soxStoechiometrie ?? 1.2;
  const HCl_stoechiometrie           = emissions2.hclStoechiometrie ?? 1.2;
  const HF_stoechiometrie            = emissions2.hfStoechiometrie ?? 1.2;

  // ── Extraction depuis innerData ──
  const Debit_fumees_sec_Nm3_h      = innerData?.FG_dry_Nm3_h ?? 10000;
  const Debit_fumees_humide_Nm3_h   = innerData?.FG_wet_Nm3_h ?? 10000;
  const FG_O2_calcule_pct           = (innerData?.O2_calcule ?? 0.11) * 100;
  const masse_dechets               = innerData?.masse_dechets ?? 0;
  const Inert_kg_h                  = innerData?.Inert_kg_h ?? 0;

  const Masse_polluant_HCl_kg_h     = innerData?.FG_pollutant_OUT_kg_h?.HCl ?? 0;
  const Masse_polluant_Cl_kg_h      = (Masse_polluant_HCl_kg_h * 35.45) / 36.46;
  const Masse_polluant_SO2_kg_h     = innerData?.FG_pollutant_OUT_kg_h?.SO2 ?? 0;
  const Masse_polluant_S_kg_h       = (Masse_polluant_SO2_kg_h * 32) / 64;
  const Masse_polluant_HF_kg_h      = innerData?.masse_pollutant_metallique_kg_h?.HF_kg_h ?? 0;
  const Masse_polluant_NOx_kg_h     = innerData?.FG_pollutant_OUT_kg_h?.NOx ?? 0;
  const Masse_polluant_Dust_kg_h    = (FlyAsh_g_Nm3 * Debit_fumees_sec_Nm3_h) / 1000;
  const Masse_polluant_Hg_kg_h      = innerData?.masse_pollutant_metallique_kg_h?.Hg_kg_h ?? 0;
  const Masse_polluant_PCDDF_kg_h   = innerData?.masse_pollutant_metallique_kg_h?.PCDDF_kg_h ?? 0;
  const Masse_polluant_CdTi_kg_h    =
    (innerData?.masse_pollutant_metallique_kg_h?.Cd_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Ti_kg_h ?? 0);
  const Masse_polluant_Metals_kg_h  =
    (innerData?.masse_pollutant_metallique_kg_h?.Al_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.As_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Pb_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Cr_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Cu_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Ni_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Fe_kg_h ?? 0) +
    (innerData?.masse_pollutant_metallique_kg_h?.Zn_kg_h ?? 0);

  // ── SNCR & Hg ──
  const NH3_consumption_kg_h = useCallback(() => {
    if (!SNCR_enabled) return 0;
    const NOx_to_reduce = Math.max(0, Masse_polluant_NOx_kg_h - NOx_limit_mg_Nm3);
    return NOx_to_reduce * (17 / 30) * Stoichiometry;
  }, [SNCR_enabled, Masse_polluant_NOx_kg_h, NOx_limit_mg_Nm3, Stoichiometry])();

  const hg_treatment = useCallback(() => {
    if (!Hg_treatment_enabled) return { hg_mass: 0, bromide_consumption: 0 };
    return { hg_mass: Masse_polluant_Hg_kg_h, bromide_consumption: Masse_polluant_Hg_kg_h * Br_Hg_ratio * (120 / 200.59) };
  }, [Hg_treatment_enabled, Masse_polluant_Hg_kg_h, Br_Hg_ratio])();

  const NOx_mass_to_reduce = SNCR_enabled
    ? Math.max(0, Masse_polluant_NOx_kg_h - NOx_limit_mg_Nm3) * (17 / 30) * Stoichiometry
    : 0;

  // ── Masses polluants entrée ──
  const masses_pollutant_input = {
    HCl: Masse_polluant_HCl_kg_h,
    HF: Masse_polluant_HF_kg_h,
    Cl: Masse_polluant_Cl_kg_h,
    S: Masse_polluant_S_kg_h,
    SO2: Masse_polluant_SO2_kg_h,
    N2: innerData?.FG_OUT_kg_h?.N2 ?? 1,
    NOx: Masse_polluant_NOx_kg_h,
    CO2: innerData?.FG_OUT_kg_h?.CO2 ?? 1,
    NH3: SNCR_enabled ? NH3_consumption_kg_h : 0,
    DustFlyAsh: Masse_polluant_Dust_kg_h,
    Mercury: Masse_polluant_Hg_kg_h,
    PCDDF: Masse_polluant_PCDDF_kg_h,
    Cd_Ti: Masse_polluant_CdTi_kg_h,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: Masse_polluant_Metals_kg_h,
  };

  // ── Calcul réactifs ──
  const getR = (fn, pollutant, reactif) => { try { return fn(pollutant, reactif) || 1; } catch { return 1; } };

  const R1_SOx = SOx_reactif !== 'None' ? getR(R_1, 'SOx', SOx_reactif) : 1;
  const R2_SOx = SOx_reactif !== 'None' ? getR(R_2, 'SOx', SOx_reactif) : 1;
  const R3_SOx = SOx_reactif !== 'None' ? getR(R_3, 'SOx', SOx_reactif) : 1;
  const R1_HCl = HCl_reactif !== 'None' ? getR(R_1, 'HCl', HCl_reactif) : 1;
  const R2_HCl = HCl_reactif !== 'None' ? getR(R_2, 'HCl', HCl_reactif) : 1;
  const R3_HCl = HCl_reactif !== 'None' ? getR(R_3, 'HCl', HCl_reactif) : 1;
  const R1_HF  = HF_reactif  !== 'None' ? getR(R_1, 'HF',  HF_reactif)  : 1;
  const R2_HF  = HF_reactif  !== 'None' ? getR(R_2, 'HF',  HF_reactif)  : 1;
  const R3_HF  = HF_reactif  !== 'None' ? getR(R_3, 'HF',  HF_reactif)  : 1;

  const mass_reduction_SOx = SOx_reactif !== 'None' ? (masses_pollutant_input.SO2 * efficacite_SOx) / 100 : 0;
  const mass_reduction_HCl = HCl_reactif !== 'None' ? (masses_pollutant_input.HCl * HCl_efficacite) / 100 : 0;
  const mass_reduction_HF  = HF_reactif  !== 'None' ? (masses_pollutant_input.HF  * HF_efficacite)  / 100 : 0;

  const mass_reactif_st_SOx  = SOx_reactif !== 'None' ? mass_reduction_SOx * R1_SOx : 0;
  const mass_reactif_st_HCl  = HCl_reactif !== 'None' ? mass_reduction_HCl * R1_HCl : 0;
  const mass_reactif_st_HF   = HF_reactif  !== 'None' ? mass_reduction_HF  * R1_HF  : 0;

  const mass_reactif_reel_SOx = mass_reactif_st_SOx * SOx_stoechiometrie;
  const mass_reactif_reel_HCl = mass_reactif_st_HCl * HCl_stoechiometrie;
  const mass_reactif_reel_HF  = mass_reactif_st_HF  * HF_stoechiometrie;

  const mass_residus_SOx = SOx_reactif !== 'None' ? R2_SOx * (mass_reactif_reel_SOx - mass_reactif_st_SOx) + R3_SOx * mass_reduction_SOx : 0;
  const mass_residus_HCl = HCl_reactif !== 'None' ? R2_HCl * (mass_reactif_reel_HCl - mass_reactif_st_HCl) + R3_HCl * mass_reduction_HCl : 0;
  const mass_residus_HF  = HF_reactif  !== 'None' ? R2_HF  * (mass_reactif_reel_HF  - mass_reactif_st_HF)  + R3_HF  * mass_reduction_HF  : 0;
  const mass_residus_tot = mass_residus_SOx + mass_residus_HCl + mass_residus_HF;

  // ── Masses polluants sortie ──
  const masses_pollutant_output = {
    HCl: masses_pollutant_input.HCl - mass_reduction_HCl,
    HF:  masses_pollutant_input.HF  - mass_reduction_HF,
    SO2: masses_pollutant_input.SO2 - mass_reduction_SOx,
    N2:  masses_pollutant_input.N2,
    NOx: masses_pollutant_input.NOx - NOx_mass_to_reduce,
    CO2: masses_pollutant_input.CO2,
    NH3: masses_pollutant_input.NH3,
    DustFlyAsh: masses_pollutant_input.DustFlyAsh,
    Mercury: Hg_treatment_enabled ? 0 : masses_pollutant_input.Mercury,
    PCDDF: masses_pollutant_input.PCDDF,
    Cd_Ti: masses_pollutant_input.Cd_Ti,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V,
  };
  masses_pollutant_output.Cl = (masses_pollutant_output.HCl * 35) / 36.5;
  masses_pollutant_output.S  = masses_pollutant_output.SO2 / 2;

  // ── Cendres ──
  let DryBottomAsh_kg_h = 0, WetBottomAsh_kg_h = 0, FlyAsh_kg_h = 0;
  if (Inert_kg_h !== 0) {
    FlyAsh_kg_h        = (FlyAsh_g_Nm3 * Debit_fumees_sec_Nm3_h) / 1000;
    DryBottomAsh_kg_h  = Math.max(0, Inert_kg_h - FlyAsh_kg_h + mass_residus_tot);
    WetBottomAsh_kg_h  = DryBottomAsh_kg_h / (Bottom_Ash_Siccity / 100);
    FlyAsh_kg_h        = Math.max(0, FlyAsh_kg_h);
  }

  // ── Consommations réactifs ──
  const Conso_Reactifs = {
    CaCO3:   SOx_reactif === 'CaCO3'   ? mass_reactif_reel_SOx : (HCl_reactif === 'CaCO3' ? mass_reactif_reel_HCl : (HF_reactif === 'CaCO3' ? mass_reactif_reel_HF : 0)),
    CaO:     SOx_reactif === 'CaO'     ? mass_reactif_reel_SOx : (HCl_reactif === 'CaO'   ? mass_reactif_reel_HCl : (HF_reactif === 'CaO'   ? mass_reactif_reel_HF : 0)),
    CaOH2wet:SOx_reactif === 'CaOH2wet'? mass_reactif_reel_SOx : (HCl_reactif === 'CaOH2wet'? mass_reactif_reel_HCl: (HF_reactif === 'CaOH2wet'? mass_reactif_reel_HF: 0)),
    CaOH2dry:SOx_reactif === 'CaOH2dry'? mass_reactif_reel_SOx : (HCl_reactif === 'CaOH2dry'? mass_reactif_reel_HCl: (HF_reactif === 'CaOH2dry'? mass_reactif_reel_HF: 0)),
    NaOH:    SOx_reactif === 'NaOH'    ? mass_reactif_reel_SOx : (HCl_reactif === 'NaOH'  ? mass_reactif_reel_HCl : (HF_reactif === 'NaOH'  ? mass_reactif_reel_HF : 0)),
    NaOHCO3: SOx_reactif === 'NaOHCO3' ? mass_reactif_reel_SOx : (HCl_reactif === 'NaOHCO3'? mass_reactif_reel_HCl: (HF_reactif === 'NaOHCO3'? mass_reactif_reel_HF: 0)),
    Ammonia: NH3_consumption_kg_h,
    NaBrCaBr2: hg_treatment.bromide_consumption,
    CAP: 0,
    cout: 0,
    CO2_transport: 0,
  };

  const Residus = { DryBottomAsh_kg_h, WetBottomAsh_kg_h, FlyAsh_kg_h };

  // ── Mise à jour innerData ──
  useEffect(() => {
    if (!setInnerData) return;
    setInnerData(prev => ({
      ...prev,
      Residus,
      PInput: masses_pollutant_input,
      Poutput: masses_pollutant_output,
      REFIDIS: mass_residus_tot,
      Conso_reactifs: Conso_Reactifs,
    }));
  }, [
    Conso_Reactifs.CaCO3, Conso_Reactifs.CaO, Conso_Reactifs.NaOH,
    Conso_Reactifs.Ammonia, DryBottomAsh_kg_h, WetBottomAsh_kg_h,
    FlyAsh_kg_h, mass_residus_tot, setInnerData,
  ]);

  const handleChange = useCallback((name, value) => {
    setEmissions2(prev => ({ ...prev, [name]: typeof value === 'number' ? Math.max(0, value) : value }));
  }, []);

  const handleReset = useCallback(() => {
    setEmissions2({
      mercuryTreatmentThreshold: 9, pcddf: 500, hfPercent: 1, cdTi: 0.05,
      heavyMetals: 0.5, flyAshesContent: 2.3, siccityBottomAsh: 66, o2Ref: 11,
      sncrtEnabled: false, noxLimit: 150, stoichiometry: 1.2, hgTreatmentEnabled: false,
      brHgRatio: 400, soxReactif: 'None', hclReactif: 'None', hfReactif: 'None',
      efficaciteSox: 40, hclEfficacite: 40, hfEfficacite: 40,
      soxStoechiometrie: 1.2, hclStoechiometrie: 1.2, hfStoechiometrie: 1.2,
    });
    localStorage.removeItem('emissions2_GF');
  }, []);

  const calculationParameters = {
    flyAshesContent: emissions2.flyAshesContent,
    o2Ref: emissions2.o2Ref,
    noxLimit: emissions2.noxLimit,
    brHgRatio: emissions2.brHgRatio,
  };

  const elementsGeneric = [
    { text: t('wasteFlow'),          value: masse_dechets },
    { text: t('flueGasFlowWet'),     value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('flueGasFlowDry'),     value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('o2Calculated'),       value: FG_O2_calcule_pct.toFixed(2) },
  ];

  const residusCalculations = [
    { text: t('bottomAsh'),          value: DryBottomAsh_kg_h },
    { text: t('bottomAshWet'),       value: WetBottomAsh_kg_h },
    { text: t('flyAsh'),             value: FlyAsh_kg_h },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  const btnReset = {
    padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', border: 'none',
    borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
  };
  const rowSelect = { padding: '4px', textAlign: 'center', width: '11.11%' };
  const rowCell   = { padding: '8px', textAlign: 'center', width: '11.11%' };
  const rowInput  = { width: '100%', padding: '2px', fontSize: 10, textAlign: 'center' };

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('calculationParameters')}</h3>
      <div className="cadre_param_bilan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span />
          <button onClick={handleReset} style={btnReset}
            onMouseOver={e => e.target.style.backgroundColor = '#ff5252'}
            onMouseOut={e => e.target.style.backgroundColor = '#ff6b6b'}
          >{t('resetDefaultValues')}</button>
        </div>
        <Input_bilan
          input={calculationParameters}
          handleChange={handleChange}
          currentLanguage={languageCode}
          translations={translations}
        />
      </div>

      <h3>{t('calculatedParameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('flueGasComposition')}</h3>
      <h4>{t('inputFlueGas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_input}
        O2_mesure={FG_O2_calcule_pct}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      {/* SNCR */}
      <h4>{t('sncr')}</h4>
      <div className="cadre_param_bilan">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ marginBottom: 5, fontSize: 12 }}>{t('sncrtEnabled')}:</label>
            <input type="checkbox" checked={SNCR_enabled} onChange={e => handleChange('sncrtEnabled', e.target.checked)} />
          </div>
          {SNCR_enabled && (<>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('noxLimit')}:</label>
              <input type="number" value={NOx_limit_mg_Nm3} onChange={e => handleChange('noxLimit', parseFloat(e.target.value) || 0)} style={{ width: 80 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('stoichiometry')}:</label>
              <input type="number" step="0.1" value={Stoichiometry} onChange={e => handleChange('stoichiometry', parseFloat(e.target.value) || 1)} style={{ width: 80 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('nh3Consumption')}:</label>
              <input type="text" value={NH3_consumption_kg_h.toFixed(3)} readOnly style={{ width: 80, backgroundColor: '#f0f0f0' }} />
            </div>
          </>)}
        </div>
      </div>

      {/* Hg */}
      <h4>{t('mercuryTreatment')}</h4>
      <div className="cadre_param_bilan">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ marginBottom: 5, fontSize: 12 }}>{t('hgTreatmentEnabled')}:</label>
            <input type="checkbox" checked={Hg_treatment_enabled} onChange={e => handleChange('hgTreatmentEnabled', e.target.checked)} />
          </div>
          {Hg_treatment_enabled && (<>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('brHgRatio')}:</label>
              <input type="number" step="0.1" value={Br_Hg_ratio} onChange={e => handleChange('brHgRatio', parseFloat(e.target.value) || 1)} style={{ width: 80 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('hgMass')}:</label>
              <input type="text" value={hg_treatment.hg_mass.toFixed(6)} readOnly style={{ width: 80, backgroundColor: '#f0f0f0' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ marginBottom: 5, fontSize: 12 }}>{t('bromideConsumption')}:</label>
              <input type="text" value={hg_treatment.bromide_consumption.toFixed(6)} readOnly style={{ width: 80, backgroundColor: '#f0f0f0' }} />
            </div>
          </>)}
        </div>
      </div>

      {/* Tableau polluants */}
      <h4>{t('pollutantTreatmentTable')}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {[t('pollutant'),t('reactif'),t('massInput'),t('efficiency'),t('stoechCoeff'),t('massOutput'),t('massResidue'),t('massReactif'),t('massReduced')].map(h => (
                <th key={h} style={{ padding: 8, textAlign: 'center', width: '11.11%' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* SOx */}
            <tr>
              <td style={rowCell}>SOx</td>
              <td style={rowSelect}>
                <select value={SOx_reactif} onChange={e => handleChange('soxReactif', e.target.value)} style={{ width: '100%', padding: 2, fontSize: 10 }}>
                  {['None','CaCO3','CaO','CaOH2dry','CaOH2wet','CAP'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </td>
              <td style={rowCell}>{SOx_reactif !== 'None' ? Masse_polluant_SO2_kg_h.toFixed(3) : ''}</td>
              <td style={rowSelect}><input type="number" value={efficacite_SOx} onChange={e => handleChange('efficaciteSox', parseFloat(e.target.value)||0)} style={rowInput} min="0" max="100" disabled={SOx_reactif==='None'} /></td>
              <td style={rowSelect}><input type="number" step="0.1" value={SOx_stoechiometrie} onChange={e => handleChange('soxStoechiometrie', parseFloat(e.target.value)||0)} style={rowInput} min="0" disabled={SOx_reactif==='None'} /></td>
              <td style={rowCell}>{masses_pollutant_output.SO2.toFixed(3)}</td>
              <td style={rowCell}>{SOx_reactif !== 'None' ? mass_residus_SOx.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{SOx_reactif !== 'None' ? mass_reactif_reel_SOx.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{SOx_reactif !== 'None' ? mass_reduction_SOx.toFixed(3) : '0.000'}</td>
            </tr>
            {/* HCl */}
            <tr>
              <td style={rowCell}>HCl</td>
              <td style={rowSelect}>
                <select value={HCl_reactif} onChange={e => handleChange('hclReactif', e.target.value)} style={{ width: '100%', padding: 2, fontSize: 10 }}>
                  {['None','CaCO3','CaO','CaOH2dry','CaOH2wet','CAP'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </td>
              <td style={rowCell}>{HCl_reactif !== 'None' ? Masse_polluant_HCl_kg_h.toFixed(3) : ''}</td>
              <td style={rowSelect}><input type="number" value={HCl_efficacite} onChange={e => handleChange('hclEfficacite', parseFloat(e.target.value)||0)} style={rowInput} min="0" max="100" disabled={HCl_reactif==='None'} /></td>
              <td style={rowSelect}><input type="number" step="0.1" value={HCl_stoechiometrie} onChange={e => handleChange('hclStoechiometrie', parseFloat(e.target.value)||0)} style={rowInput} min="0" disabled={HCl_reactif==='None'} /></td>
              <td style={rowCell}>{masses_pollutant_output.HCl.toFixed(3)}</td>
              <td style={rowCell}>{HCl_reactif !== 'None' ? mass_residus_HCl.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{HCl_reactif !== 'None' ? mass_reactif_reel_HCl.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{HCl_reactif !== 'None' ? mass_reduction_HCl.toFixed(3) : '0.000'}</td>
            </tr>
            {/* HF */}
            <tr>
              <td style={rowCell}>HF</td>
              <td style={rowSelect}>
                <select value={HF_reactif} onChange={e => handleChange('hfReactif', e.target.value)} style={{ width: '100%', padding: 2, fontSize: 10 }}>
                  {['None','CaCO3','CaO','CaOH2dry','CaOH2wet','CAP'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </td>
              <td style={rowCell}>{HF_reactif !== 'None' ? Masse_polluant_HF_kg_h.toFixed(3) : ''}</td>
              <td style={rowSelect}><input type="number" value={HF_efficacite} onChange={e => handleChange('hfEfficacite', parseFloat(e.target.value)||0)} style={rowInput} min="0" max="100" disabled={HF_reactif==='None'} /></td>
              <td style={rowSelect}><input type="number" step="0.1" value={HF_stoechiometrie} onChange={e => handleChange('hfStoechiometrie', parseFloat(e.target.value)||0)} style={rowInput} min="0" disabled={HF_reactif==='None'} /></td>
              <td style={rowCell}>{masses_pollutant_output.HF.toFixed(3)}</td>
              <td style={rowCell}>{HF_reactif !== 'None' ? mass_residus_HF.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{HF_reactif !== 'None' ? mass_reactif_reel_HF.toFixed(3) : '0.000'}</td>
              <td style={rowCell}>{HF_reactif !== 'None' ? mass_reduction_HF.toFixed(3) : '0.000'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>{t('outputFlueGas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_output}
        O2_mesure={FG_O2_calcule_pct}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h3>{t('bottomAshesCalculated')}</h3>
      <TableGeneric elements={residusCalculations} />
    </div>
  );
};

export default GFPollutantEmission;
