import { createContext, useContext, useEffect, useRef } from 'react';

// ─── Envoi automatique d'un nœud (Calc. All du mode Bilan) ───────────────────
//
// Le Calc. All du mode Bilan monte chaque MainPage en arrière-plan (CalculBilanCache) puis,
// une fois les onglets calculés, déclenche l'envoi que ferait « Retour au schéma ».
// Chaque MainPage déclare sa fonction d'envoi avec useEnvoiAuto(sendAllData). Hors Calc. All
// (nœud ouvert par l'utilisateur), le contexte est absent et le hook ne fait rien.
//
// Valeur du contexte : { enregistrer(envoyer) → désenregistrer, signalerRendu() }.
export const EnvoiAutoContext = createContext(null);

export const useEnvoiAuto = (envoyer) => {
  const ctx = useContext(EnvoiAutoContext);
  const ref = useRef(envoyer);
  ref.current = envoyer;

  useEffect(() => {
    if (!ctx) return undefined;
    return ctx.enregistrer(() => ref.current());
  }, [ctx]);

  // Chaque rendu de la MainPage (innerData modifié par un onglet) repousse l'envoi :
  // le calcul n'est terminé que lorsque plus rien ne bouge.
  useEffect(() => {
    if (ctx) ctx.signalerRendu();
  });
};
