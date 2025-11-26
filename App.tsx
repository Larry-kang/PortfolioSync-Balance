
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Wallet, 
  BrainCircuit,
  FileSpreadsheet,
  Download,
  Globe,
  BookOpen,
  Lock,
  Unlock,
  Coins,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Percent,
  Landmark,
  CreditCard,
  Building,
  Layers,
  Info,
  Calendar,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Asset, AssetCategory, ViewState, RebalanceAction, Language } from './types';
import { analyzePortfolio } from './services/geminiService';
import { fetchSheetData } from './services/sheetService';

// --- Helpers ---
const isLiability = (category: AssetCategory) => {
  return [AssetCategory.Loan, AssetCategory.CreditCard, AssetCategory.PersonalLoan].includes(category);
};

// --- Translations ---

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      assets: 'Assets & Liabilities',
      rebalance: 'Rebalance',
      settings: 'Settings',
      guide: 'User Guide',
      version: 'v1.5.0'
    },
    header: {
      welcome: 'Welcome back, Investor.',
      sync: 'Sync Sheet',
      syncing: 'Syncing...',
      export: 'Export'
    },
    dashboard: {
      netWorth: 'Net Worth',
      dailyChange: '24h Change',
      ytd: 'Year to Date',
      mom: 'Month on Month',
      totalPnL: 'Total PnL',
      assets: 'Total Assets',
      liabilities: 'Liabilities',
      monthlyFlow: 'Est. Monthly Cash Flow',
      income: 'Passive Income',
      expense: 'Interest Expense',
      net: 'Net Flow',
      rebalanceNeeded: 'Rebalance Needed',
      yes: 'Yes',
      no: 'No',
      assetsAdrift: 'assets adrift',
      balanced: 'Portfolio Balanced',
      allocationChart: 'Asset Allocation',
      structureChart: 'Asset Structure',
      cashFlowChart: 'Cash Flow Projection',
      aiInsights: 'AI Risk & Portfolio Analysis',
      generateAnalysis: 'Generate Analysis',
      thinking: 'Analyzing Risks...',
      aiPrompt: 'Get Gemini AI to analyze your LTV risks per platform and debt structure.',
      history: 'Portfolio History (30 Days)',
      liquid: 'Liquid',
      collateral: 'Collateral/Pledged',
      loan: 'Secured Debt',
      unsecured: 'Unsecured Debt'
    },
    assets: {
      title: 'Manage Assets & Liabilities',
      subtitle: 'Track assets, loans, and group them by platform (Location).',
      tabs: {
        list: 'Asset List',
        pledge: 'Risk Groups (LTV)'
      },
      import: 'Import CSV',
      add: 'Add Item',
      cols: {
        symbol: 'Symbol',
        name: 'Name',
        category: 'Category',
        location: 'Location / Platform',
        quantity: 'Qty',
        price: 'Price',
        cost: 'Avg Cost',
        change: '24h %',
        value: 'Value',
        rate: 'APY/APR %',
        collateral: 'Collateral',
        maxLTV: 'Max LTV %',
        liqThresh: 'Liq %',
        target: 'Target %',
        actions: 'Actions'
      },
      totalTarget: 'Total Allocation Target',
      loanWarning: 'Loans/Debts are negative values in Net Worth.'
    },
    pledge: {
      pageTitle: 'Risk Groups & Liquidation Management',
      unsecuredTitle: 'Unsecured Liabilities',
      ltv: 'Current LTV',
      health: 'Health',
      collateralValue: 'Collateral Value',
      totalDebt: 'Total Loan',
      borrowingPower: 'Borrow Limit',
      liquidationPoint: 'Liq. Point',
      riskLevel: 'Risk Status',
      safe: 'Safe',
      warning: 'Warning',
      danger: 'Call Risk',
      pledgedAssets: 'Pledged Assets',
      activeLoans: 'Platform Loans',
      noCollateral: 'No collateral in this group.',
      noLoans: 'No loans in this group.',
      unassigned: 'Unassigned / General',
      locationPlaceholder: 'e.g. Binance',
      buffer: 'Safety Buffer'
    },
    rebalance: {
      drift: 'Allocation Drift',
      actionPlan: 'Action Plan',
      perfect: 'Your portfolio is perfectly balanced.',
      buy: 'Buy',
      sell: 'Sell',
      hold: 'Hold',
      units: 'approx'
    },
    guide: {
      title: 'User Guide',
      cards: {
        sync: {
          title: 'Google Sheets Sync',
          desc: 'Configure your Spreadsheet ID in Settings. The app fetches Symbol, Qty, Price, Cost Basis, and 24h Change from your Sheet. Use =GOOGLEFINANCE() in your sheet for real-time updates.'
        },
        assets: {
          title: 'Locations & LTV',
          desc: 'Set "Max LTV" (Borrow Limit) and "Liq %" (Liquidation Threshold) for each collateral asset to get accurate risk alerts.'
        },
        rebalance: {
          title: 'Rebalancing',
          desc: 'Calculates buy/sell amounts to hit targets. Debts are excluded from rebalancing calculations.'
        },
        ai: {
          title: 'AI Risk Analysis',
          desc: 'Gemini calculates weighted risks based on your specific asset limits (e.g., BTC 60% vs Stablecoin 90%).'
        }
      }
    },
    settings: {
      title: 'Settings',
      desc: 'Configuration',
      apiDesc: 'Google Cloud & API Config',
      sheetId: 'Google Spreadsheet ID',
      sheetRange: 'Data Range (e.g. Sheet1!A2:M)',
      save: 'Save Settings'
    }
  },
  zh: {
    nav: {
      dashboard: '儀表板',
      assets: '資產與負債',
      rebalance: '再平衡',
      settings: '設定',
      guide: '使用說明',
      version: 'v1.5.0'
    },
    header: {
      welcome: '歡迎回來，投資者。',
      sync: '同步 Google Sheet',
      syncing: '同步中...',
      export: '匯出'
    },
    dashboard: {
      netWorth: '總淨值',
      dailyChange: '24h 漲跌 (值)',
      ytd: '今年以來 (YTD)',
      mom: '月增率 (MoM)',
      totalPnL: '總損益 (PnL)',
      assets: '總資產',
      liabilities: '總負債',
      monthlyFlow: '預估月現金流',
      income: '被動收入',
      expense: '利息支出',
      net: '淨現金流',
      rebalanceNeeded: '需要再平衡',
      yes: '是',
      no: '否',
      assetsAdrift: '項資產偏離',
      balanced: '投資組合已平衡',
      allocationChart: '資產配置',
      structureChart: '資產結構分佈',
      cashFlowChart: '現金流預測',
      aiInsights: 'AI 風險與投資組合分析',
      generateAnalysis: '生成風險報告',
      thinking: '分析風險中...',
      aiPrompt: '讓 Gemini AI 針對不同平台(地點)的 LTV 風險與債務結構提供建議。',
      history: '資產歷史 (30 天)',
      liquid: '流動資產',
      collateral: '質押/抵押品',
      loan: '抵押貸款',
      unsecured: '無擔保債務'
    },
    assets: {
      title: '管理資產與負債',
      subtitle: '追蹤資產、貸款，並依據平台（地點）進行分組風險管理。',
      tabs: {
        list: '資產清單',
        pledge: '風險群組 (LTV)'
      },
      import: '匯入 CSV',
      add: '新增項目',
      cols: {
        symbol: '代碼',
        name: '名稱',
        category: '類別',
        location: '地點 / 平台',
        quantity: '數量',
        price: '市價',
        cost: '均價',
        change: '24h %',
        value: '總值',
        rate: '利率 %',
        collateral: '質押',
        maxLTV: '借貸上限 %',
        liqThresh: '清算線 %',
        target: '目標 %',
        actions: '操作'
      },
      totalTarget: '總目標配置',
      loanWarning: '貸款與負債在淨值計算中為負值。'
    },
    pledge: {
      pageTitle: '風險群組與清算管理',
      unsecuredTitle: '無擔保負債 (信貸/卡費)',
      ltv: '當前 LTV',
      health: '健康度',
      collateralValue: '抵押品總值',
      totalDebt: '貸款總額',
      borrowingPower: '可借上限',
      liquidationPoint: '強制清算點',
      riskLevel: '風險狀態',
      safe: '安全',
      warning: '注意',
      danger: '危險 (追繳)',
      pledgedAssets: '質押資產',
      activeLoans: '平台貸款',
      noCollateral: '此群組無質押品。',
      noLoans: '此群組無貸款。',
      unassigned: '未分類 / 一般',
      locationPlaceholder: '例如: 幣安',
      buffer: '安全緩衝'
    },
    rebalance: {
      drift: '配置偏離',
      actionPlan: '行動計畫',
      perfect: '您的投資組合非常平衡。',
      buy: '買入',
      sell: '賣出',
      hold: '持有',
      units: '約'
    },
    guide: {
      title: '使用說明',
      cards: {
        sync: {
          title: 'Google Sheets 同步',
          desc: '在設定中輸入 Spreadsheet ID。系統會抓取代碼、數量、價格、均價與 24h 漲跌。建議在 Sheet 中使用 =GOOGLEFINANCE() 來獲取即時報價。'
        },
        assets: {
          title: '地點與個別 LTV',
          desc: '請為每個質押資產設定「借貸上限 %」與「清算線 %」(例如比特幣 60/80)，系統將計算加權風險。'
        },
        rebalance: {
          title: '再平衡邏輯',
          desc: '計算買賣數量以達到目標配置。債務不包含在再平衡計算中。'
        },
        ai: {
          title: 'AI 風險分析',
          desc: 'Gemini 會依據您設定的個別資產清算線，計算加權風險並發出預警。'
        }
      }
    },
    settings: {
      title: '設定',
      desc: '系統配置',
      apiDesc: 'Google Cloud & API 設定',
      sheetId: 'Google Spreadsheet ID',
      sheetRange: '資料範圍 (例如: Sheet1!A2:M)',
      save: '儲存設定'
    }
  }
};

// --- Components ---

const Sidebar = ({ 
  currentView, 
  setView, 
  language, 
  setLanguage 
}: { 
  currentView: ViewState, 
  setView: (v: ViewState) => void,
  language: Language,
  setLanguage: (l: Language) => void
}) => {
  const t = translations[language].nav;
  
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'assets', label: t.assets, icon: Wallet },
    { id: 'rebalance', label: t.rebalance, icon: ArrowRightLeft },
    { id: 'guide', label: t.guide, icon: BookOpen },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="w-20 md:w-64 bg-surface border-r border-slate-700 flex flex-col h-screen fixed left-0 top-0 z-10 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 text-primary font-bold text-xl">
        <TrendingUp size={28} />
        <span className="hidden md:inline">WealthSync</span>
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center gap-4 p-4 hover:bg-slate-700/50 transition-colors ${
              currentView === item.id ? 'text-primary border-r-4 border-primary bg-slate-700/20' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} />
            <span className="hidden md:inline font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="w-full flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <Globe size={20} />
          <span className="hidden md:inline font-medium">{language === 'en' ? 'English' : '繁體中文'}</span>
        </button>
      </div>

      <div className="p-4 text-xs text-slate-500 text-center md:text-left">
        <span className="hidden md:inline">{t.version}</span>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, trend, valueColor = 'text-white' }: { title: string, value: string, subtext?: string, trend?: 'up' | 'down' | 'neutral', valueColor?: string }) => (
  <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={`text-3xl font-bold ${valueColor}`}>{value}</span>
      {trend === 'up' && <span className="text-emerald-400 text-sm font-medium">↑</span>}
      {trend === 'down' && <span className="text-red-400 text-sm font-medium">↓</span>}
    </div>
    {subtext && <p className="mt-1 text-slate-500 text-sm">{subtext}</p>}
  </div>
);

// New component for performance metrics (PnL, YTD, MoM)
const MetricCard = ({ 
  title, 
  value, 
  percent, 
  isCurrency = true 
}: { 
  title: string, 
  value: number, 
  percent?: number, 
  isCurrency?: boolean 
}) => {
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';
  const bgClass = isPositive ? 'bg-emerald-400/10' : 'bg-red-400/10';
  const Icon = isPositive ? TrendingUp : TrendingUp; // Could rotate for down

  return (
    <div className="bg-surface p-4 rounded-xl border border-slate-700 shadow flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-2xl font-bold text-white`}>
            {isCurrency ? (value < 0 ? '-' : '') + '$' + Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 }) : value}
          </span>
        </div>
      </div>
      <div className={`flex flex-col items-end ${colorClass}`}>
         <div className={`p-2 rounded-full ${bgClass} mb-1`}>
            <Icon size={16} className={!isPositive ? 'rotate-180' : ''} />
         </div>
         {percent !== undefined && (
            <span className="text-sm font-bold">
              {percent > 0 ? '+' : ''}{percent.toFixed(2)}%
            </span>
         )}
      </div>
    </div>
  );
};

// --- Pledge Risk Group Card ---
const RiskGroupCard = ({ 
  location, 
  assets, 
  language 
}: { 
  location: string, 
  assets: Asset[], 
  language: Language 
}) => {
  const t = translations[language].pledge;
  
  // Separation of assets within the group
  const collateralAssets = assets.filter(a => a.isCollateral && !isLiability(a.category));
  const loanAssets = assets.filter(a => a.category === AssetCategory.Loan); // Margin/Secured Loans
  
  const totalCollateralValue = collateralAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
  const totalDebt = loanAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
  
  // Calculate Weighted Limits
  const weightedMaxBorrow = collateralAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice * ((a.maxLTV || 0) / 100)), 0);
  const weightedLiqPoint = collateralAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice * ((a.liquidationThreshold || 0) / 100)), 0);

  // Percentages for visualization (Relative to Total Collateral Value)
  const currentLTV = totalCollateralValue > 0 ? (totalDebt / totalCollateralValue) * 100 : 0;
  const maxLTVPercent = totalCollateralValue > 0 ? (weightedMaxBorrow / totalCollateralValue) * 100 : 0;
  const liqLTVPercent = totalCollateralValue > 0 ? (weightedLiqPoint / totalCollateralValue) * 100 : 0;

  // Risk Logic
  let riskColor = 'text-emerald-400';
  let riskBg = 'bg-emerald-500';
  let borderColor = 'border-slate-700';
  let riskLabel = t.safe;
  let RiskIcon = ShieldCheck;

  // Logic: 
  // Safe: Debt < Max Borrow
  // Warning: Debt > Max Borrow BUT < Liquidation Point
  // Danger: Debt >= Liquidation Point
  if (totalDebt > weightedLiqPoint) {
    riskColor = 'text-red-400';
    riskBg = 'bg-red-500';
    borderColor = 'border-red-500/50';
    riskLabel = t.danger;
    RiskIcon = AlertOctagon;
  } else if (totalDebt > weightedMaxBorrow) {
    riskColor = 'text-amber-400';
    riskBg = 'bg-amber-500';
    borderColor = 'border-amber-500/50';
    riskLabel = t.warning;
    RiskIcon = AlertTriangle;
  }

  // Only render if there is collateral or secured debt (Skip purely unassigned assets if they aren't collateral)
  if (totalCollateralValue === 0 && totalDebt === 0) return null;

  return (
    <div className={`bg-surface rounded-xl border ${borderColor} overflow-hidden shadow-lg mb-6`}>
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building size={20} className="text-primary" />
          <h3 className="font-bold text-lg text-white">{location || t.unassigned}</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border ${borderColor}`}>
          <RiskIcon size={16} className={riskColor} />
          <span className={`text-sm font-bold ${riskColor}`}>{riskLabel}</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge Viz */}
        <div className="flex flex-col justify-center gap-4">
           {/* Summary Text */}
           <div className="grid grid-cols-2 gap-4">
             <div>
                <div className="text-xs text-slate-500 mb-1">{t.totalDebt}</div>
                <div className="text-xl font-bold text-red-400">-${totalDebt.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
             </div>
             <div>
                <div className="text-xs text-slate-500 mb-1">{t.collateralValue}</div>
                <div className="text-xl font-bold text-emerald-400">${totalCollateralValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
             </div>
           </div>

           {/* Progress Bar Container */}
           <div className="space-y-1">
             <div className="flex justify-between text-xs text-slate-400 font-mono">
               <span>0%</span>
               <span className="text-amber-400" style={{ marginLeft: `${Math.min(maxLTVPercent, 90)}%` }}>Max: {maxLTVPercent.toFixed(0)}%</span>
               <span className="text-red-400">Liq: {liqLTVPercent.toFixed(0)}%</span>
             </div>
             <div className="h-6 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                 {/* Warning Zone Marker */}
                 <div className="absolute top-0 bottom-0 bg-amber-500/10 border-l border-amber-500/30" style={{ left: `${maxLTVPercent}%`, width: `${liqLTVPercent - maxLTVPercent}%` }}></div>
                 {/* Danger Zone Marker */}
                 <div className="absolute top-0 bottom-0 bg-red-500/10 border-l border-red-500/30" style={{ left: `${liqLTVPercent}%`, right: 0 }}></div>
                 
                 {/* Actual Debt Bar */}
                 <div 
                   className={`h-full transition-all duration-700 ${riskBg}`} 
                   style={{ width: `${Math.min((totalDebt / totalCollateralValue) * 100, 100)}%` }}
                 ></div>
             </div>
             <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">{t.ltv}: {currentLTV.toFixed(1)}%</span>
                {totalDebt > 0 && totalDebt < weightedLiqPoint && (
                   <span className="text-slate-400">{t.buffer}: <span className="text-emerald-400">${(weightedLiqPoint - totalDebt).toLocaleString(undefined, {maximumFractionDigits: 0})}</span></span>
                )}
             </div>
           </div>
           
           {/* Limit Details */}
           <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/30 p-2 rounded">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.borrowingPower}:</span>
                <span className="text-amber-400 font-mono">${weightedMaxBorrow.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.liquidationPoint}:</span>
                <span className="text-red-400 font-mono">${weightedLiqPoint.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
           </div>
        </div>

        {/* Collateral List with Limits */}
        <div className="bg-slate-900/30 rounded-lg p-3">
          <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2 flex items-center gap-1">
            <Lock size={12} /> {t.pledgedAssets}
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {collateralAssets.length === 0 ? <p className="text-xs text-slate-600 italic">{t.noCollateral}</p> : 
              collateralAssets.map(a => (
                <div key={a.id} className="flex flex-col p-2 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 font-bold">{a.name}</span>
                    <span className="font-mono text-emerald-400">${(a.quantity * a.currentPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Limit: {a.maxLTV}%</span>
                    <span className="text-red-900/60 group-hover:text-red-400">Liq: {a.liquidationThreshold}%</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Loan List */}
        <div className="bg-slate-900/30 rounded-lg p-3">
          <h4 className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
            <Landmark size={12} /> {t.activeLoans}
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
             {loanAssets.length === 0 ? <p className="text-xs text-slate-600 italic">{t.noLoans}</p> : 
              loanAssets.map(a => (
                <div key={a.id} className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                  <div>
                    <div className="text-sm text-slate-300 font-bold">{a.symbol}</div>
                    <div className="text-[10px] text-slate-500">APR: {a.interestRate}%</div>
                  </div>
                  <span className="font-mono text-red-400">-${(a.quantity * a.currentPrice).toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};


const PledgeDashboard = ({ assets, updateAsset, language }: { assets: Asset[], updateAsset: (id: string, f: keyof Asset, v: any) => void, language: Language }) => {
  const t = translations[language].pledge;

  // 1. Group Assets by Location
  const locations = useMemo(() => {
    const locs = new Set<string>();
    assets.forEach(a => locs.add(a.location || ''));
    return Array.from(locs);
  }, [assets]);

  // 2. Separate Unsecured Debts (Credit Cards, Personal Loans)
  const unsecuredDebts = assets.filter(a => a.category === AssetCategory.CreditCard || a.category === AssetCategory.PersonalLoan);
  const totalUnsecured = unsecuredDebts.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
         <ShieldCheck className="text-primary" /> {t.pageTitle}
      </h2>

      {/* Render Risk Group Cards for each Location */}
      {locations.map((loc, idx) => (
        <RiskGroupCard 
          key={idx} 
          location={loc} 
          assets={assets.filter(a => (a.location || '') === loc)} 
          language={language} 
        />
      ))}

      {/* Unsecured Debt Section */}
      {unsecuredDebts.length > 0 && (
        <div className="bg-surface rounded-xl border border-red-900/30 overflow-hidden shadow-lg mt-8">
           <div className="p-4 bg-red-900/20 border-b border-red-900/30 flex items-center gap-2">
              <CreditCard className="text-red-400" />
              <h3 className="font-bold text-lg text-white">{t.unsecuredTitle}</h3>
           </div>
           <div className="p-6">
             <div className="flex justify-between items-end mb-4">
                <span className="text-slate-400">Total Unsecured Liability</span>
                <span className="text-3xl font-bold text-red-400">-${totalUnsecured.toLocaleString()}</span>
             </div>
             <div className="space-y-2">
               {unsecuredDebts.map(a => (
                 <div key={a.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-800">
                    <div className="flex items-center gap-3">
                       {a.category === AssetCategory.CreditCard ? <CreditCard size={18} className="text-red-300" /> : <Banknote size={18} className="text-red-300" />}
                       <div>
                         <div className="font-bold text-slate-200">{a.name}</div>
                         <div className="text-xs text-slate-500">{a.location || 'General'} | APR: {a.interestRate}%</div>
                       </div>
                    </div>
                    <div className="font-mono text-red-400">-${(a.quantity * a.currentPrice).toLocaleString()}</div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};


// --- Main App Logic ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [assetSubView, setAssetSubView] = useState<'list' | 'pledge'>('list');
  const [language, setLanguage] = useState<Language>('zh'); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Sheet Settings
  const [sheetId, setSheetId] = useState('');
  const [sheetRange, setSheetRange] = useState('Sheet1!A2:M');

  const t = translations[language];

  // Mock Data
  const [assets, setAssets] = useState<Asset[]>([
    // Interactive Brokers Group (Stocks/ETF often have ~50% Margin Req, 75% Maintenance)
    { id: '1', name: 'Vanguard Total World', symbol: 'VT', category: AssetCategory.ETF, quantity: 400, currentPrice: 110, costBasis: 102, change24h: 0.5, targetAllocation: 40, interestRate: 0, isCollateral: true, maxLTV: 50, liquidationThreshold: 75, location: 'Interactive Brokers' },
    { id: '2', name: 'Margin Loan (IBKR)', symbol: 'USD-LOAN', category: AssetCategory.Loan, quantity: 15000, currentPrice: 1, costBasis: 1, change24h: 0, targetAllocation: 0, interestRate: 6.8, isCollateral: false, location: 'Interactive Brokers' },
    
    // Binance Group (Crypto has lower Max LTV, Higher Volatility)
    { id: '3', name: 'Bitcoin', symbol: 'BTC', category: AssetCategory.Crypto, quantity: 0.5, currentPrice: 62000, costBasis: 55000, change24h: 2.1, targetAllocation: 20, interestRate: 0, isCollateral: true, maxLTV: 60, liquidationThreshold: 80, location: 'Binance' },
    { id: '4', name: 'USDT Loan', symbol: 'USDT', category: AssetCategory.Loan, quantity: 12000, currentPrice: 1, costBasis: 1, change24h: 0, targetAllocation: 0, interestRate: 8.5, isCollateral: false, location: 'Binance' },

    // General / Unassigned
    { id: '5', name: 'High Yield Savings', symbol: 'USD', category: AssetCategory.Cash, quantity: 20000, currentPrice: 1, costBasis: 1, change24h: 0, targetAllocation: 20, interestRate: 4.5, isCollateral: false, location: 'Chase Bank' },
    
    // Liabilities
    { id: '6', name: 'Visa Signature', symbol: 'VISA', category: AssetCategory.CreditCard, quantity: 3500, currentPrice: 1, costBasis: 1, change24h: 0, targetAllocation: 0, interestRate: 18.0, isCollateral: false, location: 'Chase Bank' },
    { id: '7', name: 'Personal Loan', symbol: 'LN-01', category: AssetCategory.PersonalLoan, quantity: 10000, currentPrice: 1, costBasis: 1, change24h: 0, targetAllocation: 0, interestRate: 5.5, isCollateral: false, location: 'SoFi' },
  ]);

  // Derived State
  const totalAssets = useMemo(() => assets.filter(a => !isLiability(a.category)).reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0), [assets]);
  const totalLiabilities = useMemo(() => assets.filter(a => isLiability(a.category)).reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0), [assets]);
  const netWorth = totalAssets - totalLiabilities;
  
  // Advanced PnL Metrics
  const dailyPnL = useMemo(() => {
    return assets.reduce((sum, a) => {
      // Logic: (Value * change%) / (1 + change%) approx. Or just Value * change% if change% is "of today"
      // Simpler: CurrentValue * (Change% / 100)
      if (isLiability(a.category)) return sum;
      return sum + (a.quantity * a.currentPrice * (a.change24h / 100));
    }, 0);
  }, [assets]);

  const totalPnL = useMemo(() => {
    return assets.reduce((sum, a) => {
      if (isLiability(a.category)) return sum;
      if (!a.costBasis) return sum; 
      return sum + ((a.currentPrice - a.costBasis) * a.quantity);
    }, 0);
  }, [assets]);

  // Simulated YTD (Assumption: 60% of total PnL happened this year for visualization)
  const ytdPnL = totalPnL * 0.6; 
  const ytdPercent = totalAssets > 0 ? (ytdPnL / (totalAssets - ytdPnL)) * 100 : 0;
  
  // Cash Flow Calculations
  const monthlyIncome = useMemo(() => assets.filter(a => !isLiability(a.category)).reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.interestRate / 100) / 12), 0), [assets]);
  const monthlyInterest = useMemo(() => assets.filter(a => isLiability(a.category)).reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.interestRate / 100) / 12), 0), [assets]);

  const allocationData = useMemo(() => {
    return assets
      .filter(a => !isLiability(a.category))
      .map(a => ({
        name: a.symbol,
        value: a.quantity * a.currentPrice,
        percent: ((a.quantity * a.currentPrice) / totalAssets) * 100
      })).sort((a, b) => b.value - a.value);
  }, [assets, totalAssets]);

  const assetStructureData = useMemo(() => {
    const liquid = assets.filter(a => !isLiability(a.category) && !a.isCollateral).reduce((s, a) => s + (a.quantity * a.currentPrice), 0);
    const collateral = assets.filter(a => a.isCollateral).reduce((s, a) => s + (a.quantity * a.currentPrice), 0);
    const securedDebt = assets.filter(a => a.category === AssetCategory.Loan).reduce((s, a) => s + (a.quantity * a.currentPrice), 0);
    const unsecuredDebt = assets.filter(a => a.category === AssetCategory.CreditCard || a.category === AssetCategory.PersonalLoan).reduce((s, a) => s + (a.quantity * a.currentPrice), 0);

    return [
      { name: t.dashboard.liquid, value: liquid, fill: '#10b981' }, 
      { name: t.dashboard.collateral, value: collateral, fill: '#f59e0b' },
      { name: t.dashboard.loan, value: securedDebt, fill: '#ef4444' },
      { name: t.dashboard.unsecured, value: unsecuredDebt, fill: '#991b1b' }
    ];
  }, [assets, t]);

  const cashFlowData = useMemo(() => [
    { name: t.dashboard.income, value: monthlyIncome, fill: '#10b981' },
    { name: t.dashboard.expense, value: monthlyInterest, fill: '#ef4444' }
  ], [monthlyIncome, monthlyInterest, t]);

  const rebalanceData: RebalanceAction[] = useMemo(() => {
    return assets
      .filter(asset => !isLiability(asset.category)) 
      .map(asset => {
        const currentValue = asset.quantity * asset.currentPrice;
        const targetValue = totalAssets * (asset.targetAllocation / 100);
        const difference = targetValue - currentValue;
        
        let action: 'Buy' | 'Sell' | 'Hold' = 'Hold';
        if (difference > 100) action = 'Buy';
        if (difference < -100) action = 'Sell';

        return {
          assetId: asset.id,
          symbol: asset.symbol,
          currentValue,
          targetValue,
          difference,
          action
        };
      });
  }, [assets, totalAssets]);

  // Handlers
  const handleSync = async () => {
    setIsSyncing(true);
    
    // Check if we have Sheet ID configured
    if (sheetId && sheetRange) {
      try {
        const sheetAssets = await fetchSheetData(sheetId, sheetRange);
        if (sheetAssets.length > 0) {
          setAssets(sheetAssets);
          // Small delay to show loading state
          await new Promise(r => setTimeout(r, 800));
        } else {
          alert("Connected to sheet, but found no data. Check your range.");
        }
      } catch (e) {
        console.error(e);
        alert("Sync Failed: " + (e as Error).message + "\nCheck API Key or Sheet Permissions.");
      }
    } else {
      // Simulate real-time price fluctuation if no sheet configured
      setTimeout(() => {
        setAssets(prev => prev.map(a => ({
          ...a,
          currentPrice: isLiability(a.category) ? a.currentPrice : a.currentPrice * (1 + (Math.random() * 0.04 - 0.02)),
          change24h: (Math.random() * 5 - 2.5)
        })));
      }, 1500);
    }
    
    setIsSyncing(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzePortfolio(assets, netWorth, language);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAsset = () => {
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Asset',
      symbol: 'TICKER',
      category: AssetCategory.Stock,
      location: '',
      quantity: 0,
      currentPrice: 0,
      costBasis: 0,
      change24h: 0,
      targetAllocation: 0,
      interestRate: 0,
      isCollateral: false,
      maxLTV: 50,
      liquidationThreshold: 75
    };
    setAssets([...assets, newAsset]);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="bg-background min-h-screen text-slate-100 font-sans">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="ml-20 md:ml-64 p-6 md:p-10 transition-all">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {view === 'dashboard' && t.nav.dashboard}
              {view === 'assets' && t.nav.assets}
              {view === 'rebalance' && t.nav.rebalance}
              {view === 'guide' && t.nav.guide}
              {view === 'settings' && t.nav.settings}
            </h1>
            <p className="text-slate-400 mt-1">{t.header.welcome}</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all ${isSyncing ? 'animate-pulse' : ''}`}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? t.header.syncing : t.header.sync}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
              <Download size={18} /> {t.header.export}
            </button>
          </div>
        </header>

        {/* --- DASHBOARD VIEW --- */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Stat Row: Net Worth + PnL Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title={t.dashboard.netWorth}
                value={`$${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} 
                trend="up"
                subtext={`${t.dashboard.assets}: $${totalAssets.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
              />
              <MetricCard 
                title={t.dashboard.dailyChange}
                value={dailyPnL}
                percent={totalAssets > 0 ? (dailyPnL / totalAssets) * 100 : 0}
              />
              <MetricCard 
                title={t.dashboard.totalPnL}
                value={totalPnL}
                percent={assets.reduce((s,a) => s + (a.costBasis*a.quantity), 0) > 0 ? (totalPnL / assets.reduce((s,a) => s + (a.costBasis*a.quantity), 0)) * 100 : 0}
              />
              <MetricCard 
                title={t.dashboard.ytd}
                value={ytdPnL}
                percent={ytdPercent}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title={t.dashboard.monthlyFlow}
                value={`$${(monthlyIncome - monthlyInterest).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                valueColor={(monthlyIncome - monthlyInterest) >= 0 ? 'text-emerald-400' : 'text-red-400'}
                subtext={`+${monthlyIncome.toFixed(0)} (Inc) / -${monthlyInterest.toFixed(0)} (Exp)`}
              />
              <StatCard 
                title={t.dashboard.rebalanceNeeded}
                value={rebalanceData.filter(d => d.action !== 'Hold').length > 0 ? t.dashboard.yes : t.dashboard.no}
                subtext={rebalanceData.filter(d => d.action !== 'Hold').length > 0 ? `${rebalanceData.filter(d => d.action !== 'Hold').length} ${t.dashboard.assetsAdrift}` : t.dashboard.balanced}
                trend={rebalanceData.filter(d => d.action !== 'Hold').length > 0 ? "down" : "neutral"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Structure Chart */}
              <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold mb-4">{t.dashboard.structureChart}</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assetStructureData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} style={{ fontSize: '10px' }} />
                      <ReTooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {assetStructureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cash Flow Chart */}
              <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold mb-4">{t.dashboard.cashFlowChart}</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                      <ReTooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {cashFlowData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

               {/* Allocation Chart */}
               <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold mb-4">{t.dashboard.allocationChart}</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Advisor Panel */}
              <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" />
                    {t.dashboard.aiInsights}
                  </h3>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
                  >
                    {isAnalyzing ? t.dashboard.thinking : t.dashboard.generateAnalysis}
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-900/50 rounded-lg p-4 text-sm text-slate-300 overflow-y-auto max-h-64">
                  {aiAnalysis ? (
                    <div className="prose prose-invert prose-sm">
                      <pre className="whitespace-pre-wrap font-sans text-slate-300">{aiAnalysis}</pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                      <BrainCircuit size={32} className="opacity-50" />
                      <p className="text-center">{t.dashboard.aiPrompt}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ASSETS VIEW --- */}
        {view === 'assets' && (
          <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setAssetSubView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  assetSubView === 'list' 
                    ? 'bg-primary text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {t.assets.tabs.list}
              </button>
              <button
                onClick={() => setAssetSubView('pledge')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  assetSubView === 'pledge' 
                    ? 'bg-primary text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <ShieldCheck size={16} />
                {t.assets.tabs.pledge}
              </button>
            </div>

            {assetSubView === 'list' ? (
              <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden shadow-lg animate-in fade-in duration-300">
                <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{t.assets.title}</h2>
                    <p className="text-slate-400 text-sm">{t.assets.subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-sm hover:bg-slate-700">
                      <FileSpreadsheet size={16} /> {t.assets.import}
                    </button>
                    <button 
                      onClick={addAsset}
                      className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded text-sm hover:bg-emerald-600 font-medium"
                    >
                      <Plus size={16} /> {t.assets.add}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="p-4 w-12 text-center">{t.assets.cols.collateral}</th>
                        <th className="p-4">{t.assets.cols.symbol}</th>
                        <th className="p-4">{t.assets.cols.name}</th>
                        <th className="p-4 w-32">{t.assets.cols.location}</th>
                        <th className="p-4">{t.assets.cols.category}</th>
                        <th className="p-4 text-right">{t.assets.cols.quantity}</th>
                        <th className="p-4 text-right">{t.assets.cols.price}</th>
                        <th className="p-4 text-right">{t.assets.cols.change}</th>
                        <th className="p-4 text-right">{t.assets.cols.value}</th>
                        <th className="p-4 text-center">{t.assets.cols.maxLTV}</th>
                        <th className="p-4 text-center">{t.assets.cols.liqThresh}</th>
                        <th className="p-4 text-center">{t.assets.cols.target}</th>
                        <th className="p-4 text-center">{t.assets.cols.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {assets.map((asset) => (
                        <tr key={asset.id} className={`hover:bg-slate-700/30 transition-colors ${isLiability(asset.category) ? 'bg-red-900/10' : ''}`}>
                          <td className="p-4 text-center">
                            {!isLiability(asset.category) && (
                              <button 
                                onClick={() => updateAsset(asset.id, 'isCollateral', !asset.isCollateral)}
                                className={`transition-colors ${asset.isCollateral ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                              >
                                {asset.isCollateral ? <Lock size={16} /> : <Unlock size={16} />}
                              </button>
                            )}
                          </td>
                          <td className="p-4">
                            <input 
                              value={asset.symbol} 
                              onChange={(e) => updateAsset(asset.id, 'symbol', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-slate-600 focus:border-primary rounded px-2 py-1 w-20 uppercase font-mono font-bold text-white outline-none"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              value={asset.name} 
                              onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-slate-600 focus:border-primary rounded px-2 py-1 w-full text-slate-300 outline-none"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              value={asset.location || ''} 
                              placeholder={t.pledge.locationPlaceholder}
                              onChange={(e) => updateAsset(asset.id, 'location', e.target.value)}
                              className="bg-transparent border border-slate-700 hover:border-slate-500 focus:border-primary rounded px-2 py-1 w-full text-slate-300 text-xs outline-none"
                            />
                          </td>
                          <td className="p-4">
                            <select 
                              value={asset.category}
                              onChange={(e) => updateAsset(asset.id, 'category', e.target.value)}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-primary"
                            >
                              {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <input 
                              type="number"
                              value={asset.quantity} 
                              onChange={(e) => updateAsset(asset.id, 'quantity', parseFloat(e.target.value))}
                              className="bg-transparent border border-transparent hover:border-slate-600 focus:border-primary rounded px-2 py-1 w-20 text-right text-slate-300 outline-none"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <input 
                              type="number"
                              value={asset.currentPrice} 
                              onChange={(e) => updateAsset(asset.id, 'currentPrice', parseFloat(e.target.value))}
                              className="bg-transparent border border-transparent hover:border-slate-600 focus:border-primary rounded px-2 py-1 w-20 text-right text-slate-300 outline-none"
                            />
                          </td>
                          <td className="p-4 text-right">
                             {!isLiability(asset.category) && (
                               <div className={`text-xs font-mono font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                 {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                               </div>
                             )}
                          </td>
                          <td className={`p-4 text-right font-mono ${isLiability(asset.category) ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isLiability(asset.category) ? '-' : ''}${(asset.quantity * asset.currentPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="p-4 text-center">
                            {asset.isCollateral && !isLiability(asset.category) ? (
                              <input 
                                type="number"
                                value={asset.maxLTV || 0} 
                                onChange={(e) => updateAsset(asset.id, 'maxLTV', parseFloat(e.target.value))}
                                className="bg-transparent border border-slate-700 hover:border-amber-400 focus:border-amber-500 rounded px-1 py-1 w-12 text-center text-amber-400 outline-none text-xs"
                                placeholder="%"
                              />
                            ) : <span className="text-slate-700">-</span>}
                          </td>
                          <td className="p-4 text-center">
                            {asset.isCollateral && !isLiability(asset.category) ? (
                              <input 
                                type="number"
                                value={asset.liquidationThreshold || 0} 
                                onChange={(e) => updateAsset(asset.id, 'liquidationThreshold', parseFloat(e.target.value))}
                                className="bg-transparent border border-slate-700 hover:border-red-400 focus:border-red-500 rounded px-1 py-1 w-12 text-center text-red-400 outline-none text-xs"
                                placeholder="%"
                              />
                            ) : <span className="text-slate-700">-</span>}
                          </td>
                          <td className="p-4 text-center">
                            {!isLiability(asset.category) ? (
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number"
                                  value={asset.targetAllocation} 
                                  onChange={(e) => updateAsset(asset.id, 'targetAllocation', parseFloat(e.target.value))}
                                  className="bg-transparent border border-transparent hover:border-slate-600 focus:border-primary rounded px-1 py-1 w-12 text-center text-slate-300 outline-none"
                                />
                                <span className="text-slate-500">%</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => deleteAsset(asset.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-900/30 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-xs text-red-300 opacity-80">{t.assets.loanWarning}</span>
                  <div className={`text-sm ${assets.filter(a => !isLiability(a.category)).reduce((s, a) => s + a.targetAllocation, 0) === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {t.assets.totalTarget}: {assets.filter(a => !isLiability(a.category)).reduce((s, a) => s + a.targetAllocation, 0)}%
                  </div>
                </div>
              </div>
            ) : (
              // Pledge Dashboard View
              <PledgeDashboard assets={assets} updateAsset={updateAsset} language={language} />
            )}
          </div>
        )}

        {/* --- REBALANCE VIEW --- */}
        {view === 'rebalance' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-slate-700">
                   <h2 className="text-xl font-bold mb-4">{t.rebalance.drift}</h2>
                   <div className="space-y-4">
                     {rebalanceData.map((item) => {
                       const currentPercent = (item.currentValue / totalAssets) * 100;
                       const asset = assets.find(a => a.id === item.assetId);

                       return (
                         <div key={item.assetId} className="group">
                           <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold text-slate-300">{item.symbol}</span>
                             <span className="text-slate-500">
                               {currentPercent.toFixed(1)}% <span className="text-xs mx-1">→</span> <span className="text-slate-300">{asset?.targetAllocation}%</span>
                             </span>
                           </div>
                           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                              <div 
                                className="absolute top-0 left-0 h-full bg-slate-600 opacity-30" 
                                style={{ width: `${asset?.targetAllocation}%` }}
                              />
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${item.difference > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                                style={{ width: `${currentPercent}%` }}
                              />
                           </div>
                         </div>
                       )
                     })}
                   </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-emerald-400">{t.rebalance.actionPlan}</h2>
                  <div className="overflow-y-auto max-h-[500px] pr-2">
                    {rebalanceData.filter(r => r.action !== 'Hold').length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                         <div className="p-4 bg-slate-800 rounded-full mb-3">
                           <ArrowRightLeft size={24} />
                         </div>
                         <p>{t.rebalance.perfect}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rebalanceData.filter(r => r.action !== 'Hold').map((item) => {
                           let actionLabel = item.action === 'Buy' ? t.rebalance.buy : t.rebalance.sell;
                           
                           return (
                           <div key={item.assetId} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border-l-4 border-l-transparent hover:border-l-primary transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.action === 'Buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                   {item.action === 'Buy' ? <Plus size={20} /> : <TrendingUp size={20} className="rotate-180" />}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{actionLabel} {item.symbol}</div>
                                  <div className="text-xs text-slate-500">{t.assets.cols.target}: {assets.find(a => a.id === item.assetId)?.targetAllocation}%</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-mono font-bold text-white">
                                  ${Math.abs(item.difference).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                                <div className="text-xs text-slate-500">{t.rebalance.units} {Math.abs(item.difference / (assets.find(a => a.id === item.assetId)?.currentPrice || 1)).toFixed(2)}</div>
                              </div>
                           </div>
                           );
                        })}
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        )}
        
        {/* --- GUIDE VIEW --- */}
        {view === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3 text-primary">
                <RefreshCw size={24} />
                <h3 className="text-lg font-bold">{t.guide.cards.sync.title}</h3>
              </div>
              <p className="text-slate-400">{t.guide.cards.sync.desc}</p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3 text-emerald-400">
                <Banknote size={24} />
                <h3 className="text-lg font-bold">{t.guide.cards.assets.title}</h3>
              </div>
              <p className="text-slate-400">{t.guide.cards.assets.desc}</p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3 text-amber-400">
                <ArrowRightLeft size={24} />
                <h3 className="text-lg font-bold">{t.guide.cards.rebalance.title}</h3>
              </div>
              <p className="text-slate-400">{t.guide.cards.rebalance.desc}</p>
            </div>
            
             <div className="bg-surface p-6 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3 text-purple-400">
                <BrainCircuit size={24} />
                <h3 className="text-lg font-bold">{t.guide.cards.ai.title}</h3>
              </div>
              <p className="text-slate-400">{t.guide.cards.ai.desc}</p>
            </div>
          </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {view === 'settings' && (
           <div className="max-w-2xl mx-auto mt-10 p-8 bg-surface rounded-xl border border-slate-700 shadow-2xl">
             <div className="flex items-center gap-4 mb-6">
                <Settings size={32} className="text-slate-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.settings.title}</h2>
                  <p className="text-slate-400">{t.settings.desc}</p>
                </div>
             </div>
             
             <div className="space-y-6">
               <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                 <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                   <FileSpreadsheet size={18} /> {t.settings.apiDesc}
                 </h3>
                 <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.settings.sheetId}</label>
                      <input 
                        type="text" 
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        placeholder="1BxiMVs0XRA5nFMdKvBdBkJ..."
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-primary outline-none font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.settings.sheetRange}</label>
                      <input 
                        type="text" 
                        value={sheetRange}
                        onChange={(e) => setSheetRange(e.target.value)}
                        placeholder="Sheet1!A2:M"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-primary outline-none font-mono text-sm"
                      />
                    </div>
                 </div>
               </div>

               <button className="w-full py-3 bg-primary hover:bg-blue-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                 <Save size={18} /> {t.settings.save}
               </button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
