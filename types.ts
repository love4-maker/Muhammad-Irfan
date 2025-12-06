export interface CalculationResult {
  totalSeedCost: number;
  totalLandPrepCost: number;
  totalCost: number;
}

export interface HarvestRow {
  id: number;
  production: number; // Munds
  rate: number;       // Price per Mund
  labourCost: number; // Harvest labour per Mund
}

export interface FarmData {
  acres: number;
  seedCost: number;
  landPrepCost: number;
  pesticideCost: number;
  pesticideLabourCost: number;
  waterCost: number;
  abyanaCost: number;
  waterLabourCost: number;
  fertilizerCostPerAcre: number;
  fertilizerLabourCost: number;
  fymCost: number;
  harvests: HarvestRow[];
}

export enum AdviceStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}