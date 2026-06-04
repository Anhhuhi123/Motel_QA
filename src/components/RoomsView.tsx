/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  ArrowRight, 
  CheckCircle, 
  CreditCard, 
  Wrench, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  X
} from "lucide-react";
import { Room, RoomStatus, Bill } from "../types";
import { formatVND } from "../utils";

interface RoomsViewProps {
  rooms: Room[];
  bills?: Bill[];
  searchQuery: string;
  onAddRoom: (room: Omit<Room, "id">) => void;
  onEditRoomStatus: (roomId: string, status: RoomStatus) => void;
}

export default function RoomsView({ 
  rooms = [], 
  bills = [],
  searchQuery: headerSearchQuery,
  onAddRoom,
  onEditRoomStatus
}: RoomsViewProps) {
  const [localSearch, setLocalSearch] = useState("");

  const occupiedRoomsCount = rooms.filter(r => r.status === "Occupied").length;
  const occupancyRate = rooms.length > 0 
    ? Math.round((occupiedRoomsCount / rooms.length) * 100) 
    : 0;
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedProperty, setSelectedProperty] = useState("All Properties");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New room form state
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("Standard Studio");
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomWing, setRoomWing] = useState("North Wing");
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("Available");
  const [roomMaxOccupants, setRoomMaxOccupants] = useState(2);
  const [roomRent, setRoomRent] = useState(4500000);

  // Clear filters function
  const handleClearFilters = () => {
    setLocalSearch("");
    setSelectedStatus("All Status");
    setSelectedProperty("All Properties");
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
      selectedStatus === "All Status" || 
      room.status === selectedStatus;

    // Property matching (we can map floor context as property category for mock)
    const matchesProperty = 
      selectedProperty === "All Properties" ||
      (selectedProperty === "Grand Plaza" && room.floor === 1) ||
      (selectedProperty === "North Lofts" && room.floor === 2) ||
      (selectedProperty === "Riverside" && room.floor >= 3);

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
      monthlyRent: Number(roomRent)
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
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Rooms</h2>
          <p className="text-xs text-[#45464d] mt-1">Total {rooms.length} rooms across managed properties</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Room</span>
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
            placeholder="Filter by room number or wing..."
            className="w-full bg-[#f2f4f6] border border-transparent rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Status:</label>
          <select 
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>All Status</option>
            <option>Occupied</option>
            <option>Available</option>
            <option>Maintenance</option>
          </select>
        </div>

        {/* Property Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Property:</label>
          <select 
            value={selectedProperty}
            onChange={(e) => { setSelectedProperty(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>All Properties</option>
            <option>Grand Plaza</option>
            <option>North Lofts</option>
            <option>Riverside</option>
          </select>
        </div>

        {/* Clear Trigger */}
        {(localSearch || selectedStatus !== "All Status" || selectedProperty !== "All Properties") && (
          <button 
            onClick={handleClearFilters}
            className="text-[#0051d5] text-xs font-bold hover:underline px-2 cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Rooms Listing Panel */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Room Number</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Monthly Rent</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Occupants</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right">Actions</th>
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
                            <p className="text-[10px] text-[#45464d] mt-0.5">Floor {room.floor} · {room.wing}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          room.status === "Occupied" 
                            ? "bg-[#316bf3]/10 text-[#0051d5] border-[#316bf3]/20" 
                            : room.status === "Available" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            room.status === "Occupied" 
                              ? "bg-blue-600" 
                              : room.status === "Available" 
                                ? "bg-emerald-500" 
                                : "bg-red-500"
                          }`} />
                          {room.status}
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
                              className={`h-full rounded-full transition-all duration-300 ${
                                room.status === "Occupied" 
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
                          {/* Cycle room status trigger for interactivity */}
                          <button 
                            onClick={() => {
                              const nextStatusMap: Record<RoomStatus, RoomStatus> = {
                                "Available": "Occupied",
                                "Occupied": "Maintenance",
                                "Maintenance": "Available"
                              };
                              onEditRoomStatus(room.id, nextStatusMap[room.status]);
                            }}
                            title="Cycle Room Status"
                            className="p-1 px-2 text-[10px] items-center gap-1 border border-[#c6c6cd] hover:border-black rounded text-[#45464d] hover:text-black font-semibold"
                          >
                            Cycle Status
                          </button>
                          <button className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-white rounded transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-white rounded transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
                    No matching rooms detected with selected specifications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#c6c6cd]/50 flex items-center justify-between">
          <span className="text-xs text-[#45464d] font-semibold">
            Showing {filteredRooms.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
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
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  currentPage === idx + 1 
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-600">+4.2%</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Occupancy Rate</p>
          <p className="text-3xl font-bold text-black font-display mt-1">{occupancyRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CreditCard className="w-5 h-5 text-[#0051d5]" />
            </div>
            <span className="text-xs font-bold text-[#0051d5]">Stable</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider0">Total Utility Revenue</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {formatVND(bills.reduce((sum, b) => sum + b.electricity + b.water, 0))}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] hover:border-black/20 transition-all shadow-2xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs font-bold text-orange-600">3 Pending</span>
          </div>
          <p className="text-[#45464d] text-[10px] uppercase font-bold tracking-wider">Under Maintenance</p>
          <p className="text-3xl font-bold text-black font-display mt-1">
            {rooms.filter(r => r.status === "Maintenance").length.toString().padStart(2, "0")}
          </p>
        </div>

        {/* Ready to Lease CTA Card */}
        <div className="relative overflow-hidden bg-black text-white p-6 rounded-xl border border-[#c6c6cd] group shadow-sm flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-white/10 rounded-lg text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">Ready to Lease</p>
            <p className="text-3xl font-bold text-white font-display mt-1">
              {rooms.filter(r => r.status === "Available").length.toString().padStart(2, "0")}
            </p>
          </div>
          <button 
            onClick={() => { setSelectedStatus("Available"); setCurrentPage(1); }}
            className="inline-flex items-center text-xs font-bold text-emerald-400 mt-4 hover:text-white transition-colors"
          >
            <span>Review Listings</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Add Room Modal overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-black mb-4 font-display">Create New Room</h3>
            
            <form onSubmit={handleSubmitRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Room Number *</label>
                  <input 
                    type="text" 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)} 
                    placeholder="e.g. 105" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Room Type</label>
                  <select 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  >
                    <option>Standard Studio</option>
                    <option>Deluxe Suite</option>
                    <option>Executive Loft</option>
                    <option>Presidential Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Floor Level</label>
                  <input 
                    type="number" 
                    value={roomFloor} 
                    onChange={(e) => setRoomFloor(Number(e.target.value))} 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Wing Sector</label>
                  <input 
                    type="text" 
                    value={roomWing} 
                    onChange={(e) => setRoomWing(e.target.value)} 
                    placeholder="North Wing" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Max Occupants</label>
                  <input 
                    type="number" 
                    value={roomMaxOccupants} 
                    onChange={(e) => setRoomMaxOccupants(Number(e.target.value))} 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Status</label>
                  <select 
                    value={roomStatus}
                    onChange={(e) => setRoomStatus(e.target.value as RoomStatus)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Monthly Rent (VND) *</label>
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
                  className="flex-1 border border-[#c6c6cd] py-2.5 rounded-lg text-xs font-bold text-[#45464d]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-xs font-bold"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
