import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════
// TOUR DE LAVAGE — Portage React complet du module VB.NET Pyrofluid
// (TourLavage.vb + ClassTourLavage.vb, voie humide)
// Branches portées : SousRef = 0 (sans condenseur) et SousRef = 1 (avec
// sous-refroidissement / condenseur), TypeVerif = VSP / Autres / Aucun.
//
// Code couleur hérité de l'outil d'origine :
//   cyan  = valeur saisie   |   jaune = valeur calculée   |   rouge = hors plage
// ═══════════════════════════════════════════════════════════════════

// ----- Constantes -----
const M = { CO2: 44, H2O: 18, O2: 32, N2: 28, SO2: 64, HCl: 36.5, NaOH: 40 };
const VM = 22.4; // Nm3/kmol (valeur legacy)

// Diamètres standards & débits d'arrosage associés (m3/h) — legacy
const DIAM_STD = [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8];
const DEBIT_STD = [25, 40, 60, 70, 80, 100, 120];

// ----- Fonctions thermodynamiques (simplifiées / issues du legacy) -----

// Pression de vapeur saturante de l'eau (Antoine, mmHg)
const psatH2O = (t) => (t <= -228 ? 0 : Math.pow(10, 7.9688 - 1668.21 / (228 + t)));

// Viscosité dynamique de l'eau liquide (Pa.s)
const muEau = (t) =>
  1e-3 *
  Math.pow(
    10,
    -10.73 + 1828 / (273 + t) + 1.966e-2 * (273 + t) - 14.66e-6 * Math.pow(273 + t, 2)
  );

// Masse volumique de l'eau liquide (kg/m3) — Rackett
const roEau = (t) =>
  0.3471 * Math.pow(0.274, -Math.pow(1 - (t + 273) / (374.2 + 273), 2 / 7)) * 1000;

// Tension superficielle de l'eau (N/m)
const sigmaEau = (t) => 71.97e-3 * Math.pow((374.2 - t) / (374.2 - 25), 0.8105);

// Capacité calorifique du liquide de refroidissement (kcal/(kg.°C)) — legacy A9
const cpLiquide = (t) =>
  0.6741 + 2.825e-3 * (t + 273) - 8.371e-6 * Math.pow(t + 273, 2) + 8.601e-9 * Math.pow(t + 273, 3);

// Capacité calorifique de l'eau vapeur (kcal/(kg.°C)) — legacy A16
const cpgEau = (t) =>
  (8.1 - 0.72e-3 * (t + 273) + 3.63e-6 * Math.pow(t + 273, 2) - 1.16e-9 * Math.pow(t + 273, 3)) / 18;

// Enthalpie des fumées (kcal/h) — polynômes Cp legacy (A7 / A17)
// latent : 597 kcal/kg pour l'entrée, 547 pour la sortie condenseur (convention legacy)
function enthalpieFumees(T, m, latent) {
  const sens1 =
    T * (0.226 * m.CO2 + 0.427 * m.H2O + 0.225 * m.O2 + 0.239 * m.N2 + 0.164 * m.SO2 + 0.19 * m.HCl);
  const sens2 =
    T * T *
    (46.5e-6 * m.CO2 + 80.5e-6 * m.H2O + 24.5e-6 * m.O2 + 27e-6 * m.N2 + 25.5e-6 * m.SO2 + 11.5e-6 * m.HCl);
  return sens1 + sens2 + m.H2O * latent;
}

// Viscosité dynamique du mélange gazeux (Pa.s) — polynôme legacy pondéré √M
function muFumees(y, tC) {
  const s = (k) => Math.sqrt(M[k]);
  const den = y.CO2 * s("CO2") + y.H2O * s("H2O") + y.O2 * s("O2") + y.N2 * s("N2");
  if (den <= 0) return 1.8e-5;
  const a1 =
    (25.45 * y.CO2 * s("CO2") + 30.43 * y.N2 * s("N2") + 18.11 * y.O2 * s("O2") - 31.89 * y.H2O * s("H2O")) / den;
  const a2 =
    (0.4549 * y.CO2 * s("CO2") + 0.4989 * y.N2 * s("N2") + 0.6632 * y.O2 * s("O2") + 0.4145 * y.H2O * s("H2O")) / den;
  const a3 =
    (-8.649e-5 * y.CO2 * s("CO2") - 1.093e-4 * y.N2 * s("N2") - 1.879e-4 * y.O2 * s("O2") - 8.272e-6 * y.H2O * s("H2O")) / den;
  const TK = tC + 273;
  return (a1 + a2 * TK + a3 * TK * TK) * 1e-7;
}

const arrondi05 = (x) => Math.ceil(x * 2) / 2;
const volDe = (m) => ({
  CO2: (m.CO2 * VM) / M.CO2, H2O: (m.H2O * VM) / M.H2O, N2: (m.N2 * VM) / M.N2,
  O2: (m.O2 * VM) / M.O2, SO2: (m.SO2 * VM) / M.SO2, HCl: (m.HCl * VM) / M.HCl,
});
const somme = (o) => Object.values(o).reduce((a, b) => a + b, 0);

// ═══════════════════════════════════════════════════════════════════
// Moteur de calcul (transcription de ClassTourLavage.Calcul, deux branches)
// ═══════════════════════════════════════════════════════════════════
function calculTour(inp) {
  const Tin = inp.tempFumees;
  const p = 760 - Math.abs(inp.pTotal / 13.595); // mmCE → mmHg

  // ─── Fumées en entrée ───
  const masIn = { CO2: inp.mCO2, H2O: inp.mH2O, N2: inp.mN2, O2: inp.mO2, SO2: inp.mSO2, HCl: inp.mHCl };
  const volIn = volDe(masIn);
  const masTotIn = somme(masIn) + inp.mPoussieres;
  const volTotIn = somme(volIn);
  const volSecIn = volTotIn - volIn.H2O;
  if (volTotIn <= 0 || volSecIn <= 0) return null;

  const pO2in = (volIn.O2 / volSecIn) * 100;
  const corr = (o2) => 10 / (21 - o2); // correction à 11 % O2 sur sec
  const concSO2In = ((masIn.SO2 * 1e6) / volSecIn) * corr(pO2in);
  const concHClIn = ((masIn.HCl * 1e6) / volSecIn) * corr(pO2in);
  const entIn = enthalpieFumees(Tin, masIn, 597);

  // ─── Étage condenseur (SousRef = 1) ───
  let cond = null;
  let masAbs, tAbs; // gaz & température à l'entrée de la partie absorption
  if (inp.sousRef) {
    const Tc = inp.tempSortieCond;
    const psatC = psatH2O(Tc);
    // A4-A6 : eau résiduelle à saturation à Tc
    const molIncond = ((volTotIn - volIn.H2O - volIn.HCl) * 1000) / VM;
    const mH2Oc = psatC < p ? (psatC / (p - psatC)) * molIncond * (M.H2O / 1000) : masIn.H2O;
    const condensat = Math.max(masIn.H2O - mH2Oc, 0); // A10
    const masC = { ...masIn, H2O: mH2Oc };
    // A7-A8 : bilan enthalpique
    const entOut = enthalpieFumees(Tc, masC, 547);
    const deltaEnt = entIn - entOut;
    const cpL = cpLiquide(inp.tempLiqRef);
    // A11 : débit d'eau de refroidissement
    const dT = Tin - inp.tempLiqRef;
    const eauRefroid = dT !== 0 ? (deltaEnt / cpL - Tin * condensat) / dT : 0;
    // A12-A14
    const eauEntreeCond = eauRefroid + inp.debArrosage;
    const eauSortieCond = eauEntreeCond + condensat;
    const tSortieLiq = eauSortieCond > 0 ? (deltaEnt / cpL + eauEntreeCond * inp.tempLiqRef) / eauSortieCond : 0;
    // A15 : LMTD
    const d1 = Tin - tSortieLiq;
    const d2 = Math.abs(inp.tempLiqRef - Tc);
    const lmtd = d2 > 0 && d1 > 0 && d1 !== d2 ? (d1 - d2) / Math.log(d1 / d2) : d1;
    // A16-A19 : chaleurs sensibles
    const cpg = cpgEau((Tin + Tc) / 2);
    const chalSenIn = entIn - masIn.H2O * 597;
    const chalSenOut = entOut - mH2Oc * 597;
    const deltaChalSen = chalSenIn - chalSenOut;
    cond = { Tc, psatC, mH2Oc, condensat, masC, entOut, deltaEnt, eauRefroid, eauEntreeCond, tSortieLiq, lmtd, cpg, deltaChalSen };
    masAbs = masC;
    tAbs = Tc;
  } else {
    masAbs = masIn;
    tAbs = Tin;
  }

  // ─── Gaz à l'entrée de la partie absorption ───
  const volAbs = volDe(masAbs);
  const masTotAbs = somme(masAbs);
  const volTotAbs = somme(volAbs);
  const y = { CO2: volAbs.CO2 / volTotAbs, H2O: volAbs.H2O / volTotAbs, O2: volAbs.O2 / volTotAbs, N2: volAbs.N2 / volTotAbs };
  const roGaz = masTotAbs / ((volTotAbs * (tAbs + 273)) / 273);
  const muGaz = muFumees(y, tAbs);

  // ─── Liquide de lavage (entrée absorption à tAbs) ───
  const muLiq = muEau(tAbs), muLiq20 = muEau(20);
  const roLiq = roEau(tAbs), roLiq20 = roEau(20);
  const nuLiq = muLiq / roLiq, nuLiq20 = muLiq20 / roLiq20;
  const sigmaLiq = sigmaEau(tAbs);

  // ─── Diamètre de colonne : flux d'engorgement ───
  const L = inp.debArrosage;
  const vf1 = (L / masTotAbs) * Math.sqrt(roGaz / roLiq);
  const vf2 = Math.exp(-4 * Math.pow(vf1, 0.25));
  const fluxEngor =
    inp.facteurGarn > 0
      ? 3600 * Math.sqrt((vf2 * 9.81 * roGaz * roLiq) / (inp.facteurGarn * Math.pow(nuLiq / nuLiq20, 0.2)))
      : 0;
  const fluxReel = 0.7 * fluxEngor;
  const sec1 = fluxReel > 0 ? masTotAbs / fluxReel : 0;
  const diamCalc = Math.sqrt((4 * sec1) / Math.PI);

  const D = inp.diamRetenu;
  const sec = (Math.PI * D * D) / 4;

  // ─── Hauteur du condenseur (A20, après la section de lavage) ───
  let hauteurCond = 0;
  if (cond && sec > 0 && cond.deltaChalSen !== 0) {
    const V = ((cond.lmtd * (9 / 5) + 32) * (cond.condensat * 2.2046) * cond.cpg) / (cond.deltaChalSen * 3.9683);
    if (V > 0 && V < 1) {
      const h1 = Math.pow(
        (-cond.condensat * 2.2046 * cond.cpg) /
          (0.0146 *
            Math.pow((masTotIn / sec) * 0.2048, 0.82) *
            Math.pow((cond.eauEntreeCond / sec) * 0.2048, 0.47) *
            (sec * 10.7643) *
            Math.log(1 - V)),
        1.613
      );
      hauteurCond = h1 * 0.3048 * 1.5;
    }
  }

  // ─── Vérifications ───
  const tauxMouil = sec > 0 && inp.surfaceVolGarn > 0 ? (L / sec) / (inp.surfaceVolGarn * roLiq) : 0;
  const rapport = inp.diamGarn > 0 ? diamCalc / inp.diamGarn : 0;
  const tauxEngor = sec > 0 && fluxEngor > 0 ? ((masTotAbs / sec) / fluxEngor) * 100 : 0;

  // ─── Corrélation d'Onda : surface mouillée & coefficients de transfert ───
  const TK = tAbs + 273;
  const Gp = masTotAbs / (sec * 3600);
  const Lp = L / (sec * 3600);
  const Ga = (9.81 * Math.pow(inp.diamGarn, 3) * roLiq * roLiq) / (muLiq * muLiq);
  const We = (inp.diamGarn * Lp * Lp) / (roLiq * sigmaLiq);
  const aw =
    We > 0 && Ga > 0 && inp.surfaceVolGarn > 0 && inp.sigmaTenSup > 0
      ? inp.surfaceVolGarn *
        (1 -
          Math.exp(
            -1.45 *
              Math.pow(inp.sigmaTenSup / sigmaLiq, 0.75) *
              Math.pow(inp.surfaceVolGarn * inp.diamGarn, -0.35) *
              Math.pow(Ga, 0.05) *
              Math.pow(We, 0.2)
          ))
      : 0;
  const Re = inp.surfaceVolGarn > 0 ? Gp / (inp.surfaceVolGarn * muGaz) : 0;
  const cOnda = inp.diamGarn > 0.015 ? 5.23 : 2;

  const difSO2 = 0.122e-4 * (TK / 273);
  const scSO2 = muGaz / (roGaz * difSO2);
  const kgSO2 =
    ((cOnda * difSO2 * inp.surfaceVolGarn) / (8.314 * TK)) *
    Math.pow(Re, 0.7) * Math.pow(scSO2, 1 / 3) *
    Math.pow(1 / (inp.surfaceVolGarn * inp.diamGarn), 2);
  const hutSO2 = aw > 0 && kgSO2 > 0 ? Gp / (roGaz * 8.314 * TK * aw * kgSO2) : 0;

  const difHCl =
    Math.pow(TK, 1.75) /
    (1e8 * (p / 760) * (14.9 * y.CO2 + 11.6 * y.N2 + 11.7 * y.O2 + 9.1 * y.H2O));
  const scHCl = muGaz / (roGaz * difHCl);
  const kgHCl =
    ((cOnda * difHCl * inp.surfaceVolGarn) / (8.314 * TK)) *
    Math.pow(Re, 0.7) * Math.pow(scHCl, 1 / 3) *
    Math.pow(1 / (inp.surfaceVolGarn * inp.diamGarn), 2);
  const hutHCl = aw > 0 && kgHCl > 0 ? Gp / (roGaz * 8.314 * TK * aw * kgHCl) : 0;

  // ─── NUT & hauteurs de garnissage ───
  const cibleSO2 = Math.min(inp.cibleSO2, concSO2In);
  const cibleHCl = Math.min(inp.cibleHCl, concHClIn);
  const nutSO2 = concSO2In > cibleSO2 && cibleSO2 > 0 ? Math.log(concSO2In / cibleSO2) : 0;
  const nutHCl = concHClIn > cibleHCl && cibleHCl > 0 ? Math.log(concHClIn / cibleHCl) : 0;
  const hGarnSO2 = nutSO2 * hutSO2 * 1.5 + 0.49;
  const hGarnHCl = nutHCl * hutHCl * 1.5 + 0.49;
  const hGarnRetenue = (hGarnSO2 + hGarnHCl) * inp.coefHautSat;

  // ─── Fumées en sortie : boucle itérative sur %O2 sec ───
  // H2O sortie : saturation à tAbs (quench si SousRef=0, condenseur si SousRef=1)
  const psatOut = psatH2O(tAbs);
  const molIncondS = ((volAbs.CO2 + volAbs.N2 + volAbs.O2) * 1000) / VM;
  const masH2Os = psatOut < p ? (psatOut / (p - psatOut)) * molIncondS * (M.H2O / 1000) : masAbs.H2O;

  let pO2s = pO2in;
  let volSecS = volTotAbs - volAbs.H2O;
  let masSO2s = 0, masHCls = 0, volTotS = volTotAbs;
  for (let i = 0; i < 200; i++) {
    masSO2s = cibleSO2 * 1e-6 * ((21 - pO2s) / 10) * volSecS;
    masHCls = cibleHCl * 1e-6 * ((21 - pO2s) / 10) * volSecS;
    const vSO2 = (masSO2s * VM) / M.SO2;
    const vHCl = (masHCls * VM) / M.HCl;
    const vH2O = (masH2Os * VM) / M.H2O;
    volTotS = volAbs.CO2 + volAbs.N2 + volAbs.O2 + vSO2 + vHCl + vH2O;
    volSecS = volTotS - vH2O;
    const pO2test = (volAbs.O2 / volSecS) * 100;
    const diff = Math.abs(pO2s - pO2test);
    pO2s = pO2test;
    if (diff < 1e-5) break;
  }
  const masTotS = masAbs.CO2 + masAbs.N2 + masAbs.O2 + masSO2s + masHCls + masH2Os;
  const roSortie = masTotS / ((volTotS * (tAbs + 273)) / 273);

  // ─── Pertes de charge du garnissage (TypeVerif) ───
  let dPGarn = 0;
  if (inp.typeGarn === "VSP" && sec > 0) {
    const x = (volTotAbs / (3600 * sec)) * ((tAbs + 273) / 273) * roGaz * roGaz;
    dPGarn = 0.1 * Math.exp(Math.min(1.97275 + 1.293 * x, 50)); // garde anti-débordement
  } else if (inp.typeGarn === "Autres" && sec > 0) {
    const a1 = 21.79 - 36.19 * Math.pow(vf1, 0.25) + 16.6 * Math.sqrt(vf1);
    const a2 = 7.06 + 10.3 * Math.pow(vf1, 0.25) - 10.36 * Math.sqrt(vf1);
    const a3 =
      (Math.pow(masTotAbs / 3600 / sec, 2) * inp.facteurGarn * Math.pow(nuLiq / nuLiq20, 0.2)) /
      (9.81 * roGaz * roLiq);
    dPGarn = (98 * (a3 / vf2) * (a1 + a2 * (a3 / vf2))) / 9.81;
  }
  const dPGarnH = hGarnRetenue > 0 ? dPGarn / hGarnRetenue : 0;

  // ─── Dévésiculeur ───
  const vitDevesEng = 0.08 * 3600 * Math.sqrt(Math.max(roLiq - roSortie, 0) / roSortie);
  const secDeves = vitDevesEng > 0 ? masTotS / (roSortie * vitDevesEng) : 0;
  const diamDeves = arrondi05(Math.sqrt((4 * secDeves) / Math.PI));
  const secDevesRet = (Math.PI * diamDeves * diamDeves) / 4;
  // « Vitesse retenue » legacy = masTot/section (kg/(m2.h) ≈ m/h car ρ ≈ 1) — conservé pour cohérence d'affichage
  const vitRetenue = secDevesRet > 0 ? masTotS / secDevesRet : 0;
  const dPDeves = 0.0169 * roSortie * inp.epaisDeves * Math.pow(vitRetenue / 3600, 1.85);

  // ─── Purge & appoint (partie absorption) ───
  const so2Purge = masAbs.SO2 - masSO2s;
  const purgeAbs = inp.concLiqSO2 > 0 ? so2Purge / (inp.concLiqSO2 / 100) : 0;
  const appointAbs = purgeAbs - so2Purge;
  const purgeTotale = purgeAbs + (cond ? cond.condensat : 0);

  // ─── Consommation de soude ───
  const P = inp.pourNaOH;
  const concNaOH = 0.1026 * P * P + 10.167 * P; // g/l
  const roNaOH = (0.0106 * P + 1.003) * 1000; // kg/m3
  const hclNeutralise = masAbs.HCl - masHCls;
  const masNaOH_SO2 = concNaOH > 0 ? roNaOH * (((so2Purge / M.SO2) * M.NaOH * 2) / concNaOH) : 0;
  const masNaOH_HCl = concNaOH > 0 ? roNaOH * (((hclNeutralise / M.HCl) * M.NaOH) / concNaOH) : 0;
  const masNaOHTot = masNaOH_SO2 + masNaOH_HCl;
  const volNaOHTot = (masNaOHTot / roNaOH) * 1000;
  // Dimensionnement maxi (neutralisation de la totalité de SO2 + HCl entrants)
  const masNaOHMaxi =
    concNaOH > 0
      ? roNaOH * (((masAbs.SO2 / M.SO2) * M.NaOH * 2) / concNaOH) +
        roNaOH * (((masAbs.HCl / M.HCl) * M.NaOH) / concNaOH)
      : 0;

  return {
    masTotIn, volTotIn, volSecIn, pO2in, concSO2In, concHClIn, entIn,
    cond, hauteurCond, tAbs,
    masTotAbs, volTotAbs, roGaz, muGaz, muLiq, roLiq, sigmaLiq,
    fluxEngor, fluxReel, diamCalc, sec,
    tauxMouil, rapport, tauxEngor,
    aw, Re, hutSO2, hutHCl, nutSO2, nutHCl, hGarnSO2, hGarnHCl, hGarnRetenue,
    cibleSO2, cibleHCl, masSO2s, masHCls, masH2Os, masTotS, volTotS, pO2s, roSortie,
    dPGarn, dPGarnH,
    vitDevesEng, diamDeves, vitRetenue, dPDeves,
    so2Purge, purgeAbs, appointAbs, purgeTotale,
    concNaOH, roNaOH, masNaOHTot, volNaOHTot, masNaOHMaxi,
  };
}

// ----- Formatage -----
const fmt = (x, d = 2) =>
  x === null || x === undefined || !isFinite(x)
    ? "—"
    : x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

// ----- Composants UI -----
function In({ label, value, onChange, unit, step = "any", disabled = false }) {
  return (
    <label className={"flex items-center justify-between gap-2 py-0.5 " + (disabled ? "opacity-40" : "")}>
      <span className="text-xs text-slate-600 leading-tight">{label}</span>
      <span className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 px-1.5 py-0.5 text-right text-sm font-mono bg-cyan-50 border border-cyan-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100 disabled:border-slate-200"
        />
        <span className="text-xs text-slate-400 w-14">{unit}</span>
      </span>
    </label>
  );
}

function Out({ label, value, unit, d = 2, warn = false, hint, disabled = false }) {
  return (
    <div className={"flex items-center justify-between gap-2 py-0.5 " + (disabled ? "opacity-40" : "")}>
      <span className="text-xs text-slate-600 leading-tight">
        {label}
        {hint && <span className="text-slate-400"> {hint}</span>}
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <span
          className={
            "w-28 px-1.5 py-0.5 text-right text-sm font-mono border rounded " +
            (warn
              ? "bg-red-100 border-red-400 text-red-800 font-semibold"
              : "bg-yellow-50 border-yellow-300 text-slate-800")
          }
        >
          {disabled ? "—" : fmt(value, d)}
        </span>
        <span className="text-xs text-slate-400 w-14">{unit}</span>
      </span>
    </div>
  );
}

function Radio({ label, options, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="flex gap-3 text-xs">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-1 cursor-pointer">
            <input type="radio" checked={value === o} onChange={() => onChange(o)} />
            {o}
          </label>
        ))}
      </span>
    </label>
  );
}

function Card({ title, children, muted = false, disabled = false }) {
  return (
    <div
      className={
        "rounded-lg border p-3 " +
        (disabled
          ? "border-slate-200 bg-slate-50 opacity-60"
          : muted
          ? "border-slate-200 bg-slate-50"
          : "border-slate-300 bg-white")
      }
    >
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Application
// ═══════════════════════════════════════════════════════════════════
export default function TourLavage() {
  const [tab, setTab] = useState("fumees");
  const [showHyp, setShowHyp] = useState(false);

  const [inp, setInp] = useState({
    // Fumées en entrée (sortie quench, saturées)
    mCO2: 2839, mH2O: 17740, mN2: 19417, mO2: 1549, mSO2: 31.61, mHCl: 5.78, mPoussieres: 0,
    tempFumees: 84.66, pTotal: 0,
    // Objectifs de rejet (mg/Nm3 sec, 11 % O2)
    cibleSO2: 50, cibleHCl: 10,
    // Colonne
    diamRetenu: 1.2, debArrosage: 25000, concLiqSO2: 4.5, pourNaOH: 30,
    // Garnissage
    typeGarn: "VSP", facteurGarn: 82, surfaceVolGarn: 100, diamGarn: 0.051,
    sigmaTenSup: 0.033, coefHautSat: 1.5,
    // Sous-refroidissement (condenseur)
    sousRef: false, tempLiqRef: 20, tempSortieCond: 40,
    // Dévésiculeur
    epaisDeves: 444,
  });

  const set = (k) => (v) => setInp((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => calculTour(inp), [inp]);

  const selectDiam = (i) =>
    setInp((s) => ({ ...s, diamRetenu: DIAM_STD[i], debArrosage: DEBIT_STD[i] * 1000 }));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* En-tête */}
      <header className="bg-slate-800 text-white px-5 py-3">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Tour de lavage — voie humide</h1>
            <p className="text-xs text-slate-300">
              Absorption SO₂ / HCl à la soude · portage du module Pyrofluid VB.NET · avec ou sans sous-refroidissement
            </p>
          </div>
          <div className="flex gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-cyan-200 text-cyan-900">saisie</span>
            <span className="px-2 py-0.5 rounded bg-yellow-200 text-yellow-900">calculé</span>
            <span className="px-2 py-0.5 rounded bg-red-300 text-red-900">hors plage</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {/* Onglets (miroir de l'IHM d'origine) */}
        <div className="flex gap-1 mb-3">
          {[
            ["fumees", "Fumées"],
            ["absorption", "Partie absorption"],
          ].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "px-4 py-1.5 text-sm rounded-t-md border border-b-0 " +
                (tab === k
                  ? "bg-white border-slate-300 font-semibold"
                  : "bg-slate-200 border-slate-300 text-slate-500 hover:bg-slate-50")
              }
            >
              {lbl}
            </button>
          ))}
          <button
            onClick={() => setShowHyp((v) => !v)}
            className="ml-auto px-3 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
          >
            {showHyp ? "Masquer" : "Hypothèses & corrélations"}
          </button>
        </div>

        {showHyp && (
          <div className="mb-4 rounded-lg border border-slate-300 bg-white p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">Corrélations reprises du code d'origine</p>
            <p>
              Psat eau : Antoine log₁₀P = 7,9688 − 1668,21/(228+T) [mmHg] · μ, ρ (Rackett), σ eau : corrélations legacy ·
              Cp liquide et Cp vapeur d'eau : polynômes legacy · Enthalpie fumées : Cp par espèce + latent (597 kcal/kg entrée,
              547 sortie condenseur) · μ fumées : polynôme en T pondéré √M (CO₂/H₂O/O₂/N₂) · Engorgement : Sherwood-Lobo,
              flux réel = 70 % · Transfert : Onda (aw, kG), D(SO₂) linéaire en T, D(HCl) type Fuller · Marges : hauteur =
              NUT×HUT×1,5 + 0,49 m par polluant, somme × coef. de saturation · Condenseur : bilan enthalpique + hauteur par
              corrélation empirique legacy (unités impériales internes), LMTD.
            </p>
            <p className="font-semibold text-slate-700 mt-2 mb-1">Écarts assumés vs legacy</p>
            <p>
              NUT = ln(C_entrée/C_cible), concentrations homogènes en mg/Nm³ sec 11 % O₂, cibles saisissables (le VB codait
              50 et 10 en dur) · HUT(HCl) utilise kG(HCl) (le VB réutilisait HutSO2 pour la sortie HCl) · T en Kelvin dans les
              termes RT · l'eau d'arrosage ajoutée au circuit condenseur reprend le débit d'arrosage saisi (le VB codait 25 000
              kg/h en dur) · enthalpie d'entrée recalculée par les Cp legacy (le VB la recevait du node amont) · garde
              anti-débordement sur la perte de charge VSP · boucle de convergence du condenseur (commentée dans le VB) résolue
              en direct.
            </p>
          </div>
        )}

        {/* ═══════ Onglet Fumées ═══════ */}
        {tab === "fumees" && r && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <Card title="Fumées en entrée (sortie quench)">
                <In label="Débit CO₂" value={inp.mCO2} onChange={set("mCO2")} unit="kg/h" />
                <In label="Débit H₂O vapeur" value={inp.mH2O} onChange={set("mH2O")} unit="kg/h" />
                <In label="Débit N₂" value={inp.mN2} onChange={set("mN2")} unit="kg/h" />
                <In label="Débit O₂" value={inp.mO2} onChange={set("mO2")} unit="kg/h" />
                <In label="Débit SO₂" value={inp.mSO2} onChange={set("mSO2")} unit="kg/h" />
                <In label="Débit HCl" value={inp.mHCl} onChange={set("mHCl")} unit="kg/h" />
                <In label="Poussières" value={inp.mPoussieres} onChange={set("mPoussieres")} unit="kg/h" />
                <In label="Température" value={inp.tempFumees} onChange={set("tempFumees")} unit="°C" />
                <In label="Dépression totale" value={inp.pTotal} onChange={set("pTotal")} unit="mmCE" />
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <Out label="Débit massique total" value={r.masTotIn} unit="kg/h" />
                  <Out label="Débit volumique total" value={r.volTotIn} unit="Nm³/h" />
                  <Out label="O₂ sur sec" value={r.pO2in} unit="% vol" />
                  <Out label="SO₂ (sec, 11 % O₂)" value={r.concSO2In} unit="mg/Nm³" d={1} />
                  <Out label="HCl (sec, 11 % O₂)" value={r.concHClIn} unit="mg/Nm³" d={1} />
                </div>
              </Card>

              <Card title="Utilisation d'un sous-refroidissement">
                <Radio
                  label="Condenseur en tête de colonne"
                  options={["Oui", "Non"]}
                  value={inp.sousRef ? "Oui" : "Non"}
                  onChange={(v) => set("sousRef")(v === "Oui")}
                />
              </Card>
            </div>

            <div className="space-y-3">
              <Card title="Colonne — choix & réactif">
                <label className="flex items-center justify-between gap-2 py-0.5">
                  <span className="text-xs text-slate-600">Diamètre retenu</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <select
                      value={DIAM_STD.indexOf(inp.diamRetenu)}
                      onChange={(e) => selectDiam(parseInt(e.target.value))}
                      className="w-24 px-1 py-0.5 text-right text-sm font-mono bg-cyan-50 border border-cyan-300 rounded"
                    >
                      {DIAM_STD.map((d, i) => (
                        <option key={d} value={i}>{d.toFixed(2)}</option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400 w-14">m</span>
                  </span>
                </label>
                <In label="Débit du liquide d'arrosage" value={inp.debArrosage} onChange={set("debArrosage")} unit="kg/h" />
                <In label="Soude — % massique NaOH" value={inp.pourNaOH} onChange={set("pourNaOH")} unit="%" />
                <In label="Sels de SO₂ dans la purge" value={inp.concLiqSO2} onChange={set("concLiqSO2")} unit="%" />
                <In label="Objectif SO₂ sortie" value={inp.cibleSO2} onChange={set("cibleSO2")} unit="mg/Nm³" />
                <In label="Objectif HCl sortie" value={inp.cibleHCl} onChange={set("cibleHCl")} unit="mg/Nm³" />
              </Card>

              <Card title="Fumées en sortie">
                <Out label="Température" value={r.tAbs} unit="°C" />
                <Out label="Débit volumique" value={r.volTotS} unit="Nm³/h" />
                <Out label="Débit massique" value={r.masTotS} unit="kg/h" />
                <Out label="SO₂ (sec, 11 % O₂)" value={r.cibleSO2} unit="mg/Nm³" />
                <Out label="Débit SO₂" value={r.masSO2s} unit="kg/h" />
                <Out label="HCl (sec, 11 % O₂)" value={r.cibleHCl} unit="mg/Nm³" />
                <Out label="Débit HCl" value={r.masHCls} unit="kg/h" />
                <Out label="H₂O vapeur (saturation)" value={r.masH2Os} unit="kg/h" />
              </Card>

              <Card title="Soude à injecter">
                <Out label="Concentration solution" value={r.concNaOH} unit="g/l" d={1} />
                <Out label="Quantité de NaOH (nominal)" value={r.masNaOHTot} unit="kg/h" />
                <Out label="Débit volumique (nominal)" value={r.volNaOHTot} unit="l/h" />
                <Out label="Quantité de NaOH (maxi)" value={r.masNaOHMaxi} unit="kg/h" />
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ Onglet Partie absorption ═══════ */}
        {tab === "absorption" && r && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <Card title="Caractéristiques du garnissage">
                <Radio
                  label="Type (perte de charge)"
                  options={["VSP", "Autres", "Aucun"]}
                  value={inp.typeGarn}
                  onChange={set("typeGarn")}
                />
                <In label="Coef. hauteur saturation" value={inp.coefHautSat} onChange={set("coefHautSat")} unit="—" />
                <In label="Facteur de garnissage" value={inp.facteurGarn} onChange={set("facteurGarn")} unit="m²/m³" />
                <In label="Surface volumique" value={inp.surfaceVolGarn} onChange={set("surfaceVolGarn")} unit="m²/m³" />
                <In label="Diamètre / dimension" value={inp.diamGarn} onChange={set("diamGarn")} unit="m" step="0.001" />
                <In label="Tension superf. matériau" value={inp.sigmaTenSup} onChange={set("sigmaTenSup")} unit="N/m" step="0.001" />
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <Out label="Hauteur garnissage SO₂" value={r.hGarnSO2} unit="m" />
                  <Out label="Hauteur garnissage HCl" value={r.hGarnHCl} unit="m" />
                  <Out label="Hauteur retenue" value={r.hGarnRetenue} unit="m" />
                  <Out label="Perte de charge" value={r.dPGarn} unit="mmCE" />
                  <Out label="Perte de charge / hauteur" value={r.dPGarnH} unit="mmCE/m" />
                </div>
              </Card>

              <Card title="Engorgement & vérifications">
                <Out label="Flux d'engorgement" value={r.fluxEngor} unit="kg/(m²·h)" />
                <Out label="Flux réel (70 %)" value={r.fluxReel} unit="kg/(m²·h)" />
                <Out label="Diamètre calculé" value={r.diamCalc} unit="m" />
                <Out
                  label="Taux de mouillage"
                  hint="(0,09 – 0,72)"
                  value={r.tauxMouil}
                  unit="m³/(m²·h)"
                  warn={r.tauxMouil < 0.09 || r.tauxMouil > 0.72}
                />
                <Out
                  label="Rapport D colonne / d garnissage"
                  hint="(> 12)"
                  value={r.rapport}
                  unit="—"
                  warn={r.rapport < 12}
                />
                <Out
                  label="Taux d'engorgement"
                  hint="(< 70 %)"
                  value={r.tauxEngor}
                  unit="%"
                  warn={r.tauxEngor > 70}
                />
              </Card>

              <Card title="Propriétés calculées" muted>
                <Out label="ρ fumées absorption (réel)" value={r.roGaz} unit="kg/m³" d={3} />
                <Out label="ρ fumées sortie (réel)" value={r.roSortie} unit="kg/m³" d={3} />
                <Out label="μ fumées" value={r.muGaz * 1e6} unit="µPa·s" d={2} />
                <Out label="ρ liquide" value={r.roLiq} unit="kg/m³" d={1} />
                <Out label="μ liquide" value={r.muLiq * 1e3} unit="mPa·s" d={3} />
                <Out label="σ liquide" value={r.sigmaLiq * 1e3} unit="mN/m" d={1} />
              </Card>
            </div>

            <div className="space-y-3">
              <Card title="Colonne d'absorption — bilans">
                <Out label="Débit eau d'appoint" value={r.appointAbs} unit="kg/h" />
                <Out label="Débit purge de SO₂" value={r.purgeAbs} unit="kg/h" />
                <Out label="Purge totale colonne" value={r.purgeTotale} unit="kg/h" />
                <Out label="SO₂ neutralisé" value={r.so2Purge} unit="kg/h" />
                <Out label="HUT SO₂" value={r.hutSO2} unit="m" d={3} />
                <Out label="NUT SO₂" value={r.nutSO2} unit="—" />
                <Out label="HUT HCl" value={r.hutHCl} unit="m" d={3} />
                <Out label="NUT HCl" value={r.nutHCl} unit="—" />
                <Out label="Surface mouillée (Onda)" value={r.aw} unit="m²/m³" d={1} />
              </Card>

              <Card title="Dévésiculeur">
                <In label="Épaisseur" value={inp.epaisDeves} onChange={set("epaisDeves")} unit="mm" />
                <Out label="Vitesse d'engorgement" value={r.vitDevesEng} unit="m/h" d={0} />
                <Out label="Diamètre retenu (arrondi 0,5)" value={r.diamDeves} unit="m" d={1} />
                <Out label="Vitesse retenue" value={r.vitRetenue} unit="m/h" d={0} />
                <Out label="Perte de charge" value={r.dPDeves} unit="mmCE" />
              </Card>

              <Card title="Condenseur" disabled={!inp.sousRef}>
                <In
                  label="Température d'entrée du liquide"
                  value={inp.tempLiqRef}
                  onChange={set("tempLiqRef")}
                  unit="°C"
                  disabled={!inp.sousRef}
                />
                <In
                  label="Température sortie condenseur"
                  value={inp.tempSortieCond}
                  onChange={set("tempSortieCond")}
                  unit="°C"
                  disabled={!inp.sousRef}
                />
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <Out label="Hauteur" value={r.hauteurCond} unit="m" disabled={!inp.sousRef} />
                  <Out label="Débit condensat" value={r.cond?.condensat} unit="kg/h" disabled={!inp.sousRef} />
                  <Out label="Débit eau de refroid." value={r.cond?.eauRefroid} unit="kg/h" disabled={!inp.sousRef} />
                  <Out label="Température sortie liquide" value={r.cond?.tSortieLiq} unit="°C" disabled={!inp.sousRef} />
                  <Out label="LMTD" value={r.cond?.lmtd} unit="°C" disabled={!inp.sousRef} />
                  <Out label="Puissance échangée" value={r.cond ? r.cond.deltaEnt * 1.163e-3 : 0} unit="kW" d={0} disabled={!inp.sousRef} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {!r && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Composition des fumées invalide : le débit volumique total (ou sec) est nul. Vérifier les débits saisis.
          </div>
        )}

        <footer className="mt-6 text-[11px] text-slate-400">
          Portage de TourLavage.vb / ClassTourLavage.vb (Pyrofluid 22.09.2009) — branches SousRef 0/1 et TypeVerif VSP/Autres.
        </footer>
      </main>
    </div>
  );
}
