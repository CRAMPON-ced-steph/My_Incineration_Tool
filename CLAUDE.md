# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Known Patterns (not bugs)

- **`innerData` mutations in `C_Components/Traitement_fumées.jsx`** (lines 200, 248) — `innerData[row.pollutant] = {...}` inside `calculateValues()` and `innerData['Poutput'] = masses_pollutant_output` at body level are intentional. `innerData` is a plain mutable shared object (not React state), so synchronous body-level mutations are safe and read immediately by downstream body-level code in the same render cycle. This is the established pattern for shared FGT utility components.
- **`niveaux[0/1/2]` in `Y_BILAN/WHB/6_WHB_ValoVapeur3_ML.jsx`** — Array is always constructed with exactly 3 hardcoded elements; fixed-index access is safe.

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
