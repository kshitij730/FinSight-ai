
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, Brush, AreaChart, Area
} from 'recharts';
import { FileText, TrendingUp, CheckCircle2, Download, ArrowUp, ArrowDown, Minus, PieChart as PieChartIcon, Lightbulb, Gauge, ShieldCheck, Activity, ArrowLeft, Save, FileSpreadsheet, FileIcon, AlertTriangle, Play, Sliders, Send, MessageSquare, Presentation, Printer, Share2, Box, BrainCircuit, History, Radar, Sparkles, AlertOctagon, Target } from 'lucide-react';
import { ComparisonResult, ScenarioModifiers, ScenarioResult, Comment, ReportType } from '../types';
import { analyzeScenario } from '../services/gemini';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface AnalysisProps {
  result: ComparisonResult | null;
  onBack: () => void;
  onSave?: (title: string) => void;
  savedDate?: string;
  savedTitle?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const Analysis: React.FC<AnalysisProps> = ({ result, onBack, onSave, savedDate, savedTitle }) => {
  const [scenarioData, setScenarioData] = useState<ScenarioResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [modifiers, setModifiers] = useState<ScenarioModifiers>({
    revenueChange: 0,
    costChange: 0,
    operationalEfficiency: 0
  });

  // Collaboration State
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'Alex Doe', avatar: 'AD', text: 'Great revenue growth in Q2!', timestamp: '2 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  if (!result) return null;

  const handleGenerateReport = (type: ReportType) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let cursorY = margin;

    // Helper for Header on each page
    const addHeader = (title: string) => {
      doc.setFillColor(30, 41, 59); // Slate 900
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("FinSight AI Executive Report", margin, 13);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 13, { align: 'right' });
      
      // Reset for content
      doc.setTextColor(33, 33, 33);
      cursorY = 35;
    };

    // Helper for Section Title with Auto-Page Break
    const addSectionTitle = (title: string) => {
      if (cursorY > pageHeight - 40) {
        doc.addPage();
        addHeader(type === ReportType.BOARD_DECK ? "Board Deck" : "Financial Report");
      }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text(title, margin, cursorY);
      
      // Underline
      doc.setDrawColor(59, 130, 246); // Blue 500
      doc.setLineWidth(0.5);
      doc.line(margin, cursorY + 2, margin + 20, cursorY + 2);

      cursorY += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
    };

    // Helper for Text Block with pagination
    const addTextBlock = (text: string, fontSize = 10, color = [50, 50, 50]) => {
       doc.setFontSize(fontSize);
       doc.setTextColor(color[0], color[1], color[2]);
       const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
       
       if (cursorY + (lines.length * 5) > pageHeight - margin) {
          doc.addPage();
          addHeader("Continued...");
       }
       
       doc.text(lines, margin, cursorY);
       cursorY += (lines.length * 5) + 8;
    };

    // --- START GENERATION ---

    // 1. Title Page
    doc.setFillColor(248, 250, 252); // Slate 50 background
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Abstract geometric decoration
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.circle(pageWidth + 20, -20, 80, 'F');
    doc.setFillColor(59, 130, 246); // Blue 500
    doc.circle(-20, pageHeight + 20, 60, 'F');

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(type === ReportType.BOARD_DECK ? "Board Meeting Presentation" : 
             type === ReportType.INVESTOR_UPDATE ? "Investor Update" : 
             "Strategic SWOT Analysis", pageWidth / 2, pageHeight / 3, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Generated Analysis for ${result.summaryPoints.length} Key Insights`, pageWidth / 2, (pageHeight / 3) + 12, { align: 'center' });
    
    // Confidence Badge
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect((pageWidth / 2) - 30, (pageHeight / 3) + 25, 60, 12, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text(`AI Confidence: ${result.confidenceScore}%`, pageWidth / 2, (pageHeight / 3) + 33, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // 2. Content Pages
    doc.addPage();
    addHeader("Analysis");

    // Executive Summary
    addSectionTitle("Executive Summary");
    result.summaryPoints.forEach(point => {
       if (cursorY > pageHeight - 20) { doc.addPage(); addHeader("Summary Cont."); }
       doc.setFillColor(59, 130, 246);
       doc.circle(margin - 4, cursorY - 2, 1, 'F'); // Bullet
       addTextBlock(point);
    });
    cursorY += 5;

    // Comparison Table
    addSectionTitle("Key Financial Metrics");
    
    const tableBody = result.keyDifferences.map(d => [
        d.parameter, 
        d.valueDoc1, 
        d.valueDoc2, 
        d.trend === 'UP' ? 'INCREASE' : d.trend === 'DOWN' ? 'DECREASE' : 'NEUTRAL'
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['Metric', 'Source A', 'Source B', 'Trend']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5, lineColor: [226, 232, 240] },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            3: { fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const text = data.cell.raw;
                if (text === 'INCREASE') data.cell.styles.textColor = [22, 163, 74];
                if (text === 'DECREASE') data.cell.styles.textColor = [220, 38, 38];
                if (text === 'NEUTRAL') data.cell.styles.textColor = [100, 116, 139];
            }
        },
        margin: { left: margin, right: margin }
    });

    // Reset cursor after table
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Risks
    addSectionTitle("Risk Profile & Assessment");
    addTextBlock(result.riskAssessment);
    
    // Actionable Insights Table
    if (result.actionableInsights && result.actionableInsights.length > 0) {
        // Check space
        if (cursorY > pageHeight - 60) { doc.addPage(); addHeader("Insights"); }
        else cursorY += 10;

        addSectionTitle("Actionable Strategic Insights");
        
        const insightData = result.actionableInsights.map(i => [
            i.title,
            i.priority,
            i.impactValue,
            i.description
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Strategy', 'Priority', 'Est. Impact', 'Description']],
            body: insightData,
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' }, // Emerald header
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                1: { fontStyle: 'bold', cellWidth: 25 },
                2: { cellWidth: 30 }
            },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 1) {
                  const text = data.cell.raw as string;
                  if (text === 'HIGH') data.cell.styles.textColor = [220, 38, 38];
                  if (text === 'MEDIUM') data.cell.styles.textColor = [217, 119, 6];
                  if (text === 'LOW') data.cell.styles.textColor = [37, 99, 235];
              }
            },
            margin: { left: margin, right: margin }
        });
        cursorY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Historical Context if available
    if (result.historicalContext) {
        if (cursorY > pageHeight - 40) { doc.addPage(); addHeader("History"); }
        addSectionTitle("Historical Vault Context");
        doc.setFillColor(243, 244, 246); // Light gray box
        doc.roundedRect(margin, cursorY, pageWidth - (margin*2), 30, 2, 2, 'F');
        
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(9);
        const histLines = doc.splitTextToSize(result.historicalContext, pageWidth - (margin*2) - 10);
        doc.text(histLines, margin + 5, cursorY + 7);
        cursorY += 40;
    }

    // Footer Numbering
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text("Confidential - FinSight AI Generated Report", margin, pageHeight - 10);
    }

    doc.save(`FinSight_${type}_${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Comparison Matrix
    const matrixData = result.keyDifferences.map(d => ({
        Parameter: d.parameter,
        'Source A': d.valueDoc1,
        'Source B': d.valueDoc2,
        Trend: d.trend
    }));
    const wsMatrix = XLSX.utils.json_to_sheet(matrixData);
    XLSX.utils.book_append_sheet(wb, wsMatrix, "Comparison");

    // Sheet 2: Chart Data
    const chartData = result.chartData.map(c => ({
        Metric: c.name,
        Value: c.value
    }));
    const wsChart = XLSX.utils.json_to_sheet(chartData);
    XLSX.utils.book_append_sheet(wb, wsChart, "Financial Metrics");
    
    // Sheet 3: Forecast (If available)
    if(result.forecastData) {
        const forecastData = result.forecastData.map(f => ({
            Period: f.period,
            Actual: f.actual,
            Forecast: f.forecast,
            LowerBound: f.lowerBound,
            UpperBound: f.upperBound
        }));
        const wsForecast = XLSX.utils.json_to_sheet(forecastData);
        XLSX.utils.book_append_sheet(wb, wsForecast, "Forecast");
    }

    XLSX.writeFile(wb, `FinSight-Data-${Date.now()}.xlsx`);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const data = await analyzeScenario(result, modifiers);
      setScenarioData(data);
    } catch (e) {
      console.error(e);
      alert('Simulation failed. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'ME',
      text: newComment,
      timestamp: 'Just now'
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'BULLISH': return 'text-green-600 bg-green-50 border-green-200';
      case 'BEARISH': return 'text-red-600 bg-red-50 border-red-200';
      case 'CAUTIOUS': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'WARNING': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
        case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
        default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
       
       <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in slide-in-from-right-10 fade-in duration-500 pb-20">
      
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{savedTitle || 'Analysis Report'}</h2>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-slate-500">{savedDate ? `Saved on ${new Date(savedDate).toLocaleDateString()}` : 'AI-generated financial intelligence'}</p>
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 rounded-full border border-blue-100">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">{result.confidenceScore}% Confidence</span>
                    </div>
                </div>
            </div>
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${isCommentsOpen ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Comments
                </button>
                {!savedTitle && onSave && (
                    <button
                        onClick={() => onSave(`Analysis ${new Date().toLocaleDateString()}`)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        Save Report
                    </button>
                )}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 hover:bg-white text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        title="Export as Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                    </button>
                </div>
            </div>
        </div>

        {/* ALERTS & ANOMALIES */}
        {result.alerts && result.alerts.length > 0 && (
            <div className="grid gap-4">
                {result.alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${getAlertColor(alert.type)}`}>
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm uppercase tracking-wider mb-1 opacity-80">{alert.category} • {alert.type}</div>
                            <div className="font-medium text-sm">{alert.message}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* HISTORICAL CONTEXT (PHASE 4) */}
        {result.historicalContext && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 shadow-xl shadow-indigo-500/10 border border-indigo-500/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <History className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Historical Context & Memory</h3>
                        <p className="text-indigo-200 text-xs">Insights derived from your Secure Vault history.</p>
                    </div>
                </div>
                <div className="prose prose-invert prose-sm max-w-none relative z-10 text-indigo-100/90 leading-relaxed">
                    <p>{result.historicalContext}</p>
                </div>
            </div>
        )}

        {/* --- PHASE 5: PREDICTIVE INTELLIGENCE DASHBOARD --- */}
        {result.forecastData && result.predictiveRisk && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/5 border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50/50 to-white px-8 py-5 border-b border-purple-100/50 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Predictive Intelligence</h2>
                        <p className="text-xs text-slate-500">AI-generated forecasts & risk modeling.</p>
                    </div>
                </div>

                <div className="p-8 grid md:grid-cols-3 gap-8">
                    
                    {/* LEFT: RISK SCORECARD */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                             <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Risk Control Center</h4>
                             
                             {/* Bankruptcy Risk */}
                             <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Bankruptcy Risk (Z-Score)</span>
                                    <span className={`text-xl font-bold ${result.predictiveRisk.altmanZScore < 1.8 ? 'text-red-600' : result.predictiveRisk.altmanZScore > 3 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {result.predictiveRisk.altmanZScore.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                     <div className={`h-full rounded-full ${result.predictiveRisk.bankruptcyProbability > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${result.predictiveRisk.bankruptcyProbability}%`}}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{result.predictiveRisk.bankruptcyProbability}% estimated probability</p>
                             </div>

                             {/* Fraud Risk */}
                             <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Fraud / Anomaly Score</span>
                                    <span className={`text-xl font-bold ${result.predictiveRisk.fraudRiskScore > 50 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {result.predictiveRisk.fraudRiskScore}/100
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                     <div className={`h-full rounded-full ${result.predictiveRisk.fraudRiskScore > 50 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${result.predictiveRisk.fraudRiskScore}%`}}></div>
                                </div>
                             </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 text-sm text-indigo-900 leading-relaxed">
                            <span className="font-bold">AI Analysis:</span> {result.predictiveRisk.details}
                        </div>
                    </div>

                    {/* RIGHT: FORECAST CHART */}
                    <div className="md:col-span-2">
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">12-Month Cashflow Projection</h4>
                        <div className="h-[300px] w-full bg-white rounded-xl border border-slate-100 p-2 shadow-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={result.forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Legend />
                                    <Area type="monotone" dataKey="actual" name="Historical" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="forecast" name="AI Forecast" stroke="#8b5cf6" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="upperBound" name="Confidence Interval" stroke="transparent" fill="#8b5cf6" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* --- PHASE 5: ACTIONABLE INSIGHTS (Replacing Static Recommendations) --- */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-500/5 border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-emerald-50/50 to-white px-8 py-5 border-b border-emerald-100/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Actionable Insights</h2>
            </div>
            <div className="p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.actionableInsights && result.actionableInsights.length > 0 ? (
                    result.actionableInsights.map((insight, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                             <div className={`absolute top-0 left-0 w-1 h-full ${insight.priority === 'HIGH' ? 'bg-red-500' : insight.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                             
                             <div className="flex justify-between items-start mb-3">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(insight.priority)}`}>
                                    {insight.priority}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{insight.category}</div>
                             </div>
                             
                             <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{insight.title}</h3>
                             <p className="text-slate-600 text-sm mb-4 leading-relaxed">{insight.description}</p>
                             
                             <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                                 <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                     <TrendingUp className="w-3 h-3" />
                                     Est. Impact: {insight.impactValue}
                                 </div>
                             </div>
                        </div>
                    ))
                ) : (
                    // Fallback to legacy recommendations if new model returns nothing
                    result.strategicRecommendations.map((rec, index) => (
                        <div key={index} className="flex gap-4 p-5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md transition-all duration-300 group">
                            <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-emerald-600 shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform">
                                {index + 1}
                            </div>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">{rec}</p>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Plugin Results (Dynamic) */}
        {result.pluginData && Object.keys(result.pluginData).length > 0 && (
          <div className="grid grid-cols-1 gap-6">
             {Object.entries(result.pluginData).map(([key, value]) => (
                <div key={key} className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Box className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-sm">Plugin Output: {key.replace('_', ' ')}</h3>
                   </div>
                   <div className="prose prose-sm max-w-none text-slate-700">
                      <p>{value}</p>
                   </div>
                </div>
             ))}
          </div>
        )}

        {/* Sentiment & Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sentiment Card */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-100/50 rounded-xl text-blue-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-700">Market Sentiment</h3>
                </div>
                <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{result.sentimentScore}</span>
                    <span className="text-sm font-medium text-slate-400 mb-1.5 uppercase tracking-wide">/ 100 Score</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getSentimentColor(result.sentimentLabel)}`}>
                    {result.sentimentLabel}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 relative" style={{ width: '100%' }}>
                        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] transform -translate-x-1/2" style={{ left: `${result.sentimentScore}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Risk Assessment Summary */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/50 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-105"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-100/50 rounded-xl text-amber-600">
                        <Gauge className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-700">Risk Profile</h3>
                </div>
                <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                    {result.riskAssessment}
                </p>
                <div className="mt-6 pt-5 border-t border-slate-100 flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Financial Impact</span>
                        <span className="text-sm font-semibold text-slate-800 line-clamp-1">{result.financialImplications.substring(0, 100)}...</span>
                    </div>
                </div>
            </div>
        </div>

        {/* REPORT GENERATION CENTER */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 overflow-hidden">
           <div className="bg-slate-900 px-8 py-5 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                    <Printer className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Report Center</h2>
                   <p className="text-slate-400 text-xs">Generate professional decks for stakeholders.</p>
                </div>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
                <button 
                  onClick={() => handleGenerateReport(ReportType.BOARD_DECK)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                   <div className="mb-3 bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Presentation className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-slate-800 mb-1">Board Meeting Deck</h3>
                   <p className="text-xs text-slate-500">High-level executive overview with KPI highlights.</p>
                </button>

                <button 
                  onClick={() => handleGenerateReport(ReportType.INVESTOR_UPDATE)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                   <div className="mb-3 bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-slate-800 mb-1">Investor Update</h3>
                   <p className="text-xs text-slate-500">Growth metrics, YoY comparisons, and future outlook.</p>
                </button>

                <button 
                  onClick={() => handleGenerateReport(ReportType.SWOT_ANALYSIS)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
                >
                   <div className="mb-3 bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-slate-800 mb-1">SWOT Analysis</h3>
                   <p className="text-xs text-slate-500">Detailed breakdown of Strengths, Weaknesses, and Risks.</p>
                </button>
            </div>
        </div>

        {/* SCENARIO SIMULATOR (WHAT-IF) */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/5 border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50/50 to-white px-8 py-5 border-b border-purple-100/50 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <Sliders className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">What-If Scenario Simulator</h2>
            </div>
            
            <div className="p-8 grid md:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700">Revenue Change</label>
                            <span className="text-sm font-bold text-blue-600">{modifiers.revenueChange > 0 ? '+' : ''}{modifiers.revenueChange}%</span>
                        </div>
                        <input 
                            type="range" min="-50" max="50" step="5"
                            value={modifiers.revenueChange}
                            onChange={(e) => setModifiers({...modifiers, revenueChange: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700">Cost Structure</label>
                            <span className="text-sm font-bold text-red-600">{modifiers.costChange > 0 ? '+' : ''}{modifiers.costChange}%</span>
                        </div>
                        <input 
                            type="range" min="-50" max="50" step="5"
                            value={modifiers.costChange}
                            onChange={(e) => setModifiers({...modifiers, costChange: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700">Operational Efficiency</label>
                            <span className="text-sm font-bold text-green-600">{modifiers.operationalEfficiency > 0 ? '+' : ''}{modifiers.operationalEfficiency}%</span>
                        </div>
                        <input 
                            type="range" min="-50" max="50" step="5"
                            value={modifiers.operationalEfficiency}
                            onChange={(e) => setModifiers({...modifiers, operationalEfficiency: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                    </div>
                    
                    <button 
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {isSimulating ? 'Computing AI Model...' : 'Run Simulation'}
                        {!isSimulating && <Play className="w-4 h-4" />}
                    </button>
                </div>

                {/* Results Area */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-6 border border-slate-200">
                    {!scenarioData ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Sliders className="w-12 h-12 mb-3 opacity-20" />
                            <p>Adjust parameters and run simulation to see projected impact.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Projected Net Income</div>
                                    <div className="text-xl font-bold text-slate-800">{scenarioData.projectedNetIncome}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Projected Margin</div>
                                    <div className="text-xl font-bold text-blue-600">{scenarioData.projectedMargin}</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-2">AI Impact Analysis</div>
                                <p className="text-sm text-slate-600 leading-relaxed">{scenarioData.impactAnalysis}</p>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scenarioData.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="baseline" name="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="projected" name="Projected" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Summary Section - Bullet Points */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-500/5 border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-50/50 to-white px-8 py-5 border-b border-blue-100/50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Executive Summary</h2>
            </div>
            <div className="p-8">
            <ul className="space-y-4">
                {result.summaryPoints.map((point, index) => (
                <li key={index} className="flex gap-4 text-slate-700">
                    <span className="flex-shrink-0 w-2 h-2 mt-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-300"></span>
                    <span className="leading-relaxed text-base">{point}</span>
                </li>
                ))}
            </ul>
            </div>
        </div>

        {/* Differences - Table Format */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-amber-500/5 border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-amber-50/50 to-white px-8 py-5 border-b border-amber-100/50 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Comparison Matrix</h2>
            </div>
            <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                    <th className="px-8 py-5">Parameter</th>
                    <th className="px-8 py-5 bg-slate-100/30">Source A</th>
                    <th className="px-8 py-5 bg-blue-50/20">Source B</th>
                    <th className="px-8 py-5 text-center">Difference (A vs B)</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {result.keyDifferences.map((diff, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800">{diff.parameter}</td>
                    <td className="px-8 py-5 text-slate-600 bg-slate-50/20">{diff.valueDoc1}</td>
                    <td className="px-8 py-5 text-slate-700 font-medium bg-blue-50/10 border-l border-r border-transparent">{diff.valueDoc2}</td>
                    <td className="px-8 py-5 flex justify-center">
                        {diff.trend === 'UP' && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-100/50 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                            <ArrowUp className="w-3 h-3" /> 
                            <span>INCREASING</span>
                        </div>
                        )}
                        {diff.trend === 'DOWN' && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-100/50 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 shadow-sm">
                            <ArrowDown className="w-3 h-3" /> 
                            <span>DECREASING</span>
                        </div>
                        )}
                        {diff.trend === 'NEUTRAL' && (
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                            <Minus className="w-3 h-3" /> 
                            <span>NEUTRAL</span>
                        </div>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-indigo-500/5 border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-50/50 to-white px-8 py-5 border-b border-indigo-100/50 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Metric Comparison</h2>
            </div>
            <div className="p-8 h-[500px]">
                {result.chartData && result.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={result.chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        barSize={60}
                    >
                    <defs>
                        {COLORS.map((color, i) => (
                        <linearGradient key={`color-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.6}/>
                        </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis 
                        tick={{fontSize: 12, fill: '#64748b'}} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{fill: '#f1f5f9', opacity: 0.5}}
                        contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '30px' }} />
                    <Bar 
                        dataKey="value" 
                        radius={[12, 12, 0, 0]}
                        name="Value"
                        animationDuration={1500}
                    >
                        {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#color-${index % COLORS.length})`} cursor="pointer" />
                        ))}
                    </Bar>
                    <Brush 
                        dataKey="name" 
                        height={30} 
                        stroke="#818cf8" 
                        fill="#f8fafc"
                        tickFormatter={() => ''}
                        travellerWidth={10}
                    />
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    No comparison data available
                </div>
                )}
            </div>
        </div>

        {/* Pie Chart Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/5 border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-50/50 to-white px-8 py-5 border-b border-purple-100/50 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Distribution Analysis</h2>
            </div>
            <div className="p-8 h-[600px]">
                {result.pieChartData && result.pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={result.pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={220}
                        innerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={5}
                        animationDuration={1500}
                    >
                        {result.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={3} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-slate-600 font-bold ml-2">{value}</span>}
                    />
                    </PieChart>
                </ResponsiveContainer>
                ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    No distribution data available
                </div>
                )}
            </div>
        </div>
      
    </div>

    {/* COLLABORATION SIDEBAR */}
    {isCommentsOpen && (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700">Team Comments</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{comments.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {c.avatar}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">{c.user}</span>
                                <span className="text-xs text-slate-400">{c.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button 
                        onClick={handleAddComment}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )}

    </div>
  );
};

export default Analysis;
