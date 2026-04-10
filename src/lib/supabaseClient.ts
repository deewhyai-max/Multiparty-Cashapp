import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xbbqlmrhqfrkdshlscfk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Gw2rLWePMVUG-4DSpPjhPw_hw2447e3';

export const supabase = createClient(supabaseUrl, supabaseKey);
