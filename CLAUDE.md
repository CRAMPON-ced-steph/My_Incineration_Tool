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

Equipment types: `FB` (fluidized bed furnace), `RK` (rotary kiln), `WHB` (waste heat boiler), `QUENCH`, `DENOX`, `BHF`, `COOLINGTOWER`, `ELECTROFILTER`, `CYCLONE`, `REACTOR`, `SCRUBBER`, `CO2`, `STACK`, `IDFAN`, `SEPARATEURS`.

Each equipment's `MainPage` component and `Parameter_Tab` are re-exported from `src/C_Components/RetroAndBilanComponents.jsx`, which acts as a single aggregation point imported by `Main_FLOW.jsx`.

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
