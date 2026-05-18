import { useEffect } from 'react';

const FBCalcOpex = ({ innerData, setInnerData }) => {

  const toSignificantFigures = (value, figures = 2) => {
    if (value === 0 || value === null || value === undefined) return 0;
    return parseFloat(value.toPrecision(figures));
  };

  useEffect(() => {
    if (!innerData || !setInnerData) return;

    const conso_reactifs = innerData?.Conso_reactifs ?? {};

    const consoElec1 = toSignificantFigures(1);
    const consoElec2 = toSignificantFigures(1);
    const consoElec3 = toSignificantFigures(1);
    const consoElec4 = toSignificantFigures(1);
    const consoElec5 = toSignificantFigures(1);
    const consoElec6 = toSignificantFigures(1);
    const consoElec7 = toSignificantFigures(10);
    const consoElec8 = toSignificantFigures(2);

    const labelElec1 = 'Mise_en_rotation du RK';
    const labelElec2 = "Pompe d'alimentation des lances";
    const labelElec3 = 'Air comprimé';
    const labelElec4 = 'Ventilateur air de combustion';
    const labelElec5 = 'Ventilateur refroidissement virole';
    const labelElec6 = 'Extracteur';
    const labelElec7 = 'Pompe à boue';
    const labelElec8 = 'Tapis';

    const conso_air_co_N_m3 = toSignificantFigures(1);

    const Conso_EauPotable_m3 = toSignificantFigures(1);
    const Conso_EauRefroidissement_m3 = toSignificantFigures(1);
    const Conso_EauDemin_m3 = toSignificantFigures(1);
    const Conso_EauRiviere_m3 = toSignificantFigures(1);
    const Conso_EauAdoucie_m3 = toSignificantFigures(1);

    const Conso_CaCO3_kg = toSignificantFigures(conso_reactifs.CaCO3 ?? 0);
    const Conso_CaO_kg = toSignificantFigures(conso_reactifs.CaO ?? 0);
    const Conso_CaOH2_dry_kg = toSignificantFigures(conso_reactifs.CaOH2dry ?? 0);
    const Conso_CaOH2_wet_kg = toSignificantFigures(conso_reactifs.CaOH2wet ?? 0);
    const Conso_NaOH_kg = toSignificantFigures(conso_reactifs.NaOH ?? 0);
    const Conso_NaOHCO3_kg = toSignificantFigures(conso_reactifs.NaOHCO3 ?? 0);
    const Conso_Ammonia_kg = toSignificantFigures(conso_reactifs.Ammonia ?? 0);
    const Conso_NaBrCaBr2_kg = toSignificantFigures(conso_reactifs.NaBrCaBr2 ?? 0);
    const Conso_CAP_kg = toSignificantFigures(conso_reactifs.CAP ?? 0);

    const conso_gaz_H_MW = toSignificantFigures(1);
    const conso_gaz_L_MW = toSignificantFigures(0);
    const conso_gaz_Process_MW = toSignificantFigures(0);

    const conso_fuel_MW = toSignificantFigures(1);

    const conso_incineration_ash_kg_h = toSignificantFigures(1);
    const conso_boiler_ash_kg_h = toSignificantFigures(0);
    const conso_fly_ash_kg_h = toSignificantFigures(0);

    const CO2_transport_incineratino_ash = toSignificantFigures(1);
    const CO2_transport_boiler_ash = toSignificantFigures(0);
    const CO2_transport_fly_ash = toSignificantFigures(0);
    const CO2_transport_reactifs = toSignificantFigures(conso_reactifs.CO2_transport ?? 0);

    const cout_transport_incineratino_ash = toSignificantFigures(1);
    const cout_transport_boiler_ash = toSignificantFigures(0);
    const cout_transport_fly_ash = toSignificantFigures(0);
    const cout_transport_reactifs = toSignificantFigures(conso_reactifs.cout ?? 0);

    const parametersToSave = {
      PDC_pression_aeraulique: 1,
      PDC_mmCE: 1,
      RK_diametre_interne: 1,
      RK_diametre_externe: 1,
      RK_longueur: 1,
      RK_pente: 1,
      RK_beta: 1,
      RK_tours: 1,
      RK_hauteur_dechets: 1,
      RK_rho_dechets: 1,
      RK_debit_dechets_solides: 1,
      RK_debit_dechets_liquides: 1,
      RK_type_combustible: 1,
      RK_type_atomisation: 1,
      RK_type_eau: 1,
      RK_debit_eau: 1,
      RK_temp_entree: 1,
      RK_temp_sortie: 1,
      RK_epaisseur_refractaire: 1,
      RK_temp_peau: 1,
      RK_DT_virole: 1,
      SCC_debit_fumees: 1,
      SCC_temperature: 1,
      SCC_diametre: 1,
      SCC_temps_sejour: 1,
      SCC_debit_dechets: 1,
      SCC_type_combustible: 1,
      SCC_type_atomisation: 1,
      EXT_nb_trappes: 1,
      EXT_puissance_unite: 1,
      EXT_masse_imbrulees: 1,
      EXT_type_camion: 1,
      EXT_distance: 1,
      VENT_debit: 1,
      VENT_rendement: 1,
      EAU_H2O_pourcent: 1,
      EAU_CO2_pourcent: 1,
      EAU_Tfum: 1,
      EAU_emissivite: 1,
      EAU_T_extracteur: 1,
    };

    setInnerData(prevData => ({
      ...prevData,
      consoElec1,
      consoElec2,
      consoElec3,
      consoElec4,
      consoElec5,
      consoElec6,
      consoElec7,
      consoElec8,
      labelElec1,
      labelElec2,
      labelElec3,
      labelElec4,
      labelElec5,
      labelElec6,
      labelElec7,
      labelElec8,
      conso_air_co_N_m3,
      Conso_EauPotable_m3,
      Conso_EauRefroidissement_m3,
      Conso_EauDemin_m3,
      Conso_EauRiviere_m3,
      Conso_EauAdoucie_m3,
      Conso_CaCO3_kg,
      Conso_CaO_kg,
      Conso_CaOH2_dry_kg,
      Conso_CaOH2_wet_kg,
      Conso_NaOH_kg,
      Conso_NaOHCO3_kg,
      Conso_Ammonia_kg,
      Conso_NaBrCaBr2_kg,
      Conso_CAP_kg,
      cout_transport_total: 1,
      conso_gaz_H_MW,
      conso_gaz_L_MW,
      conso_gaz_Process_MW,
      conso_fuel_MW,
      conso_incineration_ash_kg_h,
      conso_boiler_ash_kg_h,
      conso_fly_ash_kg_h,
      CO2_transport_incineratino_ash,
      CO2_transport_boiler_ash,
      CO2_transport_fly_ash,
      CO2_transport_reactifs,
      cout_transport_incineratino_ash,
      cout_transport_boiler_ash,
      cout_transport_fly_ash,
      cout_transport_reactifs,
      ...parametersToSave,
    }));
  }, [
    setInnerData,
    innerData?.Conso_reactifs?.CaCO3,
    innerData?.Conso_reactifs?.CaO,
    innerData?.Conso_reactifs?.CaOH2dry,
    innerData?.Conso_reactifs?.CaOH2wet,
    innerData?.Conso_reactifs?.NaOH,
    innerData?.Conso_reactifs?.NaOHCO3,
    innerData?.Conso_reactifs?.Ammonia,
    innerData?.Conso_reactifs?.NaBrCaBr2,
    innerData?.Conso_reactifs?.CAP,
    innerData?.Conso_reactifs?.CO2_transport,
    innerData?.Conso_reactifs?.cout,
  ]);

  return null;
};

export default FBCalcOpex;
