import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { Send, FileText, Bot, User, Trash2, MoreHorizontal, Copy, ThumbsUp, ThumbsDown, Sparkles, Paperclip, FileImage, File } from "lucide-react";
import ReactMarkdown from "react-markdown";

const extractText = (m: UIMessage): string => {
  if (!m.parts) return "";
  return m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('');
};

interface ChatAreaProps {
  activeDocumentId: string | null;
  activeDocument?: any;
  setDocuments?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ChatArea({ activeDocumentId, activeDocument, setDocuments }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [citationsMap, setCitationsMap] = useState<Record<string, number[]>>({});
  
  const transport = useMemo(() => {
    if (!activeDocumentId) return undefined;
    return new TextStreamChatTransport({
      api: "/api/chat",
      body: { documentId: activeDocumentId },
      fetch: async (url, init) => {
        const res = await fetch(url, init);
        const sourcesStr = res.headers.get("x-sources");
        if (sourcesStr) {
          try {
            const sources = JSON.parse(sourcesStr);
            // We can't easily know the message ID here, so we store it against the document ID or a dummy key
            // Actually, we can just store the latest sources for the active document.
            setCitationsMap(prev => ({ ...prev, [activeDocumentId]: sources }));
          } catch (e) {
            console.error("Failed to parse sources header", e);
          }
        }
        return res;
      }
    });
  }, [activeDocumentId]);

  const { messages, sendMessage, status, error } = useChat({
    id: activeDocumentId || "chat",
    transport
  });

  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    });
    setInput("");
  };

  const handleDelete = () => {
    if (setDocuments && activeDocumentId) {
      setDocuments(prev => prev.filter(d => d.id !== activeDocumentId));
    }
  };

  if (!activeDocumentId || !activeDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-indigo-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">DocuMind AI</h2>
          <p className="text-sm text-gray-500">Select or upload a document to begin</p>
        </div>
      </div>
    );
  }

  const isReady = activeDocument.status === "READY";

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-900 leading-tight truncate max-w-[300px] lg:max-w-[400px]">
              {activeDocument.filename || 'Document.pdf'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <span>{activeDocument.pageCount || 0} pages</span>
              <span>•</span>
              <span>{activeDocument.chunksCreated || 0} chunks</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'border border-gray-400 animate-pulse'}`} />
                <span>{isReady ? 'Ready' : 'Processing'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 mb-8 max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ask anything about your document</h2>
            <p className="text-sm text-gray-500 text-center mb-8 max-w-md leading-relaxed">
              I can help you understand, summarize, and find specific information in your PDF. All answers include source citations.
            </p>
            
            <div className="flex flex-col sm:flex-row w-full gap-4">
              {[
                "What are the main findings of this research?",
                "Summarize this document",
                "What are the key conclusions?"
              ].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSubmit(), 0);
                  }}
                  className="flex-1 text-left p-4 rounded-xl border border-indigo-100 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors shadow-sm group flex flex-col justify-between h-24"
                >
                  <span className="text-sm font-medium text-indigo-600 line-clamp-2">{q}</span>
                  <span className="text-indigo-400 self-end opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            const contentText = extractText(m);
            const isAssistant = m.role === "assistant";
            
            return (
              <div key={m.id} className={`flex flex-col gap-2 ${!isAssistant ? "items-end" : "items-start max-w-3xl"}`}>
                
                {isAssistant && (
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900">AI Assistant</span>
                      <span className="text-xs text-gray-400 ml-2">Just now</span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
                
                {!isAssistant && (
                  <div className="flex items-center justify-end w-full mb-1 gap-2">
                    <span className="font-semibold text-sm text-gray-900">You</span>
                    <span className="text-xs text-gray-400">Just now</span>
                  </div>
                )}

                <div 
                  className={`text-sm group ${
                    !isAssistant 
                      ? "bg-indigo-100/50 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%]" 
                      : "text-gray-800 leading-relaxed pr-8"
                  }`}
                >
                  {!isAssistant ? (
                    <div className="whitespace-pre-wrap">{contentText}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-100 prose-pre:text-gray-800 prose-headings:font-semibold prose-a:text-indigo-600">
                      <ReactMarkdown>{contentText}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {isAssistant && citationsMap[activeDocumentId] && citationsMap[activeDocumentId].length > 0 && index === messages.length - 1 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-800">Sources</span>
                    <div className="flex gap-2">
                      {citationsMap[activeDocumentId].map((page) => (
                        <div key={page} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                          <File className="w-3 h-3 text-gray-400" />
                          Page {page}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex flex-col gap-2 max-w-3xl">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                 <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
               </div>
               <span className="font-semibold text-sm text-gray-900">AI Assistant</span>
             </div>
             <div className="text-sm text-gray-800 leading-relaxed flex items-center h-6">
                <span className="w-1.5 h-4 bg-indigo-500 animate-pulse inline-block rounded-sm"></span>
             </div>
           </div>
        )}
        
        {error && (
          <div className="text-center text-red-600 text-sm p-4 bg-red-50 rounded-xl border border-red-100 mx-auto max-w-md flex flex-col items-center justify-center gap-2 shadow-sm">
            <span className="font-semibold">Generation Error</span> 
            <span>{error.message || "An error occurred during generation."}</span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative flex flex-col border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this document..."
            className="w-full px-4 pt-4 pb-12 bg-transparent focus:outline-none resize-none text-sm"
            rows={2}
            disabled={isLoading || !isReady}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  handleSubmit();
                }
              }
            }}
          />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <FileImage className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
             <span className="text-[10px] text-gray-400 hidden sm:inline-block">Press Enter to send, Shift + Enter for a new line</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || !isReady}
              className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
