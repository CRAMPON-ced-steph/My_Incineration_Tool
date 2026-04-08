// OPEX_traduction.js - Multi-language translations for OPEX parameters

const translations = {
  fr: {
    // Page title and navigation
    opexParameters: "Paramètres OPEX",
    general: "Général",
    transport: "Transport", 
    compressedAir: "Air Comprimé",
    energy: "Energie",
    gas: "Gaz",
    steam: "Vapeur",
    water: "Eau",
    byproducts: "Sous-produits",
    fuel: "Combustible",
    reagents: "Réactifs",

    // Tab 1: General parameters
    country: "Pays",
    ratioElec: "Ratio électrique",
    currency: "Devise",
    availability: "Disponibilité",

    // Tab 2: Transportation
    transportationType: "Types de transport",
    truck15T: "Camion 15 tonnes",
    truck20T: "Camion 20 tonnes", 
    truck25T: "Camion 25 tonnes",
    co2EmissionPerKmPerT: "Émission CO2 par km/t",
    evacuationPrice: "Prix évacuation",

    // Tab 3: Compressed air
    compressedAirN2: "Air comprimé / N2 sur site",
    compressedAirProducedByPlant: "Air comprimé produit par l'usine",
    compressedAirPressure: "Pression réseau air comprimé",
    airCompressorTechnology: "Technologie compresseur",
    electricConsumptionRatio: "Ratio consommation électrique",
    compressedAirPrice: "Prix air comprimé",
    consumptionPrice: "Prix consommation",

    // Tab 4: Energy
    electricity: "Électricité",
    purchasePriceElectricity: "Prix achat électricité",
    sellingPriceElectricity: "Prix vente électricité",

    // Tab 5: Gas types
    naturalGasHType: "Gaz naturel type H",
    naturalGasLType: "Gaz naturel type L", 
    processGas: "Gaz de procédé",
    natGasMolecule: "Molécule gaz naturel",
    co2Emission: "Émission CO2",

    // Tab 6: Steam
    steamSellingPrice: "Prix vente vapeur",
    steamHighPressure: "Vapeur haute pression",
    steamLowPressureP1: "Vapeur basse pression P1",
    steamLowPressureP2: "Vapeur basse pression P2", 
    fatalSteam: "Vapeur fatale",

    // Tab 7: Water types
    potableWater: "Eau potable",
    coolingWater: "Eau refroidissement",
    demineralizedWater: "Eau déminéralisée",
    softWater: "Eau adoucie",
    riverWater: "Eau rivière",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Sous-produits : transport + traitement",
    product: "Produit", 
    cost: "Coût",
    truckType: "Type camion",
    distance: "Distance",

    // Tab 10: Chemical reagents
    slakedLime: "Chaux éteinte Ca(OH)2",
    quickLime: "Chaux vive CaO",
    calciumCarbonate: "Carbonate calcium CaCO3",
    bicarbonate: "Bicarbonate HCO3",
    causticSoda: "Soude caustique NaOH",
    sodiumBicarbonate: "Bicarbonate sodium NaHCO3",
    ammonia: "Ammoniac NH3",
    urea: "Urée",
    purity: "Pureté",
    co2PerTKm: "CO2 par t.km",
    co2PerDelivery: "CO2 par livraison",

    // Chemical names mapping
    HCO3: "Bicarbonate HCO3",
    NaOHCO3: "Bicarbonate sodium NaHCO3", 
    NH3: "Ammoniac NH3",
    Urea: "Urée",
    NaBr_CaBr2: "Bromures NaBr/CaBr2",
    CAP: "Poudre charbon actif",

    // Interface buttons
    reset: "Réinitialiser",
    save: "Enregistrer", 
    cancel: "Annuler"
  },

  en: {
    // Page title and navigation
    opexParameters: "OPEX Parameters",
    general: "General",
    transport: "Transport",
    compressedAir: "Compressed Air", 
    energy: "Energy",
    gas: "Gas",
    steam: "Steam",
    water: "Water",
    byproducts: "Byproducts",
    fuel: "Fuel",
    reagents: "Reagents",

    // Tab 1: General parameters
    country: "Country",
    ratioElec: "Electrical ratio",
    currency: "Currency",
    availability: "Availability",

    // Tab 2: Transportation
    transportationType: "Transportation types",
    truck15T: "15-ton truck",
    truck20T: "20-ton truck",
    truck25T: "25-ton truck", 
    co2EmissionPerKmPerT: "CO2 emission per km/t",
    evacuationPrice: "Evacuation price",

    // Tab 3: Compressed air
    compressedAirN2: "Compressed air / N2 on-site",
    compressedAirProducedByPlant: "Plant-produced compressed air",
    compressedAirPressure: "Compressed air network pressure",
    airCompressorTechnology: "Compressor technology",
    electricConsumptionRatio: "Electric consumption ratio",
    compressedAirPrice: "Compressed air price",
    consumptionPrice: "Consumption price",

    // Tab 4: Energy
    electricity: "Electricity",
    purchasePriceElectricity: "Electricity purchase price",
    sellingPriceElectricity: "Electricity selling price",

    // Tab 5: Gas types  
    naturalGasHType: "Natural gas H-type",
    naturalGasLType: "Natural gas L-type",
    processGas: "Process gas",
    natGasMolecule: "Natural gas molecule", 
    co2Emission: "CO2 emission",

    // Tab 6: Steam
    steamSellingPrice: "Steam selling price",
    steamHighPressure: "High pressure steam",
    steamLowPressureP1: "Low pressure steam P1",
    steamLowPressureP2: "Low pressure steam P2",
    fatalSteam: "Waste steam",

    // Tab 7: Water types
    potableWater: "Potable water",
    coolingWater: "Cooling water",
    demineralizedWater: "Demineralized water",
    softWater: "Soft water",
    riverWater: "River water",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Byproducts: shipping + treatment",
    product: "Product",
    cost: "Cost", 
    truckType: "Truck type",
    distance: "Distance",

    // Tab 10: Chemical reagents
    slakedLime: "Slaked lime Ca(OH)2",
    quickLime: "Quick lime CaO",
    calciumCarbonate: "Calcium carbonate CaCO3",
    bicarbonate: "Bicarbonate HCO3",
    causticSoda: "Caustic soda NaOH", 
    sodiumBicarbonate: "Sodium bicarbonate NaHCO3",
    ammonia: "Ammonia NH3",
    urea: "Urea",
    purity: "Purity",
    co2PerTKm: "CO2 per t.km",
    co2PerDelivery: "CO2 per delivery",

    // Chemical names mapping
    HCO3: "Bicarbonate HCO3",
    NaOHCO3: "Sodium bicarbonate NaHCO3",
    NH3: "Ammonia NH3", 
    Urea: "Urea",
    NaBr_CaBr2: "Bromides NaBr/CaBr2",
    CAP: "Activated carbon powder",

    // Interface buttons
    reset: "Reset",
    save: "Save",
    cancel: "Cancel"
  },

  es: {
    // Page title and navigation
    opexParameters: "Parámetros OPEX",
    general: "General",
    transport: "Transporte",
    compressedAir: "Aire Comprimido",
    energy: "Energía", 
    gas: "Gas",
    steam: "Vapor",
    water: "Agua",
    byproducts: "Subproductos",
    fuel: "Combustible",
    reagents: "Reactivos",

    // Tab 1: General parameters
    country: "País",
    ratioElec: "Ratio eléctrico",
    currency: "Moneda",
    availability: "Disponibilidad",

    // Tab 2: Transportation
    transportationType: "Tipos de transporte",
    truck15T: "Camión 15 toneladas",
    truck20T: "Camión 20 toneladas",
    truck25T: "Camión 25 toneladas",
    co2EmissionPerKmPerT: "Emisión CO2 por km/t",
    evacuationPrice: "Precio evacuación",

    // Tab 3: Compressed air
    compressedAirN2: "Aire comprimido / N2 in situ", 
    compressedAirProducedByPlant: "Aire comprimido producido en planta",
    compressedAirPressure: "Presión red aire comprimido",
    airCompressorTechnology: "Tecnología compresor",
    electricConsumptionRatio: "Ratio consumo eléctrico",
    compressedAirPrice: "Precio aire comprimido",
    consumptionPrice: "Precio consumo",

    // Tab 4: Energy
    electricity: "Electricidad",
    purchasePriceElectricity: "Precio compra electricidad",
    sellingPriceElectricity: "Precio venta electricidad",

    // Tab 5: Gas types
    naturalGasHType: "Gas natural tipo H",
    naturalGasLType: "Gas natural tipo L",
    processGas: "Gas de proceso",
    natGasMolecule: "Molécula gas natural",
    co2Emission: "Emisión CO2",

    // Tab 6: Steam
    steamSellingPrice: "Precio venta vapor",
    steamHighPressure: "Vapor alta presión",
    steamLowPressureP1: "Vapor baja presión P1",
    steamLowPressureP2: "Vapor baja presión P2",
    fatalSteam: "Vapor residual",

    // Tab 7: Water types
    potableWater: "Agua potable",
    coolingWater: "Agua refrigeración",
    demineralizedWater: "Agua desmineralizada", 
    softWater: "Agua blanda",
    riverWater: "Agua río",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Subproductos: envío + tratamiento",
    product: "Producto",
    cost: "Coste",
    truckType: "Tipo camión",
    distance: "Distancia",

    // Tab 10: Chemical reagents
    slakedLime: "Cal apagada Ca(OH)2",
    quickLime: "Cal viva CaO",
    calciumCarbonate: "Carbonato cálcico CaCO3",
    bicarbonate: "Bicarbonato HCO3",
    causticSoda: "Sosa cáustica NaOH",
    sodiumBicarbonate: "Bicarbonato sódico NaHCO3",
    ammonia: "Amoníaco NH3",
    urea: "Urea",
    purity: "Pureza",
    co2PerTKm: "CO2 por t.km",
    co2PerDelivery: "CO2 por entrega",

    // Chemical names mapping
    HCO3: "Bicarbonato HCO3",
    NaOHCO3: "Bicarbonato sódico NaHCO3",
    NH3: "Amoníaco NH3",
    Urea: "Urea", 
    NaBr_CaBr2: "Bromuros NaBr/CaBr2",
    CAP: "Polvo carbón activo",

    // Interface buttons
    reset: "Restablecer",
    save: "Guardar",
    cancel: "Cancelar"
  },

  de: {
    // Page title and navigation
    opexParameters: "OPEX-Parameter",
    general: "Allgemein",
    transport: "Transport",
    compressedAir: "Druckluft",
    energy: "Energie",
    gas: "Gas",
    steam: "Dampf",
    water: "Wasser", 
    byproducts: "Nebenprodukte",
    fuel: "Kraftstoff",
    reagents: "Reagenzien",

    // Tab 1: General parameters
    country: "Land",
    ratioElec: "Elektrisches Verhältnis",
    currency: "Währung",
    availability: "Verfügbarkeit",

    // Tab 2: Transportation
    transportationType: "Transportarten",
    truck15T: "15-Tonnen LKW",
    truck20T: "20-Tonnen LKW",
    truck25T: "25-Tonnen LKW",
    co2EmissionPerKmPerT: "CO2-Emission pro km/t",
    evacuationPrice: "Evakuierungspreis",

    // Tab 3: Compressed air
    compressedAirN2: "Druckluft / N2 vor Ort",
    compressedAirProducedByPlant: "Werksproduzierte Druckluft",
    compressedAirPressure: "Druckluftnetz-Druck",
    airCompressorTechnology: "Kompressor-Technologie",
    electricConsumptionRatio: "Stromverbrauchsverhältnis",
    compressedAirPrice: "Druckluftpreis",
    consumptionPrice: "Verbrauchspreis",

    // Tab 4: Energy
    electricity: "Elektrizität",
    purchasePriceElectricity: "Strom-Einkaufspreis",
    sellingPriceElectricity: "Strom-Verkaufspreis",

    // Tab 5: Gas types
    naturalGasHType: "Erdgas H-Typ",
    naturalGasLType: "Erdgas L-Typ",
    processGas: "Prozessgas",
    natGasMolecule: "Erdgasmolekül",
    co2Emission: "CO2-Emission",

    // Tab 6: Steam
    steamSellingPrice: "Dampf-Verkaufspreis",
    steamHighPressure: "Hochdruckdampf", 
    steamLowPressureP1: "Niederdruckdampf P1",
    steamLowPressureP2: "Niederdruckdampf P2",
    fatalSteam: "Abdampf",

    // Tab 7: Water types
    potableWater: "Trinkwasser",
    coolingWater: "Kühlwasser",
    demineralizedWater: "Entmineralisiertes Wasser",
    softWater: "Weichwasser",
    riverWater: "Flusswasser",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Nebenprodukte: Versand + Behandlung",
    product: "Produkt",
    cost: "Kosten",
    truckType: "LKW-Typ",
    distance: "Entfernung",

    // Tab 10: Chemical reagents
    slakedLime: "Löschkalk Ca(OH)2",
    quickLime: "Branntkalk CaO",
    calciumCarbonate: "Calciumcarbonat CaCO3",
    bicarbonate: "Bicarbonat HCO3",
    causticSoda: "Natronlauge NaOH",
    sodiumBicarbonate: "Natriumbicarbonat NaHCO3",
    ammonia: "Ammoniak NH3",
    urea: "Harnstoff",
    purity: "Reinheit",
    co2PerTKm: "CO2 pro t.km",
    co2PerDelivery: "CO2 pro Lieferung",

    // Chemical names mapping
    HCO3: "Bicarbonat HCO3",
    NaOHCO3: "Natriumbicarbonat NaHCO3",
    NH3: "Ammoniak NH3",
    Urea: "Harnstoff",
    NaBr_CaBr2: "Bromide NaBr/CaBr2",
    CAP: "Aktivkohlepulver",

    // Interface buttons
    reset: "Zurücksetzen",
    save: "Speichern", 
    cancel: "Abbrechen"
  },

  it: {
    // Page title and navigation
    opexParameters: "Parametri OPEX",
    general: "Generale",
    transport: "Trasporto",
    compressedAir: "Aria Compressa",
    energy: "Energia",
    gas: "Gas",
    steam: "Vapore",
    water: "Acqua",
    byproducts: "Sottoprodotti",
    fuel: "Combustibile", 
    reagents: "Reagenti",

    // Tab 1: General parameters
    country: "Paese",
    ratioElec: "Rapporto elettrico",
    currency: "Valuta",
    availability: "Disponibilità",

    // Tab 2: Transportation
    transportationType: "Tipi di trasporto",
    truck15T: "Camion 15 tonnellate",
    truck20T: "Camion 20 tonnellate",
    truck25T: "Camion 25 tonnellate",
    co2EmissionPerKmPerT: "Emissione CO2 per km/t",
    evacuationPrice: "Prezzo evacuazione",

    // Tab 3: Compressed air
    compressedAirN2: "Aria compressa / N2 in loco",
    compressedAirProducedByPlant: "Aria compressa prodotta dall'impianto",
    compressedAirPressure: "Pressione rete aria compressa",
    airCompressorTechnology: "Tecnologia compressore",
    electricConsumptionRatio: "Rapporto consumo elettrico",
    compressedAirPrice: "Prezzo aria compressa",
    consumptionPrice: "Prezzo consumo",

    // Tab 4: Energy
    electricity: "Elettricità",
    purchasePriceElectricity: "Prezzo acquisto elettricità",
    sellingPriceElectricity: "Prezzo vendita elettricità",

    // Tab 5: Gas types
    naturalGasHType: "Gas naturale tipo H",
    naturalGasLType: "Gas naturale tipo L",
    processGas: "Gas di processo",
    natGasMolecule: "Molecola gas naturale",
    co2Emission: "Emissione CO2",

    // Tab 6: Steam
    steamSellingPrice: "Prezzo vendita vapore",
    steamHighPressure: "Vapore alta pressione",
    steamLowPressureP1: "Vapore bassa pressione P1",
    steamLowPressureP2: "Vapore bassa pressione P2",
    fatalSteam: "Vapore di scarto",

    // Tab 7: Water types
    potableWater: "Acqua potabile",
    coolingWater: "Acqua raffreddamento",
    demineralizedWater: "Acqua demineralizzata",
    softWater: "Acqua dolce",
    riverWater: "Acqua di fiume",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Sottoprodotti: spedizione + trattamento",
    product: "Prodotto",
    cost: "Costo",
    truckType: "Tipo camion",
    distance: "Distanza",

    // Tab 10: Chemical reagents
    slakedLime: "Calce spenta Ca(OH)2",
    quickLime: "Calce viva CaO",
    calciumCarbonate: "Carbonato di calcio CaCO3",
    bicarbonate: "Bicarbonato HCO3",
    causticSoda: "Soda caustica NaOH",
    sodiumBicarbonate: "Bicarbonato di sodio NaHCO3",
    ammonia: "Ammoniaca NH3",
    urea: "Urea",
    purity: "Purezza",
    co2PerTKm: "CO2 per t.km",
    co2PerDelivery: "CO2 per consegna",

    // Chemical names mapping
    HCO3: "Bicarbonato HCO3",
    NaOHCO3: "Bicarbonato di sodio NaHCO3",
    NH3: "Ammoniaca NH3",
    Urea: "Urea",
    NaBr_CaBr2: "Bromuri NaBr/CaBr2",
    CAP: "Polvere carbone attivo",

    // Interface buttons
    reset: "Ripristina",
    save: "Salva",
    cancel: "Annulla"
  },

  pt: {
    // Page title and navigation
    opexParameters: "Parâmetros OPEX",
    general: "Geral",
    transport: "Transporte",
    compressedAir: "Ar Comprimido",
    energy: "Energia",
    gas: "Gás",
    steam: "Vapor", 
    water: "Água",
    byproducts: "Subprodutos",
    fuel: "Combustível",
    reagents: "Reagentes",

    // Tab 1: General parameters
    country: "País",
    ratioElec: "Ratio elétrico",
    currency: "Moeda",
    availability: "Disponibilidade",

    // Tab 2: Transportation
    transportationType: "Tipos de transporte",
    truck15T: "Camião 15 toneladas",
    truck20T: "Camião 20 toneladas",
    truck25T: "Camião 25 toneladas",
    co2EmissionPerKmPerT: "Emissão CO2 por km/t",
    evacuationPrice: "Preço evacuação",

    // Tab 3: Compressed air
    compressedAirN2: "Ar comprimido / N2 no local",
    compressedAirProducedByPlant: "Ar comprimido produzido na instalação",
    compressedAirPressure: "Pressão rede ar comprimido",
    airCompressorTechnology: "Tecnologia compressor",
    electricConsumptionRatio: "Ratio consumo elétrico",
    compressedAirPrice: "Preço ar comprimido",
    consumptionPrice: "Preço consumo",

    // Tab 4: Energy
    electricity: "Eletricidade",
    purchasePriceElectricity: "Preço compra eletricidade",
    sellingPriceElectricity: "Preço venda eletricidade",

    // Tab 5: Gas types
    naturalGasHType: "Gás natural tipo H",
    naturalGasLType: "Gás natural tipo L",
    processGas: "Gás de processo",
    natGasMolecule: "Molécula gás natural",
    co2Emission: "Emissão CO2",

    // Tab 6: Steam
    steamSellingPrice: "Preço venda vapor",
    steamHighPressure: "Vapor alta pressão",
    steamLowPressureP1: "Vapor baixa pressão P1",
    steamLowPressureP2: "Vapor baixa pressão P2", 
    fatalSteam: "Vapor residual",

    // Tab 7: Water types
    potableWater: "Água potável",
    coolingWater: "Água refrigeração",
    demineralizedWater: "Água desmineralizada",
    softWater: "Água macia",
    riverWater: "Água rio",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Subprodutos: envio + tratamento",
    product: "Produto",
    cost: "Custo",
    truckType: "Tipo camião",
    distance: "Distância",

    // Tab 10: Chemical reagents
    slakedLime: "Cal hidratada Ca(OH)2",
    quickLime: "Cal viva CaO",
    calciumCarbonate: "Carbonato cálcio CaCO3",
    bicarbonate: "Bicarbonato HCO3",
    causticSoda: "Soda cáustica NaOH",
    sodiumBicarbonate: "Bicarbonato sódio NaHCO3",
    ammonia: "Amoníaco NH3",
    urea: "Ureia",
    purity: "Pureza",
    co2PerTKm: "CO2 por t.km",
    co2PerDelivery: "CO2 por entrega",

    // Chemical names mapping
    HCO3: "Bicarbonato HCO3",
    NaOHCO3: "Bicarbonato sódio NaHCO3",
    NH3: "Amoníaco NH3",
    Urea: "Ureia",
    NaBr_CaBr2: "Brometos NaBr/CaBr2",
    CAP: "Pó carvão ativado",

    // Interface buttons
    reset: "Repor",
    save: "Guardar",
    cancel: "Cancelar"
  },

  zh: {
    // Page title and navigation
    opexParameters: "运营支出参数",
    general: "常规",
    transport: "运输",
    compressedAir: "压缩空气",
    energy: "能源",
    gas: "燃气",
    steam: "蒸汽",
    water: "水",
    byproducts: "副产品",
    fuel: "燃料",
    reagents: "试剂",

    // Tab 1: General parameters
    country: "国家",
    ratioElec: "电力比率", 
    currency: "货币",
    availability: "可用性",

    // Tab 2: Transportation
    transportationType: "运输类型",
    truck15T: "15吨卡车",
    truck20T: "20吨卡车",
    truck25T: "25吨卡车",
    co2EmissionPerKmPerT: "每公里每吨CO2排放",
    evacuationPrice: "清运价格",

    // Tab 3: Compressed air
    compressedAirN2: "现场压缩空气/氮气",
    compressedAirProducedByPlant: "工厂生产压缩空气",
    compressedAirPressure: "压缩空气管网压力",
    airCompressorTechnology: "压缩机技术",
    electricConsumptionRatio: "电力消耗比",
    compressedAirPrice: "压缩空气价格",
    consumptionPrice: "消费价格",

    // Tab 4: Energy
    electricity: "电力",
    purchasePriceElectricity: "电力采购价",
    sellingPriceElectricity: "电力销售价",

    // Tab 5: Gas types
    naturalGasHType: "H型天然气",
    naturalGasLType: "L型天然气",
    processGas: "工艺气体",
    natGasMolecule: "天然气分子",
    co2Emission: "CO2排放",

    // Tab 6: Steam
    steamSellingPrice: "蒸汽销售价",
    steamHighPressure: "高压蒸汽",
    steamLowPressureP1: "低压蒸汽P1",
    steamLowPressureP2: "低压蒸汽P2",
    fatalSteam: "废蒸汽",

    // Tab 7: Water types
    potableWater: "饮用水",
    coolingWater: "冷却水",
    demineralizedWater: "去离子水",
    softWater: "软化水",
    riverWater: "河水",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "副产品：运输+处理",
    product: "产品",
    cost: "成本",
    truckType: "卡车类型",
    distance: "距离",

    // Tab 10: Chemical reagents
    slakedLime: "熟石灰 Ca(OH)2",
    quickLime: "生石灰 CaO", 
    calciumCarbonate: "碳酸钙 CaCO3",
    bicarbonate: "碳酸氢盐 HCO3",
    causticSoda: "氢氧化钠 NaOH",
    sodiumBicarbonate: "碳酸氢钠 NaHCO3",
    ammonia: "氨气 NH3",
    urea: "尿素",
    purity: "纯度",
    co2PerTKm: "每吨公里CO2",
    co2PerDelivery: "每次配送CO2",

    // Chemical names mapping
    HCO3: "碳酸氢盐 HCO3",
    NaOHCO3: "碳酸氢钠 NaHCO3",
    NH3: "氨气 NH3",
    Urea: "尿素",
    NaBr_CaBr2: "溴化物 NaBr/CaBr2",
    CAP: "活性炭粉",

    // Interface buttons
    reset: "重置",
    save: "保存",
    cancel: "取消"
  },

  ja: {
    // Page title and navigation
    opexParameters: "OPEX パラメータ",
    general: "一般",
    transport: "輸送",
    compressedAir: "圧縮空気",
    energy: "エネルギー",
    gas: "ガス",
    steam: "蒸気",
    water: "水",
    byproducts: "副生成物",
    fuel: "燃料",
    reagents: "試薬",

    // Tab 1: General parameters
    country: "国",
    ratioElec: "電力比率",
    currency: "通貨",
    availability: "可用性",

    // Tab 2: Transportation
    transportationType: "輸送タイプ",
    truck15T: "15トントラック",
    truck20T: "20トントラック", 
    truck25T: "25トントラック",
    co2EmissionPerKmPerT: "1km1tあたりCO2排出量",
    evacuationPrice: "搬出価格",

    // Tab 3: Compressed air
    compressedAirN2: "現地圧縮空気/窒素",
    compressedAirProducedByPlant: "プラント製圧縮空気",
    compressedAirPressure: "圧縮空気網圧力",
    airCompressorTechnology: "コンプレッサー技術",
    electricConsumptionRatio: "電力消費比率",
    compressedAirPrice: "圧縮空気価格",
    consumptionPrice: "消費価格",

    // Tab 4: Energy
    electricity: "電力",
    purchasePriceElectricity: "電力購入価格",
    sellingPriceElectricity: "電力売価",

    // Tab 5: Gas types
    naturalGasHType: "天然ガスH型",
    naturalGasLType: "天然ガスL型",
    processGas: "工程ガス",
    natGasMolecule: "天然ガス分子",
    co2Emission: "CO2排出",

    // Tab 6: Steam
    steamSellingPrice: "蒸気売価",
    steamHighPressure: "高圧蒸気",
    steamLowPressureP1: "低圧蒸気P1",
    steamLowPressureP2: "低圧蒸気P2",
    fatalSteam: "廃蒸気",

    // Tab 7: Water types
    potableWater: "上水",
    coolingWater: "冷却水",
    demineralizedWater: "脱塩水",
    softWater: "軟水",
    riverWater: "河川水",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "副生成物：輸送+処理",
    product: "製品",
    cost: "コスト",
    truckType: "トラック型式",
    distance: "距離",

    // Tab 10: Chemical reagents
    slakedLime: "消石灰 Ca(OH)2",
    quickLime: "生石灰 CaO",
    calciumCarbonate: "炭酸カルシウム CaCO3",
    bicarbonate: "重炭酸塩 HCO3",
    causticSoda: "苛性ソーダ NaOH",
    sodiumBicarbonate: "重炭酸ナトリウム NaHCO3",
    ammonia: "アンモニア NH3",
    urea: "尿素",
    purity: "純度",
    co2PerTKm: "1t・kmあたりCO2",
    co2PerDelivery: "配送あたりCO2",

    // Chemical names mapping
    HCO3: "重炭酸塩 HCO3",
    NaOHCO3: "重炭酸ナトリウム NaHCO3",
    NH3: "アンモニア NH3",
    Urea: "尿素",
    NaBr_CaBr2: "臭化物 NaBr/CaBr2", 
    CAP: "活性炭粉末",

    // Interface buttons
    reset: "リセット",
    save: "保存",
    cancel: "キャンセル"
  },

  ru: {
    // Page title and navigation
    opexParameters: "Параметры OPEX",
    general: "Основные",
    transport: "Транспорт",
    compressedAir: "Сжатый воздух",
    energy: "Энергия",
    gas: "Газ",
    steam: "Пар",
    water: "Вода",
    byproducts: "Побочные продукты",
    fuel: "Топливо",
    reagents: "Реагенты",

    // Tab 1: General parameters
    country: "Страна",
    ratioElec: "Электрический коэффициент",
    currency: "Валюта",
    availability: "Доступность",

    // Tab 2: Transportation
    transportationType: "Типы транспорта",
    truck15T: "Грузовик 15 тонн",
    truck20T: "Грузовик 20 тонн",
    truck25T: "Грузовик 25 тонн",
    co2EmissionPerKmPerT: "Выброс CO2 на км/т",
    evacuationPrice: "Цена вывоза",

    // Tab 3: Compressed air
    compressedAirN2: "Сжатый воздух / N2 на месте",
    compressedAirProducedByPlant: "Сжатый воздух завода",
    compressedAirPressure: "Давление сети сжатого воздуха",
    airCompressorTechnology: "Технология компрессора",
    electricConsumptionRatio: "Коэффициент электропотребления",
    compressedAirPrice: "Цена сжатого воздуха",
    consumptionPrice: "Цена потребления",

    // Tab 4: Energy
    electricity: "Электричество",
    purchasePriceElectricity: "Цена покупки электроэнергии",
    sellingPriceElectricity: "Цена продажи электроэнергии",

    // Tab 5: Gas types
    naturalGasHType: "Природный газ типа H",
    naturalGasLType: "Природный газ типа L",
    processGas: "Технологический газ",
    natGasMolecule: "Молекула природного газа",
    co2Emission: "Выброс CO2",

    // Tab 6: Steam
    steamSellingPrice: "Цена продажи пара",
    steamHighPressure: "Пар высокого давления",
    steamLowPressureP1: "Пар низкого давления P1",
    steamLowPressureP2: "Пар низкого давления P2",
    fatalSteam: "Отработанный пар",

    // Tab 7: Water types
    potableWater: "Питьевая вода",
    coolingWater: "Охлаждающая вода",
    demineralizedWater: "Деминерализованная вода",
    softWater: "Мягкая вода",
    riverWater: "Речная вода",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "Побочные продукты: доставка + обработка",
    product: "Продукт",
    cost: "Стоимость",
    truckType: "Тип грузовика",
    distance: "Расстояние",

    // Tab 10: Chemical reagents
    slakedLime: "Гашеная известь Ca(OH)2",
    quickLime: "Негашеная известь CaO",
    calciumCarbonate: "Карбонат кальция CaCO3",
    bicarbonate: "Бикарбонат HCO3",
    causticSoda: "Едкий натр NaOH",
    sodiumBicarbonate: "Бикарбонат натрия NaHCO3",
    ammonia: "Аммиак NH3",
    urea: "Мочевина",
    purity: "Чистота",
    co2PerTKm: "CO2 на т·км",
    co2PerDelivery: "CO2 на доставку",

    // Chemical names mapping
    HCO3: "Бикарбонат HCO3",
    NaOHCO3: "Бикарбонат натрия NaHCO3",
    NH3: "Аммиак NH3",
    Urea: "Мочевина", 
    NaBr_CaBr2: "Бромиды NaBr/CaBr2",
    CAP: "Порошок активного угля",

    // Interface buttons
    reset: "Сброс",
    save: "Сохранить",
    cancel: "Отмена"
  },

  ar: {
    // Page title and navigation
    opexParameters: "معاملات المصاريف التشغيلية",
    general: "عام",
    transport: "النقل",
    compressedAir: "الهواء المضغوط",
    energy: "الطاقة",
    gas: "الغاز",
    steam: "البخار",
    water: "الماء",
    byproducts: "المنتجات الثانوية",
    fuel: "الوقود",
    reagents: "الكواشف",

    // Tab 1: General parameters
    country: "البلد",
    ratioElec: "النسبة الكهربائية",
    currency: "العملة",
    availability: "التوفر",

    // Tab 2: Transportation
    transportationType: "أنواع النقل",
    truck15T: "شاحنة 15 طن",
    truck20T: "شاحنة 20 طن",
    truck25T: "شاحنة 25 طن",
    co2EmissionPerKmPerT: "انبعاث CO2 لكل كم/طن",
    evacuationPrice: "سعر الإخلاء",

    // Tab 3: Compressed air
    compressedAirN2: "هواء مضغوط / نيتروجين في الموقع",
    compressedAirProducedByPlant: "هواء مضغوط منتج بالمصنع",
    compressedAirPressure: "ضغط شبكة الهواء المضغوط",
    airCompressorTechnology: "تقنية الضاغط",
    electricConsumptionRatio: "نسبة الاستهلاك الكهربائي",
    compressedAirPrice: "سعر الهواء المضغوط",
    consumptionPrice: "سعر الاستهلاك",

    // Tab 4: Energy
    electricity: "الكهرباء",
    purchasePriceElectricity: "سعر شراء الكهرباء",
    sellingPriceElectricity: "سعر بيع الكهرباء",

    // Tab 5: Gas types
    naturalGasHType: "غاز طبيعي نوع H",
    naturalGasLType: "غاز طبيعي نوع L",
    processGas: "غاز العملية",
    natGasMolecule: "جزيء الغاز الطبيعي",
    co2Emission: "انبعاث CO2",

    // Tab 6: Steam
    steamSellingPrice: "سعر بيع البخار",
    steamHighPressure: "بخار الضغط العالي",
    steamLowPressureP1: "بخار الضغط المنخفض P1",
    steamLowPressureP2: "بخار الضغط المنخفض P2",
    fatalSteam: "بخار المخلفات",

    // Tab 7: Water types
    potableWater: "مياه الشرب",
    coolingWater: "مياه التبريد", 
    demineralizedWater: "مياه منزوعة المعادن",
    softWater: "مياه ناعمة",
    riverWater: "مياه النهر",

    // Tab 8: Byproducts
    byproductsShippingTreatment: "المنتجات الثانوية: الشحن + المعالجة",
    product: "المنتج",
    cost: "التكلفة",
    truckType: "نوع الشاحنة",
    distance: "المسافة",

    // Tab 10: Chemical reagents
    slakedLime: "الجير المطفأ Ca(OH)2",
    quickLime: "الجير الحي CaO",
    calciumCarbonate: "كربونات الكالسيوم CaCO3",
    bicarbonate: "بيكربونات HCO3",
    causticSoda: "الصودا الكاوية NaOH",
    sodiumBicarbonate: "بيكربونات الصوديوم NaHCO3",
    ammonia: "الأمونيا NH3",
    urea: "اليوريا",
    purity: "النقاء",
    co2PerTKm: "CO2 لكل ط·كم",
    co2PerDelivery: "CO2 لكل توصيل",

    // Chemical names mapping
    HCO3: "بيكربونات HCO3",
    NaOHCO3: "بيكربونات الصوديوم NaHCO3",
    NH3: "الأمونيا NH3",
    Urea: "اليوريا",
    NaBr_CaBr2: "بروميدات NaBr/CaBr2",
    CAP: "مسحوق الكربون المنشط",

    // Interface buttons
    reset: "إعادة تعيين",
    save: "حفظ",
    cancel: "إلغاء"
  }
};

/**
 * Supported language codes
 */
export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru', 'ar'];

/**
 * Get OPEX translations for a specific language code
 * @param {string} languageCode - The language code (fr, en, es, de, it, pt, zh, ja, ru, ar)
 * @returns {object} Translation object for the specified language
 */
export const getOPEXTranslations = (languageCode) => {
  // Validate language code
  if (!languageCode || typeof languageCode !== 'string') {
    console.warn('Invalid language code provided, falling back to English');
    return translations.en;
  }

  const normalizedLangCode = languageCode.toLowerCase().trim();
  
  // Return the translations for the requested language, fallback to English
  return translations[normalizedLangCode] || translations.en;
};

/**
 * Get a specific translated parameter
 * @param {string} parameter - The parameter key to translate
 * @param {string} languageCode - The language code
 * @returns {string} Translated parameter or original parameter if not found
 */
export const getTranslatedParameter = (parameter, languageCode = 'en') => {
  if (!parameter) return '';
  
  const t = getOPEXTranslations(languageCode);
  return t[parameter] || parameter;
};

/**
 * Check if a language is supported
 * @param {string} languageCode - The language code to check
 * @returns {boolean} True if language is supported
 */
export const isLanguageSupported = (languageCode) => {
  return SUPPORTED_LANGUAGES.includes(languageCode?.toLowerCase?.());
};

/**
 * Get all available translations for a specific parameter
 * @param {string} parameter - The parameter key
 * @returns {object} Object with all language translations for the parameter
 */
export const getAllTranslationsForParameter = (parameter) => {
  const result = {};
  SUPPORTED_LANGUAGES.forEach(lang => {
    const t = getOPEXTranslations(lang);
    result[lang] = t[parameter] || parameter;
  });
  return result;
};

/**
 * Get the default language fallback
 * @returns {string} Default language code
 */
export const getDefaultLanguage = () => 'en';

/**
 * Format a translated string with parameters
 * @param {string} translationKey - The translation key
 * @param {string} languageCode - The language code
 * @param {object} params - Parameters to substitute in the translation
 * @returns {string} Formatted translated string
 */
export const formatTranslation = (translationKey, languageCode, params = {}) => {
  let translation = getTranslatedParameter(translationKey, languageCode);
  
  // Simple parameter substitution for {key} patterns
  Object.keys(params).forEach(key => {
    const pattern = new RegExp(`\\{${key}\\}`, 'g');
    translation = translation.replace(pattern, params[key]);
  });
  
  return translation;
};

/**
 * Validate translation completeness for a language
 * @param {string} languageCode - Language code to validate
 * @returns {object} Validation result with missing keys
 */
export const validateTranslations = (languageCode) => {
  const baseTranslations = translations.en; // Use English as reference
  const targetTranslations = translations[languageCode];
  
  if (!targetTranslations) {
    return {
      isComplete: false,
      missingKeys: Object.keys(baseTranslations),
      completeness: 0
    };
  }
  
  const baseKeys = Object.keys(baseTranslations);
  const targetKeys = Object.keys(targetTranslations);
  const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
  
  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    completeness: ((baseKeys.length - missingKeys.length) / baseKeys.length) * 100
  };
};

// Export the main translations object as default
export default translations;