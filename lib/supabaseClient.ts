
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpqfwyazxnkdillyzqyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWZ3eWF6eG5rZGlsbHl6cXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDExNjIsImV4cCI6MjA2NDMxNzE2Mn0.IddfzEF4XXD_UYMMMZkXpN0nEpdgr8BIRX4NuaU0I1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
