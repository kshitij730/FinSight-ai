
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Search, Calendar, FileText, Trash2, BrainCircuit, HardDrive } from 'lucide-react';
import { VaultItem } from '../types';
import { getVaultItems, clearVault } from '../services/memory';

interface VaultProps {
  onBack: () => void;
}

const Vault: React.FC<VaultProps> = ({ onBack }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setItems(getVaultItems());
  }, []);

  const handleClear = () => {
    if(confirm("Are you sure? This will wipe the long-term memory.")) {
      clearVault();
      setItems([]);
    }
  };

  const filteredItems = items.filter(i => 
    i.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto pb-20 animate-in slide-in-from-right-10 duration-500 min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10 px-8 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
            >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BrainCircuit className="w-8 h-8 text-indigo-400" />
                Knowledge Vault
            </h1>
            <p className="text-slate-400">Long-Term Memory & Historical Context</p>
            </div>
        </div>
        <div className="flex gap-3">
             <button onClick={handleClear} className="px-4 py-2 border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Wipe Memory
             </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-12">
        
        {/* Search */}
        <div className="relative">
             <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
             <input 
                type="text" 
                placeholder="Search historical facts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
             />
        </div>

        {/* Timeline View */}
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Indexed Timeline
            </h2>
            
            {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                    <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Vault is Empty</h3>
                    <p className="text-slate-500 mt-2">Index documents from the Dashboard to build long-term memory.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-700 ml-4 space-y-12">
                    {filteredItems.map(item => (
                        <div key={item.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
                            
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-indigo-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{item.fileName}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">{item.docType}</span>
                                            <span>Indexed: {new Date(item.dateIndexed).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <FileText className="w-6 h-6 text-slate-600" />
                                </div>
                                
                                <p className="text-slate-300 mb-6 italic border-l-4 border-slate-600 pl-4 py-1">
                                    "{item.summary}"
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {item.facts.map((fact, idx) => (
                                        <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex flex-col">
                                            <span className="text-xs text-slate-500 uppercase font-bold">{fact.metric}</span>
                                            <span className="text-lg font-mono text-indigo-300">{fact.value}</span>
                                            <span className="text-xs text-slate-400">{fact.dateContext}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Vault;
