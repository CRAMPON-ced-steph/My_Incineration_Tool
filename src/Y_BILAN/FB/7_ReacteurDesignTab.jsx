// Onglet « Design réacteur » (FB, mode Bilan) : dimensions du Pyrofluid (gamme standard R28–R72)
// et du Thermylis HTFB (dimensions calculées, distributeur sur anneaux A–J) côte à côte, pour le
// même débit par four. Affichage seul : n'écrit rien dans innerData.
// Calculs : 7_reacteur_design_calculs.js (sources et formules en tête du fichier).
import React, { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import { makeT } from '../../F_Gestion_Langues/localT';
import { translations } from './7_ReacteurDesign_traduction';
import {
  FT, PYRO_GAMME, PYRO_EXTENSIONS, PYRO_REGLES, THERMYLIS_ANNEAUX, THERMYLIS_DEFAUTS,
  taillePyrofluid, baseDeCalcul, calculPyrofluid, calculThermylis, profilPyrofluid, profilThermylis,
} from './7_reacteur_design_calculs';

const SUIVRE_VOUTE = 'VOUTE';
const cleStockage = (nodeId) => `reacteurDesign_FB_${nodeId}`;
const pos = (v) => Number.isFinite(v) && v > 0;

const ETAT_DEFAUT = {
  tailleChoix: SUIVRE_VOUTE,
  unite: 'm',
  tSejour_s: '4.5',
  base: {},
  thermylis: { ...THERMYLIS_DEFAUTS },
};

const lireEtat = (nodeId) => {
  try {
    const s = JSON.parse(localStorage.getItem(cleStockage(nodeId)) || 'null');
    if (s && typeof s === 'object') {
      return { ...ETAT_DEFAUT, ...s, base: { ...(s.base || {}) }, thermylis: { ...THERMYLIS_DEFAUTS, ...(s.thermylis || {}) } };
    }
  } catch { /* stockage indisponible */ }
  return { ...ETAT_DEFAUT, thermylis: { ...THERMYLIS_DEFAUTS } };
};

// ── Styles ─────────────────────────────────────────────────────────────────
const sCard = { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '20px' };
const sH2 = { color: '#1a202c', fontSize: '18px', margin: '0 0 14px 0' };
const sGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px 18px' };
const sLabel = { fontSize: '12px', color: '#4a5568', marginBottom: '3px', display: 'block' };
const sInput = { width: '100%', padding: '6px 8px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' };
const sTable = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
const sTh = { background: '#2d3748', color: 'white', padding: '7px 8px', textAlign: 'left', fontWeight: 600, position: 'sticky', top: 0 };
const sTd = { padding: '6px 8px', borderBottom: '1px solid #edf2f7', verticalAlign: 'top' };
const sNum = { ...sTd, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
const sSection = { background: '#edf2f7', fontWeight: 700, color: '#2d3748', padding: '6px 8px' };
const COUL_PYRO = '#c53030';
const COUL_THER = '#2b6cb0';

// ── Contexte (les sous-composants sont au niveau module, cf. CLAUDE.md) ─────
const Ctx = createContext(null);

const ChampBase = ({ cle, label, unite, dec = 1 }) => {
  const { etat, majBase, base } = useContext(Ctx);
  const auto = base.auto?.[cle];
  const val = etat.base[cle] ?? '';
  return (
    <div>
      <label style={sLabel}>{label} {unite ? `[${unite}]` : ''}</label>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          type="number"
          style={{ ...sInput, background: val === '' ? '#f7fafc' : '#fffbea' }}
          value={val}
          placeholder={Number.isFinite(auto) ? fmt(auto, dec).replace(/[\s\u2009]/g, '') : ''}
          onChange={(e) => majBase(cle, e.target.value)}
        />
        {val !== '' && (
          <button type="button" onClick={() => majBase(cle, '')} title="↺" style={{ border: '1px solid #cbd5e0', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>↺</button>
        )}
      </div>
    </div>
  );
};

const ChampTh = ({ cle, label, unite, pieds = false, min }) => {
  const { etat, majTh, t } = useContext(Ctx);
  const val = etat.thermylis[cle] ?? '';
  const n = Number(val);
  return (
    <div>
      <label style={sLabel}>
        {label} {unite ? `[${unite}]` : ''}
        {pieds && val !== '' && Number.isFinite(n) && (
          <span style={{ color: '#718096' }}> = {fmt(n / FT, 2)} ft</span>
        )}
        {cle === 'vFreeboardHaut_ms' || cle === 'vFreeboardBas_ms' || cle === 'vDome_ms' ? (
          <span style={{ color: '#718096' }}> = {fmt(n / FT, 2)} ft/s</span>
        ) : null}
      </label>
      <input
        type="number"
        min={min}
        style={sInput}
        value={val}
        placeholder={cle === 'Dcarneau_m' ? t('calculé') : ''}
        onChange={(e) => majTh(cle, e.target.value)}
      />
    </div>
  );
};

// Ligne du tableau de comparaison
const Ligne = ({ label, pyro, ther, type = 'L', dec, note, ecart = false }) => {
  const { L, uniteL } = useContext(Ctx);
  const conv = (v) => (type === 'L' ? L(v) : v);
  const d = dec ?? (type === 'L' ? 2 : type === 'deg' ? 1 : type === 't' ? 2 : 2);
  const unite = { L: uniteL, v: 'm/s', deg: '°', t: 's', mm: 'mm', m2: 'm²', charge: 'kg MS/h/m²' }[type] || '';
  const aff = (v) => (typeof v === 'string' ? v : Number.isFinite(v) ? fmt(conv(v), d) : '—');
  let txtEcart = '';
  if (ecart && Number.isFinite(pyro) && Number.isFinite(ther) && pyro !== 0) {
    const dv = conv(ther) - conv(pyro);
    txtEcart = `${dv >= 0 ? '+' : ''}${fmt(dv, d)} (${dv >= 0 ? '+' : ''}${fmt((100 * (ther - pyro)) / pyro, 0)} %)`;
  }
  return (
    <tr>
      <td style={sTd}>{label}</td>
      <td style={{ ...sNum, color: COUL_PYRO }}>{aff(pyro)}</td>
      <td style={{ ...sNum, color: COUL_THER }}>{aff(ther)}</td>
      <td style={{ ...sTd, color: '#718096', whiteSpace: 'nowrap' }}>{unite}</td>
      <td style={{ ...sNum, color: '#4a5568' }}>{txtEcart}</td>
      <td style={{ ...sTd, color: '#4a5568', fontSize: '12px' }}>{note}</td>
    </tr>
  );
};

const Section = ({ titre }) => (
  <tr><td colSpan={6} style={sSection}>{titre}</td></tr>
);

// Schéma des deux profils internes à la même échelle (y = 0 au niveau de la voûte / du dôme)
const Schema = ({ pyro, ther, labelPyro, labelTher }) => {
  const { t, L, uniteL } = useContext(Ctx);
  const pp = profilPyrofluid(pyro);
  const pt = profilThermylis(ther);
  if (!pp || !pt) return <p style={{ color: '#718096' }}>{t('Schéma indisponible : débits nuls.')}</p>;
  const W = 760; const H = 460; const marge = 30; const panneau = W / 2;
  const yMin = Math.min(pp.boite.bas, pt.boite.bas);
  const yMax = Math.max(pp.corps[pp.corps.length - 1][0], pt.corps[pt.corps.length - 1][0]);
  const demiMax = Math.max(...pp.corps.map((c) => c[1]), ...pt.corps.map((c) => c[1]), pp.boite.demi, pt.boite.demi);
  const ech = Math.min((panneau - 2 * marge - 70) / (2 * demiMax), (H - 2 * marge - 20) / (yMax - yMin));
  const Y = (y) => H - marge - (y - yMin) * ech;
  const poly = (corps, cx) => {
    const g = corps.map(([y, r]) => `${cx - r * ech},${Y(y)}`);
    const d = [...corps].reverse().map(([y, r]) => `${cx + r * ech},${Y(y)}`);
    return [...g, ...d].join(' ');
  };
  // Étiquettes de niveau écartées d'au moins 12 px (niveaux proches : lit / jonction, réacteur / dôme)
  const etiquettes = (reperes) => {
    const tri = reperes.map(([nom, y]) => ({ nom, y, yp: Y(y) })).sort((a, b) => b.yp - a.yp);
    for (let i = 1; i < tri.length; i++) tri[i].yt = Math.min(tri[i].yp, (tri[i - 1].yt ?? tri[i - 1].yp) - 12);
    return tri.map((e) => ({ ...e, yt: e.yt ?? e.yp }));
  };
  const dessin = (p, cx, coul, titre, dome) => (
    <g>
      <text x={cx} y={16} textAnchor="middle" fontSize="13" fontWeight="700" fill={coul}>{titre}</text>
      <rect x={cx - p.boite.demi * ech} y={Y(p.boite.haut)} width={2 * p.boite.demi * ech} height={(p.boite.haut - p.boite.bas) * ech}
        fill={coul} fillOpacity="0.08" stroke={coul} strokeDasharray="4 3" />
      {dome && (
        <rect x={cx - p.boite.demi * ech} y={Y(dome.haut)} width={2 * p.boite.demi * ech} height={(dome.haut - dome.bas) * ech}
          fill="#a0aec0" fillOpacity="0.5" stroke="#718096" />
      )}
      <polygon points={poly(p.corps, cx)} fill={coul} fillOpacity="0.12" stroke={coul} strokeWidth="1.5" />
      <line x1={cx - demiMax * ech - 10} x2={cx + demiMax * ech + 10} y1={Y(0)} y2={Y(0)} stroke="#4a5568" strokeDasharray="2 3" />
      {etiquettes(p.reperes).map(({ nom, y, yp, yt }) => (
        <g key={nom}>
          <line x1={cx + demiMax * ech * 0.2} x2={cx + demiMax * ech + 8} y1={yp} y2={yp} stroke="#a0aec0" strokeDasharray="2 2" />
          <line x1={cx + demiMax * ech + 8} x2={cx + demiMax * ech + 12} y1={yp} y2={yt} stroke="#a0aec0" />
          <text x={cx + demiMax * ech + 14} y={yt + 4} fontSize="10" fill="#4a5568">{t(nom)} {fmt(L(y), 2)} {uniteL}</text>
        </g>
      ))}
      <text x={cx + demiMax * ech + 14} y={Y(p.boite.bas) + 4} fontSize="10" fill="#4a5568">{fmt(L(p.boite.bas), 2)} {uniteL}</text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: `${W}px`, background: '#fcfcfd', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
      {dessin(pp, panneau / 2 - 20, COUL_PYRO, labelPyro, null)}
      {dessin(pt, panneau + panneau / 2 - 20, COUL_THER, labelTher, pt.dome)}
      <line x1={panneau} x2={panneau} y1={24} y2={H - 10} stroke="#e2e8f0" />
      <text x={W - 8} y={H - 8} textAnchor="end" fontSize="10" fill="#a0aec0">{t('Profils internes, même échelle — 0 = voûte / dôme')}</text>
    </svg>
  );
};

// ── Composant principal ────────────────────────────────────────────────────
const ReacteurDesignTab = ({ innerData = {}, innerDataTick, currentLanguage = 'fr', nodeId }) => {
  const t = useMemo(() => makeT(translations, currentLanguage), [currentLanguage]);
  const [etat, setEtat] = useState(() => lireEtat(nodeId));

  useEffect(() => {
    try { localStorage.setItem(cleStockage(nodeId), JSON.stringify(etat)); } catch { /* quota */ }
  }, [etat, nodeId]);

  const majBase = useCallback((cle, v) => setEtat((e) => ({ ...e, base: { ...e.base, [cle]: v } })), []);
  const majTh = useCallback((cle, v) => setEtat((e) => ({ ...e, thermylis: { ...e.thermylis, [cle]: v } })), []);
  const maj = useCallback((cle, v) => setEtat((e) => ({ ...e, [cle]: v })), []);

  // innerData est un objet muté par les autres onglets : innerDataTick force le recalcul
  const base = useMemo(() => baseDeCalcul(innerData, etat.base),
    [innerData, innerDataTick, etat.base]);

  const taille = useMemo(() => {
    if (etat.tailleChoix !== SUIVRE_VOUTE) return taillePyrofluid(etat.tailleChoix);
    const std = taillePyrofluid(innerData.Modele);
    if (std) return std;
    const Df = Number(innerData.DiametreFreeboard_m ?? innerData.DiametreFreeboard);
    const Dv = Number(innerData.DiametreVoute_m ?? innerData.DiametreVoute);
    if (pos(Df) && pos(Dv)) return { id: null, Df: Df * 1000, Dv: Dv * 1000, tuyeres: innerData.NbrTuyeresTotal ?? null };
    return taillePyrofluid('R36');
  }, [etat.tailleChoix, innerData, innerDataTick]);

  const pyro = useMemo(() => calculPyrofluid(taille, base, { tSejour_s: Number(etat.tSejour_s) }), [taille, base, etat.tSejour_s]);
  const ther = useMemo(() => calculThermylis(base, etat.thermylis), [base, etat.thermylis]);

  const uniteL = etat.unite === 'ft' ? 'ft' : 'm';
  const L = useCallback((m) => (etat.unite === 'ft' ? m / FT : m), [etat.unite]);
  const ctx = { etat, majBase, majTh, base, t, L, uniteL };

  const nomPyro = taille?.id ? `Pyrofluid ${taille.id}` : `Pyrofluid ${t('hors standard')}`;
  const nomTher = `Thermylis ${t('anneau')} ${ther.anneau}${ther.modeDistributeur === 'calcule' ? ` (${t('Ø calculé')})` : ''}`;

  // Alertes
  const alertes = [];
  const hors = (v, [a, b]) => Number.isFinite(v) && (v < a || v > b);
  if (pyro) {
    if (pyro.horsDomaine) alertes.push(['p', t('Géométrie hors du domaine des formules de chaudronnerie (pilote ?) : hauteurs indicatives.')]);
    if (!pyro.standard) alertes.push(['p', t('Taille hors gamme documentée : Ø carneau et Ø gaine d\'air calculés au milieu de la plage de vitesse.')]);
    if (hors(pyro.vVoute, PYRO_REGLES.vVoute)) alertes.push(['p', `${t('Vitesse à la voûte hors plage')} 0,85–1,15 m/s : ${fmt(pyro.vVoute, 2)} m/s`]);
    if (hors(pyro.vReact, PYRO_REGLES.vReacteur)) alertes.push(['p', `${t('Vitesse au réacteur hors plage')} 0,65–1 m/s : ${fmt(pyro.vReact, 2)} m/s`]);
    if (pyro.DcStd && hors(pyro.vCarneau, PYRO_REGLES.vCarneau)) alertes.push(['p', `${t('Vitesse au carneau hors plage')} 13–20 m/s : ${fmt(pyro.vCarneau, 1)} m/s`]);
    if (pyro.DaStd && hors(pyro.vGaine, PYRO_REGLES.vGaineAir)) alertes.push(['p', `${t('Vitesse dans la gaine d\'air hors plage')} 20–27 m/s : ${fmt(pyro.vGaine, 1)} m/s`]);
    if (pos(pyro.chargeMSMax) && pyro.chargeMS > pyro.chargeMSMax) alertes.push(['p', `${t('Charge MS à la voûte supérieure à l\'admissible')} (${fmt(pyro.chargeMSMax, 0)} kg MS/h/m²)`]);
    if (pos(pyro.MVmax) && pyro.MV_kg_h > pyro.MVmax) alertes.push(['p', `${t('Débit MV supérieur à la capacité indicative de la taille')} (${fmt(pyro.MVmax, 0)} kg MV/h)`]);
  }
  if (ther.depasseJ) alertes.push(['t', `${t('Ø de distributeur requis supérieur à l\'anneau J')} (${fmt(ther.D3req / FT, 2)} ft > 19,19 ft) : ${t('soufflante d\'air supplémentaire nécessaire (HTFB Design Sheet).')}`]);
  if (!pos(ther.H6) && pos(ther.D3)) alertes.push(['t', t('Rayon de courbure du dôme R2 inférieur au demi-diamètre : flèche H6 non calculable.')]);
  if (Number(etat.thermylis.hSable_m) > Number(etat.thermylis.H2_m)) alertes.push(['t', t('Couche de sable plus haute que H2 : limitée à H2.')]);
  if (Number.isFinite(ther.tAuDessusLit) && ther.tAuDessusLit < PYRO_REGLES.tReglementaire_s) alertes.push(['t', t('Temps de séjour au-dessus du lit inférieur à 2 s.')]);
  if (!(base.Qfumees_m3h > 0)) alertes.push(['g', t('Débit de fumées nul : calculez l\'onglet Combustion ou saisissez la base de calcul.')]);

  const tri = (a) => (a ? a.join(' / ') : '—');

  return (
    <Ctx.Provider value={ctx}>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* ── En-tête ── */}
        <div style={sCard}>
          <h2 style={{ ...sH2, fontSize: '20px' }}>{t('Design réacteur — Pyrofluid / Thermylis')}</h2>
          <p style={{ margin: '0 0 6px 0', color: '#4a5568', fontSize: '13px' }}>
            {t('Le Pyrofluid est défini par une gamme standard (R28 à R72) : un Ø de réacteur et une voûte par taille, les hauteurs suivent les règles de chaudronnerie. Le Thermylis n\'a pas de taille standard : ses diamètres découlent des vitesses de gaz, seul le distributeur est pris sur des anneaux (A à J).')}
          </p>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '10px' }}>
            <div style={{ minWidth: '230px' }}>
              <label style={sLabel}>{t('Taille Pyrofluid')}</label>
              <select style={sInput} value={etat.tailleChoix} onChange={(e) => maj('tailleChoix', e.target.value)}>
                <option value={SUIVRE_VOUTE}>{t('Selon l\'onglet Voûte')} ({innerData.Modele || '—'})</option>
                {PYRO_GAMME.map((g) => <option key={g.id} value={g.id}>{g.id} — Ø {fmt(g.Df / 1000, 2)} m</option>)}
                {PYRO_EXTENSIONS.map((g) => <option key={g.id} value={g.id}>{g.id} — Ø {fmt(g.Df / 1000, 2)} m ({t('extension outil')})</option>)}
              </select>
            </div>
            <div style={{ minWidth: '230px' }}>
              <label style={sLabel}>{t('Distributeur Thermylis')}</label>
              <select style={sInput} value={etat.thermylis.modeDistributeur} onChange={(e) => majTh('modeDistributeur', e.target.value)}>
                <option value="anneau">{t('Anneau standard (plus petit ≥ Ø requis)')}</option>
                <option value="calcule">{t('Ø calculé (hors anneau)')}</option>
              </select>
            </div>
            <div>
              <label style={sLabel}>{t('Unité des longueurs')}</label>
              <select style={sInput} value={etat.unite} onChange={(e) => maj('unite', e.target.value)}>
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
            <button type="button" onClick={() => setEtat({ ...ETAT_DEFAUT, thermylis: { ...THERMYLIS_DEFAUTS } })}
              style={{ padding: '7px 12px', border: '1px solid #cbd5e0', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
              {t('Réinitialiser')}
            </button>
          </div>
        </div>

        {/* ── Base de calcul ── */}
        <div style={sCard}>
          <h2 style={sH2}>{t('Base de calcul (par four)')}</h2>
          <p style={{ margin: '0 0 10px 0', color: '#718096', fontSize: '12px' }}>
            {t('Champ vide = valeur des autres onglets (en gris). Une saisie la remplace pour cet onglet seulement.')}
          </p>
          <div style={sGrid}>
            <ChampBase cle="NombreFour" label={t('Nombre de fours')} dec={0} />
            <ChampBase cle="Qfumees_Nm3h" label={t('Fumées humides')} unite="Nm³/h" dec={0} />
            <ChampBase cle="Tfreeboard_C" label={t('T freeboard')} unite="°C" dec={0} />
            <ChampBase cle="Qair_Nm3h" label={t('Air de fluidisation')} unite="Nm³/h" dec={0} />
            <ChampBase cle="Tlit_C" label={t('T lit')} unite="°C" dec={0} />
            <ChampBase cle="Tbav_C" label={t('T boîte à vent')} unite="°C" dec={0} />
            <ChampBase cle="Pvoute_mmCE" label={t('Pression voûte')} unite="mmCE" dec={0} />
            <ChampBase cle="PdcTuyeres_mmCE" label={t('PDC tuyères')} unite="mmCE" dec={0} />
            <ChampBase cle="MS_kg_h" label={t('Matière sèche')} unite="kg/h" dec={1} />
            <ChampBase cle="MV_kg_h" label={t('Matière volatile')} unite="kg/h" dec={1} />
            <ChampBase cle="siccite_pct" label={t('Siccité')} unite="%" dec={1} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#4a5568' }}>
            {t('Débits réels')} : {t('fumées au freeboard')} {fmt(base.Qfumees_m3h, 0)} m³/h · {t('air au lit')} {fmt(base.QairLit_m3h, 0)} m³/h · {t('air en boîte à vent')} {fmt(base.QairBav_m3h, 0)} m³/h
          </div>
        </div>

        {/* ── Paramètres de dimensionnement ── */}
        <div style={sCard}>
          <h2 style={sH2}>{t('Règles de dimensionnement')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 3fr', gap: '18px' }}>
            <div>
              <h3 style={{ color: COUL_PYRO, fontSize: '14px', margin: '0 0 8px 0' }}>Pyrofluid</h3>
              <label style={sLabel}>{t('Temps de séjour au réacteur visé')} [s]</label>
              <input type="number" style={sInput} value={etat.tSejour_s} onChange={(e) => maj('tSejour_s', e.target.value)} />
              <p style={{ fontSize: '11px', color: '#718096', margin: '6px 0 0 0' }}>
                {t('Guide chaudronnerie : > 4,5 s à capacité maximale (fixe la hauteur des tronçons 5 et 6). Les autres cotes sont celles de la gamme et des formules du guide.')}
              </p>
            </div>
            <div>
              <h3 style={{ color: COUL_THER, fontSize: '14px', margin: '0 0 8px 0' }}>Thermylis (HTFB Design Sheet)</h3>
              <div style={sGrid}>
                <ChampTh cle="vDome_ms" label={t('Vitesse air au-dessus du dôme (1200 °F)')} unite="m/s" />
                <ChampTh cle="vFreeboardHaut_ms" label={t('Vitesse haut du freeboard (D1)')} unite="m/s" />
                <ChampTh cle="vFreeboardBas_ms" label={t('Vitesse bas du freeboard (D2)')} unite="m/s" />
                <ChampTh cle="vCarneau_ms" label={t('Vitesse au carneau')} unite="m/s" />
                <ChampTh cle="Dcarneau_m" label={t('Ø carneau imposé')} unite="m" pieds />
                <ChampTh cle="H1_m" label={`H1 — ${t('hauteur du freeboard')}`} unite="m" pieds />
                <ChampTh cle="H2_m" label={`H2 — ${t('hauteur du lit (cône bas)')}`} unite="m" pieds />
                <ChampTh cle="hSable_m" label={t('Couche de sable fluidisé')} unite="m" pieds />
                <ChampTh cle="H3_m" label={`H3 — ${t('épaisseur du dôme au centre')}`} unite="m" pieds />
                <ChampTh cle="H4_m" label={`H4 — ${t('hauteur de la boîte à vent')}`} unite="m" pieds />
                <ChampTh cle="alphaToit_deg" label={t('Pente du toit')} unite="°" />
                <ChampTh cle="T1_m" label={`T1 — ${t('réfractaire')}`} unite="m" pieds />
                <ChampTh cle="T2_m" label={`T2 — ${t('isolant')}`} unite="m" pieds />
                <ChampTh cle="T3_m" label={`T3 — ${t('tôle')}`} unite="m" pieds />
              </div>
              <p style={{ fontSize: '11px', color: '#718096', margin: '6px 0 0 0' }}>
                {t('Valeurs par défaut de la feuille (saisies manuelles listées pour l\'anneau J de St. Paul). H5, H6, H7 sont calculées.')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Alertes ── */}
        {alertes.length > 0 && (
          <div style={{ ...sCard, background: '#fffaf0', border: '1px solid #f6ad55' }}>
            {alertes.map(([qui, txt], i) => (
              <div key={i} style={{ fontSize: '13px', color: '#7b341e', marginBottom: '4px' }}>
                ⚠ <strong style={{ color: qui === 'p' ? COUL_PYRO : qui === 't' ? COUL_THER : '#7b341e' }}>
                  {qui === 'p' ? 'Pyrofluid' : qui === 't' ? 'Thermylis' : ''}
                </strong>{qui !== 'g' ? ' : ' : ''}{txt}
              </div>
            ))}
          </div>
        )}

        {/* ── Comparaison ── */}
        <div style={sCard}>
          <h2 style={sH2}>{t('Comparaison côte à côte')} — {nomPyro} / {nomTher}</h2>
          {!pyro ? <p>{t('Taille Pyrofluid introuvable.')}</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={sTable}>
                <thead>
                  <tr>
                    <th style={sTh}>{t('Grandeur')}</th>
                    <th style={{ ...sTh, textAlign: 'right' }}>Pyrofluid</th>
                    <th style={{ ...sTh, textAlign: 'right' }}>Thermylis</th>
                    <th style={sTh}>{t('Unité')}</th>
                    <th style={{ ...sTh, textAlign: 'right' }}>{t('Écart T − P')}</th>
                    <th style={sTh}>{t('Règle / remarque')}</th>
                  </tr>
                </thead>
                <tbody>
                  <Section titre={t('Diamètres internes (réfractaire)')} />
                  <Ligne label={t('Voûte / distributeur')} pyro={pyro.Dv} ther={ther.D3} ecart
                    note={`P : ${t('voûte standard de la taille')} · T : ${t('air ramené à 1200 °F à')} ${fmt(ther.vDome, 2)} m/s → ${t('Ø requis')} ${fmt(L(ther.D3req), 2)} ${uniteL}, ${t('anneau')} ${ther.anneau}`} />
                  <Ligne label={t('Haut du lit')} pyro={pyro.D1} ther={ther.D2} ecart
                    note={`P : Dv + 600 mm (${t('paroi à')} 11,31°) · T : D2, ${t('fumées à')} ${fmt(ther.vBas, 2)} m/s`} />
                  <Ligne label={t('Réacteur / freeboard (haut)')} pyro={pyro.Df} ther={ther.D1} ecart
                    note={`P : ${t('Ø standard, cylindre')} · T : D1, ${t('fumées à')} ${fmt(ther.vHaut, 2)} m/s (${t('freeboard conique')})`} />
                  <Ligne label={t('Carneau (départ)')} pyro={pyro.Dc} ther={ther.Dcarn} ecart
                    note={`P : ${pyro.DcStd ? t('Ø standard de la taille') : t('calculé à 16,5 m/s')} · T : ${pos(Number(etat.thermylis.Dcarneau_m)) ? t('imposé') : `${t('calculé à')} ${fmt(ther.vCarn, 1)} m/s`}`} />
                  <Ligne label={t('Gaine d\'air de fluidisation')} pyro={pyro.Da} ther={NaN}
                    note={`P : ${pyro.DaStd ? t('Ø standard de la taille') : t('calculé à 23,5 m/s')}`} />
                  <Ligne label={t('Virole boîte à vent (tôle)')} pyro={pyro.DbavTole} ther={ther.D5} ecart
                    note={`P : Øbav = Dv + 2,04 e · T : D5 = D3 + 2 (T1 + T2)`} />
                  <Ligne label={t('Virole haut du freeboard (tôle)')} pyro={pyro.Df + 2 * pyro.e} ther={ther.D4} ecart note="P : Df + 2 e · T : D4 = D1 + 2 (T1 + T2)" />

                  <Section titre={t('Hauteurs')} />
                  <Ligne label={t('Boîte à vent')} pyro={pyro.Hbav} ther={ther.H4} ecart
                    note={`P : Hbav = Lbav + max(Da) + 1200 mm (${t('tronçons 2 + 3')}) · T : H4 (${t('saisie')})`} />
                  <Ligne label={t('Flèche de la voûte / du dôme')} pyro={pyro.flecheVoute} ther={ther.H6} ecart
                    note={`P : k = R (1 − sin w), R = ${fmt(pyro.Rvoute, 0)} m · T : H6, R2 = ${fmt(L(ther.R2), 2)} ${uniteL}`} />
                  <Ligne label={t('Épaisseur du distributeur')} pyro={NaN} ther={ther.H3} note={`T : H3 (${t('saisie')})`} />
                  <Ligne label={t('Lit fluidisé (sable)')} pyro={pyro.Hlit} ther={ther.hSable} ecart
                    note={`P : 1 500 mm ${t('fixe')} · T : ${t('couche de sable (saisie)')}`} />
                  <Ligne label={t('Zone du lit jusqu\'au réacteur / freeboard')} pyro={pyro.Hlit + Math.max(0, pyro.h1)} ther={ther.H2} ecart
                    note={`P : 1 500 + h1 (${t('jonction à 45°')}, h1 = ${fmt(L(pyro.h1), 2)} ${uniteL}) · T : H2 (${t('saisie')})`} />
                  <Ligne label={t('Tronçon 4 (tôle)')} pyro={pyro.Htroncon4} ther={NaN}
                    note={`P : h + h' = ${fmt(L(pyro.h), 2)} + ${fmt(L(pyro.hPrime), 2)} ${uniteL}`} />
                  <Ligne label={t('Réacteur / freeboard')} pyro={pyro.Hreac} ther={ther.H1} ecart
                    note={`P : ${t('cylindre pour')} ${fmt(pyro.tSejourCible, 1)} s ${t('au débit de calcul')} · T : H1 (${t('saisie')})`} />
                  <Ligne label={t('Dôme / toit (interne)')} pyro={pyro.HdomeInt} ther={ther.H5} ecart
                    note={`P : tan 23° × (Df − Dc) / 2 · T : H5 = tan ${fmt(ther.alpha, 0)}° × (D1 − Dcarneau) / 2`} />
                  <Ligne label={t('Dôme (tôle)')} pyro={pyro.Ldome} ther={NaN} note="P : L = 0,212 (Df + 2e − Dc − 2ec − 24)" />
                  <Ligne label={t('Surhauteur de virole')} pyro={NaN} ther={ther.H7} note="T : H7 = tan α × (T1 + T2)" />
                  <Ligne label={t('Hauteur interne voûte → carneau')} pyro={pyro.HtotInt} ther={ther.HtotInt + ther.H3} ecart
                    note={`P : 1 500 + h1 + ${t('réacteur')} + ${t('dôme')} · T : H3 + H2 + H1 + H5`} />
                  <Ligne label={t('Hauteur totale')} pyro={pyro.Hbav + pyro.HtotInt} ther={ther.Htot} ecart
                    note={`P : ${t('boîte à vent + hauteur interne (indicatif)')} · T : ${t('feuille : 2 (T1 + T2) + H1…H6')}`} />

                  <Section titre={t('Angles')} />
                  <Ligne type="deg" label={t('Paroi du lit / cône bas (/ verticale)')} pyro={pyro.angleLit} ther={ther.angleLit} note={t('P : fixe · T : découle de D2, D3 et H2')} />
                  <Ligne type="deg" label={t('Jonction lit → réacteur (/ verticale)')} pyro={pyro.angleJonction} ther={NaN} note={t('P : 45°')} />
                  <Ligne type="deg" label={t('Paroi du réacteur / freeboard (/ verticale)')} pyro={0} ther={ther.angleFreeboard} note={t('P : cylindre · T : cône, découle de D1, D2 et H1')} />
                  <Ligne type="deg" label={t('Dôme / toit (/ horizontale)')} pyro={pyro.angleDome} ther={ther.alpha} note={t('T : 20° minimum, jusqu\'à 25°')} />

                  <Section titre={t('Vitesses (débits réels)')} />
                  <Ligne type="v" label={t('Air à la voûte / au distributeur (T lit)')} pyro={pyro.vVoute} ther={ther.vAirLit}
                    note={`P : 0,85–1,15 m/s · T : ${fmt(ther.vDomeReelle, 2)} m/s ${t('à 1200 °F')}`} />
                  <Ligne type="v" label={t('Fumées en haut du lit')} pyro={pos(pyro.D1) ? base.Qfumees_m3h / 3600 / (Math.PI * pyro.D1 * pyro.D1 / 4) : NaN} ther={ther.vFbBas} note={t('T : bas du freeboard (D2)')} />
                  <Ligne type="v" label={t('Fumées au réacteur / haut du freeboard')} pyro={pyro.vReact} ther={ther.vFbHaut} note="P : 0,65–1 m/s" />
                  <Ligne type="v" label={t('Fumées au carneau')} pyro={pyro.vCarneau} ther={ther.vCarneauReelle} note="P : 13–20 m/s" />
                  <Ligne type="v" label={t('Air dans la gaine de fluidisation')} pyro={pyro.vGaine} ther={NaN} note="P : 20–27 m/s" />

                  <Section titre={t('Temps de séjour des fumées')} />
                  <Ligne type="t" label={t('Réacteur seul / freeboard + toit')} pyro={pyro.tReac} ther={ther.tFreeboardToit} />
                  <Ligne type="t" label={t('Au-dessus du lit')} pyro={pyro.tAuDessusLit} ther={ther.tAuDessusLit}
                    note={t('P : jonction + réacteur + dôme · T : cône au-dessus du sable + freeboard + toit')} />
                  <Ligne type="t" label={t('Total (lit compris)')} pyro={pyro.tTotal} ther={ther.tTotal} note={t('Réglementaire : 2 s à 850 °C')} />

                  <Section titre={t('Garnissage et charges')} />
                  <Ligne type="mm" label={t('Réfractaire des parois (total)')} pyro={pyro.e * 1000} ther={ther.ep * 1000} dec={0}
                    note={`P : 388 mm (${t('sole')} 308, ${t('dôme')} 438, ${t('carneau')} 270–290) · T : ${fmt(ther.T1 * 1000, 0)} + ${fmt(ther.T2 * 1000, 0)} mm, ${t('tôle')} ${fmt(ther.T3 * 1000, 1)} mm`} />
                  <Ligne type="charge" label={t('Charge MS à la voûte / au distributeur')} pyro={pyro.chargeMS} ther={ther.chargeMS} dec={0}
                    note={pos(pyro.chargeMSMax) ? `P : ${t('admissible')} ${fmt(pyro.chargeMSMax, 0)} ${t('à')} ${fmt(base.siccite_pct, 1)} % MS` : ''} />
                  <Ligne type="num" label={t('Tuyères (posées / à commander)')} pyro={pyro.tuyeres ? `${pyro.tuyeres}${pyro.tuyeresCommande ? ` / ${pyro.tuyeresCommande}` : ''}` : '—'} ther="—" />
                  <Ligne type="num" label={t('Sable (t)')} pyro={pyro.sable_t ?? NaN} ther={NaN} dec={0} />
                  <Ligne type="num" label={t('Capacité MV indicative (kg MV/h)')} pyro={pyro.MVmax ?? NaN} ther={NaN} dec={0}
                    note={`${t('Débit de calcul')} : ${fmt(base.MV_kg_h, 0)} kg MV/h · P : ${t('autothermique, PCI 5 630 kcal/kg MV')}`} />
                  <Ligne type="num" label={t('Injecteurs de boues')} pyro={pyro.inj ? String(pyro.inj[2]) : '—'} ther={ther.anneauObj.inj ? String(ther.anneauObj.inj[0]) : '—'} />
                  <Ligne type="num" label={t('Injecteurs d\'eau / pulvérisation au toit')} pyro={pyro.inj ? String(pyro.inj[3]) : '—'} ther={ther.anneauObj.inj ? String(ther.anneauObj.inj[1]) : '—'} />
                  <Ligne type="num" label={t('Injecteurs ammoniac / urée')} pyro={pyro.inj ? String(pyro.inj[4]) : '—'} ther={ther.anneauObj.inj ? String(ther.anneauObj.inj[2]) : '—'} />
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Schéma ── */}
        {pyro && (
          <div style={sCard}>
            <h2 style={sH2}>{t('Schéma à l\'échelle')}</h2>
            <Schema pyro={pyro} ther={ther} labelPyro={nomPyro} labelTher={nomTher} />
          </div>
        )}

        {/* ── Gamme Pyrofluid ── */}
        <div style={sCard}>
          <h2 style={sH2}>{t('Gamme standard Pyrofluid')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={sTable}>
              <thead>
                <tr>
                  {[t('Taille'), `Ø ${t('réacteur')} [m]`, `Ø ${t('voûte')} [m]`, t('Tuyères'), `Ø ${t('carneau')} [mm]`, `Ø ${t('gaine air')} [mm]`,
                    `${t('Sable')} [t]`, `MV max [kg/h]`, `${t('Injecteurs')} *`, `R ${t('voûte')} [m]`, `Hbav [m]`, `${t('Tronçon 4')} [m]`, `h1 [m]`, `${t('Dôme int.')} [m]`, `${t('Démarrage')} **`]
                    .map((h) => <th key={h} style={sTh}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[...PYRO_GAMME, ...PYRO_EXTENSIONS].map((g) => {
                  const r = calculPyrofluid(g, { Qfumees_m3h: 0, QairLit_m3h: 0, QairBav_m3h: 0, MS_kg_h: 0, siccite_pct: 0 });
                  const sel = pyro?.id === g.id;
                  const st = sel ? { background: '#fff5f5', fontWeight: 700 } : {};
                  return (
                    <tr key={g.id} style={st}>
                      <td style={sTd}>{g.id}{!g.Dc ? ` (${t('ext.')})` : ''}</td>
                      <td style={sNum}>{fmt(g.Df / 1000, 2)}</td>
                      <td style={sNum}>{fmt(g.Dv / 1000, 3)}</td>
                      <td style={sNum}>{g.tuyeres}{g.tuyeresCommande ? ` / ${g.tuyeresCommande}` : ''}</td>
                      <td style={sNum}>{g.Dc ?? '—'}</td>
                      <td style={sNum}>{g.Da ?? '—'}</td>
                      <td style={sNum}>{g.sable_t ?? '—'}</td>
                      <td style={sNum}>{g.MVmax ? fmt(g.MVmax, 0) : '—'}</td>
                      <td style={sNum}>{tri(g.inj)}</td>
                      <td style={sNum}>{fmt(r.Rvoute, 0)}</td>
                      <td style={sNum}>{g.Da ? fmt(r.Hbav, 2) : '—'}</td>
                      <td style={sNum}>{fmt(r.Htroncon4, 2)}</td>
                      <td style={sNum}>{fmt(r.h1, 2)}</td>
                      <td style={sNum}>{g.Dc ? fmt(r.HdomeInt, 2) : '—'}</td>
                      <td style={sNum}>{g.fioul_m3 ? `${fmt(g.fioul_m3, 1)} m³ / ${fmt(g.gaz_Nm3, 0)} Nm³` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: '#718096', margin: '8px 0 0 0' }}>
            {t('* Injecteurs : combustible lit / combustible réacteur (T2S) / boues / eau / ammoniac. ** Fioul domestique ou gaz naturel pour la première montée en température. Tuyères : posées / à commander (la commande inclut celles de la vidange de sable). Hauteur du réacteur : non standard, fixée par le temps de séjour. R80–R90 : tailles de l\'onglet Voûte, hors gamme documentée.')}
          </p>
        </div>

        {/* ── Anneaux Thermylis ── */}
        <div style={sCard}>
          <h2 style={sH2}>{t('Anneaux de distributeur Thermylis')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={sTable}>
              <thead>
                <tr>
                  {[t('Anneau'), 'Ø [ft]', 'Ø [m]', `${t('Surface')} [m²]`, `${t('Débit FAB')} [SCFM]`, t('Pertes thermiques'), `${t('Boues / toit / NH₃ / hublots')} *`]
                    .map((h) => <th key={h} style={sTh}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {THERMYLIS_ANNEAUX.map((a) => {
                  const sel = ther.modeDistributeur === 'anneau' && ther.anneau === a.id;
                  return (
                    <tr key={a.id} style={sel ? { background: '#ebf8ff', fontWeight: 700 } : {}}>
                      <td style={sTd}>{a.id}</td>
                      <td style={sNum}>{fmt(a.diam_ft, 3)}</td>
                      <td style={sNum}>{fmt(a.diam_ft * FT, 3)}</td>
                      <td style={sNum}>{fmt(Math.PI * (a.diam_ft * FT) ** 2 / 4, 2)}</td>
                      <td style={sNum}>{a.fab_scfm ? `${fmt(a.fab_scfm[0], 0)} – ${fmt(a.fab_scfm[1], 0)}` : '—'}</td>
                      <td style={sNum}>{a.pertes ? `${fmt(a.pertes * 100, 1)} %` : '—'}</td>
                      <td style={sNum}>{a.inj ? a.inj.join(' / ') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: '#718096', margin: '8px 0 0 0' }}>
            {t('* Piquages par anneau (onglet 9, table 8) : injecteurs de boues, pulvérisation au toit, ammoniac / urée, hublots du freeboard. Seul le distributeur est standard : diamètres du freeboard, hauteurs et carneau sont calculés pour chaque projet.')}
          </p>
        </div>

        {/* ── Sources ── */}
        <div style={{ ...sCard, fontSize: '12px', color: '#4a5568' }}>
          <h2 style={sH2}>{t('Sources et formules')}</h2>
          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>{t('Pyrofluid — VWT-EM-GCG-0037 Rev C (Généralités incinération) : gamme, vitesses, lit 1,5 m, charges admissibles.')}</li>
            <li>{t('Pyrofluid — VWT-EM-GCE-0310 Rev C (Chaudronnerie) : boîte à vent (cos w = (0,5 Dv − 135 + 70) / R ; k = R (1 − sin w) ; L\' = k + 385 ; Lbav = L\' + 348 ; Hbav = Lbav + max(Da) + 1200), tronçon 4 (h\' = 1500 − 0,493 e ; h = 0,5 (Df + 2e − Dv − 600 − 1,842 e) ; h1 = 0,5 (Df − Dv − 600)), dôme 23° (L = 0,212 (Df + 2e − Dc − 2ec − 24)), réacteur > 4,5 s.')}</li>
            <li>{t('Pyrofluid — VWT-EM-GCE-0312 Rev C (Réfractaire) : rayon de voûte 5 m (R28–R50) / 7 m (R56–R72), épaisseurs maximales.')}</li>
            <li>{t('Thermylis — HTFB Design Sheet V1 (BS&P, 11/11/2026), onglets 14 et 9 : D1 = √(4Q / π v1), D2 = √(4Q / π v2), D3 = anneau ≥ Ø requis, R2 = 1,2 (D3 + 2 (T1 + T2)) − 3,06 ft, H5 = tan α (D1 − Dcarneau) / 2, H6 = R2 − √(R2² − D3² / 4), H7 = tan α (T1 + T2). Validé sur St. Paul : D1 36,65 ft, D2 30,66 ft, H5 5,15 ft, H6 2,13 ft, hauteur totale 42,28 ft.')}</li>
            <li>{t('Hypothèse : max(Da) de la boîte à vent Pyrofluid pris égal au Ø de la gaine d\'air. Thermylis : Ø carneau calculé à la vitesse saisie (la feuille reprend le Ø du PFD).')}</li>
          </ul>
        </div>
      </div>
    </Ctx.Provider>
  );
};

export default ReacteurDesignTab;
