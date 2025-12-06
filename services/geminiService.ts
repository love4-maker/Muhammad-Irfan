import { GoogleGenAI } from "@google/genai";
import { FarmData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFarmAdvice = async (data: FarmData): Promise<string> => {
  try {
    const totalPesticide = (data.acres * data.pesticideCost) + data.pesticideLabourCost;
    const totalWater = data.waterCost + data.abyanaCost + data.waterLabourCost;
    const totalFertilizer = (data.acres * data.fertilizerCostPerAcre) + data.fertilizerLabourCost;
    
    // Calculate Harvest Totals
    let totalHarvestLabour = 0;
    let totalIncome = 0;
    
    data.harvests.forEach(row => {
      totalHarvestLabour += row.production * row.labourCost;
      totalIncome += row.production * row.rate;
    });

    // Total calculation: Seed + Prep + Pesticide + Water + Fertilizer + FYM + Harvest Labour
    const totalCost = (data.acres * data.seedCost) + 
                      (data.acres * data.landPrepCost) + 
                      totalPesticide + 
                      totalWater + 
                      totalFertilizer +
                      data.fymCost +
                      totalHarvestLabour;

    const netProfit = totalIncome - totalCost;

    const prompt = `
      I am a farmer planning my budget for Cotton farming. Here are my details:
      - Land Size: ${data.acres} Acres
      
      **Projected Yield & Income:**
      - Total Estimated Income: ${totalIncome}
      - Total Harvest Labour Cost: ${totalHarvestLabour}
      - Net Profit: ${netProfit}
      
      **Direct Costs:**
      - Seed Cost: ${data.seedCost} per Acre
      - Land Preparation: ${data.landPrepCost} per Acre
      
      **Protection & Nutrition:**
      - Pesticide Cost: ${data.pesticideCost} per Acre
      - Fertilizer Cost: ${data.fertilizerCostPerAcre} per Acre
      - FYM: ${data.fymCost} (Total)
      
      **Summary:**
      - Total Expenses: ${totalCost}
      - Total Revenue: ${totalIncome}

      Please analyze this data and provide:
      1. A financial health check (Profitability analysis).
      2. 3 actionable tips to improve Cotton yield (Munds) or reduce input costs.
      
      Keep the tone professional, encouraging, and concise. Format with clear headings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    throw new Error("Failed to get advice from Gemini.");
  }
};