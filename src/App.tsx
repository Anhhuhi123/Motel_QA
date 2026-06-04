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
  const handleRegisterTenant = (newTenantData: Omit<Tenant, "id">) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      id: newId,
      ...newTenantData
    };

    setTenants(prev => [newTenant, ...prev]);

    // Automatically change associated room's status to Occupied and increment occupants counts!
    const targetRoomNumber = newTenantData.roomAssignment.replace("Room ", "");
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.number === targetRoomNumber) {
        return {
          ...room,
          status: "Occupied",
          currentOccupants: Math.min(room.currentOccupants + 1, room.maxOccupants)
        };
      }
      return room;
    }));

    // Generate recent activity log item
    const logItem: ActivityLog = {
      id: `log-${Date.now()}`,
      user: newTenant.name,
      action: "enrolled contract agreement in",
      detail: newTenant.roomAssignment,
      timeLabel: "Just now",
      type: "tenant"
    };
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // B. Create a brand new Room
  const handleAddRoom = (newRoomData: Omit<Room, "id">) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      ...newRoomData
    };
    setRooms(prev => [...prev, newRoom]);

    const logItem: ActivityLog = {
      id: `log-${Date.now()}`,
      user: `Room ${newRoom.number}`,
      action: "category registered as",
      detail: newRoom.name,
      timeLabel: "Just now",
      type: "maintenance"
    };
    setActivityLogs(prev => [logItem, ...prev]);
  };

  // C. Toggle / cycle room status (Occupied -> Maintenance -> Available)
  const handleEditRoomStatus = (roomId: string, nextStatus: RoomStatus) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          status: nextStatus,
          // Clear occupants if status goes to Available or Maintenance
          currentOccupants: nextStatus === "Occupied" ? room.currentOccupants || 1 : 0
        };
      }
      return room;
    }));

    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const logItem: ActivityLog = {
        id: `log-${Date.now()}`,
        user: `Room ${room.number}`,
        action: "status updated manually to",
        detail: nextStatus,
        timeLabel: "Just now",
        type: "maintenance"
      };
      setActivityLogs(prev => [logItem, ...prev]);
    }
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
            searchQuery={globalSearch}
            onAddRoom={handleAddRoom}
            onEditRoomStatus={handleEditRoomStatus}
          />
        );
      case "tenants":
        return (
          <TenantsView 
            tenants={tenants}
            rooms={rooms}
            searchQuery={globalSearch}
            onRemoveTenant={(tenantId) => {
              setTenants(prev => prev.filter(t => t.id !== tenantId));
              // Log removal
              const logItem: ActivityLog = {
                id: `log-${Date.now()}`,
                user: "System Admin",
                action: "evicted tenant ID",
                detail: tenantId,
                timeLabel: "Just now",
                type: "alert"
              };
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
