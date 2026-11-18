// ─── Chaudière (WHB), mode Retro : perte de charge côté fumées ───────────────
//
// Le calcul Retro remonte de la cheminée vers le four : la pression amont de la chaudière
// (dataFlow.P_mmCE, lue par le nœud amont) = pression aval reçue + perte de charge.
// Appliqué au résultat des quatre options de calcul (WHB_calculation_option1…4) par
// WHB_Parameter_Tab et par le Calc. All (batchCalculators.js).

export const PDC_WHB_DEFAUT_MMCE = '100';

export const ajouterPressionWHB = (result, nodeData, PDC_mmCE) => {
  if (!result?.dataFlow) return result;
  const P_aval_mmCE = parseFloat(nodeData?.result?.dataFlow?.P_mmCE) || 0;
  const PDC = Math.max(0, parseFloat(PDC_mmCE) || 0);
  const P_amont_mmCE = P_aval_mmCE + PDC;
  return {
    ...result,
    dataFlow: { ...result.dataFlow, P_mmCE: P_amont_mmCE },
    data_pression_WHB: { P_aval_mmCE, PDC_mmCE: PDC, P_amont_mmCE },
  };
};
