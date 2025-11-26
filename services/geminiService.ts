
import { GoogleGenAI } from "@google/genai";
import { Asset, Language, AssetCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const isLiability = (category: AssetCategory) => {
  return [AssetCategory.Loan, AssetCategory.CreditCard, AssetCategory.PersonalLoan].includes(category);
};

export const analyzePortfolio = async (assets: Asset[], netWorth: number, language: Language): Promise<string> => {
  try {
    const totalAssets = assets
      .filter(a => !isLiability(a.category))
      .reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

    const totalLiabilities = assets
      .filter(a => isLiability(a.category))
      .reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

    const monthlyIncome = assets
      .filter(a => !isLiability(a.category))
      .reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.interestRate / 100) / 12), 0);

    const monthlyInterest = assets
      .filter(a => isLiability(a.category))
      .reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.interestRate / 100) / 12), 0);

    // Grouping logic for prompt
    const uniqueLocations = [...new Set(assets.map(a => a.location || 'Unassigned'))];
    let locationRiskSummary = "";

    uniqueLocations.forEach(loc => {
      const locAssets = assets.filter(a => (a.location || 'Unassigned') === loc);
      const collateralAssets = locAssets.filter(a => !isLiability(a.category) && a.isCollateral);
      const debt = locAssets.filter(a => isLiability(a.category)).reduce((s, a) => s + (a.quantity * a.currentPrice), 0);
      
      const collateralValue = collateralAssets.reduce((s, a) => s + (a.quantity * a.currentPrice), 0);
      
      // Calculate Weighted Limits
      const totalBorrowPower = collateralAssets.reduce((s, a) => s + (a.quantity * a.currentPrice * ((a.maxLTV || 0) / 100)), 0);
      const totalLiquidationPoint = collateralAssets.reduce((s, a) => s + (a.quantity * a.currentPrice * ((a.liquidationThreshold || 0) / 100)), 0);

      if (collateralValue > 0 || debt > 0) {
        const currentLTV = collateralValue > 0 ? (debt / collateralValue * 100).toFixed(1) : "N/A";
        const weightedMaxLTV = collateralValue > 0 ? (totalBorrowPower / collateralValue * 100).toFixed(1) : "0";
        const weightedLiqLTV = collateralValue > 0 ? (totalLiquidationPoint / collateralValue * 100).toFixed(1) : "0";

        locationRiskSummary += `\n- Location: ${loc}
  * Debt: $${debt.toFixed(0)}
  * Collateral: $${collateralValue.toFixed(0)}
  * Current LTV: ${currentLTV}%
  * Max Safe LTV: ${weightedMaxLTV}%
  * Liquidation LTV: ${weightedLiqLTV}%`;
      }
    });

    const portfolioDesc = assets.map(a => {
      const value = a.quantity * a.currentPrice;
      const role = isLiability(a.category) ? "LIABILITY" : (a.isCollateral ? "ASSET (PLEDGED)" : "ASSET");
      const limits = a.isCollateral ? `[MaxLTV: ${a.maxLTV}%, Liq: ${a.liquidationThreshold}%]` : "";
      return `- ${role}: ${a.name} (${a.symbol}) | Val: $${value.toFixed(0)} | Loc: ${a.location || 'N/A'} | ${limits}`;
    }).join('\n');

    const langInstruction = language === 'zh' 
      ? "IMPORTANT: Please answer entirely in Traditional Chinese (Taiwan)." 
      : "Please answer in English.";

    const prompt = `
      Act as a senior financial risk manager. Analyze the following portfolio structure:
      
      Total Net Worth: $${netWorth.toFixed(2)}
      Total Assets: $${totalAssets.toFixed(2)}
      Total Debt: $${totalLiabilities.toFixed(2)}
      
      Projected Monthly Passive Income: $${monthlyIncome.toFixed(2)}
      Projected Monthly Interest Cost: $${monthlyInterest.toFixed(2)}
      Net Monthly Cash Flow: $${(monthlyIncome - monthlyInterest).toFixed(2)}
      
      Risk Groups (Detailed LTV Analysis per Location):
      ${locationRiskSummary}

      Full Holdings:
      ${portfolioDesc}
      
      ${langInstruction}
      
      Please provide a concise analysis (max 300 words) covering:
      1. **Liquidation Risk**: Analyze locations where 'Current LTV' is close to 'Liquidation LTV'.
      2. **Borrowing Efficiency**: Are any groups under-utilized (Low LTV vs Max Safe LTV)?
      3. **Debt Sustainability**: Comment on interest costs vs income.
      4. **Safety Margin**: Provide a warning if any group has less than 10% buffer before liquidation.
      
      Format the response in Markdown with bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return language === 'zh' 
      ? "無法連接 AI 顧問。請檢查您的 API 金鑰或稍後再試。" 
      : "Error connecting to AI Advisor. Please check your API key or try again later.";
  }
};
