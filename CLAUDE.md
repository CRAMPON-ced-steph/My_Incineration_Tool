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
- Ajouter dans `componentMap` : `...(mode === 'Bilan' ? { <NEW_EQ>: <NEW_EQ>MainPage } : { <NEW_EQ>: <NEW_EQ>_Parameter_Tab })`

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

### Known Patterns (not bugs)

- **`innerData` mutations in `C_Components/Traitement_fumées.jsx`** (lines 200, 248) — `innerData[row.pollutant] = {...}` inside `calculateValues()` and `innerData['Poutput'] = masses_pollutant_output` at body level are intentional. `innerData` is a plain mutable shared object (not React state), so synchronous body-level mutations are safe and read immediately by downstream body-level code in the same render cycle. This is the established pattern for shared FGT utility components.
- **`niveaux[0/1/2]` in `Y_BILAN/WHB/6_WHB_ValoVapeur3_ML.jsx`** — Array is always constructed with exactly 3 hardcoded elements; fixed-index access is safe.
- **`key={selectedNode.id}` on `<Component>` in `Main_FLOW.jsx`** — `renderParameterTab()` passes `key={selectedNode.id}` to force a full unmount/remount whenever the selected node changes. Without this, React reuses the same mounted component instance when two nodes share the same component type (e.g., two BHF nodes), causing `useState(nodeData?.result)` to retain the previous node's computed values instead of reinitialising from the new node's data. Do NOT remove this key.

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

The **⚙ Calc. All** button (Retro mode only, `Main_FLOW.jsx`) triggers an automated sequential recalculation of every batch-calculable node on the canvas, in topological order from STACK to furnace. It replaces the previous approach of mounting hidden React components.

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
