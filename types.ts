
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  content: string; // Base64 or text content
  fileObject: File;
  progress: number; // 0 to 100
  status: 'uploading' | 'done' | 'error';
  docType?: DocumentType; // Classification for better parsing
}

export type DocumentType = 'FINANCIAL_REPORT' | 'INVOICE' | 'CONTRACT' | 'BANK_STATEMENT' | 'OTHER';

export type AnalysisMode = 'PERIOD_VS_PERIOD' | 'ENTITY_VS_ENTITY' | 'ACTUAL_VS_BUDGET' | 'CROSS_DOC_AUDIT' | 'GENERAL';

export interface LinkResource {
  id: string;
  url: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  INDEXING = 'INDEXING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  [key: string]: any;
}

export interface DifferenceItem {
  parameter: string;
  valueDoc1: string;
  valueDoc2: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
}

export interface Alert {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'CASHFLOW' | 'EXPENSE' | 'PROFITABILITY' | 'OPERATIONAL' | 'AUDIT';
  message: string;
}

// --- PHASE 5: PREDICTIVE ANALYTICS ---

export interface ForecastPoint {
  period: string; // e.g., "Jan 24"
  actual: number | null;
  forecast: number | null;
  lowerBound?: number; // Confidence interval
  upperBound?: number;
}

export interface RiskScorecard {
  bankruptcyProbability: number; // 0-100%
  altmanZScore: number; // e.g. 1.8
  fraudRiskScore: number; // 0-100
  details: string;
}

export interface ActionableInsight {
  title: string;
  description: string;
  impactValue: string; // e.g. "$50k Savings"
  category: 'COST' | 'REVENUE' | 'RISK' | 'STRATEGY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ComparisonResult {
  summaryPoints: string[];
  keyDifferences: DifferenceItem[];
  riskAssessment: string;
  financialImplications: string;
  chartData: ChartDataPoint[];
  pieChartData: ChartDataPoint[];
  sentimentScore: number; 
  sentimentLabel: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'CAUTIOUS';
  strategicRecommendations: string[]; // Legacy, kept for fallback
  confidenceScore: number;
  alerts: Alert[]; 
  pluginData?: Record<string, any>; // Flexible storage for plugin outputs
  historicalContext?: string; // Phase 4: Insights derived from Vault
  
  // Phase 5 additions
  forecastData?: ForecastPoint[];
  predictiveRisk?: RiskScorecard;
  actionableInsights?: ActionableInsight[];
}

export interface ScenarioModifiers {
  revenueChange: number; // Percentage -50 to +50
  costChange: number;
  operationalEfficiency: number;
}

export interface ScenarioResult {
  projectedNetIncome: string;
  projectedMargin: string;
  riskShift: string;
  impactAnalysis: string;
  chartData: ChartDataPoint[]; // Projected vs Baseline data
}

export interface SavedReport {
  id: string;
  title: string;
  date: string;
  result: ComparisonResult;
  fileNames: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  user: string;
  avatar: string; // Initials or URL
  text: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  MARKETPLACE = 'MARKETPLACE',
  VAULT = 'VAULT'
}

// --- PHASE 3 ADDITIONS ---

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  active: boolean;
  category: 'MODEL' | 'RISK' | 'ANALYTICS';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string; // URL or name
  status: 'CONNECTED' | 'DISCONNECTED';
  mockContext: string; // Data to inject when connected
}

export enum ReportType {
  BOARD_DECK = 'BOARD_DECK',
  INVESTOR_UPDATE = 'INVESTOR_UPDATE',
  SWOT_ANALYSIS = 'SWOT_ANALYSIS'
}

// --- PHASE 4: MEMORY VAULT ---

export interface FinancialFact {
  metric: string;
  value: string;
  dateContext: string;
  sourceDoc: string;
}

export interface VaultItem {
  id: string;
  fileName: string;
  dateIndexed: string;
  docType: DocumentType;
  facts: FinancialFact[];
  summary: string;
}

export interface PrivacySettings {
  secureMode: boolean; // If true, strictly local storage, no external logging (simulated)
}
