import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_config: any;
          level: number;
          xp: number;
          coins: number;
          games_played: number;
          games_won: number;
          total_hides: number;
          total_seeks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_config?: any;
          level?: number;
          xp?: number;
          coins?: number;
          games_played?: number;
          games_won?: number;
          total_hides?: number;
          total_seeks?: number;
        };
        Update: {
          username?: string;
          avatar_config?: any;
          level?: number;
          xp?: number;
          coins?: number;
          games_played?: number;
          games_won?: number;
          total_hides?: number;
          total_seeks?: number;
          updated_at?: string;
        };
      };
      worlds: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string;
          world_data: any;
          thumbnail_url: string;
          is_public: boolean;
          play_count: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          creator_id: string;
          name: string;
          description?: string;
          world_data: any;
          thumbnail_url?: string;
          is_public?: boolean;
          play_count?: number;
          rating?: number;
        };
        Update: {
          name?: string;
          description?: string;
          world_data?: any;
          thumbnail_url?: string;
          is_public?: boolean;
          play_count?: number;
          rating?: number;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          lobby_code: string;
          host_id: string;
          world_id: string;
          game_state: any;
          max_players: number;
          current_players: number;
          status: 'waiting' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          lobby_code: string;
          host_id: string;
          world_id: string;
          game_state?: any;
          max_players?: number;
          current_players?: number;
          status?: 'waiting' | 'in_progress' | 'completed';
        };
        Update: {
          game_state?: any;
          current_players?: number;
          status?: 'waiting' | 'in_progress' | 'completed';
          updated_at?: string;
        };
      };
      game_players: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          role: 'hider' | 'seeker';
          position: any;
          is_found: boolean;
          score: number;
          joined_at: string;
        };
        Insert: {
          game_id: string;
          player_id: string;
          role?: 'hider' | 'seeker';
          position?: any;
          is_found?: boolean;
          score?: number;
        };
        Update: {
          role?: 'hider' | 'seeker';
          position?: any;
          is_found?: boolean;
          score?: number;
        };
      };
    };
  };
};