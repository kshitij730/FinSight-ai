// This service simulates the OAuth flow and data fetching for external platforms.
// In a production app, this would talk to your backend API which handles the
// actual OAuth tokens and proxies requests to Stripe/Xero/Salesforce.

export interface ConnectedData {
  contextData: string;
  status: 'CONNECTED';
}

export const connectIntegration = async (platformId: string): Promise<ConnectedData> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay and OAuth popup interaction
    setTimeout(() => {
      // Return specific "Live" data based on the platform
      // This mimics what we would get from a fresh API call
      switch (platformId) {
        case 'stripe':
          resolve({
            status: 'CONNECTED',
            contextData: `STRIPE LIVE DATA (Synced ${new Date().toLocaleTimeString()}):
- Monthly Recurring Revenue (MRR): $54,230 (+4.5% vs last month)
- Net Revenue (YTD): $680,400
- Active Subscribers: 1,240
- Churn Rate: 1.2%
- Recent Large Transactions: $5,000 (Acme Corp), $3,200 (Stark Ind).
- Disputes: 0.1% (Healthy)`
          });
          break;
          
        case 'xero':
          resolve({
            status: 'CONNECTED',
            contextData: `XERO LEDGER (Synced ${new Date().toLocaleTimeString()}):
- Cash at Bank: $142,500
- Accounts Receivable (Aged > 30 days): $12,400 (High Risk)
- Accounts Payable: $18,200
- Payroll Liability: $45,000
- Unreconciled Items: 3 transactions pending.`
          });
          break;

        case 'salesforce':
          resolve({
            status: 'CONNECTED',
            contextData: `SALESFORCE PIPELINE (Synced ${new Date().toLocaleTimeString()}):
- Total Weighted Pipeline: $1,450,000
- Opportunities Closing this Month: 5 ($320k value)
- Key Deal at Risk: Wayne Enterprises ($150k) - Stage: Negotiation
- Sales Velocity: 42 days avg cycle
- Win Rate: 28% (Trending Up)`
          });
          break;

        default:
          reject(new Error("Unknown platform"));
      }
    }, 2000); // 2 second delay to simulate popup/handshake
  });
};
