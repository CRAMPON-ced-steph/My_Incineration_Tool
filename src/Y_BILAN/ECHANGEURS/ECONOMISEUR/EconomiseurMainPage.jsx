// Page commune des économiseurs Pyrofluid (fumées → eau : Cooling_HX_eau ; fumées → air :
// Cooling_HX_air), mode Bilan. Chaque équipement fournit sa configuration (code, fluide,
// traductions) et ses onglets ; les paramètres et le résultat sont tenus ici et partagés par
// les onglets, de sorte que la sortie envoyée à l'aval ne dépend pas de l'onglet ouvert.
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import '../../../index.css';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { calculEconomiseur, PARAMS_DEFAUT, AUXILIAIRE, migrerParams } from './economiseur_calculs';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3, coeff_Nm3_to_m3 } from '../../../A_Transverse_fonction/conv_calculation';
import { useEnvoiAuto } from '../../../C_Components/envoiAuto';

const FG_DEFAUT = { CO2: 1, H2O: 1, O2: 1, N2: 1 };
const cleParams = (code, nodeId) => `params_${code}_${nodeId}`;

const nombre = (v, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};

// Conditions d'entrée = sortie du nœud amont (Main_FLOW superpose l'entrée reçue au résultat du
// nœud à chaque ouverture : C_Components/entreeNoeud.js).
const lireAmont = (result) => {
  const r = result || {};
  return {
    T_IN: nombre(r.T_OUT, 300),
    FG_IN: r.FG_OUT_kg_h || FG_DEFAUT,
    P_IN: nombre(r.P_OUT, 0),
    NombreFour: Math.max(1, Math.round(nombre(r.NombreFour, 1))),
  };
};

const chargerParams = (code, fluide, nodeId) => {
  try {
    const sauve = migrerParams(JSON.parse(localStorage.getItem(cleParams(code, nodeId)) || '{}'));
    return { ...PARAMS_DEFAUT[fluide], ...sauve, fluide };
  } catch {
    return { ...PARAMS_DEFAUT[fluide] };
  }
};

const EconomiseurMainPage = ({ nodeData, onSendData, onGoBack, currentLanguage = 'fr', nodeId, config, onglets }) => {
  const { code, fluide, translations } = config;
  const languageCode = getLanguageCode(currentLanguage);
  const t = useCallback(
    (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key,
    [languageCode, translations]
  );

  const [innerData, setInnerData] = useState(nodeData?.result || {});
  const [amont] = useState(() => lireAmont(nodeData?.result));

  // ─── Paramètres (localStorage par nœud) ───
  const [params, setParams] = useState(() => chargerParams(code, fluide, nodeId));
  useEffect(() => {
    localStorage.setItem(cleParams(code, nodeId), JSON.stringify(params));
  }, [params, code, nodeId]);
  const setParam = useCallback((cle, valeur) => setParams((p) => ({ ...p, [cle]: valeur })), []);
  const resetParams = useCallback(() => {
    localStorage.removeItem(cleParams(code, nodeId));
    setParams({ ...PARAMS_DEFAUT[fluide] });
  }, [code, fluide, nodeId]);

  // ─── Calcul ───
  const nbEchangeurs = params.echangeurParFour ? amont.NombreFour : 1;
  const res = useMemo(
    () => calculEconomiseur({ ...params, fluide, FG: amont.FG_IN, T_fumees_entree_C: amont.T_IN, nbEchangeurs }),
    [params, fluide, amont, nbEchangeurs]
  );

  const FG = amont.FG_IN;
  const FG_Nm3 = {
    CO2: CO2_kg_m3(nombre(FG.CO2)), H2O: H2O_kg_m3(nombre(FG.H2O)),
    O2: O2_kg_m3(nombre(FG.O2)), N2: N2_kg_m3(nombre(FG.N2)),
  };
  FG_Nm3.dry = FG_Nm3.CO2 + FG_Nm3.O2 + FG_Nm3.N2;
  FG_Nm3.wet = FG_Nm3.dry + FG_Nm3.H2O;

  const T_OUT = Number.isFinite(res.T_fumees_sortie_C) ? res.T_fumees_sortie_C : amont.T_IN;
  const PDC_mmCE = nombre(params.PDC_fumees_mmCE);
  const P_out_mmCE = amont.P_IN - PDC_mmCE;
  const aux = AUXILIAIRE[fluide];
  const DP_aux = nombre(params[aux.cleDP]);
  const Rdt_aux_pct = nombre(params[aux.cleRdt]);
  const Puissance_aux_kW = aux.puissance_kW(res.Qv_fluide_tot_m3_h, DP_aux, Rdt_aux_pct);

  const synthese = {
    ...res,
    NombreFour: amont.NombreFour,
    echangeurParFour: !!params.echangeurParFour,
    PDC_fumees_mmCE: PDC_mmCE,
    P_entree_mmCE: amont.P_IN,
    P_sortie_mmCE: P_out_mmCE,
    Q_FG_entree_m3_h: FG_Nm3.wet * coeff_Nm3_to_m3(amont.P_IN, amont.T_IN),
    Q_FG_sortie_m3_h: FG_Nm3.wet * coeff_Nm3_to_m3(P_out_mmCE, T_OUT),
    FG_Nm3_h: FG_Nm3,
    DP_aux,
    Rdt_aux_pct,
    Puissance_aux_kW,
  };

  // Sortie fumées et polluants (mutation de innerData : pattern établi, lu par les onglets)
  const PollutantIn = innerData.PollutantOutput || {};
  Object.assign(innerData, {
    T_OUT,
    FG_OUT_kg_h: { CO2: nombre(FG.CO2), H2O: nombre(FG.H2O), O2: nombre(FG.O2), N2: nombre(FG.N2) },
    FG_OUT_Nm3_h: FG_Nm3,
    FG_humide_tot: FG_Nm3.wet,
    FG_sec_tot: FG_Nm3.dry,
    Pin_mmCE: amont.P_IN,
    P_out_mmCE,
    PInput: PollutantIn,
    Poutput: PollutantIn, // l'économiseur ne capte ni polluant ni poussière (Pyrofluid)
    Residus: innerData.ResidusOutput || {},
    [code]: synthese,
  });

  // ─── Clés OPEX standard (toutes écrites, 0 si non consommées) ───
  const opexPayload = useMemo(() => ({
    consoElec1: Puissance_aux_kW,
    labelElec1: t('auxConsommateur'),
    ...Object.fromEntries([2, 3, 4, 5, 6, 7, 8].flatMap((i) => [[`consoElec${i}`, 0], [`labelElec${i}`, '']])),
    conso_air_co_N_m3: 0,
    Conso_EauPotable_m3: 0, Conso_EauRefroidissement_m3: 0, Conso_EauDemin_m3: 0, Conso_EauRiviere_m3: 0, Conso_EauAdoucie_m3: 0,
    Conso_CaCO3_kg: 0, Conso_CaO_kg: 0, Conso_CaOH2_dry_kg: 0, Conso_CaOH2_wet_kg: 0, Conso_NaOH_kg: 0,
    Conso_NaOHCO3_kg: 0, Conso_Ammonia_kg: 0, Conso_NaBrCaBr2_kg: 0, Conso_CAP_kg: 0,
    conso_gaz_H_MW: 0, conso_gaz_L_MW: 0, conso_gaz_Process_MW: 0, conso_fuel_MW: 0,
    conso_incineration_ash_kg_h: 0, conso_boiler_ash_kg_h: 0, conso_fly_ash_kg_h: 0,
    CO2_transport_incineratino_ash: 0, CO2_transport_boiler_ash: 0, CO2_transport_fly_ash: 0, CO2_transport_reactifs: 0,
    cout_transport_incineratino_ash: 0, cout_transport_boiler_ash: 0, cout_transport_fly_ash: 0, cout_transport_reactifs: 0,
  }), [Puissance_aux_kW, t]);

  const lastSync = useRef('');
  useEffect(() => {
    const json = JSON.stringify(opexPayload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    setInnerData((prev) => ({ ...prev, ...opexPayload }));
  }, [opexPayload]);

  const tabProps = { innerData, setInnerData, params, setParam, resetParams, res: synthese, amont, t, config, currentLanguage, nodeId };
  const [activeTab, setActiveTab] = useState(0);
  const Actif = onglets[activeTab]?.Composant;

  const sendAllData = () => {
    onSendData({
      result: {
        ...innerData,
        PollutantInput: innerData.PInput || {},
        PollutantOutput: innerData.Poutput || {},
        ResidusOutput: innerData.Residus || {},
        MasseDechet: innerData.MasseDechet || 0,
        T_OUT,
        P_OUT: P_out_mmCE,
        activeNodes_Elec: innerData.activeNodes_Elec || [],
        activeNodes_Eau: innerData.activeNodes_Eau || [],
        activeNodes_Reactifs: innerData.activeNodes_Reactifs || [],
        activeNodes_Energie: innerData.activeNodes_Energie || [],
        activeNodes_CO2: innerData.activeNodes_CO2 || [],
        activeNodes_cout: innerData.activeNodes_cout || [],
      },
    });
  };

  // Calc. All du mode Bilan : envoi déclenché sans ouvrir le nœud (C_Components/envoiAuto.js)
  useEnvoiAuto(sendAllData);

  return (
    <div className="cadre_pour_onglet_principal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{t(`${code} Configuration`)}</h1>
        <button
          onClick={() => {
            onGoBack(null);
            sendAllData();
          }}
          style={{ padding: '8px 16px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {t('Back to Flow')}
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px', overflowX: 'auto' }}>
        {onglets.map((o, i) => (
          <button
            key={o.cle}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 20px',
              background: activeTab === i ? '#4a90e2' : 'white',
              color: activeTab === i ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === i ? '2px solid #4a90e2' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === i ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
          >
            {t(o.cle)}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        {Actif ? <Actif {...tabProps} /> : null}
      </div>
    </div>
  );
};

export default EconomiseurMainPage;
