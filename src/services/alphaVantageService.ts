import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  AlphaVantageGlobalQuoteResponse,
  AlphaVantageOverviewResponse,
  AlphaVantageIncomeStatementResponse,
  AlphaVantageBalanceSheetResponse,
  AlphaVantageCashFlowResponse,
  AlphaVantageTimeSeriesDailyResponse,
  ApiConfig,
  RateLimitState
} from '../types/apiTypes';

// API Configuration
const API_CONFIG: ApiConfig = {
  baseUrl: 'https://www.alphavantage.co/query',
  apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo',
  rateLimit: 5, // requests per minute
  rateWindow: 60000 // 1 minute in milliseconds
};

// Rate limiting state
let rateLimitState: RateLimitState = {
  requests: 0,
  resetTime: Date.now() + API_CONFIG.rateWindow
};

// Rate limiting helper
const checkRateLimit = async (): Promise<void> => {
  const now = Date.now();
  
  // Reset counter if window has passed
  if (now >= rateLimitState.resetTime) {
    rateLimitState.requests = 0;
    rateLimitState.resetTime = now + API_CONFIG.rateWindow;
  }
  
  // Check if we've exceeded the rate limit
  if (rateLimitState.requests >= API_CONFIG.rateLimit) {
    const waitTime = rateLimitState.resetTime - now;
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`);
  }
  
  rateLimitState.requests++;
};

// Generic API request function
const makeApiRequest = async <T>(
  params: Record<string, string>
): Promise<T> => {
  await checkRateLimit();
  
  try {
    const response: AxiosResponse<T> = await axios.get(API_CONFIG.baseUrl, {
      params: {
        ...params,
        apikey: API_CONFIG.apiKey
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Check for API errors
    const data = response.data as any;
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    if (data['Note']) {
      throw new Error(data['Note']);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API request failed: ${error.message}`);
    }
    throw error;
  }
};

// API Service Functions
export const alphaVantageService = {
  // Get real-time stock quote
  getGlobalQuote: async (symbol: string): Promise<AlphaVantageGlobalQuoteResponse> => {
    return makeApiRequest<AlphaVantageGlobalQuoteResponse>({
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase()
    });
  },

  // Get company overview
  getOverview: async (symbol: string): Promise<AlphaVantageOverviewResponse> => {
    return makeApiRequest<AlphaVantageOverviewResponse>({
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase()
    });
  },

  // Get annual income statements
  getIncomeStatement: async (symbol: string): Promise<AlphaVantageIncomeStatementResponse> => {
    return makeApiRequest<AlphaVantageIncomeStatementResponse>({
      function: 'INCOME_STATEMENT',
      symbol: symbol.toUpperCase()
    });
  },

  // Get annual balance sheets
  getBalanceSheet: async (symbol: string): Promise<AlphaVantageBalanceSheetResponse> => {
    return makeApiRequest<AlphaVantageBalanceSheetResponse>({
      function: 'BALANCE_SHEET',
      symbol: symbol.toUpperCase()
    });
  },

  // Get annual cash flow statements
  getCashFlow: async (symbol: string): Promise<AlphaVantageCashFlowResponse> => {
    return makeApiRequest<AlphaVantageCashFlowResponse>({
      function: 'CASH_FLOW',
      symbol: symbol.toUpperCase()
    });
  },

  // Get daily time series data for charts
  getTimeSeriesDaily: async (symbol: string): Promise<AlphaVantageTimeSeriesDailyResponse> => {
    return makeApiRequest<AlphaVantageTimeSeriesDailyResponse>({
      function: 'TIME_SERIES_DAILY',
      symbol: symbol.toUpperCase(),
      outputsize: 'compact' // Use 'full' for more data, 'compact' for last 100 data points
    });
  },

  // Get all stock data in one call (with proper error handling)
  getAllStockData: async (symbol: string) => {
    try {
      // Make all API calls in parallel for better performance
      const [globalQuote, overview, incomeStatement, balanceSheet, cashFlow, timeSeries] = await Promise.allSettled([
        alphaVantageService.getGlobalQuote(symbol),
        alphaVantageService.getOverview(symbol),
        alphaVantageService.getIncomeStatement(symbol),
        alphaVantageService.getBalanceSheet(symbol),
        alphaVantageService.getCashFlow(symbol),
        alphaVantageService.getTimeSeriesDaily(symbol)
      ]);

      // Check which requests succeeded
      const results = {
        globalQuote: globalQuote.status === 'fulfilled' ? globalQuote.value : null,
        overview: overview.status === 'fulfilled' ? overview.value : null,
        incomeStatement: incomeStatement.status === 'fulfilled' ? incomeStatement.value : null,
        balanceSheet: balanceSheet.status === 'fulfilled' ? balanceSheet.value : null,
        cashFlow: cashFlow.status === 'fulfilled' ? cashFlow.value : null,
        timeSeries: timeSeries.status === 'fulfilled' ? timeSeries.value : null
      };

      // Check if we have at least the basic data
      if (!results.globalQuote && !results.overview) {
        throw new Error('Unable to fetch basic stock information. Please check the symbol and try again.');
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get remaining requests in current window
  getRemainingRequests: (): number => {
    const now = Date.now();
    if (now >= rateLimitState.resetTime) {
      return API_CONFIG.rateLimit;
    }
    return Math.max(0, API_CONFIG.rateLimit - rateLimitState.requests);
  },

  // Get time until rate limit resets
  getTimeUntilReset: (): number => {
    const now = Date.now();
    return Math.max(0, rateLimitState.resetTime - now);
  }
};

export default alphaVantageService;
