import React, { useState, useMemo, useEffect } from 'react';
import { fmt } from '../../A_Transverse_fonction/formatNumber';

// ── Constants ──────────────────────────────────────────────────────────────
const MU_REF = 1.716e-5;   // Pa·s  air at 273.15 K
const T_REF_S = 273.15;    // K  Sutherland reference
const C_S = 110.4;         // K  Sutherland constant air
const R = 8.314;           // J/(mol·K)
const G = 9.81;            // m/s²
const P_1MM_EAU = 9.80665; // Pa per mm water column

const DEFAULT_PARAMS = {
  T_lit_C: 676.7,
  P_Pa: 101325,
  d_um: 500,
  rho_p: 3300,
  phi: 0.8,
  eps_mf: 0.45,
  D_lit_m: 0.1614,
  H_tasse_m: 0.4572,
  H_dilate_m: 0.762,
  U_propose_ms: 0.6096,
  U_pyro_bas_ms: 0.9,
  U_pyro_haut_ms: 1.1,
  T_garde_C: 843.3,
  D_garde_m: 0.2116,
  t_sejour_s: 7,
  Q_froid_m3s: 0.004484,
  T_ref_froid_C: 20,
  M_gaz: 0.02897,
  P_voute_mbar: -1,
  P_calcul_mmCE: 2000,
};

// ── Physics functions ──────────────────────────────────────────────────────

function gasProp(T_K, P_Pa, M) {
  const rho_g = (P_Pa * M) / (R * T_K);
  const mu = MU_REF * Math.pow(T_K / T_REF_S, 1.5) * (T_REF_S + C_S) / (T_K + C_S);
  return { rho_g, mu };
}

function archimedes(rho_g, rho_p, d_m, mu) {
  return (rho_g * (rho_p - rho_g) * G * Math.pow(d_m, 3)) / (mu * mu);
}

function wenYu(Ar, rho_g, d_m, mu) {
  const Re_mf = Math.sqrt(33.7 * 33.7 + 0.0408 * Ar) - 33.7;
  const Umf = (Re_mf * mu) / (rho_g * d_m);
  return { Re_mf, Umf };
}

function haiderLevenspiel(Ar, phi, rho_g, rho_p, mu) {
  const d_star = Math.pow(Ar, 1 / 3);
  const Ut_star = 1 / (18 / (d_star * d_star) + (2.335 - 1.744 * phi) / Math.pow(d_star, 0.5));
  const Ut = Ut_star * Math.pow((mu * (rho_p - rho_g) * G) / (rho_g * rho_g), 1 / 3);
  return { d_star, Ut_star, Ut };
}

// ── Component ──────────────────────────────────────────────────────────────

const FluidisationTab = ({ nodeId, currentLanguage = 'fr' }) => {
  void currentLanguage;

  const storageKey = `fluidisation_params_FB_${nodeId}`;

  const [p, setP] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...DEFAULT_PARAMS, ...JSON.parse(saved) };
    } catch (_) { /* ignore */ }
    return { ...DEFAULT_PARAMS };
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(p)); } catch (_) { /* ignore */ }
  }, [p, storageKey]);

  const set = (key) => (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setP((prev) => ({ ...prev, [key]: val }));
    else setP((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // ── Main calculations ──────────────────────────────────────────────────

  const calc = useMemo(() => {
    const T_K = Number(p.T_lit_C) + 273.15;
    const { rho_g, mu } = gasProp(T_K, Number(p.P_Pa), Number(p.M_gaz));
    const d_m = Number(p.d_um) / 1e6;
    const Ar = archimedes(rho_g, Number(p.rho_p), d_m, mu);
    const { Re_mf, Umf } = wenYu(Ar, rho_g, d_m, mu);
    const { d_star, Ut_star, Ut } = haiderLevenspiel(Ar, Number(p.phi), rho_g, Number(p.rho_p), mu);

    const U = Number(p.U_propose_ms);
    const U_bas = Number(p.U_pyro_bas_ms);
    const U_haut = Number(p.U_pyro_haut_ms);

    // Pressure drop & slugging
    const H_t = Number(p.H_tasse_m);
    const H_d = Number(p.H_dilate_m);
    const D = Number(p.D_lit_m);
    const eps_mf = Number(p.eps_mf);
    const rho_p = Number(p.rho_p);
    const dP_lit = (1 - eps_mf) * (rho_p - rho_g) * G * H_t;
    const dP_plaque_10 = 0.10 * dP_lit;
    const dP_plaque_30 = 0.30 * dP_lit;
    const H_D = D > 0 ? H_t / D : 0;
    const H_ms = 1.9 * Math.pow(D, 0.3);
    const ratio_dilate = H_ms > 0 ? H_d / H_ms : 0;

    // Service & design pressures
    const P_voute_Pa = Number(p.P_voute_mbar) * 100;
    const P_service_10 = P_voute_Pa + dP_lit + dP_plaque_10;
    const P_service_30 = P_voute_Pa + dP_lit + dP_plaque_30;
    const P_calcul_Pa = Number(p.P_calcul_mmCE) * P_1MM_EAU;
    const P_calcul_kPa = P_calcul_Pa / 1000;
    const P_calcul_mbar = P_calcul_Pa / 100;
    const P_calcul_barg = P_calcul_Pa / 1e5;
    const marge = P_service_30 > 0 ? P_calcul_Pa / P_service_30 : 0;
    const rapport_05barg = P_calcul_barg / 0.5;

    // Gas flow rates at bed
    const S_lit = (Math.PI * D * D) / 4;
    const T_ref_K = Number(p.T_ref_froid_C) + 273.15;
    const Q_chaud = U * S_lit;
    const Q_ref = Q_chaud * T_ref_K / T_K;
    const Q_normal_Nm3h = Q_chaud * (273.15 / T_K) * 3600;
    const U_l19_chaud = S_lit > 0 ? Number(p.Q_froid_m3s) / S_lit : 0;
    const U_l19_froid = S_lit > 0 ? Number(p.Q_froid_m3s) * T_K / T_ref_K / S_lit : 0;
    const S_garde = (Math.PI * Number(p.D_garde_m) * Number(p.D_garde_m)) / 4;
    const T_garde_K = Number(p.T_garde_C) + 273.15;

    // Sensitivity — granulometry
    const DIAMETERS = [200, 300, 400, 500, 600, 700, 800];
    const granuloTable = DIAMETERS.map((d_um_i) => {
      const d_i = d_um_i / 1e6;
      const Ar_i = archimedes(rho_g, rho_p, d_i, mu);
      const { Re_mf: Re_i, Umf: Umf_i } = wenYu(Ar_i, rho_g, d_i, mu);
      const { Ut: Ut_i } = haiderLevenspiel(Ar_i, Number(p.phi), rho_g, rho_p, mu);
      return {
        d_um: d_um_i,
        Ar: Ar_i,
        Re_mf: Re_i,
        Umf: Umf_i,
        U_Umf: Umf_i > 0 ? U / Umf_i : 0,
        U_Umf_pyro_bas: Umf_i > 0 ? U_bas / Umf_i : 0,
        Ut: Ut_i,
        U_Ut: Ut_i > 0 ? U / Ut_i : 0,
      };
    });

    // Sensitivity — design speed
    const U_milieu = (U_bas + U_haut) / 2;
    const cases = [
      { label: 'Vitesse proposée', U_i: U },
      { label: 'Pyrofluid bas', U_i: U_bas },
      { label: 'Pyrofluid milieu', U_i: U_milieu },
      { label: 'Pyrofluid haut', U_i: U_haut },
    ];
    const Umf_d800 = (() => {
      const d800 = 800e-6;
      const Ar800 = archimedes(rho_g, rho_p, d800, mu);
      const { Umf: u } = wenYu(Ar800, rho_g, d800, mu);
      return u;
    })();
    const vitesseTable = cases.map(({ label, U_i }) => {
      const Q_c = U_i * S_lit;
      const Q_f = Q_c * T_ref_K / T_K;
      const Q_n = Q_c * (273.15 / T_K) * 3600;
      const Q_g = Q_c * T_garde_K / T_K;
      const H_g = S_garde > 0 ? (Q_g * Number(p.t_sejour_s)) / S_garde : 0;
      return {
        label,
        U_i,
        Q_chaud: Q_c,
        Q_froid: Q_f,
        Q_normal: Q_n,
        U_Umf: Umf > 0 ? U_i / Umf : 0,
        U_Umf_800: Umf_d800 > 0 ? U_i / Umf_d800 : 0,
        Q_garde: Q_g,
        H_garde: H_g,
      };
    });

    return {
      T_K, rho_g, mu,
      d_m, Ar, Re_mf, Umf,
      d_star, Ut_star, Ut,
      U_Umf: Umf > 0 ? U / Umf : 0,
      U_Umf_bas: Umf > 0 ? U_bas / Umf : 0,
      U_Umf_haut: Umf > 0 ? U_haut / Umf : 0,
      U_Ut: Ut > 0 ? U / Ut : 0,
      dP_lit, dP_plaque_10, dP_plaque_30,
      H_D, H_ms, ratio_dilate,
      P_voute_Pa, P_service_10, P_service_30,
      P_calcul_Pa, P_calcul_kPa, P_calcul_mbar, P_calcul_barg,
      marge, rapport_05barg,
      S_lit, T_ref_K, Q_chaud, Q_ref, Q_normal_Nm3h,
      U_l19_chaud, U_l19_froid, S_garde, T_garde_K,
      granuloTable, vitesseTable,
    };
  }, [p]);

  // ── Styles ────────────────────────────────────────────────────────────

  const sCard = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  };
  const sGrid3 = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', alignItems: 'start' };
  const sGrid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 20px', alignItems: 'start' };
  const sLabel = { display: 'block', color: '#374151', fontWeight: '600', fontSize: '12px', marginBottom: '4px' };
  const sInput = { width: '100%', padding: '7px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' };
  const sRO = { ...sInput, background: '#f3f4f6', fontWeight: '600', color: '#374151', cursor: 'default' };
  const sH2 = { color: '#1a202c', fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' };

  const colorBg = (val, lo, hi) => {
    if (val === null || val === undefined) return {};
    if (val >= lo && val <= hi) return { background: '#dcfce7' };
    return { background: '#fee2e2' };
  };

  const InputField = ({ label, id, unit, step = 'any', readOnly = false, value, highlight }) => (
    <div>
      <label style={sLabel}>{label}{unit ? <span style={{ fontWeight: 400, color: '#6b7280' }}> [{unit}]</span> : ''}</label>
      <input
        type={readOnly ? 'text' : 'number'}
        step={step}
        value={readOnly ? value : p[id] ?? ''}
        readOnly={readOnly}
        onChange={readOnly ? undefined : set(id)}
        style={{ ...(!readOnly ? sInput : sRO), ...(highlight ?? {}) }}
      />
    </div>
  );

  // ── Table styles ─────────────────────────────────────────────────────
  const sTh = { padding: '8px 10px', background: '#f1f5f9', fontSize: '11px', fontWeight: '700', color: '#374151', border: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap' };
  const sTd = { padding: '6px 10px', fontSize: '12px', border: '1px solid #e2e8f0', textAlign: 'right' };
  const sTdC = { ...sTd, textAlign: 'center', fontWeight: '600' };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a202c', marginBottom: '8px' }}>
        💨 Fluidisation du lit d&apos;olivine — vitesse minimale et pressions
      </h1>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
        Modèles : Wen &amp; Yu (Umf) · Haider &amp; Levenspiel (Ut) · Baeyens &amp; Geldart (slugging) · Sutherland (viscosité)
      </p>

      {/* ── ENTRÉES ─────────────────────────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Entrées</h2>
        <div style={sGrid3}>
          <InputField label="Température du lit"        id="T_lit_C"        unit="°C"      step="0.1" />
          <InputField label="Pression"                  id="P_Pa"           unit="Pa"      step="100" />
          <InputField label="Diamètre des particules d" id="d_um"           unit="µm"      step="10" />
          <InputField label="Masse volumique ρp"        id="rho_p"          unit="kg/m³"   step="50" />
          <InputField label="Sphéricité φ"              id="phi"            unit="—"       step="0.05" />
          <InputField label="Porosité à Umf ε_mf"       id="eps_mf"         unit="—"       step="0.01" />
          <InputField label="Diamètre du lit D"         id="D_lit_m"        unit="m"       step="0.001" />
          <InputField label="Hauteur du lit tassé"      id="H_tasse_m"      unit="m"       step="0.01" />
          <InputField label="Hauteur du lit dilaté"     id="H_dilate_m"     unit="m"       step="0.01" />
          <InputField label="Vitesse proposée"          id="U_propose_ms"   unit="m/s"     step="0.01" />
          <InputField label="Vitesse Pyrofluid bas"     id="U_pyro_bas_ms"  unit="m/s"     step="0.05" />
          <InputField label="Vitesse Pyrofluid haut"    id="U_pyro_haut_ms" unit="m/s"     step="0.05" />
          <InputField label="Température zone de garde" id="T_garde_C"       unit="°C"      step="1" />
          <InputField label="Diamètre zone de garde"    id="D_garde_m"      unit="m"       step="0.001" />
          <InputField label="Temps de séjour nominal"   id="t_sejour_s"     unit="s"       step="0.5" />
          <InputField label="Débit gaz froid (ligne 19)" id="Q_froid_m3s"   unit="m³/s"   step="0.0001" />
          <InputField label="Température réf. débit froid" id="T_ref_froid_C" unit="°C"   step="1" />
          <InputField label="Masse molaire du gaz"      id="M_gaz"          unit="kg/mol"  step="0.0001" />
          <InputField label="Pression en voûte (service)" id="P_voute_mbar" unit="mbar"   step="0.5" />
          <InputField label="Pression de calcul Pyrofluid" id="P_calcul_mmCE" unit="mmCE" step="50" />
        </div>
      </div>

      {/* ── PROPRIÉTÉS DU GAZ ────────────────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Propriétés du gaz à la température du lit</h2>
        <div style={sGrid3}>
          <InputField label="Température du lit" unit="K"     readOnly value={fmt(calc.T_K, 2)} />
          <InputField label="Masse volumique ρg" unit="kg/m³" readOnly value={fmt(calc.rho_g, 4)} />
          <InputField label="Viscosité dynamique µ (Sutherland)" unit="Pa·s" readOnly value={calc.mu.toExponential(4)} />
        </div>
      </div>

      {/* ── VITESSE MINIMALE (WEN & YU) ──────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Vitesse minimale de fluidisation — Wen &amp; Yu</h2>
        <div style={sGrid3}>
          <InputField label="Diamètre des particules" unit="m"   readOnly value={calc.d_m.toExponential(4)} />
          <InputField label="Nombre d'Archimède Ar"   unit="—"   readOnly value={fmt(calc.Ar, 2)}
                      highlight={{ background: '#fef9c3' }} />
          <InputField label="Reynolds à Umf"          unit="—"   readOnly value={fmt(calc.Re_mf, 4)} />
          <InputField label="Umf — indép. de H"       unit="m/s" readOnly value={fmt(calc.Umf, 4)}
                      highlight={{ background: '#bbf7d0' }} />
          <InputField label="U / Umf (vitesse proposée)"      unit="—" readOnly value={fmt(calc.U_Umf, 2)}
                      highlight={colorBg(calc.U_Umf, 2, 10)} />
          <InputField label="U / Umf (Pyrofluid bas de plage)" unit="—" readOnly value={fmt(calc.U_Umf_bas, 2)} />
          <InputField label="U / Umf (Pyrofluid haut de plage)" unit="—" readOnly value={fmt(calc.U_Umf_haut, 2)} />
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          Ar = ρg (ρp − ρg) g d³ / µ² · Re_mf = √(33,7² + 0,0408 Ar) − 33,7 · Umf = Re_mf µ / (ρg d) · Lit bouillonnant : U/Umf entre 2 et 10
        </p>
      </div>

      {/* ── VITESSE TERMINALE (HAIDER & LEVENSPIEL) ─────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Vitesse terminale — Haider &amp; Levenspiel</h2>
        <div style={sGrid3}>
          <InputField label="d* adimensionnel" unit="—"   readOnly value={fmt(calc.d_star, 3)} />
          <InputField label="Ut* adimensionnel" unit="—"  readOnly value={fmt(calc.Ut_star, 4)} />
          <InputField label="Ut"               unit="m/s" readOnly value={fmt(calc.Ut, 3)}
                      highlight={{ background: '#bbf7d0' }} />
          <InputField label="U / Ut (vitesse proposée)" unit="—" readOnly value={fmt(calc.U_Ut, 4)}
                      highlight={calc.U_Ut < 0.5 ? { background: '#dcfce7' } : { background: '#fef9c3' }} />
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          d* = Ar^(1/3) · Ut* = [18/d*² + (2,335 − 1,744 φ)/√d*]⁻¹ · Ut = Ut* [µ(ρp−ρg)g/ρg²]^(1/3) · U/Ut doit rester ≪ 1
        </p>
      </div>

      {/* ── PERTE DE CHARGE & SLUGGING ───────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Perte de charge du lit et risque de slugging</h2>
        <div style={sGrid3}>
          <InputField label="ΔP lit à Umf"              unit="Pa"  readOnly value={fmt(calc.dP_lit, 0)} />
          <InputField label="ΔP lit à Umf"              unit="kPa" readOnly value={fmt(calc.dP_lit / 1000, 2)} />
          <InputField label="ΔP plaque min (10 % ΔP lit)" unit="Pa" readOnly value={fmt(calc.dP_plaque_10, 0)} />
          <InputField label="ΔP plaque min (30 % ΔP lit)" unit="Pa" readOnly value={fmt(calc.dP_plaque_30, 0)} />
          <InputField label="Rapport H/D lit tassé"     unit="—"   readOnly value={fmt(calc.H_D, 2)} />
          <InputField label="H_ms max sans slugging (Baeyens)"  unit="m" readOnly value={fmt(calc.H_ms, 2)} />
          <InputField label="Lit dilaté / H_ms"         unit="—"   readOnly value={fmt(calc.ratio_dilate, 3)}
                      highlight={calc.ratio_dilate < 1 ? { background: '#dcfce7' } : { background: '#fee2e2' }} />
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          ΔP = (1−ε_mf)(ρp−ρg) g H · H_ms = 1,9 D^0,3 (Baeyens &amp; Geldart, SI) · Lit dilaté/H_ms &lt; 1 : pas de slugging attendu
        </p>
      </div>

      {/* ── PRESSIONS DE SERVICE & DE CALCUL ────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Pressions de service et de calcul</h2>
        <div style={sGrid3}>
          <InputField label="Pression en voûte (service)" unit="Pa"   readOnly value={fmt(calc.P_voute_Pa, 0)} />
          <InputField label="P service boîte à vent (plaque 10 %)" unit="Pa" readOnly value={fmt(calc.P_service_10, 0)} />
          <InputField label="P service boîte à vent (plaque 30 %)" unit="Pa" readOnly value={fmt(calc.P_service_30, 0)} />
          <InputField label="P calcul Pyrofluid" unit="Pa"   readOnly value={fmt(calc.P_calcul_Pa, 0)} />
          <InputField label="P calcul Pyrofluid" unit="kPa"  readOnly value={fmt(calc.P_calcul_kPa, 2)} />
          <InputField label="P calcul Pyrofluid" unit="mbar" readOnly value={fmt(calc.P_calcul_mbar, 1)} />
          <InputField label="P calcul Pyrofluid" unit="barg" readOnly value={fmt(calc.P_calcul_barg, 4)} />
          <InputField label="Marge calcul / service (plaque 30 %)" unit="—" readOnly value={fmt(calc.marge, 2)}
                      highlight={calc.marge >= 1.5 ? { background: '#dcfce7' } : { background: '#fef9c3' }} />
          <InputField label="P calcul / seuil 0,5 barg (directive PED)" unit="—" readOnly value={fmt(calc.rapport_05barg, 3)}
                      highlight={calc.rapport_05barg < 1 ? { background: '#dcfce7' } : { background: '#fee2e2' }} />
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          P service = P voûte + ΔP lit + ΔP plaque (conduites et réchauffeur non inclus) · P calcul &lt; 0,5 barg → sous seuil directive équipements sous pression
        </p>
      </div>

      {/* ── DÉBITS AU LIT ────────────────────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Débits de gaz au lit</h2>
        <div style={sGrid3}>
          <InputField label="Section du lit"                    unit="m²"    readOnly value={fmt(calc.S_lit, 5)} />
          <InputField label="T réf. débit froid"                unit="K"     readOnly value={fmt(calc.T_ref_K, 2)} />
          <InputField label="Débit à T lit (U proposée)"        unit="m³/s"  readOnly value={fmt(calc.Q_chaud, 5)} />
          <InputField label="Débit à T réf. (U proposée)"       unit="m³/s"  readOnly value={fmt(calc.Q_ref, 5)} />
          <InputField label="Débit normal à 0 °C (U proposée)"  unit="Nm³/h" readOnly value={fmt(calc.Q_normal_Nm3h, 2)} />
          <InputField label="Vitesse lit si ligne 19 = débit chaud" unit="m/s" readOnly value={fmt(calc.U_l19_chaud, 4)} />
          <InputField label="Vitesse lit si ligne 19 = débit froid" unit="m/s" readOnly value={fmt(calc.U_l19_froid, 4)} />
          <InputField label="Section zone de garde"             unit="m²"    readOnly value={fmt(calc.S_garde, 5)} />
          <InputField label="T zone de garde"                   unit="K"     readOnly value={fmt(calc.T_garde_K, 2)} />
        </div>
      </div>

      {/* ── SENSIBILITÉ GRANULOMÉTRIE ─────────────────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Sensibilité à la granulométrie (olivine)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={sTh}>d [µm]</th>
                <th style={sTh}>Ar [—]</th>
                <th style={sTh}>Re à Umf [—]</th>
                <th style={sTh}>Umf [m/s]</th>
                <th style={sTh}>U proposée / Umf</th>
                <th style={sTh}>U Pyrofluid bas / Umf</th>
                <th style={sTh}>Ut [m/s]</th>
                <th style={sTh}>U proposée / Ut</th>
              </tr>
            </thead>
            <tbody>
              {calc.granuloTable.map((row) => {
                const ok = row.U_Umf >= 2 && row.U_Umf <= 10;
                return (
                  <tr key={row.d_um}>
                    <td style={{ ...sTdC, background: row.d_um === Number(p.d_um) ? '#dbeafe' : undefined }}>{row.d_um}</td>
                    <td style={sTd}>{fmt(row.Ar, 1)}</td>
                    <td style={sTd}>{fmt(row.Re_mf, 4)}</td>
                    <td style={sTd}>{fmt(row.Umf, 4)}</td>
                    <td style={{ ...sTd, background: ok ? '#dcfce7' : '#fee2e2', fontWeight: '600' }}>{fmt(row.U_Umf, 2)}</td>
                    <td style={sTd}>{fmt(row.U_Umf_pyro_bas, 2)}</td>
                    <td style={sTd}>{fmt(row.Ut, 3)}</td>
                    <td style={sTd}>{fmt(row.U_Ut, 4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          La ligne surlignée en bleu correspond au diamètre sélectionné. Vert : U/Umf ∈ [2,10] (lit bouillonnant). Rouge : hors plage.
        </p>
      </div>

      {/* ── SENSIBILITÉ VITESSE DE CONCEPTION ───────────────────────────── */}
      <div style={sCard}>
        <h2 style={sH2}>Sensibilité à la vitesse de conception (lit et zone de garde)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={sTh}>Cas</th>
                <th style={sTh}>U [m/s]</th>
                <th style={sTh}>Q lit chaud [m³/s]</th>
                <th style={sTh}>Q lit froid [m³/s]</th>
                <th style={sTh}>Q normal [Nm³/h]</th>
                <th style={sTh}>U/Umf (d choisi)</th>
                <th style={sTh}>U/Umf (800 µm)</th>
                <th style={sTh}>Q garde [m³/s]</th>
                <th style={sTh}>H garde [{p.t_sejour_s} s] [m]</th>
              </tr>
            </thead>
            <tbody>
              {calc.vitesseTable.map((row) => (
                <tr key={row.label}>
                  <td style={{ ...sTdC, textAlign: 'left', background: '#f8fafc', fontWeight: '600' }}>{row.label}</td>
                  <td style={sTdC}>{fmt(row.U_i, 4)}</td>
                  <td style={sTd}>{fmt(row.Q_chaud, 5)}</td>
                  <td style={sTd}>{fmt(row.Q_froid, 5)}</td>
                  <td style={sTd}>{fmt(row.Q_normal, 2)}</td>
                  <td style={{ ...sTd, background: row.U_Umf >= 2 && row.U_Umf <= 10 ? '#dcfce7' : '#fee2e2', fontWeight: '600' }}>
                    {fmt(row.U_Umf, 2)}
                  </td>
                  <td style={{ ...sTd, background: row.U_Umf_800 >= 2 && row.U_Umf_800 <= 10 ? '#dcfce7' : '#fef9c3', fontWeight: '600' }}>
                    {fmt(row.U_Umf_800, 2)}
                  </td>
                  <td style={sTd}>{fmt(row.Q_garde, 5)}</td>
                  <td style={{ ...sTd, fontWeight: '600', color: '#1d4ed8' }}>{fmt(row.H_garde, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
          Débit zone de garde = débit de fluidisation porté à T_garde. Produits de combustion et vapeur non inclus. H_garde = Q_garde × t_séjour / S_garde.
        </p>
      </div>
    </div>
  );
};

export default FluidisationTab;
