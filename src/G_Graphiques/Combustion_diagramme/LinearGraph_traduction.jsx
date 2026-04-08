// linearGraphTranslations.js
export const linearGraphTranslations = {
  fr: {
    title: 'Configuration du domaine de fonctionnement',
    chartTitle: 'Masse de déchets vs Puissance du four',
    xAxisLabel: 'Masse de déchets (kg/h)',
    yAxisLabel: 'Puissance du four (MW)',
    operationDomain: 'Domaine de fonctionnement',
    pointE: 'Point E',
    warningMessage: '⚠️ La puissance minimum du four ne peut être inférieure à 40% de son maximum.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Point'
  },
  en: {
    title: 'Operating Domain Configuration',
    chartTitle: 'Waste Mass vs Furnace Power',
    xAxisLabel: 'Waste Mass (kg/h)',
    yAxisLabel: 'Furnace Power (MW)',
    operationDomain: 'Operation Domain',
    pointE: 'Point E',
    warningMessage: '⚠️ The minimum furnace power cannot be less than 40% of its maximum.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Point'
  },
  es: {
    title: 'Configuración del dominio de operación',
    chartTitle: 'Masa de residuos vs Potencia del horno',
    xAxisLabel: 'Masa de residuos (kg/h)',
    yAxisLabel: 'Potencia del horno (MW)',
    operationDomain: 'Dominio de operación',
    pointE: 'Punto E',
    warningMessage: '⚠️ La potencia mínima del horno no puede ser inferior al 40% de su máximo.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Punto'
  },
  de: {
    title: 'Konfiguration des Betriebsbereichs',
    chartTitle: 'Abfallmasse vs Ofenleistung',
    xAxisLabel: 'Abfallmasse (kg/h)',
    yAxisLabel: 'Ofenleistung (MW)',
    operationDomain: 'Betriebsbereich',
    pointE: 'Punkt E',
    warningMessage: '⚠️ Die minimale Ofenleistung darf nicht weniger als 40% des Maximums betragen.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Punkt'
  },
  it: {
    title: 'Configurazione del dominio operativo',
    chartTitle: 'Massa rifiuti vs Potenza del forno',
    xAxisLabel: 'Massa rifiuti (kg/h)',
    yAxisLabel: 'Potenza del forno (MW)',
    operationDomain: 'Dominio operativo',
    pointE: 'Punto E',
    warningMessage: '⚠️ La potenza minima del forno non può essere inferiore al 40% del massimo.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Punto'
  },
  pt: {
    title: 'Configuração do domínio operacional',
    chartTitle: 'Massa de resíduos vs Potência do forno',
    xAxisLabel: 'Massa de resíduos (kg/h)',
    yAxisLabel: 'Potência do forno (MW)',
    operationDomain: 'Domínio operacional',
    pointE: 'Ponto E',
    warningMessage: '⚠️ A potência mínima do forno não pode ser inferior a 40% do máximo.',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'Ponto'
  },
  ru: {
    title: 'Конфигурация рабочей области',
    chartTitle: 'Масса отходов vs Мощность печи',
    xAxisLabel: 'Масса отходов (кг/ч)',
    yAxisLabel: 'Мощность печи (МВт)',
    operationDomain: 'Рабочая область',
    pointE: 'Точка E',
    warningMessage: '⚠️ Минимальная мощность печи не может быть менее 40% от максимальной.',
    xLabel: 'X (кг/ч):',
    yLabel: 'Y (МВт):',
    point: 'Точка'
  },
  ja: {
    title: '動作領域の設定',
    chartTitle: '廃棄物質量 vs 炉出力',
    xAxisLabel: '廃棄物質量 (kg/h)',
    yAxisLabel: '炉出力 (MW)',
    operationDomain: '動作領域',
    pointE: 'ポイント E',
    warningMessage: '⚠️ 炉の最小出力は最大出力の40%未満にできません。',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: 'ポイント'
  },
  zh: {
    title: '操作域配置',
    chartTitle: '废料质量 vs 炉功率',
    xAxisLabel: '废料质量 (kg/h)',
    yAxisLabel: '炉功率 (MW)',
    operationDomain: '操作域',
    pointE: '点 E',
    warningMessage: '⚠️ 炉的最小功率不能低于最大功率的40%。',
    xLabel: 'X (kg/h):',
    yLabel: 'Y (MW):',
    point: '点'
  },
  ar: {
    title: 'تكوين نطاق التشغيل',
    chartTitle: 'كتلة النفايات مقابل قوة الفرن',
    xAxisLabel: 'كتلة النفايات (كغ/ساعة)',
    yAxisLabel: 'قوة الفرن (ميجاواط)',
    operationDomain: 'نطاق التشغيل',
    pointE: 'النقطة E',
    warningMessage: '⚠️ الحد الأدنى لقوة الفرن لا يمكن أن يكون أقل من 40% من الحد الأقصى.',
    xLabel: 'X (كغ/ساعة):',
    yLabel: 'Y (ميجاواط):',
    point: 'نقطة'
  }
};

// Fonction utilitaire pour obtenir les traductions avec fallback
export const getLinearGraphTranslations = (language = 'fr') => {
  return linearGraphTranslations[language] || linearGraphTranslations.fr;
};