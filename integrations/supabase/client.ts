// Supabase client configuration (fixed constants as requested)
import { createClient } from '@supabase/supabase-js';

// Fixed project URL and anon key (publishable). Environment variables are ignored.
const SUPABASE_URL = "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);