// ─── Économiseur fumées → eau (nœud « Cooling_HX_eau ») ──────────────────────
//
// Reprise de Pyrofluid V4.5 : ClassEconomiseur.vb + Economiseur.vb (bloc 4-1,
// dossier « 04 Refroidissement Fumées »), fluide = eau.
//
// Pyrofluid propose 4 options de calcul (OptionCalcul) :
//   0 : T° entrée eau      (données : T sortie fumées, T sortie eau, débit d'eau)
//   1 : T° sortie eau      (données : T entrée eau, T sortie fumées, débit d'eau)
//   2 : T° sortie fumées   (données : T entrée eau, T sortie eau, débit d'eau)
//   3 : débit d'eau        (données : T entrée eau, T sortie eau, T sortie fumées) — défaut
// Le mode Retro ajoute « T° entrée fumées » (la T de sortie est imposée par l'aval).
//
// Bilan : Q fumées = H(T entrée) − H(T sortie) ; Q eau = Rdt × Q fumées.
// DTml contre-courant, F = 1, UA = Q fumées / DTml, S = UA / U / 1,25 × (1 + encrassement)
// (U = 66 kcal/h/m²/°C « données fact U sur affaire Lagny » : avec 25 % d'encrassement
// les deux facteurs se compensent). Pression d'eau = pression de saturation à T sortie eau.
// Pyrofluid dimensionne un économiseur par four (débits fumées / NombreFour).
//
// Propriétés : mode outil = NIST (h_fumee) pour les fumées et IAPWS-IF97 (liquide saturé)
// pour l'eau ; mode « Pyrofluid d'origine » = Cp polynomiaux Pyrofluid (H_Fumees),
// Cp eau = 1 kcal/kg/°C et pression d'eau par la loi d'Antoine de Pyrofluid.

import { h_fumee } from '../../../A_Transverse_fonction/enthalpy_mix_gas';
import { H_Fumees } from '../../../A_Transverse_fonction/bilan_fct_FB';
import { hL_T, psat_T, rhoL_T } from '../../../A_Transverse_fonction/steam_table3';

export const KJ_PAR_KCAL = 4.1868;

export const CALCUL = {
  T_EAU_ENTREE: 'T_eau_entree',
  T_EAU_SORTIE: 'T_eau_sortie',
  T_FUMEES_SORTIE: 'T_fumees_sortie',
  T_FUMEES_ENTREE: 'T_fumees_entree', // mode Retro uniquement
  DEBIT_EAU: 'Debit_eau',
};

// Options proposées dans chaque mode (ordre d'affichage)
export const OPTIONS_BILAN = [CALCUL.T_EAU_ENTREE, CALCUL.T_EAU_SORTIE, CALCUL.T_FUMEES_SORTIE, CALCUL.DEBIT_EAU];
export const OPTIONS_RETRO = [CALCUL.T_EAU_ENTREE, CALCUL.T_EAU_SORTIE, CALCUL.T_FUMEES_ENTREE, CALCUL.DEBIT_EAU];

// Valeurs par défaut (Pyrofluid : Rdt 95 %, encrassement 25 %, OptionCalcul 3, U eau 66,
// ΔP économiseur 60 mmCE ; températures : cas Valence 450 kg MS/h).
export const PARAMS_DEFAUT_ECO = {
  calcul: CALCUL.DEBIT_EAU,
  T_fumees_sortie_C: 220,
  T_eau_entree_C: 160,
  T_eau_sortie_C: 180,
  Debit_eau_kg_h: 10000, // par échangeur
  Rdt_pct: 95,
  Encrassement_pct: 25,
  U_kcal_h_m2_C: 66,
  PDC_fumees_mmCE: 60,
  echangeurParFour: true,
  modeOrigine: false,
  DP_pompe_bar: 2,
  Rdt_pompe_pct: 70,
};

// Plages de saisie contrôlées par le formulaire Pyrofluid
export const PLAGE_RDT = [70, 100];
export const PLAGE_ENCRASSEMENT = [20, 35];
export const T_FUMEES_MIN_C = 125; // en dessous : alerte Pyrofluid (condensation acide)
export const T_FUMEES_MAX_C = 300; // au-dessus : alerte Pyrofluid (métaux peu volatils)

const num = (v, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};
const fini = (v) => typeof v === 'number' && Number.isFinite(v);

// ─── Propriétés ───────────────────────────────────────────────────────────────
// Enthalpie des fumées [kJ/h] (référence quelconque : seules les différences servent)
export const enthalpieFumees_kJ_h = (T, FG, modeOrigine) => (modeOrigine
  ? H_Fumees(0, FG.CO2, FG.H2O, 0, FG.N2, FG.O2, 0, 0, T) * 3600
  : h_fumee(T, FG.CO2, FG.H2O, FG.N2, FG.O2));

// Enthalpie de l'eau liquide [kJ/kg]
export const enthalpieEau_kJ_kg = (T, modeOrigine) => {
  if (modeOrigine) return KJ_PAR_KCAL * T; // Cp = 1 kcal/kg/°C
  if (!(T > 0.01 && T < 373.9)) return NaN;
  const h = hL_T(T);
  return fini(h) ? h : NaN;
};

// Pression de l'eau [bar] : saturation à la température de sortie
export const pressionEau_bar = (T, modeOrigine) => {
  if (modeOrigine) return 10 ** (7.96681 - 1668.21 / (228 + T)) / 750.06; // Antoine (Pyrofluid)
  if (!(T > 0.01 && T < 373.9)) return NaN;
  const p = psat_T(T);
  return fini(p) ? p : NaN;
};

export const masseVolumiqueEau_kg_m3 = (T) => {
  if (!(T > 0.01 && T < 373.9)) return 1000;
  const r = rhoL_T(T);
  return fini(r) && r > 0 ? r : 1000;
};

// Inversion par dichotomie d'une fonction croissante sur [a, b]
const inverser = (f, cible, a, b) => {
  let fa = f(a); const fb = f(b);
  if (!fini(cible) || !fini(fa) || !fini(fb) || cible < fa || cible > fb) return NaN;
  for (let i = 0; i < 100; i++) {
    const m = (a + b) / 2; const fm = f(m);
    if (!fini(fm)) return NaN;
    if (fm < cible) { a = m; fa = fm; } else { b = m; }
    if (b - a < 1e-7) break;
  }
  return (a + b) / 2;
};

const T_eau_depuis_h = (h, modeOrigine) => (modeOrigine
  ? h / KJ_PAR_KCAL
  : inverser((T) => enthalpieEau_kJ_kg(T, false), h, 0.02, 373.8));

// Puissance électrique d'une pompe [kW] : Qv [m³/h], ΔP [bar], rendement [%]
export const puissancePompe_kW = (Qv_m3_h, DP_bar, Rdt_pct) => {
  const eta = num(Rdt_pct) / 100;
  if (!(eta > 0) || !(Qv_m3_h > 0) || !(DP_bar > 0)) return 0;
  return (Qv_m3_h / 3600) * DP_bar * 1e5 / eta / 1000;
};

// ─── Calcul de l'économiseur ─────────────────────────────────────────────────
// entree : { FG: {CO2,H2O,O2,N2} kg/h (débit total), T_fumees_entree_C, T_fumees_sortie_C,
//            T_eau_entree_C, T_eau_sortie_C, Debit_eau_kg_h (par échangeur), nbEchangeurs,
//            Rdt_pct, Encrassement_pct, U_kcal_h_m2_C, modeOrigine, calcul }
// Les puissances renvoyées sont totales (tous échangeurs) sauf suffixe _ech.
export const calculEconomiseur = (entree = {}) => {
  const p = { ...PARAMS_DEFAUT_ECO, ...entree };
  const FG = {
    CO2: num(p.FG?.CO2), H2O: num(p.FG?.H2O), O2: num(p.FG?.O2), N2: num(p.FG?.N2),
  };
  const mFumees = FG.CO2 + FG.H2O + FG.O2 + FG.N2;
  const nb = Math.max(1, Math.round(num(p.nbEchangeurs, 1)));
  const origine = !!p.modeOrigine;
  const calcul = p.calcul;
  const rdt = num(p.Rdt_pct) / 100;
  const enc = num(p.Encrassement_pct);
  const U = num(p.U_kcal_h_m2_C);

  let Tfe = num(p.T_fumees_entree_C);
  let Tfs = num(p.T_fumees_sortie_C);
  let Tee = num(p.T_eau_entree_C);
  let Tse = num(p.T_eau_sortie_C);
  let m = num(p.Debit_eau_kg_h); // par échangeur

  const erreurs = [];
  const alertes = [];
  const Hf = (T) => enthalpieFumees_kJ_h(T, FG, origine);
  const hw = (T) => enthalpieEau_kJ_kg(T, origine);

  let Qf = NaN; // kJ/h cédés par les fumées (total)
  let Qe = NaN; // kJ/h reçus par l'eau (total)

  if (!(rdt > 0)) erreurs.push('errRdt');
  if (!(mFumees > 0)) erreurs.push('errFumees');

  const bilanFumees = () => { Qf = Hf(Tfe) - Hf(Tfs); Qe = rdt * Qf; };
  const bilanEau = () => {
    const dh = hw(Tse) - hw(Tee);
    if (!fini(dh)) { erreurs.push('errTempEau'); return; }
    if (!(m > 0)) { erreurs.push('errDebit'); return; }
    Qe = m * dh * nb;
    Qf = rdt > 0 ? Qe / rdt : NaN;
  };

  if (!erreurs.length) {
    switch (calcul) {
      case CALCUL.T_EAU_ENTREE: {
        bilanFumees();
        if (!(m > 0)) { erreurs.push('errDebit'); break; }
        Tee = T_eau_depuis_h(hw(Tse) - Qe / nb / m, origine);
        if (!fini(Tee)) erreurs.push('errTempEau');
        break;
      }
      case CALCUL.T_EAU_SORTIE: {
        bilanFumees();
        if (!(m > 0)) { erreurs.push('errDebit'); break; }
        Tse = T_eau_depuis_h(hw(Tee) + Qe / nb / m, origine);
        if (!fini(Tse)) erreurs.push('errTempEau');
        break;
      }
      case CALCUL.T_FUMEES_SORTIE: {
        bilanEau();
        if (erreurs.length) break;
        Tfs = inverser(Hf, Hf(Tfe) - Qf, 0, Tfe);
        if (!fini(Tfs)) erreurs.push('errTempFumees');
        break;
      }
      case CALCUL.T_FUMEES_ENTREE: {
        bilanEau();
        if (erreurs.length) break;
        Tfe = inverser(Hf, Hf(Tfs) + Qf, Tfs, 2000);
        if (!fini(Tfe)) erreurs.push('errTempFumees');
        break;
      }
      default: { // CALCUL.DEBIT_EAU
        bilanFumees();
        const dh = hw(Tse) - hw(Tee);
        if (!fini(dh)) { erreurs.push('errTempEau'); break; }
        if (!(dh > 0)) { erreurs.push('errDtEau'); m = NaN; break; }
        m = Qe / nb / dh;
      }
    }
  }

  // Cp moyen des fumées [kcal/kg/°C]
  const dTf = Tfe - Tfs;
  const Cp_fumees_moy = (mFumees > 0 && dTf !== 0 && fini(Qf)) ? Qf / KJ_PAR_KCAL / (mFumees * dTf) : NaN;

  // Différence de température moyenne logarithmique (contre-courant) — contrôles Pyrofluid
  const DtFum = Tfe - Tfs;     // refroidissement des fumées
  const dTFluide = Tse - Tee;  // échauffement de l'eau
  const chaud = Tfe - Tse;     // extrémité chaude
  const froid = Tfs - Tee;     // extrémité froide
  const dTSort = Tfs - Tse;    // fumées sortie / eau sortie
  const temperaturesOk = [Tfe, Tfs, Tee, Tse].every(fini);
  let DTML = NaN;
  if (temperaturesOk) {
    if (DtFum <= 0) erreurs.push('errDtFumees');
    if (dTFluide <= 0 && !erreurs.includes('errDtEau')) erreurs.push('errDtEau');
    if (chaud <= 0) erreurs.push('errChaude');
    if (froid <= 0) erreurs.push('errFroide');
    if (dTSort <= 0) erreurs.push('errCroisement');
    // Comme Pyrofluid : pas de DTml (donc pas de surface) si une condition n'est pas remplie
    if (DtFum > 0 && dTFluide > 0 && chaud > 0 && froid > 0 && dTSort > 0) {
      DTML = Math.abs(chaud - froid) < 1e-9 ? chaud : (chaud - froid) / Math.log(chaud / froid);
    }
  }
  const F = 1; // Pyrofluid : facteur correctif forcé à 1

  // Dimensionnement (par échangeur)
  const Qf_ech_kcal_h = fini(Qf) ? Qf / KJ_PAR_KCAL / nb : NaN;
  const Qe_ech_kcal_h = fini(Qe) ? Qe / KJ_PAR_KCAL / nb : NaN;
  const UA_ech = (DTML > 0 && fini(Qf_ech_kcal_h)) ? Qf_ech_kcal_h / (F * DTML) : NaN;
  const S_ech_m2 = (U > 0 && fini(UA_ech)) ? UA_ech / U / 1.25 * (1 + enc / 100) : NaN;

  const P_eau_bar = fini(Tse) ? pressionEau_bar(Tse, origine) : NaN;
  if (!origine && fini(Tse) && Tse >= 373.9) erreurs.push('errTempEau');

  const Debit_eau_tot_kg_h = fini(m) ? m * nb : NaN;
  const Qv_eau_tot_m3_h = fini(Debit_eau_tot_kg_h) ? Debit_eau_tot_kg_h / masseVolumiqueEau_kg_m3(Tee) : NaN;

  // Alertes (non bloquantes)
  if (fini(Tfs) && Tfs < T_FUMEES_MIN_C) alertes.push('alerteTfs125');
  if (fini(Tfs) && Tfs > T_FUMEES_MAX_C) alertes.push('alerteTfs300');
  if (num(p.Rdt_pct) < PLAGE_RDT[0] || num(p.Rdt_pct) > PLAGE_RDT[1]) alertes.push('alerteRdtPlage');
  if (enc < PLAGE_ENCRASSEMENT[0] || enc > PLAGE_ENCRASSEMENT[1]) alertes.push('alerteEncPlage');
  if (!(U > 0)) erreurs.push('errU');

  const uniques = [...new Set(erreurs)];
  return {
    calcul,
    modeOrigine: origine,
    nbEchangeurs: nb,
    T_fumees_entree_C: Tfe,
    T_fumees_sortie_C: Tfs,
    T_eau_entree_C: Tee,
    T_eau_sortie_C: Tse,
    Debit_eau_ech_kg_h: m,
    Debit_eau_tot_kg_h,
    Qv_eau_tot_m3_h,
    Masse_fumees_kg_h: mFumees,
    Q_fumees_kW: fini(Qf) ? Qf / 3600 : NaN,
    Q_eau_kW: fini(Qe) ? Qe / 3600 : NaN,
    Q_fumees_kcal_h: fini(Qf) ? Qf / KJ_PAR_KCAL : NaN,
    Q_eau_kcal_h: fini(Qe) ? Qe / KJ_PAR_KCAL : NaN,
    Q_fumees_ech_kcal_h: Qf_ech_kcal_h,
    Q_eau_ech_kcal_h: Qe_ech_kcal_h,
    Cp_fumees_moy_kcal_kg_C: Cp_fumees_moy,
    DTML_C: DTML,
    F,
    UA_ech_kcal_h_C: UA_ech,
    U_kcal_h_m2_C: U,
    U_W_m2_K: U * KJ_PAR_KCAL / 3.6,
    Rdt_pct: num(p.Rdt_pct),
    Encrassement_pct: enc,
    S_ech_m2,
    S_tot_m2: fini(S_ech_m2) ? S_ech_m2 * nb : NaN,
    P_eau_bar,
    erreurs: uniques,
    alertes,
    valide: uniques.length === 0,
  };
};
