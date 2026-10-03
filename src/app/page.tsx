import React from "react";
import { Sidebar } from "@/components/documents/Sidebar";
import { EmptyChat } from "@/components/chat/EmptyChat";
import { ChatComposer } from "@/components/chat/ChatComposer";

export default function Page() {
  return (
    <div className="flex w-full h-full">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar />
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

        {/* Chat Area (Empty State for Day 1) */}
        <div className="flex-1 overflow-y-auto">
          <EmptyChat />
        </div>

        {/* Composer Area */}
        <div className="mt-auto">
          <ChatComposer />
        </div>
      </main>
    </div>
  );
}
