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
    R72: { DiametreFreeboard: 7.2 },
    R67: { DiametreFreeboard: 6.7 },
    R63: { DiametreFreeboard: 6.2 },
    R56: { DiametreFreeboard: 5.6 },
    R50: { DiametreFreeboard: 5.0 },
    R43: { DiametreFreeboard: 4.3 },
    R36: { DiametreFreeboard: 3.6 },
    R28: { DiametreFreeboard: 2.85 },
  };

  const VOUTES = {
    '4.9':   { DiametreVoute: 4.9,   NrTuyere: 407 },
    '4.54':  { DiametreVoute: 4.54,  NrTuyere: 335 },
    '3.97':  { DiametreVoute: 3.97,  NrTuyere: 276 },
    '3.58':  { DiametreVoute: 3.58,  NrTuyere: 217 },
    '3.15':  { DiametreVoute: 3.15,  NrTuyere: 171 },
    '2.714': { DiametreVoute: 2.714, NrTuyere: 126 },
    '2.258': { DiametreVoute: 2.258, NrTuyere: 91  },
    '1.802': { DiametreVoute: 1.802, NrTuyere: 59  },
  };

  const [parametres, setParametres] = useState({
    NombreFour: innerData?.NombreFour?.toString() ?? '1',
    DebitVolFumeesHumide_Nm3hFour: innerData?.FG_wet_Nm3_h ?? 0,
    VolTotalAirInstrumentation_Nm3h: innerData?.Volume_air_balayage ?? 0,
    Modele: innerData?.Modele ?? 'R36',
    DiametreVouteKey: innerData?.DiametreVouteKey ?? '2.258',
    DiametreTrous_mm: innerData?.DiametreTrous_mm?.toString() ?? '5',
    TempNiveauVoute_C: innerData?.TempNiveauVoute_C?.toString() ?? '720',
    NeutralisationCentre: innerData?.NeutralisationCentre ?? true,
    TempFreeboard_C: innerData?.Temp_fumee_voute_C ?? 870,
    PressionFreeboard_mmCe: '0',
    PressionVouteDefaut_mmCe: innerData?.PressionVouteDefaut_mmCe?.toString() ?? '2000',
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

    const voute = VOUTES[parametres.DiametreVouteKey];
    if (!voute) return null;

    const DiametreFreeboard_m = reacteur.DiametreFreeboard;
    const VitesseReelleFour_ms =
      (DebitFumeesHumides_m3hFour - VolAirInstr20PctHautFour_Nm3h) /
      (Math.PI * 0.25 * Math.pow(DiametreFreeboard_m, 2)) /
      3600;

    const NeutralisationCentre = parametres.NeutralisationCentre !== false;
    const NbrTuyeresTotal = voute.NrTuyere;
    const NbrTuyeresNeutral = NeutralisationCentre === false ? Math.ceil(NbrTuyeresTotal * 0.1) : 0;
    const NbrTuyeres = NbrTuyeresTotal - NbrTuyeresNeutral;

    const PressionVouteDefaut_mmCe = Number(parametres.PressionVouteDefaut_mmCe) || 2000;
    const DiametreTrous_mm = Number(parametres.DiametreTrous_mm) || 5;
    const DiametreVoute_m = voute.DiametreVoute;
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
    let nb_de_trous = Math.ceil((4 * SurfaceTuyeresReelle_m2) / (Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)));
    SurfaceTuyeresReelle_m2 = (nb_de_trous * Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)) / 4;
    VitesseReelleTuyere_ms = SurfaceTuyeresReelle_m2 > 0 ? DebitReelTuyeres_m3s / SurfaceTuyeresReelle_m2 : 0;

    const PDC_Voute_Iter1_saved = PDC_Voute_Iter1;
    const PressionVoute_Iter1_mmCe = PressionVoute_mmCe;
    const DebitAirReelBoiteVentIter1_m3h = DebitAirReelBoiteVent_m3h;
    const DebitAirReelBoiteVentIter1_m3s = DebitAirReelBoiteVentIter1_m3h / 3600 / NombreFour;
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
    nb_de_trous = Math.ceil((4 * SurfaceTuyeresReelle_m2) / (Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)));
    SurfaceTuyeresReelle_m2 = (nb_de_trous * Math.PI * Math.pow(DiametreTrous_mm / 1000, 2)) / 4;
    VitesseReelleTuyere_ms = SurfaceTuyeresReelle_m2 > 0 ? DebitReelTuyeres_m3s / SurfaceTuyeresReelle_m2 : 0;
    const PressionFreeboard = PFreeBoard(PressionVouteDefaut_mmCe, PDC_Voute_Iter1);
    const DebitAirReelBoiteVentIter2_m3s = DebitAirReelBoiteVent_m3h / 3600 / NombreFour;
    const VitesseVoute2_ms = SurfaceVoute_m2 > 0 ? DebitAirReelBoiteVent_m3h / 3600 / SurfaceVoute_m2 : 0;

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
      DiametreVouteKey: parametres.DiametreVouteKey,
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
      DebitAirReelBoiteVentIter1_m3s,
      DebitReelTuyeresIter1_m3s,
      SurfaceTuyeresReelleIter1_m2,
      NbTrousIter1,
      VitesseReelleTuyereIter1_ms,
      PDC_Voute_Iter2: PDC_Voute_Iter1,
      PressionVoute_Iter2_mmCe: PressionVoute_mmCe,
      DebitAirReelBoiteVentIter2_m3h: DebitAirReelBoiteVent_m3h,
      DebitAirReelBoiteVentIter2_m3s,
      VitesseVoute2_ms,
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
    const voute = VOUTES[calculsComplets.DiametreVouteKey];
    onDataChange({
      ...calculsComplets,
      DiametreFreeboard: reacteur?.DiametreFreeboard,
      DiametreVoute: voute?.DiametreVoute,
      NrTuyereTotal: voute?.NrTuyere,
      Pression_Freeboard: calculsComplets.PressionFreeboard,
    });
  }, [calculsComplets, onDataChange, REACTEURS, VOUTES]);


















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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start' }}>
          <div>
            <label style={labelStyle}>{t('Nombre de four')}</label>
            <input
              type="number"
              min="1"
              value={parametres.NombreFour}
              onChange={(e) => handleParametreChange('NombreFour', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>{t('Modèle et diamètre du réacteur') || 'Modèle et diamètre du réacteur'}</label>
            <select
              value={parametres.Modele}
              onChange={(e) => handleParametreChange('Modele', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {Object.keys(REACTEURS).map((key) => (
                <option key={key} value={key}>
                  {key} — Ø freeboard {REACTEURS[key].DiametreFreeboard} m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('Débit Fumées Humide') || 'Débit Fumées Humide'} [Nm³/h/Four]</label>
            <input
              type="text"
              value={Math.round(parametres.DebitVolFumeesHumide_Nm3hFour)}
              readOnly
              style={readOnlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Debit air sec instrumentation') || 'Debit air sec instrumentation'} [Nm³/h]</label>
            <input
              type="text"
              value={Math.round(parametres.VolTotalAirInstrumentation_Nm3h)}
              readOnly
              style={readOnlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              {t('Température Freeboard') || 'Température Freeboard'} [°C]
            </label>
            <input
              type="text"
              value={`${parametres.TempFreeboard_C} °C`}
              readOnly
              style={readOnlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Débit Fumées Humides') || 'Débit Fumées Humides'} [m³/h/Four]</label>
            <input
              type="text"
              value={calculsComplets ? calculsComplets.DebitFumeesHumides_m3hFour.toFixed(2) : '-'}
              readOnly
              style={readOnlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Débit air instrumentation 20% haut du four [Nm³/h]')}</label>
            <input
              type="text"
              value={calculsComplets ? calculsComplets.VolAirInstr20PctHautFour_Nm3h.toFixed(2) : '-'}
              readOnly
              style={readOnlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Vitesse réelle four [m/s]')}</label>
            <input
              type="text"
              value={calculsComplets ? calculsComplets.VitesseReelleFour_ms.toFixed(3) : '-'}
              readOnly
              style={readOnlyStyle}
            />
          </div>
        </div>
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
          ⚙️ {t('Paramètres voute') || 'Paramètres voute'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t('Diamètre Voûte')}</label>
            <select
              value={parametres.DiametreVouteKey}
              onChange={(e) => handleParametreChange('DiametreVouteKey', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {Object.keys(VOUTES).map((key) => (
                <option key={key} value={key}>
                  Ø voûte {VOUTES[key].DiametreVoute} m — {VOUTES[key].NrTuyere} tuyères
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('Nombre de tuyères')}</label>
            <input
              type="text"
              value={VOUTES[parametres.DiametreVouteKey]?.NrTuyere ?? '-'}
              readOnly
              style={readOnlyStyle}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start', marginTop: '20px' }}>
          <div>
            <label style={labelStyle}>{t('Neutralisation du centre')}</label>
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
            <label style={labelStyle}>{t('Diametre des trous [mm]')}</label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={parametres.DiametreTrous_mm}
              onChange={(e) => handleParametreChange('DiametreTrous_mm', e.target.value)}
              style={inputStyle}
            />
          </div>
          {[
            { label: 'Temperature Entree Boite à Vent [°C]', key: 'TempEntreeBoiteVent_C', step: '10', readOnly: true },
            { label: 'Temperature Niveau Voute [°C]', key: 'TempNiveauVoute_C', step: '10' },
            { label: 'Pression niveau Voute par Defaut [mmCE]', key: 'PressionVouteDefaut_mmCe', step: '100' },
            { label: 'Débit Air humide Entree Boite à Vent [Nm3/h]', key: 'VolAirEntreeBoiteVent_Nm3h', step: '10', decimals: 2, readOnly: true },
            { label: 'Vitesse Reelle Tuyere [m/s]', key: 'VitesseReelleTuyere_ms', step: '1' },
          ].map(({ label, key, step, decimals, readOnly }) => (
            <div key={key}>
              <label style={labelStyle}>{t(label)}</label>
              <input
                type={readOnly ? 'text' : 'number'}
                min="0"
                step={step}
                value={decimals !== undefined ? Number(parametres[key]).toFixed(decimals) : parametres[key]}
                readOnly={readOnly}
                onChange={readOnly ? undefined : (e) => handleParametreChange(key, e.target.value)}
                style={readOnly ? readOnlyStyle : inputStyle}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start' }}>
            {[
              { label: 'PDC Voute Iter1 [mmCE]', val: calculsComplets.PDC_Voute_Iter1.toFixed(4), bg: '#fef3c7' },
              {
                label: 'Pression Voute Iter1 [mmCE]',
                val: calculsComplets.PressionVoute_Iter1_mmCe.toFixed(2),
                bg: '#fef3c7',
              },
              {
                label: 'Debit air reel boite à vent Iter1 [m3/h]',
                val: calculsComplets.DebitAirReelBoiteVentIter1_m3h.toFixed(2),
                bg: '#fef3c7',
              },
              {
                label: 'Debit air reel boite à vent Iter1 [m3/s]',
                val: calculsComplets.DebitAirReelBoiteVentIter1_m3s.toFixed(4),
                bg: '#fef3c7',
              },
              {
                label: 'Debit reel tuyeres Iter 1 [m3/s]',
                val: calculsComplets.DebitReelTuyeresIter1_m3s.toFixed(4),
                bg: '#dcfce7',
              },
              { label: 'Nombre de trous iter 1', val: calculsComplets.NbTrousIter1, bg: '#dcfce7' },
              {
                label: 'Surface Tuyeres Reelle Iter1 [m2]',
                val: calculsComplets.SurfaceTuyeresReelleIter1_m2.toFixed(6),
                bg: '#dcfce7',
              },
              {
                label: 'Vitesse reelle tuyere Iter1 [m/s]',
                val: calculsComplets.VitesseReelleTuyereIter1_ms.toFixed(2),
                bg: '#e0e7ff',
              },
            ].map(({ label, val, bg }) => (
              <div key={label}>
                <label style={labelStyle}>{t(label)}</label>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start' }}>
            {[
              { label: 'PDC Voute Iter2 [mmCE]', val: calculsComplets.PDC_Voute_Iter2.toFixed(4), bg: '#fed7aa' },
              {
                label: 'Pression Voute Iter2 [mmCE]',
                val: calculsComplets.PressionVoute_Iter2_mmCe.toFixed(2),
                bg: '#fed7aa',
              },
              {
                label: 'Debit air reel boite à vent Iter2 [m3/h]',
                val: calculsComplets.DebitAirReelBoiteVentIter2_m3h.toFixed(2),
                bg: '#fed7aa',
              },
              {
                label: 'Debit air reel boite à vent Iter2 [m3/s]',
                val: calculsComplets.DebitAirReelBoiteVentIter2_m3s.toFixed(4),
                bg: '#fed7aa',
              },
              {
                label: 'Debit reel tuyeres Iter 2 [m3/s]',
                val: calculsComplets.DebitReelTuyeresIter2_m3s.toFixed(4),
                bg: '#bbf7d0',
              },
              { label: 'Nombre de trous iter 2', val: calculsComplets.NbTrousIter2, bg: '#bbf7d0' },
              {
                label: 'Surface Tuyeres Reelle Iter2 [m2]',
                val: calculsComplets.SurfaceTuyeresReelleIter2_m2.toFixed(6),
                bg: '#bbf7d0',
              },
              {
                label: 'Surface voute [m2]',
                val: calculsComplets.SurfaceVoute_m2.toFixed(4),
                bg: '#bbf7d0',
              },
              {
                label: 'Vitesse voute 2 [m/s]',
                val: calculsComplets.VitesseVoute2_ms.toFixed(4),
                bg: '#ddd6fe',
              },
              {
                label: 'Vitesse reelle tuyere Iter2 [m/s]',
                val: calculsComplets.VitesseReelleTuyereIter2_ms.toFixed(2),
                bg: '#ddd6fe',
              },
            ].map(({ label, val, bg }) => (
              <div key={label}>
                <label style={labelStyle}>{t(label)}</label>
                <input type="text" value={val} readOnly style={{ ...readOnlyStyle, backgroundColor: bg }} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>{t('Pression finale freeboard [mmCE]')}</label>
              <input
                type="text"
                value={calculsComplets.PressionFreeboard.toFixed(2)}
                readOnly
                style={{ ...readOnlyStyle, backgroundColor: '#ddd6fe' }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '13px', color: '#1e40af' }}>
              {[
                { label: 'Modèle', val: parametres.Modele },
                { label: 'NbrTuyeres Actives', val: calculsComplets.NbrTuyeres },
                { label: 'NbTrous/Tuyère', val: calculsComplets.NbTrousIter2 },
                { label: 'VitesseReelleTuyere [m/s]', val: calculsComplets.VitesseReelleTuyereIter2_ms.toFixed(1) },
                { label: 'Pression finale freeboard [mmCE]', val: calculsComplets.PressionFreeboard.toFixed(2) },
                (() => {
                  const v = calculsComplets.VitesseVoute2_ms;
                  const alerte = v > 0 && (v < 0.8 || v > 1.1) ? t('Hors plage [0.8 – 1.1 m/s]') : null;
                  return { label: 'Vitesse voute 2 [m/s]', val: v.toFixed(4), alerte };
                })(),
                {
                  label: 'Charge MS théorique du radier [kg MS/h/m²]',
                  val: calculsComplets.SurfaceVoute_m2 > 0 ? ((innerData?.MS_kg_h ?? 0) / calculsComplets.NombreFour / calculsComplets.SurfaceVoute_m2).toFixed(2) : '-',
                },
                {
                  label: 'Charge MV théorique [kg MV/h/m²]',
                  val: calculsComplets.SurfaceVoute_m2 > 0 ? ((innerData?.MV_kg_h ?? 0) / calculsComplets.NombreFour / calculsComplets.SurfaceVoute_m2).toFixed(2) : '-',
                },
                (() => {
                  const chargeEau = calculsComplets.SurfaceVoute_m2 > 0
                    ? (innerData?.EauExtraite_kg_h ?? 0) / calculsComplets.NombreFour / calculsComplets.SurfaceVoute_m2
                    : null;
                  const alerte = chargeEau !== null && chargeEau > 540 ? t('Charge eau > 540 kg/h/m²') : null;
                  return { label: 'Charge eau théorique [kg eau/h/m²]', val: chargeEau !== null ? chargeEau.toFixed(2) : '-', alerte };
                })(),
                {
                  label: 'Capacité thermique du four [kW]',
                  val: (() => {
                    const H_in = innerData?.H_in_kW ?? 0;
                    const H_pertes = innerData?.H_pertes_kW ?? 0;
                    const H_imbrule = innerData?.H_imbrule_kW ?? 0;
                    const H_air_instr = innerData?.H_air_balayage_kW ?? 0;
                    return (H_in - H_pertes - H_imbrule - H_air_instr).toFixed(1);
                  })(),
                },
                {
                  label: 'Densité thermique du four [kW/m²]',
                  val: (() => {
                    const H_in = innerData?.H_in_kW ?? 0;
                    const H_pertes = innerData?.H_pertes_kW ?? 0;
                    const H_imbrule = innerData?.H_imbrule_kW ?? 0;
                    const H_air_instr = innerData?.H_air_balayage_kW ?? 0;
                    const capacite = H_in - H_pertes - H_imbrule - H_air_instr;
                    const surface = calculsComplets.SurfaceVoute_m2;
                    return surface > 0 ? (capacite / surface).toFixed(1) : '-';
                  })(),
                },
              ].map(({ label, val, alerte }) => (
                <div key={label} style={{ background: alerte ? 'rgba(254,226,226,0.9)' : 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '6px', border: alerte ? '1px solid #f87171' : 'none' }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px' }}>{t(label)}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: alerte ? '#dc2626' : 'inherit' }}>{val}</div>
                  {alerte && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: '600' }}>⚠ {alerte}</div>}
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