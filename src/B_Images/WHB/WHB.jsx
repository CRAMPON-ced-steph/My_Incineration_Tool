import React from "react";

/**
 * Schéma de principe d'une chaudière de récupération à deux trémies :
 * ballon de vapeur (rouge), circuit eau/vapeur en pointillés vers deux
 * faisceaux tubulaires (croix), gaines d'entrée et de sortie des fumées
 * (grises, repères jaunes), vannes rotatives et extraction des résidus.
 * viewBox 610 x 515.
 */

const RED = "#d8242a";
const DARK = "#2a2a2a";
const DOT = "#b53a3f";
const DUCT = "#ececec";
const YELLOW = "#ffc000";

/* Point de mesure / nœud (ellipse rouge sombre) */
const Node = ({ x, y }) => (
  <ellipse cx={x} cy={y} rx="5.2" ry="6.4" fill={DOT} stroke="#7e2428" strokeWidth="1.2" />
);

/* Vanne rotative : cercle clair avec croix */
function RotaryValve({ x, y, r = 14 }) {
  const k = r * 0.62;
  return (
    <g stroke="#cfcfcf" fill="#fff" strokeWidth="2.2">
      <circle cx={x} cy={y} r={r} />
      <circle cx={x} cy={y} r={r - 4} fill="none" strokeWidth="1.4" />
      <line x1={x - k} y1={y - k} x2={x + k} y2={y + k} />
      <line x1={x - k} y1={y + k} x2={x + k} y2={y - k} />
      <line x1={x} y1={y - r + 3} x2={x} y2={y + r - 3} strokeWidth="1.6" />
      <line x1={x - r + 3} y1={y} x2={x + r - 3} y2={y} strokeWidth="1.6" />
    </g>
  );
}

/* Faisceau tubulaire : cadre pointillé + diagonales */
function Bundle({ x, y, w, h }) {
  return (
    <g fill="none" stroke={RED} strokeWidth="1.8" strokeDasharray="6 4">
      <rect x={x} y={y} width={w} height={h} />
      <line x1={x} y1={y} x2={x + w} y2={y + h} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} />
    </g>
  );
}

export default function BoilerSchematic({ width = 610 }) {
  /* géométrie principale */
  const xL = 120,
    xM = 283,
    xR = 445,
    yTop = 127,
    yHop = 400,
    yTip = 438;
  const hopperPath = `M${xL},${yHop} L${(xL + xM) / 2},${yTip} L${xM},${yHop} L${(xM + xR) / 2},${yTip} L${xR},${yHop}`;
  const bodyFill = `M${xL},${yTop} H${xR} V${yHop} L${(xM + xR) / 2},${yTip} L${xM},${yHop} L${(xL + xM) / 2},${yTip} L${xL},${yHop} Z`;

  return (
    <svg
      viewBox="0 0 610 515"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Schéma d'une chaudière de récupération : ballon de vapeur, faisceaux tubulaires, gaines de fumées, trémies et extraction des résidus"
      style={{ background: "#fff", display: "block", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <defs>
        <radialGradient id="bsDrum" cx="0.42" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ff5a5a" />
          <stop offset="0.55" stopColor="#d71920" />
          <stop offset="1" stopColor="#8f0a0f" />
        </radialGradient>
        <radialGradient id="bsShine" cx="0.4" cy="0.25" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- corps de chaudière ---------- */}
      <path d={bodyFill} fill="#f0f0f3" />

      {/* gaines de fumées */}
      <g fill={DUCT}>
        <rect x="18" y="147" width="108" height="19" />
        <path d="M439,147 H550 V382 H590 V398 H535 V166 H439 Z" />
      </g>
      <rect x="0" y="147" width="19" height="19" fill={YELLOW} stroke="#e0a800" strokeWidth="0.8" />
      <rect x="589" y="381" width="19" height="19" fill={YELLOW} stroke="#e0a800" strokeWidth="0.8" />

      {/* parois, dessus et trémies */}
      <g fill="none" stroke={DARK} strokeWidth="2.2" strokeLinejoin="round">
        <path d={`M${xL},${yTop} H${xR}`} strokeWidth="2.6" />
        <line x1={xL} y1={yTop} x2={xL} y2="147" />
        <line x1={xL} y1="166" x2={xL} y2={yHop} />
        <line x1={xR} y1={yTop} x2={xR} y2="147" />
        <line x1={xR} y1="166" x2={xR} y2={yHop} />
        <path d={hopperPath} />
        {/* piliers sous les trémies */}
        <line x1={xL} y1={yHop} x2={xL} y2="490" />
        <line x1={xM} y1="178" x2={xM} y2="490" />
        <line x1={xR} y1={yHop} x2={xR} y2="490" />
        {/* éléments internes */}
        <line x1="200" y1="112" x2="200" y2="367" />
        <line x1="365" y1={yTop} x2="365" y2="365" />
        {/* sorties des trémies */}
        <line x1="200" y1={yTip} x2="200" y2="441" />
        <line x1="362" y1={yTip} x2="362" y2="441" />
      </g>

      {/* semelles */}
      {[119, 281, 446].map((cx) => (
        <g key={cx}>
          <rect x={cx - 21} y="489" width="42" height="21" fill="#8c8c8c" />
          <rect x={cx - 21} y="489" width="42" height="5" fill="#5c5c5c" />
        </g>
      ))}

      {/* circuit eau / vapeur en pointillés */}
      <g fill="none" stroke={RED} strokeWidth="1.8" strokeDasharray="6 4">
        <path d="M228,92 H485 V362 H425 V328" />
        <path d="M228,112 H425 V180" />
        <line x1="385" y1="240" x2="385" y2="272" />
      </g>

      {/* faisceaux tubulaires */}
      <Bundle x={365} y={180} w={80} h={60} />
      <Bundle x={365} y={272} w={80} h={56} />

      {/* nœuds de mesure */}
      <Node x={200} y={129} />
      <Node x={120} y={186} />
      <Node x={200} y={185} />
      <Node x={200} y={367} />
      <Node x={283} y={184} />

      {/* ---------- ballon de vapeur ---------- */}
      <circle cx="200" cy="80" r="33" fill="url(#bsDrum)" stroke="#7d0a0e" strokeWidth="1" />
      <ellipse cx="190" cy="64" rx="22" ry="15" fill="url(#bsShine)" />

      {/* vapeur */}
      <path d="M200,47 V20 H430" fill="none" stroke={RED} strokeWidth="2" />
      <polygon points="430,11 456,20 430,29" fill="#8a2c31" stroke="#b01e24" strokeWidth="1" />
      <text x="469" y="14" fontSize="13">
        Steam
      </text>

      {/* retour condensat */}
      <line x1="233" y1="72" x2="428" y2="72" stroke={RED} strokeWidth="2" />
      <polygon points="454,63 428,72 454,81" fill="#f6d2d4" stroke="#d98b90" strokeWidth="1" />
      <text x="469" y="70" fontSize="13">
        Return condensate
      </text>

      {/* vannes rotatives + résidus */}
      <RotaryValve x={200} y={456} />
      <RotaryValve x={365} y={456} />
      <line x1="200" y1="473" x2="468" y2="473" stroke="#7a7a7a" strokeWidth="1.6" />
      <polygon points="468,464 488,473 468,482" fill="#3a1518" stroke="#7a2a2f" strokeWidth="1" />
      <text x="494" y="471" fontSize="13">
        Residues
      </text>
    </svg>
  );
}