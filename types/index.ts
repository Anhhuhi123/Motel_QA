export type RoomStatus = 'Occupied' | 'Available' | 'Maintenance';

export interface Room {
  id: string;
  number: string;
  name: string;
  floor: number;
  wing?: string | null;
  status: RoomStatus;
  max_occupants: number;
  current_occupants: number;
  monthly_rent: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomInput {
  number: string;
  name: string;
  floor: number;
  wing?: string;
  max_occupants: number;
  monthly_rent: number;
}

export type DepositStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';
export type ContractStatus = 'Active' | 'Terminated' | 'Expired';

export interface Tenant {
  id: string;
  full_name: string;
  email?: string | null;
  national_id: string;
  phone: string;
  dob?: string | null;
  gender?: string | null;
  occupation?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date?: string | null;
  deposit_amount: number;
  deposit_status: DepositStatus;
  status: ContractStatus;
  created_at: string;
}

export interface Occupant {
  id: string;
  room_id: string;
  tenant_id: string;
  is_primary: boolean;
  joined_at: string;
  left_at?: string | null;
}

export interface TenantWithContract extends Tenant {
  contracts: Contract[];
  occupants: Occupant[];
}

export interface Settings {
  id: string;
  electricity_price: number;
  water_price: number;
  internet_fee: number;
  garbage_fee: number;
  parking_fee: number;
  other_fee: number;
  auto_sync: boolean;
}

export interface MeterReading {
  id: string;
  room_id: string;
  reading_month: string;
  electricity_index: number;
  water_index: number;
}

export type BillStatus = 'Paid' | 'Pending' | 'Unpaid' | 'Overdue';

export interface Bill {
  id: string;
  room_id: string;
  billing_month: string;
  total_amount: number;
  status: BillStatus;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  item_type: string;
  description?: string | null;
  amount: number;
}

export interface BillWithDetails extends Bill {
  room: Room;
  items: BillItem[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  file_url: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Document {
  id: string;
  tenant_id?: string | null;
  room_id?: string | null;
  template_id?: string | null;
  name: string;
  file_url: string;
  document_type?: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  detail: string;
  type: 'payment' | 'maintenance' | 'tenant' | 'alert' | 'system';
  amount?: number | null;
  created_at: string;
}
