/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomStatus = "Occupied" | "Available" | "Maintenance";

export interface Room {
  id: string; // e.g. "101"
  number: string;
  name: string; // e.g. "Standard Studio"
  floor: number;
  wing: string; // e.g. "North Wing"
  status: RoomStatus;
  maxOccupants: number;
  currentOccupants: number;
  monthlyRent: number; // in USD
}

export type DepositStatus = "Paid" | "Partial" | "Overdue";

export interface Tenant {
  id: string;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  roomAssignment: string; // e.g. "Room 101"
  contractStart: string; // e.g. "2023-10-12"
  depositStatus: DepositStatus;
  avatarUrl?: string;
  occupation?: string;
  gender?: string;
  dob?: string;
}

export type BillStatus = "Paid" | "Pending" | "Unpaid";

export interface Bill {
  id: string;
  room: string;
  month: string; // e.g. "August 2023"
  electricity: number;
  water: number;
  rent: number;
  total: number;
  status: BillStatus;
}

export interface UtilitySettings {
  electricityPrice: number;
  waterPrice: number;
  internetFee: number;
  garbageFee: number;
  parkingFee: number;
  otherFee: number;
  autoSync: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  category: "Rental" | "Residence" | "Handover";
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  detail: string;
  timeLabel: string;
  type: "payment" | "maintenance" | "tenant" | "alert";
  amount?: number;
}
