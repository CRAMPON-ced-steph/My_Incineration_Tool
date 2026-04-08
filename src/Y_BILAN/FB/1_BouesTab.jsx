import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

// ✅ Hook personnalisé pour traductions dynamiques
const useTranslation = (currentLanguage = 'fr') => {
  return useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);

    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);
};


import {
  PCI_kJ_kgMV,
  PCI_kcal_kgMV,
  PCI_kcal_kg,
  PCS_kcal_kgMV,
  PCS_kcal_kg,
  PCI_Dulong,
} from '../../A_Transverse_fonction/bilan_fct_FB';

import { molarMasses } from '../../A_Transverse_fonction/constantes';

// ============================================================
// CONSTANTES
// ============================================================

const DEFAULT_CHONS_VALUES = {
  PRIMAIRE: { C: 49.7, H: 6.8, O: 34.3, N: 7.0, S: 1.5, Cl: 0.7 },
  MIXTE: { C: 54.4, H: 6.8, O: 28.6, N: 8.6, S: 1.7, Cl: 0.0 },
  BIOLOGIQUE: { C: 54.2, H: 8.0, O: 29.3, N: 7.2, S: 1.3, Cl: 0.0 },
  DIGEREE: { C: 52.7, H: 7.6, O: 30.7, N: 5.8, S: 2.2, Cl: 1.0 },
  GRAISSE: { C: 75.0, H: 10.4, O: 12.5, N: 0.5, S: 1.5, Cl: 0.0 },
  REFUS_DEGRILLAGE: { C: 56.0, H: 8.0, O: 32.0, N: 3.5, S: 0.5, Cl: 0.0 },
};

const PRECISION_CHONS_VALUES = {
  PRIMAIRE: { C: 3, H: 0.5, O: 4.5, N: 1.6, S: 1, Cl: 0.7 },
  MIXTE: { C: 3.7, H: 0.6, O: 4, N: 1.6, S: 0.5, Cl: 0 },
  BIOLOGIQUE: { C: 3.7, H: 0.6, O: 4, N: 1.6, S: 0.5, Cl: 0 },
  DIGEREE: { C: 2.3, H: 1.4, O: 3.7, N: 1.1, S: 1.6, Cl: 0.5 },
  GRAISSE: { C: 0, H: 0, O: 0, N: 0, S: 0, Cl: 0 },
  REFUS_DEGRILLAGE: { C: 0, H: 0, O: 0, N: 0, S: 0, Cl: 0 },
};

const DEFAULT_HEAVY_METALS = {
  al: 6000,
  as: 20,
  cd: 10,
  cr: 80,
  cu: 400,
  fe: 6000,
  hg: 5,
  ni: 50,
  pb: 100,
  zn: 2000,
  pcddf: 0.0001,
  ti: 1000,
  hf: 500,
};

// ============================================================
// HELPERS LOCALSTORAGE
// ============================================================

const lsGet = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const lsSet = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    console.warn(`Failed to save to localStorage: ${key}`);
  }
};

// ============================================================
// VALEURS PAR DÉFAUT
// ============================================================

const defaultFonctionnement = () => ({
  daysPerWeek: 7,
  hoursPerDay: 24,
  summaryTotal: 168,
});

const defaultBoue = () => {
  const MS_pourcent = 25;
  const MV_pourcent = 70;
  const MS_kg_h = 2000;
  const BoueBrute = MS_kg_h / (MS_pourcent / 100);
  const MV_kg_h = MS_kg_h * (MV_pourcent / 100);
  return {
    sludgeType: 'PRIMAIRE',
    MS_pourcent,
    MV_pourcent,
    MS_kg_h,
    BoueBrute_kg_h: +BoueBrute.toFixed(1),
    MV_kg_h: +MV_kg_h.toFixed(1),
    EauExtraite_kg_h: +(BoueBrute - MS_kg_h).toFixed(1),
    MM_kg_h: +(MS_kg_h - MV_kg_h).toFixed(1),
  };
};

const defaultChons = () => ({
  C: 49.7,
  H: 6.8,
  O: 34.3,
  N: 7.0,
  S: 1.5,
  Cl: 0.7,
  impC: 5,
  impH: 5,
  impO: 10,
  impN: 8,
  impS: 15,
  impCl: 0,
  kgC: 0,
  kgH: 0,
  kgO: 0,
  kgN: 0,
  kgS: 0,
  kgCl: 0,
  sumPercent: 100.0,
});

// ============================================================
// COMPOSANT
// ============================================================

const BouesTab = ({ innerData, currentLanguage  }) => {
  // ✅ Utiliser le hook pour traductions dynamiques
  const t = useTranslation(currentLanguage);

  // ============================================================
  // STATE
  // ============================================================

  const [fonctionnement, setFonctionnement] = useState(() =>
    lsGet('bouesTab_fonctionnement', defaultFonctionnement())
  );
  const [boue, setBoue] = useState(() => lsGet('bouesTab_boue', defaultBoue()));
  const [chons, setChons] = useState(() => lsGet('bouesTab_chons', defaultChons()));
  const [heavyMetals, setHeavyMetals] = useState(() => {
    const stored = lsGet('bouesTab_heavyMetals', {});
    return { ...DEFAULT_HEAVY_METALS, ...stored };
  });

  // ============================================================
  // PERSISTANCE - LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    lsSet('bouesTab_fonctionnement', fonctionnement);
  }, [fonctionnement]);

  useEffect(() => {
    lsSet('bouesTab_boue', boue);
  }, [boue]);

  useEffect(() => {
    lsSet('bouesTab_chons', chons);
  }, [chons]);

  useEffect(() => {
    lsSet('bouesTab_heavyMetals', heavyMetals);
  }, [heavyMetals]);

  // ============================================================
  // CALCUL RÉSUMÉ FONCTIONNEMENT
  // ============================================================

  useEffect(() => {
    setFonctionnement((prev) => ({
      ...prev,
      summaryTotal: Number(prev.daysPerWeek) * Number(prev.hoursPerDay),
    }));
  }, [fonctionnement.daysPerWeek, fonctionnement.hoursPerDay]);

  // ============================================================
  // CALCUL BOUE
  // ============================================================

  useEffect(() => {
    const MS_pourcent = Number(boue.MS_pourcent) || 0;
    const MV_pourcent = Number(boue.MV_pourcent) || 0;
    const MS_kg_h = Number(boue.MS_kg_h) || 0;

    const BoueBrute = MS_pourcent > 0 ? MS_kg_h / (MS_pourcent / 100) : 0;
    const MV_kg_h = MS_kg_h * (MV_pourcent / 100);
    const EauExtraite = BoueBrute - MS_kg_h;
    const MM_kg_h = MS_kg_h - MV_kg_h;

    setBoue((prev) => ({
      ...prev,
      BoueBrute_kg_h: +BoueBrute.toFixed(1),
      MV_kg_h: +MV_kg_h.toFixed(1),
      EauExtraite_kg_h: +EauExtraite.toFixed(1),
      MM_kg_h: +MM_kg_h.toFixed(1),
    }));
  }, [boue.MS_pourcent, boue.MV_pourcent, boue.MS_kg_h]);

  // ============================================================
  // CALCUL CHONS (kg/h par élément)
  // ============================================================

  useEffect(() => {
    const MV = Number(boue.MV_kg_h) || 0;
    const elements = ['C', 'H', 'O', 'N', 'S', 'Cl'];

    setChons((prev) => {
      const next = { ...prev };
      let sum = 0;
      elements.forEach((el) => {
        const pct = Number(prev[el]) || 0;
        next[`kg${el}`] = MV * (pct / 100);
        sum += pct;
      });
      next.sumPercent = +sum.toFixed(2);
      return next;
    });
  }, [chons.C, chons.H, chons.O, chons.N, chons.S, chons.Cl, boue.MV_kg_h]);

  // ============================================================
  // MISE À JOUR innerData
  // ============================================================

  useEffect(() => {
    // Fonctionnement
    innerData.daysPerWeek = Number(fonctionnement.daysPerWeek);
    innerData.hoursPerDay = Number(fonctionnement.hoursPerDay);
    innerData.totalHoursPerWeek = fonctionnement.summaryTotal;

    // Boue
    innerData.sludgeType = boue.sludgeType;
    innerData.MS_pourcent = Number(boue.MS_pourcent);
    innerData.MV_pourcent = Number(boue.MV_pourcent);
    innerData.MS_kg_h = Number(boue.MS_kg_h);
    innerData.BoueBrute_kg_h = Number(boue.BoueBrute_kg_h);
    innerData.MV_kg_h = Number(boue.MV_kg_h);
    innerData.EauExtraite_kg_h = Number(boue.EauExtraite_kg_h);
    innerData.MM_kg_h = Number(boue.MM_kg_h);
    innerData.MasseBoueBrute = Number(boue.BoueBrute_kg_h);

    // Alias legacy
    innerData.siccite = Number(boue.MS_pourcent);
    innerData.volatileMatterPercent = Number(boue.MV_pourcent);

    // CHONS
    innerData.C_percent = Number(chons.C);
    innerData.H_percent = Number(chons.H);
    innerData.O_percent = Number(chons.O);
    innerData.N_percent = Number(chons.N);
    innerData.S_percent = Number(chons.S);
    innerData.Cl_percent = Number(chons.Cl);

    // PCI / PCS
    const pci_kJ_kgMV = PCI_kJ_kgMV(boue.sludgeType);
    const pci_kcal_kgMV = PCI_kcal_kgMV(boue.sludgeType);
    const pci_kcal_kg = PCI_kcal_kg(Number(boue.MS_pourcent), Number(boue.MV_pourcent), pci_kcal_kgMV);
    const pcs_kcal_kgMV = PCS_kcal_kgMV(pci_kcal_kgMV, Number(chons.H));
    const pcs_kcal_kg = PCS_kcal_kg(pci_kcal_kg, Number(boue.MS_pourcent), Number(boue.MV_pourcent), Number(chons.H));
    const pci_dulong = PCI_Dulong(Number(chons.C), Number(chons.H), Number(chons.O), Number(chons.S));

    innerData.pciKJkgMV = pci_kJ_kgMV;
    innerData.PCIKCALKGMV = pci_kcal_kgMV;
    innerData.pciKcalkg = pci_kcal_kg;
    innerData.pcsKcalkgMV = pcs_kcal_kgMV;
    innerData.pcsKcalkg = pcs_kcal_kg;
    innerData.pciDulong = pci_dulong;

    // Métaux lourds - Export individuel
    Object.keys(heavyMetals).forEach((metal) => {
      innerData[`metal_${metal}`] = Number(heavyMetals[metal]);
    });

    // Export structuré des métaux lourds
    innerData.heavyMetalsData = {
      al: Number(heavyMetals.al),
      as: Number(heavyMetals.as),
      cd: Number(heavyMetals.cd),
      cr: Number(heavyMetals.cr),
      cu: Number(heavyMetals.cu),
      fe: Number(heavyMetals.fe),
      hg: Number(heavyMetals.hg),
      ni: Number(heavyMetals.ni),
      pb: Number(heavyMetals.pb),
      zn: Number(heavyMetals.zn),
      pcddf: Number(heavyMetals.pcddf),
      ti: Number(heavyMetals.ti),
      hf: Number(heavyMetals.hf),
    };

    // Calculs des masses métalliques [kg/h]
    const MS_kg_h = Number(boue.MS_kg_h);

    const Al_kg_h = (Number(heavyMetals.al) * MS_kg_h) / 1e6;
    const As_kg_h = (Number(heavyMetals.as) * MS_kg_h) / 1e6;
    const Cd_kg_h = (Number(heavyMetals.cd) * MS_kg_h) / 1e6;
    const Cr_kg_h = (Number(heavyMetals.cr) * MS_kg_h) / 1e6;
    const Cu_kg_h = (Number(heavyMetals.cu) * MS_kg_h) / 1e6;
    const Fe_kg_h = (Number(heavyMetals.fe) * MS_kg_h) / 1e6;
    const Hg_kg_h = (Number(heavyMetals.hg) * MS_kg_h) / 1e6;
    const Ni_kg_h = (Number(heavyMetals.ni) * MS_kg_h) / 1e6;
    const Pb_kg_h = (Number(heavyMetals.pb) * MS_kg_h) / 1e6;
    const Zn_kg_h = (Number(heavyMetals.zn) * MS_kg_h) / 1e6;
    const PCDDF_kg_h = (Number(heavyMetals.pcddf) * MS_kg_h) / 1e6;
    const Ti_kg_h = (Number(heavyMetals.ti) * MS_kg_h) / 1e6;
    const HF_kg_h = (Number(heavyMetals.hf ?? 500) * MS_kg_h) / 1e6;

    const masse_pollutant_metallique_kg_h = {
      Al_kg_h,
      As_kg_h,
      Cd_kg_h,
      Cr_kg_h,
      Cu_kg_h,
      Fe_kg_h,
      Hg_kg_h,
      Ni_kg_h,
      Pb_kg_h,
      Zn_kg_h,
      PCDDF_kg_h,
      Ti_kg_h,
      HF_kg_h,
    };

    innerData.masse_pollutant_metallique_kg_h = masse_pollutant_metallique_kg_h;
    innerData.Al_kg_h = Al_kg_h;
    innerData.As_kg_h = As_kg_h;
    innerData.Cd_kg_h = Cd_kg_h;
    innerData.Cr_kg_h = Cr_kg_h;
    innerData.Cu_kg_h = Cu_kg_h;
    innerData.Fe_kg_h = Fe_kg_h;
    innerData.Hg_kg_h = Hg_kg_h;
    innerData.Ni_kg_h = Ni_kg_h;
    innerData.Pb_kg_h = Pb_kg_h;
    innerData.Zn_kg_h = Zn_kg_h;
    innerData.PCDDF_kg_h = PCDDF_kg_h;
    innerData.Ti_kg_h = Ti_kg_h;
    innerData.HF_kg_h = HF_kg_h;
  }, [fonctionnement, boue, chons, heavyMetals, innerData]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSludgeTypeChange = useCallback((type) => {
    setBoue((prev) => ({ ...prev, sludgeType: type }));
    if (DEFAULT_CHONS_VALUES[type]) {
      const v = DEFAULT_CHONS_VALUES[type];
      const p = PRECISION_CHONS_VALUES[type] || {};
      setChons((prev) => ({
        ...prev,
        C: v.C,
        H: v.H,
        O: v.O,
        N: v.N,
        S: v.S,
        Cl: v.Cl,
        impC: p.C ?? 5,
        impH: p.H ?? 5,
        impO: p.O ?? 10,
        impN: p.N ?? 8,
        impS: p.S ?? 15,
        impCl: p.Cl ?? 0,
      }));
    }
  }, []);

  const resetToDefault = useCallback(() => {
    const keys = ['bouesTab_fonctionnement', 'bouesTab_boue', 'bouesTab_chons', 'bouesTab_heavyMetals'];
    keys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(`Failed to remove localStorage key: ${k}`, e);
      }
    });
    setFonctionnement(defaultFonctionnement());
    setBoue(defaultBoue());
    setChons(defaultChons());
    setHeavyMetals(DEFAULT_HEAVY_METALS);
  }, []);

  // ============================================================
  // STYLES
  // ============================================================

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

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={resetToDefault}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {t('Réinitialiser aux valeurs par défaut') || 'Réinitialiser aux valeurs par défaut'}
      </button>

      {/* FONCTIONNEMENT */}
      <div style={cardStyle}>
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          {t('Fonctionnement') || 'Fonctionnement'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t('Nombre de jours par semaine') || 'Nombre de jours par semaine'}</label>
            <input
              type="number"
              min="0"
              max="7"
              value={fonctionnement.daysPerWeek}
              onChange={(e) =>
                setFonctionnement((p) => ({ ...p, daysPerWeek: Number(e.target.value) || 0 }))
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Nombre d\'heures par jour') || 'Nombre d\'heures par jour'}</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={fonctionnement.hoursPerDay}
              onChange={(e) =>
                setFonctionnement((p) => ({ ...p, hoursPerDay: Number(e.target.value) || 0 }))
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
          }}
        >
          <h3 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '10px' }}>
            {t('Résumé Fonctionnement') || 'Résumé Fonctionnement'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: t('Jours/semaine') || 'Jours/semaine', val: fonctionnement.daysPerWeek, color: '#3b82f6' },
              { label: t('Heures/jour') || 'Heures/jour', val: fonctionnement.hoursPerDay, color: '#3b82f6' },
              { label: t('Total h/sem') || 'Total h/sem', val: fonctionnement.summaryTotal, color: '#10b981' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARACTÉRISTIQUES BOUES */}
      <div style={cardStyle}>
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          {t('Caractéristiques des Boues') || 'Caractéristiques des Boues'}
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>{t('Type de boue') || 'Type de boue'}</label>
          <select
            value={boue.sludgeType}
            onChange={(e) => handleSludgeTypeChange(e.target.value)}
            style={inputStyle}
          >
            <option value="">{t('Sélectionnez un type de boue') || 'Sélectionnez un type de boue'}</option>
            {Object.keys(DEFAULT_CHONS_VALUES).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>{t('Siccité') || 'Siccité'} [%]</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={boue.MS_pourcent}
              onChange={(e) => setBoue((p) => ({ ...p, MS_pourcent: Number(e.target.value) || 0 }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Matières volatiles') || 'Matières volatiles'} [%]</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={boue.MV_pourcent}
              onChange={(e) => setBoue((p) => ({ ...p, MV_pourcent: Number(e.target.value) || 0 }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Quantité de boues') || 'Quantité de boues'} [kg MS/h]</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={boue.MS_kg_h}
              onChange={(e) => setBoue((p) => ({ ...p, MS_kg_h: Number(e.target.value) || 0 }))}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          {[
            { label: t('Matière brute') || 'Matière brute', unit: '[kg/h]', val: boue.BoueBrute_kg_h },
            { label: t('Matière volatile') || 'Matière volatile', unit: '[kg/h]', val: boue.MV_kg_h },
            { label: t('Matière minérale') || 'Matière minérale', unit: '[kg/h]', val: boue.MM_kg_h },
            { label: t('Eau extraite') || 'Eau extraite', unit: '[kg/h]', val: boue.EauExtraite_kg_h },
          ].map(({ label, unit, val }) => (
            <div key={label}>
              <label style={labelStyle}>
                {label} {unit}
              </label>
              <input type="text" value={Number(val).toFixed(1)} readOnly style={readOnlyStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* COMPOSITION CHONS */}
      <div style={cardStyle}>
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          {t('Composition CHONS') || 'Composition CHONS'} [% sur MV]
          <span
            style={{
              marginLeft: '15px',
              fontSize: '14px',
              fontWeight: 'normal',
              color: Math.abs(chons.sumPercent - 100) < 0.5 ? '#10b981' : '#ef4444',
            }}
          >
            Σ = {chons.sumPercent?.toFixed(1)}%
          </span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {['C', 'H', 'O', 'N', 'S', 'Cl'].map((el) => (
            <div key={el}>
              <label style={labelStyle}>
                {el} [%]
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={chons[el]}
                onChange={(e) => setChons((p) => ({ ...p, [el]: Number(e.target.value) || 0 }))}
                style={inputStyle}
              />
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                {Number(chons[`kg${el}`] || 0).toFixed(1)} kg/h
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MÉTAUX LOURDS */}
      <div style={cardStyle}>
        <h2 style={{ color: '#1a202c', fontSize: '20px', marginBottom: '20px' }}>
          {t('Teneur en Métaux Lourds') || 'Teneur en Métaux Lourds'} [mg/kg MS] et Masses [kg/h]
        </h2>

        {/* CONCENTRATIONS [mg/kg MS] */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '15px' }}>
            📥 {t('Concentrations') || 'Concentrations'} [mg/kg MS]
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {[
              { label: 'Al (Aluminium)', id: 'al', def: 6000 },
              { label: 'As (Arsenic)', id: 'as', def: 20 },
              { label: 'Cd (Cadmium)', id: 'cd', def: 10 },
              { label: 'Cr (Chrome)', id: 'cr', def: 80 },
              { label: 'Cu (Cuivre)', id: 'cu', def: 400 },
              { label: 'Fe (Fer)', id: 'fe', def: 6000 },
              { label: 'Hg (Mercure)', id: 'hg', def: 5 },
              { label: 'Ni (Nickel)', id: 'ni', def: 50 },
              { label: 'Pb (Plomb)', id: 'pb', def: 100 },
              { label: 'Zn (Zinc)', id: 'zn', def: 2000 },
              { label: 'PCDDF', id: 'pcddf', def: 0.0001, note: '10⁻⁴ mg/kg MS' },
              { label: 'Ti (Titane)', id: 'ti', def: 1000, note: '1000 à 10000 mg/kg MS' },
              { label: 'HF (Acide fluorhydrique)', id: 'hf', def: 500, note: '500 mg/kg MS' },
            ].map(({ label, id, def, note }) => (
              <div key={id}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number"
                  min="0"
                  step={id === 'pcddf' ? '0.00001' : '0.1'}
                  value={heavyMetals[id] ?? def}
                  onChange={(e) =>
                    setHeavyMetals((p) => ({ ...p, [id]: Number(e.target.value) || 0 }))
                  }
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  {note ? `${note}` : `Défaut: ${def} mg/kg MS`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MASSES [kg/h] */}
        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '15px', fontWeight: '700' }}>
            📤 {t('Masses calculées') || 'Masses calculées'} [kg/h]
          </h3>
          <p style={{ color: '#1e40af', fontSize: '12px', fontWeight: '600', marginBottom: '15px' }}>
            💡 {t('Formule') || 'Formule'}: Masse [kg/h] = (Concentration [mg/kg MS] × MS [kg/h]) / 1,000,000
          </p>

          {(() => {
            const MS_kg_h = Number(boue.MS_kg_h) || 0;

            const Al_kg_h = (Number(heavyMetals.al) * MS_kg_h) / 1e6;
            const As_kg_h = (Number(heavyMetals.as) * MS_kg_h) / 1e6;
            const Cd_kg_h = (Number(heavyMetals.cd) * MS_kg_h) / 1e6;
            const Cr_kg_h = (Number(heavyMetals.cr) * MS_kg_h) / 1e6;
            const Cu_kg_h = (Number(heavyMetals.cu) * MS_kg_h) / 1e6;
            const Fe_kg_h = (Number(heavyMetals.fe) * MS_kg_h) / 1e6;
            const Hg_kg_h = (Number(heavyMetals.hg) * MS_kg_h) / 1e6;
            const Ni_kg_h = (Number(heavyMetals.ni) * MS_kg_h) / 1e6;
            const Pb_kg_h = (Number(heavyMetals.pb) * MS_kg_h) / 1e6;
            const Zn_kg_h = (Number(heavyMetals.zn) * MS_kg_h) / 1e6;
            const PCDDF_kg_h = (Number(heavyMetals.pcddf) * MS_kg_h) / 1e6;
            const Ti_kg_h = (Number(heavyMetals.ti) * MS_kg_h) / 1e6;
            const HF_kg_h = (Number(heavyMetals.hf ?? 500) * MS_kg_h) / 1e6;

            const masses = [
              { label: 'Al (Aluminium)', value: Al_kg_h, color: '#8b5cf6' },
              { label: 'As (Arsenic)', value: As_kg_h, color: '#f59e0b' },
              { label: 'Cd (Cadmium)', value: Cd_kg_h, color: '#ef4444' },
              { label: 'Cr (Chrome)', value: Cr_kg_h, color: '#10b981' },
              { label: 'Cu (Cuivre)', value: Cu_kg_h, color: '#f97316' },
              { label: 'Fe (Fer)', value: Fe_kg_h, color: '#6b7280' },
              { label: 'Hg (Mercure)', value: Hg_kg_h, color: '#ec4899' },
              { label: 'Ni (Nickel)', value: Ni_kg_h, color: '#06b6d4' },
              { label: 'Pb (Plomb)', value: Pb_kg_h, color: '#64748b' },
              { label: 'Zn (Zinc)', value: Zn_kg_h, color: '#3b82f6' },
              { label: 'PCDDF', value: PCDDF_kg_h, color: '#a855f7' },
              { label: 'Ti (Titane)', value: Ti_kg_h, color: '#14b8a6' },
              { label: 'HF (Acide fluorhydrique)', value: HF_kg_h, color: '#dc2626' },
            ];

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {masses.map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      padding: '12px',
                      background: 'white',
                      border: `2px solid ${color}`,
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: color,
                        marginBottom: '6px',
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1a202c',
                        marginBottom: '4px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {value.toFixed(3)}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6b7280',
                      }}
                    >
                      kg/h
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div
            style={{
              marginTop: '15px',
              padding: '12px',
              background: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
            }}
          >
            <p style={{ color: '#1e40af', fontSize: '12px', margin: 0 }}>
              <strong>📌 {t('Note') || 'Note'} :</strong> {t('Les masses sont calculées automatiquement en fonction de la quantité de MS [kg/h].') || 'Les masses sont calculées automatiquement en fonction de la quantité de MS [kg/h].'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BouesTab;