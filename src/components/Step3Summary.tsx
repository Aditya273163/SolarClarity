import { motion } from 'motion/react';
import { 
  Sun, 
  IndianRupee, 
  Leaf, 
  TrendingUp, 
  Clock, 
  PanelTop, 
  Info, 
  Download, 
  RefreshCcw, 
  CheckCircle2,
  Zap,
  TreeDeciduous
} from 'lucide-react';
import { SolarData } from '../types';
import { SOLAR_CONSTANTS, DISCLAIMER } from '../constants';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  data: SolarData;
  onReset: () => void;
  key?: string;
}

export default function Step3Summary({ data, onReset }: Props) {
  const chartData = [
    { name: '1 Year', savings: data.annualSavings },
    { name: '5 Years', savings: data.savings5Yr },
    { name: '10 Years', savings: data.savings10Yr },
    { name: '25 Years', savings: data.annualSavings * 25 },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto w-full px-6 py-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Your Solar Report is Ready
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">SolarClarity Summary</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save PDF
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section A: Ideal Setup */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900">Your Ideal Solar Setup</h3>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended</div>
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">System Size</p>
                <p className="text-3xl font-black text-slate-900">{data.systemSizeKw} <span className="text-lg text-slate-400">kW</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Generation</p>
                <p className="text-3xl font-black text-slate-900">{data.monthlyGeneration} <span className="text-lg text-slate-400">units</span></p>
                <p className="text-[10px] text-slate-400 font-medium">per month</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Panels</p>
                <p className="text-3xl font-black text-slate-900">~{data.numPanels}</p>
                <p className="text-[10px] text-slate-400 font-medium">400W each</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Space Needed</p>
                <p className="text-3xl font-black text-slate-900">{data.spaceRequired}</p>
                <p className="text-[10px] text-slate-400 font-medium">sq. ft. required</p>
              </div>
            </div>
          </div>

          {/* Section C: Savings Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">Cumulative Savings Projection</h3>
              </div>
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ₹7.0 / unit tariff
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                            <p className="text-xs font-bold opacity-60 uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg font-black">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="savings" radius={[8, 8, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#059669' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Solar panels typically last 25+ years. Your total savings over the lifetime of the system could exceed <span className="font-bold text-slate-900">{formatCurrency(data.annualSavings * 25)}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Financials & Impact */}
        <div className="space-y-8">
          {/* Section B: Financial Breakdown */}
          <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden text-white">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <IndianRupee className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold">Financial Breakdown</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total System Cost</span>
                <span className="font-bold">{formatCurrency(data.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-400">PM Surya Ghar Subsidy</span>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-slate-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Subsidy is credited to your bank account within 30 days of commissioning.
                    </div>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">- {formatCurrency(data.subsidy)}</span>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">Your Net Cost</span>
                  <span className="text-3xl font-black">{formatCurrency(data.netCost)}</span>
                </div>
                <p className="text-[10px] text-slate-500 text-right italic">Estimated out-of-pocket expense</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-amber-400/20 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Payback Period</p>
                  <p className="text-xl font-black text-white">{data.paybackYears} <span className="text-sm font-bold text-slate-500 uppercase">Years</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Environmental Impact */}
          <div className="bg-emerald-600 rounded-3xl shadow-lg shadow-emerald-100 overflow-hidden text-white">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Green Impact</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">CO₂ Avoided</p>
                <p className="text-4xl font-black">{data.annualCo2.toLocaleString()} <span className="text-lg opacity-60">kg</span></p>
                <p className="text-xs text-emerald-100">Every single year</p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                <TreeDeciduous className="w-10 h-10 text-emerald-200" />
                <div>
                  <p className="text-sm font-medium leading-tight">Equivalent to planting <span className="font-black text-white text-lg">{data.equivalentTrees}</span> trees every year!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-4">What's Next?</h3>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          You can now talk to any empanelled solar vendor with this report. They will perform a technical site survey to confirm these estimates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://pmsuryaghar.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Visit PM Surya Ghar Portal
            <Zap className="w-4 h-4" />
          </a>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Download Full Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}
