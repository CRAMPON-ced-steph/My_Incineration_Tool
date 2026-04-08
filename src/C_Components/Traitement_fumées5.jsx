import React, { useState, useEffect } from 'react';
import PollutantCalculator from '../C_Components/Tableau_polluants';
import { R_1, R_2, R_3 } from '../A_Transverse_fonction/FGT_fct';

const FGT = ({ masses, innerData }) => {
  const reactants = ['CaCO3', 'CaO', 'CaOH2dry', 'CaOH2wet', 'None'];

  // Charger les données sauvegardées ou initialiser avec les valeurs de masses
  const getSavedData = () => {
    const savedData = localStorage.getItem('FGT_data');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [
      {
        pollutant: 'SOx',
        reactant: 'None',
        mass: masses.SO2 || 0,
        efficiency: 40,
        stoechioCoef: 1,
      },
      {
        pollutant: 'HCl',
        reactant: 'None',
        mass: masses.HCl || 0,
        efficiency: 40,
        stoechioCoef: 1,
      },
      {
        pollutant: 'HF',
        reactant: 'None',
        mass: masses.HF || 0,
        efficiency: 40,
        stoechioCoef: 1,
      },
    ];
  };

  const [rows, setRows] = useState(getSavedData);

  useEffect(() => {
    localStorage.setItem('FGT_data', JSON.stringify(rows));
  }, [rows]);

  // Nouveau useEffect pour mettre à jour les masses lorsque masses change
  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.pollutant === 'SOx') {
          return { ...row, mass: masses.SO2 || 0 };
        } else if (row.pollutant === 'HCl') {
          return { ...row, mass: masses.HCl || 0 };
        } else if (row.pollutant === 'HF') {
          return { ...row, mass: masses.HF || 0 };
        }
        return row;
      })
    );
  }, [masses.SO2, masses.HCl, masses.HF]);

  // Gestion des modifications
  const handleChange = (index, field, value) => {
    let parsedValue = parseFloat(value) || 0;

    // Limiter les valeurs dans les plages spécifiques
    if (field === 'efficiency') {
      parsedValue = Math.max(0, Math.min(100, parsedValue)); // Efficacité entre 0 et 100
    } else if (field === 'stoechioCoef') {
      parsedValue = Math.max(0, Math.min(10, parsedValue)); // Coeff. Stoechio entre 0 et 10
    }

    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[index] = { ...newRows[index], [field]: parsedValue };
      return newRows;
    });
  };

  const handleSelectChange = (index, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[index] = { ...newRows[index], reactant: value };
      return newRows;
    });
  };

  // Calcul des masses
  const calculateValues = (row) => {
    let R1, R2, R3;

    if (row.reactant !== 'None') {
      R1 = R_1(row.pollutant, row.reactant);
      R2 = R_2(row.pollutant, row.reactant);
      R3 = R_3(row.pollutant, row.reactant);
    } else {
      R1 = 0;
      R2 = 0;
      R3 = 0;
    }

    const mass_reduction = (row.mass * row.efficiency) / 100;
    const mass_reactif_st = mass_reduction * R1;
    const mass_reactif_reel = mass_reactif_st * row.stoechioCoef;
    const mass_residus =
      R2 * (mass_reactif_reel - mass_reactif_st) + R3 * mass_reduction;

    const data = {
      ...row,
      mass_reduction,
      mass_reactif_st,
      mass_reactif_reel,
      mass_residus,
    };

    innerData[row.pollutant] = {
      mass_reduction,
      mass_reactif_st,
      mass_reactif_reel,
      mass_residus,
    };

    return { ...row, mass_reduction, mass_reactif_st, mass_reactif_reel, mass_residus, data };
  };

  const Etat_Hg = innerData.etat_mercury_treatment ;
  const Etat_NOx = innerData.sncr ;
console.log(Etat_Hg)

  const masses_pollutant_output = {
    HCl: innerData.HCl ? masses.HCl - innerData.HCl.mass_reduction : masses.HCl,
    HF: innerData.HF ? masses.HF - innerData.HF.mass_reduction : masses.HF,
    SO2: innerData.SOx ? masses.SO2 - innerData.SOx.mass_reduction : masses.SO2,

    NOx: Etat_NOx === "oui" ? 0 : masses.NOx,
    //NOx: masses.NOx || 0,
    CO2: masses.CO2 || 0,
    NH3: masses.NH3 || 0,

    DustFlyAsh: masses.DustFlyAsh || 0,
    Mercury: Etat_Hg === "oui" ? 0 : masses.mercury ,
    PCDDF: masses.PCDDF || 0,
    Cd_Ti: masses.Cd_Ti || 0,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0,
  };

  innerData['Poutput'] = masses_pollutant_output;

  return (
    <div>
      <h4 style={{ textAlign: 'left', marginBottom: '20px' }}>
        SOx / HCl / HF treatment
      </h4>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ width: '8%' }}>Polluant</th>
            <th style={{ width: '12%' }}>Réactif</th>
            <th style={{ width: '12%' }}>Masse (kg/h)</th>
            <th style={{ width: '10%' }}>Efficacité (%)</th>
            <th style={{ width: '10%' }}>Coeff. Stoechio</th>
            <th style={{ width: '12%' }}>Masse sortie</th>
            <th style={{ width: '12%' }}>Masse résidu</th>
            <th style={{ width: '12%' }}>Masse réactif</th>
            <th style={{ width: '12%' }}>Masse abattue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const calculatedRow = calculateValues(row);

            return (
              <tr key={index}>
                <td>{row.pollutant}</td>
                <td>
                  <select
                    value={row.reactant}
                    onChange={(e) => handleSelectChange(index, e.target.value)}
                    style={{ fontSize: '11px', padding: '2px', width: '100%' }}
                  >
                    {reactants.map((reactant) => (
                      <option key={reactant} value={reactant}>
                        {reactant}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{row.mass.toFixed(3)}</td>
                <td>
                  <input
                    type="number"
                    value={row.efficiency}
                    onChange={(e) =>
                      handleChange(index, 'efficiency', e.target.value)
                    }
                    min="0"
                    max="100"
                    style={{
                      fontSize: '11px',
                      width: '80%',
                      textAlign: 'center',
                      padding: '2px',
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.stoechioCoef}
                    onChange={(e) =>
                      handleChange(index, 'stoechioCoef', e.target.value)
                    }
                    min="0"
                    max="10"
                    step="0.1"
                    style={{
                      fontSize: '11px',
                      width: '80%',
                      textAlign: 'center',
                      padding: '2px',
                    }}
                  />
                </td>
                <td>{(row.mass - calculatedRow.mass_reduction).toFixed(3)}</td>
                <td>{calculatedRow.mass_residus.toFixed(3)}</td>
                <td>{calculatedRow.mass_reactif_reel.toFixed(3)}</td>
                <td>{calculatedRow.mass_reduction.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4>Output flue gas</h4>
      <PollutantCalculator
        masses={masses_pollutant_output}
        O2_mesure={10}
        O2_ref={11}
        Debit_fumees_sec_Nm3_h={59}
      />
    </div>
  );
};

export default FGT;
