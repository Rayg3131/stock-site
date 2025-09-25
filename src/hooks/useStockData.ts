import { useState, useCallback, useRef } from 'react';
import type { StockData } from '../types/stockTypes';
import alphaVantageService from '../services/alphaVantageService';
import { transformOverviewToStockData, getChartDataForRange } from '../utils/dataTransformers';
import type { AlphaVantageTimeSeriesDaily } from '../types/apiTypes';

interface UseStockDataReturn {
  stockData: StockData | null;
  chartData: Array<{ t: number; p: number }>;
  loading: boolean;
  error: string;
  searchStock: (ticker: string) => Promise<void>;
  updateChartRange: (range: '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y') => void;
  remainingRequests: number;
  timeUntilReset: number;
}

export const useStockData = (): UseStockDataReturn => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<Array<{ t: number; p: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRange, setCurrentRange] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | '5Y'>('1M');
  const timeSeriesDataRef = useRef<AlphaVantageTimeSeriesDaily | null>(null);

  const searchStock = useCallback(async (ticker: string) => {
    if (!ticker.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    setStockData(null);
    setChartData([]);
    timeSeriesDataRef.current = null;

    try {
      // Check if we have API key
      if (!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || import.meta.env.VITE_ALPHA_VANTAGE_API_KEY === 'demo') {
        throw new Error('API key not configured. Please set VITE_ALPHA_VANTAGE_API_KEY in your environment variables.');
      }

      // Check rate limit
      const remainingRequests = alphaVantageService.getRemainingRequests();
      if (remainingRequests === 0) {
        const timeUntilReset = alphaVantageService.getTimeUntilReset();
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds before trying again.`);
      }

      // Fetch all stock data
      const apiData = await alphaVantageService.getAllStockData(ticker.toUpperCase());

      // Transform the data
      if (apiData.globalQuote && apiData.overview) {
        const transformedData = transformOverviewToStockData(
          apiData.overview as any,
          apiData.globalQuote['Global Quote'],
          apiData.incomeStatement?.annualReports || [],
          apiData.balanceSheet?.annualReports || [],
          apiData.cashFlow?.annualReports || []
        );

        setStockData(transformedData);

        // Set up chart data
        if (apiData.timeSeries?.['Time Series (Daily)']) {
          timeSeriesDataRef.current = apiData.timeSeries['Time Series (Daily)'];
          const newChartData = getChartDataForRange(timeSeriesDataRef.current, currentRange);
          setChartData(newChartData);
        }
      } else {
        throw new Error(`No data found for symbol: ${ticker.toUpperCase()}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentRange]);

  const updateChartRange = useCallback((range: '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y') => {
    setCurrentRange(range);
    
    if (timeSeriesDataRef.current) {
      const newChartData = getChartDataForRange(timeSeriesDataRef.current, range);
      setChartData(newChartData);
    }
  }, []);

  const remainingRequests = alphaVantageService.getRemainingRequests();
  const timeUntilReset = alphaVantageService.getTimeUntilReset();

  return {
    stockData,
    chartData,
    loading,
    error,
    searchStock,
    updateChartRange,
    remainingRequests,
    timeUntilReset
  };
};
