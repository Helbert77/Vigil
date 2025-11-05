// Supabase client configuration (env-driven with safe fallbacks)
import { createClient } from '@supabase/supabase-js';

// Prefer environment variables provided by Vite for flexibility across environments.
// Fallbacks keep current behavior if env is not set.
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ?? "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);