import React from "react";
import { Search, Settings, ChevronDown } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white shrink-0">
      {/* Left side: Logo */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 leading-tight">DocuMind</span>
          <span className="text-[10px] text-gray-500 leading-tight">Your PDF AI Assistant</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-auto flex justify-center">
        <div className="relative w-full max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full pl-9 pr-12 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side: User/Settings */}
      <div className="flex items-center gap-4 shrink-0 justify-end w-64">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition-colors">
          <div className="w-7 h-7 rounded-full bg-indigo-400 text-white flex items-center justify-center text-xs font-medium">
            A
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Alex</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
