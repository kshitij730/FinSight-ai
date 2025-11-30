import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComparisonResult, UploadedFile, LinkResource, DocumentType, AnalysisMode, ScenarioModifiers, ScenarioResult, Plugin, Integration, FinancialFact } from "../types";

// --- ROBUST API KEY RETRIEVAL ---
// This function ensures the app doesn't crash if 'process' is undefined (common in browser/vite/esbuild envs)
const getApiKey = (): string => {
  try {
    // 1. Check standard node-style process.env
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    }
    // 2. Check for Vite-style import.meta.env (fallback)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
        // @ts-ignore
        if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Silently fail if environment access is restricted
    console.warn("Could not access environment variables safely.");
  }
  return '';
};

const apiKey = getApiKey();
const IS_KEY_VALID = !!apiKey && apiKey !== 'missing_api_key_placeholder';

// Initialize Gemini Client safely.
// We NEVER throw here, because throwing at the top level causes a "White Screen of Death" 
// before the React app can even mount.
let ai: GoogleGenAI;
try {
    // If key is missing, we use a dummy so the object exists. We will check IS_KEY_VALID later.
    ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_init' });
} catch (error) {
    console.error("Gemini Client Init Warning:", error);
    // Absolute fallback to ensure the module exports valid objects
    ai = new GoogleGenAI({ apiKey: 'fallback_init_key' });
}

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summaryPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A comprehensive executive summary consisting of 8-10 detailed bullet points. Explain 'why' and 'how'.",
    },
    keyDifferences: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          parameter: { type: Type.STRING, description: "The specific metric or clause (e.g., 'Net Interest Margin')." },
          valueDoc1: { type: Type.STRING, description: "Detailed value/extract from first source." },
          valueDoc2: { type: Type.STRING, description: "Detailed value/extract from second source." },
          trend: { 
            type: Type.STRING, 
            enum: ["UP", "DOWN", "NEUTRAL"],
            description: "Directional change."
          }
        },
        required: ["parameter", "valueDoc1", "valueDoc2", "trend"]
      },
      description: "Comparison table. Identify numerical and qualitative shifts.",
    },
    riskAssessment: {
      type: Type.STRING,
      description: "Deep-dive risk assessment (Credit, Market, Operational).",
    },
    financialImplications: {
      type: Type.STRING,
      description: "Forecast and impact analysis.",
    },
    chartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        },
        required: ["name", "value"],
      },
      description: "5-8 key financial metrics for bar chart.",
    },
    pieChartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        },
        required: ["name", "value"],
      },
      description: "Data for pie chart (expenses/revenue breakdown).",
    },
    sentimentScore: { type: Type.NUMBER, description: "0-100 score." },
    sentimentLabel: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL", "CAUTIOUS"] },
    confidenceScore: { type: Type.NUMBER, description: "0-100 confidence." },
    strategicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['CRITICAL', 'WARNING', 'INFO'] },
          category: { type: Type.STRING, enum: ['CASHFLOW', 'EXPENSE', 'PROFITABILITY', 'OPERATIONAL', 'AUDIT'] },
          message: { type: Type.STRING }
        },
        required: ["type", "category", "message"]
      },
      description: "Detect anomalies: Cashflow drops, expense spikes, payroll increases, or negative financial ratio trends."
    },
    pluginData: {
      type: Type.OBJECT,
      properties: {
        valuation_dcf: { type: Type.STRING, description: "Output for Valuation Plugin if active. Calculated Intrinsic Value." },
        saas_metrics: { type: Type.STRING, description: "Output for SaaS Plugin if active. LTV, CAC, Churn." },
        fraud_check: { type: Type.STRING, description: "Output for Fraud Plugin if active. Anomalies found." }
      },
      description: "Specific outputs for enabled plugins."
    },
    historicalContext: {
        type: Type.STRING,
        description: "Phase 4: Insights derived by comparing current documents against the provided 'Vault' history."
    },
    forecastData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
           period: { type: Type.STRING, description: "Month/Year string, e.g. 'Jan 24'" },
           actual: { type: Type.NUMBER, nullable: true },
           forecast: { type: Type.NUMBER, nullable: true },
           lowerBound: { type: Type.NUMBER, description: "Confidence interval lower bound" },
           upperBound: { type: Type.NUMBER, description: "Confidence interval upper bound" }
        }
      },
      description: "12-month rolling cashflow forecast. First 6 months actuals (if avail), next 6 forecast."
    },
    predictiveRisk: {
      type: Type.OBJECT,
      properties: {
         bankruptcyProbability: { type: Type.NUMBER, description: "0-100% estimated probability based on Altman Z-Score factors." },
         altmanZScore: { type: Type.NUMBER, description: "Calculated Altman Z-Score." },
         fraudRiskScore: { type: Type.NUMBER, description: "0-100 Score based on anomalies." },
         details: { type: Type.STRING, description: "Explanation of the scores." }
      },
      required: ["bankruptcyProbability", "altmanZScore", "fraudRiskScore", "details"]
    },
    actionableInsights: {
      type: Type.ARRAY,
      items: {
         type: Type.OBJECT,
         properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impactValue: { type: Type.STRING, description: "Estimated financial impact e.g. '$15k savings'" },
            category: { type: Type.STRING, enum: ['COST', 'REVENUE', 'RISK', 'STRATEGY'] },
            priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
         },
         required: ["title", "description", "impactValue", "category", "priority"]
      }
    }
  },
  required: ["summaryPoints", "keyDifferences", "riskAssessment", "chartData", "pieChartData", "financialImplications", "sentimentScore", "sentimentLabel", "strategicRecommendations", "confidenceScore", "alerts", "predictiveRisk", "actionableInsights", "forecastData"],
};

// Schema for extracting facts for Memory Vault
const factExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Brief 1-sentence summary of the document." },
    facts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING, description: "Name of the data point (e.g. 'Revenue Q3', 'Vendor Name')" },
          value: { type: Type.STRING, description: "The value (e.g. '$1.5M', 'Acme Corp')" },
          dateContext: { type: Type.STRING, description: "Associated date or period." },
          sourceDoc: { type: Type.STRING, description: "Always leave empty, will be filled by app." }
        },
        required: ["metric", "value", "dateContext"]
      }
    }
  },
  required: ["summary", "facts"]
};

// Schema for scenario analysis results
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectedNetIncome: { type: Type.STRING, description: "Projected Net Income value." },
    projectedMargin: { type: Type.STRING, description: "Projected Margin value." },
    riskShift: { type: Type.STRING, description: "Analysis of how risk profile changes." },
    impactAnalysis: { type: Type.STRING, description: "Detailed impact analysis." },
    chartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          baseline: { type: Type.NUMBER, description: "Original value" },
          projected: { type: Type.NUMBER, description: "Projected value" },
        },
        required: ["name", "baseline", "projected"],
      },
      description: "Comparative data for charts (Baseline vs Projected).",
    }
  },
  required: ["projectedNetIncome", "projectedMargin", "riskShift", "impactAnalysis", "chartData"]
};

export const analyzeDocuments = async (
  files: UploadedFile[],
  links: LinkResource[],
  mode: AnalysisMode,
  activePlugins: Plugin[] = [],
  activeIntegrations: Integration[] = [],
  vaultContext: string = ''
): Promise<ComparisonResult> => {
  
  // LAZY VALIDATION: We only throw the error when the user actually tries to do something.
  // This prevents the "White Screen" on startup.
  if (!IS_KEY_VALID) {
    throw new Error("Configuration Error: GEMINI_API_KEY is missing. Please set this environment variable in your project settings.");
  }

  const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f.fileObject)));
  
  const distinctTypes = Array.from(new Set(files.map(f => f.docType || 'OTHER')));
  const docTypeContext = distinctTypes.join(', ');

  let promptText = `
    You are a senior Chief Financial Officer and Data Scientist using Predictive Analytics.
    Task: Conduct a deep-dive forensic analysis of the attached documents.
    Analysis Mode: **${mode}**
    Document Context: These appear to be ${docTypeContext} documents. Adjust your extraction logic accordingly.
  `;

  if (vaultContext) {
    promptText += `\n\n${vaultContext}\n\nINSTRUCTION: The above 'Knowledge Vault' contains historical data and facts from previous documents. Use this to identify LONG-TERM TRENDS, RECURRING ANOMALIES, or CONTRADICTIONS between past and present data. Populate the 'historicalContext' field with these findings.`;
  }

  if (activeIntegrations.length > 0) {
    promptText += `\n\n### INTEGRATED DATA SOURCES (LIVE CONTEXT) ###\n`;
    activeIntegrations.forEach(int => {
      promptText += `SOURCE: ${int.name}\nDATA: ${int.mockContext}\n`;
    });
    promptText += `\nINSTRUCTION: Cross-reference the uploaded documents with this live data. Highlight discrepancies between the documents and the integrated data sources in the 'Risk' and 'Alerts' sections.\n`;
  }

  if (activePlugins.length > 0) {
    promptText += `\n\n### ACTIVE ANALYTICS PLUGINS ###\n`;
    activePlugins.forEach(p => {
      promptText += `PLUGIN: ${p.name} (${p.id})\nINSTRUCTION: Perform specific analysis related to ${p.name}. Return the result in the 'pluginData' field under the key '${p.id}'.\n`;
      if(p.id === 'valuation_dcf') promptText += "Calculate a simplified DCF valuation based on available cash flow data.\n";
      if(p.id === 'saas_metrics') promptText += "Extract or estimate SaaS metrics: ARR, MRR, Churn, LTV/CAC.\n";
      if(p.id === 'fraud_check') promptText += "Scan specifically for Benford's Law anomalies or round number patterns that suggest manipulation.\n";
    });
  }

  if (mode === 'PERIOD_VS_PERIOD') {
    promptText += " Focus on trend analysis, growth rates (YoY, QoQ), and variance analysis.";
  } else if (mode === 'ENTITY_VS_ENTITY') {
    promptText += " Focus on competitive benchmarking, relative strength, and efficiency ratios.";
  } else if (mode === 'ACTUAL_VS_BUDGET') {
    promptText += " Focus on performance gaps, over/under-spending, and realization rates.";
  } else if (mode === 'CROSS_DOC_AUDIT') {
    promptText += " CRITICAL TASK: Perform a Cross-Document Consistency Audit. Verify that data points in one document (e.g. Invoice Amount) match corresponding entries in others (e.g. Bank Statement or P&L). Highlight ANY discrepancy as a 'CRITICAL' Alert.";
  }
  
  if (links.length > 0) {
    promptText += ` and the following external resources: ${links.map(l => l.url).join(", ")}`;
    promptText += ". Use Google Search to cross-reference data and verify claims.";
  }

  promptText += `
    Perform a rigorous comparison and insight generation.
    1. **Executive Summary**: Narrative summary.
    2. **Detailed Comparison**: Extract specific data points.
    3. **Risk & Alerts**: Identify anomalies.
    4. **Sentiment & Strategy**: Analyze tone and provide recommendations.
    5. **PREDICTIVE ANALYTICS**:
        - Generate a 12-period Cashflow Forecast (6 historical, 6 projected) based on trends.
        - Calculate an estimated **Altman Z-Score** to predict bankruptcy risk.
        - Calculate a **Fraud Risk Score** based on data irregularity.
    6. **ACTIONABLE INSIGHTS**:
        - Provide concrete, specific recommendations (e.g. "Renegotiate Cloud Vendor X").
        - Estimate the financial impact in dollars (e.g. "$12k Savings").
    
    IMPORTANT: Be extremely precise with numbers.
  `;

  const tools = links.length > 0 ? [{ googleSearch: {} }] : [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          ...fileParts,
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema,
        tools: tools,
        systemInstruction: "You are an expert financial analyst. Your output must be comprehensive, professional, and detailed. Do not summarize briefly; provide depth.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ComparisonResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const extractDocumentFacts = async (file: UploadedFile): Promise<{summary: string, facts: FinancialFact[]}> => {
  if (!IS_KEY_VALID) throw new Error("Configuration Error: GEMINI_API_KEY Missing");
  const filePart = await fileToGenerativePart(file.fileObject);
  
  const prompt = `
    Extract key financial facts from this ${file.docType || 'document'}.
    Identify important metrics, dates, and values that would be useful for long-term historical comparison.
    Example: { "metric": "Total Revenue", "value": "$1.2M", "dateContext": "Q3 2023" }
    Also provide a 1-sentence summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [filePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: factExtractionSchema,
      }
    });

    const text = response.text;
    if(!text) throw new Error("Failed to extract facts");
    return JSON.parse(text);

  } catch (e) {
    console.error("Fact Extraction Error:", e);
    throw e;
  }
}

export const analyzeScenario = async (
  currentResult: ComparisonResult,
  modifiers: ScenarioModifiers
): Promise<ScenarioResult> => {
  if (!IS_KEY_VALID) throw new Error("Configuration Error: GEMINI_API_KEY Missing");
  const promptText = `
    Perform a 'What-If' Scenario Analysis based on the previous financial context.
    
    Context Summary:
    - Current Sentiment: ${currentResult.sentimentLabel}
    - Risk Profile: ${currentResult.riskAssessment}
    - Key Metrics: ${JSON.stringify(currentResult.chartData)}
    
    User Defined Modifiers (Hypothetical Changes):
    - Revenue: ${modifiers.revenueChange > 0 ? '+' : ''}${modifiers.revenueChange}%
    - Cost of Goods/Services: ${modifiers.costChange > 0 ? '+' : ''}${modifiers.costChange}%
    - Operational Efficiency: ${modifiers.operationalEfficiency > 0 ? '+' : ''}${modifiers.operationalEfficiency}%
    
    Task:
    1. Recalculate Net Income and Margins based on these modifiers.
    2. Analyze how the risk profile shifts (e.g., does lower cost reduce operational risk?).
    3. Generate comparative chart data (Baseline vs Projected) for Revenue, Costs, and Net Income.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        systemInstruction: "You are a financial simulation engine. Calculate projected values accurately based on the percentage modifiers provided."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as ScenarioResult;
  } catch (error) {
    console.error("Scenario Error:", error);
    throw error;
  }
};

export const chatWithContext = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  files: UploadedFile[]
) => {
  if (!IS_KEY_VALID) throw new Error("Configuration Error: GEMINI_API_KEY Missing");
  
  const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f.fileObject)));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })), 
      {
        role: 'user',
        parts: [...fileParts, { text: newMessage }]
      }
    ],
    config: {
        systemInstruction: "You are a specialized banking and financial assistant. Provide detailed, evidence-based answers citing the documents provided."
    }
  });

  return response.text;
};
