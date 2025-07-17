
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khkbbtctgzmsltgpcuem.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoa2JidGN0Z3ptc2x0Z3BjdWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODY1MTYsImV4cCI6MjA2Njg2MjUxNn0.db-LaY4xFTKRKY-M5WnJTYPi2JxsNEGZDGBD7eje8a8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
