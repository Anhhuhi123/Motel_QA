/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, HelpCircle, Grid } from "lucide-react";

interface HeaderProps {
  currentView: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ currentView, searchQuery, onSearchChange }: HeaderProps) {
  // Get search placeholder based on current active view
  const getPlaceholder = () => {
    switch (currentView) {
      case "rooms":
        return "Search rooms, wings, or statuses...";
      case "tenants":
        return "Search by tenant name, ID, or phone...";
      case "bills":
        return "Search bills by room or month...";
      case "templates":
      case "settings":
        return "Search templates, specifications or parameters...";
      default:
        return "Search rooms, tenants, bills, or tasks...";
    }
  };

  return (
    <header className="fixed top-0 left-[240px] r-0 w-[calc(100%-240px)] h-[64px] bg-[#f7f9fb] border-b border-[#c6c6cd] flex items-center justify-between px-8 z-40">
      {/* Search Bar Input */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] w-4 h-4" />
          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#c6c6cd] rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder-[#76777d] transition-all"
            placeholder={getPlaceholder()}
          />
        </div>
      </div>

      {/* Utilities Column */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-[#45464d]">
          <button className="text-[#45464d] hover:text-black transition-colors cursor-pointer active:scale-95 p-1 rounded hover:bg-gray-100">
            <Bell className="w-4 h-4" />
          </button>
          <button className="text-[#45464d] hover:text-black transition-colors cursor-pointer active:scale-95 p-1 rounded hover:bg-gray-100">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="text-[#45464d] hover:text-black transition-colors cursor-pointer active:scale-95 p-1 rounded hover:bg-gray-100">
            <Grid className="w-4 h-4" />
          </button>
        </div>

        <div className="h-8 w-px bg-[#c6c6cd]"></div>

        {/* User profile avatar info card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-black leading-none">Alex Morgan</p>
            <p className="text-[10px] text-[#45464d] mt-1">Property Admin</p>
          </div>
          <img
            id="user-header-avatar"
            alt="Property Manager Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCziGlb2VSKB_NNK-3v8SJym-jR41KwFkkggAseoUn1Z8440OR9t6awM-aT8Qv8VSgya3adoa_4_yCXvMUFUizDB_hwD3jqR0lNXiBlXMA4vstqNBf3XUCeE8ghMunVOtHHUQZskcOYi8SQeyCYNknb2MM3I5rXMIhz5M_yiA7Qxgb8mwu1idQYYHlNEDQtOIQHda05wSod3MaKHavIi2xje2WBtgj-bECBZg8vLDjYEHLq5L8e4CQ2hr4ZLKjyoVlpOXAubcvgcT0"
            className="h-9 w-9 rounded-full object-cover border border-[#c6c6cd] shadow-sm hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </header>
  );
}
