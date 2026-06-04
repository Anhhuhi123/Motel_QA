import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No supabase URL or KEY found.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const tenant = {
    id: 't-' + Date.now(),
    name: 'Test Tenant',
    email: 'test@example.com',
    national_id: '123456789',
    phone: '0123456789',
    room_assignment: 'Room 101',
    contract_start: '2023-10-12',
    deposit_status: 'Paid'
  };

  const { data, error } = await supabase.from('tenants').insert(tenant);
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}

testInsert();
