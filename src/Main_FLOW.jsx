/* eslint-disable react/prop-types */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {ReactFlow, Controls, Background, Panel, useNodesState, useEdgesState, addEdge, getIncomers, getOutgoers, getConnectedEdges, useReactFlow} from '@xyflow/react';
import { Eraser } from './C_Components/EraserTool/Eraser';
import '@xyflow/react/dist/style.css';
import DropdownMenu from './C_Components/MenuDeroulant';
import { takeScreenshot } from './H_SaveAndLoad/screenshotUtils';
import Toggle10choice from './F_Gestion_Langues/togglechoice';

import {
  STACK_Parameter_Tab, IDFAN_Parameter_Tab, QUENCH_Parameter_Tab, WHB_Parameter_Tab,
  DENOX_Parameter_Tab, BHF_Parameter_Tab, IACT_Parameter_Tab, COOLINGTOWER_Parameter_Tab, ELECTROFILTER_Parameter_Tab,
  CYCLONE_Parameter_Tab, AIRINJECTION_Parameter_Tab, REACTOR_Parameter_Tab, RK_Parameter_Tab, SCRUBBER_Parameter_Tab,
  CO2_Parameter_Tab, GF_Parameter_Tab, FB_Parameter_Tab, WATER_INJECTION_Parameter_Tab,
  RKMainPage, FBMainPage, WHBMainPage,
  CO2MainPage, QUENCHMainPage, CYCLONEMainPage, AIRINJECTIONMainPage, BHFMainPage, IACTMainPage, ELECTROFILTERMainPage,
  REACTORMainPage, DENOXMainPage, STACKMainPage, SCRUBBERMainPage, IDFANMainPage, COOLINGTOWERMainPage,
  WATER_INJECTIONMainPage,

  AIRCOOLERMainPage ,
  WATERCOOLERMainPage,
 TUBEANDSHELLMainPage ,
 
 
 SEP12MainPage,
 SEP21MainPage,

} from './C_Components/RetroAndBilanComponents';

import Sidebar from './C_Components/SidebarV1';
import OPEX_form from './OPEX';
import LinearGraph from './G_Graphiques/Combustion_diagramme/LinearGraph';
import DataFlowDisplay from './C_Components/DataFlowDisplay';
import DashboardWindow from './G_Graphiques/Dashboard/Dashboard';
import GlobalReport from './D_BILAN_Rapports/GlobalReport';
import GlobalRetroReport from './D_BILAN_Rapports/GlobalRetroReport';

const initialNodes = [];
const initialEdges = [];

// Map: node label → Retro Parameter_Tab component (used by batch calculation)
const retroComponentMap = {
  'RK+SCC': RK_Parameter_Tab,
  FB: FB_Parameter_Tab,
  GF: GF_Parameter_Tab,
  WHB: WHB_Parameter_Tab,
  CO2: CO2_Parameter_Tab,
  QUENCH: QUENCH_Parameter_Tab,
  CYCLONE: CYCLONE_Parameter_Tab,
  AIRINJECTION: AIRINJECTION_Parameter_Tab,
  SCRUBBER: SCRUBBER_Parameter_Tab,
  BHF: BHF_Parameter_Tab,
  IACT: IACT_Parameter_Tab,
  ELECTROFILTER: ELECTROFILTER_Parameter_Tab,
  DENOX: DENOX_Parameter_Tab,
  REACTOR: REACTOR_Parameter_Tab,
  STACK: STACK_Parameter_Tab,
  IDFAN: IDFAN_Parameter_Tab,
  COOLINGTOWER: COOLINGTOWER_Parameter_Tab,
  WATER_INJECTION: WATER_INJECTION_Parameter_Tab,
};

// Maps node labels to the localStorage key each Parameter_Tab uses for its calculationResult.
// Used by onBatchSendData to persist batch results so visible panels read fresh data.
const batchResultStorageKeys = {
  'RK+SCC': 'calculationResult_RK',
  FB: 'calculationResult_FB',
  GF: 'calculationResult_GF',
  WHB: 'calculationResult_WHB',
  QUENCH: 'calculationResult_QUENCH',
  DENOX: 'calculationResult_DENOX',
  BHF: 'CalculationResult_BHF',
  IACT: 'CalculationResult_IACT',
  COOLINGTOWER: 'calculationResult_COOLINGTOWER',
  ELECTROFILTER: 'CalculationResult_ELECTROFILTER',
  CYCLONE: 'CalculationResult_CYCLONE',
  REACTOR: 'calculationResult_REACTOR',
  SCRUBBER: 'calculationResult_SCRUBBER',
  STACK: 'calculationResult_STACK',
  IDFAN: 'calculationResult_IDFAN',
  WATER_INJECTION: 'calculationResult_WATER_INJECTION',
  AIRINJECTION: 'CalculationResult_AIRINJECTION',
};

function FitViewButton() {
  const { fitView } = useReactFlow();
  return (
    <button
      className="fit-btn"
      onClick={() => fitView({ padding: 0.2, duration: 300 })}
      title="Fit canvas to window"
    >
      ⤢ Fit
    </button>
  );
}

function LockScrollButton() {
  const { fitView } = useReactFlow();
  const [locked, setLocked] = React.useState(false);

  const toggle = () => {
    const next = !locked;
    document.documentElement.style.overflow = next ? 'hidden' : '';
    document.body.style.overflow = next ? 'hidden' : '';
    if (next) fitView({ padding: 0.2, duration: 300 });
    setLocked(next);
  };

  return (
    <button
      className={`lock-btn${locked ? ' active' : ''}`}
      onClick={toggle}
      title={locked ? 'Restore scrollbars' : 'Hide scrollbars & fit view'}
    >
      {locked ? '⊠ Locked' : '⊡ Lock'}
    </button>
  );
}

function Flow({
  currentUser,
  adminEmail,
  onShowEmailManagement,
  onLogout
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [headNode, setHeadNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const { fitView } = useReactFlow();
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const id = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    return () => clearTimeout(id);
  }, [nodes.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'Bilan');
  const [showDataFlowDisplay, setShowDataFlowDisplay] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showOPEX, setShowOPEX] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);

  // Batch calculation state
  const [batchCalcIndex, setBatchCalcIndex] = useState(-1);
  const batchCalcIndexRef = useRef(-1);   // mirror ref — readable in callbacks without stale closure
  const batchQueueRef = useRef([]);
  const batchTimeoutRef = useRef(null);
  const edgesAtBatchStart = useRef([]);
  const modeAtBatchStart = useRef('');

  // Language management state
  const [currentLanguage, setCurrentLanguage] = useState(() => 
    localStorage.getItem('selectedLanguage') || 'fr'
  );
  
  // Fonction pour mettre à jour la langue
  const handleLanguageChange = useCallback((newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
  }, []);

  const toggleOPEX = useCallback(() => {
    setShowOPEX(prevShowOPEX => !prevShowOPEX);
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  // Sauvegarde des positions originales avant réarrangement vertical
  const savedPositionsRef = useRef(null);

  useEffect(() => {
    if (showDataFlowDisplay) {
      // Sauvegarder les positions actuelles
      setNodes(prevNodes => {
        savedPositionsRef.current = prevNodes.map(n => ({ id: n.id, position: { ...n.position } }));
        // Réarranger en colonne verticale
        return prevNodes.map((node, index) => ({
          ...node,
          position: { x: 40, y: 20 + index * 90 },
        }));
      });
    } else if (savedPositionsRef.current) {
      // Restaurer les positions d'origine
      const saved = savedPositionsRef.current;
      savedPositionsRef.current = null;
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const orig = saved.find(s => s.id === node.id);
          return orig ? { ...node, position: orig.position } : node;
        })
      );
    }
  }, [showDataFlowDisplay, setNodes]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'Retro bilan' ? 'Bilan' : 'Retro bilan'));
  }, []);

  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges((currentEdges) =>
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, currentEdges);
          const outgoers = getOutgoers(node, nodes, currentEdges);
          const connectedEdges = getConnectedEdges([node], currentEdges);

          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, currentEdges)
      );
    },
    [nodes]
  );

  const onAddNode = useCallback(
    (label) => {
      const newNode = {
        id: `${nodes.length + 1}`,
        data: { label },
        position: { x: headNode ? headNode.position.x + 200 : 0, y: 100 },
        sourcePosition: 'right',
        targetPosition: 'left',
        type: label === 'STACK' ? 'output' : ['RK+SCC', 'GF', 'FB'].includes(label) ? 'input' : undefined,
      };
      setNodes((prevNodes) => [...prevNodes, newNode]);

      if (headNode) {
        setEdges((prevEdges) => [
          ...prevEdges,
          {
            id: `${headNode.id}-${newNode.id}`,
            source: headNode.id,
            target: newNode.id,
            label: (prevEdges.length + 1).toString(),
            type: 'step',
          },
        ]);
      }

      setHeadNode(newNode);
    },
    [nodes, headNode, setNodes, setEdges]
  );

  // Kahn's algorithm — returns nodes in topological order (source → sink)
  const getTopologicalOrder = useCallback((nodesList, edgesList) => {
    const inDegree = {};
    const adj = {};
    nodesList.forEach(n => { inDegree[n.id] = 0; adj[n.id] = []; });
    edgesList.forEach(e => {
      if (adj[e.source] !== undefined) adj[e.source].push(e.target);
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
    });
    const queue = nodesList.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const order = [];
    while (queue.length) {
      const id = queue.shift();
      const node = nodesList.find(n => n.id === id);
      if (node) order.push(node);
      (adj[id] || []).forEach(targetId => {
        inDegree[targetId]--;
        if (inDegree[targetId] === 0) queue.push(targetId);
      });
    }
    return order;
  }, []);

  const onSendData = useCallback(
    (data) => {
      if (selectedNode) {
        const targetNode = nodes.find((node) =>
          mode === 'Bilan'
            ? edges.some((edge) => edge.source === selectedNode.id && edge.target === node.id)
            : edges.some((edge) => edge.target === selectedNode.id && edge.source === node.id)
        );
  
        // Mise à jour du nœud cible avec les résultats
        if (targetNode) {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === targetNode.id
                ? { ...node, data: { ...node.data, result: { ...data.result } } }
                : node
            )
          );
        }

        // Mise à jour du nœud sélectionné avec result + consommationElec
        const elecValue = data.result?.activeNodes_Elec?.[0]?.data?.consommationElec;
        const eauValue = data.result?.activeNodes_Eau?.[0]?.data?.consommationEau;
        const reactifsValue = data.result?.activeNodes_Reactifs?.[0]?.data?.consommationReactifs;
        const energieValue = data.result?.activeNodes_Energie?.[0]?.data?.consommationEnergie;
        const CO2Value = data.result?.activeNodes_CO2?.[0]?.data?.emissionsCO2;
        const coutValue = data.result?.activeNodes_cout?.[0]?.data?.cout;

        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNode.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    result: { ...data.result },
                    ...(data.inputData !== undefined && { inputData: data.inputData }),
                    ...(elecValue !== undefined && { consommationElec: elecValue }),
                    ...(eauValue !== undefined && { consommationEau: eauValue }),
                    ...(reactifsValue !== undefined && { consommationReactifs: reactifsValue }),
                    ...(energieValue !== undefined && { consommationEnergie: energieValue }),
                    ...(CO2Value !== undefined && { emissionsCO2: CO2Value }),
                    ...(coutValue !== undefined && { cout: coutValue }),
                    isActive: true,
                  },
                }
              : node
          )
        );
      }
    },
    [selectedNode, nodes, edges, mode, setNodes]
  );

  // Helper to advance the batch index atomically (ref + state in sync)
  const advanceBatch = useCallback((fromIdx) => {
    const nextIdx = fromIdx + 1;
    const newIdx = nextIdx >= batchQueueRef.current.length ? -1 : nextIdx;
    batchCalcIndexRef.current = newIdx;
    setBatchCalcIndex(newIdx);
  }, []);

  // Start batch calculation of all nodes in topological order (reversed for Retro)
  const handleCalculateAll = useCallback(() => {
    if (mode === 'Bilan') return;
    const topoOrder = getTopologicalOrder(nodes, edges);
    const orderedNodes = [...topoOrder].reverse(); // Retro: STACK first, furnace last
    const filtered = orderedNodes.filter(n => retroComponentMap[n.data.label]);
    batchQueueRef.current = filtered;
    edgesAtBatchStart.current = edges;
    modeAtBatchStart.current = mode;
    if (filtered.length > 0) {
      batchCalcIndexRef.current = 0;
      setBatchCalcIndex(0);
    }
  }, [nodes, edges, mode, getTopologicalOrder]);

  // Called by each batch-mounted component after it finishes calculation.
  // setNodes + setBatchCalcIndex are called at top level (not inside an updater) so React 18
  // batches them in one commit — the next BatchComponent always sees updated nodeData on mount.
  const onBatchSendData = useCallback((data) => {
    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
    const currentIdx = batchCalcIndexRef.current;
    if (currentIdx < 0) return;
    const queue = batchQueueRef.current;
    const currentNode = queue[currentIdx];
    if (!currentNode) return;
    const currentEdges = edgesAtBatchStart.current;

    // 1. Update current node's result + propagate to its upstream neighbour
    setNodes(prevNodes => prevNodes.map(n => {
      if (n.id === currentNode.id) {
        return { ...n, data: { ...n.data, result: { ...data.result }, isActive: true } };
      }
      // Retro: upstream node = the one whose edge TARGET is the current node
      const isUpstream = currentEdges.some(e => e.target === currentNode.id && e.source === n.id);
      if (isUpstream) {
        return { ...n, data: { ...n.data, result: { ...data.result } } };
      }
      return n;
    }));

    // 2. Persist result to localStorage so visible panels show fresh data on next open.
    // (The batch component unmounts in the same React commit as setBatchCalcIndex, so its
    //  internal useEffect never fires — we must save here instead.)
    const resultStorageKey = batchResultStorageKeys[currentNode.data.label];
    if (resultStorageKey && data.result) {
      try { localStorage.setItem(resultStorageKey, JSON.stringify(data.result)); } catch {}
    }

    // 3. Mark button green persistently
    localStorage.setItem(`calcSent_${currentNode.data.label}`, 'true');

    // 4. Advance index (ref + state in same synchronous block → batched by React 18)
    advanceBatch(currentIdx);
  }, [setNodes, advanceBatch]);

  // 3-second timeout fallback — advances batch if a node never calls onBatchSendData
  useEffect(() => {
    if (batchCalcIndex < 0) {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      return;
    }
    batchTimeoutRef.current = setTimeout(() => {
      advanceBatch(batchCalcIndexRef.current);
    }, 3000);
    return () => { if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current); };
  }, [batchCalcIndex, advanceBatch]);

  const renderParameterTab = () => {
    if (!selectedNode) return null;

    const componentMap = {
      ...(mode === 'Bilan' ? { 'RK+SCC': RKMainPage } : { 'RK+SCC': RK_Parameter_Tab }),
      ...(mode === 'Bilan' ? { FB: FBMainPage } : { FB: FB_Parameter_Tab }),
      ...(mode === 'Bilan' ? { GF: GF_Parameter_Tab} : { GF: GF_Parameter_Tab }),
      ...(mode === 'Bilan' ? { WHB: WHBMainPage } : { WHB: WHB_Parameter_Tab }),
      ...(mode === 'Bilan' ? { CO2: CO2MainPage } : { CO2: CO2_Parameter_Tab }),
      ...(mode === 'Bilan' ? { QUENCH: QUENCHMainPage } : { QUENCH: QUENCH_Parameter_Tab }),
      ...(mode === 'Bilan' ? { CYCLONE: CYCLONEMainPage } : { CYCLONE: CYCLONE_Parameter_Tab }),
      ...(mode === 'Bilan' ? { AIRINJECTION: AIRINJECTIONMainPage } : { AIRINJECTION: AIRINJECTION_Parameter_Tab }),
      ...(mode === 'Bilan' ? { SCRUBBER: SCRUBBERMainPage } : { SCRUBBER: SCRUBBER_Parameter_Tab }),
      ...(mode === 'Bilan' ? { BHF: BHFMainPage } : { BHF: BHF_Parameter_Tab }),
      ...(mode === 'Bilan' ? { IACT: IACTMainPage } : { IACT: IACT_Parameter_Tab }),
      ...(mode === 'Bilan' ? { ELECTROFILTER: ELECTROFILTERMainPage } : { ELECTROFILTER: ELECTROFILTER_Parameter_Tab }),
      ...(mode === 'Bilan' ? { DENOX: DENOXMainPage } : { DENOX: DENOX_Parameter_Tab }),
      ...(mode === 'Bilan' ? { REACTOR: REACTORMainPage } : { REACTOR: REACTOR_Parameter_Tab }),
      ...(mode === 'Bilan' ? { STACK: STACKMainPage } : { STACK: STACK_Parameter_Tab }),
      ...(mode === 'Bilan' ? { IDFAN: IDFANMainPage } : { IDFAN: IDFAN_Parameter_Tab }),
      ...(mode === 'Bilan' ? { COOLINGTOWER: COOLINGTOWERMainPage } : { COOLINGTOWER: COOLINGTOWER_Parameter_Tab }),
      ...(mode === 'Bilan' ? { WATER_INJECTION: WATER_INJECTIONMainPage } : { WATER_INJECTION: WATER_INJECTION_Parameter_Tab }),

      /*
      ...(mode === 'Bilan' ? { Cooling_HX_air: AIRCOOLERMainPage } : { Cooling_HX_air: AIRCOOLER_Parameter_Tab }),
      ...(mode === 'Bilan' ? { Cooling_HX_eau: WATERCOOLERMainPage } : { Cooling_HX_eau: WATERCOOLER_Parameter_Tab }),
      ...(mode === 'Bilan' ? { HX_TubeAndShell: TUBEANDSHELLMainPage } : { HX_TubeAndShell: TUBEANDSHELL_Parameter_Tab }),
      
      ...(mode === 'Bilan' ? { '2to1': SEP21MainPage } : { '2to1': SEP21_Parameter_Tab }),
      ...(mode === 'Bilan' ? { '1to2': SEP12MainPage } : { '1to2': SEP12_Parameter_Tab }),
*/


      ...(mode === 'Bilan' ? { Cooling_HX_air: AIRCOOLERMainPage } : {}),
      ...(mode === 'Bilan' ? { Cooling_HX_eau: WATERCOOLERMainPage } : {}),
      ...(mode === 'Bilan' ? { HX_TubeAndShell: TUBEANDSHELLMainPage } : {}),
      
      ...(mode === 'Bilan' ? { '2to1': SEP21MainPage } : {}),
      ...(mode === 'Bilan' ? { '1to2': SEP12MainPage } : {}),








    };

    const Component = componentMap[selectedNode.data.label];
    if (!Component) return null;

    return (
      <Component
        key={selectedNode.id}
        title={selectedNode.data.label}
        nodeData={selectedNode.data}
        onSendData={onSendData}
        onGoBack={() => setSelectedNode(null)}
        onClose={() => setSelectedNode(null)}
        currentLanguage={currentLanguage}
      />
    );
  };

  // Function to save the project
  const handleSaveProject = () => {
    const projectData = {
      nodes,
      edges,
      selectedNode,
      mode,
      currentLanguage
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
   
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to load the project
  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
   
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target.result);
            setNodes(projectData.nodes || []);
            setEdges(projectData.edges || []);
            setSelectedNode(projectData.selectedNode);
            setMode(projectData.mode || 'Bilan');
            
            // Load language from project if available
            if (projectData.currentLanguage) {
              setCurrentLanguage(projectData.currentLanguage);
              localStorage.setItem('selectedLanguage', projectData.currentLanguage);
            }
          } catch (error) {
            console.error('Error loading project:', error);
            alert('Error loading project file. Please ensure it is a valid project configuration.');
          }
        };
        reader.readAsText(file);
      }
    };
   
    input.click();
  };

  const handleScreenshot = useCallback(async () => {
    try {
      await takeScreenshot();
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  }, []);

  const [showRapportEditor, setShowRapportEditor] = useState(false);
  const [showRetroRapportEditor, setShowRetroRapportEditor] = useState(false);
  const handleEditRapport = useCallback(() => {
    if (mode === 'Bilan') {
      setShowRapportEditor(prev => !prev);
    } else {
      setShowRetroRapportEditor(prev => !prev);
    }
  }, [mode]);

  return (
    <>
    <div className="app-banner">
      <span>INCINERATION TOOL</span>
      <span className="app-banner-mode">{mode === 'Bilan' ? 'Bilan' : 'Rétro Bilan'}</span>
    </div>
    <div className="Zone-fond-blanc">
      <Sidebar onAddNode={onAddNode} currentLanguage={currentLanguage} />
      
      <DropdownMenu 
        currentUser={currentUser}
        adminEmail={adminEmail}
        mode={mode}
        showDataFlowDisplay={showDataFlowDisplay}
        showGraph={showGraph}
        showOPEX={showOPEX}
        onToggleMode={toggleMode}
        onToggleDataFlow={() => setShowDataFlowDisplay(!showDataFlowDisplay)}
        onToggleGraph={() => setShowGraph(!showGraph)}
        onShowDashboard={() => setShowDashboard(true)}
        onShowEmailManagement={onShowEmailManagement}
        onToggleOPEX={toggleOPEX}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onLogout={onLogout}
        onScreenshot={handleScreenshot}
        onEditRapport={handleEditRapport}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <div
        className="relative-flex-container"
        style={showDataFlowDisplay ? { flex: '0 0 280px', minWidth: 0 } : {}}
      >
        <div className="btn-position">
          <Toggle10choice
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={isEraserActive ? undefined : onNodeClick}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="top-right"
          style={{ backgroundColor: '#F7F9FB' }}
        >
          <Background />
          <Controls />
          <Panel position="top-left">
            <button
              className="reset-btn"
              onClick={() => { if (window.confirm('Réinitialiser ? Toutes les données non sauvegardées seront perdues.')) window.location.reload(); }}
              title="Reset — recharge la page"
            >
              ↺ Reset
            </button>
            <button
              className={`eraser-btn${isEraserActive ? ' active' : ''}`}
              onClick={() => setIsEraserActive((v) => !v)}
            >
              🧹 Erase
            </button>
            <FitViewButton />
            <LockScrollButton />
            {mode !== 'Bilan' && (
              <button
                className="reset-btn"
                onClick={handleCalculateAll}
                disabled={batchCalcIndex >= 0}
                title="Calculer et envoyer données de tous les nœuds"
              >
                {batchCalcIndex >= 0 ? '⏳ Calcul…' : '⚙ Calc. All'}
              </button>
            )}
          </Panel>
          {isEraserActive && <Eraser />}
        </ReactFlow>
      </div>

      {showDataFlowDisplay && (
        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, height: '100%' }}>
          <DataFlowDisplay
            nodes={nodes}
            currentLanguage={currentLanguage}
          />
        </div>
      )}
      
      {showGraph && (
        <LinearGraph 
          currentLanguage={currentLanguage} 
        />
      )}
      
      {renderParameterTab()}
      
      {showDashboard && (
        <DashboardWindow 
          onClose={() => setShowDashboard(false)}
          nodes={nodes}
          currentLanguage={currentLanguage}
        />
      )}   

      {showOPEX && (
        <OPEX_form
          onClose={() => setShowOPEX(false)}
          currentLanguage={currentLanguage}
        />
      )}

      {showRapportEditor && (
        <GlobalReport
          nodes={nodes}
          onClose={() => setShowRapportEditor(false)}
        />
      )}

      {showRetroRapportEditor && (
        <GlobalRetroReport
          nodes={nodes}
          onClose={() => setShowRetroRapportEditor(false)}
        />
      )}

      {/* Hidden batch mount — sequentially mounts one Parameter_Tab at a time to auto-calculate */}
      {batchCalcIndex >= 0 && (() => {
        const batchNodeId = batchQueueRef.current[batchCalcIndex]?.id;
        if (!batchNodeId) return null;
        const batchNode = nodes.find(n => n.id === batchNodeId);
        if (!batchNode) return null;
        const BatchComponent = retroComponentMap[batchNode.data.label];
        if (!BatchComponent) return null;
        return (
          <div style={{ position: 'fixed', left: '-9999px', visibility: 'hidden', pointerEvents: 'none' }}>
            <BatchComponent
              key={`batch-${batchNode.id}-${batchCalcIndex}`}
              title={batchNode.data.label}
              nodeData={batchNode.data}
              onSendData={onBatchSendData}
              onClose={() => {}}
              currentLanguage={currentLanguage}
              autoTrigger={true}
            />
          </div>
        );
      })()}
    </div>
    </>
  );
}

export default Flow;


