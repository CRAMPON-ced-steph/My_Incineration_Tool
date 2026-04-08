import React from 'react';
import {conv_O2_ref} from '../A_Transverse_fonction/conv_calculation';
import {molarMasses} from '../A_Transverse_fonction/constantes';


const PollutantCalculator = ({ masses, O2_mesure, O2_ref,Debit_fumees_sec_Nm3_h}) => {
  const calculatePollutans = (masses) => {
    const pollutant_initial_mass = {
      HCl: parseFloat(masses.HCl) || 0,
      HF: parseFloat(masses.HF) || 0,
      Cl: parseFloat(masses.Cl) || 0,
      S: parseFloat(masses.S) || 0,
      SO2: parseFloat(masses.SO2) || 0,
      N2: parseFloat(masses.N2) || 0,
      NOx: parseFloat(masses.NOx) || 0,
      CO2: parseFloat(masses.CO2) || 0,
      NH3: parseFloat(masses.CO2) || 0,
      DustFlyAsh: parseFloat(masses.DustFlyAsh) || 0,
      Mercury: parseFloat(masses.Mercury) || 0,
      PCDDF: parseFloat(masses.PCDDF) || 0,
      Cd_Ti: parseFloat(masses.Cd_Ti) || 0,
      Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: parseFloat(masses.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V) || 0,

    };



    const pollutant_concentration= {
      HCl: parseFloat(masses.HCl)*1e6/Debit_fumees_sec_Nm3_h || 0,
      HF: parseFloat(masses.HF)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      Cl: parseFloat(masses.Cl)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      S: parseFloat(masses.S)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      SO2: parseFloat(masses.SO2)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      N2: parseFloat(masses.N2)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      NOx: parseFloat(masses.NOx)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      CO2: parseFloat(masses.CO2)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      NH3: parseFloat(masses.CO2)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      DustFlyAsh: parseFloat(masses.DustFlyAsh)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      Mercury: parseFloat(masses.Mercury)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      PCDDF: parseFloat(masses.PCDDF)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      Cd_Ti: parseFloat(masses.Cd_Ti)*1e6/Debit_fumees_sec_Nm3_h  || 0,
      Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: parseFloat(masses.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V)*1e6/Debit_fumees_sec_Nm3_h  || 0,
    };


const coeff_convert = conv_O2_ref(O2_ref, O2_mesure)

    const pollutant_concentration_O2ref = {
      HCl: parseFloat(pollutant_concentration.HCl)*coeff_convert || 0,
      HF: parseFloat(pollutant_concentration.HF)*coeff_convert || 0,
      Cl: parseFloat(pollutant_concentration.Cl)*coeff_convert || 0,
      S: parseFloat(pollutant_concentration.S)*coeff_convert || 0,
      SO2: parseFloat(pollutant_concentration.SO2)*coeff_convert || 0,
      N2: parseFloat(pollutant_concentration.N2)*coeff_convert || 0,
      NOx: parseFloat(pollutant_concentration.NOx)*coeff_convert || 0,
      CO2: parseFloat(pollutant_concentration.CO2)*coeff_convert || 0,
      NH3: parseFloat(pollutant_concentration.CO2)*coeff_convert || 0,
      Dust_FlyAsh: parseFloat(pollutant_concentration.Dust_FlyAsh)*coeff_convert || 0,
      Mercury: parseFloat(pollutant_concentration.Mercury)*coeff_convert || 0,
      PCDDF: parseFloat(pollutant_concentration.PCDDF)*coeff_convert || 0,
      Cd_Ti: parseFloat(pollutant_concentration.Cd_Ti)*coeff_convert || 0,
      Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: parseFloat(pollutant_concentration.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V)*coeff_convert || 0,
    }






    const pollutant_kmole = {
      HCl: (parseFloat(masses.HCl) || 0) / molarMasses.HCl ,
      HF: (parseFloat(masses.HF) || 0) / molarMasses.HF,
      Cl: (parseFloat(masses.Cl) || 0) / molarMasses.Cl ,
      S: (parseFloat(masses.S) || 0) / molarMasses.S,
      SO2: (parseFloat(masses.SO2) || 0) / molarMasses.SO2 ,
      N2: (parseFloat(masses.N2) || 0) / molarMasses.N2 ,
      NOx: (parseFloat(masses.NOx) || 0) / molarMasses.NOx ,
      CO2: (parseFloat(masses.CO2) || 0) / molarMasses.CO2,
      NH3: (parseFloat(masses.NH3) || 0) / molarMasses.NH3,
     // DustFlyAsh: 0,
      //Mercury: (parseFloat(masses.Mercury) || 0) / molarMasses.Mercury / 1000,
      //PCDDF: 0,
      //Cd_Ti: 0,
      //Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: 0,
    };

const pollutant_mass_repartition = {
  HCl: parseFloat(masses.HCl) || 0,
  HF: parseFloat(masses.HF) || 0,
  Cl: parseFloat(masses.Cl) || 0,
  S: parseFloat(masses.S) || 0,
  SO2: parseFloat(masses.SO2) || 0,
  N2: parseFloat(masses.N2) || 0,
  NOx: parseFloat(masses.NOx) || 0,
  CO2: parseFloat(masses.CO2) || 0,
  NH3: parseFloat(masses.CO2) || 0,
  Dust_FlyAsh: parseFloat(masses.Dust_FlyAsh) || 0,
  Mercury: parseFloat(masses.Mercury) || 0,
  PCDDF: parseFloat(masses.PCDDF) || 0,
  Cd_Ti: parseFloat(masses.Cd_Ti) || 0,
  Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: parseFloat(masses.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V) || 0,


}









    return { pollutant_initial_mass, pollutant_kmole, pollutant_mass_repartition, pollutant_concentration, pollutant_concentration_O2ref };
  };

  const results = calculatePollutans(masses);

  return (
    <div>






      <table border="1" style={{marginTop: '20px', width: '100%',textAlign: 'center', fontSize: '12px',}}>
        <thead>
          <tr>
          
            <th>Élément</th>
            <th>Masse [kg/h]</th>
            <th>kmole</th>
            <th>Mass [%]</th>
            <th>[mg/Nm3]</th>
            <th>[mg/Nm3 @ O2ref]</th>
          </tr>
        </thead>
        <tbody>


          {['HCl', 'HF', 'Cl', 'S', 'SO2','N2', 'NOx', 'CO2','NH3', 'DustFlyAsh', 'Mercury', 'PCDDF', 'Cd_Ti','Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V' ].map((element) => (
            <tr key={element}>
              <td>{element}</td>
              <td>{results.pollutant_initial_mass[element]?.toFixed(4)}</td>
              <td>{results.pollutant_kmole[element]?.toFixed(4)}</td>
              <td>{results.pollutant_mass_repartition[element]?.toFixed(4)}</td>
              <td>{results.pollutant_concentration[element]?.toFixed(0)}</td>
              <td>{results.pollutant_concentration_O2ref[element]?.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PollutantCalculator;









