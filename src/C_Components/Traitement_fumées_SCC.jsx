import React, { useState, useEffect } from "react";
import { molarMasses } from "../A_Transverse_fonction/constantes";

const SCC_NOxAndMercuryCalculator = ({ masses, Debit_fumees_sec_Nm3_h,innerData }) => {
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

  return (
    <div >

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
      </div>
 
  );
};

export default SCC_NOxAndMercuryCalculator;
