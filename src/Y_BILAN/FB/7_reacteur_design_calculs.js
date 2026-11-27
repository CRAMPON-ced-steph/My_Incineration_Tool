// ============================================================================
// Design réacteur — comparaison Pyrofluid (gamme standard) / Thermylis HTFB (dimensions calculées)
// Fonctions pures, sans React. Longueurs internes en mètres, débits réels en m³/h PAR FOUR.
//
// Sources Pyrofluid (dossier PDP Pyrofluid) :
//   - VWT-EM-GCG-0037 Rev C « Généralités incinération » §5 : gamme R28–R72 (Ø réacteur, Ø voûte,
//     tuyères, Ø carneau, Ø gaine d'air, sable, capacité MV, injecteurs), §7 : vitesses, lit 1,5 m.
//   - VWT-EM-GCE-0310 Rev C « Chaudronnerie » §2 (fig. 3, 4, 5) : hauteur boîte à vent, tronçon 4,
//     dôme 23°, temps de séjour > 4,5 s au réacteur, épaisseurs 308 / 388 / 438 mm.
//   - VWT-EM-GCE-0312 Rev C « Réfractaire » §1.7 : rayon de voûte 5 m (R28–R50), 7 m (R56–R72).
// Source Thermylis : « HTFB Design Sheet V1 » (BS&P, 11/11/2026), onglets
//   « 14. Reactor Design » (D1–D6, H1–H7, R2, volumes) et « 9. Equipment Standards » (anneaux A–J,
//   vitesses par défaut, piquages par anneau, débit FAB, pertes thermiques).
// ============================================================================

import { calculDebitPT } from '../../A_Transverse_fonction/bilan_fct_FB';

export const FT = 0.3048; // m par pied
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const aire = (D) => (Math.PI * D * D) / 4;
// Volume d'un tronc de cône (diamètres D1, D2, hauteur h)
const tronc = (Da, Db, h) => (Math.PI / 12) * h * (Da * Da + Da * Db + Db * Db);
const pos = (v) => Number.isFinite(v) && v > 0;

// ── Pyrofluid : gamme standard ─────────────────────────────────────────────
// Diamètres internes réfractaire en mm. tuyeres = posées (Pyrofluid VB, onglet Voûte) ;
// tuyeresCommande = à commander (Généralités §5.1, inclut celles de la vidange de sable).
// Injecteurs (Généralités §5.2) : lit (combustible), réacteur (T2S), boues, eau, ammoniac.
export const PYRO_GAMME = [
  { id: 'R28', Df: 2850, Dv: 1802, tuyeres: 59,  tuyeresCommande: 60,  Dc: 650,  Da: 350, sable_t: 5,  MVmax: 340,  inj: [2, 1, 2, 2, 2], fioul_m3: 3.3,  gaz_Nm3: 3100 },
  { id: 'R36', Df: 3600, Dv: 2258, tuyeres: 91,  tuyeresCommande: 92,  Dc: 800,  Da: 450, sable_t: 8,  MVmax: 540,  inj: [2, 1, 2, 2, 2], fioul_m3: 5.3,  gaz_Nm3: 5000 },
  { id: 'R43', Df: 4300, Dv: 2714, tuyeres: 126, tuyeresCommande: 128, Dc: 950,  Da: 550, sable_t: 11, MVmax: 790,  inj: [2, 1, 2, 2, 2], fioul_m3: 7.7,  gaz_Nm3: 7200 },
  { id: 'R50', Df: 5000, Dv: 3150, tuyeres: 171, tuyeresCommande: 173, Dc: 1100, Da: 600, sable_t: 14, MVmax: 1060, inj: [4, 2, 2, 2, 2], fioul_m3: 10.4, gaz_Nm3: 9700 },
  { id: 'R56', Df: 5600, Dv: 3580, tuyeres: 217, tuyeresCommande: 218, Dc: 1250, Da: 700, sable_t: 18, MVmax: 1360, inj: [4, 2, 2, 2, 2], fioul_m3: 12.9, gaz_Nm3: 12100 },
  { id: 'R62', Df: 6200, Dv: 3970, tuyeres: 276, tuyeresCommande: 278, Dc: 1400, Da: 800, sable_t: 21, MVmax: 1680, inj: [4, 2, 2, 2, 2], fioul_m3: 15.9, gaz_Nm3: 14900 },
  { id: 'R67', Df: 6700, Dv: 4540, tuyeres: 335, tuyeresCommande: 337, Dc: 1500, Da: 900, sable_t: 28, MVmax: 2100, inj: [8, 3, 4, 3, 3], fioul_m3: 18.6, gaz_Nm3: 17400 },
  { id: 'R72', Df: 7200, Dv: 4900, tuyeres: 407, tuyeresCommande: 407, Dc: 1600, Da: 900, sable_t: 32, MVmax: 2460, inj: [8, 3, 4, 3, 3], fioul_m3: 21.4, gaz_Nm3: 20000 },
];

// Tailles de l'onglet Voûte au-delà de la gamme documentée (pas de données carneau, gaine, sable…)
export const PYRO_EXTENSIONS = [
  { id: 'R80', Df: 8000, Dv: 5476, tuyeres: 498 },
  { id: 'R85', Df: 8500, Dv: 5836, tuyeres: 566 },
  { id: 'R90', Df: 9000, Dv: 6196, tuyeres: 638 },
];

// L'onglet Voûte nomme « R63 » le réacteur de 6,20 m que les guides appellent R62.
const ALIAS_PYRO = { R63: 'R62' };

export const taillePyrofluid = (id) => {
  const cle = ALIAS_PYRO[id] || id;
  return PYRO_GAMME.find((t) => t.id === cle) || PYRO_EXTENSIONS.find((t) => t.id === cle) || null;
};

export const PYRO_REGLES = {
  e_paroi_mm: 388,    // réfractaire boîte à vent, lit, réacteur (joints compris)
  e_sole_mm: 308,     // sole de la boîte à vent
  e_dome_mm: 438,     // dôme
  e_carneau_mm: 280,  // carneau partie verticale 270–290 mm
  H_lit_mm: 1500,     // hauteur du lit fluidisé (paroi à 11,31°)
  angleLit_deg: 11.31,
  angleJonction_deg: 45,
  angleDome_deg: 23,
  tSejourReacteur_s: 4.5, // à capacité maximale (Chaudronnerie §2.3)
  tReglementaire_s: 2,    // 2 s à 850 °C (arrêté du 20/09/2002)
  vVoute: [0.85, 1.15],   // m/s à T lit (Généralités §5.1) ; l'onglet Voûte alerte hors 0,9–1,1
  vReacteur: [0.65, 1.0],
  vCarneau: [13, 20],
  vGaineAir: [20, 27],
  vTuyere: [85, 95],
};

// Charge massique admissible à la voûte selon la siccité (Généralités, annexe 2) [kg MS/h/m²]
const CHARGE_MS_SICCITE = [[20, 135], [25, 180], [30, 230], [35, 290]];
export const chargeMSAdmissible = (siccite) => {
  if (!pos(siccite)) return null;
  const t = CHARGE_MS_SICCITE;
  if (siccite <= t[0][0]) return t[0][1];
  if (siccite >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    const [s0, c0] = t[i]; const [s1, c1] = t[i + 1];
    if (siccite >= s0 && siccite <= s1) return c0 + ((siccite - s0) / (s1 - s0)) * (c1 - c0);
  }
  return null;
};

export const rayonVoutePyrofluid_mm = (Df_mm) => (Df_mm <= 5000 ? 5000 : 7000);

// ── Thermylis : anneaux de distributeur (HTFB Design Sheet, onglet 14 §9 et onglet 9 tables 8–10)
// diam_ft : Ø distributeur (dôme) ; fab_scfm : plage de débit du FAB ; pertes : pertes thermiques.
// Piquages (table 8) : boues, pulvérisation au toit, ammoniac / urée, hublots du freeboard.
export const THERMYLIS_ANNEAUX = [
  { id: 'A', diam_ft: 2.458,  fab_scfm: null,            pertes: null,  inj: null },
  { id: 'B', diam_ft: 4.042,  fab_scfm: [291, 786],      pertes: null,  inj: null },
  { id: 'C', diam_ft: 5.75,   fab_scfm: [789, 1591],     pertes: null,  inj: null },
  { id: 'D', diam_ft: 7.666,  fab_scfm: [1596, 2828],    pertes: 0.05,  inj: [2, 4, 2, '2–3'] },
  { id: 'E', diam_ft: 9.602,  fab_scfm: [2831, 4436],    pertes: null,  inj: [2, 4, 2, '2–3'] },
  { id: 'F', diam_ft: 11.518, fab_scfm: [4444, 6383],    pertes: 0.04,  inj: [2, 4, 2, '2–3'] },
  { id: 'G', diam_ft: 13.435, fab_scfm: [6384, 8685],    pertes: 0.04,  inj: [4, 6, 2, '2–3'] },
  { id: 'H', diam_ft: 15.352, fab_scfm: [8686, 11340],   pertes: 0.035, inj: [4, 6, 2, '2–3'] },
  { id: 'I', diam_ft: 17.268, fab_scfm: [11352, 14348],  pertes: 0.035, inj: [4, 6, 2, '2–3'] },
  { id: 'J', diam_ft: 19.185, fab_scfm: [14351, 17710],  pertes: 0.021, inj: [4, 6, 2, '2–3'] },
];

// Valeurs par défaut Thermylis (onglet 14 « Manual Inputs », listées pour l'anneau J de St. Paul,
// et onglet 9 « Reactor Defaults »). Longueurs en m.
export const THERMYLIS_DEFAUTS = {
  modeDistributeur: 'anneau', // 'anneau' = plus petit anneau standard ≥ Ø requis ; 'calcule' = Ø requis
  vDome_ms: 0.85,             // 2,789 ft/s, air au-dessus du dôme ramené à 1200 °F
  vFreeboardHaut_ms: 2.1 * FT, // 2,1 ft/s → Ø haut du freeboard (D1)
  vFreeboardBas_ms: 3.0 * FT,  // 3,0 ft/s → Ø bas du freeboard (D2)
  vCarneau_ms: 18,            // « Flue gas, PHX in » (onglet 9, table 1)
  Dcarneau_m: '',             // imposé ; vide = calculé avec vCarneau_ms
  H1_m: 4.5,                  // hauteur du freeboard (onglet 9 : 4,5 m ; St. Paul : 14,5 ft)
  H2_m: 10 * FT,              // hauteur du lit (cône inférieur) : 10 ft
  hSable_m: 5 * FT,           // couche de sable fluidisé : 5 ft (≤ H2)
  hGravier_m: 4 * 0.0254,     // gravier statique : 4 in
  H3_m: 1.25 * FT,            // épaisseur du dôme au centre : 1,25 ft
  H4_m: 7 * FT,               // hauteur de la boîte à vent : 7 ft
  alphaToit_deg: 20,          // pente du toit conique (20° minimum, jusqu'à 25°)
  T1_m: 9 * 0.0254,           // réfractaire 9 in
  T2_m: 4.5 * 0.0254,         // isolant 4,5 in
  T3_m: 0.375 * 0.0254,       // tôle 3/8 in
};

// ── Base de calcul (par four) à partir de innerData du nœud FB ─────────────
// Toute valeur saisie (non vide) remplace la valeur reçue des autres onglets.
export function baseDeCalcul(innerData = {}, saisies = {}) {
  const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));
  const choisir = (cle, auto) => (Number.isFinite(num(saisies[cle])) ? num(saisies[cle]) : auto);

  const N = Math.max(1, Math.round(choisir('NombreFour', Number(innerData.NombreFour) || 1)));
  const fgWet = innerData.FG_wet_Nm3_h ?? innerData.FG_OUT_Nm3_h?.wet ?? 0;
  const auto = {
    NombreFour: Number(innerData.NombreFour) || 1,
    Qfumees_Nm3h: (Number(fgWet) || 0) / (Number(innerData.NombreFour) || 1),
    Tfreeboard_C: Number(innerData.Temp_fumee_voute_C ?? 870),
    Qair_Nm3h: (Number(innerData.Q_air_comb_tot_Nm3_h) || 0) / (Number(innerData.NombreFour) || 1),
    Tlit_C: Number(innerData.TempNiveauVoute_C ?? 720),
    Tbav_C: Number(innerData.Tair_ap_prechauffe_C ?? 580),
    Pvoute_mmCE: Number(innerData.PressionVouteDefaut_mmCe ?? 2000),
    // Perte de charge des tuyères (onglet Voûte, en mCE) : l'air traverse le lit à P voûte − PDC
    PdcTuyeres_mmCE: (Number(innerData.PDC_Voute_Iter2) || 0) * 1000,
    MS_kg_h: (Number(innerData.MS_kg_h) || 0) / (Number(innerData.NombreFour) || 1),
    MV_kg_h: (Number(innerData.MV_kg_h) || 0) / (Number(innerData.NombreFour) || 1),
    siccite_pct: Number(innerData.MS_pourcent ?? innerData.siccite ?? 0),
  };
  // Débits par four : la saisie est par four, la valeur reçue est divisée par le nombre de fours du nœud.
  const autoN = { ...auto, NombreFour: N };
  if (N !== auto.NombreFour) {
    const ratio = auto.NombreFour / N;
    autoN.Qfumees_Nm3h = auto.Qfumees_Nm3h * ratio;
    autoN.Qair_Nm3h = auto.Qair_Nm3h * ratio;
    autoN.MS_kg_h = auto.MS_kg_h * ratio;
    autoN.MV_kg_h = auto.MV_kg_h * ratio;
  }
  const b = {};
  Object.keys(autoN).forEach((k) => { b[k] = k === 'NombreFour' ? N : choisir(k, autoN[k]); });

  // Débits réels (convention Pyrofluid calculDebitPT : P en mmCE relatifs, T en °C)
  b.Qfumees_m3h = calculDebitPT(b.Qfumees_Nm3h, 0, b.Tfreeboard_C);        // au freeboard (P ≈ 0)
  b.QairLit_m3h = calculDebitPT(b.Qair_Nm3h, b.Pvoute_mmCE - b.PdcTuyeres_mmCE, b.Tlit_C); // air au niveau du lit
  b.QairBav_m3h = calculDebitPT(b.Qair_Nm3h, b.Pvoute_mmCE, b.Tbav_C);     // air dans la gaine / boîte à vent
  b.auto = autoN;
  return b;
}

// ── Pyrofluid : géométrie d'un four standard ──────────────────────────────
// taille : objet de la gamme (ou { Df, Dv, tuyeres } hors standard, en mm).
export function calculPyrofluid(taille, base, opts = {}) {
  if (!taille || !pos(taille.Df) || !pos(taille.Dv)) return null;
  const R = PYRO_REGLES;
  const e = R.e_paroi_mm;
  const Df = taille.Df; const Dv = taille.Dv;
  const tSejour = pos(opts.tSejour_s) ? opts.tSejour_s : R.tSejourReacteur_s;
  const Qf = base.Qfumees_m3h / 3600;     // m³/s
  const QaLit = base.QairLit_m3h / 3600;
  const QaBav = base.QairBav_m3h / 3600;

  // Carneau et gaine d'air : standard ; hors gamme documentée → calculés au milieu de la plage de vitesse
  const DcStd = taille.Dc; const DaStd = taille.Da;
  const Dc = pos(DcStd) ? DcStd : (pos(Qf) ? Math.sqrt((4 * Qf) / (Math.PI * 16.5)) * 1000 : NaN);
  const Da = pos(DaStd) ? DaStd : (pos(QaBav) ? Math.sqrt((4 * QaBav) / (Math.PI * 23.5)) * 1000 : NaN);

  // Boîte à vent (tronçons 2 + 3, fig. 3) — mm
  const Rv = rayonVoutePyrofluid_mm(Df);
  const cosw = (0.5 * Dv - 135 + 70) / Rv;
  const w = Math.acos(Math.min(1, Math.max(-1, cosw)));
  const k = Rv * (1 - Math.sin(w));           // flèche de la voûte
  const Lp = k + 300 + 50 + 35;
  const Lbav = Lp + 198 + 150;                // minimum
  const Hbav = Lbav + Da + 1200;              // max(Da) pris = Ø de la gaine d'air (plus gros piquage)
  const DbavTole = Dv + 2.04 * e;

  // Lit et jonction (tronçon 4, fig. 4) — mm
  const Hlit = R.H_lit_mm;
  const D1 = Dv + 600;                        // Ø en haut du lit (paroi à 11,31°)
  const D2tole = Dv + 600 + 1.842 * e;
  const hp = 1500 - 0.493 * e;
  const h = 0.5 * (Df + 2 * e - Dv - 600 - 1.842 * e);
  const h1 = 0.5 * (Df - Dv - 600);           // jonction à 45° (interne)
  const Htroncon4 = h + hp;

  // Réacteur (tronçons 5 + 6) : hauteur pour le temps de séjour cible au débit de calcul
  const Sf = aire(Df / 1000);
  const vReact = Sf > 0 ? Qf / Sf : NaN;
  const Hreac = pos(Qf) ? (tSejour * Qf) / Sf : NaN;   // m

  // Dôme (tronçons 7 + 8, fig. 5)
  const HdomeInt = (Math.tan(rad(R.angleDome_deg)) * (Df - Dc)) / 2;            // mm, interne
  const Ldome = 0.212 * (Df + 2 * e - Dc - 2 * R.e_carneau_mm - 24);          // mm, tôle

  // Volumes et temps de séjour (gaz au débit du freeboard)
  const m = (x) => x / 1000;
  const Vlit = tronc(m(Dv), m(D1), m(Hlit));
  const Vjonction = tronc(m(D1), m(Df), m(h1));
  const Vreac = pos(Hreac) ? Sf * Hreac : NaN;
  const Vdome = tronc(m(Df), m(Dc), m(HdomeInt));
  const t = (V) => (pos(Qf) ? V / Qf : NaN);

  // Vitesses
  const Sv = aire(m(Dv));
  const vVoute = Sv > 0 ? QaLit / Sv : NaN;
  const vCarneau = pos(Dc) ? Qf / aire(m(Dc)) : NaN;
  const vGaine = pos(Da) ? QaBav / aire(m(Da)) : NaN;

  // Charges
  const chargeMS = Sv > 0 ? base.MS_kg_h / Sv : NaN;
  const chargeMSMax = chargeMSAdmissible(base.siccite_pct);

  const HtotInt = m(Hlit) + m(h1) + (pos(Hreac) ? Hreac : 0) + m(HdomeInt);

  return {
    id: taille.id || null,
    standard: !!taille.Dc,
    // Formules de chaudronnerie valables pour la gamme industrielle (pilote : Df − Dv < 600 mm)
    horsDomaine: h1 < 0 || Math.abs(cosw) > 1,
    Df: m(Df), Dv: m(Dv), D1: m(D1), Dc: m(Dc), Da: m(Da), DcStd: pos(DcStd), DaStd: pos(DaStd),
    DbavTole: m(DbavTole), D2tole: m(D2tole),
    e: m(e), eSole: m(R.e_sole_mm), eDome: m(R.e_dome_mm), eCarneau: m(R.e_carneau_mm),
    Rvoute: m(Rv), flecheVoute: m(k), Lprime: m(Lp), Lbav: m(Lbav), Hbav: m(Hbav),
    Hlit: m(Hlit), h: m(h), hPrime: m(hp), h1: m(h1), Htroncon4: m(Htroncon4),
    Hreac, HdomeInt: m(HdomeInt), Ldome: m(Ldome), HtotInt,
    angleLit: R.angleLit_deg, angleJonction: R.angleJonction_deg, angleDome: R.angleDome_deg,
    vVoute, vReact, vCarneau, vGaine,
    Vlit, Vjonction, Vreac, Vdome,
    tReac: t(Vreac), tAuDessusLit: t(Vjonction + (Vreac || 0) + Vdome), tTotal: t(Vlit + Vjonction + (Vreac || 0) + Vdome),
    tSejourCible: tSejour,
    chargeMS, chargeMSMax,
    tuyeres: taille.tuyeres ?? null, tuyeresCommande: taille.tuyeresCommande ?? null,
    sable_t: taille.sable_t ?? null, MVmax: taille.MVmax ?? null, inj: taille.inj ?? null,
    MV_kg_h: base.MV_kg_h,
  };
}

// ── Thermylis : géométrie calculée (formules de l'onglet 14 de la HTFB Design Sheet) ──
export function calculThermylis(base, p = THERMYLIS_DEFAUTS) {
  const P = { ...THERMYLIS_DEFAUTS, ...p };
  const num = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : d);
  const vDome = num(P.vDome_ms, 0.85);
  const vHaut = num(P.vFreeboardHaut_ms, 2.1 * FT);
  const vBas = num(P.vFreeboardBas_ms, 3 * FT);
  const vCarn = num(P.vCarneau_ms, 18);
  const H1 = num(P.H1_m, 0); const H2 = num(P.H2_m, 0); const H3 = num(P.H3_m, 0); const H4 = num(P.H4_m, 0);
  const hSable = Math.min(num(P.hSable_m, 0), H2);
  const hGravier = num(P.hGravier_m, 0);
  const alpha = num(P.alphaToit_deg, 20);
  const T1 = num(P.T1_m, 0); const T2 = num(P.T2_m, 0); const T3 = num(P.T3_m, 0);
  const ep = T1 + T2; // réfractaire + isolant

  const Qf = base.Qfumees_m3h / 3600;  // m³/s au freeboard
  // Air au-dessus du dôme ramené à 1200 °F (normalisation de la feuille, °R = °F + 460)
  const TlitF = base.Tlit_C * 1.8 + 32;
  const Qa1200 = (base.QairLit_m3h / 3600) * (460 + 1200) / (460 + TlitF);

  // Distributeur (dôme)
  const D3req = pos(Qa1200) ? Math.sqrt((4 * Qa1200) / (Math.PI * vDome)) : NaN;
  const D3req_ft = D3req / FT;
  const anneauSup = THERMYLIS_ANNEAUX.find((a) => a.diam_ft >= D3req_ft - 1e-9);
  const anneau = anneauSup || THERMYLIS_ANNEAUX[THERMYLIS_ANNEAUX.length - 1];
  const depasseJ = pos(D3req) && !anneauSup; // plus grand que J : soufflante d'air supplémentaire
  const D3 = P.modeDistributeur === 'calcule' ? D3req : anneau.diam_ft * FT;

  // Freeboard et carneau
  const D1 = pos(Qf) ? Math.sqrt((4 * Qf) / (Math.PI * vHaut)) : NaN;
  const D2 = pos(Qf) ? Math.sqrt((4 * Qf) / (Math.PI * vBas)) : NaN;
  const Dcarn = pos(num(P.Dcarneau_m, NaN)) ? num(P.Dcarneau_m, NaN) : (pos(Qf) ? Math.sqrt((4 * Qf) / (Math.PI * vCarn)) : NaN);

  const D4 = D1 + 2 * ep; const D5 = D3 + 2 * ep; const D6 = D2 + 2 * ep;
  // Courbure du dôme : R2 = 1,2 × (D3 + 2 × épaisseurs) − 3,06 ft
  const R2 = (1.2 * (D3 / FT) + 2.4 * (ep / FT) - 3.06) * FT;
  const H5 = (Math.tan(rad(alpha)) * (D1 - Dcarn)) / 2;     // toit conique
  const H6 = R2 > D3 / 2 ? R2 - Math.sqrt(R2 * R2 - (D3 * D3) / 4) : NaN; // flèche du dôme
  const H7 = Math.tan(rad(alpha)) * ep;                       // surhauteur de virole
  const Htot = 2 * ep + H1 + H2 + H3 + H4 + H5 + (pos(H6) ? H6 : 0);
  const HtotInt = H2 + H1 + H5; // dôme → départ carneau (interne)

  const angleFreeboard = H1 > 0 ? deg(Math.atan((D1 - D2) / (2 * H1))) : NaN;
  const angleLit = H2 > 0 ? deg(Math.atan((D2 - D3) / (2 * H2))) : NaN;

  // Volumes et temps de séjour (feuille : volume / débit du freeboard)
  const Dsable = H2 > 0 ? D3 + (hSable / H2) * (D2 - D3) : D3;
  const Vsable = tronc(Dsable, D3, hSable);
  const VlitDessusSable = tronc(Dsable, D2, H2 - hSable);
  const VfreeboardToit = tronc(D1, D2, H1) + tronc(D1, Dcarn, H5);
  const VconeBas = tronc(D3, D2, H2);
  const t = (V) => (pos(Qf) ? V / Qf : NaN);

  return {
    anneau: anneau.id, anneauObj: anneau, depasseJ, modeDistributeur: P.modeDistributeur,
    D1, D2, D3, D3req, Dcarn, D4, D5, D6, R2,
    H1, H2, H3, H4, H5, H6, H7, Htot, HtotInt, hSable, hGravier,
    T1, T2, T3, ep, alpha, angleFreeboard, angleLit,
    vDome, vHaut, vBas, vCarn,
    vDomeReelle: pos(D3) ? Qa1200 / aire(D3) : NaN,
    vAirLit: pos(D3) ? (base.QairLit_m3h / 3600) / aire(D3) : NaN,
    vFbHaut: pos(D1) ? Qf / aire(D1) : NaN,
    vFbBas: pos(D2) ? Qf / aire(D2) : NaN,
    vCarneauReelle: pos(Dcarn) ? Qf / aire(Dcarn) : NaN,
    Vsable, VlitDessusSable, VfreeboardToit, VconeBas,
    tSable: t(Vsable), tLitDessusSable: t(VlitDessusSable), tFreeboardToit: t(VfreeboardToit),
    tAuDessusLit: t(VfreeboardToit + VlitDessusSable), tTotal: t(VfreeboardToit + VconeBas),
    Qa1200_m3h: Qa1200 * 3600,
    chargeMS: pos(D3) ? base.MS_kg_h / aire(D3) : NaN,
  };
}

// Profil interne simplifié pour le schéma : liste de [y (m, 0 = voûte / dôme), demi-largeur (m)]
export function profilPyrofluid(r) {
  if (!r) return null;
  const y1 = r.Hlit; const y2 = y1 + Math.max(0, r.h1); const y3 = y2 + (pos(r.Hreac) ? r.Hreac : 0); const y4 = y3 + r.HdomeInt;
  return {
    corps: [[0, r.Dv / 2], [y1, r.D1 / 2], [y2, r.Df / 2], [y3, r.Df / 2], [y4, r.Dc / 2], [y4 + 0.6, r.Dc / 2]],
    boite: { bas: -r.Hbav, haut: 0, demi: r.Dv / 2 },
    reperes: [['lit', y1], ['jonction', y2], ['réacteur', y3], ['dôme', y4]],
  };
}

export function profilThermylis(r) {
  if (!r) return null;
  const y0 = r.H3; const y1 = y0 + r.H2; const y2 = y1 + r.H1; const y3 = y2 + r.H5;
  return {
    corps: [[y0, r.D3 / 2], [y1, r.D2 / 2], [y2, r.D1 / 2], [y3, r.Dcarn / 2], [y3 + 0.6, r.Dcarn / 2]],
    boite: { bas: -r.H4, haut: 0, demi: r.D3 / 2 },
    dome: { bas: 0, haut: y0 },
    reperes: [['lit', y1], ['freeboard', y2], ['toit', y3]],
  };
}
