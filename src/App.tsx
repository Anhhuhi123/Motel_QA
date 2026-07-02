/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import RoomsView from "./components/RoomsView";
import TenantsView from "./components/TenantsView";
import BillsView from "./components/BillsView";
import RegisterTenantView from "./components/RegisterTenantView";
import LoginView from "./components/LoginView";
import AccountSettingsView from "./components/AccountSettingsView";

import { Room, Tenant, Bill, ActivityLog, UtilitySettings, RoomStatus } from "./types";
import { api, ApiFetchError } from "./services/api";
import { roomStatusLabel } from "./utils";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Source of truth for occupancy is the tenants list itself (roomAssignment field),
// not a manually incremented/decremented counter — that drifts out of sync when
// assignments change concurrently.
const countRoomOccupants = (tenantsList: Tenant[], roomNumber: string) =>
  tenantsList.filter(t => t.roomAssignment === `Room ${roomNumber}`).length;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Unified Room State list
  const [rooms, setRooms] = useState<Room[]>([]);

  // 2. Tenant State list with proper avatars hotlinked
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // 3. Bill parameters
  const [utilitySettings, setUtilitySettings] = useState<UtilitySettings>({
    electricityPrice: 0,
    waterPrice: 0,
    internetFee: 0,
    garbageFee: 0,
    parkingFee: 0,
    otherFee: 0,
    autoSync: true
  });

  // 4. Invoiced bills state (can dynamically grow!)
  const [bills, setBills] = useState<Bill[]>([]);

  // 5. Activity Log list
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Hydrate Data on Load
  useEffect(() => {
    const fetchData = async () => {
      setDataError(null);
      try {
        const [
          roomsData,
          tenantsData,
          billsData,
          activityLogsData
        ] = await Promise.all([
          api.fetchRooms(),
          api.fetchTenants(),
          api.fetchBills(),
          api.fetchActivityLogs()
        ]);

        setRooms(roomsData);
        setTenants(tenantsData);
        setBills(billsData);
        setActivityLogs(activityLogsData);

        // Fetched separately: a missing/misconfigured pricing row shouldn't block
        // the rest of the app from loading, it just falls back to the default state.
        try {
          const utilitySettingsData = await api.fetchUtilitySettings();
          if (utilitySettingsData) setUtilitySettings(utilitySettingsData);
        } catch (settingsError) {
          console.error("Failed to fetch utility settings:", settingsError);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        const message = error instanceof ApiFetchError
          ? error.message
          : "Không thể kết nối tới cơ sở dữ liệu. Vui lòng thử tải lại trang.";
        setDataError(message);
      }
    };

    fetchData();
  }, []);

  // INTERACTIVE SYSTEM REDUCERS

  // A. Register New Tenant & transition Rooms status
  const handleRegisterTenant = async (newTenantData: Omit<Tenant, "id">) => {
    const newId = generateId();
    const newTenant: Tenant = {
      id: newId,
      ...newTenantData
    };

    const success = await api.createTenant(newTenant);
    if (!success) {
      alert("Không thể tạo người thuê trong cơ sở dữ liệu.");
      return;
    }

    const updatedTenants = [newTenant, ...tenants];
    setTenants(updatedTenants);

    // Automatically change associated room's status to Occupied and recompute occupants count!
    const targetRoomNumber = newTenantData.roomAssignment.replace("Room ", "");
    const targetRoom = rooms.find(r => r.number === targetRoomNumber);

    if (targetRoom) {
      const newOccupants = Math.min(countRoomOccupants(updatedTenants, targetRoom.number), targetRoom.maxOccupants);
      const roomSuccess = await api.updateRoom(targetRoom.id, {
        status: "Occupied",
        currentOccupants: newOccupants
      });

      if (roomSuccess) {
        setRooms(prevRooms => prevRooms.map(room => {
          if (room.id === targetRoom.id) {
            return {
              ...room,
              status: "Occupied",
              currentOccupants: newOccupants
            };
          }
          return room;
        }));
      }
    }

    // Generate recent activity log item
    const logItem: ActivityLog = {
      id: generateId(),
      user: newTenant.name,
      action: "đã ký hợp đồng thuê tại",
      detail: newTenant.roomAssignment,
      timeLabel: "Vừa xong",
      type: "tenant"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // B. Create a brand new Room
  const handleAddRoom = async (newRoomData: Omit<Room, "id">) => {
    const newRoom: Room = {
      id: generateId(),
      ...newRoomData
    };

    const success = await api.createRoom(newRoom);
    if (!success) {
      alert("Không thể tạo phòng trong cơ sở dữ liệu.");
      return;
    }

    setRooms(prev => [...prev, newRoom]);

    const logItem: ActivityLog = {
      id: generateId(),
      user: `Phòng ${newRoom.number}`,
      action: "đã được đăng ký với loại",
      detail: newRoom.name,
      timeLabel: "Vừa xong",
      type: "maintenance"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // C. Toggle / cycle room status (Occupied -> Maintenance -> Available)
  const handleEditRoomStatus = async (roomId: string, nextStatus: RoomStatus) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    const nextOccupants = nextStatus === "Occupied" ? (targetRoom.currentOccupants > 0 ? targetRoom.currentOccupants : 1) : 0;

    const success = await api.updateRoom(roomId, {
      status: nextStatus,
      currentOccupants: nextOccupants
    });

    if (!success) {
      alert("Không thể cập nhật trạng thái phòng trong cơ sở dữ liệu.");
      return;
    }

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          status: nextStatus,
          currentOccupants: nextOccupants
        };
      }
      return room;
    }));

    const logItem: ActivityLog = {
      id: generateId(),
      user: `Phòng ${targetRoom.number}`,
      action: "đã được cập nhật trạng thái thủ công thành",
      detail: roomStatusLabel(nextStatus),
      timeLabel: "Vừa xong",
      type: "maintenance"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // D. Save default utility pricing from the Account page
  const handleUpdateUtilitySettings = async (updates: UtilitySettings) => {
    const success = await api.updateUtilitySettings(updates);
    if (!success) {
      alert("Không thể lưu cấu hình giá tiện ích vào cơ sở dữ liệu.");
      return;
    }

    setUtilitySettings(updates);

    const logItem: ActivityLog = {
      id: generateId(),
      user: "Quản trị viên hệ thống",
      action: "đã cập nhật cấu hình giá tiện ích",
      detail: "Tài Khoản",
      timeLabel: "Vừa xong",
      type: "maintenance"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // D2. Create a quick bill for a single room from a real electricity meter reading
  const handleCreateQuickBill = async (
    roomId: string,
    currentReading: number,
    overrides: {
      electricityPrice: number;
      waterPrice: number;
      internetFee: number;
      garbageFee: number;
      parkingFee: number;
      otherFee: number;
    },
    billMonth: string
  ) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    if (currentReading < targetRoom.lastElectricityReading) {
      alert("Chỉ số điện hiện tại không được nhỏ hơn chỉ số kỳ trước.");
      return;
    }

    const monthLabel = billMonth;
    const alreadyBilled = bills.some(b => b.room === `Room ${targetRoom.number}` && b.month === monthLabel);
    if (alreadyBilled) {
      const confirmDup = window.confirm(`Phòng ${targetRoom.number} đã có hóa đơn tháng này. Vẫn tạo thêm hóa đơn mới?`);
      if (!confirmDup) return;
    }

    const units = currentReading - targetRoom.lastElectricityReading;
    const electricitySubtotal = Math.round(units * overrides.electricityPrice);
    const waterSubtotal = Math.round(overrides.waterPrice);
    const serviceFees = Math.round(overrides.internetFee + overrides.garbageFee + overrides.parkingFee + overrides.otherFee);
    const total = targetRoom.monthlyRent + electricitySubtotal + waterSubtotal + serviceFees;

    const newBill: Bill = {
      id: generateId(),
      room: `Room ${targetRoom.number}`,
      month: monthLabel,
      electricity: electricitySubtotal,
      water: waterSubtotal,
      rent: targetRoom.monthlyRent,
      total,
      status: "Pending",
      electricityUnits: units,
      previousElectricityReading: targetRoom.lastElectricityReading,
      currentElectricityReading: currentReading,
      internetFee: overrides.internetFee,
      garbageFee: overrides.garbageFee,
      parkingFee: overrides.parkingFee,
      otherFee: overrides.otherFee
    };

    const billSuccess = await api.createBill(newBill);
    if (!billSuccess) {
      alert("Không thể tạo hóa đơn trong cơ sở dữ liệu.");
      return;
    }

    const roomSuccess = await api.updateRoom(targetRoom.id, { lastElectricityReading: currentReading });
    if (!roomSuccess) {
      alert("Đã tạo hóa đơn nhưng không thể cập nhật chỉ số điện mới của phòng.");
    }

    setBills(prev => [newBill, ...prev]);
    setRooms(prev => prev.map(room => (
      room.id === targetRoom.id ? { ...room, lastElectricityReading: currentReading } : room
    )));

    const logItem: ActivityLog = {
      id: generateId(),
      user: `Phòng ${targetRoom.number}`,
      action: "đã được lập hóa đơn nhanh cho",
      detail: monthLabel,
      timeLabel: "Vừa xong",
      type: "payment",
      amount: total
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);

    setCurrentView("bills");
  };

  // E. Change bill status of a target room
  const handleMarkBillPaid = async (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const success = await api.updateBill(billId, { status: "Paid" });
    if (!success) {
      alert("Không thể cập nhật trạng thái hóa đơn vào cơ sở dữ liệu.");
      return;
    }

    setBills(prev => prev.map(b => (b.id === billId ? { ...b, status: "Paid" } : b)));

    const logItem: ActivityLog = {
      id: generateId(),
      user: `Người thuê ${bill.room}`,
      action: "đã thanh toán tiền thuê cho",
      detail: bill.month,
      timeLabel: "Vừa xong",
      type: "payment",
      amount: bill.total
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // F. Trigger notification simulator mail Notice dispatch
  const handleSendNotice = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      alert(`Đã gửi thông báo hóa đơn điện tử qua email!\n\nĐến: Người thuê tại ${bill.room}\nVề việc: Hóa đơn ${bill.month}\nSố tiền cần thanh toán: ${bill.total.toLocaleString()} VND`);

      const logItem: ActivityLog = {
        id: generateId(),
        user: "Hệ thống gửi mail",
        action: "đã gửi thông báo nhắc nhở đến",
        detail: `người thuê tại ${bill.room}`,
        timeLabel: "Vừa xong",
        type: "alert"
      };
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // G. Update Room Details
  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    const success = await api.updateRoom(roomId, updates);
    if (!success) {
      alert("Không thể cập nhật thông tin phòng trong cơ sở dữ liệu.");
      return;
    }

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, ...updates };
      }
      return room;
    }));
  };

  // H. Assign Existing Tenant to a Room
  const handleAssignTenant = async (roomId: string, tenantId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    const targetTenant = tenants.find(t => t.id === tenantId);

    if (targetRoom && targetTenant) {
      const previousRoomNumber = targetTenant.roomAssignment.replace("Room ", "");
      const previousRoom = previousRoomNumber && previousRoomNumber !== targetRoom.number
        ? rooms.find(r => r.number === previousRoomNumber)
        : undefined;

      const updatedTenants = tenants.map(t =>
        t.id === tenantId ? { ...t, roomAssignment: `Room ${targetRoom.number}` } : t
      );
      const newOccupants = Math.min(countRoomOccupants(updatedTenants, targetRoom.number), targetRoom.maxOccupants);
      const previousOccupants = previousRoom ? countRoomOccupants(updatedTenants, previousRoom.number) : 0;
      const previousStatus = previousRoom ? (previousOccupants === 0 ? "Available" : previousRoom.status) : undefined;

      const roomUpdates = [api.updateRoom(roomId, { status: "Occupied", currentOccupants: newOccupants })];
      if (previousRoom) {
        roomUpdates.push(api.updateRoom(previousRoom.id, { status: previousStatus, currentOccupants: previousOccupants }));
      }

      const [tenantSuccess, ...roomSuccesses] = await Promise.all([
        api.updateTenant(tenantId, { roomAssignment: `Room ${targetRoom.number}` }),
        ...roomUpdates
      ]);

      if (!tenantSuccess || roomSuccesses.some(success => !success)) {
        alert("Không thể gán người thuê vào phòng trong cơ sở dữ liệu.");
        return;
      }

      setTenants(updatedTenants);

      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: "Occupied",
            currentOccupants: newOccupants
          };
        }
        if (previousRoom && room.id === previousRoom.id) {
          return {
            ...room,
            status: previousStatus!,
            currentOccupants: previousOccupants
          };
        }
        return room;
      }));

      const logItem: ActivityLog = {
        id: generateId(),
        user: targetTenant.name,
        action: "đã được chuyển đến",
        detail: `Phòng ${targetRoom.number}`,
        timeLabel: "Vừa xong",
        type: "tenant"
      };
      await api.createActivityLog(logItem);
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // I. Remove Tenant from Room
  const handleRemoveTenantFromRoom = async (roomId: string, tenantId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    const targetTenant = tenants.find(t => t.id === tenantId);

    if (targetRoom && targetTenant) {
      const updatedTenants = tenants.map(t =>
        t.id === tenantId ? { ...t, roomAssignment: "" } : t
      );
      const newOccupants = countRoomOccupants(updatedTenants, targetRoom.number);
      const newStatus = newOccupants === 0 ? "Available" : targetRoom.status;

      const [tenantSuccess, roomSuccess] = await Promise.all([
        api.updateTenant(tenantId, { roomAssignment: "" }),
        api.updateRoom(roomId, { status: newStatus, currentOccupants: newOccupants })
      ]);

      if (!tenantSuccess || !roomSuccess) {
        alert("Không thể gỡ người thuê khỏi phòng trong cơ sở dữ liệu.");
        return;
      }

      setTenants(updatedTenants);

      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: newStatus,
            currentOccupants: newOccupants
          };
        }
        return room;
      }));

      const logItem: ActivityLog = {
        id: generateId(),
        user: targetTenant.name,
        action: "đã được gỡ khỏi",
        detail: `Phòng ${targetRoom.number}`,
        timeLabel: "Vừa xong",
        type: "tenant"
      };
      await api.createActivityLog(logItem);
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // J. Delete a Room
  const handleDeleteRoom = async (roomId: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.");
    if (!confirmDelete) return;

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    // Optional: check if room is occupied and warn
    if (targetRoom.currentOccupants > 0) {
      alert("Không thể xóa phòng đang có người thuê. Vui lòng gỡ hoặc chuyển người thuê trước.");
      return;
    }

    const success = await api.deleteRoom(roomId);
    if (!success) {
      alert("Không thể xóa phòng khỏi cơ sở dữ liệu.");
      return;
    }

    setRooms(prev => prev.filter(r => r.id !== roomId));

    const logItem: ActivityLog = {
      id: generateId(),
      user: "Quản trị viên hệ thống",
      action: "đã xóa phòng",
      detail: `Phòng ${targetRoom.number}`,
      timeLabel: "Vừa xong",
      type: "alert"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // Routing render helper
  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            rooms={rooms}
            tenants={tenants}
            bills={bills}
            activityLogs={activityLogs}
            onNavigate={setCurrentView}
          />
        );
      case "rooms":
        return (
          <RoomsView
            rooms={rooms}
            bills={bills}
            tenants={tenants}
            searchQuery={globalSearch}
            utilitySettings={utilitySettings}
            onAddRoom={handleAddRoom}
            onEditRoomStatus={handleEditRoomStatus}
            onUpdateRoom={handleUpdateRoom}
            onAssignTenant={handleAssignTenant}
            onRemoveTenantFromRoom={handleRemoveTenantFromRoom}
            onDeleteRoom={handleDeleteRoom}
            onCreateQuickBill={handleCreateQuickBill}
            onNavigate={setCurrentView}
          />
        );
      case "tenants":
        return (
          <TenantsView
            tenants={tenants}
            rooms={rooms}
            searchQuery={globalSearch}
            onRemoveTenant={async (tenantId) => {
              const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa người thuê này?");
              if (!confirmDelete) return;

              const tenantToRemove = tenants.find(t => t.id === tenantId);

              const success = await api.deleteTenant(tenantId);
              if (!success) {
                alert("Không thể xóa người thuê khỏi cơ sở dữ liệu.");
                return;
              }

              const updatedTenants = tenants.filter(t => t.id !== tenantId);
              setTenants(updatedTenants);

              // Decrease occupants in their room if assigned
              if (tenantToRemove && tenantToRemove.roomAssignment) {
                const roomNumber = tenantToRemove.roomAssignment.replace("Room ", "");
                const targetRoom = rooms.find(r => r.number === roomNumber);
                if (targetRoom) {
                  const newOccupants = countRoomOccupants(updatedTenants, targetRoom.number);
                  const newStatus = newOccupants === 0 ? "Available" : targetRoom.status;

                  await api.updateRoom(targetRoom.id, { currentOccupants: newOccupants, status: newStatus });

                  setRooms(prevRooms => prevRooms.map(room => {
                    if (room.id === targetRoom.id) {
                      return {
                        ...room,
                        currentOccupants: newOccupants,
                        status: newStatus
                      };
                    }
                    return room;
                  }));
                }
              }

              // Log removal
              const logItem: ActivityLog = {
                id: generateId(),
                user: "Quản trị viên hệ thống",
                action: "đã xóa người thuê",
                detail: tenantToRemove?.name || tenantId,
                timeLabel: "Vừa xong",
                type: "alert"
              };
              await api.createActivityLog(logItem);
              setActivityLogs(prev => [logItem, ...prev]);
            }}
            onNavigate={setCurrentView}
          />
        );
      case "bills":
        return (
          <BillsView
            bills={bills}
            rooms={rooms}
            utilitySettings={utilitySettings}
            searchQuery={globalSearch}
            onMarkBillPaid={handleMarkBillPaid}
            onSendNotice={handleSendNotice}
          />
        );
      case "account":
        return (
          <AccountSettingsView
            utilitySettings={utilitySettings}
            onUpdateUtilitySettings={handleUpdateUtilitySettings}
          />
        );
      case "register":
        return (
          <RegisterTenantView
            rooms={rooms}
            onRegister={handleRegisterTenant}
            onNavigate={setCurrentView}
          />
        );
      default:
        return (
          <DashboardView
            rooms={rooms}
            tenants={tenants}
            bills={bills}
            activityLogs={activityLogs}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-black rounded-xl mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div id="propria-layout-root" className="min-h-screen bg-[#f7f9fb] flex select-none text-black">
      {/* Sidebar Navigation Panel */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setGlobalSearch(""); // clear search on navigation
        }}
      />

      {/* Global Header and Content Layout */}
      <div className="flex-1 pl-[240px] flex flex-col min-h-screen">
        <Header
          currentView={currentView}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Render View Container */}
        <main className="flex-grow pt-24 px-8 pb-12 overflow-y-auto">
          {dataError && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <span>{dataError}</span>
              <button
                onClick={() => setDataError(null)}
                className="shrink-0 font-medium text-red-700 hover:text-red-900"
              >
                Đóng
              </button>
            </div>
          )}
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
