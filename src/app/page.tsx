"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/documents/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentPanel } from "@/components/document-viewer/DocumentPanel";

export default function Page() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 overflow-hidden font-sans">
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:flex h-full ${isSidebarOpen ? 'translate-x-0' : 'max-md:-translate-x-full'}`}>
          <Sidebar 
            activeDocumentId={activeDocumentId} 
            onSelectDocument={(id) => {
              setActiveDocumentId(id);
              setIsSidebarOpen(false); // Auto-close on mobile
            }}
            documents={documents}
            setDocuments={setDocuments}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-white relative w-full overflow-hidden">
          <ChatArea 
            key={activeDocumentId || "empty"} 
            activeDocumentId={activeDocumentId} 
            activeDocument={activeDoc}
            setDocuments={setDocuments}
            onSelectDocument={setActiveDocumentId}
          />
        </main>

        {/* Right Document Panel (only if a doc is active) */}
        {activeDocumentId && activeDoc && (
          <div className="hidden lg:flex shrink-0">
            <DocumentPanel activeDocument={activeDoc} />
          </div>
        )}
      </div>
    </div>
  );
}
