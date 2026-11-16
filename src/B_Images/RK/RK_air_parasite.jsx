import React, { useState } from 'react';
import { 
  Wind, 
  Play, 
  Pause, 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Settings, 
  Sun, 
  Moon, 
  ArrowRight,
  ShieldAlert,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [airflowSpeed, setAirflowSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('schema');

  // Données des composants numérotés de 1 à 9 (en français)
  const componentsData = {
    1: {
      number: 1,
      title: "Entrée d'Air Principal (Extérieur)",
      type: "Flux d'air / Entrée",
      description: "Flux d'air frais provenant de l'environnement extérieur ou d'une source primaire. Il alimente le système en air neuf.",
      role: "Assurer le renouvellement d'air hygiénique et la combustion ou ventilation de base.",
      details: "Débit variable selon la dépression générée dans le caisson."
    },
    2: {
      number: 2,
      title: "Point de Mélange / Convergence",
      type: "Zone de jonction",
      description: "Point où le flux d'air principal (1) et le flux secondaire/parasite (4) se rejoignent et se mélangent avant d'entrer dans la conduite principale.",
      role: "Homogénéisation des masses d'air avant l'admission dans le corps de chauffe ou le caisson.",
      details: "Sensibles aux turbulences et aux pertes de charge locales."
    },
    3: {
      number: 3,
      title: "Séparateur / Cloison de Sécurité",
      type: "Obstacle / Guide",
      description: "Lame ou chicane de séparation aérodynamique guidant les flux d'air entrants pour éviter les turbulences excessives et stabiliser l'entrée (2).",
      role: "Canaliser et diriger les flux d'air vers la section horizontale.",
      details: "Participe à la réduction du bruit aérodynamique."
    },
    4: {
      number: 4,
      title: "Air Parasite / Entrée Secondaire",
      type: "Flux parasite / Fuite",
      description: "Flux d'air parasite (souvent non contrôlé, fuite de gaine, prise d'air annexe ou ventilation parasite) s'introduisant par le haut.",
      role: "Perturbe ou complète le débit massique total entrant dans le système.",
      details: "Sa maîtrise est cruciale pour le rendement énergétique global."
    },
    5: {
      number: 5,
      title: "Recyclage / Retour d'Air Bas",
      type: "Flux de recirculation",
      description: "Flux d'air repris par la partie inférieure de la colonne secondaire, réinjecté dans le circuit en boucle fermée ou semi-ouverte.",
      role: "Permet de récupérer des calories ou de moduler le taux de brassage.",
      details: "Équilibre les pressions statiques entre les différentes zones du caisson."
    },
    6: {
      number: 6,
      title: "Registre de Réglage / Volet Principal",
      type: "Organe de régulation",
      description: "Vanne ou clapet de réglage (horizontal) permettant d'étrangler ou de libérer le passage de l'air dans la cheminée d'évacuation.",
      role: "Contrôle précis du débit global et de la perte de charge du système.",
      details: "Actionné manuellement ou par un servomoteur automatisé."
    },
    7: {
      number: 7,
      title: "Clapet Anti-Retour / Doigt de Gantelet",
      type: "Organe de sécurité / Clapet",
      description: "Butée ou clapet profilé (représenté en jaune) empêchant le refoulement intempestif de l'air et guidant le flux (7).",
      role: "Sécurité anti-refoulement et orientation unidirectionnelle du flux.",
      details: "S'ouvre sous la pression aérodynamique nominale."
    },
    8: {
      number: 8,
      title: "Capteur / Sonde Thermométrique ou de Pression",
      type: "Instrumentation",
      description: "Doigt de gant ou capteur profilé mesurant la température, la vitesse ou la pression dynamique du flux d'air ascendant.",
      role: "Fournir les données de régulation au système de contrôle (PID).",
      details: "Permet d'ajuster en temps réel la position du registre (6)."
    },
    9: {
      number: 9,
      title: "Sortie / Évacuation des Gaz ou de l'Air",
      type: "Flux de rejet / Sortie",
      description: "Flux d'air sortant final (rejet vers l'extérieur ou la cheminée d'extraction principale).",
      role: "Évacuation propre des flux traités ou viciés hors de l'enceinte.",
      details: "Vitesse de sortie calibrée pour éviter les nuisances environnementales."
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Barre de navigation supérieure */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm ${darkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white/80 border-slate-200 text-slate-900'}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Analyseur Aéraulique Interactif</h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Simulation technique basée sur le schéma d'Air Parasite</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isPlaying 
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Flux' : 'Activer Flux'}</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            title="Changer de thème"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Colonne gauche / Schema interactif (7 colonnes) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-base">Schéma Technique (Cliquez sur les numéros 1 à 9)</h2>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${darkMode ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                Interactif
              </span>
            </div>

            {/* Représentation SVG stylisée et responsive du schéma original RK_air_parasite */}
            <div className={`w-full aspect-[4/3] rounded-xl flex items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
              
              <svg viewBox="0 0 700 500" className="w-full h-full drop-shadow-md">
                <defs>
                  {/* Style des flèches animées */}
                  <style>{`
                    .air-flow {
                      fill: none;
                      stroke: #3b82f6;
                      stroke-width: 6;
                      stroke-linecap: round;
                      stroke-dasharray: 12 12;
                      animation: ${isPlaying ? `flowDash ${3 / airflowSpeed}s linear infinite` : 'none'};
                    }
                    @keyframes flowDash {
                      to {
                        stroke-dashoffset: -48;
                      }
                    }
                    .node-circle {
                      cursor: pointer;
                      transition: transform 0.2s, filter 0.2s;
                    }
                    .node-circle:hover {
                      transform: scale(1.15);
                      filter: brightness(1.2);
                    }
                  `}</style>
                </defs>

                {/* --- CAISSON PRINCIPAL (Boîte de gauche) --- */}
                <rect x="50" y="80" width="340" height="340" rx="40" ry="40" 
                  fill={darkMode ? '#1e293b' : '#f8fafc'} 
                  stroke="#3b82f6" 
                  strokeWidth="4" 
                  strokeDasharray="8 4" 
                  opacity="0.6" 
                />

                {/* Conduites principales */}
                <path d="M 230 200 L 450 200 L 450 360 L 230 360" fill="none" stroke={darkMode ? '#cbd5e1' : '#334155'} strokeWidth="5" />
                <path d="M 130 140 L 130 200 L 230 200" fill="none" stroke={darkMode ? '#cbd5e1' : '#334155'} strokeWidth="5" />
                
                {/* Cheminée verticale de droite */}
                <path d="M 450 360 L 580 360 L 580 80 L 450 80" fill="none" stroke={darkMode ? '#cbd5e1' : '#334155'} strokeWidth="5" />

                {/* --- FLUX D'AIR ANIMÉS (Chemins bleus) --- */}
                {/* 1. Entrée d'air bas */}
                <path d="M 130 420 Q 130 360 210 350" className="air-flow" />
                {/* 4. Air parasite haut */}
                <path d="M 130 80 Q 130 140 210 190" className="air-flow" />
                {/* 2. Point de mélange */}
                <path d="M 230 220 L 320 220" className="air-flow" />
                {/* 5. Recyclage bas droite */}
                <path d="M 450 420 Q 450 380 450 340" className="air-flow" />
                {/* 7. Entrée secondaire / Clapet */}
                <path d="M 450 240 Q 450 210 450 180" className="air-flow" />
                {/* 9. Sortie haut */}
                <path d="M 520 80 Q 560 80 610 65" className="air-flow" stroke="#2563eb" strokeWidth="8" />

                {/* --- COMPOSANTS INTERNES --- */}
                {/* 3. Séparateur / Cloison */}
                <path d="M 170 200 L 210 240 L 170 280" fill="none" stroke={darkMode ? '#94a3b8' : '#475569'} strokeWidth="4" />
                <line x1="170" y1="240" x2="130" y2="240" stroke={darkMode ? '#94a3b8' : '#475569'} strokeWidth="4" />

                {/* 6. Registre (Volet horizontal marron) */}
                <rect x="500" y="120" width="60" height="10" rx="3" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />

                {/* 7. Clapet anti-retour (Jaune) */}
                <polygon points="440,210 470,225 440,240" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />

                {/* 8. Capteur / Sonde (Rouge effilé) */}
                <polygon points="560,180 500,190 560,200" fill="#fca5a5" stroke="#ef4444" strokeWidth="2" />

                {/* --- NUMÉROS INTERACTIFS (1 à 9) --- */}
                
                {/* 1 */}
                <g className="node-circle" onClick={() => setSelectedItem(1)}>
                  <circle cx="100" cy="380" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="100" y="386" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">1</text>
                </g>

                {/* 2 */}
                <g className="node-circle" onClick={() => setSelectedItem(2)}>
                  <circle cx="210" cy="220" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="210" y="226" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">2</text>
                </g>

                {/* 3 */}
                <g className="node-circle" onClick={() => setSelectedItem(3)}>
                  <circle cx="130" cy="280" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="130" y="286" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">3</text>
                </g>

                {/* 4 */}
                <g className="node-circle" onClick={() => setSelectedItem(4)}>
                  <circle cx="100" cy="100" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="100" y="106" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">4</text>
                </g>

                {/* 5 */}
                <g className="node-circle" onClick={() => setSelectedItem(5)}>
                  <circle cx="450" cy="400" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="450" y="406" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">5</text>
                </g>

                {/* 6 */}
                <g className="node-circle" onClick={() => setSelectedItem(6)}>
                  <circle cx="610" cy="125" r="18" fill="#991b1b" stroke="#ffffff" strokeWidth="3" />
                  <text x="610" y="131" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">6</text>
                </g>

                {/* 7 */}
                <g className="node-circle" onClick={() => setSelectedItem(7)}>
                  <circle cx="415" cy="225" r="18" fill="#eab308" stroke="#ffffff" strokeWidth="3" />
                  <text x="415" y="231" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">7</text>
                </g>

                {/* 8 */}
                <g className="node-circle" onClick={() => setSelectedItem(8)}>
                  <circle cx="610" cy="190" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                  <text x="610" y="196" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">8</text>
                </g>

                {/* 9 */}
                <g className="node-circle" onClick={() => setSelectedItem(9)}>
                  <circle cx="630" cy="50" r="18" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                  <text x="630" y="56" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">9</text>
                </g>

              </svg>
            </div>

            {/* Commandes rapides sous le schéma */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Vitesse du flux :</span>
                <input 
                  type="range" 
                  min="0.2" 
                  max="2.5" 
                  step="0.1" 
                  value={airflowSpeed} 
                  onChange={(e) => setAirflowSpeed(parseFloat(e.target.value))}
                  className="w-32 accent-blue-600 cursor-pointer" 
                />
                <span className="text-xs font-bold text-blue-600">{airflowSpeed.toFixed(1)}x</span>
              </div>

              <button 
                onClick={() => setSelectedItem(1)}
                className="text-xs flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Commencer la visite (1)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Colonne droite / Panneau d'inspection des composants (5 colonnes) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className={`p-6 rounded-2xl border shadow-xl flex flex-col h-full transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/20">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-base">Fiche Technique du Composant</h3>
              </div>
              {selectedItem && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
                  #{selectedItem}
                </span>
              )}
            </div>

            {selectedItem ? (
              <div className="py-6 flex flex-col space-y-5 animate-fadeIn">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    {componentsData[selectedItem].type}
                  </span>
                  <h4 className="text-xl font-bold mt-2">{componentsData[selectedItem].title}</h4>
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Description</h5>
                  <p className="text-sm leading-relaxed">{componentsData[selectedItem].description}</p>
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Rôle Principal</h5>
                  <p className="text-sm leading-relaxed">{componentsData[selectedItem].role}</p>
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Paramètres & Détails</h5>
                  <p className="text-sm leading-relaxed">{componentsData[selectedItem].details}</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    disabled={selectedItem <= 1}
                    onClick={() => setSelectedItem(selectedItem - 1)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-600/30 disabled:opacity-30 hover:bg-slate-500/10 transition-all"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={selectedItem >= 9}
                    onClick={() => setSelectedItem(selectedItem + 1)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md shadow-blue-500/20"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Aucun élément sélectionné</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Veuillez cliquer sur l'un des numéros numérotés de 1 à 9 directement sur le schéma interactif pour afficher sa description détaillée.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(1)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                >
                  Affirmer le composant 1
                </button>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Grille de sélection rapide globale en bas */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className={`p-6 rounded-2xl border shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-semibold text-sm mb-4 text-slate-400 uppercase tracking-wider">Index rapide des composants (1 à 9)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedItem(num)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  selectedItem === num 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105' 
                    : darkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-lg">{num}</span>
                <span className="text-[10px] opacity-75 truncate w-full text-center mt-1">
                  {num === 1 ? "Entrée" : num === 2 ? "Mélange" : num === 3 ? "Séparateur" : num === 4 ? "Parasite" : num === 5 ? "Recyclage" : num === 6 ? "Registre" : num === 7 ? "Clapet" : num === 8 ? "Capteur" : "Sortie"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className={`py-6 border-t text-center text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <p>Application Interactive Aéraulique — Basée sur le schéma technique (RK_air_parasite.png)</p>
      </footer>

    </div>
  );
}