import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cuemtarlimkdusuhjxsr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZW10YXJsaW1rZHVzdWhqeHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDQxMzQsImV4cCI6MjA4ODQyMDEzNH0.9zYdM2C-2iI9ikfWabAM7BDl5scUfep-wu02hXcuDfo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
