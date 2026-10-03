"use client";

import React, { useRef, useState } from "react";
import { FileText, Plus, Search, Trash2, Loader2, MoreVertical, Sparkles } from "lucide-react";

type UploadState = "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR";

interface SidebarProps {
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  documents: any[];
  setDocuments: React.Dispatch<React.SetStateAction<any[]>>;
}

export function Sidebar({ activeDocumentId, onSelectDocument, documents, setDocuments }: SidebarProps) {
  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
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
      setDocuments(prev => [{ ...data, id: newDocId }, ...prev]);
      onSelectDocument(newDocId);
      
      setTimeout(() => setUploadState("IDLE"), 3000);
    } catch (error: unknown) {
      const err = error as Error;
      setUploadState("ERROR");
      setErrorMessage(err.message);
    }
  };

  const deleteDocument = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Optimistic delete
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocumentId === id) {
      onSelectDocument("");
    }
    // Delete from API if needed (mocked for now, assuming api is there or just relying on local state for MVP)
  };

  return (
    <aside className="w-72 border-r border-gray-100 bg-white flex flex-col h-full shrink-0">
      <div className="p-4">
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          disabled={uploadState === "UPLOADING"}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState === "UPLOADING"}
          className="w-full flex items-center gap-2 justify-center bg-indigo-500 text-white rounded-lg py-2.5 px-4 hover:bg-indigo-600 transition-colors font-medium text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-sm"
        >
          {uploadState === "UPLOADING" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Upload PDF
        </button>

        {uploadState === "ERROR" && (
          <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
            <span className="font-semibold">Error:</span> {errorMessage}
            <button onClick={() => setUploadState("IDLE")} className="ml-2 underline">Dismiss</button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="text-sm font-semibold text-gray-800">Documents</h2>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{documents.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {documents.map((doc) => {
          const isActive = activeDocumentId === doc.id;
          const isProcessing = doc.status === "PROCESSING";
          
          return (
            <div 
              key={doc.id as string}
              onClick={() => onSelectDocument(doc.id as string)}
              className={`group relative flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
              )}
              
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm text-red-500' : 'bg-red-50 text-red-500'}`}>
                <FileText className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center h-8">
                <div className="flex items-center justify-between">
                  <span className={`truncate text-sm font-medium ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {doc.filename || 'Document.pdf'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>{doc.pageCount || 0} pages</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'border border-gray-400 animate-pulse' : 'bg-green-500'}`} />
                    <span>{isProcessing ? 'Processing' : 'Ready'}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // For now just mock more options
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info Card */}
      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl p-4 overflow-hidden relative border border-indigo-100/50">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 rounded-full blur-xl opacity-60"></div>
          <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-500 mb-3 relative z-10">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1 relative z-10">PDF AI Assistant</h3>
          <p className="text-xs text-gray-500 leading-relaxed relative z-10">
            Upload your documents and get instant, accurate answers with source citations.
          </p>
        </div>
      </div>
    </aside>
  );
}
