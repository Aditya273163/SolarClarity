export interface SolarData {
  monthlyUnits: number;
  roofAreaSqFt: number;
  systemSizeKw: number;
  monthlyGeneration: number;
  spaceRequired: number;
  numPanels: number;
  totalCost: number;
  subsidy: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  savings5Yr: number;
  savings10Yr: number;
  paybackYears: number;
  annualCo2: number;
  equivalentTrees: number;
}

export type WizardStep = 'landing' | 'bill' | 'roof' | 'summary';
