import React, { useState, useRef } from 'react';
import PrintButton from '../../C_Components/Windows_print';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './BHF_traduction';

/**
 * BHFComprehensiveReport
 * 
 * Composant qui génère un rapport HTML complet et exportable (PDF/Print)
 * agréggeant tous les paramètres et résultats calculés du BHF
 * 
 * Extensible à d'autres équipements via la structure modulaire
 * 
 * Props:
 *   - innerData: objet contenant toutes les données calculées
 *   - currentLanguage: langue courante ('fr', 'en', etc.)
 *   - equipmentName: nom de l'équipement (default: 'BHF')
 *   - showTableOfContents: afficher la table des matières (default: true)
 */

const BHFComprehensiveReport = ({ 
  innerData, 
  currentLanguage = 'fr',
  equipmentName = 'BHF',
  showTableOfContents = true
}) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const reportRef = useRef(null);

  // ============================================================================
  // SECTION 1: FLUE GAS PARAMETERS
  // ============================================================================

  const FlueGasSection = () => {
    const T_IN = innerData?.T_OUT || 200;
    const P_IN = innerData?.P_OUT || 0;
    const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };
    const FG_humide = innerData?.FG_humide_tot || 0;
    const FG_sec = innerData?.FG_sec_tot || 0;
    const FG_humide_EAU = innerData?.FG_humide_EAU_tot || 0;
    const Q_eau = innerData?.Q_eau_kg_h || 0;
    const T_sortie = innerData?.T_sortie || 0;

    return (
      <section id="flue-gases" className="report-section">
        <h2>{t('1. Flue Gas Parameters')}</h2>
        
        <div className="subsection">
          <h3>{t('Inlet Conditions')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Temperature inlet BHF [°C]')}</td>
                <td className="value">{T_IN.toFixed(1)} °C</td>
              </tr>
              <tr>
                <td className="label">{t('Pressure inlet [mmCE]')}</td>
                <td className="value">{P_IN.toFixed(2)} mmCE</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Inlet Mass Composition [kg/h]')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">CO₂</td>
                <td className="value">{FG_IN.CO2?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">H₂O</td>
                <td className="value">{FG_IN.H2O?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">O₂</td>
                <td className="value">{FG_IN.O2?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">N₂</td>
                <td className="value">{FG_IN.N2?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Outlet Conditions')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Outlet temperature [°C]')}</td>
                <td className="value">{T_sortie.toFixed(1)} °C</td>
              </tr>
              <tr>
                <td className="label">{t('Cooling water [kg/h]')}</td>
                <td className="value">{Q_eau.toFixed(1)} kg/h</td>
              </tr>
              <tr>
                <td className="label">{t('Outlet flue gas volume Wet [Nm3/h]')}</td>
                <td className="value">{FG_humide_EAU.toFixed(2)} Nm³/h</td>
              </tr>
              <tr>
                <td className="label">{t('Outlet flue gas volume Dry [Nm3/h]')}</td>
                <td className="value">{FG_sec.toFixed(2)} Nm³/h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // ============================================================================
  // SECTION 2: POLLUTANT EMISSIONS
  // ============================================================================

  const PollutantSection = () => {
    const massInput = innerData?.PInput || {};
    const massOutput = innerData?.Poutput || {};
    const residus = innerData?.Residus || {};
    const conso = innerData?.Conso_reactifs || {};

    return (
      <section id="pollutants" className="report-section">
        <h2>{t('2. Pollutant Emissions & Treatment')}</h2>

        <div className="subsection">
          <h3>{t('Input Pollutants [kg/h]')}</h3>
          <table className="report-table">
            <tbody>
              {Object.entries(massInput).map(([key, value]) => (
                <tr key={key}>
                  <td className="label">{key}</td>
                  <td className="value">{typeof value === 'number' ? value.toFixed(3) : value} kg/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Output Pollutants [kg/h]')}</h3>
          <table className="report-table">
            <tbody>
              {Object.entries(massOutput).map(([key, value]) => (
                <tr key={key}>
                  <td className="label">{key}</td>
                  <td className="value">{typeof value === 'number' ? value.toFixed(3) : value} kg/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Reagent Consumption [kg/h]')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">CaCO₃</td>
                <td className="value">{conso.CaCO3?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">CaO</td>
                <td className="value">{conso.CaO?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">Ca(OH)₂ wet</td>
                <td className="value">{conso.CaOH2wet?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">Ca(OH)₂ dry</td>
                <td className="value">{conso.CaOH2dry?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">NaOH</td>
                <td className="value">{conso.NaOH?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">NaOHCO₃</td>
                <td className="value">{conso.NaOHCO3?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">CAP</td>
                <td className="value">{conso.CAP?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Residus')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Dry residus [kg/h]')}</td>
                <td className="value">{residus.DryBottomAsh_kg_h?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
              <tr>
                <td className="label">{t('Wet residus [kg/h]')}</td>
                <td className="value">{residus.WetBottomAsh_kg_h?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection highlight">
          <h4>{t('Reactif Costs & Environmental Impact')}</h4>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Reactif Cost [€/h]')}</td>
                <td className="value">{conso.cout?.toFixed(2) || '0.00'} €/h</td>
              </tr>
              <tr>
                <td className="label">{t('CO2 Transport Reactifs [kg/h]')}</td>
                <td className="value">{conso.CO2_transport?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // ============================================================================
  // SECTION 3: EQUIPMENT DESIGN
  // ============================================================================

  const DesignSection = () => {
    return (
      <section id="design" className="report-section">
        <h2>{t('3. Equipment Design')}</h2>

        <div className="subsection">
          <h3>{t('Aeraulic Design')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Pressure inlet [mmCE]')}</td>
                <td className="value">{innerData?.P_OUT?.toFixed(2) || '0.00'} mmCE</td>
              </tr>
              <tr>
                <td className="label">{t('Pressure outlet [mmCE]')}</td>
                <td className="value">{innerData?.P_out_mmCE?.toFixed(2) || '0.00'} mmCE</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Bag Filter Module (FAM)')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Sleeve surface [m²]')}</td>
                <td className="value">{(innerData?.FG_humide_EAU_tot / 60).toFixed(2)} m²</td>
              </tr>
              <tr>
                <td className="label">{t('Collection efficiency [%]')}</td>
                <td className="value">99.9%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Compressed Air System')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Consumption [Nm³/h]')}</td>
                <td className="value">{innerData?.conso_air_co_N_m3?.toFixed(2) || '0.00'} Nm³/h</td>
              </tr>
              <tr>
                <td className="label">{t('Pressure [Bar]')}</td>
                <td className="value">{innerData?.pression_air_comprime_bar?.toFixed(1) || '0.0'} bar</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Ash Evacuation')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Residus [kg/h]')}</td>
                <td className="value">{innerData?.conso_fly_ash_kg_h?.toFixed(2) || '0.00'} kg/h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // ============================================================================
  // SECTION 4: ELECTRICAL CONSUMPTION
  // ============================================================================

  const ElectricalSection = () => {
    const elec1 = innerData?.consoElec1 || 0;
    const elec2 = innerData?.consoElec2 || 0;
    const totalElec = elec1 + elec2;

    return (
      <section id="electrical" className="report-section">
        <h2>{t('4. Electrical Consumption')}</h2>

        <div className="subsection">
          <h3>{t('Power Consumption Components')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Transport screw [kW]')}</td>
                <td className="value">{elec1.toFixed(2)} kW</td>
              </tr>
              <tr>
                <td className="label">{t('Compressed air [kW]')}</td>
                <td className="value">{elec2.toFixed(2)} kW</td>
              </tr>
              <tr className="highlight-row">
                <td className="label"><strong>{t('Total Electrical [kW]')}</strong></td>
                <td className="value"><strong>{totalElec.toFixed(2)} kW</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <p className="info-text">
            {t('Annual consumption estimate')}: {(totalElec * 8760).toFixed(0)} kWh/year
            ({(totalElec * 8760 * 0.05).toFixed(0)} € at 0.05€/kWh)
          </p>
        </div>
      </section>
    );
  };

  // ============================================================================
  // SECTION 5: ENVIRONMENTAL & ECONOMIC IMPACT
  // ============================================================================

  const ImpactSection = () => {
    const CO2_reactifs = innerData?.Conso_reactifs?.CO2_transport || 0;
    const CO2_transport = innerData?.CO2_transport_fly_ash || 0;
    const cout_transport = innerData?.cout_transport_fly_ash || 0;
    const cout_reactifs = innerData?.Conso_reactifs?.cout || 0;

    return (
      <section id="impact" className="report-section">
        <h2>{t('5. Environmental & Economic Impact')}</h2>

        <div className="subsection">
          <h3>{t('CO2 Emissions')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Reactif transport [kg/h]')}</td>
                <td className="value">{CO2_reactifs.toFixed(2)} kg CO₂/h</td>
              </tr>
              <tr>
                <td className="label">{t('Ash transport [kg]')}</td>
                <td className="value">{CO2_transport.toFixed(2)} kg CO₂</td>
              </tr>
              <tr className="highlight-row">
                <td className="label"><strong>{t('Total CO2 [kg]')}</strong></td>
                <td className="value"><strong>{(CO2_reactifs + CO2_transport).toFixed(2)} kg CO₂</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="subsection">
          <h3>{t('Operating Costs')}</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="label">{t('Reactif [€/h]')}</td>
                <td className="value">{cout_reactifs.toFixed(2)} €/h</td>
              </tr>
              <tr>
                <td className="label">{t('Transport [€]')}</td>
                <td className="value">{cout_transport.toFixed(2)} €</td>
              </tr>
              <tr className="highlight-row">
                <td className="label"><strong>{t('Total OPEX [€/h]')}</strong></td>
                <td className="value"><strong>{(cout_reactifs + cout_transport/24).toFixed(2)} €/h</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // ============================================================================
  // TABLE OF CONTENTS
  // ============================================================================

  const TableOfContents = () => {
    return (
      <div className="toc-container">
        <h2>{t('Table of Contents')}</h2>
        <ul className="toc-list">
          <li><a href="#flue-gases">{t('1. Flue Gas Parameters')}</a></li>
          <li><a href="#pollutants">{t('2. Pollutant Emissions & Treatment')}</a></li>
          <li><a href="#design">{t('3. Equipment Design')}</a></li>
          <li><a href="#electrical">{t('4. Electrical Consumption')}</a></li>
          <li><a href="#impact">{t('5. Environmental & Economic Impact')}</a></li>
        </ul>
      </div>
    );
  };

  // ============================================================================
  // STYLES
  // ============================================================================

  const reportStyles = `
    .report-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .report-header {
      text-align: center;
      border-bottom: 3px solid #4a90e2;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    .report-header h1 {
      font-size: 2.5em;
      color: #2c3e50;
      margin: 0 0 10px 0;
    }

    .report-header p {
      font-size: 1.1em;
      color: #666;
      margin: 5px 0;
    }

    .report-timestamp {
      font-size: 0.9em;
      color: #999;
      margin-top: 10px;
    }

    .toc-container {
      background: #f0f4f8;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 40px;
      page-break-after: always;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-list li {
      padding: 8px 0 8px 20px;
      border-left: 3px solid #4a90e2;
      margin-bottom: 10px;
    }

    .toc-list a {
      color: #4a90e2;
      text-decoration: none;
      font-weight: 500;
    }

    .toc-list a:hover {
      text-decoration: underline;
    }

    .report-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .report-section h2 {
      font-size: 1.8em;
      color: #2c3e50;
      border-left: 5px solid #4a90e2;
      padding-left: 15px;
      margin-bottom: 25px;
      margin-top: 30px;
    }

    .subsection {
      margin-bottom: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
    }

    .subsection.highlight {
      background: #e8f4f8;
      border-left: 4px solid #4a90e2;
    }

    .subsection h3 {
      font-size: 1.3em;
      color: #34495e;
      margin-top: 0;
      margin-bottom: 15px;
    }

    .subsection h4 {
      font-size: 1.1em;
      color: #555;
      margin-top: 0;
      margin-bottom: 12px;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .report-table tr {
      border-bottom: 1px solid #ddd;
    }

    .report-table tr:hover {
      background: #f5f5f5;
    }

    .report-table tr.highlight-row {
      background: #e8f4f8;
      font-weight: bold;
    }

    .report-table td {
      padding: 12px 15px;
    }

    .report-table td.label {
      font-weight: 600;
      color: #2c3e50;
      width: 60%;
      text-align: left;
    }

    .report-table td.value {
      color: #4a90e2;
      text-align: right;
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    .info-text {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 15px;
      border-radius: 4px;
      margin: 15px 0;
      font-size: 0.95em;
    }

    .report-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 0.9em;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .report-container {
        padding: 20px;
        max-width: 100%;
      }
      .toc-container {
        page-break-after: always;
      }
      .report-section {
        page-break-inside: avoid;
      }
      a {
        color: #4a90e2;
        text-decoration: underline;
      }
    }

    @media screen and (max-width: 768px) {
      .report-container {
        padding: 20px;
      }
      .report-section h2 {
        font-size: 1.4em;
      }
      .report-table td {
        padding: 8px 10px;
      }
      .report-table td.label {
        width: auto;
      }
    }
  `;

  return (
    <div ref={reportRef}>
      <style>{reportStyles}</style>
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <h1>{equipmentName} - {t('Comprehensive Report')}</h1>
          <p>{t('Complete Technical & Economic Analysis')}</p>
          <div className="report-timestamp">
            {t('Generated on')} {new Date().toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US')} 
            {' '} {t('at')} {new Date().toLocaleTimeString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US')}
          </div>
        </div>

        {/* Table of Contents */}
        {showTableOfContents && <TableOfContents />}

        {/* Content Sections */}
        <FlueGasSection />
        <PollutantSection />
        <DesignSection />
        <ElectricalSection />
        <ImpactSection />

        {/* Footer */}
        <div className="report-footer">
          <p>{equipmentName} Report - {t('All values are calculated based on input parameters')}</p>
          <PrintButton />
        </div>
      </div>
    </div>
  );
};

export default BHFComprehensiveReport;