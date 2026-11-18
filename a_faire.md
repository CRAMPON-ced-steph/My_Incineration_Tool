# À faire — GF et RK

Points relevés lors des audits du 17/11/2026, non encore corrigés.
Chiffres obtenus avec les valeurs par défaut de l'outil, sauf mention contraire.

## Ordre de correction proposé

1. **Autres équipements — transmission et stabilité** : résultats non transmis à l'aval, boucles de rendu infinies des onglets Design.
2. **Eau injectée comptée deux fois** (`Qeau_added_to_be_at_T`) : touche dix équipements.
3. **GF — bilan et rapport** : base de la composition (décision à prendre), chaleur latente comptée deux fois, clé du rapport.
4. **RK — bilan énergie et facteur d'air** (décision à prendre sur l'eau de l'extracteur).
5. **Entrées d'air parasites** (13 nœuds) et **ventilateur de tirage** (conversion en m³/h réels).
6. **GF** : table des combustibles, mâchefers et OPEX, restes du lit fluidisé, valeurs par défaut.
7. Le reste (points mineurs, nœud CO₂, mode Retro).

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

---

## Autres équipements (`src/Y_BILAN`) — audit du 17/11/2026

Test : chaque page Bilan ouverte avec un même flux amont (14 200 kg/h de fumées à 220 °C), tous les onglets parcourus, données envoyées.

### Transmission et stabilité
- [ ] **Résultats non transmis à l'aval** : BHF, électrofiltre, cyclone, réacteur, tour de refroidissement et laveur renvoient `T_OUT` et `FG_OUT_kg_h` reçus de l'amont (jamais mis à jour). Leurs températures de sortie, entrées d'air et eau injectée ne sont pas transmises. Laveur : `T_scrubber_out` / `FG_scrubber_out_kg_h` sont calculés mais lus par aucun nœud → ventilateur et cheminée calculés avec les fumées d'entrée du laveur.
- [ ] **Boucles de rendu infinies à l'ouverture de l'onglet Design** (la page ne se stabilise jamais) : quench simple, injection d'eau, réacteur, cyclone (chaudière, électrofiltre et tour de refroidissement corrigés le 18/11/2026). Le BHF avait le même défaut quand l'onglet Polluants n'avait pas été ouvert avant Design : corrigé le 18/11/2026. Cause : effet qui appelle `setInnerData` et dépend de `innerData` ou d'une fonction de traduction `t` recréée à chaque rendu (même défaut que celui déjà corrigé dans le Design du four rotatif).
- [x] **DeNOx : l'onglet OPEX plante** (corrigé le 18/11/2026 : valeurs écrites en nombres, lecture tolérante dans l'onglet OPEX) (page blanche) après passage par Design : `consoElec1`, `consoElec2`, `Conso_Ammonia_kg` écrits en texte (`toFixed`) → `toPrecision` sur une chaîne dans `OpexDashboard`. (Hors calcul de réchauffage, laissé tel quel.)
- [ ] **Nœud CO₂ non implémenté** : onglets 2 à 6 vides ; l'onglet 1 est une copie des fumées du four rotatif et envoie T = 900 °C et des débits nuls en aval.

### Calculs
- [ ] **Eau injectée comptée deux fois** (`Qeau_added_to_be_at_T`, `enthalpy_mix_gas.js`) : la fonction additionne l'eau trouvée par itération et celle du bilan d'énergie. 220 → 150 °C : 921 kg/h au lieu de 483 (×1,9) ; 900 → 200 °C : 16 800 au lieu de 12 200 (+38 %). Utilisée par quench, quench simple, saturateur, injection d'eau, tour de refroidissement, laveur, électrofiltre, cyclone, réacteur, DeNOx.
- [ ] **Électrofiltre, cyclone, réacteur** : la baisse de température est obtenue par injection d'eau (même fonction) → eau fictive ; T sortie par défaut 400 °C quelle que soit l'entrée → si l'entrée est plus froide, débit d'eau négatif.
- [ ] **Entrées d'air parasites** (13 nœuds du modèle commun) : Nm³/h pris pour des kg/h (`O2 = 0,21 × V`, `N2 = 0,79 × V`) → masse d'air ajoutée −22 % (1 000 kg au lieu de 1 288 kg pour 1 000 Nm³/h) ; température de mélange par moyenne pondérée des volumes.
- [ ] **Ventilateur de tirage** (`1_IDFAN_Flue_gas1_ML.jsx`) : arguments inversés `coeff_Nm3_to_m3(T_IN, 0)` → débit réel ≈ débit normal → puissances aéraulique et électrique sous-estimées d'environ 42 % à 200 °C. Cp constants (N2 1,15) au lieu des enthalpies NIST.
- [ ] **Pertes thermiques en % de l'enthalpie totale**, chaleur latente de l'eau des fumées incluse (modèle commun, chaudière) : à 220 °C, 2 % = 55 kW au lieu de 20 kW (×2,7) ; à 900 °C ×1,4.
- [ ] **Injection d'air** : T sortie par défaut 400 °C transmise même si l'entrée est plus froide (le gaz « monte » de 220 à 400 °C sans énergie) ; entrée `FG_IN` figée à la première ouverture (un changement amont n'est plus pris en compte) ; humidité de l'air ajoutée sans son énergie.
- [ ] **Échangeur tubes-calandre** : T sortie par défaut = T entrée − 200 (220 → 20 °C) ; pas de point de rosée ni de condensation : sous ≈ 55 °C, l'eau reste vapeur et la chaleur de condensation n'est pas comptée.
- [ ] **Mélangeur (SEP21)** : température de mélange = moyenne pondérée des masses au lieu d'un bilan d'enthalpie.
- [ ] **Chaudière** : purge non comptée dans le bilan (vapeur surestimée ≈ 0,5 % pour 2 % de purge).

### Non couvert
- [ ] Mode Retro (`src/Z_RETRO`) de ces équipements.
- [ ] Détail des onglets Polluants, Design et OPEX (seuls la stabilité et les points ci-dessus ont été vérifiés).

---

## Onglets OPEX → onglets Rapport (vérification et corrections du 18/11/2026)

Corrigé : l'onglet OPEX est la source unique. Les rapports (section OPEX de chaque équipement et synthèse OPEX du rapport global) relisent les tableaux de l'onglet OPEX du nœud (`G_Graphiques/Dashboard/opexTableau.js`, `D_BILAN_Rapports/OpexRapport.jsx`).

### Tous les équipements
- [x] **Modifications faites dans l'onglet OPEX non reprises dans le rapport** : les valeurs saisies sont marquées (fond jaune, ✎ dans le rapport), conservées quand le calcul change (bouton ↺ pour revenir au calcul) ; lignes ajoutées et supprimées conservées ; coûts et CO₂ recalculés à partir des tableaux affichés.
- [x] **Mémoire de l'onglet OPEX par type et non par nœud** : clé `opexDashboard_<TYPE>_<nodeId>` + copie `opexTableau_<TYPE>_<nodeId>` dans les données du nœud (projet JSON rechargé sur un autre poste). L'ancienne clé par type est relue une fois (lignes ajoutées conservées).
- [x] **Arrondi** : plus d'arrondi à 2 chiffres significatifs avant le calcul des coûts ; seul l'affichage est arrondi.
- [x] **Consommations du nœud amont recopiées dans le nœud aval** (trouvé pendant la correction) : à l'envoi, `Main_FLOW` recopiait toutes les clés du nœud amont (`consoElec*`, `Conso_*`, gaz, transport…) dans le nœud aval → l'OPEX et le rapport du nœud aval affichaient aussi celles de l'amont, et la synthèse globale les comptait plusieurs fois. Ces clés ne sont plus transmises (`sansClesOpex`).
- [x] **FB / GF** : l'envoi ne transmettait aucune clé OPEX → section OPEX vide dans le rapport global et totaux absents du panneau OPEX. Corrigé.
- [x] **Totaux du panneau OPEX global** (`activeNodes_*`) : toujours en valeurs horaires (avant : horaires ou annuels selon le bouton de l'onglet).

### Écarts par équipement (tous corrigés par la source unique)
- [x] **Charbon actif (CAP)** : ligne ajoutée dans l'onglet OPEX (coût et CO₂ de transport).
- [x] **Quench, quench simple, saturateur, injection d'eau** : eau adoucie et eau de rivière reprises.
- [x] **Réacteur** : CaO et Ca(OH)₂ humide repris.
- [x] **Électrofiltre** : CaCO₃, CaO, NaOH repris.
- [x] **Chaudière** : transport des cendres repris ; eau alimentaire comptée en eau déminéralisée (`Conso_EauDemin_m3`, comme l'ancien rapport).
- [x] **DeNOx** : valeurs écrites en nombres.
- [x] **Ventilateur** : l'ancien rapport ne comptait que l'eau potable.

### Restant
- [x] **Chaudière** et **électrofiltre** : onglet OPEX ajouté (18/11/2026), alimenté par l'onglet Design ; chaudière : valorisation (électricité, vapeur vendue) lue dans l'onglet Valorisation vapeur.
- [x] **Valeurs fictives de la tour de refroidissement** (cendres 1 kg/h, transport 3 × 90 €/h et 3 × 90 kg CO₂/h, eau 1 m³/h de chaque type, 1 kg/h de CaCO₃, CaO, Ca(OH)₂) : remplacées par l'eau pulvérisée calculée et la pompe (débit × pression de pulvérisation / rendement), le reste à 0.
- [ ] **Injection d'air** : écrit 1 kg/h de cendres de chaudière (valeur fictive, sans coût associé).
- [ ] **Projets existants** : un nœud aval peut encore contenir des consommations recopiées de l'amont (clés que son Design n'écrit pas). Les vérifier dans son onglet OPEX (supprimer la ligne ou remettre 0). Tour de refroidissement, électrofiltre et chaudière : corrigé à la réouverture de l'onglet Design (toutes les clés OPEX y sont réécrites).

### Formules OPEX à revoir (relevé du 18/11/2026)
- [x] **Coût du transport des résidus** (corrigé le 18/11/2026, `A_Transverse_fonction/transport_residus.js`) : coût = (débit t/h ÷ charge utile du camion) × distance × 2 (aller chargé + retour à vide) × prix €/km ; CO₂ inchangé (kg/t·km × km × t/h). BHF, électrofiltre, chaudière, four rotatif, réacteur ; libellés en [€/h], [kg/h] et rotations de camion par an. Ex. chaudière 41 kg/h à 100 km : 25 → 0,14 €/h.
- [x] **CO₂ de l'air comprimé compté deux fois** (corrigé le 18/11/2026) : seule la ligne d'électricité du compresseur est comptée ; la ligne CO₂ « air comprimé » est supprimée de l'onglet OPEX.
- [ ] **Prix de l'air comprimé** : saisi en k€/1000 Nm³ dans les paramètres OPEX mais compté en € (Nm³/h ÷ 1000 × prix) → coût 1 000 fois trop faible si l'unité affichée est la bonne (électrofiltre par défaut : 0,17 €/h au lieu de 168 €/h). Si ce prix inclut l'électricité du compresseur, celle-ci est aussi comptée deux fois (ligne d'électricité).
- [ ] **FB / GF : achat des réactifs compté deux fois** : `Conso_reactifs.cout` (coût d'achat) est recopié dans `cout_transport_reactifs` (ligne « Transport réactifs ») alors que l'achat est déjà compté dans « Conso réactifs ».
- [x] **Chaudière** : eau d'appoint = purge seule (retour complet des condensats supposé) — laissé tel quel (décision de Cédric, 18/11/2026).
