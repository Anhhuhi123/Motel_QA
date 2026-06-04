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
  const [rooms, setRooms] = useState<Room[]>([
    { id: "room-101", number: "101", name: "Standard Studio", floor: 1, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 2, monthlyRent: 4500000 },
    { id: "room-102", number: "102", name: "Standard Studio", floor: 1, wing: "North Wing", status: "Available", maxOccupants: 2, currentOccupants: 0, monthlyRent: 4500000 },
    { id: "room-103", number: "103", name: "Deluxe Suite", floor: 1, wing: "East Wing", status: "Maintenance", maxOccupants: 1, currentOccupants: 0, monthlyRent: 5000000 },
    { id: "room-201", number: "201", name: "Executive Loft", floor: 2, wing: "Penthouse", status: "Occupied", maxOccupants: 1, currentOccupants: 1, monthlyRent: 12000000 },
    { id: "room-202", number: "202", name: "Standard Studio", floor: 2, wing: "East Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 4500000 },
    { id: "room-205", number: "205", name: "Executive Studio", floor: 2, wing: "North Wing", status: "Maintenance", maxOccupants: 2, currentOccupants: 0, monthlyRent: 7500000 },
    { id: "room-301", number: "301", name: "Deluxe Studio", floor: 3, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 8500000 },
    { id: "room-405", number: "405", name: "Executive Loft", floor: 4, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 12000000 },
  ]);

  // 2. Tenant State list with proper avatars hotlinked
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: "t-1",
      name: "Alice Johnson",
      email: "alice.j@example.com",
      nationalId: "CCCD-037095034",
      phone: "+1 (555) 012-3456",
      roomAssignment: "Room 101",
      contractStart: "2023-10-12",
      depositStatus: "Paid",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8T7k0HMSeRhP1TgvrYVAqiqo0bl875X8CPFo35ztLmlQNbLcRC2V-OQoegkdTtWB9NCZ1q8KoxpgZ9cJfFvn_Vj-TTw7tY80uSnHAeBwKyKHdHjYtKFIrJjeX6l_E3EX7kIwdu0DN3Z2-4Cv5Q2e53BIPsmepX1y3jD5w00-YMXdy7pRDo4twCNVRmpsuyX7nOHuHqWKE0Q7eHg324xyfJQ_IczuFb1V5NpxVthNDxOJpxj1T-1-pwDkIxZyXcVCc1L8_pciqroI"
    },
    {
      id: "t-2",
      name: "David Chen",
      email: "d.chen@corporate.io",
      nationalId: "CCCD-091093121",
      phone: "+1 (555) 234-5678",
      roomAssignment: "Room 405",
      contractStart: "2024-01-05",
      depositStatus: "Paid",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk5uDMvGGnMApw87iepvFtmkUuAz_5SjJOS6GlwAM-xMg-W6JK_6xrFiH-mHwcsl7iF0zIEIGlSpYbkh4H7dfPC3uoTw8JzYycZeepjTFDBNEsonDoJG_xVe821as7RLuCBpbuepDbLmzxs9GQxWuBZOrLVreS8AYnf5xUep8F4g0mVMYCPInB8XLXyWXkrnm7pj3NuL1NtSV4RmCw-bBLJr8gO8VJqCn3Y9nBQdMG1sKxcNbIuZLbN0DbS49R3pBx3EH3CwjGDAI"
    },
    {
      id: "t-3",
      name: "Sarah Miller",
      email: "sarah.m@webmail.com",
      nationalId: "CCCD-012015993",
      phone: "+1 (555) 345-6789",
      roomAssignment: "Room 301",
      contractStart: "2023-11-22",
      depositStatus: "Partial",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs3f-fNTd4iRiJfISbOO-3H5S-iVc2FIxNllps1Z2vrREnQIxTq_GAOdzEDBXPTWO8ZaMt3DA6IVLAH7-ict26whVg0VCOFAQkDjtzr8NCwHApwAfHBS7sY3EN5KaqOE5txz3pMug_8negdEzgFixoQ3b9gZ-IwF8RBsh06w7uStAQbFZupsHZUJ_Uv-uiwdBwt-TPJjFfKc_1p_8CDjf426faWmac0mZzm5P-QBdmf_QNsvWIDFCXWJewEraisH8mbzfVxSFGDB0"
    }
  ]);

  // 3. Bill parameters
  const [utilitySettings, setUtilitySettings] = useState<UtilitySettings>({
    electricityPrice: 3500,
    waterPrice: 15000,
    internetFee: 250000,
    garbageFee: 50000,
    parkingFee: 120000,
    otherFee: 0,
    autoSync: true
  });

  // 4. Invoiced bills state (can dynamically grow!)
  const [bills, setBills] = useState<Bill[]>([
    { id: "bill-1", room: "Room 101", month: "August 2023", electricity: 450000, water: 125000, rent: 4500000, total: 5075000, status: "Paid" },
    { id: "bill-2", room: "Room 405", month: "August 2023", electricity: 623000, water: 189000, rent: 12000000, total: 12812000, status: "Pending" },
    { id: "bill-3", room: "Room 301", month: "August 2023", electricity: 381500, water: 100000, rent: 8500000, total: 8981500, status: "Unpaid" },
    { id: "bill-4", room: "Room 202", month: "August 2023", electricity: 550000, water: 152000, rent: 4500000, total: 5202000, status: "Paid" },
  ]);

  // 5. Activity Log list
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: "log-1", user: "John Doe", action: "paid rent invoice for", detail: "Room 101", timeLabel: "2 hours ago", type: "payment", amount: 5075000 },
    { id: "log-2", user: "Room 205", action: "status changed to", detail: "Maintenance", timeLabel: "5 hours ago", type: "maintenance" },
    { id: "log-3", user: "Sarah Miller", action: "signed lease agreement in", detail: "Room 301", timeLabel: "Yesterday at 4:30 PM", type: "tenant" },
    { id: "log-4", user: "David Chen", action: "outstanding reminder dispatched to", detail: "d.chen@corporate.io", timeLabel: "Yesterday at 10:15 AM", type: "alert" },
  ]);

  // 6. Templates
  const templates: DocumentTemplate[] = [
    { id: "temp-rental", name: "Bilingual Apartment Lease Agreement (Hợp Đồng Thuê Nhà)", description: "Bilingual Vietnamese/English template compliant with local municipal codes.", status: "Active", category: "Rental" },
    { id: "temp-residence", name: "Temporary Residence Registration Form (Khai Báo Tạm Trú)", description: "Required form for municipal public security office notification.", status: "Active", category: "Residence" },
    { id: "temp-handover", name: "Room Condition and Asset Handover (Biên Bản Bàn Giao Căn Hộ)", description: "Device audit list verifying key handovers, furniture state, and appliance indexes.", status: "Active", category: "Handover" },
  ];

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
            searchQuery={globalSearch}
            onAddRoom={handleAddRoom}
            onEditRoomStatus={handleEditRoomStatus}
          />
        );
      case "tenants":
        return (
          <TenantsView 
            tenants={tenants}
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
