import React from "react";

/**
 * Synoptique d'un filtre à manches : entrée « fumée brute », caisson de filtration
 * à 4 manches, bypass, brosses de décolmatage, échangeur eau chaude, résistance
 * chauffante, coffret électrique, raccordement et boutons START / NETTOYAGE.
 * Coordonnées = pixels de l'image d'origine (592 x 421).
 */

const FONT = "Calibri, 'Segoe UI', Arial, sans-serif";
const BLK = "#111";
const GREEN = "#7fc241";
const NAVY = "#1b1b3f";

/* pseudo-aléatoire déterministe pour le nuage de poussières */
const rnd = (i) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const DOTS = Array.from({ length: 56 }, (_, i) => {
  const a = rnd(i) * Math.PI * 2;
  const r = Math.sqrt(rnd(i + 99)) * 1;
  return [150 + Math.cos(a) * r * 24 + (rnd(i + 7) - 0.5) * 8, 99 + Math.sin(a) * r * 14, 0.7 + rnd(i + 3) * 0.9];
});

const Box = ({ x, y, w, h, fill = "#fff", stroke = "#cfcfcf", children }) => (
  <g>
    <rect x={x + 1} y={y + 1.5} width={w} height={h} rx="2" fill="#000" opacity="0.08" />
    <rect x={x} y={y} width={w} height={h} rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
    {children}
  </g>
);

const T = ({ x, y, children, s = 8.5, fill = "#2e2e38", w }) => (
  <text
    x={x}
    y={y}
    fontSize={s}
    fontWeight="700"
    fill={fill}
    textAnchor="middle"
    fontFamily={FONT}
    textLength={w}
    lengthAdjust="spacingAndGlyphs"
  >
    {children}
  </text>
);

const Motor = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="13" fill="#c6c6ca" stroke="#6a6a70" strokeWidth="1.6" />
    <text x={x} y={y + 5.5} fontSize="15" fill="#fff" textAnchor="middle" fontFamily={FONT} fontWeight="700">
      M
    </text>
  </g>
);

const BAGS = [203, 237, 271, 305];
const ARROWS = [
  [181, 137], [186, 163], [188, 187], [189, 212], [190, 236], [190, 259], [190, 284],
];

export default function BagFilterSynoptic({ width = 296 }) {
  const wave = [];
  {
    const x0 = 203;
    const x1 = 436;
    const per = 39.5;
    let d = "";
    for (let x = x0; x <= x1; x += 2) {
      const y = 374.5 - 7.5 * Math.sin(((x - x0) / per) * Math.PI * 2 - 0.815);
      d += `${x === x0 ? "M" : "L"}${x},${y.toFixed(1)} `;
    }
    wave.push(d);
  }

  return (
    <svg
      viewBox="0 0 592 421"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Synoptique d'un filtre à manches : fumée brute, filtration, bypass, nettoyage, eau chaude, fumée épurée"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="bfBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a8ad8" />
          <stop offset="1" stopColor="#1f5fb4" />
        </linearGradient>
      </defs>

      {/* ============ LIAISONS FINES GRISES ============ */}
      <g fill="none" stroke="#b7b7b7" strokeWidth="1">
        <path d="M137,82 V34 H201" />
        <path d="M319,34 H383 V73" />
        <path d="M115,215 H149 V128 H340" />
        <line x1="131" y1="128" x2="131" y2="142" />
        <line x1="157" y1="381" x2="203" y2="381" />
      </g>
      <line x1="350" y1="27" x2="350" y2="52" stroke={NAVY} strokeWidth="1.5" />

      {/* ============ CONTOUR NOIR ============ */}
      <g fill="none" stroke={BLK} strokeWidth="3" strokeLinejoin="miter">
        {/* gaine d'entrée */}
        <path d="M96,82 H118" />
        <path d="M96,112 H118" />
        <path d="M118,70 V82 M124,70 V82" strokeWidth="2.6" />
        <path d="M118,112 V125 M124,112 V125" strokeWidth="2.6" />
        <path d="M124,82 H143 L168,50 H346" />
        <path d="M124,112 H143 L168,143 V333 L203,387 H436" />
        {/* gaine de sortie */}
        <path d="M349,52 L373,81 H393 M399,81 H468" />
        <path d="M393,70 V82 M399,70 V82" strokeWidth="2.6" />
        <path d="M468,112 H399 M393,112 H373 L349,142" />
        <path d="M393,112 V125 M399,112 V125" strokeWidth="2.6" />
        <path d="M347,50 V60" strokeWidth="2.6" />
        {/* caisson */}
        <path d="M346,93 V103" strokeWidth="2.6" />
        <path d="M346,133 V333" />
        <path d="M203,145 V97 H346" />
        <path d="M347,333 L330,363 H435" />
        {/* eau chaude */}
        <path d="M99,292 H168 M99,328 H168" />
        <path d="M170,291 L143,309 L170,327" />
      </g>

      {/* ============ MANCHES ============ */}
      {BAGS.map((x) => (
        <path key={x} d={`M${x},145 V290 H${x + 11} V145`} fill="#fff" stroke={BLK} strokeWidth="3" />
      ))}
      <g stroke="#a36e5c" strokeWidth="1" strokeDasharray="1.5 2" fill="none">
        <line x1="214" y1="143" x2="236" y2="143" />
        <line x1="248" y1="143" x2="270" y2="143" />
        <line x1="282" y1="143" x2="304" y2="143" />
        <line x1="316" y1="143" x2="344" y2="143" />
      </g>
      <g stroke="#dba07a" strokeWidth="1.3" fill="none">
        {[224, 261, 293, 327].map((x) => (
          <line key={x} x1={x} y1={x === 224 ? 185 : 185} x2={x} y2="316" />
        ))}
        <line x1="224" y1="316" x2="387" y2="316" />
      </g>

      {/* capteurs de pression sur la rampe */}
      <g stroke={BLK} strokeWidth="2.8">
        {[[221, 229], [254, 262], [289, 298], [324, 333]].map(([a, b]) => (
          <g key={a}>
            <line x1={a} y1="121" x2={a} y2="136" />
            <line x1={b} y1="124" x2={b} y2="141" />
          </g>
        ))}
      </g>

      {/* flèche double (bypass) + clapet */}
      <g stroke={BLK} strokeWidth="1.2" fill={BLK}>
        <line x1="357" y1="95" x2="357" y2="116" />
        <polygon points="357,92 354,98 360,98" />
        <polygon points="357,119 354,113 360,113" />
      </g>
      <rect x="346" y="103" width="4.5" height="24" fill="#f4e500" />

      {/* flèches grises de circulation */}
      {ARROWS.map(([x, tip], i) => (
        <path
          key={i}
          d={`M${x - 3.5},${tip - 24} H${x + 3.5} V${tip - 10} H${x + 7} L${x},${tip} L${x - 7},${tip - 10} H${x - 3.5} Z`}
          fill="#d7d9de"
          stroke="#eceef2"
          strokeWidth="1"
          opacity={i > 3 ? 0.9 : 1}
        />
      ))}

      {/* nuage de poussières */}
      <g fill="#5d6069">
        {DOTS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>

      {/* ============ ENTRÉE / SORTIE DES FUMÉES ============ */}
      <polygon points="13,87 113,87 123,97.5 113,108 13,108 22,97.5" fill="#707070" stroke="#4d4d4d" strokeWidth="1" />
      <text x="62" y="102" fontSize="11.5" fill="#fff" fontWeight="700" textAnchor="middle" fontFamily={FONT} textLength="68" lengthAdjust="spacingAndGlyphs">
        FUMEE BRUTE
      </text>
      <polygon points="451,87 549,87 558,97 549,107 451,107 459,97" fill="#dcebf8" stroke="#2f2f3f" strokeWidth="1.3" />
      <text x="506" y="102" fontSize="11.5" fill="#2a2a3a" fontWeight="700" textAnchor="middle" fontFamily={FONT} textLength="72" lengthAdjust="spacingAndGlyphs">
        FUMEE EPUREE
      </text>

      {/* ============ ÉTIQUETTES ============ */}
      <Box x={201} y={25} w={119} h={17} fill={GREEN} stroke="#6aa835">
        <T x={260} y={37} w={78}>PERTE DE CHARGE</T>
      </Box>
      <Box x={283} y={73} w={53} h={19}>
        <T x={309} y={86} w={36}>BYPASS</T>
      </Box>
      <Box x={276} y={102} w={60} h={18} fill={GREEN} stroke="#6aa835">
        <T x={306} y={114} w={46}>FILTRATION</T>
      </Box>
      <Box x={60} y={130} w={53} h={29} fill={GREEN} stroke="#6aa835">
        <T x={86} y={142} w={38}>BROSSES</T>
        <T x={86} y={154} w={30}>LEVEES</T>
      </Box>
      <Box x={44} y={203} w={70} h={19}>
        <T x={79} y={216} w={52}>CONTREPOIDS</T>
      </Box>
      <Box x={403} y={87} w={44} h={20}>
        <T x={425} y={101} w={28}>TEMP.</T>
      </Box>
      <Box x={120} y={337} w={42} h={18}>
        <T x={141} y={349} w={28}>TEMP.</T>
      </Box>
      <Box x={15} y={295} w={56} h={30}>
        <T x={43} y={308} w={20}>EAU</T>
        <T x={43} y={320} w={38}>CHAUDE</T>
      </Box>
      <Box x={460} y={205} w={88} h={17}>
        <T x={504} y={217} w={50}>RACCORDE</T>
      </Box>

      {/* moteurs */}
      <Motor x={131} y={155} />
      <Motor x={350} y={14} />
      <Motor x={144} y={381} />

      {/* ============ EAU CHAUDE ============ */}
      <polygon points="76,285 90,285 99,293 90,301 76,301 82,293" fill="#e41b1b" stroke="#a80f0f" strokeWidth="0.8" />
      <polygon points="76,327 86,317 99,317 93,327 99,337 86,337" fill="#e41b1b" stroke="#a80f0f" strokeWidth="0.8" />

      {/* ============ RÉSISTANCE CHAUFFANTE ============ */}
      <path d={wave[0]} fill="none" stroke="#4a5f86" strokeWidth="1.6" />
      <line x1="203" y1="387" x2="436" y2="387" stroke={BLK} strokeWidth="3" />

      {/* ============ COFFRET ÉLECTRIQUE ============ */}
      <path d="M347,303 H389 M347,332 H389" stroke={BLK} strokeWidth="2.6" fill="none" />
      <rect x="389" y="283" width="47" height="60" fill="#fff200" stroke={BLK} strokeWidth="2.2" />
      <path d="M413,288 H428 L417,306 H432 L409,340 L413,317 H398 Z" fill={BLK} />

      {/* ============ RACCORD ============ */}
      <path d="M419,353 H460 V230 H551 V385" fill="none" stroke={NAVY} strokeWidth="2.4" />
      <path d="M419,394 H461 V409 H521" fill="none" stroke={NAVY} strokeWidth="2.4" />
      <rect x="462" y="391" width="58" height="17" fill="#dadada" />
      <circle cx="527" cy="402" r="19" fill="#fff" />
      <circle cx="527" cy="402" r="17" fill="#4f86d6" stroke="#9fbde8" strokeWidth="1" />

      {/* ============ BOUTONS ============ */}
      <rect x="442" y="125" width="134" height="27" rx="2" fill="url(#bfBlue)" stroke="#1b4f9a" strokeWidth="1" />
      <text x="509" y="145" fontSize="15" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={FONT}>
        START
      </text>
      <rect x="442" y="157" width="135" height="24" rx="2" fill="#e3e3e3" stroke="#d2d2d2" strokeWidth="1" />
      <text x="509" y="175" fontSize="13" fontWeight="700" fill="#f6f6f6" textAnchor="middle" fontFamily={FONT} textLength="86" lengthAdjust="spacingAndGlyphs">
        NETTOYAGE
      </text>
    </svg>
  );
}