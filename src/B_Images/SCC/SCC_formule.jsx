import React from "react";

const serif = { fontFamily: "'Times New Roman', Times, serif" };
const it = { fontStyle: "italic" };

const Sub = ({ children }) => (
  <sub style={{ fontSize: "0.7em", lineHeight: 0 }}>{children}</sub>
);
const Sup = ({ children }) => (
  <sup style={{ fontSize: "0.7em", lineHeight: 0 }}>{children}</sup>
);
const V = ({ children }) => <span style={it}>{children}</span>;

/* Racine carrée avec barre */
const Sqrt = ({ children }) => (
  <span style={{ whiteSpace: "nowrap" }}>
    <span style={{ fontSize: "1.25em", verticalAlign: "-0.05em" }}>√</span>
    <span style={{ borderTop: "1px solid #000", paddingTop: 1 }}>
      {children}
    </span>
  </span>
);

/* Fraction */
const Frac = ({ num, den }) => (
  <span
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      verticalAlign: "middle",
      margin: "0 4px",
    }}
  >
    <span style={{ padding: "0 4px 3px" }}>{num}</span>
    <span style={{ borderTop: "1px solid #000", padding: "3px 4px 0" }}>
      {den}
    </span>
  </span>
);

function Figure() {
  return (
    <svg
      width="190"
      height="215"
      viewBox="0 0 190 215"
      xmlns="http://www.w3.org/2000/svg"
      style={serif}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#000" />
        </marker>
      </defs>

      {/* Disque supérieur A1 */}
      <ellipse
        cx="85"
        cy="35"
        rx="55"
        ry="24"
        fill="#fff"
        stroke="#000"
        strokeWidth="1.2"
      />
      <ellipse
        cx="85"
        cy="35"
        rx="50"
        ry="20"
        fill="none"
        stroke="#000"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <text x="28" y="40" fontSize="15" fontStyle="italic">
        A
      </text>
      <text x="38" y="44" fontSize="10">
        1
      </text>
      <line
        x1="85"
        y1="35"
        x2="128"
        y2="22"
        stroke="#000"
        strokeWidth="1.2"
        markerEnd="url(#arrow)"
      />
      <text x="104" y="40" fontSize="14" fontStyle="italic">
        b
      </text>

      {/* Normale commune en pointillés */}
      <line
        x1="85"
        y1="59"
        x2="85"
        y2="130"
        stroke="#000"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x="92" y="95" fontSize="14" fontStyle="italic">
        a
      </text>

      {/* Disque inférieur A2 */}
      <ellipse
        cx="85"
        cy="158"
        rx="72"
        ry="30"
        fill="#e9e9e9"
        stroke="#000"
        strokeWidth="1.2"
      />
      <ellipse
        cx="85"
        cy="158"
        rx="66"
        ry="26"
        fill="none"
        stroke="#000"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <text x="18" y="164" fontSize="15" fontStyle="italic">
        A
      </text>
      <text x="28" y="168" fontSize="10">
        2
      </text>
      <line
        x1="85"
        y1="158"
        x2="140"
        y2="142"
        stroke="#000"
        strokeWidth="1.2"
        markerEnd="url(#arrow)"
      />
      <text x="108" y="166" fontSize="14" fontStyle="italic">
        c
      </text>
    </svg>
  );
}

export default function ViewFactorFigure() {
  return (
    <div
      style={{
        ...serif,
        display: "flex",
        alignItems: "flex-start",
        gap: 40,
        padding: 24,
        background: "#fff",
        color: "#000",
        fontSize: 17,
      }}
    >
      {/* Colonne gauche : figure + légende */}
      <div style={{ width: 200 }}>
        <Figure />
        <div style={{ fontSize: 14, lineHeight: 1.3, marginTop: 6 }}>
          Plane circular surfaces with
          <br />
          &nbsp;&nbsp;a common central normal
        </div>
      </div>

      {/* Colonne droite : formule */}
      <div style={{ paddingTop: 70 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>
            <V>F</V>
            <Sub>
              <V>A</V>
              <sub>1</sub> - <V>A</V>
              <sub>2</sub>
            </Sub>
          </span>
          <span style={{ margin: "0 8px" }}>=</span>
          <Frac
            num={
              <>
                1 + <V>B</V>
                <Sup>2</Sup> + <V>C</V>
                <Sup>2</Sup> −{" "}
                <Sqrt>
                  (1 + <V>B</V>
                  <Sup>2</Sup> + <V>C</V>
                  <Sup>2</Sup>)<Sup>2</Sup> − 4<V>B</V>
                  <Sup>2</Sup>
                  <V>C</V>
                  <Sup>2</Sup>
                </Sqrt>
              </>
            }
            den={
              <>
                2<V>B</V>
                <Sup>2</Sup>
              </>
            }
          />
        </div>

        <div style={{ marginTop: 26, fontSize: 14 }}>
          where <V>B</V> = <V>b</V>/<V>a</V> and <V>C</V> = <V>c</V>/<V>a</V>.
        </div>
      </div>
    </div>
  );
}