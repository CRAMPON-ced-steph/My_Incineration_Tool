import React, { useState, useEffect } from 'react';
import PollutantCalculator from '../C_Components/Tableau_polluants';
import { R_1, R_2, R_3 } from '../A_Transverse_fonction/FGT_fct';
import TableGeneric from '../C_Components/Tableau_generique';

const FGT = ({ masses, innerData,Debit_fumees_sec_Nm3_h,  O2_mesure,O2_ref }) => {

  const parseStoredValue = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };

  const [sncr, setSncr] = useState(parseStoredValue("sncr", "non"));
  const [noxTarget, setNoxTarget] = useState(parseStoredValue("noxTarget", 150));
  const [coefStoechio, setCoefStoechio] = useState(parseStoredValue("coefStoechio", 1.2));
  const [mercuryTreatment, setMercuryTreatment] = useState(parseStoredValue("mercuryTreatment", "non"));
  const [brHgRatio, setBrHgRatio] = useState(parseStoredValue("brHgRatio", 400));

  const [ammoniaConsumption, setAmmoniaConsumption] = useState(0);
  const [bromideConsumption, setBromideConsumption] = useState(0);

  useEffect(() => {
    calculateConsumptions();
  }, [sncr, noxTarget, coefStoechio, mercuryTreatment, brHgRatio, masses, Debit_fumees_sec_Nm3_h]);

  useEffect(() => {
    localStorage.setItem("sncr", JSON.stringify(sncr));
    localStorage.setItem("noxTarget", JSON.stringify(noxTarget));
    localStorage.setItem("coefStoechio", JSON.stringify(coefStoechio));
    localStorage.setItem("mercuryTreatment", JSON.stringify(mercuryTreatment));
    localStorage.setItem("brHgRatio", JSON.stringify(brHgRatio));
  }, [sncr, noxTarget, coefStoechio, mercuryTreatment, brHgRatio]);

  const calculateConsumptions = () => {
    const noxInitial = parseFloat(masses.NOx) * 1e6 /Debit_fumees_sec_Nm3_h || 0;

    if (sncr === "oui") {
      const noxReduction = (noxInitial - noxTarget) * Debit_fumees_sec_Nm3_h / 1e6;
      const ammoniaConsumptionValue = coefStoechio * Math.max(noxReduction, 0);
      setAmmoniaConsumption(ammoniaConsumptionValue);
    } else {
      setAmmoniaConsumption(0);
    }

    if (mercuryTreatment === "oui") {
      const mercuryMass = parseFloat(masses.Mercury) || 0;
      const bromideConsumptionValue = mercuryMass * brHgRatio ;//* (molarMasses.NaBr / molarMasses.Hg);
      setBromideConsumption(bromideConsumptionValue);
    } else {
      const mercuryMass =0;
      const bromideConsumptionValue =0;
      setBromideConsumption(bromideConsumptionValue);
    }
  };

  innerData['etat_mercury_treatment'] = mercuryTreatment ;
  innerData['etat_NOx_treatment'] = sncr ;

  const tableStyle = {
    borderCollapse: "collapse",
    marginBottom: "20px",
    width: "100%",
    fontSize: "11px",
  };

  const cellStyle = {
    padding: "8px",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    fontSize: "inherit",
    textAlign: "center",
  };

 
 
 
 
 
 
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
  let mass_residus_tot = 0; // Déclaration de la variable globale

  const calculateValues = (row) => {
    let R1, R2, R3;
  
    if (row.reactant !== 'None') {
      R1 = R_1(row.pollutant, row.reactant);
      R2 = R_2(row.pollutant, row.reactant);
      R3 = R_3(row.pollutant, row.reactant);
    } else {
      R1 = R2 = R3 = 0;
    }
  
    const mass_reduction = (row.mass * row.efficiency) / 100;
    const mass_reactif_st = mass_reduction * R1;
    const mass_reactif_reel = mass_reactif_st * row.stoechioCoef;
    const mass_residus =
      R2 * (mass_reactif_reel - mass_reactif_st) + R3 * mass_reduction;
  
    // Ajouter la masse de résidus de cette ligne au total
    mass_residus_tot += mass_residus;
  



    innerData[row.pollutant] = {
      mass_reduction,
      mass_reactif_st,
      mass_reactif_reel,
      mass_residus,
    };
  
    return { 
      ...row, 
      mass_reduction, 
      mass_reactif_st, 
      mass_reactif_reel, 
      mass_residus
    };
  };

// Calcul de MMM après avoir traité toutes les lignes
//const calculateMMM = () => {
  const HCl = innerData.HCl || { mass_residus: 0 };
  const HF = innerData.HF || { mass_residus: 0 };
  const Cl = innerData.Cl || { mass_residus: 0 };

  const Residus_tot = HCl.mass_residus + HF.mass_residus + Cl.mass_residus;
  


  const masses_pollutant_output = {
    HCl: innerData.HCl ? masses.HCl - innerData.HCl.mass_reduction : masses.HCl,
    HF: innerData.HF ? masses.HF - innerData.HF.mass_reduction : masses.HF,
    SO2: innerData.SOx ? masses.SO2 - innerData.SOx.mass_reduction : masses.SO2,
    N2 : masses.N2,
    NOx: sncr === "oui" ? (noxTarget*Debit_fumees_sec_Nm3_h)/1e6 : masses.NOx,
    //NOx: masses.NOx || 0,
    CO2: masses.CO2 || 0,
    NH3: masses.NH3 || 0,
    DustFlyAsh: masses.DustFlyAsh || 0,
    Mercury: mercuryTreatment === "oui" ? 0 :masses.Mercury ,
    PCDDF: masses.PCDDF || 0,
    Cd_Ti: masses.Cd_Ti || 0,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V:  Residus_tot,//masses.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0,
  };

  masses_pollutant_output.Cl = masses_pollutant_output.HCl * 35 / 36;
  masses_pollutant_output.S = masses_pollutant_output.SO2 / 2;



  //innerData['REFIDIS'] = Residus_tot;
  innerData['Poutput'] = masses_pollutant_output;


  const residusCalculations = [
    { text: 'Residues [kg/h]', value: Residus_tot },

  
  ];







  return (
    
    <div>

<h2 style={{ fontSize: "16px", textAlign: "left" }}>NOx and Mercury Treatment</h2>

{/* Table for SNCR */}
<table style={tableStyle}>
  <colgroup>
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
  </colgroup>
  <tbody>
    <tr>
      <td style={headerCellStyle}>SNCR</td>
      <td style={headerCellStyle}>NOx OUT [mg/Nm3]</td>
      <td style={headerCellStyle}>Coeff stoechio</td>
      <td style={headerCellStyle}>Ammonia consumption [kg/h]</td>
    </tr>
    <tr>
      <td style={cellStyle}>
        <select value={sncr} onChange={(e) => setSncr(e.target.value)} style={inputStyle}>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </select>
      </td>
      <td style={cellStyle}>
        <input
          type="number"
          value={noxTarget}
          onChange={(e) => setNoxTarget(parseFloat(e.target.value) || 150)}
          style={inputStyle}
          min={0}
        />
      </td>
      <td style={cellStyle}>
        <input
          type="number"
          value={coefStoechio}
          onChange={(e) => setCoefStoechio(parseFloat(e.target.value) || 1.2)}
          style={inputStyle}
          min={0}
        />
      </td>
      <td style={cellStyle}>{ammoniaConsumption.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

{/* Table for Mercury */}
<table style={tableStyle}>
  <colgroup>
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
  </colgroup>
  <tbody>
    <tr>
      <td style={headerCellStyle}>Traitement Hg</td>
      <td style={headerCellStyle}>Ratio Br/Hg</td>
      <td style={headerCellStyle}>Masse mercure [kg/h]</td>
      <td style={headerCellStyle}>NaBr/CaBr2 [kg/h]</td>
    </tr>
    <tr>
      <td style={cellStyle}>
        <select
          value={mercuryTreatment}
          onChange={(e) => setMercuryTreatment(e.target.value)}
          style={inputStyle}
        >
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </select>
      </td>
      <td style={cellStyle}>
        <input
          type="number"
          value={brHgRatio}
          onChange={(e) => setBrHgRatio(parseFloat(e.target.value) || 400)}
          style={inputStyle}
          min={0}
        />
      </td>
      <td style={cellStyle}>{masses.Mercury.toFixed(2)}</td>
      <td style={cellStyle}>{bromideConsumption.toFixed(2)}</td>
    </tr>
  </tbody>
</table>







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
        O2_mesure={O2_mesure}
        O2_ref={O2_ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />
  


<h3>Residues calculated</h3>
        <TableGeneric elements={residusCalculations} />

        </div>
  );
};

export default FGT;











