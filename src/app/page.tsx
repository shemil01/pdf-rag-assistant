"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/documents/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentPanel } from "@/components/document-viewer/DocumentPanel";

export default function Page() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 overflow-hidden font-sans">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeDocumentId={activeDocumentId} 
          onSelectDocument={setActiveDocumentId} 
          documents={documents}
          setDocuments={setDocuments}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-white relative">
          <ChatArea 
            key={activeDocumentId || "empty"} 
            activeDocumentId={activeDocumentId} 
            activeDocument={activeDoc}
            setDocuments={setDocuments}
          />
        </main>

        {/* Right Document Panel (only if a doc is active) */}
        {activeDocumentId && activeDoc && (
          <DocumentPanel activeDocument={activeDoc} />
        )}
      </div>
    </div>
  );
}
