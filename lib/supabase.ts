import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://ooimprqugddgikizilfm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaW1wcnF1Z2RkZ2lraXppbGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzA2MzcsImV4cCI6MjA5MDc0NjYzN30.1weOVas1_peOpVHHp5SCZxybTxbBphXYALPJAlcbYCA"
)