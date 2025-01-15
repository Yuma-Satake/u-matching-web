import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_PROJECT_URL } from './env';
import { Database } from '@/types/database.types';

export const supabaseClient = createClient<Database>(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
