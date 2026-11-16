export default function Schema() {
  return (
    <svg
      viewBox="0 0 336 568"
      role="img"
      aria-label="Schéma technique vertical"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f58218" />
          <stop offset="68%" stopColor="#f58218" />
          <stop offset="100%" stopColor="#fff000" />
        </linearGradient>
        <linearGradient id="yellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e900" />
          <stop offset="100%" stopColor="#fff000" />
        </linearGradient>
        <pattern id="texture" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M1 1h1M4 3h1M2 5h1" stroke="#c5c8c8" strokeWidth="0.7" />
        </pattern>
      </defs>

      <rect width="336" height="568" fill="#fff" />

      {/* Enveloppe verticale */}
      <path
        d="M135 14H295V27H276V489H249V456L260 435V316L216 288Q211 284 215 274L265 143V26H157V306L165 316V327H136Z"
        fill="#f3f3f1"
        stroke="#555b5e"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M141 24H156V306L164 316V489H141Z" fill="url(#texture)" />
      <path d="M276 26H294V489H263V317L236 282Q233 278 237 269L276 166Z" fill="url(#texture)" />

      {/* Colonne orange et jaune */}
      <path
        d="M157 25H265V143L215 274Q211 284 216 288L260 316V435L249 456V494H219V463L210 449H193L184 463V494H157V418H165V327H157Z"
        fill="url(#orange)"
        stroke="#8a8a82"
        strokeWidth="1.5"
      />
      <path d="M157 304H165V327H157Z" fill="url(#yellow)" />

      {/* Ouverture inclinée et sortie */}
      <path d="M266 143L296 211V27H266Z" fill="#f58218" stroke="#777" strokeWidth="1.3" />
      <path
        d="M267 166V299L242 281Q233 277 237 267Z"
        fill="#fff"
        stroke="#b8b8b8"
        strokeWidth="1.5"
      />

      {/* Bloc inférieur gauche */}
      <path d="M41 317H135V406H41Z" fill="url(#orange)" stroke="#999" strokeWidth="2" />
      <path d="M135 327L165 327V403H129Z" fill="url(#yellow)" stroke="#8d8d82" strokeWidth="2" />
      <path d="M41 406H164V416H41Z" fill="#b0b5b5" stroke="#777" strokeWidth="1.5" />
      <path d="M47 416H119V457H41V425H47Z" fill="#aeb4b4" stroke="#666" strokeWidth="2" />
      <path d="M50 421H85V447H50Z" fill="#fff" />
      <path d="M88 421H96V447H88ZM100 421H107V447H100Z" fill="#d2d5d4" stroke="#858a8a" />
      <path d="M42 450H119V458H42Z" fill="#888f90" stroke="#565b5c" />

      {/* Petits détails mécaniques */}
      <path d="M85 402L105 396L108 402L91 407Z" fill="#424c52" />
      <path d="M96 458H109V539H97Z" fill="#464d50" stroke="#313638" />
      <path d="M101 463H108V535H101Z" fill="#262b2e" />
      <path d="M132 416H158V423H132Z" fill="#d2d7d7" stroke="#777" />
      <path d="M135 423V535H141V423Z" fill="#e8e9e8" stroke="#9a9e9d" />
      <path d="M157 423H166V493H157Z" fill="url(#yellow)" />
      <path d="M167 429l3 5-3 5-2-5zM170 444l3 5-3 5-2-5z" fill="#ef8a19" />

      {/* Raccords bleus fixes, sans polygones superposés à la ligne */}
      <g stroke="#7c9297" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M136 313H158V321H136Z" fill="#13a8dc" />
        <path d="M139 315H156V318H139Z" fill="#79d7ef" stroke="none" />
        <path d="M131 411H158V418H131Z" fill="#18a9d6" />
        <path d="M134 413H156V415H134Z" fill="#8eddf0" stroke="none" />
   

      </g>

      {/* Ventilateur */}
      <circle cx="72" cy="510" r="20" fill="#159bd0" stroke="#8b9292" strokeWidth="2" />
      <path d="M69 508Q70 500 74 505L76 513L70 517Z" fill="#b9c3c4" stroke="#6f7778" />
      <path d="M61 528H83L90 537H54Z" fill="#c5c9c8" stroke="#666" strokeWidth="1.5" />
      <path d="M56 535H89V540H56Z" fill="#8b9292" />

      {/* Liaison bleue brisée : du ventilateur au raccord supérieur droit */}
      <path
        d="M72 490V476H126V469L136 459V418H145"
        fill="none"
        stroke="#13a8dc"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Base bleue */}
      <path d="M151 494H249V510L218 531H183L151 510Z" fill="#20b8e8" stroke="#727b7c" strokeWidth="2" />
      <path d="M151 499H249M161 510H239" fill="none" stroke="#4bd1f3" strokeWidth="2" />
      <path d="M183 531H218V541H183Z" fill="#aeb5b5" stroke="#555b5c" strokeWidth="2" />

      {/* Socle et conduite à droite */}
      <path d="M41 539H168V545H41Z" fill="#b9bdbb" stroke="#656b6a" strokeWidth="2" />
      <path d="M235 539H295V545H235Z" fill="#b9bdbb" stroke="#656b6a" strokeWidth="2" />
      <path
        d="M270 539L290 520L334 508L335 511L294 533L280 543Z"
        fill="#a94939"
        stroke="#68615c"
        strokeWidth="1.5"
      />
      <path d="M282 535L291 525L301 522" fill="none" stroke="#595d5d" strokeWidth="2" />
      <path d="M41 547H296" stroke="#70a442" strokeWidth="3" />

      {/* Supports horizontaux et traverse supérieure */}
      <path d="M276 297H295V302H276ZM276 381H295V386H276ZM276 460H295V465H276Z" fill="#d4d7d6" stroke="#8d9291" />
      <path d="M136 15H276V22H136Z" fill="#d7d9d8" stroke="#555b5e" strokeWidth="2" />
    </svg>
  );
}
