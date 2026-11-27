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
- [x] **Achat des réactifs compté deux fois** (FB, GF, four rotatif ; corrigé le 18/11/2026) : `Conso_reactifs.cout` (coût d'achat) n'est plus recopié dans `cout_transport_reactifs` ; l'achat est compté une fois, à partir des `Conso_*_kg` et des prix OPEX. La ligne « Transport réactifs » (coût) vaut 0 sauf saisie.
- [x] **Unité du prix des réactifs** (corrigé le 18/11/2026) : prix d'achat en €/t (libellés de l'onglet Paramètres OPEX, valeurs par défaut ×1000 sauf NaHCO₃ 200 €/t). Migration unique des valeurs déjà saisies : un prix < 10 est lu comme des €/kg et multiplié par 1000 (`migrerPrixReactifs`, `opexDataService.js`).
- [x] **FB / GF** : valeurs fictives des cendres du four (1 kg/h, transport 1 €/h, 1 kg CO₂/h) remises à 0 (18/11/2026).
- [x] **CO₂ du transport des réactifs** (corrigé le 18/11/2026) : débit [t/h] × facteur [kg/t·km] × distance × 2 (aller-retour), via `co2TransportReactif_kg_t` (`opexDataService.js`) ; `co2PerTrip` est toujours recalculé (kg CO₂ par tonne livrée), quel que soit l'état de l'onglet Paramètres OPEX. Ex. 100 kg/h de Ca(OH)₂ à 30 km : 0,71 kg/h (avant 0,36 ou 18 kg/h).
- [x] **Chaudière** : eau d'appoint = purge seule (retour complet des condensats supposé) — laissé tel quel (décision de Cédric, 18/11/2026).

---

## FB — onglet HX / récupérateur (`src/Y_BILAN/FB/4_Recuperator.jsx`) — comparaison à Pyrofluid (18/11/2026)

Référence : `ClassRecuperateur.vb` et `Recuperateur.vb` (Drive, 1_VALIDATION_PYRO › CODE DU PYROFLUID › 03 Recuperateur).
Après correction (18/11/2026), l'onglet redonne Pyrofluid à 0,05 % près (273,15 au lieu de 273) : DTLM 381 K, surface 68,9 m², DP air 280 mmCE (2 passes) / 347 (3 passes), section 0,380 m².
Exemple chiffré (avant correction) : fumées 870 → 550 °C, air 60 → 580 °C, 1 000 kW échangés, 8 000 Nm³/h d'air, vitesses 16 / 25 m/s.

Conforme : Hext, Hint, U propre, U encrassé = U / (1 + encrassement), F = 1, chaleur fumées = chaleur air / rendement, boucle de perte de charge côté air (tubes 38,5 / 44,5 mm, 1,6 m par passe), formule de la DTLM, conversion Nm³ → m³ (273,15 au lieu de 273, négligeable). Température de sortie des fumées : même bilan, inversé sur l'enthalpie NIST (choix déjà validé) au lieu du Cp moyen du mélange.

### Calculs
- [x] **DTLM** (corrigé le 18/11/2026 : air entrée = sortie soufflante, sortie = air préchauffé ; alerte si températures incompatibles) : la sortie d'air est prise à T air avant préchauffage + 100 °C (115 °C) au lieu de la température d'air préchauffé (`Tair_ap_prechauffe_C`). DTLM 613 K au lieu de 381 K.
- [x] **Unités de la surface** (corrigé : UA en kcal/h·°C pour le calcul de la surface, W/K affiché) : UA en W/K divisé par U en kcal/(h·m²·K) → surface × 1,163. Avec la DTLM : surface −28 % à encrassement égal (50 m² au lieu de 69), −36 % avec les valeurs par défaut de l'outil (44 m²).
- [x] **Section calandre** (corrigé : débit réel au freeboard) : calculée avec le débit massique (Nm³/h × ρ) au lieu du débit réel à la température du freeboard (`DEBREELVOLFUMFOUR`) → 0,115 m² au lieu de 0,381 m².
- [x] **Perte de charge côté air** (corrigé : débit en Nm³/h) : `DP_RecupAir` reçoit un débit déjà converti en m³/h réels (580 °C) qu'il reconvertit → débit compté environ deux fois, DP 168 mmCE au lieu de 280.
- [x] **Pression du freeboard** (corrigé : lue dans `PressionFreeboard` de l'onglet Voûte, 89 mmCE tant qu'il n'a pas été calculé) : la clé `P_freeboard` n'est jamais écrite (l'onglet Voûte écrit `PressionFreeboard` / `Pression_Freeboard`) → toujours 89 mmCE par défaut.
- [x] **Pression des fumées transmise à l'aval** (corrigé : P freeboard − PDC côté fumées) : `P_sortie_HX_mmCE` = 2 000 mmCE (pression côté air) est envoyée en `P_out_mmCE` / `P_OUT` ; la chaudière et l'électrofiltre partent de 2 000 mmCE (débits réels aval −15 %). Pyrofluid transmet la pression du freeboard.
- [x] **Ligne récupérateur → four (50 mmCE) absente** (corrigé : saisissable, 50 par défaut) : Pyrofluid prend pression soufflante = P voûte + DP HX + 50 et débit d'air sortie HX à P voûte + 50. Le champ `PDC_reseau_sortie_entree_boite_mmCe` (50) existe mais n'est pas utilisé.
- [x] **PDC fumées dans le HX** (corrigé : 40 mmCE par défaut ; un ancien réglage à 50 passe à 40) : 50 mmCE par défaut (Pyrofluid 40) ; `PDC_recuperateur_fumees_mmCE` (40), `PDC_carneau_mmCE`, `PDC_echangeur_air_mmCE` ne servent pas ou presque.
- [x] **P voûte** (vérifié le 18/11/2026 dans `ClassDimFourVoute.vb`) : `PressionVoute` est la valeur **saisie** (2 000 mmCE par défaut), jamais recalculée ; la classe en déduit P freeboard = P voûte − PDC tuyères − 1 500 (lit) − 50. Le récupérateur lit cette valeur saisie, comme l'outil (`PressionVouteDefaut_mmCe` de l'onglet Voûte). La pression après tuyères (P voûte − PDC tuyères) ne concerne pas l'échangeur. Pas d'écart.

### Validation sur le cas Valence 450 kg MS/h (rapport Pyrofluid V4.5 du 13/09/2024, 18/11/2026)
Bilan FB + onglet HX, P freeboard imposée à −3 mmCE (valeur du rapport), rendement 95 %, encrassement 25 %, 2 passes.
- Mode « Calcul Pyrofluid d'origine » : écart ≤ 0,1 % sur T fumées sortie (562,7 / 563 °C), puissances (726 879 / 726 582 kcal/h), DTml (386,7 / 386,6), Hext, Hint, U, section calandre (0,460), surface (60,5 / 60,5 m²), pressions air (2 429 / 2 432 et 2 050 mmCE) et fumées (−43 mmCE).
- Mode outil (NIST) : écarts de 0,2 à 0,9 % (T fumées sortie 565 °C, surface 60,4 m²).
- [x] **Débits d'air +1,3 %** — décision de Cédric (18/11/2026) : on garde le débit **humide**, c'est lui qui passe réellement ; le débit sec de Pyrofluid est une erreur de Pyrofluid. L'outil prend le débit d'air **humide** (4 229 Nm³/h, soufflante 4 325), Pyrofluid le débit **sec** (4 174 Nm³/h, soufflante 4 268 — « débit air soufflante sec »). Conséquence : PDC côté tube −0,7 % (379 au lieu de 382 mmCE).

### Ventilateur (soufflante) — vérifié le 18/11/2026
- Débit, température (T air + 45 °C) et pression (P voûte + 50 + PDC air) conformes à Pyrofluid ; débit humide (décision). Valence : 4 325 Nm³/h, 60 °C, 2 429 mmCE (rapport : 4 268 sec, 60 °C, 2 432).
- Pyrofluid ne calcule pas la puissance. Outil : débit réel au refoulement × pression / rendement (70 %) = 40,4 kW sur Valence ; compression isentropique / 0,7 = 40,0 kW (écart +1 %). Ordre de grandeur cohérent (≈ 90 kWh/t MS pour la soufflante seule).
- [x] **Échauffement de +45 °C dans la soufflante — décision de Cédric (18/11/2026) : on garde +45 °C** (convention Pyrofluid), pas de paramètre ni de calcul par la compression. Pour mémoire : +45 °C demanderait ≈ 70 kW ; avec un rendement de 70 %, la compression échauffe l'air d'environ 26 °C (18 °C en isentropique) ; calculer la température de sortie soufflante ferait entrer l'air ≈ 19 °C plus froid dans l'échangeur (puissance d'échange +3,7 % sur Valence). Les +45 °C servent aussi dans l'onglet Combustion (`T_soufflante` : enthalpie de l'air soufflé et de balayage, récupération d'énergie).
- Non compté : pertes de charge à l'aspiration (filtre, silencieux), la pression du ventilateur part de l'atmosphère.

### Décisions prises (18/11/2026, appliquées)
- [x] Valeurs par défaut : rendement 95 % (onglet Combustion) et encrassement 25 %, désormais saisissable dans l'onglet HX. Les anciens réglages HX (encrassement 10 %, non saisissable) passent à 25 % ; un rendement déjà enregistré dans l'onglet Combustion est conservé.
- [x] Nombre de passes : choix 2 ou 3 (perte de charge côté air).
- [x] Débit du ventilateur : bouton « air secondaire et tertiaire » ; sur « Non » (par défaut) = Pyrofluid (air de combustion + instrumentation).
- [x] Bouton « un échangeur pour l'ensemble des fours / un échangeur par four » (par défaut : par four, comme Pyrofluid). En mode par four, débits, enthalpies, surface, section et ventilateur sont donnés pour un échangeur ; la puissance électrique totale (tous les ventilateurs) alimente l'OPEX.

### Mineur
- [ ] Pas de contrôle « T air entrée + 45 < T air préchauffé » (Pyrofluid bloque le calcul) ; Cp moyen des fumées non affiché.
- [ ] Puissance électrique du ventilateur : ajout de l'outil (absente de `ClassRecuperateur`).

## Chaîne des pressions (relevé le 18/11/2026, non corrigé)
- [x] **Bilan, pression de sortie écrite seulement par l'onglet Design** : ÉLECTROFILTRE envoie `P_OUT = innerData.P_out_mmCE`, calculé uniquement dans l'onglet Design → `undefined` si l'onglet n'a pas été ouvert ; QUENCH envoie `P_out_mmCE || 0` → pression remise à 0. Les nœuds aval repartent alors de 0 mmCE. À vérifier sur les autres équipements dont la perte de charge est dans le Design. — **Corrigé le 18/11/2026** : tous les onglets de calcul sont calculés à l'ouverture du nœud (`ContenuOnglets`), et FB envoie `P_OUT` (l'aval repartait de 0 après le four).
- [x] **DENOX, pression de sortie** : `pressionSortie = 30 − PDC` (`3_DENOX_Design1_ML.jsx`) ignorait la pression d'entrée — **corrigé le 18/11/2026** : P sortie = P entrée − PDC (calculée selon la technologie ou imposée).
- [x] **SCRUBBER (Bilan) et WHB** : aucune perte de charge côté fumées — **corrigé le 18/11/2026** : tour de lavage (calculée garnissage + dévésiculeur ou imposée), chaudière 100 mmCE par défaut, conservée ; WHB Retro : P amont = P aval + PDC.
- [ ] **FB, valeurs par défaut** : avec les valeurs par défaut (22 trous imposés), vitesse tuyères ≈ 322 m/s et pression freeboard ≈ −4 250 mmCE, maintenant transmise à l'aval via `P_OUT`.
- [ ] **Retro, signe de la perte de charge** : en remontant, la pression amont devrait être P aval **+** PDC (DENOX, QUENCH, WATER_INJECTION, économiseurs) ; IACT (`IACT_calculations.js`) et SCRUBBER (`SCRUBBER_calculations3.js`) font P aval **−** PDC.

---

## Tour de lavage (`src/Y_BILAN/SCRUBBER/4_SCRUBBER_TourLavage.jsx`) — contrôle du 27/11/2026

Le mode « Calcul Pyrofluid d'origine » reproduit `ClassTourLavage.Calcul` (écart < 0,001 %, `scripts/verif_tour_lavage`). Restent trois points du **calcul corrigé** (défaut), à décider :

- [ ] **Vitesse du dévésiculeur** : la « vitesse retenue » est un flux massique (kg/m²/h) affiché en m/h, repris de Pyrofluid. Vitesse réelle = flux / masse volumique des fumées. Cas test (sortie quench 84,7 °C, Ø 2,5 m) : perte de charge du dévésiculeur 16,1 → 25,7 mmCE sans sous-refroidissement, 36,3 → 29,6 mmCE avec.
- [ ] **Chaleur latente en sortie de condenseur** : 547 kcal/kg dans l'enthalpie des fumées, 597 kcal/kg dans la chaleur sensible (Pyrofluid). Avec 597 partout : puissance du condenseur −0,55 %.
- [ ] **Fumées non saturées en entrée** (pas de quench en amont) : l'eau en sortie = saturation à la température d'entrée, sans refroidissement ni eau évaporée au bilan. Cas test 80 °C, 2 600 kg/h d'eau en entrée → 13 595 kg/h en sortie. Hypothèse du module : quench en amont.
