import React, { useState, useRef } from 'react';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';

/**
 * GlobalProcessReport
 * 
 * Composant qui agrège les rapports de plusieurs équipements
 * et génère un rapport global synthétique
 * 
 * Props:
 *   - equipments: array d'objets {name, data, type}
 *   - currentLanguage: langue courante
 *   - processName: nom du processus global
 *   - showSummary: afficher la page de résumé
 */

const GlobalProcessReport = ({ 
  equipments = [], 
  currentLanguage = 'fr',
  processName = 'Sludge Treatment Process',
  showSummary = true
}) => {
  const languageCode = getLanguageCode(currentLanguage);
  const reportRef = useRef(null);

  // ============================================================================
  // CALCULATION FUNCTIONS FOR GLOBAL SUMMARIES
  // ============================================================================

  const calculateGlobalMetrics = () => {
    let totals = {
      waterConsumption: 0,
      electricityConsumption: 0,
      co2Emissions: 0,
      operatingCosts: 0,
      residueProduction: 0,
      airVolume: 0,
      pollutantInput: {},
      pollutantOutput: {},
    };

    equipments.forEach(eq => {
      const data = eq.data;
      
      // Water
      totals.waterConsumption += data?.Q_eau_kg_h || 0;
      
      // Electricity
      totals.electricityConsumption += (data?.consoElec1 || 0) + (data?.consoElec2 || 0);
      
      // CO2
      totals.co2Emissions += (data?.Conso_reactifs?.CO2_transport || 0) + (data?.CO2_transport_fly_ash || 0);
      
      // Costs
      totals.operatingCosts += (data?.Conso_reactifs?.cout || 0) + (data?.cout_transport_fly_ash || 0);
      
      // Residues
      totals.residueProduction += data?.Residus?.WetBottomAsh_kg_h || 0;
      
      // Air volumes
      totals.airVolume += data?.FG_humide_EAU_tot || 0;
      
      // Pollutants
      if (data?.PInput) {
        Object.entries(data.PInput).forEach(([key, value]) => {
          totals.pollutantInput[key] = (totals.pollutantInput[key] || 0) + (value || 0);
        });
      }
      if (data?.Poutput) {
        Object.entries(data.Poutput).forEach(([key, value]) => {
          totals.pollutantOutput[key] = (totals.pollutantOutput[key] || 0) + (value || 0);
        });
      }
    });

    return totals;
  };

  const globalMetrics = calculateGlobalMetrics();

  // ============================================================================
  // STYLES
  // ============================================================================

  const reportStyles = `
    * {
      box-sizing: border-box;
    }

    .global-report-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .global-report-header {
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 50px 30px;
      border-radius: 10px;
      margin-bottom: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .global-report-header h1 {
      font-size: 3em;
      margin: 0 0 15px 0;
      font-weight: 700;
    }

    .global-report-header p {
      font-size: 1.2em;
      margin: 8px 0;
      opacity: 0.95;
    }

    .timestamp {
      font-size: 0.9em;
      opacity: 0.85;
      margin-top: 15px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 50px;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
    }

    .metric-label {
      font-size: 0.95em;
      opacity: 0.9;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .metric-value {
      font-size: 2.2em;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .metric-unit {
      font-size: 0.85em;
      opacity: 0.85;
      margin-top: 5px;
    }

    .equipment-section {
      page-break-inside: avoid;
      margin-bottom: 40px;
      background: #f9f9f9;
      border-left: 5px solid #667eea;
      padding: 25px;
      border-radius: 8px;
    }

    .equipment-section h2 {
      color: #667eea;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.6em;
    }

    .equipment-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      margin: 15px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .equipment-table th {
      background: #667eea;
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
    }

    .equipment-table td {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }

    .equipment-table tr:hover {
      background: #f5f5f5;
    }

    .equipment-table .label {
      font-weight: 600;
      color: #2c3e50;
      width: 50%;
    }

    .equipment-table .value {
      color: #667eea;
      font-family: 'Courier New', monospace;
      text-align: right;
      font-weight: 500;
    }

    .comparison-chart {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .chart-bar {
      display: flex;
      align-items: center;
      margin: 12px 0;
    }

    .chart-label {
      width: 150px;
      font-weight: 600;
      font-size: 0.9em;
      color: #333;
    }

    .chart-bar-container {
      flex: 1;
      background: #eee;
      height: 30px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .chart-bar-fill {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      transition: width 0.4s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      color: white;
      font-weight: 600;
      font-size: 0.85em;
    }

    .pollutant-reduction {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .pollutant-reduction h3 {
      margin-top: 0;
      color: #2d5016;
    }

    .reduction-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.3);
    }

    .reduction-item:last-child {
      border-bottom: none;
    }

    .reduction-label {
      font-weight: 600;
      color: #2d5016;
    }

    .reduction-value {
      color: #0d6623;
      font-weight: 700;
    }

    .legend-box {
      background: #f0f4f8;
      padding: 15px;
      border-left: 4px solid #667eea;
      margin: 15px 0;
      border-radius: 4px;
      font-size: 0.9em;
      line-height: 1.5;
    }

    .toc {
      background: #f0f4f8;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 40px;
      page-break-after: always;
    }

    .toc h2 {
      margin-top: 0;
      color: #667eea;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-list li {
      padding: 8px 0 8px 20px;
      border-left: 3px solid #667eea;
      margin-bottom: 10px;
    }

    .toc-list a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .toc-list a:hover {
      text-decoration: underline;
    }

    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 0.85em;
      page-break-before: always;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .global-report-container {
        padding: 20px;
        max-width: 100%;
      }
      .toc {
        page-break-after: always;
      }
      .equipment-section {
        page-break-inside: avoid;
      }
      .metric-card {
        page-break-inside: avoid;
      }
      a {
        color: #667eea;
        text-decoration: underline;
      }
    }

    @media screen and (max-width: 768px) {
      .global-report-container {
        padding: 20px;
      }
      .global-report-header h1 {
        font-size: 2em;
      }
      .summary-grid {
        grid-template-columns: 1fr;
      }
      .metric-value {
        font-size: 1.8em;
      }
    }
  `;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={reportRef}>
      <style>{reportStyles}</style>
      <div className="global-report-container">
        
        {/* Header */}
        <div className="global-report-header">
          <h1>{processName}</h1>
          <p>Global Process Report</p>
          <p style={{ fontSize: '1em', marginTop: '20px' }}>
            {equipments.length} equipment(s) configured and analyzed
          </p>
          <div className="timestamp">
            Generated on {new Date().toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US')} 
            {' '} at {new Date().toLocaleTimeString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US')}
          </div>
        </div>

        {/* Summary Metrics */}
        {showSummary && (
          <>
            <h2 style={{ fontSize: '2em', color: '#667eea', textAlign: 'center', marginBottom: '40px' }}>
              Key Performance Indicators
            </h2>
            <div className="summary-grid">
              <div className="metric-card">
                <div className="metric-label">Total Electrical Consumption</div>
                <div className="metric-value">{globalMetrics.electricityConsumption.toFixed(1)}</div>
                <div className="metric-unit">kW</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Annual Power Consumption</div>
                <div className="metric-value">{(globalMetrics.electricityConsumption * 8760).toFixed(0)}</div>
                <div className="metric-unit">kWh/year</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total CO₂ Emissions</div>
                <div className="metric-value">{globalMetrics.co2Emissions.toFixed(2)}</div>
                <div className="metric-unit">kg CO₂/h</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Water Consumption</div>
                <div className="metric-value">{globalMetrics.waterConsumption.toFixed(1)}</div>
                <div className="metric-unit">kg/h</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Residue Production</div>
                <div className="metric-value">{globalMetrics.residueProduction.toFixed(1)}</div>
                <div className="metric-unit">kg/h</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Operating Costs</div>
                <div className="metric-value">{globalMetrics.operatingCosts.toFixed(2)}</div>
                <div className="metric-unit">€/h</div>
              </div>
            </div>
          </>
        )}

        {/* Equipment Details */}
        <h2 style={{ fontSize: '2em', color: '#667eea', marginBottom: '30px', marginTop: '50px' }}>
          Equipment Breakdown
        </h2>

        {equipments.map((eq, index) => {
          const data = eq.data;
          return (
            <div key={index} className="equipment-section">
              <h2>{eq.name || `Equipment ${index + 1}`}</h2>
              
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="label">Type</td>
                    <td className="value">{eq.type || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td className="label">Outlet Temperature</td>
                    <td className="value">{(data?.T_sortie || 0).toFixed(1)} °C</td>
                  </tr>
                  <tr>
                    <td className="label">Flue Gas Volume (wet)</td>
                    <td className="value">{(data?.FG_humide_EAU_tot || 0).toFixed(2)} Nm³/h</td>
                  </tr>
                  <tr>
                    <td className="label">Water Consumption</td>
                    <td className="value">{(data?.Q_eau_kg_h || 0).toFixed(1)} kg/h</td>
                  </tr>
                  <tr>
                    <td className="label">Electrical Power</td>
                    <td className="value">{((data?.consoElec1 || 0) + (data?.consoElec2 || 0)).toFixed(2)} kW</td>
                  </tr>
                  <tr>
                    <td className="label">Residue (wet)</td>
                    <td className="value">{(data?.Residus?.WetBottomAsh_kg_h || 0).toFixed(2)} kg/h</td>
                  </tr>
                  <tr>
                    <td className="label">CO₂ Emissions</td>
                    <td className="value">{((data?.Conso_reactifs?.CO2_transport || 0) + (data?.CO2_transport_fly_ash || 0)).toFixed(2)} kg/h</td>
                  </tr>
                  <tr>
                    <td className="label">Operating Cost</td>
                    <td className="value">{((data?.Conso_reactifs?.cout || 0) + (data?.cout_transport_fly_ash || 0) / 24).toFixed(2)} €/h</td>
                  </tr>
                </tbody>
              </table>

              {/* Pollutant Reduction */}
              {data?.PInput && data?.Poutput && (
                <div className="pollutant-reduction">
                  <h3>Pollutant Treatment Summary</h3>
                  {['HCl', 'SO2', 'HF'].map(pollutant => {
                    const input = data.PInput[pollutant] || 0;
                    const output = data.Poutput[pollutant] || 0;
                    const reduction = input - output;
                    const percent = input > 0 ? (reduction / input * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={pollutant} className="reduction-item">
                        <span className="reduction-label">{pollutant}</span>
                        <span>
                          <span className="reduction-value">{percent}%</span>
                          {' '}reduction ({reduction.toFixed(3)} kg/h)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Global Comparison */}
        <div className="equipment-section" style={{ marginTop: '40px' }}>
          <h2>Global Pollutant Balance</h2>
          
          <div className="comparison-chart">
            <h3>Input vs Output Pollutants</h3>
            {Object.entries(globalMetrics.pollutantInput).map(([pollutant, inputValue]) => {
              const outputValue = globalMetrics.pollutantOutput[pollutant] || 0;
              const reduction = inputValue - outputValue;
              const maxValue = Math.max(inputValue, outputValue, 1);
              const inputPercent = (inputValue / maxValue) * 100;
              const outputPercent = (outputValue / maxValue) * 100;

              if (inputValue > 0) {
                return (
                  <div key={pollutant} style={{ marginBottom: '30px' }}>
                    <div style={{ marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      {pollutant}
                    </div>
                    <div className="chart-bar">
                      <div className="chart-label">Input</div>
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${inputPercent}%`, background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%)' }}
                        >
                          {inputValue.toFixed(3)} kg/h
                        </div>
                      </div>
                    </div>
                    <div className="chart-bar">
                      <div className="chart-label">Output</div>
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${outputPercent}%`, background: 'linear-gradient(90deg, #51cf66 0%, #37b24d 100%)' }}
                        >
                          {outputValue.toFixed(3)} kg/h
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                      Reduction: <strong>{reduction.toFixed(3)} kg/h</strong>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Legend & Notes */}
        <div className="legend-box">
          <strong>Notes & Definitions:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>All flow rates are expressed in operational conditions (temperature and pressure dependent)</li>
            <li>Electrical consumption includes all auxiliary systems (fans, compressors, conveyors)</li>
            <li>CO₂ emissions account for reactant transport and waste evacuation</li>
            <li>Operating costs are estimated on an hourly basis</li>
            <li>Pollutant reduction percentages are calculated based on treatment efficiency</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="footer">
          <p><strong>{processName} - Global Report</strong></p>
          <p>This report aggregates data from {equipments.length} equipment(s) and represents the complete process analysis.</p>
          <p style={{ marginTop: '20px', fontSize: '0.8em' }}>
            Report generated automatically - All calculations based on input parameters and treatment efficiency settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalProcessReport;