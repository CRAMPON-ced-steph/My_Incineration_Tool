# À faire — GF et RK

Points relevés lors des audits du 17/11/2026, non encore corrigés.
Chiffres obtenus avec les valeurs par défaut de l'outil, sauf mention contraire.

---

## GF — four à grille (`src/Y_BILAN/GF`)

### Décision à prendre avant de corriger
- [ ] **Base de la composition** : les CHONS + cendres sont saisis en % de la matière sèche (somme = 100 avec les cendres). Choisir :
  - (a) matière volatile déduite des cendres : MV = 100 − Cendres ;
  - (b) composition saisie sur la matière volatile, sans les cendres.

### Bilan matière et énergie
- [ ] **Composition appliquée à la mauvaise base** (`2_CombustionTab.jsx`, `1_OmTab.jsx`) : les % sur sec sont multipliés par la matière volatile.
  - Cendres : 504 kg/h au lieu de 600 (MS − MV).
  - 600 kg/h de matière sèche disparaissent du bilan matière (25 % du déchet brut).
  - Une fois corrigé : air 12 750 → 18 200 kg/h, fumées 13 000 → 24 100 Nm³/h.
  - MV saisie (70 %) et cendres (36 %) se contredisent (somme 106 %).
- [ ] **Chaleur latente de l'humidité comptée deux fois** (`2_CombustionTab.jsx`) : le PCI est sur brut (évaporation de l'humidité déjà incluse) et `H_Evap` la retire encore. Il manque 245 kW (90 kcal/kg brut).

### Rapport et sauvegarde
- [ ] **Clé inexistante** (`GF_Report.jsx`, `GFMainPage.jsx`) : le rapport lit `H_NETTE_BOUE_kW`, l'onglet écrit `H_NETTE_OM_kW`. Le rapport retombe sur le PCI d'une boue primaire : H nette ≈ 7 550 kW au lieu de ≈ 3 900 kW. La sauvegarde enregistre la même clé vide.

### Combustibles d'appoint
- [ ] **Table `FUEL_PROPERTIES` fausse** (`2_CombustionTab.jsx`) :
  - FIOUL et BIOGAZ ont la composition du méthane (75 % C / 25 % H) → biogaz : air par kg ≈ 3× trop élevé ; fioul : +18 %.
  - GAZ : densité 0,75 et PCI 7 300 kcal/Nm³ incohérents avec la composition.
  - Reprendre la table corrigée de FB (GAZ, GAZ_V45, BIOGAZ 60/40, FIOUL 86/13,6).

### Cendres et OPEX
- [ ] **Mâchefers toujours nuls** (`3_Pollutant_Emission.jsx`) : l'onglet lit `Inert_kg_h`, jamais écrit dans GF. Relier aux cendres (`MM_kg_h`).
- [ ] **OPEX** (`5_1_GF_calcul_Opex.jsx`) : résidus figés (cendres 1 kg/h, cendres volantes 0) ; puissance du ventilateur (`Puissance_elec_ventilateur_kW`) jamais calculée dans GF.

### Restes du lit fluidisé à boues
- [ ] Le choix « type de boue » (`1_OmTab.jsx`) remplace la composition par celle d'une boue (sur MV, sans cendres) mais garde les 36 % de cendres → somme 136 %.
- [ ] PCI de boue primaire affiché dans le rapport et le résumé (« PCI boue », « Caractéristiques des boues »).
- [ ] `pciDulong` est en réalité un PCS (coefficient 342,5 sur H), calculé sur une composition sur sec.
- [ ] Température d'entrée par défaut 39 °C (valeur de boue) ; nom « air de fluidisation » pour l'air primaire sous grille.

### Valeurs par défaut
- [ ] PCI saisi 1 500 kcal/kg brut alors que la composition donne ≈ 2 850 kcal/kg brut (Dulong) → le cas par défaut demande 86 kg/h de gaz d'appoint.

### Mineur
- [ ] Formule du CO dépendante du débit absolu (non homogène), différente de FB (`Mole_CO` avec la température). 0,13 kg/h par défaut.
- [ ] Corrélation NOx des boues (`MoleNOx`) appliquée aux OM ; oxygène des NOx non retiré du bilan O (≈ 10 kg/h).
- [ ] Onglet Voûte : aucun dimensionnement (surface de grille, temps de séjour) ; répartition de l'air total (y compris l'air du brûleur d'appoint) au prorata des largeurs de zones, non sauvegardées.
- [ ] Synchronisation de l'onglet Combustion : filtre `v !== 0`, une valeur nulle (ex. cendres = 0) n'est jamais reprise.
- [ ] Fichiers non utilisés : `CombustionTabHTML.jsx`, `airCompositionUtils.js`.

---

## RK — four rotatif (`src/Y_BILAN/RK`)

### Décision à prendre avant de corriger
- [ ] **Eau de l'extracteur** : soit reprendre la valeur calculée dans l'onglet Design (rayonnement), soit garder la saisie de l'onglet Fumées et retirer son énergie des fumées.

### Bilan énergie (`2_Flue_gas1.jsx`, `A_Transverse_fonction/bilan_fct_RK.js`)
Exemple : 3 t/h de déchets conditionnés, Cl 3 %, inertes 15 %, sortie 900 °C.
- [ ] **Eau de l'extracteur** (500 kg/h saisis) ajoutée aux fumées sans son énergie de vaporisation : ≈ 600 kW (≈ 4 % de l'enthalpie des fumées). Non reliée à l'eau évaporée calculée dans Design.
- [ ] **Air de dilution compté deux fois** : sa chaleur sensible entre dans `H_in_systemA` puis est recomptée dans `Q_AIR_DILUTION` ; son humidité arrive dans les fumées sans énergie.
  - Écart : −312 kW (2 %) sur l'exemple.
  - Avec 50 % d'air préchauffé à 300 °C : −2 600 kW (17 %), le préchauffage étant crédité à tout l'air, dilution comprise.
- [ ] **Facteur d'air ≠ 1** : la part (λ−1) est dans le N2 des fumées mais ni dans l'air entrant ni dans l'O2 en excès. À λ = 1,3 : bilan matière faux de 4,2 t/h. Juste seulement à λ = 1 (défaut).
- [ ] **Chaleur sensible des cendres/inertes** en sortie de four non comptée : ≈ 120 kW pour 450 kg/h à 900 °C (`H_in_system`, qui l'inclut, n'est pas utilisée).

### Design (`4_RK_Design1.jsx`)
- [ ] Puissance du four 0,21 D²L (≈ 270 kW/m³) jamais comparée à la puissance réelle (masse × PCI).
- [ ] Pertes de paroi calculées mais non reliées aux pertes thermiques (8 %) du bilan.
- [ ] Post-combustion sans bilan : température = sortie four, brûleur = ¼ de la puissance nominale du four, débit de déchets liquides non utilisé.
- [ ] Eau évaporée de l'extracteur : les % H2O et CO2 saisis ne servent pas (émissivité saisie directement).

### OPEX (alimenté par l'onglet Design)
- [ ] Pompe à boue (10 kW) et tapis (2 kW) à puissances fixes.
- [ ] Eau de refroidissement comptée au débit total (25 m³/h) et non aux pertes du circuit (1 %).
- [ ] Cendres d'incinération = saisie « masse d'imbrûlés » (défaut 1 000 kg/h), non reliée aux mâchefers calculés dans l'onglet Polluants une fois la valeur sauvegardée.

### Mineur
- [ ] Corrélation PCI (`cv_kj_kg`, type Boie) différente de FB : +8,6 % par rapport à Dulong sur l'exemple.
- [ ] Humidité de l'air (`calculateWaterContent`) : psat en bar pris comme fraction molaire, rapportée au Nm³ humide (1 à 2 %) ; enthalpie de l'humidité prise à la température « vapeur/eau » au lieu de celle de l'air.
- [ ] `O2_calcule` transmis en % (FB et GF en fraction 0-1) ; le quench devine l'unité.
- [ ] Valeurs par défaut : part d'air préchauffé 0 au démarrage mais 20 % après réinitialisation ; débits de déchets par défaut de 1 à 8 kg/h.
- [ ] Mode Retro (`src/Z_RETRO/RK`) non audité.
