# Tâche Claude Code — Adaptation des onglets QUENCH (Pyrofluid)

## Contexte
Deux fichiers React portent le module QUENCH issu du VB.NET `ClassQuench.vb` :
- `4_QUENCH_Design1_ML.jsx` : portage du calcul VB (saturation adiabatique, absorption HCl au venturi, purge/appoint/recirculation). Exporte `calculQuench(inp)`.
- `2_QUENCH_Flue_gas_ML.jsx` : bilan simplifié (T de sortie imposée, infiltration d'air, pertes thermiques).

Localise d'abord les deux fichiers (`git ls-files | grep QUENCH`), lis-les en entier, puis travaille dans l'ordre ci-dessous.
**Règles** : un commit par étape (message en français, préfixe `quench:`), ne touche à aucun fichier hors QUENCH sauf pour créer les tests, lance lint + build + tests après chaque étape, ne change pas les clés `innerData` existantes (compat rapport/OPEX/aval) sauf mention explicite.

---

## Étape 0 — Filet de sécurité (avant toute modif)
1. Extraire le moteur de `4_QUENCH_Design1_ML.jsx` dans `quenchEngine.js` (même dossier) : constantes, fonctions thermo, `calculQuench`. Le composant l'importe et le ré-exporte (`export { calculQuench }`) pour ne rien casser.
2. Créer `quenchEngine.test.js` (vitest ou jest selon le projet) avec ces deux cas, et **figer les valeurs actuelles** (tolérance 1e-3 relative) comme tests de non-régression :

```js
// Cas test commenté dans le VB
const CAS_VB = { mCO2:1490.11, mH2O:3608.36, mO2:618.57, mN2:6671.38, mSO2:8.58, mHCl:2.61,
  tempFumees:300, pTotal:0, diamQuench:0.9, chkCone:false, diamCone:0, tempEauAp:25,
  effVenturi:0.6, diamGouttes:700, constNusselt:2, coefHautSat:1.5 };
// Valeurs actuelles attendues : ts≈81.26, tempSortie≈80.76, concHClRec≈1.7293, effHCl≈47.1 %
// Contrôles exacts : masTot=12399.6, volTot=11023.7
// Cas "défauts composant" : mCO2:2839,mH2O:12270,mN2:19417,mO2:1549,mSO2:31.61,mHCl:14.25,tempFumees:350,diamQuench:1.5
```

---

## Étape 1 — Bug : reset de `ConcHClRec` à chaque passe externe (priorité 1)
Dans `calculQuench`, le VB réinitialise `ConcHClRec = 0.01` (et `ConcHClAr = 0.05`) au début de chaque passe de la boucle externe (`deltaBoucle2`). Le JSX ne le fait qu'une fois, donc la 2ᵉ passe repart de ~2,01 %.
- Déplacer `concHClRec = 0.01` (et `concHClAr = 0.05`) à l'intérieur du `while (deltaBoucle2 <= 2)`.
- Mettre à jour le test « défauts composant » : on attend désormais `concHClRec ≈ 1.7325` et `tempSortie ≈ 83.03`. Le cas VB ne change pas.

## Étape 2 — Performance : remplacer le pas de 0,0001 par une résolution numérique
La boucle interne fait jusqu'à 20 000 itérations × 4 tolérances (80–220 ms par appel, relancé à chaque frappe).
- Définir `f(concHClRec) = ts − tempSortie(concHClRec)` (extraire le corps de la boucle interne en une fonction pure `evalBoucle2(concHClRec)` qui renvoie `res`).
- Chercher la plus petite `concHClRec` ≥ 0.01 telle que `|f| < deltaBoucle2` : balayage grossier (pas 0.05, borne haute 20 %) puis bissection pour raffiner. Conserver la logique `deltaBoucle2 = 0.5 → 2` par pas de 0.5 et le drapeau `converge`.
- Critère de réussite : tests de l'étape 0 inchangés (tolérance 1e-3 sur `concHClRec` ; 0.0001 de résolution VB), temps par appel **< 20 ms** (ajouter un test de perf indicatif), plus de plafond à ~2 %.
- Dans le composant, passer `useMemo` + un debounce léger (150 ms) sur les saisies si le recalcul reste perceptible.

## Étape 3 — Calage empirique legacy en option
Le VB applique, après la boucle 1 : `ts = ts / 1.0005` et `TensVapH2O = Psat(ts) × 0.9954` (ts étant arrondi au pas de 0,1 °C). Le JSX ne le fait pas, et l'impact sur le résultat est fort (purge, rendement HCl). On ne sait pas encore laquelle des deux versions est la bonne.
- Ajouter un paramètre d'entrée `calageLegacy` (booléen, **défaut `true`** = comportement VB de référence). Si vrai : arrondir `ts` à 0,1 °C, puis `ts /= 1.0005`, `tensVapH2O = psatH2O(ts) * 0.9954`, et recalculer `debMasEvap` avec ce `ts`. Sinon : comportement actuel.
- UI : case à cocher « Calage empirique VB (÷1,0005 ; ×0,9954) » dans la section Dimensionnement, persistée via `QD_calageLegacy` dans `innerData` (pattern `getInitialValue`), + clés de traduction dans `QUENCH_Design_traduction`.
- Test : ajouter un test qui exécute les deux modes sur le cas VB et **affiche** (console) les deux jeux de résultats. Ne pas figer les valeurs du mode legacy : elles seront validées contre une exécution du VB (voir « Validation »).

## Étape 4 — Garde-fous numériques
- `constNusselt <= 0`, `diamGouttes <= 0`, `effVenturi` hors ]0 ; 1] : `calculQuench` renvoie `{ erreurEntree: 'nusselt' | 'gouttes' | 'venturi' }` au lieu de produire `Infinity`/`NaN`. Le composant affiche un bandeau d'erreur dédié (+ traductions). Les plages « métier » (venturi 0,5–0,7 ; gouttes 700–800) restent de simples avertissements.
- Vérifier qu'aucune valeur de `r` n'est `NaN`/`Infinity` avant la synchronisation `innerData` ; sinon ne pas écrire dans `innerData`.

## Étape 5 — Cohérence des entrées (onglet Design)
1. Dans `defaultsFromNode`, **supprimer le repli** `innerData?.FG_OUT_kg_h` : c'est la sortie de l'onglet Flue_gas (eau déjà ajoutée), pas l'entrée du quench. Utiliser uniquement `upstreamFG_IN` (et valeurs par défaut sinon), comme pour la température.
2. Relire `QD_inputs` depuis `innerData` à l'initialisation de `fumees` (aujourd'hui sauvegardé mais jamais relu : les saisies sont perdues au remontage de l'onglet). `rechargerDepuisFlux` continue de forcer les valeurs amont.
3. Une seule source de vérité pour la dépression : `fumees.pTotal` et `PDC_calcul['Pression aéraulique [mmCE]']` doivent être le même état (garder `pTotal`, afficher et éditer la même valeur dans les deux endroits).

## Étape 6 — Onglet Flue_gas : hygiène React
Dans `2_QUENCH_Flue_gas_ML.jsx` (ne pas changer la physique) :
- Ne plus muter `innerData` pendant le rendu : déplacer le bloc `if (innerData) {...}` dans un `useEffect` qui appelle `setInnerData` si dispo (même pattern de signature `JSON.stringify` que le Design ; ajouter la prop `setInnerData`, la passer depuis le parent).
- `useEffect` de sauvegarde localStorage : ajouter `nodeId` aux dépendances.
- `clearMemory` : dépendances correctes (`nodeId`, `upstreamT_IN`) pour ne pas figer `initialEmissions_QUENCH`.
- Remplacer les `Math.max(0, Math.min(10000, value))` inline par une petite fonction `clamp` partagée.

## Étape 7 — Sorties concurrentes (analyse seulement, ne pas modifier)
Faire un `grep -rn` sur `T_OUT`, `FG_OUT_kg_h`, `T_quench_out`, `FG_quench_out_kg_h`, `Q_eau_kg_h`, `Conso_Eau` dans tout le projet et produire `QUENCH_sorties.md` : qui écrit, qui lit, risque de double comptage (eau comptée par les deux onglets dans l'OPEX ?), et une proposition (sans l'appliquer) pour désigner une seule sortie « officielle » vers l'aval selon le mode (T imposée = onglet Flue_gas ; saturation adiabatique = onglet Design).

## Étape 8 — Espèces non propagées (analyse puis proposition)
Le VB propage aussi NOx, poussières, CO, H₂ et l'enthalpie de sortie (`EntTotalSortie`). Vérifier dans le projet comment ces espèces circulent entre nœuds (`PInput`/`Poutput`, etc.). Si elles existent côté amont, les passer à travers le quench dans `FG_quench_out_kg_h` (inchangées, pas de réaction) et ajouter `H_quench_out` (= `entTotalSortie`). Sinon, documenter l'écart dans `QUENCH_sorties.md`.

---

## Validation (à faire par l'utilisateur, hors Claude Code)
Exécuter le VB avec `CAS_VB` ci-dessus et relever : `ts`, `TemperatureFumeesSortie`, `ConcHClRec`, `ConcHClAr`, `DebMasTotalPurge`, `DebMasEauAppoint`, `Vitesse`, `Vpassage`, `Pventuri`, `Zsat`. Les coller dans `quenchEngine.test.js` comme valeurs de référence du mode `calageLegacy: true` (tolérance 1 %). Un écart de l'enthalpie d'entrée de 0,05 % est déjà constaté (JSX 3 288 090 contre 3 289 871,77 dans le commentaire du VB) : à vérifier avec cette même exécution.

## Livrables attendus
- Un commit par étape, tests au vert, `npm run build` OK.
- Un résumé final : ce qui a changé, ce qui reste ouvert (étapes 7–8, validation VB).
