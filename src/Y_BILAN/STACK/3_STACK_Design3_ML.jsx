import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import { translations } from './STACK_traduction';
import PlantPhotos from '../../B_Images/stack/Stack_hauteur_hp.jsx';
import StripedStacks from '../../B_Images/stack/Stack_dependante_autre_cheminee.jsx';
import StackHeightDiagram from '../../B_Images/stack/Stack_obstacle.jsx';

// ═════════════════════════════════════════════════════════════════════════════
//  CHEMINÉE — Design (portage de Pyrofluid V4.5 : ClassCheminee.vb, datagrid.vb,
//  ClassObst.vb — arrêté du 2 février 1998)
//
//  Écarts volontaires par rapport au VB (décisions du 2026-11-16) :
//   - débit volumique R ramené à la température d'éjection sur 273,15 K (le VB divise par 298)
//   - cheminées voisines : R calculé à leur propre température (le VB prend celle de la cheminée principale)
//   - antipanache : recherche de la température limite par bissection (le VB avance par pas de 0,1 °C)
//   - bloc « conformité » ajouté (absent du VB) : mg/Nm³ sec à O2 de référence, limites saisissables
// ═════════════════════════════════════════════════════════════════════════════

export const POLLUANTS = ['Poussieres', 'SO2', 'NOx', 'HCl'];
export const K_POLLUANT = { Poussieres: 680, SO2: 340, NOx: 340, HCl: 340 };
export const CR_POLLUANT = { Poussieres: 0.15, SO2: 0.15, NOx: 0.14, HCl: 0.05 };
// Concentrations de fond co [mg/m3] par zone (0 : peu polluée, 1 : moyennement, 2 : très urbanisée/industrialisée)
export const CO_ZONE = [
  { Poussieres: 0.01, SO2: 0.01, NOx: 0.01, HCl: 0 },
  { Poussieres: 0.04, SO2: 0.04, NOx: 0.05, HCl: 0 },
  { Poussieres: 0.08, SO2: 0.07, NOx: 0.1, HCl: 0 },
];
// Débits au-delà desquels le VB alerte [kg/h]
export const SEUIL_DEBIT = { Poussieres: 50, SO2: 200, NOx: 200, HCl: 50 };
export const HAUTEUR_MIN = 10; // m
const RO_AIR = 1.293; // kg/Nm3, hypothèse du VB pour les cheminées voisines
const T0 = 273.15;

const num = (v) => {
  const x = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
};

// S = max sur les polluants de k × q / (cr − co)
function calculS(q, co) {
  const parPolluant = {};
  let S = 0, dimensionnant = null, fondExcessif = false;
  POLLUANTS.forEach((p) => {
    const cm = CR_POLLUANT[p] - num(co[p]);
    const debit = num(q[p]);
    let s = 0;
    if (debit > 0) {
      if (cm <= 0) { s = Infinity; fondExcessif = true; } else s = (K_POLLUANT[p] * debit) / cm;
    }
    parPolluant[p] = { q: debit, k: K_POLLUANT[p], cr: CR_POLLUANT[p], co: num(co[p]), cm, s };
    if (s > S) { S = s; dimensionnant = p; }
  });
  return { S, dimensionnant, parPolluant, fondExcessif };
}

const hauteur = (S, R, dT) => (S > 0 && R > 0 && dT > 0 ? Math.sqrt(S) * Math.pow(R * dT, -1 / 6) : 0);

// ─── Hauteur, diamètre, cheminées voisines, obstacles, conformité ─────────────
export function calculCheminee(inp) {
  const m = { CO2: num(inp.mCO2), H2O: num(inp.mH2O), O2: num(inp.mO2), N2: num(inp.mN2) };
  const vol = { CO2: CO2_kg_m3(m.CO2), H2O: H2O_kg_m3(m.H2O), O2: O2_kg_m3(m.O2), N2: N2_kg_m3(m.N2) };
  const Qm = m.CO2 + m.H2O + m.O2 + m.N2;
  const QvN = vol.CO2 + vol.H2O + vol.O2 + vol.N2;
  const QvNsec = QvN - vol.H2O;
  if (!(QvN > 0)) return null;

  const T = num(inp.T);
  const Tamb = num(inp.Tamb);
  const q = { Poussieres: num(inp.qPoussieres), SO2: num(inp.qSO2), NOx: num(inp.qNOx), HCl: num(inp.qHCl) };
  const zone = Number(inp.zone);
  const co = zone === 3
    ? { Poussieres: num(inp.coPoussieres), SO2: num(inp.coSO2), NOx: num(inp.coNOx), HCl: num(inp.coHCl) }
    : CO_ZONE[zone] || CO_ZONE[2];

  // ΔT fumées − air ambiant, plancher 50 °C
  const dTreel = Math.abs(T - Tamb);
  const dT = Math.max(50, dTreel);

  // Débit à la température d'éjection, vitesse et diamètre
  const R = (QvN * (T0 + T)) / T0;
  const vMin = QvN <= 5000 ? 5 : 8;
  const vitesse = num(inp.vitesse) > 0 ? num(inp.vitesse) : vMin;
  const diametre = Math.sqrt((4 * R) / (vitesse * Math.PI * 3600));

  // Hauteur théorique
  const base = calculS(q, co);
  const hp = hauteur(base.S, R, dT);

  // Cheminées voisines : hauteur propre hj, dépendance, puis recalcul avec les débits cumulés
  const qTot = { ...q };
  let Rtot = R;
  let auMoinsUneDependante = false;
  const voisines = (inp.voisines || []).map((c) => {
    const QmJ = num(c.Qm);
    const qJ = { Poussieres: num(c.qPoussieres), SO2: num(c.qSO2), NOx: num(c.qNOx), HCl: num(c.qHCl) };
    const TJ = num(c.T);
    const RJ = ((QmJ / RO_AIR) * (T0 + TJ)) / T0;
    const hj = QmJ > 0 ? hauteur(calculS(qJ, co).S, RJ, Math.max(50, Math.abs(TJ - Tamb))) : 0;
    const dist = num(c.dist);
    const dependante = QmJ > 0 && dist < hp + hj + 10 && hp > hj / 2 && hj > hp / 2;
    if (dependante) {
      auMoinsUneDependante = true;
      POLLUANTS.forEach((p) => { qTot[p] += qJ[p]; });
      Rtot += RJ;
    }
    return { hj, dependante };
  });
  const hpc = auMoinsUneDependante ? hauteur(calculS(qTot, co).S, Rtot, dT) : 0;

  // Obstacles : hauteur de référence = cheminée déjà corrigée des voisines, 10 m minimum
  const hRef = Math.max(hp, hpc, HAUTEUR_MIN);
  let hpo = 0;
  const obstacles = (inp.obstacles || []).map((o) => {
    const dist = num(o.dist), larg = num(o.largeur), ho = num(o.hauteur), angle = num(o.angle);
    const distMax = 10 * hRef + 50;
    const dependant = dist < distMax && larg >= 2 && angle >= 15;
    let hcorr = 0;
    if (dependant) {
      hcorr = dist <= 2 * hRef + 10 ? ho + 5 : (5 / 4) * (ho + 5) * (1 - dist / distMax);
      hpo = Math.max(hpo, hcorr);
    }
    return { dependant, hcorr };
  });

  const hCalc = Math.max(hp, hpc, hpo);
  const hFinale = Math.max(hCalc, HAUTEUR_MIN);

  // Conformité : mg/Nm3 sec ramené à l'O2 de référence
  const O2sec = QvNsec > 0 ? (vol.O2 / QvNsec) * 100 : 0;
  const O2ref = num(inp.O2ref);
  const corrO2 = O2sec < 20.9 ? (21 - O2ref) / (21 - O2sec) : 1;
  const conformite = {};
  let conforme = true;
  POLLUANTS.forEach((p) => {
    const brut = QvNsec > 0 ? (q[p] * 1e6) / QvNsec : 0;
    const conc = brut * corrO2;
    const limite = num(inp[`vle${p}`]);
    const pct = limite > 0 ? (conc / limite) * 100 : 0;
    const ok = !(limite > 0) || conc <= limite;
    if (!ok) conforme = false;
    conformite[p] = { brut, conc, limite, pct, ok };
  });

  const alertesDebit = POLLUANTS.filter((p) => q[p] > SEUIL_DEBIT[p]);

  return {
    m, vol, Qm, QvN, QvNsec, T, Tamb, q, zone, co,
    dTreel, dT, dTplancher: dTreel < 50,
    R, vMin, vitesse, vitesseSousMin: vitesse < vMin, diametre,
    S: base.S, dimensionnant: base.dimensionnant, parPolluant: base.parPolluant, fondExcessif: base.fondExcessif,
    hp, voisines, hpc, Rtot, obstacles, hpo, hRef,
    hCalc, hFinale, minimumApplique: hCalc < HAUTEUR_MIN,
    O2sec, O2ref, corrO2, conformite, conforme, alertesDebit,
  };
}

// ─── Antipanache ─────────────────────────────────────────────────────────────
// Tension de vapeur saturante [mmHg] (formule du VB)
export const psatH2O = (t) => Math.exp(18.3036 - 3816.44 / (T0 + t - 46.13));

const CP1 = { CO2: 0.226, H2O: 0.427, O2: 0.225, N2: 0.239, SO2: 0.164, HCl: 0.19 };
const CP2 = { CO2: 46.5e-6, H2O: 80.5e-6, O2: 24.5e-6, N2: 27e-6, SO2: 25.5e-6, HCl: 11.5e-6 };
const MM = { CO2: 44, H2O: 18, O2: 32, N2: 28, SO2: 64, HCl: 36.5 };
const GAZ = Object.keys(MM);
const coefB = (mas) => GAZ.reduce((s, g) => s + CP1[g] * (mas[g] || 0), 0);
const coefA = (mas) => GAZ.reduce((s, g) => s + CP2[g] * (mas[g] || 0), 0);

// Mélange des fumées avec `ratio` kg d'air sec par kg de fumées, air à tAir [°C] et hrAir [%]
export function melangeAirFumees(fumees, tFumees, tAir, hrAir, ratio) {
  const mTot = GAZ.reduce((s, g) => s + (fumees[g] || 0), 0);
  const ppAir = (hrAir * psatH2O(tAir)) / 100;
  if (ppAir >= 760) return null;
  const humAbs = (MM.H2O / 29) * (ppAir / (760 - ppAir)); // kg eau / kg air sec
  const mAir = ratio * mTot;
  const fracO2 = (0.21 * MM.O2) / (0.21 * MM.O2 + 0.79 * MM.N2);
  const air = { H2O: humAbs * mAir, O2: fracO2 * mAir, N2: (1 - fracO2) * mAir };
  const mel = {};
  GAZ.forEach((g) => { mel[g] = (fumees[g] || 0) + (air[g] || 0); });
  const volTot = GAZ.reduce((s, g) => s + (mel[g] * 22.4) / MM[g], 0);
  const ppH2O = (((mel.H2O * 22.4) / MM.H2O) / volTot) * 760;
  const ent = tFumees * coefB(fumees) + tFumees * tFumees * coefA(fumees) + tAir * coefB(air) + tAir * tAir * coefA(air);
  const A = coefA(mel), B = coefB(mel);
  const tMel = (-B + Math.sqrt(B * B + 4 * A * ent)) / (2 * A);
  const psat = psatH2O(tMel);
  return { tMel, ppH2O, psat, hr: (ppH2O / psat) * 100 };
}

// Pour chaque humidité relative de l'air (0 à 100 %, pas de 5), température d'air en dessous de laquelle
// le mélange est saturé (panache visible). etat : 'limite' | 'jamais' | 'toujours'
export function calculAntipanache(fumees, tFumees, ratio) {
  const ecart = (tAir, hr) => {
    const r = melangeAirFumees(fumees, tFumees, tAir, hr, ratio);
    return r ? r.psat - r.ppH2O : -1;
  };
  const points = [];
  for (let hr = 0; hr <= 100; hr += 5) {
    const tMin = -50, tMax = 60, pas = 0.5;
    if (ecart(tMin, hr) >= 0) { points.push({ hr, etat: 'jamais', tLimite: null }); continue; }
    let a = tMin, trouve = false;
    for (let t = tMin + pas; t <= tMax; t += pas) {
      if (ecart(t, hr) >= 0) {
        let lo = a, hi = t;
        for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (ecart(mid, hr) < 0) lo = mid; else hi = mid; }
        points.push({ hr, etat: 'limite', tLimite: (lo + hi) / 2 });
        trouve = true;
        break;
      }
      a = t;
    }
    if (!trouve) points.push({ hr, etat: 'toujours', tLimite: null });
  }
  return points;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Composants d'affichage (définis au niveau module)
// ═════════════════════════════════════════════════════════════════════════════
const css = {
  carte: { background: '#fff', border: '1px solid #d0daea', borderRadius: 6, padding: 14, marginBottom: 18 },
  titre: { margin: '0 0 10px 0', fontSize: 15, color: '#1a3a6b' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px 24px' },
  ligne: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 },
  input: { width: 100, padding: '4px 6px', border: '1px solid #b9c6d8', borderRadius: 4, background: '#fffbe6', textAlign: 'right' },
  inputTab: { width: 78, padding: '3px 5px', border: '1px solid #b9c6d8', borderRadius: 4, background: '#fffbe6', textAlign: 'right' },
  valeur: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 100, textAlign: 'right' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', color: '#1a3a6b' },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center' },
  bouton: { padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  alerte: { padding: 8, marginBottom: 8, borderRadius: 4, fontSize: 12, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  image: { width: '100%', maxWidth: 260 },
};

const NumInput = ({ value, onChange, style = css.input, disabled = false, placeholder }) => (
  <input
    type="number"
    value={value ?? ''}
    disabled={disabled}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    style={disabled ? { ...style, background: '#eef1f5', color: '#555' } : style}
  />
);

const Champ = ({ label, value, onChange, disabled, placeholder }) => (
  <div style={css.ligne}>
    <label>{label}</label>
    <NumInput value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} />
  </div>
);

const Resultat = ({ label, value, fort = false }) => (
  <div style={css.ligne}>
    <span>{label}</span>
    <span style={fort ? { ...css.valeur, fontSize: 15, color: '#b45309' } : css.valeur}>{value}</span>
  </div>
);

const Carte = ({ titre, children }) => (
  <section style={css.carte}>
    <h3 style={css.titre}>{titre}</h3>
    {children}
  </section>
);

const VOISINE_VIDE = { dist: 0, Qm: 0, qPoussieres: 0, qSO2: 0, qNOx: 0, qHCl: 0, T: 0 };
const OBSTACLE_VIDE = { dist: 0, largeur: 0, hauteur: 0, angle: 0 };

const DEFAUTS = {
  manuel: false,
  man: { mCO2: 0, mH2O: 0, mO2: 0, mN2: 0, T: 150, qPoussieres: 0, qSO2: 0, qNOx: 0, qHCl: 0 },
  Tamb: 25, hrAir: 90, zone: 2,
  coPoussieres: 0.08, coSO2: 0.07, coNOx: 0.1, coHCl: 0,
  vitesse: '',
  voisines: [], obstacles: [],
  O2ref: 11, vlePoussieres: 10, vleSO2: 50, vleNOx: 200, vleHCl: 10,
  ratioAir: 1,
};

const NOM_POLLUANT = { Poussieres: 'SD_dust', SO2: 'SO2', NOx: 'NOx', HCl: 'HCl' };

// ═════════════════════════════════════════════════════════════════════════════
//  Onglet
// ═════════════════════════════════════════════════════════════════════════════
const STACKDesign3 = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = useCallback(
    (key) => translations[languageCode]?.[key] || translations.fr?.[key] || key,
    [languageCode],
  );
  const nomPolluant = (p) => t(NOM_POLLUANT[p]);

  const cle = `stackDesign3_${nodeId}`;
  const [p, setP] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(cle));
      return saved ? { ...DEFAUTS, ...saved, man: { ...DEFAUTS.man, ...(saved.man || {}) } } : DEFAUTS;
    } catch {
      return DEFAUTS;
    }
  });
  useEffect(() => { localStorage.setItem(cle, JSON.stringify(p)); }, [p, cle]);

  const set = (k) => (v) => setP((s) => ({ ...s, [k]: v }));
  const setMan = (k) => (v) => setP((s) => ({ ...s, man: { ...s.man, [k]: v } }));
  const setLigne = (liste, i, k) => (v) =>
    setP((s) => ({ ...s, [liste]: s[liste].map((l, j) => (j === i ? { ...l, [k]: v } : l)) }));
  const ajouter = (liste, vide) => () => setP((s) => ({ ...s, [liste]: [...s[liste], { ...vide }] }));
  const supprimer = (liste, i) => () => setP((s) => ({ ...s, [liste]: s[liste].filter((_, j) => j !== i) }));

  // ─── Flux amont ───
  const FG = innerData?.FG_OUT_kg_h;
  const Pol = innerData?.PollutantOutput || innerData?.Poutput;
  const T_amont = innerData?.T_OUT;
  const fluxDisponible = !!FG && (num(FG.CO2) + num(FG.H2O) + num(FG.O2) + num(FG.N2)) > 0;
  const flux = useMemo(() => ({
    mCO2: num(FG?.CO2), mH2O: num(FG?.H2O), mO2: num(FG?.O2), mN2: num(FG?.N2),
    T: num(T_amont),
    qPoussieres: num(Pol?.DustFlyAsh), qSO2: num(Pol?.SO2), qNOx: num(Pol?.NOx), qHCl: num(Pol?.HCl),
  }), [FG, Pol, T_amont]);
  const src = p.manuel ? p.man : flux;

  const r = useMemo(() => calculCheminee({ ...p, ...src }), [p, src]);

  const antipanache = useMemo(() => {
    if (!r) return null;
    const fumees = { CO2: r.m.CO2, H2O: r.m.H2O, O2: r.m.O2, N2: r.m.N2, SO2: r.q.SO2, HCl: r.q.HCl };
    const ratio = num(p.ratioAir);
    const ppIn = (r.vol.H2O / r.QvN) * 760;
    return {
      points: calculAntipanache(fumees, r.T, ratio),
      actuel: melangeAirFumees(fumees, r.T, num(p.Tamb), num(p.hrAir), ratio),
      hrEntree: (ppIn / psatH2O(r.T)) * 100,
    };
  }, [r, p.ratioAir, p.Tamb, p.hrAir]);

  // ─── Résultats vers innerData (rapport) ───
  const { truck15TPrice } = getOpexData();
  useEffect(() => {
    if (!setInnerData || !r) return;
    const dim = r.dimensionnant;
    setInnerData((prev) => ({
      ...prev,
      stack_design: {
        zone: r.zone, co: r.co, dT: r.dT, R: r.R, S: r.S, dimensionnant: dim,
        vitesse: r.vitesse, vMin: r.vMin, diametre: r.diametre,
        hp: r.hp, hpc: r.hpc, hpo: r.hpo, hCalc: r.hCalc, hFinale: r.hFinale,
        nbVoisines: r.voisines.length, nbVoisinesDependantes: r.voisines.filter((v) => v.dependante).length,
        nbObstacles: r.obstacles.length, nbObstaclesDependants: r.obstacles.filter((o) => o.dependant).length,
        q: r.q, O2ref: r.O2ref, O2sec: r.O2sec, conformite: r.conformite, conforme: r.conforme,
        Tamb: r.Tamb, T: r.T, manuel: p.manuel,
      },
      // clés historiques (ancien onglet Design)
      stack_hp_min: r.hp,
      stack_hp_multistack: Math.max(r.hp, r.hpc),
      stack_hp_obstacles: r.hFinale,
      stack_concentration_mg_Nm3: dim ? r.conformite[dim].conc : 0,
      stack_emission_limit_mg_Nm3: dim ? r.conformite[dim].limite : 0,
      stack_compliant_pct: dim ? r.conformite[dim].pct : 0,
      stack_compliant: r.conforme,
      stack_pollutant_type: dim || '—',
      stack_is_gaz: dim !== 'Poussieres',
      stack_zone: r.zone,
      stack_Qv_Nm3_h: r.QvN,
      stack_Qv_m3_h: r.R,
      stack_Qm_kg_h: r.Qm,
      // la cheminée n'a aucune consommation
      consoElec1: 0, consoElec2: 0, consoElec3: 0, consoElec4: 0, consoElec5: 0,
      labelElec1: '', labelElec2: '', labelElec3: '', labelElec4: '', labelElec5: '',
      conso_air_co_N_m3: 0,
      Conso_EauPotable_m3: 0, Conso_EauRefroidissement_m3: 0, Conso_EauDemin_m3: 0,
      Conso_EauRiviere_m3: 0, Conso_EauAdoucie_m3: 0,
      Conso_CaCO3_kg: 0, Conso_CaO_kg: 0, Conso_CaOH2_dry_kg: 0, Conso_CaOH2_wet_kg: 0,
      Conso_NaOH_kg: 0, Conso_NaOHCO3_kg: 0, Conso_Ammonia_kg: 0, Conso_NaBrCaBr2_kg: 0,
      truck15TPrice,
      conso_gaz_H_MW: 0, conso_gaz_L_MW: 0, conso_gaz_Process_MW: 0, conso_fuel: 0,
      conso_incineration_ash_kg_h: 0, conso_boiler_ash_kg_h: 0, conso_fly_ash_kg_h: 0,
      CO2_transport_incineratino_ash: 0, CO2_transport_boiler_ash: 0, CO2_transport_fly_ash: 0,
      cout_transport_incineratino_ash: 0, cout_transport_boiler_ash: 0, cout_transport_fly_ash: 0,
    }));
  }, [r, p.manuel, truck15TPrice, setInnerData]);

  const zones = [t('SD_zone0'), t('SD_zone1'), t('SD_zone2'), t('SD_zone3')];
  const courbe = (antipanache?.points || []).filter((pt) => pt.etat === 'limite').map((pt) => ({ hr: pt.hr, t: +pt.tLimite.toFixed(2) }));
  const toujours = (antipanache?.points || []).filter((pt) => pt.etat === 'toujours').map((pt) => pt.hr);
  const jamais = (antipanache?.points || []).filter((pt) => pt.etat === 'jamais').map((pt) => pt.hr);

  return (
    <div style={{ padding: 20 }}>
      {/* ── Source des données ── */}
      <Carte titre={t('SD_inlet')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={() => set('manuel')(false)} style={{ ...css.bouton, background: !p.manuel ? '#4a90e2' : '#e5e7eb', color: !p.manuel ? '#fff' : '#374151' }}>
            {t('SD_source_flow')}
          </button>
          <button onClick={() => set('manuel')(true)} style={{ ...css.bouton, background: p.manuel ? '#b45309' : '#e5e7eb', color: p.manuel ? '#fff' : '#374151' }}>
            {t('SD_source_manual')}
          </button>
        </div>
        {!p.manuel && !fluxDisponible && <div style={css.alerte}>{t('SD_no_flow')}</div>}
        <div style={css.grille}>
          <Champ label="CO2 [kg/h]" value={src.mCO2} onChange={setMan('mCO2')} disabled={!p.manuel} />
          <Champ label="H2O [kg/h]" value={src.mH2O} onChange={setMan('mH2O')} disabled={!p.manuel} />
          <Champ label="O2 [kg/h]" value={src.mO2} onChange={setMan('mO2')} disabled={!p.manuel} />
          <Champ label="N2 [kg/h]" value={src.mN2} onChange={setMan('mN2')} disabled={!p.manuel} />
          <Champ label={t('SD_T_fumees')} value={src.T} onChange={setMan('T')} disabled={!p.manuel} />
          {POLLUANTS.map((pol) => (
            <Champ key={pol} label={`${nomPolluant(pol)} [kg/h]`} value={src[`q${pol}`]} onChange={setMan(`q${pol}`)} disabled={!p.manuel} />
          ))}
        </div>
        {r && (
          <div style={{ ...css.grille, marginTop: 10 }}>
            <Resultat label={t('SD_Qm')} value={fmt(r.Qm, 0)} />
            <Resultat label={t('SD_QvN_wet')} value={fmt(r.QvN, 0)} />
            <Resultat label={t('SD_QvN_dry')} value={fmt(r.QvNsec, 0)} />
            <Resultat label={t('SD_R')} value={fmt(r.R, 0)} />
          </div>
        )}
      </Carte>

      {!r && <div style={css.alerte}>{t('SD_no_result')}</div>}

      {r && (
        <>
          {/* ── Hauteur théorique ── */}
          <Carte titre={t('SD_theoretical')}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
              <div style={css.image}><PlantPhotos /></div>
              <div>
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{t('SD_zone')}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {zones.map((z, i) => (
                    <button key={z} onClick={() => set('zone')(i)} style={{ ...css.bouton, background: Number(p.zone) === i ? '#4CAF50' : '#e5e7eb', color: Number(p.zone) === i ? '#fff' : '#374151' }}>
                      {z}
                    </button>
                  ))}
                </div>
                <div style={css.grille}>
                  <Champ label={t('SD_Tamb')} value={p.Tamb} onChange={set('Tamb')} />
                  <Champ label={`${t('SD_velocity')} (min ${r.vMin} m/s)`} value={p.vitesse} onChange={set('vitesse')} placeholder={String(r.vMin)} />
                </div>

                <table style={{ ...css.table, marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th style={css.th}>{t('SD_pollutant')}</th>
                      <th style={css.th}>q [kg/h]</th>
                      <th style={css.th}>k</th>
                      <th style={css.th}>cr [mg/m³]</th>
                      <th style={css.th}>co [mg/m³]</th>
                      <th style={css.th}>S = k·q / (cr − co)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POLLUANTS.map((pol) => {
                      const x = r.parPolluant[pol];
                      const dim = r.dimensionnant === pol;
                      return (
                        <tr key={pol} style={dim ? { background: '#fff7ed', fontWeight: 'bold' } : undefined}>
                          <td style={css.td}>{nomPolluant(pol)}{dim ? ` ◄ ${t('SD_governing')}` : ''}</td>
                          <td style={css.td}>{fmt(x.q, 3)}</td>
                          <td style={css.td}>{x.k}</td>
                          <td style={css.td}>{x.cr}</td>
                          <td style={css.td}>
                            {Number(p.zone) === 3
                              ? <NumInput value={p[`co${pol}`]} onChange={set(`co${pol}`)} style={css.inputTab} />
                              : x.co}
                          </td>
                          <td style={css.td}>{Number.isFinite(x.s) ? fmt(x.s, 0) : '∞'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {r.fondExcessif && <div style={{ ...css.alerte, marginTop: 8 }}>{t('SD_warn_background')}</div>}
                {r.dTplancher && <div style={{ ...css.alerte, marginTop: 8 }}>{t('SD_warn_dT').replace('{dT}', fmt(r.dTreel, 1))}</div>}
                {r.vitesseSousMin && <div style={{ ...css.alerte, marginTop: 8 }}>{t('SD_warn_velocity').replace('{v}', r.vMin)}</div>}
                {r.alertesDebit.length > 0 && (
                  <div style={{ ...css.alerte, marginTop: 8 }}>
                    {t('SD_warn_flow')} {r.alertesDebit.map((pol) => `${nomPolluant(pol)} > ${SEUIL_DEBIT[pol]} kg/h`).join(', ')}
                  </div>
                )}

                <div style={{ ...css.grille, marginTop: 12 }}>
                  <Resultat label={t('SD_dT')} value={fmt(r.dT, 1)} />
                  <Resultat label={t('SD_hp')} value={fmt(r.hp, 2)} />
                  <Resultat label={t('SD_velocity_used')} value={fmt(r.vitesse, 2)} />
                  <Resultat label={t('SD_diameter')} value={fmt(r.diametre, 2)} />
                </div>
              </div>
            </div>
          </Carte>

          {/* ── Cheminées voisines ── */}
          <Carte titre={t('SD_neighbours')}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
              <div style={css.image}><StripedStacks /></div>
              <div>
                <table style={css.table}>
                  <thead>
                    <tr>
                      <th style={css.th}>#</th>
                      <th style={css.th}>{t('SD_dist')}</th>
                      <th style={css.th}>{t('SD_n_Qm')}</th>
                      {POLLUANTS.map((pol) => <th key={pol} style={css.th}>{nomPolluant(pol)} [kg/h]</th>)}
                      <th style={css.th}>T [°C]</th>
                      <th style={css.th}>hj [m]</th>
                      <th style={css.th}>{t('SD_dependent')}</th>
                      <th style={css.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.voisines.map((c, i) => (
                      <tr key={i}>
                        <td style={css.td}>{i + 1}</td>
                        <td style={css.td}><NumInput value={c.dist} onChange={setLigne('voisines', i, 'dist')} style={css.inputTab} /></td>
                        <td style={css.td}><NumInput value={c.Qm} onChange={setLigne('voisines', i, 'Qm')} style={css.inputTab} /></td>
                        {POLLUANTS.map((pol) => (
                          <td key={pol} style={css.td}><NumInput value={c[`q${pol}`]} onChange={setLigne('voisines', i, `q${pol}`)} style={css.inputTab} /></td>
                        ))}
                        <td style={css.td}><NumInput value={c.T} onChange={setLigne('voisines', i, 'T')} style={css.inputTab} /></td>
                        <td style={css.td}>{fmt(r.voisines[i]?.hj, 2)}</td>
                        <td style={{ ...css.td, fontWeight: 'bold', color: r.voisines[i]?.dependante ? '#b45309' : '#555' }}>{r.voisines[i]?.dependante ? t('SD_yes') : t('SD_no')}</td>
                        <td style={css.td}><button onClick={supprimer('voisines', i)} style={{ ...css.bouton, background: '#fee2e2', color: '#991b1b', padding: '2px 8px' }}>✕</button></td>
                      </tr>
                    ))}
                    {p.voisines.length === 0 && <tr><td style={{ ...css.td, color: '#999' }} colSpan={11}>{t('SD_none')}</td></tr>}
                  </tbody>
                </table>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={ajouter('voisines', VOISINE_VIDE)} style={{ ...css.bouton, background: '#4a90e2', color: '#fff' }}>+ {t('SD_add_neighbour')}</button>
                  <button
                    onClick={() => setP((s) => ({ ...s, voisines: [...s.voisines, { dist: 0, Qm: r.Qm, qPoussieres: r.q.Poussieres, qSO2: r.q.SO2, qNOx: r.q.NOx, qHCl: r.q.HCl, T: r.T }] }))}
                    style={{ ...css.bouton, background: '#e5e7eb', color: '#374151' }}
                  >
                    + {t('SD_add_twin')}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#666', margin: '8px 0' }}>{t('SD_neighbour_note')}</div>
                <Resultat label={t('SD_hpc')} value={r.hpc > 0 ? fmt(r.hpc, 2) : '—'} />
              </div>
            </div>
          </Carte>

          {/* ── Obstacles ── */}
          <Carte titre={t('SD_obstacles')}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
              <div style={css.image}><StackHeightDiagram /></div>
              <div>
                <table style={css.table}>
                  <thead>
                    <tr>
                      <th style={css.th}>#</th>
                      <th style={css.th}>{t('SD_dist')}</th>
                      <th style={css.th}>{t('SD_o_width')}</th>
                      <th style={css.th}>{t('SD_o_height')}</th>
                      <th style={css.th}>{t('SD_o_angle')}</th>
                      <th style={css.th}>{t('SD_dependent')}</th>
                      <th style={css.th}>{t('SD_o_hcorr')}</th>
                      <th style={css.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.obstacles.map((o, i) => (
                      <tr key={i}>
                        <td style={css.td}>{i + 1}</td>
                        <td style={css.td}><NumInput value={o.dist} onChange={setLigne('obstacles', i, 'dist')} style={css.inputTab} /></td>
                        <td style={css.td}><NumInput value={o.largeur} onChange={setLigne('obstacles', i, 'largeur')} style={css.inputTab} /></td>
                        <td style={css.td}><NumInput value={o.hauteur} onChange={setLigne('obstacles', i, 'hauteur')} style={css.inputTab} /></td>
                        <td style={css.td}><NumInput value={o.angle} onChange={setLigne('obstacles', i, 'angle')} style={css.inputTab} /></td>
                        <td style={{ ...css.td, fontWeight: 'bold', color: r.obstacles[i]?.dependant ? '#b45309' : '#555' }}>{r.obstacles[i]?.dependant ? t('SD_yes') : t('SD_no')}</td>
                        <td style={css.td}>{r.obstacles[i]?.dependant ? fmt(r.obstacles[i].hcorr, 2) : '—'}</td>
                        <td style={css.td}><button onClick={supprimer('obstacles', i)} style={{ ...css.bouton, background: '#fee2e2', color: '#991b1b', padding: '2px 8px' }}>✕</button></td>
                      </tr>
                    ))}
                    {p.obstacles.length === 0 && <tr><td style={{ ...css.td, color: '#999' }} colSpan={8}>{t('SD_none')}</td></tr>}
                  </tbody>
                </table>
                <button onClick={ajouter('obstacles', OBSTACLE_VIDE)} style={{ ...css.bouton, background: '#4a90e2', color: '#fff', marginTop: 8 }}>+ {t('SD_add_obstacle')}</button>
                <div style={{ fontSize: 12, color: '#666', margin: '8px 0' }}>{t('SD_obstacle_note').replace('{h}', fmt(r.hRef, 2))}</div>
                <Resultat label={t('SD_hpo')} value={r.hpo > 0 ? fmt(r.hpo, 2) : '—'} />
              </div>
            </div>
          </Carte>

          {/* ── Hauteur retenue ── */}
          <Carte titre={t('SD_final')}>
            <div style={css.grille}>
              <Resultat label={t('SD_hp')} value={fmt(r.hp, 2)} />
              <Resultat label={t('SD_hpc')} value={r.hpc > 0 ? fmt(r.hpc, 2) : '—'} />
              <Resultat label={t('SD_hpo')} value={r.hpo > 0 ? fmt(r.hpo, 2) : '—'} />
              <Resultat label={t('SD_h_final')} value={fmt(r.hFinale, 2)} fort />
              <Resultat label={t('SD_diameter')} value={fmt(r.diametre, 2)} fort />
            </div>
            {r.minimumApplique && <div style={{ ...css.alerte, marginTop: 8 }}>{t('SD_warn_min').replace('{h}', fmt(r.hCalc, 2))}</div>}
          </Carte>

          {/* ── Conformité ── */}
          <Carte titre={t('SD_compliance')}>
            <div style={{ ...css.grille, marginBottom: 10 }}>
              <Champ label={t('SD_O2ref')} value={p.O2ref} onChange={set('O2ref')} />
              <Resultat label={t('SD_O2dry')} value={fmt(r.O2sec, 2)} />
            </div>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>{t('SD_pollutant')}</th>
                  <th style={css.th}>{t('SD_conc_raw')}</th>
                  <th style={css.th}>{t('SD_conc_ref')}</th>
                  <th style={css.th}>{t('SD_limit')}</th>
                  <th style={css.th}>%</th>
                  <th style={css.th}>{t('SD_status')}</th>
                </tr>
              </thead>
              <tbody>
                {POLLUANTS.map((pol) => {
                  const c = r.conformite[pol];
                  return (
                    <tr key={pol}>
                      <td style={css.td}>{nomPolluant(pol)}</td>
                      <td style={css.td}>{fmt(c.brut, 2)}</td>
                      <td style={css.td}>{fmt(c.conc, 2)}</td>
                      <td style={css.td}><NumInput value={p[`vle${pol}`]} onChange={set(`vle${pol}`)} style={css.inputTab} /></td>
                      <td style={css.td}>{c.limite > 0 ? fmt(c.pct, 1) : '—'}</td>
                      <td style={{ ...css.td, fontWeight: 'bold', color: c.ok ? '#15803d' : '#b91c1c' }}>{c.limite > 0 ? (c.ok ? t('compliant') : t('nonCompliant')) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>{t('SD_compliance_note')}</div>
          </Carte>

          {/* ── Antipanache ── */}
          <Carte titre={t('SD_plume')}>
            <div style={css.grille}>
              <Champ label={t('SD_ratio')} value={p.ratioAir} onChange={set('ratioAir')} />
              <Champ label={t('SD_Tamb')} value={p.Tamb} onChange={set('Tamb')} />
              <Champ label={t('SD_hrAir')} value={p.hrAir} onChange={set('hrAir')} />
              <Resultat label={t('SD_hr_inlet')} value={fmt(antipanache.hrEntree, 1)} />
              {antipanache.actuel && (
                <>
                  <Resultat label={t('SD_T_mix')} value={fmt(antipanache.actuel.tMel, 1)} />
                  <Resultat label={t('SD_hr_mix')} value={fmt(Math.min(antipanache.actuel.hr, 999), 1)} />
                </>
              )}
            </div>
            {antipanache.actuel && (
              <div style={{ ...css.alerte, marginTop: 10, background: antipanache.actuel.hr >= 100 ? '#fee2e2' : '#ecfdf5', color: antipanache.actuel.hr >= 100 ? '#991b1b' : '#065f46', borderColor: antipanache.actuel.hr >= 100 ? '#fca5a5' : '#6ee7b7' }}>
                {antipanache.actuel.hr >= 100 ? t('SD_plume_visible') : t('SD_plume_none')}
              </div>
            )}
            {courbe.length > 1 && (
              <div style={{ width: '100%', height: 300, marginTop: 10 }}>
                <ResponsiveContainer>
                  <LineChart data={courbe} margin={{ top: 10, right: 30, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" type="number" domain={['auto', 'auto']} label={{ value: t('SD_axis_T'), position: 'insideBottom', offset: -12 }} />
                    <YAxis dataKey="hr" type="number" domain={[0, 100]} label={{ value: t('SD_axis_HR'), angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(v, n) => [v, n === 'hr' ? t('SD_axis_HR') : n]} labelFormatter={(v) => `${v} °C`} />
                    <Line dataKey="hr" stroke="#1e88e5" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                    <ReferenceDot x={num(p.Tamb)} y={num(p.hrAir)} r={5} fill="#e53935" stroke="none" ifOverflow="extendDomain" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
              {t('SD_plume_note')}
              {toujours.length > 0 && ` ${t('SD_plume_always')} ${toujours[0]}–${toujours[toujours.length - 1]} %.`}
              {jamais.length > 0 && ` ${t('SD_plume_never')} ${jamais[0]}–${jamais[jamais.length - 1]} %.`}
            </div>
          </Carte>
        </>
      )}
    </div>
  );
};

export default STACKDesign3;
