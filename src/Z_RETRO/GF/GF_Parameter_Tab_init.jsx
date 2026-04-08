import React, { useState, useEffect } from 'react';
import { performCalculation_GF } from './GF_calculations';
import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import ToggleButton from '../../C_Components/toggleButton';

import '../../index.css';


import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
import {translations} from './REACTOR_traduction';


const GF_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [Waste_flow_rate_kg_h, setWaste_flow_rate_kg_h] = useState(localStorage.getItem('Waste_flow_rate_kg_h') || '1000');
  const [Pressure_losse_mmCE, setPressure_losse_mmCE] = useState(localStorage.getItem('Pressure_losse_mmCE') || '100');
  const [Combustion_air_flowrate_Nm3_h, setCombustion_air_flowrate_Nm3_h] = useState(localStorage.getItem('Combustion_air_flowrate_Nm3_h') || '10000');
  const [Measured_air_temperature_C, setMeasured_air_temperature_C] = useState(localStorage.getItem('Measured_air_temperature_C') || '20');
  const [Q_feed_water_kg_h, setQ_feed_water_kg_h] = useState(localStorage.getItem('Q_feed_water_kg_h') || '0');
  const [T_feed_water_C, setT_feed_water_C] = useState(localStorage.getItem('T_feed_water_C') || '0');
  const [Blowdown_pourcent, setBlowdown_pourcent] = useState(localStorage.getItem('Blowdown_pourcent') || '0');
 
  const [Q_saturated_steam, setQ_saturated_steam] = useState(localStorage.getItem('Q_saturated_steam') || '0');
  const [Steam_pressure_gauge_bar, setSteam_pressure_gauge_bar] = useState(localStorage.getItem('Steam_pressure_gauge_bar') || '0');
  const [super_heated_steam_temperature_C, setSuper_heated_steam_temperature_C] = useState(localStorage.getItem('super_heated_steam_temperature_C') || '0');
  const [Q_superheated_steam_kg_h, setQ_superheated_steam_kg_h] = useState(localStorage.getItem('Q_superheated_steam_kg_h') || '0');
  const [P_superheated_steam_bar, setP_superheated_steam_bar] = useState(localStorage.getItem('P_superheated_steam_bar') || '0');
  const [T_superheated_water_boiler_C, setT_superheated_water_boiler_C] = useState(localStorage.getItem('T_superheated_water_boiler_C') || '0');
  const [Q_superheated_water_kg_h, setQ_superheated_water_kg_h] = useState(localStorage.getItem('Q_superheated_water_kg_h') || '0');
  const [Q_recycled_flue_gas_Nm3_h, setQ_recycled_flue_gas_Nm3_h] = useState(localStorage.getItem('Q_recycled_flue_gas_Nm3_h') || '0');
  const [T_recycled_flue_gas_C, setT_recycled_flue_gas_C] = useState(localStorage.getItem('T_recycled_flue_gas_C') || '0');
  const [Injected_water_temperature_C, setInjected_water_temperature_C] = useState(localStorage.getItem('Injected_water_temperature_C') || '0');
  const [Q_treatment_injected_water_kg_h, setQ_treatment_injected_water_kg_h] = useState(localStorage.getItem('Q_treatment_injected_water_kg_h') || '0');
  const [Auxiliary_fuel_kWh, setAuxiliary_fuel_kWh] = useState(localStorage.getItem('Auxiliary_fuel_kWh') || '0');
  const [Q_air_ingress_Nm3_h, setQ_air_ingress_Nm3_h] = useState(localStorage.getItem('Q_air_ingress_Nm3_h') || '0');
  const [T_air_ingress_C, setT_air_ingress_C] = useState(localStorage.getItem('T_air_ingress_C') || '20');
  const [Bottom_ash_pourcent, setBottom_ash_pourcent] = useState(localStorage.getItem('Bottom_ash_pourcent') || '15');
  const [Bottom_ash_temperature_C, setBottom_ash_temperature_C] = useState(localStorage.getItem('Bottom_ash_temperature_C') || '400');
  const [Unburnt_bottom_ash_pourcent, setUnburnt_bottom_ash_pourcent] = useState(localStorage.getItem('Unburnt_bottom_ash_pourcent') || '2');
  const [Unburnt_LCV_kcal_kg, setUnburnt_LCV_kcal_kg] = useState(localStorage.getItem('Unburnt_LCV_kcal_kg') || '7882'); //33000/4.1868
  const [Reference_temperature_C, setReference_temperature_C] = useState(localStorage.getItem('Reference_temperature_C') || '20');
  const [calculationResult_GF, setCalculationResult_GF] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [saturatedSteamEnabled, setSaturatedSteamEnabled] = useState(false);
  const [superheatedSteamEnabled, setSuperheatedSteamEnabled] = useState(false);
  const [superheatedWaterEnabled, setSuperheatedWaterEnabled] = useState(false);
  const [recycledFlueGasEnabled, setRecycledFlueGasEnabled] = useState(false);
  const [injectedWaterEnabled, setInjectedWaterEnabled] = useState(false);
  const [AirIngressEnabled, setAirIngressEnabled] = useState(false);

            // Get current language code and translations
            const languageCode = getLanguageCode(currentLanguage);
            const t = translations[languageCode] || translations['en']; // fallback to English if language not found

  // Save all parameters to localStorage whenever they change
  useEffect(() => {
    const saveToLocalStorage = () => {
      localStorage.setItem('Waste_flow_rate_kg_h', Waste_flow_rate_kg_h);
      localStorage.setItem('Pressure_losse_mmCE', Pressure_losse_mmCE);
      localStorage.setItem('Combustion_air_flowrate_Nm3_h', Combustion_air_flowrate_Nm3_h);
      localStorage.setItem('Measured_air_temperature_C', Measured_air_temperature_C);
      localStorage.setItem('Q_feed_water_kg_h', Q_feed_water_kg_h);
      localStorage.setItem('T_feed_water_C', T_feed_water_C);
      localStorage.setItem('Blowdown_pourcent', Blowdown_pourcent);

      localStorage.setItem('Q_saturated_steam', Q_saturated_steam);
      localStorage.setItem('Steam_pressure_gauge_bar', Steam_pressure_gauge_bar);
      localStorage.setItem('super_heated_steam_temperature_C', super_heated_steam_temperature_C);
      localStorage.setItem('Q_superheated_steam_kg_h', Q_superheated_steam_kg_h);
      localStorage.setItem('P_superheated_steam_bar', P_superheated_steam_bar);
      localStorage.setItem('T_superheated_water_boiler_C', T_superheated_water_boiler_C);
      localStorage.setItem('Q_superheated_water_kg_h', Q_superheated_water_kg_h);
      localStorage.setItem('Q_recycled_flue_gas_Nm3_h', Q_recycled_flue_gas_Nm3_h);
      localStorage.setItem('T_recycled_flue_gas_C', T_recycled_flue_gas_C);
      localStorage.setItem('Injected_water_temperature_C', Injected_water_temperature_C);
      localStorage.setItem('Q_treatment_injected_water_kg_h', Q_treatment_injected_water_kg_h);
      localStorage.setItem('Auxiliary_fuel_kWh', Auxiliary_fuel_kWh);
      localStorage.setItem('Bottom_ash_pourcent', Bottom_ash_pourcent);
      localStorage.setItem('Bottom_ash_temperature_C', Bottom_ash_temperature_C);
      localStorage.setItem('Unburnt_bottom_ash_pourcent', Unburnt_bottom_ash_pourcent);
      localStorage.setItem('Unburnt_LCV_kcal_kg', Unburnt_LCV_kcal_kg);
      localStorage.setItem('Reference_temperature_C', Reference_temperature_C);
      localStorage.setItem('Q_air_ingress_Nm3_h', Q_air_ingress_Nm3_h);
      localStorage.setItem('T_air_ingress_C', T_air_ingress_C);
    };
    saveToLocalStorage();
  }, [Waste_flow_rate_kg_h, Pressure_losse_mmCE, Combustion_air_flowrate_Nm3_h, Measured_air_temperature_C, 
      Q_feed_water_kg_h, 
      T_feed_water_C,Blowdown_pourcent,Q_saturated_steam, Steam_pressure_gauge_bar, super_heated_steam_temperature_C,
      Q_superheated_steam_kg_h, P_superheated_steam_bar, T_superheated_water_boiler_C, Q_superheated_water_kg_h,
      Q_recycled_flue_gas_Nm3_h, T_recycled_flue_gas_C, Injected_water_temperature_C, Q_treatment_injected_water_kg_h,
      Auxiliary_fuel_kWh, Bottom_ash_pourcent, Bottom_ash_temperature_C, Unburnt_bottom_ash_pourcent,
      Unburnt_LCV_kcal_kg, Reference_temperature_C,T_air_ingress_C,Q_air_ingress_Nm3_h]);

  // Auto-update calculation whenever any parameter changes
  useEffect(() => {
    // Perform calculation automatically when any parameter changes
    const result = performCalculation_GF(
      nodeData,
      parseFloat(Waste_flow_rate_kg_h),
  parseFloat(Pressure_losse_mmCE),
  parseFloat(Combustion_air_flowrate_Nm3_h),
  parseFloat(Measured_air_temperature_C),
  parseFloat(Q_feed_water_kg_h),
  parseFloat(T_feed_water_C),
  parseFloat(Blowdown_pourcent),
  parseFloat(Q_saturated_steam),
  parseFloat(Steam_pressure_gauge_bar),
  parseFloat(super_heated_steam_temperature_C),
  parseFloat(Q_superheated_steam_kg_h),
  parseFloat(P_superheated_steam_bar),
  parseFloat(T_superheated_water_boiler_C),
  parseFloat(Q_superheated_water_kg_h),
  parseFloat(Q_recycled_flue_gas_Nm3_h),
  parseFloat(T_recycled_flue_gas_C),
  parseFloat(Injected_water_temperature_C),
  parseFloat(Q_treatment_injected_water_kg_h),
  parseFloat(Auxiliary_fuel_kWh),
  parseFloat(Bottom_ash_pourcent),
  parseFloat(Bottom_ash_temperature_C),
  parseFloat(Unburnt_bottom_ash_pourcent),
  parseFloat(Unburnt_LCV_kcal_kg),
  parseFloat(Reference_temperature_C),
  parseFloat(Q_air_ingress_Nm3_h),
  parseFloat(T_air_ingress_C)
    );
    setCalculationResult_GF(result);
    
    // Send data to parent component
    if (onSendData) {
      onSendData({ result });
    }
  }, [
    nodeData,
    Waste_flow_rate_kg_h, 
    Pressure_losse_mmCE, 
    Combustion_air_flowrate_Nm3_h, 
    Measured_air_temperature_C, 
    Q_feed_water_kg_h, 
    T_feed_water_C,
    Blowdown_pourcent,
    Q_saturated_steam, 
    Steam_pressure_gauge_bar, 
    super_heated_steam_temperature_C,
    Q_superheated_steam_kg_h, 
    P_superheated_steam_bar, 
    T_superheated_water_boiler_C, 
    Q_superheated_water_kg_h,
    Q_recycled_flue_gas_Nm3_h, 
    T_recycled_flue_gas_C, 
    Injected_water_temperature_C, 
    Q_treatment_injected_water_kg_h,
    Auxiliary_fuel_kWh, 
    Bottom_ash_pourcent, 
    Bottom_ash_temperature_C, 
    Unburnt_bottom_ash_pourcent,
    Unburnt_LCV_kcal_kg, 
    Reference_temperature_C,
    Q_air_ingress_Nm3_h,
    T_air_ingress_C,
    onSendData
  ]);

  // Save calculation results to localStorage when they change
  useEffect(() => {
    if (calculationResult_GF) {
      localStorage.setItem('calculationResult_GF', JSON.stringify(calculationResult_GF));
    }
  }, [calculationResult_GF]);

  const toggleSlider = () => setIsSliderOpen(!isSliderOpen);
  
  const clearMemory = () => {
    localStorage.clear();
    setCalculationResult_GF(null);
    // Reset all state values to defaults
    setWaste_flow_rate_kg_h('1000');
    setPressure_losse_mmCE('50');
    setCombustion_air_flowrate_Nm3_h('10000');
    setMeasured_air_temperature_C('20');
    setQ_feed_water_kg_h('0');
    setT_feed_water_C('0');
    setBlowdown_pourcent('1.5');
    setQ_saturated_steam('0');
    setSteam_pressure_gauge_bar('0');
    setSuper_heated_steam_temperature_C('0');
    setQ_superheated_steam_kg_h('0');
    setP_superheated_steam_bar('0');
    setT_superheated_water_boiler_C('0');
    setQ_superheated_water_kg_h('0');
    setQ_recycled_flue_gas_Nm3_h('0');
    setT_recycled_flue_gas_C('0');
    setInjected_water_temperature_C('0');
    setQ_treatment_injected_water_kg_h('0');
    setAuxiliary_fuel_kWh('0');
    setT_air_ingress_C('20');
    setQ_air_ingress_Nm3_h('0');
    setBottom_ash_pourcent('15');
    setBottom_ash_temperature_C('400');
    setUnburnt_bottom_ash_pourcent('2');
    setUnburnt_LCV_kcal_kg('7882');
    setReference_temperature_C('25');
    
    // Reset toggle states
    setSaturatedSteamEnabled(false);
    setSuperheatedSteamEnabled(false);
    setSuperheatedWaterEnabled(false);
    setRecycledFlueGasEnabled(false);
    setInjectedWaterEnabled(false);
    setAirIngressEnabled(false);
  };

  
  // Fixed the state setter functions for toggle sections
  const handleToggleRecycledFlueGas = (value) => {
    setRecycledFlueGasEnabled(value);
    // Reset values if toggled off
    if (!value) {
      setQ_recycled_flue_gas_Nm3_h('0');
      setT_recycled_flue_gas_C('0');
    }
  };

  const handleToggleInjectedWater = (value) => {
    setInjectedWaterEnabled(value);
    // Reset values if toggled off
    if (!value) {
      setInjected_water_temperature_C('0');
      setQ_treatment_injected_water_kg_h('0');
    }
  };

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />

      <h3>{title} Parameters</h3>
      <div className="inputs-container">
      <h4>Parameters</h4>
        <InputField label="Waste flow rate" unit="[kg/h]" value={Waste_flow_rate_kg_h} onChange={(e) => setWaste_flow_rate_kg_h(e.target.value || '0')} />
        <InputField label="Pressure loss" unit="[mmCE]" value={Pressure_losse_mmCE} onChange={(e) => setPressure_losse_mmCE(e.target.value || '0')} />
        <InputField label="Combustion air flowrate" unit="[Nm³/h]" value={Combustion_air_flowrate_Nm3_h} onChange={(e) => setCombustion_air_flowrate_Nm3_h(e.target.value || '0')} />
        <InputField label="Measured air temperature" unit="[°C]" value={Measured_air_temperature_C} onChange={(e) => setMeasured_air_temperature_C(e.target.value || '0')} />
        <InputField label="Feed water flow" unit="[kg/h]" value={Q_feed_water_kg_h} onChange={(e) => setQ_feed_water_kg_h(e.target.value || '0')} />
        <InputField label="Feed water temperature" unit="[°C]" value={T_feed_water_C} onChange={(e) => setT_feed_water_C(e.target.value || '0')} />
        <InputField label="Blowdown_pourcent" unit="[%]" value={Blowdown_pourcent} onChange={(e) => setBlowdown_pourcent(e.target.value || '1.5')} />

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Air ingress" toggled={AirIngressEnabled} onToggle={setAirIngressEnabled}/>
        </div>

        {AirIngressEnabled && (<>
        <InputField label="Q_air_ingress" unit="[Nm3/h]" value={Q_air_ingress_Nm3_h} onChange={(e) => setQ_air_ingress_Nm3_h(e.target.value || '0')} />
        <InputField label="T_air_ingress" unit="[°C]" value={T_air_ingress_C} onChange={(e) => setT_air_ingress_C(e.target.value || '20')} />
        </>)}

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Saturated steam" toggled={saturatedSteamEnabled} onToggle={setSaturatedSteamEnabled}/>
        </div>

        {saturatedSteamEnabled && (<>
        <InputField label="Saturated steam" unit="[kg/h]" value={Q_saturated_steam} onChange={(e) => setQ_saturated_steam(e.target.value || '0')} />
        <InputField label="Steam pressure" unit="[bar]" value={Steam_pressure_gauge_bar} onChange={(e) => setSteam_pressure_gauge_bar(e.target.value || '0')} />
        </>)}

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Superheated steam" toggled={superheatedSteamEnabled} onToggle={setSuperheatedSteamEnabled}/>
        </div>

        {superheatedSteamEnabled && (<>
        <InputField label="Superheated steam temperature" unit="[°C]" value={super_heated_steam_temperature_C} onChange={(e) => setSuper_heated_steam_temperature_C(e.target.value || '0')} />
        <InputField label="Superheated steam flow" unit="[kg/h]" value={Q_superheated_steam_kg_h} onChange={(e) => setQ_superheated_steam_kg_h(e.target.value || '0')} />
        <InputField label="Superheated steam pressure" unit="[bar]" value={P_superheated_steam_bar} onChange={(e) => setP_superheated_steam_bar(e.target.value || '0')} />
        </>)}

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Superheated water" toggled={superheatedWaterEnabled} onToggle={setSuperheatedWaterEnabled}/>
        </div>

        {superheatedWaterEnabled && (<>
        <InputField label="Superheated water temperature" unit="[°C]" value={T_superheated_water_boiler_C} onChange={(e) => setT_superheated_water_boiler_C(e.target.value || '0')} />
        <InputField label="Superheated water flow" unit="[kg/h]" value={Q_superheated_water_kg_h} onChange={(e) => setQ_superheated_water_kg_h(e.target.value || '0')} />
        </>)}

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Recycled flue gas" toggled={recycledFlueGasEnabled} onToggle={handleToggleRecycledFlueGas}/>
        </div>

        {recycledFlueGasEnabled && (<>
        <InputField label="Recycled flue gas flow" unit="[Nm³/h]" value={Q_recycled_flue_gas_Nm3_h} onChange={(e) => setQ_recycled_flue_gas_Nm3_h(e.target.value || '0')} />
        <InputField label="Recycled flue gas temperature" unit="[°C]" value={T_recycled_flue_gas_C} onChange={(e) => setT_recycled_flue_gas_C(e.target.value || '0')} />
        </>)}

        <div className="toggle-container-plus-moins">
        <ToggleButton label="Injected water" toggled={injectedWaterEnabled} onToggle={handleToggleInjectedWater}/>
        </div>

        {injectedWaterEnabled && (<>
        <InputField label="Injected water temperature" unit="[°C]" value={Injected_water_temperature_C} onChange={(e) => setInjected_water_temperature_C(e.target.value || '0')} />
        <InputField label="Treatment injected water flow" unit="[kg/h]" value={Q_treatment_injected_water_kg_h} onChange={(e) => setQ_treatment_injected_water_kg_h(e.target.value || '0')} />
        </>)}

        <InputField label="Auxiliary fuel" unit="[kWh]" value={Auxiliary_fuel_kWh} onChange={(e) => setAuxiliary_fuel_kWh(e.target.value || '0')} />
        <InputField label="Bottom ash percentage" unit="[%]" value={Bottom_ash_pourcent} onChange={(e) => setBottom_ash_pourcent(e.target.value || '0')} />
        <InputField label="Bottom ash temperature" unit="[°C]" value={Bottom_ash_temperature_C} onChange={(e) => setBottom_ash_temperature_C(e.target.value || '0')} />
        <InputField label="Unburnt bottom ash" unit="[%]" value={Unburnt_bottom_ash_pourcent} onChange={(e) => setUnburnt_bottom_ash_pourcent(e.target.value || '0')} />
        <InputField label="Unburnt LCV" unit="[kcal/kg]" value={Unburnt_LCV_kcal_kg} onChange={(e) => setUnburnt_LCV_kcal_kg(e.target.value || '0')} />
        <InputField label="Reference temperature" unit="[°C]" value={Reference_temperature_C} onChange={(e) => setReference_temperature_C(e.target.value || '0')} />
      </div>

      <div className="prez-3-buttons">
        <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
        <ClearButton onClick={clearMemory} />
      </div>

      {isSliderOpen && calculationResult_GF && (
        <CalculationResults isOpen={isSliderOpen} results={calculationResult_GF} />
      )}
    </div>
  );
};

export default GF_Parameter_Tab;