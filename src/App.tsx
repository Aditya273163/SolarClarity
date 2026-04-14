/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Upload, Map as MapIcon, Calculator, ChevronRight, Info, Leaf, IndianRupee, Zap } from 'lucide-react';
import { WizardStep, SolarData } from './types';
import { SOLAR_CONSTANTS, SUBSIDY_RULES, DISCLAIMER } from './constants';
import Step1BillUpload from './components/Step1BillUpload';
import Step2RoofMarking from './components/Step2RoofMarking';
import Step3Summary from './components/Step3Summary';
import { cn } from './lib/utils';

export default function App() {
  const [step, setStep] = useState<WizardStep>('landing');
  const [data, setData] = useState<Partial<SolarData>>({
    monthlyUnits: 0,
    roofAreaSqFt: 0,
  });

  const calculateSolarResults = (units: number, area: number): SolarData => {
    const sCons = units / SOLAR_CONSTANTS.UNITS_PER_KW_PER_MONTH;
    const sRoof = area / SOLAR_CONSTANTS.AREA_PER_KW_SQFT;
    const sRaw = Math.min(sCons, sRoof);
    const s = Math.round(sRaw * 2) / 2; // Round to nearest 0.5 kW

    const monthlyGeneration = s * SOLAR_CONSTANTS.UNITS_PER_KW_PER_MONTH;
    const spaceRequired = s * SOLAR_CONSTANTS.AREA_PER_KW_SQFT;
    const numPanels = Math.round((s * 1000) / SOLAR_CONSTANTS.PANEL_WATTAGE);

    const totalCost = s * SOLAR_CONSTANTS.COST_PER_KW;
    
    let subsidy = 0;
    if (s <= 2) {
      subsidy = s * SUBSIDY_RULES.UP_TO_2KW;
    } else if (s <= 3) {
      subsidy = 60000 + (s - 2) * SUBSIDY_RULES.BEYOND_2KW_UP_TO_3KW;
    } else {
      subsidy = SUBSIDY_RULES.MAX_SUBSIDY;
    }

    const netCost = totalCost - subsidy;
    const monthlySavings = monthlyGeneration * SOLAR_CONSTANTS.TARIFF_PER_UNIT;
    const annualSavings = monthlySavings * 12;
    const paybackYears = annualSavings > 0 ? Number((netCost / annualSavings).toFixed(1)) : 0;

    const annualCo2 = monthlyGeneration * 12 * SOLAR_CONSTANTS.CO2_PER_KWH;
    const equivalentTrees = Math.round(annualCo2 / SOLAR_CONSTANTS.CO2_PER_TREE);

    return {
      monthlyUnits: units,
      roofAreaSqFt: area,
      systemSizeKw: s,
      monthlyGeneration,
      spaceRequired,
      numPanels,
      totalCost,
      subsidy,
      netCost,
      monthlySavings,
      annualSavings,
      savings5Yr: annualSavings * 5,
      savings10Yr: annualSavings * 10,
      paybackYears,
      annualCo2,
      equivalentTrees,
    };
  };

  const handleBillConfirm = (units: number) => {
    setData(prev => ({ ...prev, monthlyUnits: units }));
    setStep('roof');
  };

  const handleRoofConfirm = (area: number) => {
    const finalData = calculateSolarResults(data.monthlyUnits || 0, area);
    setData(finalData);
    setStep('summary');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('landing')}>
            <div className="bg-amber-100 p-2 rounded-lg">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SolarClarity</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className={cn(step === 'bill' && "text-amber-600")}>1. Bill Upload</span>
            <span className={cn(step === 'roof' && "text-amber-600")}>2. Roof Area</span>
            <span className={cn(step === 'summary' && "text-amber-600")}>3. Results</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3" />
                UPPCL Homeowners Special
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                See your ideal solar size, cost, and savings in <span className="text-amber-600">2 minutes.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl">
                The most neutral, easy-to-understand solar calculator for Uttar Pradesh. No vendors, no sales pitch—just clarity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
                {[
                  { icon: Upload, title: "Upload Bill", desc: "We extract your units automatically" },
                  { icon: MapIcon, title: "Mark Roof", desc: "Draw your roof area on the map" },
                  { icon: Calculator, title: "Get Results", desc: "See costs, subsidies & payback" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="bg-slate-50 p-3 rounded-xl mb-4">
                      <item.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('bill')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-amber-200 transition-all flex items-center gap-2 text-lg"
              >
                Start with My UPPCL Bill
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.section>
          )}

          {step === 'bill' && (
            <Step1BillUpload 
              key="bill" 
              onConfirm={handleBillConfirm} 
              onBack={() => setStep('landing')} 
            />
          )}

          {step === 'roof' && (
            <Step2RoofMarking 
              key="roof" 
              onConfirm={handleRoofConfirm} 
              onBack={() => setStep('bill')} 
            />
          )}

          {step === 'summary' && data.systemSizeKw && (
            <Step3Summary 
              key="summary" 
              data={data as SolarData} 
              onReset={() => setStep('landing')} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-white">SolarClarity</span>
          </div>
          <p className="text-xs text-center md:text-left max-w-md">
            {DISCLAIMER}
          </p>
          <div className="flex gap-4 text-xs font-medium">
            <span>© 2024 SolarClarity</span>
            <span className="text-slate-600">|</span>
            <span>Made for UP Homeowners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
