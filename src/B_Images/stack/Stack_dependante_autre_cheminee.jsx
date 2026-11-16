import React from "react";

/**
 * Illustration vectorielle d'un site industriel : trois cheminées rouge et
 * blanc, un mât en treillis à haubans, des panaches de vapeur et les
 * installations au sol, sur ciel bleu profond.
 * viewBox 311 x 348 — redimensionnable via la prop `width`.
 */

const RED = "#c8202b";
const WHITE = "#f1f1ee";
const CAP = "#3a3e48";
const CONCRETE = "#6f6558";

/* Fût de cheminée : liste de bandes [y0, y1, couleur] + ombrage latéral */
function Stack({ id, x, w, top, bottom, bands, concreteFrom }) {
  return (
    <g>
      <rect x={x} y={top} width={w} height={bottom - top} fill={CONCRETE} />
      {bands.map(([y0, y1, c], i) => (
        <rect key={i} x={x} y={y0} width={w} height={y1 - y0} fill={c} />
      ))}
      {/* couronnement */}
      <rect x={x - 1.5} y={top} width={w + 3} height="5" fill={CAP} />
      {/* plateformes */}
      <rect x={x - 1} y={concreteFrom - 1} width={w + 2} height="2" fill="#4a4a4a" opacity="0.6" />
      {/* ombrage cylindrique */}
      <rect x={x} y={top} width={w} height={bottom - top} fill={`url(#${id})`} />
    </g>
  );
}

function ShadeGradient({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
      <stop offset="0.45" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.42" />
    </linearGradient>
  );
}

/* Panache : amas de disques blancs avec dessous bleuté */
function Plume({ puffs }) {
  return (
    <g>
      {puffs.map(([x, y, r], i) => (
        <circle key={`s${i}`} cx={x + 1.5} cy={y + 2.5} r={r} fill="#aebfe0" opacity="0.8" />
      ))}
      {puffs.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#f6f8fc" opacity="0.96" />
      ))}
    </g>
  );
}

/* Mât en treillis, bandes rouge/blanc dans sa partie haute */
function Mast() {
  const xL = (y) => 268 - (6 * y) / 345; // montant gauche
  const xR = (y) => 288 - (10 * y) / 345; // montant droit
  const bands = [
    [4, 30, RED],
    [30, 62, WHITE],
    [62, 88, RED],
    [88, 122, WHITE],
    [122, 150, RED],
    [150, 190, WHITE],
  ];
  const diag = [];
  for (let y = 0, k = 0; y < 340; y += 13, k++) {
    const y2 = y + 13;
    const a = k % 2 ? [xR(y), y] : [xL(y), y];
    const b = k % 2 ? [xL(y2), y2] : [xR(y2), y2];
    diag.push(
      <line key={y} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#23262d" strokeWidth="1.1" />
    );
  }
  return (
    <g>
      {bands.map(([y0, y1, c], i) => (
        <polygon
          key={i}
          points={`${xL(y0)},${y0} ${xR(y0)},${y0} ${xR(y1)},${y1} ${xL(y1)},${y1}`}
          fill={c}
          opacity="0.95"
        />
      ))}
      {diag}
      <line x1={xL(0)} y1="0" x2={xL(345)} y2="345" stroke="#1d2026" strokeWidth="1.8" />
      <line x1={xR(0)} y1="0" x2={xR(345)} y2="345" stroke="#1d2026" strokeWidth="1.8" />
      {/* feu de balisage / tête */}
      <rect x="272" y="0" width="12" height="5" fill="#22252b" />
    </g>
  );
}

export default function StripedStacks({ width = 311 }) {
  return (
    <svg
      viewBox="0 0 311 348"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cheminées rouge et blanc et mât en treillis sur un site industriel, panaches de vapeur"
      style={{ background: "#1c3f9c", display: "block" }}
    >
      <defs>
        <linearGradient id="ssSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#173a96" />
          <stop offset="0.6" stopColor="#2a52b4" />
          <stop offset="1" stopColor="#4a78cf" />
        </linearGradient>
        <ShadeGradient id="ssShade" />
        <clipPath id="ssClip">
          <rect x="0" y="0" width="311" height="348" />
        </clipPath>
      </defs>

      <g clipPath="url(#ssClip)">
        {/* ciel */}
        <rect width="311" height="348" fill="url(#ssSky)" />

        {/* haubans */}
        <g stroke="#7f95c9" strokeWidth="0.8" opacity="0.8" fill="none">
          <line x1="268" y1="30" x2="125" y2="262" />
          <line x1="271" y1="60" x2="180" y2="262" />
          <line x1="288" y1="40" x2="311" y2="150" />
          <line x1="287" y1="90" x2="311" y2="200" />
        </g>

        {/* installations au sol (arrière-plan) */}
        <g>
          {/* petite cheminée à gauche */}
          <rect x="0" y="258" width="9" height="46" fill="#3a3f48" />
          <rect x="0" y="256" width="9" height="4" fill="#9aa1ad" />
          {/* colonnes et réservoirs */}
          <rect x="116" y="272" width="20" height="64" fill="#6c7b78" />
          <rect x="116" y="272" width="20" height="6" fill="#8b9a96" />
          <circle cx="126" cy="302" r="9" fill="#c9b27a" />
          <rect x="108" y="300" width="6" height="36" fill="#2b3340" />
          <rect x="138" y="296" width="10" height="40" fill="#46516a" />
          <rect x="191" y="262" width="9" height="74" fill="#cfd6d6" />
          <rect x="191" y="262" width="9" height="74" fill="url(#ssShade)" />
          <rect x="180" y="300" width="7" height="34" fill="#bfc7c7" />
          <rect x="203" y="310" width="5" height="26" fill="#8f97a1" />
          {/* tuyauteries */}
          <g stroke="#202a42" strokeWidth="1.6">
            <line x1="10" y1="312" x2="116" y2="312" />
            <line x1="10" y1="322" x2="116" y2="322" />
            <line x1="60" y1="300" x2="60" y2="340" />
            <line x1="90" y1="304" x2="90" y2="340" />
          </g>
        </g>

        {/* cheminées rayées */}
        <Stack
          id="ssShade"
          x={155}
          w={22}
          top={200}
          bottom={318}
          concreteFrom={296}
          bands={[
            [205, 218, RED],
            [218, 242, WHITE],
            [242, 256, RED],
            [256, 272, WHITE],
            [272, 296, RED],
          ]}
        />
        <Stack
          id="ssShade"
          x={205}
          w={27}
          top={162}
          bottom={338}
          concreteFrom={282}
          bands={[
            [167, 195, WHITE],
            [195, 212, RED],
            [212, 255, WHITE],
            [255, 282, RED],
          ]}
        />
        <Stack
          id="ssShade"
          x={232}
          w={20}
          top={184}
          bottom={340}
          concreteFrom={292}
          bands={[
            [189, 202, RED],
            [202, 228, WHITE],
            [228, 244, RED],
            [244, 266, WHITE],
            [266, 292, RED],
          ]}
        />

        {/* mât en treillis */}
        <Mast />

        {/* panaches de vapeur */}
        <Plume
          puffs={[
            [12, 257, 8],
            [28, 254, 10],
            [44, 251, 11],
            [60, 253, 9],
            [76, 249, 13],
            [92, 253, 11],
            [108, 257, 12],
            [126, 262, 14],
            [142, 258, 13],
            [158, 260, 11],
            [176, 247, 11],
            [188, 243, 13],
          ]}
        />
        <Plume
          puffs={[
            [238, 214, 6],
            [243, 232, 8],
            [239, 246, 6],
          ]}
        />
        <Plume
          puffs={[
            [286, 250, 9],
            [296, 243, 11],
            [305, 237, 11],
            [301, 255, 9],
          ]}
        />

        {/* avant-plan : silhouette sombre + toit clair */}
        <polygon points="0,312 60,306 62,348 0,348" fill="#101a2e" />
        <g stroke="#56668a" strokeWidth="1">
          <line x1="4" y1="320" x2="58" y2="320" />
          <line x1="12" y1="308" x2="12" y2="346" />
          <line x1="34" y1="310" x2="34" y2="346" />
        </g>
        <polygon points="106,348 134,336 236,336 242,348" fill="#bfe3ee" />
        <polygon points="134,336 236,336 238,339 132,339" fill="#e6f4f8" />
      </g>
    </svg>
  );
}
