import React from "react";
import { Search, Settings, ChevronDown, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-safe border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shrink-0 transition-colors z-30 relative shadow-sm">
      {/* Left side: Logo & Menu */}
      <div className="flex items-center gap-3 w-auto md:w-64 shrink-0">
        {onMenuClick && (
          <button 
            className="md:hidden p-1.5 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hidden sm:flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 leading-tight">DocuMind</span>
          <span className="text-[10px] text-gray-500 leading-tight">Your PDF AI Assistant</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-auto flex justify-center px-2">
        <div className="relative w-full max-w-lg hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full pl-9 pr-12 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-md text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors placeholder:text-gray-400 dark:placeholder-gray-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side: User/Settings */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 justify-end w-auto sm:w-64">
        <ThemeToggle />
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
