import React from "react";

const CalculationResults = ({ isOpen, results }) => {
  if (!isOpen || !results) return null;

  const formatNumber = (num) => (typeof num === "number" ? Number(num.toFixed(2)) : num);

  const formatResults = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = typeof value === "object" && value !== null ? formatResults(value) : formatNumber(value);
      return acc;
    }, {});
  };

  const formattedResults = formatResults(results);

  // Définition des clés à surligner avec leurs couleurs respectives
  const highlightConfig = {
    H_tot_kW: "#FFA07A",        // Saumon
    Qm_tot_kg_h: "#98FB98",     // Vert pâle
    Qv_wet_Nm3_h: "#87CEEB",    // Bleu ciel
    Qv_sec_Nm3_h: "#DDA0DD"     // Violet clair
  };

  const renderResults = (obj, isNested = false) => {
    return Object.entries(obj).map(([key, value], index) => {
      if (typeof value === "object" && value !== null) {
        return (
          <React.Fragment key={key}>
            {index !== 0 && <tr><td colSpan="2" style={{ paddingTop: "5px", borderTop: "1px solid #ccc" }}></td></tr>}
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold", paddingTop: "5px", fontSize: "12px" }}>{key}</td>
            </tr>
            {renderResults(value, true)}
          </React.Fragment>
        );
      }
      return (
        <tr 
          key={key} 
          style={highlightConfig[key] ? { backgroundColor: highlightConfig[key] } : {}}
        >
          <td style={{ padding: "3px", fontWeight: isNested ? "normal" : "bold", fontSize: "12px" }}>{key}</td>
          <td style={{ padding: "3px", textAlign: "right", fontSize: "12px" }}>{value}</td>
        </tr>
      );
    });
  };

  return (
    <div style={{ marginTop: 15, background: "#f8f8f8", padding: 8, borderRadius: 4 }}>
      <h4 style={{ fontSize: "14px", marginBottom: 5 }}>Calculation Results</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ background: "#e0e0e0" }}>
            <th style={{ textAlign: "left", padding: "5px", fontSize: "12px" }}>Parameter</th>
            <th style={{ textAlign: "right", padding: "5px", fontSize: "12px" }}>Value</th>
          </tr>
        </thead>
        <tbody>{renderResults(formattedResults)}</tbody>
      </table>
    </div>
  );
};

export default CalculationResults;