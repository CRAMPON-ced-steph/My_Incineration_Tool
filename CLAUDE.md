# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comportement attendu

- **Toutes les commandes Bash doivent être exécutées sans demander confirmation**, y compris les commandes destructives (rm -rf, git reset --hard, etc.). Ne jamais interrompre le flux pour valider une commande shell. Exécuter directement.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

There is no test framework configured.

## Architecture Overview

This is a **React + Vite** single-page application for industrial waste incineration process engineering. It is entirely client-side — no backend, no API server. State is persisted via `localStorage` and JSON file export/import.

### Two Operating Modes

The application has two distinct calculation modes toggled in `Main_FLOW.jsx`:
- **Bilan** — forward mass/energy balance (given inputs, compute outputs)
- **Retro** — retrograde / design mode (given outputs, compute required inputs)

The active mode is stored in `localStorage` under the key `'mode'`.

### Process Flow Canvas

`Main_FLOW.jsx` is the core canvas component. It uses `@xyflow/react` to render an interactive process flow diagram. Users drag equipment nodes from a sidebar onto the canvas and connect them with edges. Each node type corresponds to a specific piece of industrial equipment.

### Equipment Node Architecture

Each equipment type lives in two parallel directories:
- `src/Y_BILAN/<EQUIPMENT>/` — Bilan (forward balance) tabs and calculations
- `src/Z_RETRO/<EQUIPMENT>/` — Retro (design) tabs and calculations

Equipment types: `FB` (fluidized bed furnace), `RK` (rotary kiln), `WHB` (waste heat boiler), `QUENCH`, `DENOX`, `BHF`, `IACT`, `COOLINGTOWER`, `ELECTROFILTER`, `CYCLONE`, `REACTOR`, `SCRUBBER`, `CO2`, `STACK`, `IDFAN`, `SEPARATEURS`.

Each equipment's `MainPage` component and `Parameter_Tab` are re-exported from `src/C_Components/RetroAndBilanComponents.jsx`, which acts as a single aggregation point imported by `Main_FLOW.jsx`.

### Procédure : dupliquer un équipement (NEW_EQ à partir de SRC_EQ)

Quand l'utilisateur demande de "dupliquer un équipement" (ex. dupliquer BHF en IACT), appliquer **exactement** cette procédure dans l'ordre :

#### 1. Créer les répertoires
```bash
mkdir -p src/Y_BILAN/<NEW_EQ>
mkdir -p src/Z_RETRO/<NEW_EQ>
```

#### 2. Copier les fichiers de traduction verbatim (cp)
```bash
cp src/Y_BILAN/<SRC_EQ>/<SRC_EQ>_traduction.jsx src/Y_BILAN/<NEW_EQ>/<NEW_EQ>_traduction.jsx
cp src/Z_RETRO/<SRC_EQ>/<SRC_EQ>_traduction.jsx src/Z_RETRO/<NEW_EQ>/<NEW_EQ>_traduction.jsx
```

#### 3. Créer les fichiers dupliqués (Write tool) avec substitutions

Pour **chaque fichier** de `Y_BILAN/<SRC_EQ>/` et `Z_RETRO/<SRC_EQ>/` :

| Quoi remplacer | Règle |
|----------------|-------|
| Nom de fichier | `<SRC_EQ>` → `<NEW_EQ>` dans le nom |
| Imports de chemins | `'./<SRC_EQ>_traduction'` → `'./<NEW_EQ>_traduction'`, idem pour tous les fichiers locaux |
| Noms de composants/fonctions | `<SRC_EQ>MainPage` → `<NEW_EQ>MainPage`, `<SRC_EQ>_Parameter_Tab` → `<NEW_EQ>_Parameter_Tab`, `performCalculation_<SRC_EQ>` → `performCalculation_<NEW_EQ>`, etc. |
| localStorage keys | Toutes les clés suffixées `_<SRC_EQ>` → `_<NEW_EQ>` (ex. `emissions_BHF` → `emissions_IACT`) |
| Objet data interne | `data<SRC_EQ>` → `data<NEW_EQ>` (ex. `dataBHF` → `dataIACT`) dans calculations.js et Retro_Rapport |
| `equipmentType` prop | `equipmentType="<SRC_EQ>"` → `equipmentType="<NEW_EQ>"` dans le fichier Opex |
| Titres UI | Strings visibles contenant `<SRC_EQ>` → `<NEW_EQ>` (ex. `'BHF Configuration'` → `'IACT Configuration'`) |
| Export default | `<SRC_EQ>xxx` → `<NEW_EQ>xxx` |

#### 4. Enregistrer dans RetroAndBilanComponents.jsx
Ajouter :
- `import <NEW_EQ>_Parameter_Tab from '../Z_RETRO/<NEW_EQ>/<NEW_EQ>_Parameter_Tab';`
- `import <NEW_EQ>MainPage from '../Y_BILAN/<NEW_EQ>/<NEW_EQ>MainPage';`
- Les deux dans le bloc `export { ... }`

#### 5. Enregistrer dans Main_FLOW.jsx
- Ajouter `<NEW_EQ>_Parameter_Tab` et `<NEW_EQ>MainPage` dans l'import de RetroAndBilanComponents
- Ajouter `<NEW_EQ>: <NEW_EQ>MainPage` dans `COMPOSANTS_BILAN` et `<NEW_EQ>: <NEW_EQ>_Parameter_Tab` dans `COMPOSANTS_RETRO` (objets au niveau module, avant `FURNACE_LABELS`)
- Dans la MainPage Bilan, garder la fonction d'envoi nommée `sendAllData` et appeler `useEnvoiAuto(sendAllData)` (import depuis `C_Components/envoiAuto`) juste avant le `return (` du composant : sans cela, le Calc. All du mode Bilan ignore le nœud

#### 6. Ajouter dans SidebarV1.jsx
Dans la section cible (ex. `Energy_recovery`), ajouter :
```js
{ id: '<NEW_EQ>', label: t.add<NEW_EQ> },
```

#### 7. Ajouter les clés dans SidebarV1_traduction.jsx
Pour **chaque langue** présente (`fr`, `en`, `es`, `de`, `it`, `pt`, `ar`, `ru`, `ja`, `zh`) :
```js
add<NEW_EQ>: 'Ajouter <NEW_EQ>',  // adapter selon la langue
```

#### 8. Enregistrer les rapports dans GlobalReport.jsx et GlobalRetroReport.jsx

**Chaque nouveau rapport doit être enregistré dans les deux fichiers de rapport global** (`src/D_BILAN_Rapports/`), sinon l'équipement n'apparaît pas dans le PDF.

**`GlobalReport.jsx`** (mode Bilan) :
1. Ajouter l'import : `import <NEW_EQ>_Report from '../Y_BILAN/<NEW_EQ>/<NEW_EQ>_Report';`
   - Si le fichier est dans un sous-dossier (ex. `ECHANGEURS/`), adapter le chemin en conséquence.
2. Ajouter dans `REPORT_MAP` : `<NODE_LABEL>: <NEW_EQ>_Report,`
   - `<NODE_LABEL>` est le label du nœud React Flow (ex. `HX_TubeAndShell`), pas forcément le nom du dossier.
3. Ajouter dans `EQUIPMENT_ORDER` : `'<NODE_LABEL>'`

**`GlobalRetroReport.jsx`** (mode Retro) :
1. Ajouter dans `RETRO_REPORT_MAP` : `<NODE_LABEL>: true,`
2. Ajouter dans la fonction `ReportBody` :
   ```js
   if (label === '<NODE_LABEL>') return <NEW_EQReportBody calculationResult={result} inputParams={inputData} />;
   ```
3. Ajouter le composant inline `<NEW_EQ>ReportBody` juste avant le bloc `// ── Styles ──`.
   - Ce composant reprend le contenu du fichier `Z_RETRO/<NEW_EQ>/<NEW_EQ>_Retro_Rapport.jsx` **sans le chrome modal** (pas d'overlay, pas de header, pas de bouton Fermer) — uniquement les sections de données.
   - Utiliser `bodyStyles` (et non `styles`) pour tous les éléments.
   - Utiliser les composants `Section`, `Sub`, `KV` déjà définis dans le fichier.

### Source Directory Structure

| Folder | Purpose |
|--------|---------|
| `A_Transverse_fonction/` | Shared thermodynamic calculation functions (combustion, enthalpy, steam tables, flue gas) and constants. `opexDataService.js` is a module-level singleton holding OPEX parameters. |
| `B_Images/` | Static image assets |
| `C_Components/` | Shared UI components (sidebar, tables, input widgets, print/display utilities) |
| `D_BILAN_Rapports/` | Report generation components (`GlobalProcessReport.jsx`) |
| `D_Data_base/` | Gas property data tables (CO₂, H₂O absorption data) |
| `E_Gestion_acces/` | Email-based access control. Authorized emails are defined in `ListeEmailAccess.js` (permanent) and `localStorage` (temporary). Admin is hardcoded as `cedric.crampon@gmail.com` in `App.jsx`. |
| `F_Gestion_Langues/` | i18n: `translations.js` contains FR/EN strings; `LanguageContext.js` provides a React context; language choice is persisted in `localStorage` under `'selectedLanguage'`. |
| `G_Graphiques/` | Charts: `Combustion_diagramme/` (combustion linear graph) and `Dashboard/` (OPEX dashboards using recharts/chart.js) |
| `H_SaveAndLoad/` | Project save/load (JSON file download/upload) and screenshot utilities |
| `Y_BILAN/` | Equipment-specific Bilan mode calculation tabs |
| `Z_RETRO/` | Equipment-specific Retro mode calculation tabs |

### Key Files

- `App.jsx` — Top-level: handles auth gate (email verification), authorized email list management, and renders `Main_FLOW` when authenticated.
- `Main_FLOW.jsx` — Canvas, sidebar, mode switching, OPEX panel, graph toggles.
- `OPEX.jsx` / `OPEX_traduction.jsx` — Large OPEX cost estimation form (~1800 lines each).
- `A_Transverse_fonction/constantes.js` — Molar masses and physical constants used across all calculations.
- `A_Transverse_fonction/opexDataService.js` — Module singleton; call `updateOpexData(params)` to push new OPEX parameters so equipment nodes can read them.
- `ListeEmailAccess.js` — Edit this file to add/remove permanent authorized users.

### Naming Conventions

- Component files: PascalCase `.jsx`
- Utility/calculation files: snake_case or camelCase `.js`
- Translation companion files follow the pattern `<Component>_traduction.jsx`
- CSS companion files follow the pattern `<Component>.css`

### localStorage Key Conventions

All equipment-specific keys must include the equipment suffix to avoid cross-contamination between components. Pattern: `'keyName_EQUIPMENT'` (e.g., `'PDC_aero_BHF'`, `'Teau_QUENCH'`, `'emissions2_FB'`).

**Intentionally shared keys** (do NOT add suffixes):
- `'pointE'` — Written by `Z_RETRO/FB/FB_Parameter_Tab.jsx`, `Z_RETRO/RK/RK_Parameter_Tab.jsx`, and `Z_RETRO/GF/GF_Parameter_Tab.jsx`; read by `G_Graphiques/Combustion_diagramme/LinearGraph.jsx` and `D_BILAN_Rapports/GlobalRetroReport.jsx` to display the current operating point on the combustion diagram. Only one furnace type is active per process flow, so last-write-wins is correct behavior.

### Node colors on canvas

Each sidebar section has a defined background color applied to nodes when placed on the canvas (and restored on project load). The color mapping lives in `NODE_COLORS` in `Main_FLOW.jsx` (defined just before `onAddNode`). The same colors are used for sidebar buttons via `nodeColor`/`nodeHoverColor`/`nodeTextColor` props on each section in `SidebarV1.jsx`.

| Section (`key`) | Node background | Text |
|---|---|---|
| `Furnace` (RK+SCC, GF, FB) | `#e53935` rouge | blanc |
| `Energy_recovery` (WHB, HX_TubeAndShell, IACT) | `#fb8c00` orange | blanc |
| `Dry_treatment` (BHF, ELECTROFILTER, CYCLONE, REACTOR, AIRINJECTION) | `#757575` gris foncé | blanc |
| `Wet_treatment` (QUENCH, WATER_INJECTION, COOLINGTOWER, DENOX, SCRUBBER) | `#1e88e5` bleu | blanc |
| `Echangeurs` (Cooling_HX_air, Cooling_HX_eau) | `#ffcdd2` rouge clair | noir |
| `Exit`, `DivConv` | inchangé (défaut ReactFlow) | — |

When adding a new node type, add its label → color entry to `NODE_COLORS` in `Main_FLOW.jsx` and set `nodeColor`/`nodeHoverColor`/`nodeTextColor` on its section in `SidebarV1.jsx`.

### Selected node outline

The selected-node outline thickness is overridden in `src/index.css`:

```css
.react-flow__node.selected {
  --xy-node-boxshadow-selected: 0 0 0 1.5px #1a192b;
}
```

ReactFlow's default is `0 0 0 0.5px`. Adjust the third value (`1.5px`) to change thickness.

### Anti-pattern : ne JAMAIS définir un composant React à l'intérieur d'un autre composant

```jsx
// ❌ INTERDIT — InputField est recréé à chaque render, React démonte/remonte l'<input>,
//               l'utilisateur perd le focus après chaque frappe.
const ParentTab = () => {
  const InputField = ({ id }) => <input value={p[id]} onChange={...} />;
  return <InputField id="foo" />;
};

// ✅ CORRECT — InputField est défini au niveau module (référence stable).
//    Si InputField a besoin de l'état du parent, utiliser un Context React.
const InputFieldCtx = React.createContext(null);
const InputField = ({ id }) => {
  const { p, set } = React.useContext(InputFieldCtx);
  return <input value={p[id]} onChange={set(id)} />;
};
const ParentTab = () => (
  <InputFieldCtx.Provider value={{ p, set }}>
    <InputField id="foo" />
  </InputFieldCtx.Provider>
);
```

Cette règle s'applique à **tout** sous-composant inline (`InputField`, `Row`, `Cell`, `FieldGroup`, etc.). Le symptôme est toujours le même : ejection du focus à chaque frappe.

### Known Patterns (not bugs)

- **`innerData` mutations in `C_Components/Traitement_fumées.jsx`** (lines 200, 248) — `innerData[row.pollutant] = {...}` inside `calculateValues()` and `innerData['Poutput'] = masses_pollutant_output` at body level are intentional. `innerData` is a plain mutable shared object (not React state), so synchronous body-level mutations are safe and read immediately by downstream body-level code in the same render cycle. This is the established pattern for shared FGT utility components.
- **`niveaux[0/1/2]` in `Y_BILAN/WHB/6_WHB_ValoVapeur3_ML.jsx`** — Array is always constructed with exactly 3 hardcoded elements; fixed-index access is safe.
- **`key={selectedNode.id}` on `<Component>` in `Main_FLOW.jsx`** — `renderParameterTab()` passes `key={selectedNode.id}` to force a full unmount/remount whenever the selected node changes. Without this, React reuses the same mounted component instance when two nodes share the same component type (e.g., two BHF nodes), causing `useState(nodeData?.result)` to retain the previous node's computed values instead of reinitialising from the new node's data. Do NOT remove this key.

### ESLint — état connu (2026-07-09, à régler éventuellement plus tard)

La règle `react/prop-types` est désactivée dans `eslint.config.js` (le projet n'utilise pas PropTypes ; elle générait ~3800 faux positifs). Après ce nettoyage il reste ~1000 signalements **connus et acceptés** :

- **`no-unused-vars` (~800)** — en grande partie **intentionnel** : des grandeurs intermédiaires sont calculées comme valeurs de référence ou pour un affichage futur sans servir au calcul aval (ex. `PCI_kJ_kgMV`, `PCS_kcal_kg`, `Rho_combustible` dans `A_Transverse_fonction`). Ne pas supprimer en masse sans vérifier au cas par cas. Convention possible plus tard : préfixe `_` + `varsIgnorePattern: '^_'`.
- **`no-case-declarations` (41)** — quasi toutes dans `steam_table3.js` : `const` déclarés dans des `case:` sans accolades. Sans danger (chaque `case` fait `return` immédiatement) et le fichier IAPWS-IF97 ne doit pas être modifié (cf. décision d'audit 2026-06-17). Correction éventuelle : entourer chaque `case` d'accolades `{ }`.
- **`react/no-unescaped-entities` (~21)** — apostrophes/guillemets bruts dans du texte JSX (ex. `l'application` dans `AccessRequestModal.jsx`, `"text"` dans `Tableau_generique.jsx`). React les affiche correctement ; zèle typographique (`&apos;`/`&quot;`). Cosmétique.

---

## Corrections History (audit sessions — 2026-05-18)

### localStorage key collisions fixed

| Key(s) | Files affected | Fix applied |
|--------|---------------|-------------|
| `'emissions'` | `Y_BILAN/RK/2_Flue_gas1.jsx`, `Y_BILAN/CO2/1_Capture_Parameters.jsx` | → `'emissions_RK'`, `'emissions_CO2'` |
| `'PDC_aero'` | `Z_RETRO/BHF`, `Z_RETRO/CYCLONE`, `Z_RETRO/ELECTROFILTER`, `Z_RETRO/QUENCH`, `Z_RETRO/SCRUBBER`, `Z_RETRO/REACTOR` | → `'PDC_aero_BHF'`, `'PDC_aero_CYCLONE'`, `'PDC_aero_ELECTROFILTER'`, `'PDC_aero_QUENCH'`, `'PDC_aero_SCRUBBER'`, `'PDC_aero_REACTOR'` |
| `'Qair_decolmatation'` | `Z_RETRO/BHF`, `Z_RETRO/ELECTROFILTER` | → `'Qair_decolmatation_BHF'`, `'Qair_decolmatation_ELECTROFILTER'` |
| `'T_air_decolmatation'` | `Z_RETRO/BHF`, `Z_RETRO/ELECTROFILTER` | → `'T_air_decolmatation_BHF'`, `'T_air_decolmatation_ELECTROFILTER'` |
| `'Teau'` | `Z_RETRO/QUENCH`, `Z_RETRO/SCRUBBER`, `Z_RETRO/COOLINGTOWER` | → `'Teau_QUENCH'`, `'Teau_SCRUBBER'`, `'Teau_COOLINGTOWER'` |
| `'Qeau'` | `Z_RETRO/QUENCH` | → `'Qeau_QUENCH'` |
| `'emissions2'` | `Y_BILAN/FB/3_Pollutant_Emission.jsx`, `Y_BILAN/RK/3_Pollutant_Emission1.jsx` | → `'emissions2_FB'`, `'emissions2_RK'` |
| `'sncr'`, `'noxTarget'`, `'coefStoechio'`, `'mercuryTreatment'`, `'brHgRatio'` | `C_Components/Traitement_fumées.jsx`, `C_Components/Traitement_fumées_SCC.jsx` | → `_SCC` suffix on all 5 keys in SCC file |
| `'Thermal_losses_MW'`, `'NCV_kcal_kg'`, `'Masse_dechet_kg_h'` | `Z_RETRO/FB/FB_Parameter_Tab.jsx`, `Z_RETRO/RK/RK_Parameter_Tab.jsx` | → `_FB` / `_RK` suffixes |

### Division by zero fixed

| File | Lines | Fix |
|------|-------|-----|
| `Y_BILAN/RK/1_CombustionParameters1.jsx` | 289, 296–297, 357–359, 380–381 | `totalMass !== 0 ?` guards; `Comb [kg/h] !== 0` guard |
| `Y_BILAN/WHB/4_WHB_Design_ML.jsx` | 506, 516, 526 | `pass_data.length > 0 ?` guards on `emissivite_moyenne` |

### Array safety fixed

| File | Lines | Fix |
|------|-------|-----|
| `Y_BILAN/RK/1_CombustionParameters1.jsx` | 299–304 | `if (updatedRows2.length < 6) return` before fixed-index access |

### Unused imports removed

| File | Removed |
|------|---------|
| `Y_BILAN/RK/RKMainPage.jsx` | `PrintButton`, `Input_bilan`, `getTranslatedParameter` |
| `Y_BILAN/BHF/4_BHF_Opex.jsx` | `useState`, `useEffect` |
| `Y_BILAN/COOLINGTOWER/5_COOLINGTOWER_Opex.jsx` | `useState`, `useEffect` |
| `Y_BILAN/RK/5_RK_Opex.jsx` | `useState`, `useEffect` |
| `C_Components/Traitement_fumées_SCC.jsx` | `molarMasses` |
| `Y_BILAN/RK/1_CombustionParameters1.jsx` | `getTranslatedParameter` |

### Dead state removed

| File | Removed |
|------|---------|
| `Y_BILAN/RK/RKMainPage.jsx` | `const [isActive, setIsActive] = useState(true)` |

### innerData mutation pattern fixed

| File | Fix |
|------|-----|
| `C_Components/Traitement_fumées.jsx` | `innerData['etat_mercury_treatment']` and `innerData['etat_NOx_treatment']` moved from body level into `useEffect([mercuryTreatment, sncr])` |
| `C_Components/Traitement_fumées_SCC.jsx` | Same fix |

---

## Corrections History (audit session — 2026-05-19)

### localStorage key collisions fixed

| Key(s) | Files affected | Fix applied |
|--------|---------------|-------------|
| `'emissions'` | `Y_BILAN/FB/2_CombustionTab.jsx` | → `'emissions_FB'` |
| `'thermalParams'` | `Y_BILAN/FB/2_CombustionTab.jsx` | → `'thermalParams_FB'` |
| `'airComposition'` | `Y_BILAN/FB/2_CombustionTab.jsx` | → `'airComposition_FB'` |
| `'emissions2'` | `Y_BILAN/FB/FBMainPage.jsx` (reset list) | → `'emissions2_FB'` (reset list corrected) |

`FBMainPage.jsx` reset list updated to use new suffixed keys; `'airComposition_FB'` added (was missing from reset).

### Division by zero / fallback fixed

| File | Line | Fix |
|------|------|-----|
| `Y_BILAN/FB/2_CombustionTab.jsx` | 600 | `thermalParams.Rdt_HX * 100 \|\| 85` → `thermalParams.Rdt_HX != null ? thermalParams.Rdt_HX * 100 : 85` |

### Dead code removed

| File | Removed |
|------|---------|
| `Y_BILAN/FB/2_CombustionTab.jsx` | `f0` helper function (never called) |
| `Y_BILAN/FB/2_CombustionTab.jsx` | `airCompRows` constant (never used) |

### FB OPEX — missing notifyInnerDataChanged fixed

- `Y_BILAN/FB/4_Recuperator.jsx`: added `onInnerDataChange` prop; called after `innerData` mutations in `useEffect` so downstream `FBCalcOpex` sees updated `Puissance_elec_ventilateur_kW`.
- `Y_BILAN/FB/FBMainPage.jsx`: passes `onInnerDataChange={notifyInnerDataChanged}` to `Recuperateur`.

### FB OPEX dashboard auto-update unblocked

- `G_Graphiques/Dashboard/OpexDashboard.jsx`: `userModifiedRef = useRef(!!savedState)` → `useRef(false)`. Restoring from localStorage no longer permanently blocks computed-value updates.

### FB CalcOpex — copy-paste artifacts removed

- `Y_BILAN/FB/5_1_FB_calcul_Opex.jsx`: cleared `parametersToSave` of RK/SCC/EXT/VENT/EAU keys. Removed undefined `consoElec7/8` and `labelElec7/8` from `setInnerData` spread. Fixed extra `)` on `Puissance_elec_ventilateur_kW` line. Corrected key name from `Puissance_electrique_ventilateur_kW` → `Puissance_elec_ventilateur_kW` (matches `4_Recuperator.jsx`). Added missing dep `innerData?.Puissance_elec_ventilateur_kW`.

### FB Report — HX section restructured

- `Y_BILAN/FB/4_Recuperator.jsx`: removed redundant `tempSortieFumees` dichotomy; `T_fumee_sortie_HX_C` now taken from `Tf_voute_ap_HX_C` (CombustionTab col. 11). Added second `useEffect` writing fan/airside variables to `innerData`. Fixed variable hoisting bug (declarations moved before `useEffect` calls).
- `Y_BILAN/FB/FB_Report.jsx`: HX section split into 4 SubSections — "HX côté fumées", "HX côté air", "Dimensionnement de l'échangeur", "Ventilateur" — each with 32px column gap.

---

## Calc. All button — Retro mode (2026-06-01)

### Overview

The **⚙ Calc. All** button (`Main_FLOW.jsx`; Retro described here, Bilan in « Calc. All — mode Bilan » below) triggers an automated sequential recalculation of every batch-calculable node on the canvas, in topological order from STACK to furnace. It replaces the previous approach of mounting hidden React components.

### Files involved

| File | Role |
|------|------|
| `src/Z_RETRO/batchCalculators.js` | `batchCalcMap`: maps each node label to a direct calculation function `(nodeData) => result \| null`. Reads its own parameters from `localStorage`. |
| `src/Main_FLOW.jsx` | `handleCalculateAll` async loop + `propagateResultUpstream` BFS helper. |

### How it works

1. `getTopologicalOrder(nodes, edges)` returns nodes in Bilan direction (furnace → STACK); `.reverse()` gives Retro order (STACK → furnace).
2. Only nodes present in `batchCalcMap` are calculated (`filtered`).
3. A **local snapshot** `let currentNodes = nodes` is maintained and updated each iteration — avoids stale React state between async yields.
4. For each node: `batchCalcMap[label](nodeData)` is called directly (no React mounting). On success, `propagateResultUpstream` runs.
5. `propagateResultUpstream` does a **BFS upstream** (Retro direction = Bilan source side: `e.target === id`): traverses through non-batch intermediate nodes (CO2, DivConv, …) until it reaches the next batch node. All traversed nodes receive the result so the next batch node has fresh input.
6. Result is persisted to `localStorage` via `batchResultStorageKeys` and `calcSent_<label>` flag.
7. Progress shown as `⏳ N/total` on the button; green `✓ N nœuds calculés` badge on completion.

### Adding a new equipment to Calc. All

Add an entry to `batchCalcMap` in `src/Z_RETRO/batchCalculators.js`:
```js
'MY_EQ': (nodeData) => {
  if (!nodeData?.result) return null;
  return performCalculation_MY_EQ(nodeData, f('param1_MY_EQ', '0'), ...);
},
```
No changes to `Main_FLOW.jsx` needed — any label present in `batchCalcMap` is automatically included.

### Key implementation details

- `batchCalcIndexRef.current = 0` is set **immediately** after the guard check (before the loop) to prevent a double-click race between guard evaluation and first iteration.
- Non-batch nodes (CO2, DivConv) are skipped in `filtered` but their `data.result` is still updated by `propagateResultUpstream` so they act as transparent pass-throughs.
- STACK has no upstream input requirement; its `batchCalcMap` entry ignores `nodeData`.
- `RK+SCC` with `bilanType_whb === 'WITH_WHB'` returns `null` if `nodeData?.result?.data_Air_WHB` is absent (WHB must be calculated first).

---

## Corrections History (audit session — 2026-06-16)

### Unused imports removed (sweep across all equipment files)

| Files | Removed |
|-------|---------|
| `Y_BILAN/FB/1_BouesTab.jsx` | `getTranslatedParameter`, `molarMasses` |
| `Y_BILAN/FB/3_Pollutant_Emission.jsx` | `PrintButton`, `getTranslatedParameter` |
| `Y_BILAN/BHF/1_BHF_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/BHF/BHFMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/BHF/BHFComprehensiveReport.jsx` | `useState` |
| `Y_BILAN/COOLINGTOWER/COOLINGTOWERMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/CYCLONE/CYCLONEMainPage.jsx` | `PrintButton` |
| `Y_BILAN/CYCLONE/1_CYCLONE_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/CYCLONE/2_CYCLONE_Pollutant_Emission_ML.jsx` | `PrintButton` |
| `Y_BILAN/DENOX/DENOXMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/DENOX/1_DENOX_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/DENOX/2_DENOX_Pollutant_Emission_ML.jsx` | `PrintButton` |
| `Y_BILAN/ELECTROFILTER/ELECTROFILTERMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/ELECTROFILTER/1_ELECTROFILTER_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/IDFAN/IDFANMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/IDFAN/1_IDFAN_Flue_gas1_ML.jsx` | `PrintButton` |
| `Y_BILAN/QUENCH/QUENCHMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/QUENCH/2_QUENCH_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/REACTOR/REACTORMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/REACTOR/1_REACTOR_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/RK/2_Flue_gas1.jsx` | `getTranslatedParameter` |
| `Y_BILAN/RK/3_Pollutant_Emission1.jsx` | `PrintButton` |
| `Y_BILAN/RK/4_RK_Design1.jsx` | `Input_bilan` |
| `Y_BILAN/SCRUBBER/SCRUBBERMainPage.jsx` | `useEffect` |
| `Y_BILAN/SCRUBBER/2_SCRUBBER_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/SCRUBBER/3_SCRUBBER_Pollutant_Emission_ML.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/WHB/1_WHB_Parameters_ML.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/WHB/2_WHB_Flue_gas_ML.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/WHB/3_WHB_Pollutant_Emission_ML.jsx` | `PrintButton`, `Input_bilan` |
| `Y_BILAN/AIRINJECTION/1_AIRINJECTION_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/AIRINJECTION/2_AIRINJECTION_Pollutant_Emission_ML.jsx` | `PrintButton` |
| `Y_BILAN/AIRINJECTION/AIRINJECTIONMainPage.jsx` | `AIRINJECTIONDesign` tab, `PrintButton` |
| `Y_BILAN/WATER_INJECTION/2_WATER_INJECTION_Flue_gas_ML.jsx` | `PrintButton` |
| `Y_BILAN/WATER_INJECTION/WATERINJECTIONMainPage.jsx` | `PrintButton`, `Input_bilan` |
| `C_Components/toggleButton.jsx` | `useState` |
| `Z_RETRO/FB/FB_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/RK/RK_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/IDFAN/IDFAN_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/STACK/STACK_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/QUENCH/QUENCH_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/REACTOR/REACTOR_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/SCRUBBER/SCRUBBER_Parameter_Tab.jsx` | `getTranslatedParameter` |
| `Z_RETRO/WATER_INJECTION/WATER_INJECTION_Parameter_Tab.jsx` | `getTranslatedParameter` |
| All Opex files (CYCLONE, DENOX, ELECTROFILTER, IDFAN, QUENCH, REACTOR, SCRUBBER, STACK, WHB, AIRINJECTION, WATER_INJECTION) | `useState`, `useEffect` |

### localStorage key collisions fixed

| Key(s) | Files affected | Fix applied |
|--------|---------------|-------------|
| `'T_steam_C'`, `'Qeau_kg_h'`, `'Qsteam_kg_h'` | `Z_RETRO/COOLINGTOWER/COOLINGTOWER_Parameter_Tab.jsx` | → `'T_steam_C_COOLINGTOWER'`, `'Qeau_kg_h_COOLINGTOWER'`, `'Qsteam_kg_h_COOLINGTOWER'` |
| All GF_Parameter_Tab keys (30+ keys) | `Z_RETRO/GF/GF_Parameter_Tab.jsx` | → added `_GF` suffix to all keys |
| `'emissionsWATER_INJECTION'` | `Y_BILAN/WATER_INJECTION/3_WATER_INJECTION_Pollutant_Emission_ML.jsx` | → `'emissions2_WATER_INJECTION'` |
| `'combustionParameters'` | `Y_BILAN/RK/1_CombustionParameters1.jsx` | → `'combustionParameters_RK'` |
| `'bouesData'` | `Y_BILAN/FB/FBMainPage.jsx` | removed (non-standard unsuffixed key, write-only, never read) |

### Traduction corrections

| File | Fix |
|------|-----|
| `Y_BILAN/AIRINJECTION/AIRINJECTION_traduction.jsx` | All languages: `'AIR INJECTION Configuration'` was translated as `'CYCLONE Configuration'` — corrected to proper air injection translations |
| `Y_BILAN/WATER_INJECTION/WATER_INJECTION_traduction.jsx` | Added missing `'WATER INJECTION Configuration'` key; renamed Quench references to Injection d'eau |

### Key case mismatch fixed

| Key | File | Fix |
|-----|------|-----|
| `'CalculationResult_AIRINJECTION'` | `Z_RETRO/AIRINJECTION/AIRINJECTION_Parameter_Tab.jsx` | → `'calculationResult_AIRINJECTION'` (lowercase c to match `batchResultStorageKeys` in `Main_FLOW.jsx`) |
| `'CalculationResult_AIRINJECTION'` | `Main_FLOW.jsx` `batchResultStorageKeys` | → `'calculationResult_AIRINJECTION'` |

### Batch calcul storage key fixed

- `Main_FLOW.jsx` `batchResultStorageKeys.AIRINJECTION`: was `'CalculationResult_AIRINJECTION'` → `'calculationResult_AIRINJECTION'` (consistent with other lower-c keys).

### GFMainPage Bilan mode registered

- `src/Y_BILAN/GF/GFMainPage.jsx` — new full-featured Bilan component (6 tabs: Boues, Combustion, Polluant, Voûte, HX, OPEX + Rapport).
- Registered in `RetroAndBilanComponents.jsx` and `Main_FLOW.jsx` (mode Bilan maps GF → `GFMainPage`).
- `GlobalReport.jsx`: `GF_Report` imported, added to `REPORT_MAP` and `EQUIPMENT_ORDER`.
- `GlobalRetroReport.jsx`: `GF` added to `RETRO_REPORT_MAP`, `GFReportBody` inline, `EQUIPMENT_ORDER` updated to include IACT, HX_TubeAndShell, WATER_INJECTION, AIRINJECTION.

---

## Décisions d'audit — steam_table3.js (2026-06-17)

### Boucles while/do-while — décision : NE PAS ajouter de gardes max-itérations

`src/A_Transverse_fonction/steam_table3.js` contient 12 boucles de bisection sans garde max-itérations. **Décision délibérée de ne pas les modifier.**

Raisons :
- Ce fichier est une implémentation standard **IAPWS-IF97** (standard international des tables de vapeur d'eau), éprouvée depuis des décennies.
- Toutes les boucles sont des **bisections sur intervalles physiquement bornés** (ex: `[273.15, 1073.15]` K, `[0.000611657, 100]` MPa). Elles convergent géométriquement en ~50 itérations par construction mathématique.
- Un `NaN` ne peut entrer que si les fonctions appelantes passent des valeurs hors domaine — ce serait un bug en amont, pas dans ces boucles.
- Ajouter des gardes masquerait des erreurs d'appel sans résoudre leur cause.

### Divisions par zéro — 2 fixes appliqués, 2 non

| Fonction | Ligne | Décision | Raison |
|----------|-------|----------|--------|
| `x4_ph` | ~2540 | **CORRIGÉ** — guard `denom_ph !== 0` | `h4v = h4l` au point critique (374.14°C, 220.64 bar) |
| `x4_ps` | ~2558 | **CORRIGÉ** — guard `denom_ps !== 0` | `ssV = ssL` au point critique |
| `Kappa_pT` | ~1240 | Non modifié | `cv > 0` garanti dans tout le domaine IAPWS-IF97 |
| `Kappa_ph` | ~1246 | Non modifié | Idem |

---

### AIRCOOLER / WATERCOOLER removed

- `Y_BILAN/ECHANGEURS/AIRCOOLER/` and `Y_BILAN/ECHANGEURS/WATERCOOLER/` deleted (replaced by TUBEANDSHELL).
- Imports/exports removed from `RetroAndBilanComponents.jsx` and `Main_FLOW.jsx`.
- 2026-11-18 : `WATERCOOLER` et `AIRCOOLER` recréés comme **économiseurs Pyrofluid** fumées / eau (`Cooling_HX_eau`) et fumées / air (`Cooling_HX_air`), voir section dédiée plus bas.

---

## Refactoring localStorage nodeId — multi-instance support (2026-06-25)

### Problème résolu
Quand un même type d'équipement (ex: 2 BHF) était utilisé sur des lignes séparées, les deux partageaient les mêmes clés localStorage (ex: `PDC_aero_BHF`), ce qui provoquait des rapports vides et des données mélangées.

### Changements effectués

**1. Génération d'ID stable** — `Main_FLOW.jsx`
- Compteur monotone `nodeIdCounterRef` au lieu de `nodes.length + 1` (évite les collisions après suppression)
- Synchronisé au chargement de projet

**2. ~50 fichiers refactorés** — toutes les clés localStorage suffixées par `_${nodeId}`
- **19 Z_RETRO Parameter_Tabs** : AIRINJECTION, BHF, CO2, COOLINGTOWER, CYCLONE, DENOX, ELECTROFILTER, FB, GF, IACT, IDFAN, QUENCH, REACTOR, RK, SCRUBBER, STACK, TUBEANDSHELL, WATER_INJECTION, WHB
- **19 Y_BILAN tabs** : BouesTab, Recuperator, CombustionTab, tous les Flue_gas_ML et Pollutant_Emission_ML, SEPARATEURS, TUBEANDSHELL_Parameters, CO2, OmTab
- **batchCalculators.js** : toutes les fonctions acceptent `(nodeData, nodeId)` maintenant
- **Main_FLOW.jsx** : `batchResultStorageKey()` fonction, `handleCalculateAll` passe `node.id`, `calcSent_` et `bilanType_whb_RK_` suffixés

**3. DataFlowDisplay** — `C_Components/DataFlowDisplay.jsx`
- Les en-têtes affichent maintenant `BHF (3)` et `BHF (7)` pour distinguer les colonnes
- Les clés metadata (`nodeId`, `nodeName`) filtrées des lignes affichées

**4. Build** — `npm run build` passe sans erreur.

### Branche
`feature/localStorage-nodeId` — non encore mergée dans `main`.

### Pattern localStorage avec nodeId

Tous les fichiers Z_RETRO utilisent le pattern `getStorageKeys(nodeId)` :
```js
const getStorageKeys = (nodeId) => ({
  KEY_NAME: `key_name_EQUIPMENT_${nodeId}`,
  ...
});
// Inside component:
const STORAGE_KEYS = useMemo(() => getStorageKeys(nodeId), [nodeId]);
```

Les fichiers Y_BILAN utilisent des template literals directement :
```js
localStorage.getItem(`emissions_BHF_${nodeId}`)
```

### Clés intentionnellement partagées (PAS de nodeId)
- `'pointE'` — écrit par FB, RK et GF Parameter_Tabs; lu par LinearGraph et GlobalRetroReport

---

## Convention `dataFlow.T` / `T_in` en mode Retro (2026-07-06)

En mode **Retro**, le calcul remonte STACK → four. Chaque nœud lit la température de son voisin **aval** via `nodeData.result.dataFlow.T` et calcule son état **amont**.

- **`dataFlow.T`** = température **amont** du nœud (côté four). **C'est la valeur propagée** : le nœud amont suivant la lit comme sa propre température aval. NE PAS la modifier/inverser sous peine de casser toute la chaîne.
- **`dataFlow.T_in`** = température **aval** reçue (informative). Le nom « T_in » est trompeur : il contient la température de **sortie** (aval), pas l'entrée physique.
- Dans les rapports Retro : `df.T` est étiqueté « entrée » (amont chaud), `df.T_in` « sortie » (aval froid) — physiquement correct pour un refroidisseur (QUENCH/WATER_INJECTION).

### Renommage d'affichage QUENCH / WATER_INJECTION (T_in ↔ T)
Sur demande utilisateur, le panneau « Calculation Results » de `QUENCH_Parameter_Tab` et `WATER_INJECTION_Parameter_Tab` affiche la valeur **amont** sous l'étiquette `T_in` et la valeur **aval** sous `T` (inverse de la convention interne). C'est fait via une **copie d'affichage** `displayResult` (useMemo) qui échange uniquement les étiquettes des clés `T`/`T_in` du `dataFlow` — **le `dataFlow` réellement propagé reste inchangé** (`dataFlow.T` = amont). Même pattern que la copie d'affichage NCV → « NCV [kcal/kg] » dans `RK_Parameter_Tab`.

### QUENCH / WATER_INJECTION `option_Qeau` (retro, `*_calculations2.js`)
Doit être l'**inverse cohérent** de `option_T` :
- Composition amont : `Qm_H2O_kg_h - Qeau` (on RETIRE l'eau injectée, elle n'est pas encore présente en amont). Cohérent avec `temp_bef_add_wat` qui calcule l'amont avec `(m_H2O - Qeau)`.
- Clé de sortie : `Qm_H2O_kg_h` (et non `Qm_H2O_total_kg_h`) — attendue par les nœuds/rapports en amont.
- Un `Qeau` supérieur à la teneur en eau du gaz aval sature `temp_bef_add_wat` à sa borne (T ≈ 3000 °C) : ce n'est pas un bug, c'est un débit d'eau physiquement trop grand pour ce débit de gaz.

---

## Enthalpies des gaz — NIST Shomate (2026-11-17)

`A_Transverse_fonction/enthalpy_gas.js` : `fh_CO2`, `fh_N2`, `fh_O2`, `fh_H2O`, `fh_CO`, `fh_H2`, `fh_SO2`, `fh_HCl` utilisent désormais l'équation de Shomate du NIST Chemistry WebBook (plages officielles, intégration analytique par morceaux, h(0 °C) = 0, continuité aux bornes). Écart vs NIST-JANAF < 0,1 %. Mêmes signatures (T en °C → kJ/kg), donc tous les appelants (~40 fichiers) en bénéficient sans modification.
- Les anciennes corrélations (Kelley) sont conservées sous le suffixe `_Kelley` (non utilisées). Elles sous-estimaient CO2 de 1,4 % et SO2 de 1,4 % à 870 °C, et `fh_H2O` avait un décalage de +13,7 kJ/kg à 0 °C.
- Les fonctions d'entropie `fs_*` et les solides (`fh_CaO`, `fh_SiO2`…) ne sont pas modifiés.
- `Y_BILAN/FB/2_CombustionTab.jsx` : la température de sortie HX est inversée par bissection avec la même loi d'enthalpie que celle qui a donné la cible (avant : `TempSortieFumees`, polynômes Pyrofluid, même en mode outil).
- Ne pas modifier les polynômes Pyrofluid (`cp_dt_*`, `H_Fumees` dans `bilan_fct_FB.jsx`) : ils servent au mode « Calcul Pyrofluid d'origine ».

### Chaleur latente de l'eau — une seule valeur (2026-11-17)

`constantes.js` : `Lv = 597.5 * cp_ref` = 2 501,6 kJ/kg (chaleur latente à 0 °C ; avant 590 kcal/kg, valeur vers 13 °C, −1,2 %). Référence de toutes les enthalpies d'eau : liquide à 0 °C → vapeur à 0 °C (`Lv`) → vapeur chauffée de 0 °C à T (`fh_H2O`). Les valeurs écrites en dur (2501.6 dans FB/GF/TflammeAdia, 540 × 4.1868 dans `h_fumee` et `Tableau_fumee_inverse`) ont été remplacées par `Lv`.
- Ne pas utiliser 540 kcal/kg (latente à 100 °C) avec `fh_H2O`, qui part de 0 °C.
- Exceptions volontaires : 597 kcal/kg dans les onglets Design quench/saturateur/tour de lavage (formules Pyrofluid d'origine) et 596,8 kcal/kg du mode « Calcul Pyrofluid d'origine » de FB.

### Cohérence des propriétés physiques (2026-11-17)

- **Turbine WHB** (`Y_BILAN/WHB/6_WHB_ValoVapeur3_ML.jsx`) : propriétés de la vapeur par IAPWS-IF97 (`steam_table3.js`), pressions en **bar absolus** (la pression chaudière WHB, en bar relatifs, est convertie +1 à l'initialisation). Après un soutirage, l'état réel (P, h) est conservé (`s_ph`, `T_ph`). Ne pas revenir aux corrélations approchées (Tsat −44 °C à 40 bar, détente à condensation −26 %).
- **Air FB / GF** : `hAir_kW(modeOrigine)` et `hVap_kW(modeOrigine)` (`bilan_fct_FB.jsx`) — NIST en mode outil, Cp Pyrofluid en mode « Calcul Pyrofluid d'origine ». GF n'a pas de mode d'origine → NIST. `4_Recuperator.jsx` suit `innerData.FB_modeOrigine`.
- **IACT** (Bilan et Retro) : débit d'air par bilan enthalpique NIST (plus de Cp constant 1,005).
- **Masse volumique de l'air** : `rho_air` (constantes.js, air O2/N2 21/79 à 22,4 Nm³/kmol) pour les nœuds qui modélisent l'air en 0,233/0,767 (RK, CO2, AIRINJECTION, TUBEANDSHELL, `Q_AIR_DILUTION`). **FB et GF gardent 1,293** : cohérent avec `Vol_Air_e` (air VB avec argon, ≈ 1,293 à 21 % O2).
- **Cl / S** dans les onglets polluants : `HCl × M_Cl / M_HCl` et `SO2 × M_S / M_SO2` (molarMasses). DeNOx non modifié (choix de Cédric).
- **RK / CO2** : O2 en excès des fumées stœchiométriques calculé en Nm³ (avant : kg/h pris pour des Nm³/h).
- **DeNOx** : réchauffage (TflammeAdia, mélange par moyenne volumique) volontairement laissé tel quel — ne pas modifier.

### Turbine sans turbine et PCI Dulong (2026-11-17)

- **Turbine WHB, mode « sans turbine »** : les niveaux de pression plus bas sont alimentés par vanne de détente → **isenthalpique** (h = h entrée, vapeur surchauffée), plus isentropique. Libellé « Enthalpie massique vapeur » (`specificSteamEnthalpy`, 10 langues) distinct de `steamEnthalpy` [kJ/h] de l'onglet Paramètres.
- **FB, composition de combustible personnalisée** : `pciDulong_kcal_kg` (2_CombustionTab.jsx) — composition ramenée à 100 %, PCS de Dulong → PCI (− 9 H/100 × Lv), puis × densité pour un gaz (kcal/Nm³). Contrôle : gaz naturel 8 870 kcal/Nm³ (table 8 875). Dulong sous-estime les gaz riches en O lié au C (biogaz ≈ −6 %).

### Four rotatif (Y_BILAN/RK) — corrections du 2026-11-17

- **Chlore** : un atome de Cl lie un atome de H (HCl). Coefficient O2 stœchiométrique du Cl = **−0,25** kmol O2/kmol Cl (avant −0,5) ; eau stœchiométrique = H2 − **Cl/2** (avant H2 − Cl) dans `1_CombustionParameters1.jsx`, `2_Flue_gas1.jsx` et la copie `Y_BILAN/CO2/1_Capture_Parameters.jsx`.
- **Polluants** (`3_Pollutant_Emission1.jsx`) : replis `?? 0` au lieu de `|| 1` (plus de Cl, S, inertes fantômes à 1 kg/h). `Tableau_polluants.jsx` renvoie 0 (et non Infinity) si le débit sec est nul.
- **Design** : vitesse des fumées dans le four en m³/h réels à `T_OUT` (`coeff_Nm3_to_m3`). Le taux de remplissage (Freeman) était déjà correct (×100).
- **OPEX** : l'onglet Design écrit déjà consoElec1-8, gaz, air comprimé, eau, réactifs, cendres dans innerData. Comme tous les onglets de calcul, il reste monté en arrière-plan (voir « Calcul des onglets sans les ouvrir »), donc l'OPEX et le rapport sont alimentés sans ouvrir l'onglet Design.

### OPEX — onglet OPEX = source unique des rapports (2026-11-18)

- `G_Graphiques/Dashboard/opexTableau.js` : fonctions pures. `calculerOpex(innerData, { sauve, config, t })` construit les six tableaux (élec, eau, réactifs avec CAP, énergie, CO2, coût) : lignes calculées depuis `innerData` + saisies de l'onglet. Les lignes de coût et de CO2 sont recalculées à partir des tableaux de consommation affichés. `opexDuNoeud(innerData, type, nodeId, t)` = état affiché dans l'onglet OPEX du nœud.
- Saisies : `valeurFixee` / `libelleFixe` (la ligne n'est plus mise à jour par le calcul ; bouton ↺ pour revenir), lignes `manuelle` (clé `row<horodatage>`), lignes calculées supprimées dans `supprimees`. Aucun arrondi avant calcul.
- Persistance par nœud : localStorage `opexDashboard_<TYPE>_<nodeId>` (lu en premier), copie `innerData['opexTableau_<TYPE>_<nodeId>']` (voyage avec le projet JSON), puis ancienne clé `opexDashboard_<TYPE>` (migration).
- `OpexDashboard.jsx` (onglet) et `D_BILAN_Rapports/OpexRapport.jsx` (section OPEX de tous les `*_Report.jsx`) utilisent ce module ; la synthèse OPEX de `GlobalReport.jsx` additionne les tableaux de coût des nœuds (`typeOpexDuLabel` : `RK+SCC` → `RK`). Les wrappers `*_Opex.jsx` et les rapports reçoivent `nodeId`.
- `activeNodes_*` (panneau OPEX de `Main_FLOW`) : toujours horaires.
- **Clés OPEX propres au nœud** (`estCleOpexNoeud` : `consoElec*`, `labelElec*`, `Conso_*`, `conso_gaz/fuel/air/…`, `CO2_transport_*`, `cout_transport_*`, `activeNodes_*`, `opexTableau_*`) : `Main_FLOW.onSendData` ne les recopie plus dans le nœud aval (`sansClesOpex`). FB et GF les ajoutent explicitement à leur envoi (liste blanche).
- Nouvel équipement : écrire les clés standard dans `innerData` (nombres, pas `toFixed`), passer `nodeId` à l'onglet OPEX et au rapport, mettre `<OpexRapport innerData equipmentType nodeId currentLanguage />` dans la section OPEX du rapport. Ne pas recréer de calcul de coût dans le rapport.
- **Chaudière (WHB)** : onglet OPEX branché (`5_WHB_Opex.jsx` → `OpexDashboard`, `OpexDashboard_WHB.jsx` supprimé). `configOpex('WHB')` active la **valorisation** : tableaux `production` (électricité kWé, vapeur t/h) et `recettes` (€/h), coût net = coût − recettes. Lue dans les résultats de l'onglet Valorisation vapeur (`turbine_type`, `niveauN_*`, `soutirages_data`, `puissance_electrique_kW`, échappement si ≥ 1 bar a) ; prix : électricité vendue, vapeur HP / BP P1 / BP P2.
- **Électrofiltre** : onglet OPEX activé ; le Design reprend aussi les réactifs de l'onglet Polluants (`Conso_reactifs`).
- **Tour de refroidissement** : le Design écrit l'eau pulvérisée (`Q_eau_kg_h` de l'onglet Gaz) dans le type d'eau choisi et la pompe (débit × pression de pulvérisation / rendement) ; plus de valeurs fictives.
- **Écriture OPEX depuis un Design** (tour, électrofiltre, chaudière, quench) : `t` en `useCallback`, charge utile en `useMemo`, garde `lastSync` (JSON) avant `setInnerData` — sinon boucle de rendu. Écrire **toutes** les clés OPEX standard (0 pour celles non consommées) pour effacer d'anciennes valeurs, sans arrondi.

- **Transport des résidus** : `A_Transverse_fonction/transport_residus.js` (`coutTransportResidus_h`, `rotationsCamion_an`) — coût = rotations (t/h ÷ charge utile 15/20/25 t) × distance × 2 (aller-retour) × prix €/km. Utilisé par les Design BHF, électrofiltre, chaudière, four rotatif, réacteur. Ne plus écrire « prix × distance » en €/h.
- **CO2 de l'air comprimé** : pas de ligne CO2 « air comprimé » dans l'onglet OPEX ; le CO2 vient de la ligne d'électricité du compresseur écrite par le Design (clé `row3` du tableau CO2 laissée libre).

- **Prix des réactifs en €/t** (`reagentsTypes[*].cost`) : tout le code fait kg/h ÷ 1000 × prix. `migrerPrixReactifs()` (appelée par `writeDefaultsToStorage` au démarrage) convertit une seule fois les anciennes valeurs en €/kg (< 10 → × 1000), drapeau `opex_reagentsCostUnit = 'EUR_t'`.

- **CO2 du transport des réactifs** : `reagentsTypes[*].co2PerTrip` = kg CO2 par **tonne** livrée = `co2PerTKm × distance × ALLER_RETOUR` (`co2TransportReactif_kg_t`, recalculé au chargement et à chaque `updateOpexData`). Tous les onglets Polluants et l'onglet OPEX font kg/h ÷ 1000 × `co2PerTrip`. `ALLER_RETOUR` (= 2) est unique, partagé avec `transport_residus.js`.

### FB — onglet HX / récupérateur (2026-11-18)

- Aligné sur Pyrofluid `ClassRecuperateur.vb` (18/11/2026, validé à 0,05 % près) : DTLM entre l'air soufflé (T air + 45 °C) et l'air préchauffé ; surface = UA [kcal/h·°C] / U encrassé [kcal/h·m²·°C] (`KCAL_H_PAR_KW`) ; section calandre = débit réel au freeboard / vitesse ; `DP_RecupAir` reçoit des **Nm³/h** ; pression air sortie = P voûte + ligne (50 mmCE, `PDC_reseau_sortie_entree_boite_mmCe`), pression soufflante = + PDC côté air ; P freeboard lue dans `PressionFreeboard` (onglet Voûte) ; `P_sortie_HX_mmCE` (envoyé à l'aval en `P_out_mmCE`) = P freeboard − PDC côté fumées (40 mmCE). P voûte = valeur saisie de l'onglet Voûte (`PressionVouteDefaut_mmCe`, 2000 par défaut), comme Pyrofluid (`PressionVoute` saisie, jamais recalculée). Débits d'air (échangeur, soufflante) **humides** — volontairement différent de Pyrofluid, qui prend l'air sec (erreur de Pyrofluid selon Cédric) : +1,3 % sur Valence. Ne pas passer au débit sec.
- **Échauffement de la soufflante : +45 °C fixe** (convention Pyrofluid, `T_soufflante = Temp_air_fluidisation_av_prechauffe_C + 45` dans `2_CombustionTab.jsx`, repris par l'onglet HX pour la DTLM et par l'enthalpie de l'air soufflé / de balayage). Décision de Cédric (18/11/2026) : **garder +45 °C**, ne pas le rendre paramétrable ni le calculer à partir de la compression, bien que la compression réelle échauffe l'air d'environ 26 °C (rendement 70 %) — voir `a_faire.md`, section Ventilateur.
- Options (`freeParams_HX_FB_<nodeId>`, `_version: 3`) : encrassement 25 % par défaut (saisissable), 2 ou 3 passes, `airSecTertVentilateur` (false = Pyrofluid), `echangeurParFour` (true = Pyrofluid). Rendement du récupérateur 95 % par défaut (`thermalParams.Rdt_HX`, onglet Combustion).
- Mode par four : `HX_facteur` = 1 / nombre de fours. Les grandeurs extensives de l'onglet HX et de la section HX du rapport sont pour **un** échangeur ; `H_air_soufflante_kW` reste le total (clé partagée avec l'onglet Combustion) ; `Puissance_elec_ventilateur_kW` = total de tous les ventilateurs (OPEX), `Puissance_elec_ventilateur_unitaire_kW` = un ventilateur.
- L'onglet Combustion écrit `Vair_instru_tot_Nm3_h`, `Vair_sec_tot_Nm3_h`, `Vair_tert_tot_Nm3_h` pour le débit du ventilateur.

### FB — onglet Voûte : nombre de trous par tuyère (2026-11-18)

- Paramètre `NbTrousImpose` (« Nombre de trous par tuyère ») : **22 par défaut** (Pyrofluid, `ClassDimFourVoute.remplissagge`), 30 au plus ; vidé = calculé à partir de la vitesse tuyère cible (arrondi au plus proche comme Pyrofluid, au moins 1, plafond 30 — décision de Cédric le 18/11/2026) ; saisi = imposé (comme la saisie de Pyrofluid). `innerData.NbTrousImpose` absent → 22, `''` → calculé. Comme Pyrofluid, changer la voûte (liste ou diamètre hors standard) ou le nombre de fours recalcule le nombre de trous (`CLES_RECALCUL_TROUS`, aussi dans la recherche automatique) ; il dépend du nombre de tuyères, pas du diamètre lui-même. Le diamètre des trous, la vitesse cible ou le nombre de tuyères hors standard ne le recalculent pas (comme Pyrofluid), il fixe la vitesse réelle des tuyères, donc la PDC tuyères et la pression du freeboard reprise par l'onglet HX. `NbTrousCalcule` = valeur qu'on aurait sans imposition (affichée en indication).
- Valence : 16 trous de 6 mm imposés → 99,9 m/s, PDC tuyères 453 mmCE, P freeboard −3 mmCE (mode d'origine), comme le rapport Pyrofluid.

### FB / GF — excès d'air global, poussières et cendres (2026-11-19)

- **Excès d'air global** (onglet Combustion FB et GF, lecture seule) : air sec total entrant / air sec stœchiométrique − 1, définition du HTFB (l'air de balayage, secondaire et tertiaire compte dans l'excès). Air stœchiométrique de chaque combustible = air de combustion / (1 + excès saisi). Écrit dans `innerData.Exces_air` (ligne « Excès d'air global » des rapports ; avant : copie de l'excès d'air lit / primaire saisi). St. Paul, 40 % saisis → 45,6 %.
- **DustFlyAsh FB** (`3_Pollutant_Emission.jsx`) = fines de l'onglet 1 (`MM_cyclones_kg_h`, Rosin-Rammler < d_cut) − métaux suivis à part (Hg, PCDD/F, Cd + Tl, As + Pb + Cr + Cu + Ni + Mn), comptés à 100 % dans les fumées sur leurs lignes. Al, Fe, Zn, Mg, Se restent dans les poussières ; HF (gaz) n'est pas retiré. Avant : tous les métaux de l'onglet 1 et HF retirés (St. Paul : 63 kg/h au lieu de 134 kg/h). GF : poussières = concentration saisie × débit sec (inchangé).
- **Groupe `Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V`** (FB et GF) = As + Pb + Cr + Cu + Ni + Mn (Sb, Co, V non saisis). Avant : contenait Al, Fe, Zn et pas Mn (≈ 22 fois trop avec les valeurs par défaut).
- **Résidus** (FB et GF) : `Inert_kg_h` = `innerData.MM_kg_h` (matière minérale / cendres de l'onglet 1). Avant : `Inert_kg_h` n'était écrit par aucun onglet → cendres de fond et cendres volantes toujours à 0. Cendres de fond sèches = matière minérale − cendres volantes + résidus de neutralisation ; FB : cendres volantes = fines.
- L'explication du calcul (valeurs et formules) est affichée en bas de l'onglet Polluant FB (clés `dustNote*`, 10 langues). « Débit boue brute » (et non « Débit de déchets ») dans les paramètres calculés FB, une décimale.

### FB — appoint de sable (2026-11-19)

- Onglet Caractéristiques des Boues, carte « Appoint de sable » sous la répartition des matières minérales : cas `standard` 4–6, `eleve` 10–15, `inertes` (boues chargées en inertes grossiers) 15–25 kg de sable / t MS (`CAS_APPOINT_SABLE`, plages données par Cédric) ; choisir un cas met le milieu de la plage, le ratio reste saisissable (alerte hors plage). localStorage `bouesTab_appointSable_FB_<nodeId>`.
- Écrit dans `innerData` : `Appoint_sable_cas`, `Appoint_sable_kg_tMS`, `Appoint_sable_kg_h` (= ratio × MS kg/h / 1000) et `Conso_sable_kg` (clé OPEX du nœud).
- OPEX : `configOpex('FB').appointSable` → ligne `row10` « Sable d'appoint » du tableau des réactifs (FB seulement), comptée dans « Consommation de réactifs ». Prix `sandMakeupPrice` en **€/kg** (0,1 par défaut), saisi dans le panneau des paramètres OPEX, onglet Sous-produits, cadre « Appoint de sable » ; converti en €/t comme les réactifs. Pas de CO2 de transport pour le sable.

### Points ouverts

Les anomalies relevées mais non corrigées (GF, RK) sont listées dans `a_faire.md` à la racine du dépôt. Cocher / retirer une ligne une fois corrigée.

### Économiseurs fumées / eau et fumées / air — nœuds `Cooling_HX_eau` et `Cooling_HX_air` (2026-11-18)

- Reprise de Pyrofluid `ClassEconomiseur.vb` + `Economiseur.vb` (dossier « 04 Refroidissement Fumées », bloc 4-1) : le fluide de Pyrofluid (`OptionFluide`) donne un équipement par fluide — eau → `Cooling_HX_eau` (`WATERCOOLER`), air → `Cooling_HX_air` (`AIRCOOLER`).
- **Code commun** : `Y_BILAN/ECHANGEURS/ECONOMISEUR/` (`economiseur_calculs.js` calculs purs, `EconomiseurMainPage.jsx`, onglets `1_` Gaz, `2_` Polluants, `3_` Design, `Economiseur_Report.jsx`, `economiseur_ui.jsx`) et `Z_RETRO/ECONOMISEUR/` (`economiseur_retro.js`, onglet et rapport Retro). Chaque équipement garde son dossier (`Y_BILAN/ECHANGEURS/<CODE>/` : MainPage = config + ordre des onglets Gaz → Polluants → Design → OPEX → Rapport, `4_<CODE>_Opex.jsx`, `<CODE>_Report.jsx`, `<CODE>_config.js`, `<CODE>_traduction.jsx` ; `Z_RETRO/<CODE>/` : `performCalculation_<CODE>` → `{ data<CODE>, dataFlow }`, Parameter_Tab, Retro_Rapport, traductions réexportées). Les deux fichiers de traduction ont les mêmes clés génériques (`TfluideEntree`, `DebitFluideEch`, `auxTitre`…), textes propres au fluide.
- Options Pyrofluid (`calcul`) : T° entrée fluide, T° sortie fluide, T° sortie fumées, **débit de fluide (défaut)** ; en Retro, « T° entrée fumées » remplace « T° sortie fumées » (imposée par l'aval). En changeant d'option, la valeur calculée devient la donnée (comme Pyrofluid).
- Calculs : Q fumées = H(T entrée) − H(T sortie) ; Q fluide = Rdt × Q fumées ; DTml contre-courant avec les 5 contrôles Pyrofluid (pas de surface si l'un échoue, dont T sortie fumées > T sortie fluide) ; F = 1 ; UA = Q fumées / DTml ; S = UA / U / 1,25 × (1 + encrassement) ; Rdt 95 %, encrassement 25 %, ΔP fumées 60 mmCE. **Eau** : U = 66 kcal/h/m²/°C (Lagny), pression d'eau = saturation à T sortie eau. **Air** : U = 39 kcal/h/m²/°C (2 passes), Cp air Pyrofluid 0,241 + 0,000044 T kcal/kg/°C (le second degré de Pyrofluid est résolu par dichotomie, même résultat), débit en kg/h d'air sec + Nm³/h (`rho_air`). Alertes Pyrofluid : T sortie fumées < 125 °C ou > 300 °C, Rdt hors 70–100 %, encrassement hors 20–35 %.
- Propriétés : mode outil = NIST (`h_fumee`, `fh_AIR`) + IAPWS (`hL_T`, `psat_T`) ; mode « Calcul Pyrofluid d'origine » = `H_Fumees` (Cp Pyrofluid), Cp eau 1 kcal/kg/°C, Cp air Pyrofluid, Antoine de Pyrofluid pour la pression d'eau.
- Un échangeur par four par défaut (Pyrofluid divise par `NombreFour`, repris de l'amont) ou un pour l'ensemble ; le débit de fluide saisi est **par échangeur**.
- Pas de captation : polluants et résidus transmis tels quels. OPEX (absent de Pyrofluid, `AUXILIAIRE`) : eau → pompe (débit × 2 bar / 70 %), air → ventilateur (débit à T entrée × 150 mmCE / 70 %), 0 pour l'ignorer. `typeOpexDuLabel` : `Cooling_HX_eau` → `WATERCOOLER`, `Cooling_HX_air` → `AIRCOOLER`.
- Paramètres et résultat tenus dans `EconomiseurMainPage` (partagés par les onglets, sortie indépendante de l'onglet ouvert), résultats dans `innerData[<CODE>]`. L'entrée amont est relue à chaque ouverture grâce à `data.entrees` (voir « Entrée d'un nœud à la réouverture »).
- localStorage : `params_<CODE>_<nodeId>`, `emissions2_<CODE>_<nodeId>` (Bilan), `params_retro_<CODE>_<nodeId>`, `calculationResult_<CODE>_<nodeId>` (Retro, lus par `batchCalculators.js`). `migrerParams` reprend les anciens noms de l'économiseur à eau (`T_eau_entree_C`, `Debit_eau`…).
- Valence 450 kg MS/h (563 → 220 °C, eau 160 → 180 °C), mode d'origine : Q fumées 785 195 kcal/h (Pyrofluid 785 145), débit d'eau 37 297 kg/h (37 294), DTml 174,2 °C (174,1), S 68,3 m² (68,3), P eau 10,07 bar (10,1), débit fumées sortie ≈ 11 548 m³/h (11 545). Mode outil : Q +0,9 %, débit d'eau −3,5 % (Cp réel de l'eau ≈ 4,4 kJ/kg/K à 170 °C). Air (mêmes fumées, air 20 → 180 °C) : débit et T sortie identiques aux formules VB (18 998 kg/h ; 271,25 °C pour 12 000 kg/h) ; NIST +1,2 % sur le débit.

### Entrée d'un nœud à la réouverture — `data.entrees` (2026-11-18)

- **Bug corrigé (tous les équipements, Bilan et Retro)** : au « Retour au schéma », `Main_FLOW.onSendData` range la **sortie** du nœud dans son propre `data.result` (lu par les rapports). À la réouverture, le nœud relisait donc sa propre sortie comme entrée (`T_OUT`, `FG_OUT_kg_h`, `P_OUT`, polluants, résidus en Bilan ; `dataFlow` en Retro) : refroidissement, captation ou perte de charge appliqués une seconde fois (ex. IACT : P −50, −60, −70 mmCE à chaque réouverture ; QUENCH : entrée 200 °C au lieu de 500 °C, plus d'eau injectée).
- Correction (`C_Components/entreeNoeud.js`, `Main_FLOW.jsx`) : chaque envoi mémorise aussi la sortie reçue par le nœud cible dans `data.entrees[<id de l'émetteur>]` (`onSendData` et `propagateResultUpstream` de Calc. All). À l'ouverture, `nodeDataSelection` (= `donneesAvecEntree`) superpose cette entrée au résultat du nœud, comme au premier envoi de l'amont (valeurs vides ignorées). Sens du calcul : en Bilan l'émetteur est la source du lien, en Retro la cible. Seulement si le nœud a **un seul** voisin amont relié avec une entrée mémorisée (mélangeur 2 → 1 inchangé) ; un nœud sans entrée (four) reçoit son `data` tel quel.
- `nodeDataSelection` est mémoïsé sur `[selectedNode, edges, mode]` : les Parameter_Tab Retro recalculent à chaque changement de `nodeData` (ne pas recréer l'objet à chaque rendu, sinon boucle d'envoi).
- Les composants reçoivent une copie : les mutations de `innerData` ne modifient plus le `data.result` stocké du nœud ; seul l'envoi (« Retour au schéma ») l'enregistre.
- Projets enregistrés avant la correction : `entrees` absent → ancien comportement jusqu'à ce que le nœud amont renvoie ses résultats une fois.

### Calcul des onglets sans les ouvrir — `ContenuOnglets` (2026-11-18)

- **Problème corrigé (mode Bilan, tous les équipements)** : seul l'onglet affiché était monté. Un onglet jamais ouvert ne calculait rien, donc « Retour au schéma » envoyait des données incomplètes (ex. pression de sortie de l'électrofiltre et du quench, calculée dans l'onglet Design : `undefined` ou 0 si le Design n'avait pas été ouvert).
- `C_Components/ContenuOnglets.jsx` : à l'ouverture du nœud, **tous les onglets de calcul sont montés** (cachés en `display: none` sauf l'onglet actif) ; les onglets d'affichage marqués `affichage: true` (OPEX, Rapport) ne sont montés que lorsqu'ils sont affichés. Utilisé par les MainPage de tous les équipements Bilan (FB et GF via `renderOnglet(name)`). Nouvel équipement : `affichage: true` sur les onglets OPEX et Rapport, puis `<ContenuOnglets tabs={tabs} actif={activeTab} />` (pages à index : `actif={tabs[activeTabIndex]?.name}`).
- Vérifié sur les 23 équipements Bilan (jsdom) : sortie envoyée sans ouvrir aucun onglet = sortie de l'ancien code après ouverture de tous les onglets dans l'ordre ; aucun rendu en boucle.
- **Règles pour un onglet de calcul** (il est monté en même temps que les onglets amont, qui peuvent finir de calculer après lui) :
  - Un effet qui écrit dans `innerData` doit dépendre de **toutes** les valeurs qu'il écrit : utiliser `useSyncInnerData(setInnerData, payload)` (`C_Components/useSyncInnerData.js`, dépendance = contenu sérialisé, écriture seulement s'il a changé). Appliqué aux onglets Polluants FB et GF (avant : dépendances partielles → polluants restés à 0).
  - Ne pas muter `innerData` dans un effet sans prévenir : les autres onglets ne sont pas re-rendus. Passer par `useSyncInnerData` (onglet Combustion RK).
  - Un paramètre initialisé depuis `innerData` au montage (`useState(() => innerData.X)`) ne voit pas une valeur calculée ensuite par un autre onglet : le faire suivre la valeur amont (dernière valeur appliquée dans un `useRef` + effet), une saisie manuelle restant en place tant que l'amont ne change pas. Appliqué à la tour de lavage SCRUBBER (`CHAMPS_FLUX`, `_flux` : fumées, SO2, HCl, T, données du quench) et au Design DENOX (débit de gaz après réchauffage).
  - Dans les dépendances d'effet, `t` doit être stable (`useCallback` sur `languageCode`) et les fonctions passées en `setInnerData` aussi (pas de flèche en ligne) ; sinon boucle de rendu, car l'onglet reste monté. Corrigé : Design AIRINJECTION, WATER_INJECTION, QUENCHsimple, CYCLONE, `Laveur_basique` ; gardes `lastSync` (JSON) dans les Design REACTOR et BHF ; FB / GF : `setInnerDataForCalcOpex` stable pour les onglets Polluants et OPEX.
  - États initiaux du type affiché : onglet Combustion RK, `useState(0)` (et non `useState(rows2)`, qui faisait planter l'onglet Polluants : « Objects are not valid as a React child »).
- **Pression d'entrée** : les équipements aval lisent leur pression d'entrée dans `P_OUT`. FB n'envoyait que `P_out_mmCE` → l'aval repartait de 0 mmCE. FB envoie maintenant aussi `P_OUT` (= `P_sortie_HX_mmCE`).

### Calc. All — mode Bilan (2026-11-18)

- Le bouton **⚙ Calc. All** est aussi actif en Bilan (`handleCalculateAllBilan`) : chaque nœud est calculé sans être ouvert, du four vers la cheminée (`getTopologicalOrder`), puis envoie ses résultats comme « Retour au schéma ».
- Pas de fonctions de calcul pures en Bilan (les calculs sont dans les onglets) : la MainPage du nœud est montée **hors écran** par `C_Components/CalculBilanCache.jsx` (tous ses onglets de calcul sont montés grâce à `ContenuOnglets`), avec l'entrée reçue de l'amont (`donneesAvecEntree`). Quand plus rien ne bouge (ni rendu de la MainPage ni changement du DOM pendant 300 ms, 15 s au plus), l'envoi enregistré par la MainPage via `useEnvoiAuto(sendAllData)` (`C_Components/envoiAuto.js`, contexte absent hors Calc. All) est déclenché ; le résultat capturé est appliqué par `appliquerEnvoi` (`C_Components/entreeNoeud.js`), la même fonction que `onSendData` (« Retour au schéma »). Une erreur dans un nœud (`GardeErreur`) ou une page qui ne s'enregistre pas → nœud ignoré, compté dans le bandeau « ⚠ n/N nœuds calculés ».
- Le panneau du nœud ouvert est fermé au lancement (mêmes clés localStorage). Les composants par type de nœud sont dans `COMPOSANTS_BILAN` / `COMPOSANTS_RETRO` (niveau module de `Main_FLOW.jsx`).
- Vérifié (jsdom, chaîne FB → WHB → électrofiltre → quench → DeNOx → tour de lavage → ventilateur → cheminée) : résultats de tous les nœuds identiques à l'ouverture manuelle de chaque nœud suivie de « Retour au schéma » ; ≈ 0,3 à 1,5 s par nœud.
- Séparateur 1 → 2 : comme l'envoi manuel, seul le premier voisin aval reçoit les données.

### Pertes de charge côté fumées — DeNOx, tour de lavage, chaudière (2026-11-18)

Règle commune en Bilan : P sortie = P entrée (`P_OUT` envoyé par l'amont) − perte de charge ; écrit dans `innerData` : `Pin_mmCE`, `PDC_<EQ>_mmCE`, `P_out_mmCE` (envoyé à l'aval en `P_OUT`), affiché dans l'onglet et dans le rapport.
- **DeNOx** (`3_DENOX_Design1_ML.jsx`, section « Pression aéraulique ») : perte de charge **calculée** selon la technologie (estimation existante en Pa : plaques 800 Pa + 100 Pa par couche supplémentaire, nid d'abeilles 700 Pa, lit fixe 1 500 + 300 × hauteur) ou **imposée** (`PDC_DENOX_mode`, `PDC_DENOX_impose_mmCE`, 100 mmCE par défaut). La même valeur sert au ventilateur (OPEX). Avant : `30 − PDC FAM` (pression d'entrée ignorée) ; le champ « PDC » de la section FAM a été retiré.
- **Tour de lavage** (`4_SCRUBBER_TourLavage.jsx`, section « Pression aéraulique ») : **calculée** = garnissage + dévésiculeur (formules Pyrofluid déjà présentes, `dPGarn` + `dPDeves`) ou **imposée** (`inp.modePDC`, `inp.pdcImposee`, 100 mmCE). `SCRUBBERMainPage` envoie `P_OUT`. Une tour noyée (taux d'engorgement > 70 %, diamètre retenu trop petit) donne une perte de charge garnissage très élevée : dimensionner le diamètre.
- **Chaudière** (`4_WHB_Design_ML.jsx`) : champ existant, maintenant **100 mmCE par défaut** (avant 0) et conservé dans `innerData.PDC_WHB_mmCE` (avant : relu dans `PDC_mmCE`, jamais écrit → remis à 0 à chaque ouverture).
- **Chaudière, mode Retro** : champ « Perte de charge côté fumées » (`PDC_mmCE_WHB_<nodeId>`, 100 mmCE) ; `Z_RETRO/WHB/WHB_pression.js` (`ajouterPressionWHB`) ajoute `dataFlow.P_mmCE` = P aval + PDC (avant : `P_mmCE` absent du `dataFlow` de la chaudière, la chaîne des pressions Retro s'arrêtait là) et `data_pression_WHB`, appliqué par `WHB_Parameter_Tab` et par `batchCalculators.js`. DeNOx et tour de lavage avaient déjà une PDC en Retro.

