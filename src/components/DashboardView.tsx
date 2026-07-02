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
  Plus,
  X,
  TrendingUp
} from "lucide-react";
import { Room, Tenant, Bill, ActivityLog } from "../types";
import { formatVND, roomStatusLabel } from "../utils";

interface DashboardViewProps {
  rooms: Room[];
  tenants: Tenant[];
  bills: Bill[];
  activityLogs: ActivityLog[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  rooms = [],
  tenants = [],
  bills = [],
  activityLogs = [],
  onNavigate
}: DashboardViewProps) {
  const [selectedRange, setSelectedRange] = useState("6 Tháng Gần Đây");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
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

  const isTodayLog = (timeLabel: string) => /vừa xong|trước|hôm nay/i.test(timeLabel);

  const roomsAddedToday = activityLogs.filter(log =>
    (log.action.includes("đăng ký") || log.action.includes("thêm")) &&
    isTodayLog(log.timeLabel)
  ).length;

  const revenueToday = activityLogs
    .filter(log => log.type === "payment" && isTodayLog(log.timeLabel))
    .reduce((sum, log) => sum + (log.amount || 0), 0);

  // Dynamic chart data calculation from bills — bill.month follows the
  // "Tháng M/YYYY" format produced by formatMonthLabel, so we parse that
  // directly instead of relying on locale-specific month names.
  const generateChartData = () => {
    const monthMap: Record<string, number> = {};
    bills.forEach(b => {
      const match = b.month.match(/Tháng\s*(\d+)\/(\d+)/);
      if (match) {
        const key = `${match[1]}/${match[2]}`;
        monthMap[key] = (monthMap[key] || 0) + b.total;
      }
    });

    // Last 6 calendar months ending with the current month, oldest first.
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });
    const currentKey = `${now.getMonth() + 1}/${now.getFullYear()}`;

    const maxVal = Math.max(...Object.values(monthMap), 1);

    return months.map(({ month, year }) => {
      const key = `${month}/${year}`;
      const val = monthMap[key] || 0;
      const percentage = maxVal > 0 ? Math.min(Math.round((val / maxVal) * 100), 100) : 0;

      return {
        label: `T${month}`,
        height: `${percentage}%`,
        value: `${(val / 1000000).toFixed(0)}Tr đ`,
        active: key === currentKey,
        projection: false
      };
    });
  };

  const barChartData = generateChartData();

  // Calculate Upcoming Expirations dynamically (mock logic: contracts > 11 months old)
  const upcomingExpirationsCount = tenants.filter(t => {
    const contractDate = new Date(t.contractStart);
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
    return contractDate < elevenMonthsAgo;
  }).length;

  // Find a featured room dynamically
  const featuredRoom = rooms.find(r => r.status === "Available") || rooms[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-black tracking-tight font-display">Tổng Quan</h2>
        <p className="text-sm text-[#45464d]">Chào mừng trở lại. Đây là tình hình nhà trọ của bạn hôm nay.</p>
      </section>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Rooms */}
        <div
          onClick={() => onNavigate("rooms")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Tổng Số Phòng</span>
            <Building className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{totalRoomsCount}</span>
            <span className="text-xs text-[#45464d] font-semibold">phòng</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">+{roomsAddedToday} phòng thêm hôm nay</span>
          </div>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div
          onClick={() => onNavigate("rooms")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Tỷ Lệ Lấp Đầy</span>
            <Percent className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{occupancyRate}%</span>
            <span className="text-xs text-[#45464d] font-semibold">công suất</span>
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
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Người Thuê</span>
            <Users className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-black">{activeTenantsCount}</span>
            <span className="text-xs text-[#45464d] font-semibold">người</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[#45464d]">
            <span className="text-[11px] font-semibold">{totalRoomsCount - occupiedRoomsCount} phòng còn trống</span>
          </div>
        </div>

        {/* Card 4: Estimated Revenue */}
        <div
          onClick={() => onNavigate("bills")}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 flex flex-col justify-between hover:bg-[#f2f4f6] hover:shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Doanh Thu Tháng</span>
            <Coins className="text-[#0051d5] w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-display text-black">{formatVND(estimatedMonthlyRevenue)}</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">+{formatVND(revenueToday)} thu được hôm nay</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend Chart Panel */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-black font-display">Xu Hướng Doanh Thu</h3>
              <p className="text-xs text-[#45464d]">Tổng quan doanh thu hàng tháng</p>
            </div>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg px-3 py-1 text-xs font-semibold focus:outline-none"
            >
              <option>6 Tháng Gần Đây</option>
              <option>Năm Trước</option>
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
                  }`}
                  style={{
                    height: bar.height,
                    ...(bar.projection ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 10px)' } : {})
                  }}
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
              <p className="text-xs text-[#45464d] font-bold uppercase tracking-wider">Hóa Đơn Chưa/Chờ Thanh Toán</p>
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
              <p className="text-2xl font-bold font-display text-black leading-tight">{upcomingExpirationsCount}</p>
              <p className="text-xs text-[#45464d] font-bold uppercase tracking-wider font-display">Hợp Đồng Sắp Hết Hạn</p>
            </div>
            <ChevronRight className="ml-auto w-4 h-4 text-[#76777d]" />
          </div>

        </div>
      </div>

      {/* Recent Activity & Highlighted Property List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#c6c6cd] flex items-center justify-between">
            <h3 className="text-base font-bold text-black font-display">Hoạt Động Gần Đây</h3>
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

        {/* Highlighted Property Card — shows the first available room, or the first room if none are available */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between">
          <div className="relative h-44 overflow-hidden shrink-0 bg-[#eceef0] flex items-center justify-center">
            <Building className="w-10 h-10 text-[#76777d]" />
            <div className={`absolute top-4 right-4 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
              featuredRoom?.status === 'Available' ? 'bg-emerald-500' : featuredRoom?.status === 'Maintenance' ? 'bg-red-500' : 'bg-[#0051d5]'
            }`}>
              {featuredRoom ? roomStatusLabel(featuredRoom.status) : 'Không rõ'}
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-black text-sm font-display mb-0.5">Phòng {featuredRoom?.number || 'N/A'} - {featuredRoom?.name || 'Tiêu chuẩn'}</h4>
              <p className="text-[11px] text-[#45464d] mb-4">Tầng {featuredRoom?.floor} · {featuredRoom?.wing} · Tối đa {featuredRoom?.maxOccupants} người</p>

              <div className="flex items-center justify-between py-3 border-y border-[#c6c6cd]/50">
                <div className="text-center">
                  <p className="text-xs font-bold text-black">{featuredRoom ? formatVND(featuredRoom.monthlyRent) : 'N/A'}</p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Giá Thuê/Tháng</p>
                </div>
                <div className="w-px h-6 bg-[#c6c6cd]/50"></div>
                <div className="text-center">
                  <p className="text-xs font-bold text-black">{featuredRoom?.currentOccupants ?? 0} / {featuredRoom?.maxOccupants ?? 0}</p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Số Người</p>
                </div>
                <div className="w-px h-6 bg-[#c6c6cd]/50"></div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${featuredRoom?.status === 'Available' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {featuredRoom ? roomStatusLabel(featuredRoom.status) : 'Không rõ'}
                  </p>
                  <p className="text-[9px] text-[#45464d] mt-0.5">Trạng Thái</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFeaturedRoomModalOpen(true)}
              className="w-full mt-4 flex items-center justify-center gap-1 text-xs font-bold text-[#0051d5] hover:text-black transition-colors"
            >
              <span>Xem Chi Tiết</span>
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
        title="Đăng Ký Phòng & Người Thuê Mới"
      >
        <Plus className="w-5 h-5 text-white" />
        <span className="absolute right-full mr-3 bg-black text-white text-xs py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md font-bold">
          Đăng Ký Người Thuê
        </span>
      </button>


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
            <div className="h-48 relative bg-[#eceef0] flex items-center justify-center">
              <Building className="w-12 h-12 text-[#76777d]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold font-display">Phòng {featuredRoom?.number || 'N/A'} - {featuredRoom?.name || 'Tiêu chuẩn'}</h3>
                <p className="text-xs text-slate-300">{featuredRoom?.wing || 'N/A'} · Tầng {featuredRoom?.floor ?? 'N/A'}</p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-xs text-black">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Giá Thuê/Tháng</p>
                  <p className="font-bold text-sm mt-0.5">{featuredRoom ? formatVND(featuredRoom.monthlyRent) : 'N/A'}</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Số Người</p>
                  <p className="font-bold text-sm mt-0.5">{featuredRoom?.currentOccupants ?? 0} / {featuredRoom?.maxOccupants ?? 0}</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Trạng Thái</p>
                  <p className="font-bold text-sm mt-0.5">{featuredRoom ? roomStatusLabel(featuredRoom.status) : 'Không rõ'}</p>
                </div>
                <div className="border border-[#c6c6cd]/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-[#45464d] uppercase font-bold">Người Thuê</p>
                  <p className="font-bold text-sm mt-0.5 text-[#0051d5]">
                    {featuredRoom?.status === 'Occupied'
                      ? (tenants.find(t => t.roomAssignment === `Room ${featuredRoom.number}`)?.name || 'Không rõ')
                      : 'Không có'}
                  </p>
                </div>
              </div>
              <p className="text-[#45464d] leading-relaxed">
                {featuredRoom?.name} thuộc {featuredRoom?.wing}.
                Trạng thái hiện tại là {featuredRoom ? roomStatusLabel(featuredRoom.status) : 'Không rõ'}.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-[#c6c6cd]/50 flex gap-3">
              <button
                onClick={() => setIsFeaturedRoomModalOpen(false)}
                className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-xs hover:bg-[#eceef0] hover:text-black transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
