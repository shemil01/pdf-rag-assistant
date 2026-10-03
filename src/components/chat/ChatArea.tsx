import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { Send, FileText, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

const extractText = (m: UIMessage): string => {
  if (!m.parts) return "";
  return m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('');
};

export function ChatArea({ activeDocumentId }: { activeDocumentId: string | null }) {
  const [input, setInput] = useState("");
  
  const transport = useMemo(() => {
    if (!activeDocumentId) return undefined;
    return new TextStreamChatTransport({
      api: "/api/chat",
      body: { documentId: activeDocumentId }
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
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  if (!activeDocumentId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
        <FileText className="w-12 h-12 text-gray-300" />
        <p>Select or upload a document to begin chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-sm space-y-4">
              <h2 className="text-xl font-medium text-gray-800">Ask anything about this document</h2>
              <p className="text-sm text-gray-500">Example: &quot;What are the main conclusions?&quot;</p>
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            const contentText = extractText(m);
            return (
              <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div 
                    className={`p-4 rounded-xl text-sm ${
                      m.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-sm shadow-sm" 
                        : "bg-gray-50 border border-gray-100 rounded-bl-sm text-gray-800 shadow-sm"
                    }`}
                  >
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap">{contentText}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800">
                        <ReactMarkdown>{contentText}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
               <Bot className="w-5 h-5 text-blue-600" />
             </div>
             <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl rounded-bl-sm flex items-center gap-1.5 h-[52px]">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           </div>
        )}
        
        {error && (
          <div className="text-center text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-100 mx-auto max-w-sm flex items-center justify-center gap-2">
            <span className="font-semibold">Error:</span> 
            {error.message || "An error occurred during generation."}
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <form 
          onSubmit={handleSubmit} 
          className="max-w-4xl mx-auto relative flex flex-col items-center shadow-sm"
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about this document..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-[52px] shadow-sm"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  handleSubmit();
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
