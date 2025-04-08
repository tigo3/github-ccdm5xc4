import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    // console.log('Supabase client initialized.'); // Log removed
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  console.error('Supabase URL or Anon Key is missing. Cannot initialize client.');
}

export default supabase;
