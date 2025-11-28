
# FinSight AI 🚀📊

> **Next-Generation Financial Document Intelligence Platform**

[**🔗 Access Live Application**](https://app.netlify.com/projects/documentanalytics/deploys/692615a5bfaf4fc8f848b9ae)

**FinSight AI** is an enterprise-grade financial analytics dashboard powered by **Google's Gemini 2.5 Flash**. It goes beyond simple summarization to perform forensic-level document analysis, predictive modeling, and strategic simulation. Designed for CFOs, analysts, and investors, it transforms static PDF/CSV reports into dynamic, actionable intelligence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-3178c6.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-8e75b2.svg)
![Supabase](https://img.shields.io/badge/Auth-Supabase-3ecf8e.svg)

---

## 🌟 Comprehensive Feature Suite

### 1. 🧠 Forensic Document Analysis
*   **Multi-Format Ingestion**: Upload **PDF**, **CSV**, and **TXT** files simultaneously.
*   **Context-Aware Parsing**: Auto-classifies documents (Balance Sheet, Invoice, Contract) to apply specialized extraction logic.
*   **Comparison Matrix**: Generates a line-by-line comparison table between documents (e.g., Q3 vs Q4) with visual **Trend Indicators** (📈 Increasing / 📉 Decreasing / ➖ Neutral).
*   **Cross-Document Audit**: A dedicated mode that checks consistency across files (e.g., verifying if an Invoice amount matches the P&L entry).

### 2. 🔮 Predictive Intelligence & Risk Modeling
*   **Cashflow Forecasting**: AI generates a **12-month rolling forecast** (6 months historical + 6 months projected) with confidence intervals, visualized via interactive Area Charts.
*   **Bankruptcy Prediction**: Calculates an estimated **Altman Z-Score** to quantify insolvency risk.
*   **Fraud Detection Score**: Scans for anomalies like Benford's Law violations or round-number irregularities.
*   **Sentiment Gauge**: A visual meter (0-100) detecting the underlying tone of financial narratives (Bullish/Bearish).

### 3. 🎛️ What-If Scenario Simulator
*   **Interactive Controls**: Adjust sliders for **Revenue Growth**, **Cost Structure**, and **Operational Efficiency** (-50% to +50%).
*   **Real-Time Modeling**: The AI instantly recalculates **Projected Net Income**, **Margins**, and **Risk Profiles** based on your hypothetical inputs.
*   **Impact Analysis**: Visualizes "Baseline vs. Projected" metrics to support strategic decision-making.

### 4. 💡 Actionable Strategic Insights
*   **Impact Estimation**: Unlike generic advice, FinSight provides specific recommendations with estimated financial impact (e.g., *"Renegotiate Cloud Vendor Contract → **$15k/yr Savings**"*).
*   **Prioritization**: Insights are categorized by urgency (**High/Medium/Low**) and type (Revenue, Cost, Risk).

### 5. 🧠 Memory Vault (RAG System)
*   **Long-Term Context**: "Index" critical documents into a secure local vector store.
*   **Historical Recall**: The AI retrieves facts from previously indexed documents to identify long-term trends or contradictions during new analyses.
*   **Timeline View**: Visualize your company's indexed knowledge graph over time.

### 6. 🔌 Marketplace & Integrations
*   **AI Plugins**: Enable specialized modules:
    *   **DCF Valuation**: Calculates intrinsic value.
    *   **SaaS Metrics**: Extracts LTV, CAC, Churn, ARR.
*   **Live Data Connectors**: Simulate connections to **Stripe**, **Xero**, and **Salesforce**. The AI injects this "live" context into the analysis to cross-reference static documents against real-time ledger data.

### 7. 📑 Professional Reporting
*   **Report Center**: One-click generation of stakeholder-ready PDFs:
    *   **Board Meeting Deck**: High-level KPIs and strategic narrative.
    *   **Investor Update**: Growth metrics and YoY comparisons.
    *   **SWOT Analysis**: Dedicated Strengths, Weaknesses, Opportunities, and Threats report.
*   **Excel Export**: Download raw data tables for further modeling in Excel.

### 8. 🔒 Enterprise Security
*   **Supabase Authentication**: Robust Sign-up/Login flow supporting **Email/Password** and **Google OAuth**.
*   **Privacy Mode**: Toggle "Secure Vault" to ensure historical data is stored strictly on-device (Local Storage) and never sent to a centralized backend database.

---

## 🛠️ Technical Architecture

*   **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
*   **AI Engine**: Google Gemini 2.5 Flash (via `@google/genai` SDK).
*   **Authentication**: Supabase Auth (JWT handling, OAuth).
*   **Visualization**: Recharts for responsive, animated charting.
*   **PDF Generation**: `jspdf` and `jspdf-autotable` for programmatic layout engine.
*   **State Management**: React Hooks + Local Storage for persistence.

---

## 🚀 Getting Started

### Prerequisites
1.  **Node.js** (v18+)
2.  **Google AI Studio API Key** (for Gemini models)
3.  **Supabase Project** (for Authentication)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/finsight-ai.git
    cd finsight-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:

    ```env
    # Google AI Key (Required for Analysis)
    REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

    # Supabase Credentials (Required for Auth)
    REACT_APP_SUPABASE_URL=your_supabase_project_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(If using Vite, prefix with `VITE_` instead of `REACT_APP_`)*

4.  **Start the App**
    ```bash
    npm start
    ```

### Supabase Setup Guide
1.  Go to [supabase.com](https://supabase.com) and create a free project.
2.  Navigate to **Project Settings > API** to find your `URL` and `anon public` key.
3.  Navigate to **Authentication > Providers** and enable **Google** (or just use Email/Password).
4.  Navigate to **Authentication > URL Configuration** and add `http://localhost:3000` (or your deployment URL) as a Redirect URL.

---

## 📖 Usage Workflow

1.  **Authenticate**: Log in securely via Google or Email.
2.  **Workspace**: You land on the Dashboard. Use the Sidebar to navigate.
3.  **Ingestion**: 
    *   Drag & Drop files into the upload zone.
    *   Select document types (e.g., "Financial Report") to aid parsing.
    *   (Optional) Go to **Marketplace** to connect "Stripe" for live context.
4.  **Analysis**: 
    *   Select a mode: **Period vs Period** (Growth) or **Cross-Doc Audit** (Consistency).
    *   Click "Run Analysis".
5.  **Review Results**:
    *   Explore the **Executive Summary** and **Comparison Matrix**.
    *   Check the **Risk Scorecard** for anomalies.
    *   Use the **Simulator** to model "What-If" scenarios.
6.  **Action**: 
    *   Generate a **Board Deck PDF**.
    *   Index the report to the **Vault** for future memory.

---

## 🛡️ Privacy & Security

FinSight AI is designed with a "Privacy-First" architecture:
*   **Client-Side Processing**: Document parsing logic happens in the browser before being sent to the AI model.
*   **Local Vault**: The "Memory Vault" stores vector-like facts in `localStorage`, meaning your historical corporate data resides on your device, not in our cloud database.
*   **Transient Analysis**: Unless explicitly saved, analysis results are transient and cleared upon session end.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
