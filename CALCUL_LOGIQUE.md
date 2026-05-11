# Logique de calcul et formules — Outil Incinération

> Généré automatiquement à partir du code source. Valide au 2026-05-04.

---

## Table des matières

1. [Constantes et fonctions partagées](#1-constantes-et-fonctions-partagées)
2. [FB — Four à lit fluidisé](#2-fb--four-à-lit-fluidisé)
3. [RK — Four rotatif](#3-rk--four-rotatif)
4. [WHB — Chaudière de récupération](#4-whb--chaudière-de-récupération)
5. [QUENCH — Refroidissement rapide](#5-quench--refroidissement-rapide)
6. [SCRUBBER — Laveur de fumées](#6-scrubber--laveur-de-fumées)
7. [CYCLONE](#7-cyclone)
8. [SEPARATEURS](#8-separateurs)
9. [ELECTROFILTER — Filtre électrostatique](#9-electrofilter--filtre-électrostatique)
10. [DENOX — Réduction des NOx](#10-denox--réduction-des-nox)
11. [STACK — Cheminée](#11-stack--cheminée)
12. [COOLINGTOWER — Tour de refroidissement](#12-coolingtower--tour-de-refroidissement)
13. [IDFAN — Ventilateur de tirage](#13-idfan--ventilateur-de-tirage)
14. [Mode RETRO — Logique générale](#14-mode-retro--logique-générale)
15. [Tables de vapeur IAPWS-IF97](#15-tables-de-vapeur-iapws-if97)
16. [Base de données émissivité fumées](#16-base-de-données-émissivité-fumées)

---

## 1. Constantes et fonctions partagées

### Fichiers : `src/A_Transverse_fonction/`

---

### 1.1 Constantes physiques (`constantes.js`)

| Grandeur | Valeur | Unité |
|----------|--------|-------|
| T_ref | 273.15 | K |
| P_ref | 101 325 | Pa |
| ρ_air | 1.293 | kg/Nm³ |
| M_C | 12.01 | kg/kmol |
| M_H | 1.008 | kg/kmol |
| M_O | 16.00 | kg/kmol |
| M_N | 14.007 | kg/kmol |
| M_S | 32.066 | kg/kmol |
| M_Cl | 35.45 | kg/kmol |
| M_CO2 | 44.01 | kg/kmol |
| M_H2O | 18.015 | kg/kmol |
| M_SO2 | 64.07 | kg/kmol |
| M_NOx | 30.01 | kg/kmol |
| M_HCl | 36.46 | kg/kmol |

---

### 1.2 Enthalpies des gaz (`enthalpy_gas.js`)

Polynôme de Kirchhoff-Planck :

```
h(T) = A·T + B·T²/2 + C·T³/3 - d/T + K     [kJ/kg]
```

| Gaz | A | B | d | K | Condition |
|-----|---|---|---|---|-----------|
| CO2 | 1.0034 | 0.000205 | 19 400 | −352.63 | — |
| O2 | 0.696 | 0.0006373 | −4 800 | −194.49 | T < 1 000 K |
| O2 | 1.0505 | 0.00007447 | 32 860 | −386.86 | T ≥ 1 000 K |
| SO2 | 0.678 | 0.000166 | 9 270 | −225.24 | — |
| HCl | 0.7279 | 0.000126 | −3 000 | −192.42 | — |
| N2 | 0.9718 | 0.00009 | −2 740 | −259.67 | T < 800 K |
| N2 | 1.0146 | 0.0002277 | 29 770 | −351.20 | T ≥ 800 K |
| H2O | 1.6658 | 0.0005945 | 1 830 | −470.21 | — |
| Air | 0.767 × h_N2(T) + 0.233 × h_O2(T) | — | — | — | mélange |

---

### 1.3 Enthalpie des fumées (`enthalpy_mix_gas.js`)

```
h_fumee(T, m_CO2, m_H2O, m_N2, m_O2) =
    fh_CO2(T)·m_CO2
  + (fh_H2O(T) + 540 × 4.1868)·m_H2O   ← chaleur de condensation incluse
  + fh_N2(T)·m_N2
  + fh_O2(T)·m_O2
```

**Température à partir d'une enthalpie** (recherche binaire, tolérance 0.001 °C) :

```
TEMP_FUMEE(H, m_CO2, m_H2O, m_N2, m_O2):
    Itère T ∈ [0 ; 3 000°C] jusqu'à h_fumee(T, ...) = H
```

**Débit d'eau de dilution pour atteindre T_out** :

```
Qeau = ΔH / (fh_H2O(T_out) − hL(T_eau) + 540 × 4.1868)

avec ΔH = H_in × (1 − Pth/100) − H_out_cible
```

---

### 1.4 Pouvoir calorifique inférieur (`bilan_fct_combustion.js`)

```
PCI [kJ/kg] = 4.1868 × (84·C% + 277.65·H% − 54·H% − 26.5·O% + 25·S% + 15·N% − 5.5·Cl%)
```

**Humidité de l'air de combustion** [kg H2O / kg air sec] :

```
w = psat(T_air) × HR% × 18 / (22.4 × 100)
```

---

### 1.5 Conversions volumiques (`conv_calculation.js`)

```
V_m3 = V_Nm3 × (T + 273.15) / 273.15 × (101 325 / P_Pa)    [loi gaz parfaits]
m_kg = V_Nm3 × ρ_Nm3[composant]
```

---

## 2. FB — Four à lit fluidisé

### Fichier principal : `src/Y_BILAN/FB/2_CombustionTab.jsx`

---

### 2.1 Compositions de combustibles prédéfinies

| Type | C% | H% | O% | N% | S% | Cl% | PCI (kcal/kg MV) |
|------|---:|---:|---:|---:|---:|----:|------------------:|
| GAZ | 89.8 | 7.5 | 0.6 | 0.9 | 1.2 | 0 | 10 187 |
| BIOGAZ | 75 | 25 | 0 | 0 | 0 | 0 | 5 000 |
| FIOUL | 75 | 25 | 0 | 0 | 0 | 0 | 10 223 |
| PRIMAIRE (boues) | 49.7 | 6.8 | 34.3 | 7 | 1.5 | 0.7 | 4 781 |
| MIXTE | 54.2 | 8 | 29.3 | 7.2 | 1.3 | 0 | 5 300 |
| BIOLOGIQUE | 54.2 | 8 | 29.3 | 7.2 | 1.3 | 0 | 5 630 |
| DIGEREE | 52.7 | 7.6 | 30.7 | 5.8 | 2.2 | 1 | 5 413 |

---

### 2.2 Conversion molaire des intrants

```
MB_C   = (M_boue_C / 12.01) × 1 000                                [kmol/h]
MB_H   = (M_boue_H / 1.008 + 2 × Debit_eau / 18.015) × 1 000
MB_O   = (M_boue_O / 16 + Debit_eau / 18.015 + M_air_sec / (4.310055 × 16)) × 1 000
MB_N   = (M_boue_N + M_air_sec × (1 − 1/4.310055)) × 1 000 / 14.007
MB_S   = (M_boue_S / 32.066) × 1 000
MB_Cl  = (M_boue_Cl / 35.45) × 1 000
```

> La constante **4.310055** est la masse d'air stœchiométrique (kg) par mole de (C+H+S).

---

### 2.3 O2 en excès

```
MolesO2_exc = M_air_sec × (1 − 1/(1 + EA%/100)) / (4.310055 × 32) × 1 000
```

---

### 2.4 Produits de combustion (itératif, 20 iter max, ε = 0.1)

```
MF_CO2  = MF_C × √max(MF_O2, 0) / (0.05 + √max(MF_O2, 0))
MF_CO   = MF_C − MF_CO2
ParamB1 = MF_O2 − 2·MF_C − 2·MF_O2_exc − 2·MF_SO2
MF_H2O  = ParamB1 + MF_CO
MF_N2   = (MF_N − MF_NOx) / 2
```

**Conversion en masse (kg/h)** :

```
FG_CO2  = MF_CO2  × 44.01  / 1 000
FG_CO   = MF_CO   × 28.01  / 1 000
FG_H2O  = MF_H2O  × 18.015 / 1 000
FG_O2   = MF_O2   × 32     / 1 000
FG_N2   = MF_N2   × 28.014 / 1 000
FG_SO2  = MF_SO2  × 64.07  / 1 000  × (1 − SO2_recov%/100)
FG_HCl  = MF_HCl  × 36.46  / 1 000
FG_NOx  = MF_NOx  × 30.01  / 1 000
```

**Débit volumique des fumées** :

```
FG_wet_Nm3_h  = Σ (FG_i / ρ_Nm3_i)
FG_dry_Nm3_h  = FG_wet_Nm3_h − FGv_H2O
```

---

### 2.5 Bilan énergétique FB

**Entrées [kW]** :

```
H_MV      = PCI_boue_kcal/kgMV × M_volatile × 4.1868 / 3 600
H_MS      = 0.285 × 4.1868 × M_seche × T_boue / 3 600
H_evap    = M_eau × (4.1868 × T_boue − 2 501.6) / 3 600
H_air     = cp_air(T_prech) × M_air + cp_H2O(T_prech) × M_eau_air
H_gaz_int = (M_gaz / 0.87) × 11.493
```

avec :
```
cp_air(T)  = (0.241·T + 0.000044·T²/2) × 4.1868 / 3 600     [kW/(kg·°C)]
cp_H2O(T)  = (0.427·T + 0.000161·T²/2) × 4.1868 / 3 600
```

**Sorties [kW]** :

```
H_fumees   = Σ fh_i(T_voute) × M_i                           [somme sur tous les composants]
H_cendres  = 0.285 × 4.1868 × M_mineral × T_voute / 3 600
Pertes     = PCI × M_volatile × (Pertes%/100) × 4.1868 / 3 600
```

**Convergence itérative** :

```
Boucle : H_gaz = H_sorties − H_entrees
         M_gaz_new = M_gaz + H_gaz / 11.493
         Répéter jusqu'à |H_gaz| < 0.1 kW
```

---

### 2.6 Besoins en air

```
M_air_combustion = Q_gaz × (2.6644·C% + 7.9365·H% + 0.9979·S% − O%) × 4.310055 × (1 + EA%/100) / 100
M_air_instru     = (2.6644·C + 7.9365·H + 0.9979·S − O) × 4.32 × 1.4 × 4/100
M_air_stoech     = (2.6644·C + 7.9365·H + 0.9979·S − O) × 4.310055 × 1.4
```

---

## 3. RK — Four rotatif

### Fichier : `src/A_Transverse_fonction/bilan_fct_RK.js`

---

### 3.1 Bilan enthalpique système

```
H_in = M_dechet × PCI_kJ_kg
     + M_air_sec × fh_AIR(T_air)
     + M_vapeur  × fh_H2O(T_vapeur)
     + M_dechet  × 0.25 × 4.186 × T_dechet
     − M_dechet  × 0.25 × 4.186 × T_init
     − M_inertes × 0.03 × 33 000        ← pertes imbrûlés (3%)
```

---

### 3.2 Perte de charge dans le four [Pa]

```
ΔP_four = (86.4 × D³ × sin(40°)³ × L × N × c) / 0.85

avec :
  D = diamètre [m],  L = longueur [m],  N = vitesse de rotation [tr/min]
  c = 0.0018 (avec corrosion)  ou  0.00092 (sans corrosion)
```

---

## 4. WHB — Chaudière de récupération

### Fichier principal : `src/Y_BILAN/WHB/4_WHB_Design_ML.jsx`

---

### 4.1 Longueur optique

```
L_opt = 3.6 × V / A × 1 000    [mm]

V = H × l × L                  [m³]  (hauteur × largeur × longueur)
A = 2 × (H×l + l×L + L×H)      [m²]  (ou H × 2(l+L) version simplifiée)
```

---

### 4.2 Émissivité des fumées

```
FG_emissivity(T, L_opt, frac_CO2, frac_H2O, frac_CO) :
    Pe_CO2 = P_tot × (1 + 0.28 × frac_CO2)
    Pe_H2O = P_tot × (1 + 0.28 × frac_H2O)

    ε_CO2, ε_H2O, ε_CO                      ← lecture tables Hottel/JANAF
    ε_CO2+H2O, ε_CO2+CO, ε_H2O+CO          ← superposition

    ε_total = ε_CO2 + ε_H2O + ε_CO
            − ε_CO2+H2O − ε_H2O+CO − ε_CO2+CO − ε_H2O+CO2+CO
```

---

### 4.3 Chaleurs spécifiques des fumées [kJ/(kg·K)]

```
cp_CO2(T) = 0.846 + 6.9e-4 × T
cp_H2O(T) = 1.860 + 1.0e-3 × T
cp_O2(T)  = 0.918 + 1.5e-4 × T
cp_N2(T)  = 1.040 + 1.0e-4 × T
cp_CO(T)  = 1.040 + 1.0e-4 × T
```

---

### 4.4 Transfert radiatif par section

```
Q_i = S_périmètre × ε_i × σ × (T_fum_i⁴ − T_paroi⁴)   [kW]

σ = 5.67 × 10⁻⁸  W/(m²·K⁴)    (Stefan-Boltzmann)

Chute de température par section :
    ΔT_i = (Q_i / H_fum_i) × T_i
    T_{i+1} = T_i − ΔT_i
```

Calcul itéré sur n = floor(hauteur / pas_mm) tranches.

---

### 4.5 Équipements auxiliaires

```
ΔT_surchauffeur = T_fin − T_après_surch
Q_surch = h_fum(T_fin) − h_fum(T_après_surch)

ΔT_économiseur = T_avant_éco − T_après_éco
Q_éco = h_fum(T_avant_éco) − h_fum(T_après_éco)
```

---

### 4.6 Pompe d'alimentation [kW]

```
HMT = P_vapeur_bar + 20     [m]
P_pompe = Q_eau_m3_h × HMT / (36 × 0.7)
                              ↑ efficacité 70%
```

---

## 5. QUENCH — Refroidissement rapide

### Fichier : `src/Y_BILAN/QUENCH/4_QUENCH_Design1_ML.jsx`

---

### 5.1 Section et vitesse des fumées

```
S_quench = π/4 × D²          [m²]
V_fum    = (Q_Nm3_h / 3 600) / S_quench    [m/s]
```

---

### 5.2 Diamètre moyen de Sauter (SMD)

```
SMD = d_moy × 0.693 × (1 + 1/n)

avec n = paramètre de distribution (dépend du type de buse)
```

| Type de buse | d_moy (relatif) | n |
|---|---|---|
| Cône creux | 2.8 | variable |
| Cône plein | 2.3 | variable |
| Jet plat | 2.0 | variable |
| Spirale | 3.2 | variable |

```
V_goutte  = √(2 × P_buse / 1 000)          [m/s]
Angle_jet = 2 × arctan(0.2 × √(P / Q)) × 180/π    [°]
```

---

### 5.3 Hauteur d'interaction

```
H_quench = 1.2 × |V_gaz − (−2.0)| × (T_gaz_in − T_liquide) / 100    [m]
```

---

### 5.4 Bilan énergétique

```
Q_eau = ΔH_fum / (fh_H2O(T_out) − hL(T_eau) + 540 × 4.1868)    [kg/h]

ΔP_quench ≈ 150 mmCE (valeur typique)
```

---

## 6. SCRUBBER — Laveur de fumées

### Fichier : `src/Y_BILAN/SCRUBBER/`

---

### 6.1 Réactions acides (HCl / SO2)

**Lait de chaux** :
```
Ca(OH)2 + SO2  →  CaSO3·½H2O + ½H2O
Ca(OH)2 + 2 HCl  →  CaCl2 + 2 H2O
```

**Soude** :
```
Na2CO3 + SO2  →  Na2SO3 + CO2
```

### 6.2 Consommation de réactif

```
n_réactif = n_polluant × ratio_stœchio × (1 + surdosage%/100)
M_réactif  = n_réactif × M_molaire     [kg/h]
```

---

## 7. CYCLONE

### Fichier : `src/Y_BILAN/CYCLONE/`

---

### 7.1 Efficacité de collecte

```
η_cyclone ≈ 85 – 99 %    (selon diamètre de coupe)

M_poussières_sortie = M_entrée × (1 − η%)
M_cendres_collectées = M_poussières_entrée × η%
```

### 7.2 Perte de charge

```
V_tang = Q_fum / A_cyclone
ΔP = 10 – 50 mmCE    (selon V_tang et géométrie)
```

**Densité des fumées** (corrigée température) :

```
ρ_fum(T) = P_ref / (P_ref) × T_ref / (T + 273.15) × ρ_air
```

---

## 8. SEPARATEURS

### Fichier : `src/Y_BILAN/SEPARATEURS/`

| Séparateur | Taille particules | Efficacité | ΔP typique |
|---|---|---|---|
| 1er (grossier) | > 100 µm | 70 – 85 % | 5 – 10 mmCE |
| 2e (fin) | 10 – 100 µm | 60 – 80 % | 15 – 25 mmCE |

---

## 9. ELECTROFILTER — Filtre électrostatique

### Fichier : `src/Y_BILAN/ELECTROFILTER/`

---

### 9.1 Collecte des particules

```
η_ESP = 95 – 99.5 %

Émission_sortie = Concentration_entrée × (1 − η%)
```

### 9.2 Puissance électrique [kW]

```
P_ESP = I_corona [mA] × U [kV] × 10⁻³
```

Valeur typique : 20 – 50 kW (incinérateur de taille moyenne).

---

## 10. DENOX — Réduction des NOx

### Fichiers : `src/Y_BILAN/DENOX/` et `src/Z_RETRO/DENOX/`

---

### 10.1 Réactions SCR (catalytique, 320 – 400 °C)

```
4 NO + 4 NH3 + O2  →  4 N2 + 6 H2O
2 NO2 + 4 NH3 + O2  →  3 N2 + 6 H2O
```

### 10.2 Réactions SNCR (thermique, 900 – 1 100 °C)

Même stœchiométrie, efficacité plus faible.

### 10.3 NOx après traitement

```
NOx_sortie = NOx_entrée × (1 − η_DENOX%)
NH3_slip = NH3_injecté × (1 − taux_consommation)    [ppm]
                                                       (limite régl. < 10 ppm)
```

### 10.4 Calcul NOx depuis le FB

```
MF_NOx = f(MS%, MV%, PCI_boue, Q_boue)    [modèle empirique]
FG_NOx = MF_NOx × 30.01 / 1 000           [kg/h]
```

---

## 11. STACK — Cheminée

### Fichier : `src/Y_BILAN/STACK/`

---

### 11.1 Tirage naturel [Pa]

```
ΔP_tirage = ρ_air × g × H × (1 − T_amb / T_cheminée)

avec T en Kelvin
```

### 11.2 Vitesse en sortie [m/s]

```
V_sortie = Q_Nm3_h × (T_cheminée + 273.15) / (273.15 × 3 600 × A_section)
```

### 11.3 Modèle de dispersion gaussien (si activé)

```
C(x,y,z) = Q / (2π·σy·σz·U) × exp(−y²/2σy²)
          × [exp(−(z−Heff)²/2σz²) + exp(−(z+Heff)²/2σz²)]

avec σy, σz = paramètres de Pasquill-Gifford
     Heff   = hauteur effective de cheminée
     U      = vitesse du vent [m/s]
```

---

## 12. COOLINGTOWER — Tour de refroidissement

### Fichier : `src/Y_BILAN/COOLINGTOWER/`

---

### 12.1 Puissance thermique dissipée [kW]

```
Q = m_eau × cp_eau × (T_in − T_out)
cp_eau = 4.186 kJ/(kg·K)

η% = (T_in − T_out) / (T_in − T_bulbe_humide) × 100
```

### 12.2 Bilan massique

```
m_évaporation ≈ Q / 2 450         [kg/h]   (chaleur de vaporisation)
m_dérive      ≈ 0.005 × m_circulation
m_entrée      = m_sortie + m_évap + m_dérive
```

### 12.3 Ventilateur [kW]

```
P_ventilateur = m_air × cp_air × ΔT_air / (η_vent × 3 600)
```

---

## 13. IDFAN — Ventilateur de tirage

### Fichier : `src/Y_BILAN/IDFAN/`

---

### 13.1 Point de fonctionnement

```
ΔP_réseau = ΔP_chaudière + ΔP_APC + ΔP_canaux + ΔP_cheminée    [Pa]
```

Courbe du ventilateur (centrifuge) :
```
H = a − b × Q          (parabolique)
```

**Point de fonctionnement** : intersection courbe ventilateur / réseau.

### 13.2 Puissance [kW]

```
P = (Q_Nm3_h / 3 600) × ΔP_Pa / (η_vent × 1 000)
η_vent = 0.70 – 0.85
```

### 13.3 Correction de température

```
ρ_fum(T) = ρ_air × T_ref / (T_fum + 273.15)
Q_réel   = Q_Nm3 × (T_fum + 273.15) / T_ref × (P_ref / P_local)    [m³/h]
```

---

## 14. Mode RETRO — Logique générale

### Fichiers : `src/Z_RETRO/<EQUIPMENT>/`

Le mode RETRO inverse le sens de calcul :

- **Données connues** : conditions en sortie (T_out, P_out, composition cible)
- **Inconnues** : conditions d'entrée requises, dimensions, pertes de charge

**Méthode générale (WHB en exemple)** :

```
Données : T_sortie_cible, P_vapeur, Q_vapeur [kg/h]

1. h_vapeur_out = h_pT(P_vapeur, T_sat)       [tables IAPWS-IF97]
2. h_vapeur_in  = hL(T_sat)                   [eau d'alimentation]
3. Q_requis = Q_vapeur × (h_vapeur_out − h_vapeur_in)
4. A_échange = Q_requis / (U × ΔTLM)
5. T_fumées_in = T_sortie + ΔT_calculé par bilan enthalpique inverse
```

**Pour chaque équipement**, le bilan s'écrit :

```
H_out = H_in − Pertes − Q_échangé
→ H_in = H_out + Pertes + Q_échangé      (RETRO : H_in est l'inconnue)
→ T_in = TEMP_FUMEE(H_in, composition)   (inversion par dichotomie)
```

---

## 15. Tables de vapeur IAPWS-IF97

### Fichier : `src/A_Transverse_fonction/steam_table3.js`

Formulation industrielle IAPWS-IF97 couvrant 6 régions thermodynamiques.

| Fonction | Description |
|----------|-------------|
| `Tsat_p(P)` | Température de saturation à P [bar] |
| `hL_T(T)` | Enthalpie liquide saturé à T [kJ/kg] |
| `hV_T(T)` | Enthalpie vapeur saturée à T [kJ/kg] |
| `h_pT(P, T)` | Enthalpie à (P, T) [kJ/kg] |
| `s_pT(P, T)` | Entropie à (P, T) [kJ/(kg·K)] |
| `Cp_pT(P, T)` | Chaleur spécifique à (P, T) [kJ/(kg·K)] |

---

## 16. Base de données émissivité fumées

### Fichier : `src/A_Transverse_fonction/FG_emissivite.js`

Interpolation 4D sur les paramètres (T, pL, Pe, MR) :

```
Paramètres :
  T   : température [K]              → interpolation linéaire (pas 25 K)
  pL  : épaisseur optique [m·bar]    → interpolation logarithmique
  Pe  : pression partielle [bar]     → extrapolation logarithmique
  MR  : ratio molaire H2O/CO2        → interpolation linéaire

Algorithme :
  1. Trouver les bornes pour chacun des 4 paramètres
  2. 2⁴ = 16 lectures dans la table de base
  3. Interpoler T (linéaire), pL (log), Pe (log), MR (linéaire)
  4. Superposition CO2 + H2O + CO avec corrections de bandes croisées

Résultat :
  ε_total = ε_CO2 + ε_H2O + ε_CO
          − ε_CO2+H2O − ε_H2O+CO − ε_CO2+CO − ε_H2O+CO2+CO
```

---

## Récapitulatif des lois physiques appliquées

| Loi | Application dans l'outil |
|-----|--------------------------|
| 1er principe thermodynamique | Tous les bilans massiques et énergétiques |
| Stœchiométrie de combustion | FB, RK : produits de combustion |
| Gaz parfaits (PV = nRT) | Conversions Nm³ ↔ m³ ↔ kg |
| Stefan-Boltzmann (Q = ε·σ·A·ΔT⁴) | WHB : transfert radiatif par section |
| DTLM — Différence de Température Log-Moyenne | WHB : dimensionnement échangeur |
| Polynômes de Kirchhoff-Planck | Enthalpies gaz en fonction de T |
| IAPWS-IF97 | Propriétés vapeur d'eau |
| Dispersion gaussienne (Pasquill-Gifford) | STACK : modèle de dispersion |
| Loi de Ranz-Marshall / SMD | QUENCH : caractérisation des gouttelettes |
| Tables Hottel/JANAF (interpolation 4D) | WHB : émissivité fumées |
