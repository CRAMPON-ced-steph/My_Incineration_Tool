// Économiseur fumées → eau (nœud « Cooling_HX_eau ») — mode Bilan.
// Calculs : WATERCOOLER_calculs.js (reprise de Pyrofluid ClassEconomiseur). Les paramètres et
// le résultat sont tenus ici et partagés par les onglets (Gaz, Polluants, Design, OPEX, Rapport),
// de sorte que la sortie envoyée à l'aval ne dépend pas de l'onglet ouvert.
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import WATERCOOLERFlueGas from './1_WATERCOOLER_Flue_gas_ML';
import WATERCOOLERPollutantEmission from './2_WATERCOOLER_Pollutant_Emission_ML';
import WATERCOOLERDesign from './3_WATERCOOLER_Design_ML';
import WATERCOOLERopex from './4_WATERCOOLER_Opex';
import WATERCOOLER_Report from './WATERCOOLER_Report';
import '../../../index.css';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WATERCOOLER_traduction';
import { calculEconomiseur, PARAMS_DEFAUT_ECO, puissancePompe_kW } from './WATERCOOLER_calculs';
import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3, coeff_Nm3_to_m3 } from '../../../A_Transverse_fonction/conv_calculation';

const FG_DEFAUT = { CO2: 1, H2O: 1, O2: 1, N2: 1 };
const cleParams = (nodeId) => `params_WATERCOOLER_${nodeId}`;
const cleAmont = (nodeId) => `amont_WATERCOOLER_${nodeId}`;

const nombre = (v, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};

// Conditions d'entrée = sortie du nœud amont. Après « Back to Flow », le résultat du nœud devient
// sa propre sortie : on relit alors l'entrée mémorisée à l'envoi, tant que le nœud amont n'a pas
// renvoyé de nouvelles valeurs (T et P de sortie inchangées).
const lireAmont = (result, nodeId) => {
  const r = result || {};
  const memo = r[cleAmont(nodeId)];
  if (memo?.entree && r.T_OUT === memo.T_emise && r.P_OUT === memo.P_emise) return memo.entree;
  return {
    T_IN: nombre(r.T_OUT, 300),
    FG_IN: r.FG_OUT_kg_h || FG_DEFAUT,
    P_IN: nombre(r.P_OUT, 0),
    NombreFour: Math.max(1, Math.round(nombre(r.NombreFour, 1))),
  };
};

const chargerParams = (nodeId) => {
  try {
    return { ...PARAMS_DEFAUT_ECO, ...JSON.parse(localStorage.getItem(cleParams(nodeId)) || '{}') };
  } catch {
    return { ...PARAMS_DEFAUT_ECO };
  }
};

const WATERCOOLERMainPage = ({ nodeData, onSendData, onGoBack, currentLanguage = 'fr', nodeId }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = useCallback(
    (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key,
    [languageCode]
  );

  const [innerData, setInnerData] = useState(nodeData?.result || {});
  const [amont] = useState(() => lireAmont(nodeData?.result, nodeId));

  // ─── Paramètres (localStorage par nœud) ───
  const [params, setParams] = useState(() => chargerParams(nodeId));
  useEffect(() => {
    localStorage.setItem(cleParams(nodeId), JSON.stringify(params));
  }, [params, nodeId]);
  const setParam = useCallback((cle, valeur) => setParams((p) => ({ ...p, [cle]: valeur })), []);
  const resetParams = useCallback(() => {
    localStorage.removeItem(cleParams(nodeId));
    setParams({ ...PARAMS_DEFAUT_ECO });
  }, [nodeId]);

  // ─── Calcul ───
  const nbEchangeurs = params.echangeurParFour ? amont.NombreFour : 1;
  const res = useMemo(
    () => calculEconomiseur({ ...params, FG: amont.FG_IN, T_fumees_entree_C: amont.T_IN, nbEchangeurs }),
    [params, amont, nbEchangeurs]
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
  const Q_FG_entree_m3_h = FG_Nm3.wet * coeff_Nm3_to_m3(amont.P_IN, amont.T_IN);
  const Q_FG_sortie_m3_h = FG_Nm3.wet * coeff_Nm3_to_m3(P_out_mmCE, T_OUT);
  const DP_pompe_bar = nombre(params.DP_pompe_bar);
  const Rdt_pompe_pct = nombre(params.Rdt_pompe_pct);
  const Puissance_pompe_kW = puissancePompe_kW(res.Qv_eau_tot_m3_h, DP_pompe_bar, Rdt_pompe_pct);

  const synthese = {
    ...res,
    NombreFour: amont.NombreFour,
    echangeurParFour: !!params.echangeurParFour,
    PDC_fumees_mmCE: PDC_mmCE,
    P_entree_mmCE: amont.P_IN,
    P_sortie_mmCE: P_out_mmCE,
    Q_FG_entree_m3_h,
    Q_FG_sortie_m3_h,
    FG_Nm3_h: FG_Nm3,
    DP_pompe_bar,
    Rdt_pompe_pct,
    Puissance_pompe_kW,
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
    WATERCOOLER: synthese,
  });

  // ─── Clés OPEX standard (toutes écrites, 0 si non consommées) ───
  const opexPayload = useMemo(() => ({
    consoElec1: Puissance_pompe_kW,
    labelElec1: t('pumpConsumer'),
    ...Object.fromEntries([2, 3, 4, 5, 6, 7, 8].flatMap((i) => [[`consoElec${i}`, 0], [`labelElec${i}`, '']])),
    conso_air_co_N_m3: 0,
    Conso_EauPotable_m3: 0, Conso_EauRefroidissement_m3: 0, Conso_EauDemin_m3: 0, Conso_EauRiviere_m3: 0, Conso_EauAdoucie_m3: 0,
    Conso_CaCO3_kg: 0, Conso_CaO_kg: 0, Conso_CaOH2_dry_kg: 0, Conso_CaOH2_wet_kg: 0, Conso_NaOH_kg: 0,
    Conso_NaOHCO3_kg: 0, Conso_Ammonia_kg: 0, Conso_NaBrCaBr2_kg: 0, Conso_CAP_kg: 0,
    conso_gaz_H_MW: 0, conso_gaz_L_MW: 0, conso_gaz_Process_MW: 0, conso_fuel_MW: 0,
    conso_incineration_ash_kg_h: 0, conso_boiler_ash_kg_h: 0, conso_fly_ash_kg_h: 0,
    CO2_transport_incineratino_ash: 0, CO2_transport_boiler_ash: 0, CO2_transport_fly_ash: 0, CO2_transport_reactifs: 0,
    cout_transport_incineratino_ash: 0, cout_transport_boiler_ash: 0, cout_transport_fly_ash: 0, cout_transport_reactifs: 0,
  }), [Puissance_pompe_kW, t]);

  const lastSync = useRef('');
  useEffect(() => {
    const json = JSON.stringify(opexPayload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    setInnerData((prev) => ({ ...prev, ...opexPayload }));
  }, [opexPayload]);

  const tabProps = { innerData, setInnerData, params, setParam, resetParams, res: synthese, amont, t, currentLanguage, nodeId };
  const tabs = [
    { name: t('Flue gases'), content: <WATERCOOLERFlueGas {...tabProps} /> },
    { name: t('Pollutant Emissions'), content: <WATERCOOLERPollutantEmission {...tabProps} /> },
    { name: t('Design'), content: <WATERCOOLERDesign {...tabProps} /> },
    { name: t('Opex'), content: <WATERCOOLERopex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} nodeId={nodeId} /> },
    { name: t('Report'), content: <WATERCOOLER_Report innerData={innerData} currentLanguage={currentLanguage} nodeId={nodeId} /> },
  ];
  const [activeTab, setActiveTab] = useState(0);

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
        [cleAmont(nodeId)]: { entree: amont, T_emise: T_OUT, P_emise: P_out_mmCE },
        activeNodes_Elec: innerData.activeNodes_Elec || [],
        activeNodes_Eau: innerData.activeNodes_Eau || [],
        activeNodes_Reactifs: innerData.activeNodes_Reactifs || [],
        activeNodes_Energie: innerData.activeNodes_Energie || [],
        activeNodes_CO2: innerData.activeNodes_CO2 || [],
        activeNodes_cout: innerData.activeNodes_cout || [],
      },
    });
  };

  return (
    <div className="cadre_pour_onglet_principal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{t('WATERCOOLER Configuration')}</h1>
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
        {tabs.map((tab, i) => (
          <button
            key={i}
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
            {tab.name}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default WATERCOOLERMainPage;
