import React from "react";

/**
 * Schéma d'un four tournant (réacteur rotatif incliné) :
 *  - à gauche : coupe transversale (paroi, lit de solide, corde, angle de
 *    remplissage ω, rayon r, hauteur de lit h(z), angle β, rotation α) ;
 *  - à droite : coupe longitudinale inclinée d'un angle θ (phase gazeuse,
 *    lit de solide h(z), flux thermique Q̇, repères z = L et z = 0).
 * Toute la géométrie est calculée à partir de quelques paramètres.
 */

const D2R = Math.PI / 180;
const f = (v) => Number(v.toFixed(2));
const pt = (p) => `${f(p[0])},${f(p[1])}`;

const SERIF = "'Times New Roman', Times, serif";
const SANS = "Arial, Helvetica, sans-serif";

export default function KilnDiagram({
  width = 760,
  fillAngle = [115, 17], // angles (°, repère écran) des extrémités de la corde
  theta = 10, // inclinaison du four (°)
}) {
  /* ------------------------- Coupe transversale ------------------------- */
  const cx = 150,
    cy = 118,
    Ro = 105,
    Ri = 95;
  const polar = (r, deg, c = [cx, cy]) => [
    c[0] + r * Math.cos(deg * D2R),
    c[1] + r * Math.sin(deg * D2R),
  ];
  const [a1, a2] = fillAngle;
  const P1 = polar(Ri, a1);
  const P2 = polar(Ri, a2);
  const len = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
  const d = [(P2[0] - P1[0]) / len, (P2[1] - P1[1]) / len]; // direction de la corde
  const n = [-d[1], d[0]]; // normale (vers le bas)
  const beta = Math.atan2(-d[1], d[0]) / D2R; // inclinaison de la corde
  const distChord = (P1[0] - cx) * n[0] + (P1[1] - cy) * n[1];
  const hBed = Ri - distChord;
  const bedPath = `M${pt(P1)} A${Ri} ${Ri} 0 0 0 ${pt(P2)} Z`;

  // repère "sol" et angle β
  const yGround = 252;
  const tE = (yGround - P1[1]) / -d[1];
  const E = [P1[0] - tE * d[0], yGround];
  const betaArc = `M${pt([E[0] + 32, E[1]])} A32 32 0 0 0 ${pt([
    E[0] + 32 * Math.cos(beta * D2R),
    E[1] - 32 * Math.sin(beta * D2R),
  ])}`;
  const betaLbl = [
    E[0] + 47 * Math.cos((beta / 2) * D2R),
    E[1] - 47 * Math.sin((beta / 2) * D2R) + 4,
  ];

  // cote h(z) de la coupe
  const Q = [P1[0] - 25 * d[0], P1[1] - 25 * d[1]];
  const Q2 = [Q[0] + hBed * n[0], Q[1] + hBed * n[1]];
  const T = [cx + Ri * n[0], cy + Ri * n[1]];
  const tanStart = [Q2[0] - 18 * d[0], Q2[1] - 18 * d[1]];
  const tanEnd = [T[0] + 12 * d[0], T[1] + 12 * d[1]];

  // flèche de rotation α
  const rotR = Ro + 9;
  const rotA = polar(rotR, -68);
  const rotB = polar(rotR, -28);
  const rotTxt = polar(rotR + 17, -50);

  /* ------------------------ Coupe longitudinale ------------------------- */
  const O = [385, 150]; // coin bas-gauche (z = L)
  const Lc = 290; // longueur
  const Hc = 66; // diamètre apparent
  const ct = Math.cos(theta * D2R),
    st = Math.sin(theta * D2R);
  const tr = (x, y) => [O[0] + x * ct - y * st, O[1] + x * st + y * ct];
  const BR = tr(Lc, 0); // coin bas-droit (z = 0)
  const yDot = BR[1];
  const upX = 480;
  const upEdgeY = O[1] + ((upX - O[0]) / ct) * st;
  const hLab = tr(158, -37);
  const bedR = `M0,0 L0,-24 C80,-23 190,-17 245,-9 C270,-5 286,-3 ${Lc},0 Z`;

  return (
    <svg
      viewBox="0 0 760 285"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Four tournant : coupe transversale et coupe longitudinale avec phases gazeuse et solide"
      style={{ background: "#fff", display: "block", fontFamily: SANS }}
    >
      <defs>
        <marker
          id="kArrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#000" />
        </marker>
        <clipPath id="kBedClip">
          <path d={bedPath} />
        </clipPath>
      </defs>

      {/* ============ COUPE TRANSVERSALE ============ */}
      {/* paroi */}
      <circle cx={cx} cy={cy} r={Ro} fill="#7c7c7c" stroke="#000" strokeWidth="1.3" />
      <circle cx={cx} cy={cy} r={Ri} fill="#fff" stroke="#000" strokeWidth="1.1" />

      {/* lit de solide + arcs concentriques */}
      <path d={bedPath} fill="#d6d6d6" />
      <g clipPath="url(#kBedClip)" fill="none" stroke="#777" strokeWidth="0.9">
        {[7, 13, 19].map((k) => (
          <circle key={k} cx={cx} cy={cy} r={Ri - k} />
        ))}
      </g>
      <path d={bedPath} fill="none" stroke="#000" strokeWidth="1" />

      {/* repères : horizontale, rayons, ω */}
      <line x1={cx} y1={cy} x2={cx + Ri} y2={cy} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <line x1={cx} y1={cy} x2={P1[0]} y2={P1[1]} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <line x1={cx} y1={cy} x2={P2[0]} y2={P2[1]} stroke="#000" strokeWidth="1.1" markerEnd="url(#kArrow)" />
      <circle cx={cx} cy={cy} r="2" fill="#000" />
      <path
        d={`M${pt(polar(26, a1))} A26 26 0 0 0 ${pt(polar(26, a2))}`}
        fill="none"
        stroke="#000"
        strokeWidth="0.9"
      />
      <text x={polar(40, (a1 + a2) / 2)[0] - 5} y={polar(40, (a1 + a2) / 2)[1] + 4} fontFamily={SERIF} fontStyle="italic" fontSize="14">
        ω
      </text>
      <text x={polar(52, a2 + 7)[0]} y={polar(52, a2 + 7)[1] - 2} fontFamily={SERIF} fontStyle="italic" fontSize="14">
        r
      </text>

      {/* corde (surface libre du lit) */}
      <line
        x1={P1[0] - 18 * d[0]}
        y1={P1[1] - 18 * d[1]}
        x2={P2[0] + 18 * d[0]}
        y2={P2[1] + 18 * d[1]}
        stroke="#000"
        strokeWidth="1"
        strokeDasharray="6 3"
      />

      {/* prolongement de la corde jusqu'au sol, angle β */}
      <line x1={E[0]} y1={E[1]} x2={P1[0]} y2={P1[1]} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <line x1="0" y1={yGround} x2="108" y2={yGround} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <path d={betaArc} fill="none" stroke="#000" strokeWidth="0.9" />
      <text x={betaLbl[0]} y={betaLbl[1]} fontFamily={SERIF} fontStyle="italic" fontSize="14" textAnchor="middle">
        β
      </text>

      {/* cote h(z) */}
      <line x1={tanStart[0]} y1={tanStart[1]} x2={tanEnd[0]} y2={tanEnd[1]} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <line
        x1={Q[0]}
        y1={Q[1]}
        x2={Q2[0]}
        y2={Q2[1]}
        stroke="#000"
        strokeWidth="1.1"
        markerStart="url(#kArrow)"
        markerEnd="url(#kArrow)"
      />
      <text x={Q2[0] - 8} y={Q2[1] - 2} textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="13">
        h(z)
      </text>

      {/* rotation α */}
      <path
        d={`M${pt(rotA)} A${rotR} ${rotR} 0 0 1 ${pt(rotB)}`}
        fill="none"
        stroke="#000"
        strokeWidth="1.3"
        markerEnd="url(#kArrow)"
      />
      <text
        transform={`translate(${f(rotTxt[0])} ${f(rotTxt[1])}) rotate(40)`}
        textAnchor="middle"
        fontSize="11"
        fontFamily={SANS}
      >
        Rotation α
      </text>

      {/* ============ COUPE LONGITUDINALE ============ */}
      <g transform={`translate(${O[0]} ${O[1]}) rotate(${theta})`}>
        <rect x="0" y={-Hc} width={Lc} height={Hc} fill="#fff" stroke="#000" strokeWidth="1.3" />
        <path d={bedR} fill="#d6d6d6" stroke="#000" strokeWidth="1" />
        {/* axe du four */}
        <line x1="-14" y1="-33" x2={Lc + 14} y2="-33" stroke="#000" strokeWidth="0.9" strokeDasharray="10 3 2 3" />
        {/* cote h(z) */}
        <line x1="150" y1="-33" x2="150" y2="-19.5" stroke="#000" strokeWidth="1.1" markerEnd="url(#kArrow)" />
      </g>
      <text x={hLab[0]} y={hLab[1]} fontFamily={SERIF} fontStyle="italic" fontSize="13">
        h(z)
      </text>

      {/* flux thermique Q̇ */}
      <polygon points="345,134.5 368,134.5 368,129.5 384,138 368,146.5 368,141.5 345,141.5" fill="#000" />
      <circle cx="318.3" cy="119" r="1.2" fill="#000" />
      <text x="312" y="130" fontFamily={SERIF} fontStyle="italic" fontSize="14">
        Q
        <tspan fontSize="9" dy="-6">
          B
        </tspan>
        <tspan fontSize="9" dx="-6" dy="11">
          i
        </tspan>
      </text>

      {/* repères z */}
      <text x="337" y="172" fontFamily={SERIF} fontStyle="italic" fontSize="13">
        z = L
      </text>
      <text x={BR[0] - 14} y={BR[1] + 24} fontFamily={SERIF} fontStyle="italic" fontSize="13">
        z = 0
      </text>
      <line x1="360" y1={yDot} x2={BR[0]} y2={yDot} stroke="#000" strokeWidth="0.8" strokeDasharray="1.5 3" />
      <line x1={upX} y1={yDot} x2={upX} y2={upEdgeY + 1} stroke="#000" strokeWidth="1.1" markerEnd="url(#kArrow)" />
      <path
        d={`M${pt([BR[0] - 72, yDot])} A72 72 0 0 1 ${pt([BR[0] - 72 * ct, BR[1] - 72 * st])}`}
        fill="none"
        stroke="#000"
        strokeWidth="0.9"
      />
      <text x={BR[0] - 98} y={yDot + 17} fontFamily={SERIF} fontStyle="italic" fontSize="14">
        θ
      </text>
      {/* axe z */}
      <line x1="700" y1="146" x2="700" y2="66" stroke="#000" strokeWidth="1.1" markerEnd="url(#kArrow)" />

      {/* ============ LÉGENDES ============ */}
      <g fontSize="12" textAnchor="middle" fill="#000">
        <text x="330" y="13">Phase</text>
        <text x="330" y="26">gazeuse</text>
        <text x="330" y="263">Phase</text>
        <text x="330" y="276">solide</text>
      </g>
      <g stroke="#000" strokeWidth="0.8" fill="none">
        <line x1="306" y1="22" x2="175" y2="68" />
        <line x1="354" y1="22" x2="520" y2="112" />
        <line x1="306" y1="258" x2="205" y2="181" />
        <line x1="354" y1="258" x2={f(tr(140, -8)[0])} y2={f(tr(140, -8)[1])} />
      </g>
    </svg>
  );
}