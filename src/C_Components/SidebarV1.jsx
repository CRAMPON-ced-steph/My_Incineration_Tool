import React, { useState } from 'react';
import { getSidebarTranslations } from './SidebarV1_traduction';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';

const Sidebar = ({ onAddNode, currentLanguage = 'fr' }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = getSidebarTranslations(languageCode);

  const sidebarStyle = {
    container: {
      width: '180px',
      borderRight: '1px solid #ddd',
      padding: '10px',
      overflowY: 'auto',
      maxHeight: '100vh',
    },
    section: {
      marginBottom: '15px',
    },
    title: {
      cursor: 'pointer',
      margin: '10px 0 5px 0',
      fontSize: '14px',
      fontWeight: 'bold',
      userSelect: 'none',
      padding: '5px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      paddingLeft: '5px',
    },
    button: {
      padding: '6px 8px',
      fontSize: '12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#f5f5f5',
      transition: 'all 0.2s',
    },
  };

  const SectionComponent = ({ sectionKey, title, items, nodeColor = '#f5f5f5', nodeHoverColor = '#e8e8e8', nodeTextColor = '#000' }) => (
    <div style={sidebarStyle.section}>
      <h3
        onClick={() => toggleSection(sectionKey)}
        style={{
          ...sidebarStyle.title,
          backgroundColor: openSection === sectionKey ? '#e8f4f8' : 'transparent',
        }}
      >
        {title}
      </h3>
      {openSection === sectionKey && (
        <div style={sidebarStyle.buttonContainer}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddNode(item.id)}
              style={{ ...sidebarStyle.button, backgroundColor: nodeColor, color: nodeTextColor }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = nodeHoverColor; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = nodeColor; }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const sections = [
    {
      key: 'Furnace',
      title: t.furnace,
      nodeColor: '#e53935',
      nodeHoverColor: '#b71c1c',
      nodeTextColor: '#fff',
      items: [
        { id: 'RK+SCC', label: t.addRotaryKiln },
        { id: 'GF', label: t.addGrateFurnace },
        { id: 'FB', label: t.addFluidizedBed },
      ],
    },
    {
      key: 'Energy_recovery',
      title: t.energyRecovery,
      nodeColor: '#fb8c00',
      nodeHoverColor: '#e65100',
      nodeTextColor: '#fff',
      items: [
        { id: 'WHB', label: t.addWasteHeatBoiler },
        { id: 'HX_TubeAndShell', label: t.TubeAndShell },
        { id: 'IACT', label: t.addIACT },
      ],
    },
    {
      key: 'Dry_treatment',
      title: t.dryTreatment,
      nodeColor: '#757575',
      nodeHoverColor: '#9e9e9e',
      nodeTextColor: '#fff',
      items: [
        { id: 'BHF', label: t.addBHF },
        { id: 'ELECTROFILTER', label: t.addElectrofilter },
        { id: 'CYCLONE', label: t.addCyclone },
        { id: 'REACTOR', label: t.addReactor },
        { id: 'AIRINJECTION', label: t.addAIRINJECTION },
      ],
    },
    {
      key: 'Wet_treatment',
      title: t.wetTreatment,
      nodeColor: '#1e88e5',
      nodeHoverColor: '#0d47a1',
      nodeTextColor: '#fff',
      items: [
        { id: 'QUENCH', label: t.addQuench },
        { id: 'WATER_INJECTION', label: t.addWATER_INJECTION },
        { id: 'COOLINGTOWER', label: t.addCoolingTower },
        { id: 'DENOX', label: t.addDenoxCatalyst },
        { id: 'SCRUBBER', label: t.addScrubber },
      ],
    },
    {
      key: 'Exit',
      title: t.exit,
      items: [
        { id: 'IDFAN', label: t.addIDFan },
        { id: 'STACK', label: t.addStack },
        { id: 'CO2', label: t.addCO2Capture },
      ],
    },
    {
      key: 'Echangeurs',
      title: t.Echangeurs,
      nodeColor: '#ffcdd2',
      nodeHoverColor: '#ef9a9a',
      items: [
        { id: 'Cooling_HX_air', label: t.Cooling_HX_air },
        { id: 'Cooling_HX_eau', label: t.Cooling_HX_eau },
      ],
    },
    {
      key: 'DivConv',
      title: t.DivConv,
      items: [
        { id: '2to1', label: t.twotoone },
        { id: '1to2', label: t.onetotwo },
      ],
    },
  ];

  return (
    <div style={sidebarStyle.container}>
      {sections.map((section) => (
        <SectionComponent
          key={section.key}
          sectionKey={section.key}
          title={section.title}
          items={section.items}
          nodeColor={section.nodeColor}
          nodeHoverColor={section.nodeHoverColor}
          nodeTextColor={section.nodeTextColor}
        />
      ))}
    </div>
  );
};

export default Sidebar;