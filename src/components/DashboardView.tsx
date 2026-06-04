/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Building, 
  Percent, 
  Users, 
  Coins, 
  Receipt, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Wrench, 
  UserPlus, 
  AlertTriangle, 
  Eye, 
  ArrowRight, 
  Plus, 
  Info, 
  X, 
  TrendingUp 
} from "lucide-react";
import { Room, Tenant, Bill, ActivityLog } from "../types";
import { formatVND } from "../utils";

interface DashboardViewProps {
  rooms: Room[];
  tenants: Tenant[];
  bills: Bill[];
  activityLogs: ActivityLog[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({ 
  rooms, 
  tenants, 
  bills, 
  activityLogs, 
  onNavigate 
}: DashboardViewProps) {
  const [selectedRange, setSelectedRange] = useState("Last 6 Months");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFeaturedRoomModalOpen, setIsFeaturedRoomModalOpen] = useState(false);

  // Dynamic calculations based on state arrays
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === "Occupied").length;
  const activeTenantsCount = tenants.length;
  const occupancyRate = totalRoomsCount > 0 
    ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) 
    : 0;

  // Monthly revenue logic (outstanding / outstanding sum + paid)
  const outstandingSum = bills
    .filter(b => b.status === "Unpaid")
    .reduce((sum, b) => sum + b.total, 0);
  
  const paidSum = bills
    .filter(b => b.status === "Paid")
    .reduce((sum, b) => sum + b.total, 0);

  const estimatedMonthlyRevenue = Math.round(paidSum + outstandingSum);
  const unpaidBillsCount = bills.filter(b => b.status === "Unpaid" || b.status === "Pending").length;

  const barChartData = [
    { label: "Jan", height: "h-[60%]", value: "102M đ", active: false },
    { label: "Feb", height: "h-[75%]", value: "115M đ", active: false },
    { label: "Mar", height: "h-[70%]", value: "110M đ", active: false },
    { label: "Apr", height: "h-[85%]", value: "121M đ", active: false },
    { label: "May", height: "h-[95%]", value: "124M đ", active: true },
    { label: "Jun", height: "h-[40%]", value: "128M đ (Proj)", active: false, projection: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-black tracking-tight font-display">Overview Dashboard</h2>
        <p className="text-sm text-[#45464d]">Welcome back. Here is what's happening with your properties today.</p>
      </section>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Rooms */}
        <div 
          onClick={() => onNavigate("rooms")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Total Rooms</span>
            <Building className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{totalRoomsCount}</span>
            <span className="text-xs text-[#45464d] font-semibold">units</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">+2 added this month</span>
          </div>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div 
          onClick={() => onNavigate("rooms")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Occupancy Rate</span>
            <Percent className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{occupancyRate}%</span>
            <span className="text-xs text-[#45464d] font-semibold">capacity</span>
          </div>
          <div className="mt-4 w-full bg-[#eceef0] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#0051d5] h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Active Tenants */}
        <div 
          onClick={() => onNavigate("tenants")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Active Tenants</span>
            <Users className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{activeTenantsCount}</span>
            <span className="text-xs text-[#45464d] font-semibold">people</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[#45464d]">
            <span className="text-[11px] font-semibold">{totalRoomsCount - occupiedRoomsCount} rooms vacant</span>
          </div>
        </div>

        {/* Card 4: Estimated Revenue */}
        <div 
          onClick={() => onNavigate("bills")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Monthly Revenue</span>
            <Coins className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-display text-black">{formatVND(estimatedMonthlyRevenue)}</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">8.4% vs last month</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart Panel */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-black font-display">Revenue Trend</h3>
              <p className="text-xs text-[#45464d]">Monthly earnings overview for 2026</p>
            </div>
            <select 
              value={selectedRange} 
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg px-3 py-1 text-xs font-semibold focus:outline-none"
            >
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-2 pt-6">
            {barChartData.map((bar, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center gap-2 group relative"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip on Hover */}
                <div 
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded-md shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-30 ${
                    hoveredBar === idx || bar.active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                >
                  {bar.value}
                </div>

                {/* Pure CSS Bar */}
                <div 
                  className={`w-full rounded-t transition-all duration-300 relative cursor-pointer ${
                    bar.active 
                      ? "bg-[#0051d5] shadow-sm scale-102" 
                      : bar.projection 
                        ? "border-2 border-dashed border-[#c6c6cd] hover:border-black" 
                        : "bg-[#e0e3e5] hover:bg-[#0051d5]"
                  } ${bar.height}`}
                  style={bar.projection ? { 
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 10px)' 
                  } : undefined}
                ></div>

                <span className={`text-xs ${bar.active ? "text-[#0051d5] font-bold text-sm" : "text-[#45464d] font-semibold"}`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Widgets Column */}
        <div className="space-y-6">
          {/* Unpaid Bills Card */}
          <div 
            onClick={() => onNavigate("bills")}
            className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex items-center gap-4 hover:border-red-500 hover:shadow-md cursor-pointer transition-all duration-300"
          >
            <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-black leading-tight">{unpaidBillsCount}</p>
              <p className="text-xs text-[#45464d] font-bold uppercase tracking-wider">Unpaid or Pending Bills</p>
            </div>
            <ChevronRight className="ml-auto w-4 h-4 text-[#76777d]" />
          </div>

          {/* Upcoming Expirations Card */}
          <div 
            onClick={() => onNavigate("tenants")}
            className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex items-center gap-4 hover:border-[#0051d5] hover:shadow-md cursor-pointer transition-all duration-300"
          >
            <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-black leading-tight">2</p>
              <p className="text-xs text-[#45464d] font-bold uppercase tracking-wider font-display">Upcoming Expirations</p>
            </div>
            <ChevronRight className="ml-auto w-4 h-4 text-[#76777d]" />
          </div>

          {/* Quick Action Management Task Card */}
          <div className="bg-black text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider font-display mb-1 text-[#bec6e0]">New Management Task</h4>
              <p className="text-xs text-slate-300 mb-4 leading-normal">
                You have 1 pending room inspection scheduled for tomorrow at Room 205.
              </p>
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="w-full bg-white text-black font-bold py-2 rounded-lg text-xs hover:bg-[#eceef0] active:scale-95 transition-all outline-none"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Highlighted Property List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#c6c6cd] flex items-center justify-between">
            <h3 className="text-base font-bold text-black font-display">Recent Activity</h3>
            <button 
              onClick={() => onNavigate("bills")}
              className="text-[#0051d5] text-xs font-bold hover:underline"
            >
              View All Logs
            </button>
          </div>

          <div className="divide-y divide-[#c6c6cd]/40">
            {activityLogs.slice(0, 4).map((log) => {
              const getIcon = () => {
                switch (log.type) {
                  case "payment":
                    return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
                  case "maintenance":
                    return <Wrench className="w-5 h-5 text-orange-500" />;
                  case "tenant":
                    return <UserPlus className="w-5 h-5 text-[#0051d5]" />;
                  default:
                    return <AlertTriangle className="w-5 h-5 text-red-600" />;
                }
              };

              const getBgColor = () => {
                switch (log.type) {
                  case "payment": return "bg-emerald-50";
                  case "maintenance": return "bg-orange-50";
                  case "tenant": return "bg-blue-50";
                  default: return "bg-red-50";
                }
              };

              return (
                <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-[#f2f4f6] transition-colors">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getBgColor()}`}>
                    {getIcon()}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs text-black leading-normal">
                      <span className="font-bold whitespace-nowrap">{log.user}</span> {log.action}{" "}
                      <span className="font-semibold text-slate-700">{log.detail}</span>
                    </p>
                    <p className="text-[10px] text-[#45464d] mt-0.5">{log.timeLabel}</p>
                  </div>
                  {log.amount && (
                    <span className="text-xs font-bold font-mono text-emerald-700 shrink-0">
                      +{formatVND(log.amount)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Highlighted Property Card (Room 301) */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between">
          <div className="relative h-44 overflow-hidden shrink-0">
            <img 
              alt="Room 301 Interior design" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuP0y91lFKllbLLYGUCGJLDhCSi0TGbApHpxmsjmVwtPLa0yUQ1DK63yr7y-3bLF8T9YQLRb-Z10_wqIbE1nBPJtoRBybXYJZgdhVJjqke1SIDNm43naeoTGZOozxQCYPDcjHDU7VsiU8_WiSuZhx1Et_BDqqOSUT2p6gNz2dWLDm155YqJC-tSU3cjy2c_S6V9r-bD6uJ8LN619vxAnmIBCub5boeIwPCV-13mUdYiN839F33Y8YMhm09kB_7hxsxq4Ktxx1S8M4"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Recently Leased
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-black text-sm font-display mb-0.5">Room 301 - Deluxe Studio</h4>
              <p className="text-[11px] text-[#45464d] mb-4">Upper Floor · 24sqm · Fully Furnished · Safe Lock</p>
              
              <div className="flex items-center justify-between py-3 border-y border-[#c6c6cd]/50">
                <div className="text-center">
                  <p className="text-xs font-bold text-black">{formatVND(8500000)}</p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Monthly Rent</p>
                </div>
                <div className="w-px h-6 bg-[#c6c6cd]/50"></div>
                <div className="text-center">
                  <p className="text-xs font-bold text-black">12 Months</p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Lease Term</p>
                </div>
                <div className="w-px h-6 bg-[#c6c6cd]/50"></div>
                <div className="text-center">
                  <p className="text-xs font-bold text-emerald-600">Active</p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Contract Status</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsFeaturedRoomModalOpen(true)}
              className="w-full mt-4 flex items-center justify-center gap-1 text-xs font-bold text-[#0051d5] hover:text-black transition-colors"
            >
              <span>View Details</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Floating Action Button (FAB) for Registering New Tenant */}
      <button 
        id="dashboard-fab-register"
        onClick={() => onNavigate("register")}
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-black text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group hover:ring-2 hover:ring-black/10"
        title="Register New Room & Tenant"
      >
        <Plus className="w-5 h-5 text-white" />
        <span className="absolute right-full mr-3 bg-black text-white text-xs py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md font-bold">
          Register Tenant
        </span>
      </button>

      {/* Inspection Schedule Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-scale-up">
            <button 
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#0051d5]" />
              <h3 className="text-lg font-bold text-black font-display">Task Schedule</h3>
            </div>
            <div className="space-y-4 text-xs text-black">
              <p className="font-semibold text-[#45464d]">Inspection detail for Room 205 (Maintenance):</p>
              <div className="bg-[#f2f4f6] p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#45464d]">inspector:</span>
                  <span className="font-bold text-black">Alex Morgan (Admin)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#45464d]">Target Room:</span>
                  <span className="font-bold text-black">205 (Executive Studio)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#45464d]">Scheduled Time:</span>
                  <span className="font-bold text-black text-orange-600">Tomorrow, 10:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#45464d]">Focus Parameters:</span>
                  <span className="font-bold text-black">HVAC efficiency & Ventilation check</span>
                </div>
              </div>
              <p className="text-[11px] text-[#76777d]">
                Inspections must be logged with photos in compliance with Propria standards.
              </p>
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(false)}
              className="w-full mt-6 bg-black text-white text-xs font-bold py-2 rounded-lg"
            >
              Acknowledge Task
            </button>
          </div>
        </div>
      )}

      {/* Featured Room Details Modal */}
      {isFeaturedRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative animate-scale-up">
            <button 
              onClick={() => setIsFeaturedRoomModalOpen(false)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-1 rounded-full z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-48 relative">
              <img 
                alt="Studio 301 detailed interior photo" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuP0y91lFKllbLLYGUCGJLDhCSi0TGbApHpxmsjmVwtPLa0yUQ1DK63yr7y-3bLF8T9YQLRb-Z10_wqIbE1nBPJtoRBybXYJZgdhVJjqke1SIDNm43naeoTGZOozxQCYPDcjHDU7VsiU8_WiSuZhx1Et_BDqqOSUT2p6gNz2dWLDm155YqJC-tSU3cjy2c_S6V9r-bD6uJ8LN619vxAnmIBCub5boeIwPCV-13mUdYiN839F33Y8YMhm09kB_7hxsxq4Ktxx1S8M4"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold font-display">Room 301 - Deluxe Studio</h3>
                <p className="text-xs text-slate-300">North wing, Building B, Upper level</p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-xs text-black">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Standard Features</p>
                  <p className="font-bold text-sm mt-0.5">Kitchenette, Balcony</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Square Meters</p>
                  <p className="font-bold text-sm mt-0.5">24 m²</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Maximum Occupants</p>
                  <p className="font-bold text-sm mt-0.5">2 Occupants</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Assigned Tenant</p>
                  <p className="font-bold text-sm mt-0.5 text-[#0051d5]">Sarah Miller</p>
                </div>
              </div>
              <p className="text-[#45464d] leading-relaxed">
                Beautifully designed Scandinavian studio apartment with bespoke wood panels and morning sun illumination.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 text-blue-800 text-[11px] leading-relaxed">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>We recommend reviewing the safety deposit lock system during the tenant stay every 6 months.</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-[#c6c6cd]/50 flex gap-3">
              <button 
                onClick={() => setIsFeaturedRoomModalOpen(false)}
                className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-xs hover:bg-[#eceef0] hover:text-black transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
