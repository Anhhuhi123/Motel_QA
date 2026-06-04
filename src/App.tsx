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
import TemplatesView from "./components/TemplatesView";
import RegisterTenantView from "./components/RegisterTenantView";
import LoginView from "./components/LoginView";

import { Room, Tenant, Bill, ActivityLog, UtilitySettings, DocumentTemplate, RoomStatus } from "./types";
import { api } from "./services/api";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

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

  // 6. Templates
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);

  // Hydrate Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          roomsData,
          tenantsData,
          billsData,
          activityLogsData,
          utilitySettingsData,
          templatesData
        ] = await Promise.all([
          api.fetchRooms(),
          api.fetchTenants(),
          api.fetchBills(),
          api.fetchActivityLogs(),
          api.fetchUtilitySettings(),
          api.fetchTemplates()
        ]);

        setRooms(roomsData);
        setTenants(tenantsData);
        setBills(billsData);
        setActivityLogs(activityLogsData);
        if (utilitySettingsData) setUtilitySettings(utilitySettingsData);
        setTemplates(templatesData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchData();
  }, []);

  // INTERACTIVE SYSTEM REDUCERS

  // A. Register New Tenant & transition Rooms status
  const handleRegisterTenant = async (newTenantData: Omit<Tenant, "id">) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      id: newId,
      ...newTenantData
    };

    const success = await api.createTenant(newTenant);
    if (!success) {
      alert("Failed to create tenant in database");
      return;
    }

    setTenants(prev => [newTenant, ...prev]);

    // Automatically change associated room's status to Occupied and increment occupants counts!
    const targetRoomNumber = newTenantData.roomAssignment.replace("Room ", "");
    const targetRoom = rooms.find(r => r.number === targetRoomNumber);

    if (targetRoom) {
      const newOccupants = Math.min(targetRoom.currentOccupants + 1, targetRoom.maxOccupants);
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
      id: `log-${Date.now()}`,
      user: newTenant.name,
      action: "enrolled contract agreement in",
      detail: newTenant.roomAssignment,
      timeLabel: "Just now",
      type: "tenant"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // B. Create a brand new Room
  const handleAddRoom = async (newRoomData: Omit<Room, "id">) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      ...newRoomData
    };

    const success = await api.createRoom(newRoom);
    if (!success) {
      alert("Failed to create room in database");
      return;
    }

    setRooms(prev => [...prev, newRoom]);

    const logItem: ActivityLog = {
      id: `log-${Date.now()}`,
      user: `Room ${newRoom.number}`,
      action: "category registered as",
      detail: newRoom.name,
      timeLabel: "Just now",
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
      alert("Failed to update room status in database");
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
      id: `log-${Date.now()}`,
      user: `Room ${targetRoom.number}`,
      action: "status updated manually to",
      detail: nextStatus,
      timeLabel: "Just now",
      type: "maintenance"
    };
    await api.createActivityLog(logItem);
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // D. Create Room/Utility pricing settings parameters
  const handleUpdateUtilitySettings = (newSettings: UtilitySettings) => {
    setUtilitySettings(newSettings);

    const logItem: ActivityLog = {
      id: `log-${Date.now()}`,
      user: "System Admin",
      action: "updated pricing coefficients for",
      detail: "electricity limits and water indices",
      timeLabel: "Just now",
      type: "alert"
    };
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // E. Dynamic billing simulator generator
  const handleGenerateBills = () => {
    const newAugustBills: Bill[] = [];

    // Scan all occupied rooms
    rooms.forEach(room => {
      if (room.status === "Occupied") {
        // Prevent creating duplicating bills for August 2026 this session
        const alreadyBilled = bills.some(b => b.room === `Room ${room.number}` && b.month === "August 2026");
        if (!alreadyBilled) {
          // Calculate water and elec parameters based on multipliers inside Settings
          // Simulate standard unit multipliers
          const simulatedElecUnits = Math.round(100 + Math.random() * 150); // e.g. 150 kWh
          const simulatedWaterCapacity = Math.round(5 + Math.random() * 10); // e.g. 10 m3

          const elecSubtotal = Math.round(simulatedElecUnits * utilitySettings.electricityPrice);
          const waterSubtotal = Math.round(simulatedWaterCapacity * utilitySettings.waterPrice);

          const totalFee = room.monthlyRent + elecSubtotal + waterSubtotal + utilitySettings.internetFee + utilitySettings.garbageFee;

          newAugustBills.push({
            id: `bill-${Date.now()}-${room.number}`,
            room: `Room ${room.number}`,
            month: "August 2026",
            electricity: elecSubtotal,
            water: waterSubtotal,
            rent: room.monthlyRent,
            total: Math.round(totalFee),
            status: "Pending" // Starts as Pending
          });
        }
      }
    });

    if (newAugustBills.length > 0) {
      setBills(prev => [...newAugustBills, ...prev]);

      const logItem: ActivityLog = {
        id: `log-${Date.now()}`,
        user: "Compute Engine",
        action: "automatically calculated invoices for",
        detail: `${newAugustBills.length} active room occupants`,
        timeLabel: "Just now",
        type: "payment"
      };
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // F. Change bill status of a target room
  const handleMarkBillPaid = (billId: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          status: "Paid"
        };
      }
      return bill;
    }));

    const bill = bills.find(b => b.id === billId);
    if (bill) {
      const logItem: ActivityLog = {
        id: `log-${Date.now()}`,
        user: `Tenant ${bill.room}`,
        action: "recorded payment for rent in",
        detail: bill.month,
        timeLabel: "Just now",
        type: "payment",
        amount: bill.total
      };
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // G. Trigger notification simulator mail Notice dispatch
  const handleSendNotice = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      alert(`Dispatching digital invoice notice via standard SMTP registry!\n\nTo: Tenant inside ${bill.room}\nRegarding: Statement for ${bill.month}\nStatement Balance Due: ${bill.total.toLocaleString()} VND`);

      const logItem: ActivityLog = {
        id: `log-${Date.now()}`,
        user: "Mail Server",
        action: "dispatched warning notification backsheet to",
        detail: `lessee of ${bill.room}`,
        timeLabel: "Just now",
        type: "alert"
      };
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // H. Update Room Details
  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    const success = await api.updateRoom(roomId, updates);
    if (!success) {
      alert("Failed to update room in database");
      return;
    }

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, ...updates };
      }
      return room;
    }));
  };

  // I. Assign Existing Tenant to a Room
  const handleAssignTenant = async (roomId: string, tenantId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    const targetTenant = tenants.find(t => t.id === tenantId);

    if (targetRoom && targetTenant) {
      const newOccupants = Math.min(targetRoom.currentOccupants + 1, targetRoom.maxOccupants);

      const [tenantSuccess, roomSuccess] = await Promise.all([
        api.updateTenant(tenantId, { roomAssignment: `Room ${targetRoom.number}` }),
        api.updateRoom(roomId, { status: "Occupied", currentOccupants: newOccupants })
      ]);

      if (!tenantSuccess || !roomSuccess) {
        alert("Failed to assign tenant in database");
        return;
      }

      setTenants(prev => prev.map(t => {
        if (t.id === tenantId) {
          return { ...t, roomAssignment: `Room ${targetRoom.number}` };
        }
        return t;
      }));

      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: "Occupied",
            currentOccupants: newOccupants
          };
        }
        return room;
      }));

      const logItem: ActivityLog = {
        id: `log-${Date.now()}`,
        user: targetTenant.name,
        action: "was reassigned to",
        detail: `Room ${targetRoom.number}`,
        timeLabel: "Just now",
        type: "tenant"
      };
      await api.createActivityLog(logItem);
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // J. Remove Tenant from Room
  const handleRemoveTenantFromRoom = async (roomId: string, tenantId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    const targetTenant = tenants.find(t => t.id === tenantId);
    
    if (targetRoom && targetTenant) {
      const newOccupants = Math.max(targetRoom.currentOccupants - 1, 0);
      const newStatus = newOccupants === 0 ? "Available" : targetRoom.status;
      
      const [tenantSuccess, roomSuccess] = await Promise.all([
        api.updateTenant(tenantId, { roomAssignment: "" }),
        api.updateRoom(roomId, { status: newStatus, currentOccupants: newOccupants })
      ]);

      if (!tenantSuccess || !roomSuccess) {
        alert("Failed to remove tenant in database");
        return;
      }

      setTenants(prev => prev.map(t => {
        if (t.id === tenantId) {
          return { ...t, roomAssignment: "" };
        }
        return t;
      }));

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
        id: `log-${Date.now()}`,
        user: targetTenant.name,
        action: "was removed from",
        detail: `Room ${targetRoom.number}`,
        timeLabel: "Just now",
        type: "tenant"
      };
      await api.createActivityLog(logItem);
      setActivityLogs(prev => [logItem, ...prev]);
    }
  };

  // K. Delete a Room
  const handleDeleteRoom = async (roomId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room? This action cannot be undone.");
    if (!confirmDelete) return;

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    // Optional: check if room is occupied and warn
    if (targetRoom.currentOccupants > 0) {
      alert("Cannot delete an occupied room. Please remove or reassign tenants first.");
      return;
    }

    const success = await api.deleteRoom(roomId);
    if (!success) {
      alert("Failed to delete room from database");
      return;
    }

    setRooms(prev => prev.filter(r => r.id !== roomId));

    const logItem: ActivityLog = {
      id: `log-${Date.now()}`,
      user: "System Admin",
      action: "deleted room",
      detail: `Room ${targetRoom.number}`,
      timeLabel: "Just now",
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
            onAddRoom={handleAddRoom}
            onEditRoomStatus={handleEditRoomStatus}
            onUpdateRoom={handleUpdateRoom}
            onAssignTenant={handleAssignTenant}
            onRemoveTenantFromRoom={handleRemoveTenantFromRoom}
            onDeleteRoom={handleDeleteRoom}
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
              const confirmDelete = window.confirm("Are you sure you want to remove this tenant?");
              if (!confirmDelete) return;

              const tenantToRemove = tenants.find(t => t.id === tenantId);

              const success = await api.deleteTenant(tenantId);
              if (!success) {
                alert("Failed to delete tenant from database");
                return;
              }

              setTenants(prev => prev.filter(t => t.id !== tenantId));

              // Decrease occupants in their room if assigned
              if (tenantToRemove && tenantToRemove.roomAssignment) {
                const roomNumber = tenantToRemove.roomAssignment.replace("Room ", "");
                const targetRoom = rooms.find(r => r.number === roomNumber);
                if (targetRoom) {
                  const newOccupants = Math.max((targetRoom.currentOccupants || 1) - 1, 0);
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
                id: `log-${Date.now()}`,
                user: "System Admin",
                action: "evicted tenant",
                detail: tenantToRemove?.name || tenantId,
                timeLabel: "Just now",
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
            onGenerateBills={handleGenerateBills}
            onMarkBillPaid={handleMarkBillPaid}
            onSendNotice={handleSendNotice}
          />
        );
      case "templates":
      case "settings":
        return (
          <TemplatesView
            templates={templates}
            utilitySettings={utilitySettings}
            activityLogs={activityLogs}
            onUpdateUtilitySettings={handleUpdateUtilitySettings}
            onNavigate={setCurrentView}
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
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
