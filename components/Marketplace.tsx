import React, { useState } from 'react';
import { Plugin, Integration } from '../types';
import { ToggleLeft, ToggleRight, Puzzle, Blocks, ArrowLeft, Plug, LineChart, ShieldAlert, BadgeDollarSign, Link2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { connectIntegration } from '../services/integrations';

interface MarketplaceProps {
  plugins: Plugin[];
  integrations: Integration[];
  onTogglePlugin: (id: string) => void;
  onToggleIntegration: (id: string, contextData?: string) => void;
  onBack: () => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ 
  plugins, 
  integrations, 
  onTogglePlugin, 
  onToggleIntegration,
  onBack 
}) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleIntegrationClick = async (int: Integration) => {
    if (int.status === 'CONNECTED') {
      // Disconnect immediately
      onToggleIntegration(int.id);
      return;
    }

    // Connect flow
    setConnectingId(int.id);
    setErrorId(null);
    try {
      // Open popup simulation
      const data = await connectIntegration(int.id);
      onToggleIntegration(int.id, data.contextData);
    } catch (err) {
      console.error(err);
      setErrorId(int.id);
    } finally {
      setConnectingId(null);
    }
  };
  
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'LineChart': return <LineChart className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      case 'BadgeDollarSign': return <BadgeDollarSign className="w-6 h-6" />;
      default: return <Blocks className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto pb-20 animate-in slide-in-from-right-10 duration-500">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-6 flex items-center gap-4 shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Platform Marketplace</h1>
           <p className="text-slate-500">Extend FinSight with AI plugins and live data integrations.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-12">
        
        {/* PLUGINS SECTION */}
        <section>
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                 <Puzzle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">AI Analysis Plugins</h2>
                <p className="text-sm text-slate-500">Specialized financial models and detection engines.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map(plugin => (
                <div key={plugin.id} className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${plugin.active ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-indigo-100 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                   {plugin.active && (
                     <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                       INSTALLED
                     </div>
                   )}
                   <div className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${plugin.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                         {getIcon(plugin.icon)}
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{plugin.name}</h3>
                      <p className="text-slate-500 text-sm mb-6 h-10 line-clamp-2">{plugin.description}</p>
                      
                      <button 
                        onClick={() => onTogglePlugin(plugin.id)}
                        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${plugin.active ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                      >
                         {plugin.active ? (
                           <>Uninstall Plugin</>
                         ) : (
                           <>Install Plugin</>
                         )}
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* INTEGRATIONS SECTION */}
        <section>
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                 <Plug className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Data Integrations</h2>
                <p className="text-sm text-slate-500">Connect live data sources for context-aware analysis.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map(int => (
                <div key={int.id} className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${int.status === 'CONNECTED' ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-emerald-100 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                   {int.status === 'CONNECTED' && (
                     <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                       <Link2 className="w-3 h-3" /> CONNECTED
                     </div>
                   )}
                   <div className="p-6 flex items-start justify-between">
                      <div className="flex-1">
                          <img src={int.icon} alt={int.name} className="w-10 h-10 mb-4 object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                          <h3 className="font-bold text-lg text-slate-800 mb-1">{int.name}</h3>
                          <p className="text-slate-500 text-sm h-10 line-clamp-2">{int.description}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleIntegrationClick(int)}
                        disabled={connectingId === int.id}
                        className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${int.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                         {connectingId === int.id ? (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                           </div>
                         ) : (
                            <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${int.status === 'CONNECTED' ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                         )}
                      </button>
                   </div>
                   
                   {errorId === int.id && (
                     <div className="bg-red-50 px-6 py-2 border-t border-red-100 flex items-center gap-2 text-red-600 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" /> Connection Failed
                     </div>
                   )}
                   
                   {int.status === 'CONNECTED' && (
                     <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">Sync Active • Live</span>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
};

export default Marketplace;
