import { supabase } from '../lib/supabaseClient';
import { USE_MOCK_DATA } from '../config';
import { Room, Tenant, Bill, ActivityLog, UtilitySettings } from '../types';
import {
  initialRooms,
  initialTenants,
  initialBills,
  initialActivityLogs,
  initialUtilitySettings
} from '../mockData';

// Thrown by fetch* methods on a real Supabase error so the UI can surface it
// instead of silently rendering stale/fake data.
export class ApiFetchError extends Error {
  constructor(message: string, public cause: unknown) {
    super(message);
    this.name = 'ApiFetchError';
  }
}

export const api = {
  // Utility function to recursively map snake_case to camelCase
  toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = this.toCamelCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  },

  // Utility function to map camelCase to snake_case for DB inserts/updates
  toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = this.toSnakeCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  },

  async fetchRooms(): Promise<Room[]> {
    if (USE_MOCK_DATA) return initialRooms;
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      throw new ApiFetchError('Không thể tải danh sách phòng từ cơ sở dữ liệu.', error);
    }
    return this.toCamelCase(data || []) as Room[];
  },

  async fetchTenants(): Promise<Tenant[]> {
    if (USE_MOCK_DATA) return initialTenants;
    const { data, error } = await supabase.from('tenants').select('*');
    if (error) {
      throw new ApiFetchError('Không thể tải danh sách người thuê từ cơ sở dữ liệu.', error);
    }
    return this.toCamelCase(data || []) as Tenant[];
  },

  async fetchBills(): Promise<Bill[]> {
    if (USE_MOCK_DATA) return initialBills;
    const { data, error } = await supabase.from('bills').select('*');
    if (error) {
      throw new ApiFetchError('Không thể tải danh sách hóa đơn từ cơ sở dữ liệu.', error);
    }
    return this.toCamelCase(data || []) as Bill[];
  },

  async fetchActivityLogs(): Promise<ActivityLog[]> {
    if (USE_MOCK_DATA) return initialActivityLogs;
    const { data, error } = await supabase.from('activity_logs').select('*');
    if (error) {
      throw new ApiFetchError('Không thể tải nhật ký hoạt động từ cơ sở dữ liệu.', error);
    }
    return this.toCamelCase(data || []) as ActivityLog[];
  },

  // Returns null on error so callers can keep the last-known settings
  // instead of silently displaying stale/fake mock prices.
  async fetchUtilitySettings(): Promise<UtilitySettings | null> {
    if (USE_MOCK_DATA) return initialUtilitySettings;
    const { data, error } = await supabase.from('utility_settings').select('*').single();
    if (error) {
      throw new ApiFetchError('Không thể tải cấu hình giá tiện ích từ cơ sở dữ liệu.', error);
    }
    return this.toCamelCase(data) as UtilitySettings;
  },

  // --- MUTATION METHODS ---

  async createTenant(tenant: Tenant): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('tenants').insert(this.toSnakeCase(tenant));
    if (error) console.error('Error creating tenant:', error);
    return !error;
  },

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { id: _ignoredId, ...safeUpdates } = updates;
    const { error } = await supabase.from('tenants').update(this.toSnakeCase(safeUpdates)).eq('id', id);
    if (error) console.error('Error updating tenant:', error);
    return !error;
  },

  async deleteTenant(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) console.error('Error deleting tenant:', error);
    return !error;
  },

  async createRoom(room: Room): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('rooms').insert(this.toSnakeCase(room));
    if (error) console.error('Error creating room:', error);
    return !error;
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { id: _ignoredId, ...safeUpdates } = updates;
    const { error } = await supabase.from('rooms').update(this.toSnakeCase(safeUpdates)).eq('id', id);
    if (error) console.error('Error updating room:', error);
    return !error;
  },

  async createActivityLog(log: ActivityLog): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('activity_logs').insert(this.toSnakeCase(log));
    if (error) console.error('Error creating log:', error);
    return !error;
  },

  async deleteRoom(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) console.error('Error deleting room:', error);
    return !error;
  },

  async createBill(bill: Bill): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('bills').insert(this.toSnakeCase(bill));
    if (error) console.error('Error creating bill:', error);
    return !error;
  },

  async updateBill(id: string, updates: Partial<Omit<Bill, 'id'>>): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('bills').update(this.toSnakeCase(updates)).eq('id', id);
    if (error) console.error('Error updating bill:', error);
    return !error;
  },

  async deleteBill(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) console.error('Error deleting bill:', error);
    return !error;
  },

  // Upserts the single shared settings row (fixed id 'default-settings').
  async updateUtilitySettings(updates: UtilitySettings): Promise<boolean> {
    if (USE_MOCK_DATA) return true;
    const { error } = await supabase
      .from('utility_settings')
      .upsert(this.toSnakeCase({ id: 'default-settings', ...updates }));
    if (error) console.error('Error updating utility settings:', error);
    return !error;
  }
};
