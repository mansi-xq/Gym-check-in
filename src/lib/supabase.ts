import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbnwkabdolxhfyouzpeg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'youreyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibndrYWJkb2x4aGZ5b3V6cGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODczNDksImV4cCI6MjA2OTk2MzM0OX0.LmIsaR7LAsuzyL9VuUWORA9QuuOM5ufiLNtS3oj1KEI-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          created_at: string;
          share_code: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          created_at?: string;
          share_code: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          created_at?: string;
          share_code?: string;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          checked_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          checked_in: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          checked_in?: boolean;
          created_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          friend_name: string;
          created_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          friend_name: string;
          created_at?: string;
          status?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          friend_name?: string;
          created_at?: string;
          status?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          reminder_time: string;
          notifications_enabled: boolean;
          weekly_goal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reminder_time?: string;
          notifications_enabled?: boolean;
          weekly_goal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reminder_time?: string;
          notifications_enabled?: boolean;
          weekly_goal?: number;
          created_at?: string;
        };
      };
    };
  };
};