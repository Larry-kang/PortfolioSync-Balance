
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  quantity: number;
  currentPrice: number;
  costBasis: number; // Average Buy Price
  change24h: number; // Daily percentage change (+5.2 or -1.2)
  targetAllocation: number; // Percentage (0-100)
  interestRate: number; // APY for assets, APR for loans (percentage)
  isCollateral: boolean; // Is this asset pledged/locked?
  maxLTV?: number; // Max Borrowing Power % (e.g. 50)
  liquidationThreshold?: number; // Liquidation Point % (e.g. 80)
  location?: string; // e.g., "Binance", "Interactive Brokers", "Chase Bank"
}

export enum AssetCategory {
  Stock = 'Stock',
  Bond = 'Bond',
  Crypto = 'Crypto',
  Cash = 'Cash',
  RealEstate = 'Real Estate',
  ETF = 'ETF',
  Loan = 'Loan', // Secured Margin Loans
  CreditCard = 'Credit Card', // Unsecured Debt
  PersonalLoan = 'Personal Loan' // Unsecured Debt
}

export interface PortfolioSummary {
  totalValue: number;
  totalTargetPercent: number;
}

export interface RebalanceAction {
  assetId: string;
  symbol: string;
  currentValue: number;
  targetValue: number;
  difference: number; // Positive means Buy, Negative means Sell
  action: 'Buy' | 'Sell' | 'Hold';
}

export type ViewState = 'dashboard' | 'assets' | 'rebalance' | 'settings' | 'guide';

export type Language = 'en' | 'zh';

export interface SheetConfig {
  spreadsheetId: string;
  range: string; // e.g. "Sheet1!A2:K"
}
