import { Room, Tenant, Bill, ActivityLog, UtilitySettings, DocumentTemplate } from "./types";

export const initialRooms: Room[] = [
  { id: "room-101", number: "101", name: "Standard Studio", floor: 1, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 2, monthlyRent: 4500000 },
  { id: "room-102", number: "102", name: "Standard Studio", floor: 1, wing: "North Wing", status: "Available", maxOccupants: 2, currentOccupants: 0, monthlyRent: 4500000 },
  { id: "room-103", number: "103", name: "Deluxe Suite", floor: 1, wing: "East Wing", status: "Maintenance", maxOccupants: 1, currentOccupants: 0, monthlyRent: 5000000 },
  { id: "room-201", number: "201", name: "Executive Loft", floor: 2, wing: "Penthouse", status: "Occupied", maxOccupants: 1, currentOccupants: 1, monthlyRent: 12000000 },
  { id: "room-202", number: "202", name: "Standard Studio", floor: 2, wing: "East Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 4500000 },
  { id: "room-205", number: "205", name: "Executive Studio", floor: 2, wing: "North Wing", status: "Maintenance", maxOccupants: 2, currentOccupants: 0, monthlyRent: 7500000 },
  { id: "room-301", number: "301", name: "Deluxe Studio", floor: 3, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 8500000 },
  { id: "room-405", number: "405", name: "Executive Loft", floor: 4, wing: "North Wing", status: "Occupied", maxOccupants: 2, currentOccupants: 1, monthlyRent: 12000000 },
];

export const initialTenants: Tenant[] = [
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
];

export const initialUtilitySettings: UtilitySettings = {
  electricityPrice: 3500,
  waterPrice: 15000,
  internetFee: 250000,
  garbageFee: 50000,
  parkingFee: 120000,
  otherFee: 0,
  autoSync: true
};

export const initialBills: Bill[] = [
  { id: "bill-1", room: "Room 101", month: "August 2023", electricity: 450000, water: 125000, rent: 4500000, total: 5075000, status: "Paid" },
  { id: "bill-2", room: "Room 405", month: "August 2023", electricity: 623000, water: 189000, rent: 12000000, total: 12812000, status: "Pending" },
  { id: "bill-3", room: "Room 301", month: "August 2023", electricity: 381500, water: 100000, rent: 8500000, total: 8981500, status: "Unpaid" },
  { id: "bill-4", room: "Room 202", month: "August 2023", electricity: 550000, water: 152000, rent: 4500000, total: 5202000, status: "Paid" },
];

export const initialActivityLogs: ActivityLog[] = [
  { id: "log-1", user: "John Doe", action: "paid rent invoice for", detail: "Room 101", timeLabel: "2 hours ago", type: "payment", amount: 5075000 },
  { id: "log-2", user: "Room 205", action: "status changed to", detail: "Maintenance", timeLabel: "5 hours ago", type: "maintenance" },
  { id: "log-3", user: "Sarah Miller", action: "signed lease agreement in", detail: "Room 301", timeLabel: "Yesterday at 4:30 PM", type: "tenant" },
  { id: "log-4", user: "David Chen", action: "outstanding reminder dispatched to", detail: "d.chen@corporate.io", timeLabel: "Yesterday at 10:15 AM", type: "alert" },
];

export const initialTemplates: DocumentTemplate[] = [
  { id: "temp-rental", name: "Bilingual Apartment Lease Agreement (Hợp Đồng Thuê Nhà)", description: "Bilingual Vietnamese/English template compliant with local municipal codes.", status: "Active", category: "Rental" },
  { id: "temp-residence", name: "Temporary Residence Registration Form (Khai Báo Tạm Trú)", description: "Required form for municipal public security office notification.", status: "Active", category: "Residence" },
  { id: "temp-handover", name: "Room Condition and Asset Handover (Biên Bản Bàn Giao Căn Hộ)", description: "Device audit list verifying key handovers, furniture state, and appliance indexes.", status: "Active", category: "Handover" },
];
