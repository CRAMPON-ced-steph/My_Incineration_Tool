// ─── Économiseur Pyrofluid : échangeur fumées → eau ou fumées → air ──────────
//
// Reprise de Pyrofluid V4.5 : ClassEconomiseur.vb + Economiseur.vb (bloc 4-1, dossier
// « 04 Refroidissement Fumées »). Pyrofluid y choisit le fluide (OptionFluide) :
//   0 = eau → nœud « Cooling_HX_eau » (Y_BILAN/ECHANGEURS/WATERCOOLER)
//   1 = air → nœud « Cooling_HX_air » (Y_BILAN/ECHANGEURS/AIRCOOLER)
//
// 4 options de calcul (OptionCalcul) :
//   0 : T° entrée fluide   (données : T sortie fumées, T sortie fluide, débit de fluide)
//   1 : T° sortie fluide   (données : T entrée fluide, T sortie fumées, débit de fluide)
//   2 : T° sortie fumées   (données : T entrée fluide, T sortie fluide, débit de fluide)
//   3 : débit de fluide    (données : T entrée fluide, T sortie fluide, T sortie fumées) — défaut
// Le mode Retro ajoute « T° entrée fumées » (la T de sortie est imposée par l'aval).
//
// Bilan : Q fumées = H(T entrée) − H(T sortie) ; Q fluide = Rdt × Q fumées.
// DTml contre-courant (5 contrôles Pyrofluid), F = 1, UA = Q fumées / DTml,
// S = UA / U / 1,25 × (1 + encrassement). U fixé d'après des affaires :
// eau 66 kcal/h/m²/°C (« affaire Lagny »), air 39 kcal/h/m²/°C (2 passes).
// Pyrofluid dimensionne un économiseur par four (débits fumées / NombreFour).
//
// Propriétés : mode outil = NIST (fumées h_fumee, air fh_AIR) et IAPWS-IF97 (eau liquide
// saturée) ; mode « Pyrofluid d'origine » = Cp polynomiaux Pyrofluid (H_Fumees ; air
// Cp = 0,241 + 0,000044 T kcal/kg/°C), Cp eau = 1 kcal/kg/°C, pression d'eau par Antoine.

import { h_fumee } from '../../../A_Transverse_fonction/enthalpy_mix_gas';
import { fh_AIR } from '../../../A_Transverse_fonction/enthalpy_gas';
import { H_Fumees } from '../../../A_Transverse_fonction/bilan_fct_FB';
import { rho_air, T_ref } from '../../../A_Transverse_fonction/constantes';
import { hL_T, psat_T, rhoL_T } from '../../../A_Transverse_fonction/steam_table3';

export const KJ_PAR_KCAL = 4.1868;

export const FLUIDE = { EAU: 'eau', AIR: 'air' };

export const CALCUL = {
  T_FLUIDE_ENTREE: 'T_fluide_entree',
  T_FLUIDE_SORTIE: 'T_fluide_sortie',
  T_FUMEES_SORTIE: 'T_fumees_sortie',
  T_FUMEES_ENTREE: 'T_fumees_entree', // mode Retro uniquement
  DEBIT_FLUIDE: 'Debit_fluide',
};

// Options proposées dans chaque mode (ordre d'affichage)
export const OPTIONS_BILAN = [CALCUL.T_FLUIDE_ENTREE, CALCUL.T_FLUIDE_SORTIE, CALCUL.T_FUMEES_SORTIE, CALCUL.DEBIT_FLUIDE];
export const OPTIONS_RETRO = [CALCUL.T_FLUIDE_ENTREE, CALCUL.T_FLUIDE_SORTIE, CALCUL.T_FUMEES_ENTREE, CALCUL.DEBIT_FLUIDE];

// Valeurs par défaut (Pyrofluid : Rdt 95 %, encrassement 25 %, OptionCalcul 3, U eau 66 / air 39,
// ΔP économiseur côté fumées 60 mmCE). Températures : eau = cas Valence 450 kg MS/h ;
// air = réchauffage d'air ambiant (Pyrofluid n'a pas de valeur par défaut, saisie à 0).
const COMMUN = {
  calcul: CALCUL.DEBIT_FLUIDE,
  T_fumees_sortie_C: 220,
  Debit_fluide_kg_h: 10000, // par échangeur
  Rdt_pct: 95,
  Encrassement_pct: 25,
  PDC_fumees_mmCE: 60,
  echangeurParFour: true,
  modeOrigine: false,
};
export const PARAMS_DEFAUT = {
  [FLUIDE.EAU]: {
    ...COMMUN, fluide: FLUIDE.EAU, T_fluide_entree_C: 160, T_fluide_sortie_C: 180, U_kcal_h_m2_C: 66,
    DP_pompe_bar: 2, Rdt_pompe_pct: 70,
  },
  [FLUIDE.AIR]: {
    ...COMMUN, fluide: FLUIDE.AIR, T_fluide_entree_C: 20, T_fluide_sortie_C: 180, U_kcal_h_m2_C: 39,
    DP_ventilateur_mmCE: 150, Rdt_ventilateur_pct: 70,
  },
};

// Paramètres enregistrés avec les anciens noms de l'économiseur à eau (avant le noyau commun)
const ANCIENS_NOMS = { T_eau_entree_C: 'T_fluide_entree_C', T_eau_sortie_C: 'T_fluide_sortie_C', Debit_eau_kg_h: 'Debit_fluide_kg_h' };
const ANCIENS_CALCULS = { T_eau_entree: CALCUL.T_FLUIDE_ENTREE, T_eau_sortie: CALCUL.T_FLUIDE_SORTIE, Debit_eau: CALCUL.DEBIT_FLUIDE };
export const migrerParams = (p = {}) => {
  const out = { ...p };
  for (const [ancien, nouveau] of Object.entries(ANCIENS_NOMS)) {
    if (out[ancien] !== undefined && out[nouveau] === undefined) out[nouveau] = out[ancien];
    delete out[ancien];
  }
  if (ANCIENS_CALCULS[out.calcul]) out.calcul = ANCIENS_CALCULS[out.calcul];
  return out;
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

// Domaine de température du fluide [°C]
const DOMAINE = { [FLUIDE.EAU]: [0.02, 373.8], [FLUIDE.AIR]: [-50, 1500] };

// Enthalpie massique du fluide [kJ/kg]
export const enthalpieFluide_kJ_kg = (T, fluide, modeOrigine) => {
  if (fluide === FLUIDE.AIR) {
    if (modeOrigine) return KJ_PAR_KCAL * (0.241 * T + 0.000044 / 2 * T * T); // Pyrofluid
    const h = fh_AIR(T);
    return fini(h) ? h : NaN;
  }
  if (modeOrigine) return KJ_PAR_KCAL * T; // Cp eau = 1 kcal/kg/°C
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

// Air sec à la pression atmosphérique [kg/m³]
export const masseVolumiqueAir_kg_m3 = (T) => rho_air * T_ref / (T_ref + T);

// Inversion par dichotomie d'une fonction croissante sur [a, b]
const inverser = (f, cible, a, b) => {
  const fa = f(a); const fb = f(b);
  if (!fini(cible) || !fini(fa) || !fini(fb) || cible < fa || cible > fb) return NaN;
  for (let i = 0; i < 100; i++) {
    const m = (a + b) / 2; const fm = f(m);
    if (!fini(fm)) return NaN;
    if (fm < cible) a = m; else b = m;
    if (b - a < 1e-7) break;
  }
  return (a + b) / 2;
};

const T_fluide_depuis_h = (h, fluide, modeOrigine) => {
  if (fluide === FLUIDE.EAU && modeOrigine) return h / KJ_PAR_KCAL;
  const [a, b] = DOMAINE[fluide];
  return inverser((T) => enthalpieFluide_kJ_kg(T, fluide, modeOrigine), h, a, b);
};

// Puissance électrique d'une pompe [kW] : Qv [m³/h], ΔP [bar], rendement [%]
export const puissancePompe_kW = (Qv_m3_h, DP_bar, Rdt_pct) => {
  const eta = num(Rdt_pct) / 100;
  if (!(eta > 0) || !(Qv_m3_h > 0) || !(DP_bar > 0)) return 0;
  return (Qv_m3_h / 3600) * DP_bar * 1e5 / eta / 1000;
};

// Puissance électrique d'un ventilateur [kW] : Qv [m³/h], ΔP [mmCE], rendement [%]
export const puissanceVentilateur_kW = (Qv_m3_h, DP_mmCE, Rdt_pct) => {
  const eta = num(Rdt_pct) / 100;
  if (!(eta > 0) || !(Qv_m3_h > 0) || !(DP_mmCE > 0)) return 0;
  return (Qv_m3_h / 3600) * DP_mmCE * 9.80665 / eta / 1000;
};

// Auxiliaire du circuit de fluide (absent de Pyrofluid, ajouté pour l'OPEX) :
// eau → pompe de circulation (ΔP en bar), air → ventilateur (ΔP en mmCE).
export const AUXILIAIRE = {
  [FLUIDE.EAU]: { cleDP: 'DP_pompe_bar', cleRdt: 'Rdt_pompe_pct', puissance_kW: puissancePompe_kW, decDP: 2 },
  [FLUIDE.AIR]: { cleDP: 'DP_ventilateur_mmCE', cleRdt: 'Rdt_ventilateur_pct', puissance_kW: puissanceVentilateur_kW, decDP: 0 },
};

// ─── Calcul de l'économiseur ─────────────────────────────────────────────────
// entree : { fluide, FG: {CO2,H2O,O2,N2} kg/h (débit total), T_fumees_entree_C, T_fumees_sortie_C,
//            T_fluide_entree_C, T_fluide_sortie_C, Debit_fluide_kg_h (par échangeur), nbEchangeurs,
//            Rdt_pct, Encrassement_pct, U_kcal_h_m2_C, modeOrigine, calcul }
// Les puissances renvoyées sont totales (tous échangeurs) sauf suffixe _ech.
export const calculEconomiseur = (entree = {}) => {
  const fluide = entree.fluide === FLUIDE.AIR ? FLUIDE.AIR : FLUIDE.EAU;
  const p = { ...PARAMS_DEFAUT[fluide], ...migrerParams(entree), fluide };
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
  let Tle = num(p.T_fluide_entree_C);
  let Tls = num(p.T_fluide_sortie_C);
  let m = num(p.Debit_fluide_kg_h); // par échangeur

  const erreurs = [];
  const alertes = [];
  const Hf = (T) => enthalpieFumees_kJ_h(T, FG, origine);
  const hl = (T) => enthalpieFluide_kJ_kg(T, fluide, origine);
  const T_depuis_h = (h) => T_fluide_depuis_h(h, fluide, origine);

  let Qf = NaN; // kJ/h cédés par les fumées (total)
  let Ql = NaN; // kJ/h reçus par le fluide (total)

  if (!(rdt > 0)) erreurs.push('errRdt');
  if (!(mFumees > 0)) erreurs.push('errFumees');

  const bilanFumees = () => { Qf = Hf(Tfe) - Hf(Tfs); Ql = rdt * Qf; };
  const bilanFluide = () => {
    const dh = hl(Tls) - hl(Tle);
    if (!fini(dh)) { erreurs.push('errTempFluide'); return; }
    if (!(m > 0)) { erreurs.push('errDebit'); return; }
    Ql = m * dh * nb;
    Qf = rdt > 0 ? Ql / rdt : NaN;
  };

  if (!erreurs.length) {
    switch (calcul) {
      case CALCUL.T_FLUIDE_ENTREE: {
        bilanFumees();
        if (!(m > 0)) { erreurs.push('errDebit'); break; }
        Tle = T_depuis_h(hl(Tls) - Ql / nb / m);
        if (!fini(Tle)) erreurs.push('errTempFluide');
        break;
      }
      case CALCUL.T_FLUIDE_SORTIE: {
        bilanFumees();
        if (!(m > 0)) { erreurs.push('errDebit'); break; }
        Tls = T_depuis_h(hl(Tle) + Ql / nb / m);
        if (!fini(Tls)) erreurs.push('errTempFluide');
        break;
      }
      case CALCUL.T_FUMEES_SORTIE: {
        bilanFluide();
        if (erreurs.length) break;
        Tfs = inverser(Hf, Hf(Tfe) - Qf, 0, Tfe);
        if (!fini(Tfs)) erreurs.push('errTempFumees');
        break;
      }
      case CALCUL.T_FUMEES_ENTREE: {
        bilanFluide();
        if (erreurs.length) break;
        Tfe = inverser(Hf, Hf(Tfs) + Qf, Tfs, 2000);
        if (!fini(Tfe)) erreurs.push('errTempFumees');
        break;
      }
      default: { // CALCUL.DEBIT_FLUIDE
        bilanFumees();
        const dh = hl(Tls) - hl(Tle);
        if (!fini(dh)) { erreurs.push('errTempFluide'); break; }
        if (!(dh > 0)) { erreurs.push('errDtFluide'); m = NaN; break; }
        m = Ql / nb / dh;
      }
    }
  }

  // Cp moyen des fumées [kcal/kg/°C]
  const dTf = Tfe - Tfs;
  const Cp_fumees_moy = (mFumees > 0 && dTf !== 0 && fini(Qf)) ? Qf / KJ_PAR_KCAL / (mFumees * dTf) : NaN;

  // Différence de température moyenne logarithmique (contre-courant) — contrôles Pyrofluid
  const DtFum = Tfe - Tfs;     // refroidissement des fumées
  const dTFluide = Tls - Tle;  // échauffement du fluide
  const chaud = Tfe - Tls;     // extrémité chaude
  const froid = Tfs - Tle;     // extrémité froide
  const dTSort = Tfs - Tls;    // fumées sortie / fluide sortie
  let DTML = NaN;
  if ([Tfe, Tfs, Tle, Tls].every(fini)) {
    if (DtFum <= 0) erreurs.push('errDtFumees');
    if (dTFluide <= 0 && !erreurs.includes('errDtFluide')) erreurs.push('errDtFluide');
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
  const Ql_ech_kcal_h = fini(Ql) ? Ql / KJ_PAR_KCAL / nb : NaN;
  const UA_ech = (DTML > 0 && fini(Qf_ech_kcal_h)) ? Qf_ech_kcal_h / (F * DTML) : NaN;
  const S_ech_m2 = (U > 0 && fini(UA_ech)) ? UA_ech / U / 1.25 * (1 + enc / 100) : NaN;

  const eau = fluide === FLUIDE.EAU;
  const P_eau_bar = eau && fini(Tls) ? pressionEau_bar(Tls, origine) : NaN;
  if (eau && !origine && fini(Tls) && Tls >= 373.9) erreurs.push('errTempFluide');

  const Debit_fluide_tot_kg_h = fini(m) ? m * nb : NaN;
  const rhoEntree = eau ? masseVolumiqueEau_kg_m3(Tle) : masseVolumiqueAir_kg_m3(Tle);
  const Qv_fluide_tot_m3_h = fini(Debit_fluide_tot_kg_h) ? Debit_fluide_tot_kg_h / rhoEntree : NaN;
  const Qn_fluide_tot_Nm3_h = !eau && fini(Debit_fluide_tot_kg_h) ? Debit_fluide_tot_kg_h / rho_air : NaN;

  // Alertes (non bloquantes)
  if (fini(Tfs) && Tfs < T_FUMEES_MIN_C) alertes.push('alerteTfs125');
  if (fini(Tfs) && Tfs > T_FUMEES_MAX_C) alertes.push('alerteTfs300');
  if (num(p.Rdt_pct) < PLAGE_RDT[0] || num(p.Rdt_pct) > PLAGE_RDT[1]) alertes.push('alerteRdtPlage');
  if (enc < PLAGE_ENCRASSEMENT[0] || enc > PLAGE_ENCRASSEMENT[1]) alertes.push('alerteEncPlage');
  if (!(U > 0)) erreurs.push('errU');

  const uniques = [...new Set(erreurs)];
  return {
    fluide,
    calcul,
    modeOrigine: origine,
    nbEchangeurs: nb,
    T_fumees_entree_C: Tfe,
    T_fumees_sortie_C: Tfs,
    T_fluide_entree_C: Tle,
    T_fluide_sortie_C: Tls,
    Debit_fluide_ech_kg_h: m,
    Debit_fluide_tot_kg_h,
    Qv_fluide_tot_m3_h,
    Qn_fluide_tot_Nm3_h,
    Masse_fumees_kg_h: mFumees,
    Q_fumees_kW: fini(Qf) ? Qf / 3600 : NaN,
    Q_fluide_kW: fini(Ql) ? Ql / 3600 : NaN,
    Q_fumees_kcal_h: fini(Qf) ? Qf / KJ_PAR_KCAL : NaN,
    Q_fluide_kcal_h: fini(Ql) ? Ql / KJ_PAR_KCAL : NaN,
    Q_fumees_ech_kcal_h: Qf_ech_kcal_h,
    Q_fluide_ech_kcal_h: Ql_ech_kcal_h,
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
