import React, { Component as ReactComponent, useEffect, useMemo, useRef } from 'react';
import { EnvoiAutoContext } from './envoiAuto';

// ─── Calc. All du mode Bilan : calcul d'un nœud sans l'ouvrir ────────────────
//
// Monte la MainPage du nœud hors écran (tous ses onglets de calcul sont montés grâce à
// ContenuOnglets), attend que le calcul soit stable puis déclenche l'envoi que ferait
// « Retour au schéma » (fonction déclarée par la MainPage avec useEnvoiAuto).
// Stable = ni rendu de la MainPage ni changement du DOM pendant CALME_MS.
// `tache` : { id, Component, nodeData, allNodes, edges, currentLanguage, resoudre(data | null) }.

const CALME_MS = 300;
const DELAI_MAX_MS = 15000;

// Une erreur dans un nœud calculé en arrière-plan ne doit pas faire tomber le schéma.
class GardeErreur extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = { erreur: false };
  }

  static getDerivedStateFromError() {
    return { erreur: true };
  }

  componentDidCatch(erreur) {
    console.error('[Calc. All Bilan] Erreur de calcul du nœud :', erreur);
    this.props.onErreur();
  }

  render() {
    return this.state.erreur ? null : this.props.children;
  }
}

const CalculBilanCache = ({ tache }) => {
  const conteneur = useRef(null);
  const envoyer = useRef(null);
  const dernierMouvement = useRef(Date.now());
  const termine = useRef(false);

  const finir = (data) => {
    if (termine.current) return;
    termine.current = true;
    tache.resoudre(data);
  };
  const finirRef = useRef(finir);
  finirRef.current = finir;

  const ctx = useMemo(() => ({
    enregistrer: (fn) => {
      envoyer.current = fn;
      return () => { if (envoyer.current === fn) envoyer.current = null; };
    },
    signalerRendu: () => { dernierMouvement.current = Date.now(); },
  }), []);

  useEffect(() => {
    const debut = Date.now();
    const observateur = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => { dernierMouvement.current = Date.now(); })
      : null;
    if (observateur && conteneur.current) {
      observateur.observe(conteneur.current, { subtree: true, childList: true, characterData: true, attributes: true });
    }
    const minuteur = setInterval(() => {
      const maintenant = Date.now();
      if (maintenant - debut > DELAI_MAX_MS) {
        console.warn('[Calc. All Bilan] Calcul non stabilisé, nœud ignoré :', tache.id);
        finirRef.current(null);
        return;
      }
      if (maintenant - dernierMouvement.current < CALME_MS) return;
      if (!envoyer.current) {
        // Page sans envoi automatique : on attend le délai maximal au cas où elle s'enregistre
        if (maintenant - debut > 2000) finirRef.current(null);
        return;
      }
      let envoi = null;
      try {
        envoi = envoyer.current();
      } catch (e) {
        console.error('[Calc. All Bilan] Erreur à l\'envoi du nœud', tache.id, e);
      }
      // L'envoi passe par onSendData (capturé par la tâche) ; envoi direct en secours
      finirRef.current(tache.capture() ?? envoi ?? null);
    }, 50);
    return () => {
      clearInterval(minuteur);
      if (observateur) observateur.disconnect();
    };
  }, [tache]);

  const { Component } = tache;
  const rien = () => {};
  return (
    <div
      ref={conteneur}
      aria-hidden="true"
      style={{ position: 'fixed', left: -20000, top: 0, width: 1400, height: 900, overflow: 'hidden', visibility: 'hidden', pointerEvents: 'none' }}
    >
      <GardeErreur onErreur={() => finirRef.current(null)}>
        <EnvoiAutoContext.Provider value={ctx}>
          <Component
            nodeId={tache.id}
            title={tache.label}
            nodeData={tache.nodeData}
            onSendData={tache.onSendData}
            onGoBack={rien}
            onClose={rien}
            currentLanguage={tache.currentLanguage}
            allNodes={tache.allNodes}
            edges={tache.edges}
          />
        </EnvoiAutoContext.Provider>
      </GardeErreur>
    </div>
  );
};

export default CalculBilanCache;
