// ─── Données OPEX d'un nœud : source unique de l'onglet OPEX et des rapports ──
//
// L'onglet OPEX (OpexDashboard.jsx) affiche six tableaux modifiables :
// électricité, eau, réactifs, énergie fossile, CO2 et coût. Les rapports
// (D_BILAN_Rapports/OpexRapport.jsx et le récapitulatif de GlobalReport.jsx)
// relisent ces mêmes tableaux via calculerOpex(), de sorte que ce qui est
// affiché (et modifié) dans l'onglet OPEX est ce qui est imprimé.
//
// Lignes d'un tableau : { key, label, value, valeurFixee?, libelleFixe?, manuelle? }
//   - lignes calculées (clés row1…row9) : valeur et libellé issus de innerData,
//     sauf si l'utilisateur les a saisis (valeurFixee / libelleFixe) ;
//   - lignes ajoutées à la main (clé row<horodatage>, manuelle: true).
// Les lignes de coût et de CO2 sont recalculées à partir des tableaux de
// consommation affichés (donc des valeurs saisies), sauf saisie directe.
//
// État sauvegardé par nœud : localStorage `opexDashboard_<TYPE>_<nodeId>` et
// innerData[`opexTableau_<TYPE>_<nodeId>`] (voyage avec le projet JSON).

import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { fmt } from '../../A_Transverse_fonction/formatNumber';

export const TABLES_OPEX = ['elec', 'eau', 'reactifs', 'energie', 'co2', 'cout'];
const TABLES_CONSO = ['elec', 'eau', 'reactifs', 'energie'];

// Clé d'une ligne calculée (row1…row99) ; les lignes manuelles ont un horodatage.
const CLE_CALCULEE = /^row\d{1,2}$/;

// Réglages par type d'équipement (partagés onglet OPEX / rapport).
const CONFIG_PAR_TYPE = {
  FB: { numElecRows: 6 },
  GF: { numElecRows: 6 },
};

export const configOpex = (equipmentType, equipmentConfig = {}) => ({
  numElecRows: 8,
  ...(CONFIG_PAR_TYPE[equipmentType] || {}),
  ...equipmentConfig,
});

// Label du nœud React Flow → type d'équipement de l'onglet OPEX (null : pas d'OPEX).
const TYPE_PAR_LABEL = { 'RK+SCC': 'RK', HX_TubeAndShell: null };
export const typeOpexDuLabel = (label) =>
  (Object.prototype.hasOwnProperty.call(TYPE_PAR_LABEL, label) ? TYPE_PAR_LABEL[label] : label);

// ─── Lecture des nombres ──────────────────────────────────────────────────────
// Accepte les nombres, les chaînes saisies ("12,5"), les chaînes formatées par
// fmt() ("1 234.5", espace fine) et les chaînes produites par toFixed().
export const lireNombre = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[\s\u00A0\u2009\u202F]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// ─── Clés de données propres à un nœud ───────────────────────────────────────
// Ces clés décrivent la consommation du nœud lui-même : elles ne doivent pas
// être recopiées dans le nœud aval quand on envoie les résultats (Main_FLOW).
const CLE_OPEX_NOEUD =
  /^(consoElec\d+|labelElec\d+|Conso_|conso_(gaz|fuel|air|incineration|boiler|fly)|CO2_transport_|cout_transport_|activeNodes_|opexTableau)/;

export const estCleOpexNoeud = (cle) => CLE_OPEX_NOEUD.test(cle);

export const sansClesOpex = (resultat = {}) =>
  Object.fromEntries(Object.entries(resultat).filter(([cle]) => !estCleOpexNoeud(cle)));

// ─── Persistance ──────────────────────────────────────────────────────────────
const aNodeId = (nodeId) => nodeId !== undefined && nodeId !== null && nodeId !== '';

export const cleStockageOpex = (equipmentType, nodeId) =>
  (aNodeId(nodeId) ? `opexDashboard_${equipmentType}_${nodeId}` : `opexDashboard_${equipmentType}`);

export const cleInnerDataOpex = (equipmentType, nodeId) =>
  (aNodeId(nodeId) ? `opexTableau_${equipmentType}_${nodeId}` : `opexTableau_${equipmentType}`);

export const ETAT_VIDE = { isAnnualMode: false, tables: {}, supprimees: {} };

const normaliserEtat = (brut) => {
  if (!brut || typeof brut !== 'object') return null;
  if (brut.tables && typeof brut.tables === 'object') {
    return {
      isAnnualMode: !!brut.isAnnualMode,
      tables: brut.tables,
      supprimees: brut.supprimees && typeof brut.supprimees === 'object' ? brut.supprimees : {},
    };
  }
  // Ancien format (avant le 18/11/2026) : une liste par tableau, saisies non
  // marquées → lignes calculées rafraîchies, lignes manuelles conservées.
  if (brut.elecData || brut.coutData) {
    return {
      isAnnualMode: !!brut.isAnnualMode,
      tables: {
        elec: brut.elecData, eau: brut.eauData, reactifs: brut.reactifsData,
        energie: brut.energieData, co2: brut.co2Data, cout: brut.coutData,
      },
      supprimees: {},
    };
  }
  return null;
};

const lireStockage = (cle) => {
  try { return JSON.parse(localStorage.getItem(cle)); } catch { return null; }
};

// État sauvegardé du nœud : localStorage du nœud, sinon copie dans innerData
// (projet rechargé sur un autre poste), sinon ancienne clé par type.
export const lireEtatOpex = (equipmentType, nodeId, innerData) =>
  normaliserEtat(aNodeId(nodeId) ? lireStockage(cleStockageOpex(equipmentType, nodeId)) : null)
  || normaliserEtat(innerData?.[cleInnerDataOpex(equipmentType, nodeId)])
  || normaliserEtat(lireStockage(cleStockageOpex(equipmentType)))
  || null;

export const etatAPersister = (opex) => ({
  version: 2,
  isAnnualMode: !!opex.isAnnualMode,
  tables: opex.tables,
  supprimees: opex.supprimees,
});

// ─── Prix (paramètres OPEX globaux) ───────────────────────────────────────────
const lirePrix = () => {
  const o = getOpexData() || {};
  return {
    currency: o.currency || '€',
    availability: o.availability ?? 8760,
    elec: lireNombre(o.purchaseElectricityPrice),       // devise/MWh
    ratioElec: lireNombre(o.ratioElec),                  // kg CO2/MWh
    air: lireNombre(o.airConsumptionPrice),              // devise/1000 Nm³
    powerRatio: lireNombre(o.powerRatio),                // kWh/Nm³
    eau: o.waterPrices || {},
    reactifs: o.reagentsTypes || {},
    gaz: o.gasTypes || {},
    fuel: o.fuelTypes || {},
  };
};

// ─── Lignes calculées à partir de innerData ───────────────────────────────────
const lignesConsommation = (d, prix, t, config) => {
  const nElec = Math.max(0, Math.min(8, config.numElecRows ?? 8));
  const libellesElec = config.electricLabels || [];
  const elec = Array.from({ length: nElec }, (_, i) => ({
    key: `row${i + 1}`,
    label: d[`labelElec${i + 1}`] || libellesElec[i] || t(`equipment${i + 1}`),
    value: lireNombre(d[`consoElec${i + 1}`]),
  }));

  const eau = [
    ['row1', 'waterDrinking', 'Conso_EauPotable_m3', 'potable'],
    ['row2', 'waterCooling', 'Conso_EauRefroidissement_m3', 'cooling'],
    ['row3', 'waterDemineralized', 'Conso_EauDemin_m3', 'demineralized'],
    ['row4', 'waterRiver', 'Conso_EauRiviere_m3', 'river'],
    ['row5', 'waterSoftened', 'Conso_EauAdoucie_m3', 'soft'],
  ].map(([key, lib, champ, typeEau]) => ({
    key, label: t(lib), value: lireNombre(d[champ]), prix: lireNombre(prix.eau?.[typeEau]),
  }));

  const reactifs = [
    ['row1', 'CaCO3', 'Conso_CaCO3_kg', 'CaCO3'],
    ['row2', 'CaO', 'Conso_CaO_kg', 'CaO'],
    ['row3', 'CaOH2_dry', 'Conso_CaOH2_dry_kg', 'CaOH2'],
    ['row4', 'CaOH2_wet', 'Conso_CaOH2_wet_kg', 'CaOH2'],
    ['row5', 'NaOH', 'Conso_NaOH_kg', 'NaOH'],
    ['row6', 'NaOHCO3', 'Conso_NaOHCO3_kg', 'NaOHCO3'],
    ['row7', t('ammonia'), 'Conso_Ammonia_kg', 'NH3'],
    ['row8', 'NaBr/CaBr2', 'Conso_NaBrCaBr2_kg', 'NaBr_CaBr2'],
    ['row9', 'CAP', 'Conso_CAP_kg', 'CAP'],
  ].map(([key, label, champ, typeReactif]) => ({
    key, label, value: lireNombre(d[champ]),
    prix: lireNombre(prix.reactifs?.[typeReactif]?.cost),         // devise/t
    co2: lireNombre(prix.reactifs?.[typeReactif]?.co2PerTrip),    // kg CO2/t transportée
  }));

  const energie = [
    ['row1', 'gasH', 'conso_gaz_H_MW', prix.gaz?.naturalGasH?.molecule, prix.gaz?.naturalGasH?.co2Emission],
    ['row2', 'gasL', 'conso_gaz_L_MW', prix.gaz?.naturalGasL?.molecule, prix.gaz?.naturalGasL?.co2Emission],
    ['row3', 'gasProcess', 'conso_gaz_Process_MW', prix.gaz?.processGas?.molecule, prix.gaz?.processGas?.co2Emission],
    ['row4', 'fuel', 'conso_fuel_MW', prix.fuel?.FOD?.liquid, prix.fuel?.FOD?.co2Emission],
  ].map(([key, lib, champ, p, co2]) => ({
    key, label: t(lib), value: lireNombre(d[champ]), prix: lireNombre(p), co2: lireNombre(co2),
  }));

  return { elec, eau, reactifs, energie };
};

// Coût et CO2 de chaque ligne de consommation (lignes manuelles : prix connu
// seulement pour l'électricité).
const detailler = (table, lignes, defs, prix) => {
  const parCle = new Map(defs.map((r) => [r.key, r]));
  return lignes.map((ligne) => {
    const n = lireNombre(ligne.value);
    const def = parCle.get(ligne.key);
    if (table === 'elec') {
      return { ...ligne, nombre: n, prix: prix.elec, cout: (n / 1000) * prix.elec, co2kg: (n / 1000) * prix.ratioElec };
    }
    if (!def) return { ...ligne, nombre: n, prix: null, cout: 0, co2kg: 0 };
    if (table === 'eau') return { ...ligne, nombre: n, prix: def.prix, cout: n * def.prix, co2kg: 0 };
    if (table === 'reactifs') {
      return { ...ligne, nombre: n, prix: def.prix, co2: def.co2, cout: (n / 1000) * def.prix, co2kg: (n / 1000) * def.co2 };
    }
    return { ...ligne, nombre: n, prix: def.prix, co2: def.co2, cout: n * def.prix, co2kg: n * def.co2 };
  });
};

const somme = (lignes, champ) => lignes.reduce((s, r) => s + (r[champ] || 0), 0);

const lignesCoutCo2 = (d, details, prix, t) => {
  const air = lireNombre(d.conso_air_co_N_m3);
  const residusCout = lireNombre(d.cout_transport_incineratino_ash) + lireNombre(d.cout_transport_boiler_ash) + lireNombre(d.cout_transport_fly_ash);
  const residusCo2 = lireNombre(d.CO2_transport_incineratino_ash) + lireNombre(d.CO2_transport_boiler_ash) + lireNombre(d.CO2_transport_fly_ash);

  const cout = [
    { key: 'row1', label: t('consumptionElec'), value: somme(details.elec, 'cout') },
    { key: 'row2', label: t('consumptionGasFuel'), value: somme(details.energie, 'cout') },
    { key: 'row3', label: t('consumptionCompressedAir'), value: (air / 1000) * prix.air },
    { key: 'row4', label: t('consumptionWater'), value: somme(details.eau, 'cout') },
    { key: 'row5', label: t('consumptionReagents'), value: somme(details.reactifs, 'cout') },
    { key: 'row6', label: t('transportReagents'), value: lireNombre(d.cout_transport_reactifs) },
    { key: 'row7', label: t('transportResiduesAsh'), value: residusCout },
  ];
  const co2 = [
    { key: 'row1', label: t('consumptionElec'), value: somme(details.elec, 'co2kg') },
    { key: 'row2', label: t('consumptionGasFuel'), value: somme(details.energie, 'co2kg') },
    { key: 'row3', label: t('consumptionCompressedAir'), value: (air * prix.powerRatio * prix.ratioElec) / 1000 },
    { key: 'row4', label: t('transportReagents'), value: somme(details.reactifs, 'co2kg') },
    { key: 'row5', label: t('transportResiduesAsh'), value: residusCo2 },
  ];
  return { cout, co2, air };
};

// ─── Fusion lignes calculées / lignes sauvegardées ────────────────────────────
const ligneDepuisDef = ({ key, label, value }) => ({ key, label, value });

const fusionner = (sauvees, defs, supprimees = []) => {
  const sup = new Set(supprimees);
  if (!Array.isArray(sauvees)) return defs.filter((r) => !sup.has(r.key)).map(ligneDepuisDef);

  const parCle = new Map(defs.map((r) => [r.key, r]));
  const vues = new Set();
  const lignes = [];
  sauvees.forEach((r) => {
    if (!r || !r.key) return;
    const def = parCle.get(r.key);
    if (def) {
      if (vues.has(r.key)) return;
      vues.add(r.key);
      if (sup.has(r.key)) return;
      lignes.push({
        key: r.key,
        label: r.libelleFixe ? r.label : def.label,
        value: r.valeurFixee ? r.value : def.value,
        ...(r.libelleFixe ? { libelleFixe: true } : {}),
        ...(r.valeurFixee ? { valeurFixee: true } : {}),
      });
    } else if (!CLE_CALCULEE.test(r.key)) {
      lignes.push({ key: r.key, label: r.label ?? '', value: r.value ?? '', manuelle: true });
    }
    // Clé calculée qui n'existe plus (ex. nombre de postes électriques réduit) : abandonnée.
  });
  defs.forEach((def) => {
    if (!vues.has(def.key) && !sup.has(def.key)) lignes.push(ligneDepuisDef(def));
  });
  return lignes;
};

// ─── Calcul complet ───────────────────────────────────────────────────────────
// innerData : données du nœud ; sauve : état sauvegardé (lireEtatOpex) ou état
// courant de l'onglet ; config : configOpex() ; t : traduction OpexDashboard.
export const calculerOpex = (innerData, { sauve = null, config = configOpex(), t = (k) => k } = {}) => {
  const d = innerData || {};
  const etat = sauve || ETAT_VIDE;
  const tablesSauvees = etat.tables || {};
  const supprimees = etat.supprimees || {};
  const prix = lirePrix();

  const defsConso = lignesConsommation(d, prix, t, config);
  const tables = {};
  const details = {};
  TABLES_CONSO.forEach((nom) => {
    tables[nom] = fusionner(tablesSauvees[nom], defsConso[nom], supprimees[nom]);
    details[nom] = detailler(nom, tables[nom], defsConso[nom], prix);
  });

  const defsCout = lignesCoutCo2(d, details, prix, t);
  tables.co2 = fusionner(tablesSauvees.co2, defsCout.co2, supprimees.co2);
  tables.cout = fusionner(tablesSauvees.cout, defsCout.cout, supprimees.cout);

  const totaux = {};
  TABLES_OPEX.forEach((nom) => { totaux[nom] = tables[nom].reduce((s, r) => s + lireNombre(r.value), 0); });

  return {
    isAnnualMode: !!etat.isAnnualMode,
    tables,
    supprimees,
    details,
    totaux,
    conso_air_Nm3_h: defsCout.air,
    currency: prix.currency,
    availability: prix.availability,
    prixElec: prix.elec,
  };
};

// Valeur d'une ligne calculée (coût ou CO2) dans l'état affiché, 0 si supprimée.
export const valeurLigne = (opex, table, key) =>
  lireNombre(opex.tables[table]?.find((r) => r.key === key)?.value);

// Lignes ajoutées à la main dans un tableau (somme).
export const totalLignesManuelles = (opex, table) =>
  (opex.tables[table] || []).filter((r) => r.manuelle).reduce((s, r) => s + lireNombre(r.value), 0);

// ─── Unités et conversion annuelle ────────────────────────────────────────────
// Les tableaux sont saisis en valeurs horaires ; le mode annuel multiplie par la
// disponibilité (h/an).
export const uniteHoraire = (table, currency) => ({
  elec: 'kWé', eau: 'm³/h', reactifs: 'kg/h', energie: 'MW', co2: 'kg/h', cout: `${currency}/h`,
}[table] || '');

export const uniteAnnuelle = (table, currency) => ({
  elec: 'MWhé', eau: 'm³', reactifs: 't', energie: 'MWh', co2: 't', cout: currency,
}[table] || '');

export const versAnnuel = (valeurHoraire, table, availability) => {
  const v = lireNombre(valeurHoraire) * lireNombre(availability);
  return (table === 'elec' || table === 'reactifs' || table === 'co2') ? v / 1000 : v;
};

// Affichage d'un nombre : précision adaptée à l'ordre de grandeur.
export const fmtOpex = (v) => {
  const n = lireNombre(v);
  if (n === 0) return '0';
  const a = Math.abs(n);
  if (a >= 1000) return fmt(n, 0);
  if (a >= 10) return fmt(n, 1);
  if (a >= 1) return fmt(n, 2);
  return String(parseFloat(n.toPrecision(3)));
};

// État OPEX d'un nœud tel qu'affiché dans son onglet OPEX (rapports).
export const opexDuNoeud = (innerData, equipmentType, nodeId, t = (k) => k) =>
  calculerOpex(innerData, {
    sauve: lireEtatOpex(equipmentType, nodeId, innerData),
    config: configOpex(equipmentType),
    t,
  });
