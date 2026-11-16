import React from "react";

/**
 * Reproduction vectorielle (illustration, pas une photo) des deux vues :
 *  1. <StackView />  — cheminée blanche devant un mur rouge, cote hp ;
 *  2. <PlantView />  — installation industrielle avec cheminée et panache.
 * Le composant par défaut empile les deux vues, comme l'image d'origine.
 */

const SANS = "Arial, Helvetica, sans-serif";

/* ------------------------------------------------------------------ */
/* Nuage : amas d'ellipses blanches                                      */
/* ------------------------------------------------------------------ */
function Cloud({ x, y, s = 1, o = 0.92 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity={o}>
      <ellipse cx="0" cy="0" rx="30" ry="11" />
      <ellipse cx="-20" cy="3" rx="20" ry="8" />
      <ellipse cx="20" cy="4" rx="22" ry="8" />
      <ellipse cx="-6" cy="-7" rx="16" ry="9" />
      <ellipse cx="10" cy="-5" rx="13" ry="8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Cheminée devant mur rouge                                          */
/* ------------------------------------------------------------------ */
export function StackView({ width = 300 }) {
  const ribs = Array.from({ length: 24 }, (_, i) => 52 + i * 8);
  return (
    <svg
      viewBox="40 0 270 262"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cheminée blanche de hauteur hp devant un bâtiment à façade rouge"
      style={{ background: "#fff", display: "block", fontFamily: SANS }}
    >
      <defs>
        <linearGradient id="pSky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f86d2" />
          <stop offset="1" stopColor="#8fc4ee" />
        </linearGradient>
        <linearGradient id="pStack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9ced3" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#aeb4ba" />
        </linearGradient>
        <linearGradient id="pWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a63f30" />
          <stop offset="1" stopColor="#8a3126" />
        </linearGradient>
        <clipPath id="pClip1">
          <rect x="52" y="8" width="184" height="242" />
        </clipPath>
      </defs>

      <g clipPath="url(#pClip1)">
        {/* ciel */}
        <rect x="52" y="8" width="184" height="170" fill="url(#pSky1)" />
        <Cloud x={100} y={98} s={0.9} />
        <Cloud x={72} y={34} s={0.7} o={0.55} />
        <Cloud x={205} y={70} s={0.5} o={0.5} />

        {/* haut du bâtiment (bandeau beige) */}
        <rect x="52" y="150" width="184" height="24" fill="#d8b793" />
        <rect x="52" y="150" width="184" height="4" fill="#ead3b8" />

        {/* façade rouge nervurée */}
        <rect x="52" y="172" width="184" height="73" fill="url(#pWall)" />
        {ribs.map((x) => (
          <line key={x} x1={x} y1="172" x2={x} y2="245" stroke="#6f2a20" strokeWidth="1" opacity="0.55" />
        ))}

        {/* niche sombre derrière la cheminée + échelle */}
        <rect x="117" y="152" width="36" height="93" fill="#2d1a16" opacity="0.9" />
        <line x1="119" y1="160" x2="119" y2="245" stroke="#9a9a9a" strokeWidth="1" />
        <line x1="124" y1="160" x2="124" y2="245" stroke="#9a9a9a" strokeWidth="1" />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1="119" y1={166 + i * 6} x2="124" y2={166 + i * 6} stroke="#9a9a9a" strokeWidth="0.8" />
        ))}

        {/* sol */}
        <rect x="52" y="244" width="184" height="6" fill="#2f6a30" />

        {/* fût de la cheminée */}
        <rect x="126" y="14" width="18" height="232" fill="url(#pStack)" />
        <ellipse cx="135" cy="14" rx="9" ry="2.6" fill="#e6e9ec" />
        <line x1="135" y1="8" x2="135" y2="14" stroke="#9aa0a6" strokeWidth="1.2" />
        {/* anneaux / plateforme */}
        <ellipse cx="135" cy="118" rx="23" ry="4.5" fill="#d4d8dc" stroke="#8d949b" strokeWidth="0.8" />
        <ellipse cx="135" cy="115" rx="21" ry="3.5" fill="none" stroke="#8d949b" strokeWidth="0.8" />
        <line x1="115" y1="115" x2="115" y2="124" stroke="#8d949b" strokeWidth="0.8" />
        <line x1="155" y1="115" x2="155" y2="124" stroke="#8d949b" strokeWidth="0.8" />
        <rect x="124" y="136" width="22" height="3" fill="#cfd4d9" />
        <rect x="124" y="200" width="22" height="2.5" fill="#cfd4d9" opacity="0.8" />
        {/* embase */}
        <ellipse cx="135" cy="246" rx="25" ry="4.5" fill="#c58b64" />
        <rect x="112" y="241" width="46" height="5" fill="#b87a55" opacity="0.7" />
      </g>

      {/* cote hp */}
      <g stroke="#111" fill="none">
        <line x1="143" y1="17" x2="282" y2="17" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="123" y1="250" x2="282" y2="250" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="268" y1="250" x2="268" y2="30" strokeWidth="1.6" />
      </g>
      <polygon points="268,17 262,32 274,32" fill="#111" />
      <text x="274" y="143" fontSize="15" fontWeight="bold">
        hp
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Installation industrielle                                          */
/* ------------------------------------------------------------------ */
export function PlantView({ width = 370 }) {
  const mainWin = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!(c === 2 && r > 0)) mainWin.push([72 + c * 9 - (c > 1 ? 0 : 0), 432 + r * 14]);
  return (
    <svg
      viewBox="0 296 370 250"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Installation industrielle avec cheminée et panache de fumée"
      style={{ background: "#fff", display: "block", fontFamily: SANS }}
    >
      <defs>
        <linearGradient id="pSky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3796cc" />
          <stop offset="0.55" stopColor="#86c3dd" />
          <stop offset="1" stopColor="#cfe6e6" />
        </linearGradient>
        <linearGradient id="pBlock" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d90a4" />
          <stop offset="1" stopColor="#92a3b3" />
        </linearGradient>
        <clipPath id="pClip2">
          <rect x="0" y="298" width="370" height="245" />
        </clipPath>
      </defs>

      <g clipPath="url(#pClip2)">
        {/* ciel + nuages */}
        <rect x="0" y="298" width="370" height="245" fill="url(#pSky2)" />
        <Cloud x={62} y={332} s={1.9} />
        <Cloud x={20} y={372} s={0.9} o={0.75} />
        <Cloud x={190} y={338} s={0.6} o={0.8} />
        <Cloud x={330} y={369} s={0.9} o={0.85} />
        <Cloud x={272} y={420} s={1.7} o={0.9} />
        <Cloud x={25} y={420} s={0.9} o={0.7} />

        {/* sol */}
        <rect x="0" y="494" width="370" height="50" fill="#363a40" />
        <rect x="0" y="490" width="370" height="6" fill="#7b7f84" />
        <rect x="0" y="500" width="370" height="2" fill="#5a5e63" opacity="0.7" />

        {/* bâtiments bas à droite */}
        <rect x="218" y="470" width="112" height="22" fill="#6c7c8a" />
        <rect x="232" y="458" width="50" height="14" fill="#8797a5" />
        <ellipse cx="256" cy="458" rx="22" ry="3.5" fill="#cfd8de" />
        <rect x="300" y="476" width="40" height="16" fill="#5d6c79" />

        {/* petit bloc à gauche + structures de premier plan */}
        <rect x="32" y="450" width="40" height="42" fill="#76848f" />
        <rect x="0" y="478" width="30" height="16" fill="#4a5058" />
        <rect x="6" y="466" width="3" height="14" fill="#3f454c" />
        <rect x="16" y="470" width="3" height="10" fill="#3f454c" />

        {/* bloc principal */}
        <rect x="66" y="420" width="116" height="74" fill="url(#pBlock)" />
        <rect x="66" y="420" width="116" height="4" fill="#a9b8c6" />
        {/* partie centrale plus haute */}
        <rect x="146" y="408" width="36" height="86" fill="#8497a9" />
        <rect x="146" y="408" width="36" height="3" fill="#b3c1cd" />
        {/* tour */}
        <rect x="178" y="378" width="38" height="116" fill="#8c9dab" />
        <rect x="176" y="376" width="42" height="5" fill="#a9b8c4" />
        <rect x="178" y="381" width="38" height="3" fill="#6f8091" />
        <line x1="216" y1="381" x2="216" y2="494" stroke="#5d6e7d" strokeWidth="2" opacity="0.6" />

        {/* fenêtres du bloc principal */}
        {mainWin.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="7" height="9" fill="#b9c8d6" opacity="0.9" />
        ))}
        {/* panneau sombre central */}
        <rect x="110" y="440" width="26" height="46" fill="#4d5d6d" />
        <g stroke="#6c7e8f" strokeWidth="0.8">
          {[448, 456, 464, 472, 480].map((y) => (
            <line key={y} x1="110" y1={y} x2="136" y2={y} />
          ))}
          <line x1="123" y1="440" x2="123" y2="486" />
        </g>
        {/* fenêtres de la partie haute et de la tour */}
        {[428, 444, 460, 476].map((y) => (
          <rect key={y} x="152" y={y} width="9" height="8" fill="#b4c3d1" opacity="0.85" />
        ))}
        {[436, 452, 468, 484].map((y) => (
          <rect key={y} x="186" y={y} width="12" height="8" fill="#4a5967" />
        ))}
        {[392, 404, 416].map((y) => (
          <rect key={y} x="184" y={y} width="20" height="6" fill="#9db0bf" opacity="0.8" />
        ))}

        {/* cheminée + panache sombre */}
        <rect x="74" y="398" width="6" height="26" fill="#2b2b2e" />
        <path d="M72,336 L82,333 L84,368 L81,398 L74,398 Z" fill="#17171a" />
        <ellipse cx="80" cy="378" rx="6" ry="14" fill="#2a2a2e" opacity="0.9" />
        <ellipse cx="78" cy="400" rx="9" ry="8" fill="#e4e7ea" opacity="0.85" />
        <ellipse cx="84" cy="386" rx="7" ry="9" fill="#9a9ea4" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Composition d'origine : les deux vues l'une sous l'autre               */
/* ------------------------------------------------------------------ */
export default function PlantPhotos({ width = 370 }) {
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 40, background: "#fff" }}>
      <StackView width={width} />
      <PlantView width={width} />
    </div>
  );
}