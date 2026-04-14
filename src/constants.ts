export const SOLAR_CONSTANTS = {
  UNITS_PER_KW_PER_MONTH: 120,
  AREA_PER_KW_SQFT: 100,
  COST_PER_KW: 65000,
  TARIFF_PER_UNIT: 7.0, // Average UP domestic tariff
  CO2_PER_KWH: 0.8, // kg
  CO2_PER_TREE: 25, // kg per tree per year
  PANEL_WATTAGE: 400, // Watts per panel
};

export const SUBSIDY_RULES = {
  UP_TO_2KW: 30000, // per kW
  BEYOND_2KW_UP_TO_3KW: 18000, // per kW for the extra 1kW
  MAX_SUBSIDY: 78000,
};

export const DISCLAIMER = "Calculations are estimates based on average UP grid tariffs and average solar irradiance. Actual generation and savings may vary.";
