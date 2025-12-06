import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tractor, 
  Sprout, 
  Coins, 
  Leaf, 
  TrendingUp, 
  Loader2, 
  AlertCircle,
  Scale,
  DollarSign,
  Calculator,
  SprayCan,
  Users,
  Droplets,
  FileText,
  Package,
  Truck,
  Wheat,
  ClipboardList
} from 'lucide-react';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import { getFarmAdvice } from './services/geminiService';
import { FarmData, AdviceStatus, HarvestRow } from './types';
import { 
  APP_TITLE, 
  APP_SUBTITLE, 
  DEFAULT_ACRES, 
  DEFAULT_SEED_COST, 
  DEFAULT_LAND_PREP_COST,
  DEFAULT_PESTICIDE_COST,
  DEFAULT_PESTICIDE_LABOUR_COST,
  DEFAULT_WATER_COST,
  DEFAULT_ABYANA_COST,
  DEFAULT_WATER_LABOUR_COST,
  DEFAULT_FERTILIZER_COST_PER_ACRE,
  DEFAULT_FERTILIZER_LABOUR_COST,
  DEFAULT_FYM_COST,
  DEFAULT_HARVESTS
} from './constants';

const App: React.FC = () => {
  // State for inputs
  const [acres, setAcres] = useState<number>(DEFAULT_ACRES);
  const [seedCost, setSeedCost] = useState<number>(DEFAULT_SEED_COST);
  const [landPrepCost, setLandPrepCost] = useState<number>(DEFAULT_LAND_PREP_COST);
  const [pesticideCost, setPesticideCost] = useState<number>(DEFAULT_PESTICIDE_COST);
  const [pesticideLabourCost, setPesticideLabourCost] = useState<number>(DEFAULT_PESTICIDE_LABOUR_COST);
  
  // Water specific states
  const [waterCost, setWaterCost] = useState<number>(DEFAULT_WATER_COST);
  const [abyanaCost, setAbyanaCost] = useState<number>(DEFAULT_ABYANA_COST);
  const [waterLabourCost, setWaterLabourCost] = useState<number>(DEFAULT_WATER_LABOUR_COST);

  // Fertilizer specific states
  const [fertilizerCostPerAcre, setFertilizerCostPerAcre] = useState<number>(DEFAULT_FERTILIZER_COST_PER_ACRE);
  const [fertilizerLabourCost, setFertilizerLabourCost] = useState<number>(DEFAULT_FERTILIZER_LABOUR_COST);

  // FYM State
  const [fymCost, setFymCost] = useState<number>(DEFAULT_FYM_COST);

  // Harvest Table State
  const [harvests, setHarvests] = useState<HarvestRow[]>(DEFAULT_HARVESTS);

  // State for calculations
  const [totalSeedCost, setTotalSeedCost] = useState<number>(0);
  const [totalLandPrepCost, setTotalLandPrepCost] = useState<number>(0);
  const [totalPesticideCost, setTotalPesticideCost] = useState<number>(0);
  const [totalWaterExpenses, setTotalWaterExpenses] = useState<number>(0);
  const [totalFertilizerCost, setTotalFertilizerCost] = useState<number>(0);
  
  const [totalHarvestLabourCost, setTotalHarvestLabourCost] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  
  const [grandTotalCost, setGrandTotalCost] = useState<number>(0);

  // State for AI advice
  const [adviceStatus, setAdviceStatus] = useState<AdviceStatus>(AdviceStatus.IDLE);
  const [adviceText, setAdviceText] = useState<string>("");

  // Calculation Effect
  useEffect(() => {
    const seedTotal = acres * seedCost;
    const prepTotal = acres * landPrepCost;
    
    // Formula: (Pesticide Per Acre * Acres) + Labour Total
    const pestTotal = (acres * pesticideCost) + pesticideLabourCost;
    
    // Formula: Water + Abyana + Water Labour
    const waterTotal = waterCost + abyanaCost + waterLabourCost;

    // Formula: (Fertilizer Per Acre * Acres) + Labour Total
    const fertTotal = (acres * fertilizerCostPerAcre) + fertilizerLabourCost;

    // Harvest Calculations
    let harvestLabourSum = 0;
    let incomeSum = 0;

    harvests.forEach(row => {
      // Col 4 Logic: Production * Harvest Labour Rate
      harvestLabourSum += (row.production || 0) * (row.labourCost || 0);
      
      // Col 5 Logic: Production * Cotton Rate
      incomeSum += (row.production || 0) * (row.rate || 0);
    });

    setTotalSeedCost(seedTotal);
    setTotalLandPrepCost(prepTotal);
    setTotalPesticideCost(pestTotal);
    setTotalWaterExpenses(waterTotal);
    setTotalFertilizerCost(fertTotal);
    
    setTotalHarvestLabourCost(harvestLabourSum);
    setTotalIncome(incomeSum);

    // Grand Total now includes Harvest Labour
    setGrandTotalCost(seedTotal + prepTotal + pestTotal + waterTotal + fertTotal + fymCost + harvestLabourSum);
  }, [
    acres, seedCost, landPrepCost, 
    pesticideCost, pesticideLabourCost, 
    waterCost, abyanaCost, waterLabourCost,
    fertilizerCostPerAcre, fertilizerLabourCost,
    fymCost, harvests
  ]);

  // Handler for AI Advice
  const handleGetAdvice = useCallback(async () => {
    if (acres <= 0) return;
    
    setAdviceStatus(AdviceStatus.LOADING);
    setAdviceText("");

    try {
      const data: FarmData = { 
        acres, 
        seedCost, 
        landPrepCost,
        pesticideCost,
        pesticideLabourCost,
        waterCost,
        abyanaCost,
        waterLabourCost,
        fertilizerCostPerAcre,
        fertilizerLabourCost,
        fymCost,
        harvests
      };
      const advice = await getFarmAdvice(data);
      setAdviceText(advice);
      setAdviceStatus(AdviceStatus.SUCCESS);
    } catch (error) {
      setAdviceStatus(AdviceStatus.ERROR);
    }
  }, [
    acres, seedCost, landPrepCost, 
    pesticideCost, pesticideLabourCost, 
    waterCost, abyanaCost, waterLabourCost,
    fertilizerCostPerAcre, fertilizerLabourCost,
    fymCost, harvests
  ]);

  // Handle Harvest Table Changes
  const handleHarvestChange = (id: number, field: keyof HarvestRow, value: number) => {
    setHarvests(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // --- Manual Total Handlers (Logic from previous steps) ---
  const handleTotalSeedCostChange = (newTotal: number) => {
    if (acres > 0) setSeedCost(newTotal / acres);
    setTotalSeedCost(newTotal);
  };
  const handleTotalLandPrepCostChange = (newTotal: number) => {
    if (acres > 0) setLandPrepCost(newTotal / acres);
    setTotalLandPrepCost(newTotal);
  };
  const handleTotalPesticideCostChange = (newTotal: number) => {
    if (acres > 0) {
      const newRate = (newTotal - pesticideLabourCost) / acres;
      setPesticideCost(newRate);
    }
    setTotalPesticideCost(newTotal);
  };
  const handleTotalWaterExpensesChange = (newTotal: number) => {
    const newWaterCost = newTotal - abyanaCost - waterLabourCost;
    setWaterCost(newWaterCost);
    setTotalWaterExpenses(newTotal);
  };
  const handleTotalFertilizerCostChange = (newTotal: number) => {
    if (acres > 0) {
      const newRate = (newTotal - fertilizerLabourCost) / acres;
      setFertilizerCostPerAcre(newRate);
    }
    setTotalFertilizerCost(newTotal);
  };

  // Calculated values for Goshwara
  const netProfit = totalIncome - grandTotalCost;
  const perAcreExpenses = acres > 0 ? grandTotalCost / acres : 0;
  const perAcreIncome = acres > 0 ? totalIncome / acres : 0;
  const perAcreNetProfit = acres > 0 ? netProfit / acres : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-xs text-gray-500">{APP_SUBTITLE}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Tractor className="h-5 w-5 text-green-600" />
                Farm Cost Inputs
              </h2>
              
              <div className="space-y-6">
                {/* Input 1: Acres */}
                <InputGroup
                  label="Land Area (Acres)"
                  value={acres}
                  onChange={setAcres}
                  icon={Sprout}
                  unit="Acres"
                  placeholder="e.g. 10"
                />

                {/* Input 2: Seed Cost Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Seed Expenses</h3>
                  <InputGroup
                    label="Seed Cost (Per Acre)"
                    value={seedCost}
                    onChange={setSeedCost}
                    icon={Sprout}
                    unit="Currency"
                    step={100}
                    placeholder="e.g. 2500"
                  />
                  <InputGroup
                    label="Total Seed Cost"
                    value={totalSeedCost}
                    onChange={handleTotalSeedCostChange}
                    icon={Calculator}
                    unit="Currency"
                    readOnly={false}
                  />
                </div>

                {/* Input 3: Land Prep Cost Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Land Preparation</h3>
                  <InputGroup
                    label="Prep Cost (Per Acre)"
                    value={landPrepCost}
                    onChange={setLandPrepCost}
                    icon={Tractor}
                    unit="Currency"
                    step={100}
                    placeholder="e.g. 5000"
                  />
                  <InputGroup
                    label="Total Prep Cost"
                    value={totalLandPrepCost}
                    onChange={handleTotalLandPrepCostChange}
                    icon={Calculator}
                    unit="Currency"
                    readOnly={false}
                  />
                </div>

                {/* Input 4: Pesticide & Labour Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Pesticide & Labour</h3>
                  <InputGroup
                    label="Pesticide Cost (Per Acre)"
                    value={pesticideCost}
                    onChange={setPesticideCost}
                    icon={SprayCan}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Labour Cost (Total)"
                    value={pesticideLabourCost}
                    onChange={setPesticideLabourCost}
                    icon={Users}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Total Pesticide Cost"
                    value={totalPesticideCost}
                    onChange={handleTotalPesticideCostChange} 
                    icon={Calculator}
                    unit="Currency"
                    readOnly={false}
                  />
                </div>

                {/* Input 5: Water Expenses Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Water Expenses</h3>
                  <InputGroup
                    label="Water Cost"
                    value={waterCost}
                    onChange={setWaterCost}
                    icon={Droplets}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Abyana"
                    value={abyanaCost}
                    onChange={setAbyanaCost}
                    icon={FileText}
                    unit="Currency"
                    step={50}
                  />
                  <InputGroup
                    label="Labour Cost"
                    value={waterLabourCost}
                    onChange={setWaterLabourCost}
                    icon={Users}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Total Water Expenses"
                    value={totalWaterExpenses}
                    onChange={handleTotalWaterExpensesChange}
                    icon={Calculator}
                    unit="Currency"
                    readOnly={false}
                    placeholder="Sum of above"
                  />
                </div>

                {/* Input 6: Fertilizer Expenses Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Fertilizer Expenses</h3>
                  <InputGroup
                    label="Cost Per Acre"
                    value={fertilizerCostPerAcre}
                    onChange={setFertilizerCostPerAcre}
                    icon={Package}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Labour Cost"
                    value={fertilizerLabourCost}
                    onChange={setFertilizerLabourCost}
                    icon={Users}
                    unit="Currency"
                    step={100}
                  />
                  <InputGroup
                    label="Total Fertilizer Cost"
                    value={totalFertilizerCost}
                    onChange={handleTotalFertilizerCostChange}
                    icon={Calculator}
                    unit="Currency"
                    readOnly={false}
                    placeholder="Mat. x Acres + Labour"
                  />
                </div>

                {/* Input 7: FYM Expenses Group */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">FYM Expenses</h3>
                  <InputGroup
                    label="FYM Cost (Total)"
                    value={fymCost}
                    onChange={setFymCost}
                    icon={Truck}
                    unit="Currency"
                    step={100}
                  />
                </div>

                {/* Input 9: Goshwara (Summary) - MOVED UP */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Goshwara (Summary)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Per Acre</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">{perAcreExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">{perAcreIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                           <td className={`px-4 py-3 text-sm text-right font-bold ${perAcreNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {perAcreNetProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                           <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                           <td className="px-4 py-3 text-sm text-right font-bold text-red-700">{grandTotalCost.toLocaleString()}</td>
                           <td className="px-4 py-3 text-sm text-right font-bold text-green-700">{totalIncome.toLocaleString()}</td>
                           <td className={`px-4 py-3 text-sm text-right font-bold text-lg ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                             {netProfit.toLocaleString()}
                           </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Input 8: Cotton Production & Income Table - MOVED DOWN */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-green-600">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wheat className="h-4 w-4" />
                      Cotton Production & Income
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Production (Munds)</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Rate (Rs)</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Labour (Harvest)</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] bg-red-50">Total Harv. Cost</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] bg-green-50">Total Income</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {harvests.map((row, index) => (
                          <tr key={row.id}>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                value={row.production || ''}
                                onChange={(e) => handleHarvestChange(row.id, 'production', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-1"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                value={row.rate || ''}
                                onChange={(e) => handleHarvestChange(row.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-1"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                value={row.labourCost || ''}
                                onChange={(e) => handleHarvestChange(row.id, 'labourCost', parseFloat(e.target.value) || 0)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-1"
                                placeholder="0"
                              />
                            </td>
                            {/* Col 4: Production * Harvest Labour */}
                            <td className="px-3 py-2 text-sm text-gray-700 bg-red-50 font-medium">
                              {(row.production * row.labourCost).toLocaleString()}
                            </td>
                            {/* Col 5: Production * Rate */}
                            <td className="px-3 py-2 text-sm text-gray-700 bg-green-50 font-medium">
                              {(row.production * row.rate).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                         <tr>
                           <td colSpan={3} className="px-4 py-2 text-xs font-bold text-gray-600 text-right">Totals:</td>
                           <td className="px-3 py-2 text-sm font-bold text-red-600">{totalHarvestLabourCost.toLocaleString()}</td>
                           <td className="px-3 py-2 text-sm font-bold text-green-600">{totalIncome.toLocaleString()}</td>
                         </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Stats Summary for Mobile */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 lg:hidden">
              <p className="text-sm text-green-800 font-medium text-center mb-1">
                Total Expenses: <span className="font-bold">{grandTotalCost.toLocaleString()}</span>
              </p>
              <p className="text-sm text-green-800 font-medium text-center">
                Total Income: <span className="font-bold">{totalIncome.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Results & AI */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultCard
                label="Total Seed Cost"
                value={`${totalSeedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`For ${acres} acres`}
                type="cost"
                icon={Sprout}
              />
              <ResultCard
                label="Total Land Prep Cost"
                value={`${totalLandPrepCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`For ${acres} acres`}
                type="cost"
                icon={Tractor}
              />
              <ResultCard
                label="Total Pesticide Cost"
                value={`${totalPesticideCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`Includes Labour`}
                type="cost"
                icon={SprayCan}
              />
              <ResultCard
                label="Total Water Expenses"
                value={`${totalWaterExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`Water + Abyana + Labour`}
                type="cost"
                icon={Droplets}
              />
               <ResultCard
                label="Total Fertilizer Cost"
                value={`${totalFertilizerCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`Mat. + Labour`}
                type="cost"
                icon={Package}
              />
               <ResultCard
                label="Total FYM Cost"
                value={`${fymCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`Farm Yard Manure`}
                type="cost"
                icon={Truck}
              />
               {/* Harvest Specific Cards */}
               <ResultCard
                label="Harvest Labour Cost"
                value={`${totalHarvestLabourCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`Picking/Harvesting`}
                type="cost"
                icon={Users}
              />
               <ResultCard
                label="Total Estimated Income"
                value={`${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`From Cotton Sales`}
                type="income"
                icon={Coins}
              />

              {/* Grand Total Expenses */}
              <div className="sm:col-span-2 sm:col-start-1">
                <ResultCard
                  label="Total Expenses"
                  value={`${grandTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  subValue="Total Investment Required"
                  type="total"
                  icon={Calculator}
                />
              </div>

               {/* Net Profit */}
               <div className="sm:col-span-2 sm:col-start-1">
                <div className={`relative overflow-hidden rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg ${totalIncome - grandTotalCost >= 0 ? 'bg-green-700' : 'bg-red-700'} text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80">
                          Projected Net Profit
                        </p>
                        <h3 className="mt-2 text-3xl font-bold tracking-tight">
                          {(totalIncome - grandTotalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                          Total Income - Total Expenses
                        </p>
                      </div>
                      <div className="rounded-full p-3 bg-white/20">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
              </div>

            </div>

            {/* AI Analysis Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Farm Analysis
                </h2>
                {adviceStatus === AdviceStatus.SUCCESS && (
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Analysis Ready
                  </span>
                )}
              </div>

              {adviceStatus === AdviceStatus.IDLE && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Leaf className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Get AI-powered tips on how to optimize your farming budget and reduce initial costs.
                  </p>
                  <button
                    onClick={handleGetAdvice}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Analyze Farm Profitability
                  </button>
                </div>
              )}

              {adviceStatus === AdviceStatus.LOADING && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Analyzing your budget...</p>
                  <p className="text-sm text-gray-400 mt-1">This usually takes a few seconds.</p>
                </div>
              )}

              {adviceStatus === AdviceStatus.ERROR && (
                <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium mb-2">Analysis Failed</p>
                  <button
                    onClick={handleGetAdvice}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {adviceStatus === AdviceStatus.SUCCESS && (
                <div className="prose prose-green max-w-none">
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 text-gray-800">
                    <div className="markdown-content whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {adviceText}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleGetAdvice}
                      className="text-sm text-gray-500 hover:text-green-600 flex items-center gap-1 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Refresh Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;