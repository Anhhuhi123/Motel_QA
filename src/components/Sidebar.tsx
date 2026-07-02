/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Receipt,
  User
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "rooms", label: "Phòng", icon: DoorOpen },
    { id: "tenants", label: "Người thuê", icon: Users },
    { id: "bills", label: "Hóa đơn", icon: Receipt },
  ];

  return (
    <aside
      id="side-bar-nav"
      className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-[#c6c6cd] flex flex-col p-4 z-50 shadow-sm"
    >
      {/* Brand Logo */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-lg shadow-sm">
          <DoorOpen className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black leading-tight">Propria</h1>
          <p className="text-xs text-[#45464d] font-medium uppercase tracking-wider">Quản Lý Nhà Trọ</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id ||
            (item.id === "rooms" && currentView === "register"); // highlight Rooms when registering room/tenant

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-left rounded-lg font-medium text-sm ${
                isActive
                  ? "text-black font-bold bg-[#eceef0] shadow-sm cursor-default"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#45464d]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Action Links */}
      <div className="mt-auto pt-4 border-t border-[#c6c6cd] space-y-1">
        <button
          id="btn-sidebar-account"
          onClick={() => onViewChange("dashboard")} // mock redirect
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#45464d] hover:bg-[#f2f4f6] rounded-lg transition-colors text-left"
        >
          <User className="w-4 h-4 text-[#45464d]" />
          <span>Tài khoản</span>
        </button>
      </div>
    </aside>
  );
}
