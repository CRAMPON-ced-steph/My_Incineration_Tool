import React from "react";

/**
 * Coupe d'un four à grille inclinée : trémie d'alimentation et poussoir,
 * zones de séchage / combustion / cendres, arrivées d'air tertiaire et secondaire,
 * air sous grille (5 caissons), trémies à cendres et extracteur.
 * Coordonnées = pixels de l'image d'origine (1631 x 1023).
 */

const GREY = "#b9b8b4";
const GREY_D = "#8f908c";
const INK = "#1d2433";
const FONT = "'Avenir Next', 'Nunito Sans', 'Segoe UI', Arial, sans-serif";

/* caissons d'air sous grille : [x haut gauche, x haut droit, x bas gauche, x bas droit, centre flèche, y pointe] */
const HOPPERS = [
  [595, 713, 620, 664, 653, 497],
  [715, 835, 750, 800, 775, 530],
  [837, 958, 850, 925, 897, 552],
  [960, 1082, 968, 1045, 1020, 573],
  [1084, 1205, 1118, 1170, 1143, 617],
];

/* spires de la bande oblique (cercles) */
const BAND_CIRCLES = [
  [770, 284], [815, 305], [858, 325], [900, 345], [942, 365],
  [985, 386], [1030, 408], [1073, 428], [1118, 447], [1167, 468],
];

const Label = ({ x, y, children, s = 30, w }) => (
  <text x={x} y={y} fontSize={s} fontWeight="700" fill={INK} fontFamily={FONT} textLength={w} lengthAdjust="spacingAndGlyphs">
    {children}
  </text>
);

function Fan({ cy }) {
  return (
    <g>
      <path
        d={`M${375},${cy - 20} H665 V${cy + 20} H375 A20 20 0 0 1 375,${cy - 20} Z`}
        fill={GREY}
        stroke="#9c9b97"
        strokeWidth="1"
      />
      <line x1="508" y1={cy - 20} x2="508" y2={cy + 20} stroke="#8d8c88" strokeWidth="1.2" />
      <line x1="513" y1={cy - 20} x2="513" y2={cy + 20} stroke="#8d8c88" strokeWidth="1.2" />
      <circle cx="435" cy={cy} r="35" fill="#c2c1bd" stroke="#8d8c88" strokeWidth="1.5" />
      <circle cx="435" cy={cy} r="28" fill="none" stroke="#a7a6a2" strokeWidth="1" />
      <line x1="421" y1={cy} x2="449" y2={cy} stroke="#7e7d79" strokeWidth="2" />
      <path d={`M424,${cy + 5} A12 8 0 0 0 446,${cy + 5}`} fill="none" stroke="#7e7d79" strokeWidth="2" />
      <path d={`M424,${cy - 5} A12 8 0 0 1 446,${cy - 5}`} fill="none" stroke="#7e7d79" strokeWidth="2" />
    </g>
  );
}

function Arrow({ x, tip, bottom = 712 }) {
  return (
    <path
      d={`M${x},${tip} L${x + 21},${tip + 37} H${x + 8} V${bottom - 7} A8 8 0 0 1 ${x - 8},${bottom - 7} V${tip + 37} H${x - 21} Z`}
      fill="#fff"
    />
  );
}

export default function GrateFurnace({ width = 979 }) {
  const hook = [];
  for (let x = 978; x < 1262; x += 28) {
    const y = 293 + (x - 950) * 0.48;
    hook.push(
      <path key={x} d={`M${x},${y} v-13 q0,-4 5,-4`} fill="none" stroke="#333" strokeWidth="1.3" />
    );
  }
  const steps = [];
  for (let i = 0; i < 34; i++) {
    const t = i / 34;
    const x = 600 + t * 590;
    const y = 440 + t * 158;
    steps.push(<line key={i} x1={x} y1={y - 1} x2={x - 8} y2={y + 14} stroke="#8e8e8a" strokeWidth="1.2" />);
  }

  return (
    <svg
      viewBox="0 0 1631 1023"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Four à grille : zones de séchage, de combustion et de cendres, air tertiaire, secondaire et sous grille"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="gfFire" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="600">
          <stop offset="0" stopColor="#ea9650" />
          <stop offset="0.38" stopColor="#e47a3e" />
          <stop offset="0.65" stopColor="#dc5535" />
          <stop offset="1" stopColor="#d6452d" />
        </linearGradient>
        <linearGradient id="gfChute" gradientUnits="userSpaceOnUse" x1="0" y1="605" x2="0" y2="740">
          <stop offset="0" stopColor="#d8492e" />
          <stop offset="1" stopColor="#ec9650" />
        </linearGradient>
        <pattern id="gfStipple" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#8fd08f" />
          <g fill="#1f2a1f">
            <circle cx="3" cy="4" r="1.3" />
            <circle cx="11" cy="2" r="1" />
            <circle cx="8" cy="9" r="1.4" />
            <circle cx="14" cy="12" r="1.1" />
            <circle cx="2" cy="13" r="1" />
            <circle cx="6" cy="15" r="0.8" />
          </g>
        </pattern>
      </defs>

      {/* ====== SUPPORTS ====== */}
      <rect x="590" y="598" width="24" height="262" fill="#6a6c6a" />
      <rect x="1255" y="598" width="27" height="262" fill="#6f716f" />
      <g stroke="#6a6c6a" strokeWidth="12">
        <line x1="718" y1="858" x2="852" y2="735" />
        <line x1="1070" y1="780" x2="1122" y2="852" />
      </g>

      {/* ====== TÉMOINS D'ENTRÉE ====== */}
      <rect x="563" y="232" width="27" height="204" fill="#898b88" />
      <rect x="588" y="225" width="26" height="214" fill="#7a7c79" />
      <rect x="592" y="405" width="26" height="30" fill="#d2d2ce" />

      {/* ====== FOUR : fond orange ====== */}
      <path
        d="M688,0 H925 V312 L1255,470 V606 H1208 L1196,600 L596,440 L617,430 V318 L688,235 Z"
        fill="url(#gfFire)"
      />

      {/* ====== BANDE OBLIQUE (voûte) ====== */}
      <polygon
        points="662,155 690,190 745,248 1207,470 1190,502 727,287 688,235 662,210"
        fill="rgba(105,48,28,0.45)"
      />
      <g fill="none" stroke="rgba(70,30,20,0.55)" strokeWidth="1.4">
        {BAND_CIRCLES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="8" />
        ))}
      </g>

      {/* ====== MURS RÉFRACTAIRES (vert pointillé) ====== */}
      <path d="M662,0 H688 V235 L617,318 V430 H592 V310 L662,215 Z" fill="url(#gfStipple)" />
      <path d="M925,0 H950 V295 L1282,452 V606 H1255 V470 L925,312 Z" fill="url(#gfStipple)" />
      <g fill="none" stroke="#5f8f5f" strokeWidth="1">
        <path d="M662,0 V215 L592,310 V430" />
        <path d="M950,0 V295 L1282,452 V606" />
      </g>
      {hook}
      {/* bandeau supérieur */}
      <rect x="662" y="0" width="288" height="38" fill="rgba(110,70,40,0.45)" />
      <g fill="none" stroke="rgba(80,40,20,0.7)" strokeWidth="1.5">
        {[715, 742, 770, 797, 825, 852, 880].map((x) => (
          <circle key={x} cx={x} cy="18" r="8" />
        ))}
      </g>

      {/* ====== AIR TERTIAIRE / SECONDAIRE ====== */}
      <Fan cy={30} />
      <Fan cy={180} />
      <rect x="662" y="155" width="26" height="45" fill="#b0afab" opacity="0" />

      {/* ====== TRÉMIE D'ALIMENTATION + POUSSOIR ====== */}
      <polygon points="480,220 540,224 556,326 466,326" fill="#d3d3d0" stroke="#9a9a96" strokeWidth="1" />
      <polygon points="480,220 508,221 512,326 466,326" fill="#e3e3e0" />
      <polygon points="540,224 556,326 548,326 534,230" fill="#9d9d99" />
      <line x1="506" y1="214" x2="546" y2="218" stroke="#8d8d89" strokeWidth="3" />
      <polygon points="466,326 556,326 556,342 470,342" fill="#c0c0bc" stroke="#8f8f8b" strokeWidth="1" />
      <polygon points="378,342 478,342 560,398 600,408 600,436 530,426 452,392 380,360" fill="#cbcbc7" stroke="#8f8f8b" strokeWidth="1.2" />
      <polygon points="378,342 478,342 560,398 520,398 460,360 380,352" fill="#dededb" />
      <g stroke="#555" strokeWidth="1.2" fill="#a9a9a6">
        <rect x="445" y="366" width="56" height="22" rx="4" transform="rotate(14 473 377)" />
        <circle cx="452" cy="378" r="5" fill="#dadad6" />
        <circle cx="480" cy="386" r="4" fill="#dadad6" />
        <circle cx="520" cy="404" r="4.5" fill="#dadad6" />
        <rect x="456" y="398" width="68" height="16" rx="5" transform="rotate(18 490 406)" fill="#8b8b88" />
      </g>

      {/* ====== BLOC GAUCHE AVEC DOIGTS ====== */}
      <rect x="540" y="447" width="57" height="153" fill="#7d7f7b" />
      <rect x="548" y="455" width="40" height="138" fill="#8a8c88" />
      {[466, 498, 530, 560, 583].map((y) => (
        <rect key={y} x="506" y={y - 4} width="40" height="8" rx="3" fill="#838581" />
      ))}

      {/* ====== PLENUM + GRILLE ====== */}
      <polygon points="597,447 1188,600 597,600" fill="#676866" />
      <polygon points="595,436 1200,598 1200,610 595,450" fill="#d6d6d2" stroke="#9c9c98" strokeWidth="1" />
      <polygon points="595,436 1200,598 1200,602 595,441" fill="#eeeeea" />
      <g>{steps}</g>
      <polygon points="1182,596 1206,596 1206,606 1182,606" fill="#cfcfcb" stroke="#9c9c98" strokeWidth="1" />

      {/* collecteur d'air */}
      <rect x="590" y="602" width="617" height="33" fill="#dcdcd8" />
      <line x1="590" y1="602" x2="1207" y2="602" stroke="#c9c9c5" strokeWidth="2" />

      {/* ====== TRÉMIES À CENDRES ====== */}
      {HOPPERS.map(([a, b, c, d], i) => (
        <path key={i} d={`M${a},635 H${b} L${d},860 H${c} Z`} fill="#b8b7b3" stroke="#a1a09c" strokeWidth="1" />
      ))}

      {/* ====== SORTIE DES CENDRES (droite) ====== */}
      <path d="M1208,605 H1282 L1255,738 H1228 Z" fill="url(#gfChute)" />
      <rect x="1228" y="738" width="27" height="122" fill="#b9b8b4" stroke="#a1a09c" strokeWidth="1" />
      <rect x="1228" y="738" width="27" height="3" fill="#8f908c" />

      {/* ====== TAMBOUR / EXTRACTEUR ====== */}
      <path d="M565,862 H1436 V975 H565 A55 56 0 0 1 565,862 Z" fill="#b5b4b0" />
      <path d="M565,862 A55 56 0 0 0 565,975" fill="none" stroke="#9e9d99" strokeWidth="1" />
      <line x1="567" y1="862" x2="567" y2="975" stroke="#9e9d99" strokeWidth="1.2" />
      <rect x="1429" y="915" width="6" height="20" fill="#222" />
      <rect x="585" y="972" width="40" height="14" fill="#6c6d6a" />
      <rect x="1245" y="972" width="50" height="14" fill="#6c6d6a" />
      <rect x="487" y="982" width="905" height="41" fill="#8c8d8a" />

      {/* ====== FLÈCHES D'AIR SOUS GRILLE ====== */}
      {HOPPERS.map(([, , , , cx, tip], i) => (
        <g key={i}>
          <Arrow x={cx} tip={tip} />
          <circle cx={cx} cy="702" r="22" fill="none" stroke="#111" strokeWidth="3" strokeDasharray="9 6" />
        </g>
      ))}
      <circle cx="653" cy="702" r="8" fill="#fff" stroke="#111" strokeWidth="3" />
      <circle cx="653" cy="806" r="8" fill="#fff" stroke="#111" strokeWidth="3" />
      <circle cx="1243" cy="662" r="8" fill="#fff" stroke="#111" strokeWidth="3" />

      {/* ====== REPÈRES ET TEXTES ====== */}
      <g stroke="#111" strokeWidth="2" fill="#111">
        <line x1="275" y1="37" x2="342" y2="37" />
        <polygon points="357,37 340,30 340,44" stroke="none" />
        <line x1="275" y1="188" x2="342" y2="188" />
        <polygon points="357,188 340,181 340,195" stroke="none" />
        <line x1="425" y1="702" x2="640" y2="702" />
        <line x1="415" y1="806" x2="644" y2="806" />
        <line x1="1252" y1="662" x2="1432" y2="662" />
      </g>
      <Label x="42" y="47" w={220}>Tertiary Air Zone</Label>
      <Label x="0" y="198" w={262}>Secondary Air Zone</Label>
      <Label x="646" y="414" w={166}>Drying Zone</Label>
      <Label x="830" y="480" w={238}>Combustion Zone</Label>
      <Label x="1090" y="550" w={126}>Ash Zone</Label>
      <Label x="150" y="712" w={262}>Under Fire Air Zone</Label>
      <Label x="226" y="816" w={188}>Ash Drop-Out</Label>
      <Label x="1443" y="672" w={187}>Ash Drop-Out</Label>
    </svg>
  );
}