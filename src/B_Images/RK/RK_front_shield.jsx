export default function RKFrontShield() {
  return (
    <svg
      viewBox="0 0 431 505"
      role="img"
      aria-label="Schéma technique avec conduits, réservoirs et raccords"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="reservoir" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#f1f2f2" />
        </linearGradient>
      </defs>

      <rect width="431" height="505" fill="#fff" />

      {/* Réservoir vertical principal */}
      <path
        d="M147 14H290V226H147Z"
        fill="url(#reservoir)"
        stroke="#a0a3a3"
        strokeWidth="2"
      />
      <path d="M150 17H287V222H150Z" fill="none" stroke="#ededed" />

      {/* Réservoir supérieur droit */}
      <path
        d="M295 14H381V123H295Z"
        fill="url(#reservoir)"
        stroke="#a0a3a3"
        strokeWidth="2"
      />

      {/* Grande boucle grise en arrière-plan */}
      <path
        d="M147 45C102 62 68 90 43 151V276C68 341 109 378 171 394C249 414 326 387 371 332C411 283 414 220 402 166C397 144 389 130 381 122"
        fill="none"
        stroke="#b7baba"
        strokeWidth="2"
      />

      {/* Branche verticale bleue à gauche */}
      <path d="M32 87H44V486H32Z" fill="#ecfaff" stroke="#55c8ed" strokeWidth="2" />
      <path d="M43 87H111V102H43Z" fill="#f1fbff" stroke="#55c8ed" strokeWidth="2" />
      <path d="M115 87H124Q130 87 130 95Q130 102 123 102H115Z" fill="#f1fbff" stroke="#55c8ed" strokeWidth="2" />

      {/* Ligne grise reliant les repères de gauche */}
      <path
        d="M72 102L44 151M111 150C130 151 144 176 148 211L155 271C160 318 200 353 200 420"
        fill="none"
        stroke="#b7baba"
        strokeWidth="2"
      />
      <path
        d="M91 166C126 165 143 204 147 239M92 263C103 297 111 339 100 367C94 383 79 390 72 394C64 399 64 408 68 421"
        fill="none"
        stroke="#b7baba"
        strokeWidth="2"
      />
      <path
        d="M118 243C144 254 152 286 151 327L147 420"
        fill="none"
        stroke="#b7baba"
        strokeWidth="2"
      />

      {/* Boucle et branche du raccord circulaire droit */}
      <circle cx="334" cy="189" r="27" fill="#fafafa" stroke="#b7baba" strokeWidth="2" />
      <circle cx="334" cy="189" r="9" fill="#fff" stroke="#b7baba" strokeWidth="2" />
      <path
        d="M334 189C342 223 368 248 391 280C402 296 398 326 388 353L369 392C363 405 367 420 371 431"
        fill="none"
        stroke="#b7baba"
        strokeWidth="2"
      />

      {/* Petits raccords circulaires à gauche */}
      <g fill="#fafafa" stroke="#b7baba" strokeWidth="2">
        <circle cx="90" cy="166" r="9" />
        <circle cx="113" cy="145" r="9" />
        <circle cx="116" cy="243" r="10" />
        <circle cx="92" cy="263" r="9" />
      </g>
      <circle cx="334" cy="189" r="4" fill="#fff" stroke="#b7baba" strokeWidth="1.5" />

      {/* Collecteur horizontal inférieur */}
      <path d="M29 447H406V464H29Z" fill="#f3f4f4" stroke="#a4a7a7" strokeWidth="2" />
      <path d="M33 450H402V461H33Z" fill="none" stroke="#ededed" />

      {/* Supports verticaux et embases */}
      <g stroke="#a4a7a7" strokeWidth="2" fill="none">
        <path d="M68 420V478M147 420V484M197 420V489M371 420V483" />
        <path d="M51 420H87M51 426H82M131 420H168M131 426H162M181 420H217M181 426H211M352 420H389M352 426H383" />
      </g>
      <g stroke="#b7baba" strokeWidth="1">
        <path d="M52 423H86M132 423H167M182 423H216M353 423H388" />
      </g>

      {/* Finitions des conduites et raccords */}
      <path d="M43 102H109" fill="none" stroke="#8fdcf2" strokeWidth="1.5" />
      <path d="M34 90V483" fill="none" stroke="#8fdcf2" strokeWidth="1.5" />
      <path d="M147 226H290" fill="none" stroke="#d0d2d2" strokeWidth="2" />
    </svg>
  );
}
