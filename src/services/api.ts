import { supabase } from '../lib/supabaseClient';
import { USE_MOCK_DATA } from '../config';
import { Room, Tenant, Bill, ActivityLog, UtilitySettings, DocumentTemplate } from '../types';
import { 
  initialRooms, 
  initialTenants, 
  initialBills, 
  initialActivityLogs, 
  initialUtilitySettings, 
  initialTemplates 
} from '../mockData';

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

  async fetchRooms(): Promise<Room[]> {
    if (USE_MOCK_DATA) return initialRooms;
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      console.error('Error fetching rooms:', error);
      return initialRooms; // Fallback
    }
    return this.toCamelCase(data || []) as Room[];
  },

  async fetchTenants(): Promise<Tenant[]> {
    if (USE_MOCK_DATA) return initialTenants;
    const { data, error } = await supabase.from('tenants').select('*');
    if (error) {
      console.error('Error fetching tenants:', error);
      return initialTenants;
    }
    return this.toCamelCase(data || []) as Tenant[];
  },

  async fetchBills(): Promise<Bill[]> {
    if (USE_MOCK_DATA) return initialBills;
    const { data, error } = await supabase.from('bills').select('*');
    if (error) {
      console.error('Error fetching bills:', error);
      return initialBills;
    }
    return this.toCamelCase(data || []) as Bill[];
  },

  async fetchActivityLogs(): Promise<ActivityLog[]> {
    if (USE_MOCK_DATA) return initialActivityLogs;
    const { data, error } = await supabase.from('activity_logs').select('*');
    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
    return this.toCamelCase(data || []) as ActivityLog[];
  },

  async fetchUtilitySettings(): Promise<UtilitySettings> {
    if (USE_MOCK_DATA) return initialUtilitySettings;
    const { data, error } = await supabase.from('utility_settings').select('*').single();
    if (error) {
      console.error('Error fetching utility settings:', error);
      return initialUtilitySettings;
    }
    return this.toCamelCase(data) as UtilitySettings;
  },

  async fetchTemplates(): Promise<DocumentTemplate[]> {
    if (USE_MOCK_DATA) return initialTemplates;
    const { data, error } = await supabase.from('document_templates').select('*');
    if (error) {
      console.error('Error fetching templates:', error);
      return initialTemplates;
    }
    return this.toCamelCase(data || []) as DocumentTemplate[];
  }
};
