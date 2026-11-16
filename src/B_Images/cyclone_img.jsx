import React from "react";

/**
 * Schéma d'un cyclone dépoussiéreur (perspective cavalière) avec ses cotes :
 *   a, b  : hauteur et largeur de l'entrée tangentielle (« Gaz chargé »),
 *   d     : diamètre du tube de sortie, h : hauteur d'immersion de ce tube,
 *   D     : diamètre du corps, H' : hauteur cylindrique, H : hauteur conique,
 *   Ds    : diamètre de la sortie des poussières.
 *
 * Toutes les coordonnées sont celles de l'image d'origine (256 x 300 px).
 */

const K = "#111";
const FONT = "Arial, Helvetica, sans-serif";
const CHAIN = "8 2.5 2 2.5"; // trait mixte (axes, lignes de cote)

/* Pointe de flèche pleine : pointe en (x, y), orientée selon `ang` (rad) */
function Tip({ x, y, ang, s = 6.5 }) {
  const o = 0.36;
  const p1 = [x - s * Math.cos(ang - o), y - s * Math.sin(ang - o)];
  const p2 = [x - s * Math.cos(ang + o), y - s * Math.sin(ang + o)];
  return (
    <polygon
      points={`${x},${y} ${p1[0].toFixed(2)},${p1[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`}
      fill={K}
    />
  );
}

/* Cote à une ou deux pointes */
function Dim({ x1, y1, x2, y2, w = 1.2, s = 6.5, both = true }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K} strokeWidth={w} />
      <Tip x={x2} y={y2} ang={a} s={s} />
      {both && <Tip x={x1} y={y1} ang={a + Math.PI} s={s} />}
    </g>
  );
}

export default function CycloneDiagram({ width = 256 }) {
  /* ---------------- géométrie (px de l'image d'origine) ---------------- */
  // corps cylindrique
  const cx = 165;
  const rx = 42.5;
  const rimY = 55; // centre du couvercle
  const rimRy = 20;
  const botY = 143.5; // centre de l'ellipse inférieure
  const botRy = 21;
  const xL = cx - rx; // 122.5
  const xR = cx + rx; // 207.5

  // tube de sortie
  const tx = 166;
  const tRx = 20;
  const tTopY = 19;
  const tTopRy = 8;
  const tMidY = 58;
  const tMidRy = 9;
  const tLowY = 92;
  const tLowRy = 10;

  // sortie des poussières
  const ox = 167;
  const oRx = 11;
  const oY = 253;
  const oRy = 6;
  const oBot = 267;

  // point de tangence de l'entrée sur le couvercle, jonction avec la paroi
  const T = [136, 40.5];
  const B1 = [125, 62];

  return (
    <svg
      viewBox="0 0 256 300"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cyclone : corps cylindrique, cône, entrée tangentielle a × b, tube de sortie d, cotes h, H', H, D et Ds, sortie des poussières"
      style={{ background: "#fff", display: "block", fontFamily: FONT }}
    >
      {/* ================= CORPS ================= */}
      <g stroke={K} strokeWidth="1.5" strokeLinecap="round" fill="none">
        {/* parois */}
        <line x1={xL} y1={rimY} x2={xL} y2={botY} />
        <line x1={xR} y1={rimY} x2={xR} y2={botY} />

        {/* couvercle : arc gauche + arc avant pleins, arc arrière en trait mixte */}
        <path d={`M${T[0]},${T[1]} A${rx} ${rimRy} 0 0 0 ${B1[0]},${B1[1]}`} />
        <path d={`M${B1[0]},${B1[1]} A${rx} ${rimRy} 0 0 0 ${xR},${rimY}`} />
        <path d={`M${xR},${rimY} A${rx} ${rimRy} 0 0 0 ${T[0]},${T[1]}`} strokeDasharray={CHAIN} />

        {/* ellipse inférieure : arc avant plein, arc arrière en tirets */}
        <path d={`M${xL},${botY} A${rx} ${botRy} 0 0 0 ${xR},${botY}`} />
        <path d={`M${xL},${botY} A${rx} ${botRy} 0 0 1 ${xR},${botY}`} strokeDasharray="6 3.5" strokeWidth="1.2" />

        {/* cône */}
        <line x1={xL} y1={botY} x2={ox - oRx} y2={oY - 2} />
        <line x1={xR} y1={botY} x2={ox + oRx} y2={oY - 3} />
      </g>

      {/* ================= ENTRÉE TANGENTIELLE ================= */}
      <g stroke={K} strokeWidth="1.5" strokeLinejoin="round" fill="#fff">
        {/* face supérieure (se raccorde tangentiellement au couvercle) */}
        <path d={`M75,71 L90,77.5 L${B1[0]},${B1[1]} A${rx} ${rimRy} 0 0 1 ${T[0]},${T[1]} Z`} />
        {/* grande face latérale */}
        <polygon points={`90,77.5 ${B1[0]},${B1[1]} 125,94 90,109`} />
        {/* face d'entrée (ouverture) */}
        <polygon points="75,71 90,77.5 90,109 75,100" />
      </g>

      {/* ================= TUBE DE SORTIE ================= */}
      {/* masque blanc : cache l'arc arrière du couvercle derrière le tube */}
      <path
        d={`M${tx - tRx},${tTopY} V${tMidY} A${tRx} ${tMidRy} 0 0 0 ${tx + tRx},${tMidY} V${tTopY} Z`}
        fill="#fff"
      />
      <g stroke={K} strokeWidth="1.5" fill="none">
        {/* partie hors du cyclone */}
        <ellipse cx={tx} cy={tTopY} rx={tRx} ry={tTopRy} />
        <line x1={tx - tRx} y1={tTopY} x2={tx - tRx} y2={tMidY} />
        <line x1={tx + tRx} y1={tTopY} x2={tx + tRx} y2={tMidY} />
        <ellipse cx={tx} cy={tMidY} rx={tRx} ry={tMidRy} />
      </g>
      {/* partie immergée : traits cachés */}
      <g stroke={K} strokeWidth="1.2" fill="none">
        <line x1={tx - tRx} y1={tMidY} x2={tx - tRx} y2={tLowY} strokeDasharray="2 3" />
        <line x1={tx + tRx} y1={tMidY} x2={tx + tRx} y2={tLowY} strokeDasharray="2 3" />
        <ellipse cx={tx} cy={tLowY} rx={tRx} ry={tLowRy} strokeDasharray="4 3" />
      </g>
      {/* sortie du gaz épuré */}
      <Dim x1="165" y1="12" x2="165" y2="1.5" s={5} both={false} />

      {/* ================= SORTIE DES POUSSIÈRES ================= */}
      <g stroke={K} strokeWidth="1.5" fill="#fff">
        <path d={`M${ox - oRx},${oY} V${oBot} A${oRx} ${oRy} 0 0 0 ${ox + oRx},${oBot} V${oY}`} />
        <ellipse cx={ox} cy={oY} rx={oRx} ry={oRy} />
      </g>

      {/* ================= LIGNES DE COTE (traits mixtes) ================= */}
      <g stroke={K} strokeWidth="1.2" fill="none">
        <line x1="165" y1={rimY + 2} x2="232" y2="87" strokeDasharray={CHAIN} />
        <line x1="165" y1={botY + 2} x2="225" y2="171" strokeDasharray={CHAIN} />
        <line x1="181" y1="99" x2="198" y2="106" />
        <line x1={ox} y1={oY} x2="231" y2="281" strokeDasharray={CHAIN} />
        <line x1="154" y1="251" x2="179" y2="262" strokeDasharray={CHAIN} />
      </g>

      {/* ================= COTES ================= */}
      {/* h : hauteur d'immersion du tube */}
      <Dim x1="197.5" y1="71" x2="197.5" y2="105" />
      <text x="187" y="90" fontSize="13">
        h
      </text>
      {/* d : diamètre du tube */}
      <Dim x1="150" y1="85" x2="179.5" y2="99.5" s={6} />
      <text x="166" y="92" fontSize="13">
        d
      </text>
      {/* H' : hauteur du corps */}
      <Dim x1="224.5" y1="84" x2="224.5" y2="171" />
      <text x="229" y="128" fontSize="13">
        H'
      </text>
      {/* H : hauteur du cône */}
      <Dim x1="231" y1="174" x2="231" y2="281" />
      <text x="242" y="181" fontSize="13">
        H
      </text>
      {/* D : diamètre du corps */}
      <Dim x1="139" y1="159" x2="194" y2="129" w="1.8" s={7.5} />
      <text x="158" y="141" fontSize="14">
        D
      </text>
      {/* a, b : section de l'entrée */}
      <Dim x1="99" y1="76" x2="99" y2="101" />
      <text x="103" y="90" fontSize="13">
        a
      </text>
      <Dim x1="75" y1="111" x2="92" y2="119" s={6} both={false} w="1.4" />
      <text x="79" y="128" fontSize="13">
        b
      </text>
      {/* Ds : diamètre de la sortie */}
      <Dim x1="141" y1="279" x2="154" y2="271" s={6} both={false} w="1.4" />
      <text x="124" y="275" fontSize="13">
        D
        <tspan fontSize="9" dy="3">
          s
        </tspan>
      </text>

      {/* gaz chargé */}
      <line x1="52" y1="102" x2="68" y2="95.5" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
      <Tip x={74} y={93} ang={Math.atan2(-9, 22)} s={9} />
      <text x="1" y="88" fontSize="13">
        Gaz chargé
      </text>

      {/* poussières */}
      <line x1="165" y1="274" x2="165" y2="283" stroke={K} strokeWidth="2.4" />
      <Tip x={165} y={288} ang={Math.PI / 2} s={8} />
      <text x="154" y="298" fontSize="13">
        Poussières
      </text>
    </svg>
  );
}