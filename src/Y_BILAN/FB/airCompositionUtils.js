// ============================================================
// UTILITAIRES POUR CALCUL COMPOSITIONS D'AIR
// ============================================================

/**
 * Calcule les masses en kg/h des composants pour une composition d'air donnée
 */
export const calculateAirMassComposition = (airRow, masse_seche_kg_h, humidite_kg_h = 0) => {
  const total_masse = masse_seche_kg_h + humidite_kg_h;
  return {
    CO2_kg_h: total_masse * (airRow.CO2_pct / 100),
    H2O_kg_h: total_masse * (airRow.H2O_pct / 100),
    O2_kg_h: total_masse * (airRow.O2_pct / 100),
    N2_kg_h: total_masse * (airRow.N2_pct / 100),
    SO2_kg_h: total_masse * (airRow.SO2_pct / 100),
    Cl_kg_h: total_masse * (airRow.Cl_pct / 100),
  };
};

/**
 * Calcule les fractions massiques en % pour une composition d'air
 */
export const calculateAirMassicFractions = (
  CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h,
  FractionMassiqueC, FractionMassiqueH, FractionMassiqueO, 
  FractionMassiqueN, FractionMassiqueS, FractionMassiqueCl
) => {
  return {
    C_pct: FractionMassiqueC(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
    H_pct: FractionMassiqueH(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
    O_pct: FractionMassiqueO(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
    N_pct: FractionMassiqueN(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
    S_pct: FractionMassiqueS(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
    Cl_pct: FractionMassiqueCl(CO2_kg_h, H2O_kg_h, O2_kg_h, N2_kg_h, SO2_kg_h, Cl_kg_h) || 0,
  };
};

/**
 * Calcule les masses des composants pour une composition d'air donnée
 */
export const calculateAirElementMasses = (
  C_pct, H_pct, O_pct, N_pct, S_pct, Cl_pct, 
  masse_seche_kg_h, humidite_kg_h = 0
) => {
  const total_masse = masse_seche_kg_h + humidite_kg_h;
  return {
    C_kg_h: total_masse * (C_pct / 100),
    H_kg_h: total_masse * (H_pct / 100),
    O_kg_h: total_masse * (O_pct / 100),
    N_kg_h: total_masse * (N_pct / 100),
    S_kg_h: total_masse * (S_pct / 100),
    Cl_kg_h: total_masse * (Cl_pct / 100),
  };
};

/**
 * Calcule les moles d'un élément à partir de sa masse
 */
export const calculateMoles = (masse_kg_h, masse_molaire) => {
  if (!masse_kg_h || !masse_molaire) return 0;
  return (masse_kg_h / masse_molaire) * 1000;
};

/**
 * Molar masses
 */
export const MOLAR_MASSES = {
  C: 12.01,
  H: 1.008,
  O: 16,
  N: 14.007,
  S: 32.066,
  Cl: 35.45,
};
