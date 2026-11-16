import React from "react";

/**
 * Schéma d'un filtre à manches « Reverse-Air » (décolmatage par contre-courant) :
 * à gauche, compartiment en cycle de nettoyage (air propre de rétro-lavage,
 * manches affaissées) ; à droite, compartiment en cycle de filtration
 * (gaz sale entrant par la trémie, gaz propre sortant par le haut).
 * viewBox 610 x 790.
 */

const K = "#000";
const FONT = "'DejaVu Sans', Verdana, Arial, Helvetica, sans-serif";

/* ------------------------------------------------------------------ */
/* Manche : contour ondulé entre les anneaux, fond pointillé             */
/* ------------------------------------------------------------------ */
const RING_Y = [152, 208, 262, 316, 370, 424];

function Bag({ x, w, bulge = 3.5 }) {
  const xl = x;
  const xr = x + w;
  let left = `M${xl},${RING_Y[0]}`;
  for (let i = 0; i < RING_Y.length - 1; i++) {
    const ym = (RING_Y[i] + RING_Y[i + 1]) / 2;
    left += ` Q${xl - bulge},${ym} ${xl},${RING_Y[i + 1]}`;
  }
  let right = ` L${xr},${RING_Y[RING_Y.length - 1]}`;
  for (let i = RING_Y.length - 1; i > 0; i--) {
    const ym = (RING_Y[i] + RING_Y[i - 1]) / 2;
    right += ` Q${xr + bulge},${ym} ${xr},${RING_Y[i - 1]}`;
  }
  return (
    <g>
      <path d={left + right + " Z"} fill="url(#raStipple)" stroke={K} strokeWidth="1.1" />
      {RING_Y.slice(1, -1).map((y) => (
        <line key={y} x1={xl - 1} y1={y} x2={xr + 1} y2={y} stroke={K} strokeWidth="1" />
      ))}
    </g>
  );
}

/* Collier de fixation sur la plaque tubulaire */
const Collar = ({ x, w }) => (
  <rect x={x} y="424" width={w} height="14" fill="#fff" stroke={K} strokeWidth="1.2" />
);

/* Ressort de tension (spirale noire) */
function Spring({ x, y = 94, h = 18 }) {
  const turns = 6;
  let d = `M${x},${y}`;
  for (let i = 0; i < turns; i++) {
    const y0 = y + (h / turns) * i;
    d += ` L${x + 4},${y0 + h / turns / 2} L${x - 4},${y0 + h / turns}`;
  }
  return <path d={d} fill="none" stroke={K} strokeWidth="2.1" strokeLinejoin="round" />;
}

/* Flèche blanche à contour (écoulement d'air) : corps courbe + pointe */
function CurvedArrow({ d, head, w = 9 }) {
  return (
    <g>
      <path d={d} fill="none" stroke={K} strokeWidth={w + 3} strokeLinecap="butt" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={w} strokeLinecap="butt" />
      <polygon points={head} fill="#fff" stroke={K} strokeWidth="1.3" strokeLinejoin="round" />
    </g>
  );
}

/* Flèche pointillée (gaz sale) : bande grise + points + pointe */
function DirtyArrow({ d, head }) {
  return (
    <g>
      <path d={d} fill="none" stroke={K} strokeWidth="24" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="21.5" />
      <path d={d} fill="none" stroke="url(#raStipple)" strokeWidth="21.5" />
      <polygon points={head} fill="url(#raStipple)" stroke={K} strokeWidth="1.3" strokeLinejoin="round" />
    </g>
  );
}

/* Flèche noire pleine vers le bas */
const DownArrow = ({ cx, y0 = 447 }) => (
  <polygon
    points={`${cx - 15},${y0} ${cx + 14},${y0} ${cx + 12},${y0 + 33} ${cx + 20},${y0 + 33} ${cx + 2},${y0 + 54} ${cx - 15},${y0 + 33} ${cx - 8},${y0 + 33}`}
    fill={K}
  />
);

/* Papillon / vanne papillon : ellipse traversée par un trait */
const ButterflyValve = ({ cx, cy = 98 }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx="10" ry="18" fill="#fff" stroke={K} strokeWidth="1.6" />
    <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={K} strokeWidth="1.4" />
  </g>
);

/* Légende avec pointe de flèche au bout d'un trait fin */
function Leader({ x1, y1, x2, y2 }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 9;
  const p1 = [x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)];
  const p2 = [x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K} strokeWidth="0.9" />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={K} />
    </g>
  );
}

export default function ReverseAirBaghouse({ width = 305 }) {
  return (
    <svg
      viewBox="0 0 610 790"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Schéma d'un filtre à manches à contre-courant (Reverse-Air) : cycle de nettoyage à gauche, cycle de filtration à droite"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      <defs>
        <pattern id="raStipple" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#fff" />
          <circle cx="1.2" cy="1.4" r="0.55" fill={K} />
          <circle cx="4.4" cy="2.6" r="0.55" fill={K} />
          <circle cx="2.4" cy="4.6" r="0.55" fill={K} />
          <circle cx="5.2" cy="5.4" r="0.45" fill={K} />
          <circle cx="0.4" cy="3.4" r="0.45" fill={K} />
        </pattern>
      </defs>

      {/* ================= CARCASSE ================= */}
      <g fill="none" stroke={K} strokeWidth="2.4" strokeLinejoin="round">
        {/* parois et toit (deux demi-compartiments) */}
        <path d="M298,62 H158 V438" />
        <path d="M308,62 H447 V438" />
        {/* plaque tubulaire */}
        <path d="M158,438 H298 M308,438 H447" strokeWidth="2.6" />
        {/* trémie gauche */}
        <path d="M158,438 L265,625 V637 H253" />
        <path d="M265,637 H298" />
        {/* trémie droite + entrée gaz sale */}
        <path d="M447,438 L433,466" />
        <path d="M412,503 L340,625 V637 H352" />
        <path d="M308,637 H340" />
        {/* cloison centrale */}
        <path d="M298,62 V637 M308,62 V637" strokeWidth="1.5" />
      </g>
      {/* bague blanche entre les deux lignes de la cloison (recouvre les manches) */}
      <rect x="299.2" y="63" width="7.6" height="574" fill="#fff" />
      <line x1="298" y1="62" x2="298" y2="637" stroke={K} strokeWidth="1.5" />
      <line x1="308" y1="62" x2="308" y2="637" stroke={K} strokeWidth="1.5" />

      {/* ================= TUYAUTERIES HAUTES ================= */}
      {/* entrée d'air de rétro-lavage (gauche) */}
      <g stroke={K} strokeWidth="2.2" fill="none">
        <line x1="119" y1="80" x2="152" y2="80" />
        <line x1="119" y1="116" x2="152" y2="116" />
        <line x1="121" y1="72" x2="121" y2="124" strokeWidth="3.2" />
        <line x1="118" y1="72" x2="124" y2="72" />
        <line x1="118" y1="124" x2="124" y2="124" />
      </g>
      {/* sortie de gaz propre (droite) */}
      <g stroke={K} strokeWidth="2.2" fill="none">
        <line x1="452" y1="80" x2="486" y2="80" />
        <line x1="452" y1="116" x2="486" y2="116" />
        <line x1="485" y1="72" x2="485" y2="124" strokeWidth="3.2" />
        <line x1="482" y1="72" x2="488" y2="72" />
        <line x1="482" y1="124" x2="488" y2="124" />
      </g>
      <ButterflyValve cx={158} />
      <ButterflyValve cx={446} />

      {/* ================= SUSPENTES + RESSORTS ================= */}
      <g stroke={K} strokeWidth="1.2">
        {[196, 249, 349, 401].map((x) => (
          <line key={x} x1={x} y1="62" x2={x} y2="152" />
        ))}
      </g>
      <Spring x={196} />
      <Spring x={249} y={92} />
      <Spring x={349} y={92} />
      <Spring x={401} y={94} />

      {/* ================= MANCHES ================= */}
      <Bag x={180} w={34} />
      <Bag x={233} w={34} />
      <Bag x={287} w={36} />
      <Bag x={332} w={40} bulge={2.5} />
      <Bag x={385} w={39} bulge={2.5} />
      {/* recouvrement blanc de la cloison par-dessus la 3e manche */}
      <rect x="299.2" y="140" width="7.6" height="300" fill="#fff" />
      <line x1="298" y1="140" x2="298" y2="440" stroke={K} strokeWidth="1.5" />
      <line x1="308" y1="140" x2="308" y2="440" stroke={K} strokeWidth="1.5" />

      {/* colliers */}
      <Collar x={179} w={38} />
      <Collar x={231} w={38} />
      <Collar x={284} w={14} />
      <Collar x={309} w={15} />
      <Collar x={333} w={38} />
      <Collar x={373} w={11} />
      <Collar x={385} w={38} />

      {/* ================= FLÈCHES D'AIR ================= */}
      {/* air de rétro-lavage : de la vanne vers le haut des manches */}
      <CurvedArrow d="M172,90 C200,82 232,82 232,100" head="223,99 241,99 232,113" />
      {/* gaz propre : des manches vers la vanne de sortie */}
      <CurvedArrow d="M364,96 C382,84 408,92 421,89" head="420,79 434,89 420,99" />
      {/* écoulement de la manche en cycle de filtration */}
      <CurvedArrow d="M386,182 C372,184 358,178 357,166" head="349,168 365,168 357,154" w={7} />
      <CurvedArrow d="M372,214 C388,216 396,210 396,200" head="388,202 404,202 396,188" w={7} />
      {/* manche qui s'affaisse (flèches opposées) */}
      <polygon points="221,227 230,227 230,224 238,230 230,236 230,233 221,233" fill="#fff" stroke={K} strokeWidth="1.1" />
      <polygon points="279,227 270,227 270,224 262,230 270,236 270,233 279,233" fill="#fff" stroke={K} strokeWidth="1.1" />

      {/* poussières évacuées (cycle de nettoyage) */}
      <DownArrow cx={202} />
      <DownArrow cx={252} />

      {/* gaz sale */}
      <g stroke={K} strokeWidth="2.2" fill="none">
        <line x1="433" y1="466" x2="459" y2="466" />
        <line x1="412" y1="503" x2="459" y2="503" />
        <line x1="459" y1="458" x2="459" y2="511" strokeWidth="3.4" />
      </g>
      <DirtyArrow d="M455,487 C425,497 388,492 368,468" head="342,447 376,452 354,480" />
      <DirtyArrow d="M440,482 C418,494 402,482 406,466" head="406,446 389,468 424,466" />

      {/* solides collectés */}
      <polygon points="282,643 298,646 300,684 304,684 299,713 277,683 285,683" fill={K} />

      {/* ================= ÉTIQUETTES ================= */}
      <g fontSize="22" fill={K}>
        <text x="300" y="30" textAnchor="middle">Butterfly valve</text>

        <text x="3" y="76">Clean</text>
        <text x="3" y="106">backwash</text>
        <text x="3" y="136">air</text>

        <text x="489" y="105">Clean gas</text>

        <text x="27" y="181">Bag</text>
        <text x="27" y="211">support</text>

        <text x="27" y="266">Bag</text>
        <text x="27" y="296">supported</text>
        <text x="27" y="326">by rings</text>

        <text x="470" y="354">Tube sheet</text>
        <text x="467" y="494">Dirty gas</text>

        <text x="62" y="560">Left side</text>
        <text x="62" y="590">cleaning cycle</text>
        <text x="392" y="560">Right side</text>
        <text x="392" y="590">filter cycle</text>

        <text x="302" y="729" textAnchor="middle">Collected solids</text>
        <text x="300" y="779" textAnchor="middle" fontSize="34" fontWeight="bold">Reverse-Air</text>
      </g>

      {/* traits de rappel */}
      <Leader x1="255" y1="36" x2="168" y2="80" />
      <Leader x1="347" y1="36" x2="436" y2="80" />
      <Leader x1="100" y1="175" x2="194" y2="140" />
      <Leader x1="100" y1="262" x2="178" y2="262" />
      <Leader x1="470" y1="362" x2="434" y2="436" />
    </svg>
  );
}