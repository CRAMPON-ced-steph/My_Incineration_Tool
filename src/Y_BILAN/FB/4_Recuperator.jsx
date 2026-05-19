import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
  calculDebitPT, D_TLM,
  Coef_Hext, Coef_Hint, Fact_U, Fact_U_Encrasse, Fact_A, DP_RecupAir,
  cp_air, cp_dt_h2o,
} from '../../A_Transverse_fonction/bilan_fct_FB';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

const useTranslation = (currentLanguage = 'fr') => {
  return useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);
};

const LS_KEY = 'freeParams_HX_FB';
const DEFAULT_FREE_PARAMS = {
  Encrassement_pourcent: 10,
  vitesse_des_fumees_m_s: 16,
  PDC_carneau_mmCE: 5,
  PDC_echangeur_air_mmCE: 0,
  PDC_recuperateur_fumees_mmCE: 40,
  vitesse_air_m_s: 25,
  PDC_reseau_sortie_entree_boite_mmCe: 50,
  PDC_HX_FG_mmCE: 50,
  Rendement_ventilateur: 0.7,
};

const Recuperateur = ({ innerData = {}, combustionResults = {}, currentLanguage = 'fr', onInnerDataChange }) => {
  const t = useTranslation(currentLanguage);

  const [freeParams, setFreeParams] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? { ...DEFAULT_FREE_PARAMS, ...JSON.parse(saved) } : DEFAULT_FREE_PARAMS;
    } catch { return DEFAULT_FREE_PARAMS; }
  });

  // ── Entrées fumées depuis CombustionTab ──
  const T_entree_fumee_C = innerData?.Temp_fumee_voute_C ?? 870;
  const Q_FG_wet_Nm3_h   = innerData?.FG_wet_Nm3_h ?? 5280;
  const P_freeboard_mmCE  = innerData?.P_freeboard ?? 89;
  const H_fumees_in_kW    = innerData?.Hf_voute_kW ?? 0;
  const rho_FG            = innerData?.Rho_FG_kg_Nm3 ?? 1.1;

  // ── Entrées air depuis CombustionTab ──
  const T_air_entree_C               = innerData?.Temp_air_fluidisation_av_prechauffe_C ?? 0;
  const Q_Air_dry_Nm3_h              = innerData?.Q_air_comb_tot_Nm3_h ?? 0;
  const Masse_air_sec_combustion_kg_h = innerData?.Masse_air_sec_combustion_tot_kg_h ?? 0;

  // ── Fumées après HX ──
  const Tf_voute_ap_HX_C  = innerData?.Tf_voute_ap_HX_C  ?? 550;
  const Hf_voute_ap_HX_kW = innerData?.Hf_voute_ap_HX_kW ?? 0;

  // ── Rendement HX ──
  const Rdt_HX = (innerData?.Rdt_HX ?? 85) / 100;

  // ── Air côté HX ──
  const Temp_air_soufflante_C    = innerData?.Temp_air_soufflante_C   ?? 60;
  const Tair_ap_prechauffe_C     = innerData?.Tair_ap_prechauffe_C    ?? 0;
  const P_voute_defaut_mmCE      = innerData?.PressionVouteDefaut_mmCe ?? 2000;
  const Hair_ap_prechauffage_kW  = innerData?.Hair_ap_prechauffage_kW  ?? 0;
  const Meau_air_comburant       = innerData?.Meau_air_comburant       ?? 0;

  // Col. 9 bilan énergétique détaillé — calculé localement (indépendant du montage de CombustionTab)
  const H_air_soufflante_kW =
    cp_air(Temp_air_soufflante_C) * Masse_air_sec_combustion_kg_h
    + cp_dt_h2o(Temp_air_soufflante_C) * Meau_air_comburant;

  // ============================================================
  // CALCUL PRINCIPAL - DESIGN RÉCUPÉRATEUR
  // ============================================================

  const designRecup = useMemo(() => {
    try {
      // ÉTAPE 1 : TEMPÉRATURE FUMÉES SORTIE HX — reprise du bilan CombustionTab (col. 11)
      const T_fumee_sortie_HX_C = Tf_voute_ap_HX_C;

      // CHALEUR ÉCHANGÉE — déduite des enthalpies CombustionTab
      const H_apporte_par_fumee_kW = H_fumees_in_kW - Hf_voute_ap_HX_kW;

      // ÉTAPE 2 : TEMPÉRATURES AIR
      const T_sortie_air_C    = T_air_entree_C + 100; // estimation initiale (non itérée)
      const T_air_entree_HX_C = T_air_entree_C + 45;  // +45°C apport soufflante

      // ÉTAPE 3 : DTLM ET UA
      const DTLM       = D_TLM(T_fumee_sortie_HX_C, T_entree_fumee_C, T_sortie_air_C, T_air_entree_HX_C);
      const Facteur_UA = DTLM > 0 ? (H_apporte_par_fumee_kW / DTLM) * 1000 : 0; // W/K

      // ÉTAPE 5 : COEFFICIENTS DE TRANSFERT THERMIQUE
      const Coeff_Hext              = Coef_Hext(freeParams.vitesse_des_fumees_m_s);
      const Section_calandre_m2     = (Q_FG_wet_Nm3_h * rho_FG) / 3600 / freeParams.vitesse_des_fumees_m_s;
      const coeff_Hint              = Coef_Hint(freeParams.vitesse_air_m_s);
      const coeff_U_propre_kcal_m2_h = Fact_U(Coeff_Hext, coeff_Hint);
      const FactUEncrasse           = Fact_U_Encrasse(coeff_U_propre_kcal_m2_h, freeParams.Encrassement_pourcent / 100);
      const S_echange_m2            = Fact_A(Facteur_UA, FactUEncrasse);

      // ÉTAPE 6 : DÉBIT RÉEL AIR ET PRESSION SORTIE HX
      const P_sortie_HX_mmCE = 2000 + freeParams.PDC_echangeur_air_mmCE;
      const Q_Air_dry_m3_h   = calculDebitPT(Q_Air_dry_Nm3_h, P_sortie_HX_mmCE, T_sortie_air_C);

      return {
        T_fumee_sortie_HX_C,
        T_sortie_air_C,
        P_sortie_HX_mmCE,
        Q_Air_dry_m3_h,
        DTLM,
        Facteur_UA,
        Coeff_Hext,
        Section_calandre_m2,
        coeff_Hint,
        FactUEncrasse,
        S_echange_m2,
      };
    } catch (err) {
      console.error('Erreur calcul Recuperateur:', err);
      return {};
    }
  }, [
    T_entree_fumee_C, Q_FG_wet_Nm3_h, H_fumees_in_kW, Hf_voute_ap_HX_kW,
    Tf_voute_ap_HX_C, rho_FG, T_air_entree_C, Q_Air_dry_Nm3_h, freeParams,
  ]);

  // ============================================================
  // MISE À JOUR innerData AVEC RÉSULTATS
  // ============================================================

  // ============================================================
  // DÉBITS AFFICHÉS DANS LES CARTES HX
  // ============================================================

  // Côté fumées
  const Q_FG_wet_entree_m3_h = calculDebitPT(Q_FG_wet_Nm3_h, P_freeboard_mmCE, T_entree_fumee_C);
  const P_sortie_HX_fg_mmCE  = P_freeboard_mmCE - freeParams.PDC_HX_FG_mmCE;
  const Q_FG_wet_sortie_m3_h = calculDebitPT(Q_FG_wet_Nm3_h, P_sortie_HX_fg_mmCE, Tf_voute_ap_HX_C);

  // Côté air
  const P_cote_air_sortie_mmCE = P_voute_defaut_mmCE;
  const Q_air_sortie_HX_m3_h   = calculDebitPT(Q_Air_dry_Nm3_h, P_cote_air_sortie_mmCE, Tair_ap_prechauffe_C);

  const T_air_moyen_HX_C = (Tair_ap_prechauffe_C + Temp_air_soufflante_C) / 2;
  const PDC_HX_cote_air_mmCE = DP_RecupAir(
    P_voute_defaut_mmCE,
    Q_air_sortie_HX_m3_h,
    T_air_moyen_HX_C,
    freeParams.vitesse_air_m_s,
    2,
    designRecup.S_echange_m2 ?? 0
  );

  const P_cote_air_entree_mmCE = P_cote_air_sortie_mmCE + PDC_HX_cote_air_mmCE;
  const Q_air_entree_HX_m3_h   = calculDebitPT(Q_Air_dry_Nm3_h, P_cote_air_entree_mmCE, Temp_air_soufflante_C);

  // ── Ventilateur ──
  const Q_air_pulser_Nm3_h     = innerData?.Volume_air_combustible_total_Nm3_h
    || combustionResults?.Volume_air_combustible_total_Nm3_h
    || 0;
  const Q_air_ventilateur_m3_h = calculDebitPT(Q_air_pulser_Nm3_h, P_cote_air_entree_mmCE, Temp_air_soufflante_C);
  const Puissance_elec_ventilateur_kW =
    freeParams.Rendement_ventilateur > 0
      ? ((Q_air_ventilateur_m3_h / 3600) * P_cote_air_entree_mmCE * 9.8 )/ freeParams.Rendement_ventilateur / 1000
      : 0;

  // ============================================================
  // MISE À JOUR innerData AVEC RÉSULTATS
  // ============================================================

  useEffect(() => {
    if (!innerData || Object.keys(designRecup).length === 0) return;
    // Résultats dimensionnement échangeur
    innerData.T_fumee_sortie_HX_C    = designRecup.T_fumee_sortie_HX_C    ?? 0;
    innerData.P_sortie_HX_mmCE       = designRecup.P_sortie_HX_mmCE       ?? 0;
    innerData.Q_Air_dry_m3_h         = designRecup.Q_Air_dry_m3_h         ?? 0;
    innerData.T_sortie_air_C         = designRecup.T_sortie_air_C         ?? 0;
    innerData.S_echange_m2           = designRecup.S_echange_m2           ?? 0;
    innerData.DTLM_HX                = designRecup.DTLM                   ?? 0;
    innerData.Facteur_UA             = designRecup.Facteur_UA              ?? 0;
    innerData.Coeff_Hext_HX          = designRecup.Coeff_Hext             ?? 0;
    innerData.coeff_Hint_HX          = designRecup.coeff_Hint             ?? 0;
    innerData.FactUEncrasse_HX       = designRecup.FactUEncrasse           ?? 0;
    innerData.Section_calandre_m2    = designRecup.Section_calandre_m2    ?? 0;
  }, [designRecup, innerData]);

  useEffect(() => {
    if (!innerData) return;
    // HX côté fumées — débits et pressions
    innerData.Q_FG_wet_entree_m3_h   = Q_FG_wet_entree_m3_h;
    innerData.P_sortie_HX_fg_mmCE    = P_sortie_HX_fg_mmCE;
    innerData.Q_FG_wet_sortie_m3_h   = Q_FG_wet_sortie_m3_h;
    // HX côté air — débits et pressions
    innerData.PDC_HX_cote_air_mmCE   = PDC_HX_cote_air_mmCE;
    innerData.P_cote_air_entree_mmCE = P_cote_air_entree_mmCE;
    innerData.Q_air_entree_HX_m3_h   = Q_air_entree_HX_m3_h;
    innerData.Q_air_sortie_HX_m3_h   = Q_air_sortie_HX_m3_h;
    innerData.H_air_soufflante_kW    = H_air_soufflante_kW;
    // Ventilateur
    innerData.Q_air_pulser_Nm3_h          = Q_air_pulser_Nm3_h;
    innerData.Q_air_ventilateur_m3_h      = Q_air_ventilateur_m3_h;
    innerData.Puissance_elec_ventilateur_kW = Puissance_elec_ventilateur_kW;
    innerData.Rendement_ventilateur_HX    = freeParams.Rendement_ventilateur;
    onInnerDataChange?.();
  }, [innerData,
    Q_FG_wet_entree_m3_h, P_sortie_HX_fg_mmCE, Q_FG_wet_sortie_m3_h,
    PDC_HX_cote_air_mmCE, P_cote_air_entree_mmCE, Q_air_entree_HX_m3_h,
    Q_air_sortie_HX_m3_h, H_air_soufflante_kW, Q_air_pulser_Nm3_h,
    Q_air_ventilateur_m3_h, Puissance_elec_ventilateur_kW,
    freeParams.Rendement_ventilateur, onInnerDataChange,
  ]);

  // ============================================================
  // HANDLERS
  // ============================================================

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(freeParams)); } catch { /* noop */ }
  }, [freeParams]);

  const handleFreeParamChange = useCallback((key, value) => {
    setFreeParams((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }, []);

  // ============================================================
  // STYLES
  // ============================================================

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #ddd',
    borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box',
  };
  const readOnlyStyle = {
    ...inputStyle, backgroundColor: '#f3f4f6', fontWeight: 'bold',
    color: '#374151', cursor: 'not-allowed',
  };
  const labelStyle = {
    display: 'block', marginBottom: '8px', fontWeight: '600',
    fontSize: '13px', color: '#333',
  };
  const cardStyle = {
    background: 'white', padding: '20px', borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px',
  };
  const cardTitle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#222' };
  const resultBox = {
    ...inputStyle, backgroundColor: '#e8f5e9', padding: '12px',
    textAlign: 'center', fontWeight: 'bold', color: '#2e7d32',
  };
  const resultBoxAlt = {
    ...inputStyle, backgroundColor: '#e3f2fd', padding: '12px',
    textAlign: 'center', fontWeight: 'bold', color: '#1565c0',
  };

  const hasResults = Object.keys(designRecup).length > 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>


      {/* ── HX CÔTÉ FUMÉES ── */}
      <div style={cardStyle}>
        <h2 style={cardTitle}>📥 {t('HX côté fumées') || 'HX côté fumées'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '5px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
              {t('Entrée') || 'Entrée'}
            </div>
            {[
              { label: t('Temp. fumée voûte / Freeboard [°C]') || 'Temp. fumée voûte / Freeboard [°C]', val: T_entree_fumee_C.toFixed(1), unit: '°C' },
              { label: t('Débit humide des fumées [Nm3/h]') || 'Débit humide des fumées [Nm3/h]', val: Q_FG_wet_Nm3_h.toFixed(0), unit: 'Nm³/h' },
              null,
              { label: t('Pression au freeboard [mmCE]') || 'Pression au freeboard [mmCE]', val: P_freeboard_mmCE.toFixed(0), unit: 'mmCE' },
              { label: t('Débit fumées humides entrée [m3/h]') || 'Débit fumées humides entrée [m3/h]', val: Q_FG_wet_entree_m3_h.toFixed(0), unit: 'm³/h' },
              { label: t('H fumées entrée [kW]') || 'H fumées entrée [kW]', val: H_fumees_in_kW.toFixed(0), unit: 'kW' },
            ].map((item, i) =>
              item === null ? (
                <div key={`space-l-${i}`} style={{ height: '55px' }} />
              ) : (
                <div key={item.label}>
                  <label style={labelStyle}>{item.label}</label>
                  <input type="text" value={`${item.val} ${item.unit}`} readOnly style={readOnlyStyle} />
                </div>
              )
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '5px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
              {t('Sortie') || 'Sortie'}
            </div>
            <div>
              <label style={labelStyle}>{t('Temp. fumées ap HX [°C]') || 'Temp. fumées ap HX [°C]'}</label>
              <input type="text" value={`${Tf_voute_ap_HX_C.toFixed(1)} °C`} readOnly style={readOnlyStyle} />
            </div>
            <div style={{ height: '55px' }} />
            <div>
              <label style={labelStyle}>{t('PDC HX côté fumées') || 'PDC HX côté fumées'} (mmCE)</label>
              <input type="number" step="1" value={freeParams.PDC_HX_FG_mmCE}
                onChange={(e) => handleFreeParamChange('PDC_HX_FG_mmCE', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>P = P_freeboard − PDC_HX_FG (mmCE)</label>
              <input type="text" value={`${P_sortie_HX_fg_mmCE.toFixed(0)} mmCE`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('Débit fumées humides sortie') || 'Débit fumées humides sortie'}</label>
              <input type="text" value={`${Q_FG_wet_sortie_m3_h.toFixed(0)} m³/h`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('Hf fumées ap HX [kW]') || 'Hf fumées ap HX [kW]'}</label>
              <input type="text" value={`${Hf_voute_ap_HX_kW.toFixed(0)} kW`} readOnly style={readOnlyStyle} />
            </div>
          </div>

        </div>
      </div>

      {/* ── HX CÔTÉ AIR ── */}
      <div style={cardStyle}>
        <h2 style={cardTitle}>⚙️ {t('HX côté air') || 'HX côté air'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

          {/* Colonne gauche : entrée air */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '5px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
              {t('Entrée') || 'Entrée'}
            </div>
            <div>
              <label style={labelStyle}>{t('Temp. air soufflante') || 'Temp. air soufflante'}</label>
              <input type="text" value={`${Temp_air_soufflante_C.toFixed(1)} °C`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Débit d'air humide [Nm3/h]") || "Débit d'air humide [Nm3/h]"}</label>
              <input type="text" value={`${Q_Air_dry_Nm3_h.toFixed(0)} Nm³/h`} readOnly style={readOnlyStyle} />
            </div>
            <div style={{ height: '55px' }} />
            <div>
              <label style={labelStyle}>{t('PDC HX côté air') || 'PDC HX côté air'} (mmCE)</label>
              <input type="text" value={`${PDC_HX_cote_air_mmCE.toFixed(1)} mmCE`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>P côté air entrée = P voûte + PDC_HX (mmCE)</label>
              <input type="text" value={`${P_cote_air_entree_mmCE.toFixed(0)} mmCE`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("Débit d'air en entrée de l'échangeur [m3/h]") || "Débit d'air en entrée de l'échangeur [m3/h]"}</label>
              <input type="text" value={`${Q_air_entree_HX_m3_h.toFixed(0)} m³/h`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('H air in HX [kW]') || 'H air in HX [kW]'}</label>
              <input type="text" value={`${H_air_soufflante_kW.toFixed(0)} kW`} readOnly style={readOnlyStyle} />
            </div>
          </div>

          {/* Colonne droite : sortie air */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '5px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
              {t('Sortie') || 'Sortie'}
            </div>
            <div>
              <label style={labelStyle}>{t('Temp. air flu. ap. préch.') || 'Temp. air flu. ap. préch.'}</label>
              <input type="text" value={`${Tair_ap_prechauffe_C.toFixed(1)} °C`} readOnly style={readOnlyStyle} />
            </div>
            <div style={{ height: '55px' }} />
            <div>
              <label style={labelStyle}>{t('Pression niveau Voûte par Défaut [mmCE]') || 'Pression niveau Voûte par Défaut [mmCE]'}</label>
              <input type="text" value={`${P_voute_defaut_mmCE.toFixed(0)} mmCE`} readOnly style={readOnlyStyle} />
            </div>
            <div style={{ height: '55px' }} />
            <div style={{ height: '55px' }} />
            <div>
              <label style={labelStyle}>{t("Débit air en sortie de l'échangeur [m3/h]") || "Débit air en sortie de l'échangeur [m3/h]"}</label>
              <input type="text" value={`${Q_air_sortie_HX_m3_h.toFixed(0)} m³/h`} readOnly style={readOnlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('H air out HX [kW]') || 'H air out HX [kW]'}</label>
              <input type="text" value={`${Hair_ap_prechauffage_kW.toFixed(0)} kW`} readOnly style={readOnlyStyle} />
            </div>
          </div>

        </div>
      </div>

      {/* ── DIMENSIONNEMENT DU VENTILATEUR ── */}
      <div style={cardStyle}>
        <h2 style={cardTitle}>💨 {t('Dimensionnement du ventilateur') || 'Dimensionnement du ventilateur'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

          <div>
            <label style={labelStyle}>{t("Débit d'air à pulser [Nm3/h]") || "Débit d'air à pulser [Nm3/h]"}</label>
            <input type="text" value={`${Q_air_pulser_Nm3_h.toFixed(0)} Nm³/h`} readOnly style={readOnlyStyle} />
          </div>

          <div>
            <label style={labelStyle}>{t('Pression ventilateur [mmCE]') || 'Pression ventilateur [mmCE]'}</label>
            <input type="text" value={`${P_cote_air_entree_mmCE.toFixed(0)} mmCE`} readOnly style={readOnlyStyle} />
          </div>

          <div>
            <label style={labelStyle}>{t('Temp. air soufflante') || 'Temp. air soufflante'}</label>
            <input type="text" value={`${Temp_air_soufflante_C.toFixed(1)} °C`} readOnly style={readOnlyStyle} />
          </div>

          <div>
            <label style={labelStyle}>{t('Débit air total sortie ventilateur [m3/h]') || 'Débit air total sortie ventilateur [m3/h]'}</label>
            <div style={resultBox}>{Q_air_ventilateur_m3_h.toFixed(0)} m³/h</div>
          </div>

          <div>
            <label style={labelStyle}>{t('Rendement du ventilateur') || 'Rendement du ventilateur'}</label>
            <input type="number" step="0.01" min="0.1" max="1"
              value={freeParams.Rendement_ventilateur}
              onChange={(e) => handleFreeParamChange('Rendement_ventilateur', e.target.value)}
              style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>{t('Puissance électrique consommée [kW]') || 'Puissance électrique consommée [kW]'}</label>
            <div style={resultBox}>{Puissance_elec_ventilateur_kW.toFixed(1)} kW</div>
          </div>

        </div>
      </div>

      {/* ── DIMENSIONNEMENT DE L'ÉCHANGEUR ── */}
      {hasResults && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>📊 {t("Dimensionnement de l'échangeur") || "Dimensionnement de l'échangeur"}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

            {/* Côté fumée */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
                {t('Côté fumée') || 'Côté fumée'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div>
                  <label style={labelStyle}>{t("Rendement de l'échangeur") || "Rendement de l'échangeur"} (%)</label>
                  <input type="text" value={`${(Rdt_HX * 100).toFixed(1)} %`} readOnly style={readOnlyStyle} />
                </div>

                <div>
                  <label style={labelStyle}>{t('Q chaleur apportée par les fumées') || 'Q chaleur apportée par les fumées'} (kW)</label>
                  <div style={resultBox}>{(H_fumees_in_kW - Hf_voute_ap_HX_kW).toFixed(1)} kW</div>
                </div>

                <div>
                  <label style={labelStyle}>DTLM (K)</label>
                  <div style={resultBox}>{designRecup.DTLM?.toFixed(2) ?? '-'} K</div>
                </div>

                <div>
                  <label style={labelStyle}>{t('Vitesse des fumées') || 'Vitesse des fumées'} (m/s)</label>
                  <input type="number" step="0.1" value={freeParams.vitesse_des_fumees_m_s}
                    onChange={(e) => handleFreeParamChange('vitesse_des_fumees_m_s', e.target.value)} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>{t('Hext') || 'Hext'} (kCal/m².°C)</label>
                  <div style={resultBoxAlt}>{designRecup.Coeff_Hext?.toFixed(4) ?? '-'} kCal/m².°C</div>
                </div>

                <div>
                  <label style={labelStyle}>{t('Facteur UA') || 'Facteur UA'} (W/K)</label>
                  <div style={resultBoxAlt}>{designRecup.Facteur_UA?.toFixed(4) ?? '-'} W/K</div>
                </div>

                <div>
                  <label style={labelStyle}>{t('Section calandre') || 'Section calandre'} (m²)</label>
                  <div style={resultBoxAlt}>{designRecup.Section_calandre_m2?.toFixed(4) ?? '-'} m²</div>
                </div>

              </div>
            </div>

            {/* Côté air */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #d1d5db', paddingBottom: '8px' }}>
                {t('Côté air') || 'Côté air'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div style={{ height: '55px' }} />

                <div>
                  <label style={labelStyle}>{t("Q chaleur reçue par l'air") || "Q chaleur reçue par l'air"} (kW)</label>
                  <div style={resultBox}>{(Hair_ap_prechauffage_kW - H_air_soufflante_kW).toFixed(1)} kW</div>
                </div>

                <div>
                  <label style={labelStyle}>{t('Pertes thermiques échangeur') || 'Pertes thermiques échangeur'} (kW)</label>
                  <div style={resultBox}>
                    {((H_fumees_in_kW - Hf_voute_ap_HX_kW) - (Hair_ap_prechauffage_kW - H_air_soufflante_kW)).toFixed(1)} kW
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("Vitesse de l'air") || "Vitesse de l'air"} (m/s)</label>
                  <input type="number" step="0.1" value={freeParams.vitesse_air_m_s}
                    onChange={(e) => handleFreeParamChange('vitesse_air_m_s', e.target.value)} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>{t('Hint') || 'Hint'} (kCal/m².°C)</label>
                  <div style={resultBoxAlt}>{designRecup.coeff_Hint?.toFixed(4) ?? '-'} kCal/m².°C</div>
                </div>

                <div>
                  <label style={labelStyle}>{t('U encrassé') || 'U encrassé'} (kCal/m².°C)</label>
                  <div style={resultBoxAlt}>{designRecup.FactUEncrasse?.toFixed(4) ?? '-'} kCal/m².°C</div>
                </div>

                <div>
                  <label style={labelStyle}>{t("Surface d'échange") || "Surface d'échange"} (m²)</label>
                  <div style={resultBoxAlt}>{designRecup.S_echange_m2?.toFixed(4) ?? '-'} m²</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Recuperateur;
