import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing ENV variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking DB...");
  const { data, error } = await supabase.from('laundry_machines').select('*').limit(1);
  if (error) {
    console.error("\n[DB ERROR]", error);
  } else {
    console.log("\n[DB OK] Table exists, returned rows:", data.length);
  }
}

check();
