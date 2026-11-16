import React from "react";

/**
 * Sécheur-atomiseur (absorbeur à atomiseur rotatif) en coupe :
 * entrée de fumées haute (volute), atomiseur rotatif, disperseur central de gaz,
 * entrée basse de fumées, cône inférieur et sortie vers le dépoussiérage.
 * Coordonnées = pixels de l'image d'origine (388 x 509).
 */

const FONT = "Arial, Helvetica, sans-serif";
const OR = "#f58a25";
const OR_E = "#c4621a";
const BL = "#bfe3f6";
const BL_D = "#8cc6e8";
const CREAM = "#f7e8c4";
const CREAM_E = "#8a6b3c";
const K = "#111";

const Txt = ({ x, y, w, children, anchor = "middle" }) => (
  <text x={x} y={y} fontSize="10" fontWeight="700" fill={K} textAnchor={anchor} fontFamily={FONT} textLength={w} lengthAdjust="spacingAndGlyphs">
    {children}
  </text>
);

export default function SprayDryer({ width = 200 }) {
  return (
    <svg
      viewBox="0 0 388 509"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sécheur à atomiseur rotatif en coupe : entrée de fumées haute et basse, disperseur central, sortie vers la collecte des particules"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="sdCone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c4d1d9" />
          <stop offset="0.5" stopColor="#9eafba" />
          <stop offset="1" stopColor="#7a8b97" />
        </linearGradient>
        <linearGradient id="sdBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f8190" />
          <stop offset="0.55" stopColor="#8fa0ad" />
          <stop offset="1" stopColor="#a9b7c1" />
        </linearGradient>
        <linearGradient id="sdWall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9cdd1" />
          <stop offset="0.35" stopColor="#f5f6f7" />
          <stop offset="1" stopColor="#e2e5e8" />
        </linearGradient>
        <radialGradient id="sdGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#f4f7f9" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sdBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d3edfa" />
          <stop offset="1" stopColor="#a9d6f0" />
        </linearGradient>
        <linearGradient id="sdTube" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a9d6f0" />
          <stop offset="0.5" stopColor="#d6eefb" />
          <stop offset="1" stopColor="#a1cfea" />
        </linearGradient>
        <linearGradient id="sdCream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbefd0" />
          <stop offset="1" stopColor="#efdcaa" />
        </linearGradient>
        <linearGradient id="sdMotor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f86b8" />
          <stop offset="0.5" stopColor="#7cc6ee" />
          <stop offset="1" stopColor="#2b7fb0" />
        </linearGradient>
        <linearGradient id="sdGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd0a6" />
          <stop offset="1" stopColor="#3da57a" />
        </linearGradient>
      </defs>

      {/* ============ ENVELOPPE ============ */}
      {/* toit */}
      <path d="M72,118 Q72,95 120,85 Q195,72 275,88 Q312,98 312,118 L312,330 L272,142 L72,125 Z" fill="#e8ebee" stroke="#a5abb0" strokeWidth="1" />
      {/* paroi arrière (coupe) */}
      <polygon points="75,112 150,137 232,128 272,142 272,372 200,497 190,497 112,367 75,322" fill="url(#sdBack)" />
      {/* cône inférieur, moitié sombre */}
      <polygon points="112,367 272,372 200,497 190,497" fill="url(#sdCone)" />
      <line x1="112" y1="367" x2="190" y2="497" stroke="#fff" strokeWidth="2" />
      <rect x="188" y="489" width="17" height="9" fill="#9aa8b3" stroke="#6f7d88" strokeWidth="0.8" />
      {/* paroi gauche */}
      <polygon points="72,118 80,124 80,300 110,322 78,318 72,305" fill="#dfe3e6" stroke="#aab" strokeWidth="0.8" />
      {/* halo de pulvérisation */}
      <ellipse cx="190" cy="205" rx="112" ry="62" fill="url(#sdGlow)" />
      {/* paroi droite (colonne claire) */}
      <polygon points="272,140 312,114 312,336 203,497 198,497 272,372" fill="url(#sdWall)" stroke="#aab0b5" strokeWidth="0.8" />

      {/* ============ VOLUTE D'ENTRÉE HAUTE ============ */}
      <path d="M108,62 Q108,48 150,42 Q215,32 262,42 Q300,50 300,64 V104 H108 Z" fill="#a9b2b9" stroke="#7d868d" strokeWidth="0.8" />
      <ellipse cx="204" cy="62" rx="96" ry="22" fill="#d9dde0" stroke="#8d969c" strokeWidth="0.8" />
      <path d="M142,60 Q142,48 200,46 Q258,46 262,60 V72 H142 Z" fill="#8d979e" />
      <ellipse cx="204" cy="72" rx="62" ry="20" fill="#b9c3ca" stroke="#7d868d" strokeWidth="0.8" />

      {/* cône d'atomisation (crème) */}
      <polygon points="143,72 255,72 200,165 188,165" fill="url(#sdCream)" stroke={CREAM_E} strokeWidth="0.8" />
      <ellipse cx="199" cy="72" rx="56" ry="19" fill="#f9edcc" stroke={CREAM_E} strokeWidth="0.8" />
      <ellipse cx="199" cy="74" rx="45" ry="14" fill="#f3e0ae" />
      <path d="M159,95 Q198,88 238,96" fill="none" stroke="#b8c85a" strokeWidth="3" strokeDasharray="2 2" />
      <line x1="171" y1="64" x2="178" y2="94" stroke="#c0a04e" strokeWidth="2" strokeDasharray="2 1.5" />
      <path d="M145,92 L157,110 L172,135 L184,162" fill="none" stroke="#a98d4e" strokeWidth="1" />
      <path d="M252,92 L238,112 L224,138 L204,162" fill="none" stroke="#a98d4e" strokeWidth="1" />
      {/* zones vertes */}
      <path d="M126,88 L141,92 L150,118 L135,122 Z" fill="url(#sdGreen)" />
      <path d="M255,90 L246,94 L238,112 L254,118 L262,100 Z" fill="url(#sdGreen)" />
      <path d="M122,92 L140,100 L132,114 Z" fill="#9ae0bd" />

      {/* atomiseur rotatif */}
      <rect x="187" y="98" width="19" height="42" rx="4" fill="url(#sdMotor)" stroke="#26749f" strokeWidth="0.8" />
      <rect x="190" y="94" width="13" height="8" rx="2" fill="#7cc6ee" stroke="#26749f" strokeWidth="0.8" />
      <polygon points="188,140 205,140 197,160 192,160" fill="#8fd0f0" stroke="#26749f" strokeWidth="0.8" />
      <polygon points="192,160 197,160 195,170 193,170" fill="#4ba3d4" />
      <path d="M184,170 L176,176 M205,170 L214,177 M195,172 L195,181" stroke="#7bc2e6" strokeWidth="0.8" fill="none" />

      {/* flèches orange hautes */}
      <path d="M262,66 Q289,68 288,94 Q287,112 260,122" fill="none" stroke={OR} strokeWidth="13" strokeLinejoin="round" />
      <polygon points="248,126 268,112 266,134" fill={OR} />
      <path d="M262,66 Q289,68 288,94" fill="none" stroke={OR_E} strokeWidth="0.6" />
      <path d="M124,84 L134,94 L142,100 L136,108 L126,100 L122,92 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M232,108 L248,118 L242,122 L228,114 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M162,128 L170,140 L168,150 L158,134 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M176,146 L184,158 L178,160 L174,150 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M200,148 L212,158 L208,164 L200,156 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />

      {/* ============ DISPERSEUR CENTRAL ============ */}
      <polygon points="186,192 200,192 218,214 166,214" fill="url(#sdGreen)" stroke="#2f8f68" strokeWidth="0.8" />
      <g stroke="#2f8f68" strokeWidth="0.7">
        {[170, 178, 186, 193, 200, 208, 214].map((x) => (
          <line key={x} x1={193} y1="193" x2={x} y2="214" />
        ))}
      </g>
      <path d="M164,214 Q192,226 220,214 V226 Q192,238 164,226 Z" fill="#59b88e" stroke="#2f8f68" strokeWidth="0.8" />
      <g fill="#1f6b4d">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={168 + i * 3.7} cy={223 + 3.5 * Math.sin((i / 13) * Math.PI)} r="0.9" />
        ))}
      </g>
      {/* flèches orange du disperseur */}
      <polygon points="168,188 180,194 178,200 166,194" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <polygon points="160,186 170,184 168,192" fill={OR} />
      <polygon points="214,200 226,195 228,200 216,206" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <polygon points="228,192 224,204 236,198" fill={OR} />

      {/* ============ GAINES ============ */}
      {/* ombre du fond (plancher) */}
      <path d="M76,300 Q84,272 170,258 L170,310 L110,330 Z" fill="#b2bdc6" opacity="0.8" />

      {/* gaine de sortie vers la collecte */}
      <polygon points="314,259 351,278 351,340 300,353 271,374 271,300" fill="#c8e7f8" stroke="#8ec2e0" strokeWidth="0.8" />
      <polygon points="314,259 351,278 300,292 271,290" fill="#dff2fc" />
      <line x1="314" y1="296" x2="351" y2="284" stroke="#9fcbe6" strokeWidth="0.8" />
      <line x1="314" y1="296" x2="314" y2="350" stroke="#9fcbe6" strokeWidth="0.8" />
      <polygon points="351,277 358,273 358,343 351,341" fill="#8ec9ec" stroke="#6ea9cc" strokeWidth="0.6" />

      {/* caisson bleu bas (face sombre + faces claires) */}
      <polygon points="232,314 272,306 272,372 246,387 240,355" fill="#c1e2f6" />
      <polygon points="188,329 220,310 232,314 240,355 246,387 196,369" fill="#8fc4e3" />
      <polygon points="188,329 220,310 232,314 232,340 205,352" fill="#6fb0d8" opacity="0.7" />
      <polygon points="196,369 205,352 238,350 246,387" fill="#b7dcf2" />
      <polygon points="188,329 196,369 192,372 186,333" fill="#7e8f9b" />

      {/* diagonale d'alimentation : face latérale */}
      <polygon points="101,335 186,291 220,310 170,329 145,349 100,372" fill="url(#sdBlue)" stroke="#8ec2e0" strokeWidth="0.8" />
      <polygon points="100,372 145,349 190,333 200,334 188,340 110,376" fill="#a6d3ee" />

      {/* colonne centrale + coude */}
      <path d="M170,232 H219 V309 L200,302 Q172,288 170,258 Z" fill="url(#sdTube)" stroke="#8ec2e0" strokeWidth="0.8" />
      <ellipse cx="194" cy="232" rx="25" ry="6" fill="#d9f0fb" stroke="#8ec2e0" strokeWidth="0.8" />

      {/* panneau crème n°1 */}
      <polygon points="84,306 170,263 186,291 101,335" fill="url(#sdCream)" stroke={CREAM_E} strokeWidth="0.9" />
      <line x1="130" y1="286" x2="145" y2="311" stroke={CREAM_E} strokeWidth="0.8" />
      <polygon points="84,306 88,310 92,322 90,325 86,318" fill="#e7cf98" stroke={CREAM_E} strokeWidth="0.6" />
      {/* panneau crème n°2 */}
      <polygon points="220,268 266,249 272,252 272,306 232,314 222,309" fill="url(#sdCream)" stroke={CREAM_E} strokeWidth="0.9" />
      <line x1="253" y1="251" x2="271" y2="290" stroke={CREAM_E} strokeWidth="0.8" />
      <polygon points="220,300 232,314 220,309" fill="#e7cf98" />

      {/* tuyau d'entrée basse */}
      <path d="M40,326 H76 L83,322 L100,334 V374 H76 H40 Z" fill="url(#sdTube)" stroke="#8ec2e0" strokeWidth="0.8" />
      <ellipse cx="40" cy="350" rx="5" ry="24" fill="#6fb3d8" stroke="#8ec2e0" strokeWidth="0.8" />
      <rect x="73" y="321" width="10" height="57" rx="4" fill="#a9d6f0" stroke="#7fb3d3" strokeWidth="0.8" />

      {/* ============ FLÈCHES ============ */}
      <polygon points="7,343 20,343 20,333 38,350 20,367 20,358 7,358" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M109,238 L113,240 Q113,262 124,279 L122,281 L110,291 L103,287 L108,284 Q110,262 109,238 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M142,350 Q160,358 176,355 L174,351 L187,358 L172,363 L174,359 Q158,362 142,354 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M172,342 Q192,349 207,342 L206,336 L216,338 L208,347 L208,344 Q192,352 172,346 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <path d="M187,374 Q215,370 228,362 L224,357 L238,353 L236,367 L233,364 Q218,376 188,378 Z" fill={OR} stroke={OR_E} strokeWidth="0.6" />
      <polygon points="355,268 366,264 366,257 380,274 366,302 366,292 355,296" fill="#fcc933" stroke="#c99a10" strokeWidth="0.6" />

      {/* ============ REPÈRES ET TEXTES ============ */}
      <g stroke={K} strokeWidth="1" fill={K}>
        <line x1="328" y1="34" x2="289" y2="76" />
        <polygon points="283,81 288,72 294,78" />
        <line x1="56" y1="146" x2="190" y2="170" />
        <polygon points="195,170 186,166 185,172" />
        <line x1="54" y1="226" x2="163" y2="216" />
        <polygon points="167,215 158,211 158,218" />
      </g>
      <Txt x="352" y="31" w={46}>Inlet Flue</Txt>
      <Txt x="352" y="42" w={55}>Gas (Upper)</Txt>
      <Txt x="33" y="137" w={32}>Rotary</Txt>
      <Txt x="33" y="148" w={44}>Atomizer</Txt>
      <Txt x="33" y="230" w={37}>Central</Txt>
      <Txt x="33" y="240" w={24}>Gas</Txt>
      <Txt x="33" y="250" w={42}>Disperser</Txt>
      <Txt x="352" y="234" w={14}>To</Txt>
      <Txt x="352" y="244" w={48}>Particulate</Txt>
      <Txt x="352" y="254" w={44}>Collection</Txt>
      <Txt x="33" y="388" w={45}>Inlet Flue</Txt>
      <Txt x="33" y="398" w={54}>Gas (Lower)</Txt>
    </svg>
  );
}