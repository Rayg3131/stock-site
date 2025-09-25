# Alpha Vantage API Setup

This application uses the Alpha Vantage API to fetch real-time stock data. Follow these steps to set up your API key:

## 1. Get Your API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Copy your API key

## 2. Configure Environment Variables

### Option 1: Environment File (Recommended)
Create a `.env` file in the project root:

```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### Option 2: Command Line
Set the environment variable when running the development server:

```bash
# Windows (PowerShell)
$env:VITE_ALPHA_VANTAGE_API_KEY="your_api_key_here"; npm run dev

# Windows (Command Prompt)
set VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here && npm run dev

# macOS/Linux
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here npm run dev
```

## 3. API Rate Limits

- **Free Tier**: 5 requests per minute, 500 requests per day
- **Premium Tier**: Higher limits available

The application includes rate limiting to respect these limits and will show you:
- Remaining requests in the current window
- Time until the rate limit resets

## 4. Testing

Once configured, you can test the application by:
1. Starting the development server: `npm run dev`
2. Opening the application in your browser
3. Searching for a stock symbol (e.g., "AAPL", "MSFT", "GOOGL")

## 5. Troubleshooting

### "API key not configured" Error
- Make sure you've set the `VITE_ALPHA_VANTAGE_API_KEY` environment variable
- Restart the development server after setting the environment variable

### "Rate limit exceeded" Error
- Wait for the rate limit to reset (shown in the UI)
- Consider upgrading to a premium Alpha Vantage plan for higher limits

### "No data found" Error
- Verify the stock symbol is correct
- Some symbols may not be available in the Alpha Vantage database
- Try popular symbols like AAPL, MSFT, GOOGL, TSLA

## 6. Available Data

The application fetches:
- Real-time stock price and basic info
- Company overview and key metrics
- Annual income statements (5 years)
- Annual balance sheets (5 years)
- Annual cash flow statements (5 years)
- Historical price data for charts

## 7. Demo Mode

If no API key is configured, the application will show a demo mode with limited functionality. To get full access to real-time data, please configure your Alpha Vantage API key.
