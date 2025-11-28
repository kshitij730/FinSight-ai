import React, { useState, useRef } from 'react';
import { FileUp, FilePlus, Minimize2, FileType, Edit3, ArrowRight, Download, Check, Settings2, Scissors, Image as ImageIcon, Save, AlignLeft, Bold, Italic, Type, Undo, Redo, X } from 'lucide-react';
import { UploadedFile } from '../types';

enum ToolType {
  MERGE = 'MERGE',
  COMPRESS = 'COMPRESS',
  CONVERT = 'CONVERT',
  EDIT = 'EDIT'
}

const PdfTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.MERGE);
  const [toolFiles, setToolFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  
  // Tool Specific States
  const [compressionLevel, setCompressionLevel] = useState(50);
  const [isEditing, setIsEditing] = useState(false);

  const handleToolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProcessed(false);
      // Fix: Cast Array.from result to File[] to correctly infer file type and properties
      const newFiles: UploadedFile[] = (Array.from(e.target.files) as File[]).map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        type: file.type,
        content: '',
        fileObject: file,
        progress: 100,
        status: 'done'
      }));
      
      if (activeTool === ToolType.MERGE) {
        setToolFiles(prev => [...prev, ...newFiles]);
      } else {
        // Replace for other tools
        setToolFiles(newFiles);
        if (activeTool === ToolType.EDIT) {
          setIsEditing(true);
        }
      }
    }
  };

  const executeAction = () => {
    if (toolFiles.length === 0) return;
    setProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
    }, 2000);
  };

  const getToolTitle = () => {
    switch (activeTool) {
      case ToolType.MERGE: return "Merge PDFs";
      case ToolType.COMPRESS: return "Compress PDF";
      case ToolType.CONVERT: return "PDF to PPT";
      case ToolType.EDIT: return "Edit PDF";
    }
  };

  const getToolDesc = () => {
    switch (activeTool) {
      case ToolType.MERGE: return "Combine multiple PDF files into a single document.";
      case ToolType.COMPRESS: return "Reduce file size while maintaining quality.";
      case ToolType.CONVERT: return "Convert PDF slides into editable PowerPoint presentations.";
      case ToolType.EDIT: return "Edit text, add annotations, and modify your PDF directly.";
    }
  };

  const getCompressedSize = () => {
    if (toolFiles.length === 0) return 0;
    const original = toolFiles[0].fileObject.size;
    // Simple mock calculation based on slider
    return (original * (1 - (compressionLevel * 0.8) / 100)); 
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Editor Component
  const EditorView = () => (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Editor Toolbar */}
        <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold text-xs">PDF</div>
                <span className="font-semibold text-slate-700 text-sm truncate max-w-[200px]">{toolFiles[0]?.name}</span>
             </div>
             
             <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><Bold className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><Type className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><ImageIcon className="w-4 h-4" /></button>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
               onClick={() => { setIsEditing(false); setToolFiles([]); }}
               className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
               onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); setProcessed(true); setIsEditing(false); }, 1500); }}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" /> Save & Download
            </button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
          <div 
             contentEditable 
             className="bg-white w-[21cm] min-h-[29.7cm] shadow-xl p-[2.5cm] outline-none text-slate-800 text-base leading-relaxed cursor-text"
             suppressContentEditableWarning={true}
          >
             <h1 className="text-3xl font-bold mb-4">Financial Overview 2024</h1>
             <p className="mb-4">This document serves as a preliminary analysis of the fiscal year performance. All data presented herein is subject to final audit verification.</p>
             <p className="mb-4">The net revenue has seen a substantial increase of 15% compared to the previous quarter. Operating expenses have been streamlined, resulting in a 5% reduction in overhead costs.</p>
             <h2 className="text-xl font-bold mt-6 mb-2">Key Highlights</h2>
             <ul className="list-disc pl-5 mb-4">
                <li>Revenue Growth: 15% YOY</li>
                <li>Customer Acquisition Cost: Reduced by 10%</li>
                <li>Market Share: Expanded into APAC region</li>
             </ul>
             <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400 my-8">
                [ Chart Placeholder - Editable Area ]
             </div>
             <p>Signed,</p>
             <p className="font-bold mt-8">John Doe</p>
             <p className="text-slate-500 text-sm">Chief Financial Officer</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {isEditing && <EditorView />}

      {/* Tools Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <button
          onClick={() => { setActiveTool(ToolType.MERGE); setToolFiles([]); setProcessed(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTool === ToolType.MERGE 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          <FilePlus className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold text-sm">Merge</div>
            <div className="text-xs opacity-80">Combine files</div>
          </div>
        </button>

        <button
          onClick={() => { setActiveTool(ToolType.COMPRESS); setToolFiles([]); setProcessed(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTool === ToolType.COMPRESS 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          <Minimize2 className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold text-sm">Compress</div>
            <div className="text-xs opacity-80">Reduce size</div>
          </div>
        </button>

        <button
          onClick={() => { setActiveTool(ToolType.CONVERT); setToolFiles([]); setProcessed(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTool === ToolType.CONVERT 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          <FileType className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold text-sm">PDF to PPT</div>
            <div className="text-xs opacity-80">Convert format</div>
          </div>
        </button>

        <button
          onClick={() => { setActiveTool(ToolType.EDIT); setToolFiles([]); setProcessed(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTool === ToolType.EDIT 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          <Edit3 className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold text-sm">Edit PDF</div>
            <div className="text-xs opacity-80">Modify content</div>
          </div>
        </button>
      </div>

      {/* Workspace */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px] flex flex-col">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">{getToolTitle()}</h2>
            <p className="text-slate-500 mt-1">{getToolDesc()}</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            
            {/* Upload Area */}
            {toolFiles.length === 0 && !processed && (
              <div className="w-full max-w-md border-3 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".pdf"
                  multiple={activeTool === ToolType.MERGE}
                  onChange={handleToolUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileUp className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Drop your PDF{activeTool === ToolType.MERGE ? 's' : ''} here
                </h3>
                <p className="text-sm text-slate-400">
                  {activeTool === ToolType.MERGE ? 'Upload multiple files' : 'Click to browse'}
                </p>
              </div>
            )}

            {/* File List / Actions */}
            {toolFiles.length > 0 && !processed && (
              <div className="w-full max-w-xl space-y-6">
                 
                 {/* File List */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-60 overflow-y-auto">
                    {toolFiles.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 mb-2 last:mb-0">
                         <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs font-bold">PDF</div>
                         <div className="flex-1 truncate text-sm font-medium text-slate-700">{f.name}</div>
                         <div className="text-xs text-slate-400">{formatSize(f.fileObject.size)}</div>
                      </div>
                    ))}
                    {activeTool === ToolType.MERGE && (
                         <div className="mt-4 p-3 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:bg-slate-100 transition-colors relative">
                             <input 
                                type="file" 
                                accept=".pdf"
                                multiple
                                onChange={handleToolUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                                <FilePlus className="w-4 h-4" /> Add more files
                            </div>
                         </div>
                    )}
                 </div>

                 {/* Tool Specific Options */}
                 {activeTool === ToolType.COMPRESS && (
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings2 className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-slate-800">Compression Settings</h4>
                        </div>
                        
                        <div className="mb-4">
                             <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Compression Level</span>
                                <span className="text-sm font-bold text-blue-600">{compressionLevel}%</span>
                             </div>
                             <input 
                                type="range" 
                                min="0" 
                                max="90" 
                                value={compressionLevel} 
                                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                             />
                             <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>Low Compression</span>
                                <span>Max Compression</span>
                             </div>
                        </div>

                        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100">
                            <span className="text-sm text-slate-500">Estimated Size:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm line-through text-slate-400">{formatSize(toolFiles[0]?.fileObject.size || 0)}</span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <span className="text-sm font-bold text-green-600">{formatSize(getCompressedSize())}</span>
                            </div>
                        </div>
                    </div>
                 )}

                 <button
                    onClick={executeAction}
                    disabled={processing}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                 >
                    {processing ? (
                        <>Processing...</>
                    ) : (
                        <>
                           {activeTool === ToolType.MERGE && "Merge Files"}
                           {activeTool === ToolType.COMPRESS && "Compress PDF"}
                           {activeTool === ToolType.CONVERT && "Convert to PPT"}
                           {activeTool === ToolType.EDIT && "Open Editor"}
                           {!activeTool && "Process"}
                           <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                 </button>
              </div>
            )}

            {/* Success State */}
            {processed && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg">
                        <Check className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {activeTool === ToolType.EDIT ? 'Document Saved!' : 'Task Completed!'}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                        {activeTool === ToolType.EDIT 
                            ? 'Your edited document has been saved locally.' 
                            : 'Your files have been processed successfully and are ready for download.'}
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => { setToolFiles([]); setProcessed(false); }}
                            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900"
                        >
                            Process Another
                        </button>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2">
                            <Download className="w-4 h-4" /> 
                            {activeTool === ToolType.CONVERT ? 'Download .PPTX' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTools;