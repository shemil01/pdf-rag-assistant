import React, { useState } from "react";
import { FileText, List, X, ChevronLeft, ChevronRight, Minus, Plus, Maximize, File } from "lucide-react";

export function DocumentPanel({ activeDocument }: { activeDocument: any }) {
  const [activeTab, setActiveTab] = useState<"document" | "citations">("document");

  return (
    <div className="w-80 lg:w-96 border-l border-gray-100 bg-gray-50 flex flex-col h-full shrink-0">
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-2 shrink-0 bg-white">
        <div className="flex h-full">
          <button 
            className={`px-4 h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'document' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('document')}
          >
            <FileText className="w-4 h-4" />
            Document
          </button>
          <button 
            className={`px-4 h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'citations' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('citations')}
          >
            <List className="w-4 h-4" />
            Citations (3)
          </button>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="px-2 text-xs font-medium text-gray-700">4 / 12</div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Maximize className="w-4 h-4" /></button>
          </div>
        </div>

        {/* PDF Preview Area */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg flex-1 min-h-[400px] flex flex-col p-6 items-center justify-center text-sm text-gray-400 overflow-y-auto">
          <FileText className="w-12 h-12 text-gray-200 mb-4" />
          <p>PDF Viewer Integration Area</p>
          <p className="text-xs text-gray-400 mt-2 text-center max-w-xs">
            (Future implementation will render the actual PDF pages and highlight relevant text here)
          </p>
        </div>

        {/* Referenced Sources Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-800 mb-3">Referenced in this answer</h3>
          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center shadow-sm">
              <p className="text-xs text-gray-500">
                Retrieved chunks from the backend will appear here when a specific message is selected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
