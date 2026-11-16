import React from "react";
import { makeT } from "../F_Gestion_Langues/localT";
import { schemaTranslations } from "./quench_img_traduction";

/**
 * Laveur de gaz (tour de pulvérisation) : entrée de gaz non épuré, quatre rampes
 * de pulvérisation, matelas dévésiculeur avec rinçage, sortie de gaz épuré et
 * purge/recyclage en fond de cône. Bilingue EN/FR.
 * Coordonnées = pixels de l'image d'origine (375 x 508).
 */

const WALL = "#4a4a4a";
const WATER = "#2fbcf0";
const TXT = "#5b7cf5";
const FONT = "'Open Sans', 'Segoe UI', Arial, sans-serif";

const Txt = ({ x, y, children }) => (
  <text
    x={x}
    y={y}
    fontSize="10.6"
    fontWeight="700"
    fill={TXT}
    fontFamily={FONT}
  >
    {children}
  </text>
);

/* tête de flèche pleine */
const Head = ({ x, y, dir = "left", s = 7 }) => {
  const pts = {
    left: `${x},${y} ${x + s},${y - s / 2.2} ${x + s},${y + s / 2.2}`,
    right: `${x},${y} ${x - s},${y - s / 2.2} ${x - s},${y + s / 2.2}`,
    up: `${x},${y} ${x - s / 2.2},${y + s} ${x + s / 2.2},${y + s}`,
  }[dir];
  return <polygon points={pts} fill={WATER} />;
};

/* rampe de pulvérisation : ligne horizontale, buses en « Λ », arrivée par la droite */
function Rail({ y, xTrunk }) {
  return (
    <g>
      <line x1="159" y1={y} x2={xTrunk} y2={y} stroke={WATER} strokeWidth="2" />
      <Head x={238} y={y} dir="left" />
      {[159, 184, 212].map((x) => (
        <path key={x} d={`M${x - 4.5},${y + 11} L${x},${y + 3} L${x + 4.5},${y + 11}`} fill="none" stroke={WATER} strokeWidth="2" />
      ))}
    </g>
  );
}

export default function SprayTower({ width = 300, currentLanguage }) {
  const t = makeT(schemaTranslations, currentLanguage);
  // Schéma bilingue : ligne anglaise fixe + ligne dans la langue choisie (masquée si elle ferait doublon)
  const doublon = t('Gaz épuré') === schemaTranslations.en['Gaz épuré'];
  const ticks = [
    [78, 88],
    [150, 158],
    [195, 203],
    [238, 246],
    [282, 290],
  ];
  return (
    <svg
      viewBox="0 0 375 508"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Laveur de gaz à rampes de pulvérisation et matelas dévésiculeur"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      {/* ---------- matelas dévésiculeur ---------- */}
      <rect x="143" y="94" width="88" height="12" fill="#cfe8f9" />
      <g fill="none" stroke="#3d3d3d" strokeWidth="1.6">
        <rect x="143" y="94" width="88" height="12" />
        {[160, 175, 190, 205, 220].map((x) => (
          <path key={x} d={`M${x + 6},95 L${x},100 L${x + 6},105`} />
        ))}
      </g>

      {/* ---------- enveloppe ---------- */}
      <g fill="none" stroke={WALL} strokeWidth="2" strokeLinejoin="round">
        {/* haut : cône et rebord */}
        <path d="M143,94 V72 L168,43 V40 H207 V43 L231,72 V78" />
        <path d="M143,106 V388 H134" />
        <path d="M134,418 H143 V422 L185,477 L231,424 V88" />
        {/* tubulures à droite */}
        {ticks.map(([a, b], i) => (
          <g key={i}>
            <path d={`M231,${a} H238`} />
            <path d={`M231,${b} H238`} />
          </g>
        ))}
        <path d="M231,88 V150 M231,158 V195 M231,203 V238 M231,246 V282 M231,290 V424" />
        {/* déflecteurs */}
        <path d="M143,308 L153,315" />
        <path d="M231,308 L220,314" />
      </g>

      {/* ---------- sortie de gaz épuré ---------- */}
      <line x1="186" y1="52" x2="186" y2="14" stroke={WATER} strokeWidth="2" />
      <Head x={186} y={7} dir="up" s={8} />

      {/* ---------- rampes de pulvérisation ---------- */}
      <Rail y={82} xTrunk={288} />
      <Rail y={155} xTrunk={275} />
      <Rail y={198} xTrunk={275} />
      <Rail y={242} xTrunk={275} />
      <Rail y={287} xTrunk={275} />
      <line x1="288" y1="82" x2="288" y2="118" stroke={WATER} strokeWidth="2" />
      <line x1="275" y1="155" x2="275" y2="322" stroke={WATER} strokeWidth="2" />
      <Head x={275} y={284} dir="up" s={7} />

      {/* ---------- gaz non épuré ---------- */}
      <line x1="94" y1="405" x2="140" y2="405" stroke={WATER} strokeWidth="2" />
      <Head x={149} y={405} dir="right" />

      {/* ---------- purge et recyclage ---------- */}
      <polyline points="186,465 186,498 238,498" fill="none" stroke={WATER} strokeWidth="2" />
      <Head x={246} y={498} dir="right" />

      {/* ---------- repère du matelas ---------- */}
      <line x1="118" y1="56" x2="150" y2="97" stroke={WALL} strokeWidth="1.5" />

      {/* ---------- textes ---------- */}
      <Txt x="216" y="22" w="61">Purified gas</Txt>
      {!doublon && <Txt x="221" y="40" w="52">{t('Gaz épuré')}</Txt>}
      {!doublon && <Txt x="5" y="56" w="112">{t('Matelas dévésiculeur')}</Txt>}
      <Txt x="5" y="69" w="111">Dewatering mattress</Txt>
      <Txt x="268" y="130" w="39">Rinsing</Txt>
      {!doublon && <Txt x="268" y="144" w="40">{t('Rinçage')}</Txt>}
      <Txt x="256" y="341" w="76">Sprayed water</Txt>
      {!doublon && <Txt x="250" y="354" w="90">{t('Liquide pulvérisé')}</Txt>}
      <Txt x="13" y="397" w="77">Unpurified gas</Txt>
      {!doublon && <Txt x="13" y="411" w="77">{t('Gaz non épuré')}</Txt>}
      <Txt x="250" y="491" w="113">Purging and recycling</Txt>
      {!doublon && <Txt x="258" y="505" w="97">{t('Purge et recyclage')}</Txt>}
    </svg>
  );
}