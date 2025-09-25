import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from 'lucide-react';

// Type definitions
interface IncomeStatementItem {
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

interface BalanceSheetItem {
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

interface CashFlowItem {
    year: string;
    operatingCashFlow: number;
    freeCashFlow: number;
    capex: number;
}

interface StockData {
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
        currentRatio: number;
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

interface TabButtonProps {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
}

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
}

const StockResearchDashboard = () => {
    const [ticker, setTicker] = useState('');
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [incomeExpandedRows, setIncomeExpandedRows] = useState<Record<string, boolean>>({});
    const [balanceExpandedRows, setBalanceExpandedRows] = useState<Record<string, boolean>>({});

    // Mock data for demonstration - in real implementation this would come from an API
    const mockStockData: Record<string, Omit<StockData, 'ticker'>> = {
        'AAPL': {
            company: 'Apple Inc.',
            sector: 'Technology',
            marketCap: '3.01T',
            description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
            currentPrice: 185.25,
            metrics: {
                trailingPE: 29.8,
                forwardPE: 26.4,
                debtToEquity: 1.73,
                priceToBook: 43.2,
                priceToSales: 7.8,
                currentRatio: 1.04
            },
            margins: {
                grossMargin: 44.1,
                operatingMargin: 29.8,
                netMargin: 25.3
            },
            incomeStatement: [
                { year: '2023', revenue: 383929, cogs: 214771, grossProfit: 169158, sga: 24932, ebitda: 123136, depreciation: 11519, ebit: 114301, taxes: 16741, netIncome: 96995, eps: 6.16 },
                { year: '2022', revenue: 394328, cogs: 223546, grossProfit: 170782, sga: 25094, ebitda: 130541, depreciation: 11104, ebit: 119437, taxes: 19300, netIncome: 99803, eps: 6.11 },
                { year: '2021', revenue: 365817, cogs: 212981, grossProfit: 152836, sga: 21973, ebitda: 120233, depreciation: 11284, ebit: 108949, taxes: 14527, netIncome: 94680, eps: 5.67 },
                { year: '2020', revenue: 274515, cogs: 169559, grossProfit: 104956, sga: 19916, ebitda: 77344, depreciation: 11056, ebit: 66288, taxes: 9680, netIncome: 57411, eps: 3.31 },
                { year: '2019', revenue: 260174, cogs: 161782, grossProfit: 98392, sga: 18245, ebitda: 76477, depreciation: 12547, ebit: 63930, taxes: 10481, netIncome: 55256, eps: 2.97 }
            ],
            balanceSheet: [
                { year: '2023', cash: 29965, accountsReceivable: 29508, inventory: 6331, ppe: 43715, totalAssets: 352755, accountsPayable: 64115, shortTermDebt: 9822, longTermDebt: 106550, totalLiabilities: 290437, shareholdersEquity: 62317 },
                { year: '2022', cash: 23646, accountsReceivable: 28184, inventory: 4946, ppe: 42117, totalAssets: 352583, accountsPayable: 64115, shortTermDebt: 11128, longTermDebt: 98959, totalLiabilities: 302083, shareholdersEquity: 50672 },
                { year: '2021', cash: 34940, accountsReceivable: 26278, inventory: 6580, ppe: 39440, totalAssets: 351002, accountsPayable: 54763, shortTermDebt: 9613, longTermDebt: 109106, totalLiabilities: 287912, shareholdersEquity: 63090 },
                { year: '2020', cash: 38016, accountsReceivable: 16120, inventory: 4061, ppe: 36766, totalAssets: 323888, accountsPayable: 42296, shortTermDebt: 8773, longTermDebt: 98667, totalLiabilities: 258549, shareholdersEquity: 65339 },
                { year: '2019', cash: 48844, accountsReceivable: 22926, inventory: 4106, ppe: 37378, totalAssets: 338516, accountsPayable: 46236, shortTermDebt: 10260, longTermDebt: 91807, totalLiabilities: 248028, shareholdersEquity: 90488 }
            ],
            cashFlow: [
                { year: '2023', operatingCashFlow: 110543, freeCashFlow: 84726, capex: -10959 },
                { year: '2022', operatingCashFlow: 122151, freeCashFlow: 111443, capex: -10708 },
                { year: '2021', operatingCashFlow: 104038, freeCashFlow: 92953, capex: -11085 },
                { year: '2020', operatingCashFlow: 80674, freeCashFlow: 73365, capex: -7309 },
                { year: '2019', operatingCashFlow: 69391, freeCashFlow: 58896, capex: -10495 }
            ]
        }
    };

    const searchStock = async () => {
        if (!ticker.trim()) return;

        setLoading(true);
        setError('');

        // Simulate API call delay
        setTimeout(() => {
            const upperTicker = ticker.toUpperCase();
            if (mockStockData[upperTicker]) {
                setStockData({ ...mockStockData[upperTicker], ticker: upperTicker });
            } else {
                setError(`Stock data not found for ${upperTicker}. Try AAPL for demo.`);
                setStockData(null);
            }
            setLoading(false);
        }, 1000);
    };

    const calculateGrowthRate = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100);
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}B`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}M`;
        return `$${value}`;
    };

    const formatPercent = (value: number) => `${value?.toFixed(1)}%`;

    const renderRowToggle = (rowKey: string, expandedState: Record<string, boolean>, setExpandedState: (v: Record<string, boolean>) => void, label: string) => {
        const isOpen = !!expandedState[rowKey];
        return (
            <button
                onClick={() => setExpandedState({ ...expandedState, [rowKey]: !isOpen })}
                className="inline-flex items-center gap-3 text-left hover:text-blue-600 transition-colors duration-200 group"
                aria-expanded={isOpen}
            >
                <span className={`transition-transform duration-200 text-blue-600 group-hover:text-blue-700 ${isOpen ? 'rotate-90' : ''}`}>
                    ▶
                </span>
                <span className="font-semibold text-gray-900 group-hover:text-blue-600">{label}</span>
            </button>
        );
    };

    const renderYoYDeltaRow = <T extends { year: string }>(
        data: T[],
        getValue: (item: T) => number,
        label: string
    ) => {
        return (
            <tr className="bg-blue-50/30">
                <td className="py-3 px-6 text-sm text-gray-600 font-medium pl-12">{label} YoY</td>
                {data.map((item: T, index: number) => {
                    const prevItem = data[index + 1];
                    const growth = prevItem ? calculateGrowthRate(getValue(item), getValue(prevItem)) : 0;
                    const isLast = index === data.length - 1;
                    return (
                        <td key={`yoy-${(item as any).year}`} className={`py-3 px-6 text-right text-sm font-bold ${
                            growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {isLast ? '-' : formatPercent(growth)}
                        </td>
                    );
                })}
            </tr>
        );
    };

    const TabButton = ({ id, label, icon: Icon }: TabButtonProps) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
            }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    const MetricCard = ({ label, value, change }: MetricCardProps) => (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 group">
            <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>
            <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{value}</div>
            {change !== undefined && (
                <div className={`text-sm flex items-center gap-1 font-semibold ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                    {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {formatPercent(Math.abs(change))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 animate-fadeInUp">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Stock Research Dashboard
                        </h1>
                        <p className="text-gray-600 text-lg">Analyze stocks with comprehensive financial data and insights</p>
                    </div>

                    {/* Search */}
                    <div className="flex gap-4 max-w-2xl mx-auto">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                            <input
                                type="text"
                                placeholder="Enter stock ticker (e.g., AAPL)"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                                className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                            />
                        </div>
                        <button
                            onClick={searchStock}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </div>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 animate-slideInRight">
                            <div className="flex items-center">
                                <div className="w-5 h-5 text-red-400 mr-3">⚠️</div>
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                {stockData && (
                    <>
                        {/* Company Info */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 animate-fadeInUp">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                                <div className="mb-4 lg:mb-0">
                                    <h2 className="text-4xl font-bold text-gray-900 mb-2">{stockData.company}</h2>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-lg">
                                            {stockData.ticker}
                                        </span>
                                        <span className="text-gray-600 text-lg">{stockData.sector}</span>
                                        <span className="text-gray-500 text-lg">•</span>
                                        <span className="text-gray-600 text-lg">Market Cap: {stockData.marketCap}</span>
                                    </div>
                                </div>
                                <div className="text-center lg:text-right">
                                    <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                        ${stockData.currentPrice}
                                    </div>
                                    <div className="text-sm text-gray-500">Current Price</div>
                                </div>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">{stockData.description}</p>
                        </div>

                        {/* Key Metrics */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 animate-fadeInUp">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <BarChart3 className="text-blue-600" size={28} />
                                Key Metrics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                <MetricCard label="Trailing P/E" value={stockData.metrics.trailingPE} />
                                <MetricCard label="Forward P/E" value={stockData.metrics.forwardPE} />
                                <MetricCard label="Debt/Equity" value={stockData.metrics.debtToEquity} />
                                <MetricCard label="Price/Book" value={stockData.metrics.priceToBook} />
                                <MetricCard label="Price/Sales" value={stockData.metrics.priceToSales} />
                                <MetricCard label="Current Ratio" value={stockData.metrics.currentRatio} />
                            </div>
                        </div>

                        {/* Margins */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 animate-fadeInUp">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <TrendingUp className="text-green-600" size={28} />
                                Profit Margins
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard label="Gross Margin" value={formatPercent(stockData.margins.grossMargin)} />
                                <MetricCard label="Operating Margin" value={formatPercent(stockData.margins.operatingMargin)} />
                                <MetricCard label="Net Margin" value={formatPercent(stockData.margins.netMargin)} />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    <TabButton id="overview" label="Overview" icon={BarChart3} />
                                    <TabButton id="income" label="Income Statement" icon={DollarSign} />
                                    <TabButton id="balance" label="Balance Sheet" icon={PieChart} />
                                    <TabButton id="cashflow" label="Cash Flow" icon={Activity} />
                                </div>
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <TrendingUp className="text-blue-600" size={24} />
                                            Revenue & Growth
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-900">Year</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Revenue</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Revenue Growth</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Net Income</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">EPS</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">EPS Growth</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                {stockData.incomeStatement.map((item: IncomeStatementItem, index: number) => {
                                                    const prevItem = stockData.incomeStatement[index + 1];
                                                    const revenueGrowth = prevItem ? calculateGrowthRate(item.revenue, prevItem.revenue) : 0;
                                                    const epsGrowth = prevItem ? calculateGrowthRate(item.eps, prevItem.eps) : 0;

                                                    return (
                                                        <tr key={item.year} className="hover:bg-blue-50/50 transition-colors duration-200">
                                                            <td className="py-4 px-6 font-semibold text-gray-900">{item.year}</td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.revenue)}</td>
                                                            <td className={`py-4 px-6 text-right font-bold ${
                                                                revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {index === stockData.incomeStatement.length - 1 ? '-' : formatPercent(revenueGrowth)}
                                                            </td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.netIncome)}</td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">${item.eps}</td>
                                                            <td className={`py-4 px-6 text-right font-bold ${
                                                                epsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {index === stockData.incomeStatement.length - 1 ? '-' : formatPercent(epsGrowth)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'income' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <DollarSign className="text-green-600" size={24} />
                                            Income Statement (in millions)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-900">Metric</th>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <th key={item.year} className="text-right py-4 px-6 font-bold text-gray-900">{item.year}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-revenue', incomeExpandedRows, setIncomeExpandedRows, 'Revenue')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.revenue)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-revenue'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.revenue, 'Revenue')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-cogs', incomeExpandedRows, setIncomeExpandedRows, 'COGS')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.cogs)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-cogs'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.cogs, 'COGS')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-gross', incomeExpandedRows, setIncomeExpandedRows, 'Gross Profit')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.grossProfit)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-gross'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.grossProfit, 'Gross Profit')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-sga', incomeExpandedRows, setIncomeExpandedRows, 'SG&A')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.sga)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-sga'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.sga, 'SG&A')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-ebitda', incomeExpandedRows, setIncomeExpandedRows, 'EBITDA')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.ebitda)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-ebitda'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.ebitda, 'EBITDA')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-depr', incomeExpandedRows, setIncomeExpandedRows, 'Depreciation')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.depreciation)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-depr'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.depreciation, 'Depreciation')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-ebit', incomeExpandedRows, setIncomeExpandedRows, 'EBIT')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.ebit)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-ebit'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.ebit, 'EBIT')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-taxes', incomeExpandedRows, setIncomeExpandedRows, 'Taxes')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.taxes)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-taxes'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.taxes, 'Taxes')
                                                )}
                                                <tr className="hover:bg-green-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('income-net', incomeExpandedRows, setIncomeExpandedRows, 'Net Income')}
                                                    </td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.netIncome)}</td>
                                                    ))}
                                                </tr>
                                                {incomeExpandedRows['income-net'] && (
                                                    renderYoYDeltaRow(stockData.incomeStatement, (i) => i.netIncome, 'Net Income')
                                                )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-6 flex items-center gap-3">
                                            <PieChart className="text-purple-600" size={20} />
                                            Ratios (% of Sales)
                                        </h4>
                                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-900">Ratio</th>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <th key={item.year} className="text-right py-4 px-6 font-bold text-gray-900">{item.year}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">COGS %</td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatPercent((item.cogs / item.revenue) * 100)}</td>
                                                    ))}
                                                </tr>
                                                <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">Gross Margin %</td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatPercent((item.grossProfit / item.revenue) * 100)}</td>
                                                    ))}
                                                </tr>
                                                <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">SG&A %</td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatPercent((item.sga / item.revenue) * 100)}</td>
                                                    ))}
                                                </tr>
                                                <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">EBIT %</td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatPercent((item.ebit / item.revenue) * 100)}</td>
                                                    ))}
                                                </tr>
                                                <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-gray-900">Net Margin %</td>
                                                    {stockData.incomeStatement.map((item: IncomeStatementItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatPercent((item.netIncome / item.revenue) * 100)}</td>
                                                    ))}
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'balance' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <PieChart className="text-orange-600" size={24} />
                                            Balance Sheet (in millions)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-orange-50 to-yellow-50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-900">Metric</th>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <th key={item.year} className="text-right py-4 px-6 font-bold text-gray-900">{item.year}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                <tr className="hover:bg-orange-50/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        {renderRowToggle('balance-cash', balanceExpandedRows, setBalanceExpandedRows, 'Cash')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.cash)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-cash'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.cash, 'Cash')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-ar', balanceExpandedRows, setBalanceExpandedRows, 'Accounts Receivable')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.accountsReceivable)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-ar'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.accountsReceivable, 'Accounts Receivable')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-inventory', balanceExpandedRows, setBalanceExpandedRows, 'Inventory')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.inventory)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-inventory'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.inventory, 'Inventory')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-ppe', balanceExpandedRows, setBalanceExpandedRows, 'PP&E')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.ppe)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-ppe'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.ppe, 'PP&E')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-assets', balanceExpandedRows, setBalanceExpandedRows, 'Total Assets')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.totalAssets)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-assets'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.totalAssets, 'Total Assets')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-ap', balanceExpandedRows, setBalanceExpandedRows, 'Accounts Payable')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.accountsPayable)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-ap'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.accountsPayable, 'Accounts Payable')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-std', balanceExpandedRows, setBalanceExpandedRows, 'Short-term Debt')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.shortTermDebt)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-std'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.shortTermDebt, 'Short-term Debt')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-ltd', balanceExpandedRows, setBalanceExpandedRows, 'Long-term Debt')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.longTermDebt)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-ltd'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.longTermDebt, 'Long-term Debt')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-liab', balanceExpandedRows, setBalanceExpandedRows, 'Total Liabilities')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.totalLiabilities)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-liab'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.totalLiabilities, 'Total Liabilities')
                                                )}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {renderRowToggle('balance-equity', balanceExpandedRows, setBalanceExpandedRows, 'Shareholders Equity')}
                                                    </td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <td key={item.year} className="py-3 px-4 text-right">{formatCurrency(item.shareholdersEquity)}</td>
                                                    ))}
                                                </tr>
                                                {balanceExpandedRows['balance-equity'] && (
                                                    renderYoYDeltaRow(stockData.balanceSheet, (i) => i.shareholdersEquity, 'Shareholders Equity')
                                                )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 mt-8 mb-4">Balance Sheet Ratios</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold">Ratio</th>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => (
                                                        <th key={item.year} className="text-right py-3 px-4 font-semibold">{item.year}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium">D/E Ratio</td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => {
                                                        const totalDebt = item.shortTermDebt + item.longTermDebt;
                                                        const deRatio = totalDebt / item.shareholdersEquity;
                                                        return (
                                                            <td key={item.year} className="py-3 px-4 text-right">{deRatio.toFixed(2)}</td>
                                                        );
                                                    })}
                                                </tr>
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium">Current Ratio</td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => {
                                                        const currentAssets = item.cash + item.accountsReceivable + item.inventory;
                                                        const currentLiabilities = item.accountsPayable + item.shortTermDebt;
                                                        const currentRatio = currentAssets / currentLiabilities;
                                                        return (
                                                            <td key={item.year} className="py-3 px-4 text-right">{currentRatio.toFixed(2)}</td>
                                                        );
                                                    })}
                                                </tr>
                                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium">Quick Ratio</td>
                                                    {stockData.balanceSheet.map((item: BalanceSheetItem) => {
                                                        const currentLiabilities = item.accountsPayable + item.shortTermDebt;
                                                        const quickRatio = (item.cash + item.accountsReceivable) / currentLiabilities;
                                                        return (
                                                            <td key={item.year} className="py-3 px-4 text-right">{quickRatio.toFixed(2)}</td>
                                                        );
                                                    })}
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'cashflow' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <Activity className="text-cyan-600" size={24} />
                                            Cash Flow Statement (in millions)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-900">Year</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Operating Cash Flow</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Capital Expenditures</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">Free Cash Flow</th>
                                                    <th className="text-right py-4 px-6 font-bold text-gray-900">FCF Growth</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                {stockData.cashFlow.map((item: CashFlowItem, index: number) => {
                                                    const prevItem = stockData.cashFlow[index + 1];
                                                    const fcfGrowth = prevItem ? calculateGrowthRate(item.freeCashFlow, prevItem.freeCashFlow) : 0;

                                                    return (
                                                        <tr key={item.year} className="hover:bg-cyan-50/50 transition-colors duration-200">
                                                            <td className="py-4 px-6 font-semibold text-gray-900">{item.year}</td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.operatingCashFlow)}</td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.capex)}</td>
                                                            <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.freeCashFlow)}</td>
                                                            <td className={`py-4 px-6 text-right font-bold ${
                                                                fcfGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {index === stockData.cashFlow.length - 1 ? '-' : formatPercent(fcfGrowth)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StockResearchDashboard;