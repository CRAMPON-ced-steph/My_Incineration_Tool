import { useEffect, useRef } from 'react';

// Recopie `payload` dans innerData (via setInnerData) chaque fois que son contenu change.
//
// Pourquoi : avec ContenuOnglets, les onglets de calcul restent montés en arrière-plan.
// Un onglet dont l'effet d'écriture ne dépend que d'une partie des valeurs qu'il écrit
// garde des valeurs périmées quand un onglet amont (ex. Combustion) termine son calcul
// après lui. Ici la dépendance est le contenu sérialisé de tout le payload, et l'écriture
// n'a lieu que si ce contenu a réellement changé (pas de boucle de rendu).
const useSyncInnerData = (setInnerData, payload) => {
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const signature = JSON.stringify(payload);
  const derniere = useRef(null);

  useEffect(() => {
    if (!setInnerData || signature === derniere.current) return;
    derniere.current = signature;
    const valeurs = payloadRef.current;
    setInnerData((prev) => ({ ...prev, ...valeurs }));
  }, [signature, setInnerData]);
};

export default useSyncInnerData;
