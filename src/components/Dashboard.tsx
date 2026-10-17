"use client";

import React, { useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentPanel } from "@/components/document-viewer/DocumentPanel";

export default function Dashboard({ initialDocuments = [] }: { initialDocuments?: any[] }) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>(initialDocuments);

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-gray-50 dark:bg-zinc-950 overflow-hidden font-sans pl-safe pr-safe">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
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
