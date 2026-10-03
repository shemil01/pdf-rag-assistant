import React from "react";
import { Send, Paperclip } from "lucide-react";

export function ChatComposer() {
  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="max-w-3xl mx-auto relative flex items-end shadow-sm border border-gray-300 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        
        <button 
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0 disabled:opacity-50"
          title="Attach Document"
          disabled
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea 
          className="flex-1 max-h-48 min-h-[44px] py-3 px-2 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          placeholder="Ask a question about the document..."
          rows={1}
          disabled
        />

        <button 
          className="p-2 m-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 disabled:bg-gray-200 disabled:text-gray-400"
          title="Send message"
          disabled
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400">
          AI can make mistakes. Check important information in the source PDF.
        </p>
      </div>
    </div>
  );
}
