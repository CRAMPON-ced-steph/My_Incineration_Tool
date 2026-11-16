import React from "react";

/**
 * Schéma « hauteur de cheminée / obstacles » :
 *  - en haut : coupe du site (cheminée hachurée de hauteur hp, relief, bâtiment
 *    voisin, cote ">28 m") ;
 *  - en bas : vue en plan (cheminée, distance di, angle a, largeur li du
 *    bâtiment voisin).
 * viewBox 700 x 345.
 */

const INK = "#111";
const SANS = "Arial, Helvetica, sans-serif";

/* Pointe de flèche (chevron) dont la pointe est en (x, y) et qui regarde vers `ang` (rad) */
function Head({ x, y, ang, s = 11 }) {
  const o = 0.42; // demi-ouverture
  const p1 = [x - s * Math.cos(ang - o), y - s * Math.sin(ang - o)];
  const p2 = [x - s * Math.cos(ang + o), y - s * Math.sin(ang + o)];
  return (
    <path
      d={`M${p1[0].toFixed(2)},${p1[1].toFixed(2)} L${x},${y} L${p2[0].toFixed(2)},${p2[1].toFixed(2)}`}
      fill="none"
      stroke={INK}
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/* Cote à pointillés épais avec pointes aux deux extrémités */
function Dim({ x1, y1, x2, y2 }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={INK}
        strokeWidth="2.4"
        strokeDasharray="2.6 3.2"
      />
      <Head x={x2} y={y2} ang={a} />
      <Head x={x1} y={y1} ang={a + Math.PI} />
    </g>
  );
}

export default function StackHeightDiagram({
  width = 560,
  /* paramètres du plan */
  coneHalfAngle = 13.8, // demi-angle du secteur (°)
}) {
  /* vue en plan */
  const C = [133, 283]; // axe de la cheminée
  const R = 19;
  const rad = (coneHalfAngle * Math.PI) / 180;
  const xEnd = 356;
  const dy = Math.tan(rad) * (xEnd - C[0]);
  const arcR = 108;
  const arcDy = Math.sin(rad) * arcR;
  const arcDx = Math.cos(rad) * arcR;

  return (
    <svg
      viewBox="0 50 700 295"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cheminée de hauteur hp, bâtiment voisin à plus de 28 m, vue en plan avec distance di, angle a et largeur li"
      style={{ background: "#fff", display: "block", fontFamily: SANS }}
    >
      <defs>
        {/* hachures quadrillées de la cheminée */}
        <pattern id="sGrid" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6,0 L0,0 L0,6" fill="none" stroke={INK} strokeWidth="1.1" />
        </pattern>
      </defs>

      {/* ================= RELIEF ================= */}
      <g fill="none" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
        {/* terrain gauche + pied de cheminée + pente */}
        <polyline
          points="35,266 50,262 62,263 70,256 78,255 82,247 88,244 176,244 183,241 192,236 205,228 225,222 246,212 263,205 274,196 283,190"
        />
        {/* sol du bâtiment */}
        <line x1="283" y1="190" x2="458" y2="190" strokeWidth="1.3" />
        {/* colline à droite */}
        <polyline
          points="458,190 464,186 472,180 481,175 496,170 511,163 528,157 545,150 560,136 576,125 592,111 608,96 622,88 638,85 650,90 661,104 668,124 672,160 676,190 680,212"
        />
      </g>

      {/* ================= CHEMINÉE ================= */}
      <g stroke={INK} strokeWidth="1.5">
        <rect x="110" y="171" width="47" height="73" fill="url(#sGrid)" />
        <rect x="122" y="97" width="27" height="75" fill="url(#sGrid)" />
        <line x1="131" y1="97" x2="131" y2="64" strokeWidth="1.2" />
      </g>
      {/* panache de fumée */}
      <path
        d="M131,70 C139,58 148,72 157,62 C166,52 172,66 181,60 C190,54 196,66 206,60 C213,55 219,64 226,60"
        fill="none"
        stroke="#555"
        strokeWidth="1.2"
      />

      {/* ================= BÂTIMENT ================= */}
      <g fill="none" stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
        {/* toit + corps */}
        <polyline points="310,110 326,98 430,98 446,110" />
        <rect x="314" y="110" width="127" height="80" />
        {/* cheminée du bâtiment + fumée */}
        <polyline points="396,98 396,90 406,90 406,98" />
        <polyline points="398,90 398,82 406,79 404,72 410,68 402,64" stroke="#555" />
        {/* fenêtres */}
        <rect x="330" y="125" width="14" height="24" rx="6" />
        <rect x="365" y="125" width="14" height="24" rx="6" />
        <rect x="399" y="125" width="14" height="24" rx="6" />
        <circle cx="327" cy="161" r="5" />
        <circle cx="414" cy="161" r="5" />
        {/* porte */}
        <rect x="360" y="158" width="26" height="32" />
        <circle cx="381" cy="176" r="1.4" />
      </g>

      {/* ================= COTES (coupe) ================= */}
      {/* hp */}
      <line x1="76" y1="98" x2="150" y2="98" stroke={INK} strokeWidth="1" />
      <Dim x1="88" y1="100" x2="88" y2="243" />
      <text x="47" y="190" fontSize="19">
        h
        <tspan fontSize="12" dy="5">
          p
        </tspan>
      </text>
      {/* > 28 m */}
      <line x1="172" y1="118" x2="312" y2="118" stroke={INK} strokeWidth="1" />
      <Dim x1="176" y1="120" x2="176" y2="243" />
      <text x="188" y="186" fontSize="19">
        &gt;28m
      </text>

      {/* ================= VUE EN PLAN ================= */}
      {/* axes */}
      <line x1="88" y1="283" x2="438" y2="283" stroke={INK} strokeWidth="0.9" />
      <line x1={C[0]} y1="258" x2={C[0]} y2="308" stroke={INK} strokeWidth="0.9" />
      <circle cx={C[0]} cy={C[1]} r={R} fill="#fff" stroke={INK} strokeWidth="1.4" />
      <line x1={C[0] - R} y1={C[1]} x2={C[0] + R} y2={C[1]} stroke={INK} strokeWidth="0.9" />
      <line x1={C[0]} y1={C[1] - R} x2={C[0]} y2={C[1] + R} stroke={INK} strokeWidth="0.9" />

      {/* bâtiment (plan) */}
      <rect x="317" y="243" width="121" height="77" fill="none" stroke="#555" strokeWidth="1" />

      {/* secteur d'angle */}
      <line x1={C[0]} y1={C[1]} x2={xEnd} y2={C[1] - dy} stroke={INK} strokeWidth="1.2" />
      <line x1={C[0]} y1={C[1]} x2={xEnd} y2={C[1] + dy} stroke={INK} strokeWidth="1.2" />
      <path
        d={`M${C[0] + arcDx},${C[1] - arcDy} A${arcR} ${arcR} 0 0 1 ${C[0] + arcDx},${C[1] + arcDy}`}
        fill="none"
        stroke={INK}
        strokeWidth="1.8"
      />
      <Head x={C[0] + arcDx} y={C[1] - arcDy} ang={-rad + Math.PI / 2 + Math.PI} />
      <Head x={C[0] + arcDx} y={C[1] + arcDy} ang={rad + Math.PI / 2} />
      <text x="254" y="290" fontSize="19">
        a
      </text>

      {/* di */}
      <Dim x1="118" y1="253" x2="315" y2="253" />
      <text x="206" y="240" fontSize="19">
        d
        <tspan fontSize="12" dy="5">
          i
        </tspan>
      </text>

      {/* li */}
      <line x1="438" y1="243" x2="466" y2="243" stroke={INK} strokeWidth="0.9" />
      <line x1="438" y1="320" x2="466" y2="320" stroke={INK} strokeWidth="0.9" />
      <Dim x1="458" y1="245" x2="458" y2="318" />
      <text x="470" y="296" fontSize="19">
        l
        <tspan fontSize="12" dy="5">
          i
        </tspan>
      </text>
    </svg>
  );
}