import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════
// QUENCH — Portage React du module VB.NET Pyrofluid
// (Quench.vb + ClassQuench.vb, voie humide)
//
// Saturation adiabatique des fumées, absorption HCl au venturi,
// hauteur de saturation (évaporation des gouttes), bilans
// purge / appoint / recirculation, boucle sur ConcHClRec.
//
// Code couleur hérité de l'outil d'origine :
//   cyan = saisie | jaune = calculé | rouge = hors plage
// ═══════════════════════════════════════════════════════════════════

// ----- Constantes -----
const M = { CO2: 44, H2O: 18, O2: 32, N2: 28, SO2: 64, HCl: 36.5 };
const VM = 22.4;

// Diamètres standards du quench & valeurs associées (legacy)
const DIAM_QUENCH = [0.55, 0.65, 0.75, 0.9, 1.05, 1.25, 1.5];
const DIAM_CONE_AUTO = { 0.55: 445, 0.65: 535, 0.75: 615, 0.9: 735, 1.05: 860, 1.25: 1025, 1.5: 1230 }; // mm
const LIQ_AR_MAX = { 0.55: 5000, 0.65: 7500, 0.75: 8000, 0.9: 10000, 1.05: 15000, 1.25: 20000, 1.5: 25000 }; // kg/h

// ----- Fonctions thermodynamiques (simplifiées / issues du legacy) -----

// Pression de vapeur saturante de l'eau (Antoine, mmHg)
const psatH2O = (t) => Math.pow(10, 7.9688 - 1668.21 / (228 + t));

// Enthalpie des fumées (kcal/h) — polynômes Cp legacy + latent 597 kcal/kg
function enthalpieFumees(T, m) {
  const s1 = T * (0.226 * m.CO2 + 0.427 * m.H2O + 0.225 * m.O2 + 0.239 * m.N2 + 0.164 * m.SO2 + 0.19 * m.HCl);
  const s2 = T * T * (46.5e-6 * m.CO2 + 80.5e-6 * m.H2O + 24.5e-6 * m.O2 + 27e-6 * m.N2 + 25.5e-6 * m.SO2 + 11.5e-6 * m.HCl);
  return s1 + s2 + m.H2O * 597;
}

// Chaleur évacuée par kg d'eau évaporée (kcal/kg) — legacy
// NB : le VB écrivait « 11 ^ -6 » (≈ 0) pour le terme quadratique HCl ;
// corrigé ici en 11.5e-6 conformément aux Cp utilisés partout ailleurs.
function chaleurEvac(ts, concHClAr) {
  const c = concHClAr / 100;
  return (
    (0.427 * ts + 80.5e-6 * ts * ts + 597 - ts) * (1 - c) +
    c * (0.19 * ts + 11.5e-6 * ts * ts + 497 - 0.96 * ts)
  );
}

// Pression partielle de HCl au-dessus d'une solution aqueuse (mmHg) — legacy
function ppHCl(ts, concHClRec) {
  const AT = Math.exp(-13.83 + 0.108032 * ts);
  const BT = Math.exp(1.03684 - 0.00467532 * ts);
  return concHClRec > 0 ? AT * Math.pow(concHClRec, BT) : 0;
}

// Masse volumique de l'eau liquide (kg/m3) — Rackett, legacy
const roEau = (t) =>
  0.3471 * Math.pow(0.274, -Math.pow(1 - (t + 273) / (374.2 + 273), 2 / 7)) * 1000;

// Conductivité thermique du liquide (kcal/(h.m.°C)) — legacy
const condLiq = (tm) =>
  (-916.62 + 1254.73 * (tm + 273) * 1e-2 - 152.12e-4 * Math.pow(tm + 273, 2)) * 3.6e-4;

// Cp massique des fumées (kcal/(kg.°C)) — polynôme legacy sur fractions massiques
function cpFumees(fm, tm) {
  const TK = tm + 273;
  return (
    (0.235 * fm.CO2 + 0.232 * fm.N2 + 0.258 * fm.O2 + 0.457 * fm.H2O + 0.184 * fm.HCl + 0.12 * fm.SO2) +
    1e-5 * (6.22 * fm.CO2 + 3.57 * fm.N2 + 0.8 * fm.O2 + 0.833 * fm.H2O + 2.3 * fm.HCl + 8.27 * fm.SO2) * TK +
    1e-8 * (7.44 * fm.H2O - 1.29 * fm.SO2) * TK * TK -
    (4443.2 * fm.CO2 + 5865.6 * fm.O2) / Math.pow(TK, 3)
  );
}

// Résolution a·T² + b·T + c = 0 (racine positive) — équivalent de Carre()
const racineCarre = (a, b, c) => {
  const disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return c === 0 ? 0 : -c / b;
  return (-b + Math.sqrt(disc)) / (2 * a);
};

const volDe = (m) => ({
  CO2: (m.CO2 * VM) / M.CO2, H2O: (m.H2O * VM) / M.H2O, N2: (m.N2 * VM) / M.N2,
  O2: (m.O2 * VM) / M.O2, SO2: (m.SO2 * VM) / M.SO2, HCl: (m.HCl * VM) / M.HCl,
});
const somme = (o) => Object.values(o).reduce((a, b) => a + b, 0);

// ═══════════════════════════════════════════════════════════════════
// Moteur de calcul (transcription de ClassQuench.Calcul)
// ═══════════════════════════════════════════════════════════════════
function calculQuench(inp) {
  const T = inp.tempFumees;
  const masIn = { CO2: inp.mCO2, H2O: inp.mH2O, N2: inp.mN2, O2: inp.mO2, SO2: inp.mSO2, HCl: inp.mHCl };
  const volIn = volDe(masIn);
  const masTot = somme(masIn);
  const volTot = somme(volIn);
  const volSec = volTot - volIn.H2O;
  if (volTot <= 0 || volSec <= 0 || masIn.HCl <= 0) return null;

  const p = 760 - Math.abs(inp.pTotal / 13.595);
  const corr = (o2) => 10 / (21 - o2);
  const pO2in = (volIn.O2 / volSec) * 100;
  const concHClInSec = ((masIn.HCl * 1e6) / volSec) * corr(pO2in);
  const concSO2InSec = ((masIn.SO2 * 1e6) / volSec) * corr(pO2in);

  // Vitesse de passage colonne (10–15 m/s) — le legacy utilise 273.5
  const debVolReel = (volTot * (273.5 + T) * 760) / (273.5 * p);
  const Squench = (Math.PI * inp.diamQuench * inp.diamQuench) / 4;
  const vitesse = Squench > 0 ? debVolReel / (3600 * Squench) : 0;

  // Enthalpie des fumées en entrée
  const entIn = enthalpieFumees(T, masIn);

  // ─── Boucle 1 : température de saturation adiabatique ts ───
  // Le VB balayait ts par pas de 0,1 °C puis appliquait deux facteurs
  // correctifs (÷1,0005 sur ts, ×0,9954 sur Psat). Résolu ici par
  // bissection sur f(ts) = Psat(ts) − PpH2O(ts), sans facteurs.
  let concHClAr = 0.05; // initialisation legacy
  const evapDe = (ts) => (entIn - enthalpieFumees(ts, masIn)) / chaleurEvac(ts, concHClAr);
  const fTs = (ts) => {
    const evap = evapDe(ts);
    const pp = (p * (volIn.H2O + evap / 0.804)) / (volTot + evap / 0.804);
    return psatH2O(ts) - pp;
  };
  let lo = 40, hi = Math.min(T - 1, 99.5);
  if (fTs(lo) > 0 || fTs(hi) < 0) return { erreurTs: true };
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (fTs(mid) < 0) lo = mid; else hi = mid;
  }
  const ts = (lo + hi) / 2;
  const tensVapH2O = psatH2O(ts);
  const debMasEvap = evapDe(ts);

  // ─── Boucle 2 : itération sur ConcHClRec (bilan enthalpique) ───
  let concHClRec = 0.01;
  let deltaBoucle2 = 0.5;
  let res = null;
  let converge = false;

  const fracMas = {
    CO2: masIn.CO2 / masTot, H2O: masIn.H2O / masTot, O2: masIn.O2 / masTot,
    N2: masIn.N2 / masTot, HCl: masIn.HCl / masTot, SO2: masIn.SO2 / masTot,
  };

  outer: while (deltaBoucle2 <= 2) {
    let compt = 0;
    while (compt < 20000) {
      const pHClPart = ppHCl(ts, concHClRec);
      const pIncond = p - tensVapH2O - pHClPart;

      // Composition des vapeurs en équilibre avec la solution
      const fracMolHCl = pHClPart / p;
      const fracMolEau = 1 - fracMolHCl;
      const denomEq = fracMolHCl * M.HCl + fracMolEau * M.H2O;
      const fracMasHClEq = (fracMolHCl * M.HCl) / denomEq;
      const fracMasEauEq = (fracMolEau * M.H2O) / denomEq;
      const debMasH2Oeq = fracMasEauEq * debMasEvap;
      const debMasHCleq = fracMasHClEq * debMasEvap;

      // Fumées saturées
      const masSat = { ...masIn, H2O: masIn.H2O + debMasH2Oeq, HCl: masIn.HCl + debMasHCleq };
      const volSat = volDe(masSat);
      const masTotSat = somme(masSat);
      const volTotSat = somme(volSat);
      const debVolSatReel = volTotSat * ((ts + 273) / 273) * (760 / p);
      const roSaturee = masTotSat / debVolSatReel;
      const debMolIncond = (1000 / VM) * (volTotSat - volSat.H2O - volSat.HCl);

      // Fumées épurées (équilibre + efficacité venturi)
      const debMasHClAbs = masSat.HCl - (pHClPart / pIncond) * debMolIncond * (M.HCl / 1000);
      const masEp = {
        CO2: masIn.CO2,
        H2O: (tensVapH2O / pIncond) * debMolIncond * (M.H2O / 1000),
        O2: masIn.O2,
        N2: masIn.N2,
        SO2: masIn.SO2,
        HCl: masSat.HCl - debMasHClAbs * inp.effVenturi,
      };
      const volEp = volDe(masEp);
      const masTotEp = somme(masEp);
      const volTotEp = somme(volEp);
      const volTotEpSec = volTotEp - volEp.H2O;
      const pO2s = (volEp.O2 / volTotEpSec) * 100;
      const concHClSec = ((masEp.HCl / volTotEpSec) * 1e6 * 10) / (21 - pO2s);
      const concSO2Sec = ((masEp.SO2 / volTotEpSec) * 1e6 * 10) / (21 - pO2s);
      const debVolSortieReel = volTotEp * ((ts + 273) / 273) * (760 / p);
      const roEpuree = masTotEp / debVolSortieReel;

      // Cône & venturi
      const diamCone = inp.chkCone ? inp.diamCone : DIAM_CONE_AUTO[inp.diamQuench] || 0;
      const sVenturi = (Math.PI * Math.pow(diamCone * 1e-3, 2)) / 4;
      const sPassage = Squench - sVenturi;
      const vPassage = sPassage > 0 ? debVolSortieReel / (3600 * sPassage) : 0;
      const pVenturi = (1.5 * roSaturee * vPassage * vPassage) / (2 * 9.81); // mmCE
      const pSortie = p - pVenturi / 13.595;

      // Hauteur de la partie saturation
      const tmFumees = (T + ts) / 2;
      const cpg = cpFumees(fracMas, tmFumees);
      const roLiq1 = roEau(ts);
      const kl = condLiq(tmFumees);
      let debMasLiqAr = 11 * debMasEvap;
      debMasLiqAr = Math.min(debMasLiqAr, LIQ_AR_MAX[inp.diamQuench] || 25000);
      const te = (600 / inp.constNusselt) * ((Math.pow(inp.diamGouttes * 1e-6, 2) * cpg * roLiq1) / kl) * (masTot / debMasLiqAr);
      const zsat = inp.coefHautSat * te * vitesse;

      // pH
      const pH = concHClAr > 0 ? -Math.log10(concHClAr * (10 / M.HCl)) : null;
      const pHRec = concHClRec > 0 ? -Math.log10(concHClRec * (10 / M.HCl)) : null;

      // Purge, appoint, recirculation
      const debMasHClPurge = masIn.HCl - masEp.HCl;
      const debMasTotalPurge = (100 * debMasHClPurge) / concHClRec;
      const debMasEauAppoint = masTotEp - masTot + debMasTotalPurge;
      const debMasTotalRecirc = debMasLiqAr + masTot - masTotEp - debMasTotalPurge;
      const debMasHClRecirc = debMasTotalRecirc * (concHClRec / 100);
      concHClAr = (100 * debMasHClRecirc) / (debMasTotalRecirc + debMasEauAppoint);

      // Bilan enthalpique sur le quench → température de sortie
      const chaleurAbsHCl = 0.5556 * 850; // Btu/lb → kcal/kg
      const entEauAppoint = debMasEauAppoint * inp.tempEauAp;
      const entAbsHCl = debMasHClPurge * chaleurAbsHCl;
      const entPurge = debMasTotalPurge * 0.96 * ts;
      const entEauAppointTs = debMasEvap * (ts - inp.tempEauAp);
      const entTotalSortie = entIn + entEauAppoint + entAbsHCl + entEauAppointTs - entPurge;

      const a = 1e-6 * (masEp.CO2 * 46.5 + masEp.H2O * 80.5 + masEp.O2 * 24.5 + masEp.N2 * 27 + masEp.SO2 * 25.5 + masEp.HCl * 11.5);
      const b = masEp.CO2 * 0.226 + masEp.H2O * 0.427 + masEp.N2 * 0.239 + masEp.O2 * 0.225 + masEp.SO2 * 0.164 + masEp.HCl * 0.19;
      const c = -(entTotalSortie - masEp.H2O * 597);
      const tempSortie = racineCarre(a, b, c);

      res = {
        p, pO2in, concHClInSec, concSO2InSec, masTot, volTot, debVolReel, Squench, vitesse, entIn,
        ts, tensVapH2O, debMasEvap,
        concHClRec, concHClAr, pHClPart, pIncond, debMolIncond,
        masSat, masTotSat, volTotSat, roSaturee,
        masEp, masTotEp, volTotEp, volTotEpSec, pO2s, concHClSec, concSO2Sec, roEpuree, debVolSortieReel,
        diamCone, sVenturi, sPassage, vPassage, pVenturi, pSortie,
        cpg, roLiq1, kl, debMasLiqAr, te, zsat,
        pH, pHRec,
        debMasHClPurge, debMasTotalPurge, debMasEauAppoint, debMasTotalRecirc, debMasHClRecirc,
        tempSortie,
        effHCl: masIn.HCl > 0 ? ((masIn.HCl - masEp.HCl) / masIn.HCl) * 100 : 0,
      };

      if (Math.abs(ts - tempSortie) < deltaBoucle2) { converge = true; break outer; }
      concHClRec += 0.0001;
      compt++;
    }
    deltaBoucle2 += 0.5; // élargissement legacy si non convergé
  }

  return res ? { ...res, converge } : null;
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

function Out({ label, value, unit, d = 2, warn = false, hint, text }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
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
          {text !== undefined ? text : fmt(value, d)}
        </span>
        <span className="text-xs text-slate-400 w-14">{unit}</span>
      </span>
    </div>
  );
}

function Card({ title, children, muted = false }) {
  return (
    <div className={"rounded-lg border p-3 " + (muted ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-white")}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Application
// ═══════════════════════════════════════════════════════════════════
export default function Quench() {
  const [showHyp, setShowHyp] = useState(false);

  const [inp, setInp] = useState({
    // Fumées en entrée
    mCO2: 2839, mH2O: 12270, mN2: 19417, mO2: 1549, mSO2: 31.61, mHCl: 14.25,
    tempFumees: 350, pTotal: 0,
    // Paramètres quench
    diamQuench: 0.55,
    chkCone: false, diamCone: 445,
    tempEauAp: 25,
    effVenturi: 0.6,
    diamGouttes: 700,
    constNusselt: 2,
    coefHautSat: 1.5,
  });

  const set = (k) => (v) => setInp((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => calculQuench(inp), [inp]);

  // Avertissements (plages legacy — MsgBox remplacés par des bandeaux)
  const warnings = [];
  if (inp.effVenturi < 0.5 || inp.effVenturi > 0.7)
    warnings.push("L'efficacité d'absorption du venturi doit être comprise entre 0,5 et 0,7.");
  if (inp.diamGouttes < 700 || inp.diamGouttes > 800)
    warnings.push("Le diamètre des gouttes pulvérisées doit être compris entre 700 et 800 µm.");
  if (r && !r.erreurTs) {
    if (r.vitesse < 10 || r.vitesse > 15)
      warnings.push(`Vitesse de passage colonne ${fmt(r.vitesse)} m/s hors plage (10 – 15 m/s) : changer le diamètre du quench.`);
    if (r.vPassage < 30 || r.vPassage > 40)
      warnings.push(`Vitesse de passage au cône ${fmt(r.vPassage)} m/s hors plage (30 – 40 m/s) : changer le diamètre du cône.`);
    if (r.debMasTotalRecirc < 0)
      warnings.push(`Débit de recirculation négatif (${fmt(r.debMasTotalRecirc)} kg/h) : l'arrosage plafonné est insuffisant pour ce bilan.`);
    if (!r.converge)
      warnings.push("Boucle de convergence Ts / T sortie non convergée au critère de 0,5 °C (critère élargi, valeurs indicatives).");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="bg-slate-800 text-white px-5 py-3">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Quench — voie humide</h1>
            <p className="text-xs text-slate-300">
              Saturation adiabatique · absorption HCl au venturi · portage du module Pyrofluid VB.NET
            </p>
          </div>
          <div className="flex gap-2 text-[11px] items-center">
            <span className="px-2 py-0.5 rounded bg-cyan-200 text-cyan-900">saisie</span>
            <span className="px-2 py-0.5 rounded bg-yellow-200 text-yellow-900">calculé</span>
            <span className="px-2 py-0.5 rounded bg-red-300 text-red-900">hors plage</span>
            <button
              onClick={() => setShowHyp((v) => !v)}
              className="ml-2 px-3 py-1 text-xs rounded border border-slate-500 text-slate-200 hover:bg-slate-700"
            >
              {showHyp ? "Masquer" : "Hypothèses"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {showHyp && (
          <div className="mb-4 rounded-lg border border-slate-300 bg-white p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">Corrélations reprises du code d'origine</p>
            <p>
              Psat eau : Antoine log₁₀P = 7,9688 − 1668,21/(228+T) [mmHg] · Enthalpie fumées : Cp par espèce + latent 597
              kcal/kg · Pression partielle HCl sur solution : P = e^(−13,83+0,108·Ts) · C^e^(1,0368−0,00468·Ts) · Chaleur
              d'évaporation pondérée eau/HCl · Cp fumées : polynôme sur fractions massiques · ρ eau : Rackett · Kl :
              corrélation legacy · Temps d'évaporation des gouttes : (600/Nu)·d²·Cpg·ρL/Kl·(G/L), Zsat = coef·Te·V ·
              Arrosage = 11 × évaporation, plafonné par diamètre · ΔP venturi = 1,5·ρ·V²/2g · Chaleur d'absorption HCl :
              0,5556 × 850 Btu/lb · T sortie par résolution quadratique du bilan enthalpique.
            </p>
            <p className="font-semibold text-slate-700 mt-2 mb-1">Écarts assumés vs legacy</p>
            <p>
              Ts résolue par bissection sur Psat(Ts) = PpH₂O(Ts) au lieu du balayage à pas fixe suivi des facteurs
              correctifs ÷1,0005 et ×0,9954 (rendus inutiles par la résolution exacte) · terme quadratique HCl de la
              chaleur d'évaporation corrigé de « 11^−6 » (bug VB ≈ 0) en 11,5·10⁻⁶·Ts² · les MsgBox bloquants
              (vitesses, plages venturi/gouttes) sont remplacés par des avertissements non bloquants · la boucle 2
              (ConcHClRec += 0,0001, critère 0,5 °C élargi à 2 °C max) est reproduite telle quelle.
            </p>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
            {warnings.map((w, i) => (
              <div key={i}>⚠️ {w}</div>
            ))}
          </div>
        )}

        {r?.erreurTs && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Impossible de trouver la température de saturation dans [40 °C ; min(T−1 ; 99,5) °C] : vérifier la
            composition (humidité) et la température d'entrée.
          </div>
        )}

        {!r && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Composition invalide : débits volumiques nuls ou débit HCl nul (le calcul du quench legacy exige HCl &gt; 0).
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {/* ─── Colonne gauche ─── */}
          <div className="space-y-3">
            <Card title="Fumées en entrée">
              <In label="Débit CO₂" value={inp.mCO2} onChange={set("mCO2")} unit="kg/h" />
              <In label="Débit H₂O vapeur" value={inp.mH2O} onChange={set("mH2O")} unit="kg/h" />
              <In label="Débit N₂" value={inp.mN2} onChange={set("mN2")} unit="kg/h" />
              <In label="Débit O₂" value={inp.mO2} onChange={set("mO2")} unit="kg/h" />
              <In label="Débit SO₂" value={inp.mSO2} onChange={set("mSO2")} unit="kg/h" />
              <In label="Débit HCl" value={inp.mHCl} onChange={set("mHCl")} unit="kg/h" />
              <In label="Température" value={inp.tempFumees} onChange={set("tempFumees")} unit="°C" />
              <In label="Dépression totale" value={inp.pTotal} onChange={set("pTotal")} unit="mmCE" />
              {r && !r.erreurTs && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <Out label="Débit massique total" value={r.masTot} unit="kg/h" />
                  <Out label="Débit volumique total" value={r.volTot} unit="Nm³/h" />
                  <Out label="HCl (sec, 11 % O₂)" value={r.concHClInSec} unit="mg/Nm³" d={1} />
                  <Out label="SO₂ (sec, 11 % O₂)" value={r.concSO2InSec} unit="mg/Nm³" d={1} />
                  <Out
                    label="Vitesse de passage colonne"
                    hint="(10 – 15)"
                    value={r.vitesse}
                    unit="m/s"
                    warn={r.vitesse < 10 || r.vitesse > 15}
                  />
                </div>
              )}
            </Card>

            <Card title="Paramètres du quench">
              <label className="flex items-center justify-between gap-2 py-0.5">
                <span className="text-xs text-slate-600">Diamètre du quench</span>
                <span className="flex items-center gap-1 shrink-0">
                  <select
                    value={inp.diamQuench}
                    onChange={(e) => set("diamQuench")(parseFloat(e.target.value))}
                    className="w-24 px-1 py-0.5 text-right text-sm font-mono bg-cyan-50 border border-cyan-300 rounded"
                  >
                    {DIAM_QUENCH.map((d) => (
                      <option key={d} value={d}>{d.toFixed(2)}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400 w-14">m</span>
                </span>
              </label>
              <label className="flex items-center justify-between gap-2 py-0.5">
                <span className="text-xs text-slate-600">Diamètre du cône saisi (sinon table standard)</span>
                <input
                  type="checkbox"
                  checked={inp.chkCone}
                  onChange={(e) => set("chkCone")(e.target.checked)}
                />
              </label>
              <In label="Diamètre du cône" value={inp.chkCone ? inp.diamCone : (DIAM_CONE_AUTO[inp.diamQuench] || 0)} onChange={set("diamCone")} unit="mm" disabled={!inp.chkCone} />
              <In label="Température eau d'appoint" value={inp.tempEauAp} onChange={set("tempEauAp")} unit="°C" />
              <In label="Efficacité d'absorption du venturi" value={inp.effVenturi} onChange={set("effVenturi")} unit="—" step="0.05" />
              <In label="Diamètre des gouttes pulvérisées" value={inp.diamGouttes} onChange={set("diamGouttes")} unit="µm" step="10" />
              <In label="Constante de Nusselt" value={inp.constNusselt} onChange={set("constNusselt")} unit="—" />
              <In label="Coef. hauteur saturation" value={inp.coefHautSat} onChange={set("coefHautSat")} unit="—" step="0.1" />
            </Card>

            {r && !r.erreurTs && (
              <Card title="Partie saturation">
                <Out label="Température de saturation Ts" value={r.ts} unit="°C" />
                <Out label="Eau de saturation (évaporée)" value={r.debMasEvap} unit="kg/h" />
                <Out label="Hauteur de saturation Zsat" value={r.zsat} unit="m" />
                <Out
                  label="Vitesse de passage au cône"
                  hint="(30 – 40)"
                  value={r.vPassage}
                  unit="m/s"
                  warn={r.vPassage < 30 || r.vPassage > 40}
                />
                <Out label="Perte de charge venturi" value={r.pVenturi} unit="mmCE" />
                <Out label="Débit molaire d'incondensables" value={r.debMolIncond} unit="mol/h" d={0} />
                <Out label="Temps d'évaporation des gouttes" value={r.te} unit="s" d={3} />
              </Card>
            )}
          </div>

          {/* ─── Colonne droite ─── */}
          <div className="space-y-3">
            {r && !r.erreurTs && (
              <>
                <Card title="Fumées en sortie">
                  <Out label="Température" value={r.tempSortie} unit="°C" />
                  <Out label="Débit massique" value={r.masTotEp} unit="kg/h" />
                  <Out label="Débit volumique" value={r.volTotEp} unit="Nm³/h" />
                  <Out label="Débit HCl" value={r.masEp.HCl} unit="kg/h" />
                  <Out label="HCl (sec, 11 % O₂)" value={r.concHClSec} unit="mg/Nm³" d={1} />
                  <Out label="Débit SO₂" value={r.masEp.SO2} unit="kg/h" />
                  <Out label="SO₂ (sec, 11 % O₂)" value={r.concSO2Sec} unit="mg/Nm³" d={1} />
                  <Out label="Débit H₂O vapeur" value={r.masEp.H2O} unit="kg/h" />
                  <Out label="Efficacité HCl" value={r.effHCl} unit="%" d={1} />
                  <Out label="ρ fumées épurées (réel)" value={r.roEpuree} unit="kg/m³" d={3} />
                </Card>

                <Card title="Bilans eau & recirculation">
                  <Out label="Débit eau d'appoint" value={r.debMasEauAppoint} unit="kg/h" />
                  <Out label="Débit du liquide d'arrosage" value={r.debMasLiqAr} unit="kg/h" />
                  <Out
                    label="Débit eau de recirculation"
                    value={r.debMasTotalRecirc}
                    unit="kg/h"
                    warn={r.debMasTotalRecirc < 0}
                  />
                  <Out label="Débit purge" value={r.debMasTotalPurge} unit="kg/h" />
                  <Out label="HCl absorbé (purge)" value={r.debMasHClPurge} unit="kg/h" />
                  <Out label="Conc. HCl recirculation" value={r.concHClRec} unit="%" d={4} />
                  <Out label="Conc. HCl arrosage" value={r.concHClAr} unit="%" d={4} />
                  <Out
                    label="pH eau d'arrosage"
                    unit="—"
                    text={r.pH !== null && r.concHClAr > 0 ? fmt(r.pH, 2) : "!!!!!"}
                    warn={r.pH === null || r.concHClAr <= 0}
                  />
                  <Out
                    label="pH recirculation"
                    unit="—"
                    text={r.pHRec !== null ? fmt(r.pHRec, 2) : "!!!!!"}
                  />
                </Card>

                <Card title="Fumées saturées (intermédiaire)" muted>
                  <Out label="Débit massique saturé" value={r.masTotSat} unit="kg/h" />
                  <Out label="Débit volumique saturé" value={r.volTotSat} unit="Nm³/h" />
                  <Out label="ρ fumées saturées (réel)" value={r.roSaturee} unit="kg/m³" d={3} />
                  <Out label="Pp HCl sur solution" value={r.pHClPart} unit="mmHg" d={4} />
                  <Out label="Pp incondensables" value={r.pIncond} unit="mmHg" d={1} />
                  <Out label="Tension vapeur H₂O à Ts" value={r.tensVapH2O} unit="mmHg" d={1} />
                  <Out label="Diamètre du cône retenu" value={r.diamCone} unit="mm" d={0} />
                  <Out label="Cp fumées (à Tm)" value={r.cpg} unit="kcal/kg·°C" d={4} />
                </Card>
              </>
            )}
          </div>
        </div>

        <footer className="mt-6 text-[11px] text-slate-400">
          Portage de Quench.vb / ClassQuench.vb (Pyrofluid 22.09.2009) — sortie quench = entrée tour de lavage (Ts, ρ épurée).
        </footer>
      </main>
    </div>
  );
}
