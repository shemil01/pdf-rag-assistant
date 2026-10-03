import React from "react";
import { Sparkles, FileText, ArrowRight } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to AI Chat with PDF
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Select a document from the sidebar or upload a new one to start asking questions. Our AI will analyze the content and provide grounded answers with precise citations.
      </p>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
          <FileText className="w-5 h-5 text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-800 text-sm mb-1">Summarize this document</h3>
          <p className="text-xs text-gray-500 flex items-center justify-between">
            Get a quick overview of the key points
            <ArrowRight className="w-3 h-3 text-blue-500" />
          </p>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
          <FileText className="w-5 h-5 text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-800 text-sm mb-1">Find key statistics</h3>
          <p className="text-xs text-gray-500 flex items-center justify-between">
            Extract numbers and data points
            <ArrowRight className="w-3 h-3 text-blue-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
