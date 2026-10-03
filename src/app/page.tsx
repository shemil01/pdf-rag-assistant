"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/documents/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";

export default function Page() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar activeDocumentId={activeDocumentId} onSelectDocument={setActiveDocumentId} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="font-semibold text-lg flex items-center gap-2">
            <span className="text-blue-600">ChatPDF</span>
          </div>
          <button className="text-sm font-medium text-blue-600">
            Documents
          </button>
        </header>

        <ChatArea key={activeDocumentId || "empty"} activeDocumentId={activeDocumentId} />
      </main>
    </div>
  );
}
