"use client";

import React, { useRef, useState } from "react";
import { FileText, Plus, Search, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react";

type UploadState = "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR";

interface SidebarProps {
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
}

export function Sidebar({ activeDocumentId, onSelectDocument }: SidebarProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";

    setUploadState("UPLOADING");
    setErrorMessage("");
    setUploadProgress(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress("Extracting text from PDF...");
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
      
      // Revert to idle after a few seconds
      setTimeout(() => setUploadState("IDLE"), 5000);
    } catch (error: unknown) {
      const err = error as Error;
      setUploadState("ERROR");
      setErrorMessage(err.message);
    }
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span>ChatPDF</span>
        </h1>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
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
          className="w-full flex items-center gap-2 justify-center bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors mb-4 font-medium text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {uploadState === "UPLOADING" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {uploadState === "UPLOADING" ? "Processing..." : "New Document"}
        </button>

        {uploadState === "UPLOADING" && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-md flex items-start gap-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {uploadState === "ERROR" && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 flex flex-col gap-1">
            <div className="flex items-center gap-1 font-semibold">
              <AlertCircle className="w-4 h-4" />
              Upload Failed
            </div>
            <p>{errorMessage}</p>
            <button onClick={() => setUploadState("IDLE")} className="mt-1 text-red-600 underline text-left">Dismiss</button>
          </div>
        )}

        {uploadState === "SUCCESS" && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-md border border-green-100 flex flex-col gap-1">
            <div className="flex items-center gap-1 font-semibold">
              <CheckCircle className="w-4 h-4" />
              Extraction Complete
            </div>
            <p>PDF processed for text extraction.</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your Documents
          </h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            {documents.length === 0 && uploadState !== "UPLOADING" && (
               <p className="text-xs text-gray-400 text-center py-4">No documents uploaded yet.</p>
            )}
            {documents.map((doc) => (
              <div 
                key={doc.id as string}
                onClick={() => onSelectDocument(doc.id as string)}
                className={`group flex flex-col p-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm border transition-colors ${
                  activeDocumentId === doc.id ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate text-gray-700 font-medium" title={doc.filename}>{doc.filename}</span>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {doc.pageCount && (
                  <div className="text-[10px] text-gray-500 ml-6 flex gap-2">
                    <span>{doc.pageCount} pages</span>
                    <span>•</span>
                    <span>{(doc.totalCharacters / 1000).toFixed(1)}k chars</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        MVP Version 0.1
      </div>
    </aside>
  );
}
