import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { Send, FileText, Bot, User, Trash2, MoreHorizontal, Copy, ThumbsUp, ThumbsDown, Sparkles, Paperclip, FileImage, File, PlusIcon, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const extractText = (m: UIMessage): string => {
  if (m.content) return m.content;
  if (!m.parts) return "";
  return m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('');
};

const getFriendlyErrorMessage = (errStr: string): string => {
  if (!errStr) return "An unknown error occurred.";
  
  try {
    const parsed = JSON.parse(errStr);
    if (parsed.error) errStr = parsed.error;
    else if (parsed.message) errStr = parsed.message;
  } catch {
    // Not JSON, continue with original string
  }
  
  if (errStr.includes("Invalid or missing documentId")) {
    return "Please select or upload a document before asking questions.";
  }
  
  if (errStr.includes("Failed to fetch") || errStr.includes("NetworkError")) {
    return "We couldn't connect to the server. Please check your internet connection.";
  }
  
  return errStr;
};

interface ChatAreaProps {
  activeDocumentId: string | null;
  activeDocument?: any;
  setDocuments?: React.Dispatch<React.SetStateAction<any[]>>;
  onSelectDocument?: (id: string) => void;
}

export function ChatArea({ activeDocumentId, activeDocument, setDocuments, onSelectDocument }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [citationsMap, setCitationsMap] = useState<Record<string, number[]>>({});
  
  const [uploadState, setUploadState] = useState<"IDLE" | "UPLOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    setUploadState("UPLOADING");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to process PDF.");
      }

      setUploadState("SUCCESS");
      const newDocId = data.id || crypto.randomUUID();
      if (setDocuments) setDocuments(prev => [{ ...data, id: newDocId }, ...prev]);
      if (onSelectDocument) onSelectDocument(newDocId);
      
      setTimeout(() => setUploadState("IDLE"), 3000);
    } catch (error: unknown) {
      const err = error as Error;
      setUploadState("ERROR");
      setErrorMessage(err.message);
    }
  };
  
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

  const isReady = activeDocument ? activeDocument.status === "READY" : true;

  if (uploadState === "UPLOADING") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-zinc-950 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-gray-500 dark:text-gray-400">Uploading Document...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 relative w-full overflow-hidden font-sans">
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        disabled={uploadState === "UPLOADING"}
      />
      {/* Header */}
      {(activeDocumentId && activeDocument) && (
        <div className="h-20 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[300px] lg:max-w-[400px]">
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
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-4 flex flex-col">
        {(!activeDocumentId || !activeDocument || messages.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">How can I help you today?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md leading-relaxed">
              {!activeDocumentId 
                ? "Upload a PDF document below to get started. I can help you understand, summarize, and find specific information."
                : "Ask anything about your document. All answers include source citations."}
            </p>
            
            {uploadState === "ERROR" && (
              <div className="mb-6 w-full max-w-md p-4 bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 shadow-sm relative overflow-hidden text-left">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col pr-6">
                  <span className="font-semibold text-sm text-red-700 dark:text-red-400">Upload Failed</span>
                  <span className="text-sm mt-1 text-red-600/90 dark:text-red-400/90 leading-relaxed">{getFriendlyErrorMessage(errorMessage)}</span>
                </div>
                <button onClick={() => setUploadState("IDLE")} className="absolute top-4 right-4 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20" aria-label="Dismiss error">
                  <PlusIcon className="w-4 h-4 rotate-45" />
                </button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row w-full gap-4 max-w-xl">
              {[
                "What are the main findings of this research?",
                "Summarize this document",
                "What are the key conclusions?"
              ].map((q, i) => (
                <button 
                  key={i}
                  disabled={!activeDocumentId}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSubmit(), 0);
                  }}
                  className="flex-1 text-left p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-white dark:bg-zinc-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors shadow-sm group flex flex-col justify-between h-24 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300 line-clamp-2">{q}</span>
                  <span className="text-indigo-400 dark:text-indigo-500 self-end opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 flex-1">
            {messages.map((m, index) => {
            const contentText = extractText(m);
            const isAssistant = m.role === "assistant";
            
            return (
              <div key={m.id} className={`flex flex-col gap-2 ${!isAssistant ? "items-end" : "items-start max-w-3xl"}`}>
                
                {isAssistant && (
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Assistant</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Just now</span>
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
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">You</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Just now</span>
                  </div>
                )}

                <div 
                  className={`text-sm group ${
                    !isAssistant 
                      ? "bg-indigo-100/50 dark:bg-indigo-500/20 text-gray-900 dark:text-gray-100 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%]" 
                      : "text-gray-800 dark:text-gray-200 leading-relaxed pr-8"
                  }`}
                >
                  {!isAssistant ? (
                    <div className="whitespace-pre-wrap">{contentText}</div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-gray-100 dark:prose-pre:border-zinc-800 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                      <ReactMarkdown>{contentText}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {isAssistant && citationsMap[activeDocumentId] && citationsMap[activeDocumentId].length > 0 && index === messages.length - 1 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-300">Sources</span>
                    <div className="flex gap-2">
                      {citationsMap[activeDocumentId].map((page) => (
                        <div key={page} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                          <File className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          Page {page}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
        
         {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex flex-col gap-2 max-w-3xl">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                 <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
               </div>
               <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Assistant</span>
             </div>
             <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed flex items-center gap-1 h-6">
                <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
           </div>
        )}
        
        {error && (
          <div className="mx-auto max-w-md w-full my-4 p-4 bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 shadow-sm relative overflow-hidden text-left">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400 shrink-0">
               <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-red-700 dark:text-red-400">Oops! Something went wrong</span>
              <span className="text-sm mt-1 text-red-600/90 dark:text-red-400/90 leading-relaxed">
                {getFriendlyErrorMessage(error.message || "An error occurred while generating the response.")}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className={messages.length > 0 ? "h-32 shrink-0" : "shrink-0"} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-zinc-950 dark:via-zinc-950 to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative flex flex-col border-2 border-indigo-500 dark:border-indigo-500/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-zinc-900 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-600 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this document..."
            className="w-full px-4 pt-4 pb-12 bg-transparent focus:outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
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
          <div className="absolute bottom-2 left-3 flex items-center gap-2 z-20">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors tooltip-trigger relative group"
            >
              <Paperclip className="w-4 h-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Upload PDF</span>
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <FileImage className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
             <span className="text-[10px] text-gray-400 hidden sm:inline-block">Press Enter to send, Shift + Enter for a new line</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || (!activeDocumentId && uploadState !== "SUCCESS")}
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
