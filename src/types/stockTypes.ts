// Stock data types for the dashboard component

export interface IncomeStatementItem {
    year: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
    sga: number;
    ebitda: number;
    depreciation: number;
    ebit: number;
    taxes: number;
    netIncome: number;
    eps: number;
}

export interface BalanceSheetItem {
    year: string;
    cash: number;
    accountsReceivable: number;
    inventory: number;
    ppe: number;
    totalAssets: number;
    accountsPayable: number;
    shortTermDebt: number;
    longTermDebt: number;
    totalLiabilities: number;
    shareholdersEquity: number;
}

export interface CashFlowItem {
    year: string;
    operatingCashFlow: number;
    freeCashFlow: number;
    capex: number;
}

export interface StockData {
    company: string;
    sector: string;
    marketCap: string;
    description: string;
    currentPrice: number;
    ticker: string;
    metrics: {
        trailingPE: number;
        forwardPE: number;
        debtToEquity: number;
        priceToBook: number;
        priceToSales: number;
        dividendYield: number;
    };
    margins: {
        grossMargin: number;
        operatingMargin: number;
        netMargin: number;
    };
    incomeStatement: IncomeStatementItem[];
    balanceSheet: BalanceSheetItem[];
    cashFlow: CashFlowItem[];
}
