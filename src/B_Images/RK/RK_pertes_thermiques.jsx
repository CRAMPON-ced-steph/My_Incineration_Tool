export default function SchemaHorizontal() {
  return (
    <svg
      viewBox="0 0 807 310"
      role="img"
      aria-label="Schéma horizontal d’un conduit avec trois repères"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="corpsGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ed1010" />
          <stop offset="55%" stopColor="#ff4b00" />
          <stop offset="100%" stopColor="#e8ed00" />
        </linearGradient>
        <filter id="ombre" x="-10%" y="-20%" width="120%" height="145%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="807" height="310" fill="#fff" />

      {/* Conduit horizontal */}
      <path
        d="M183 85H532Q571 85 595 116Q620 148 620 194Q620 240 595 272Q571 302 532 302H183Z"
        fill="url(#corpsGradient)"
        stroke="#9b9690"
        strokeWidth="2"
        filter="url(#ombre)"
      />

      {/* Raccord circulaire à gauche */}
      <path
        d="M184 85C136 85 101 131 101 194C101 257 136 302 184 302C233 302 273 257 273 194C273 131 233 85 184 85Z"
        fill="#e81313"
        stroke="#99938f"
        strokeWidth="2"
      />
      <path
        d="M184 108C148 108 122 145 122 194C122 243 148 279 184 279C220 279 247 243 247 194C247 145 220 108 184 108Z"
        fill="#fff"
        stroke="#aaa5a0"
        strokeWidth="2"
      />

      {/* Flèche bleue entrante */}
      <path d="M44 103H94V94L110 110L94 126V117H44Z" fill="#4389c9" stroke="#416d99" strokeWidth="2" />

      {/* Conduit bleu cintré sur le dessus */}
      <path
        d="M147 85C147 50 200 22 261 22C307 22 337 32 359 48L367 49V85L333 55C313 46 291 41 261 41C210 41 166 59 166 85Z"
        fill="#4389c9"
        stroke="#416d99"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Repères rectangulaires */}
      {[287, 386, 514].map((x, index) => (
        <g key={x}>
          <rect x={x} y="163" width="71" height="36" fill="#fff" stroke="#383838" strokeWidth="2" />
          <text x={x + 13} y="182" fontFamily="Arial, sans-serif" fontSize="12" fill="#555">
            T{index + 1}
          </text>
        </g>
      ))}

      {/* Élément rouge en forme de flèche sur le dessus à droite */}
      <path
        d="M506 149L564 82L609 70L597 82L652 60L639 75L709 50L606 112L615 98L557 130L574 111Z"
        fill="#c65350"
        stroke="#91504e"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Annotations */}
      <text x="411" y="52" fontFamily="Georgia, serif" fontSize="22" fontStyle="italic" fill="#344452">
        φ conv
      </text>
      <text x="731" y="64" fontFamily="Georgia, serif" fontSize="22" fontStyle="italic" fill="#344452">
        φ ray
      </text>
    </svg>
  );
}
