// batchCalculators.js
// Direct calculation functions for Calc. All batch mode.
// Each entry reads its own parameters from localStorage (mirroring what each Parameter_Tab does)
// and calls the underlying calculation function directly — no React component mounting needed.

import { performCalculation_STACK } from './STACK/STACK_calculations';
import { performCalculation_IDFAN } from './IDFAN/IDFAN_calculations';
import { performCalculation_IDFAN2 } from './IDFAN/IDFAN_calculations2';
import { performCalculation_BHF } from './BHF/BHF_calculations';
import { performCalculation_ELECTROFILTER } from './ELECTROFILTER/ELECTROFILTER_calculations';
import { performCalculation_CYCLONE } from './CYCLONE/CYCLONE_calculations';
import { performCalculation_REACTOR } from './REACTOR/REACTOR_calculations';
import { performCalculation_SCRUBBER_option_TinTout } from './SCRUBBER/SCRUBBER_calculations';
import { performCalculation_SCRUBBER_option_TinTsat } from './SCRUBBER/SCRUBBER_calculations2';
import { performCalculation_QUENCH_option_T } from './QUENCH/QUENCH_calculations';
import { performCalculation_QUENCH_option_Qeau } from './QUENCH/QUENCH_calculations2';
import { performCalculation_DENOX_option_Qeau } from './DENOX/DENOX_calculations';
import { performCalculation_COOLINGTOWER_option_Qeau } from './COOLINGTOWER/COOLINGTOWER_calculations';
import { performCalculation_WATER_INJECTION_option_T } from './WATER_INJECTION/WATER_INJECTION_calculations';
import { performCalculation_WATER_INJECTION_option_Qeau } from './WATER_INJECTION/WATER_INJECTION_calculations2';
import { performCalculation_AIRINJECTION } from './AIRINJECTION/AIRINJECTION_calculations';
import { performCalculation_WHB_option_T_Qair } from './WHB/WHB_calculation_option1';
import { performCalculation_WHB_option_T_O2 } from './WHB/WHB_calculation_option2';
import { performCalculation_WHB_option_Qeau_Qair } from './WHB/WHB_calculation_option3';
import { performCalculation_WHB_option_Qeau_O2 } from './WHB/WHB_calculation_option4';
import { performCalculation_IACT } from './IACT/IACT_calculations';
import { performCalculation_RK } from './RK/RK_calculations1';
import { performCalculation_RK_with_WHB } from './RK/RK_calculations2';
import { performCalculation_FB_MS } from './FB/FB_calculation_MS';
import { performCalculation_FB_Qboue } from './FB/FB_calculation_Qboue';
import { performCalculation_GF } from './GF/GF_calculations';

// Helpers
const ls = (key, def) => { const v = localStorage.getItem(key); return v !== null ? v : def; };
const f  = (key, def) => parseFloat(ls(key, def));

export const batchCalcMap = {

  'STACK': (_nodeData) => {
    return performCalculation_STACK(
      f('Tstack_STACK', '80'),
      f('Qv_wet_Nm3_h_STACK', '50000'),
      f('O2_dry_pourcent_STACK', '10'),
      f('H2O_pourcent_STACK', '30'),
      f('CO2_dry_pourcent_STACK', '10'),
      f('P_out_mmCE_STACK', '100')
    );
  },

  'IDFAN': (nodeData) => {
    if (!nodeData?.result) return null;
    const Type    = ls('Type_IDFAN', 'OFF');
    const P_amont = f('P_amont_IDFAN', '-250');
    const Rdt     = f('Rdt_elec_IDFAN', '70');
    return Type === 'ON'
      ? performCalculation_IDFAN2(nodeData, P_amont, Rdt)
      : performCalculation_IDFAN(nodeData, P_amont, Rdt);
  },

  'BHF': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_BHF(
      nodeData,
      f('T_air_decolmatation_BHF', '15'),
      f('Qair_decolmatation_BHF', '500'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_BHF', '170')),
      f('PDC_aero_BHF', '200')
    );
  },

  'ELECTROFILTER': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_ELECTROFILTER(
      nodeData,
      f('T_air_decolmatation_ELECTROFILTER', '15'),
      f('Qair_decolmatation_ELECTROFILTER', '0'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_ELECTROFILTER', '170')),
      f('PDC_aero_ELECTROFILTER', '100')
    );
  },

  'CYCLONE': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_CYCLONE(
      nodeData,
      f('T_air_parasite_CYCLONE', '15'),
      f('Qair_parasite_CYCLONE', '0'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_CYCLONE', '15')),
      f('PDC_aero_CYCLONE', '10')
    );
  },

  'REACTOR': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_REACTOR(
      nodeData,
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_REACTOR', '200')),
      f('T_air_REACTOR', '20'),
      f('PDC_aero_REACTOR', '20'),
      ls('reagentType_REACTOR', 'CAP'),
      f('Besoin_air_pulverisation_lime_Nm3_kg', '0.5'),
      f('Besoin_air_pulverisation_cap_Nm3_kg', '0.5'),
      f('Concentration_cap_mg_cap_Nm3_FG', '0.1')
    );
  },

  'SCRUBBER': (nodeData) => {
    if (!nodeData?.result) return null;
    const bilanType = ls('SCRUBBER_bilanType', 'TIN_TOUT');
    const PDC = f('PDC_aero_SCRUBBER', '50');
    if (bilanType === 'TIN_TOUT') {
      return performCalculation_SCRUBBER_option_TinTout(nodeData, PDC);
    }
    return performCalculation_SCRUBBER_option_TinTsat(
      nodeData,
      f('Teau_SCRUBBER', '15'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_SCRUBBER', '50')),
      PDC
    );
  },

  'QUENCH': (nodeData) => {
    if (!nodeData?.result) return null;
    const bilanType = ls('QUENCH_bilanType', 'TEMPERATURE_BALANCE');
    const Teau = f('Teau_QUENCH', '15');
    const PDC  = f('PDC_aero_QUENCH', '10');
    if (bilanType === 'TEMPERATURE_BALANCE') {
      return performCalculation_QUENCH_option_T(
        nodeData,
        parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_QUENCH', '200')),
        Teau, PDC
      );
    }
    return performCalculation_QUENCH_option_Qeau(nodeData, f('Qeau_QUENCH', '0'), Teau, PDC);
  },

  'DENOX': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_DENOX_option_Qeau(
      nodeData,
      f('targetNOx_DENOX', '150'),
      f('sprayWaterTemp_DENOX', '15'),
      f('coeffStoech_DENOX', '1.2'),
      f('solutionConc_DENOX', '25'),
      f('solutionDensity_DENOX', '908'),
      f('sprayFlowrate_DENOX', '15'),
      f('pdc_DENOX', '50')
    );
  },

  'COOLINGTOWER': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_COOLINGTOWER_option_Qeau(
      nodeData,
      f('Teau_COOLINGTOWER', '15'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_steam_C', '120')),
      f('Qeau_kg_h', '0'),
      f('Qsteam_kg_h', '0'),
      f('PDC_aero_COOLINGTOWER', '20')
    );
  },

  'WATER_INJECTION': (nodeData) => {
    if (!nodeData?.result) return null;
    const bilanType = ls('WATER_INJECTION_bilanType', 'TEMPERATURE_BALANCE');
    const Teau = f('Teau_WATER_INJECTION', '15');
    const PDC  = f('PDC_aero_WATER_INJECTION', '10');
    if (bilanType === 'TEMPERATURE_BALANCE') {
      return performCalculation_WATER_INJECTION_option_T(
        nodeData,
        parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_WATER_INJECTION', '200')),
        Teau, PDC
      );
    }
    return performCalculation_WATER_INJECTION_option_Qeau(
      nodeData, f('Qeau_WATER_INJECTION', '0'), Teau, PDC
    );
  },

  'AIRINJECTION': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_AIRINJECTION(
      nodeData,
      f('T_air_parasite_AIRINJECTION', '15'),
      f('Qair_parasite_AIRINJECTION', '0'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_AIRINJECTION', '15')),
      f('PDC_aero_AIRINJECTION', '10')
    );
  },

  'WHB': (nodeData) => {
    if (!nodeData?.result) return null;
    const bilanType    = ls('WHB_bilanType', 'TEMPERATURE_BALANCE');
    const bilanTypeAir = ls('bilanTypeAir_WHB', 'PARASITIC_AIR_FLOW');
    const bilanTypeVap = ls('bilanTypeVapeur_WHB', 'SATURATED_STEAM');

    // Shared params (same order as getCalculationParams in WHB_Parameter_Tab)
    // signature: fn(nodeData, T_eau_alim, Q_purge, T_air_ext, P_th, P_vap, bilanTypeVap, T_vap_sur, T_amont_or_Qeau, Qair_or_O2)
    const base = [
      nodeData,
      f('T_eau_alimentation_C_WHB', '130'),
      f('Q_eau_purge_pourcent_WHB', '1.5'),
      f('T_air_exterieur_C_WHB', '15'),
      f('P_th_pourcent_WHB', '2'),
      f('P_vapeur_bar_WHB', '30'),
      bilanTypeVap,
      f('T_vapeur_surchauffee_C_WHB', '250'),
    ];

    const lastTemp = bilanType === 'TEMPERATURE_BALANCE'
      ? f('T_amont_WHB_C', '950')
      : f('Q_eau_alimentation_WHB', '0');

    const lastAir = bilanTypeAir === 'PARASITIC_AIR_FLOW'
      ? f('Q_air_parasite_Nm3_h_WHB', '1000')
      : parseFloat(nodeData?.result?.dataFlow?.O2_dry_pourcent ?? ls('O2_mesure_WHB', '0'));

    const params = [...base, lastTemp, lastAir];

    if (bilanType === 'TEMPERATURE_BALANCE' && bilanTypeAir === 'PARASITIC_AIR_FLOW')
      return performCalculation_WHB_option_T_Qair(...params);
    if (bilanType === 'TEMPERATURE_BALANCE' && bilanTypeAir === 'O2_MEASUREMENT')
      return performCalculation_WHB_option_T_O2(...params);
    if (bilanType === 'WATER_FLOW_BALANCE' && bilanTypeAir === 'PARASITIC_AIR_FLOW')
      return performCalculation_WHB_option_Qeau_Qair(...params);
    return performCalculation_WHB_option_Qeau_O2(...params);
  },

  'IACT': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_IACT(
      nodeData,
      f('T_air_decolmatation_IACT', '15'),
      f('T_air_chauffe_IACT', '150'),
      f('Rendement_echange_IACT', '95'),
      parseFloat(nodeData?.result?.dataFlow?.T ?? ls('T_amont_IACT', '200')),
      f('PDC_aero_IACT', '10')
    );
  },

  'RK+SCC': (nodeData) => {
    const bilanType_whb      = ls('bilanType_whb_RK', 'WITH_WHB');
    const bilanType_NCV_Masse = ls('bilanType_NCV_Masse_RK', 'NCV_MODE');
    const Tair    = f('Tair_RK_C', '20');
    const Thermal = f('Thermal_losses_MW_RK', '1');
    const NCV     = f('NCV_kcal_kg_RK', '2200');
    const Masse   = f('Masse_dechet_kg_h_RK', '5000');

    if (bilanType_whb === 'WITH_WHB') {
      if (!nodeData?.result?.data_Air_WHB) return null; // WHB data required
      return performCalculation_RK_with_WHB(nodeData, Tair, Thermal, NCV, Masse, bilanType_NCV_Masse);
    }
    return performCalculation_RK(nodeData, Tair, Thermal, NCV, Masse, bilanType_NCV_Masse);
  },

  'FB': (nodeData) => {
    const bilanType = ls('FB_bilanType', 'DRY SOLIDS');
    const Tair      = f('Tair_FB_C', '15');
    const Thermal   = f('Thermal_losses_MW_FB', '1');
    const wasteType = ls('wasteType_FB', 'PRIMAIRE');
    const MV        = f('MV_percent_FB', '70');

    if (bilanType === 'DRY SOLIDS') {
      return performCalculation_FB_MS(nodeData, Tair, Thermal, f('Q_boue_kg_h_FB', '1000'), wasteType, MV);
    }
    return performCalculation_FB_Qboue(nodeData, Tair, Thermal, wasteType, f('MS_percent_FB', '25'), MV);
  },

  'GF': (nodeData) => {
    if (!nodeData?.result) return null;
    return performCalculation_GF(
      nodeData,
      f('Waste_flow_rate_kg_h', '1000'),
      f('Pressure_losse_mmCE', '100'),
      f('Combustion_air_flowrate_Nm3_h', '10000'),
      f('Measured_air_temperature_C', '20'),
      f('Q_feed_water_kg_h', '0'),
      f('T_feed_water_C', '0'),
      f('Blowdown_pourcent', '0'),
      f('Q_saturated_steam', '0'),
      f('Steam_pressure_gauge_bar', '0'),
      f('super_heated_steam_temperature_C', '0'),
      f('Q_superheated_steam_kg_h', '0'),
      f('P_superheated_steam_bar', '0'),
      f('T_superheated_water_boiler_C', '0'),
      f('Q_superheated_water_kg_h', '0'),
      f('Q_recycled_flue_gas_Nm3_h', '0'),
      f('T_recycled_flue_gas_C', '0'),
      f('Injected_water_temperature_C', '0'),
      f('Q_treatment_injected_water_kg_h', '0'),
      f('Auxiliary_fuel_kWh', '0'),
      f('Bottom_ash_pourcent', '0'),
      f('Bottom_ash_temperature_C', '0'),
      f('Unburnt_bottom_ash_pourcent', '0'),
      f('Unburnt_LCV_kcal_kg', '0'),
      f('Reference_temperature_C', '15'),
      f('Q_air_ingress_Nm3_h', '0'),
      f('T_air_ingress_C', '20')
    );
  },
};
