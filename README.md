# PortfolioSync & Balance

PortfolioSync & Balance is a React and Vite portfolio tracker for reviewing assets, liabilities, allocation drift, collateral groups, and LTV risk. It can run with built-in sample data, import or export CSV files, and optionally sync holdings from a Google Sheet.

## Run Locally

Prerequisite: Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optional: create `.env.local` with a Gemini API key if you want AI analysis or Google Sheets sync:

   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Data Sources

- Without a Sheet ID, the app starts with sample data and the sync button simulates price movement.
- CSV import and export use the same column order as the Google Sheets integration.
- Google Sheets sync expects a readable sheet range such as `Sheet1!A2:M`.

## Security Notes

- Do not commit `.env.local`, API keys, exported portfolios, or private spreadsheet IDs.
- This app currently injects `GEMINI_API_KEY` into the browser bundle for local use. Do not deploy it publicly with an unrestricted API key.
- For production, route Gemini and Google Sheets requests through a backend or serverless proxy and restrict credentials at the provider level.
- Use private spreadsheets for real portfolio data and share them only with accounts that need access.

## Disclaimer

This tool is for portfolio tracking and scenario review only. It is not financial advice.
