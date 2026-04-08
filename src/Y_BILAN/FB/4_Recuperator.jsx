import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {calculDebitPT, tempSortieFumees, D_TLM,Fact_UA,Coef_Hext,Coef_Hint, Fact_U,Fact_U_Encrasse,Fact_A, DP_RecupAir,
} from '../../A_Transverse_fonction/bilan_fct_FB';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

// ✅ Hook personnalisé pour traductions dynamiques
const useTranslation = (currentLanguage = 'fr') => {
  return useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);
};


const Recuperateur = ({ innerData = {}, combustionResults = {}, currentLanguage = 'fr' }) => {
  const t = useTranslation(currentLanguage);

  const [freeParams, setFreeParams] = useState({
    Encrassement_pourcent: 10,
    vitesse_des_fumees_m_s: 16,
    PDC_carneau_mmCE: 5,                //OK
    PDC_echangeur_air_mmCE: 0,
    PDC_recuperateur_fumees_mmCE: 40,
    vitesse_air_m_s: 25,
    PDC_reseau_sortie_entree_boite_mmCe: 50,
  });

  // Données reçues du CombustionTab (imposées - lecture seule)
  const T_entree_fumee_C = innerData?.Temp_fumee_voute_C ?? 870;   //OK
  const Q_FG_wet_Nm3_h = innerData?.FG_wet_Nm3_h ?? 5280;          //OK
  const P_freeboard_mmCE = innerData?.P_freeboard ?? 89;           //OK
  
  const H_fumees_in_kW = innerData?.Hf_voute_kW ?? 0;              //OK
  const rho_FG = innerData?.Rho_FG_kg_Nm3 ?? 1.1;

  // Fractions massiques fumées [kg/h] depuis CombustionTab
  const m_co = innerData?.m_co ?? 0;
  const m_co2 = innerData?.m_co2 ?? 0;
  const m_h2o = innerData?.m_h2o ?? 0;
  const m_h2 = innerData?.m_h2 ?? 0;
  const m_n2 = innerData?.m_n2 ?? 0;
  const m_o2 = innerData?.m_o2 ?? 0;
  const m_so2 = innerData?.m_so2 ?? 0;
  const m_chcl = innerData?.m_chcl ?? 0;

  // Air depuis CombustionTab
  const T_air_entree_C = innerData?.Temp_air_fluidisation_av_prechauffe_C?? 0;
  const Q_Air_dry_Nm3_h = innerData?.Q_air_comb_tot_Nm3_h ?? 0;
  const Masse_air_sec_combustion_kg_h = innerData?.Masse_air_sec_combustion_tot_kg_h ?? 0;

  // Rendement HX depuis CombustionTab (en %)
  const Rdt_HX_percent = innerData?.Rdt_HX ?? 85;
  const Rdt_HX = Rdt_HX_percent / 100;

  // ============================================================
  // CALCUL PRINCIPAL - DESIGN RÉCUPÉRATEUR (useMemo)
  // ============================================================

  const designRecup = useMemo(() => {
    try {
      // ────────────────────────────────────────────────────────
      // ÉTAPE 1 : DÉBITS VOLUMIQUES RÉELS (côté fumées)
      // ────────────────────────────────────────────────────────

      const P_entree_HX_fumees = P_freeboard_mmCE - freeParams.PDC_carneau_mmCE;
      const Q_FG_wet_m3_h = calculDebitPT(Q_FG_wet_Nm3_h, P_entree_HX_fumees, T_entree_fumee_C);

      // ────────────────────────────────────────────────────────
      // ÉTAPE 2 : CALCUL DE LA CHALEUR À TRANSFÉRER À L'AIR
      // ────────────────────────────────────────────────────────

      // T_sortie_air_C dépend du rendement HX et de l'enthalpie fournie
      // Hypothèse : on itère pour trouver T_sortie_air qui satisfait le bilan
      let T_sortie_air_C = T_air_entree_C + 100; // Estimation initiale

      // Calcul de l'enthalpie air entrée HX (après soufflante : +45°C)
      const DT_soufflante_C = 45;
      const T_air_entree_HX_C = T_air_entree_C + DT_soufflante_C;

      // Calcul de l'enthalpie fournie par les fumées
      const H_apporte_par_fumee_kW = H_fumees_in_kW * Rdt_HX;

      // ────────────────────────────────────────────────────────
      // ÉTAPE 3 : ENTHALPIE FUMÉES SORTIE
      // ────────────────────────────────────────────────────────

      const H_fumees_out_kW = H_fumees_in_kW - H_apporte_par_fumee_kW;

      // Température fumées sortie HX (calculée à partir de l'enthalpie)
      const T_fumee_sortie_HX_C = tempSortieFumees(
        m_co,
        m_co2,
        m_h2o,
        m_h2,
        m_n2,
        m_o2,
        m_so2,
        m_chcl,
        H_fumees_out_kW
      );

      // ────────────────────────────────────────────────────────
      // ÉTAPE 4 : CALCUL DE DTLM ET UA
      // ────────────────────────────────────────────────────────

      const DTLM = D_TLM(T_fumee_sortie_HX_C, T_entree_fumee_C, T_sortie_air_C, T_air_entree_HX_C);

      const Facteur_UA = DTLM > 0 ? (H_apporte_par_fumee_kW / DTLM) * 1000 : 0; // en W/K

      // ────────────────────────────────────────────────────────
      // ÉTAPE 5 : COEFFICIENTS DE TRANSFERT THERMIQUE
      // ────────────────────────────────────────────────────────

      const Coeff_Hext = Coef_Hext(freeParams.vitesse_des_fumees_m_s);
      const Section_calandre_m2 =
        (Q_FG_wet_Nm3_h * rho_FG) / 3600 / freeParams.vitesse_des_fumees_m_s;

      const coeff_Hint = Coef_Hint(freeParams.vitesse_air_m_s);
      const coeff_U_propre_kcal_m2_h = Fact_U(Coeff_Hext, coeff_Hint);
      const FactUEncrasse = Fact_U_Encrasse(
        coeff_U_propre_kcal_m2_h,
        freeParams.Encrassement_pourcent / 100
      );
      const S_echange_m2 = Fact_A(Facteur_UA, FactUEncrasse);

      // ────────────────────────────────────────────────────────
      // ÉTAPE 6 : DÉBITS RÉELS CÔTÉ AIR
      // ────────────────────────────────────────────────────────

      const T_air_moyen_C = (T_air_entree_HX_C + T_sortie_air_C) / 2;
      const P_sortie_HX_mmCE = 2000 + freeParams.PDC_echangeur_air_mmCE;

      const Q_Air_dry_m3_h = calculDebitPT(Q_Air_dry_Nm3_h, P_sortie_HX_mmCE, T_sortie_air_C);

      // ────────────────────────────────────────────────────────
      // ÉTAPE 7 : PRESSIONS CÔTÉ FUMÉES
      // ────────────────────────────────────────────────────────

      const P_sortie_recuperateur_mmCE =
        P_freeboard_mmCE -
        freeParams.PDC_carneau_mmCE -
        freeParams.PDC_recuperateur_fumees_mmCE;

      const Q_FG_wet_sortie_HX_m3_h = calculDebitPT(
        Q_FG_wet_Nm3_h,
        P_sortie_recuperateur_mmCE,
        T_fumee_sortie_HX_C
      );

      // ────────────────────────────────────────────────────────
      // ÉTAPE 8 : PRESSIONS CÔTÉ AIR ET SOUFFLANTE
      // ────────────────────────────────────────────────────────

      const PDC_pression_recuperation_air_mmCE = DP_RecupAir(
        2000,
        Q_Air_dry_Nm3_h,
        T_air_moyen_C,
        freeParams.vitesse_air_m_s,
        2,
        S_echange_m2
      );

      const Pression_soufflante_mmCe =
        2000 +
        PDC_pression_recuperation_air_mmCE +
        freeParams.PDC_reseau_sortie_entree_boite_mmCe;

      const Q_Air_entree_recuperateur_m3_h = calculDebitPT(
        Q_Air_dry_Nm3_h,
        Pression_soufflante_mmCe,
        T_air_entree_HX_C
      );

      // ────────────────────────────────────────────────────────
      // RETOUR DES RÉSULTATS
      // ────────────────────────────────────────────────────────

      return {
        // Entrées fumées
        T_entree_fumee_C,
        Q_FG_wet_Nm3_h,
        P_freeboard_mmCE,
        H_fumees_in_kW,
        rho_FG,
        m_co,
        m_co2,
        m_h2o,
        m_h2,
        m_n2,
        m_o2,
        m_so2,
        m_chcl,

        // Entrées air
        T_air_entree_C,
        Q_Air_dry_Nm3_h,
        Masse_air_sec_combustion_kg_h,
        Rdt_HX,

        // Débits réels
        Q_FG_wet_m3_h,
        Q_Air_dry_m3_h,
        Q_Air_entree_recuperateur_m3_h,
        Q_FG_wet_sortie_HX_m3_h,

        // Températures
        T_air_entree_HX_C,
        T_sortie_air_C,
        T_air_moyen_C,
        T_fumee_sortie_HX_C,
        DT_soufflante_C,

        // Énergies
        H_apporte_par_fumee_kW,
        H_fumees_out_kW,

        // Thermique
        DTLM,
        Facteur_UA,
        Coeff_Hext,
        Section_calandre_m2,
        coeff_Hint,
        coeff_U_propre_kcal_m2_h,
        FactUEncrasse,
        S_echange_m2,

        // Pressions
        P_entree_HX_fumees,
        P_sortie_recuperateur_mmCE,
        P_sortie_HX_mmCE,
        PDC_pression_recuperation_air_mmCE,
        Pression_soufflante_mmCe,

        // Paramètres libres
        ...freeParams,
      };
    } catch (err) {
      console.error('Erreur calcul Recuperateur:', err);
      return {};
    }
  }, [
    T_entree_fumee_C,
    Q_FG_wet_Nm3_h,
    P_freeboard_mmCE,
    H_fumees_in_kW,
    rho_FG,
    m_co,
    m_co2,
    m_h2o,
    m_h2,
    m_n2,
    m_o2,
    m_so2,
    m_chcl,
    T_air_entree_C,
    Q_Air_dry_Nm3_h,
    Masse_air_sec_combustion_kg_h,
    Rdt_HX,
    freeParams,
  ]);

  // ============================================================
  // MISE À JOUR innerData AVEC RÉSULTATS
  // ============================================================

  useEffect(() => {
    if (!innerData || Object.keys(designRecup).length === 0) return;

    innerData.T_fumee_sortie_HX_C = designRecup.T_fumee_sortie_HX_C ?? 0;
    innerData.P_sortie_HX_mmCE = designRecup.P_sortie_HX_mmCE ?? 0;
    innerData.Q_Air_dry_m3_h = designRecup.Q_Air_dry_m3_h ?? 0;
    innerData.T_sortie_air_C = designRecup.T_sortie_air_C ?? 0;
    innerData.S_echange_m2 = designRecup.S_echange_m2 ?? 0;
    innerData.DTLM_HX = designRecup.DTLM ?? 0;
    innerData.Facteur_UA = designRecup.Facteur_UA ?? 0;
  }, [designRecup, innerData]);

  // ============================================================
  // HANDLERS - MODIFICATION DES PARAMÈTRES LIBRES
  // ============================================================

  const handleFreeParamChange = useCallback((key, value) => {
    setFreeParams((prev) => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  }, []);

  // ============================================================
  // STYLES
  // ============================================================

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  const readOnlyStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#374151',
    cursor: 'not-allowed',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#333',
  };

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  };

  const cardTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#222',
  };

  const resultBox = {
    ...inputStyle,
    backgroundColor: '#e8f5e9',
    padding: '12px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2e7d32',
  };

  const resultBoxAlt = {
    ...inputStyle,
    backgroundColor: '#e3f2fd',
    padding: '12px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1565c0',
  };

  const statusBox =
    Object.keys(designRecup).length > 0
      ? {
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
        }
      : {
          background: '#fef3c7',
          border: '1px solid #fde047',
          color: '#78350f',
        };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ════════════════════════════════════════ HEADER ════════════════════════════════════════ */}
      <div
        style={{
          ...statusBox,
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        {Object.keys(designRecup).length > 0 ? (
          <span>
            ✅ {t('Récupérateur synchronisé') || 'Récupérateur synchronisé'} • T_fumée_sortie ={' '}
            {designRecup.T_fumee_sortie_HX_C?.toFixed(0) ?? '-'}°C • T_air_sortie ={' '}
            {designRecup.T_sortie_air_C?.toFixed(0) ?? '-'}°C
          </span>
        ) : (
          <span>
            ⏳ {t('En attente des résultats de combustion') || 'En attente des résultats de combustion'}
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════ DONNÉES IMPOSÉES (LECTURE SEULE) ════════════════════════════════════════ */}
      <div style={cardStyle}>
        <h2 style={cardTitle}>
          📥 {t('Valeurs imposées par l\'onglet Combustion') || 'Valeurs imposées par l\'onglet Combustion'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {[
            {
              label: t('T entrée fumées') || 'T entrée fumées',
              val: T_entree_fumee_C.toFixed(1),
              unit: '°C',
            },
            {
              label: t('Q FG humide') || 'Q FG humide',
              val: Q_FG_wet_Nm3_h.toFixed(0),
              unit: 'Nm³/h',
            },
            { label: t('H fumées entrée') || 'H fumées entrée', val: H_fumees_in_kW.toFixed(0), unit: 'kW' },
            { label: t('ρ fumées') || 'ρ fumées', val: rho_FG.toFixed(4), unit: 'kg/Nm³' },
            {
              label: t('P freeboard') || 'P freeboard',
              val: P_freeboard_mmCE.toFixed(0),
              unit: 'mmCE',
            },
            {
              label: t('Rendement HX') || 'Rendement HX',
              val: (Rdt_HX * 100).toFixed(1),
              unit: '%',
            },
            {
              label: t('T air av soufflante') || 'T air av soufflante',
              val: T_air_entree_C.toFixed(1),
              unit: '°C',
            },
            {
              label: t('Q air sec') || 'Q air sec',
              val: Q_Air_dry_Nm3_h.toFixed(0),
              unit: 'Nm³/h',
            },
            {
              label: t('M air sec comb.') || 'M air sec comb.',
              val: Masse_air_sec_combustion_kg_h.toFixed(0),
              unit: 'kg/h',
            },
          ].map(({ label, val, unit }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input
                type="text"
                value={`${val} ${unit}`}
                readOnly
                style={readOnlyStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════ PARAMÈTRES LIBRES (MODIFIABLES) ════════════════════════════════════════ */}
      <div style={cardStyle}>
        <h2 style={cardTitle}>
          ⚙️ {t('Paramètres d\'entrée libres') || 'Paramètres d\'entrée libres'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {[
            {
              label: t('Encrassement') || 'Encrassement',
              key: 'Encrassement_pourcent',
              unit: '%',
              step: '0.1',
            },
            {
              label: t('Vitesse fumées') || 'Vitesse fumées',
              key: 'vitesse_des_fumees_m_s',
              unit: 'm/s',
              step: '0.1',
            },
            {
              label: t('PDC carneau') || 'PDC carneau',
              key: 'PDC_carneau_mmCE',
              unit: 'mmCE',
              step: '0.1',
            },
            {
              label: t('PDC échangeur côté air') || 'PDC échangeur côté air',
              key: 'PDC_echangeur_air_mmCE',
              unit: 'mmCE',
              step: '0.1',
            },
            {
              label: t('PDC récupérateur côté fumées') || 'PDC récupérateur côté fumées',
              key: 'PDC_recuperateur_fumees_mmCE',
              unit: 'mmCE',
              step: '0.1',
            },
            {
              label: t('Vitesse air') || 'Vitesse air',
              key: 'vitesse_air_m_s',
              unit: 'm/s',
              step: '0.1',
            },
            {
              label: t('PDC réseau sortie/entrée boîte') || 'PDC réseau sortie/entrée boîte',
              key: 'PDC_reseau_sortie_entree_boite_mmCe',
              unit: 'mmCE',
              step: '0.1',
            },
          ].map(({ label, key, unit, step }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type="number"
                step={step}
                value={freeParams[key]}
                onChange={(e) => handleFreeParamChange(key, e.target.value)}
                style={inputStyle}
                placeholder={unit}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════ RÉSULTATS - DÉBITS VOLUMIQUES ════════════════════════════════════════ */}
      {Object.keys(designRecup).length > 0 && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>
            📊 {t('Débits volumiques réels') || 'Débits volumiques réels'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              {
                label: t('Q_FG_wet entrée HX') || 'Q_FG_wet entrée HX',
                val: designRecup.Q_FG_wet_m3_h,
                unit: 'm³/h',
              },
              {
                label: t('Q_FG_wet sortie HX') || 'Q_FG_wet sortie HX',
                val: designRecup.Q_FG_wet_sortie_HX_m3_h,
                unit: 'm³/h',
              },
              {
                label: t('Q air sec réel') || 'Q air sec réel',
                val: designRecup.Q_Air_dry_m3_h,
                unit: 'm³/h',
              },
              {
                label: t('Q air entrée récupérateur') || 'Q air entrée récupérateur',
                val: designRecup.Q_Air_entree_recuperateur_m3_h,
                unit: 'm³/h',
              },
            ].map(({ label, val, unit }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={resultBox}>{val?.toFixed(0) ?? '-'} {unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ RÉSULTATS - THERMIQUE ════════════════════════════════════════ */}
      {Object.keys(designRecup).length > 0 && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>
            🔥 {t('Bilan thermique') || 'Bilan thermique'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              {
                label: t('H air in HX') || 'H air in HX',
                val: designRecup.H_apporte_par_fumee_kW,
                unit: 'kW',
              },
              {
                label: t('H apporté par fumée') || 'H apporté par fumée',
                val: designRecup.H_apporte_par_fumee_kW,
                unit: 'kW',
              },
              {
                label: t('H fumées sortie') || 'H fumées sortie',
                val: designRecup.H_fumees_out_kW,
                unit: 'kW',
              },
              {
                label: t('T fumée calculée sortie HX') || 'T fumée calculée sortie HX',
                val: designRecup.T_fumee_sortie_HX_C,
                unit: '°C',
              },
              {
                label: t('T air moyen') || 'T air moyen',
                val: designRecup.T_air_moyen_C,
                unit: '°C',
              },
              {
                label: t('T air sortie HX') || 'T air sortie HX',
                val: designRecup.T_sortie_air_C,
                unit: '°C',
              },
              { label: 'DTLM', val: designRecup.DTLM, unit: 'K' },
            ].map(({ label, val, unit }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={resultBox}>{val?.toFixed(2) ?? '-'} {unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ RÉSULTATS - DIMENSIONNEMENT ════════════════════════════════════════ */}
      {Object.keys(designRecup).length > 0 && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>
            ⚙️ {t('Dimensionnement échangeur') || 'Dimensionnement échangeur'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              { label: t('Facteur UA') || 'Facteur UA', val: designRecup.Facteur_UA, unit: 'W/K' },
              { label: t('Hext') || 'Hext', val: designRecup.Coeff_Hext, unit: 'W/m²K' },
              { label: t('Hint') || 'Hint', val: designRecup.coeff_Hint, unit: 'W/m²K' },
              {
                label: t('U propre') || 'U propre',
                val: designRecup.coeff_U_propre_kcal_m2_h,
                unit: 'kcal/m²hK',
              },
              {
                label: t('U encrassé') || 'U encrassé',
                val: designRecup.FactUEncrasse,
                unit: 'kcal/m²hK',
              },
              { label: t('S échange') || 'S échange', val: designRecup.S_echange_m2, unit: 'm²' },
              {
                label: t('Section calandre') || 'Section calandre',
                val: designRecup.Section_calandre_m2,
                unit: 'm²',
              },
            ].map(({ label, val, unit }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={resultBoxAlt}>{val?.toFixed(4) ?? '-'} {unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ RÉSULTATS - HYDRAULIQUE ════════════════════════════════════════ */}
      {Object.keys(designRecup).length > 0 && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>
            💨 {t('Hydraulique') || 'Hydraulique'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              {
                label: t('P sortie récupérateur') || 'P sortie récupérateur',
                val: designRecup.P_sortie_recuperateur_mmCE,
                unit: 'mmCE',
              },
              {
                label: t('P sortie HX') || 'P sortie HX',
                val: designRecup.P_sortie_HX_mmCE,
                unit: 'mmCE',
              },
              {
                label: t('PDC côté air') || 'PDC côté air',
                val: designRecup.PDC_pression_recuperation_air_mmCE,
                unit: 'mmCE',
              },
              {
                label: t('Pression soufflante') || 'Pression soufflante',
                val: designRecup.Pression_soufflante_mmCe,
                unit: 'mmCE',
              },
            ].map(({ label, val, unit }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={resultBoxAlt}>{val?.toFixed(1) ?? '-'} {unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recuperateur;