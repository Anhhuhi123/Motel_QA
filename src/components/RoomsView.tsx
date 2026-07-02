/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  CheckCircle,
  CreditCard,
  Wrench,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from "lucide-react";
import { Room, RoomStatus, Bill, Tenant, UtilitySettings } from "../types";
import { formatVND, roomStatusLabel, depositStatusLabel, monthInputToLabel, currentMonthInputValue } from "../utils";

export interface QuickBillFeeOverrides {
  electricityPrice: number;
  waterPrice: number;
  internetFee: number;
  garbageFee: number;
  parkingFee: number;
  otherFee: number;
}

interface RoomsViewProps {
  rooms: Room[];
  bills?: Bill[];
  tenants?: Tenant[];
  searchQuery: string;
  utilitySettings?: UtilitySettings;
  onAddRoom: (room: Omit<Room, "id">) => void;
  onEditRoomStatus: (roomId: string, status: RoomStatus) => void;
  onUpdateRoom?: (roomId: string, updates: Partial<Room>) => void;
  onAssignTenant?: (roomId: string, tenantId: string) => void;
  onRemoveTenantFromRoom?: (roomId: string, tenantId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
  onCreateQuickBill?: (roomId: string, currentReading: number, overrides: QuickBillFeeOverrides, billMonth: string) => void;
  onNavigate?: (view: string) => void;
}

export default function RoomsView({
  rooms = [],
  bills = [],
  tenants = [],
  searchQuery: headerSearchQuery,
  utilitySettings,
  onAddRoom,
  onEditRoomStatus,
  onUpdateRoom,
  onAssignTenant,
  onRemoveTenantFromRoom,
  onDeleteRoom,
  onCreateQuickBill,
  onNavigate
}: RoomsViewProps) {
  const [localSearch, setLocalSearch] = useState("");

  const occupiedRoomsCount = rooms.filter(r => r.status === "Occupied").length;
  const occupancyRate = rooms.length > 0
    ? Math.round((occupiedRoomsCount / rooms.length) * 100)
    : 0;

  // bill.month follows the "Tháng M/YYYY" format produced by formatMonthLabel
  const now = new Date();
  const currentMonthKey = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
  const totalReceivedThisMonth = bills
    .filter(b => b.status === "Paid" && b.month === currentMonthKey)
    .reduce((sum, b) => sum + b.total, 0);
  const totalReceivedAllTime = bills
    .filter(b => b.status === "Paid")
    .reduce((sum, b) => sum + b.total, 0);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [selectedProperty, setSelectedProperty] = useState("Tất cả khu");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedTenantToAssign, setSelectedTenantToAssign] = useState<string>("");
  const [payingRoom, setPayingRoom] = useState<Room | null>(null);
  const [readingInput, setReadingInput] = useState<number>(0);
  const [billMonthInput, setBillMonthInput] = useState<string>(currentMonthInputValue());
  const [feeOverrides, setFeeOverrides] = useState<QuickBillFeeOverrides>({
    electricityPrice: 0,
    waterPrice: 0,
    internetFee: 0,
    garbageFee: 0,
    parkingFee: 0,
    otherFee: 0
  });

  // New room form state
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("Phòng Tiêu Chuẩn");
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomWing, setRoomWing] = useState("Khu Bắc");
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("Available");
  const [roomMaxOccupants, setRoomMaxOccupants] = useState(2);
  const [roomRent, setRoomRent] = useState(4500000);

  // Clear filters function
  const handleClearFilters = () => {
    setLocalSearch("");
    setSelectedStatus("Tất cả trạng thái");
    setSelectedProperty("Tất cả khu");
    setCurrentPage(1);
  };

  const activeSearch = headerSearchQuery || localSearch;

  // Filter strategy
  const filteredRooms = rooms.filter((room) => {
    // Search matching
    const matchesSearch =
      (room.number || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
      (room.name?.toLowerCase() || '').includes(activeSearch.toLowerCase()) ||
      (room.wing?.toLowerCase() || '').includes(activeSearch.toLowerCase());

    // Status matching
    const matchesStatus =
      selectedStatus === "Tất cả trạng thái" ||
      room.status === selectedStatus;

    // Property matching (we can map floor context as property category for mock)
    const matchesProperty =
      selectedProperty === "Tất cả khu" ||
      (selectedProperty === "Khu A" && room.floor === 1) ||
      (selectedProperty === "Khu B" && room.floor === 2) ||
      (selectedProperty === "Khu C" && room.floor >= 3);

    return matchesSearch && matchesStatus && matchesProperty;
  });

  // Pagination bounds (items per page = 4 for layout consistency)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmitRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    onAddRoom({
      number: roomNumber,
      name: roomName,
      floor: Number(roomFloor),
      wing: roomWing,
      status: roomStatus,
      maxOccupants: Number(roomMaxOccupants),
      currentOccupants: roomStatus === "Occupied" ? 1 : 0,
      monthlyRent: Number(roomRent),
      lastElectricityReading: 0
    });

    // Reset forms
    setRoomNumber("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with Create triggers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Phòng</h2>
          <p className="text-xs text-[#45464d] mt-1">Tổng cộng {rooms.length} phòng đang được quản lý</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phòng Mới</span>
        </button>
      </div>

      {/* Interactive Filter Block */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-2xs">
        <div className="flex-grow min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Lọc theo số phòng hoặc khu..."
            className="w-full bg-[#f2f4f6] border border-transparent rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Trạng thái:</label>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>Tất cả trạng thái</option>
            <option value="Occupied">Đã thuê</option>
            <option value="Available">Còn trống</option>
            <option value="Maintenance">Bảo trì</option>
          </select>
        </div>

        {/* Property Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Khu:</label>
          <select
            value={selectedProperty}
            onChange={(e) => { setSelectedProperty(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>Tất cả khu</option>
            <option>Khu A</option>
            <option>Khu B</option>
            <option>Khu C</option>
          </select>
        </div>

        {/* Clear Trigger */}
        {(localSearch || selectedStatus !== "Tất cả trạng thái" || selectedProperty !== "Tất cả khu") && (
          <button
            onClick={handleClearFilters}
            className="text-[#0051d5] text-xs font-bold hover:underline px-2 cursor-pointer"
          >
            Xóa Bộ Lọc
          </button>
        )}
      </div>

      {/* Main Rooms Listing Panel */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        {/* Mobile Card List — replaces the table below md so no data is hidden behind horizontal scroll */}
        <div className="md:hidden divide-y divide-[#c6c6cd]/30">
          {paginatedRooms.length > 0 ? (
            paginatedRooms.map((room) => {
              const percentCapacity = room.maxOccupants > 0
                ? Math.round((room.currentOccupants / room.maxOccupants) * 100)
                : 0;

              return (
                <div key={room.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs select-none shrink-0">
                        {room.number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-black truncate">{room.name}</p>
                        <p className="text-[10px] text-[#45464d] mt-0.5">Tầng {room.floor} · {room.wing}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${room.status === "Occupied"
                        ? "bg-[#316bf3]/10 text-[#0051d5] border-[#316bf3]/20"
                        : room.status === "Available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${room.status === "Occupied"
                          ? "bg-blue-600"
                          : room.status === "Available"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`} />
                      {roomStatusLabel(room.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#45464d] font-semibold">Giá Thuê/Tháng</span>
                    <span className="font-mono font-bold text-black">{formatVND(room.monthlyRent)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#45464d] font-semibold">Số Người</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-[#45464d]">{room.currentOccupants}/{room.maxOccupants}</span>
                      <div className="w-16 h-1.5 bg-[#eceef0] rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${room.status === "Occupied"
                              ? "bg-[#316bf3]"
                              : room.status === "Available"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          style={{ width: `${percentCapacity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#c6c6cd]/50">
                    <button
                      onClick={() => {
                        const realTenantCount = tenants.filter(t => t.roomAssignment === `Room ${room.number}`).length;

                        if (room.status === "Available") {
                          onEditRoomStatus(room.id, "Maintenance");
                          return;
                        }
                        if (room.status === "Maintenance") {
                          onEditRoomStatus(room.id, "Available");
                          return;
                        }
                        if (realTenantCount > 0) {
                          alert("Phòng vẫn còn người thuê thật. Hãy gỡ/chuyển người thuê trong mục Sửa Phòng trước khi đổi trạng thái.");
                          return;
                        }
                        onEditRoomStatus(room.id, "Maintenance");
                      }}
                      className="flex-1 px-2 py-1.5 text-[10px] border border-[#c6c6cd] hover:border-black rounded text-[#45464d] hover:text-black font-semibold cursor-pointer"
                    >
                      Đổi Trạng Thái
                    </button>
                    <button
                      onClick={() => {
                        setPayingRoom(room);
                        setReadingInput(room.lastElectricityReading || 0);
                        setBillMonthInput(currentMonthInputValue());
                        setFeeOverrides({
                          electricityPrice: utilitySettings?.electricityPrice ?? 0,
                          waterPrice: utilitySettings?.waterPrice ?? 0,
                          internetFee: utilitySettings?.internetFee ?? 0,
                          garbageFee: utilitySettings?.garbageFee ?? 0,
                          parkingFee: utilitySettings?.parkingFee ?? 0,
                          otherFee: utilitySettings?.otherFee ?? 0
                        });
                      }}
                      title="Thanh Toán Nhanh"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setSelectedTenantToAssign("");
                      }}
                      title="Sửa Phòng"
                      className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (onDeleteRoom) {
                          onDeleteRoom(room.id);
                        }
                      }}
                      title="Xóa Phòng"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
              Không tìm thấy phòng phù hợp với bộ lọc đã chọn.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] w-[20%]">Số Phòng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] w-[20%]">Trạng Thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] w-[20%]">Giá Thuê/Tháng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] w-[20%]">Số Người</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right w-[20%]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/30">
              {paginatedRooms.length > 0 ? (
                paginatedRooms.map((room) => {
                  const percentCapacity = room.maxOccupants > 0
                    ? Math.round((room.currentOccupants / room.maxOccupants) * 100)
                    : 0;

                  return (
                    <tr key={room.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs select-none">
                            {room.number}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-black">{room.name}</p>
                            <p className="text-[10px] text-[#45464d] mt-0.5">Tầng {room.floor} · {room.wing}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-28 px-2.5 py-1 rounded-full text-[10px] font-bold border ${room.status === "Occupied"
                            ? "bg-[#316bf3]/10 text-[#0051d5] border-[#316bf3]/20"
                            : room.status === "Available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${room.status === "Occupied"
                              ? "bg-blue-600"
                              : room.status === "Available"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`} />
                          {roomStatusLabel(room.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-black">
                        {formatVND(room.monthlyRent)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold font-mono text-[#45464d]">
                            {room.currentOccupants}/{room.maxOccupants}
                          </span>
                          <div className="w-16 h-1.5 bg-[#eceef0] rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${room.status === "Occupied"
                                  ? "bg-[#316bf3]"
                                  : room.status === "Available"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              style={{ width: `${percentCapacity}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Cycle room status trigger — only toggles Available <-> Maintenance.
                              Occupied is only ever set via a real tenant assignment (Edit Room modal),
                              never fabricated here, so occupant counts can't desync from real tenants. */}
                          <button
                            onClick={() => {
                              const realTenantCount = tenants.filter(t => t.roomAssignment === `Room ${room.number}`).length;

                              if (room.status === "Available") {
                                onEditRoomStatus(room.id, "Maintenance");
                                return;
                              }
                              if (room.status === "Maintenance") {
                                onEditRoomStatus(room.id, "Available");
                                return;
                              }
                              // room.status === "Occupied"
                              if (realTenantCount > 0) {
                                alert("Phòng vẫn còn người thuê thật. Hãy gỡ/chuyển người thuê trong mục Sửa Phòng trước khi đổi trạng thái.");
                                return;
                              }
                              onEditRoomStatus(room.id, "Maintenance");
                            }}
                            title="Đổi Trạng Thái"
                            className="p-1 px-2 text-[10px] items-center gap-1 border border-[#c6c6cd] hover:border-black rounded text-[#45464d] hover:text-black font-semibold cursor-pointer"
                          >
                            Đổi Trạng Thái
                          </button>
                          <button
                            onClick={() => {
                              setPayingRoom(room);
                              setReadingInput(room.lastElectricityReading || 0);
                              setBillMonthInput(currentMonthInputValue());
                              setFeeOverrides({
                                electricityPrice: utilitySettings?.electricityPrice ?? 0,
                                waterPrice: utilitySettings?.waterPrice ?? 0,
                                internetFee: utilitySettings?.internetFee ?? 0,
                                garbageFee: utilitySettings?.garbageFee ?? 0,
                                parkingFee: utilitySettings?.parkingFee ?? 0,
                                otherFee: utilitySettings?.otherFee ?? 0
                              });
                            }}
                            title="Thanh Toán Nhanh"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoom(room);
                              setSelectedTenantToAssign("");
                            }}
                            title="Sửa Phòng"
                            className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteRoom) {
                                onDeleteRoom(room.id);
                              }
                            }}
                            title="Xóa Phòng"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
                    Không tìm thấy phòng phù hợp với bộ lọc đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#c6c6cd]/50 flex items-center justify-between">
          <span className="text-xs text-[#45464d] font-semibold">
            Hiển thị {filteredRooms.length > 0 ? startIndex + 1 : 0} đến {Math.min(startIndex + itemsPerPage, filteredRooms.length)} trong {filteredRooms.length} phòng
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg border border-[#c6c6cd] bg-white text-xs text-[#45464d] hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-2.5 py-1 text-xs font-bold rounded ${currentPage === idx + 1
                    ? "bg-black text-white"
                    : "text-[#45464d] hover:bg-white"
                  }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg border border-[#c6c6cd] bg-white text-xs text-[#45464d] hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Rooms Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-600">+4.2%</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Tỷ Lệ Lấp Đầy</p>
          <p className="text-3xl font-bold text-black font-display mt-1">{occupancyRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CreditCard className="w-5 h-5 text-[#0051d5]" />
            </div>
            <span className="text-xs font-bold text-[#0051d5]">Ổn định</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider0">Tổng Doanh Thu Tiện Ích</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {formatVND(bills.reduce((sum, b) => sum + b.electricity + b.water, 0))}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs font-bold text-orange-600">3 Đang chờ</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Đang Bảo Trì</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {rooms.filter(r => r.status === "Maintenance").length.toString().padStart(2, "0")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Tổng Tiền Phòng Đã Nhận Trong Tháng</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {formatVND(totalReceivedThisMonth)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Tổng Tiền Đã Nhận Từ Trước Tới Nay</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {formatVND(totalReceivedAllTime)}
          </p>
        </div>
      </div>

      {/* Add Room Modal overlay */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-black mb-4 font-display">Tạo Phòng Mới</h3>

            <form onSubmit={handleSubmitRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Số Phòng *</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="VD: 105"
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Loại Phòng</label>
                  <select
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none cursor-pointer"
                  >
                    <option>Phòng Tiêu Chuẩn</option>
                    <option>Phòng Cao Cấp</option>
                    <option>Căn Hộ Hạng Sang</option>
                    <option>Căn Hộ Tổng Thống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Tầng</label>
                  <input
                    type="number"
                    value={roomFloor}
                    onChange={(e) => setRoomFloor(Number(e.target.value))}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Khu</label>
                  <input
                    type="text"
                    value={roomWing}
                    onChange={(e) => setRoomWing(e.target.value)}
                    placeholder="Khu Bắc"
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Số Người Tối Đa</label>
                  <input
                    type="number"
                    value={roomMaxOccupants}
                    onChange={(e) => setRoomMaxOccupants(Number(e.target.value))}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Trạng Thái</label>
                  <select
                    value={roomStatus}
                    onChange={(e) => setRoomStatus(e.target.value as RoomStatus)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none cursor-pointer"
                  >
                    <option value="Available">Còn trống</option>
                    <option value="Occupied">Đã thuê</option>
                    <option value="Maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Giá Thuê/Tháng (VND) *</label>
                <input
                  type="number"
                  value={roomRent}
                  onChange={(e) => setRoomRent(Number(e.target.value))}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 border border-[#c6c6cd] py-2.5 rounded-lg text-xs font-bold text-[#45464d] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Tạo Phòng
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Room Modal overlay */}
      {editingRoom && createPortal(
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingRoom(null)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-black mb-4 font-display">Sửa Phòng {editingRoom.number}</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateRoom) {
                  onUpdateRoom(editingRoom.id, editingRoom);
                }
                setEditingRoom(null);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Số Phòng *</label>
                  <input
                    type="text"
                    value={editingRoom.number}
                    onChange={(e) => setEditingRoom({ ...editingRoom, number: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Loại Phòng</label>
                  <select
                    value={editingRoom.name}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none cursor-pointer"
                  >
                    <option>Phòng Tiêu Chuẩn</option>
                    <option>Phòng Cao Cấp</option>
                    <option>Căn Hộ Hạng Sang</option>
                    <option>Căn Hộ Tổng Thống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Tầng</label>
                  <input
                    type="number"
                    value={editingRoom.floor}
                    onChange={(e) => setEditingRoom({ ...editingRoom, floor: Number(e.target.value) })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Khu</label>
                  <input
                    type="text"
                    value={editingRoom.wing}
                    onChange={(e) => setEditingRoom({ ...editingRoom, wing: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Số Người Tối Đa</label>
                  <input
                    type="number"
                    value={editingRoom.maxOccupants}
                    onChange={(e) => setEditingRoom({ ...editingRoom, maxOccupants: Number(e.target.value) })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Số Người Hiện Tại</label>
                  <input
                    type="number"
                    value={editingRoom.currentOccupants}
                    onChange={(e) => setEditingRoom({ ...editingRoom, currentOccupants: Number(e.target.value) })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Trạng Thái</label>
                  <select
                    value={editingRoom.status}
                    onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value as RoomStatus })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none cursor-pointer"
                  >
                    <option value="Available">Còn trống</option>
                    <option value="Occupied">Đã thuê</option>
                    <option value="Maintenance">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Giá Thuê/Tháng (VND) *</label>
                  <input
                    type="number"
                    value={editingRoom.monthlyRent}
                    onChange={(e) => setEditingRoom({ ...editingRoom, monthlyRent: Number(e.target.value) })}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Current Occupants Information Section */}
              <div className="pt-4 border-t border-[#c6c6cd]">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#45464d]">Người Thuê Hiện Tại</label>
                  <span className="text-xs font-bold bg-[#f2f4f6] border border-[#c6c6cd] px-2 py-0.5 rounded-md">
                    {tenants.filter(t => t.roomAssignment === `Room ${editingRoom.number}`).length} / {editingRoom.maxOccupants}
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {tenants.filter(t => t.roomAssignment === `Room ${editingRoom.number}`).length > 0 ? (
                    tenants.filter(t => t.roomAssignment === `Room ${editingRoom.number}`).map(tenant => (
                      <div key={tenant.id} className="flex justify-between items-center bg-[#f7f9fb] p-2 rounded-lg border border-[#c6c6cd]/50">
                        <div className="flex items-center gap-2">
                          {tenant.avatarUrl ? (
                            <img src={tenant.avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-[#c6c6cd]" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              {(tenant.name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] font-bold text-black">{tenant.name}</p>
                            <p className="text-[10px] text-[#76777d]">{tenant.phone} • CCCD: {tenant.nationalId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tenant.depositStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : tenant.depositStatus === "Partial"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                            {depositStatusLabel(tenant.depositStatus)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Bạn có chắc chắn muốn gỡ người thuê này khỏi phòng?") && onRemoveTenantFromRoom) {
                                onRemoveTenantFromRoom(editingRoom.id, tenant.id);
                                const remainingOccupants = Math.max(
                                  tenants.filter(t => t.roomAssignment === `Room ${editingRoom.number}` && t.id !== tenant.id).length,
                                  0
                                );
                                setEditingRoom({
                                  ...editingRoom,
                                  status: remainingOccupants === 0 ? "Available" : editingRoom.status,
                                  currentOccupants: remainingOccupants
                                });
                              }
                            }}
                            className="p-1 text-[#76777d] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Gỡ người thuê khỏi phòng"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#76777d] italic py-1">Chưa có người thuê nào trong phòng này.</p>
                  )}
                </div>
              </div>

              {/* Assign Tenant Section */}
              <div className="pt-4 border-t border-[#c6c6cd]">
                <label className="block text-xs font-bold text-[#45464d] mb-1">Gán Người Thuê Có Sẵn</label>
                <div className="flex gap-2">
                  <select
                    value={selectedTenantToAssign}
                    onChange={(e) => setSelectedTenantToAssign(e.target.value)}
                    className="flex-1 border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn người thuê --</option>
                    {tenants.filter(t => t.roomAssignment !== `Room ${editingRoom.number}`).map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Hiện tại: {t.roomAssignment || 'Chưa có'})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTenantToAssign && onAssignTenant) {
                        onAssignTenant(editingRoom.id, selectedTenantToAssign);
                        setSelectedTenantToAssign("");
                        // Update local editing room state to reflect the new occupant count
                        const newOccupants = Math.min(
                          tenants.filter(t => t.roomAssignment === `Room ${editingRoom.number}` && t.id !== selectedTenantToAssign).length + 1,
                          editingRoom.maxOccupants
                        );
                        setEditingRoom({
                          ...editingRoom,
                          status: "Occupied",
                          currentOccupants: newOccupants
                        });
                        alert("Gán người thuê thành công!");
                      }
                    }}
                    disabled={!selectedTenantToAssign}
                    className="bg-[#0051d5] text-white px-4 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Gán
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="flex-1 border border-[#c6c6cd] py-2.5 rounded-lg text-xs font-bold text-[#45464d] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Quick Payment Modal overlay */}
      {payingRoom && createPortal(
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPayingRoom(null)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-black mb-4 font-display">Thanh Toán Nhanh — Phòng {payingRoom.number}</h3>

            {(() => {
              const units = Math.max(0, readingInput - payingRoom.lastElectricityReading);
              const electricityAmount = Math.round(units * feeOverrides.electricityPrice);
              const waterAmount = Math.round(feeOverrides.waterPrice);
              const serviceFees = Math.round(
                feeOverrides.internetFee + feeOverrides.garbageFee + feeOverrides.parkingFee + feeOverrides.otherFee
              );
              const total = payingRoom.monthlyRent + electricityAmount + waterAmount + serviceFees;
              const isReadingValid = readingInput >= payingRoom.lastElectricityReading;

              return (
                <div className="space-y-4">
                  <div className="bg-[#f7f9fb] border border-[#c6c6cd]/50 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#45464d]">Tiền Phòng</span>
                    <span className="text-sm font-bold text-black">{formatVND(payingRoom.monthlyRent)}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Tháng Thanh Toán</label>
                    <input
                      type="month"
                      value={billMonthInput}
                      onChange={(e) => setBillMonthInput(e.target.value)}
                      className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                    />
                    <p className="text-[10px] text-[#76777d] mt-1">Chọn tháng cũ để bổ sung tiền còn thiếu của tháng đó.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Chỉ Số Điện Kỳ Trước</label>
                      <input
                        type="number"
                        value={payingRoom.lastElectricityReading}
                        readOnly
                        className="w-full border border-[#c6c6cd] bg-[#f2f4f6] rounded-lg p-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Chỉ Số Điện Hiện Tại *</label>
                      <input
                        type="number"
                        value={readingInput}
                        min={payingRoom.lastElectricityReading}
                        onChange={(e) => setReadingInput(Number(e.target.value))}
                        className={`w-full border rounded-lg p-2 text-xs focus:ring-1 outline-none ${
                          isReadingValid
                            ? "border-[#c6c6cd] focus:ring-[#0051d5]"
                            : "border-red-400 focus:ring-red-400"
                        }`}
                      />
                      {!isReadingValid && (
                        <p className="text-[10px] text-red-600 font-semibold mt-1">Chỉ số hiện tại phải lớn hơn hoặc bằng chỉ số kỳ trước.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#c6c6cd] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Đơn Giá Điện / kWh</label>
                      <input
                        type="number"
                        value={feeOverrides.electricityPrice}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, electricityPrice: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Nước (Cố Định/Tháng)</label>
                      <input
                        type="number"
                        value={feeOverrides.waterPrice}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, waterPrice: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Wifi/Tháng</label>
                      <input
                        type="number"
                        value={feeOverrides.internetFee}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, internetFee: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Rác/Tháng</label>
                      <input
                        type="number"
                        value={feeOverrides.garbageFee}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, garbageFee: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Gửi Xe/Tháng</label>
                      <input
                        type="number"
                        value={feeOverrides.parkingFee}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, parkingFee: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Khác/Tháng</label>
                      <input
                        type="number"
                        value={feeOverrides.otherFee}
                        onChange={(e) => setFeeOverrides({ ...feeOverrides, otherFee: Number(e.target.value) })}
                        className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#c6c6cd] space-y-1.5">
                    <div className="flex justify-between text-xs text-[#45464d]">
                      <span>Tiền Điện ({units} kWh)</span>
                      <span className="font-semibold text-black">{formatVND(electricityAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#45464d]">
                      <span>Tiền Nước</span>
                      <span className="font-semibold text-black">{formatVND(waterAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#45464d]">
                      <span>Phí Dịch Vụ (Wifi/Rác/Xe/Khác)</span>
                      <span className="font-semibold text-black">{formatVND(serviceFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-[#c6c6cd]">
                      <span>Tổng Cộng</span>
                      <span>{formatVND(total)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPayingRoom(null)}
                      className="flex-1 border border-[#c6c6cd] py-2.5 rounded-lg text-xs font-bold text-[#45464d] cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={!isReadingValid}
                      onClick={() => {
                        onCreateQuickBill?.(payingRoom.id, readingInput, feeOverrides, monthInputToLabel(billMonthInput));
                        setPayingRoom(null);
                      }}
                      className="flex-1 bg-black text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Xác Nhận
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
