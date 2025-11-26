
import { Asset, AssetCategory } from "../types";

// Helper to determine category from string
const parseCategory = (cat: string): AssetCategory => {
  const map: Record<string, AssetCategory> = {
    'Stock': AssetCategory.Stock,
    'Bond': AssetCategory.Bond,
    'Crypto': AssetCategory.Crypto,
    'Cash': AssetCategory.Cash,
    'Real Estate': AssetCategory.RealEstate,
    'ETF': AssetCategory.ETF,
    'Loan': AssetCategory.Loan,
    'Credit Card': AssetCategory.CreditCard,
    'Personal Loan': AssetCategory.PersonalLoan
  };
  // Default to Stock if unknown
  return map[cat] || Object.values(AssetCategory).find(c => c.toLowerCase() === cat.toLowerCase()) || AssetCategory.Stock;
};

export const fetchSheetData = async (spreadsheetId: string, range: string): Promise<Asset[]> => {
  const apiKey = process.env.API_KEY; // Using the same key for simplicity, assuming it has Sheets API enabled
  
  if (!apiKey || !spreadsheetId) {
    throw new Error("Missing API Key or Spreadsheet ID");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.values || data.values.length === 0) {
      return [];
    }

    // Expected Sheet Column Order:
    // A: Symbol, B: Name, C: Category, D: Location, E: Qty, F: Price, G: CostBasis, H: 24h%, I: Target, J: APY, K: IsCollateral (TRUE/FALSE)
    
    return data.values.map((row: any[], index: number) => {
      const isLiability = ['Loan', 'Credit Card', 'Personal Loan'].some(c => c === row[2]);
      // Price parsing: Remove '$' or ',' if present
      const parseNum = (val: string) => parseFloat((val || '0').toString().replace(/[$,]/g, ''));
      
      const price = parseNum(row[5]);
      const qty = parseNum(row[4]);
      
      return {
        id: `sheet-${index}`,
        symbol: row[0] || 'UNK',
        name: row[1] || 'Unknown Asset',
        category: parseCategory(row[2]),
        location: row[3] || 'General',
        quantity: qty,
        currentPrice: price,
        costBasis: parseNum(row[6]),
        change24h: parseNum(row[7]),
        targetAllocation: parseNum(row[8]),
        interestRate: parseNum(row[9]),
        isCollateral: (row[10] || '').toString().toLowerCase() === 'true',
        maxLTV: parseNum(row[11]) || 50,
        liquidationThreshold: parseNum(row[12]) || 80
      };
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};
