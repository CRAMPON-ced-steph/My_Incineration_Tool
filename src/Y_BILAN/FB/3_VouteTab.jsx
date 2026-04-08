import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { Calcul_DH_Voute, calculDebitPT, PFreeBoard } from '../../A_Transverse_fonction/bilan_fct_FB';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

// ✅ Hook personnalisé pour traductions dynamiques
const useTranslation = (currentLanguage = 'fr') => {
  return useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);
};

const DimensionnementTab = ({ innerData = {}, innerDataTick, onDataChange, currentLanguage = 'fr' }) => {
  void innerDataTick;

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const REACTEURS = {
    R72: { Modele: 'R72', DiametreFreeboard: 7.2, DiametreVoute: 4.9, NrTuyere: 409 },
    R67: { Modele: 'R67', DiametreFreeboard: 6.7, DiametreVoute: 4.54, NrTuyere: 337 },
    R63: { Modele: 'R63', DiametreFreeboard: 6.2, DiametreVoute: 3.97, NrTuyere: 278 },
    R56: { Modele: 'R56', DiametreFreeboard: 5.6, DiametreVoute: 3.58, NrTuyere: 219 },
    R50: { Modele: 'R50', DiametreFreeboard: 5.0, DiametreVoute: 3.15, NrTuyere: 173 },
    R43: { Modele: 'R43', DiametreFreeboard: 4.3, DiametreVoute: 2.714, NrTuyere: 128 },
    R36: { Modele: 'R36', DiametreFreeboard: 3.6, DiametreVoute: 2.258, NrTuyere: 93 },
    R28: { Modele: 'R28', DiametreFreeboard: 2.85, DiametreVoute: 1.802, NrTuyere: 61 },
  };

  const [parametres, setParametres] = useState({
    NombreFour: '1',
    DebitVolFumeesHumide_Nm3hFour: innerData?.FG_wet_Nm3_h ?? 0,
    VolTotalAirInstrumentation_Nm3h: innerData?.Volume_air_balayage ?? 0,
    Modele: 'R36',
    DiametreTrous_mm: '5',
    TempNiveauVoute_C: '720',
    NeutralisationCentre: true,
    TempFreeboard_C: innerData?.Temp_fumee_voute_C ?? 870,
    PressionFreeboard_mmCe: '0',
    PressionVouteDefaut_mmCe: '2000',
    TempEntreeBoiteVent_C: innerData?.Tair_ap_prechauffe_C ?? 0,
    VolAirEntreeBoiteVent_Nm3h: innerData?.Q_air_comb_tot_Nm3_h ?? 0,
    VitesseReelleTuyere_ms: '90',
  });

  useEffect(() => {
    setParametres((prev) => ({
      ...prev,
      DebitVolFumeesHumide_Nm3hFour: innerData?.FG_wet_Nm3_h ?? prev.DebitVolFumeesHumide_Nm3hFour,
      VolTotalAirInstrumentation_Nm3h: innerData?.Volume_air_balayage ?? prev.VolTotalAirInstrumentation_Nm3h,
      TempFreeboard_C: innerData?.Temp_fumee_voute_C ?? prev.TempFreeboard_C,
    }));
  }, [innerData?.FG_wet_Nm3_h, innerData?.Volume_air_balayage, innerData?.Temp_fumee_voute_C]);

  const calculsComplets = useMemo(() => {
    const NombreFour = Number(parametres.NombreFour) || 1;
    const DebitVolFumeesHumide_Nm3hFour = (Number(parametres.DebitVolFumeesHumide_Nm3hFour) || 0) / NombreFour;
    const VolTotalAirInstrumentation_Nm3h = Number(parametres.VolTotalAirInstrumentation_Nm3h) || 0;
    const TempFreeboard_C = Number(parametres.TempFreeboard_C) || 870;
    const PressionFreeboard_mmCe = 0;
    const DebitFumeesHumides_m3hFour = calculDebitPT(DebitVolFumeesHumide_Nm3hFour, PressionFreeboard_mmCe, TempFreeboard_C);
    const VolAirInstr20PctHautFour_Nm3h = calculDebitPT(0.2 * VolTotalAirInstrumentation_Nm3h, PressionFreeboard_mmCe, TempFreeboard_C);

    const Modele = parametres.Modele;
    const reacteur = REACTEURS[Modele];
    if (!reacteur) return null;

    const DiametreFreeboard_m = reacteur.DiametreFreeboard;
    const VitesseReelleFour_ms =
      (DebitFumeesHumides_m3hFour - VolTotalAirInstrumentation_Nm3h) /
      ((3.14159 * Math.pow(DiametreFreeboard_m, 2)) / 4) /
      3600;

    const NeutralisationCentre = parametres.NeutralisationCentre !== false;
    const NbrTuyeresTotal = reacteur.NrTuyere;
    const NbrTuyeresNeutral = NeutralisationCentre === false ? Math.ceil(NbrTuyeresTotal * 0.1) : 0;
    const NbrTuyeres = NbrTuyeresTotal - NbrTuyeresNeutral;

    const PressionVouteDefaut_mmCe = Number(parametres.PressionVouteDefaut_mmCe) || 2000;
    const DiametreTrous_mm = Number(parametres.DiametreTrous_mm) || 5;
    const DiametreVoute_m = reacteur.DiametreVoute;
    const TempEntreeBoiteVent_C = Number(parametres.TempEntreeBoiteVent_C);
    const VolAirEntreeBoiteVent_Nm3h = Number(parametres.VolAirEntreeBoiteVent_Nm3h);
    const TempNiveauVoute_C = Number(parametres.TempNiveauVoute_C) || 720;
    const DebitAirReelBoiteVentM3h_init_m3h = calculDebitPT(VolAirEntreeBoiteVent_Nm3h, PressionVouteDefaut_mmCe, TempEntreeBoiteVent_C);

    let VitesseReelleTuyere_ms = Number(parametres.VitesseReelleTuyere_ms) || 90;

    // Iteration 1
    let PDC_Voute_Iter1 = Calcul_DH_Voute(PressionVouteDefaut_mmCe, TempEntreeBoiteVent_C, VitesseReelleTuyere_ms);
    let PressionVoute_mmCe = 2000 - PDC_Voute_Iter1 * 1000;
    let DebitAirReelBoiteVent_m3h = calculDebitPT(VolAirEntreeBoiteVent_Nm3h, PressionVoute_mmCe, TempNiveauVoute_C);

    const SurfaceVoute_m2 = (Math.PI * Math.pow(DiametreVoute_m, 2)) / 4;

    let DebitAirReelBoiteVentM3h_m3s = DebitAirReelBoiteVent_m3h / 3600;
    const DiametreVouteCalcule_m = Math.pow((4 * DebitAirReelBoiteVentM3h_m3s) / Math.PI, 0.5);

    let DebitReelTuyeres_m3s = DebitAirReelBoiteVentM3h_init_m3h / 3600 / NbrTuyeres;
    let SurfaceTuyeresReelle_m2 = DebitReelTuyeres_m3s / 90;
    let nb_de_trous = Math.floor((4 * SurfaceTuyeresReelle_m2) / (Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)));
    SurfaceTuyeresReelle_m2 = (nb_de_trous * Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)) / 4;
    VitesseReelleTuyere_ms = SurfaceTuyeresReelle_m2 > 0 ? DebitReelTuyeres_m3s / SurfaceTuyeresReelle_m2 : 0;

    const PDC_Voute_Iter1_saved = PDC_Voute_Iter1;
    const PressionVoute_Iter1_mmCe = PressionVoute_mmCe;
    const DebitAirReelBoiteVentIter1_m3h = DebitAirReelBoiteVent_m3h;
    const DebitReelTuyeresIter1_m3s = DebitReelTuyeres_m3s;
    const SurfaceTuyeresReelleIter1_m2 = SurfaceTuyeresReelle_m2;
    const NbTrousIter1 = nb_de_trous;
    const VitesseReelleTuyereIter1_ms = VitesseReelleTuyere_ms;

    // Iteration 2
    PDC_Voute_Iter1 = Calcul_DH_Voute(PressionVouteDefaut_mmCe, TempEntreeBoiteVent_C, VitesseReelleTuyere_ms);
    PressionVoute_mmCe = 2000 - PDC_Voute_Iter1 * 1000;
    DebitAirReelBoiteVent_m3h = calculDebitPT(VolAirEntreeBoiteVent_Nm3h, PressionVoute_mmCe, TempNiveauVoute_C);
    DebitAirReelBoiteVentM3h_m3s = DebitAirReelBoiteVent_m3h / 3600;
    DebitReelTuyeres_m3s = DebitAirReelBoiteVentM3h_init_m3h / 3600 / NbrTuyeres;
    SurfaceTuyeresReelle_m2 = DebitReelTuyeres_m3s / 90;
    nb_de_trous = Math.floor((4 * SurfaceTuyeresReelle_m2) / (Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)));
    SurfaceTuyeresReelle_m2 = (nb_de_trous * Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)) / 4;
    VitesseReelleTuyere_ms = SurfaceTuyeresReelle_m2 > 0 ? DebitReelTuyeres_m3s / SurfaceTuyeresReelle_m2 : 0;
    const PressionFreeboard = PFreeBoard(PressionVouteDefaut_mmCe, PDC_Voute_Iter1);

    return {
      NombreFour,
      DebitVolFumeesHumide_Nm3hFour,
      VolTotalAirInstrumentation_Nm3h,
      DiametreTrous_mm,
      TempNiveauVoute_C,
      NeutralisationCentre,
      TempFreeboard_C,
      PressionFreeboard_mmCe,
      PressionVouteDefaut_mmCe,
      TempEntreeBoiteVent_C,
      VolAirEntreeBoiteVent_Nm3h,
      Modele,
      DiametreFreeboard_m,
      DiametreVoute_m,
      DebitFumeesHumides_m3hFour,
      VolAirInstr20PctHautFour_Nm3h,
      VitesseReelleFour_ms,
      NbrTuyeresTotal,
      NbrTuyeresNeutral,
      NbrTuyeres,
      SurfaceVoute_m2,
      DiametreVouteCalcule_m,
      DebitAirReelBoiteVentM3h_init_m3h,
      PDC_Voute_Iter1: PDC_Voute_Iter1_saved,
      PressionVoute_Iter1_mmCe,
      DebitAirReelBoiteVentIter1_m3h,
      DebitReelTuyeresIter1_m3s,
      SurfaceTuyeresReelleIter1_m2,
      NbTrousIter1,
      VitesseReelleTuyereIter1_ms,
      PDC_Voute_Iter2: PDC_Voute_Iter1,
      PressionVoute_Iter2_mmCe: PressionVoute_mmCe,
      DebitAirReelBoiteVentIter2_m3h: DebitAirReelBoiteVent_m3h,
      DebitReelTuyeresIter2_m3s: DebitReelTuyeres_m3s,
      SurfaceTuyeresReelleIter2_m2: SurfaceTuyeresReelle_m2,
      NbTrousIter2: nb_de_trous,
      VitesseReelleTuyereIter2_ms: VitesseReelleTuyere_ms,
      PressionFreeboard,
    };
  }, [parametres, REACTEURS]);

  useEffect(() => {
    if (!calculsComplets || !onDataChange) return;
    const reacteur = REACTEURS[calculsComplets.Modele];
    onDataChange({
      ...calculsComplets,
      DiametreFreeboard: reacteur?.DiametreFreeboard,
      DiametreVoute: reacteur?.DiametreVoute,
      NrTuyereTotal: reacteur?.NrTuyere,
      Pression_Freeboard: calculsComplets.PressionFreeboard,
    });
  }, [calculsComplets, onDataChange, REACTEURS]);

  const handleParametreChange = useCallback((key, value) => {
    setParametres((prev) => ({ ...prev, [key]: value }));
  }, []);

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
  };
  const readOnlyStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#374151',
  };
  const labelStyle = {
    display: 'block',
    color: '#374151',
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '6px',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a202c' }}>🔄 {t('Dimensionnement') || 'Dimensionnement'}</h1>

      <div
        style={{
          background: innerData?.FG_wet_Nm3_h ? '#dcfce7' : '#fef3c7',
          padding: '10px 15px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '13px',
          border: `1px solid ${innerData?.FG_wet_Nm3_h ? '#86efac' : '#fde047'}`,
        }}
      >
        <strong>📡 {t('Données reçues') || 'Données reçues'} CombustionTab :</strong>
        <span style={{ marginLeft: '10px' }}>
          FG_wet_Nm3_h = {innerData?.FG_wet_Nm3_h ? Math.round(innerData.FG_wet_Nm3_h) : 'N/A'} |&nbsp;
          V_air_balayage_Nm3_h = {innerData?.Volume_air_balayage?.toFixed(2) || 'N/A'} |&nbsp;
          <strong style={{ color: '#ea580c' }}>
            Temp_fumee_voute_C = {innerData?.Temp_fumee_voute_C ?? 'N/A'} °C
          </strong>
        </span>
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          🔥 {t('Paramètres du Four') || 'Paramètres du Four'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div>
            <label style={labelStyle}>NombreFour</label>
            <input
              type="number"
              min="1"
              value={parametres.NombreFour}
              onChange={(e) => handleParametreChange('NombreFour', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Débit Fumées Humide') || 'Débit Fumées Humide'} [Nm³/h/Four]</label>
            <input
              type="number"
              min="0"
              step="100"
              value={Math.round(parametres.DebitVolFumeesHumide_Nm3hFour)}
              onChange={(e) => handleParametreChange('DebitVolFumeesHumide_Nm3hFour', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Air Instrumentation') || 'Air Instrumentation'} [Nm³/h]</label>
            <input
              type="number"
              min="0"
              step="10"
              value={Math.round(parametres.VolTotalAirInstrumentation_Nm3h)}
              onChange={(e) => handleParametreChange('VolTotalAirInstrumentation_Nm3h', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, color: '#ea580c' }}>
              🌡️ {t('Température Freeboard') || 'Température Freeboard'} [°C]
            </label>
            <input
              type="text"
              value={`${parametres.TempFreeboard_C} °C`}
              readOnly
              style={{ ...readOnlyStyle, backgroundColor: '#fff7ed', border: '2px solid #f97316', color: '#c2410c' }}
            />
          </div>
          <div>
            <label style={labelStyle}>PressionFreeboard_mmCe = 0</label>
            <input type="text" value="0" disabled style={{ ...readOnlyStyle, cursor: 'not-allowed' }} />
          </div>
        </div>

        {calculsComplets && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
            <h3 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '10px' }}>
              📤 {t('Résultats') || 'Résultats'} - Four
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={labelStyle}>{t('Débit Fumées Humides') || 'Débit Fumées Humides'} [m³/h/Four]</label>
                <input
                  type="text"
                  value={calculsComplets.DebitFumeesHumides_m3hFour.toFixed(2)}
                  readOnly
                  style={readOnlyStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>VitesseReelleFour [m/s]</label>
                <input
                  type="text"
                  value={calculsComplets.VitesseReelleFour_ms.toFixed(3)}
                  readOnly
                  style={readOnlyStyle}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          ⚙️ {t('Sélection du Réacteur') || 'Sélection du Réacteur'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t('Modèle') || 'Modèle'}</label>
            <select
              value={parametres.Modele}
              onChange={(e) => handleParametreChange('Modele', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {Object.keys(REACTEURS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div style={{ padding: '15px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
              {t('Caractéristiques') || 'Caractéristiques'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6b7280' }}>DiametreFreeboard:</span>
                <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>
                  {REACTEURS[parametres.Modele]?.DiametreFreeboard} m
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>DiametreVoute:</span>
                <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>
                  {REACTEURS[parametres.Modele]?.DiametreVoute} m
                </span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>NrTuyere:</span>
                <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{REACTEURS[parametres.Modele]?.NrTuyere}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={labelStyle}>{t('NeutralisationCentre') || 'NeutralisationCentre'}</label>
            <select
              value={parametres.NeutralisationCentre ? 'true' : 'false'}
              onChange={(e) => handleParametreChange('NeutralisationCentre', e.target.value === 'true')}
              style={inputStyle}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>DiametreTrous_mm</label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={parametres.DiametreTrous_mm}
              onChange={(e) => handleParametreChange('DiametreTrous_mm', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
        {calculsComplets && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#fef3c7', border: '1px solid #fde047', borderRadius: '6px' }}>
            <h3 style={{ color: '#78350f', fontSize: '16px', marginBottom: '10px' }}>
              {t('Configuration Tuyères') || 'Configuration Tuyères'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: 'NbrTuyeresTotal', val: calculsComplets.NbrTuyeresTotal, color: '#f59e0b' },
                { label: 'NbrTuyeresNeutral', val: calculsComplets.NbrTuyeresNeutral, color: '#f59e0b' },
                { label: 'NbrTuyeres', val: calculsComplets.NbrTuyeres, color: '#10b981' },
                {
                  label: 'SurfaceVoute_m2',
                  val: calculsComplets.SurfaceVoute_m2.toFixed(2),
                  color: '#3b82f6',
                },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          🌡️ {t('Paramètres Voûte et Boîte à Vent') || 'Paramètres Voûte et Boîte à Vent'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {[
            { label: 'TempEntreeBoiteVent_C', key: 'TempEntreeBoiteVent_C', step: '10' },
            { label: 'TempNiveauVoute_C', key: 'TempNiveauVoute_C', step: '10' },
            { label: 'PressionVouteDefaut_mmCe', key: 'PressionVouteDefaut_mmCe', step: '100' },
            { label: 'VolAirEntreeBoiteVent_Nm3h', key: 'VolAirEntreeBoiteVent_Nm3h', step: '10' },
            { label: 'VitesseReelleTuyere_ms', key: 'VitesseReelleTuyere_ms', step: '1' },
          ].map(({ label, key, step }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type="number"
                min="0"
                step={step}
                value={parametres[key]}
                onChange={(e) => handleParametreChange(key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {calculsComplets && (
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
            🔄 {t('Résultats') || 'Résultats'} - {t('PREMIÈRE ITÉRATION') || 'PREMIÈRE ITÉRATION'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              { label: 'PDC_Voute_Iter1 [mCE]', val: calculsComplets.PDC_Voute_Iter1.toFixed(4), bg: '#fef3c7' },
              {
                label: 'PressionVoute_Iter1 [mmCe]',
                val: calculsComplets.PressionVoute_Iter1_mmCe.toFixed(2),
                bg: '#fef3c7',
              },
              {
                label: 'DebitAirReelBoiteVentIter1 [m3/h]',
                val: calculsComplets.DebitAirReelBoiteVentIter1_m3h.toFixed(2),
                bg: '#fef3c7',
              },
              {
                label: 'DebitReelTuyeresIter1 [m3/s]',
                val: calculsComplets.DebitReelTuyeresIter1_m3s.toFixed(4),
                bg: '#dcfce7',
              },
              { label: 'NbTrousIter1', val: calculsComplets.NbTrousIter1, bg: '#dcfce7' },
              {
                label: 'SurfaceTuyeresReelleIter1 [m2]',
                val: calculsComplets.SurfaceTuyeresReelleIter1_m2.toFixed(6),
                bg: '#dcfce7',
              },
              {
                label: 'VitesseReelleTuyereIter1 [m/s]',
                val: calculsComplets.VitesseReelleTuyereIter1_ms.toFixed(2),
                bg: '#e0e7ff',
              },
            ].map(({ label, val, bg }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input type="text" value={val} readOnly style={{ ...readOnlyStyle, backgroundColor: bg }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {calculsComplets && (
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
            🔄 {t('Résultats') || 'Résultats'} - {t('DEUXIÈME ITÉRATION (CONVERGE)') || 'DEUXIÈME ITÉRATION (CONVERGE)'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              { label: 'PDC_Voute_Iter2 [mCE]', val: calculsComplets.PDC_Voute_Iter2.toFixed(4), bg: '#fed7aa' },
              {
                label: 'PressionVoute_Iter2_mmCe',
                val: calculsComplets.PressionVoute_Iter2_mmCe.toFixed(2),
                bg: '#fed7aa',
              },
              {
                label: 'DebitAirReelBoiteVentIter2_m3h',
                val: calculsComplets.DebitAirReelBoiteVentIter2_m3h.toFixed(2),
                bg: '#fed7aa',
              },
              {
                label: 'DebitReelTuyeresIter2_m3s',
                val: calculsComplets.DebitReelTuyeresIter2_m3s.toFixed(4),
                bg: '#bbf7d0',
              },
              { label: 'NbTrousIter2', val: calculsComplets.NbTrousIter2, bg: '#bbf7d0' },
              {
                label: 'SurfaceTuyeresReelleIter2_m2',
                val: calculsComplets.SurfaceTuyeresReelleIter2_m2.toFixed(6),
                bg: '#bbf7d0',
              },
              {
                label: 'VitesseReelleTuyereIter2_ms',
                val: calculsComplets.VitesseReelleTuyereIter2_ms.toFixed(2),
                bg: '#ddd6fe',
              },
            ].map(({ label, val, bg }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input type="text" value={val} readOnly style={{ ...readOnlyStyle, backgroundColor: bg }} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>{t('PressionFreeboard FINAL') || 'PressionFreeboard FINAL'} [mmCE]</label>
              <input
                type="text"
                value={calculsComplets.PressionFreeboard.toFixed(2)}
                readOnly
                style={{ ...readOnlyStyle, backgroundColor: '#ddd6fe', fontSize: '16px' }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
            }}
          >
            <h4 style={{ color: '#1e40af', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
              📊 {t('Résumé Final') || 'Résumé Final'} - {t('Dimensionnement Réacteur') || 'Dimensionnement Réacteur'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '13px', color: '#1e40af' }}>
              {[
                { label: t('Modèle') || 'Modèle', val: parametres.Modele },
                {
                  label: t('NbrTuyeres Actives') || 'NbrTuyeres Actives',
                  val: calculsComplets.NbrTuyeres,
                },
                { label: 'NbTrous/Tuyère', val: calculsComplets.NbTrousIter2 },
                {
                  label: 'VitesseReelleTuyere [m/s]',
                  val: calculsComplets.VitesseReelleTuyereIter2_ms.toFixed(1),
                },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DimensionnementTab;