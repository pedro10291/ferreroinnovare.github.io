import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder values so the UI doesn't crash if .env is not yet configured.
// Supabase requires a valid URL format to initialize the client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
