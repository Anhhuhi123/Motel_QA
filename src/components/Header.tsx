/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Search, Bell, HelpCircle, Grid, LogOut, Menu } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface HeaderProps {
  currentView: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
}

interface CurrentUser {
  fullName: string;
  role: string;
  email: string;
}

export default function Header({ currentView, searchQuery, onSearchChange, onMenuClick }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      setCurrentUser({
        fullName: profile?.full_name || user.email || "Quản trị viên",
        role: profile?.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : "Người dùng",
        email: profile?.email || user.email || ""
      });
    };

    loadProfile();
    return () => { cancelled = true; };
  }, []);

  // Get search placeholder based on current active view
  const getPlaceholder = () => {
    switch (currentView) {
      case "rooms":
        return "Tìm theo số phòng, khu hoặc trạng thái...";
      case "tenants":
        return "Tìm theo tên, mã số hoặc số điện thoại...";
      case "bills":
        return "Tìm hóa đơn theo phòng hoặc tháng...";
      default:
        return "Tìm phòng, người thuê, hóa đơn hoặc công việc...";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[240px] w-full md:w-[calc(100%-240px)] h-[64px] bg-[#f7f9fb] border-b border-[#c6c6cd] flex items-center justify-between gap-2 px-3 sm:px-5 md:px-8 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="md:hidden shrink-0 p-2 text-[#45464d] hover:text-black rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar Input */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
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
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
        <div className="hidden sm:flex items-center gap-4 text-[#45464d]">
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

        <div className="hidden sm:block h-8 w-px bg-[#c6c6cd]"></div>

        {/* User profile info card — populated from the signed-in Supabase user + profiles table */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-black leading-none">{currentUser?.fullName || "..."}</p>
            <p className="text-[10px] text-[#45464d] mt-1">{currentUser?.role || ""}</p>
          </div>
          <div
            id="user-header-avatar"
            className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs border border-[#c6c6cd] shadow-sm select-none shrink-0"
          >
            {(currentUser?.fullName || "?").trim().charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block h-8 w-px bg-[#c6c6cd] mx-1"></div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 bg-white border border-[#c6c6cd] hover:bg-slate-50 text-black text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
