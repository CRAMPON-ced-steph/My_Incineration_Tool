import React from "react";

/**
 * Schéma d'un système DeNOx SCR : conduit de fumées, injection d'ammoniac/urée,
 * mélangeur statique, réacteur à deux lits catalytiques avec systèmes de
 * nettoyage, stockage de réactif, vaporisateur, PLC et signaux de mesure.
 * Coordonnées = pixels de l'image d'origine (622 x 401).
 */

const FONT = "Calibri, 'Segoe UI', Arial, sans-serif";
const TXT = "#3d4a55";
const LM = "#b7dcc8"; // vert menthe clair
const MM = "#8fc7a8"; // menthe moyen
const DM = "#5a9b7b"; // vert foncé
const XD = "#2f6a4e"; // très foncé
const EDGE = "#4c7f66";
const OR = "#f0922b";
const ORE = "#c46d12";
const RED = "#e8502a";
const CAT = "#f1e7ae";
const CATL = "#5e4a1c";
const CY = "#a9d8e0";
const CYE = "#6aa9b7";
const SIG = "#6f8a8a";

/* flèche orange horizontale (vers la droite) */
const HArrow = ({ x1, x2, y, h = 8, hh = 14 }) => (
  <polygon
    points={`${x1},${y - h / 2} ${x2 - 12},${y - h / 2} ${x2 - 12},${y - hh / 2} ${x2},${y} ${x2 - 12},${y + hh / 2} ${x2 - 12},${y + h / 2} ${x1},${y + h / 2}`}
    fill={OR}
    stroke={ORE}
    strokeWidth="0.6"
  />
);

/* flèche orange verticale (vers le bas) */
const VArrow = ({ x, y1, y2, w = 6, hw = 11 }) => (
  <polygon
    points={`${x - w / 2},${y1} ${x + w / 2},${y1} ${x + w / 2},${y2 - 7} ${x + hw / 2},${y2 - 7} ${x},${y2} ${x - hw / 2},${y2 - 7} ${x - w / 2},${y2 - 7}`}
    fill={OR}
    stroke={ORE}
    strokeWidth="0.6"
  />
);

/* lit catalytique : face supérieure en perspective + face avant quadrillée */
function Bed({ y0 }) {
  const top = y0; // haut de la face supérieure
  const fy = y0 + 30; // haut de la face avant
  const by = y0 + 60; // bas
  const lines = [];
  // faces avant : montants et traverse
  for (let i = 1; i < 7; i++) lines.push([418 + i * 12.3, fy, 418 + i * 12.3, by]);
  lines.push([418, fy + 12, 500, fy + 12], [418, fy + 24, 500, fy + 24]);
  // face supérieure : lignes obliques et transversales
  for (let i = -2; i < 7; i++) lines.push([418 + i * 12.3, top, 418 + i * 12.3 + 16, fy]);
  lines.push([418, top + 10, 500, top + 10], [418, top + 20, 500, top + 20]);
  return (
    <g>
      <clipPath id={`bc${y0}`}><polygon points={`418,${top} 478,${top} 500,${fy} 418,${fy}`} /></clipPath>
      <polygon points={`418,${top} 478,${top} 500,${fy} 418,${fy}`} fill={CAT} stroke={CATL} strokeWidth="1.2" />
      <rect x="418" y={fy} width="82" height={by - fy - 0} fill={CAT} stroke={CATL} strokeWidth="1.2" />
      <g stroke={CATL} strokeWidth="1" fill="none" opacity="0.85" clipPath={`url(#bc${y0})`}>
        {lines.map((l, i) => (
          <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
        ))}
      </g>
    </g>
  );
}

/* buse de nettoyage rouge-orangé + coude orange */
function Nozzle({ x, y, rot = -35 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.2)`}>
      <path d="M-5,-14 L5,-14 L8,10 L0,16 L-8,10 Z" fill={RED} stroke="#b73a1a" strokeWidth="0.8" />
      <path d="M-5,-14 L5,-14 L4,-9 L-4,-9 Z" fill="#f08a64" />
    </g>
  );
}

const T = ({ x, y, children, s = 11, anchor = "start" }) => (
  <text x={x} y={y} fontSize={s} fill={TXT} textAnchor={anchor} fontFamily={FONT}>
    {children}
  </text>
);

export default function ScrDenox({ width = 622 }) {
  return (
    <svg
      viewBox="0 0 622 401"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Système DeNOx SCR : injection d'ammoniac, mélangeur statique, réacteur à deux lits catalytiques"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="scrTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f0f3" />
          <stop offset="0.5" stopColor="#a9d8e0" />
          <stop offset="1" stopColor="#86bcc8" />
        </linearGradient>
      </defs>

      {/* ============ LIGNES DE SIGNAUX (fond) ============ */}
      <g fill="none" stroke={SIG} strokeWidth="1">
        <line x1="172" y1="120" x2="172" y2="188" />
        <line x1="180" y1="205" x2="180" y2="313" />
        <line x1="205" y1="110" x2="205" y2="300" />
        <path d="M190,199 H355 V373 H552 V345" strokeDasharray="1.5 2" />
        <line x1="215" y1="125" x2="215" y2="170" stroke="#555" />
        <line x1="215" y1="170" x2="240" y2="170" stroke="#555" />
        <path d="M20,265 V300 H35" stroke="#555" />
      </g>

      {/* ============ CONDUIT HORIZONTAL ============ */}
      <polygon points="140,72 392,72 392,88 148,88" fill={LM} stroke={EDGE} strokeWidth="1" />
      <rect x="148" y="88" width="244" height="30" fill={MM} />
      <rect x="148" y="88" width="244" height="13" fill={DM} />
      <polygon points="140,72 148,88 148,118 140,107" fill={XD} />
      <line x1="148" y1="118" x2="392" y2="118" stroke={EDGE} strokeWidth="1" />
      <line x1="140" y1="107" x2="148" y2="118" stroke={EDGE} strokeWidth="1" />

      {/* mélangeur statique */}
      <polygon points="275,88 311,88 311,118 275,118" fill={RED} stroke="#b73a1a" strokeWidth="0.8" />
      <polygon points="275,88 286,88 286,118 275,118" fill="#f08a64" />
      <g stroke="#b73a1a" strokeWidth="0.8">
        <line x1="286" y1="88" x2="294" y2="118" />
        <line x1="298" y1="88" x2="306" y2="118" />
      </g>

      {/* lance d'injection */}
      <rect x="211" y="92" width="4" height="18" fill="#c9d4d6" stroke="#788" strokeWidth="0.6" />
      <polygon points="215,96 224,92 224,108 215,104" fill="#e9f1f2" stroke="#9ab" strokeWidth="0.6" />

      {/* flèches de gaz */}
      <HArrow x1="99" x2="175" y={100} />
      <HArrow x1="327" x2="378" y={100} />

      {/* ============ RÉACTEUR ============ */}
      {/* transition d'entrée */}
      <polygon points="392,72 399,58 418,90 399,90" fill={LM} stroke={EDGE} strokeWidth="1" />
      <polygon points="392,88 402,91 416,95 416,122 402,116 392,118" fill={XD} />
      {/* toit */}
      <polygon points="399,58 481,58 500,89 418,90" fill={LM} stroke={EDGE} strokeWidth="1.2" />
      {/* paroi gauche */}
      <polygon points="399,90 418,90 418,325 412,350 399,325" fill={MM} />
      <line x1="399" y1="90" x2="399" y2="325" stroke={EDGE} strokeWidth="1.5" />
      <rect x="399" y="90" width="19" height="235" fill={LM} />
      {/* paroi droite */}
      <rect x="480" y="90" width="20" height="260" fill={LM} />
      {/* intérieur */}
      <rect x="418" y="90" width="62" height="240" fill={DM} />
      {/* plancher */}
      <polygon points="399,325 418,325 480,332 500,350 412,350" fill={MM} />
      <polygon points="418,330 480,330 500,350 412,350" fill={LM} />
      <polygon points="399,325 412,350 500,350 500,290" fill="none" stroke={EDGE} strokeWidth="1" />

      {/* aubes de répartition */}
      <g stroke={XD} strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M428,112 Q430,118 432,124" />
        <path d="M437,107 Q439,114 440,122" />
        <path d="M444,106 Q447,113 448,118" />
        <path d="M456,104 Q458,110 458,116" />
        <path d="M468,101 Q470,108 470,114" />
        <path d="M477,95 Q478,102 478,108" />
        <path d="M486,92 L490,98 L486,104 M488,95 L496,92" />
      </g>
      <path d="M426,99 Q445,95 452,109 L444,112 Q438,104 426,104 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />
      <path d="M436,91 Q452,91 460,102 L452,105 Q448,97 436,97 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />
      <path d="M467,91 Q477,92 481,100 L476,103 Q473,96 467,95 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />

      {/* lit 1 et 2 */}
      <Bed y0={130} />
      <Bed y0={238} />

      {/* flèches descendantes */}
      <VArrow x={430} y1={118} y2={142} />
      <VArrow x={457} y1={118} y2={142} />
      <VArrow x={472} y1={116} y2={134} />
      <VArrow x={440} y1={137} y2={157} />
      <VArrow x={432} y1={188} y2={207} />
      <VArrow x={453} y1={199} y2={218} />
      <VArrow x={474} y1={217} y2={236} />
      <VArrow x={440} y1={228} y2={247} />
      <VArrow x={432} y1={241} y2={262} />

      {/* chambre basse : flèches courbes et aubes */}
      <g stroke={XD} strokeWidth="1.6" fill="none">
        <path d="M419,305 Q426,332 450,334 L470,334" />
        <path d="M441,305 Q445,324 470,328" />
        <path d="M461,303 Q462,318 480,322" />
      </g>
      <path d="M422,314 L430,314 Q432,326 442,328 L447,330 L441,337 Q426,335 422,321 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />
      <path d="M440,303 L446,303 Q446,314 455,317 L460,319 L455,325 Q442,322 440,310 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />
      <path d="M470,295 L477,295 Q478,305 490,307 L494,309 L488,315 Q473,312 470,302 Z" fill={OR} stroke={ORE} strokeWidth="0.6" />
      <polygon points="486,297 500,294 500,340 486,333" fill={XD} />

      {/* systèmes de nettoyage */}
      <path d="M500,161 L518,161 L522,152" fill="none" stroke={OR} strokeWidth="3" strokeLinejoin="round" />
      <Nozzle x={522} y={147} rot={-35} />
      <path d="M500,266 L514,266 L520,256" fill="none" stroke={OR} strokeWidth="3" strokeLinejoin="round" />
      <Nozzle x={520} y={252} rot={-35} />

      {/* conduit de sortie */}
      <polygon points="500,292 517,288 560,288 572,299 572,311 530,311 500,305" fill={LM} stroke={EDGE} strokeWidth="1" />
      <polygon points="500,305 530,311 530,340 500,346" fill={MM} stroke={EDGE} strokeWidth="1" />
      <polygon points="530,311 572,311 572,339 530,340" fill={DM} stroke={EDGE} strokeWidth="1" />
      <polygon points="530,311 572,311 560,288 517,288" fill={LM} stroke={EDGE} strokeWidth="1" />
      <HArrow x1="563" x2="598" y={300} />
      <HArrow x1="575" x2="612" y={325} />

      {/* base du réacteur */}
      <polygon points="412,350 500,350 500,346 412,346" fill="none" />

      {/* ============ RÉSERVOIR DE RÉACTIF ============ */}
      <rect x="5" y="197" width="125" height="65" rx="20" fill="url(#scrTank)" stroke={CYE} strokeWidth="1" />
      <ellipse cx="116" cy="229.5" rx="14" ry="32.5" fill="#93c4cf" stroke={CYE} strokeWidth="1" />

      {/* vaporisateur */}
      <rect x="85" y="282" width="60" height="43" fill={CY} stroke={CYE} strokeWidth="1" />
      <g stroke="#fff" strokeWidth="1.5" opacity="0.8">
        <line x1="95" y1="290" x2="135" y2="290" />
        <line x1="95" y1="304" x2="135" y2="304" />
        <line x1="95" y1="318" x2="135" y2="318" />
      </g>

      {/* PLC */}
      <polygon points="150,193 158,188 190,188 190,200 182,205 150,205" fill={RED} stroke="#b73a1a" strokeWidth="0.8" />
      <polygon points="150,193 158,188 190,188 182,193" fill="#f08a64" />
      <T x={156} y={202} s={9}>
        <tspan fill="#fff">PLC</tspan>
      </T>

      {/* pompe, transmetteur, vanne */}
      <rect x="38" y="298" width="22" height="14" rx="3" fill="#a9b8bd" stroke="#566" strokeWidth="1" /><circle cx="42" cy="306" r="5" fill="#d7e0e3" stroke="#566" strokeWidth="1" />
      <rect x="150" y="296" width="9" height="9" fill="#222" />
      <polygon points="172,306 190,306 172,320 190,320" fill="#222" />
      <g stroke="#555" strokeWidth="1.4" fill="none">
        <path d="M55,309 H85" />
        <path d="M145,300 H150" />
        <path d="M159,300 H205" />
      </g>

      {/* ============ TEXTES ============ */}
      <T x="51" y="92">Process</T>
      <T x="51" y="104">Flue Gas</T>
      <T x="113" y="119">NO<tspan fontSize="7" dy="2">x</tspan></T>
      <T x="160" y="32">Injection</T>
      <T x="160" y="44">Lance(s)</T>
      <T x="268" y="52">Static Mixer</T>
      <T x="392" y="30">DeNOx SCR Reactor</T>
      <T x="525" y="52">Flow Distribution</T>
      <T x="525" y="64">Vanes</T>
      <T x="550" y="140">Cleaning</T>
      <T x="550" y="152">System</T>
      <T x="550" y="245">Cleaning</T>
      <T x="550" y="257">System</T>
      <T x="530" y="190">Two Catalyst Beds</T>
      <T x="568" y="285">H₂O</T>
      <T x="603" y="345">N₂</T>
      <T x="113" y="154" s={8}>NOx Inlet Signal</T>
      <T x="245" y="173" s={8.5}>Atomizing Air</T>
      <text x="13" y="228" fontSize="11.5" fontWeight="bold" fill="#2a4a60" fontFamily={FONT}>Reagent Storage</text>
      <text x="14" y="241" fontSize="8.5" fontWeight="bold" fill="#2a4a60" fontFamily={FONT}>(Ammonia, Urea)</text>
      <T x="35" y="334" s={8}>Pump</T>
      <text x="88" y="302" fontSize="11" fontWeight="bold" fill="#2a4a60" fontFamily={FONT}>Vaporizer</text>
      <T x="89" y="312" s={7.5}>(If necessary)</T>
      <T x="132" y="344" s={8}>Flow Transmitter</T>
      <T x="160" y="318" s={8}>Flow</T><T x="160" y="326" s={8}>Valve</T>
      <T x="475" y="387" s={8}>NOx Outlet and</T>
      <T x="475" y="397" s={8}>Ammonia Slip Signals</T>
      <T x="250" y="358">Flow Distribution</T>
      <T x="250" y="370">Vanes</T>

      {/* repères */}
      <g stroke="#8a9a9a" strokeWidth="0.8" fill="none">
        <line x1="213" y1="40" x2="213" y2="92" />
        <line x1="295" y1="56" x2="295" y2="88" />
        <line x1="436" y1="36" x2="436" y2="66" />
        <line x1="545" y1="66" x2="500" y2="92" />
        <line x1="545" y1="195" x2="500" y2="180" />
        <line x1="545" y1="198" x2="500" y2="215" />
        <line x1="548" y1="140" x2="526" y2="150" />
        <line x1="548" y1="245" x2="530" y2="250" />
        <line x1="340" y1="353" x2="437" y2="326" />
      </g>
    </svg>
  );
}