// ─── Transport des résidus par camion (onglets Design → OPEX) ────────────────
//
// Paramètres OPEX (onglet Transport) : pour chaque camion (15, 20, 25 t),
//   - prix d'évacuation en €/km parcouru par le camion ;
//   - facteur CO2 en kg CO2 par tonne transportée et par km.
//
// - Rotations [1/h] = débit de résidus [t/h] / charge utile du camion [t]
// - Coût [€/h]      = rotations × distance × 2 (aller chargé + retour à vide) × prix [€/km]
// - CO2 [kg/h]      = facteur [kg/(t·km)] × distance [km] × débit [t/h]
//
// Avant le 18/11/2026, le coût était « prix × distance » enregistré en €/h,
// soit un voyage par heure quel que soit le débit de résidus.

import { getOpexData, ALLER_RETOUR } from './opexDataService';

export const CHARGE_UTILE_CAMION_T = { '15t': 15, '20t': 20, '25t': 25 };

// Distance facturée par rotation : aller chargé + retour à vide (ALLER_RETOUR, opexDataService).
export { ALLER_RETOUR };

export const chargeUtileCamion_t = (typeCamion) =>
  CHARGE_UTILE_CAMION_T[typeCamion] || parseFloat(typeCamion) || 15;

export const rotationsCamion_h = (debit_kg_h, typeCamion) =>
  Math.max(0, parseFloat(debit_kg_h) || 0) / 1000 / chargeUtileCamion_t(typeCamion);

export const rotationsCamion_an = (debit_kg_h, typeCamion) =>
  rotationsCamion_h(debit_kg_h, typeCamion) * (getOpexData()?.availability ?? 8760);

export const coutTransportResidus_h = (debit_kg_h, distance_km, prix_euro_km, typeCamion) =>
  rotationsCamion_h(debit_kg_h, typeCamion) * ALLER_RETOUR
  * Math.max(0, parseFloat(distance_km) || 0) * Math.max(0, parseFloat(prix_euro_km) || 0);

export const co2TransportResidus_h = (debit_kg_h, distance_km, co2_kg_t_km) =>
  Math.max(0, parseFloat(co2_kg_t_km) || 0) * Math.max(0, parseFloat(distance_km) || 0)
  * Math.max(0, parseFloat(debit_kg_h) || 0) / 1000;
