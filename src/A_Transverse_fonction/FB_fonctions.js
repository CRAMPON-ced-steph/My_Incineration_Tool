export const calculatePCI_kcal_kg = (MS, MV, PCI) => {
  return (MS / 100) * (MV / 100) * PCI - ((1 - MS / 100) * 598);
};

export const PCI_kcal_kgMV = (type_boue) => {
  switch (type_boue) {
    case "PRIMAIRE":
      return 4781.06;
    case "MIXTE":
      return 5629.76;
    case "BIOLOGIQUE":
      return 5629.76;
    case "DIGEREE":
      return 5412.86;
    case "GRAISSE":
      return 8717.64;
    case "REFUS DEGRILLAGE":
      return 5789;
    default:
      return null;
  }
};

const PCI_kJ_kgMV = (type_boue) => {
  switch (type_boue) {
    case "PRIMAIRE":
      return 200017.34;
    case "MIXTE":
      return 23570.68;
    case "BIOLOGIQUE":
      return 23570.68;
    case "DIGEREE":
      return 22662.56;
    case "GRAISSE":
      return 36399.02;
    case "REFUS DEGRILLAGE":
      return 24237.38;
    default:
      return null;
  }
};

const PCS_kcal_kgMV = (PCI_kcal_kgMV, H) => {
  return PCI_kcal_kgMV + 598 * 9 * H / 100;
};

// H vlaeur en % de l'H2O

const PCS_kcal_kg = (PCI_kcal_kg, MS, MV, H) => {
  return PCI_kcal_kg + 598 * (9 * MS / 100 * MV / 100 * H / 100 + (100 - MS) / 100);
};

const density_combustible = (type_comb) => {
  switch (type_comb) {
    case "Gaz naturel":
      return 0.87;
    case "Fioul":
      return 0.84;
    default:
      return null;
  }
};

const Rho_combustible = (type_comb) => {
  switch (type_comb) {
    case "Gaz naturel":
      return 0.87;
    case "Fioul":
      return 0.84;
    default:
      return null;
  }
};

const CHONSCl_boue = (element, type_boue) => {
  const compositions = {
    "PRIMAIRE": { "C": 49.7, "H": 6.8, "O": 34.3, "N": 7, "S": 1.5, "Cl": 0.7 },
    "MIXTE": { "C": 54.2, "H": 8, "O": 29.3, "N": 7.2, "S": 1.3, "Cl": 0 },
    "BIOLOGIQUE": { "C": 54.2, "H": 8, "O": 29.3, "N": 7.2, "S": 1.3, "Cl": 0 },
    "DIGEREE": { "C": 52.7, "H": 7.6, "O": 30.7, "N": 5.8, "S": 2.2, "Cl": 1 },
    "GRAISSE": { "C": 75, "H": 10.4, "O": 12.5, "N": 0.5, "S": 1.5, "Cl": 0 },
    "REFUS DEGRILLAGE": { "C": 56, "H": 8, "O": 32, "N": 3.5, "S": 0.5, "Cl": 0 },
    "Gaz naturel": { "C": 89.8, "H": 7.5, "O": 0.6, "N": 0.9, "S": 1.2, "Cl": 0 },
    "Fioul": { "C": 85.8, "H": 13.4, "O": 0.15, "N": 0.15, "S": 0.5, "Cl": 0 }
  };

  return compositions[type_boue]?.[element] || null;
};

const CHONSCl_boue_precision = (element, type_boue) => {
  const precisions = {
    "PRIMAIRE": { "C": 3, "H": 0.5, "O": 4.5, "N": 1.6, "S": 1, "Cl": 0.7 },
    "MIXTE": { "C": 3.7, "H": 0.6, "O": 4, "N": 1.6, "S": 0.5, "Cl": 0 },
    "BIOLOGIQUE": { "C": 3.7, "H": 0.6, "O": 4, "N": 1.6, "S": 0.5, "Cl": 0 },
    "DIGEREE": { "C": 2.3, "H": 1.4, "O": 3.7, "N": 1.1, "S": 1.6, "Cl": 0.5 },
    "GRAISSE": { "C": 0, "H": 0, "O": 0, "N": 0, "S": 0, "Cl": 0 },
    "REFUS DEGRILLAGE": { "C": 0, "H": 0, "O": 0, "N": 0, "S": 0, "Cl": 0 }
  };

  return precisions[type_boue]?.[element] || null;
};



 "PRIMAIRE"
 "MIXTE"
 "BIOLOGIQUE"
 "DIGEREE"
 "GRAISSE"
 "REFUS DEGRILLAGE"