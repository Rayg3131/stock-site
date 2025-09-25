import type {
  AlphaVantageGlobalQuote,
  AlphaVantageOverview,
  AlphaVantageIncomeStatement,
  AlphaVantageBalanceSheet,
  AlphaVantageCashFlow,
  AlphaVantageTimeSeriesDaily
} from '../types/apiTypes';
import type { StockData, IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../types/stockTypes';

// Helper function to parse numeric strings from API
const parseNumeric = (value: string | undefined): number => {
  if (!value || value === 'None' || value === '-') return 0;
  return parseFloat(value.replace(/,/g, '')) || 0;
};

// Helper function to format market cap
const formatMarketCap = (value: string): string => {
  const num = parseNumeric(value);
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toString();
};

// Transform Alpha Vantage overview data to our StockData format
export const transformOverviewToStockData = (
  overview: AlphaVantageOverview,
  globalQuote: AlphaVantageGlobalQuote,
  incomeStatement: AlphaVantageIncomeStatement[],
  balanceSheet: AlphaVantageBalanceSheet[],
  cashFlow: AlphaVantageCashFlow[]
): StockData => {
  const currentPrice = parseNumeric(globalQuote['05. price']);
  
  return {
    company: overview.Name || 'Unknown Company',
    sector: overview.Sector || 'Unknown',
    marketCap: formatMarketCap(overview.MarketCapitalization),
    description: overview.Description || 'No description available',
    currentPrice,
    ticker: overview.Symbol || globalQuote['01. symbol'],
    metrics: {
      trailingPE: parseNumeric(overview.TrailingPE),
      forwardPE: parseNumeric(overview.ForwardPE),
      debtToEquity: calculateDebtToEquity(balanceSheet[0]),
      priceToBook: parseNumeric(overview.PriceToBookRatio),
      priceToSales: parseNumeric(overview.PriceToSalesRatioTTM),
      dividendYield: parseNumeric(overview.DividendYield)
    },
    margins: {
      grossMargin: calculateGrossMargin(incomeStatement[0]),
      operatingMargin: parseNumeric(overview.OperatingMarginTTM),
      netMargin: parseNumeric(overview.ProfitMargin)
    },
    incomeStatement: transformIncomeStatement(incomeStatement),
    balanceSheet: transformBalanceSheet(balanceSheet),
    cashFlow: transformCashFlow(cashFlow)
  };
};

// Transform income statement data
const transformIncomeStatement = (data: AlphaVantageIncomeStatement[]): IncomeStatementItem[] => {
  return data.slice(0, 5).map(item => {
    const revenue = parseNumeric(item.totalRevenue);
    const cogs = parseNumeric(item.costOfRevenue);
    const sga = parseNumeric(item.sellingGeneralAdministrative);
    const ebitda = parseNumeric(item.ebitda);
    const depreciation = parseNumeric(item.depreciation);
    const ebit = parseNumeric(item.ebit);
    const taxes = parseNumeric(item.incomeTaxExpense);
    const netIncome = parseNumeric(item.netIncome);
    
    return {
      year: item.fiscalDateEnding.substring(0, 4),
      revenue: revenue / 1000000, // Convert to millions
      cogs: cogs / 1000000,
      grossProfit: (revenue - cogs) / 1000000,
      sga: sga / 1000000,
      ebitda: ebitda / 1000000,
      depreciation: depreciation / 1000000,
      ebit: ebit / 1000000,
      taxes: taxes / 1000000,
      netIncome: netIncome / 1000000,
      eps: calculateEPS(netIncome, item)
    };
  });
};

// Transform balance sheet data
const transformBalanceSheet = (data: AlphaVantageBalanceSheet[]): BalanceSheetItem[] => {
  return data.slice(0, 5).map(item => {
    const cash = parseNumeric(item.cashAndCashEquivalentsAtCarryingValue);
    const accountsReceivable = parseNumeric(item.currentNetReceivables);
    const inventory = parseNumeric(item.inventory);
    const ppe = parseNumeric(item.propertyPlantEquipment);
    const totalAssets = parseNumeric(item.totalAssets);
    const accountsPayable = parseNumeric(item.currentAccountsPayable);
    const shortTermDebt = parseNumeric(item.shortTermDebt);
    const longTermDebt = parseNumeric(item.longTermDebt);
    const totalLiabilities = parseNumeric(item.totalLiabilities);
    const shareholdersEquity = parseNumeric(item.totalShareholderEquity);
    
    return {
      year: item.fiscalDateEnding.substring(0, 4),
      cash: cash / 1000000, // Convert to millions
      accountsReceivable: accountsReceivable / 1000000,
      inventory: inventory / 1000000,
      ppe: ppe / 1000000,
      totalAssets: totalAssets / 1000000,
      accountsPayable: accountsPayable / 1000000,
      shortTermDebt: shortTermDebt / 1000000,
      longTermDebt: longTermDebt / 1000000,
      totalLiabilities: totalLiabilities / 1000000,
      shareholdersEquity: shareholdersEquity / 1000000
    };
  });
};

// Transform cash flow data
const transformCashFlow = (data: AlphaVantageCashFlow[]): CashFlowItem[] => {
  return data.slice(0, 5).map(item => {
    const operatingCashFlow = parseNumeric(item.operatingCashflow);
    const capex = parseNumeric(item.capitalExpenditures);
    const freeCashFlow = operatingCashFlow + capex; // Capex is typically negative
    
    return {
      year: item.fiscalDateEnding.substring(0, 4),
      operatingCashFlow: operatingCashFlow / 1000000, // Convert to millions
      freeCashFlow: freeCashFlow / 1000000,
      capex: capex / 1000000
    };
  });
};

// Helper functions for calculations
const calculateDebtToEquity = (balanceSheet: AlphaVantageBalanceSheet): number => {
  const totalDebt = parseNumeric(balanceSheet.shortTermDebt) + parseNumeric(balanceSheet.longTermDebt);
  const equity = parseNumeric(balanceSheet.totalShareholderEquity);
  return equity > 0 ? totalDebt / equity : 0;
};

const calculateGrossMargin = (incomeStatement: AlphaVantageIncomeStatement): number => {
  const revenue = parseNumeric(incomeStatement.totalRevenue);
  const grossProfit = parseNumeric(incomeStatement.grossProfit);
  return revenue > 0 ? (grossProfit / revenue) * 100 : 0;
};

const calculateEPS = (netIncome: number, incomeStatement: AlphaVantageIncomeStatement): number => {
  const sharesOutstanding = parseNumeric(incomeStatement.totalRevenue) / 1000000; // This is a rough estimate
  return sharesOutstanding > 0 ? netIncome / sharesOutstanding : 0;
};

// Transform time series data for charts
export const transformTimeSeriesData = (data: AlphaVantageTimeSeriesDaily): Array<{ t: number; p: number }> => {
  const dates = Object.keys(data).sort();
  return dates.map((date, index) => ({
    t: index,
    p: parseNumeric(data[date]['4. close'])
  }));
};

// Get chart data for specific time range
export const getChartDataForRange = (
  data: AlphaVantageTimeSeriesDaily,
  range: '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y'
): Array<{ t: number; p: number }> => {
  const allData = transformTimeSeriesData(data);
  const now = new Date();
  let daysBack = 0;
  
  switch (range) {
    case '1D':
      daysBack = 1;
      break;
    case '5D':
      daysBack = 5;
      break;
    case '1M':
      daysBack = 30;
      break;
    case '6M':
      daysBack = 180;
      break;
    case '1Y':
      daysBack = 365;
      break;
    case '5Y':
      daysBack = 1825;
      break;
  }
  
  const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  return allData.filter((_, index) => {
    const dataDate = new Date(Object.keys(data)[index]);
    return dataDate >= cutoffDate;
  });
};
