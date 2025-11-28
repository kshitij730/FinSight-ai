import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, File as FileIcon, Trash2, Play, Sparkles, X, Plus, ArrowRight, Loader2, AlertCircle, History, LayoutDashboard, Settings, LogOut, ChevronRight, Save, BarChart3, Scale, Layers, Blocks, BrainCircuit, Lock, ShieldCheck, Database, User } from 'lucide-react';
import { UploadedFile, LinkResource, AnalysisStatus, ComparisonResult, ViewState, SavedReport, DocumentType, AnalysisMode, Plugin, Integration, PrivacySettings } from './types';
import Auth from './components/Auth';
import Analysis from './components/Analysis';
import ChatBot from './components/ChatBot';
import Marketplace from './components/Marketplace';
import Vault from './components/Vault';
import { analyzeDocuments } from './services/gemini';
import { saveReport, getReports, getReportById } from './services/storage';
import { indexDocumentToVault, retrieveContext } from './services/memory';
import { supabase, signOut } from './services/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.AUTH);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [links, setLinks] = useState<LinkResource[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('PERIOD_VS_PERIOD');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ secureMode: true });
  
  // Auth State
  const [user, setUser] = useState<any>(null);

  // History State
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Phase 3: Marketplace State
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: 'valuation_dcf', name: 'DCF Valuation Model', description: 'Calculates intrinsic value using Discounted Cash Flow analysis.', icon: 'LineChart', active: false, category: 'MODEL' },
    { id: 'saas_metrics', name: 'SaaS Metrics Engine', description: 'Automatically extracts LTV, CAC, Churn, and MRR/ARR movements.', icon: 'BadgeDollarSign', active: false, category: 'ANALYTICS' },
    { id: 'fraud_check', name: 'Fraud Detection', description: 'Scans for Benfords Law anomalies and irregular transaction patterns.', icon: 'ShieldAlert', active: false, category: 'RISK' },
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'stripe', name: 'Stripe', description: 'Live revenue and transaction data sync.', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', status: 'DISCONNECTED', mockContext: '' },
    { id: 'xero', name: 'Xero', description: 'Accounting ledger and bank reconciliation.', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Xero_software_logo.svg/2560px-Xero_software_logo.svg.png', status: 'DISCONNECTED', mockContext: '' },
    { id: 'salesforce', name: 'Salesforce', description: 'CRM pipeline and deal forecasting.', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', status: 'DISCONNECTED', mockContext: '' },
  ]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setViewState(session ? ViewState.DASHBOARD : ViewState.AUTH);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
         setViewState(ViewState.DASHBOARD);
      } else {
         setViewState(ViewState.AUTH);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load history on mount
  useEffect(() => {
    if (viewState === ViewState.DASHBOARD) {
      setReports(getReports());
    }
  }, [viewState]);

  const handleSignOut = async () => {
    await signOut();
    setViewState(ViewState.AUTH);
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'done' } : f));
      } else {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      }
    }, 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files) {
      const newFiles: UploadedFile[] = (Array.from(e.target.files) as File[]).map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        type: file.type,
        content: '', 
        fileObject: file,
        progress: 0,
        status: 'uploading',
        docType: 'FINANCIAL_REPORT' // Default
      }));
      setFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach(f => simulateUpload(f.id));
    }
  };

  const updateDocType = (id: string, type: DocumentType) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, docType: type } : f));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setErrorMessage(null);
  };

  const addLink = () => {
    setErrorMessage(null);
    if (linkInput.trim()) {
      setLinks([...links, { id: Date.now().toString(), url: linkInput }]);
      setLinkInput('');
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    setErrorMessage(null);
  };

  const handleIndexToVault = async () => {
    if (files.length === 0) return;
    setStatus(AnalysisStatus.INDEXING);
    try {
        for(const file of files) {
            await indexDocumentToVault(file);
        }
        alert("Files indexed to Secure Vault successfully.");
        setStatus(AnalysisStatus.IDLE);
    } catch (e) {
        setErrorMessage("Failed to index documents to Vault.");
        setStatus(AnalysisStatus.IDLE);
    }
  }

  const handleAnalysis = async () => {
    if (files.length === 0 && links.length === 0) return;

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMessage(null);
    setActiveReportId(null);
    
    // Get active plugins and connected integrations
    const activePlugins = plugins.filter(p => p.active);
    const activeIntegrations = integrations.filter(i => i.status === 'CONNECTED');
    
    // Phase 4: Retrieve Vault Context if Secure Mode is on (Using LocalStorage RAG)
    let vaultContext = '';
    if (privacySettings.secureMode) {
        vaultContext = retrieveContext('ALL'); // Retrieve all available context for demo
    }

    try {
      const data = await analyzeDocuments(files, links, analysisMode, activePlugins, activeIntegrations, vaultContext);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETE);
      setViewState(ViewState.RESULTS);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage(error.message || "An unexpected error occurred during analysis.");
    }
  };

  const handleSaveReport = (title: string) => {
    if (result) {
      const fileNames = [...files.map(f => f.name), ...links.map(l => l.url)];
      const saved = saveReport(title, result, fileNames);
      setReports(prev => [saved, ...prev]);
      setActiveReportId(saved.id);
      alert('Report saved successfully to your workspace!');
    }
  };

  const loadReport = (id: string) => {
    const report = getReportById(id);
    if (report) {
      setResult(report.result);
      setActiveReportId(id);
      setViewState(ViewState.RESULTS);
    }
  };

  // Marketplace Handlers
  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const toggleIntegration = (id: string, contextData?: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { 
        ...i, 
        status: i.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED',
        mockContext: contextData || '' 
    } : i));
  };

  if (viewState === ViewState.AUTH) {
    return <Auth onLogin={() => {}} />;
  }

  // Sidebar Component
  const Sidebar = () => (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 h-screen transition-all duration-300 flex flex-col border-r border-slate-800 z-50 fixed left-0 top-0`}>
       <div className="h-20 flex items-center justify-center border-b border-slate-800">
          {isSidebarOpen ? (
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <span className="font-bold text-lg text-white">FinSight</span>
             </div>
          ) : (
            <Sparkles className="w-6 h-6 text-blue-500" />
          )}
       </div>

       {/* User Profile Snippet */}
       {isSidebarOpen && user && (
         <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-slate-500">Pro Plan</p>
               </div>
            </div>
         </div>
       )}

       <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <button 
             onClick={() => { setViewState(ViewState.DASHBOARD); setResult(null); setFiles([]); setLinks([]); }}
             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewState === ViewState.DASHBOARD ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
             <LayoutDashboard className="w-5 h-5" />
             {isSidebarOpen && <span className="font-medium">New Analysis</span>}
          </button>

          <button 
             onClick={() => setViewState(ViewState.VAULT)}
             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewState === ViewState.VAULT ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
             <BrainCircuit className="w-5 h-5" />
             {isSidebarOpen && <span className="font-medium">Memory Vault</span>}
          </button>

          <button 
             onClick={() => setViewState(ViewState.MARKETPLACE)}
             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewState === ViewState.MARKETPLACE ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
             <Blocks className="w-5 h-5" />
             {isSidebarOpen && <span className="font-medium">Marketplace</span>}
          </button>

          <div className="pt-6 pb-2">
             {isSidebarOpen && <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">History</p>}
             {reports.length === 0 && isSidebarOpen && (
                 <div className="px-3 py-4 text-sm text-slate-600 italic">No saved reports yet.</div>
             )}
             {reports.map(report => (
                <button
                   key={report.id}
                   onClick={() => loadReport(report.id)}
                   className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeReportId === report.id ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                   <History className="w-5 h-5" />
                   {isSidebarOpen && (
                       <div className="text-left overflow-hidden">
                          <div className="truncate text-sm font-medium">{report.title}</div>
                          <div className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString()}</div>
                       </div>
                   )}
                </button>
             ))}
          </div>
       </div>

       {/* PRIVACY TOGGLE */}
       <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           {isSidebarOpen && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Privacy & Security</p>}
           <button 
              onClick={() => setPrivacySettings({secureMode: !privacySettings.secureMode})}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${privacySettings.secureMode ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
           >
                {privacySettings.secureMode ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {isSidebarOpen && (
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold">{privacySettings.secureMode ? 'Secure Vault' : 'Standard Mode'}</span>
                        <span className="text-[10px] opacity-70">{privacySettings.secureMode ? 'On-Device Storage' : 'Cloud Enabled'}</span>
                    </div>
                )}
           </button>
       </div>

       <div className="p-4 border-t border-slate-800">
           <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-2 text-slate-400 hover:text-red-400 transition-colors">
               <LogOut className="w-5 h-5" />
               {isSidebarOpen && <span>Sign Out</span>}
           </button>
       </div>

       {/* Toggle */}
       <button 
         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         className="absolute -right-3 top-24 bg-slate-800 rounded-full p-1 border border-slate-700 text-slate-400 hover:text-white"
       >
          <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
       </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* VIEW: VAULT */}
        {viewState === ViewState.VAULT && (
          <Vault onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {/* VIEW: MARKETPLACE */}
        {viewState === ViewState.MARKETPLACE && (
          <Marketplace 
            plugins={plugins}
            integrations={integrations}
            onTogglePlugin={togglePlugin}
            onToggleIntegration={toggleIntegration}
            onBack={() => setViewState(ViewState.DASHBOARD)}
          />
        )}

        {/* VIEW: DASHBOARD (Upload) */}
        {viewState === ViewState.DASHBOARD && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
                    <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-100/30 to-transparent"></div>
                </div>
                
                {status === AnalysisStatus.ANALYZING || status === AnalysisStatus.INDEXING ? (
                    <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                            <div className="w-24 h-24 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {status === AnalysisStatus.INDEXING ? (
                                    <Database className="w-10 h-10 text-blue-600 animate-bounce" />
                                ) : (
                                    <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {status === AnalysisStatus.INDEXING ? 'Indexing to Vault' : 'Analyzing Documents'}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {status === AnalysisStatus.INDEXING ? 'Extracting financial facts and storing to secure local memory...' : 'Performing forensic analysis and identifying key trends...'}
                        </p>
                        
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-5xl mx-auto space-y-12">
                         <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                Analysis Workspace
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Upload financial reports to compare periods, identify risks, and generate strategic insights.
                            </p>
                            
                            {/* ACTIVE CONNECTIONS BADGE */}
                            <div className="flex justify-center gap-2">
                                {(plugins.some(p => p.active) || integrations.some(i => i.status === 'CONNECTED')) && (
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 animate-in fade-in">
                                    <Blocks className="w-3 h-3" />
                                    <span>
                                    {plugins.filter(p => p.active).length} Plugins Active • {integrations.filter(i => i.status === 'CONNECTED').length} Sources Connected
                                    </span>
                                </div>
                                )}
                                {privacySettings.secureMode && (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 animate-in fade-in">
                                        <Lock className="w-3 h-3" />
                                        <span>Secure Vault Enabled</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[20px] p-8 md:p-12 border border-slate-200 shadow-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    
                                    {/* Upload Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Source Documents</h3>
                                        </div>
                                        
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center relative group cursor-pointer h-40 flex flex-col items-center justify-center">
                                            <input 
                                                type="file" 
                                                multiple 
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-blue-600 group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">Drop files (PDF, CSV)</p>
                                        </div>

                                        {/* File List with Doc Type Selector */}
                                        {files.length > 0 && (
                                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                                {files.map(file => (
                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex flex-col gap-1 min-w-0 flex-1 mr-4">
                                                            <div className="flex items-center gap-2">
                                                                <FileIcon className="w-4 h-4 text-blue-500" />
                                                                <span className="truncate text-sm font-medium text-slate-700">{file.name}</span>
                                                            </div>
                                                            <select 
                                                                value={file.docType} 
                                                                onChange={(e) => updateDocType(file.id, e.target.value as DocumentType)}
                                                                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 focus:ring-1 focus:ring-blue-500 outline-none w-fit"
                                                            >
                                                                <option value="FINANCIAL_REPORT">Financial Report</option>
                                                                <option value="INVOICE">Invoice</option>
                                                                <option value="CONTRACT">Contract</option>
                                                                <option value="BANK_STATEMENT">Bank Statement</option>
                                                            </select>
                                                        </div>
                                                        <button onClick={() => removeFile(file.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Index to Vault Button */}
                                        {files.length > 0 && (
                                            <button 
                                                onClick={handleIndexToVault}
                                                className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-100"
                                            >
                                                <Database className="w-4 h-4" /> Index to Memory Vault
                                            </button>
                                        )}
                                    </div>

                                    {/* Links & Action Section */}
                                    <div className="flex flex-col justify-between space-y-6">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                                        <Settings className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">Analysis Mode</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <button 
                                                        onClick={() => setAnalysisMode('PERIOD_VS_PERIOD')}
                                                        className={`p-3 rounded-xl border text-left transition-all ${analysisMode === 'PERIOD_VS_PERIOD' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                                                            <BarChart3 className="w-4 h-4 text-blue-500" /> Period vs Period
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">Compare trend growth (e.g. Q1 vs Q2)</p>
                                                    </button>
                                                    <button 
                                                        onClick={() => setAnalysisMode('CROSS_DOC_AUDIT')}
                                                        className={`p-3 rounded-xl border text-left transition-all ${analysisMode === 'CROSS_DOC_AUDIT' ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                                                            <ShieldCheck className="w-4 h-4 text-amber-600" /> Cross-Doc Audit
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">Verify consistency (e.g. Invoice vs P&L)</p>
                                                    </button>
                                                    <button 
                                                        onClick={() => setAnalysisMode('ENTITY_VS_ENTITY')}
                                                        className={`p-3 rounded-xl border text-left transition-all ${analysisMode === 'ENTITY_VS_ENTITY' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                                                            <Scale className="w-4 h-4 text-purple-500" /> Entity Comparison
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">Benchmark Company A vs Company B</p>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                        <LinkIcon className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">External Data</h3>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={linkInput}
                                                        onChange={(e) => setLinkInput(e.target.value)}
                                                        placeholder="Paste URL here..."
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        onKeyDown={(e) => e.key === 'Enter' && addLink()}
                                                    />
                                                    <button 
                                                        onClick={addLink}
                                                        className="absolute right-2 top-1.5 bottom-1.5 bg-white text-blue-600 hover:bg-blue-50 px-3 rounded-lg text-xs font-bold uppercase border border-slate-100"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {links.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {links.map(link => (
                                                            <div key={link.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                                <span className="truncate text-xs text-blue-600 font-medium">{link.url}</span>
                                                                <button onClick={() => removeLink(link.id)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Error Display */}
                                        {status === AnalysisStatus.ERROR && errorMessage && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                <p className="text-red-600 text-xs">{errorMessage}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAnalysis}
                                            disabled={files.length === 0 && links.length === 0}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            Run Analysis
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* VIEW: RESULTS */}
        {viewState === ViewState.RESULTS && result && (
             <Analysis 
                result={result} 
                onBack={() => setViewState(ViewState.DASHBOARD)} 
                onSave={handleSaveReport}
                savedDate={activeReportId ? reports.find(r => r.id === activeReportId)?.date : undefined}
                savedTitle={activeReportId ? reports.find(r => r.id === activeReportId)?.title : undefined}
             />
        )}

      </main>

      {/* Floating Chat Bot */}
      <ChatBot uploadedFiles={files} />
    </div>
  );
};

export default App;
