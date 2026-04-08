import { molarMasses } from '../A_Transverse_fonction/constantes';

export const R_1 = (pollutant, product) => {
  switch (pollutant) {
    case 'SOx':
      switch (product) {
        case 'CaO': return molarMasses.CaO / molarMasses.SO2;
        case 'CaOH2dry':  return molarMasses.Ca_OH_2 / molarMasses.SO2;
        case 'CaOH2wet': return molarMasses.Ca_OH_2 / molarMasses.SO2;
        case 'NaOH': return 2 * molarMasses.NaOH / molarMasses.SO2;
        case 'NaHCO3': return 2 * molarMasses.NaHCO3 / molarMasses.SO2;
        case 'CaCO3': return molarMasses.CaCO3 / molarMasses.SO2;
        case 'None': return 0;
      }
      break;
    case 'HCl':
      switch (product) {
        case 'CaO': return molarMasses.CaO / (2 * molarMasses.HCl);
        case 'CaOH2dry': return molarMasses.Ca_OH_2 / (2 * molarMasses.HCl);
        case 'CaOH2wet': return molarMasses.Ca_OH_2 / (2 * molarMasses.HCl);
        case 'NaOH': return molarMasses.NaOH / molarMasses.HCl;
        case 'NaHCO3': return molarMasses.NaHCO3 / molarMasses.HCl;
        case 'CaCO3': return molarMasses.CaCO3 / (2 * molarMasses.HCl);
        case 'None': return 0;
      }
      break;
    case 'HF':
      switch (product) {
        case 'CaO': return molarMasses.CaO / (2 * molarMasses.HF);
        case 'CaOH2dry':return molarMasses.Ca_OH_2 / (2 * molarMasses.HF);
        case 'CaOH2wet': return molarMasses.Ca_OH_2 / (2 * molarMasses.HF);
        case 'NaOH': return molarMasses.NaOH / molarMasses.HF;
        case 'NaHCO3': return molarMasses.NaHCO3 / molarMasses.HF;
        case 'CaCO3': return molarMasses.CaCO3 / (2 * molarMasses.HF);
        case 'None': return 0;
      }
      break;
  }
};

export const R_2 = (pollutant, product) => {
  switch (pollutant) {
    case 'SOx':
    case 'HCl':
    case 'HF':
      switch (product) {
        case 'CaO': return molarMasses.Ca_OH_2 / molarMasses.CaO;
        case 'CaOH2dry': return molarMasses.Ca_OH_2 / molarMasses.Ca_OH_2;
        case 'CaOH2wet': return molarMasses.Ca_OH_2 / molarMasses.Ca_OH_2;
        case 'NaOH': return molarMasses.NaOH / molarMasses.NaOH;
        case 'NaHCO3': return molarMasses.NaHCO3 / molarMasses.NaHCO3;
        case 'CaCO3': return molarMasses.Ca_OH_2 / molarMasses.CaCO3;
        case 'None': return 0;
      }
      break;
  }
};

export const R_3 = (pollutant, product) => {
  switch (pollutant) {
    case 'SOx':
      switch (product) {
        case 'CaO': return molarMasses.CaSO3_H2O / molarMasses.SO2;
        case 'CaOH2dry': return molarMasses.CaSO3_2H2O / molarMasses.SO2;
        case 'CaOH2wet': return molarMasses.CaSO3_2H2O / molarMasses.SO2;
        case 'NaOH': return molarMasses.Na2SO3_2H2O / molarMasses.SO2;
        case 'NaHCO3': return molarMasses.Na2SO3_2H2O / molarMasses.SO2;
        case 'CaCO3': return molarMasses.CaSO4_2H2O / molarMasses.SO2;
        case 'None': return 0;
      }
      break;
    case 'HCl':
      switch (product) {
        case 'CaO': return (molarMasses.CaCl2 + molarMasses.H20) / (2 * molarMasses.HCl);
        case 'CaOH2dry': return (molarMasses.CaCl2 + 2 * molarMasses.H20) / (2 * molarMasses.HCl);
        case 'CaOH2wet': return (molarMasses.CaCl2 + 6 * molarMasses.H20) / (2 * molarMasses.HCl);
        case 'NaOH':return molarMasses.NaCl / molarMasses.HCl;
        case 'NaHCO3': return molarMasses.NaCl / molarMasses.HCl;
        case 'CaCO3': return molarMasses.CaCl2 / (2 * molarMasses.HCl);
        case 'None': return 0;
      }
      break;
    case 'HF':
      switch (product) {
        case 'CaO':return molarMasses.CaF2 / (2 * molarMasses.HF);
        case 'CaOH2dry':return molarMasses.CaF2 / (2 * molarMasses.HF);
        case 'CaOH2wet':return molarMasses.CaF2 / (2 * molarMasses.HF);
        case 'CaCO3': return molarMasses.CaF2 / (2 * molarMasses.HF);
        case 'NaOH': return molarMasses.NaF / molarMasses.HF;
        case 'NaHCO3': return molarMasses.NaF / molarMasses.HF;
        case 'None': return 0;
      }
      break;
  }
};






export const Calcul_FGT = (R1, R2, R3, efficacite_treatement, mass_inlet_kg_h, stoechio_imposee) => {
  let mass_reduction, mass_reactif_st, mass_reactif_reel, mass_residus, mass_sortie;


    mass_reduction = mass_inlet_kg_h * efficacite_treatement; // masse de polluant à abattre
    mass_reactif_st = mass_reduction * R1;
    mass_reactif_reel = mass_reactif_st * stoechio_imposee;
    mass_residus = R2 * (mass_reactif_reel - mass_reactif_st) + R3 * mass_reduction;

    mass_sortie = mass_inlet_kg_h - mass_reduction;

  return {
    mass_reduction,
    mass_reactif_st,
    mass_reactif_reel,
    mass_residus,
    mass_sortie
  };
};

