import { sansClesOpex } from '../G_Graphiques/Dashboard/opexTableau';

// ─── Entrée d'un nœud du schéma (sortie reçue de son voisin amont) ───────────
//
// Quand un nœud envoie ses résultats (« Retour au schéma »), Main_FLOW range sa SORTIE dans
// son propre data.result (lue par les rapports). Sans autre mémoire, le nœud relirait à la
// réouverture sa propre sortie comme entrée (T_OUT, FG_OUT_kg_h, P_OUT, polluants… en Bilan ;
// dataFlow en Retro) : refroidissement, perte de charge ou captation appliqués deux fois.
//
// On garde donc, pour chaque nœud, la dernière sortie reçue de chaque voisin amont dans
// data.entrees[<id du voisin>] ; à l'ouverture, cette entrée est superposée au résultat du
// nœud (comme lors du premier envoi du voisin amont). Sens du calcul : en Bilan l'amont est
// la source des liens, en Retro la cible (le calcul remonte de la cheminée vers le four).

// Valeur vide : ne remplace pas une valeur existante (même règle que l'envoi aval)
export const estVide = (v) =>
  v === null || v === undefined ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) ||
  (Array.isArray(v) && v.length === 0);

// Voisins dont la sortie alimente le nœud `id`, dans le sens du calcul
export const voisinsAmont = (id, edges = [], mode = 'Bilan') => (mode === 'Bilan'
  ? edges.filter((e) => e.target === id).map((e) => e.source)
  : edges.filter((e) => e.source === id).map((e) => e.target));

// Mémorise la sortie `resultat` reçue du voisin `source`
export const ajouterEntree = (data = {}, source, resultat) => ({
  ...data,
  entrees: { ...(data.entrees || {}), [source]: resultat },
});

// Données passées au composant d'un nœud : résultat du nœud + entrée reçue de son voisin amont.
// Uniquement si le nœud a un seul voisin amont relié avec une entrée mémorisée (un mélangeur
// 2 → 1 garde le comportement d'origine). Renvoie l'objet d'origine s'il n'y a rien à superposer.
export const donneesAvecEntree = (data, id, edges, mode) => {
  const entrees = data?.entrees;
  if (!entrees) return data;
  const sources = voisinsAmont(id, edges, mode).filter((s) => entrees[s]);
  if (sources.length !== 1) return data;
  const result = { ...(data.result || {}) };
  for (const [cle, valeur] of Object.entries(entrees[sources[0]])) {
    if (!estVide(valeur)) result[cle] = valeur;
  }
  return { ...data, result };
};

// ─── Envoi des résultats d'un nœud (« Retour au schéma » ou Calc. All) ───────
//
// Applique l'envoi du nœud `emetteurId` à la liste `nodes` et renvoie la nouvelle liste :
// - le premier voisin aval (sens du calcul) reçoit la sortie fusionnée dans son data.result :
//   l'amont l'emporte pour les valeurs non vides, l'aval garde ses valeurs quand l'amont envoie
//   du vide ; les clés OPEX propres à l'émetteur ne sont pas recopiées (sansClesOpex) ; la
//   sortie est aussi mémorisée comme entrée du voisin (data.entrees) ;
// - l'émetteur garde sa sortie dans data.result (lue par les rapports), plus ses consommations.
// Fonction pure : utilisée par Main_FLOW.onSendData et par le Calc. All du mode Bilan.
export const appliquerEnvoi = (nodes, edges, mode, emetteurId, data) => {
  const cible = nodes.find((node) => (mode === 'Bilan'
    ? edges.some((e) => e.source === emetteurId && e.target === node.id)
    : edges.some((e) => e.target === emetteurId && e.source === node.id)));
  const resultat = data?.result || {};
  const amont = sansClesOpex(resultat);

  const premier = (cle, champ) => resultat?.[cle]?.[0]?.data?.[champ];
  const conso = {
    consommationElec: premier('activeNodes_Elec', 'consommationElec'),
    consommationEau: premier('activeNodes_Eau', 'consommationEau'),
    consommationReactifs: premier('activeNodes_Reactifs', 'consommationReactifs'),
    consommationEnergie: premier('activeNodes_Energie', 'consommationEnergie'),
    emissionsCO2: premier('activeNodes_CO2', 'emissionsCO2'),
    cout: premier('activeNodes_cout', 'cout'),
  };
  const consoDefinies = Object.fromEntries(Object.entries(conso).filter(([, v]) => v !== undefined));

  return nodes.map((node) => {
    if (cible && node.id === cible.id) {
      const aval = node.data.result || {};
      const fusion = { ...aval, ...amont };
      for (const cle of Object.keys(amont)) {
        if (estVide(amont[cle]) && !estVide(aval[cle])) fusion[cle] = aval[cle];
      }
      return { ...node, data: ajouterEntree({ ...node.data, result: fusion }, emetteurId, amont) };
    }
    if (node.id === emetteurId) {
      return {
        ...node,
        data: {
          ...node.data,
          result: { ...resultat },
          ...(data?.inputData !== undefined && { inputData: data.inputData }),
          ...consoDefinies,
          isActive: true,
        },
      };
    }
    return node;
  });
};
