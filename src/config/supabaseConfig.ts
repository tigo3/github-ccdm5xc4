import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = 'https://dzmecnikrhsdedcagvzs.supabase.co';
// IMPORTANT: Use environment variables in a real application for security
const supabaseAnonKey: string | undefined = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bWVjbmlrcmhzZGVkY2FndnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTQ2NzcsImV4cCI6MjA1OTEzMDY3N30.JMMQMbVTS7QHDPkFInynQ-MszbrH_mEFl4uEDP9E5pk';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized.');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  console.error('Supabase URL or Anon Key is missing. Cannot initialize client.');
}

export default supabase;
